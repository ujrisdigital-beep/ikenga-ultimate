"use client";

import { useState } from "react";

interface RefineResult {
  refined?: string;
  error?: string;
}

const EXAMPLES = [
  {
    label: "Brand pitch",
    input: "We sell handmade candles from Lagos using natural shea butter. We want to grow on Instagram.",
  },
  {
    label: "Content hook",
    input: "Post idea: why most founders are invisible online even when they have a great product.",
  },
  {
    label: "Campaign goal",
    input: "Launch a new skincare line targeting Nigerian women aged 25-40 who care about clean ingredients.",
  },
];

export function LiveDemo() {
  const [input,   setInput]   = useState("");
  const [result,  setResult]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [used,    setUsed]    = useState(false);

  async function runRefine(text: string) {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult("");
    setInput(text);

    try {
      const res = await fetch("/api/uju/refine", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ input: text.trim() }),
      });
      const data = await res.json() as RefineResult;

      if (!res.ok || data.error) {
        setError("The engine is warming up. Try again in a moment.");
        return;
      }

      setResult(data.refined ?? "");
      setUsed(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "#0a0a0a",
        border: "1px solid #1e1e1e",
        borderRadius: 20,
        padding: "32px 28px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span
            style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#FFD700",
              display: "inline-block",
              boxShadow: "0 0 8px rgba(255,215,0,0.6)",
            }}
          />
          <p style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", color: "#FFD700" }}>
            UJU Cycle™ — Live
          </p>
        </div>
        <p style={{ margin: 0, fontSize: 15, color: "#888", lineHeight: 1.5 }}>
          Paste any brand idea, goal, or post concept. IKENGA refines it into a focused action.
        </p>
      </div>

      {/* Quick-fill examples */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {EXAMPLES.map(ex => (
          <button
            key={ex.label}
            onClick={() => runRefine(ex.input)}
            disabled={loading}
            style={{
              background: "transparent",
              border: "1px solid #2a2a2a",
              borderRadius: 100,
              padding: "5px 14px",
              fontSize: 11,
              color: "#666",
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.04em",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#FFD700";
              (e.currentTarget as HTMLButtonElement).style.color = "#FFD700";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2a";
              (e.currentTarget as HTMLButtonElement).style.color = "#666";
            }}
          >
            Try: {ex.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Describe your brand, goal, or content idea…"
          rows={3}
          style={{
            flex: 1,
            background: "#050505",
            border: "1px solid #222",
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 14,
            color: "#ccc",
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
            lineHeight: 1.6,
          }}
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) runRefine(input);
          }}
        />
        <button
          onClick={() => runRefine(input)}
          disabled={loading || !input.trim()}
          style={{
            background: (loading || !input.trim()) ? "#1a1a1a" : "#FFD700",
            color:      (loading || !input.trim()) ? "#444"    : "#000",
            border: "none",
            borderRadius: 10,
            padding: "12px 20px",
            fontSize: 14,
            fontWeight: 700,
            cursor: (loading || !input.trim()) ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            transition: "background 0.15s",
          }}
        >
          {loading ? "…" : "Run →"}
        </button>
      </div>
      <p style={{ margin: "6px 0 0", fontSize: 11, color: "#333" }}>⌘ + Enter to run</p>

      {/* Loading state */}
      {loading && (
        <div style={{ marginTop: 20, padding: "16px", background: "#050505", border: "1px solid #1a1a1a", borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFD700", display: "inline-block", animation: "pulse 1s infinite" }} />
            <p style={{ margin: 0, fontSize: 13, color: "#555" }}>UJU Cycle running — extracting signal, prioritising action…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <p style={{ margin: "16px 0 0", fontSize: 13, color: "#f87171", background: "#1a0000", border: "1px solid #3a0000", borderRadius: 8, padding: "10px 14px" }}>
          {error}
        </p>
      )}

      {/* Result */}
      {result && !loading && (
        <div
          style={{
            marginTop: 20,
            background: "#050505",
            border: "1px solid #2a2a00",
            borderRadius: 12,
            padding: "20px 22px",
          }}
        >
          <p style={{ margin: "0 0 10px", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#555" }}>
            Refined output
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              color: "#FFF4C0",
              lineHeight: 1.75,
              whiteSpace: "pre-wrap",
            }}
          >
            {result}
          </p>

          {used && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#555" }}>
                The full engine produces 14 posts, 7 video scripts, 7 emails, 3 ads + calendar.
              </p>
              <a
                href="#waitlist"
                style={{
                  background: "#FFD700", color: "#000", textDecoration: "none",
                  padding: "9px 20px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                }}
              >
                Get early access →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
