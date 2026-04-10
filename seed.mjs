// seed.mjs
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  console.log("Adding mrsrikart@gmail.com to whitelist...");
  await prisma.whitelistedEmail.upsert({
    where: { email: 'mrsrikart@gmail.com' },
    update: {},
    create: { email: 'mrsrikart@gmail.com' }
  });

  // Check if they already tried logging in, if so update their role to ADMIN
  const user = await prisma.user.findUnique({ where: { email: 'mrsrikart@gmail.com' } });
  if (user) {
    await prisma.user.update({
      where: { email: 'mrsrikart@gmail.com' },
      data: { role: 'ADMIN' }
    });
    console.log("Updated existing user to ADMIN");
  } else {
    // If they haven't logged in yet, we can't easily create the User record without breaking NextAuth linking sometimes,
    // so we'll just wait for them to log in.
    console.log("They haven't signed in yet so User record doesn't exist. They are whitelisted though!");
  }
}

run()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
