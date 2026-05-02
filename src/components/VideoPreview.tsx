// src/components/VideoPreview.tsx
"use client";

import { useState } from "react";

interface VideoPreviewProps {
  script?: string;
  voice?: string;
  avatar?: string;
  onApprove?: (script: string) => void;
  onRegenerate?: () => void;
}

export const VideoPreview = ({ script, voice, avatar, onApprove, onRegenerate }: VideoPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [editedScript, setEditedScript] = useState(script || '');

  const generatePreview = async () => {
    if (!editedScript) {
      alert('Please enter a script first');
      return;
    }

    setGenerating(true);
    try {
      // Call HeyGen/Synthesis API for preview
      const response = await fetch('/api/video/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: editedScript, voice, avatar })
      });

      if (!response.ok) {
        throw new Error('Preview generation failed');
      }

      const { url } = await response.json();
      setPreviewUrl(url);
    } catch (error) {
      console.error('Preview generation error:', error);
      alert('Preview generation failed. Using script-only preview.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="video-preview">
      <div className="script-editor mb-4">
        <label className="block text-sm font-medium mb-2">📝 Script Editor</label>
        <textarea
          value={editedScript}
          onChange={(e) => setEditedScript(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:outline-none font-mono text-sm"
          rows={10}
        />
      </div>

      <button
        onClick={generatePreview}
        disabled={generating || !editedScript}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
      >
        {generating ? '🎬 Generating Preview...' : '🎥 Generate Video Preview'}
      </button>

      {previewUrl && (
        <div className="mt-4">
          <video src={previewUrl} controls className="w-full rounded-xl shadow-lg" />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onApprove?.(editedScript)}
              className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
            >
              ✅ Approve
            </button>
            <button
              onClick={() => onRegenerate?.()}
              className="px-4 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm"
            >
              ⚡ Edit Script
            </button>
            <button
              onClick={generatePreview}
              className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
            >
              🔄 Regenerate
            </button>
          </div>
        </div>
      )}

      {!previewUrl && editedScript && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Script Preview:</p>
          <div className="bg-white p-4 rounded border">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">{editedScript}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPreview;
