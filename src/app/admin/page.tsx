import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShieldCheck, Plus } from "lucide-react";
import AdminForms from "./AdminForms";
import EditExpenseRow from "./EditExpenseRow";
import { format } from "date-fns";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [presets, allExpenses] = await Promise.all([
    prisma.categoryPreset.findMany({ orderBy: { name: "asc" } }),
    prisma.expense.findMany({
      orderBy: { date: "desc" },
      include: { user: true },
    }),
  ]);

  return (
    <div className="container animate-fade-in" style={{ maxWidth: "900px" }}>
      <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "12px" }}>
        <ShieldCheck size={36} color="var(--secondary-accent)" />
        <div>
          <h1 style={{ margin: 0 }}>Admin Panel</h1>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>Manage the shared pool</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: "24px" }}>

        {/* Add Money */}
        <div className="glass-panel" style={{ borderLeft: "4px solid var(--secondary-accent)" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            Add Money to Pool
          </h3>
          <p style={{ marginBottom: "16px", color: "var(--text-muted)", fontSize: "0.9rem" }}>Log collected funds from roommates.</p>
          <AdminForms actionType="deposit" />
        </div>

        {/* Presets */}
        <div className="glass-panel">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Plus size={20} /> Add Expense Preset
          </h3>
          <p style={{ marginBottom: "16px", color: "var(--text-muted)", fontSize: "0.9rem" }}>Add quick-add buttons like "Milk".</p>
          <AdminForms actionType="preset" />
          <div style={{ marginTop: "14px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {presets.map(p => (
              <span key={p.id} style={{ padding: "4px 12px", background: "rgba(255,255,255,0.08)", borderRadius: "100px", fontSize: "0.82rem" }}>
                {p.name}
              </span>
            ))}
          </div>
        </div>

        {/* Expense Editor */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: "4px" }}>All Expenses</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>Edit or delete any transaction.</p>

          {allExpenses.length === 0 ? (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "32px 0" }}>No expenses yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {allExpenses.map(exp => (
                <EditExpenseRow
                  key={exp.id}
                  id={exp.id}
                  description={exp.description}
                  amount={exp.amount}
                  category={exp.category}
                  date={format(exp.date, "yyyy-MM-dd")}
                  userName={exp.user.name}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
