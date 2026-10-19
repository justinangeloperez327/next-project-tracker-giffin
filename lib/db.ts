import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const globalDb = globalThis as unknown as { prisma?: PrismaClient };
export function getDb(): PrismaClient {
  if (globalDb.prisma) return globalDb.prisma;
  const connectionString =
    process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;
  if (!connectionString || !/^postgres(ql)?:\/\//.test(connectionString))
    throw new Error(
      "Set DATABASE_URL to a PostgreSQL TCP connection string from Prisma Postgres.",
    );
  const adapter = new PrismaPg({
    connectionString,
    max: 3,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });
  globalDb.prisma = new PrismaClient({ adapter });
  return globalDb.prisma;
}
