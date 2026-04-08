---
title: Add to Calendar Feature
date: 2026-04-09
status: approved
---

# Add to Calendar

Allow invitees to add the wedding event to their phone/computer calendars directly from the site.

## Overview

A reusable `AddToCalendar` component renders two buttons — **Google Calendar** and **Apple Calendar** — and is placed in two locations: the `/info` page venue section and the RSVP success screen.

No external libraries. No API routes. All logic runs client-side.

---

## Config Changes (`lib/config.ts`)

Add a `WEDDING_EVENT` export:

```ts
export const WEDDING_EVENT = {
  title: 'Hazim & Idayu Wedding',
  date: '20260606',              // YYYYMMDD — all-day ICS format
  location: 'Begonia Pavilion, 1 Pasir Ris Cl, Singapore 519599',
  description: 'Join us as we celebrate our wedding day.',
}
```

This is the single source of truth for calendar event data.

---

## Component (`components/AddToCalendar.tsx`)

Client component. Two buttons rendered side by side.

### Google Calendar button

Builds a URL to `https://calendar.google.com/calendar/render` with query params:
- `action=TEMPLATE`
- `text` — event title
- `dates` — `20260606/20260607` (all-day range, end date is exclusive)
- `details` — description
- `location` — venue

Opens in a new tab via `window.open`.

### Apple Calendar button

Generates an ICS string in-browser:

```
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260606
DTEND;VALUE=DATE:20260607
SUMMARY:Hazim & Idayu Wedding
LOCATION:Begonia Pavilion, 1 Pasir Ris Cl, Singapore 519599
DESCRIPTION:Join us as we celebrate our wedding day.
END:VEVENT
END:VCALENDAR
```

Creates a `Blob` with `text/calendar` MIME type, constructs an object URL, programmatically clicks a hidden `<a>` with `download="wedding-hazim-idayu.ics"`, then revokes the URL.

### Styling

Matches existing sage/gold palette:
- Small, understated buttons with sage border and text
- `font-sans text-[10px] tracking-[2px] uppercase`
- Side by side with a small gap
- Consistent with the existing `venue_directions` link style on the info page

---

## Placements

### 1. `/info` page — Venue section (`app/info/page.tsx`)

Insert `<AddToCalendar />` after the "Get Directions" link, still within the Venue `<section>`. Guests read the venue details and immediately have the option to save the date.

### 2. RSVP success screen (`app/rsvp/page.tsx`)

Expand the success state (currently just a single `<p>`) to include `<AddToCalendar />` below the confirmation message. A natural "what's next" action after confirming attendance.

---

## Out of Scope

- Timeslot-specific events (all-day only, per decision)
- Outlook / other calendar platforms
- Server-side ICS generation
