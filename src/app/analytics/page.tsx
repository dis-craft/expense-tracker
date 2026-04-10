import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AnalyticsCharts from "./AnalyticsCharts";
import { format, startOfWeek, subDays } from "date-fns";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const [allExpenses, allDeposits] = await Promise.all([
    prisma.expense.findMany({ orderBy: { date: "asc" }, include: { user: true } }),
    prisma.deposit.findMany({ orderBy: { date: "asc" }, include: { user: true } }),
  ]);

  const totalSpent = allExpenses.reduce((s, e) => s + e.amount, 0);
  const totalDeposited = allDeposits.reduce((s, d) => s + d.amount, 0);
  const balance = totalDeposited - totalSpent;
  const avgPerPerson = totalSpent / 5;

  // --- Category breakdown ---
  const categoryMap: Record<string, number> = {};
  allExpenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });
  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // --- Daily spending (last 14 days) ---
  const last14Days = Array.from({ length: 14 }, (_, i) => subDays(new Date(), 13 - i));
  const dailyExpMap: Record<string, number> = {};
  allExpenses.forEach(e => { const k = format(e.date, "dd MMM"); dailyExpMap[k] = (dailyExpMap[k] || 0) + e.amount; });
  const dailyData = last14Days.map(d => ({
    name: format(d, "dd MMM"),
    total: dailyExpMap[format(d, "dd MMM")] || 0,
  }));

  // --- Weekly spending ---
  const weeklyMap: Record<string, number> = {};
  allExpenses.forEach(e => {
    const k = format(startOfWeek(e.date, { weekStartsOn: 1 }), "dd MMM");
    weeklyMap[k] = (weeklyMap[k] || 0) + e.amount;
  });
  const weeklyData = Object.entries(weeklyMap).map(([name, total]) => ({ name: `w/c ${name}`, total })).slice(-8);

  // --- Monthly spending ---
  const monthlyMap: Record<string, number> = {};
  allExpenses.forEach(e => {
    const k = format(e.date, "MMM yyyy");
    monthlyMap[k] = (monthlyMap[k] || 0) + e.amount;
  });
  const monthlyData = Object.entries(monthlyMap).map(([name, total]) => ({ name, total }));

  // --- Cumulative spending ---
  let running = 0;
  const cumulativeData = dailyData.map(d => { running += d.total; return { name: d.name, total: running }; });

  // --- Per-person spending ---
  const personExpMap: Record<string, number> = {};
  allExpenses.forEach(e => { personExpMap[e.user.name] = (personExpMap[e.user.name] || 0) + e.amount; });
  const personData = Object.entries(personExpMap).map(([name, value]) => ({ name, value }));

  // --- Per-person deposits ---
  const personDepMap: Record<string, number> = {};
  allDeposits.forEach(d => { personDepMap[d.user.name] = (personDepMap[d.user.name] || 0) + d.amount; });
  const depositPersonData = Object.entries(personDepMap).map(([name, value]) => ({ name, value }));

  // --- Deposits over time (daily, last 14d) ---
  const dailyDepMap: Record<string, number> = {};
  allDeposits.forEach(d => { const k = format(d.date, "dd MMM"); dailyDepMap[k] = (dailyDepMap[k] || 0) + d.amount; });
  const dailyDepositData = last14Days.map(d => ({
    name: format(d, "dd MMM"),
    total: dailyDepMap[format(d, "dd MMM")] || 0,
  }));

  return (
    <div className="container animate-fade-in" style={{ maxWidth: "1100px" }}>
      <h1 style={{ marginBottom: "8px" }}>Analytics</h1>
      <p style={{ marginBottom: "32px", color: "var(--text-muted)" }}>
        Complete breakdown of your shared room finances.
      </p>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Total Deposited", value: `₹${totalDeposited.toFixed(0)}`, color: "var(--secondary-accent)" },
          { label: "Total Spent", value: `₹${totalSpent.toFixed(0)}`, color: "var(--danger-accent)" },
          { label: "Balance Left", value: `₹${balance.toFixed(0)}`, color: balance >= 0 ? "white" : "var(--danger-accent)" },
          { label: "Per Person (÷5)", value: `₹${avgPerPerson.toFixed(0)}`, color: "var(--primary-accent)" },
          { label: "Transactions", value: `${allExpenses.length}`, color: "white" },
          { label: "Top Category", value: categoryData[0]?.name || "—", color: "var(--secondary-accent)" },
        ].map(card => (
          <div key={card.label} className="glass-panel" style={{ textAlign: "center", padding: "18px 12px" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>{card.label}</p>
            <p style={{ fontSize: "1.6rem", fontWeight: "700", color: card.color, margin: 0 }}>{card.value}</p>
          </div>
        ))}
      </div>

      <AnalyticsCharts
        categoryData={categoryData}
        dailyData={dailyData}
        weeklyData={weeklyData}
        monthlyData={monthlyData}
        cumulativeData={cumulativeData}
        personData={personData}
        depositPersonData={depositPersonData}
        dailyDepositData={dailyDepositData}
      />
    </div>
  );
}
