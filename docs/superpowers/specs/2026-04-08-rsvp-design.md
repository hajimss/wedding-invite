# RSVP Feature — Design Spec

**Date:** 2026-04-08
**Status:** Approved

## Overview

Add an RSVP feature consisting of three parts:
1. A teaser section on `/info` with a link to the RSVP page
2. A dedicated `/rsvp` page where guests submit their response
3. An `/admin/rsvp` page showing all responses with a running headcount

Responses are stored in Vercel KV (Redis) and trigger an email notification to Hazim and Idayu.

---

## Data Model

### `Rsvp` type — `lib/kv.ts` (extended)

```ts
export type RsvpAttendance = 'attending' | 'not-attending'

export type Rsvp = {
  id: string            // crypto.randomUUID()
  name: string          // guest's full name
  attendance: RsvpAttendance
  pax: number           // 0 when not attending
  wish: string          // optional message; empty string when attending
  submittedAt: number   // Date.now()
}
```

### KV keys

| Key | Value | Purpose |
|---|---|---|
| `rsvp:{id}` | `Rsvp` object | Full RSVP record |
| `rsvps:all` | Sorted set (score = submittedAt, member = id) | Ordered list for admin view |

### KV helper functions — `lib/kv.ts`

```ts
saveRsvp(rsvp: Rsvp): Promise<void>
getAllRsvps(): Promise<Rsvp[]>   // sorted newest-first
```

`saveRsvp` writes `rsvp:{id}` and adds to the `rsvps:all` sorted set.
`getAllRsvps` uses `zrange('rsvps:all', 0, -1, { rev: true })` then fetches each record.

---

## API

### `POST /api/rsvp`

**Request body (JSON):**
```json
{ "name": "Ahmad Faris", "attendance": "attending", "pax": 3, "wish": "" }
```

**Validation:**
- `name`: required, non-empty string
- `attendance`: must be `'attending'` or `'not-attending'`
- `pax`: required integer ≥ 1 when attending; set to `0` when not attending
- `wish`: optional string (only meaningful when not attending); default `""`

**On success:**
1. Save to KV via `saveRsvp`
2. Send notification email (see Email section)
3. Return `200` with `{ message: "Thank you, {name}!" }`

**On validation error:** `400` with `{ error: "..." }`
**On server error:** `500` with `{ error: "Something went wrong." }`

### `GET /api/rsvp`

Returns all RSVPs plus a summary:
```json
{
  "rsvps": [...],
  "summary": { "total": 12, "attending": 10, "notAttending": 2, "totalPax": 28 }
}
```

Used by the admin page. No authentication (security by obscurity — the route is unlisted).

---

## Email Notification — `lib/rsvp-email.ts`

Reuses the existing Nodemailer transporter pattern from `lib/photo-email.ts`.

Sent to `EMAIL_HAZIM` and `EMAIL_IDAYU` on every submission.

**Subject:**
- Attending: `🎉 RSVP: Ahmad Faris is coming (3 pax)`
- Not attending: `😔 RSVP: Ahmad Faris can't make it`

**Body:** Name, status, pax (if attending), wish message (if not attending), timestamp.

---

## Pages

### `/rsvp` — `app/rsvp/page.tsx`

Client component (`'use client'`). Matches the visual style of `/upload` (botanical background, centred card).

**Form fields:**
- **Name** — text input, required, `placeholder={t.rsvp_name_placeholder}`
- **Attendance toggle** — two pill buttons: "Yes, I'll be there" / "Sorry, can't make it". Selected state is visually highlighted (sage border + tint for attending, warm border + tint for not attending).
- **Pax** — number input (min 1), shown only when attendance = `'attending'`. Label: "How many people are coming? (including yourself)"
- **Wish** — textarea (optional), shown only when attendance = `'not-attending'`. Label: "Send a wish (optional)"
- **Submit button** — `t.rsvp_submit_btn`

**States:** `idle → loading → success | error`

On success: show inline thank-you message (`t.rsvp_success`). Form is hidden.
On error: show inline error (`t.rsvp_error`).

### `/admin/rsvp` — `app/admin/rsvp/page.tsx`

Server component. Fetches directly from KV (not via the API route). No auth — access by URL only.

**Layout:**
- Summary bar: "N responses · N guests · N attending · N not attending"
- Table: Name | Status | Pax | Wish (truncated) | Date

Uses plain Tailwind, no external table library. Styled for readability on desktop (the admin will view this on a browser, not mobile).

### `/info` teaser — `app/info/page.tsx` (modified)

Add a new RSVP section between the Send a Message section and the Playlist section:

```tsx
<section className="px-6 py-5 border-b border-stone-100">
  <SectionTitle>{t.section_rsvp}</SectionTitle>
  <p className="font-sans text-[11px] text-gray-500 leading-6 mb-3">{t.rsvp_subtitle}</p>
  <a href="/rsvp" className="inline-block font-sans text-[10px] tracking-[2px] text-sage uppercase border-b border-sage/40 pb-0.5">
    {t.rsvp_cta} →
  </a>
</section>
```

---

## Translations — `lib/translations.ts`

New keys added to `T`, `en`, and `my`:

| Key | EN | MY |
|---|---|---|
| `section_rsvp` | `"RSVP"` | `"RSVP"` |
| `rsvp_subtitle` | `"Let us know if you'll be joining us on the big day."` | `"Maklumkan kehadiran anda pada hari istimewa kami."` |
| `rsvp_cta` | `"RSVP Now"` | `"RSVP Sekarang"` |
| `rsvp_name_placeholder` | `"Your full name"` | `"Nama penuh anda"` |
| `rsvp_attending` | `"Yes, I'll be there"` | `"Ya, saya akan hadir"` |
| `rsvp_not_attending` | `"Sorry, can't make it"` | `"Maaf, tidak dapat hadir"` |
| `rsvp_pax_label` | `"How many people are coming? (including yourself)"` | `"Berapa ramai yang akan hadir? (termasuk anda)"` |
| `rsvp_wish_label` | `"Send a wish (optional)"` | `"Hantar ucapan (pilihan)"` |
| `rsvp_wish_placeholder` | `"Wishing you both a beautiful day…"` | `"Semoga hari istimewa kalian dipenuhi keberkatan…"` |
| `rsvp_submit_btn` | `"Confirm RSVP"` | `"Hantar RSVP"` |
| `rsvp_success` | `"Thank you! We've noted your RSVP."` | `"Terima kasih! Kami telah mencatat RSVP anda."` |
| `rsvp_error` | `"Something went wrong. Please try again."` | `"Ada masalah. Sila cuba lagi."` |

---

## Files Changed / Created

| File | Change |
|---|---|
| `lib/kv.ts` | Add `Rsvp` type + `saveRsvp` + `getAllRsvps` |
| `lib/rsvp-email.ts` | New — notification email helper |
| `app/api/rsvp/route.ts` | New — POST submit + GET list |
| `app/rsvp/page.tsx` | New — guest-facing RSVP form |
| `app/admin/rsvp/page.tsx` | New — admin response table |
| `app/info/page.tsx` | Add RSVP teaser section |
| `lib/translations.ts` | Add 12 new translation keys |

---

## Out of Scope

- Authentication on `/admin/rsvp`
- Editing or cancelling an RSVP after submission
- RSVP deadline enforcement
- Duplicate detection (same name submitting twice)
