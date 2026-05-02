"use client";

import { useEffect, useState, useCallback } from "react";

interface PaymentRow {
  id: string;
  email: string;
  unique_ref: string;
  tier_type: string;
  amount_gbp: number;
  status: string;
  admin_notes: string | null;
  created_at: string;
  confirmed_at: string | null;
}

interface PaymentsResponse {
  payments?: PaymentRow[];
  error?: string;
}

interface ActionResponse {
  success?: boolean;
  action?: string;
  email?: string;
  error?: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminPaymentsPage() {
  const [token,    setToken]    = useState("");
  const [authed,   setAuthed]   = useState(false);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [filter,   setFilter]   = useState("pending");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [acting,   setActing]   = useState<string | null>(null);
  const [notes,    setNotes]    = useState<Record<string, string>>({});

  const loadPayments = useCallback(async (t: string, f: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/payments?status=${f}`, {
        headers: { "x-admin-token": t },
      });
      const data = await res.json() as PaymentsResponse;
      if (!res.ok) {
        setError(data.error ?? "Failed to load.");
        if (res.status === 401 || res.status === 503) setAuthed(false);
        return;
      }
      setPayments(data.payments ?? []);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) loadPayments(token, filter);
  }, [authed, filter, token, loadPayments]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments?status=pending", {
        headers: { "x-admin-token": token },
      });
      if (res.ok) {
        setAuthed(true);
      } else {
        const d = await res.json() as PaymentsResponse;
        setError(d.error ?? "Invalid token.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, action: "confirmed" | "rejected") {
    setActing(id);
    setError("");
    try {
      const res = await fetch("/api/admin/payments", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ id, action, notes: notes[id] ?? null }),
      });
      const data = await res.json() as ActionResponse;
      if (!res.ok) {
        setError(data.error ?? "Action failed.");
        return;
      }
      // Reload list
      await loadPayments(token, filter);
    } catch {
      setError("Network error.");
    } finally {
      setActing(null);
    }
  }

  const S: React.CSSProperties = {
    fontFamily: "system-ui, -apple-system, sans-serif",
    minHeight: "100vh",
    background: "#000",
    color: "#fff",
    padding: "40px 20px 80px",
  };

  if (!authed) {
    return (
      <main style={S}>
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <p style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, letterSpacing: "0.15em", color: "#FFD700", textAlign: "center" }}>IKENGA</p>
          <p style={{ margin: "0 0 40px", fontSize: 11, color: "#555", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.2em" }}>Admin · Payments</p>

          <form onSubmit={handleAuth} style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: "32px 28px" }}>
            <label style={{ display: "block", fontSize: 12, color: "#777", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Admin token
            </label>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              required
              placeholder="Enter your admin token"
              style={{
                width: "100%",
                background: "#0a0a0a",
                border: "1px solid #333",
                borderRadius: 8,
                padding: "12px 14px",
                fontSize: 14,
                color: "#fff",
                boxSizing: "border-box",
                marginBottom: 16,
                outline: "none",
              }}
            />
            {error && (
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "#ff6b6b", background: "#1a0000", border: "1px solid #3a0000", borderRadius: 8, padding: "10px 14px" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#555" : "#FFD700",
                color: "#000",
                border: "none",
                borderRadius: 100,
                padding: "13px",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Checking…" : "Enter →"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={S}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "0.15em", color: "#FFD700" }}>IKENGA</p>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 700, color: "#FFF4C0" }}>Payment Confirmations</p>
          </div>
          <button
            onClick={() => loadPayments(token, filter)}
            style={{ background: "transparent", border: "1px solid #333", borderRadius: 8, padding: "8px 16px", fontSize: 13, color: "#888", cursor: "pointer" }}
          >
            Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["pending", "confirmed", "rejected"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? "#FFD700" : "transparent",
                color:      filter === f ? "#000"    : "#666",
                border:     filter === f ? "none"    : "1px solid #333",
                borderRadius: 100,
                padding: "7px 18px",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "capitalize",
                cursor: "pointer",
                letterSpacing: "0.06em",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {error && (
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "#ff6b6b", background: "#1a0000", border: "1px solid #3a0000", borderRadius: 8, padding: "12px 16px" }}>
            {error}
          </p>
        )}

        {loading ? (
          <p style={{ color: "#555" }}>Loading…</p>
        ) : payments.length === 0 ? (
          <p style={{ color: "#555", fontSize: 14 }}>No {filter} payments.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {payments.map(p => (
              <div
                key={p.id}
                style={{
                  background: "#111",
                  border: `1px solid ${p.status === "pending" ? "#3a3000" : p.status === "confirmed" ? "#003a00" : "#3a0000"}`,
                  borderRadius: 14,
                  padding: "20px 24px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#FFF4C0" }}>{p.email}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>
                      <span style={{ color: "#FFD700", fontWeight: 700 }}>{p.unique_ref}</span>
                      {" · "}£{p.amount_gbp}{" "}
                      <span style={{ textTransform: "capitalize" }}>{p.tier_type}</span>
                      {" · "}{formatDate(p.created_at)}
                    </p>
                    {p.admin_notes && (
                      <p style={{ margin: "6px 0 0", fontSize: 12, color: "#666" }}>Note: {p.admin_notes}</p>
                    )}
                    {p.confirmed_at && (
                      <p style={{ margin: "6px 0 0", fontSize: 12, color: "#4ade80" }}>Confirmed: {formatDate(p.confirmed_at)}</p>
                    )}
                  </div>

                  {p.status === "pending" && (
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexDirection: "column" }}>
                      <input
                        type="text"
                        placeholder="Admin notes (optional)"
                        value={notes[p.id] ?? ""}
                        onChange={e => setNotes(prev => ({ ...prev, [p.id]: e.target.value }))}
                        style={{
                          background: "#0a0a0a",
                          border: "1px solid #333",
                          borderRadius: 6,
                          padding: "7px 12px",
                          fontSize: 12,
                          color: "#ccc",
                          outline: "none",
                          width: 220,
                        }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleAction(p.id, "confirmed")}
                          disabled={acting === p.id}
                          style={{
                            background: acting === p.id ? "#555" : "#22c55e",
                            color: "#000",
                            border: "none",
                            borderRadius: 8,
                            padding: "9px 18px",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: acting === p.id ? "not-allowed" : "pointer",
                          }}
                        >
                          {acting === p.id ? "…" : "Confirm ✓"}
                        </button>
                        <button
                          onClick={() => handleAction(p.id, "rejected")}
                          disabled={acting === p.id}
                          style={{
                            background: "transparent",
                            color: "#ff6b6b",
                            border: "1px solid #3a0000",
                            borderRadius: 8,
                            padding: "9px 18px",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: acting === p.id ? "not-allowed" : "pointer",
                          }}
                        >
                          Reject ✗
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
