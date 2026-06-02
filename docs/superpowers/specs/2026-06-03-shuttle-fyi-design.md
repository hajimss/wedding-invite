# Shuttle FYI Notice — Design Spec

## Overview

Add a bilingual FYI callout in the Venue section informing guests that a free shuttle bus runs from Pasir Ris MRT to the venue (Downtown East / Begonia Pavilion).

## Placement

Inside the existing Venue section in `app/page.tsx`, between the parking note and the "Get Directions →" link.

## Visual Design

- Small rounded card: `bg-sage/10 border border-sage/20 rounded-xl`
- Layout: horizontal flex — 🚌 emoji on the left, label + body + link stacked on the right
- Text sizes match surrounding section: label at ~9px tracking-wide uppercase sage, body at ~11px gray-500, link at ~10px sage with underline

## Content

| Key | EN | MY |
|---|---|---|
| `shuttle_label` | `Free Shuttle Bus` | `Bas Ulang-Alik Percuma` |
| `shuttle_body` | `Available from Pasir Ris MRT to the venue` | `Tersedia dari MRT Pasir Ris ke lokasi` |
| `shuttle_link` | `View shuttle info →` | `Lihat maklumat bas →` |

Link URL: `https://www.downtowneast.com.sg/services/pasir-ris-mrt-shuttle`  
Opens in a new tab (`target="_blank" rel="noopener noreferrer"`).

## Implementation Scope

1. Add three translation keys (`shuttle_label`, `shuttle_body`, `shuttle_link`) to the `T` type in `lib/translations.ts`, with EN and MY values.
2. Add the callout JSX inline in the Venue section of `app/page.tsx` — no new component file needed.

## Out of Scope

- No new route or page
- No server-side logic
- No new component file
