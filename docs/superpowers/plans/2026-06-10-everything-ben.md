# Everything BEN Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Ben Ashdown's personal website — a warm, editorial Astro static site with a signature site-wide dot-field background that reacts to the cursor and hides a click-to-reveal word-story easter egg.

**Architecture:** Astro static site. Markdown content collections (Zod-typed) for Projects/Essays/Quotes. A single client-side `DotField` canvas island, mounted once in the base layout, renders the persistent dot field everywhere and runs the easter-egg sequence on the homepage. The easter-egg *sequence logic* is extracted into a pure, DOM-free module so it can be unit-tested; canvas rendering stays in the component.

**Tech Stack:** Astro 5, TypeScript, Vitest (unit tests for the sequence logic), HTML5 Canvas. Spec: `docs/superpowers/specs/2026-06-10-everything-ben-design.md`.

---

## File structure

```
package.json, astro.config.mjs, tsconfig.json, vitest.config.ts   (root config)
src/
  styles/global.css            — design tokens + base styles
  content.config.ts            — Zod-typed collections: projects, essays, quotes
  content/
    projects/*.md  essays/*.md  quotes/*.md   — sample content
  layouts/BaseLayout.astro     — head/SEO, Nav, DotField, <slot/>, footer
  components/
    Nav.astro                  — BA monogram + section links
    DotField.astro             — the canvas island (rendering + cursor reaction + egg wiring)
  lib/dotfield/
    sequence.ts                — PURE easter-egg state machine (unit-tested)
    field.ts                   — PURE helpers: lattice builder, ease, tween position
  pages/
    index.astro                — hero (Ben Ashdown) + egg trigger
    projects/index.astro, projects/[slug].astro
    essays/index.astro,   essays/[slug].astro
    quotes/index.astro
    resume.astro
    404.astro
tests/
  sequence.test.ts             — sequence state machine
  field.test.ts                — lattice/tween helpers
```

`field.ts` and `sequence.ts` hold all the testable logic (no DOM). `DotField.astro` does canvas drawing + `prefers-reduced-motion` + tab-visibility + resize, wiring the pure modules.

---

## Task 1: Scaffold Astro + Vitest

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`
- (`.gitignore` already exists from brainstorming)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "everything-ben",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": { "astro": "^5.6.0" },
  "devDependencies": { "@astrojs/check": "^0.9.4", "typescript": "^5.6.0", "vitest": "^2.1.0" }
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
export default defineConfig({ site: 'https://example.com' }); // set real domain later
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{ "extends": "astro/tsconfigs/strict", "include": [".astro/types.d.ts", "**/*"], "exclude": ["dist"] }
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'node', include: ['tests/**/*.test.ts'] } });
```

- [ ] **Step 5: Install**

Run: `npm install`
Expected: dependencies install, no errors.

- [ ] **Step 6: Verify Vitest runs (no tests yet)**

Run: `npx vitest run`
Expected: "No test files found" (exit 0) — confirms the runner works.

- [ ] **Step 7: Commit**

```bash
git add package.json astro.config.mjs tsconfig.json vitest.config.ts package-lock.json
git commit -m "chore: scaffold Astro + Vitest"
```

---

## Task 2: Design tokens, BaseLayout, Nav

**Files:**
- Create: `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/Nav.astro`, `src/pages/index.astro` (temporary placeholder)

- [ ] **Step 1: Create `src/styles/global.css`** (tokens + base)

```css
:root{
  --ink:#2a2722; --soft:#6a6256; --paper:#f5f1e8; --edge:rgba(120,108,90,.18);
  --sage:#6f9070;
  --font-serif:"Iowan Old Style",Palatino,Georgia,serif; /* swap for chosen serif later */
  --font-sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Arial,sans-serif;
  --measure:64ch;
}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--font-sans);font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased}
h1,h2,h3{font-family:var(--font-serif);font-weight:600;line-height:1.1;letter-spacing:-.01em}
a{color:var(--sage);text-underline-offset:3px}
.col{max-width:720px;margin:0 auto;padding:0 34px}
:focus-visible{outline:2px solid var(--sage);outline-offset:2px}
```

- [ ] **Step 2: Create `src/components/Nav.astro`**

