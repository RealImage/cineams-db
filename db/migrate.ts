// Applies db/migrations/*.sql in filename order, once each.
// Usage: npm run db:migrate           apply pending migrations
//        npm run db:migrate -- --reset drop everything first (dev only)
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, describeDatabase } from "./client";
import { AGENT_CONFIG_SECRETS, CREDENTIAL_SECRETS, assertEncryptionKey, syncEncryption } from "./secrets";

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "migrations");

async function main() {
  assertEncryptionKey();
  const client = createClient();
  await client.connect();
  try {
    if (process.argv.includes("--reset")) {
      console.log("Resetting schema public…");
      await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
    }

    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    const { rows } = await client.query<{ name: string }>("SELECT name FROM schema_migrations");
    const applied = new Set(rows.map((r) => r.name));

    const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
    let count = 0;
    for (const file of files) {
      if (applied.has(file)) continue;
      console.log(`Applying ${file}`);
      await client.query("BEGIN");
      try {
        await client.query(readFileSync(path.join(migrationsDir, file), "utf8"));
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
      count++;
    }
    console.log(count ? `Applied ${count} migration(s) to ${describeDatabase()}` : "Schema is up to date.");

    // Masked credential and configuration values are encrypted with the app's key, which SQL
    // migrations don't have; bring stored values in line with the format.
    const encrypted =
      (await syncEncryption(client, CREDENTIAL_SECRETS)) + (await syncEncryption(client, AGENT_CONFIG_SECRETS));
    if (encrypted) console.log(`Updated encryption of ${encrypted} credential/configuration set(s)`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
