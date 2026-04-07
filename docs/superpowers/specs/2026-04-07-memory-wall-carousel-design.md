# Memory Wall Carousel — Design Spec

**Date:** 2026-04-07
**Status:** Approved

## Overview

Replace the static `MemoryWall` grid with a peek carousel — a horizontally scrollable strip where the active photo is large and centred, and neighbouring photos peek in from both edges. Interaction is swipe/drag only (no auto-advance). Smooth scrolling throughout.

## Component: `MemoryWall`

File: `components/MemoryWall.tsx` (modified in-place)

### Layout

- **Scroll container** — full-width `div` with `overflow-x: scroll`, `scroll-snap-type: x mandatory`, `scroll-behavior: smooth`, `-webkit-overflow-scrolling: touch`, and `scrollbar-width: none` (hidden scrollbar).
- **Track** — a flex row of slide items inside the scroll container.
- **Slide item** — each photo occupies one snap point. Width is set so the active slide fills most of the viewport and ~52px of the next/previous slides peek in on each side (achieved with `calc(100% - 104px)` width per slide + side padding on the container).
- **Snap alignment** — `scroll-snap-align: center` on each slide.

### Active vs Peek visual treatment

- Active (centred) slide: full height (`~200px`), full opacity, subtle box-shadow.
- Peeking slides: same width, but visually dimmed (`opacity: 0.45`) and slightly shorter (`scale-y` or reduced height via padding) to frame the active photo without JS tracking which slide is current.
- Since peek dimming via `:has()` or JS scroll tracking adds complexity, use a simpler approach: apply uniform height to all slides but pad the track so side slides appear at the edges naturally. The dimming is achieved with a persistent semi-transparent overlay on non-active slides tracked via an `activeIndex` state variable updated on scroll.

### Dot indicators

- Row of dots centred below the scroll container.
- Active dot: pill shape (`width: 14px, height: 5px, border-radius: 3px`) in sage/stone colour.
- Inactive dots: small circles (`6px × 6px`) in light grey.
- `activeIndex` state drives which dot is the pill. Updated via `onScroll` on the container.
- Show dots only when there are 2+ photos.

### Guest name

- Absolute-positioned overlay at the bottom of each slide.
- Gradient: `linear-gradient(to top, rgba(0,0,0,0.55), transparent)`.
- Guest name in white, `font-sans text-[10px]`, truncated.

### Empty state

Unchanged — centred grey text `t.memories_empty` when `photos.length === 0`.

## Scroll / Interaction

- **Scroll behaviour:** `scroll-behavior: smooth` on the container ensures animated snapping between slides.
- **No auto-advance** — the carousel only moves on guest swipe or drag.
- **Keyboard:** left/right arrow keys advance the active index (via `onKeyDown` on the container with `tabIndex={0}`) and call `scrollTo` with `behavior: 'smooth'`.
- **Active index tracking:** attach `onScroll` to the container ref. In the handler, compute `activeIndex = Math.round(scrollLeft / slideWidth)`. Debounce is not needed — `scroll-snap` ensures the final resting position is always a whole slide.

## Implementation Notes

- No external carousel library. Pure CSS scroll-snap + React state for dot tracking.
- The `useRef` on the scroll container is used for the `scrollTo` calls from keyboard handlers.
- `scroll-snap-stop: always` is set on each slide to prevent fast swipes from skipping multiple slides.
- Cloudinary URLs are used as-is (already optimised via Cloudinary transformations).
- All Tailwind classes; no inline styles in final implementation.

## Files Changed

| File | Change |
|---|---|
| `components/MemoryWall.tsx` | Replace grid with peek carousel |

No other files change.

## Out of Scope

- Lightbox / full-screen photo view
- Auto-play
- Pagination beyond dots (e.g. "3 / 12" counter)
