# Design: Everything BEN — Ben Ashdown's personal site

Status: APPROVED (brainstorm)
Date: 2026-06-10
Author: Ben Ashdown (with Claude)

## Problem & purpose

A personal website for **Ben Ashdown**, software engineer (currently between roles).
It showcases him **professionally and personally** — a warm, smart, kind, competent
home on the internet that doubles as a "here's who I am" for opportunities, and a
place for his own interests.

It should feel **warm, smart, kind / professional, competent** — clean-ish, not stark
or stripped. Distinctive and unmistakably his, not a template.

## The design

### Identity / visual language
- **Palette:** warm off-white paper (`~#f5f1e8`), ink (`~#2a2722`), one muted, non-jarring
  **sage green** accent (`~#6f9070`). Soft tones.
- **Type:** a literary **serif** for headings/voice (Georgia as placeholder — pick a real
  serif e.g. Fraunces/Spectral during design), clean **sans** for nav/body.
- **Density:** generous and warm, not minimal-stark. Custom, not an off-the-shelf theme.

### Structure
- **Minimal hero homepage**, left-aligned: full name **Ben Ashdown**, role line, a one-line
  intro, a few links (GitHub / LinkedIn / Email).
- **Separate pages** for the rooms: **Projects**, **Essays**, **Quotes**, **Resume**.
- **Persistent nav:** a small letter-spaced **"BA"** monogram top-left; section links top-right.
  Every section reachable in one click.

### The signature — a site-wide dot field with a hidden story
A faint field of **dots** is a **fixed background behind every page** (the site's "skin").
It has two behaviors:

1. **Ambient (always):** dots gently react to the cursor — those near the pointer drift
   toward it and brighten (a soft lens + spotlight). Present, never distracting.
2. **Easter egg (on click of empty background):** the field "comes together" to tell a
   short story, then settles back. Discoverable by clicking empty space; clicking
   links/text never triggers it.

**Easter-egg sequence (click-driven, then autoplay):**
- Field is calm → visitor clicks empty background →
- **click → `hello`** (the non-word dots fade out; a subset gathers into the word, dense
  enough to read, same dot size/opacity as the field) →
- **click → `may i share a story?`** (two lines; the hint reads "click for yes →") →
- **click (the "yes") → autoplays Ben's story** word by word at a reading pace →
- **settles**, then the dots **fade back into the full ambient field**.
- A click during autoplay **skips to the end**. It never loops.

**Transition:** when a word changes, every participating dot snapshots its position and
**flies to its new spot, all landing together (~340ms, ease-in-out)** — clearly the same
dots rearranging, not a crossfade.

**Story text:** Ben writes it later. Placeholder until then. The opening beats
(`hello`, `may i share a story?`) are fixed; the tail is his story.

**Accessibility:** respects `prefers-reduced-motion` — no animation; the page is fully
usable and readable without the canvas (dots are decorative, `aria-hidden`). With JS
off, the site works completely; the dots are simply absent.

### Sections (content shape — loose, to flesh out later)
- **Projects** — each: title + one-liner + outcome. (Markdown.)
- **Essays** — Ben's writing. (Markdown.)
- **Quotes** — a mix of others' quotes and Ben's own lines, possibly with his thoughts
  alongside. Exact shape TBD.
- **Resume** — the formal version. (Page; optional downloadable PDF — TBD.)

## Architecture / components
- **Astro** static site.
- **BaseLayout** — `<head>`/SEO, the persistent nav, the `DotField` canvas, a `<slot/>` for
  page content, footer.
- **DotField** (client-side island) — one `<canvas>` fixed behind content + the script:
  builds the dot lattice, runs the ambient cursor reaction, and runs the easter-egg
  sequence state machine (idle → hello → question → autoplay → settle → idle). The egg
  is wired only on the homepage; the ambient field runs everywhere.
- **Content collections** (Zod-typed) for `projects`, `essays`, `quotes` so adding an item
  is a markdown file, not a code change.
- **Pages:** `/` (hero), `/projects` (+ detail), `/essays` (+ detail), `/quotes`, `/resume`, `404`.
- **DotField persistence across navigation is a decision point:** a plain Astro MPA reloads
  each page, re-initializing the canvas. Use **Astro View Transitions** (or a persisted
  island) so the fixed dot field doesn't flash/reset between pages — confirm the approach
  during planning. (Re-init per page is acceptable, just less seamless.)

## Data flow
Markdown files → Astro content collections (build-time, Zod-validated) → static HTML pages.
The dot field is pure client-side rendering; it holds no data and persists nothing.

## Error handling / edge cases
- `prefers-reduced-motion: reduce` → dot animation disabled (static or absent); content unaffected.
- No JS / canvas unsupported → full site works; dots absent.
- Window resize → rebuild the dot lattice to the new viewport.
- Tab hidden → pause the animation loop (battery/perf).
- A story word wider than the viewport → font auto-fits / wraps to two lines (handled).
- Empty section (e.g. no projects yet) → graceful empty state, not a blank page.
- Bad/missing markdown frontmatter → fails the build (Zod), so it never ships broken.

## Performance
- Canvas with a few thousand small dots, animated via one `requestAnimationFrame` loop.
- Pause when the tab is hidden; honor reduced-motion (no loop at all then).
- Consider reducing dot count on small/low-power screens.
- Pages otherwise static, near-zero JS apart from the DotField island → fast loads, strong SEO.

## Testing
Right-sized for a static content site:
- **DotField state machine** — unit-test the sequence logic: idle→hello→question→autoplay→
  settle→idle; "skip on click during autoplay"; reduced-motion short-circuit.
- **Content collections** — Zod schemas validate at build; a build is the coverage for content.
- **Manual / visual** — the egg legibility, the ambient reaction feel, reduced-motion path,
  no-JS render, mobile layout.

## Tuning baselines (from the approved prototype — starting points, refine in build)
- **Dot lattice:** ~16px grid spacing (a few thousand dots at ~1080p); rebuild on resize.
- **Word formation:** sample letters at ~8px spacing so words are dense enough to read;
  word dots ~0.4 opacity vs the ambient field ~0.3; same dot radius (~1.6px) as the field.
- **Transition:** ~340ms, ease-in-out, all dots arriving together.
- **Autoplay pace:** ~650–800ms per word (short words faster), with a longer beat on the
  opening lines; settle ~1.5s before fading back to the field.
- **Ambient cursor reaction:** ~110px radius lens + brighten.

## Open questions (not blocking the build)
- The real **serif** typeface choice.
- **Quotes** section exact shape (others' vs own, with/without commentary).
- **Resume** as page vs downloadable PDF (or both).
- **Story text** (Ben writes later).
- **Host** for deployment (static host — to choose).

## Out of scope (for now)
- A CMS / admin UI (markdown files are the content system).
- The literal story copy and real project/essay/quote content (Ben supplies later).
- Newsletter/analytics/comments — not part of this design.
