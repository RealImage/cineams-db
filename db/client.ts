import pg from "pg";

export const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://cineams:cineams@localhost:5432/cineams";

export function createClient() {
  return new pg.Client({ connectionString: DATABASE_URL });
}

/** Multi-row INSERT in chunks. `rows` are objects keyed by column name. */
export async function insertMany(
  client: pg.Client,
  table: string,
  rows: Record<string, unknown>[],
  { onConflict = "", chunkSize = 500 }: { onConflict?: string; chunkSize?: number } = {},
) {
  if (rows.length === 0) return;
  const columns = Object.keys(rows[0]);
  for (let start = 0; start < rows.length; start += chunkSize) {
    const chunk = rows.slice(start, start + chunkSize);
    const values: unknown[] = [];
    const tuples = chunk.map((row) => {
      const placeholders = columns.map((col) => {
        const v = row[col];
        // Plain objects go to jsonb columns; arrays are left for text[] columns,
        // so callers must JSON.stringify arrays destined for jsonb.
        const isPlainObject = v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date);
        values.push(isPlainObject ? JSON.stringify(v) : v);
        return `$${values.length}`;
      });
      return `(${placeholders.join(", ")})`;
    });
    await client.query(
      `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${tuples.join(", ")} ${onConflict}`,
      values,
    );
  }
}
