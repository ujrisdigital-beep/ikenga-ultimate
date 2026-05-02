"use client";

import { useState, useCallback } from "react";
import { PRODUCTS, type ProductId } from "@/src/ikenga/products/config";

export interface ContentItem {
  id:           string;
  product:      string;
  content_type: string;
  title:        string;
  body:         string;
  platform:     string | null;
  day:          number | null;
  quality:      string;
  published:    boolean;
  copied:       boolean;
  metadata:     { hashtags?: string[] };
  created_at:   string;
}

interface Props {
  items:      ContentItem[];
  onRefresh:  () => void;
}

// ── Helpers ──────────────────────────────────────────────────

const TYPE_ICONS: Record<string, string> = {
  social_post:   "✦",
  video_script:  "▶",
  email:         "✉",
  ad:            "◈",
  carousel:      "▣",
};

const TYPE_LABELS: Record<string, string> = {
  social_post:   "Social Post",
  video_script:  "Video Script",
  email:         "Email",
  ad:            "Ad",
  carousel:      "Carousel",
};

const QUALITY_COLORS: Record<string, string> = {
  A: "#4ade80",
  B: "#FFD700",
  C: "#fb923c",
  D: "#f87171",
};

const TABS = ["All", "Social Posts", "Video Scripts", "Emails", "Ads"];
const TAB_TYPES: Record<string, string | null> = {
  "All":          null,
  "Social Posts": "social_post",
  "Video Scripts":"video_script",
  "Emails":       "email",
  "Ads":          "ad",
};

// Build share URLs (deep link pre-fills, not real OAuth)
function buildShareUrls(item: ContentItem): { linkedin: string; x: string } {
  const text = encodeURIComponent(`${item.title}\n\n${item.body.slice(0, 240)}`);
  return {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?summary=${text}`,
    x:        `https://twitter.com/intent/tweet?text=${text}`,
  };
}

// ── Card component ────────────────────────────────────────────

