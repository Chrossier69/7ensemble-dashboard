import { useEffect, useRef } from 'react';
export default function StarField() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const stars = Array.from({length:160}, () => ({
      x:Math.random()*c.width, y:Math.random()*c.height,
      r:Math.random()*1.3+.3, a:Math.random()*.6+.2, s:Math.random()*.003+.001,
      h:Math.random()>.88 ? Math.random()*60+180 : 0,
    }));
    let f;
    const draw = t => {
      ctx.clearRect(0,0,c.width,c.height);
      stars.forEach(s => {
        const al = s.a + .3*Math.sin(t*s.s);
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle = s.h ? `hsla(${s.h},60%,70%,${al})` : `rgba(200,210,255,${al})`;
        ctx.fill();
      });
      f = requestAnimationFrame(draw);
    };
    f = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(f); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none" style={{zIndex:0}}/>;
}
