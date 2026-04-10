// seed-expenses.mjs
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
  // Find or create Srikar as ADMIN
  let srikar = await prisma.user.findUnique({ where: { name: 'srikar' } });
  if (!srikar) {
    srikar = await prisma.user.create({ data: { name: 'srikar', role: 'ADMIN' } });
    console.log('Created Srikar user');
  } else {
    // Ensure role is ADMIN
    srikar = await prisma.user.update({ where: { name: 'srikar' }, data: { role: 'ADMIN' } });
    console.log('Found Srikar, updated to ADMIN');
  }

  const date9Apr = new Date('2026-04-09T13:09:00+05:30');

  const expenses = [
    { amount: 10,  description: 'Water',          category: 'Groceries' },
    { amount: 10,  description: 'Maggie Masala',  category: 'Groceries' },
    { amount: 140, description: 'Egg',             category: 'Groceries' },
    { amount: 10,  description: 'Karbevu',         category: 'Groceries' },
    { amount: 100, description: 'Onion',           category: 'Groceries' },
    { amount: 100, description: 'Banana',          category: 'Fruits' },
    { amount: 70,  description: 'Watermelon',      category: 'Fruits' },
    { amount: 20,  description: 'Cabbage',         category: 'Groceries' },
  ];

  for (const exp of expenses) {
    await prisma.expense.create({
      data: {
        amount: exp.amount,
        description: exp.description,
        category: exp.category,
        date: date9Apr,
        userId: srikar.id,
      }
    });
    console.log(`Added: ₹${exp.amount} - ${exp.description}`);
  }

  console.log('\n✅ All expenses added successfully!');
  console.log(`Total: ₹${expenses.reduce((s, e) => s + e.amount, 0)}`);
}

run()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
