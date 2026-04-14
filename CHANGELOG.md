# Changelog — Hazim & Idayu Wedding Website

All notable changes to this project are documented here.

---

## Initial Build

### Project Scaffold
- Bootstrapped Next.js project with App Router, TypeScript, and Turbopack
- Configured Jest with jsdom and Node test environments
- Set up path aliases (`@/`) and project structure

### Configuration (`lib/config.ts`)
- Added venue details (name, address, Google Maps embed URL, directions link)
- Added contact details for Hazim and Idayu
- Added couple's story quote
- Added timeslot configuration per guest type (family: 11 AM, friends-couple: 2 PM, friends-parents: 11 AM)

### Guest Type Utilities (`lib/guest-type.ts`)
- `saveGuestType(type)` — persists guest type to `localStorage` under key `wedding-guest-type`
- `loadGuestType()` — reads and validates the stored guest type
- `clearGuestType()` — removes the stored key
- All functions wrapped in try/catch for SSR safety

### Translations (`lib/translations.ts` + `lib/language-context.tsx`)
- Full bilingual support: English (`en`) and Bahasa Malaysia (`my`)
- Keys cover all UI strings: hero page, questionnaire, info page, sections, contact labels
- `LanguageProvider` React context wraps the app and persists language choice to `localStorage`
- `useTranslation()` hook returns the active translation object and a `setLang` toggle

### Tailwind v4 Theme (`app/globals.css`)
- Defined custom colour tokens: `sage` (`#7a9e87`), `gold` (`#c9a84c`), `cream` (`#faf8f5`)
- Configured font families via `@theme inline {}` (required for `next/font` compatibility — see Bug Fixes)

### Root Layout (`app/layout.tsx`)
- Loaded three Google Fonts via `next/font/google`: Great Vibes (script), Cormorant Garamond (serif), Josefin Sans (sans-serif)
- Each font uses the `variable` prop to inject a CSS custom property onto `<body>`
- `LanguageProvider` wraps all pages

---

## Pages

### Hero / Landing Page (`app/page.tsx`)
- Displays couple's names in script font, wedding date in Gregorian and Hijri
- CTA button routes to `/info` if guest type already saved, otherwise to `/questionnaire`
- Bilingual label and sub-label via `useTranslation()`

### Questionnaire Page (`app/questionnaire/page.tsx`)
- Two-step flow with animated progress dots
- Step 1: Are you family or friends?
- Step 2 (friends only): Are you attending as a couple or with parents?
- Saves guest type to localStorage and redirects to `/info`
- Back button on step 2 returns to step 1

### Info Page (`app/info/page.tsx`)
- Redirects to `/questionnaire` if no guest type is stored
- Personalised greeting based on guest type (family vs friends)
- Displays `TimeslotBadge` with arrival time specific to guest type
- Venue section with address, embedded Google Map, and directions link
- Our Story section with couple's quote
- Send a Message section (see `MessageForm`)
- Contact section with Hazim and Idayu's phone numbers
- "Change" button clears stored guest type and returns to questionnaire

---

## Components

### `BotanicalBackground`
- SVG botanical illustration rendered as a decorative background
- Supports `intensity` prop: `"light"` (reduced opacity, used on inner pages) or `"full"` (landing page)

### `LanguageToggle`
- Fixed-position button to switch between EN and MY
- Positioned top-left on all pages

### `TimeslotBadge`
- Displays the guest's assigned arrival timeslot
- Reads timeslot from `lib/config.ts` based on `guestType` prop
- Shows date label and arrival label passed as props (bilingual)

### `MessageForm`
- Form with name, message, and recipient fields (Hazim / Idayu / Both)
- Submits to `/api/send-message` via `fetch`
- Shows inline success or error state after submission
- Input and button styles consistent with overall design system

---

## API

