import { Hono } from "hono";
import { isIP } from "node:net";
import type pg from "pg";
import { query, transaction } from "../db";
import { CURRENT_USER, httpError, notFound } from "../http";
import type { IcountLookupTheatre, IcountScreen, IcountTheatre } from "../../src/data/icountData";

/**
 * iCount cameras. A theatre is "enrolled" when any of its screens has a row
 * in icount_cameras; the add flow lists theatres with none.
 * `id` is theatres.id, `theatreId` is theatres.code. Screens without cameras
 * carry one empty placeholder camera, matching makeEmptyCamera() in the UI.
 */
export const icount = new Hono();

const SCREEN_KEY = `regexp_replace(s.id, '^[^:]*:', '')`;
const SCREEN_ORDER = `(CASE WHEN s.number ~ '^\\d+$' THEN s.number::int END) NULLS LAST, s.name, s.id`;
const OWNERSHIP = ["Theatre", "Qube"];

const THEATRE_COLUMNS = `
  t.id, coalesce(t.code, t.id) AS "theatreId", t.name AS "theatreName",
  coalesce(t.city, '') AS city, coalesce(t.state, '') AS state, coalesce(t.country, '') AS country,
  coalesce(ch.name, '') AS "chainName",
  coalesce(t.latitude, 0) AS latitude, coalesce(t.longitude, 0) AS longitude`;

const HAS_CAMERAS = `EXISTS (SELECT 1 FROM icount_cameras c JOIN screens s ON s.id = c.screen_id WHERE s.theatre_id = t.id)`;

const ENROLLED_SELECT = `
  SELECT ${THEATRE_COLUMNS}, t.alternate_names[1] AS "alsoKnownAs",
         sc.enabled AS "enabledScreens", sc.total AS "totalScreens",
         sc.updated_at AS "updatedAt", coalesce(sc.updated_by, '') AS "updatedBy", sc.screens
  FROM theatres t
  LEFT JOIN chains ch ON ch.id = t.chain_id
  CROSS JOIN LATERAL (
    SELECT count(*) AS total,
           count(*) FILTER (WHERE cams.n > 0) AS enabled,
           max(cams.updated_at) AS updated_at,
           (array_agg(cams.updated_by ORDER BY cams.updated_at DESC NULLS LAST))[1] AS updated_by,
           coalesce(json_agg(json_build_object(
             'screenId', ${SCREEN_KEY},
             'screenName', s.name,
             'hasCameras', cams.n > 0,
             'cameras', CASE WHEN cams.n > 0 THEN cams.list
                             ELSE json_build_array(json_build_object(
                               'cameraId', ${SCREEN_KEY} || '-CAM-1', 'label', 'Camera 1')) END
           ) ORDER BY ${SCREEN_ORDER}), '[]') AS screens
    FROM screens s
    CROSS JOIN LATERAL (
      SELECT count(*) AS n, max(c.updated_at) AS updated_at,
             (array_agg(c.updated_by ORDER BY c.updated_at DESC))[1] AS updated_by,
             json_agg(json_strip_nulls(json_build_object(
               'cameraId', c.id, 'label', c.label, 'make', c.make, 'model', c.model,
               'serialNumber', c.serial_number, 'ownership', c.ownership, 'ipAddress', host(c.ip_address)
             )) ORDER BY substring(c.label FROM '\\d+$')::int NULLS LAST, c.label, c.id) AS list
      FROM icount_cameras c WHERE c.screen_id = s.id
    ) cams
    WHERE s.theatre_id = t.id AND s.status <> 'Deleted'
  ) sc
  WHERE t.status <> 'Deleted' AND ${HAS_CAMERAS}`;

const LOOKUP_SELECT = `
  SELECT ${THEATRE_COLUMNS},
         (SELECT count(*) FROM screens s WHERE s.theatre_id = t.id AND s.status <> 'Deleted') AS "totalScreens"
  FROM theatres t LEFT JOIN chains ch ON ch.id = t.chain_id`;

async function enrolledTheatre(id: string) {
  const [row] = await query<IcountTheatre>(`${ENROLLED_SELECT} AND t.id = $1`, [id]);
  if (!row) throw notFound("iCount theatre");
  return row;
}

icount.get("/", async (c) => c.json(await query<IcountTheatre>(`${ENROLLED_SELECT} ORDER BY t.name, t.id`)));

/** Theatres with no iCount cameras yet (Add Theatre search). */
icount.get("/lookup", async (c) =>
  c.json(await query<IcountLookupTheatre>(
    `${LOOKUP_SELECT} WHERE t.status <> 'Deleted' AND NOT ${HAS_CAMERAS} ORDER BY t.name, t.id`,
  )),
);

/** One theatre without cameras, with its screens, for the add page. */
icount.get("/lookup/:id", async (c) => {
  const id = c.req.param("id");
  const [theatre] = await query<IcountLookupTheatre & { enrolled: boolean }>(
    `${LOOKUP_SELECT.replace("FROM theatres t", `, ${HAS_CAMERAS} AS enrolled FROM theatres t`)}
     WHERE t.id = $1 AND t.status <> 'Deleted'`,
    [id],
  );
  if (!theatre) throw notFound("Theatre");
  const { enrolled, ...rest } = theatre;
  if (enrolled) throw httpError(409, `${rest.theatreName} already has iCount cameras`);
  const screens = await query<IcountScreen>(
    `SELECT ${SCREEN_KEY} AS "screenId", s.name AS "screenName", false AS "hasCameras",
            json_build_array(json_build_object('cameraId', ${SCREEN_KEY} || '-CAM-1', 'label', 'Camera 1')) AS cameras
     FROM screens s WHERE s.theatre_id = $1 AND s.status <> 'Deleted' ORDER BY ${SCREEN_ORDER}`,
    [id],
  );
  return c.json({ ...rest, screens });
});

