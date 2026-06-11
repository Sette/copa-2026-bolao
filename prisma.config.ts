import { defineConfig } from "prisma/config";

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
