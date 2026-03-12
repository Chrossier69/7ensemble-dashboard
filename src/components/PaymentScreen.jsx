import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PaymentScreen({ constId, onDone }) {
  const { payInitial, user } = useApp();
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      payInitial(constId);
      setProcessing(false);
      setDone(true);
      setTimeout(onDone, 1200);
    }, 1800);
  };

  if (done) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md" style={{zIndex:9999}}>
        <div className="w-full max-w-md mx-4 rounded-2xl p-8 glass page-in text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-em7 mb-2 font-display">Paiement confirmé !</h2>
          <p className="text-sm text-cosmos-100">Votre compte est activé. Redirection...</p>
          <div className="mt-4 flex justify-center">
            <div className="w-8 h-8 border-2 border-em7 border-t-transparent rounded-full animate-spin"/>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md" style={{zIndex:9999}}>
      <div className="w-full max-w-md mx-4 rounded-2xl p-8 glass page-in" onClick={e=>e.stopPropagation()}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold7/20 to-em7/20 flex items-center justify-center text-3xl">💳</div>
          <h2 className="text-xl font-bold text-cosmos-50 mb-2 font-display">Paiement initial</h2>
          <p className="text-sm text-cosmos-100 mb-6">
            Pour activer votre constellation et accéder au dashboard, veuillez effectuer le paiement initial.
          </p>
          <div className="rounded-xl bg-em7/10 border border-em7/20 p-4 mb-6">
            <div className="text-3xl font-extrabold text-em7 mb-1">21 €</div>
            <div className="text-xs text-cosmos-100">Contribution initiale – Tour 1</div>
          </div>
          {user?.paiement && (
            <div className="text-left mb-6 rounded-xl bg-white/[.04] border border-white/[.08] p-4">
              <div className="text-xs font-semibold text-cosmos-100 mb-1">Mode de paiement</div>
              <div className="text-sm text-cosmos-50 font-medium">{user.paiement}</div>
            </div>
          )}
          <button onClick={handlePay} disabled={processing}
            className={`w-full py-4 rounded-xl text-white font-bold text-base transition-all font-display
              ${processing
                ? 'bg-purp7/40 cursor-wait'
                : 'bg-gradient-to-r from-purp7 via-cyan7 to-em7 hover:shadow-lg hover:shadow-purp7/30 hover:-translate-y-0.5 cursor-pointer'}`}>
            {processing
              ? <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Traitement en cours...
                </span>
              : 'Payer 21 € maintenant'}
          </button>
          <p className="mt-3 text-xs text-cosmos-100/60">Paiement simulé pour la démo</p>
        </div>
      </div>
    </div>
  );
}
