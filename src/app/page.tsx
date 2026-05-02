'use client';

import { useState, useRef } from 'react';

/* ─── Design tokens ──────────────────────────────────────────────────── */
const BG      = '#080602';
const CARD    = '#0e0b05';
const GOLD    = '#D4AF37';
const BGOLD   = 'rgba(212,175,55,0.10)';
const BGOLD2  = 'rgba(212,175,55,0.17)';
const BGOLD_B = 'rgba(212,175,55,0.22)';
const BORDER  = 'rgba(255,255,255,0.065)';
const GRAY    = 'rgba(255,255,255,0.55)';
const SERIF   = "'Playfair Display', Georgia, serif";
const SANS    = "'Inter', system-ui, sans-serif";

/* ─── Data ───────────────────────────────────────────────────────────── */
const PRODUCTS = [
  {
    id: 'ikenga', name: 'IKENGA', tagline: 'Your Chi in Motion',
    description: 'The original brand momentum engine. Authentic entrepreneurial fire for brands that refuse to move small.',
    tone: 'bold, authentic, momentum-driven, entrepreneurial, unapologetic',
    sample: 'Most brands post. Few brands move. The difference is not budget — it is Chi. Your audience can feel when content is manufactured. They can also feel when it is alive. We help you stay alive.',
    accent: GOLD, formats: ['Social post', 'Email subject', 'Video hook'],
  },
  {
    id: 'juo', name: 'JUO', tagline: 'Fresh Energy. Viral Reach.',
    description: 'Playful, energetic, and culturally resonant. Built for brands that want to trend without losing substance.',
    tone: 'playful, energetic, trendy, culturally resonant, high-impact',
    sample: "This one's for the builders who eat setbacks for breakfast 🔥 We don't pivot — we level up. Your next chapter hits different when the energy is right.",
    accent: '#A78BFA', formats: ['TikTok caption', 'Reel hook', 'Trending audio'],
  },
  {
    id: 'oba', name: 'OBA', tagline: 'The Royal Standard',
    description: 'Premium, dignified, and aspirational. For brands that lead from the front without raising their voice.',
    tone: 'royal, dignified, premium, aspirational, sophisticated',
    sample: 'Excellence is not a strategy. It is a standard. The brands that endure are those that never confused noise with authority.',
    accent: '#F59E0B', formats: ['LinkedIn post', 'Executive statement', 'Brand authority'],
  },
  {
    id: 'omenala', name: 'OMENALA', tagline: 'Rooted. Grounded. Timeless.',
    description: 'Traditional wisdom meets modern brand expression. For brands with cultural roots and a message that transcends trend.',
    tone: 'traditional, spiritual, grounding, warm, contemplative',
    sample: 'Before the noise, there was a story. Before the brand, there was a purpose. Our ancestors knew that the most powerful thing you can do is speak from truth.',
    accent: '#34D399', formats: ['Email newsletter', 'Brand story', 'Cultural post'],
  },
  {
    id: 'icheoku', name: 'ICHEOKU', tagline: 'Data. Precision. Dominance.',
    description: 'Analytical intelligence for brands that lead with evidence. Strategic, methodical, and surgical — every word earns its place.',
    tone: 'analytical, precise, strategic, data-driven, methodical',
    sample: 'Market penetration at 23% above sector average is not luck — it is the compounding effect of 17 micro-decisions your competitors skipped. We identify the gaps. We close them.',
    accent: '#60A5FA', formats: ['Market analysis', 'Strategy post', 'Data narrative'],
  },
];

const STATS = [
  { number: '18', label: 'Platforms covered in one generation run' },
  { number: '5',  label: 'Brand voices — IKENGA · JUO · OBA · OMENALA · ICHEOKU' },
  { number: '∞',  label: 'Videos, carousels & posts — preview and edit before posting' },
  { number: '30', label: 'Days of content scheduled in one session (7 / 14 / 30)' },
  { number: '1',  label: 'Brand DNA engine — every piece is unmistakably yours' },
];

const BUILT_FOR = [
  { title: 'Creators',           body: 'Stay visible without sacrificing your voice every time content pressure spikes.' },
  { title: 'Agencies',           body: 'Scale client content with sharper memory, faster drafts, distinct voices per client.' },
  { title: 'Founder-led brands', body: 'Turn scattered insight into a repeatable public presence that actually sounds like leadership.' },
];

const EXAMPLE_PROMPTS: Record<string, string> = {
  'Brand pitch':   'Write a brand pitch for a premium African skincare brand entering the UK market for the first time.',
  'Content hook':  'Create a content hook for a founder-led B2B SaaS company that helps small businesses manage payroll.',
  'Campaign goal': 'Launch a 7-day awareness campaign for an African fashion label releasing its first international collection.',
};

