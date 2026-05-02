"use client";

import { useEffect, useState } from "react";
import { PRODUCTS, type ProductId } from "@/src/ikenga/products/config";

interface Analytics {
  funnel: { signups: number; dashboardUsers: number; generatedAtLeastOnce: number; proUsers: number };
  topContentTypes: { type: string; count: number }[];
  productUsage: { product: string; count: number }[];
  feedback: { upvotes: number; downvotes: number; byProduct: Record<string, { up: number; down: number }> };
  eventFrequency: [string, number][];
  topStreaks: number[];
  conversionRate: string;
}

const TYPE_LABELS: Record<string, string> = {
  social_post: "Social Posts", video_script: "Video Scripts",
  email: "Emails", ad: "Ads", carousel: "Carousels",
};

export default function AnalyticsPage() {
  const [token,   setToken]   = useState("");
  const [authed,  setAuthed]  = useState(false);
  const [data,    setData]    = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function auth(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics", { headers: { "x-admin-token": token } });
      const d   = await res.json() as Analytics & { error?: string };
      if (!res.ok) { setError(d.error ?? "Invalid token."); return; }
      setData(d); setAuthed(true);
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics", { headers: { "x-admin-token": token } });
      const d   = await res.json() as Analytics;
      setData(d);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  useEffect(() => { if (authed) { const t = setInterval(refresh, 30000); return () => clearInterval(t); } }, [authed]); // eslint-disable-line

  const S = { fontFamily: "system-ui,-apple-system,sans-serif", minHeight: "100vh", background: "#000", color: "#fff", padding: "40px 20px 80px" };

  if (!authed) {
    return (
      <main style={S}>
        <div style={{ maxWidth: 380, margin: "0 auto" }}>
          <p style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, letterSpacing: "0.15em", color: "#FFD700", textAlign: "center" }}>IKENGA</p>
          <p style={{ margin: "0 0 36px", fontSize: 11, color: "#555", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.2em" }}>Admin · Analytics</p>
          <form onSubmit={auth} style={{ background: "#0a0a0a", border: "1px solid #1e1e1e", borderRadius: 16, padding: "28px 24px" }}>
            <label style={{ display: "block", fontSize: 11, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Admin token</label>
            <input type="password" value={token} onChange={e => setToken(e.target.value)} required
              style={{ width: "100%", background: "#050505", border: "1px solid #1e1e1e", borderRadius: 8, padding: "11px 13px", fontSize: 14, color: "#fff", boxSizing: "border-box", marginBottom: 12, outline: "none" }} />
            {error && <p style={{ margin: "0 0 12px", fontSize: 13, color: "#f87171" }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "#222" : "#FFD700", color: loading ? "#555" : "#000", border: "none", borderRadius: 100, padding: "12px", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Checking…" : "Enter →"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (!data) return <main style={S}><p style={{ color: "#333" }}>Loading analytics…</p></main>;

  const card: React.CSSProperties = { background: "#0a0a0a", border: "1px solid #1e1e1e", borderRadius: 14, padding: "20px 22px" };
  const label: React.CSSProperties = { margin: "0 0 4px", fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" };
  const big: React.CSSProperties = { margin: 0, fontSize: 36, fontWeight: 700, color: "#FFF4C0" };

  const totalFeedback = data.feedback.upvotes + data.feedback.downvotes;
  const satisfaction  = totalFeedback > 0 ? Math.round((data.feedback.upvotes / totalFeedback) * 100) : 0;

  return (
    <main style={S}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "0.15em", color: "#FFD700" }}>IKENGA</p>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 700, color: "#FFF4C0" }}>Analytics Dashboard</p>
          </div>
          <button onClick={refresh} disabled={loading} style={{ background: "transparent", border: "1px solid #1e1e1e", borderRadius: 8, padding: "8px 16px", fontSize: 13, color: "#555", cursor: "pointer" }}>
            {loading ? "Refreshing…" : "Refresh ↻"}
          </button>
        </div>

        {/* ── Funnel ── */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: "0 0 12px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", color: "#555" }}>Conversion Funnel</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
            {[
              { label: "Waitlist signups",      val: data.funnel.signups },
              { label: "Dashboard users",        val: data.funnel.dashboardUsers },
              { label: "Generated ≥1 time",     val: data.funnel.generatedAtLeastOnce },
              { label: "Pro subscribers",        val: data.funnel.proUsers },
            ].map((f, i, arr) => {
              const pct = i > 0 && arr[i-1].val > 0 ? Math.round((f.val / arr[i-1].val) * 100) : 100;
              return (
                <div key={f.label} style={card}>
                  <p style={label}>{f.label}</p>
                  <p style={big}>{f.val.toLocaleString()}</p>
                  {i > 0 && <p style={{ margin: "4px 0 0", fontSize: 12, color: pct >= 50 ? "#4ade80" : pct >= 25 ? "#FFD700" : "#f87171" }}>{pct}% from prev step</p>}
                </div>
              );
            })}
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 13, color: "#555" }}>
            Overall conversion (signup → Pro): <strong style={{ color: "#FFD700" }}>{data.conversionRate}</strong>
          </p>
        </div>

        {/* ── Product usage + Content types ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>

          {/* Product usage */}
          <div style={card}>
            <p style={{ ...label, marginBottom: 16 }}>Product usage (generations)</p>
            {data.productUsage.map(p => {
              const pr = PRODUCTS[(p.product as ProductId)] ?? PRODUCTS.IKENGA;
              const max = data.productUsage[0]?.count ?? 1;
              const pct = Math.round((p.count / max) * 100);
              return (
                <div key={p.product} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: pr.color, fontWeight: 700 }}>{p.product}</span>
                    <span style={{ fontSize: 13, color: "#888" }}>{p.count}</span>
                  </div>
                  <div style={{ height: 4, background: "#111", borderRadius: 100 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pr.color, borderRadius: 100 }} />
                  </div>
                </div>
              );
            })}
            {data.productUsage.length === 0 && <p style={{ margin: 0, fontSize: 13, color: "#444" }}>No data yet.</p>}
          </div>

          {/* Top content types */}
          <div style={card}>
            <p style={{ ...label, marginBottom: 16 }}>Top content types</p>
            {data.topContentTypes.map((t, i) => (
              <div key={t.type} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < data.topContentTypes.length - 1 ? "1px solid #111" : "none" }}>
                <span style={{ fontSize: 13, color: "#ccc" }}>{TYPE_LABELS[t.type] ?? t.type}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#FFD700" }}>{t.count}</span>
              </div>
            ))}
            {data.topContentTypes.length === 0 && <p style={{ margin: 0, fontSize: 13, color: "#444" }}>No content generated yet.</p>}
          </div>
        </div>

        {/* ── Feedback ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 24 }}>
          <div style={card}>
            <p style={label}>Content satisfaction</p>
            <p style={big}>{satisfaction}%</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#555" }}>{data.feedback.upvotes}👍 {data.feedback.downvotes}👎</p>
          </div>
          <div style={card}>
            <p style={{ ...label, marginBottom: 14 }}>Feedback by product</p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {Object.entries(data.feedback.byProduct).map(([prod, fb]) => {
                const pr   = PRODUCTS[(prod as ProductId)] ?? PRODUCTS.IKENGA;
                const total = fb.up + fb.down;
                const pct  = total > 0 ? Math.round((fb.up / total) * 100) : 0;
                return (
                  <div key={prod}>
                    <p style={{ margin: "0 0 4px", fontSize: 12, color: pr.color, fontWeight: 700 }}>{prod}</p>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#FFF4C0" }}>{pct}%</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#444" }}>{fb.up}↑ {fb.down}↓</p>
                  </div>
                );
              })}
              {Object.keys(data.feedback.byProduct).length === 0 && <p style={{ margin: 0, fontSize: 13, color: "#444" }}>No feedback yet.</p>}
            </div>
          </div>
        </div>

        {/* ── Event frequency ── */}
        <div style={{ ...card, marginBottom: 24 }}>
          <p style={{ ...label, marginBottom: 14 }}>User event frequency</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {data.eventFrequency.slice(0, 10).map(([event, count]) => (
              <div key={event} style={{ background: "#050505", border: "1px solid #1e1e1e", borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>{event}</p>
                <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 700, color: "#FFD700" }}>{count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Top streaks ── */}
        {data.topStreaks.length > 0 && (
          <div style={card}>
            <p style={{ ...label, marginBottom: 10 }}>Top user streaks (days)</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {data.topStreaks.filter(s => s > 0).map((s, i) => (
                <span key={i} style={{ background: "#0a0800", border: "1px solid #3a3000", borderRadius: 100, padding: "4px 14px", fontSize: 13, fontWeight: 700, color: "#FFD700" }}>
                  🔥 {s}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
