import type { ExtraSeeder } from "./types";

/**
 * Re-applies the data backfills from migrations 005 and 006 after the core
 * seed. Migrations run once, so without this a full `db:seed` would lose them.
 */
export const backfillsSeeder: ExtraSeeder = {
  name: "backfills",
  tables: ["theatre_logs"],
  async run(client) {
    // 006: new (not yet fetched) WireTAP devices aren't in the inventory
    await client.query(`UPDATE wiretap_devices SET in_inventory = (id NOT LIKE 'wt-new-%')`);

    // 006: theatres from the old appliance lookup lists get screens to enrol
    await client.query(`
      INSERT INTO screens (id, theatre_id, number, name)
      SELECT t.code || ':SCR-' || t.code || '-' || n, t.id, n::text, 'Screen ' || n
      FROM theatres t
      CROSS JOIN LATERAL generate_series(1, 5 + (substring(t.code FROM 2)::int % 10)) AS n
      WHERE t.code ~ '^T[246]\\d{4}$'
        AND NOT EXISTS (SELECT 1 FROM screens s WHERE s.theatre_id = t.id)
      ON CONFLICT (id) DO NOTHING`);

    // 005: one "Created" log entry per theatre
    await client.query(`
      INSERT INTO theatre_logs (theatre_id, logged_at, section, action, updated_by, new_value)
      SELECT id, created_at, 'General Information', 'Created', coalesce(created_by, updated_by, 'System'), name
      FROM theatres`);
  },
};
