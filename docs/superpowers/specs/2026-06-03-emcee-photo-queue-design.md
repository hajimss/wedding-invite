# Emcee Photo Queue — Design Spec

## Overview

A dedicated `/emcee` page serving as a live photo-taking queue guide for the wedding emcee. The list is preloaded from config, each item is individually checkable, and progress persists in the browser across page refreshes.

## Route

`/emcee` — new page, not linked from the main site navigation. The emcee accesses it directly by URL. No authentication required.

## Data Model

Add to `lib/config.ts`:

```ts
export type PhotoGroup = {
  section?: string              // optional section header label
  category: 'bride' | 'groom' | 'both'
  items: string[]               // each string is one individually checkable item
}

export const PHOTO_LIST: PhotoGroup[] = [
  { items: ['Grand Photo: Burhan and Sulaiman Family'], category: 'both' },
  {
    section: 'Idayu — Bride Side',
    category: 'bride',
    items: [
      'Burhan and Family',
      'Paklong and Family',
      'Nenek and Wan (both on wheelchair)',
      'Cik Roha and Family',
      'Keluarga dari Melaka',
      'Keluarga dari KL',
      'Keluarga dari Johor',
    ],
  },
  {
    section: 'Hazim — Groom Side',
    category: 'groom',
    items: [
      'Sulaiman and Family',
      'Keluarga besar Nemat',
      'Keluarga besar Mohamad Ali',
    ],
  },
  {
    section: 'Idayu — Bride Side 2nd Round',
    category: 'bride',
    items: [
      'fbaybeh',
      'shireen, hada, syafiqah and su',
      'wecreate studio (colleagues)',
    ],
  },
  {
    section: 'Hazim — Groom Side 2nd Round',
    category: 'groom',
    items: [
      'Pasir ris sec friends',
      'Mechanications',
      'Fly my kite friends',
      'DAH geng',
      'iCHAMP and change team',
    ],
  },
  { items: ['Cake Cutting'], category: 'both' },
  { items: ["Hazim's Speech"], category: 'groom' },
  { items: ["Idayu's Speech"], category: 'bride' },
  { items: ["Du'a Selamat by Idayu's Pak Long"], category: 'bride' },
  {
    section: 'After Cake/Speech',
    category: 'both',
    items: [
      'Taka/JL friends',
      'Cik Safura and Family',
      'Kakak Cute and Family',
      'Chinese Family',
      'Hi-5 Gang',
      '+any adhoc',
    ],
  },
  { items: ['Hazim & Idayu to walk around and mingle w the guests'], category: 'both' },
  { items: ['Tamat'], category: 'both' },
]
```

Total flat items: **31 checkable items** across 12 groups.

## Page Architecture

**File:** `app/emcee/page.tsx` — single `'use client'` component, no sub-components needed.

**Flat item list:** On mount, flatten `PHOTO_LIST` into a `FlatItem[]`:
```ts
type FlatItem = {
  flatIndex: number
  label: string
  category: 'bride' | 'groom' | 'both'
  section?: string   // only on the first item of a group that has a section header
}
```

**Checked state:** `checkedIndices: Set<number>` — stored in `localStorage` under key `'emcee-photo-queue'` as a JSON array of flat indices. Loaded on mount, updated on each "Done" tap.

**Active item:** First item where `flatIndex` is not in `checkedIndices`. Highlighted in gold. Has the "Done" button.

**Progress:** `checkedIndices.size / flatItems.length` — shown as a progress bar and `X / 31 done` counter.

## Visual Design

**Page header** (white background, cream below):
- Sage label: `06 JUNE 2026 · BEGONIA PAVILION`
- Serif title: `Photo Queue`
- Legend row: Bride (light purple swatch) · Groom (light blue swatch) · Both (cream swatch)

**Progress bar:** thin sage bar, `X / 31 done` counter to the right.

**Section headers** (non-interactive): small uppercase coloured label with a hairline rule extending right. Purple for bride groups, blue for groom groups, stone for both.

**Item rows** — three states:

| State | Background | Border | Text |
|---|---|---|---|
| Done | `bg-green-50/60` | `border-green-200` | strikethrough, faded |
| Active | `bg-amber-50` | `border-gold` (2px) + gold shadow | normal weight + "Done" button |
| Pending | category bg | category border | normal, slightly muted |

**Category colours:**
- Bride: `bg-purple-50 border-purple-200`, badge `text-purple-700 bg-purple-100`
- Groom: `bg-blue-50 border-blue-200`, badge `text-blue-700 bg-blue-100`
- Both: `bg-stone-50 border-stone-200`, badge `text-stone-500 bg-stone-100`

Each row: circle indicator on left (✓ when done, ▶ when active, ○ when pending) · item label · category badge · Done button (active only).

**"Done" button:** gold background, white text, taps mark the item checked and auto-scrolls to the next active item.

**Footer:** `Tap "Done" to check off · Progress saves in browser`

## Behaviour

- Checking an item is **irreversible** in this version (no undo). The emcee taps Done and the active highlight moves to the next unchecked item.
- Progress persists across page refreshes via localStorage.
- No language toggle — English only (internal tool).
- No link to this page from the main site.

## Out of Scope

- Password protection
- Admin UI to edit the list
- Undo / reset button
- Real-time sync across multiple devices
