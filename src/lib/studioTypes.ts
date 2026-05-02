export const VOICES = {
  IKENGA:  { label: 'IKENGA',  tagline: 'Chi in Motion',          color: '#D4AF37', desc: 'Bold, authentic, entrepreneurial momentum. Unapologetic.' },
  JUO:     { label: 'JUO',     tagline: 'Fresh Energy. Viral.',   color: '#A78BFA', desc: 'Playful, energetic, culturally resonant. Trendy and infectious.' },
  OBA:     { label: 'OBA',     tagline: 'The Royal Standard',     color: '#F59E0B', desc: 'Premium, dignified, aspirational. Leads from the front.' },
  OMENALA: { label: 'OMENALA', tagline: 'Rooted. Timeless.',      color: '#34D399', desc: 'Traditional wisdom meets modern vision. Cultural depth.' },
  ICHEOKU: { label: 'ICHEOKU', tagline: 'Analytical · Strategic', color: '#38BDF8', desc: 'Data-informed, precise, strategic. Clarity over noise.' },
} as const;

export type VoiceKey = keyof typeof VOICES;

export const VIDEO_PLATFORMS  = ['tiktok', 'youtube', 'facebook'] as const;
export const CAROUSEL_PLATFORMS = ['instagram', 'linkedin'] as const;

export const PLATFORM_META: Record<string, { name: string; icon: string; color: string; bg: string }> = {
  instagram:  { name: 'Instagram',   icon: '📸', color: '#E1306C', bg: 'linear-gradient(135deg,#405DE6,#5851DB,#833AB4,#C13584,#E1306C,#FD1D1D)' },
  tiktok:     { name: 'TikTok',      icon: '🎵', color: '#69C9D0', bg: 'linear-gradient(135deg,#010101,#69C9D0)' },
  twitter:    { name: 'X / Twitter', icon: '✕',  color: '#1DA1F2', bg: 'linear-gradient(135deg,#0f0f0f,#1DA1F2)' },
  linkedin:   { name: 'LinkedIn',    icon: '💼', color: '#0A66C2', bg: 'linear-gradient(135deg,#004182,#0A66C2)' },
  facebook:   { name: 'Facebook',    icon: '📘', color: '#1877F2', bg: 'linear-gradient(135deg,#0a5bd1,#1877F2)' },
  youtube:    { name: 'YouTube',     icon: '▶',  color: '#FF0000', bg: 'linear-gradient(135deg,#282828,#FF0000)' },
  pinterest:  { name: 'Pinterest',   icon: '📌', color: '#E60023', bg: 'linear-gradient(135deg,#8c0000,#E60023)' },
  email:      { name: 'Email',       icon: '📧', color: '#4CAF50', bg: 'linear-gradient(135deg,#1b5e20,#4CAF50)' },
  newsletter: { name: 'Newsletter',  icon: '📰', color: '#FF6B35', bg: 'linear-gradient(135deg,#bf360c,#FF6B35)' },
  blog:       { name: 'Blog',        icon: '📝', color: '#9C27B0', bg: 'linear-gradient(135deg,#4a148c,#9C27B0)' },
  ads:        { name: 'Ads',         icon: '📢', color: '#FF9800', bg: 'linear-gradient(135deg,#e65100,#FF9800)' },
  seo:        { name: 'SEO',         icon: '🔍', color: '#78909C', bg: 'linear-gradient(135deg,#263238,#78909C)' },
  podcast:    { name: 'Podcast',     icon: '🎙', color: '#8B5CF6', bg: 'linear-gradient(135deg,#4c1d95,#8B5CF6)' },
  press:      { name: 'Press',       icon: '📄', color: '#6B7280', bg: 'linear-gradient(135deg,#1f2937,#6B7280)' },
  whatsapp:   { name: 'WhatsApp',    icon: '💬', color: '#25D366', bg: 'linear-gradient(135deg,#128C7E,#25D366)' },
  telegram:   { name: 'Telegram',    icon: '✈',  color: '#26A5E4', bg: 'linear-gradient(135deg,#006599,#26A5E4)' },
  sms:        { name: 'SMS',         icon: '📱', color: '#34D399', bg: 'linear-gradient(135deg,#065f46,#34D399)' },
  snapchat:   { name: 'Snapchat',    icon: '👻', color: '#FFFC00', bg: 'linear-gradient(135deg,#c8b800,#FFFC00)' },
};

export const ALL_PLATFORMS = Object.keys(PLATFORM_META);

export interface BrandProfile {
  name: string;
  description: string;
  industry: string;
  moats: string[];
  audience: string;
  voice_pillars: string[];
  positioning: string;
  content_themes: string[];
  tagline?: string;
}

export interface VideoScene {
  id: string;
  description: string;
  caption: string;
  voiceover: string;
  image_prompt: string;
  duration: number;
}

export interface VideoScript {
  hook: string;
  scenes: VideoScene[];
  cta: string;
}

export interface CarouselSlide {
  id: string;
  number: number;
  title: string;
  body: string;
  image_prompt: string;
  cta?: string;
}

export interface PlatformContent {
  platform: string;
  content_type: 'text' | 'video' | 'carousel';
  text: string;
  hashtags: string[];
  video_script?: VideoScript;
  carousel_slides?: CarouselSlide[];
  approved: boolean;
  edited: boolean;
  scheduled_date?: string;
}

export interface BrandLens {
  key_moat: string;
  audience_insight: string;
  content_angle: string;
}

export interface ScheduledPost {
  platform: string;
  date: string;
  time: string;
  content: PlatformContent;
}

export const OPTIMAL_TIMES: Record<string, string[]> = {
  instagram:  ['11:00', '14:00', '19:00'],
  tiktok:     ['09:00', '12:00', '19:00'],
  twitter:    ['08:00', '13:00', '17:00'],
  linkedin:   ['08:00', '12:00', '17:00'],
  facebook:   ['09:00', '13:00', '15:00', '19:00'],
  youtube:    ['15:00', '19:00'],
  pinterest:  ['20:00', '21:00'],
  email:      ['08:00', '12:00'],
  newsletter: ['09:00'],
  blog:       ['07:00', '09:00'],
  ads:        ['08:00', '18:00'],
  seo:        ['09:00'],
  podcast:    ['06:00', '12:00'],
  press:      ['09:00'],
  whatsapp:   ['09:00', '18:00'],
  telegram:   ['09:00', '18:00'],
  sms:        ['10:00', '16:00'],
  snapchat:   ['08:00', '22:00'],
};
