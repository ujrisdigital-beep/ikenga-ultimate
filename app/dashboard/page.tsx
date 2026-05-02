"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProductSwitcher } from "@/src/components/product-switcher";
import { ContentGallery, type ContentItem } from "@/src/components/content-gallery";
import { OnboardingWidget } from "@/src/components/onboarding-widget";
import { PRODUCTS, type ProductId } from "@/src/ikenga/products/config";

// ── Types ────────────────────────────────────────────────────

interface DashboardData {
  email:           string;
  displayName:     string | null;
  tier:            string;
  proType:         string | null;
  proExpires:      string | null;
  gensUsed:        number;
  gensLimit:       number | null;
  bonus_gens?:     number;
  streak_days?:    number;
  active_product?: string;
  memberSince:     string;
  logs:            { id: string; label: string; created_at: string }[];
  pendingPayments: { unique_ref: string; tier_type: string; amount_gbp: number; status: string; created_at: string }[];
  dbNotReady?:     boolean;
}

interface OnboardingData {
  current_step:   number;
  completed_days: Record<string, string>;
  referral_code:  string | null;
}

interface GenerateResult { success?: boolean; content?: unknown; gensUsed?: number; tier?: string; error?: string; message?: string; }

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ── Streak badge ──────────────────────────────────────────────

function StreakBadge({ days }: { days: number }) {
  if (!days) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#0a0800", border: "1px solid #3a3000", borderRadius: 100, padding: "4px 12px", fontSize: 12, color: "#FFD700", fontWeight: 700 }}>
      🔥 {days} day{days !== 1 ? "s" : ""} streak
    </span>
  );
}

// ── Tier badge ────────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  return (
    <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: tier === "pro" ? "#FFD700" : "#1a1a1a", color: tier === "pro" ? "#000" : "#555", border: tier === "pro" ? "none" : "1px solid #2a2a2a" }}>
      {tier === "pro" ? "PRO" : "FREE"}
    </span>
  );
}

// ── Generate form ──────────────────────────────────────────────

