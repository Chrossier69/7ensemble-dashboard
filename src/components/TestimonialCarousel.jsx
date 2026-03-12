import { useState, useEffect } from 'react';

// For DEMO_MODE=false, this will be empty. Shown only if testimonials exist.
export default function TestimonialCarousel({ testimonials = [] }) {
  const approved = testimonials.filter(t => t.status === 'approved' && t.allowPublish);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (approved.length <= 1) return;
    const iv = setInterval(() => setIdx(p => (p + 1) % approved.length), 4000);
    return () => clearInterval(iv);
  }, [approved.length]);

  if (!approved.length) return null;

  const t = approved[idx];
  return (
    <div className="w-full max-w-lg mx-auto mt-12 px-4">
      <div className="text-center mb-4 text-sm font-semibold text-cosmos-100 font-display">💬 Témoignages</div>
      <div className="rounded-xl glass p-5 text-center transition-all" key={t.id}>
        <p className="text-sm text-cosmos-50 italic mb-3">"{t.message}"</p>
        <div className="text-xs text-cosmos-100">— {t.pseudo}</div>
      </div>
      {approved.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {approved.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-em7' : 'bg-white/20'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
