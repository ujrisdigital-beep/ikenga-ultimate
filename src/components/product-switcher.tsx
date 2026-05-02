"use client";

import { PRODUCTS, PRODUCT_IDS, type ProductId } from "@/src/ikenga/products/config";

interface Props {
  active:   ProductId;
  onChange: (id: ProductId) => void;
}

export function ProductSwitcher({ active, onChange }: Props) {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 4,
        background: "#0a0a0a",
        border: "1px solid #1e1e1e",
        borderRadius: 12,
        padding: 4,
      }}
    >
      {PRODUCT_IDS.map(id => {
        const p       = PRODUCTS[id];
        const isActive = id === active;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            title={p.tagline}
            style={{
              background: isActive ? p.bgColor : "transparent",
              border:     isActive ? `1px solid ${p.borderColor}` : "1px solid transparent",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              color:   isActive ? p.color : "#444",
              cursor: "pointer",
              letterSpacing: "0.06em",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {id}
          </button>
        );
      })}
    </div>
  );
}
