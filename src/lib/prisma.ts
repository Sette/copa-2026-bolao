import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || "";

  // SQLite — better-sqlite3 adapter
  if (dbUrl.startsWith("file:")) {
    return new PrismaClient({
      adapter: new PrismaBetterSqlite3({ url: dbUrl }),
    });
  }

  // PostgreSQL — pg adapter
  return new PrismaClient({
    adapter: new PrismaPg(dbUrl),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
