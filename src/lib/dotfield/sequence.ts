export interface Beat { word: string; hold?: number; }
export interface SequenceOpts {
  beats: Beat[];
  /**
   * Index where autoplay begins. Expected `0 <= autoStart <= beats.length`.
   * `autoStart = 0` means autoplay from the first click (no manual phase).
   */
  autoStart: number;
  onWord: (word: string) => void;
  onSettle: () => void;
  setTimer: (fn: () => void, ms: number) => unknown;
  clearTimer: (handle: unknown) => void;
  defaultHold?: number;              // ms per autoplay word if beat.hold absent
}
export interface SequenceController { click(): void; reset(): void; isPlaying(): boolean; }

export function createSequence(opts: SequenceOpts): SequenceController {
  const { beats, autoStart, onWord, onSettle, setTimer, clearTimer, defaultHold = 750 } = opts;
  let idx = -1, playing = false, auto = false, done = false, timer: unknown = null;

  const stop = () => { if (timer != null) { clearTimer(timer); timer = null; } };
  function settle() { auto = false; done = true; stop(); onSettle(); }
  function schedule() {
    timer = setTimer(() => {
      idx++;
      if (idx >= beats.length) { settle(); return; }
      onWord(beats[idx].word); schedule();
    }, beats[idx].hold ?? defaultHold);
  }
  function advance() {
    idx++;
    if (idx >= beats.length) { settle(); return; }
    onWord(beats[idx].word);
    if (idx >= autoStart) { auto = true; schedule(); }
  }
  return {
    click() {
      if (done) return;
      if (!playing) { playing = true; idx = -1; advance(); }
      else if (auto) { settle(); }
      else { advance(); }
    },
    reset() { stop(); idx = -1; playing = false; auto = false; done = false; },
    isPlaying() { return playing && !done; },
  };
}