function ContentCard({ item, onAction }: { item: ContentItem; onAction: (id: string, field: "copied" | "published") => void }) {
  const [expanded,  setExpanded]  = useState(false);
  const [feedback,  setFeedback]  = useState<"up" | "down" | null>(null);
  const [copying,   setCopying]   = useState(false);
  const product = PRODUCTS[(item.product as ProductId)] ?? PRODUCTS.IKENGA;
  const share   = buildShareUrls(item);

  async function handleFeedback(signal: "up" | "down") {
    setFeedback(signal);
    await fetch("/api/feedback", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ itemId: item.id, signal, product: item.product }),
    });
  }

  async function handleCopy() {
    setCopying(true);
    const text = [item.title, "", item.body, ...(item.metadata?.hashtags ?? [])].join("\n");
    await navigator.clipboard.writeText(text).catch(() => {});
    onAction(item.id, "copied");
    setTimeout(() => setCopying(false), 1500);
  }

  return (
    <div
      style={{
        background: "#0a0a0a",
        border: `1px solid ${expanded ? product.borderColor : "#1e1e1e"}`,
        borderRadius: 14,
        padding: "18px 20px",
        transition: "border-color 0.2s",
        cursor: "default",
      }}
    >
      {/* Card header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 1, minWidth: 0 }}>
          {/* Type icon */}
          <span
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: product.bgColor, border: `1px solid ${product.borderColor}`,
              fontSize: 14, color: product.color,
            }}
          >
            {TYPE_ICONS[item.content_type] ?? "·"}
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {TYPE_LABELS[item.content_type] ?? item.content_type}
              {item.platform && ` · ${item.platform}`}
              {item.day && ` · Day ${item.day}`}
            </p>
            <p style={{ margin: "3px 0 0", fontSize: 14, fontWeight: 600, color: "#FFF4C0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.title}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Quality badge */}
          <span
            style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              color: QUALITY_COLORS[item.quality] ?? "#888",
              border: `1px solid ${QUALITY_COLORS[item.quality] ?? "#333"}`,
              borderRadius: 6, padding: "2px 7px",
            }}
          >
            {item.quality}
          </span>
          {/* Product badge */}
          <span style={{ fontSize: 10, color: product.color, fontWeight: 700, letterSpacing: "0.1em" }}>
            {item.product}
          </span>
        </div>
      </div>

      {/* Preview */}
      <p
        style={{
          margin: "12px 0 0",
          fontSize: 13,
          color: "#888",
          lineHeight: 1.6,
          display: "-webkit-box",
          WebkitLineClamp: expanded ? undefined : 3,
          WebkitBoxOrient: "vertical" as const,
          overflow: expanded ? "visible" : "hidden",
          whiteSpace: "pre-wrap",
        }}
      >
        {item.body}
      </p>

      {item.metadata?.hashtags && item.metadata.hashtags.length > 0 && expanded && (
        <p style={{ margin: "8px 0 0", fontSize: 11, color: "#444" }}>
          {item.metadata.hashtags.join(" ")}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ background: "transparent", border: "1px solid #222", borderRadius: 7, padding: "5px 12px", fontSize: 12, color: "#666", cursor: "pointer" }}
        >
          {expanded ? "Collapse" : "Expand"}
        </button>

        <button
          onClick={handleCopy}
          style={{
            background: copying ? "#1a2a1a" : "transparent",
            border: `1px solid ${copying ? "#2a4a2a" : "#222"}`,
            borderRadius: 7, padding: "5px 12px", fontSize: 12,
            color: copying ? "#4ade80" : "#888", cursor: "pointer",
          }}
        >
          {copying ? "Copied ✓" : "Copy"}
        </button>

        {/* Publish deep links */}
        <a
          href={share.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          style={{ background: "transparent", border: "1px solid #222", borderRadius: 7, padding: "5px 12px", fontSize: 12, color: "#60a5fa", cursor: "pointer", textDecoration: "none" }}
          onClick={() => onAction(item.id, "published")}
        >
          LinkedIn →
        </a>
        <a
          href={share.x}
          target="_blank"
          rel="noopener noreferrer"
          style={{ background: "transparent", border: "1px solid #222", borderRadius: 7, padding: "5px 12px", fontSize: 12, color: "#9ca3af", cursor: "pointer", textDecoration: "none" }}
          onClick={() => onAction(item.id, "published")}
        >
          X →
        </a>

        {/* Feedback */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {(["up", "down"] as const).map(s => (
            <button
              key={s}
              onClick={() => handleFeedback(s)}
              style={{
                background: feedback === s ? (s === "up" ? "#1a2a1a" : "#2a1a1a") : "transparent",
                border: `1px solid ${feedback === s ? (s === "up" ? "#2a4a2a" : "#4a2a2a") : "#1e1e1e"}`,
                borderRadius: 7, padding: "5px 10px",
                fontSize: 13, cursor: "pointer",
                color: feedback === s ? (s === "up" ? "#4ade80" : "#f87171") : "#444",
              }}
              title={s === "up" ? "Good content" : "Needs improvement"}
            >
              {s === "up" ? "👍" : "👎"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Gallery ───────────────────────────────────────────────────

export function ContentGallery({ items, onRefresh }: Props) {
  const [tab,   setTab]   = useState("All");
  const [local, setLocal] = useState<ContentItem[]>(items);

  // Keep local in sync when items prop changes
  if (items !== local && items.length !== local.length) setLocal(items);

  const filtered = local.filter(i => {
    const t = TAB_TYPES[tab];
    return t === null || i.content_type === t;
  });

  const handleAction = useCallback(async (id: string, field: "copied" | "published") => {
    setLocal(prev => prev.map(i => i.id === id ? { ...i, [field]: true } : i));
    await fetch("/api/content", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id, field, value: true }),
    });
  }, []);

  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <p style={{ fontSize: 32, margin: "0 0 12px" }}>✦</p>
        <p style={{ margin: 0, fontSize: 15, color: "#FFF4C0" }}>No content yet</p>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#444" }}>Run your first generation above to fill this gallery.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20, justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? "#FFD700" : "transparent",
                color:      tab === t ? "#000"    : "#555",
                border:     tab === t ? "none"    : "1px solid #1e1e1e",
                borderRadius: 100, padding: "5px 14px",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >
              {t} {t === "All" ? `(${local.length})` : ""}
            </button>
          ))}
        </div>
        <button onClick={onRefresh} style={{ background: "transparent", border: "1px solid #1e1e1e", borderRadius: 8, padding: "5px 12px", fontSize: 11, color: "#444", cursor: "pointer" }}>
          Refresh ↻
        </button>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(item => (
          <ContentCard key={item.id} item={item} onAction={handleAction} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "#444", fontSize: 13, padding: "20px 0" }}>
          No {tab.toLowerCase()} content yet.
        </p>
      )}
    </div>
  );
}
