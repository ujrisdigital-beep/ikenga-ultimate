'use client';

const TONES = [
  { id: 'ikenga', name: 'IKENGA', description: 'Authoritative, ancestral wisdom, bold', color: 'bg-navy text-white' },
  { id: 'juo', name: 'JUO', description: 'Playful, energetic, trendy', color: 'bg-purple-600 text-white' },
  { id: 'oba', name: 'OBA', description: 'Royal, dignified, premium', color: 'bg-gold text-navy' },
  { id: 'omenala', name: 'OMENALA', description: 'Traditional, spiritual, grounding', color: 'bg-green-800 text-white' },
  { id: 'icheoku', name: 'ICHEOKU', description: 'Analytical, precise, strategic', color: 'bg-slate-800 text-white' }
];

export default function ToneSelector({ selected, onSelect }: { selected: string; onSelect: (tone: string) => void }) {
  return (
    <div>
      <h3 className="font-bold text-navy mb-3">5 Brand Voices</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {TONES.map(tone => (
          <button
            key={tone.id}
            onClick={() => onSelect(tone.id)}
            className={`p-3 rounded-lg text-center transition-all ${
              selected === tone.id
                ? `${tone.color} ring-2 ring-offset-2 ring-gold`
                : 'bg-cream hover:bg-[#EDE4D9] text-navy'
            }`}
          >
            <div className="font-bold text-sm">{tone.name}</div>
            <div className="text-[10px] mt-1 opacity-80">{tone.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
