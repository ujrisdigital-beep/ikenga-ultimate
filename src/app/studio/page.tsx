'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  VOICES, ALL_PLATFORMS, PLATFORM_META, VIDEO_PLATFORMS, CAROUSEL_PLATFORMS,
  OPTIMAL_TIMES, BrandProfile, BrandLens, PlatformContent, ScheduledPost,
} from '@/lib/studioTypes';

/* ── Design tokens ─────────────────────────────────────────────────── */
const BG     = '#0a0a0a';
const CARD   = '#111111';
const CARD2  = '#181818';
const GOLD   = '#D4AF37';
const BGOLD  = 'rgba(212,175,55,0.12)';
const BGOLDB = 'rgba(212,175,55,0.28)';
const BORDER = 'rgba(255,255,255,0.07)';
const GRAY   = 'rgba(255,255,255,0.5)';
const WHITE  = '#f0f0f0';
const SERIF  = "'Playfair Display', Georgia, serif";
const SANS   = "'Inter', system-ui, sans-serif";

/* ── Pollinations image helper ─────────────────────────────────────── */
const img = (prompt: string, w: number, h: number, seed = 0) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ' professional photography cinematic lighting')}?width=${w}&height=${h}&nologo=true&seed=${seed}&model=flux`;

/* ── Utility ──────────────────────────────────────────────────────── */
function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function fmtDate(d: Date) {
  return d.toISOString().split('T')[0];
}

/* ═══════════════════════════════════════════════════════════════════
   BRAND SETUP
═══════════════════════════════════════════════════════════════════ */
function BrandSetup({ onComplete }: { onComplete: (b: BrandProfile) => void }) {
  const [name, setName]         = useState('');
  const [desc, setDesc]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [extracted, setExtracted] = useState<Partial<BrandProfile> | null>(null);
  const [error, setError]       = useState('');

  async function analyze() {
    if (!name.trim() || !desc.trim()) { setError('Both fields required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/brand-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: desc }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setExtracted(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  function confirm() {
    if (!extracted) return;
    onComplete({ name, description: desc, ...extracted } as BrandProfile);
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: SANS }}>
      <div style={{ width: '100%', maxWidth: 640 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: SERIF, fontSize: 32, color: GOLD, fontWeight: 700, letterSpacing: '0.08em' }}>IKENGA</div>
          <div style={{ color: GRAY, fontSize: 13, letterSpacing: '0.2em', marginTop: 4 }}>CONTENT INTELLIGENCE STUDIO</div>
        </div>

        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 36 }}>
          <h2 style={{ color: WHITE, fontFamily: SERIF, fontSize: 24, fontWeight: 600, margin: '0 0 8px' }}>Tell us about your brand</h2>
          <p style={{ color: GRAY, fontSize: 14, margin: '0 0 28px', lineHeight: 1.6 }}>
            IKENGA AI will extract your brand DNA — moats, audience, voice — and use it to generate content that could only come from you.
          </p>

          {!extracted ? (
            <>
              <label style={{ display: 'block', color: GRAY, fontSize: 12, letterSpacing: '0.1em', marginBottom: 8 }}>BRAND NAME</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Fortis Invicta Ltd"
                style={{ width: '100%', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 16px', color: WHITE, fontSize: 15, marginBottom: 20, outline: 'none', boxSizing: 'border-box' }}
              />
              <label style={{ display: 'block', color: GRAY, fontSize: 12, letterSpacing: '0.1em', marginBottom: 8 }}>DESCRIBE YOUR BRAND</label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="What do you do, who do you serve, what makes you different? Be specific — the AI will extract everything it needs."
                rows={5}
                style={{ width: '100%', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 16px', color: WHITE, fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
              />
              {error && <p style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>{error}</p>}
              <button
                onClick={analyze}
                disabled={loading}
                style={{ marginTop: 20, width: '100%', background: loading ? BGOLD : GOLD, color: loading ? GOLD : '#0a0a0a', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading ? 'default' : 'pointer', letterSpacing: '0.05em', transition: 'all 0.2s' }}
              >
                {loading ? '✦ Extracting Brand DNA...' : '✦ Extract Brand DNA'}
              </button>
            </>
          ) : (
            <>
              <div style={{ background: BGOLD, border: `1px solid ${BGOLDB}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <div style={{ color: GOLD, fontSize: 11, letterSpacing: '0.15em', fontWeight: 700, marginBottom: 12 }}>BRAND DNA EXTRACTED</div>
                {extracted.moats && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ color: GRAY, fontSize: 11, letterSpacing: '0.1em', marginBottom: 6 }}>YOUR MOATS</div>
                    {extracted.moats.map((m, i) => (
                      <div key={i} style={{ color: WHITE, fontSize: 13, padding: '4px 0', display: 'flex', gap: 8 }}>
                        <span style={{ color: GOLD }}>→</span><span>{m}</span>
                      </div>
                    ))}
                  </div>
                )}
                {extracted.audience && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ color: GRAY, fontSize: 11, letterSpacing: '0.1em', marginBottom: 4 }}>AUDIENCE</div>
                    <div style={{ color: WHITE, fontSize: 13 }}>{extracted.audience}</div>
                  </div>
                )}
                {extracted.positioning && (
                  <div>
                    <div style={{ color: GRAY, fontSize: 11, letterSpacing: '0.1em', marginBottom: 4 }}>POSITIONING</div>
                    <div style={{ color: WHITE, fontSize: 13, fontStyle: 'italic' }}>"{extracted.positioning}"</div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setExtracted(null)} style={{ flex: 1, background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px', color: GRAY, fontSize: 14, cursor: 'pointer' }}>
                  ← Re-enter
                </button>
                <button onClick={confirm} style={{ flex: 2, background: GOLD, color: '#0a0a0a', border: 'none', borderRadius: 10, padding: '12px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  Confirm & Start Creating →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   VIDEO STORYBOARD MODAL
═══════════════════════════════════════════════════════════════════ */
function VideoModal({ platform, content, onClose, onSave }: {
  platform: string; content: PlatformContent;
  onClose: () => void;
  onSave: (c: PlatformContent) => void;
}) {
  const meta   = PLATFORM_META[platform];
  const script = content.video_script;
  const [activeScene, setActiveScene] = useState(0);
  const [editScene, setEditScene]     = useState<number | null>(null);
  const [scenes, setScenes]           = useState(script?.scenes || []);
  const [hook, setHook]               = useState(script?.hook || '');
  const [cta, setCta]                 = useState(script?.cta || '');
  const [playing, setPlaying]         = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPortrait = platform === 'tiktok';
  const w = isPortrait ? 1080 : 1920;
  const h = isPortrait ? 1920 : 1080;

  useEffect(() => {
    if (playing) {
      timerRef.current = setTimeout(() => {
        setActiveScene(s => {
          if (s >= scenes.length - 1) { setPlaying(false); return s; }
          return s + 1;
        });
      }, (scenes[activeScene]?.duration || 5) * 500);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, activeScene, scenes]);

  function save() {
    onSave({ ...content, video_script: { hook, scenes, cta }, edited: true });
    onClose();
  }

  const scene = scenes[activeScene];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column', fontFamily: SANS }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ flex: 1 }}>
          <span style={{ background: meta.color, color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700, marginRight: 10 }}>{meta.icon} {meta.name}</span>
          <span style={{ color: GRAY, fontSize: 13 }}>Video Storyboard</span>
        </div>
        <button onClick={() => setPlaying(!playing)} style={{ background: playing ? '#ef4444' : GOLD, color: '#0a0a0a', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          {playing ? '⏸ Pause' : '▶ Preview'}
        </button>
        <button onClick={save} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Save ✓</button>
        <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 16px', color: GRAY, cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Main Preview */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'hidden' }}>
          <div style={{ position: 'relative', height: '100%', maxHeight: 520, aspectRatio: isPortrait ? '9/16' : '16/9', borderRadius: 12, overflow: 'hidden', border: `2px solid ${BORDER}` }}>
            {scene && (
              <img
                src={img(scene.image_prompt, w, h, activeScene + 1)}
                alt={scene.description}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/${w}x${h}/111/333?text=Scene+${activeScene+1}`; }}
              />
            )}
            {/* Overlays */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.8))' }} />
            {scene?.caption && (
              <div style={{ position: 'absolute', bottom: 60, left: 16, right: 16, textAlign: 'center', color: '#fff', fontSize: 18, fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.8)', lineHeight: 1.3 }}>{scene.caption}</div>
            )}
            {/* Scene number badge */}
            <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '3px 10px', color: GOLD, fontSize: 12, fontWeight: 700 }}>
              {activeScene === 0 ? 'HOOK' : activeScene === scenes.length - 1 ? 'CTA' : `Scene ${activeScene + 1}`}
            </div>
            {/* Progress bar */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.2)' }}>
              <div style={{ height: '100%', width: `${((activeScene + 1) / scenes.length) * 100}%`, background: GOLD, transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>

        {/* Right panel: script editor */}
        <div style={{ width: 320, borderLeft: `1px solid ${BORDER}`, overflowY: 'auto', padding: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: GRAY, fontSize: 11, letterSpacing: '0.1em' }}>HOOK (3 SECONDS)</label>
            <textarea value={hook} onChange={e => setHook(e.target.value)} rows={2} style={{ width: '100%', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px', color: WHITE, fontSize: 13, resize: 'none', outline: 'none', boxSizing: 'border-box', marginTop: 6 }} />
          </div>

          <div style={{ color: GRAY, fontSize: 11, letterSpacing: '0.1em', marginBottom: 10 }}>SCENES</div>
          {scenes.map((s, i) => (
            <div key={s.id} onClick={() => { setActiveScene(i); setEditScene(editScene === i ? null : i); }}
              style={{ background: activeScene === i ? BGOLD : CARD2, border: `1px solid ${activeScene === i ? BGOLDB : BORDER}`, borderRadius: 10, padding: 12, marginBottom: 8, cursor: 'pointer', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ color: GOLD, fontSize: 11, fontWeight: 700 }}>Scene {i + 1}</span>
                <span style={{ color: GRAY, fontSize: 11 }}>{s.duration}s</span>
              </div>
              {editScene === i ? (
                <div onClick={e => e.stopPropagation()}>
                  <textarea
                    value={s.caption}
                    onChange={e => setScenes(prev => prev.map((sc, j) => j === i ? { ...sc, caption: e.target.value } : sc))}
                    placeholder="On-screen caption"
                    rows={2}
                    style={{ width: '100%', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '6px', color: WHITE, fontSize: 12, resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 6 }}
                  />
                  <textarea
                    value={s.voiceover}
                    onChange={e => setScenes(prev => prev.map((sc, j) => j === i ? { ...sc, voiceover: e.target.value } : sc))}
                    placeholder="Voiceover text"
                    rows={2}
                    style={{ width: '100%', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '6px', color: WHITE, fontSize: 12, resize: 'none', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ) : (
                <>
                  <div style={{ color: WHITE, fontSize: 12, marginBottom: 2 }}>{s.caption || <span style={{ color: GRAY }}>No caption</span>}</div>
                  <div style={{ color: GRAY, fontSize: 11 }}>{s.voiceover?.slice(0, 60)}...</div>
                </>
              )}
            </div>
          ))}

          <div style={{ marginTop: 12 }}>
            <label style={{ color: GRAY, fontSize: 11, letterSpacing: '0.1em' }}>CALL TO ACTION</label>
            <textarea value={cta} onChange={e => setCta(e.target.value)} rows={2} style={{ width: '100%', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px', color: WHITE, fontSize: 13, resize: 'none', outline: 'none', boxSizing: 'border-box', marginTop: 6 }} />
          </div>

          <div style={{ marginTop: 20, background: BGOLD, borderRadius: 10, padding: 12, border: `1px solid ${BGOLDB}` }}>
            <div style={{ color: GOLD, fontSize: 11, fontWeight: 700, marginBottom: 8 }}>TAKE TO PRODUCTION</div>
            <div style={{ color: GRAY, fontSize: 12, lineHeight: 1.6 }}>
              Copy script → paste into <strong style={{ color: WHITE }}>CapCut</strong>, <strong style={{ color: WHITE }}>InVideo</strong>, or <strong style={{ color: WHITE }}>Descript</strong>. Each scene image is AI-generated and downloadable.
            </div>
          </div>
        </div>
      </div>

      {/* Storyboard strip */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: '12px 24px', display: 'flex', gap: 10, overflowX: 'auto' }}>
        {scenes.map((s, i) => (
          <div key={s.id} onClick={() => setActiveScene(i)}
            style={{ flexShrink: 0, width: 100, borderRadius: 8, overflow: 'hidden', border: `2px solid ${i === activeScene ? GOLD : BORDER}`, cursor: 'pointer', position: 'relative' }}>
            <img src={img(s.image_prompt, 400, 225, i + 1)} alt={`Scene ${i+1}`}
              style={{ width: '100%', height: 56, objectFit: 'cover', display: 'block' }}
              onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x225/111/333?text=${i+1}`; }}
            />
            <div style={{ background: CARD, padding: '4px 6px' }}>
              <div style={{ color: i === activeScene ? GOLD : GRAY, fontSize: 10, fontWeight: 700 }}>
                {i === 0 ? 'HOOK' : i === scenes.length - 1 ? 'CTA' : `S${i+1}`}
              </div>
              <div style={{ color: WHITE, fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.caption}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CAROUSEL MODAL
═══════════════════════════════════════════════════════════════════ */
function CarouselModal({ platform, content, onClose, onSave }: {
  platform: string; content: PlatformContent;
  onClose: () => void;
  onSave: (c: PlatformContent) => void;
}) {
  const meta   = PLATFORM_META[platform];
  const [slides, setSlides]   = useState(content.carousel_slides || []);
  const [current, setCurrent] = useState(0);
  const [editing, setEditing] = useState(false);

  const slide = slides[current];
  const accentColor = meta.color;

  function updateSlide(field: 'title' | 'body' | 'cta', val: string) {
    setSlides(prev => prev.map((s, i) => i === current ? { ...s, [field]: val } : s));
  }

  function save() {
    onSave({ ...content, carousel_slides: slides, edited: true });
    onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column', fontFamily: SANS }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ flex: 1 }}>
          <span style={{ background: accentColor, color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700, marginRight: 10 }}>{meta.icon} {meta.name}</span>
          <span style={{ color: GRAY, fontSize: 13 }}>Carousel — {slides.length} slides</span>
        </div>
        <button onClick={() => setEditing(!editing)} style={{ background: editing ? GOLD : CARD2, color: editing ? '#0a0a0a' : GRAY, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          {editing ? '✓ Done Editing' : '✏ Edit'}
        </button>
        <button onClick={save} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Save ✓</button>
        <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 16px', color: GRAY, cursor: 'pointer', fontSize: 18 }}>✕</button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 }}>
        {/* Nav prev */}
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
          style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: '50%', width: 48, height: 48, color: current === 0 ? BORDER : WHITE, fontSize: 20, cursor: current === 0 ? 'default' : 'pointer', flexShrink: 0 }}>‹</button>

        {/* Slide */}
        <div style={{ position: 'relative', width: 400, height: 400, borderRadius: 16, overflow: 'hidden', boxShadow: `0 0 60px ${accentColor}33` }}>
          <img
            src={img(slide?.image_prompt || 'abstract brand background', 1080, 1080, current + 1)}
            alt={`Slide ${current + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/1080x1080/111/222?text=Slide+${current+1}`; }}
          />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.85))` }} />
          <div style={{ position: 'absolute', top: 16, right: 16, background: accentColor, borderRadius: 8, padding: '4px 12px', color: '#fff', fontSize: 12, fontWeight: 700 }}>
            {current + 1} / {slides.length}
          </div>
          {editing ? (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 }}>
              <input value={slide?.title || ''} onChange={e => updateSlide('title', e.target.value)}
                placeholder="Slide title"
                style={{ width: '100%', background: 'rgba(0,0,0,0.7)', border: `1px solid ${accentColor}`, borderRadius: 8, padding: '8px 12px', color: WHITE, fontSize: 16, fontWeight: 700, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}
              />
              <textarea value={slide?.body || ''} onChange={e => updateSlide('body', e.target.value)}
                placeholder="Body text"
                rows={3}
                style={{ width: '100%', background: 'rgba(0,0,0,0.7)', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 12px', color: WHITE, fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
              />
              {current === slides.length - 1 && (
                <input value={slide?.cta || ''} onChange={e => updateSlide('cta', e.target.value)}
                  placeholder="Call to action (last slide)"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.7)', border: `1px solid ${accentColor}`, borderRadius: 8, padding: '8px 12px', color: WHITE, fontSize: 14, outline: 'none', marginTop: 8, boxSizing: 'border-box' }}
                />
              )}
            </div>
          ) : (
            <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
              {slide?.title && <div style={{ color: WHITE, fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: SERIF, textShadow: '0 2px 8px rgba(0,0,0,0.8)', lineHeight: 1.2 }}>{slide.title}</div>}
              {slide?.body && <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.5, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{slide.body}</div>}
              {slide?.cta && <div style={{ marginTop: 12, background: accentColor, color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, display: 'inline-block' }}>{slide.cta}</div>}
            </div>
          )}
        </div>

        {/* Nav next */}
        <button onClick={() => setCurrent(c => Math.min(slides.length - 1, c + 1))} disabled={current === slides.length - 1}
          style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: '50%', width: 48, height: 48, color: current === slides.length - 1 ? BORDER : WHITE, fontSize: 20, cursor: current === slides.length - 1 ? 'default' : 'pointer', flexShrink: 0 }}>›</button>
      </div>

      {/* Slide strip */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: '12px 24px', display: 'flex', gap: 8, justifyContent: 'center' }}>
        {slides.map((s, i) => (
          <div key={s.id} onClick={() => setCurrent(i)}
            style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: `2px solid ${i === current ? accentColor : BORDER}`, cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
            <img src={img(s.image_prompt, 400, 400, i + 1)} alt={`Slide ${i+1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x400/111/222?text=${i+1}`; }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PLATFORM CONTENT CARD
═══════════════════════════════════════════════════════════════════ */
function ContentCard({ platform, content, onEdit, onApprove, onExpand }: {
  platform: string;
  content: PlatformContent;
  onEdit: (text: string) => void;
  onApprove: () => void;
  onExpand: () => void;
}) {
  const meta    = PLATFORM_META[platform];
  const [editing, setEditing] = useState(false);
  const [text, setText]       = useState(content.text);
  const isVideo    = content.content_type === 'video';
  const isCarousel = content.content_type === 'carousel';

  function saveEdit() {
    onEdit(text);
    setEditing(false);
  }

  return (
    <div style={{ background: CARD, border: `1px solid ${content.approved ? '#22c55e55' : BORDER}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s' }}>
      {/* Platform header */}
      <div style={{ background: meta.bg, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>{meta.icon}</span>
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{meta.name}</span>
        <span style={{ marginLeft: 'auto', background: 'rgba(0,0,0,0.4)', color: '#fff', borderRadius: 5, padding: '2px 8px', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em' }}>
          {isVideo ? '▶ VIDEO' : isCarousel ? '◧ CAROUSEL' : '✦ POST'}
        </span>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, padding: 14 }}>
        {isVideo && content.video_script && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
              {content.video_script.scenes.slice(0, 4).map((s, i) => (
                <div key={s.id} style={{ flexShrink: 0, width: 72, height: 40, borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                  <img src={img(s.image_prompt, 288, 160, i + 1)} alt={`Scene ${i+1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/288x160/111/222?text=S${i+1}`; }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{i === 0 ? '▶' : `${i+1}`}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ color: GRAY, fontSize: 11, fontStyle: 'italic', marginTop: 4 }}>🎬 {content.video_script.scenes.length} scenes · Hook: "{content.video_script.hook?.slice(0, 50)}..."</div>
          </div>
        )}
        {isCarousel && content.carousel_slides && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {content.carousel_slides.slice(0, 5).map((s, i) => (
              <div key={s.id} style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                <img src={img(s.image_prompt, 240, 240, i + 1)} alt={`Slide ${i+1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/240x240/111/222?text=${i+1}`; }}
                />
                <div style={{ position: 'absolute', bottom: 2, right: 2, background: 'rgba(0,0,0,0.7)', borderRadius: 3, padding: '1px 4px', color: '#fff', fontSize: 8, fontWeight: 700 }}>{i+1}</div>
              </div>
            ))}
          </div>
        )}

        {editing ? (
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={5}
            style={{ width: '100%', background: CARD2, border: `1px solid ${BGOLDB}`, borderRadius: 8, padding: '8px', color: WHITE, fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
          />
        ) : (
          <p style={{ color: WHITE, fontSize: 13, lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{content.text}</p>
        )}

        {content.hashtags?.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {content.hashtags.slice(0, 5).map((h, i) => (
              <span key={i} style={{ background: BGOLD, color: GOLD, borderRadius: 4, padding: '2px 7px', fontSize: 11 }}>{h}</span>
            ))}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div style={{ padding: '10px 14px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 8 }}>
        {editing ? (
          <>
            <button onClick={saveEdit} style={{ flex: 1, background: GOLD, color: '#0a0a0a', border: 'none', borderRadius: 7, padding: '7px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Save</button>
            <button onClick={() => { setEditing(false); setText(content.text); }} style={{ flex: 1, background: CARD2, color: GRAY, border: `1px solid ${BORDER}`, borderRadius: 7, padding: '7px', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          </>
        ) : (
          <>
            {(isVideo || isCarousel) && (
              <button onClick={onExpand} style={{ flex: 1, background: CARD2, color: WHITE, border: `1px solid ${BORDER}`, borderRadius: 7, padding: '7px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                {isVideo ? '🎬 Storyboard' : '◧ Slides'}
              </button>
            )}
            <button onClick={() => setEditing(true)} style={{ flex: 1, background: CARD2, color: GRAY, border: `1px solid ${BORDER}`, borderRadius: 7, padding: '7px', fontSize: 11, cursor: 'pointer' }}>✏ Edit</button>
            <button onClick={onApprove} style={{ flex: 1, background: content.approved ? '#22c55e22' : CARD2, color: content.approved ? '#22c55e' : GRAY, border: `1px solid ${content.approved ? '#22c55e55' : BORDER}`, borderRadius: 7, padding: '7px', fontSize: 11, fontWeight: content.approved ? 700 : 400, cursor: 'pointer', transition: 'all 0.2s' }}>
              {content.approved ? '✓ Approved' : '✓ Approve'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SCHEDULE CALENDAR
═══════════════════════════════════════════════════════════════════ */
function ScheduleView({ scheduledPosts, days }: { scheduledPosts: ScheduledPost[]; days: 7 | 14 | 30 }) {
  const start  = new Date();
  const cells  = Array.from({ length: days }, (_, i) => {
    const d    = addDays(start, i + 1);
    const date = fmtDate(d);
    const posts = scheduledPosts.filter(p => p.date === date);
    return { date, d, posts };
  });

  const cols = days === 7 ? 7 : days === 14 ? 7 : 6;

  return (
    <div style={{ padding: 24 }}>
      <h3 style={{ color: WHITE, fontFamily: SERIF, fontSize: 22, fontWeight: 600, margin: '0 0 20px' }}>
        {days}-Day Content Calendar
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
        {cells.map(({ date, d, posts }) => (
          <div key={date} style={{ background: CARD, border: `1px solid ${posts.length > 0 ? BGOLDB : BORDER}`, borderRadius: 10, padding: 10, minHeight: 90 }}>
            <div style={{ color: GRAY, fontSize: 11, marginBottom: 6 }}>
              {d.toLocaleDateString('en-GB', { weekday: 'short' })} {d.getDate()}
            </div>
            {posts.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10 }}>—</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {posts.map((p, i) => {
                  const m = PLATFORM_META[p.platform];
                  return (
                    <div key={i} title={`${m?.name} at ${p.time}`}
                      style={{ background: `${m?.color}22`, border: `1px solid ${m?.color}44`, borderRadius: 5, padding: '2px 6px', fontSize: 10, color: m?.color || WHITE, fontWeight: 600 }}>
                      {m?.icon} {p.time}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN STUDIO
═══════════════════════════════════════════════════════════════════ */
export default function StudioPage() {
  const [brand, setBrand]               = useState<BrandProfile | null>(null);
  const [view, setView]                 = useState<'generate' | 'preview' | 'schedule'>('generate');
  const [prompt, setPrompt]             = useState('');
  const [voice, setVoice]               = useState<keyof typeof VOICES>('IKENGA');
  const [platforms, setPlatforms]       = useState<string[]>(ALL_PLATFORMS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress]         = useState(0);
  const [error, setError]               = useState('');
  const [content, setContent]           = useState<Record<string, PlatformContent>>({});
  const [brandLens, setBrandLens]       = useState<BrandLens | null>(null);
  const [filter, setFilter]             = useState<'all' | 'text' | 'video' | 'carousel'>('all');
  const [expanded, setExpanded]         = useState<string | null>(null);
  const [scheduleDays, setScheduleDays] = useState<7 | 14 | 30>(7);
  const [schedule, setSchedule]         = useState<ScheduledPost[]>([]);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const b = localStorage.getItem('ikenga_brand');
      const c = localStorage.getItem('ikenga_content');
      const l = localStorage.getItem('ikenga_lens');
      if (b) setBrand(JSON.parse(b));
      if (c) { setContent(JSON.parse(c)); setView('preview'); }
      if (l) setBrandLens(JSON.parse(l));
    } catch {}
  }, []);

  // Persist
  useEffect(() => {
    if (brand) localStorage.setItem('ikenga_brand', JSON.stringify(brand));
  }, [brand]);

  useEffect(() => {
    if (Object.keys(content).length > 0) {
      localStorage.setItem('ikenga_content', JSON.stringify(content));
    }
  }, [content]);

  const togglePlatform = useCallback((p: string) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }, []);

  async function generate() {
    if (!prompt.trim() || !brand) return;
    setIsGenerating(true);
    setError('');
    setProgress(0);

    progressRef.current = setInterval(() => {
      setProgress(p => Math.min(p + 2, 90));
    }, 400);

    try {
      const res = await fetch('/api/generate-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, voice, platforms, brandProfile: brand }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setContent(data.content || {});
      setBrandLens(data.brand_lens || null);
      localStorage.setItem('ikenga_lens', JSON.stringify(data.brand_lens));
      setProgress(100);
      setTimeout(() => { setView('preview'); setIsGenerating(false); setProgress(0); }, 500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed');
      setIsGenerating(false);
      setProgress(0);
    } finally {
      if (progressRef.current) clearInterval(progressRef.current);
    }
  }

  function updateContent(platform: string, updates: Partial<PlatformContent>) {
    setContent(prev => ({ ...prev, [platform]: { ...prev[platform], ...updates } }));
  }

  function buildSchedule() {
    const posts: ScheduledPost[] = [];
    const start = new Date();
    const platformList = Object.keys(content);
    const interval = Math.max(1, Math.floor(scheduleDays / platformList.length));
    platformList.forEach((p, i) => {
      const times = OPTIMAL_TIMES[p] || ['09:00'];
      const dayOffset = (i * interval) % scheduleDays + 1;
      const date = fmtDate(addDays(start, dayOffset));
      posts.push({ platform: p, date, time: times[0], content: content[p] });
    });
    setSchedule(posts);
    setView('schedule');
  }

  function approveAll() {
    setContent(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(p => { next[p] = { ...next[p], approved: true }; });
      return next;
    });
  }

  const filteredPlatforms = Object.keys(content).filter(p => {
    if (filter === 'all') return true;
    return content[p]?.content_type === filter;
  });

  const approvedCount  = Object.values(content).filter(c => c?.approved).length;
  const totalGenerated = Object.keys(content).length;

  if (!brand) return <BrandSetup onComplete={b => { setBrand(b); setView('generate'); }} />;

  const expandedContent = expanded ? content[expanded] : null;

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', fontFamily: SANS, color: WHITE }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <aside style={{ width: 260, flexShrink: 0, background: CARD, borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* Logo */}
          <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ fontFamily: SERIF, color: GOLD, fontSize: 20, fontWeight: 700, letterSpacing: '0.08em' }}>IKENGA</div>
            <div style={{ color: GRAY, fontSize: 10, letterSpacing: '0.2em' }}>CONTENT STUDIO</div>
          </div>

          {/* Brand Profile */}
          <div style={{ padding: 16, borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 42, height: 42, background: `linear-gradient(135deg, ${GOLD}, #8B6914)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0a', fontWeight: 900, fontSize: 16, fontFamily: SERIF, flexShrink: 0 }}>
                {initials(brand.name)}
              </div>
              <div>
                <div style={{ color: WHITE, fontWeight: 700, fontSize: 14 }}>{brand.name}</div>
                <div style={{ color: GRAY, fontSize: 11 }}>{brand.industry}</div>
              </div>
            </div>
            {brand.moats?.slice(0, 3).map((m, i) => (
              <div key={i} style={{ color: GRAY, fontSize: 11, padding: '3px 0', display: 'flex', gap: 6 }}>
                <span style={{ color: GOLD }}>→</span><span style={{ flex: 1 }}>{m}</span>
              </div>
            ))}
            <button onClick={() => setBrand(null)} style={{ marginTop: 10, background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 7, padding: '5px 12px', color: GRAY, fontSize: 11, cursor: 'pointer' }}>
              ✎ Edit Brand
            </button>
          </div>

          {/* Nav */}
          <nav style={{ padding: '12px 0', flex: 1 }}>
            {(['generate', 'preview', 'schedule'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ width: '100%', textAlign: 'left', background: view === v ? BGOLD : 'transparent', borderLeft: view === v ? `3px solid ${GOLD}` : '3px solid transparent', border: 'none', color: view === v ? GOLD : GRAY, padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontWeight: view === v ? 700 : 400, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 10 }}>
                {v === 'generate' && '✦'} {v === 'preview' && `◈ ${totalGenerated > 0 ? `(${totalGenerated})` : ''}`} {v === 'schedule' && '📅'}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </nav>

          {brandLens && (
            <div style={{ margin: 16, padding: 12, background: BGOLD, borderRadius: 10, border: `1px solid ${BGOLDB}` }}>
              <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>BRAND LENS</div>
              <div style={{ color: WHITE, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Moat: {brandLens.key_moat}</div>
              <div style={{ color: GRAY, fontSize: 11, lineHeight: 1.5 }}>{brandLens.content_angle}</div>
            </div>
          )}
        </aside>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <header style={{ padding: '14px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: 'none', color: GRAY, cursor: 'pointer', fontSize: 18, padding: 4 }}>☰</button>
          <div style={{ color: GRAY, fontSize: 13 }}>
            {view === 'generate' && 'Create content guided by your brand DNA'}
            {view === 'preview' && `${totalGenerated} pieces generated · ${approvedCount} approved`}
            {view === 'schedule' && `${scheduleDays}-day content schedule`}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
            {view === 'preview' && totalGenerated > 0 && (
              <>
                <button onClick={approveAll} style={{ background: CARD2, color: GRAY, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '7px 16px', fontSize: 12, cursor: 'pointer' }}>Approve All ✓</button>
                <select value={scheduleDays} onChange={e => setScheduleDays(Number(e.target.value) as 7 | 14 | 30)} style={{ background: CARD2, color: GRAY, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '7px 12px', fontSize: 12, cursor: 'pointer', outline: 'none' }}>
                  <option value={7}>7-day schedule</option>
                  <option value={14}>14-day schedule</option>
                  <option value={30}>30-day schedule</option>
                </select>
                <button onClick={buildSchedule} style={{ background: GOLD, color: '#0a0a0a', border: 'none', borderRadius: 8, padding: '7px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>📅 Schedule →</button>
              </>
            )}
          </div>
        </header>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* ── GENERATE VIEW ── */}
          {view === 'generate' && (
            <div style={{ maxWidth: 720, margin: '0 auto', padding: 32 }}>
              <h2 style={{ fontFamily: SERIF, fontSize: 28, color: WHITE, fontWeight: 600, margin: '0 0 8px' }}>
                What do you want to create today?
              </h2>
              <p style={{ color: GRAY, fontSize: 14, margin: '0 0 28px' }}>
                IKENGA AI will generate content across {platforms.length} platforms in the <strong style={{ color: GOLD }}>{voice}</strong> voice, guided entirely by <strong style={{ color: WHITE }}>{brand.name}'s</strong> brand DNA.
              </p>

              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={`e.g. "Launch ${brand.name}'s new flagship product to our target audience" or "Build authority as the leading voice in ${brand.industry}"`}
                rows={4}
                style={{ width: '100%', background: CARD, border: `1px solid ${BGOLDB}`, borderRadius: 12, padding: '16px', color: WHITE, fontSize: 15, resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6, marginBottom: 24 }}
              />

              {/* Voice selector */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ color: GRAY, fontSize: 11, letterSpacing: '0.15em', marginBottom: 12 }}>BRAND VOICE</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(Object.keys(VOICES) as (keyof typeof VOICES)[]).map(v => {
                    const vd = VOICES[v];
                    const isActive = voice === v;
                    return (
                      <button key={v} onClick={() => setVoice(v)}
                        style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${isActive ? vd.color : BORDER}`, background: isActive ? `${vd.color}18` : 'transparent', color: isActive ? vd.color : GRAY, fontWeight: isActive ? 700 : 400, cursor: 'pointer', fontSize: 13, transition: 'all 0.15s' }}>
                        {vd.label}
                      </button>
                    );
                  })}
                </div>
                {voice && <p style={{ color: GRAY, fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>{VOICES[voice].desc}</p>}
              </div>

              {/* Platform grid */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ color: GRAY, fontSize: 11, letterSpacing: '0.15em' }}>PLATFORMS ({platforms.length} selected)</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setPlatforms([...ALL_PLATFORMS])} style={{ background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '4px 10px', color: GRAY, fontSize: 11, cursor: 'pointer' }}>All</button>
                    <button onClick={() => setPlatforms([])} style={{ background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '4px 10px', color: GRAY, fontSize: 11, cursor: 'pointer' }}>Clear</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                  {ALL_PLATFORMS.map(p => {
                    const m = PLATFORM_META[p];
                    const isSelected = platforms.includes(p);
                    return (
                      <button key={p} onClick={() => togglePlatform(p)}
                        style={{ padding: '8px 4px', borderRadius: 8, border: `1px solid ${isSelected ? m.color : BORDER}`, background: isSelected ? `${m.color}18` : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'all 0.15s' }}>
                        <span style={{ fontSize: 16 }}>{m.icon}</span>
                        <span style={{ color: isSelected ? m.color : GRAY, fontSize: 9, fontWeight: isSelected ? 700 : 400 }}>{m.name.split('/')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && <div style={{ background: '#ef444422', border: '1px solid #ef4444', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>{error}</div>}

              <button onClick={generate} disabled={isGenerating || !prompt.trim()}
                style={{ width: '100%', background: isGenerating || !prompt.trim() ? BGOLD : GOLD, color: isGenerating || !prompt.trim() ? GOLD : '#0a0a0a', border: 'none', borderRadius: 12, padding: '16px', fontSize: 16, fontWeight: 700, cursor: isGenerating || !prompt.trim() ? 'default' : 'pointer', letterSpacing: '0.04em', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                {isGenerating ? (
                  <span>✦ UJU Cycle™ running... {progress}%</span>
                ) : (
                  <span>✦ Generate Content — {platforms.length} Platforms</span>
                )}
                {isGenerating && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, height: 3, background: GOLD, width: `${progress}%`, transition: 'width 0.3s', borderRadius: 12 }} />
                )}
              </button>
            </div>
          )}

          {/* ── PREVIEW VIEW ── */}
          {view === 'preview' && (
            <div style={{ padding: '20px 24px' }}>
              {/* Brand lens banner */}
              {brandLens && (
                <div style={{ background: BGOLD, border: `1px solid ${BGOLDB}`, borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 3 }}>MOAT IN FOCUS</div>
                    <div style={{ color: WHITE, fontSize: 13 }}>{brandLens.key_moat}</div>
                  </div>
                  <div>
                    <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 3 }}>AUDIENCE INSIGHT</div>
                    <div style={{ color: WHITE, fontSize: 13 }}>{brandLens.audience_insight}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 3 }}>CONTENT ANGLE</div>
                    <div style={{ color: WHITE, fontSize: 13 }}>{brandLens.content_angle}</div>
                  </div>
                </div>
              )}

              {/* Filter bar */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {(['all', 'text', 'video', 'carousel'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    style={{ padding: '6px 16px', borderRadius: 8, border: `1px solid ${filter === f ? GOLD : BORDER}`, background: filter === f ? BGOLD : 'transparent', color: filter === f ? GOLD : GRAY, fontWeight: filter === f ? 700 : 400, cursor: 'pointer', fontSize: 12, transition: 'all 0.15s' }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    {f !== 'all' && <span style={{ marginLeft: 6, opacity: 0.7 }}>({Object.values(content).filter(c => c?.content_type === f).length})</span>}
                  </button>
                ))}
                <div style={{ marginLeft: 'auto', color: GRAY, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => setView('generate')} style={{ background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '6px 14px', color: GRAY, fontSize: 12, cursor: 'pointer' }}>+ Regenerate</button>
                </div>
              </div>

              {/* Content grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {filteredPlatforms.map(p => content[p] && (
                  <ContentCard
                    key={p}
                    platform={p}
                    content={content[p]}
                    onEdit={text => updateContent(p, { text, edited: true })}
                    onApprove={() => updateContent(p, { approved: !content[p].approved })}
                    onExpand={() => setExpanded(p)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── SCHEDULE VIEW ── */}
          {view === 'schedule' && (
            <ScheduleView scheduledPosts={schedule} days={scheduleDays} />
          )}
        </div>
      </div>

      {/* Expanded modals */}
      {expanded && expandedContent && expandedContent.content_type === 'video' && (
        <VideoModal
          platform={expanded}
          content={expandedContent}
          onClose={() => setExpanded(null)}
          onSave={c => updateContent(expanded, c)}
        />
      )}
      {expanded && expandedContent && expandedContent.content_type === 'carousel' && (
        <CarouselModal
          platform={expanded}
          content={expandedContent}
          onClose={() => setExpanded(null)}
          onSave={c => updateContent(expanded, c)}
        />
      )}
    </div>
  );
}
