"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type TierType = "monthly" | "lifetime";

interface BankDetails {
  bankName: string;
  accountName: string;
  sortCode: string;
  accountNumber: string;
}

interface PaymentRequestResult {
  success?: boolean;
  uniqueRef?: string;
  tierType?: string;
  amountGbp?: number;
  existing?: boolean;
  error?: string;
}

export default function PayPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<TierType | null>(null);
  const [step,     setStep]     = useState<"choose" | "bank" | "sent">("choose");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [ref,      setRef]      = useState("");
  const [amount,   setAmount]   = useState(0);
  const [bank,     setBank]     = useState<BankDetails | null>(null);

  useEffect(() => {
    fetch("/api/bank-details")
      .then(r => r.json())
      .then((d: BankDetails) => setBank(d))
      .catch(() => {
        // Use hardcoded fallback if fetch fails
        setBank({
          bankName:      "REVOLUT",
          accountName:   "ONYEDIKA MICHAEL OJIAKU",
          sortCode:      "04-29-09",
          accountNumber: "23989009",
        });
      });
  }, []);

  async function handleSentPayment() {
    if (!selected) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/payment/request", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ tierType: selected }),
      });
      const data = await res.json() as PaymentRequestResult;

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        setError(data.error ?? "Failed to create payment request.");
        return;
      }

      setRef(data.uniqueRef ?? "");
      setAmount(data.amountGbp ?? 0);
      setStep("sent");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    background: "#0a0a0a",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    padding: "11px 14px",
    fontSize: 15,
    color: "#FFD700",
    fontWeight: 700,
    letterSpacing: "0.04em",
    boxSizing: "border-box",
    userSelect: "all",
    cursor: "text",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "48px 20px 80px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "0.18em", color: "#FFD700" }}>
            IKENGA
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.22em", color: "#555" }}>
            Upgrade to Pro
          </p>
        </div>

        {/* ── STEP 1: Choose tier ── */}
        {step === "choose" && (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: "36px 32px" }}>
            <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: "#FFF4C0" }}>
              Choose your plan
            </h1>
            <p style={{ margin: "0 0 32px", fontSize: 14, color: "#666", lineHeight: 1.6 }}>
              Unlimited content generations. All formats. One brand engine.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(["monthly", "lifetime"] as TierType[]).map(t => {
                const price  = t === "monthly" ? "£19 / month" : "£49 lifetime";
                const sub    = t === "monthly" ? "Cancel anytime" : "One payment, forever";
                const active = selected === t;
                return (
                  <button
                    key={t}
                    onClick={() => setSelected(t)}
                    style={{
                      background: active ? "#0d0d00" : "#0a0a0a",
                      border: `2px solid ${active ? "#FFD700" : "#2a2a2a"}`,
                      borderRadius: 12,
                      padding: "20px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "border-color 0.15s",
                      width: "100%",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>
                          {t === "lifetime" ? "Lifetime Access" : "Monthly Pro"}
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{sub}</p>
                      </div>
                      <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#FFD700" }}>{price}</p>
                    </div>
                    {t === "lifetime" && (
                      <p style={{ margin: "10px 0 0", fontSize: 12, color: "#888" }}>
                        Best value · Save £179 vs monthly over a year
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => selected && setStep("bank")}
              disabled={!selected}
              style={{
                width: "100%",
                marginTop: 28,
                background: selected ? "#FFD700" : "#1a1a1a",
                color: selected ? "#000" : "#444",
                border: "none",
                borderRadius: 100,
                padding: "14px 32px",
                fontSize: 15,
                fontWeight: 700,
                cursor: selected ? "pointer" : "not-allowed",
                transition: "background 0.15s",
              }}
            >
              Continue to payment →
            </button>

            <p style={{ margin: "20px 0 0", textAlign: "center", fontSize: 13, color: "#555" }}>
              Already paid?{" "}
              <a href="/dashboard" style={{ color: "#FFD700", textDecoration: "none" }}>
                Dashboard →
              </a>
            </p>
          </div>
        )}

        {/* ── STEP 2: Bank details ── */}
        {step === "bank" && (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: "36px 32px" }}>
            <button
              onClick={() => setStep("choose")}
              style={{ background: "transparent", border: "none", color: "#555", fontSize: 13, cursor: "pointer", padding: "0 0 20px", display: "block" }}
            >
              ← Back
            </button>

            <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: "#FFF4C0" }}>
              Transfer {selected === "monthly" ? "£19" : "£49"}
            </h1>
            <p style={{ margin: "0 0 28px", fontSize: 14, color: "#666", lineHeight: 1.6 }}>
              Make a UK bank transfer using the details below. We confirm manually — usually within a few hours of checking our bank app.
            </p>

            {/* Bank detail fields */}
            {bank ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
                {[
                  { label: "Bank",           value: bank.bankName },
                  { label: "Account name",   value: bank.accountName },
                  { label: "Sort code",      value: bank.sortCode },
                  { label: "Account number", value: bank.accountNumber },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: "block", fontSize: 11, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {f.label}
                    </label>
                    <div
                      style={fieldStyle}
                      title="Click to select and copy"
                      onClick={e => {
                        const range = document.createRange();
                        range.selectNodeContents(e.currentTarget);
                        window.getSelection()?.removeAllRanges();
                        window.getSelection()?.addRange(range);
                      }}
                    >
                      {f.value}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>Loading bank details…</p>
            )}

            {/* Reference notice */}
            <div
              style={{
                background: "#0a0800",
                border: "1px solid #3a3000",
                borderRadius: 10,
                padding: "14px 16px",
                marginBottom: 28,
              }}
            >
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#FFD700" }}>
                No payment reference needed yet.
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "#888", lineHeight: 1.5 }}>
                Click the button below after you have sent the transfer. We will generate your unique reference automatically so we can match the payment.
              </p>
            </div>

            {error && (
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "#ff6b6b", background: "#1a0000", border: "1px solid #3a0000", borderRadius: 8, padding: "10px 14px" }}>
                {error}
              </p>
            )}

            <button
              onClick={handleSentPayment}
              disabled={loading || !bank}
              style={{
                width: "100%",
                background: (loading || !bank) ? "#333" : "#FFD700",
                color: (loading || !bank) ? "#666" : "#000",
                border: "none",
                borderRadius: 100,
                padding: "14px 32px",
                fontSize: 15,
                fontWeight: 700,
                cursor: (loading || !bank) ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Registering…" : "I have sent the payment ✓"}
            </button>
          </div>
        )}

        {/* ── STEP 3: Confirmation + reference ── */}
        {step === "sent" && (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 16, padding: "36px 32px", textAlign: "center" }}>
            <p style={{ fontSize: 48, margin: "0 0 16px" }}>✅</p>
            <h1 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 700, color: "#FFF4C0" }}>
              Payment registered
            </h1>
            <p style={{ margin: "0 0 32px", fontSize: 14, color: "#666", lineHeight: 1.7 }}>
              We will confirm your £{amount} transfer within 24 hours after checking our bank app.
              Your Pro access activates automatically the moment we confirm.
            </p>

            {/* Reference box */}
            <div
              style={{
                background: "#0a0800",
                border: "1px solid #5a4a00",
                borderRadius: 12,
                padding: "20px 24px",
                marginBottom: 28,
                textAlign: "left",
              }}
            >
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "#777", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Your payment reference
              </p>
              <p style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "0.12em", color: "#FFD700" }}>
                {ref}
              </p>
              <p style={{ margin: "10px 0 0", fontSize: 12, color: "#666", lineHeight: 1.5 }}>
                Save this reference. If you have not sent the transfer yet, add this as the payment reference so we can match it to your account.
              </p>
            </div>

            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#555", lineHeight: 1.6 }}>
              Questions? Reply to your welcome email — it goes directly to the founders.
            </p>

            <a
              href="/dashboard"
              style={{
                display: "inline-block",
                background: "#FFD700",
                color: "#000",
                textDecoration: "none",
                padding: "13px 32px",
                borderRadius: 100,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Back to Dashboard →
            </a>
          </div>
        )}

      </div>
    </main>
  );
}
