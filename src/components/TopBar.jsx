import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Portal from './Portal';

export default function TopBar() {
  const { user, constellations, active, triCount, pleCount, selectConstellation, logout } = useApp();
  const [profOpen, setProfOpen] = useState(false);
  const [altOpen, setAltOpen] = useState(false);
  const [triDrop, setTriDrop] = useState(false);
  const [pleDrop, setPleDrop] = useState(false);
  const profRef = useRef(null);
  const altRef = useRef(null);

  useEffect(() => {
    const h = e => {
      if (profRef.current && !profRef.current.contains(e.target)) setProfOpen(false);
      if (altRef.current && !altRef.current.contains(e.target)) setAltOpen(false);
      setTriDrop(false);
      setPleDrop(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!user) return null;

  // Only active, non-terminated constellations in dropdowns
  const triConsts = constellations.filter(c => c.type === 'triangulum' && c.initialPaid && !c.constellationTerminee);
  const pleConsts = constellations.filter(c => c.type === 'pleiade' && c.initialPaid && !c.constellationTerminee);

  // Dropdown list for constellation selection
  const ConsDrop = ({ items, open, onClose }) => {
    if (!open || !items.length) return null;
    return (
      <div className="absolute top-full mt-1 left-0 min-w-[220px] rounded-xl glass py-1 drop-in z-50"
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,.5)' }}>
        {items.map(c => (
          <button key={c.id}
            onClick={() => { selectConstellation(c.id); onClose(); }}
            className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer
              ${active?.id === c.id ? 'bg-white/[.06] text-cosmos-50' : 'text-cosmos-100 hover:bg-white/[.04]'}`}>
            <span className="font-medium">{c.pseudo || c.name}</span>
            <span className="text-[10px] text-cosmos-100">
              Tour {c.tour}/7 · {c.paidMembers.length}/{c.maxMembers}
            </span>
          </button>
        ))}
      </div>
    );
  };

  return (
    /* §3: Stable responsive header — fixed height, items wrap gracefully */
    <header className="relative z-30 border-b border-white/[.08] bg-cosmos-600/90 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-2.5 gap-2 min-h-[56px]">

        {/* Left: Logo + Title — §3: always aligned left, title hidden on small */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purp7 to-em7 flex items-center justify-center font-display font-black text-white text-sm shrink-0">7E</div>
          <span className="font-display font-bold text-sm text-cosmos-50 hidden md:inline whitespace-nowrap">Tableau de Bord</span>
        </div>

        {/* Center: Constellation selectors + Alcyone — wraps on mobile */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {/* §1: Triangulum — count = number of constellations, NOT contributors */}
          <div className="relative">
            <button onClick={e => { e.stopPropagation(); setTriDrop(!triDrop); setPleDrop(false); }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all text-xs font-medium cursor-pointer
                ${active?.type === 'triangulum' ? 'bg-white/[.08]' : 'hover:bg-white/[.04]'}`}>
              <span className="text-coral7">▲</span>
              <span className="text-cosmos-50 hidden sm:inline">Triangulum</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-coral7/15 text-coral7">{triCount}</span>
              {triCount > 0 && <svg className="w-3 h-3 text-cosmos-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>}
            </button>
            <ConsDrop items={triConsts} open={triDrop} onClose={() => setTriDrop(false)} />
          </div>

          {/* §1: Pléiade — count = number of constellations */}
          <div className="relative">
            <button onClick={e => { e.stopPropagation(); setPleDrop(!pleDrop); setTriDrop(false); }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all text-xs font-medium cursor-pointer
                ${active?.type === 'pleiade' ? 'bg-white/[.08]' : 'hover:bg-white/[.04]'}`}>
              <span className="text-gold7">⭐</span>
              <span className="text-cosmos-50 hidden sm:inline">Pléiade</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gold7/15 text-gold7">{pleCount}</span>
              {pleCount > 0 && <svg className="w-3 h-3 text-cosmos-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>}
            </button>
            <ConsDrop items={pleConsts} open={pleDrop} onClose={() => setPleDrop(false)} />
          </div>

          {/* §4: Active constellation — pseudo + name + tour + status */}
          {active && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[.05] border border-white/[.08]">
              <span className={`text-xs ${active.type === 'triangulum' ? 'text-coral7' : 'text-gold7'}`}>
                {active.type === 'triangulum' ? '▲' : '⭐'}
              </span>
              <span className="text-[11px] text-cosmos-50 font-medium whitespace-nowrap">
                {active.pseudo || user.pseudo}
              </span>
              <span className="text-[10px] text-cosmos-100/60">·</span>
              <span className="text-[10px] text-cosmos-100 whitespace-nowrap">
                {active.name}
              </span>
              <span className="text-[10px] text-cosmos-100/60">·</span>
              <span className="text-[10px] text-cosmos-100 whitespace-nowrap">
                T{active.tour}/7
              </span>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${
                active.constellationTerminee
                  ? 'bg-gold7/15 text-gold7'
                  : 'bg-em7/15 text-em7'
              }`}>
                {active.constellationTerminee ? 'Terminée' : 'Actif'}
              </span>
            </div>
          )}

          {/* Alcyone badge */}
          <div className="relative" ref={altRef}>
            <button onClick={e => { e.stopPropagation(); setAltOpen(!altOpen); }}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/[.04] hover:bg-white/[.08] transition-all text-xs cursor-pointer border border-white/[.06]">
              <span className="text-cyan7 text-[10px] font-bold shrink-0">ALC</span>
              <span className="text-cosmos-50 font-medium whitespace-nowrap">{user.alcyone || '—'}</span>
            </button>
            {altOpen && (
              <div className="absolute top-full mt-2 left-0 w-56 rounded-xl glass p-4 drop-in z-50"
                style={{ boxShadow: '0 12px 40px rgba(0,0,0,.5)' }}
                onClick={e => e.stopPropagation()}>
                <div className="text-xs font-bold text-cyan7 mb-3">Info Alcyone (parrain)</div>
                <div className="text-sm text-cosmos-50 break-all">{user.alcyone || '—'}</div>
                <p className="mt-3 text-[10px] text-cosmos-100/50">La personne qui vous a parrainé.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Profile — §2: email truncated, §3: stable width */}
        <div className="relative shrink-0" ref={profRef}>
          <button onClick={() => setProfOpen(!profOpen)}
            className="flex items-center gap-2 cursor-pointer hover:bg-white/[.04] rounded-lg px-2 py-1.5 transition-all">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-em7 to-purp7 flex items-center justify-center font-display font-bold text-white text-xs shrink-0">
              {user.pseudo[0]?.toUpperCase()}
            </div>
            <div className="text-left hidden sm:block max-w-[120px]">
              <div className="text-xs font-semibold text-cosmos-50 leading-tight truncate">{user.pseudo}</div>
              {/* §2: Email truncated with ellipsis */}
              <div className="text-[10px] text-cosmos-100 truncate">{user.email}</div>
            </div>
            <svg className={`w-3 h-3 text-cosmos-100 transition-transform shrink-0 ${profOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {profOpen && (
            <div className="absolute top-full mt-2 right-0 w-64 rounded-xl glass py-1.5 drop-in z-50"
              style={{ boxShadow: '0 12px 40px rgba(0,0,0,.5)' }}>
              {/* Profile section — §2: email wraps properly */}
              <div className="px-4 py-3 border-b border-white/[.08]">
                <div className="text-xs font-bold text-em7 mb-2">Mon profil</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-cosmos-100 shrink-0">Pseudo</span>
                    <span className="text-cosmos-50 font-medium text-right">{user.pseudo}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-cosmos-100 shrink-0">Nom</span>
                    <span className="text-cosmos-50 font-medium text-right">{user.prenom} {user.nom}</span>
                  </div>
                  {/* §2: Email wraps instead of overflowing */}
                  <div className="flex justify-between gap-2">
                    <span className="text-cosmos-100 shrink-0">Email</span>
                    <span className="text-cosmos-50 font-medium text-right text-[10px] break-all">{user.email}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-cosmos-100 shrink-0">Pays</span>
                    <span className="text-cosmos-50 font-medium text-right">{user.pays}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-cosmos-100 shrink-0">Alcyone</span>
                    <span className="text-cyan7 font-medium text-right break-all">{user.alcyone || '—'}</span>
                  </div>
                </div>
              </div>
              {/* Menu */}
              {[
                { l: 'Paramètres', i: '⚙️', a: () => { setProfOpen(false); window.dispatchEvent(new Event('open-settings')); } },
                { l: 'Laisse-nous un mot', i: '💬', a: () => { setProfOpen(false); window.dispatchEvent(new Event('open-testimonial')); } },
                { l: 'Déconnexion', i: '🚪', a: logout, danger: true },
              ].map(it => (
                <button key={it.l} onClick={it.a}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors cursor-pointer
                    ${it.danger ? 'text-coral7 hover:bg-coral7/10' : 'text-cosmos-50 hover:bg-white/[.06]'}`}>
                  <span>{it.i}</span><span>{it.l}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
