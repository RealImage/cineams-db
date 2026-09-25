// Encryption for masked credential values (AES-256-GCM).
//
// Stored form: "enc:v1:<iv>:<tag>:<ciphertext>", base64url parts. The
// credential id and field key are bound in as associated data, so a value
// can't be copied onto another credential or field and still decrypt.
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

const aad = (credentialId: string, fieldKey: string) => Buffer.from(`${credentialId}\0${fieldKey}`);

export const isEncrypted = (v: unknown): v is string => typeof v === "string" && v.startsWith(PREFIX);

export function encryptValue(plain: string, credentialId: string, fieldKey: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  cipher.setAAD(aad(credentialId, fieldKey));
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return PREFIX + [iv, cipher.getAuthTag(), ct].map((b) => b.toString("base64url")).join(":");
}

/** Decrypts a stored value; a value that was never encrypted is returned as-is. */
export function decryptValue(stored: string, credentialId: string, fieldKey: string) {
  if (!isEncrypted(stored)) return stored;
  const [iv, tag, ct] = stored.slice(PREFIX.length).split(":").map((p) => Buffer.from(p, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAAD(aad(credentialId, fieldKey));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

type Queryable = Pick<pg.Client, "query">;

/**
 * Make stored values match each field's Masked flag: encrypt plain values of
 * masked fields and decrypt encrypted values of unmasked ones. Idempotent.
 * Runs after a device's format changes, after seeding and after migrations.
 */
export async function syncCredentialEncryption(db: Queryable, deviceId?: string) {
  const { rows } = await db.query<{ id: string; values: Record<string, unknown>; fields: { key: string; masked?: boolean }[] }>(
    `SELECT c.id, c."values", d.credential_fields AS fields
     FROM device_credentials c JOIN credential_devices d ON d.id = c.device_id
     ${deviceId ? "WHERE c.device_id = $1" : ""}`,
    deviceId ? [deviceId] : [],
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
      if (masked.has(k) && !isEncrypted(v)) { next[k] = encryptValue(v, row.id, k); changed = true; }
      else if (unmasked.has(k) && isEncrypted(v)) { next[k] = decryptValue(v, row.id, k); changed = true; }
    }
    if (changed) {
      await db.query(`UPDATE device_credentials SET "values" = $2 WHERE id = $1`, [row.id, JSON.stringify(next)]);
      updated++;
    }
  }
  return updated;
}
