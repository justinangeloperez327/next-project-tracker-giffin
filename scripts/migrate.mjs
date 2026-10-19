import { spawnSync } from "node:child_process";
import { config } from "dotenv";
config({ path: [".env.local", ".env"], quiet: true });
if (!process.env.DATABASE_URL)
  throw new Error("Set DATABASE_URL before migrating.");
const result = spawnSync(
  process.execPath,
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  { stdio: "inherit", env: process.env },
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
