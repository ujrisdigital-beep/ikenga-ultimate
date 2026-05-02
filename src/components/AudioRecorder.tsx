'use client';

import { useState, useRef, useEffect } from 'react';

type TonalWord = 'Egbe' | 'Akwa' | 'Aka' | 'Oke';

const TONAL_EXAMPLES: Record<TonalWord, string[]> = {
  Egbe: ['Kite (Egbe - high-high)', 'Gun (Égbè - high-low)', 'Kindness (Egbe - low-high)'],
  Akwa: ['Bed (Àkwà - low-low)', 'Egg (Akwa - high-high)', 'Cry (Ákwá - high-high)'],
  Aka: ['Hand (Aka - mid-high)', 'Sand (Áká - high-high)', 'Difficulty (Aka - mid-mid)'],
  Oke: ['Hill (Oke - mid-high)', 'Cultivate (Okè - high-low)', 'River (Oké - high-high)'],
};

interface IgboToneRecorderProps {
  onSave?: (blob: Blob, word: string, context: string) => void;
  word?: string;
  context?: string;
}

export const IgboToneRecorder = ({ onSave, word = '', context = '' }: IgboToneRecorderProps) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioBlob]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Microphone access is required to record Igbo tones.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleSave = () => {
    if (audioBlob && onSave) {
      onSave(audioBlob, word, context);
      alert('✅ Audio saved to Igbo Tonal Library!');
    }
  };

  const tonalExamples = word && word in TONAL_EXAMPLES ? TONAL_EXAMPLES[word as TonalWord] : null;

  return (
    <div className="audio-recorder p-4 bg-gray-50 rounded-xl border border-gray-200">
      <h4 className="font-bold mb-2 flex items-center gap-2">
        🎙️ Capture Pronunciation
      </h4>
      <p className="text-sm text-gray-600 mb-3">
        Igbo is tonal: same spelling, different meaning based on tone
      </p>

      {tonalExamples && (
        <div className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs font-semibold text-yellow-800">⚠️ Tonal Examples for &quot;{word}&quot;:</p>
          <ul className="mt-1 space-y-1">
            {tonalExamples.map((ex: string, i: number) => (
              <li key={i} className="text-xs text-yellow-700">{ex}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 items-center">
        {!recording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium flex items-center gap-2"
          >
            🎤 Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-full font-medium flex items-center gap-2 animate-pulse"
          >
            ⏹️ Stop Recording
          </button>
        )}

        {audioUrl && (
          <>
            <audio controls src={audioUrl} className="h-10" />
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
            >
              💾 Save to Library
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default IgboToneRecorder;
