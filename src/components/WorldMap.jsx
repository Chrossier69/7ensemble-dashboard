import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MAP_POINTS, mapPointStats, TOUR_COLORS, DEMO_MODE } from '../data/businessData';
function toXY(lat, lng) {
  return { x: ((lng + 180) / 360) * 100, y: ((90 - lat) / 180) * 100 };
}

// §2: Triangle shape for Triangulum points
function TriangleMarker({ size, color, opacity }) {
  const h = size * 1.1;
  const half = size * 0.6;
  return (
    <svg width={size * 1.2} height={h} viewBox={`0 0 ${size * 1.2} ${h}`}
      style={{ opacity, filter: `drop-shadow(0 0 ${size}px ${color}55)` }}>
      <polygon
        points={`${size * 0.6},0 ${size * 1.2},${h} 0,${h}`}
        fill={color} />
    </svg>
  );
}

// §2: Star shape for Pléiade points
function StarMarker({ size, color, opacity }) {
  const r = size * 0.6;
  const ri = r * 0.4;
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const aOuter = (Math.PI / 2) + (i * 2 * Math.PI / 5);
    const aInner = aOuter + Math.PI / 5;
    pts.push(`${r + r * Math.cos(aOuter)},${r - r * Math.sin(aOuter)}`);
    pts.push(`${r + ri * Math.cos(aInner)},${r - ri * Math.sin(aInner)}`);
  }
  return (
    <svg width={r * 2} height={r * 2} viewBox={`0 0 ${r * 2} ${r * 2}`}
      style={{ opacity, filter: `drop-shadow(0 0 ${size}px ${color}55)` }}>
      <polygon points={pts.join(' ')} fill={color} />
    </svg>
  );
}

