'use client';

import { useState } from 'react';

export default function ContentPreview({ contents }: { contents: Record<string, any> }) {
  const [activePlatform, setActivePlatform] = useState<string>(Object.keys(contents)[0] || '');

  if (!contents || Object.keys(contents).length === 0) {
    return <p className="text-slate text-sm text-center py-8">No content generated yet.</p>;
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-[#EDE4D9]">
        {Object.entries(contents).map(([platform, content]) => (
          <button
            key={platform}
            onClick={() => setActivePlatform(platform)}
            className={`px-3 py-2 rounded-lg text-xs whitespace-nowrap ${
              activePlatform === platform
                ? 'bg-navy text-white'
                : 'bg-cream text-slate hover:bg-[#EDE4D9]'
            }`}
          >
            {platform} ({content.format})
          </button>
        ))}
      </div>

      {activePlatform && contents[activePlatform] && (
        <div className="bg-cream rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-navy">{activePlatform.toUpperCase()}</h4>
            <span className="text-xs px-2 py-1 bg-gold text-navy rounded">{contents[activePlatform].format}</span>
          </div>
          <div className="text-sm text-navy whitespace-pre-wrap">{contents[activePlatform].content}</div>
          {contents[activePlatform].hashtags && (
            <div className="mt-3 pt-3 border-t border-[#EDE4D9]">
              <p className="text-xs text-slate">Hashtags: {contents[activePlatform].hashtags.join(' ')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
