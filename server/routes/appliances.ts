import { Hono } from "hono";
import { isIP } from "node:net";
import type pg from "pg";
import { query, transaction } from "../db";
import { CURRENT_USER, httpError, notFound } from "../http";
import type { LookupTheatre, QubeAcsScreenDevice, QubeAcsTheatre } from "../../src/data/qubeAcsData";

/**
 * Qube ACS, Pulse and Edge share one data model: a theatre is enrolled when it
 * has a theatre_appliance_configs row for the type, and each screen install is
 * a screen_appliances row. Mounted at /api/appliances/:type where
 * type ∈ qube-acs | pulse | edge. Pulse/Edge theatres and screens are the same
 * shape as Qube ACS minus cmSerialNumber / screen network / comments.
 *
 * `id` is theatres.id (used by the page routes), `theatreId` is theatres.code.
 * Screen ids are shown without the "<theatre code>:" namespace prefix that the
 * seed adds (e.g. "SCR-1-1"), and are resolved back per theatre on write.
 */
export const appliances = new Hono();

const TYPES = { "qube-acs": "qube_acs", pulse: "pulse", edge: "edge" } as const;
type ApplianceType = (typeof TYPES)[keyof typeof TYPES];
const LABELS: Record<ApplianceType, string> = { qube_acs: "Qube ACS", pulse: "Pulse", edge: "Edge" };
const STATUSES = ["Active", "Device Paused", "Inactive"] as const;

function applianceType(param: string): ApplianceType {
  const type = TYPES[param as keyof typeof TYPES];
  if (!type) throw notFound(`Appliance type "${param}"`);
  return type;
}

/** Screen id as shown in the UI: strip the seed's "<code>:" prefix. */
const SCREEN_KEY = `regexp_replace(s.id, '^[^:]*:', '')`;
const SCREEN_ORDER = `(CASE WHEN s.number ~ '^\\d+$' THEN s.number::int END) NULLS LAST, s.name, s.id`;

const THEATRE_COLUMNS = `
  t.id, coalesce(t.code, t.id) AS "theatreId", t.name AS "theatreName",
  coalesce(t.city, '') AS city, coalesce(t.state, '') AS state, coalesce(t.country, '') AS country,
  coalesce(ch.name, '') AS "chainName",
  coalesce(t.latitude, 0) AS latitude, coalesce(t.longitude, 0) AS longitude`;

const ENROLLED_SELECT = `
  SELECT ${THEATRE_COLUMNS}, t.alternate_names[1] AS "alsoKnownAs",
         cfg.network_id AS "networkId", cfg.network_password AS "networkPassword",
         sc.enabled AS "enabledScreens", sc.total AS "totalScreens",
         greatest(cfg.updated_at, sc.last_updated) AS "updatedAt", coalesce(cfg.updated_by, '') AS "updatedBy",
         sc.screens
  FROM theatre_appliance_configs cfg
  JOIN theatres t ON t.id = cfg.theatre_id
  LEFT JOIN chains ch ON ch.id = t.chain_id
  CROSS JOIN LATERAL (
    SELECT count(*) AS total,
           count(sa.id) FILTER (WHERE sa.status <> 'Inactive') AS enabled,
           max(sa.updated_at) AS last_updated,
           coalesce(json_agg(json_strip_nulls(json_build_object(
             'screenId', ${SCREEN_KEY},
             'screenName', s.name,
             'hasDevice', sa.id IS NOT NULL,
             'status', coalesce(sa.status, 'Inactive'),
             'applianceId', sa.appliance_id,
             'cmSerialNumber', sa.serial_number,
             'ipAddress', host(sa.ip_address),
             'screenNetworkId', sa.screen_network_id,
             'screenNetworkPassword', sa.screen_network_password,
             'installedDate', sa.installed_at,
             'installedBy', sa.installed_by,
             'lastActiveOn', sa.last_active_at,
             'comments', sa.comments
           )) ORDER BY ${SCREEN_ORDER}) FILTER (WHERE s.id IS NOT NULL), '[]') AS screens
    FROM screens s
    LEFT JOIN screen_appliances sa ON sa.screen_id = s.id AND sa.appliance_type = cfg.appliance_type
    WHERE s.theatre_id = t.id AND s.status <> 'Deleted'
  ) sc
  WHERE cfg.appliance_type = $1`;

const NOT_ENROLLED = `t.status <> 'Deleted' AND NOT EXISTS (
  SELECT 1 FROM theatre_appliance_configs cfg WHERE cfg.theatre_id = t.id AND cfg.appliance_type = $1)`;

const LOOKUP_SELECT = `
  SELECT ${THEATRE_COLUMNS},
         (SELECT count(*) FROM screens s WHERE s.theatre_id = t.id AND s.status <> 'Deleted') AS "totalScreens"
  FROM theatres t LEFT JOIN chains ch ON ch.id = t.chain_id`;

