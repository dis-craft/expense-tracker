"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Expense Actions
export async function addExpense(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const dateStr = formData.get("date") as string;
  
  const date = dateStr ? new Date(dateStr) : new Date();

  await prisma.expense.create({
    data: {
      amount,
      description,
      category,
      date,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/analytics");
}

// Deposit Actions (Admin only)
export async function addDeposit(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const amount = parseFloat(formData.get("amount") as string);
  const personName = formData.get("personName") as string;
  const dateStr = formData.get("date") as string;
  const date = dateStr ? new Date(dateStr) : new Date();

  // Find or create user by name
  let user = await prisma.user.findUnique({ where: { name: personName } });
  if (!user) {
    user = await prisma.user.create({ data: { name: personName, role: "USER" } });
  }

  await prisma.deposit.create({
    data: { amount, date, userId: user.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/analytics");
}



// Preset Actions
export async function addPreset(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  
  await prisma.categoryPreset.upsert({
    where: { name },
    update: {},
    create: { name },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

// Edit / Delete Expense (Admin only)
export async function updateExpense(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const dateStr = formData.get("date") as string;

  await prisma.expense.update({
    where: { id },
    data: { amount, description, category, date: new Date(dateStr) },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

export async function deleteExpense(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  await prisma.expense.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
}
