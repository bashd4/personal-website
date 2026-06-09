import { describe, it, expect } from 'vitest';
import { createSequence } from '../src/lib/dotfield/sequence';

const BEATS = [{word:'hello'},{word:'may i share a story?'},{word:'i',hold:10},{word:'grew',hold:10}];
const AUTO_START = 2;

function harness(){
  const words: string[] = []; let settled = 0;
  const timers: Array<(() => void) | undefined> = [];
  const cancelled = new Set<number>();
  const seq = createSequence({
    beats: BEATS, autoStart: AUTO_START,
    onWord: w => words.push(w),
    onSettle: () => settled++,
    setTimer: (fn) => { timers.push(fn); return timers.length-1; },
    clearTimer: (id) => { cancelled.add(id as number); },
  });
  // Run the next scheduled-but-not-cancelled timer exactly once; cancelled timers never fire.
  const tick = () => {
    const idx = timers.findIndex((fn, i) => fn !== undefined && !cancelled.has(i));
    if (idx >= 0) { const fn = timers[idx]!; timers[idx] = undefined; fn(); }
  };
  return { seq, words, get settled(){return settled;}, tick };
}

describe('sequence', () => {
  it('first click reveals hello', () => { const h=harness(); h.seq.click(); expect(h.words).toEqual(['hello']); });
  it('manual clicks step hello → question', () => { const h=harness(); h.seq.click(); h.seq.click(); expect(h.words).toEqual(['hello','may i share a story?']); });
  it('click at autoStart begins autoplay (timer-driven)', () => {
    const h=harness(); h.seq.click(); h.seq.click(); h.seq.click(); // → 'i' (autoStart)
    expect(h.words).toEqual(['hello','may i share a story?','i']);
    expect(h.seq.isPlaying()).toBe(true);
    h.tick(); // autoplay advances to 'grew'
    expect(h.words[3]).toBe('grew');
    h.tick(); // past end → settle
    expect(h.settled).toBe(1);
    expect(h.seq.isPlaying()).toBe(false);
  });
  it('click during autoplay skips to settle', () => {
    const h=harness(); h.seq.click(); h.seq.click(); h.seq.click(); // autoplay started
    h.seq.click(); // skip
    expect(h.settled).toBe(1);
  });
  it('click after settle is ignored', () => {
    const h=harness(); h.seq.click(); h.seq.click(); h.seq.click(); h.tick(); h.tick(); // drive to settle
    expect(h.settled).toBe(1);
    const wordCount = h.words.length;
    h.seq.click();
    expect(h.words.length).toBe(wordCount);
    expect(h.settled).toBe(1);
  });
  it('reset during autoplay stops timers', () => {
    const h=harness(); h.seq.click(); h.seq.click(); h.seq.click(); // autoplay started
    const wordCount = h.words.length;
    h.seq.reset();
    h.tick(); // cancelled timer must not fire
    expect(h.words.length).toBe(wordCount);
    expect(h.settled).toBe(0);
  });
  it('reset returns to idle', () => { const h=harness(); h.seq.click(); h.seq.reset(); h.seq.click(); expect(h.words[h.words.length-1]).toBe('hello'); });
});
