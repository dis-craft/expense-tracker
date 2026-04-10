"use client";

import { useState } from "react";
import { addDeposit, addPreset } from "../actions";

const ROOMMATES = ["kunal", "shreyas", "rahul", "jeevan", "srikar"];

export default function AdminForms({ actionType }: { actionType: "deposit" | "preset" }) {
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  if (actionType === "deposit") {
    return (
      <form
        action={async (fd) => {
          setLoading(true);
          await addDeposit(fd);
          setLoading(false);
        }}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}
      >
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: "0.78rem" }}>Who paid?</label>
          <select className="form-select" name="personName" required style={{ textTransform: "capitalize" }}>
            <option value="" disabled>Select person</option>
            {ROOMMATES.map(r => (
              <option key={r} value={r} style={{ textTransform: "capitalize" }}>{r}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: "0.78rem" }}>Amount (₹)</label>
          <input className="form-input" type="number" name="amount" step="1" min="1" placeholder="0" required />
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ fontSize: "0.78rem" }}>Date</label>
          <input className="form-input" type="date" name="date" defaultValue={today} required />
        </div>

        <button type="submit" className="btn btn-secondary" disabled={loading} style={{ height: "42px" }}>
          {loading ? "Adding..." : "Add"}
        </button>
      </form>
    );
  }

  if (actionType === "preset") {
    return (
      <form action={async (fd) => {
        setLoading(true);
        await addPreset(fd);
        setLoading(false);
      }} style={{ display: "flex", gap: "12px" }}>
        <input className="form-input" type="text" name="name" placeholder="Preset Name (e.g. Milk)" required style={{ flex: 1 }} />
        <button type="submit" className="btn btn-secondary" disabled={loading}>{loading ? "Adding..." : "Add Preset"}</button>
      </form>
    );
  }

  return null;
}
