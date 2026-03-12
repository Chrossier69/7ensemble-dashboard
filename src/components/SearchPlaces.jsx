import { useState, useMemo } from 'react';
import { searchResults, maxMembers, COUNTRIES } from '../data/businessData';

export default function SearchPlaces({ onJoin }) {
  const [type, setType] = useState('triangulum');
  const [placesExact, setPlacesExact] = useState(null);
  const [pays, setPays] = useState('');
  const max = maxMembers(type);

  // §1 FIX: pass placesExact for STRICT equality filter
  const results = useMemo(() =>
    searchResults(type, {
      placesExact: placesExact || undefined,
      pays: pays || undefined,
    })
  , [type, placesExact, pays]);

  // §4: Reset places filter when switching type (3 vs 7 max)
  const switchType = (t) => {
    setType(t);
    setPlacesExact(null);
  };

  const clearFilters = () => { setPlacesExact(null); setPays(''); };

  return (
    <div className="rounded-2xl p-5 glass">
      <h3 className="text-base font-bold text-cosmos-50 mb-1 font-display">
        🔍 Rechercher des places
      </h3>
      <p className="text-[10px] text-cosmos-100/50 mb-4">
        Trouvez une constellation à rejoindre — paiement 21 € obligatoire
      </p>

      {/* §4: Type filter — Triangulum / Pléiade */}
      <div className="flex gap-2 mb-3">
        {['triangulum', 'pleiade'].map(t => (
          <button key={t} onClick={() => switchType(t)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer
              ${type === t
                ? (t === 'triangulum'
                  ? 'bg-coral7/15 border-coral7/30 text-coral7'
                  : 'bg-gold7/15 border-gold7/30 text-gold7')
                : 'bg-white/[.03] border-white/[.08] text-cosmos-100 hover:bg-white/[.06]'}`}>
            {t === 'triangulum' ? '▲ Triangulum' : '⭐ Pléiade'}
          </button>
        ))}
      </div>

      {/* §1: Places filter — STRICT: exactly N places */}
      <div className="mb-3">
        <div className="text-[11px] text-cosmos-100 mb-1.5 font-medium">
          Places manquantes :
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setPlacesExact(null)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer
              ${placesExact === null
                ? 'bg-white/10 text-cosmos-50'
                : 'text-cosmos-100 hover:text-cosmos-50'}`}>
            Toutes
          </button>
          {Array.from({ length: max }).map((_, i) => (
            <button key={i} onClick={() => setPlacesExact(i + 1)}
              className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer
                ${placesExact === i + 1
                  ? 'bg-em7 text-cosmos-700'
                  : 'bg-white/[.06] text-cosmos-100 hover:bg-white/[.1]'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Country filter */}
      <div className="mb-3">
        <div className="relative">
          <select
            className="w-full px-3 py-2 rounded-xl text-xs appearance-none cursor-pointer bg-white/[.06] border border-white/[.12] text-cosmos-50"
            value={pays} onChange={e => setPays(e.target.value)}>
            <option value="">Tous les pays</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cosmos-100 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>

      {/* Active filters — §1: shows "= N" not ">= N" */}
      {(placesExact || pays) && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {placesExact && (
            <span className="px-2 py-0.5 rounded-md text-[10px] bg-em7/15 text-em7">
              = {placesExact} place(s)
            </span>
          )}
          {pays && (
            <span className="px-2 py-0.5 rounded-md text-[10px] bg-purp7/15 text-purp7">
              {pays}
            </span>
          )}
          <button onClick={clearFilters}
            className="text-[10px] text-cosmos-100 hover:text-cosmos-50 underline cursor-pointer">
            Effacer
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="text-[11px] text-cosmos-100 mb-2">
        {results.length} constellation(s) disponible(s)
      </div>

      {/* Results list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {results.map(r => {
          const places = r.max - r.filled;
          const isTri = type === 'triangulum';
          return (
            <div key={r.id}
              className="p-3 rounded-xl bg-white/[.03] border border-white/[.06] hover:bg-white/[.05] transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${isTri ? 'text-coral7' : 'text-gold7'}`}>
                    {isTri ? '▲' : '⭐'}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-cosmos-50">{r.owner}</div>
                    <div className="text-[11px] text-cosmos-100">
                      {r.pays}{r.ville ? ` · ${r.ville}` : ''}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-cosmos-100">Tour {r.tour}/7</div>
                  <div className={`text-[10px] font-semibold ${places === 1 ? 'text-coral7' : places === 2 ? 'text-gold7' : 'text-em7'}`}>
                    {places} place(s)
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: r.max }).map((_, i) => (
                  <div key={i}
                    className={`h-1.5 flex-1 rounded-full ${i < r.filled ? 'bg-em7' : 'bg-white/10'}`} />
                ))}
              </div>
              <button onClick={() => onJoin && onJoin(r)}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-purp7 to-em7 text-white font-bold text-xs hover:-translate-y-0.5 transition-all cursor-pointer">
                Rejoindre — 21 €
              </button>
            </div>
          );
        })}
        {!results.length && (
          <div className="text-center py-6 text-xs text-cosmos-100/50">
            Aucune constellation avec ces critères
          </div>
        )}
      </div>
    </div>
  );
}