```astro
---
const { pathname } = Astro.url;
const links = [
  { href: '/projects', label: 'Projects' },
  { href: '/essays', label: 'Essays' },
  { href: '/quotes', label: 'Quotes' },
  { href: '/resume', label: 'Resume' },
];
const active = (h: string) => pathname.startsWith(h);
---
<nav aria-label="Primary">
  <a class="brand" href="/">BA</a>
  <ul>{links.map(l => <li><a href={l.href} aria-current={active(l.href) ? 'page' : undefined}>{l.label}</a></li>)}</ul>
</nav>
<style>
  nav{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:baseline;padding:18px 34px}
  .brand{font-family:var(--font-serif);font-weight:600;font-size:15px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink);text-decoration:none}
  ul{display:flex;gap:20px;list-style:none;margin:0;padding:0}
  a{color:var(--soft);text-decoration:none;font-size:13px}
  a:hover,a[aria-current='page']{color:var(--sage)}
</style>
```

- [ ] **Step 3: Create `src/layouts/BaseLayout.astro`**

```astro
---
import Nav from '../components/Nav.astro';
import '../styles/global.css';
interface Props { title: string; description?: string; }
const { title, description = 'Ben Ashdown — software engineer.' } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site).href;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
  </head>
  <body>
    <!-- DotField canvas mounts here in Task 7 -->
    <div class="content">
      <Nav />
      <main class="col"><slot /></main>
      <footer class="col"><p>© 2026 Ben Ashdown · made by hand</p></footer>
    </div>
    <style>
      .content{position:relative;z-index:1}
      main{padding-block:clamp(1.5rem,1rem+3vw,3.5rem) 4rem}
      footer{border-top:1px solid var(--edge);padding-block:1.5rem 3rem;color:var(--soft);font-size:13px}
    </style>
  </body>
</html>
```

- [ ] **Step 4: Create temporary `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Ben Ashdown"><h1>Ben Ashdown</h1><p>Placeholder — hero comes in Task 8.</p></BaseLayout>
```

- [ ] **Step 5: Verify build + dev render**

Run: `npm run build`
Expected: builds `/index.html` with no errors. (Optionally `npm run dev` and open `localhost:4321` to eyeball nav + tokens.)

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css src/components/Nav.astro src/layouts/BaseLayout.astro src/pages/index.astro
git commit -m "feat: design tokens, base layout, nav"
```

---

## Task 3: Content collections (projects, essays, quotes)

**Files:**
- Create: `src/content.config.ts`, sample files under `src/content/{projects,essays,quotes}/`

- [ ] **Step 1: Create `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(), oneLiner: z.string(), outcome: z.string(),
    date: z.coerce.date(), order: z.number().default(0),
    link: z.string().url().optional(), draft: z.boolean().default(false),
  }),
});
const essays = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/essays' }),
  schema: z.object({ title: z.string(), summary: z.string(), date: z.coerce.date(), draft: z.boolean().default(false) }),
});
const quotes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/quotes' }),
  schema: z.object({ quote: z.string(), author: z.string().default('Ben'), order: z.number().default(0) }),
});
export const collections = { projects, essays, quotes };
```

- [ ] **Step 2: Create one sample file per collection**

`src/content/projects/example.md`:
```md
---
title: Example Project
oneLiner: A placeholder so the room builds — replace with real work.
outcome: Delete this and add 2-5 real projects.
date: 2026-06-10
order: 0
---
Body in markdown.
```
`src/content/essays/hello-world.md`:
```md
---
title: Hello, world
summary: A placeholder essay.
date: 2026-06-10
---
Body.
```
`src/content/quotes/example.md`:
```md
---
quote: The placeholder is the enemy of the shipped.
author: Ben
order: 0
---
```

- [ ] **Step 3: Verify schema validation**

Run: `npm run check`
Expected: 0 errors (content types generated). Try temporarily breaking a frontmatter field (e.g. remove `title`) and re-run to confirm it FAILS, then restore.

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts src/content
git commit -m "feat: content collections (projects, essays, quotes)"
```

---

## Task 4: Section pages

**Files:**
- Create: `src/pages/projects/index.astro`, `src/pages/projects/[slug].astro`, `src/pages/essays/index.astro`, `src/pages/essays/[slug].astro`, `src/pages/quotes/index.astro`, `src/pages/resume.astro`, `src/pages/404.astro`

