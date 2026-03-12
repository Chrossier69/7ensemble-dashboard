import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fmtEuro } from '../data/businessData';
import Portal from './Portal';

/**
 * §4 Join Flow:
 * 1. Confirmation page (constellation details + 21€ info)
 * 2. Payment (simulated — ready for Stripe)
 * 3. Auto-add to dashboard
 * 4. Emails marked as "to send" (backend hook)
 */
export default function JoinFlow({ constellation, onDone, onCancel }) {
  const { user, joinConstellation } = useApp();
  const [step, setStep] = useState('confirm'); // confirm | paying | done
  const isTri = constellation.max === 3;
  const places = constellation.max - constellation.filled;

  const handlePay = () => {
    setStep('paying');
    // §4: Simulated payment — replace with Stripe checkout
    setTimeout(() => {
      // Add user to constellation + create in dashboard
      joinConstellation(constellation);
      setStep('done');
      // §4: Emails to send (backend hook)
      console.log('[EMAIL] Confirmation → ', user?.email);
      console.log('[EMAIL] Notification → ', constellation.owner, '(place prise)');
      setTimeout(onDone, 1500);
    }, 2000);
  };

  return (
    <Portal>
      <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md"
        style={{ zIndex: 9999 }} onClick={onCancel}>
        <div className="w-full max-w-md mx-4 rounded-2xl p-6 glass page-in"
          onClick={e => e.stopPropagation()}>

          {/* STEP 1: Confirm */}
          {step === 'confirm' && (
            <>
              <h3 className="text-lg font-bold text-cosmos-50 mb-4 font-display text-center">
                Rejoindre une constellation
              </h3>
              <div className="rounded-xl bg-white/[.04] border border-white/[.08] p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-2xl ${isTri ? 'text-coral7' : 'text-gold7'}`}>
                    {isTri ? '▲' : '⭐'}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-cosmos-50">
                      {isTri ? 'Triangulum' : 'Pléiade'} — {constellation.owner}
                    </div>
                    <div className="text-xs text-cosmos-100">{constellation.pays}</div>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-cosmos-100">Tour actuel</span>
                    <span className="text-cosmos-50">{constellation.tour}/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cosmos-100">Places disponibles</span>
                    <span className="text-em7 font-semibold">{places}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cosmos-100">Membres actuels</span>
                    <span className="text-cosmos-50">{constellation.filled}/{constellation.max}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gold7/10 border border-gold7/20 p-3 mb-4 text-center">
                <div className="text-2xl font-extrabold text-gold7 mb-1">21 €</div>
                <div className="text-xs text-gold7/70">Paiement initial obligatoire</div>
              </div>

              <p className="text-[10px] text-cosmos-100/60 text-center mb-4">
                En rejoignant, vous vous engagez dans le système d'entraide 7 Ensemble.
                La constellation apparaîtra dans votre dashboard après paiement.
              </p>

              <div className="flex gap-3">
                <button onClick={onCancel}
                  className="flex-1 py-3 rounded-xl border border-white/15 text-sm text-cosmos-100 hover:text-cosmos-50 transition-all cursor-pointer">
                  Annuler
                </button>
                <button onClick={handlePay}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purp7 via-cyan7 to-em7 text-white font-bold text-sm hover:-translate-y-0.5 transition-all cursor-pointer">
                  Payer 21 € et rejoindre
                </button>
              </div>
            </>
          )}

          {/* STEP 2: Processing */}
          {step === 'paying' && (
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto mb-4 border-3 border-em7 border-t-transparent rounded-full animate-spin" />
              <h3 className="text-lg font-bold text-cosmos-50 mb-2 font-display">Paiement en cours...</h3>
              <p className="text-xs text-cosmos-100">Connexion au système de paiement</p>
              <p className="text-[10px] text-cosmos-100/40 mt-2">
                💳 {user?.paiement || 'Carte bancaire (Stripe)'}
              </p>
            </div>
          )}

          {/* STEP 3: Done */}
          {step === 'done' && (
            <div className="text-center py-6 drop-in">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-lg font-bold text-em7 mb-2 font-display">Bienvenue !</h3>
              <p className="text-sm text-cosmos-100 mb-1">
                Vous avez rejoint la constellation de {constellation.owner}
              </p>
              <p className="text-xs text-cosmos-100/60">
                Elle apparaît maintenant dans votre dashboard.
              </p>
              <div className="mt-3 space-y-1 text-[10px] text-cosmos-100/40">
                <div>📧 Email de confirmation envoyé à {user?.email}</div>
                <div>📧 Notification envoyée à {constellation.owner}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
