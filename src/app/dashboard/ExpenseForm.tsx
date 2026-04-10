"use client";

import { useRef, useState } from "react";
import { addExpense } from "../actions";

export default function ExpenseForm({ presets }: { presets: string[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");

  const currentDate = new Date().toISOString().slice(0, 10);

  const handlePresetClick = (preset: string) => {
    setDescription(preset);
    // Focus amount field after selecting preset
    setTimeout(() => {
      const amountInput = formRef.current?.elements.namedItem("amount") as HTMLInputElement;
      amountInput?.focus();
    }, 50);
  };

  return (
    <form ref={formRef} action={async (formData) => {
      setLoading(true);
      await addExpense(formData);
      formRef.current?.reset();
      setDescription("");
      setLoading(false);
    }}>
      {/* Quick Presets */}
      {presets.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <label className="form-label">Quick Add</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {presets.map(p => (
              <button
                key={p} type="button"
                className="btn btn-secondary"
                style={{
                  padding: "6px 14px", fontSize: "0.85rem", borderRadius: "100px",
                  background: description === p ? "var(--primary-accent)" : undefined,
                  color: description === p ? "white" : undefined,
                  borderColor: description === p ? "var(--primary-accent)" : undefined,
                  transition: "all 0.2s"
                }}
                onClick={() => handlePresetClick(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="description">What did you buy?</label>
        <input
          className="form-input"
          type="text"
          id="description"
          name="description"
          required
          placeholder="e.g. Milk"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div className="form-group">
          <label className="form-label" htmlFor="amount">Amount (₹)</label>
          <input className="form-input" type="number" id="amount" name="amount" step="1" min="1" required placeholder="0" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="date">Date</label>
          <input className="form-input" type="date" id="date" name="date" defaultValue={currentDate} required />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="category">Category</label>
        <input className="form-input" type="text" id="category" name="category" required placeholder="e.g. Groceries" />
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }} disabled={loading}>
        {loading ? "Adding..." : "Log Expense"}
      </button>
    </form>
  );
}