- [ ] **Step 1: Projects index** — `src/pages/projects/index.astro`

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';
const items = (await getCollection('projects', ({ data }) => !data.draft))
  .sort((a,b)=> (a.data.order-b.data.order) || (+b.data.date - +a.data.date));
---
<BaseLayout title="Projects — Ben Ashdown">
  <h1>Projects</h1>
  {items.length === 0
    ? <p style="color:var(--soft)">Nothing here yet.</p>
    : <ul style="list-style:none;padding:0;margin:0">{items.map(p => (
        <li style="border-top:1px solid var(--edge);padding:18px 0">
          <a href={`/projects/${p.id}`} style="text-decoration:none;color:var(--ink)">
            <h3 style="margin:0 0 3px">{p.data.title}</h3>
            <p style="margin:0 0 4px">{p.data.oneLiner}</p>
            <p style="margin:0;color:var(--soft);font-size:13px">{p.data.outcome}</p>
          </a>
        </li>))}</ul>}
</BaseLayout>
```

- [ ] **Step 2: Project detail** — `src/pages/projects/[slug].astro`

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection, render } from 'astro:content';
export async function getStaticPaths(){
  const items = await getCollection('projects', ({ data }) => !data.draft);
  return items.map(entry => ({ params:{ slug: entry.id }, props:{ entry } }));
}
const { entry } = Astro.props;
const { Content } = await render(entry);
---
<BaseLayout title={`${entry.data.title} — Ben Ashdown`} description={entry.data.oneLiner}>
  <p><a href="/projects">← Projects</a></p>
  <h1>{entry.data.title}</h1>
  <p style="color:var(--soft)">{entry.data.oneLiner}</p>
  <p><strong>Outcome:</strong> {entry.data.outcome}</p>
  {entry.data.link && <p><a href={entry.data.link}>Visit →</a></p>}
  <hr style="border:none;border-top:1px solid var(--edge);margin:2rem 0" />
  <Content />
</BaseLayout>
```

- [ ] **Step 3: Essays index + detail** — mirror the Projects pattern, but note the **essays schema differs**: fields are `title`, `summary`, `date`, `draft` (NO `oneLiner`/`outcome`/`order`/`link`). So: `essays/index.astro` lists **title + summary + date**, sorted by **date desc** (`(a,b)=>+b.data.date - +a.data.date`); `essays/[slug].astro` renders **title + summary + `<Content/>`** and must NOT reference `outcome`/`order`/`link`. Run `npm run check` after to catch any leftover field references.

- [ ] **Step 4: Quotes** — `src/pages/quotes/index.astro`

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';
const items = (await getCollection('quotes')).sort((a,b)=>a.data.order-b.data.order);
---
<BaseLayout title="Quotes — Ben Ashdown">
  <h1>Quotes</h1>
  {items.map(q => (
    <blockquote style="border-left:3px solid var(--sage);margin:0 0 22px;padding-left:16px">
      <p style="font-family:var(--font-serif);font-size:20px;margin:0 0 4px">“{q.data.quote}”</p>
      <cite style="color:var(--soft);font-size:13px">— {q.data.author}</cite>
    </blockquote>))}
