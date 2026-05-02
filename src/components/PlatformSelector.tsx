'use client';

import { useState } from 'react';

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📸', formats: ['Post', 'Story', 'Reel', 'Carousel'] },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', formats: ['Video', 'Caption', 'Hashtags'] },
  { id: 'twitter', name: 'X (Twitter)', icon: '🐦', formats: ['Post', 'Thread', 'Poll'] },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', formats: ['Post', 'Article', 'Carousel'] },
  { id: 'facebook', name: 'Facebook', icon: '📘', formats: ['Post', 'Story', 'Video'] },
  { id: 'youtube', name: 'YouTube', icon: '📹', formats: ['Video Script', 'Description', 'Thumbnail'] },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', formats: ['Pin', 'Board Description'] },
  { id: 'snapchat', name: 'Snapchat', icon: '👻', formats: ['Snap', 'Story'] },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', formats: ['Newsletter', 'Broadcast'] },
  { id: 'telegram', name: 'Telegram', icon: '✈️', formats: ['Channel Post', 'Message'] },
  { id: 'email', name: 'Email', icon: '📧', formats: ['Newsletter', 'Sequence'] },
  { id: 'blog', name: 'Blog', icon: '📝', formats: ['Post', 'SEO Meta'] },
  { id: 'newsletter', name: 'Newsletter', icon: '📰', formats: ['Welcome', 'Weekly', 'Promo'] },
  { id: 'sms', name: 'SMS', icon: '💬', formats: ['Alert', 'Reminder'] },
  { id: 'ads', name: 'Ads', icon: '📢', formats: ['Facebook Ad', 'Google Ad', 'TikTok Ad'] },
  { id: 'seo', name: 'SEO', icon: '🔍', formats: ['Meta Description', 'Keywords'] },
  { id: 'press', name: 'Press Release', icon: '📰', formats: ['Announcement', 'Media Kit'] },
  { id: 'podcast', name: 'Podcast', icon: '🎙️', formats: ['Script', 'Show Notes'] }
];

export default function PlatformSelector({ onSelect }: { onSelect?: (platforms: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  
  const togglePlatform = (platformId: string) => {
    const updated = selected.includes(platformId)
      ? selected.filter(p => p !== platformId)
      : [...selected, platformId];
    setSelected(updated);
    onSelect?.(updated);
  };
  
  const selectAll = () => {
    setSelected(PLATFORMS.map(p => p.id));
    onSelect?.(PLATFORMS.map(p => p.id));
  };
  
  const clearAll = () => {
    setSelected([]);
    onSelect?.([]);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-navy">18-Platform Distribution</h3>
        <div className="flex gap-2">
          <button onClick={selectAll} className="text-xs text-gold hover:underline">Select All</button>
          <button onClick={clearAll} className="text-xs text-red-500 hover:underline">Clear</button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2">
        {PLATFORMS.map(platform => (
          <button
            key={platform.id}
            onClick={() => togglePlatform(platform.id)}
            className={`p-2 rounded-lg text-center transition-all text-xs ${
              selected.includes(platform.id)
                ? 'bg-gold text-navy font-bold'
                : 'bg-cream text-slate hover:bg-[#EDE4D9]'
            }`}
          >
            <div className="text-lg">{platform.icon}</div>
            <div className="mt-1">{platform.name}</div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-[#EDE4D9]">
        <p className="text-xs text-slate">
          {selected.length} platforms selected · Content will be formatted for each platform
        </p>
      </div>
    </div>
  );
}
