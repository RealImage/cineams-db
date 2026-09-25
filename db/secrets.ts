// Encryption for masked field values (AES-256-GCM): device credentials and
// agent configurations.
//
// Stored form: "enc:v1:<iv>:<tag>:<ciphertext>", base64url parts. The row id
// and field key (plus the table's context, except for device credentials,
// which predate it) are bound in as associated data, so a value can't be
// copied onto another row, field or table and still decrypt.
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type pg from "pg";

const PREFIX = "enc:v1:";

/** Local-only fallback so a fresh checkout runs without setup. Never use it for real data. */
const DEV_KEY = Buffer.alloc(32, "cinemadb-dev-only-credentials-key");

let cachedKey: Buffer | null = null;
function key() {
  if (cachedKey) return cachedKey;
  const raw = process.env.CREDENTIALS_ENCRYPTION_KEY;
  if (raw) {
    const k = Buffer.from(raw, "base64");
    if (k.length !== 32) throw new Error("CREDENTIALS_ENCRYPTION_KEY must be 32 bytes, base64-encoded (openssl rand -base64 32)");
    cachedKey = k;
  } else if (process.env.NODE_ENV === "production") {
    throw new Error("CREDENTIALS_ENCRYPTION_KEY is required in production");
  } else {
    console.warn("CREDENTIALS_ENCRYPTION_KEY is not set; using the built-in development key.");
    cachedKey = DEV_KEY;
  }
  return cachedKey;
}

/**
 * Check the key now instead of on first use, so a misconfigured server fails
 * at startup. Call once when the API or a DB script starts.
 */
export function assertEncryptionKey() {
  key();
}

/** Which table a value belongs to; part of the associated data. */
export type SecretContext = "credential" | "agent-config";

const aad = (context: SecretContext, rowId: string, fieldKey: string) =>
  Buffer.from(context === "credential" ? `${rowId}\0${fieldKey}` : `${context}\0${rowId}\0${fieldKey}`);

/** The full envelope: 12-byte IV, 16-byte tag, then ciphertext, base64url-encoded. */
const ENVELOPE = /^enc:v1:[A-Za-z0-9_-]{16}:[A-Za-z0-9_-]{22}:[A-Za-z0-9_-]*$/;

export const isEncrypted = (v: unknown): v is string => typeof v === "string" && ENVELOPE.test(v);

/**
 * Plain values that start like the envelope are refused, so a stored value
 * is never ambiguous between plain text and ciphertext.
 */
export const looksLikeEnvelope = (v: string) => v.startsWith(PREFIX);

export function encryptValue(plain: string, rowId: string, fieldKey: string, context: SecretContext = "credential") {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  cipher.setAAD(aad(context, rowId, fieldKey));
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return PREFIX + [iv, cipher.getAuthTag(), ct].map((b) => b.toString("base64url")).join(":");
}

/** Decrypts a stored value; a value that was never encrypted is returned as-is. */
export function decryptValue(stored: string, rowId: string, fieldKey: string, context: SecretContext = "credential") {
  if (!isEncrypted(stored)) return stored;
  const [iv, tag, ct] = stored.slice(PREFIX.length).split(":").map((p) => Buffer.from(p, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAAD(aad(context, rowId, fieldKey));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

type Queryable = Pick<pg.Client, "query">;

/** A table of rows whose `values` follow a parent's field list (credentials → device model, configurations → agent). */
interface SecretTable {
  context: SecretContext;
  table: string;
  parentTable: string;
  parentColumn: string;
  fieldsColumn: string;
}

export const CREDENTIAL_SECRETS: SecretTable = {
  context: "credential", table: "device_credentials", parentTable: "credential_devices", parentColumn: "device_id", fieldsColumn: "credential_fields",
};
export const AGENT_CONFIG_SECRETS: SecretTable = {
  context: "agent-config", table: "agent_configurations", parentTable: "fleet_images", parentColumn: "image_id", fieldsColumn: "config_fields",
};

/**
 * Make stored values match each field's Masked flag: encrypt plain values of
 * masked fields and decrypt encrypted values of unmasked ones. Idempotent.
 * Runs after a format changes, after seeding and after migrations.
 */
export async function syncEncryption(db: Queryable, t: SecretTable, parentId?: string) {
  const { rows } = await db.query<{ id: string; values: Record<string, unknown>; fields: { key: string; masked?: boolean }[] }>(
    `SELECT c.id, c."values", p.${t.fieldsColumn} AS fields
     FROM ${t.table} c JOIN ${t.parentTable} p ON p.id = c.${t.parentColumn}
     ${parentId ? `WHERE c.${t.parentColumn} = $1` : ""}`,
    parentId ? [parentId] : [],
  );
  let updated = 0;
  for (const row of rows) {
    const masked = new Set(row.fields.filter((f) => f.masked).map((f) => f.key));
    // Only fields still in the format and explicitly unmasked are decrypted.
    // Values of removed fields are left as they are, so a removed masked
    // field's value stays encrypted.
    const unmasked = new Set(row.fields.filter((f) => !f.masked).map((f) => f.key));
    const next: Record<string, unknown> = { ...row.values };
    let changed = false;
    for (const [k, v] of Object.entries(row.values)) {
      if (typeof v !== "string") continue;
      if (masked.has(k) && !isEncrypted(v)) { next[k] = encryptValue(v, row.id, k, t.context); changed = true; }
      else if (unmasked.has(k) && isEncrypted(v)) { next[k] = decryptValue(v, row.id, k, t.context); changed = true; }
    }
    if (changed) {
      await db.query(`UPDATE ${t.table} SET "values" = $2 WHERE id = $1`, [row.id, JSON.stringify(next)]);
      updated++;
    }
  }
  return updated;
}

/** Credentials of one device model, or all of them. */
export const syncCredentialEncryption = (db: Queryable, deviceId?: string) => syncEncryption(db, CREDENTIAL_SECRETS, deviceId);
