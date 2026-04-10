// seed-deposits.mjs
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  const names = ['kunal', 'rahul', 'jeevan'];
  const users = {};

  for (const name of names) {
    let u = await prisma.user.findUnique({ where: { name } });
    if (!u) u = await prisma.user.create({ data: { name, role: 'USER' } });
    users[name] = u;
    console.log(`Found/created: ${name}`);
  }

  const deposits = [
    // 4 Apr
    { user: 'kunal',  amount: 500, date: '2026-04-04' },
    { user: 'rahul',  amount: 356, date: '2026-04-04' },
    // 9 Apr
    { user: 'jeevan', amount: 413, date: '2026-04-09' },
  ];

  let total = 0;
  for (const dep of deposits) {
    await prisma.deposit.create({
      data: {
        amount: dep.amount,
        date: new Date(dep.date + 'T12:00:00+05:30'),
        userId: users[dep.user].id,
      }
    });
    console.log(`✅ ₹${dep.amount} deposited by ${dep.user} on ${dep.date}`);
    total += dep.amount;
  }

  console.log(`\nDone! Total deposited: ₹${total}`);
}

run()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