icount.get("/:id", async (c) => c.json(await enrolledTheatre(c.req.param("id"))));

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

type CamerasInput = {
  theatreId?: string;
  latitude?: number;
  longitude?: number;
  screens?: Partial<IcountScreen>[];
};

const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

function coordinate(v: unknown, field: string, limit: number) {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== "number" || !Number.isFinite(v) || Math.abs(v) > limit) {
    throw httpError(400, `${field} must be a number between -${limit} and ${limit}`);
  }
  return v;
}

function validateScreens(screens: unknown) {
  if (!Array.isArray(screens)) throw httpError(400, "screens must be an array");
  const parsed = (screens as Partial<IcountScreen>[]).map((s) => {
    const screenId = text(s.screenId);
    if (!screenId) throw httpError(400, "Every screen needs a screenId");
    if (!s.hasCameras) return { screenId, cameras: [] };
    if (!Array.isArray(s.cameras) || s.cameras.length === 0) {
      throw httpError(400, `Screen ${screenId}: add at least one camera or disable cameras for the screen`);
    }
    const cameras = s.cameras.map((cam, i) => {
      const ownership = text(cam.ownership);
      if (ownership && !OWNERSHIP.includes(ownership)) throw httpError(400, `Screen ${screenId}: ownership must be Theatre or Qube`);
      const ipAddress = text(cam.ipAddress);
      if (ipAddress && !isIP(ipAddress)) throw httpError(400, `Screen ${screenId}: "${ipAddress}" is not a valid IP address`);
      return {
        cameraId: text(cam.cameraId),
        label: text(cam.label) ?? `Camera ${i + 1}`,
        make: text(cam.make), model: text(cam.model), serialNumber: text(cam.serialNumber), ownership, ipAddress,
      };
    });
    return { screenId, cameras };
  });
  if (!parsed.some((s) => s.cameras.length > 0)) throw httpError(400, "Enable iCount cameras on at least one screen");
  return parsed;
}

/** Replace the cameras of every posted screen; existing camera ids are kept. */
async function saveCameras(client: pg.PoolClient, theatreId: string, body: CamerasInput, mode: "create" | "update") {
  const latitude = coordinate(body.latitude, "latitude", 90);
  const longitude = coordinate(body.longitude, "longitude", 180);
  const screens = validateScreens(body.screens);

  const { rows: [theatre] } = await client.query<{ name: string; enrolled: boolean }>(
    `SELECT t.name, ${HAS_CAMERAS} AS enrolled FROM theatres t WHERE t.id = $1 AND t.status <> 'Deleted' FOR UPDATE`,
    [theatreId],
  );
  if (!theatre) throw notFound("Theatre");
  if (mode === "create" && theatre.enrolled) throw httpError(409, `${theatre.name} already has iCount cameras`);
  if (mode === "update" && !theatre.enrolled) throw notFound("iCount theatre");

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
    const { rows: removed } = await client.query<{ id: string }>(
      "DELETE FROM icount_cameras WHERE screen_id = $1 RETURNING id", [screenId],
    );
    const reusable = new Set(removed.map((r) => r.id));
    for (const cam of s.cameras) {
      const keepId = cam.cameraId && reusable.delete(cam.cameraId) ? cam.cameraId : null;
      await client.query(
        `INSERT INTO icount_cameras (id, screen_id, label, make, model, serial_number, ownership, ip_address, updated_by)
         VALUES (coalesce($1, gen_random_uuid()::text), $2, $3, $4, $5, $6, $7, $8, $9)`,
        [keepId, screenId, cam.label, cam.make, cam.model, cam.serialNumber, cam.ownership, cam.ipAddress, CURRENT_USER],
      );
    }
  }

  const { rows: [left] } = await client.query<{ enrolled: boolean }>(
    `SELECT ${HAS_CAMERAS} AS enrolled FROM theatres t WHERE t.id = $1`, [theatreId],
  );
  if (!left.enrolled) throw httpError(400, "Enable iCount cameras on at least one screen");
}

/** Add a theatre. Body: { theatreId (theatres.id), latitude, longitude, screens: IcountScreen[] } */
icount.post("/", async (c) => {
  const body = await c.req.json<CamerasInput>();
  const theatreId = text(body.theatreId);
  if (!theatreId) throw httpError(400, "theatreId is required");
  await transaction((client) => saveCameras(client, theatreId, body, "create"));
  return c.json(await enrolledTheatre(theatreId), 201);
});

icount.put("/:id", async (c) => {
  const id = c.req.param("id");
  await transaction(async (client) => saveCameras(client, id, await c.req.json<CamerasInput>(), "update"));
  return c.json(await enrolledTheatre(id));
});

/** Remove every iCount camera from the theatre. */
icount.delete("/:id", async (c) => {
  const rows = await query(
    `DELETE FROM icount_cameras c USING screens s WHERE c.screen_id = s.id AND s.theatre_id = $1 RETURNING c.id`,
    [c.req.param("id")],
  );
  if (rows.length === 0) throw notFound("iCount theatre");
  return c.body(null, 204);
});