</BaseLayout>
```

- [ ] **Step 5: Resume + 404** — `src/pages/resume.astro` (a simple `<h1>Resume</h1>` + placeholder, note PDF link is a deferred open question) and `src/pages/404.astro` (custom "lost the thread" → link home), both via BaseLayout.

- [ ] **Step 6: Verify all routes build**

Run: `npm run build`
Expected: routes for `/projects`, `/projects/example`, `/essays`, `/essays/hello-world`, `/quotes`, `/resume`, `/404` all generated, no errors.

- [ ] **Step 7: Commit**

```bash
git add src/pages
git commit -m "feat: section pages (projects, essays, quotes, resume, 404)"
```

---

## Task 5: DotField sequence state machine (TDD)

The easter-egg logic, DOM-free and timer-injected so it's deterministic in tests.

**Files:**
- Create: `src/lib/dotfield/sequence.ts`, `tests/sequence.test.ts`

- [ ] **Step 1: Write the failing tests** — `tests/sequence.test.ts`

```ts
import { describe, it, expect, vi } from 'vitest';
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
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npx vitest run tests/sequence.test.ts`
Expected: FAIL — `createSequence` not found.

- [ ] **Step 3: Implement** — `src/lib/dotfield/sequence.ts`

```ts
export interface Beat { word: string; hold?: number; }
export interface SequenceOpts {
  beats: Beat[];
  autoStart: number;                 // index where autoplay begins
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
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npx vitest run tests/sequence.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/dotfield/sequence.ts tests/sequence.test.ts
git commit -m "feat: dot-field easter-egg sequence state machine (tested)"
```

---

## Task 6: DotField pure helpers (TDD)

**Files:**
- Create: `src/lib/dotfield/field.ts`, `tests/field.test.ts`

- [ ] **Step 1: Write failing tests** — `tests/field.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { buildLattice, ease, tween } from '../src/lib/dotfield/field';

describe('field helpers', () => {
  it('buildLattice fills a grid with the given spacing', () => {
    const dots = buildLattice(100, 100, 20);
    expect(dots.length).toBe(25);          // 5 x 5 at gap 20 (centers 10,30,50,70,90)
    expect(dots[0]).toMatchObject({ hx:10, hy:10 });
  });
  it('ease is 0 at 0 and 1 at 1', () => { expect(ease(0)).toBe(0); expect(ease(1)).toBe(1); });
  it('tween interpolates with easing', () => { expect(tween(0,10,0)).toBe(0); expect(tween(0,10,1)).toBe(10); });
});
```

- [ ] **Step 2: Run, verify fail.** `npx vitest run tests/field.test.ts` → FAIL.

- [ ] **Step 3: Implement** — `src/lib/dotfield/field.ts`

```ts
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
```

- [ ] **Step 4: Run, verify pass.** `npx vitest run tests/field.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/dotfield/field.ts tests/field.test.ts
git commit -m "feat: dot-field pure helpers (lattice, ease, tween) (tested)"
```

---

## Task 7: DotField component (canvas + cursor reaction + egg wiring)

Mount one canvas behind everything. Ambient cursor reaction everywhere; the egg is enabled via a prop (homepage only). Honors `prefers-reduced-motion` (no animation), pauses on tab-hidden, rebuilds on resize. Text sampling lives here (needs canvas). Reuses `field.ts` + `sequence.ts`.

**Files:**
- Create: `src/components/DotField.astro`
- Modify: `src/layouts/BaseLayout.astro` (mount it; accept an `egg` prop to pass through)

- [ ] **Step 1: Create `src/components/DotField.astro`**

```astro
---
interface Props { egg?: boolean; }
const { egg = false } = Astro.props;
---
<canvas id="dotfield" aria-hidden="true" data-egg={egg ? '1' : '0'}></canvas>
<style>
  #dotfield{position:fixed;inset:0;z-index:0;pointer-events:none}
</style>
<script>
  import { buildLattice, tween, type Dot } from '../lib/dotfield/field';
  import { createSequence } from '../lib/dotfield/sequence';

