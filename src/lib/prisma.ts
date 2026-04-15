import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

let connectionString = `${process.env.POSTGRES_URL || process.env.DATABASE_URL || ""}`;

// Add console logs to safely debug the connection issue (hiding credentials)
try {
  if (connectionString) {
    const parsedUrl = new URL(connectionString);
    console.log(`[Database] Attempting connection to host: ${parsedUrl.host}`);
    
    // Check if using the wrong Supabase connection for runtime
    if (parsedUrl.host.includes("supabase") && parsedUrl.port === "5432") {
      console.warn("[Database] ⚠️ WARNING: You are connecting to Supabase using port 5432 (direct connection). On Vercel, this will likely fail because it relies on IPv6. You must use the pooler URL (port 6543) for your DATABASE_URL in Vercel.");
    }
    
    // Fix pg pg-connection-string warning
    if (parsedUrl.searchParams.get("sslmode") === "require") {
        parsedUrl.searchParams.set("uselibpqcompat", "true");
        connectionString = parsedUrl.toString();
        console.log(`[Database] Suppressing SSL mode warning by setting uselibpqcompat=true.`);
    }
  } else {
    console.error("[Database] ❌ No DATABASE_URL found in environment variables.");
  }
} catch (e) {
  console.warn("[Database] Could not parse DATABASE_URL.");
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('[Database] Unexpected error on idle client', err);
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
