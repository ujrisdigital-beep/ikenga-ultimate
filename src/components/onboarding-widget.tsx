"use client";

import { useState } from "react";

interface OnboardingData {
  current_step:   number;
  completed_days: Record<string, string>;
  referral_code:  string | null;
}

interface Props {
  data:     OnboardingData;
  onAdvance: (step: number) => void;
}

const STEPS = [
  { day: 1, title: "Choose your product",       cta: "Get started",         done: "Brand survey complete" },
  { day: 2, title: "First generation unlocked", cta: "Run your first gen →", done: "First content generated" },
  { day: 3, title: "Your content is ready",     cta: "View in gallery",      done: "Content reviewed" },
  { day: 4, title: "Share your first post",      cta: "I shared it (+1 gen)", done: "+1 free gen earned" },
  { day: 5, title: "Invite a friend",            cta: "Copy invite link",     done: "+3 gens earned" },
  { day: 6, title: "You're on a streak!",        cta: "Keep going →",         done: "Streak achieved" },
  { day: 7, title: "Limited-time upgrade offer", cta: "Upgrade to Pro →",     done: "Offer seen" },
];

export function OnboardingWidget({ data, onAdvance }: Props) {
  const [copied, setCopied] = useState(false);
  const total    = STEPS.length;
  const done     = Object.keys(data.completed_days).length;
  const pct      = Math.round((done / total) * 100);
  const curStep  = data.current_step;

  if (done >= total) return null; // Onboarding complete — hide widget

  const step = STEPS.find(s => s.day === curStep) ?? STEPS[0];
  const isDone = !!data.completed_days[String(curStep)];

  async function handleCta() {
    if (curStep === 5 && data.referral_code) {
      const url = `${window.location.origin}/?ref=${data.referral_code}`;
      await navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    if (curStep === 7) {
      window.location.href = "/pay";
      return;
    }
    onAdvance(curStep);
  }

  return (
    <div
      style={{
        background: "#0a0800",
        border: "1px solid #3a3000",
        borderRadius: 14,
        padding: "18px 20px",
        marginBottom: 20,
      }}
    >
      {/* Progress bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ margin: 0, fontSize: 12, color: "#FFD700", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          7-Day Onboarding · Day {curStep}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{done}/{total} complete</p>
      </div>

      <div style={{ height: 4, background: "#1a1a00", borderRadius: 100, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#FFD700", borderRadius: 100, transition: "width 0.4s ease" }} />
      </div>

      {/* Step dots */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {STEPS.map(s => {
          const isComplete = !!data.completed_days[String(s.day)];
          const isCurrent  = s.day === curStep;
          return (
            <div
              key={s.day}
              style={{
                flex: 1, height: 4, borderRadius: 100,
                background: isComplete ? "#FFD700" : isCurrent ? "#5a4a00" : "#1a1a1a",
                transition: "background 0.2s",
              }}
            />
          );
        })}
      </div>

      {/* Current step */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <p style={{ margin: 0, fontSize: 14, color: "#FFF4C0", fontWeight: 600 }}>
          {isDone ? step.done : step.title}
        </p>
        {!isDone && (
          <button
            onClick={handleCta}
            style={{
              background: "#FFD700", color: "#000", border: "none",
              borderRadius: 100, padding: "8px 16px",
              fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            {curStep === 5 && copied ? "Copied! ✓" : step.cta}
          </button>
        )}
        {isDone && curStep < 7 && (
          <span style={{ fontSize: 12, color: "#4ade80" }}>✓ Done</span>
        )}
      </div>

      {curStep === 7 && !isDone && (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#888" }}>
          Pro access · £19/month or £49 lifetime · Offer valid for early adopters only.
        </p>
      )}
    </div>
  );
}