  const SAGE = (a:number) => `rgba(111,144,112,${a})`;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('dotfield') as HTMLCanvasElement;
  const eggOn = canvas?.dataset.egg === '1';
  if (canvas && !reduce) {
    const DPR = Math.min(devicePixelRatio || 1, 2);
    let ctx = canvas.getContext('2d')!, VW = 0, VH = 0, dots: Dot[] = [];
    const GAP = 16;
    function size(){ VW=innerWidth; VH=innerHeight; canvas.width=VW*DPR; canvas.height=VH*DPR; canvas.style.width=VW+'px'; canvas.style.height=VH+'px'; ctx=canvas.getContext('2d')!; ctx.setTransform(DPR,0,0,DPR,0,0); }
    size(); dots = buildLattice(VW, VH, GAP);

    let tStart = performance.now();
    const snapshot = () => { for (const d of dots){ d.sx=d.x; d.sy=d.y; } tStart=performance.now(); };

    // text → points at ~8px so words read; uses an offscreen canvas
    function samplePoints(text:string){
      const oc=document.createElement('canvas'); oc.width=VW; oc.height=VH; const o=oc.getContext('2d')!;
      const words=text.split(' '); let lines=[text];
      if(words.length>2){ const m=Math.ceil(words.length/2); lines=[words.slice(0,m).join(' '), words.slice(m).join(' ')]; }
      let fs=(VH*0.32)/lines.length; o.font=`600 ${fs}px Georgia`;
      const mw=Math.max(...lines.map(l=>o.measureText(l).width)); if(mw>VW*0.68) fs*=VW*0.68/mw;
      o.font=`600 ${fs}px Georgia`; o.fillStyle='#000'; o.textAlign='center'; o.textBaseline='middle';
      const lh=fs*1.14, sy=VH*0.45-(lines.length-1)*lh/2; lines.forEach((l,i)=>o.fillText(l,VW/2,sy+i*lh));
      const im=o.getImageData(0,0,VW,VH).data, pts:{x:number,y:number}[]=[];
      for(let y=0;y<VH;y+=8) for(let x=0;x<VW;x+=8) if(im[(y*VW+x)*4+3]>90) pts.push({x,y});
      return pts;
    }
    function setWord(text:string){
      const P=samplePoints(text); if(!P.length) return;
      const order=[...dots.keys()]; for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
      for(let k=0;k<order.length;k++){ const d=dots[order[k]]; if(k<P.length){ d.tx=P[k].x; d.ty=P[k].y; d.at=0.4; } else { d.tx=d.x; d.ty=d.y; d.at=0; } }
      snapshot();
    }
    function rest(){ for(const d of dots){ d.tx=d.hx; d.ty=d.hy; d.at=0.3; } snapshot(); }
    rest();

    // egg sequence (homepage only)
    let playing=false;
    const SEQ=[{word:'hello'},{word:'may i share a story?'},
      {word:'i',hold:700},{word:'grew',hold:650},{word:'up',hold:650},{word:'taking',hold:750},{word:'things',hold:750},{word:'apart',hold:1300},
      {word:'(your',hold:900},{word:'real',hold:650},{word:'story',hold:650},{word:'goes',hold:650},{word:'here)',hold:1700}];
    const seq = createSequence({
      beats: SEQ, autoStart: 2,
      onWord: setWord,
      onSettle: () => { setTimeout(()=>{ playing=false; document.body.classList.remove('egg'); rest(); seq.reset(); }, 1500); },
      setTimer: (fn,ms)=>setTimeout(fn,ms), clearTimer: (h)=>clearTimeout(h as number),
    });
    if (eggOn) {
      addEventListener('click', (e) => {
        if ((e.target as HTMLElement)?.closest('a')) return;   // links/text never trigger
        if (!playing){ playing=true; document.body.classList.add('egg'); }
        seq.click();
      });
    }

    // ambient cursor reaction
    let mx=-999,my=-999,mIn=false;
    addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY; mIn=true; });
    addEventListener('mouseleave', ()=>{ mIn=false; });

    // pause when tab hidden
    let raf=0, hidden=false;
    document.addEventListener('visibilitychange', ()=>{ hidden=document.hidden; if(!hidden){ tStart=performance.now(); loop(); } });
    addEventListener('resize', ()=>{ size(); dots=buildLattice(VW,VH,GAP); rest(); });

    const DUR=340;
    function loop(){
      if(hidden) return;
      ctx.clearRect(0,0,VW,VH);
      const p=Math.min((performance.now()-tStart)/DUR,1);
      for(const d of dots){ d.x=tween(d.sx,d.tx,p); d.y=tween(d.sy,d.ty,p); d.a += (d.at-d.a)*0.12; }
      const react=!playing && mIn, R=110;
      for(const d of dots){
        if(d.a<0.02) continue;
        let rx=d.x, ry=d.y, rad=1.6, al=d.a;
        if(react){ const dx=d.x-mx, dy=d.y-my, dist=Math.hypot(dx,dy)||1; if(dist<R){ const f=1-dist/R; rx=d.x-dx/dist*f*9; ry=d.y-dy/dist*f*9; rad=1.6+f*2.2; al=d.a+f*0.42; } }
        ctx.beginPath(); ctx.arc(rx,ry,rad,0,7); ctx.fillStyle=SAGE(al); ctx.fill();
      }
      raf=requestAnimationFrame(loop);
    }
    loop();
  }
