# Website Revamp — Single Scrollable Page

**Date:** 2026-04-15

## Overview

Merge the hero page (`/`) and info page (`/info`) into a single scrollable page. Remove the guest-type questionnaire flow entirely. Replace per-guest arrival timeslots with a single ceremony duration (11AM – 4PM).

---

## Goals

1. Make the info the main page — guests land directly on the full experience at `/`.
2. Remove friction — no questionnaire gate before seeing the event details.
3. Simplify timing info — show the whole ceremony window (11AM – 4PM) rather than segmented arrival times.

---

## Page Structure

### Single page at `/`

The page has two logical zones rendered in one scroll:

**Zone 1 — Hero (above the fold)**

Same visual design as the current hero (`app/page.tsx`), with these changes:
- Remove the CTA button and its sub-label.
- Replace `TimeslotBadge` with a new inline duration badge showing `11AM – 4PM`.
- Add a subtle `↓ scroll for details` hint below the duration badge.
- `LanguageToggle` appears once, in the hero zone (same position as the current hero). The duplicate instance from the `/info` hero strip is not carried over.

**Zone 2 — Info sections (below the fold)**

All sections from `app/info/page.tsx` in the same order:
- Venue
- Our Story
- RSVP
- Add to Calendar
- Send a Message
- Playlist
- Our Memories
- Contact

The cream background (`bg-cream`) starts at the info sections, same as today.

---

## Component Changes

### `app/page.tsx`
Rewritten to be the merged page. Combines the hero markup from the current `app/page.tsx` with all sections from `app/info/page.tsx`. Fetches photos (currently done in `/info`). No routing logic — no `handleCta`, no `loadGuestType`.

### `app/info/page.tsx`
Deleted. Content moves to `app/page.tsx`. The `SectionTitle` and `ContactRow` helper components defined at the bottom of this file move to `app/page.tsx`.

### `app/questionnaire/page.tsx`
Deleted.

### Redirects
Both `/info` and `/questionnaire` redirect to `/` via `next.config.js` (permanent, server-side `redirects` array) so any bookmarked or shared links still work.

### `components/TimeslotBadge.tsx`
Deleted. Replaced inline in `app/page.tsx` with a duration badge:

```tsx
<div className="inline-flex flex-col items-center bg-sage text-white rounded-2xl px-7 py-3.5">
  <span className="font-sans text-[9px] tracking-[3px] uppercase opacity-85 mb-1">CEREMONY</span>
  <span className="font-serif text-[40px] font-light leading-none">11AM – 4PM</span>
  <span className="font-sans text-[10px] tracking-[2px] opacity-80 mt-1">06 June 2026</span>
</div>
```

### `lib/guest-type.ts`
Kept as-is (no consumers after this change, but safe to leave). The `TIMESLOTS` constant and `GuestType` type are no longer referenced in the UI.

---

## Routing

| Route | Before | After |
|---|---|---|
| `/` | Hero page with CTA | Merged hero + info page |
| `/info` | Info page (guarded by guest type) | Redirect → `/` |
| `/questionnaire` | Guest type questionnaire | Redirect → `/` |

All other routes (`/rsvp`, `/upload`, `/approved`, `/rejected`, `/admin/rsvp`) are unaffected.

---

## What Is Removed

- Guest-type questionnaire (`/questionnaire` page)
- Per-guest arrival timeslots (10:00 AM / 11:00 AM / 1:00 PM)
- Personalised greeting ("Welcome, Family" / "Welcome, Friends")
- `"Change"` button in the info header
- `TimeslotBadge` component
- `loadGuestType` / `clearGuestType` usage in the main page flow

---

## Out of Scope

- Changes to RSVP, upload, admin, or memory wall flows.
- Language translation strings (existing `t.*` keys used as-is; keys for questionnaire and greeting become dead but are not deleted).
- Any visual redesign beyond what is described above.