const UJU_SECTIONS = [
  { key: 'executive_summary',           num: '01', title: 'Executive Summary',           sub: 'Consensus Diagnostic',      dayTitle: 'The Diagnosis'  },
  { key: 'market_context',              num: '02', title: 'Market Context',              sub: 'Multi-Persona Landscape',   dayTitle: 'The Landscape'  },
  { key: 'single_most_powerful_action', num: '03', title: 'Single Most Powerful Action', sub: 'The Final Verdict',         dayTitle: 'The Move'       },
  { key: 'seven_day_plan',              num: '04', title: '7-Day Execution Plan',        sub: 'The Integrated Roadmap',    dayTitle: 'The Roadmap'    },
  { key: 'resources_and_budget',        num: '05', title: 'Resources & Budget',          sub: 'Tiered Implementation',     dayTitle: 'The Toolkit'    },
  { key: 'success_metrics',             num: '06', title: 'Success Metrics',             sub: 'High-Stake KPIs',           dayTitle: 'The Scorecard'  },
  { key: 'risks_and_mitigations',       num: '07', title: 'Risks & Mitigations',         sub: 'Aggregated Gap Closures',   dayTitle: 'The Defense'    },
  { key: 'what_most_people_miss',       num: '08', title: 'What Most People Miss',       sub: 'The Tyler Wise Edge',       dayTitle: 'The Edge'       },
  { key: 'next_step',                   num: '09', title: 'Next Step',                   sub: 'Initiating Forward Motion', dayTitle: 'The Action'     },
];

/* ─── Schedule builder ───────────────────────────────────────────────── */
type ScheduleDay = {
  day: number; date: string; dayName: string;
  title: string; sectionTitle: string; content: string; preview: string;
};

function buildSchedule(content: Record<string, string>, days: 7 | 14 | 30): ScheduleDay[] {
  const today = new Date();
  const DN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const rounds = ['', ' · Deeper Dive', ' · Distribution Push', ' · Bonus'];
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    const sec = UJU_SECTIONS[i % 9];
    const round = Math.floor(i / 9);
    const text = content[sec.key] || '';
    return {
      day: i + 1,
      date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      dayName: DN[d.getDay()],
      title: sec.dayTitle + (rounds[round] ?? rounds[3]),
      sectionTitle: sec.title,
      content: text,
      preview: text.length > 130 ? text.slice(0, 130) + '…' : text,
    };
  });
}

