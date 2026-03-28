import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { backendApi } from '../data/backendApi';
import Portal from './Portal';

export default function MesConstellations() {
  const { constellations, active, selectConstellation, createNewConstellation } = useApp();
  const [step, setStep] = useState(null); // null | 'type' | 'credentials' | 'paying'
  const [newType, setNewType] = useState('triangulum');
  const [newPseudo, setNewPseudo] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [credErrors, setCredErrors] = useState({});

  const filtered = constellations;

  // Step 1: Choose type
  const startNew = () => setStep('type');

  // Step 2: Enter credentials
  const selectType = (t) => { setNewType(t); setStep('credentials'); };

  // Step 3: Validate and trigger payment
  const validateAndPay = async () => {
    const e = {};
    if (newPseudo.trim().length < 3) e.pseudo = 'Minimum 3 caractères';
    if (newPassword.length < 6) e.password = 'Minimum 6 caractères';
    if (Object.keys(e).length) { setCredErrors(e); return; }

    // Create the constellation locally
    const c = createNewConstellation(newType);
    setStep(null);
    setNewPseudo('');
    setNewPassword('');
    setCredErrors({});

    // Dispatch event to trigger Stripe payment in DashboardPage
    window.dispatchEvent(new CustomEvent('new-constellation-payment', {
      detail: { constId: c.id },
    }));
  };

  return (
    <div className="rounded-2xl p-5 glass">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-cosmos-50 font-display">Mes constellations</h3>
        <button onClick={startNew}
          className="px-3 py-1.5 rounded-lg bg-white/[.06] text-xs text-cosmos-100 hover:text-cosmos-50 hover:bg-white/[.1] transition-all cursor-pointer border border-white/[.08]">
          + Nouvelle
        </button>
      </div>

      {/* List */}
      <div className="space-y-2 max-h-[260px] overflow-y-auto">
        {filtered.map(c => {
          const isAct = active?.id === c.id;
          const isTri = c.type === 'triangulum';
          return (
            <button key={c.id} onClick={() => selectConstellation(c.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer text-left
                ${isAct ? 'bg-white/[.06] border border-white/[.12]' : 'hover:bg-white/[.04] border border-transparent'}`}>
              <div className="flex items-center gap-2.5">
                <span className={`text-lg ${isTri ? 'text-coral7' : 'text-gold7'}`}>{isTri ? '▲' : '⭐'}</span>
                <div>
                  <div className="text-sm font-semibold text-cosmos-50">{c.name}</div>
                  <div className="text-xs text-cosmos-100">Tour {c.tour}/7</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-[11px] font-semibold px-2 py-0.5 rounded-md inline-block
                  ${c.constellationTerminee ? 'bg-gold7/15 text-gold7'
                    : !c.initialPaid ? 'bg-coral7/15 text-coral7'
                    : 'bg-em7/15 text-em7'}`}>
                  {c.constellationTerminee ? '🏆 Terminée' : !c.initialPaid ? '⏳ Paiement requis' : 'Actif'}
                </div>
              </div>
            </button>
          );
        })}
        {!filtered.length && <div className="text-center py-4 text-xs text-cosmos-100/50">Aucune constellation</div>}
      </div>

      {/* Step modals */}
      {step === 'type' && (
        <Portal>
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm" style={{ zIndex: 9999 }} onClick={() => setStep(null)}>
            <div className="w-full max-w-sm mx-4 rounded-2xl p-6 glass page-in" onClick={e => e.stopPropagation()}>
              <h4 className="text-base font-bold text-cosmos-50 mb-4 font-display text-center">Nouvelle constellation</h4>
              <p className="text-xs text-cosmos-100 text-center mb-4">Étape 1/3 — Choisir le type</p>
              <div className="space-y-2">
                <button onClick={() => selectType('triangulum')}
                  className="w-full p-4 rounded-xl bg-white/[.04] border border-white/[.08] hover:border-coral7/30 transition-all cursor-pointer text-left">
                  <span className="text-coral7 text-lg mr-2">▲</span>
                  <span className="text-cosmos-50 font-semibold">Triangulum</span>
                  <span className="text-cosmos-100 text-xs ml-2">3 membres</span>
                </button>
                <button onClick={() => selectType('pleiade')}
                  className="w-full p-4 rounded-xl bg-white/[.04] border border-white/[.08] hover:border-gold7/30 transition-all cursor-pointer text-left">
                  <span className="text-gold7 text-lg mr-2">⭐</span>
                  <span className="text-cosmos-50 font-semibold">Pléiade</span>
                  <span className="text-cosmos-100 text-xs ml-2">7 membres</span>
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {step === 'credentials' && (
        <Portal>
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm" style={{ zIndex: 9999 }} onClick={() => setStep(null)}>
            <div className="w-full max-w-sm mx-4 rounded-2xl p-6 glass page-in" onClick={e => e.stopPropagation()}>
              <h4 className="text-base font-bold text-cosmos-50 mb-4 font-display text-center">Nouvelle constellation</h4>
              <p className="text-xs text-cosmos-100 text-center mb-4">Étape 2/3 — Pseudo et mot de passe</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-cosmos-100 mb-1 block">Pseudo pour cette constellation</label>
                  <input value={newPseudo} onChange={e => setNewPseudo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[.06] border border-white/[.12] text-sm text-cosmos-50"
                    placeholder="Minimum 3 caractères" />
                  {credErrors.pseudo && <p className="text-xs text-coral7 mt-1">{credErrors.pseudo}</p>}
                </div>
                <div>
                  <label className="text-xs text-cosmos-100 mb-1 block">Mot de passe</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/[.06] border border-white/[.12] text-sm text-cosmos-50"
                    placeholder="Minimum 6 caractères" />
                  {credErrors.password && <p className="text-xs text-coral7 mt-1">{credErrors.password}</p>}
                </div>
              </div>
              <button onClick={validateAndPay}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-purp7 to-em7 text-white font-bold text-sm cursor-pointer hover:-translate-y-0.5 transition-all">
                Continuer vers le paiement →
              </button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
