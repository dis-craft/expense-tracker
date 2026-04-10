// fix-deposits.mjs
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  // Show all deposits
  const all = await prisma.deposit.findMany({ include: { user: true }, orderBy: { date: 'asc' } });
  console.log('All deposits:');
  all.forEach(d => console.log(`  id=${d.id} | ${d.user.name} | ₹${d.amount} | ${d.date.toISOString().slice(0,10)}`));
  console.log(`Total: ₹${all.reduce((s, d) => s + d.amount, 0)}`);

  // Expected: kunal 500 + rahul 356 + jeevan 413 = 1269
  // Delete everything, then recreate correctly
  console.log('\nDeleting all deposits...');
  await prisma.deposit.deleteMany({});

  const users = {};
  for (const name of ['kunal', 'rahul', 'jeevan']) {
    const u = await prisma.user.findUnique({ where: { name } });
    if (u) users[name] = u;
  }

  const correct = [
    { user: 'kunal',  amount: 500, date: '2026-04-04' },
    { user: 'rahul',  amount: 356, date: '2026-04-04' },
    { user: 'jeevan', amount: 413, date: '2026-04-09' },
  ];

  for (const dep of correct) {
    if (!users[dep.user]) { console.log(`User ${dep.user} not found, skipping`); continue; }
    await prisma.deposit.create({
      data: { amount: dep.amount, date: new Date(dep.date + 'T12:00:00+05:30'), userId: users[dep.user].id }
    });
    console.log(`✅ ₹${dep.amount} - ${dep.user}`);
  }

  const final = await prisma.deposit.aggregate({ _sum: { amount: true } });
  console.log(`\nFinal total: ₹${final._sum.amount}`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
