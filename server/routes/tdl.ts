import { Hono } from "hono";
import { query } from "../db";
import { CURRENT_USER, notFound } from "../http";
import type { TDLDevice } from "../../src/types";

export const tdl = new Hono();

const TDL_SELECT = `
  SELECT id, manufacturer, model, serial_number AS "serialNumber",
         coalesce(software_version, '') AS "softwareVersion", coalesce(device_role, '') AS "deviceRole",
         certificate_auto_sync AS "certificateAutoSync", valid_till AS "validTill",
         coalesce(public_key_thumbprint, '') AS "publicKeyThumbprint",
         coalesce(issuer_thumbprint, '') AS "issuerThumbprint", coalesce(source, '') AS source, retired,
         coalesce(updated_by, '') AS "updatedBy", updated_at AS "updatedOn",
         certificate_status AS "certificateStatus", coalesce(firmware_version, '') AS "firmwareVersion",
         auto_update_certificate AS "autoUpdateCertificate"
  FROM tdl_devices`;

/** The whole Trusted Device List (~10k rows; the page filters client-side). */
tdl.get("/", async (c) => c.json(await query<TDLDevice>(`${TDL_SELECT} ORDER BY manufacturer, model, serial_number`)));

tdl.get("/:id", async (c) => {
  const [row] = await query<TDLDevice>(`${TDL_SELECT} WHERE id = $1`, [c.req.param("id")]);
  if (!row) throw notFound("TDL device");
  return c.json(row);
});

/** Retire a device (Retire Device action). */
tdl.post("/:id/retire", async (c) => {
  const [row] = await query<{ id: string }>(
    "UPDATE tdl_devices SET retired = true, updated_by = $2 WHERE id = $1 RETURNING id",
    [c.req.param("id"), CURRENT_USER],
  );
  if (!row) throw notFound("TDL device");
  const [device] = await query<TDLDevice>(`${TDL_SELECT} WHERE id = $1`, [row.id]);
  return c.json(device);
});

/** Undo a retirement. */
tdl.post("/:id/unretire", async (c) => {
  const [row] = await query<{ id: string }>(
    "UPDATE tdl_devices SET retired = false, updated_by = $2 WHERE id = $1 RETURNING id",
    [c.req.param("id"), CURRENT_USER],
  );
  if (!row) throw notFound("TDL device");
  const [device] = await query<TDLDevice>(`${TDL_SELECT} WHERE id = $1`, [row.id]);
  return c.json(device);
});
