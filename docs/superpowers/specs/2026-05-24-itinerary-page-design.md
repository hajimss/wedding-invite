# Itinerary Page Design

## Summary

A dedicated `/itinerary` page displaying the wedding day programme as a vertical timeline, linked from the Itinerary section on the main page.

## What's Being Built

### 1. New page: `app/itinerary/page.tsx`

Matches the existing page aesthetic (BotanicalBackground header, cream body, LanguageToggle, back link).

**Header:** "Programme" title in gold script, date & venue subtitle, gold hairline rule, back link (← Back) top-left.

**Timeline events (vertical, gold dots, connecting line):**

| Time | Title | Sub-text | Dot |
|---|---|---|---|
| 10.00am | Nikah Ceremony | — | Major (filled) |
| 11.00am | Buffet Catering Commences | — | Minor |
| 12.30pm | Arrival of Bride & Groom | Live kompang · Silat & Selawat · Doa recitation | Major (filled) |
| 2.15pm | Cake Cutting & Speeches | — | Minor |
| 3.45pm | End of Event | — | Minor |

**Footer:** Italic closing quote — "We look forward to celebrating with you"

### 2. Update: `app/page.tsx` — Itinerary section (lines 143–155)

Replace the "coming soon" placeholder with a sage "View Programme →" button linking to `/itinerary`, matching the RSVP button style.

### 3. Update: `lib/translations.ts`

Add bilingual strings for the itinerary page: page label, timeline event titles/sub-text, CTA button, and closing quote.

## Out of Scope

- No admin editing of itinerary items — content is hardcoded in translations.
- No per-guest itinerary variation.