</script>
```

- [ ] **Step 2: Mount in `src/layouts/BaseLayout.astro`** — add `egg` to Props, import and render the canvas as the first body child.

```astro
// in frontmatter:
import DotField from '../components/DotField.astro';
interface Props { title: string; description?: string; egg?: boolean; }
const { title, description = 'Ben Ashdown — software engineer.', egg = false } = Astro.props;
// in <body>, before <div class="content">:
<DotField egg={egg} />
```

- [ ] **Step 3: Verify build + manual**

Run: `npm run build` (expected: no errors).
Then `npm run dev`, open `localhost:4321`: dots render behind content; moving the cursor makes nearby dots drift + brighten. (Egg wiring tested in Task 8.)
Also toggle OS "reduce motion" and reload → no canvas animation, content fully usable.

- [ ] **Step 4: Commit**

```bash
git add src/components/DotField.astro src/layouts/BaseLayout.astro
git commit -m "feat: DotField canvas — ambient cursor reaction, reduced-motion + tab-pause"
```

---

## Task 8: Homepage hero + easter-egg integration

**Files:**
- Modify: `src/pages/index.astro` (replace placeholder)

- [ ] **Step 1: Replace `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Ben Ashdown" egg={true}>
  <section class="hero">
    <h1>Ben Ashdown</h1>
    <p class="role">Software engineer</p>
    <p class="line">I build things, read more than I should, and keep the words worth keeping. Welcome in.</p>
    <p class="social"><a href="#">GitHub</a> · <a href="#">LinkedIn</a> · <a href="#">Email</a></p>
  </section>
</BaseLayout>
<style>
  .hero{min-height:74vh;display:flex;flex-direction:column;justify-content:center;text-align:left;transition:opacity .4s}
  body.egg .hero{opacity:.05}             /* hero steps aside while the dots tell the story */
  .hero h1{font-size:clamp(44px,8vw,78px);margin:0;letter-spacing:-.02em}
  .hero .role{font-family:var(--font-serif);font-size:22px;color:var(--soft);margin:4px 0 18px}
  .hero .line{font-size:17px;max-width:42ch;margin:0 0 22px}
  .hero .social{font-size:13px}
</style>
```

- [ ] **Step 2: Manual verification**

Run `npm run dev`, open `localhost:4321`:
- Click empty background → hero fades, dots clear, "hello" forms (legible) → click → "may i share a story?" → click → autoplays the placeholder story → settles → dots fade back to ambient field, hero returns.
- Clicking the nav/social links does NOT trigger the egg.
- Reduced-motion on → clicking does nothing animated; page fine.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: homepage hero + easter-egg trigger"
```

---

## Task 9: Cross-page persistence (View Transitions decision)

Resolve the spec's open decision so the fixed dot field doesn't hard-reload between pages.

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Add Astro View Transitions** — import `ClientRouter` from `astro:transitions` and render `<ClientRouter />` in `<head>`. Give the canvas `transition:persist` so it survives navigation.

```astro
// head:
import { ClientRouter } from 'astro:transitions';
<ClientRouter />
// canvas (DotField.astro): add transition:persist name="dotfield"
```

- [ ] **Step 2: Verify** — `npm run dev`, navigate Home → Projects → Essays: the dot field stays put (no flash/reset); ambient reaction continues. If `transition:persist` causes the script to not re-run where needed, fall back to re-init on `astro:page-load` (document this in the file).

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro src/components/DotField.astro
git commit -m "feat: persist dot field across navigation via View Transitions"
```

---

## Task 10: Final pass — build, types, tests, accessibility

- [ ] **Step 1: Full check**

Run: `npm run check && npm run test && npm run build`
Expected: 0 type errors, all unit tests pass, clean build.

- [ ] **Step 2: Accessibility sweep** — confirm: canvas `aria-hidden`, all nav/links keyboard-focusable with visible focus ring, reduced-motion path verified, site fully readable with JS disabled (dots absent).

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "chore: final type/test/build/a11y pass"
```

---

## Deferred (from spec — not in this plan)
- The real story text, real serif choice, Quotes section final shape, Resume PDF, deploy host. These are content/decision items Ben supplies later; the structure above is built to absorb them without rework.