function GenerateForm({
  product, onDone,
}: {
  product: ProductId;
  onDone:  (content: unknown, gensUsed: number) => void;
}) {
  const p = PRODUCTS[product];
  const [brand,    setBrand]    = useState("");
  const [goals,    setGoals]    = useState("");
  const [niche,    setNiche]    = useState("");
  const [audience, setAudience] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/products/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ product, brand, goals, niche, audience }),
      });
      const d = await res.json() as GenerateResult;
      if (!res.ok) { setError(d.message ?? d.error ?? "Failed."); return; }
      onDone(d.content, d.gensUsed ?? 0);
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ padding: "12px 16px", background: p.bgColor, border: `1px solid ${p.borderColor}`, borderRadius: 10, marginBottom: 4 }}>
        <p style={{ margin: 0, fontSize: 12, color: p.color, fontWeight: 700, letterSpacing: "0.08em" }}>{product} — {p.tagline}</p>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: "#666" }}>{p.toneDirective.slice(0, 80)}…</p>
      </div>

      {[
        { label: "Brand name *",     val: brand,    set: setBrand,    ph: "e.g. NovaBrew Coffee",           req: true  },
        { label: "Goals *",          val: goals,    set: setGoals,    ph: "e.g. Grow Instagram, drive sales",req: true  },
        { label: "Niche",            val: niche,    set: setNiche,    ph: "e.g. Speciality coffee, Lagos",   req: false },
        { label: "Target audience",  val: audience, set: setAudience, ph: "e.g. Urban professionals 25–40",  req: false },
      ].map(f => (
        <div key={f.label}>
          <label style={{ display: "block", fontSize: 11, color: "#555", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>{f.label}</label>
          <input
            type="text" value={f.val} onChange={e => f.set(e.target.value)}
            required={f.req} placeholder={f.ph}
            style={{ width: "100%", background: "#050505", border: "1px solid #1e1e1e", borderRadius: 8, padding: "10px 13px", fontSize: 14, color: "#fff", boxSizing: "border-box", outline: "none" }}
          />
        </div>
      ))}

      {error && (
        <p style={{ margin: 0, fontSize: 13, color: "#f87171", background: "#1a0000", border: "1px solid #3a0000", borderRadius: 8, padding: "10px 13px" }}>
          {error}
          {error.toLowerCase().includes("upgrade") && <> · <a href="/pay" style={{ color: "#FFD700" }}>Upgrade →</a></>}
        </p>
      )}

      <button
        type="submit" disabled={loading}
        style={{ background: loading ? "#222" : p.color, color: loading ? "#555" : "#000", border: "none", borderRadius: 100, padding: "13px", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}
      >
        {loading ? `Running ${product}… (30–90s)` : `Run ${product} →`}
      </button>
    </form>
  );
}

// ── Main dashboard ────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();

  const [data,       setData]       = useState<DashboardData | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [items,      setItems]      = useState<ContentItem[]>([]);
  const [product,    setProduct]    = useState<ProductId>("IKENGA");
  const [pageLoad,   setPageLoad]   = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [showLog,    setShowLog]    = useState(false);

  // ── Loaders ──────────────────────────────────────────────────

  const loadAll = useCallback(async () => {
    const [dashRes, itemsRes, onbRes] = await Promise.all([
      fetch("/api/dashboard"),
      fetch("/api/content"),
      fetch("/api/onboarding"),
    ]);

    const dash = await dashRes.json() as DashboardData & { error?: string };
    if (dash.error === "Not logged in.") { router.push("/login"); return; }
    setData(dash);
    if (dash.active_product) setProduct(dash.active_product as ProductId);

    const itemsData = await itemsRes.json() as { items?: ContentItem[] };
    setItems(itemsData.items ?? []);

    const onbData = await onbRes.json() as { onboarding?: OnboardingData };
    setOnboarding(onbData.onboarding ?? null);
  }, [router]);

  useEffect(() => {
    loadAll().finally(() => setPageLoad(false));
  }, [loadAll]);

  const refreshItems = useCallback(() => {
    fetch("/api/content").then(r => r.json()).then((d: { items?: ContentItem[] }) => setItems(d.items ?? []));
  }, []);

  const refreshDash = useCallback(() => {
    fetch("/api/dashboard").then(r => r.json()).then((d: DashboardData) => setData(d));
  }, []);

  // ── Onboarding step advance ───────────────────────────────────

  async function advanceOnboarding(step: number) {
    await fetch("/api/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ step }) });
    const fresh = await fetch("/api/onboarding").then(r => r.json()) as { onboarding?: OnboardingData };
    setOnboarding(fresh.onboarding ?? null);
  }

  // ── Product switch ────────────────────────────────────────────

  async function handleProductSwitch(id: ProductId) {
    setProduct(id);
    await fetch("/api/user-product", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product: id }) }).catch(() => {});
    // Filter gallery to this product
    fetch(`/api/content?product=${id}`).then(r => r.json()).then((d: { items?: ContentItem[] }) => setItems(d.items ?? []));
    void fetch("/api/dashboard").then(r => r.json()).then((d: DashboardData) => setData(d));
  }

  // ── Generation done ────────────────────────────────────────────

  async function handleGenDone(_content: unknown, gensUsed: number) {
    setShowForm(false);
    setData(prev => prev ? { ...prev, gensUsed } : prev);
    // Refresh gallery
    await new Promise(r => setTimeout(r, 800)); // small delay for DB write
    refreshItems();
    refreshDash();
    // Advance onboarding to day 2 if on step 1
    if (onboarding && onboarding.current_step === 1) advanceOnboarding(1);
  }

  // ── Logout ────────────────────────────────────────────────────

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  // ── Loading ───────────────────────────────────────────────────

  if (pageLoad) {
    return (
      <main style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
        <p style={{ color: "#333" }}>Loading…</p>
      </main>
    );
  }
  if (!data) return null;

  const p          = PRODUCTS[product];
  const isPro      = data.tier === "pro";
  const totalFree  = 3 + (data.bonus_gens ?? 0);
  const gensLeft   = isPro ? null : Math.max(0, totalFree - data.gensUsed);
  const pct        = isPro ? 100 : Math.min((data.gensUsed / totalFree) * 100, 100);
  const canGen     = isPro || (gensLeft !== null && gensLeft > 0);

  return (
    <main style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* ── Top bar ── */}
      <div style={{ borderBottom: "1px solid #111", padding: "12px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", position: "sticky", top: 0, background: "#000", zIndex: 10 }}>
        {/* Logo */}
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.15em", color: "#FFD700", flexShrink: 0 }}>IKENGA</span>

        {/* Product switcher */}
        <ProductSwitcher active={product} onChange={handleProductSwitch} />

        {/* Streak */}
        <StreakBadge days={data.streak_days ?? 0} />

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User info */}
        <span style={{ fontSize: 12, color: "#444" }}>{data.displayName ?? data.email}</span>
        <TierBadge tier={data.tier} />
        {!isPro && <a href="/pay" style={{ background: p.color, color: "#000", textDecoration: "none", padding: "6px 14px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>Upgrade</a>}
        <button onClick={logout} style={{ background: "transparent", border: "1px solid #1e1e1e", borderRadius: 8, padding: "6px 13px", fontSize: 12, color: "#444", cursor: "pointer" }}>
          Log out
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 80px" }}>

        {/* Onboarding widget */}
        {onboarding && <OnboardingWidget data={onboarding} onAdvance={advanceOnboarding} />}

        {/* DB not ready notice */}
        {data.dbNotReady && (
          <div style={{ background: "#0a0800", border: "1px solid #3a3000", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#FFD700" }}>
              Run the SQL in <code>src/ikenga/db/payments_schema.sql</code> and <code>src/ikenga/db/platform_schema.sql</code> in Supabase to enable full features.
            </p>
          </div>
        )}

        {/* Usage card */}
        <div style={{ background: "#0a0a0a", border: `1px solid ${isPro ? p.borderColor : "#1e1e1e"}`, borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            {!isPro && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#555" }}>Free generations</span>
                  <span style={{ fontSize: 12, color: gensLeft === 0 ? "#f87171" : "#FFF4C0", fontWeight: 700 }}>{data.gensUsed} / {totalFree}</span>
                </div>
                <div style={{ height: 4, background: "#111", borderRadius: 100, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "#f87171" : p.color, borderRadius: 100 }} />
                </div>
                {(data.bonus_gens ?? 0) > 0 && (
                  <p style={{ margin: "6px 0 0", fontSize: 11, color: "#4ade80" }}>+{data.bonus_gens} bonus gens from referrals</p>
                )}
              </>
            )}
            {isPro && <p style={{ margin: 0, fontSize: 13, color: "#888" }}>{data.gensUsed} total generations · Unlimited Pro access</p>}
          </div>

          {/* Generate CTA */}
          <button
            onClick={() => setShowForm(f => !f)}
            disabled={!canGen}
            style={{
              background: canGen ? p.color : "#1a1a1a", color: canGen ? "#000" : "#444",
              border: "none", borderRadius: 100, padding: "10px 22px",
              fontSize: 13, fontWeight: 700, cursor: canGen ? "pointer" : "not-allowed", whiteSpace: "nowrap",
            }}
          >
            {showForm ? "Cancel" : canGen ? `New ${product} Generation →` : "Upgrade Required"}
          </button>
        </div>

        {/* Pending payment notice */}
        {(data.pendingPayments ?? []).filter(pay => pay.status === "pending").length > 0 && (
          <div style={{ background: "#0a0800", border: "1px solid #3a3000", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#FFD700" }}>Payment pending confirmation</p>
            {data.pendingPayments.filter(pay => pay.status === "pending").map(pay => (
              <p key={pay.unique_ref} style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>
                Ref <strong style={{ color: "#FFF4C0" }}>{pay.unique_ref}</strong> · £{pay.amount_gbp} {pay.tier_type} · {fmt(pay.created_at)}
              </p>
            ))}
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#555" }}>Confirmed within 24h. Pro access activates immediately on confirmation.</p>
          </div>
        )}

        {/* Generate form */}
        {showForm && (
          <div style={{ background: "#0a0a0a", border: `1px solid ${p.borderColor}`, borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
            <GenerateForm product={product} onDone={handleGenDone} />
          </div>
        )}

        {/* Content gallery */}
        <div style={{ background: "#0a0a0a", border: "1px solid #111", borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#FFF4C0" }}>
              Content Gallery
              {items.length > 0 && <span style={{ marginLeft: 8, fontSize: 12, color: "#444", fontWeight: 400 }}>{items.length} pieces</span>}
            </h2>
          </div>
          <ContentGallery items={items} onRefresh={refreshItems} />
        </div>

        {/* Activity log (collapsed by default) */}
        <div style={{ background: "#0a0a0a", border: "1px solid #111", borderRadius: 14, overflow: "hidden" }}>
          <button
            onClick={() => setShowLog(l => !l)}
            style={{ width: "100%", background: "transparent", border: "none", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "#FFF4C0" }}>Activity Log</span>
            <span style={{ fontSize: 12, color: "#444" }}>{showLog ? "▲" : "▼"}</span>
          </button>
          {showLog && (
            <div style={{ borderTop: "1px solid #111", padding: "0 20px 16px" }}>
              {data.logs.length === 0 ? (
                <p style={{ margin: "12px 0", fontSize: 13, color: "#333" }}>No activity yet.</p>
              ) : data.logs.map((log, i) => (
                <div key={log.id} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < data.logs.length - 1 ? "1px solid #0a0a0a" : "none" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFD700", marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: "#888" }}>{log.label}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "#2a2a2a" }}>{fmt(log.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