async function enrolledTheatre(type: ApplianceType, id: string) {
  const [row] = await query<QubeAcsTheatre>(`${ENROLLED_SELECT} AND t.id = $2`, [type, id]);
  if (!row) throw notFound(`${LABELS[type]} theatre`);
  return row;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

appliances.get("/:type", async (c) => {
  const type = applianceType(c.req.param("type"));
  return c.json(await query<QubeAcsTheatre>(`${ENROLLED_SELECT} ORDER BY t.name, t.id`, [type]));
});

/** Theatres not yet enrolled for this type (Add Theatre search). */
appliances.get("/:type/lookup", async (c) => {
  const type = applianceType(c.req.param("type"));
  return c.json(await query<LookupTheatre>(`${LOOKUP_SELECT} WHERE ${NOT_ENROLLED} ORDER BY t.name, t.id`, [type]));
});

/** One not-yet-enrolled theatre with its screens, for the add page. */
appliances.get("/:type/lookup/:id", async (c) => {
  const type = applianceType(c.req.param("type"));
  const id = c.req.param("id");
  const [theatre] = await query<LookupTheatre>(`${LOOKUP_SELECT} WHERE t.id = $1 AND t.status <> 'Deleted'`, [id]);
  if (!theatre) throw notFound("Theatre");
  const [enrolled] = await query(
    "SELECT 1 FROM theatre_appliance_configs WHERE theatre_id = $1 AND appliance_type = $2", [id, type],
  );
  if (enrolled) throw httpError(409, `${theatre.theatreName} is already enrolled in ${LABELS[type]}`);
  const screens = await query<QubeAcsScreenDevice>(
    `SELECT ${SCREEN_KEY} AS "screenId", s.name AS "screenName", false AS "hasDevice", 'Inactive' AS status
     FROM screens s WHERE s.theatre_id = $1 AND s.status <> 'Deleted' ORDER BY ${SCREEN_ORDER}`,
    [id],
  );
  return c.json({ ...theatre, screens });
});

appliances.get("/:type/:id", async (c) => {
  const type = applianceType(c.req.param("type"));
  return c.json(await enrolledTheatre(type, c.req.param("id")));
});

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

type ScreenInput = Partial<QubeAcsScreenDevice> & { screenId?: string };
type EnrolmentInput = {
  theatreId?: string;
  latitude?: number;
  longitude?: number;
  networkId?: string;
  networkPassword?: string;
  screens?: ScreenInput[];
};

const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

function timestamp(v: unknown, field: string) {
  const s = text(v);
  if (!s) return null;
  if (Number.isNaN(Date.parse(s))) throw httpError(400, `${field} must be a date`);
  return s;
}

function coordinate(v: unknown, field: string, limit: number) {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "number" || !Number.isFinite(v) || Math.abs(v) > limit) {
    throw httpError(400, `${field} must be a number between -${limit} and ${limit}`);
  }
  return v;
}

function validateScreen(s: ScreenInput) {
  const screenId = text(s.screenId);
  if (!screenId) throw httpError(400, "Every screen needs a screenId");
  if (!s.hasDevice) return { screenId, hasDevice: false as const };
  const status = s.status ?? "Active";
  if (!STATUSES.includes(status)) throw httpError(400, `Screen ${screenId}: status must be one of ${STATUSES.join(", ")}`);
  const ipAddress = text(s.ipAddress);
  if (ipAddress && !isIP(ipAddress)) throw httpError(400, `Screen ${screenId}: "${ipAddress}" is not a valid IP address`);
  return {
    screenId,
    hasDevice: true as const,
    status,
    applianceId: text(s.applianceId),
    cmSerialNumber: text(s.cmSerialNumber),
    ipAddress,
    screenNetworkId: text(s.screenNetworkId),
    screenNetworkPassword: text(s.screenNetworkPassword),
    installedDate: timestamp(s.installedDate, `Screen ${screenId}: installedDate`),
    installedBy: text(s.installedBy),
    comments: text(s.comments),
  };
}

