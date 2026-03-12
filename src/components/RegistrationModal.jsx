import { useState, useRef, useEffect } from 'react';
import { COUNTRIES, PAY_METHODS, TRI_GAIN, PLE_GAIN } from '../data/businessData';
import { useApp } from '../context/AppContext';

// ═══════════════════════════════════════════════════════════
//  FIX #1 — Input components OUTSIDE the parent component
//  so React never remounts them on parent re-render.
//  This was the cause of "can only type 1 character" bug.
// ═══════════════════════════════════════════════════════════

function FormInput({ label, name, type, placeholder, required, value, error, onChange }) {
  return (
    <div className="mb-3.5">
      <label className="block mb-1 text-xs font-semibold tracking-wide text-em7">
        {label} {required && <span className="text-coral7">*</span>}
      </label>
      <input
        type={type || 'text'}
        name={name}
        className={`w-full px-4 py-3 rounded-xl text-sm bg-white/[.06] border
          ${error ? 'border-coral7/60 bg-coral7/[.05]' : 'border-white/[.12]'}
          text-cosmos-50 placeholder-cosmos-100/40`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="off"
      />
      {error && <p className="mt-1 text-xs text-coral7">{error}</p>}
    </div>
  );
}

function FormSelect({ label, name, options, placeholder, required, value, error, onChange }) {
  return (
    <div className="mb-3.5">
      <label className="block mb-1 text-xs font-semibold tracking-wide text-em7">
        {label} {required && <span className="text-coral7">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          className={`w-full px-4 py-3 rounded-xl text-sm appearance-none cursor-pointer bg-white/[.06] border
            ${error ? 'border-coral7/60' : 'border-white/[.12]'} text-cosmos-50`}
          value={value}
          onChange={onChange}
        >
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cosmos-100 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {error && <p className="mt-1 text-xs text-coral7">{error}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MAIN MODAL
// ═══════════════════════════════════════════════════════════

export default function RegistrationModal({ onClose, onNeedPayment }) {
  const { register, isPseudoTaken } = useApp();
  const [form, setForm] = useState({
    alcyone: '', prenom: '', nom: '', email: '', pseudo: '', password: '',
    pays: '', paiement: '', accept: false, option: 'triangulum',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Single handler for all inputs — uses `name` attribute
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const v = type === 'checkbox' ? checked : value;
    setForm(prev => ({ ...prev, [name]: v }));
    if (errors[name]) {
      setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const validate = () => {
    const e = {};
    // FIX #3: Alcyone OBLIGATOIRE
    if (!form.alcyone.trim()) e.alcyone = 'Alcyone requis — pseudo de votre parrain';
    if (!form.prenom.trim()) e.prenom = 'Prénom requis';
    if (!form.nom.trim()) e.nom = 'Nom requis';
    if (!form.email.trim()) e.email = 'Email requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide';
    if (!form.pseudo.trim()) e.pseudo = 'Pseudo requis';
    else if (form.pseudo.length < 3) e.pseudo = 'Min. 3 caractères';
    if (!form.password.trim()) e.password = 'Mot de passe requis';
    else if (form.password.length < 6) e.password = 'Min. 6 caractères';
    if (!form.pays) e.pays = 'Pays requis';
    if (!form.paiement) e.paiement = 'Mode de paiement requis';
    if (!form.accept) e.accept = "Veuillez accepter le système d'entraide";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    // §3: Check pseudo uniqueness before submit
    if (isPseudoTaken(form.pseudo)) {
      e.pseudo = 'Ce pseudo est déjà utilisé. Choisissez-en un autre.';
    }
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setBusy(true);
    setTimeout(() => {
      const result = register(form);
      setBusy(false);
      if (result && result.error === 'pseudo_taken') {
        setErrors({ pseudo: 'Ce pseudo est déjà utilisé.' });
        return;
      }
      onNeedPayment(result.id);
    }, 600);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md"
      style={{ zIndex: 9999 }} onClick={onClose}>
      <div ref={modalRef}
        className="w-full max-w-[460px] max-h-[92vh] overflow-y-auto mx-4 rounded-2xl p-7 page-in relative"
        style={{
          background: 'linear-gradient(160deg, rgba(15,15,50,.97), rgba(10,10,30,.98))',
          border: '1px solid rgba(120,120,220,.2)',
          boxShadow: '0 30px 80px rgba(0,0,0,.6), 0 0 60px rgba(124,92,252,.12)',
        }}
        onClick={e => e.stopPropagation()}>

        <button onClick={onClose}
          className="absolute top-4 right-4 text-cosmos-100 hover:text-cosmos-50 text-xl p-1 cursor-pointer">✕</button>

        <h2 className="text-center text-2xl font-bold font-display text-cosmos-50 mb-6">
          <span className="text-gold7">🌟</span> Rejoindre 7 Ensemble <span className="text-gold7">🌟</span>
        </h2>

        {/* FIX #3: Alcyone = obligatoire */}
        <FormInput label="Mon Alcyone" name="alcyone" placeholder="Pseudo de votre parrain/marraine" required
          value={form.alcyone} error={errors.alcyone} onChange={handleChange} />

        <FormInput label="Prénom" name="prenom" placeholder="Votre prénom" required
          value={form.prenom} error={errors.prenom} onChange={handleChange} />

        <FormInput label="Nom" name="nom" placeholder="Votre nom de famille" required
          value={form.nom} error={errors.nom} onChange={handleChange} />

        <FormInput label="Email" name="email" type="email" placeholder="votre@email.com" required
          value={form.email} error={errors.email} onChange={handleChange} />

        <FormInput label="Pseudo" name="pseudo" placeholder="Votre pseudo unique" required
          value={form.pseudo} error={errors.pseudo} onChange={handleChange} />

        <FormInput label="Mot de passe" name="password" type="password" placeholder="Minimum 6 caractères" required
          value={form.password} error={errors.password} onChange={handleChange} />

        <FormSelect label="Pays" name="pays" options={COUNTRIES} placeholder="Choisir votre pays" required
          value={form.pays} error={errors.pays} onChange={handleChange} />

        {/* FIX #5: simplified payment methods */}
        <FormSelect label="Mode de paiement préféré" name="paiement" options={PAY_METHODS}
          placeholder="Choisir votre méthode" required
          value={form.paiement} error={errors.paiement} onChange={handleChange} />

        {/* Checkbox */}
        <div className="mb-5">
          <label className="flex items-start gap-3 cursor-pointer text-sm text-cosmos-50 leading-relaxed">
            <input type="checkbox" name="accept" checked={form.accept} onChange={handleChange}
              className="mt-0.5 w-5 h-5 shrink-0 accent-em7 rounded" />
            <span>J'accepte le système d'entraide 7 Ensemble et comprends le principe de solidarité mutuelle. <span className="text-coral7">*</span></span>
          </label>
          {errors.accept && <p className="ml-8 mt-1 text-xs text-coral7">{errors.accept}</p>}
        </div>

        {/* Option choice */}
        <div className="text-center mb-5">
          <div className="text-sm font-semibold text-cosmos-50 mb-3">✨ Choisir mon option ✨</div>
          {[
            { v: 'triangulum', l: `Option Triangulum (3 pers.) → ${TRI_GAIN}`, i: '▲' },
            { v: 'pleiade', l: `Option Pléiade (7 pers.) → ${PLE_GAIN}`, i: '⭐' },
          ].map(o => (
            <button key={o.v} type="button"
              onClick={() => setForm(p => ({ ...p, option: o.v }))}
              className={`w-full flex items-center gap-3 p-3.5 mb-2.5 rounded-xl cursor-pointer transition-all border text-left
                ${form.option === o.v ? 'border-em7/50 bg-em7/[.06]' : 'border-white/[.1] hover:border-white/[.2]'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                ${form.option === o.v ? 'border-em7' : 'border-cosmos-100'}`}>
                {form.option === o.v && <div className="w-2.5 h-2.5 rounded-full bg-em7" />}
              </div>
              <span className="text-sm text-cosmos-50">{o.i} {o.l}</span>
            </button>
          ))}
        </div>

        {/* FIX #5: Info badge — purely informational, NOT a button */}
        <div className="rounded-xl py-2.5 px-4 mb-5 bg-gold7/[.07] border border-gold7/15 pointer-events-none select-none flex items-center justify-center gap-2">
          <span className="text-gold7 text-base">💳</span>
          <span className="text-xs text-gold7/80">
            Paiement initial de <strong className="text-gold7">21 €</strong> requis à l'inscription
          </span>
        </div>

        {/* THE real submit button */}
        <button onClick={handleSubmit} disabled={busy}
          className={`w-full py-4 rounded-xl text-white font-bold text-base transition-all font-display
            ${busy ? 'bg-purp7/40 cursor-wait' : 'bg-gradient-to-r from-purp7 via-cyan7 to-em7 hover:shadow-lg hover:shadow-purp7/30 hover:-translate-y-0.5 cursor-pointer'}`}>
          {busy ? '⏳ Création en cours...' : '🚀 Créer ma constellation'}
        </button>

        <p className="text-center mt-3 text-xs text-cosmos-100/60">Bravo, votre aventure commence ici 💖</p>
      </div>
    </div>
  );
}