export default function WorldMap() {
  const [selectedCountry, setSelectedCountry] = useState(null); // full point object
  const [hoverCountry, setHoverCountry] = useState(null); // hover label
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedTour, setSelectedTour] = useState(null);

  // Portal tooltip positioning
  const [fichePos, setFichePos] = useState(null);
  const mapRef = useRef(null);
  const ficheRef = useRef(null);

  const points = useMemo(() =>
    MAP_POINTS.map(p => ({ ...p, ...mapPointStats(p.id) }))
  , []);

  const totalMembers = points.reduce((s, p) => s + p.total, 0);

  const filtered = points.filter(p =>
    !globalSearch || p.country.toLowerCase().includes(globalSearch.toLowerCase())
  );

  // §4: Compute fiche position in viewport coords, clamped to stay visible
  const updateFichePos = useCallback((point) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const { x, y } = toXY(point.lat, point.lng);
    const px = rect.left + (x / 100) * rect.width;
    const py = rect.top + (y / 100) * rect.height;

    const ficheW = 260;
    const ficheH = 280;
    const offset = 16;

    // Default: right of point
    let left = px + offset;
    let top = py - ficheH / 2;

    // Flip left if overflows right
    if (left + ficheW > window.innerWidth - 10) {
      left = px - ficheW - offset;
    }
    // Flip down if overflows top
    if (top < 10) top = 10;
    // Flip up if overflows bottom
    if (top + ficheH > window.innerHeight - 10) {
      top = window.innerHeight - ficheH - 10;
    }
    // Clamp left
    if (left < 10) left = 10;

    setFichePos({ left, top });
  }, []);

  // Recalc on scroll/resize
  useEffect(() => {
    if (!selectedCountry) return;
    const update = () => updateFichePos(selectedCountry);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [selectedCountry, updateFichePos]);

  const selectPoint = (p) => {
    if (selectedCountry?.id === p.id) {
      setSelectedCountry(null);
      setFichePos(null);
    } else {
      setSelectedCountry(p);
      // Defer to let React render first
      setTimeout(() => updateFichePos(p), 0);
    }
  };

  const closeFiche = () => {
    setSelectedCountry(null);
    setFichePos(null);
  };

  // Click outside fiche
  useEffect(() => {
    if (!selectedCountry) return;
    const handler = (e) => {
      if (ficheRef.current && ficheRef.current.contains(e.target)) return;
      // Don't close if clicking a map point
      if (e.target.closest('[data-mappoint]')) return;
      closeFiche();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [selectedCountry]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-base font-bold text-cosmos-50 font-display shrink-0">🌍 Communauté mondiale</h2>
        <div className="text-sm text-cosmos-100 shrink-0">
          <span className="text-cosmos-50 font-bold">{totalMembers.toLocaleString('fr-CH')}</span> membres
        </div>
      </div>

      {/* Global search */}
      <div className="relative">
        <input
          className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/[.06] border border-white/[.12] text-cosmos-50 placeholder-cosmos-100/40"
          placeholder="Rechercher par pays..."
          value={globalSearch}
          onChange={e => setGlobalSearch(e.target.value)}
        />
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cosmos-100 pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        {globalSearch && (
          <button onClick={() => setGlobalSearch('')}
            className="absolute right-9 top-1/2 -translate-y-1/2 text-cosmos-100 hover:text-cosmos-50 text-xs cursor-pointer">✕</button>
        )}
      </div>

      {/* Map */}
      <div ref={mapRef}
        className="relative w-full rounded-2xl overflow-visible cursor-default"
        style={{ aspectRatio: '2/1', background: 'linear-gradient(180deg, #0d1129 0%, #080c1a 100%)' }}>

        {/* Continent SVG */}
        <img
  src="/mapmonde-tdb.png"
  alt="Carte du monde"
  className="absolute inset-0 w-full h-full object-cover opacity-90 pointer-events-none"
/>

        {/* §2+§3: Data points — triangle for Tri, star for Plé, with hover + focus */}
        {filtered.map(p => {
          if (p.total === 0 && !DEMO_MODE) return null;
          const { x, y } = toXY(p.lat, p.lng);
          const manqueTotal = p.manque1 + p.manque2 + p.manque3;
          const color = manqueTotal === 0 ? '#00e5a0' : manqueTotal <= 5 ? '#f0c040' : '#ff6b6b';
          const size = Math.max(10, Math.min(22, Math.sqrt(p.total) * 1.3 + 5));
          const isSelected = selectedCountry?.id === p.id;

          // §3: Fade non-selected points when a country is active
          const opacity = selectedCountry
            ? (isSelected ? 1 : 0.2)
            : 1;

          // Demo: alternate between triangle and star markers
          const isTri = p.id % 2 === 1;

          return (
            <div key={p.id} data-mappoint="true"
              className="absolute cursor-pointer transition-all duration-200 hover:scale-[1.5]"
              style={{
                left: `${x}%`, top: `${y}%`,
                transform: 'translate(-50%,-50%)',
                zIndex: isSelected ? 20 : (hoverCountry?.id === p.id ? 15 : 2),
              }}
              onMouseEnter={() => setHoverCountry(p)}
              onMouseLeave={() => setHoverCountry(null)}
              onClick={(e) => { e.stopPropagation(); selectPoint(p); }}>
              {isTri
                ? <TriangleMarker size={size} color={color} opacity={opacity} />
                : <StarMarker size={size} color={color} opacity={opacity} />
              }
            </div>
          );
        })}

        {/* §3: Hover label — country name on hover */}
        {hoverCountry && !selectedCountry && (() => {
          const { x, y } = toXY(hoverCountry.lat, hoverCountry.lng);
          return (
            <div className="absolute z-30 pointer-events-none"
              style={{
                left: `${x}%`, top: `${y}%`,
                transform: 'translate(-50%, -130%)',
              }}>
              <div className="px-2.5 py-1 rounded-lg text-xs font-semibold text-cosmos-50 whitespace-nowrap"
                style={{ background: 'rgba(15,15,40,0.9)', border: '1px solid rgba(255,255,255,0.12)' }}>
                {hoverCountry.country}
              </div>
            </div>
          );
        })()}

        {/* Legend — shapes explained */}
        <div className="absolute bottom-2 left-2 flex items-center gap-3 text-[10px] text-cosmos-100/60 bg-cosmos-700/80 px-3 py-1.5 rounded-lg">
          <span className="flex items-center gap-1"><span className="text-coral7">▲</span> Triangulum</span>
          <span className="flex items-center gap-1"><span className="text-gold7">★</span> Pléiade</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-em7 inline-block"></span> Complet</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gold7 inline-block"></span> Manque</span>
                </div>
      </div>

      {/* §4: Fiche pays — portal to document.body for guaranteed z-index */}
      {selectedCountry && fichePos && createPortal(
        <div ref={ficheRef}
          className="fixed drop-in"
          style={{
            left: fichePos.left,
            top: fichePos.top,
            zIndex: 99999,
            width: 260,
          }}>
          <div className="rounded-xl p-5"
            style={{
              background: 'rgba(14,14,40,0.97)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 20px 60px rgba(0,0,0,.7)',
            }}>
            <button onClick={closeFiche}
              className="absolute top-3 right-3 text-cosmos-100 hover:text-white w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-all cursor-pointer text-sm">✕</button>
            <div className="font-bold text-base text-cosmos-50 mb-4 font-display">{selectedCountry.country}</div>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-cosmos-100">Total membres</span>
                <span className="text-xl text-cosmos-50 font-bold font-display">{selectedCountry.total}</span>
              </div>
              <div className="h-px bg-white/[.08]" />
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-sm"><span className="w-2.5 h-2.5 rounded-full bg-em7 inline-block"></span> Complets</span>
                <span className="text-lg text-em7 font-bold">{selectedCountry.complets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-sm"><span className="w-2.5 h-2.5 rounded-full bg-gold7 inline-block"></span> Manque 1</span>
                <span className="text-lg text-gold7 font-bold">{selectedCountry.manque1}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-sm"><span className="w-2.5 h-2.5 rounded-full bg-coral7/70 inline-block"></span> Manque 2</span>
                <span className="text-lg text-coral7/80 font-bold">{selectedCountry.manque2}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-sm"><span className="w-2.5 h-2.5 rounded-full bg-coral7 inline-block"></span> Manque 3+</span>
                <span className="text-lg text-coral7 font-bold">{selectedCountry.manque3}</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* §5: Tour buttons — renamed "Tours terminés" */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-cosmos-100 mr-1">Tours terminés</span>
          {[1,2,3,4,5,6,7].map(t => (
            <button key={t} onClick={() => setSelectedTour(selectedTour === t ? null : t)}
              className="w-9 h-9 rounded-full font-bold text-sm font-display border-none cursor-pointer transition-all hover:scale-110"
              style={{
                background: selectedTour === t ? TOUR_COLORS[t-1] : `${TOUR_COLORS[t-1]}20`,
                color: selectedTour === t ? '#fff' : TOUR_COLORS[t-1],
                boxShadow: selectedTour === t ? `0 4px 18px ${TOUR_COLORS[t-1]}55` : 'none',
              }}>
              {t}
            </button>
          ))}
          {selectedTour && (
            <button onClick={() => setSelectedTour(null)}
              className="text-[10px] text-cosmos-100 hover:text-cosmos-50 ml-1 underline cursor-pointer">Tous</button>
          )}
        </div>
      </div>

      {/* Search results under map */}
      {globalSearch && (
        <div className="max-h-[140px] overflow-y-auto rounded-xl bg-white/[.03] border border-white/[.06] p-2 space-y-1">
          {filtered.length > 0 ? filtered.map(p => (
            <button key={p.id} onClick={() => selectPoint(p)}
              className="w-full flex items-center justify-between p-2 rounded-lg text-xs hover:bg-white/[.05] transition-all text-left cursor-pointer">
              <span className="text-cosmos-50 font-medium">{p.country}</span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-cosmos-100">{p.total} mbr</span>
                <span className="text-gold7">{p.manque1 + p.manque2 + p.manque3} dispo</span>
              </div>
            </button>
          )) : (
            <div className="text-center py-3 text-xs text-cosmos-100/50">Aucun résultat</div>
          )}
        </div>
      )}

      <p className="text-[10px] text-cosmos-100/40">
        Vision communautaire — informatif uniquement.
      </p>
    </div>
  );
}
