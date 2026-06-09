import { describe, it, expect } from 'vitest';
import { createSequence } from '../src/lib/dotfield/sequence';

const BEATS = [{word:'hello'},{word:'may i share a story?'},{word:'i',hold:10},{word:'grew',hold:10}];
const AUTO_START = 2;

function harness(){
  const words: string[] = []; let settled = 0;
  const timers: Array<()=>void> = [];
  const seq = createSequence({
    beats: BEATS, autoStart: AUTO_START,
    onWord: w => words.push(w),
    onSettle: () => settled++,
    setTimer: (fn) => { timers.push(fn); return timers.length-1; },
    clearTimer: () => {},
  });
  const tick = () => { const fn = timers.shift(); if (fn) fn(); };
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
  });
  it('click during autoplay skips to settle', () => {
    const h=harness(); h.seq.click(); h.seq.click(); h.seq.click(); // autoplay started
    h.seq.click(); // skip
    expect(h.settled).toBe(1);
  });
  it('reset returns to idle', () => { const h=harness(); h.seq.click(); h.seq.reset(); h.seq.click(); expect(h.words[h.words.length-1]).toBe('hello'); });
});
