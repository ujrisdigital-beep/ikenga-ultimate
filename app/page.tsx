import Image from "next/image";
import { WaitlistForm } from "@/src/components/waitlist-form";
import { LiveDemo } from "@/src/components/live-demo";
import { ProductDemo } from "@/src/components/product-demo";

const output = [
  { n: "14", label: "Platform-ready social posts" },
  { n: "7",  label: "Video scripts" },
  { n: "7",  label: "Email sequences" },
  { n: "3",  label: "Conversion ads" },
  { n: "1",  label: "7-day content calendar" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_-10%,rgba(234,179,8,0.22),transparent_60%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-12 pt-6 sm:px-8 sm:pt-8">

        {/* ── Header ── */}
        <header className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logos/ikenga-ai-logo-transparent.png" alt="IKENGA Logo" width={52} height={52} priority className="object-contain" />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-xl font-semibold tracking-[0.18em] text-[#FFD700] sm:text-2xl">IKENGA</span>
              <span className="text-[11px] uppercase tracking-[0.22em] text-gray-400">Chi in Motion</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-medium text-white/70 transition-all hover:border-[#FFD700]/30 hover:text-white/90">
              Dashboard →
            </a>
            <div className="rounded-full border border-amber-300/15 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-amber-100/80 backdrop-blur">
              Private Beta Open
            </div>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="flex flex-1 flex-col justify-center py-12 sm:py-16">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16">

            <div className="flex-1">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#FFD700]/15 bg-white/5 px-4 py-2 text-sm text-amber-100/85 backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#FFD700]" />
                Four products. One platform. Unlimited brand momentum.
              </div>

              <h1 className="max-w-2xl text-5xl font-bold leading-[0.92] tracking-tight text-[#FFF4C0] sm:text-6xl lg:text-7xl">
                Power your destiny
                <span className="mt-2 block bg-linear-to-r from-[#FFD700] via-[#FFE89A] to-[#FFD700] bg-clip-text text-transparent">
                  across every platform.
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-lg leading-8 text-stone-300">
                IKENGA is a unified creative operating platform — four products, four brand voices, one shared engine. Founders, agencies, and creators use it to generate a full week of content in one run.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <a href="#waitlist" className="inline-flex items-center justify-center rounded-full bg-[#FFD700] px-8 py-4 text-base font-semibold text-black transition-all hover:scale-[1.02] hover:bg-yellow-400">
                  Join Early Access
                </a>
                <a href="#products" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-white/90 transition-all hover:border-[#FFD700]/30 hover:bg-white/10">
                  See All Products →
                </a>
              </div>
            </div>

            <div className="relative flex flex-shrink-0 items-center justify-center lg:w-[420px]">
              <div className="absolute h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,140,0,0.2)_0%,rgba(180,60,0,0.1)_45%,transparent_70%)]" />
              <div className="absolute h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(255,180,0,0.25),transparent_70%)]" />
              <div className="relative h-[380px] w-[380px]">
                <Image
                  src="/logos/ikenga-ai-logo-transparent.png"
                  alt="IKENGA AI"
                  fill priority
                  className="object-contain [filter:drop-shadow(0_0_40px_rgba(255,160,0,0.8))_drop-shadow(0_0_80px_rgba(255,100,0,0.4))]"
                />
              </div>
            </div>

          </div>
        </section>

        {/* ── Four products demo ── */}
        <section id="products" className="mx-auto w-full max-w-6xl border-t border-white/8 py-16">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.3em] text-[#FFD700]/85">Four products</p>
            <h2 className="mt-4 text-4xl font-bold text-[#FFF4C0] sm:text-5xl">
              Every brand voice, covered.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-stone-300">
              Toggle between products and see how the same engine writes in completely different voices — all within your shared account.
            </p>
          </div>
          <ProductDemo />
        </section>

        {/* ── What one run produces ── */}
        <section className="mx-auto w-full max-w-6xl border-t border-white/8 py-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-[#FFD700]/85">One generation run</p>
              <h2 className="mt-4 text-4xl font-bold text-[#FFF4C0] sm:text-5xl">A full week ready to publish.</h2>
              <p className="mt-4 text-lg leading-8 text-stone-300">
                Enter your brand, goals, and tone. IKENGA produces everything your brand needs for the next 7 days — platform-formatted, in your voice, cards ready to copy and post.
              </p>
            </div>
            <div className="grid gap-3">
              {output.map(o => (
                <div key={o.label} className="flex items-center gap-5 rounded-2xl border border-white/8 bg-white/4 px-5 py-4">
                  <span className="text-3xl font-bold text-[#FFD700]">{o.n}</span>
                  <span className="text-sm text-stone-300">{o.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Live UJU engine demo ── */}
        <section id="demo" className="mx-auto w-full max-w-6xl border-t border-white/8 py-16">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.3em] text-[#FFD700]/85">Live engine — no login needed</p>
            <h2 className="mt-4 text-4xl font-bold text-[#FFF4C0] sm:text-5xl">Try it right now.</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-stone-300">
              Paste any brand idea or content goal. The UJU Cycle™ engine extracts the signal and returns a focused action — live.
            </p>
          </div>
          <LiveDemo />
        </section>

        {/* ── Audiences ── */}
        <section className="mx-auto grid w-full max-w-6xl gap-8 border-t border-white/8 py-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#FFD700]/85">Built For</p>
            <h2 className="mt-4 text-4xl font-bold text-[#FFF4C0] sm:text-5xl">Teams that cannot afford to sound generic</h2>
          </div>
          <div className="grid gap-4">
            {[
              { title: "Creators",          desc: "Stay visible without sacrificing your voice every time content pressure spikes." },
              { title: "Agencies",          desc: "Scale client content with sharper memory, faster drafts, distinct voices per client." },
              { title: "Founder-led brands",desc: "Turn scattered insight into a repeatable public presence that actually sounds like leadership." },
            ].map(a => (
              <div key={a.title} className="rounded-3xl border border-white/10 bg-white/4 p-6">
                <h3 className="text-xl font-semibold text-[#FFD700]">{a.title}</h3>
                <p className="mt-2 text-sm leading-7 text-stone-300">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Waitlist ── */}
        <section id="waitlist" className="mx-auto w-full max-w-6xl border-t border-white/8 py-16">
          <div className="rounded-[36px] border border-[#FFD700]/12 bg-[linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,255,255,0.03))] p-8 backdrop-blur md:p-10">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#FFD700]/85">Early Access</p>
                <h2 className="mt-4 text-4xl font-bold text-[#FFF4C0] sm:text-5xl">Be early. Stay ahead.</h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-300">
                  Join the waitlist. Get your login link. Start with 3 free generations — no card required. Upgrade when you are ready.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm text-amber-100/80">
                  <span className="rounded-full border border-amber-300/15 px-4 py-2">3 free generations</span>
                  <span className="rounded-full border border-amber-300/15 px-4 py-2">All 4 products included</span>
                  <span className="rounded-full border border-amber-300/15 px-4 py-2">First in, first served</span>
                </div>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-black/30 p-6">
                <WaitlistForm />
                <p className="mt-4 text-center text-xs text-stone-600">
                  Already signed up?{" "}
                  <a href="/login" className="text-[#FFD700] no-underline hover:underline">Access your dashboard →</a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="mx-auto mt-auto flex w-full max-w-6xl flex-col gap-3 border-t border-white/8 py-8 text-sm text-stone-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 IKENGA AI. Chi in Motion.</p>
          <p>Built for brands, agencies, and creators who refuse to move small.</p>
        </footer>
      </div>
    </main>
  );
}
