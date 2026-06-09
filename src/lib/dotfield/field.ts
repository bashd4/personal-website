export interface Dot {
  hx: number; hy: number;   // home position
  x: number; y: number;     // current
  sx: number; sy: number;   // snapshot at start of tween
  tx: number; ty: number;   // target
  a: number; at: number;    // current / target alpha
}

export function buildLattice(w:number, h:number, gap:number): Dot[] {
  const dots: Dot[] = [];
  for (let y = gap/2; y < h; y += gap)
    for (let x = gap/2; x < w; x += gap)
      dots.push({ hx:x, hy:y, x, y, sx:x, sy:y, tx:x, ty:y, a:0.3, at:0.3 });
  return dots;
}

export const ease = (t:number) => {
  const u = Math.max(0, Math.min(1, t));
  return u < .5 ? 4*u*u*u : 1 - Math.pow(-2*u + 2, 3) / 2; // easeInOutCubic, clamped
};

export const tween = (from:number, to:number, p:number) => from + (to - from) * ease(p);
