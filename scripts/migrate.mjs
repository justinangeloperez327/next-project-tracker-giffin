import { Pool } from "pg";
import { readFile } from "node:fs/promises";
if (!process.env.DATABASE_URL)
  throw new Error("Set DATABASE_URL before migrating.");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query(
    await readFile(new URL("../db/001-init.sql", import.meta.url), "utf8"),
  );
  console.log("Database ready.");
} finally {
  await pool.end();
}