### `POST /api/send-message` (`app/api/send-message/route.ts`)
- Validates required fields: `name` (non-blank), `message` (non-blank), `recipient` (`hazim` | `idayu` | `both`)
- Returns `400` with descriptive error for any validation failure
- Sends email(s) via Nodemailer using Gmail SMTP (credentials from `.env.local`)
- When `recipient = "both"`, sends two separate emails in sequence
- Subject format: `"Wedding message from <name>"`
- Returns `200 { success: true }` on completion
- Returns `500 { error: "Failed to send email" }` and logs the SMTP error on failure

---

## Tests

- `__tests__/lib/guest-type.test.ts` — unit tests for all three localStorage helpers including error-path coverage (storage `setItem`/`getItem`/`removeItem` throwing)
- `__tests__/lib/translations.test.ts` — verifies all EN keys are present in MY translation; keys derived dynamically from `translations.en` (self-updating)
- `__tests__/api/send-message.test.ts` — integration tests for the API route (400 validations, correct send counts, subject format, 500 on SMTP throw); uses `/** @jest-environment node */` because `NextRequest` requires the Node.js `Request` global

---

## Bug Fixes

### SMTP "Failed to send email" (silent catch)
- **Problem:** The catch block in `/api/send-message` was `catch {}`, silently swallowing all errors. The UI showed "Failed to send email" with no diagnostic information.
- **Fix:** Added `console.error('[send-message] SMTP error:', err)` to the catch block so the real error is visible in the dev server log.
- **Root cause discovered:** `SMTP_PASS` in `.env.local` contained an expired Gmail App Password, and `EMAIL_IDAYU` was still the `idayu@example.com` placeholder. Both were updated by the user.

### Script font not rendering (Great Vibes / Pinyon Script falling back to system font)
- **Problem:** The script font (`font-script`) fell back to a system font instead of rendering Great Vibes.
- **Root cause:** `next/font/google` with the `variable` prop injects the CSS custom property (e.g. `--font-great-vibes`) onto the element that has the className — in this case `<body>`. Tailwind v4's `@theme {}` block places custom properties on `:root`. A `var(--font-great-vibes)` defined on `:root` cannot resolve because the variable only exists on `<body>`, not on `:root`.
- **Fix:** Moved font-family variables from `@theme {}` to `@theme inline {}`. The `inline` keyword causes Tailwind to inline the `var(...)` expression directly into each utility class's CSS declaration, so resolution happens at the element level where the variable is available via CSS inheritance from `<body>`.

---

## Typography & Design Changes

### Font stack finalised
- **Script (names):** Great Vibes — elegant cursive matching the physical invitation card
- **Serif (headings, body text):** Cormorant Garamond — classic, high-contrast serif
- **Sans-serif (labels, UI):** Josefin Sans — geometric, clean, wide tracking

### Removed `font-thin` throughout
- All `font-thin` (100 weight) utility classes removed from every page and component
- **Reason:** On mobile screens, 100-weight text is too light to read comfortably, especially against the botanical watermark background

### Font sizes increased by 10%
- All explicit font sizes (`text-[Npx]` and named Tailwind sizes) increased by ~10% across all pages and components
- **Affected files:** `app/page.tsx`, `app/questionnaire/page.tsx`, `app/info/page.tsx`, `components/LanguageToggle.tsx`, `components/MessageForm.tsx`, `components/TimeslotBadge.tsx`
- **Reason:** Improved readability on small mobile screens without breaking the overall proportions

---

## Environment Variables (`.env.local`)

| Variable | Purpose |
|---|---|
| `SMTP_HOST` | Gmail SMTP host (`smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (`587`) |
| `SMTP_USER` | Gmail address used to send |
| `SMTP_PASS` | Gmail App Password (not account password) |
| `EMAIL_HAZIM` | Recipient address for Hazim |
| `EMAIL_IDAYU` | Recipient address for Idayu |

> `.env.local` is git-ignored and must be created manually on each deployment.
