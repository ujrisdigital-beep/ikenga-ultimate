"use client";

import { useState } from "react";
import { PRODUCTS, PRODUCT_IDS, type ProductId } from "@/src/ikenga/products/config";

export function ProductDemo() {
  const [active, setActive] = useState<ProductId>("IKENGA");
  const [tab,    setTab]    = useState(0);

  const p       = PRODUCTS[active];
  const samples = p.sampleOutputs;

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,sans-serif" }}>
      {/* Product tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#050505", border: "1px solid #111", borderRadius: 12, padding: 4, width: "fit-content" }}>
        {PRODUCT_IDS.map(id => {
          const pr = PRODUCTS[id];
          const isActive = id === active;
          return (
            <button
              key={id}
              onClick={() => { setActive(id); setTab(0); }}
              style={{
                background: isActive ? pr.bgColor : "transparent",
                border: isActive ? `1px solid ${pr.borderColor}` : "1px solid transparent",
                borderRadius: 8, padding: "10px 20px",
                fontSize: 13, fontWeight: 700,
                color: isActive ? pr.color : "#444",
                cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.06em",
              }}
            >
              {id}
            </button>
          );
        })}
      </div>

      {/* Product info */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: p.color }}>{p.tagline}</p>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#666", lineHeight: 1.5 }}>{p.description}</p>
      </div>

      {/* Sample selector tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {samples.map((s, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            style={{
              background: tab === i ? p.bgColor : "transparent",
              border: `1px solid ${tab === i ? p.borderColor : "#1e1e1e"}`,
              borderRadius: 100, padding: "5px 14px",
              fontSize: 11, fontWeight: tab === i ? 700 : 400,
              color: tab === i ? p.color : "#444",
              cursor: "pointer", letterSpacing: "0.04em",
            }}
          >
            {s.type}
          </button>
        ))}
      </div>

      {/* Sample output */}
      <div
        style={{
          background: "#050505",
          border: `1px solid ${p.borderColor}`,
          borderRadius: 14,
          padding: "22px 24px",
          minHeight: 120,
          transition: "border-color 0.2s",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "#555" }}>
            {samples[tab]?.label}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: p.color, background: p.bgColor, border: `1px solid ${p.borderColor}`, borderRadius: 4, padding: "2px 8px" }}>
            {active}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 15, color: "#FFF4C0", lineHeight: 1.75 }}>
          {samples[tab]?.preview}
        </p>
      </div>

      {/* Tone label */}
      <p style={{ margin: "12px 0 0", fontSize: 12, color: "#444" }}>
        Tone: <span style={{ color: "#666" }}>{p.tone}</span>
      </p>
    </div>
  );
}
