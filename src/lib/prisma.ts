import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || "";

  // SQLite — lazy-load adapter (avoids native module in production)
  if (dbUrl.startsWith("file:")) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    return new PrismaClient({
      adapter: new PrismaBetterSqlite3({ url: dbUrl }),
    });
  }

  // PostgreSQL — pg adapter (pure JS, sempre disponível)
  return new PrismaClient({
    adapter: new PrismaPg(dbUrl),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
