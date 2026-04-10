import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Wallet, TrendingDown, TrendingUp, Plus } from "lucide-react";
import ExpenseForm from "./ExpenseForm";
import { format } from "date-fns";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const [totalDepositsRaw, totalExpensesRaw, allExpenses, allDeposits, presets] = await Promise.all([
    prisma.deposit.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.expense.findMany({ orderBy: { date: "desc" }, include: { user: true } }),
    prisma.deposit.findMany({ orderBy: { date: "desc" }, include: { user: true } }),
    prisma.categoryPreset.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalDeposits = totalDepositsRaw._sum.amount || 0;
  const totalExpenses = totalExpensesRaw._sum.amount || 0;
  const balance = totalDeposits - totalExpenses;

  // Merge expenses + deposits into a single timeline
  type TxItem =
    | { type: "expense"; id: string; description: string; category: string; amount: number; date: Date; userName: string }
    | { type: "deposit"; id: string; amount: number; date: Date; userName: string };

  const timeline: TxItem[] = [
    ...allExpenses.map(e => ({
      type: "expense" as const,
      id: e.id, description: e.description, category: e.category,
      amount: e.amount, date: e.date, userName: e.user.name,
    })),
    ...allDeposits.map(d => ({
      type: "deposit" as const,
      id: d.id, amount: d.amount, date: d.date, userName: d.user.name,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Group by date
  const grouped: Record<string, TxItem[]> = {};
  for (const tx of timeline) {
    const key = format(tx.date, "yyyy-MM-dd");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(tx);
  }
  const sortedDays = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
  const dayLabel = (key: string) => {
    if (key === today) return "Today";
    if (key === yesterday) return "Yesterday";
    return format(new Date(key), "d MMMM yyyy");
  };

  const catColors: Record<string, string> = {
    Groceries: "#6366f1", Fruits: "#10b981", Utilities: "#f59e0b",
    Dairy: "#3b82f6", default: "#8b5cf6",
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: "1000px" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", margin: 0 }}>Dashboard</h1>
          <p style={{ margin: 0, textTransform: "capitalize" }}>Welcome back, {session.user.name}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        {/* Balance Card */}
        <div className="glass-panel" style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(26, 29, 36, 0.8))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <Wallet color="var(--primary-accent)" />
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Shared Balance</h3>
          </div>
          <p style={{ fontSize: "3rem", fontWeight: "700", color: balance >= 0 ? "white" : "var(--danger-accent)", margin: "0" }}>
            ₹{balance.toFixed(0)}
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--glass-border)", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Total In: <strong style={{ color: "var(--secondary-accent)" }}>₹{totalDeposits.toFixed(0)}</strong></span>
            <span style={{ color: "var(--text-muted)" }}>Total Out: <strong style={{ color: "var(--danger-accent)" }}>₹{totalExpenses.toFixed(0)}</strong></span>
          </div>
        </div>

        {/* Add Expense Card */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: "16px", fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <Plus size={20} color="var(--secondary-accent)" />
            Log Expense
          </h3>
          <ExpenseForm presets={presets.map(p => p.name)} />
        </div>
      </div>

      {/* Transaction History */}
      <div className="glass-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem" }}>Transaction History</h3>
          <a href="/analytics" className="btn btn-secondary"
            style={{ fontSize: "0.85rem", padding: "8px 16px", display: "flex", alignItems: "center", gap: "6px" }}>
            Analytics →
          </a>
        </div>

        {sortedDays.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>No transactions yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {sortedDays.map((day, dayIdx) => {
              const dayExpenses = grouped[day].filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
              const dayDeposits = grouped[day].filter(t => t.type === "deposit").reduce((s, t) => s + t.amount, 0);
              return (
                <div key={day}>
                  {/* Date Header */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 0 8px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    marginBottom: "4px",
                    marginTop: dayIdx === 0 ? 0 : "20px",
                  }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {dayLabel(day)}
                    </span>
                    <div style={{ display: "flex", gap: "12px", fontSize: "0.82rem" }}>
                      {dayDeposits > 0 && <span style={{ color: "var(--secondary-accent)", fontWeight: 700 }}>+₹{dayDeposits.toFixed(0)}</span>}
                      {dayExpenses > 0 && <span style={{ color: "var(--danger-accent)", fontWeight: 700 }}>−₹{dayExpenses.toFixed(0)}</span>}
                    </div>
                  </div>

                  {/* Items */}
                  {grouped[day].map((tx, i) => {
                    const isLast = i === grouped[day].length - 1;
                    if (tx.type === "deposit") {
                      return (
                        <div key={tx.id} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "13px 8px",
                          borderBottom: !isLast ? "1px solid rgba(255,255,255,0.04)" : "none",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <div style={{
                              width: "42px", height: "42px", borderRadius: "12px", flexShrink: 0,
                              background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <TrendingUp size={18} color="var(--secondary-accent)" />
                            </div>
                            <div>
                              <p style={{ margin: 0, fontWeight: 600, color: "var(--secondary-accent)", fontSize: "0.95rem" }}>
                                Money Added
                              </p>
                              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px", textTransform: "capitalize" }}>
                                Deposited by {tx.userName}
                              </p>
                            </div>
                          </div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "var(--secondary-accent)" }}>
                            +₹{tx.amount.toFixed(0)}
                          </p>
                        </div>
                      );
                    }

                    // Expense
                    const color = catColors[(tx as any).category] ?? catColors.default;
                    const initials = (tx as any).description.slice(0, 2).toUpperCase();
                    return (
                      <div key={tx.id} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "13px 8px",
                        borderBottom: !isLast ? "1px solid rgba(255,255,255,0.04)" : "none",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <div style={{
                            width: "42px", height: "42px", borderRadius: "12px", flexShrink: 0,
                            background: `${color}22`, border: `1px solid ${color}44`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.8rem", fontWeight: 700, color,
                          }}>
                            {initials}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: "white", fontSize: "0.95rem" }}>
                              {(tx as any).description}
                            </p>
                            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                              {(tx as any).category}
                              <span style={{ margin: "0 6px", opacity: 0.4 }}>·</span>
                              <span style={{ textTransform: "capitalize" }}>{tx.userName}</span>
                            </p>
                          </div>
                        </div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "white" }}>
                          −₹{tx.amount.toFixed(0)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
