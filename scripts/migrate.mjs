import { Pool } from "pg";
import { readFile, readdir } from "node:fs/promises";
if (!process.env.DATABASE_URL)
  throw new Error("Set DATABASE_URL before migrating.");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(72841026)");
  await client.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
  );
  const directory = new URL("../db/", import.meta.url);
  for (const name of (await readdir(directory))
    .filter((name) => /^\d+.*\.sql$/.test(name))
    .sort()) {
    if (
      (
        await client.query("SELECT 1 FROM schema_migrations WHERE name=$1", [
          name,
        ])
      ).rowCount
    )
      continue;
    await client.query(await readFile(new URL(name, directory), "utf8"));
    await client.query("INSERT INTO schema_migrations(name) VALUES($1)", [
      name,
    ]);
    console.log(`Applied ${name}`);
  }
  await client.query("COMMIT");
  console.log("Database ready.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
