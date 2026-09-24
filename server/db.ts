import pg from "pg";
import { DATABASE_URL } from "../db/client";

// Return timestamptz/date columns as ISO strings, which is what the UI's
// types (and date-fns parseISO) expect.
pg.types.setTypeParser(1184, (v) => new Date(v).toISOString()); // timestamptz
pg.types.setTypeParser(1082, (v) => v); // date → "YYYY-MM-DD"
pg.types.setTypeParser(20, (v) => Number(v)); // bigint (count(*)) → number
pg.types.setTypeParser(1700, (v) => Number(v)); // numeric → number

export const pool = new pg.Pool({ connectionString: DATABASE_URL, max: 10 });

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(sql: string, params: unknown[] = []) {
  const { rows } = await pool.query<T>(sql, params);
  return rows;
}

/** Run `fn` in a transaction on one connection. */
export async function transaction<T>(fn: (client: pg.PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
