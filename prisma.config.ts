import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrate: {
    url: process.env.DIRECT_URL, // ✅ direct connection for migrations
  },

  db: {
    url: process.env.DATABASE_URL, // ✅ pooled connection for runtime
  },
});