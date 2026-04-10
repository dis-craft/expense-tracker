"use client";

import { useState } from "react";
import { updateExpense, deleteExpense } from "../actions";
import { Pencil, Trash2, Check, X } from "lucide-react";

export default function EditExpenseRow({
  id, description, amount, category, date, userName
}: {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  userName: string;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "12px",
      padding: "14px 16px",
    }}>
      {editing ? (
        <form action={async (fd: FormData) => {
          setSaving(true);
          fd.append("id", id);
          await updateExpense(fd);
          setSaving(false);
          setEditing(false);
        }} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: "10px", alignItems: "end" }}>
          <div>
            <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Description</label>
            <input className="form-input" name="description" defaultValue={description} required style={{ fontSize: "0.9rem", padding: "8px 12px" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Amount (₹)</label>
            <input className="form-input" name="amount" type="number" defaultValue={amount} required style={{ fontSize: "0.9rem", padding: "8px 12px" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Category</label>
            <input className="form-input" name="category" defaultValue={category} required style={{ fontSize: "0.9rem", padding: "8px 12px" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Date</label>
            <input className="form-input" name="date" type="date" defaultValue={date} required style={{ fontSize: "0.9rem", padding: "8px 12px" }} />
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button type="submit" disabled={saving} style={{
              background: "var(--secondary-accent)", border: "none", borderRadius: "8px",
              padding: "9px", cursor: "pointer", display: "flex", alignItems: "center"
            }}>
              <Check size={16} color="white" />
            </button>
            <button type="button" onClick={() => setEditing(false)} style={{
              background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "8px",
              padding: "9px", cursor: "pointer", display: "flex", alignItems: "center"
            }}>
              <X size={16} color="white" />
            </button>
          </div>
        </form>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>{description}</p>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                {category} · <span style={{ textTransform: "capitalize" }}>{userName}</span> · {date}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontWeight: 700, fontSize: "1rem" }}>₹{amount.toFixed(0)}</span>
            <button onClick={() => setEditing(true)} style={{
              background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "8px", padding: "7px 10px", cursor: "pointer", display: "flex", alignItems: "center"
            }}>
              <Pencil size={14} color="var(--primary-accent)" />
            </button>
            <form action={async (fd: FormData) => {
              if (!confirm(`Delete "${description}"?`)) return;
              fd.append("id", id);
              await deleteExpense(fd);
            }}>
              <button type="submit" style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "8px", padding: "7px 10px", cursor: "pointer", display: "flex", alignItems: "center"
              }}>
                <Trash2 size={14} color="var(--danger-accent)" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
