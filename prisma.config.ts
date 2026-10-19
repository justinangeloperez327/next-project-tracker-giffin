import { config } from "dotenv";
import { defineConfig } from "prisma/config";
config({ path: [".env.local", ".env"], quiet: true });
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Generation does not need a connection; deployment commands require DATABASE_URL.
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/giffin",
  },
});
