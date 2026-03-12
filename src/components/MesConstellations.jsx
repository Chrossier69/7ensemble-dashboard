import { useState } from 'react';
import { useApp } from '../context/AppContext';
import PaymentScreen from './PaymentScreen';
import Portal from './Portal';

export default function MesConstellations() {
  const { constellations, active, selectConstellation, createNewConstellation, isPseudoTaken } = useApp();
  const [filter, setFilter] = useState(null);

  // Multi-step new constellation flow
  const [step, setStep] = useState(null);
  const [newType, setNewType] = useState('triangulum');
  const [newPseudo, setNewPseudo] = useState('');
  const [newAlcyone, setNewAlcyone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [credErrors, setCredErrors] = useState({});
  const [payingId, setPayingId] = useState(null);

  const filtered = filter ? constellations.filter(c => c.type === filter) : constellations;

  const openNew = () => {
    setStep('type');
    setNewType('triangulum');
    setNewPseudo('');
    setNewAlcyone(constellations.length === 0 ? 'MERCI_L_UNIVERS' : '');
    setNewPassword('');
    setCredErrors({});
  };

  const validateCredentials = () => {
    const e = {};
    if (!newPseudo.trim()) e.pseudo = 'Pseudo requis';
    else if (newPseudo.trim().length < 3) e.pseudo = 'Min. 3 caractères';
    else if (isPseudoTaken(newPseudo)) e.pseudo = 'Ce pseudo est déjà utilisé';
    if (!newAlcyone.trim()) e.alcyone = 'Alcyone requis (pseudo de votre parrain)';
    if (!newPassword.trim()) e.password = 'Mot de passe requis';
    else if (newPassword.length < 6) e.password = 'Min. 6 caractères';
    return e;
  };

  const goToPayment = () => {
    const e = validateCredentials();
    if (Object.keys(e).length) { setCredErrors(e); return; }
    const c = createNewConstellation(newType, newPseudo.trim(), newAlcyone.trim());
    setStep(null);
    setPayingId(c.id);
  };

  const closeModal = () => setStep(null);

  return (
    <div className="rounded-2xl p-5 glass">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-cosmos-50 font-display">Mes constellations</h3>
        <button onClick={openNew}
          className="px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold text-cosmos-50 hover:border-em7/50 hover:text-em7 transition-all cursor-pointer">
          + Nouvelle
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 mb-3">
        {[{ v: null, l: 'Toutes' }, { v: 'triangulum', l: '▲ Tri' }, { v: 'pleiade', l: '⭐ Plé' }].map(f => (
          <button key={f.l} onClick={() => setFilter(f.v)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer
              ${filter === f.v ? 'bg-white/10 text-cosmos-50' : 'text-cosmos-100 hover:text-cosmos-50'}`}>{f.l}</button>
        ))}
      </div>

      {/* FIX #2: List shows ALL constellations, status always "Actif" once created */}
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
                  <div className="text-sm font-semibold text-cosmos-50">{c.pseudo || c.name}</div>
                  <div className="text-xs text-cosmos-100">Tour {c.tour}/7</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-[11px] font-semibold px-2 py-0.5 rounded-md inline-block
                  ${c.constellationTerminee ? 'bg-gold7/15 text-gold7' : 'bg-em7/15 text-em7'}`}>
                  {c.constellationTerminee ? '🏆 Terminée' : 'Actif'}
                </div>
              </div>
            </button>
          );
        })}
        {!filtered.length && <div className="text-center py-4 text-xs text-cosmos-100/50">Aucune constellation</div>}
      </div>

      {/* ═══════════════════════════════════════════════
          FIX #1: All modals rendered via Portal (at body root)
          so they escape the glass stacking context
         ═══════════════════════════════════════════════ */}

      {/* STEP 1: Choose type */}
      {step === 'type' && (
        <Portal>
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 9999 }} onClick={closeModal}>
            <div className="w-full max-w-sm mx-4 rounded-2xl p-6 glass page-in" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-cosmos-50 mb-4 font-display">Nouvelle constellation</h3>
              <p className="text-xs text-cosmos-100 mb-4">Étape 1/3 — Choisir le type</p>
              <div className="space-y-3 mb-5">
                {['triangulum', 'pleiade'].map(t => (
                  <button key={t} type="button" onClick={() => setNewType(t)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all border text-left
                      ${newType === t ? 'border-em7/50 bg-em7/[.06]' : 'border-white/10 hover:border-white/20'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${newType === t ? 'border-em7' : 'border-cosmos-100'}`}>
                      {newType === t && <div className="w-2.5 h-2.5 rounded-full bg-em7" />}
                    </div>
                    <span className="text-sm text-cosmos-50">{t === 'triangulum' ? '▲ Triangulum (3 personnes)' : '⭐ Pléiade (7 personnes)'}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-white/15 text-sm text-cosmos-100 hover:text-cosmos-50 transition-all cursor-pointer">Annuler</button>
                <button onClick={() => setStep('credentials')} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purp7 to-em7 text-white font-bold text-sm hover:-translate-y-0.5 transition-all cursor-pointer">Suivant →</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* STEP 2: Credentials */}
      {step === 'credentials' && (
        <Portal>
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 9999 }} onClick={closeModal}>
            <div className="w-full max-w-sm mx-4 rounded-2xl p-6 glass page-in" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-cosmos-50 mb-2 font-display">Identifiants constellation</h3>
              <p className="text-xs text-cosmos-100 mb-4">Étape 2/3 — Pseudo et mot de passe</p>
              <div className="mb-3">
                <label className="block mb-1 text-xs font-semibold text-em7">Pseudo <span className="text-coral7">*</span></label>
                <input type="text"
                  className={`w-full px-4 py-3 rounded-xl text-sm bg-white/[.06] border ${credErrors.pseudo ? 'border-coral7/60' : 'border-white/[.12]'} text-cosmos-50 placeholder-cosmos-100/40`}
                  placeholder="Pseudo pour cette constellation" value={newPseudo}
                  onChange={e => { setNewPseudo(e.target.value); if (credErrors.pseudo) setCredErrors(p => { const n = { ...p }; delete n.pseudo; return n; }); }} />
                {credErrors.pseudo && <p className="mt-1 text-xs text-coral7">{credErrors.pseudo}</p>}
              </div>
              <div className="mb-3">
                <label className="block mb-1 text-xs font-semibold text-em7">Mon Alcyone <span className="text-coral7">*</span></label>
                <input type="text"
                  className={`w-full px-4 py-3 rounded-xl text-sm bg-white/[.06] border ${credErrors.alcyone ? 'border-coral7/60' : 'border-white/[.12]'} text-cosmos-50 placeholder-cosmos-100/40`}
                  placeholder="Pseudo de votre parrain" value={newAlcyone}
                  onChange={e => { setNewAlcyone(e.target.value); if (credErrors.alcyone) setCredErrors(p => { const n = { ...p }; delete n.alcyone; return n; }); }} />
                {credErrors.alcyone && <p className="mt-1 text-xs text-coral7">{credErrors.alcyone}</p>}
              </div>
              <div className="mb-5">
                <label className="block mb-1 text-xs font-semibold text-em7">Mot de passe <span className="text-coral7">*</span></label>
                <input type="password"
                  className={`w-full px-4 py-3 rounded-xl text-sm bg-white/[.06] border ${credErrors.password ? 'border-coral7/60' : 'border-white/[.12]'} text-cosmos-50 placeholder-cosmos-100/40`}
                  placeholder="Minimum 6 caractères" value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); if (credErrors.password) setCredErrors(p => { const n = { ...p }; delete n.password; return n; }); }} />
                {credErrors.password && <p className="mt-1 text-xs text-coral7">{credErrors.password}</p>}
              </div>
              <div className="rounded-xl p-2.5 mb-4 text-center bg-gold7/10 border border-gold7/20 select-none pointer-events-none">
                <span className="text-xs text-gold7">💳 Un paiement de <strong>21 €</strong> sera nécessaire à l'étape suivante</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('type')} className="flex-1 py-2.5 rounded-xl border border-white/15 text-sm text-cosmos-100 hover:text-cosmos-50 transition-all cursor-pointer">← Retour</button>
                <button onClick={goToPayment} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purp7 to-em7 text-white font-bold text-sm hover:-translate-y-0.5 transition-all cursor-pointer">Payer 21 € →</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* STEP 3: Payment — PaymentScreen already uses fixed positioning */}
      {payingId && (
        <Portal>
          <PaymentScreen constId={payingId} onDone={() => setPayingId(null)} />
        </Portal>
      )}
    </div>
  );
}
