import { defineConfig } from "prisma/config";
import { config as dotenvConfig } from "dotenv";

// Carrega .env.local (prioridade) e .env (fallback)
dotenvConfig({ path: ".env.local", override: true });
dotenvConfig({ path: ".env" });

const isSQLite = (process.env["DATABASE_URL"] || "").startsWith("file:");

export default defineConfig({
  schema: isSQLite ? "prisma/schema.sqlite.prisma" : "prisma/schema.prisma",
  migrations: isSQLite
    ? undefined
    : {
        path: "prisma/migrations",
      },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