/** Write theatre details, the enrolment row and per-screen installs in one transaction. */
async function saveEnrolment(
  client: pg.PoolClient, type: ApplianceType, theatreId: string, body: EnrolmentInput, mode: "create" | "update",
) {
  if (!Array.isArray(body.screens)) throw httpError(400, "screens must be an array");
  const latitude = coordinate(body.latitude, "latitude", 90);
  const longitude = coordinate(body.longitude, "longitude", 180);
  const screens = body.screens.map(validateScreen);

  const { rows: [theatre] } = await client.query<{ name: string }>(
    "SELECT name FROM theatres WHERE id = $1 AND status <> 'Deleted' FOR UPDATE", [theatreId],
  );
  if (!theatre) throw notFound("Theatre");

  if (mode === "create") {
    const { rowCount } = await client.query(
      `INSERT INTO theatre_appliance_configs (theatre_id, appliance_type, network_id, network_password, updated_by)
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
      [theatreId, type, text(body.networkId), text(body.networkPassword), CURRENT_USER],
    );
    if (!rowCount) throw httpError(409, `${theatre.name} is already enrolled in ${LABELS[type]}`);
  } else {
    const { rowCount } = await client.query(
      `UPDATE theatre_appliance_configs SET updated_by = $3,
         network_id = CASE WHEN $4 THEN $5 ELSE network_id END,
         network_password = CASE WHEN $6 THEN $7 ELSE network_password END
       WHERE theatre_id = $1 AND appliance_type = $2`,
      [theatreId, type, CURRENT_USER, "networkId" in body, text(body.networkId),
        "networkPassword" in body, text(body.networkPassword)],
    );
    if (!rowCount) throw notFound(`${LABELS[type]} theatre`);
  }

  if (latitude !== undefined || longitude !== undefined) {
    await client.query(
      `UPDATE theatres SET latitude = coalesce($2, latitude), longitude = coalesce($3, longitude), updated_by = $4
       WHERE id = $1`,
      [theatreId, latitude ?? null, longitude ?? null, CURRENT_USER],
    );
  }

  const { rows: known } = await client.query<{ id: string; key: string }>(
    `SELECT s.id, ${SCREEN_KEY} AS key FROM screens s WHERE s.theatre_id = $1`, [theatreId],
  );
  const screenIds = new Map(known.flatMap((r) => [[r.key, r.id], [r.id, r.id]] as const));
  for (const s of screens) {
    const screenId = screenIds.get(s.screenId);
    if (!screenId) throw httpError(400, `Screen ${s.screenId} does not belong to ${theatre.name}`);
    if (!s.hasDevice) {
      await client.query("DELETE FROM screen_appliances WHERE screen_id = $1 AND appliance_type = $2", [screenId, type]);
      continue;
    }
    await client.query(
      `INSERT INTO screen_appliances (screen_id, appliance_type, appliance_id, serial_number, ip_address,
         screen_network_id, screen_network_password, status, installed_at, installed_by, comments, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (screen_id, appliance_type) DO UPDATE SET
         appliance_id = EXCLUDED.appliance_id, serial_number = EXCLUDED.serial_number,
         ip_address = EXCLUDED.ip_address, screen_network_id = EXCLUDED.screen_network_id,
         screen_network_password = EXCLUDED.screen_network_password, status = EXCLUDED.status,
         installed_at = EXCLUDED.installed_at, installed_by = EXCLUDED.installed_by,
         comments = EXCLUDED.comments, updated_by = EXCLUDED.updated_by`,
      [screenId, type, s.applianceId, s.cmSerialNumber, s.ipAddress, s.screenNetworkId,
        s.screenNetworkPassword, s.status, s.installedDate, s.installedBy, s.comments, CURRENT_USER],
    );
  }
}

/** Enrol a theatre. Body: { theatreId (theatres.id), latitude, longitude, networkId?, networkPassword?, screens } */
appliances.post("/:type", async (c) => {
  const type = applianceType(c.req.param("type"));
  const body = await c.req.json<EnrolmentInput>();
  const theatreId = text(body.theatreId);
  if (!theatreId) throw httpError(400, "theatreId is required");
  await transaction((client) => saveEnrolment(client, type, theatreId, body, "create"));
  return c.json(await enrolledTheatre(type, theatreId), 201);
});

/** Edit an enrolled theatre's details, network settings and screen installs. */
appliances.put("/:type/:id", async (c) => {
  const type = applianceType(c.req.param("type"));
  const id = c.req.param("id");
  const body = await c.req.json<EnrolmentInput>();
  await transaction((client) => saveEnrolment(client, type, id, body, "update"));
  return c.json(await enrolledTheatre(type, id));
});

/** Remove a theatre from the programme (and its screen installs). */
appliances.delete("/:type/:id", async (c) => {
  const type = applianceType(c.req.param("type"));
  const id = c.req.param("id");
  const found = await transaction(async (client) => {
    const { rowCount } = await client.query(
      "DELETE FROM theatre_appliance_configs WHERE theatre_id = $1 AND appliance_type = $2", [id, type],
    );
    if (!rowCount) return false;
    await client.query(
      `DELETE FROM screen_appliances sa USING screens s
       WHERE sa.screen_id = s.id AND s.theatre_id = $1 AND sa.appliance_type = $2`,
      [id, type],
    );
    return true;
  });
  if (!found) throw notFound(`${LABELS[type]} theatre`);
  return c.body(null, 204);
});
