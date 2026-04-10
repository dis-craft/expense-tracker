"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Wallet, Users } from "lucide-react";
import { useRouter } from "next/navigation";

const ROOMMATES = ["kunal", "shreyas", "rahul", "jeevan", "srikar"];

export default function Home() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [savedName, setSavedName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const cachedName = localStorage.getItem("roommate_name");
    if (cachedName && ROOMMATES.includes(cachedName.toLowerCase())) {
      setSavedName(cachedName);
      setName(cachedName);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      name,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid password");
      setLoading(false);
    } else {
      localStorage.setItem("roommate_name", name);
      router.push("/dashboard");
    }
  };

  const handleLogoutMemory = () => {
    localStorage.removeItem("roommate_name");
    setSavedName(null);
    setName("");
  };

  return (
    <div className="container" style={{ minHeight: "calc(100vh - 100px)", display: "flex", alignItems: "center" }}>
      <div className="glass-panel" style={{ maxWidth: "450px", width: "100%", margin: "0 auto", padding: "48px 32px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <div style={{ 
            background: "linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))",
            padding: "16px",
            borderRadius: "50%",
          }}>
            <Wallet size={32} color="white" />
          </div>
        </div>
        
        <h1 style={{ fontSize: "2rem", marginBottom: "8px", textAlign: "center" }}>Welcome Back</h1>
        <p style={{ color: "var(--text-muted)", textAlign: "center", marginBottom: "32px", fontSize: "0.95rem" }}>
          Shared Expense Tracker
        </p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {error && <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger-accent)", borderRadius: "8px", color: "var(--danger-accent)", fontSize: "0.9rem", textAlign: "center" }}>{error}</div>}
          
          {savedName ? (
            <div style={{ textAlign: "center", padding: "16px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                 <Users size={24} color="var(--primary-accent)" />
              </div>
              <p style={{ margin: "0 0 4px 0", fontSize: "0.9rem", color: "var(--text-muted)" }}>Logging in as</p>
              <h3 style={{ margin: 0, textTransform: "capitalize", color: "white" }}>{savedName}</h3>
              <button 
                type="button"
                onClick={handleLogoutMemory}
                style={{ background: "transparent", border: "none", color: "var(--danger-accent)", fontSize: "0.8rem", marginTop: "12px", cursor: "pointer", textDecoration: "underline" }}
              >
                Not you? Choose another name
              </button>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label" htmlFor="name">Who are you?</label>
              <select 
                className="form-select" 
                id="name" 
                value={name} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setName(e.target.value)} 
                required
                style={{ textTransform: "capitalize" }}
              >
                <option value="" disabled>Select your name</option>
                {ROOMMATES.map((r: string) => (
                  <option key={r} value={r} style={{ textTransform: "capitalize" }}>{r}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="password">Shared Password</label>
            <input 
              className="form-input" 
              type="password" 
              id="password" 
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Enter standard or admin password" 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "16px" }} disabled={loading}>
            {loading ? "Verifying..." : "Enter Shared Pot"}
          </button>
        </form>
      </div>
    </div>
  );
}
