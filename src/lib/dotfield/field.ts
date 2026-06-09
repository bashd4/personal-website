export interface Dot { hx:number; hy:number; x:number; y:number; sx:number; sy:number; tx:number; ty:number; a:number; at:number; }

export function buildLattice(w:number, h:number, gap:number): Dot[] {
  const dots: Dot[] = [];
  for (let y = gap/2; y < h; y += gap)
    for (let x = gap/2; x < w; x += gap)
      dots.push({ hx:x, hy:y, x, y, sx:x, sy:y, tx:x, ty:y, a:0.3, at:0.3 });
  return dots;
}

export const ease = (t:number) => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; // easeInOutCubic

export const tween = (from:number, to:number, p:number) => from + (to - from) * ease(p);
