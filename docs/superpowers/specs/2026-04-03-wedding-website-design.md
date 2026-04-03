# Wedding Website Design Spec

**Date:** 2026-04-03
**Project:** Hazim & Idayu — Walimatul Urus Wedding Website
**Event date:** 06 June 2026 (20 Zulhijjah 1447)
**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Vercel

---

## Overview

A personalised wedding information website. Guests land on a beautiful hero page, tap "View My Invitation", complete a short questionnaire that identifies their guest group, and are shown a personalised info page with their assigned arrival timeslot plus venue, story, messaging, and contact sections.

Guest group selection is persisted in `localStorage` so guests do not need to repeat the questionnaire on return visits.

The site is English by default with a Malay language toggle available on every page.

---

## Guest Groups & Timeslots

| Group | localStorage value | Arrival time |
|---|---|---|
| Family | `family` | 10:00 AM |
| Friends of the Bride & Groom's Parents | `friends-parents` | 12:00 PM |
| Friends of the Bride & Groom | `friends-couple` | 1:00 PM |

All groups attend the same venue. Timeslots are staggered to avoid overcrowding.

---

## Pages & Routing

### `app/layout.tsx`
Global layout wrapping all pages. Provides:
- Google Fonts (Great Vibes, Cormorant Garamond, Montserrat)
- Global CSS / Tailwind base
- Language context (`LanguageProvider`) — reads `wedding-lang` from localStorage, defaults to `"en"`

### `app/page.tsx` — Hero
Full-screen landing page matching the invitation card aesthetic:
- Sage green botanical SVG ferns across all four corners and edges, with watercolour wash blobs
- Gold script names "Hazim & Idayu" (Great Vibes font)
- "WALIMATUL URUS / WEDDING CEREMONY" in spaced uppercase (Montserrat)
- Gregorian and Hijri dates
- EN · MY language toggle (top-left, pill style)
- "View My Invitation" CTA button (sage green, rounded) → navigates to `/info` if `wedding-guest-type` is already set in localStorage, otherwise navigates to `/questionnaire`

### `app/questionnaire/page.tsx` — Questionnaire
Two-step questionnaire. Tracks current step in React `useState`. Same botanical background as hero (lighter opacity).

**Step 1:**
- Progress dots (2 total, step 1 active)
- Question: "You are joining us as..."
- Choices: Family / Friends (card-style buttons with radio circle)
- Selecting a choice immediately saves to localStorage and redirects (no separate "Continue" button)
- Selecting "Family" → saves `"family"` to localStorage, redirects to `/info`
- Selecting "Friends" → advances to Step 2

**Step 2** (Friends only):
- Progress dots (step 2 active)
- Back button (top-right) → returns to Step 1
- Question: "You are friends of..."
- Choices: "Hazim & Idayu" (The Bride & Groom) / "Their Parents"
- Selecting "Hazim & Idayu" → saves `"friends-couple"`, redirects to `/info`
- Selecting "Their Parents" → saves `"friends-parents"`, redirects to `/info`

### `app/info/page.tsx` — Personalised Info
Reads `wedding-guest-type` from localStorage on mount. If value is missing or invalid, redirects to `/questionnaire`.

Scrollable page with two zones:

**Hero strip (top):**
- Botanical ferns (same style, lighter)
- EN · MY toggle (top-left)
- "Change ↩" button (top-right) — clears localStorage and redirects to `/questionnaire`
- Personalised greeting: "Welcome, Family" / "Welcome, Friends"
- Gold script names
- Sage green timeslot badge: arrival time + "Saturday · 06 June 2026"

**Sections (scrollable below):**

1. **Venue** — Venue name, full address, embedded Google Map (iframe), "Get Directions →" link (opens Google Maps)
2. **Our Story** — Short paragraph about the couple, italic Cormorant Garamond style
3. **Send a Message** — Form with:
   - Name field (text input)
   - Recipient selector: "Hazim" / "Idayu" / "Both" (toggle chips)
   - Message textarea
   - "Send Wishes" button → POST to `/api/send-message`
   - Success state: envelope icon + "Message Sent · Thank you for your wishes"
   - Error state: inline error text, button re-enabled for retry
4. **Contact** — Hazim and Idayu with role labels (Groom / Bride, Pengantin Lelaki / Pengantin Perempuan) and phone numbers

### `app/api/send-message/route.ts` — SMTP API Route
Next.js Route Handler. Accepts POST with JSON body:

```ts
{ name: string, recipient: "hazim" | "idayu" | "both", message: string }
```

Validates all fields are non-empty. Uses **Nodemailer** with SMTP credentials from environment variables:

```
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_HAZIM=
EMAIL_IDAYU=
```

- `recipient: "both"` sends two separate emails — one to each address
- Returns `{ success: true }` on success, `{ error: "..." }` with appropriate HTTP status on failure
- Email subject: `"A message from [name] — Hazim & Idayu's Wedding"`

---

## localStorage Schema

| Key | Values | Purpose |
|---|---|---|
| `wedding-guest-type` | `"family"` · `"friends-parents"` · `"friends-couple"` | Guest group, persists questionnaire answer |
| `wedding-lang` | `"en"` · `"my"` | Language preference |

Both keys are written by client-side code only. `/info` treats a missing or unrecognised `wedding-guest-type` as unanswered and redirects to `/questionnaire`.

---

## Translations

All user-facing strings live in `lib/translations.ts` — a single object keyed by language code:

```ts
const t = {
  en: { greeting_family: "Welcome, Family", ... },
  my: { greeting_family: "Selamat datang, Keluarga", ... }
}
```

The `LanguageProvider` context exposes a `useTranslation()` hook used across all pages and components.

---

## Visual Design

| Element | Value |
|---|---|
| Primary green | `#7a9e87` |
| Gold | `#c9a84c` |
| Background | `#ffffff` / `#faf8f5` (sections) |
| Heading font | Great Vibes (script), Cormorant Garamond (serif) |
| Body font | Montserrat (sans-serif, weight 300/400) |
| Botanicals | SVG ferns and eucalyptus circles, sage green, low opacity |
| Watercolour wash | Radial gradient blobs, `rgba(122,158,135,0.08–0.18)` |

Botanical SVG elements are consistent across all pages. Corner clusters appear on all four corners; mid-edge fronds appear on hero and questionnaire pages.

---

## Environment & Deployment

- Hosted on **Vercel**
- SMTP credentials and email addresses set as **Vercel Environment Variables** (never committed to repo)
- `.env.local` used for local development (gitignored)
- `.superpowers/` added to `.gitignore`
