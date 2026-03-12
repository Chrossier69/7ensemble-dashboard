import { useApp } from '../context/AppContext';

// Pléiades real shape (7 stars)
const PLE_POS = [
  { x:200, y:35,  l:'Alcyone' },
  { x:155, y:75,  l:'Atlas' },
  { x:245, y:75,  l:'Electra' },
  { x:130, y:130, l:'Maia' },
  { x:270, y:120, l:'Taygeta' },
  { x:180, y:180, l:'Celaeno' },
  { x:230, y:200, l:'Merope' },
];
const PLE_LINES = [[0,1],[0,2],[1,3],[2,4],[1,5],[2,6],[3,5],[4,6],[0,3],[0,4],[5,6]];

// Triangulum triangle
const TRI_POS = [
  { x:200, y:55,  l:'P1' },
  { x:95,  y:225, l:'P2' },
  { x:305, y:225, l:'P3' },
];
const TRI_LINES = [[0,1],[1,2],[2,0]];

export default function ConstellationVisual() {
  const { active } = useApp();
  if (!active) return null;

  const isTri = active.type === 'triangulum';
  const positions = isTri ? TRI_POS : PLE_POS;
  const lines = isTri ? TRI_LINES : PLE_LINES;
  const max = active.maxMembers;
  const filled = active.paidMembers.length;
  const accent = isTri ? '#00e5a0' : '#f0c040';
  const dim = 'rgba(100,100,140,.3)';
  const isTerminated = active.constellationTerminee;
  const short = (v) => String(v ?? '').slice(0, 3);
  return (
    <div className="rounded-2xl overflow-hidden relative"
      style={{background:'radial-gradient(ellipse at center,rgba(15,15,50,1),rgba(5,5,20,1))'}}>
      {/* Decorative stars */}
      {Array.from({length:35}).map((_,i)=>(
        <div key={i} className="absolute rounded-full star" style={{
          left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,
          width:Math.random()*2+.5,height:Math.random()*2+.5,
          background:`rgba(200,210,255,${Math.random()*.4+.1})`,
          '--dur':`${Math.random()*3+2}s`,'--delay':`${Math.random()*2}s`,
        }}/>
      ))}
      <svg viewBox="0 0 400 260" className="w-full block relative z-10">
        <defs>
          <filter id="gl"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          {/* §5: Golden glow for completed constellation */}
          <filter id="glowGold"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        {/* Lines */}
        {lines.map(([a,b],i) => {
          const pa=positions[a], pb=positions[b];
          const lit = a<filled && b<filled;
          return <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
            stroke={isTerminated ? '#f0c040' : lit ? accent : dim}
            strokeWidth={isTerminated ? 2 : 1.5}
            strokeDasharray={lit || isTerminated ? 'none' : '4,4'}
            opacity={isTerminated ? .6 : lit ? .5 : .2}/>;
        })}

        {/* Nodes */}
        {positions.map((p,i) => {
          const member = active.paidMembers[i];
          const ok = i < filled;
          const nodeColor = isTerminated ? '#f0c040' : ok ? accent : dim;
          const short = (v) => (v == null ? '' : String(v).slice(0, 3));

const label = (member, i, p, isTri) => {
  if (!member) return isTri ? `P${i + 1}` : (short(p?.l) || `P${i + 1}`);
  if (typeof member === 'string') return short(member);
  return short(member?.pseudo ?? member);
};
          return (
            <g key={i}>
              {(ok || isTerminated) && (
                <circle cx={p.x} cy={p.y} r={28} fill="none"
                  stroke={isTerminated ? '#f0c040' : accent}
                  strokeWidth="1" opacity=".25"
                  filter={isTerminated ? 'url(#glowGold)' : 'url(#gl)'}/>
              )}
              <circle cx={p.x} cy={p.y} r={22}
                fill={nodeColor} opacity={ok || isTerminated ? 1 : .35}/>
              <text x={p.x} y={p.y+5} textAnchor="middle" fill="#fff"
                fontSize="11" fontWeight="700" fontFamily="Outfit,sans-serif">
                {
  member
    ? short(member?.pseudo ?? member)
    : (isTri ? `P${i + 1}` : short(p?.l ?? `P${i + 1}`))
}

              </text>
              {ok && !isTerminated && (
                <text x={p.x+16} y={p.y-16} fill={accent} fontSize="12" fontWeight="bold">✓</text>
              )}
              {isTerminated && (
                <text x={p.x+16} y={p.y-16} fill="#f0c040" fontSize="12" fontWeight="bold">★</text>
              )}
            </g>
          );
        })}

        {/* §5: Center message — changes based on state */}
        {isTerminated ? (
          <g className="drop-in">
            <text x="200" y={isTri ? 148 : 245} textAnchor="middle"
              fill="#f0c040" fontSize="13" fontWeight="700" fontFamily="Outfit,sans-serif">
              🎉 Félicitations
            </text>
            <text x="200" y={isTri ? 166 : 258} textAnchor="middle"
              fill="rgba(240,192,64,.7)" fontSize="10" fontFamily="Outfit,sans-serif">
              Constellation terminée
            </text>
          </g>
        ) : (
          <text x="200" y={isTri ? 150 : 245} textAnchor="middle"
            fill="rgba(255,255,255,.4)" fontSize="10" fontFamily="Outfit,sans-serif">
            Vos Étoiles
          </text>
        )}
      </svg>

      <div className="flex justify-between px-3 py-2 text-xs text-cosmos-100">
        <span className="flex items-center gap-1.5">
          <span className={isTri?'text-coral7':'text-gold7'}>{isTri?'▲':'⭐'}</span>{active.name}
        </span>
        <span>
          {/* §1: Never shows more than maxM */}
          {Math.min(filled, max)}/{max} contributeurs
          {isTerminated && <span className="ml-1 text-gold7">★</span>}
        </span>
      </div>
    </div>
  );
}
