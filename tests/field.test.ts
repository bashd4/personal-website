import { describe, it, expect } from 'vitest';
import { buildLattice, ease, tween } from '../src/lib/dotfield/field';

describe('field helpers', () => {
  it('buildLattice fills a grid with the given spacing', () => {
    const dots = buildLattice(100, 100, 20);
    expect(dots.length).toBe(25);          // 5 x 5 at gap 20 (centers 10,30,50,70,90)
    expect(dots[0]).toMatchObject({ hx:10, hy:10 });
  });
  it('ease is 0 at 0 and 1 at 1', () => { expect(ease(0)).toBe(0); expect(ease(1)).toBe(1); });
  it('ease is 0.5 at midpoint', () => expect(ease(0.5)).toBeCloseTo(0.5));
  it('ease clamps out-of-range input to [0,1]', () => {
    expect(ease(-1)).toBeGreaterThanOrEqual(0);
    expect(ease(-1)).toBeLessThanOrEqual(1);
    expect(ease(2)).toBeGreaterThanOrEqual(0);
    expect(ease(2)).toBeLessThanOrEqual(1);
  });
  it('tween interpolates with easing', () => { expect(tween(0,10,0)).toBe(0); expect(tween(0,10,1)).toBe(10); });
  it('tween works with non-zero from at midpoint', () => expect(tween(5,15,0.5)).toBeCloseTo(10));
});
