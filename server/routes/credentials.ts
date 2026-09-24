import { Hono } from "hono";
import type pg from "pg";
import { query } from "../db";
import { CURRENT_USER, httpError, notFound } from "../http";
import {
  CredentialDeviceWithStatus,
  CredentialField,
  CredentialFormatId,
  GLOBAL_REF,
  ScopedCredential,
  credentialFormats,
  credentialScopes,
  dciOptions,
  deviceTypes,
  extraChainNames,
  getCredentialFormat,
} from "../../src/data/credentialsManagerData";

export const credentials = new Hono();

const DEVICE_SELECT = `
  SELECT d.id, d.brand, d.model, d.roles, d.type, d.dci, d.translations,
         d.credential_format AS "credentialFormat", d.updated_by AS "updatedBy", d.updated_at AS "updatedAt",
         EXISTS (SELECT 1 FROM device_credentials c
                 WHERE c.device_id = d.id AND c.scope = 'global' AND c.ref = '${GLOBAL_REF}') AS "hasDefaultCredentials"
  FROM credential_devices d`;

const CREDENTIAL_COLUMNS = `
  id, device_id AS "deviceId", scope, ref, location, "values",
  updated_by AS "updatedBy", updated_at AS "updatedAt"`;

type CredentialRow = Omit<ScopedCredential, "location"> & { location: string | null };

/** Drop a null location so the response matches `location?: string`. */
const toCredential = ({ location, ...rest }: CredentialRow): ScopedCredential =>
  location == null ? rest : { ...rest, location };

const isUniqueViolation = (err: unknown) => (err as pg.DatabaseError)?.code === "23505";

async function getDevice(id: string) {
  const [row] = await query<CredentialDeviceWithStatus>(`${DEVICE_SELECT} WHERE d.id = $1`, [id]);
  if (!row) throw notFound("Device");
  return row;
}

async function readJson(c: { req: { json: () => Promise<unknown> } }) {
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) throw httpError(400, "Request body must be a JSON object");
  return body as Record<string, unknown>;
}

const isStringList = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");
const cleanList = (list: string[]) => Array.from(new Set(list.map((x) => x.trim()).filter(Boolean)));

// ---------------------------------------------------------------------------
// Devices
// ---------------------------------------------------------------------------

// Seeded ids are "cred-<n>"; order by n so the list keeps its original order.
credentials.get("/devices", async (c) =>
  c.json(await query<CredentialDeviceWithStatus>(
    `${DEVICE_SELECT} ORDER BY substring(d.id FROM '^cred-(\\d+)$')::int NULLS LAST, d.brand, d.model`)));

credentials.get("/devices/:id", async (c) => c.json(await getDevice(c.req.param("id"))));

/** Partial update of a device's details. Changing the format leaves stored credential values untouched. */
credentials.patch("/devices/:id", async (c) => {
  const id = c.req.param("id");
  const current = await getDevice(id);
  const body = await readJson(c);

  const text = (key: "brand" | "model") => {
    if (body[key] === undefined) return current[key];
    if (typeof body[key] !== "string" || !body[key].trim()) throw httpError(400, `${key === "brand" ? "Brand" : "Model"} is required`);
    return body[key].trim();
  };
  const list = (key: "roles" | "translations") => {
    if (body[key] === undefined) return current[key];
    if (!isStringList(body[key])) throw httpError(400, `${key} must be a list of strings`);
    return cleanList(body[key]);
  };
  const oneOf = <T extends string>(key: string, allowed: readonly T[], fallback: T, label: string): T => {
    if (body[key] === undefined) return fallback;
    if (!allowed.includes(body[key] as T)) throw httpError(400, `${label} must be one of: ${allowed.join(", ")}`);
    return body[key] as T;
  };

  const next = {
    brand: text("brand"),
    model: text("model"),
    roles: list("roles").map((r) => r.toUpperCase()),
    translations: list("translations"),
    type: oneOf("type", deviceTypes, current.type, "Type"),
    dci: oneOf("dci", dciOptions, current.dci, "DCI"),
    credentialFormat: oneOf<CredentialFormatId>(
      "credentialFormat", credentialFormats.map((f) => f.id), current.credentialFormat, "Credentials format"),
  };

  try {
    await query(
      `UPDATE credential_devices
       SET brand = $2, model = $3, roles = $4, translations = $5, type = $6, dci = $7,
           credential_format = $8, updated_by = $9, updated_at = now()
       WHERE id = $1`,
      [id, next.brand, next.model, next.roles, next.translations, next.type, next.dci, next.credentialFormat, CURRENT_USER],
    );
  } catch (err) {
    if (isUniqueViolation(err)) throw httpError(409, `A device ${next.brand} ${next.model} already exists`);
    throw err;
  }
  return c.json(await getDevice(id));
});

// ---------------------------------------------------------------------------
// Credentials of a device
// ---------------------------------------------------------------------------

