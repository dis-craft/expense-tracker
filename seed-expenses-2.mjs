// seed-expenses-2.mjs
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
  let srikar = await prisma.user.findUnique({ where: { name: 'srikar' } });
  if (!srikar) {
    srikar = await prisma.user.create({ data: { name: 'srikar', role: 'ADMIN' } });
  }

  const expenses = [
    // 4 Apr
    { date: '2026-04-04', amount: 61,  description: 'Milk, Udin Bele 250gm', category: 'Groceries' },

    // 6 Apr
    { date: '2026-04-06', amount: 30,  description: 'Water',         category: 'Groceries' },
    { date: '2026-04-06', amount: 120, description: 'T Dal',          category: 'Groceries' },
    { date: '2026-04-06', amount: 24,  description: 'Milk',           category: 'Groceries' },
    { date: '2026-04-06', amount: 175, description: 'Oil',            category: 'Groceries' },
    { date: '2026-04-06', amount: 36,  description: 'Cumin Seeds',    category: 'Groceries' },

    // 7 Apr
    { date: '2026-04-07', amount: 20,  description: 'Curd',           category: 'Groceries' },
    { date: '2026-04-07', amount: 30,  description: 'Water',          category: 'Groceries' },

    // 8 Apr
    { date: '2026-04-08', amount: 29,  description: 'Curd',           category: 'Groceries' },

    // 9 Apr
    { date: '2026-04-09', amount: 27,  description: 'Milk',           category: 'Groceries' },
    { date: '2026-04-09', amount: 35,  description: 'Mosur Dal',      category: 'Groceries' },
  ];

  let total = 0;
  for (const exp of expenses) {
    await prisma.expense.create({
      data: {
        amount: exp.amount,
        description: exp.description,
        category: exp.category,
        date: new Date(exp.date + 'T13:00:00+05:30'),
        userId: srikar.id,
      }
    });
    console.log(`✅ ₹${exp.amount} - ${exp.description} (${exp.date})`);
    total += exp.amount;
  }

  console.log(`\nDone! Added ${expenses.length} entries totalling ₹${total}`);
}

run()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
