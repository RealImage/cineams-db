// Re-seed a single extra seeder's tables without touching the rest.
// Usage: npm run db:seed:one -- <name>   (names in db/seeds/index.ts)
import { createClient, describeDatabase } from "./client";
import { extraSeeders } from "./seeds";

async function main() {
  const name = process.argv[2];
  const seeder = extraSeeders.find((s) => s.name === name);
  if (!seeder) throw new Error(`Unknown seeder "${name}". Known: ${extraSeeders.map((s) => s.name).join(", ")}`);
  const client = createClient();
  await client.connect();
  try {
    await client.query("BEGIN");
    if (seeder.tables.length) await client.query(`TRUNCATE ${seeder.tables.join(", ")} RESTART IDENTITY CASCADE`);
    await seeder.run(client);
    await client.query("COMMIT");
    console.log(`Seeded ${seeder.name} (${seeder.tables.join(", ") || "no tables"}) into ${describeDatabase()}`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