credentials.get("/devices/:id/credentials", async (c) => {
  const id = c.req.param("id");
  await getDevice(id);
  const rows = await query<CredentialRow>(
    `SELECT ${CREDENTIAL_COLUMNS} FROM device_credentials WHERE device_id = $1 ORDER BY scope, ref`, [id]);
  return c.json(rows.map(toCredential));
});

/** Validate a credential body against the device's credentials format. */
function parseCredential(body: Record<string, unknown>, device: CredentialDeviceWithStatus, fixedScope?: string) {
  const scope = fixedScope ?? body.scope;
  const scopeInfo = credentialScopes.find((s) => s.id === scope);
  if (!scopeInfo) throw httpError(400, `Scope must be one of: ${credentialScopes.map((s) => s.id).join(", ")}`);
  if (fixedScope && body.scope !== undefined && body.scope !== fixedScope) throw httpError(400, "A credential's scope cannot be changed");

  const ref = typeof body.ref === "string" ? body.ref.trim() : "";
  if (!ref) throw httpError(400, `${scopeInfo.refLabel} is required`);

  if (body.location !== undefined && body.location !== null && typeof body.location !== "string") {
    throw httpError(400, "Location must be a string");
  }
  const location = scopeInfo.id === "device" ? (body.location as string | undefined)?.trim() || null : null;

  const raw = body.values;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw httpError(400, "values must be an object");
  const format = getCredentialFormat(device.credentialFormat);
  const values: Partial<Record<CredentialField, string>> = {};
  for (const field of format.fields) {
    const v = (raw as Record<string, unknown>)[field];
    if (typeof v !== "string" || !v.trim()) throw httpError(400, `${field} is required for ${format.label} credentials`);
    values[field] = v.trim();
  }
  return { scope: scopeInfo.id, scopeLabel: scopeInfo.label, ref, location, values };
}

const duplicateRef = (label: string, ref: string) =>
  httpError(409, `${label} for ${ref} already exist for this device`);

credentials.post("/devices/:id/credentials", async (c) => {
  const device = await getDevice(c.req.param("id"));
  const input = parseCredential(await readJson(c), device);
  try {
    const [row] = await query<CredentialRow>(
      `INSERT INTO device_credentials (device_id, scope, ref, location, "values", updated_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${CREDENTIAL_COLUMNS}`,
      [device.id, input.scope, input.ref, input.location, JSON.stringify(input.values), CURRENT_USER],
    );
    return c.json(toCredential(row), 201);
  } catch (err) {
    if (isUniqueViolation(err)) throw duplicateRef(input.scopeLabel, input.ref);
    throw err;
  }
});

async function getCredential(deviceId: string, credentialId: string) {
  const [row] = await query<CredentialRow>(
    `SELECT ${CREDENTIAL_COLUMNS} FROM device_credentials WHERE device_id = $1 AND id = $2`, [deviceId, credentialId]);
  if (!row) throw notFound("Credential");
  return row;
}

credentials.put("/devices/:id/credentials/:credentialId", async (c) => {
  const device = await getDevice(c.req.param("id"));
  const existing = await getCredential(device.id, c.req.param("credentialId"));
  const input = parseCredential(await readJson(c), device, existing.scope);
  try {
    const [row] = await query<CredentialRow>(
      `UPDATE device_credentials
       SET ref = $2, location = $3, "values" = $4, updated_by = $5, updated_at = now()
       WHERE id = $1 RETURNING ${CREDENTIAL_COLUMNS}`,
      [existing.id, input.ref, input.location, JSON.stringify(input.values), CURRENT_USER],
    );
    return c.json(toCredential(row));
  } catch (err) {
    if (isUniqueViolation(err)) throw duplicateRef(input.scopeLabel, input.ref);
    throw err;
  }
});

credentials.delete("/devices/:id/credentials/:credentialId", async (c) => {
  const rows = await query(
    "DELETE FROM device_credentials WHERE device_id = $1 AND id = $2 RETURNING id",
    [c.req.param("id"), c.req.param("credentialId")],
  );
  if (rows.length === 0) throw notFound("Credential");
  return c.body(null, 204);
});

// ---------------------------------------------------------------------------
// Options for the chain / theatre pickers in the credential dialog
// ---------------------------------------------------------------------------

credentials.get("/ref-options", async (c) => {
  const [chainRows, theatreRows] = await Promise.all([
    query<{ name: string }>("SELECT DISTINCT name FROM chains WHERE name <> ''"),
    query<{ name: string }>("SELECT DISTINCT name FROM theatres WHERE name <> ''"),
  ]);
  const sorted = (names: string[]) => Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  return c.json({
    chains: sorted([...chainRows.map((r) => r.name), ...extraChainNames]),
    theatres: sorted(theatreRows.map((r) => r.name)),
  });
});
