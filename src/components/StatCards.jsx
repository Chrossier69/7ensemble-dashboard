import { useApp } from '../context/AppContext';
import { fmtEuro } from '../data/businessData';

// Format: always € for money fields, FIN only for prochaineContribution
function displayValue(key, value) {
  if (key === 'prochaineContribution') {
    return fmtEuro(value); // null → "FIN", number → "X €"
  }
  // All other fields: always numeric €, never "FIN"
  return fmtEuro(typeof value === 'number' ? value : 0);
}

const CARDS = [
  { k:'contributionsVersees',  l:'Contributions versées',   i:'🎁', c:'border-coral7/20 bg-coral7/[.06]',  t:'text-coral7' },
  { k:'contributionsRecues',   l:'Contributions reçues',    i:'💰', c:'border-em7/20 bg-em7/[.06]',        t:'text-em7' },
  { k:'prochaineContribution', l:'Prochaine contribution',  i:'📅', c:'border-cyan7/20 bg-cyan7/[.06]',    t:'text-cyan7' },
  { k:'soldeDisponible',       l:'Solde disponible',        i:'👁',  c:'border-gold7/20 bg-gold7/[.06]',    t:'text-gold7' },
];

export default function StatCards() {
  const { stats } = useApp();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {CARDS.map(cd => (
        <div key={cd.k} className={`rounded-2xl p-4 border transition-transform hover:-translate-y-0.5 ${cd.c}`}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-[11px] text-cosmos-100 mb-1 font-medium">{cd.l}</div>
              <div className={`text-xl sm:text-2xl font-extrabold font-display ${cd.t}`}>
                {displayValue(cd.k, stats[cd.k])}
              </div>
            </div>
            <div className="text-2xl opacity-50">{cd.i}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
