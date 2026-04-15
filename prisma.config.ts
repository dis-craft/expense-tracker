import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    // The CLI uses this URL for migrations and introspection.
    // Ensure this points to the direct connection if using a pooler.
    url: env("DIRECT_URL") || env("DATABASE_URL"),
  },

  migrations: {
    path: "prisma/migrations",
  },
});