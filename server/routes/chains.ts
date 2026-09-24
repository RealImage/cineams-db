import { Hono } from "hono";
import { query } from "../db";
import { notFound } from "../http";
import type { Chain } from "../../src/types";

export const chains = new Hono();

const CHAIN_SELECT = `
  SELECT c.id, c.name, c.company_id AS "companyId", co.name AS "companyName",
         (SELECT count(*) FROM theatres t WHERE t.chain_id = c.id) AS "theatreCount",
         c.status, c.created_at AS "createdAt", c.updated_at AS "updatedAt"
  FROM chains c LEFT JOIN companies co ON co.id = c.company_id`;

chains.get("/", async (c) => c.json(await query<Chain>(`${CHAIN_SELECT} ORDER BY c.name`)));

chains.get("/:id", async (c) => {
  const [row] = await query<Chain>(`${CHAIN_SELECT} WHERE c.id = $1`, [c.req.param("id")]);
  if (!row) throw notFound("Chain");
  return c.json(row);
});

chains.delete("/:id", async (c) => {
  const rows = await query("DELETE FROM chains WHERE id = $1 RETURNING id", [c.req.param("id")]);
  if (rows.length === 0) throw notFound("Chain");
  return c.body(null, 204);
});
