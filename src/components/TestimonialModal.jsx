import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function TestimonialModal({ onClose }) {
  const { submitTestimonial, user } = useApp();
  const [msg, setMsg] = useState('');
  const [anon, setAnon] = useState(false);
  const [allowPub, setAllowPub] = useState(true);
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!msg.trim()) return;
    submitTestimonial(msg, anon, allowPub);
    setSent(true);
    setTimeout(onClose, 2000);
  };

  if (sent) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm" style={{zIndex:9999}}>
        <div className="w-full max-w-sm mx-4 rounded-2xl p-6 glass page-in text-center">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="text-lg font-bold text-em7 font-display mb-2">Merci !</h3>
          <p className="text-sm text-cosmos-100">Votre témoignage sera examiné avant publication.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm" style={{zIndex:9999}} onClick={onClose}>
      <div className="w-full max-w-sm mx-4 rounded-2xl p-6 glass page-in" onClick={e=>e.stopPropagation()}>
        <h3 className="text-lg font-bold text-cosmos-50 font-display mb-4">💬 Laisse-nous un mot</h3>
        <textarea
          className="w-full h-24 px-4 py-3 rounded-xl text-sm bg-white/[.06] border border-white/[.12] text-cosmos-50 placeholder-cosmos-100/40 resize-none"
          placeholder="Votre message..." value={msg} onChange={e=>setMsg(e.target.value)} maxLength={280} />
        <div className="text-right text-[10px] text-cosmos-100/50 mb-3">{msg.length}/280</div>

        <label className="flex items-center gap-2 text-sm text-cosmos-50 mb-2 cursor-pointer">
          <input type="checkbox" checked={anon} onChange={e=>setAnon(e.target.checked)} className="accent-em7 w-4 h-4"/>
          Rester anonyme
        </label>
        <label className="flex items-center gap-2 text-sm text-cosmos-50 mb-4 cursor-pointer">
          <input type="checkbox" checked={allowPub} onChange={e=>setAllowPub(e.target.checked)} className="accent-em7 w-4 h-4"/>
          J'autorise la publication
        </label>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/15 text-sm text-cosmos-100 hover:text-cosmos-50 transition-all cursor-pointer">Annuler</button>
          <button onClick={submit} disabled={!msg.trim()}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer
              ${msg.trim() ? 'bg-gradient-to-r from-purp7 to-em7 text-white hover:-translate-y-0.5' : 'bg-white/10 text-cosmos-100/50 cursor-not-allowed'}`}>
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
