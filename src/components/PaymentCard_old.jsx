import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fmtEuro, tourRow, DEMO_MODE } from '../data/businessData';

export default function PaymentCard() {
  const { active, stats, canPay, payCurrentTour, simulateIncomingPayment } = useApp();
  const [paying, setPaying] = useState(false);

  if (!active) return null;

  const row = tourRow(active.type, active.tour);
  const { finContribution, finConstellation, paiementEffectue, tourComplet } = stats;
  const membersCount = active.paidMembers.length;
  const maxM = active.maxMembers;

  // §1: Hard cap reached?
  const atCap = membersCount >= maxM;

  // Progress bar (money)
  const pctMoney = finContribution ? 100
    : (row.prochain > 0 ? Math.min(100, (stats.contributionsRecues / row.prochain) * 100) : 0);

  const handlePay = () => {
    if (!canPay) return;
    setPaying(true);
    setTimeout(() => { payCurrentTour(active.id); setPaying(false); }, 1200);
  };

  // Demo: simulate a member paying — §1: blocked if 3/3 or terminated
  const demoAddPayment = () => {
    if (finConstellation) return;
    if (atCap) return; // §1: hard stop at 3/3
    const names = ['Alice_FR', 'Bob_CH', 'Clara_BE', 'David_CI', 'Eve_SN', 'Frank_CM', 'Grace_TN'];
    const pays = ['France', 'Suisse', 'Belgique', "Côte d'Ivoire", 'Sénégal', 'Cameroun', 'Tunisie'];
    const idx = membersCount;
    const amountPerMember = Math.round(row.recu / maxM);
    simulateIncomingPayment(active.id, names[idx], pays[idx], amountPerMember);
  };

  // §1: Can still add members via demo?
  const canSimulate = DEMO_MODE && !finConstellation && !atCap;

  return (
    <div className="rounded-2xl p-5 border border-gold7/15 bg-gold7/[.04]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">💳</span>
        <span className="text-sm font-semibold text-cosmos-50 font-display">Prochain versement</span>
      </div>

      <div className="text-3xl font-extrabold text-em7 mb-1 font-display">
        {finContribution ? 'FIN' : fmtEuro(row.prochain)}
      </div>
      <div className="text-xs text-cosmos-100 mb-3">
        Tour {active.tour}/7
        {finConstellation && <span className="ml-2 text-em7 font-bold">🏆 Constellation terminée</span>}
        {finContribution && !finConstellation && <span className="ml-2 text-gold7 font-bold">⏳ En attente des derniers membres</span>}
      </div>

      {/* Money progress */}
      {!finContribution && (
        <div className="mb-3 p-3 rounded-xl bg-white/[.04] border border-white/[.06]">
          <div className="flex justify-between text-[11px] text-cosmos-100 mb-1.5">
            <span>Reçu : {fmtEuro(stats.contributionsRecues)}</span>
            <span>Requis : {fmtEuro(row.prochain)}</span>
          </div>
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pctMoney}%`,
                background: paiementEffectue ? '#00e5a0'
                  : pctMoney >= 100 ? '#00e5a0'
                  : 'linear-gradient(90deg, #f0c040, #ff8c00)',
              }} />
          </div>
          {paiementEffectue && (
            <p className="mt-1.5 text-[10px] text-em7 font-medium">✓ Contribution effectuée pour ce tour</p>
          )}
          {!paiementEffectue && !canPay && stats.contributionsRecues > 0 && (
            <p className="mt-1.5 text-[10px] text-gold7">
              ⚠️ Il manque {fmtEuro(row.prochain - stats.contributionsRecues)}
            </p>
          )}
        </div>
      )}

      {/* Members progress — §1: capped at maxM, never exceeds */}
      <div className="mb-4 p-3 rounded-xl bg-white/[.04] border border-white/[.06]">
        <div className="flex justify-between text-[11px] text-cosmos-100 mb-1.5">
          <span>Contributeurs du tour</span>
          <span className={tourComplet ? 'text-em7 font-bold' : ''}>
            {membersCount}/{maxM}
            {tourComplet && ' ✓'}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: maxM }).map((_, i) => (
            <div key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-300
                ${i < membersCount ? 'bg-em7' : 'bg-white/10'}`} />
          ))}
        </div>
        {!tourComplet && !finConstellation && (
          <p className="mt-1.5 text-[10px] text-cosmos-100/60">
            {maxM - membersCount} membre(s) restant(s)
          </p>
        )}
        {tourComplet && !paiementEffectue && !finContribution && (
          <p className="mt-1.5 text-[10px] text-gold7">
            Tour complet — faites votre contribution pour avancer
          </p>
        )}
        {tourComplet && paiementEffectue && active.tour < 7 && (
          <p className="mt-1.5 text-[10px] text-em7">
            ✓ Tour terminé — passage au tour suivant
          </p>
        )}
      </div>

      {/* Solde info */}
      {stats.soldeDisponible > 0 && (
        <div className="mb-3 text-[10px] text-cosmos-100/70 px-1">
          Solde disponible : <span className="text-gold7 font-semibold">{fmtEuro(stats.soldeDisponible)}</span>
          <span className="text-cosmos-100/40 ml-1">(surplus)</span>
        </div>
      )}

      {/* §4: Button text = "Faire ma contribution (X €)" */}
      {!finContribution && !paiementEffectue && (
        <button onClick={handlePay} disabled={!canPay || paying}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all font-display
            ${canPay && !paying
              ? 'bg-em7 text-cosmos-700 hover:bg-[#20ffb0] hover:-translate-y-0.5 cursor-pointer shadow-lg shadow-em7/20'
              : 'bg-white/10 text-cosmos-100/50 cursor-not-allowed'}`}>
          {paying
            ? <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Contribution en cours...
              </span>
            : canPay
              ? `Faire ma contribution (${fmtEuro(row.prochain)})`
              : 'Fonds insuffisants'}
        </button>
      )}

      {!finContribution && paiementEffectue && (
        <div className="w-full py-3 rounded-xl bg-em7/15 text-em7 font-bold text-sm text-center font-display">
          ✓ Contribution effectuée — {tourComplet ? 'Passage au tour suivant...' : `En attente ${maxM - membersCount} membre(s)`}
        </div>
      )}

      {finContribution && !finConstellation && (
        <div className="w-full py-3 rounded-xl bg-gold7/15 text-gold7 font-bold text-sm text-center font-display">
          ⏳ FIN des contributions — en attente {maxM - membersCount} membre(s)
        </div>
      )}

      {/* §3: Constellation terminée */}
      {finConstellation && (
        <div className="w-full py-3 rounded-xl bg-em7/15 text-em7 font-bold text-sm text-center font-display">
          🏆 Constellation terminée !
        </div>
      )}

      {/* Demo button — §1: disabled at cap or when terminated */}
      {canSimulate && (
        <button onClick={demoAddPayment}
          className="w-full mt-2 py-2 rounded-lg border border-dashed border-white/15 text-xs text-cosmos-100 hover:text-cosmos-50 hover:border-white/25 transition-all cursor-pointer">
          + Simuler un paiement entrant (démo)
        </button>
      )}
      {DEMO_MODE && !finConstellation && atCap && !paiementEffectue && (
        <div className="w-full mt-2 py-2 text-center text-[10px] text-cosmos-100/40">
          {maxM}/{maxM} — Maximum atteint pour ce tour
        </div>
      )}
    </div>
  );
}
