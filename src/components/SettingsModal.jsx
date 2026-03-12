import { useState } from 'react';
import Portal from './Portal';

export default function SettingsModal({ onClose }) {
  const [lang, setLang] = useState(localStorage.getItem('7e_lang') || 'fr');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('7e_lang', lang);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  };

  return (
    <Portal>
      <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        style={{ zIndex: 9999 }} onClick={onClose}>
        <div className="w-full max-w-sm mx-4 rounded-2xl p-6 glass page-in" onClick={e => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-cosmos-50 mb-4 font-display">⚙️ Paramètres</h3>

          {/* Language */}
          <div className="mb-5">
            <label className="block mb-2 text-xs font-semibold text-em7">Langue / Language</label>
            <div className="flex gap-2">
              {[
                { v: 'fr', l: '🇫🇷 Français', active: lang === 'fr' },
                { v: 'en', l: '🇬🇧 English', active: lang === 'en' },
              ].map(opt => (
                <button key={opt.v} onClick={() => setLang(opt.v)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all border cursor-pointer
                    ${opt.active
                      ? 'bg-em7/15 border-em7/40 text-em7'
                      : 'bg-white/[.03] border-white/[.1] text-cosmos-100 hover:border-white/[.2]'
                    }`}>
                  {opt.l}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-cosmos-100/50">
              {lang === 'en'
                ? 'Full English translation coming soon. Interface will stay in French for now.'
                : 'La traduction complète sera disponible prochainement.'}
            </p>
          </div>

          {/* Placeholder for future settings */}
          <div className="mb-5 p-3 rounded-xl bg-white/[.03] border border-white/[.06]">
            <div className="text-xs text-cosmos-100/60 text-center">
              D'autres paramètres seront ajoutés ici :
              notifications, thème, sécurité...
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/15 text-sm text-cosmos-100 hover:text-cosmos-50 transition-all cursor-pointer">
              Annuler
            </button>
            <button onClick={handleSave}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer
                ${saved
                  ? 'bg-em7/20 text-em7'
                  : 'bg-gradient-to-r from-purp7 to-em7 text-white hover:-translate-y-0.5'
                }`}>
              {saved ? '✓ Enregistré' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
