"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [name, setName]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim(), displayName: name.trim() }),
      });
      const data = await res.json() as { success?: boolean; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "0.18em", color: "#FFD700" }}>
            IKENGA
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.22em", color: "#555" }}>
            Chi in Motion
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "#111",
            border: "1px solid #222",
            borderRadius: 16,
            padding: "40px 36px",
          }}
        >
          <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, color: "#FFF4C0" }}>
            Access your dashboard
          </h1>
          <p style={{ margin: "0 0 32px", fontSize: 14, color: "#666", lineHeight: 1.6 }}>
            Enter the email you used to join the waitlist.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#777", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Your name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Jill"
                style={{
                  width: "100%",
                  background: "#0a0a0a",
                  border: "1px solid #333",
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontSize: 15,
                  color: "#fff",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, color: "#777", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Waitlist email *
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  background: "#0a0a0a",
                  border: "1px solid #333",
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontSize: 15,
                  color: "#fff",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            {error && (
              <p style={{ margin: 0, fontSize: 13, color: "#ff6b6b", background: "#1a0000", border: "1px solid #3a0000", borderRadius: 8, padding: "10px 14px" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                background: loading ? "#555" : "#FFD700",
                color: "#000",
                border: "none",
                borderRadius: 100,
                padding: "14px 32px",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
              }}
            >
              {loading ? "Signing in…" : "Enter Dashboard →"}
            </button>
          </form>

          <p style={{ margin: "24px 0 0", fontSize: 13, color: "#444", textAlign: "center" }}>
            Not on the waitlist?{" "}
            <a href="/" style={{ color: "#FFD700", textDecoration: "none" }}>
              Sign up here →
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