/* ─── Logo ───────────────────────────────────────────────────────────── */
function IkengaLogo({ size = 280 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 280 336" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gH" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#7a5c10"/>
          <stop offset="25%"  stopColor="#D4AF37"/>
          <stop offset="55%"  stopColor="#F5C842"/>
          <stop offset="80%"  stopColor="#D4AF37"/>
          <stop offset="100%" stopColor="#7a5c10"/>
        </linearGradient>
        <linearGradient id="gV" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#F5C842"/>
          <stop offset="50%"  stopColor="#D4AF37"/>
          <stop offset="100%" stopColor="#7a5c10"/>
        </linearGradient>
        <radialGradient id="orb" cx="38%" cy="32%" r="60%">
          <stop offset="0%"   stopColor="#FDE68A"/>
          <stop offset="50%"  stopColor="#D4AF37"/>
          <stop offset="100%" stopColor="#7a5c10"/>
        </radialGradient>
        <linearGradient id="pDark" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#080402"/>
          <stop offset="25%"  stopColor="#1a0e08"/>
          <stop offset="50%"  stopColor="#261806"/>
          <stop offset="75%"  stopColor="#1a0e08"/>
          <stop offset="100%" stopColor="#080402"/>
        </linearGradient>
        <linearGradient id="pRed" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#3a0808"/>
          <stop offset="30%"  stopColor="#7a1515"/>
          <stop offset="55%"  stopColor="#9B1C1C"/>
          <stop offset="80%"  stopColor="#7a1515"/>
          <stop offset="100%" stopColor="#3a0808"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="soft">
          <feGaussianBlur stdDeviation="8" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <ellipse cx="140" cy="155" rx="105" ry="95" fill="rgba(212,175,55,0.05)"/>
      <path d="M100 108 C82 78 62 46 44 10"   stroke="url(#gH)" strokeWidth="15" strokeLinecap="round" fill="none" filter="url(#glow)"/>
      <path d="M180 108 C198 78 218 46 236 10" stroke="url(#gH)" strokeWidth="15" strokeLinecap="round" fill="none" filter="url(#glow)"/>
      <path d="M100 108 C82 78 62 46 44 10"   stroke="rgba(255,240,160,0.18)" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M180 108 C198 78 218 46 236 10" stroke="rgba(255,240,160,0.18)" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <rect x="72"  y="104" width="48" height="146" rx="3" fill="url(#pDark)"/>
      <rect x="72"  y="104" width="5"  height="146" rx="2" fill="url(#gV)" opacity="0.55"/>
      <rect x="115" y="104" width="5"  height="146" rx="2" fill="url(#gV)" opacity="0.18"/>
      <rect x="160" y="104" width="48" height="146" rx="3" fill="url(#pDark)"/>
      <rect x="160" y="104" width="5"  height="146" rx="2" fill="url(#gV)" opacity="0.55"/>
      <rect x="203" y="104" width="5"  height="146" rx="2" fill="url(#gV)" opacity="0.18"/>
      <rect x="116" y="90"  width="48" height="160" rx="3" fill="url(#pRed)"/>
      <rect x="116" y="90"  width="5"  height="160" rx="2" fill="url(#gV)" opacity="0.35"/>
      <rect x="159" y="90"  width="5"  height="160" rx="2" fill="rgba(255,140,140,0.1)"/>
      <circle cx="140" cy="120" r="26" fill="rgba(212,175,55,0.08)" filter="url(#soft)"/>
      <circle cx="140" cy="120" r="16" fill="rgba(212,175,55,0.18)"/>
      <circle cx="140" cy="120" r="11" fill="url(#orb)" filter="url(#glow)"/>
      <circle cx="136" cy="116" r="4"  fill="rgba(255,255,255,0.4)"/>
      <path d="M58 252 Q140 232 222 252" stroke="#7a1515" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M58 252 Q140 237 222 252" stroke="#C0392B" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55"/>
      <text x="140" y="294" textAnchor="middle" fill="url(#gH)"
        fontSize="30" fontWeight="800" letterSpacing="6"
        fontFamily="'Playfair Display', Georgia, serif">IKENGA</text>
      <text x="140" y="320" textAnchor="middle" fill="#C0392B"
        fontSize="16" fontWeight="700" letterSpacing="5"
        fontFamily="'Inter', sans-serif">AI</text>
    </svg>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────── */
export default function Home() {
  const [activeProduct, setActiveProduct] = useState('ikenga');
  const [prompt, setPrompt]               = useState('');
  const [running, setRunning]             = useState(false);
  const [sections, setSections]           = useState<Record<string, string> | null>(null);
  const [edited, setEdited]               = useState<Record<string, string>>({});
  const [editingKey, setEditingKey]       = useState<string | null>(null);
  const [copied, setCopied]               = useState('');
  const [copiedDay, setCopiedDay]         = useState<number | null>(null);
  const [error, setError]                 = useState('');
  const [email, setEmail]                 = useState('');
  const [emailDone, setEmailDone]         = useState(false);
  const [scheduleDays, setScheduleDays]   = useState<7 | 14 | 30 | null>(null);

  const engineRef = useRef<HTMLDivElement>(null);
  const activeP   = PRODUCTS.find(p => p.id === activeProduct)!;

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) =>
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const get = (key: string) =>
    edited[key] !== undefined ? edited[key] : (sections?.[key] ?? '');

  const runEngine = async () => {
    if (!prompt.trim()) { setError('Paste a brand idea or content goal to begin.'); return; }
    setError(''); setRunning(true); setSections(null);
    setEdited({}); setEditingKey(null); setScheduleDays(null); setCopied('');
    try {
      const res = await fetch('/api/uju-cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: prompt, tone: activeProduct, mode: 'strategic' }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.probe_detected) { setSections({ executive_summary: data.message }); return; }
      setSections(data.sections ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed. Try again.');
    } finally { setRunning(false); }
  };

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key); setTimeout(() => setCopied(''), 2000);
  };

  const copyDay = async (n: number, text: string) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopiedDay(n); setTimeout(() => setCopiedDay(null), 2500);
  };

  const exportSchedule = async (schedule: ScheduleDay[]) => {
    const txt = schedule.map(d =>
      `DAY ${d.day} — ${d.dayName} ${d.date}\n${d.title.toUpperCase()}\n\n${d.content}`
    ).join('\n\n' + '─'.repeat(60) + '\n\n');
    await navigator.clipboard.writeText(txt).catch(() => {});
    setCopied('export'); setTimeout(() => setCopied(''), 3000);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') runEngine();
  };

  const scheduleData: ScheduleDay[] | null =
    sections && scheduleDays
      ? buildSchedule(
          Object.fromEntries(UJU_SECTIONS.map(s => [s.key, get(s.key)])),
          scheduleDays,
        )
      : null;

  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: CARD, border: `1px solid ${BORDER}`, borderRadius: '16px', ...extra,
  });

  return (
    <div style={{ fontFamily: SANS, background: BG, color: 'white', overflowX: 'hidden' }}>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -400% center; }
          100% { background-position:  400% center; }
        }
        @keyframes goldPulse { 0%,100%{opacity:.7}50%{opacity:1} }
        @keyframes floatY { 0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)} }
        @keyframes glowPulse {
          0%,100%{box-shadow:0 0 22px rgba(212,175,55,.14),0 0 44px rgba(212,175,55,.06)}
          50%{box-shadow:0 0 32px rgba(212,175,55,.28),0 0 64px rgba(212,175,55,.1)}
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)} }
        .sg{background:linear-gradient(90deg,#7a5c10 0%,#D4AF37 25%,#F5C842 50%,#D4AF37 75%,#7a5c10 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s linear infinite}
        .gc{animation:glowPulse 3.5s ease-in-out infinite}
        .fl{animation:floatY 6s ease-in-out infinite}
        .fu{animation:fadeUp .65s ease-out forwards}
        .bg:hover{filter:brightness(1.09);transform:translateY(-1px);box-shadow:0 4px 22px rgba(212,175,55,.32)}
        .bgh:hover{background:rgba(255,255,255,.07)!important;border-color:rgba(255,255,255,.14)!important}
        .tab:hover{color:rgba(255,255,255,.8)!important;border-color:rgba(212,175,55,.4)!important}
        .sr:hover{border-color:rgba(212,175,55,.28)!important}
        .sc:hover{background:rgba(212,175,55,.03)!important}
        .dc{transition:all .22s ease}
        .dc:hover{border-color:rgba(212,175,55,.35)!important;transform:translateY(-2px)}
        textarea:focus{outline:none!important;border-color:rgba(212,175,55,.45)!important;box-shadow:0 0 0 3px rgba(212,175,55,.07)!important}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(212,175,55,.2);border-radius:4px}
      `}</style>

      <div style={{ position:'fixed', inset:0, background:'radial-gradient(ellipse 110% 55% at 50% 0%,rgba(22,14,3,.98) 0%,#080602 60%)', pointerEvents:'none', zIndex:0 }}/>

      <div style={{ position:'relative', zIndex:1 }}>

        {/* NAV */}
        <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 48px', position:'sticky', top:0, zIndex:100, background:'rgba(8,6,2,0.88)', backdropFilter:'blur(20px)', borderBottom:`1px solid rgba(212,175,55,0.1)` }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:BGOLD, border:`1px solid ${BGOLD_B}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontFamily:SERIF, color:GOLD, fontSize:'18px', fontWeight:700 }}>I</span>
            </div>
            <div>
              <div className="sg" style={{ fontFamily:SERIF, fontSize:'18px', fontWeight:700, letterSpacing:'3px', lineHeight:1 }}>IKENGA</div>
              <div style={{ fontSize:'9px', color:'rgba(212,175,55,0.4)', letterSpacing:'2.5px', marginTop:'2px' }}>CHI IN MOTION</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <a href="/studio" style={{ color:GOLD, fontSize:'13px', background:'rgba(212,175,55,0.08)', border:`1px solid rgba(212,175,55,0.28)`, borderRadius:'24px', padding:'8px 20px', cursor:'pointer', transition:'all .2s', textDecoration:'none', fontWeight:600 }}>
              Open Studio →
            </a>
            <span style={{ background:BGOLD, border:`1px solid ${BGOLD_B}`, color:GOLD, fontSize:'10px', padding:'8px 18px', borderRadius:'24px', letterSpacing:'1.5px', fontWeight:600 }}>PRIVATE BETA OPEN</span>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ display:'grid', gridTemplateColumns:'1fr 1fr', alignItems:'center', maxWidth:'1200px', margin:'0 auto', padding:'80px 48px 100px', gap:'48px', position:'relative' }}>
          <div style={{ position:'absolute', right:'5%', top:'10%', width:'420px', height:'420px', borderRadius:'50%', background:'radial-gradient(circle,rgba(212,175,55,0.1) 0%,transparent 70%)', pointerEvents:'none' }}/>
          <div className="fu">
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:BGOLD, border:`1px solid ${BGOLD_B}`, borderRadius:'24px', padding:'8px 18px', marginBottom:'40px' }}>
              <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:GOLD, display:'inline-block', animation:'goldPulse 2s ease-in-out infinite' }}/>
              <span style={{ fontSize:'12px', color:GRAY, letterSpacing:'0.5px' }}>Five products. One platform. Unlimited brand momentum.</span>
            </div>
            <h1 style={{ fontFamily:SERIF, fontSize:'clamp(44px,5.5vw,70px)', fontWeight:700, lineHeight:1.08, margin:'0 0 28px' }}>
              Power your destiny<br/>
              <span className="sg" style={{ fontFamily:SERIF, fontSize:'clamp(44px,5.5vw,70px)', fontWeight:700 }}>across every platform.</span>
            </h1>
            <p style={{ fontSize:'17px', color:GRAY, lineHeight:1.8, marginBottom:'44px', maxWidth:'460px' }}>
              IKENGA is a unified creative operating platform — five products, five brand voices, one shared engine. Founders, agencies, and creators use it to generate a full week of content in one run.
            </p>
            <div style={{ display:'flex', gap:'14px', flexWrap:'wrap' }}>
              <button className="bg" onClick={() => scrollTo(engineRef)} style={{ background:`linear-gradient(135deg,${GOLD} 0%,#F0C030 50%,${GOLD} 100%)`, color:BG, padding:'14px 36px', borderRadius:'50px', fontWeight:700, fontSize:'15px', border:'none', cursor:'pointer', transition:'all .2s' }}>
                Join Early Access
              </button>
              <a href="#products" className="bgh" style={{ display:'inline-flex', alignItems:'center', background:'rgba(255,255,255,0.04)', color:'white', padding:'14px 36px', borderRadius:'50px', fontSize:'15px', border:`1px solid ${BORDER}`, textDecoration:'none', transition:'all .2s' }}>
                See All Products →
              </a>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
            <div className="fl"><IkengaLogo size={300}/></div>
          </div>
        </section>

        {/* PRODUCTS */}
        <section id="products" style={{ padding:'96px 48px', borderTop:`1px solid rgba(212,175,55,0.08)` }}>
          <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
            <p style={{ fontSize:'11px', letterSpacing:'3px', color:GOLD, marginBottom:'16px', textTransform:'uppercase' }}>Five Brand Voices</p>
            <h2 style={{ fontFamily:SERIF, fontSize:'clamp(36px,4.5vw,58px)', fontWeight:700, marginBottom:'16px' }}>Every brand voice, covered.</h2>
            <p style={{ fontSize:'16px', color:GRAY, marginBottom:'52px', maxWidth:'480px', lineHeight:1.75 }}>Toggle between products and see how the same engine writes in completely different voices — all within your shared account.</p>
            <div style={{ display:'flex', gap:'8px', marginBottom:'56px', flexWrap:'wrap' }}>
              {PRODUCTS.map(p => (
                <button key={p.id} className="tab" onClick={() => setActiveProduct(p.id)} style={{ padding:'10px 28px', borderRadius:'50px', fontSize:'13px', fontWeight:600, letterSpacing:'1px', cursor:'pointer', transition:'all .25s', background:activeProduct===p.id?BGOLD2:'transparent', color:activeProduct===p.id?GOLD:'rgba(255,255,255,0.4)', border:activeProduct===p.id?`1.5px solid ${BGOLD_B}`:'1.5px solid transparent' }}>
                  {p.name}
                </button>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'56px', alignItems:'start' }}>
              <div>
                <p className="sg" style={{ fontSize:'13px', fontWeight:600, marginBottom:'16px' }}>{activeP.tagline}</p>
                <p style={{ fontSize:'16px', color:GRAY, lineHeight:1.8, marginBottom:'28px' }}>{activeP.description}</p>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  {activeP.formats.map(f => (
                    <span key={f} style={{ padding:'7px 18px', borderRadius:'50px', fontSize:'12px', background:'rgba(255,255,255,0.04)', border:`1px solid ${BORDER}`, color:'rgba(255,255,255,0.7)' }}>{f}</span>
                  ))}
                </div>
              </div>
              <div className="gc" style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:'16px', padding:'28px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
                  <span style={{ fontSize:'11px', color:GRAY, letterSpacing:'2px' }}>SAMPLE</span>
                  <span style={{ background:BGOLD, border:`1px solid ${BGOLD_B}`, color:GOLD, fontSize:'11px', padding:'4px 12px', borderRadius:'4px', fontWeight:600, letterSpacing:'1px' }}>{activeP.name}</span>
                </div>
                <p style={{ color:'rgba(255,255,255,0.85)', lineHeight:1.85, fontSize:'15px', marginBottom:'24px' }}>{activeP.sample}</p>
                <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:'16px' }}>
                  <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.25)' }}>Tone: {activeP.tone}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section style={{ padding:'96px 48px', borderTop:`1px solid rgba(212,175,55,0.08)` }}>
          <div style={{ maxWidth:'1200px', margin:'0 auto', display:'grid', gridTemplateColumns:'2fr 3fr', gap:'80px', alignItems:'start' }}>
            <div>
              <p style={{ fontSize:'11px', letterSpacing:'3px', color:GOLD, marginBottom:'20px', textTransform:'uppercase' }}>One Generation Run</p>
              <h2 style={{ fontFamily:SERIF, fontSize:'clamp(34px,4vw,52px)', fontWeight:700, marginBottom:'20px', lineHeight:1.1 }}>A full week ready to publish.</h2>
              <p style={{ fontSize:'16px', color:GRAY, lineHeight:1.8 }}>Enter your brand, goals, and tone. IKENGA produces everything your brand needs for the next 7 days — platform-formatted, in your voice, ready to copy and post.</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {STATS.map(s => (
                <div key={s.label} className="sr" style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:'12px', padding:'18px 28px', display:'flex', alignItems:'center', gap:'24px', transition:'all .25s' }}>
                  <span className="sg" style={{ fontFamily:SERIF, fontSize:'40px', fontWeight:700, lineHeight:1, minWidth:'48px' }}>{s.number}</span>
                  <span style={{ fontSize:'15px', color:GRAY }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LIVE ENGINE */}
        <section ref={engineRef} id="engine" style={{ padding:'96px 48px', borderTop:`1px solid rgba(212,175,55,0.08)`, position:'relative' }}>
          <div style={{ position:'absolute', top:'-80px', left:'50%', transform:'translateX(-50%)', width:'600px', height:'400px', background:'radial-gradient(ellipse,rgba(212,175,55,0.05) 0%,transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ maxWidth:'860px', margin:'0 auto' }}>
            <p style={{ fontSize:'11px', letterSpacing:'3px', color:GOLD, marginBottom:'20px', textTransform:'uppercase' }}>Live Engine — No Login Needed</p>
            <h2 style={{ fontFamily:SERIF, fontSize:'clamp(34px,4.5vw,56px)', fontWeight:700, marginBottom:'18px' }}>Try it right now.</h2>
            <p style={{ fontSize:'16px', color:GRAY, lineHeight:1.75, marginBottom:'48px' }}>Paste any brand idea or content goal. The UJU Cycle™ engine applies the Consensus of Ten and returns a 9-section strategic report — live, editable, and schedulable.</p>

            <div className="gc" style={{ background:CARD, border:`1px solid ${BGOLD_B}`, borderRadius:'24px' }}>
              <div style={{ padding:'18px 28px', borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span className="sg" style={{ fontFamily:SERIF, fontSize:'15px', fontWeight:600, letterSpacing:'0.5px' }}>UJU Cycle™ — Live</span>
                <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'11px' }}>Consensus of Ten · Founder-grade</span>
              </div>

              <div style={{ padding:'28px' }}>
                <div style={{ marginBottom:'20px' }}>
                  <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', letterSpacing:'1.5px', marginBottom:'10px', textTransform:'uppercase' }}>Active Voice</p>
                  <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                    {PRODUCTS.map(p => (
                      <button key={p.id} onClick={() => setActiveProduct(p.id)} style={{ padding:'6px 16px', borderRadius:'50px', fontSize:'11px', fontWeight:600, letterSpacing:'0.8px', cursor:'pointer', transition:'all .2s', background:activeProduct===p.id?BGOLD2:'transparent', color:activeProduct===p.id?GOLD:'rgba(255,255,255,0.35)', border:`1px solid ${activeProduct===p.id?BGOLD_B:'rgba(255,255,255,0.08)'}` }}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'14px' }}>
                  {Object.keys(EXAMPLE_PROMPTS).map(label => (
                    <button key={label} onClick={() => setPrompt(EXAMPLE_PROMPTS[label])} style={{ background:BGOLD, border:`1px solid ${BGOLD_B}`, color:'rgba(212,175,55,0.85)', fontSize:'12px', padding:'6px 14px', borderRadius:'6px', cursor:'pointer' }}>
                      Try: {label}
                    </button>
                  ))}
                </div>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={handleKey} placeholder="Paste any brand idea, goal, or post concept…" rows={5}
                  style={{ width:'100%', padding:'16px', background:'rgba(255,255,255,0.02)', border:`1px solid ${BGOLD_B}`, borderRadius:'12px', color:'white', fontSize:'14px', lineHeight:1.7, resize:'vertical', fontFamily:SANS, marginBottom:'16px', transition:'border-color .2s' }}
                />
                {error && <div style={{ background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.22)', color:'#fca5a5', padding:'12px 16px', borderRadius:'8px', fontSize:'13px', marginBottom:'16px' }}>{error}</div>}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap' }}>
                  <button className="bg" onClick={runEngine} disabled={running} style={{ background:running?'rgba(212,175,55,0.35)':`linear-gradient(135deg,${GOLD} 0%,#F0C030 50%,${GOLD} 100%)`, color:BG, padding:'14px 44px', borderRadius:'50px', fontWeight:700, fontSize:'15px', border:'none', cursor:running?'not-allowed':'pointer', transition:'all .2s', letterSpacing:'0.5px' }}>
                    {running ? 'The Council is convening…' : `Run ${activeP.name} →`}
                  </button>
                  <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'12px' }}>⌘ + Enter to run</span>
                </div>
              </div>

              {/* RESULTS */}
              {sections && (
                <div style={{ borderTop:`1px solid ${BORDER}` }}>
                  <div style={{ padding:'20px 28px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px' }}>
                    <div>
                      <span className="sg" style={{ fontFamily:SERIF, fontSize:'14px', fontWeight:600 }}>UJU Cycle™ Report</span>
                      <span style={{ color:'rgba(255,255,255,0.22)', fontSize:'11px', marginLeft:'10px' }}>Consensus of Ten · 9 Sections · {activeP.name} Voice</span>
                    </div>
                    <button onClick={() => { const all = UJU_SECTIONS.map(s => `${s.title.toUpperCase()}\n${get(s.key)}`).join('\n\n---\n\n'); navigator.clipboard.writeText(all).catch(()=>{}); setCopied('all'); setTimeout(()=>setCopied(''),2500); }}
                      style={{ background:copied==='all'?'rgba(52,211,153,0.1)':BGOLD, border:`1px solid ${copied==='all'?'rgba(52,211,153,0.3)':BGOLD_B}`, color:copied==='all'?'#34D399':GOLD, padding:'6px 14px', borderRadius:'6px', fontSize:'11px', cursor:'pointer' }}>
                      {copied==='all'?'✓ Copied All':'Copy All'}
                    </button>
                  </div>

                  {UJU_SECTIONS.map(sec => {
                    const content = get(sec.key);
                    if (!content) return null;
                    const isEditing = editingKey === sec.key;
                    return (
                      <div key={sec.key} className="sc" style={{ padding:'20px 28px', borderTop:`1px solid rgba(255,255,255,0.04)`, borderLeft:isEditing?`3px solid ${GOLD}`:'3px solid transparent', background:isEditing?'rgba(212,175,55,0.025)':'transparent', transition:'all .2s' }}>
                        <div style={{ display:'flex', alignItems:'flex-start', gap:'20px' }}>
                          <span style={{ fontFamily:SERIF, color:'rgba(212,175,55,0.28)', fontSize:'28px', fontWeight:700, lineHeight:1, flexShrink:0, minWidth:'42px' }}>{sec.num}</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px', flexWrap:'wrap', gap:'8px' }}>
                              <div>
                                <span style={{ color:GOLD, fontWeight:600, fontSize:'14px' }}>{sec.title}</span>
                                <span style={{ color:'rgba(255,255,255,0.22)', fontSize:'12px', marginLeft:'10px' }}>— {sec.sub}</span>
                              </div>
                              <div style={{ display:'flex', gap:'6px' }}>
                                <button onClick={() => { if(isEditing){setEditingKey(null);}else{if(edited[sec.key]===undefined)setEdited(p=>({...p,[sec.key]:sections![sec.key]||''}));setEditingKey(sec.key);}}}
                                  style={{ background:isEditing?BGOLD2:'rgba(255,255,255,0.04)', border:`1px solid ${isEditing?BGOLD_B:BORDER}`, color:isEditing?GOLD:'rgba(255,255,255,0.4)', padding:'4px 10px', borderRadius:'4px', fontSize:'11px', cursor:'pointer' }}>
                                  {isEditing?'✓ Done':'✎ Edit'}
                                </button>
                                <button onClick={() => copy(sec.key, content)}
                                  style={{ background:copied===sec.key?'rgba(52,211,153,0.1)':BGOLD, border:`1px solid ${copied===sec.key?'rgba(52,211,153,0.3)':BGOLD_B}`, color:copied===sec.key?'#34D399':'rgba(212,175,55,0.7)', padding:'4px 12px', borderRadius:'4px', fontSize:'11px', cursor:'pointer' }}>
                                  {copied===sec.key?'✓ Copied':'Copy'}
                                </button>
                              </div>
                            </div>
                            {isEditing ? (
                              <textarea value={edited[sec.key]??content} onChange={e=>setEdited(p=>({...p,[sec.key]:e.target.value}))} rows={6} autoFocus
                                style={{ width:'100%', padding:'12px 14px', background:'rgba(212,175,55,0.03)', border:`1px solid rgba(212,175,55,0.28)`, borderRadius:'8px', color:'rgba(255,255,255,0.9)', fontSize:'14px', lineHeight:1.8, resize:'vertical', fontFamily:SANS }}/>
                            ) : (
                              <p style={{ color:'rgba(255,255,255,0.8)', lineHeight:1.85, fontSize:'14px', whiteSpace:'pre-wrap', margin:0 }}>{content}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* SCHEDULE TRIGGER */}
                  <div style={{ padding:'28px', borderTop:`1px solid ${BORDER}`, background:'rgba(212,175,55,0.015)' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
                      <div>
                        <p style={{ fontFamily:SERIF, color:GOLD, fontSize:'15px', fontWeight:600, marginBottom:'4px' }}>Build Your Content Schedule</p>
                        <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.32)' }}>Map this report to a day-by-day publishing calendar. Edit each section above, then pick your duration.</p>
                      </div>
                      <div style={{ display:'flex', gap:'8px' }}>
                        {([7,14,30] as const).map(d => (
                          <button key={d} onClick={() => setScheduleDays(scheduleDays===d?null:d)}
                            style={{ padding:'10px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer', transition:'all .2s', background:scheduleDays===d?GOLD:BGOLD, color:scheduleDays===d?BG:GOLD, border:`1px solid ${scheduleDays===d?GOLD:BGOLD_B}` }}>
                            {d} Days
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SCHEDULE GRID */}
                  {scheduleData && (
                    <div style={{ borderTop:`1px solid ${BORDER}`, padding:'28px' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
                        <div>
                          <p style={{ fontFamily:SERIF, color:'white', fontSize:'16px', fontWeight:600 }}>{scheduleDays}-Day Content Calendar</p>
                          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.28)', marginTop:'4px' }}>UJU Cycle™ · {activeP.name} Voice · Copy any day or export the full plan</p>
                        </div>
                        <button onClick={() => exportSchedule(scheduleData)}
                          style={{ background:copied==='export'?'rgba(52,211,153,0.1)':BGOLD, border:`1px solid ${copied==='export'?'rgba(52,211,153,0.3)':BGOLD_B}`, color:copied==='export'?'#34D399':GOLD, padding:'8px 18px', borderRadius:'8px', fontSize:'12px', cursor:'pointer' }}>
                          {copied==='export'?'✓ Full Schedule Copied':'⬇ Export Full Schedule'}
                        </button>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(248px,1fr))', gap:'12px' }}>
                        {scheduleData.map(day => (
                          <div key={day.day} className="dc" style={{ background:CARD, borderRadius:'12px', padding:'16px', border:`1px solid ${BORDER}`, borderLeft:'3px solid rgba(212,175,55,0.3)' }}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                <span className="sg" style={{ fontFamily:SERIF, fontSize:'20px', fontWeight:700, lineHeight:1 }}>{day.day}</span>
                                <div>
                                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)', lineHeight:1 }}>{day.dayName}</div>
                                  <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.28)', lineHeight:1.3 }}>{day.date}</div>
                                </div>
                              </div>
                              <button onClick={() => copyDay(day.day, day.content)}
                                style={{ background:copiedDay===day.day?'rgba(52,211,153,0.1)':BGOLD, border:`1px solid ${copiedDay===day.day?'rgba(52,211,153,0.25)':BGOLD_B}`, color:copiedDay===day.day?'#34D399':'rgba(212,175,55,0.7)', padding:'4px 10px', borderRadius:'4px', fontSize:'10px', cursor:'pointer' }}>
                                {copiedDay===day.day?'✓':'Copy'}
                              </button>
                            </div>
                            <p style={{ fontSize:'11px', color:GOLD, fontWeight:600, marginBottom:'8px', letterSpacing:'0.3px' }}>{day.title}</p>
                            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', lineHeight:1.65 }}>{day.preview}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ padding:'16px 28px', borderTop:`1px solid ${BORDER}` }}>
                    <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.16)', letterSpacing:'0.5px' }}>
                      Powered by IKENGA AI — Chi in Motion. UJU CYCLE™ is a proprietary methodology of UJU GROUP LIMITED.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BUILT FOR */}
        <section style={{ padding:'96px 48px', borderTop:`1px solid rgba(212,175,55,0.08)` }}>
          <div style={{ maxWidth:'1200px', margin:'0 auto', display:'grid', gridTemplateColumns:'2fr 3fr', gap:'80px', alignItems:'start' }}>
            <div>
              <p style={{ fontSize:'11px', letterSpacing:'3px', color:GOLD, marginBottom:'20px', textTransform:'uppercase' }}>Built For</p>
              <h2 style={{ fontFamily:SERIF, fontSize:'clamp(32px,3.5vw,50px)', fontWeight:700, lineHeight:1.15 }}>Teams that cannot afford to sound generic</h2>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {BUILT_FOR.map(item => (
                <div key={item.title} className="sr" style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:'16px', padding:'28px 32px', transition:'all .25s' }}>
                  <h3 className="sg" style={{ fontFamily:SERIF, fontSize:'20px', fontWeight:700, marginBottom:'12px' }}>{item.title}</h3>
                  <p style={{ fontSize:'15px', color:GRAY, lineHeight:1.75 }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EARLY ACCESS */}
        <section id="early-access" style={{ padding:'80px 48px', borderTop:`1px solid rgba(212,175,55,0.08)` }}>
          <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
            <div className="gc" style={{ background:CARD, border:`1px solid rgba(212,175,55,0.18)`, borderRadius:'24px', padding:'60px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'64px', alignItems:'center' }}>
              <div>
                <p style={{ fontSize:'11px', letterSpacing:'3px', color:GOLD, marginBottom:'20px', textTransform:'uppercase' }}>Early Access</p>
                <h2 style={{ fontFamily:SERIF, fontSize:'clamp(32px,3.5vw,50px)', fontWeight:700, marginBottom:'18px', lineHeight:1.15 }}>Be early. Stay ahead.</h2>
                <p style={{ fontSize:'16px', color:GRAY, lineHeight:1.8, marginBottom:'32px' }}>Join the waitlist. Get your login link. Start with 3 free generations — no card required. Upgrade when you are ready.</p>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  {['3 free generations','All 5 products included','First in, first served'].map(perk => (
                    <span key={perk} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${BORDER}`, color:GRAY, fontSize:'13px', padding:'8px 18px', borderRadius:'50px' }}>{perk}</span>
                  ))}
                </div>
              </div>
              <div>
                {!emailDone ? (
                  <>
                    <form onSubmit={e=>{e.preventDefault();if(email.includes('@'))setEmailDone(true);}} style={{ display:'flex', gap:'12px', marginBottom:'16px' }}>
                      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your best email" required
                        style={{ flex:1, padding:'15px 20px', background:'rgba(255,255,255,0.04)', border:`1px solid rgba(212,175,55,0.2)`, borderRadius:'50px', color:'white', fontSize:'14px', fontFamily:SANS, outline:'none' }}/>
                      <button type="submit" className="bg" style={{ background:`linear-gradient(135deg,${GOLD} 0%,#F0C030 100%)`, color:BG, padding:'15px 28px', borderRadius:'50px', fontWeight:700, fontSize:'14px', border:'none', cursor:'pointer', whiteSpace:'nowrap', transition:'all .2s' }}>
                        Get Early Access
                      </button>
                    </form>
                    <p style={{ color:'rgba(255,255,255,0.22)', fontSize:'13px', textAlign:'center' }}>
                      Already signed up?{' '}
                      <button onClick={()=>scrollTo(engineRef)} style={{ color:GOLD, background:'none', border:'none', cursor:'pointer', fontSize:'13px', padding:0, textDecoration:'underline' }}>Access your dashboard →</button>
                    </p>
                  </>
                ) : (
                  <div style={{ background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.22)', borderRadius:'12px', padding:'24px', color:'#34D399', fontSize:'15px', lineHeight:1.7 }}>
                    ✓ You are on the list. Watch your inbox — your login arrives soon.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ padding:'28px 48px', borderTop:`1px solid rgba(212,175,55,0.08)`, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
          <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'13px' }}>© 2026 IKENGA AI. Chi in Motion.</span>
          <span style={{ color:'rgba(255,255,255,0.15)', fontSize:'12px' }}>Built for brands, agencies, and creators who refuse to move small.</span>
        </footer>

      </div>
    </div>
  );
}
