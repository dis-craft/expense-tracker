"use client";

import { useState } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
  AreaChart, Area,
} from "recharts";

const COLORS = ['#6366f1', '#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
const PANEL_STYLE = { backgroundColor: "rgba(15,17,21,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "white", fontSize: "0.85rem" };
const fmt = (v: any) => `₹${Number(v || 0).toFixed(0)}`;

function BarView({ data, dataKey = "total", color }: { data: any[]; dataKey?: string; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 45 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: "var(--text-muted)", fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
        <YAxis stroke="var(--text-muted)" tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={fmt} width={60} />
        <Tooltip formatter={fmt} contentStyle={PANEL_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={color || COLORS[i % COLORS.length]} />)}
          <LabelList dataKey={dataKey} position="top" formatter={(v: any) => v > 0 ? `₹${v}` : ""} style={{ fill: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function AreaView({ data, color = "#6366f1" }: { data: any[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 45 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: "var(--text-muted)", fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
        <YAxis stroke="var(--text-muted)" tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={fmt} width={60} />
        <Tooltip formatter={fmt} contentStyle={PANEL_STYLE} />
        <Area type="monotone" dataKey="total" stroke={color} strokeWidth={2} fill="url(#areaGrad)" dot={{ fill: color, r: 3 }}>
          <LabelList dataKey="total" position="top" formatter={fmt} style={{ fill: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: 600 }} />
        </Area>
      </AreaChart>
    </ResponsiveContainer>
  );
}

function PieWithLegend({ data, valueKey = "value" }: { data: any[]; valueKey?: string }) {
  if (data.length === 0) return <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px 0" }}>No data yet.</p>;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey={valueKey}
            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={fmt} contentStyle={PANEL_STYLE} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "12px" }}>
        {data.map((d, i) => (
          <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
              <span style={{ fontSize: "0.9rem", textTransform: "capitalize" }}>{d.name}</span>
            </div>
            <span style={{ fontWeight: 600 }}>₹{Number(d[valueKey]).toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const TABS = [
  { id: "daily",    label: "Daily" },
  { id: "weekly",   label: "Weekly" },
  { id: "monthly",  label: "Monthly" },
  { id: "cumul",    label: "Cumulative" },
  { id: "category", label: "By Category" },
  { id: "person",   label: "By Person" },
  { id: "deposits", label: "💰 Deposits" },
  { id: "dep-daily",label: "Deposit Timeline" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function AnalyticsCharts({
  categoryData, dailyData, weeklyData, monthlyData,
  cumulativeData, personData, depositPersonData, dailyDepositData,
}: {
  categoryData: { name: string; value: number }[];
  dailyData: { name: string; total: number }[];
  weeklyData: { name: string; total: number }[];
  monthlyData: { name: string; total: number }[];
  cumulativeData: { name: string; total: number }[];
  personData: { name: string; value: number }[];
  depositPersonData: { name: string; value: number }[];
  dailyDepositData: { name: string; total: number }[];
}) {
  const [active, setActive] = useState<TabId>("daily");

  return (
    <div className="glass-panel">
      {/* Tab Bar */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px" }}>
        {TABS.map(tab => (
          <button key={tab.id} type="button" onClick={() => setActive(tab.id)}
            style={{
              padding: "7px 14px", borderRadius: "100px", border: "none", cursor: "pointer",
              fontSize: "0.82rem", fontWeight: 500,
              background: active === tab.id ? "var(--primary-accent)" : "rgba(255,255,255,0.06)",
              color: active === tab.id ? "white" : "var(--text-muted)",
              transition: "all 0.2s",
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {active === "daily" && (
        <div>
          <h3 style={{ marginBottom: "4px" }}>Daily Spending — Last 14 Days</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>How much was spent each day</p>
          <BarView data={dailyData} />
        </div>
      )}
      {active === "weekly" && (
        <div>
          <h3 style={{ marginBottom: "4px" }}>Weekly Spending</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>Total per week (Mon – Sun)</p>
          <BarView data={weeklyData} />
        </div>
      )}
      {active === "monthly" && (
        <div>
          <h3 style={{ marginBottom: "4px" }}>Monthly Spending</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>Total per calendar month</p>
          <BarView data={monthlyData} color="#10b981" />
        </div>
      )}
      {active === "cumul" && (
        <div>
          <h3 style={{ marginBottom: "4px" }}>Cumulative Spending — Last 14 Days</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>Running total over time</p>
          <AreaView data={cumulativeData} />
        </div>
      )}
      {active === "category" && (
        <div>
          <h3 style={{ marginBottom: "4px" }}>Spending by Category</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>All-time breakdown by category</p>
          <PieWithLegend data={categoryData} />
        </div>
      )}
      {active === "person" && (
        <div>
          <h3 style={{ marginBottom: "4px" }}>Spending by Person</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>Who has logged how much in expenses</p>
          <PieWithLegend data={personData} />
        </div>
      )}
      {active === "deposits" && (
        <div>
          <h3 style={{ marginBottom: "4px" }}>Deposits by Person</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>Who has contributed to the shared pot</p>
          <PieWithLegend data={depositPersonData} />
        </div>
      )}
      {active === "dep-daily" && (
        <div>
          <h3 style={{ marginBottom: "4px" }}>Deposit Timeline — Last 14 Days</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>When money was added to the pot</p>
          <AreaView data={dailyDepositData} color="#10b981" />
        </div>
      )}
    </div>
  );
}
