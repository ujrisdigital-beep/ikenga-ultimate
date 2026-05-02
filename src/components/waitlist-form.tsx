"use client";

import { useState, useTransition } from "react";

type SubmissionState = "idle" | "success" | "error";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [message, setMessage] = useState("");
  const [honey, setHoney] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      setStatus("idle");
      setMessage("");

      try {
        const response = await fetch("/api/waitlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            source: "landing-page",
            honey,
          }),
        });

        const payload = (await response.json()) as {
          error?: string;
          message?: string;
        };

        if (!response.ok) {
          setStatus("error");
          setMessage(
            payload.error ??
              "Something went wrong while joining the waitlist."
          );
          return;
        }

        setStatus("success");
        setMessage(
          payload.message ??
            "You're in. We'll reach out with early-access details soon."
        );
        setEmail("");
        setHoney("");
      } catch {
        setStatus("error");
        setMessage(
          "We couldn't submit your email right now. Please try again in a moment."
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your best email"
          className="flex-1 rounded-full border border-amber-300/20 bg-neutral-950/90 px-6 py-3 text-sm text-white outline-none transition focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/50"
        />
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={honey}
          onChange={(event) => setHoney(event.target.value)}
          className="hidden"
          aria-hidden="true"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[#FFD700] px-7 py-3 text-sm font-semibold text-black transition-all hover:scale-[1.02] hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Joining..." : "Get Early Access"}
        </button>
      </div>
      <p
        aria-live="polite"
        className={`mt-4 min-h-6 text-sm ${
          status === "error" ? "text-rose-300" : "text-emerald-300"
        }`}
      >
        {message}
      </p>
    </form>
  );
}
