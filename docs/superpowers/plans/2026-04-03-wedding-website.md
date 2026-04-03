# Wedding Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personalised wedding information website for Hazim & Idayu's Walimatul Urus (06 June 2026) where guests complete a short questionnaire and are shown a personalised arrival timeslot, venue, story, message form, and contact details.

**Architecture:** Next.js 15 App Router with TypeScript. Guest type is persisted in `localStorage` (`wedding-guest-type`). The `/info` page reads it on mount and redirects to `/questionnaire` if absent. Language preference (`wedding-lang`) drives EN/MY string swaps via a React context. A `/api/send-message` Route Handler sends personalised wishes via Nodemailer SMTP.

**Tech Stack:** Next.js 15 · TypeScript · Tailwind CSS · Nodemailer · Jest · React Testing Library · Vercel

---

## File Structure

```
app/
  globals.css                        # Tailwind base + CSS variables
  layout.tsx                         # Server Component: fonts, metadata, LanguageProvider wrapper
  page.tsx                           # Hero page ('use client')
  questionnaire/
    page.tsx                         # Two-step questionnaire ('use client')
  info/
    page.tsx                         # Personalised info page ('use client')
  api/
    send-message/
      route.ts                       # SMTP Route Handler (server)
components/
  BotanicalBackground.tsx            # Reusable SVG botanical + watercolour (server)
  LanguageToggle.tsx                 # EN/MY pill toggle ('use client')
  MessageForm.tsx                    # Send a Message form with states ('use client')
  TimeslotBadge.tsx                  # Sage green arrival badge (server)
lib/
  config.ts                          # Venue, contacts, story constants — edit before deploy
  guest-type.ts                      # GuestType type, TIMESLOTS map, localStorage helpers
  language-context.tsx               # LanguageProvider + useTranslation hook ('use client')
  translations.ts                    # EN + MY string objects
__tests__/
  lib/
    guest-type.test.ts
    translations.test.ts
  components/
    LanguageToggle.test.tsx
    MessageForm.test.tsx
  api/
    send-message.test.ts
jest.config.ts
jest.setup.ts
tailwind.config.ts
.env.local                           # gitignored — SMTP credentials
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json` (via create-next-app)
- Create: `jest.config.ts`
- Create: `jest.setup.ts`
- Modify: `tailwind.config.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Scaffold the Next.js project**

From `/Users/hazim/Documents/Projects/wedding`, run:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

When prompted for project name, press Enter (uses directory name). Answer **Yes** to all defaults.

- [ ] **Step 2: Install runtime + dev dependencies**

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: Create `jest.config.ts`**

```ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 4: Create `jest.setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test scripts to `package.json`**

In the `"scripts"` block, add:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 6: Update `.gitignore`**

Append to `.gitignore`:

```
.env.local
.superpowers/
```

- [ ] **Step 7: Verify the scaffold runs**

```bash
npm run dev
```

Expected: Next.js dev server starts on `http://localhost:3000`. Stop with Ctrl+C.

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js project with testing setup"
```

---

## Task 2: Guest Type Utilities

**Files:**
- Create: `lib/guest-type.ts`
- Create: `__tests__/lib/guest-type.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/lib/guest-type.test.ts`:

```ts
import {
  isValidGuestType,
  saveGuestType,
  loadGuestType,
  clearGuestType,
  TIMESLOTS,
} from '@/lib/guest-type'

describe('isValidGuestType', () => {
  it('returns true for valid types', () => {
    expect(isValidGuestType('family')).toBe(true)
    expect(isValidGuestType('friends-parents')).toBe(true)
    expect(isValidGuestType('friends-couple')).toBe(true)
  })
  it('returns false for invalid values', () => {
    expect(isValidGuestType(null)).toBe(false)
    expect(isValidGuestType('unknown')).toBe(false)
    expect(isValidGuestType('')).toBe(false)
  })
})

describe('localStorage helpers', () => {
  beforeEach(() => localStorage.clear())

  it('saves and loads guest type', () => {
    saveGuestType('family')
    expect(loadGuestType()).toBe('family')
  })
  it('returns null when nothing is stored', () => {
    expect(loadGuestType()).toBeNull()
  })
  it('clears the stored guest type', () => {
    saveGuestType('friends-couple')
    clearGuestType()
    expect(loadGuestType()).toBeNull()
  })
})

describe('TIMESLOTS', () => {
  it('maps family to 10:00 AM', () => expect(TIMESLOTS.family).toBe('10:00 AM'))
  it('maps friends-parents to 12:00 PM', () => expect(TIMESLOTS['friends-parents']).toBe('12:00 PM'))
  it('maps friends-couple to 1:00 PM', () => expect(TIMESLOTS['friends-couple']).toBe('1:00 PM'))
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- __tests__/lib/guest-type.test.ts
```

Expected: FAIL — module `@/lib/guest-type` not found.

- [ ] **Step 3: Create `lib/guest-type.ts`**

```ts
export type GuestType = 'family' | 'friends-parents' | 'friends-couple'

export const GUEST_TYPE_KEY = 'wedding-guest-type'

export const TIMESLOTS: Record<GuestType, string> = {
  family: '10:00 AM',
  'friends-parents': '12:00 PM',
  'friends-couple': '1:00 PM',
}

export function isValidGuestType(value: string | null): value is GuestType {
  return (
    value === 'family' ||
    value === 'friends-parents' ||
    value === 'friends-couple'
  )
}

export function saveGuestType(type: GuestType): void {
  try {
    localStorage.setItem(GUEST_TYPE_KEY, type)
  } catch {}
}

export function loadGuestType(): GuestType | null {
  try {
    const value = localStorage.getItem(GUEST_TYPE_KEY)
    return isValidGuestType(value) ? value : null
  } catch {
    return null
  }
}

export function clearGuestType(): void {
  try {
    localStorage.removeItem(GUEST_TYPE_KEY)
  } catch {}
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- __tests__/lib/guest-type.test.ts
```

Expected: PASS — 9 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/guest-type.ts __tests__/lib/guest-type.test.ts
git commit -m "feat: add guest type utilities with localStorage helpers"
```

---

## Task 3: Site Configuration

**Files:**
- Create: `lib/config.ts`

- [ ] **Step 1: Create `lib/config.ts`**

> Update all placeholder values with real details before deploying.

```ts
// Update all values below before deploying

export const VENUE = {
  name: 'Dewan Serbaguna Indah',
  address: '123 Jalan Kenangan, Taman Indah,\n43000 Kajang, Selangor',
  // Get embed URL from Google Maps → Share → Embed a map → copy src value
  googleMapsEmbed: 'https://www.google.com/maps/embed?pb=YOUR_EMBED_ID_HERE',
  // Get directions URL from Google Maps → Share → Copy link
  googleMapsUrl: 'https://maps.google.com/?q=Dewan+Serbaguna+Indah+Kajang',
}

export const CONTACTS = {
  hazim: { phone: '+60 12-345 6789', initial: 'H' },
  idayu: { phone: '+60 19-876 5432', initial: 'I' },
}

export const STORY =
  'What started as a chance meeting became a lifetime of love. ' +
  'We are overjoyed to celebrate this moment with the people who matter most to us.'
```

- [ ] **Step 2: Commit**

```bash
git add lib/config.ts
git commit -m "feat: add site configuration file (venue, contacts, story)"
```

---

## Task 4: Translations

**Files:**
- Create: `lib/translations.ts`
- Create: `__tests__/lib/translations.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/lib/translations.test.ts`:

```ts
import { translations } from '@/lib/translations'
import type { T } from '@/lib/translations'

const REQUIRED_KEYS: (keyof T)[] = [
  'hero_ceremony_label', 'hero_ceremony_sub', 'hero_cta', 'hero_cta_sub',
  'q1_question', 'q1_sub', 'q1_family', 'q1_family_sub', 'q1_friends', 'q1_friends_sub',
  'q2_question', 'q2_sub', 'q2_couple', 'q2_couple_sub', 'q2_parents', 'q2_parents_sub',
  'q_back', 'q_step',
  'info_greeting_family', 'info_greeting_friends', 'info_change',
  'info_arrival_label', 'info_date',
  'section_venue', 'section_story', 'section_message', 'section_contact',
  'venue_directions',
  'msg_intro', 'msg_name_label', 'msg_name_placeholder', 'msg_send_to',
  'msg_recipient_hazim', 'msg_recipient_hazim_role',
  'msg_recipient_idayu', 'msg_recipient_idayu_role',
  'msg_recipient_both', 'msg_recipient_both_sub',
  'msg_message_label', 'msg_message_placeholder',
  'msg_send_btn', 'msg_success_title', 'msg_success_sub', 'msg_error',
  'contact_groom_role', 'contact_bride_role', 'lang_label',
]

describe('EN translations', () => {
  REQUIRED_KEYS.forEach(key => {
    it(`has key: ${key}`, () => expect(translations.en[key]).toBeDefined())
  })
  it('q_step formats correctly', () => {
    expect(translations.en.q_step(1, 2)).toBe('Step 1 of 2')
  })
})

describe('MY translations', () => {
  REQUIRED_KEYS.forEach(key => {
    it(`has key: ${key}`, () => expect(translations.my[key]).toBeDefined())
  })
  it('q_step formats correctly', () => {
    expect(translations.my.q_step(1, 2)).toBe('Langkah 1 daripada 2')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- __tests__/lib/translations.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `lib/translations.ts`**

```ts
export type Lang = 'en' | 'my'

export type T = {
  hero_ceremony_label: string
  hero_ceremony_sub: string
  hero_cta: string
  hero_cta_sub: string
  q1_question: string
  q1_sub: string
  q1_family: string
  q1_family_sub: string
  q1_friends: string
  q1_friends_sub: string
  q2_question: string
  q2_sub: string
  q2_couple: string
  q2_couple_sub: string
  q2_parents: string
  q2_parents_sub: string
  q_back: string
  q_step: (current: number, total: number) => string
  info_greeting_family: string
  info_greeting_friends: string
  info_change: string
  info_arrival_label: string
  info_date: string
  section_venue: string
  section_story: string
  section_message: string
  section_contact: string
  venue_directions: string
  msg_intro: string
  msg_name_label: string
  msg_name_placeholder: string
  msg_send_to: string
  msg_recipient_hazim: string
  msg_recipient_hazim_role: string
  msg_recipient_idayu: string
  msg_recipient_idayu_role: string
  msg_recipient_both: string
  msg_recipient_both_sub: string
  msg_message_label: string
  msg_message_placeholder: string
  msg_send_btn: string
  msg_success_title: string
  msg_success_sub: string
  msg_error: string
  contact_groom_role: string
  contact_bride_role: string
  lang_label: string
}

const en: T = {
  hero_ceremony_label: 'Walimatul Urus',
  hero_ceremony_sub: 'Wedding Ceremony',
  hero_cta: 'View My Invitation',
  hero_cta_sub: 'Tap to see your details',
  q1_question: 'You are joining us as...',
  q1_sub: 'Please select one to continue',
  q1_family: 'Family',
  q1_family_sub: 'Keluarga',
  q1_friends: 'Friends',
  q1_friends_sub: 'Rakan-rakan',
  q2_question: 'You are friends of...',
  q2_sub: 'Please select one to continue',
  q2_couple: 'Hazim & Idayu',
  q2_couple_sub: 'The Bride & Groom',
  q2_parents: 'Their Parents',
  q2_parents_sub: 'Ibu bapa pengantin',
  q_back: '← Back',
  q_step: (current, total) => `Step ${current} of ${total}`,
  info_greeting_family: 'Welcome, Family',
  info_greeting_friends: 'Welcome, Friends',
  info_change: 'Change ↩',
  info_arrival_label: 'Your arrival time',
  info_date: 'Saturday · 06 June 2026',
  section_venue: 'Venue',
  section_story: 'Our Story',
  section_message: 'Send a Message',
  section_contact: 'Contact',
  venue_directions: 'Get Directions →',
  msg_intro:
    "Leave a personal wish for the bride, groom, or both. We'll receive it straight to our inbox.",
  msg_name_label: 'Your name',
  msg_name_placeholder: 'e.g. Ahmad bin Yusof',
  msg_send_to: 'Send to',
  msg_recipient_hazim: 'Hazim',
  msg_recipient_hazim_role: 'Groom',
  msg_recipient_idayu: 'Idayu',
  msg_recipient_idayu_role: 'Bride',
  msg_recipient_both: 'Both',
  msg_recipient_both_sub: 'of us',
  msg_message_label: 'Your message',
  msg_message_placeholder: 'Write your wishes here...',
  msg_send_btn: 'Send Wishes',
  msg_success_title: 'Message Sent',
  msg_success_sub: 'Thank you for your wishes',
  msg_error: 'Something went wrong. Please try again.',
  contact_groom_role: 'Groom · Pengantin Lelaki',
  contact_bride_role: 'Bride · Pengantin Perempuan',
  lang_label: 'MY',
}

const my: T = {
  hero_ceremony_label: 'Walimatul Urus',
  hero_ceremony_sub: 'Majlis Perkahwinan',
  hero_cta: 'Lihat Jemputan Saya',
  hero_cta_sub: 'Ketik untuk melihat butiran anda',
  q1_question: 'Anda hadir sebagai...',
  q1_sub: 'Sila pilih satu untuk meneruskan',
  q1_family: 'Keluarga',
  q1_family_sub: 'Family',
  q1_friends: 'Rakan-rakan',
  q1_friends_sub: 'Friends',
  q2_question: 'Anda rakan kepada...',
  q2_sub: 'Sila pilih satu untuk meneruskan',
  q2_couple: 'Hazim & Idayu',
  q2_couple_sub: 'Pengantin',
  q2_parents: 'Ibu Bapa Mereka',
  q2_parents_sub: 'Ibu bapa pengantin',
  q_back: '← Kembali',
  q_step: (current, total) => `Langkah ${current} daripada ${total}`,
  info_greeting_family: 'Selamat datang, Keluarga',
  info_greeting_friends: 'Selamat datang, Rakan',
  info_change: 'Tukar ↩',
  info_arrival_label: 'Masa ketibaan anda',
  info_date: 'Sabtu · 06 Jun 2026',
  section_venue: 'Lokasi',
  section_story: 'Kisah Kami',
  section_message: 'Hantar Mesej',
  section_contact: 'Hubungi Kami',
  venue_directions: 'Dapatkan Arah →',
  msg_intro:
    'Tinggalkan ucapan peribadi untuk pengantin. Kami akan menerimanya terus ke peti masuk kami.',
  msg_name_label: 'Nama anda',
  msg_name_placeholder: 'cth. Ahmad bin Yusof',
  msg_send_to: 'Hantar kepada',
  msg_recipient_hazim: 'Hazim',
  msg_recipient_hazim_role: 'Pengantin Lelaki',
  msg_recipient_idayu: 'Idayu',
  msg_recipient_idayu_role: 'Pengantin Perempuan',
  msg_recipient_both: 'Kedua-dua',
  msg_recipient_both_sub: 'pengantin',
  msg_message_label: 'Mesej anda',
  msg_message_placeholder: 'Tulis ucapan anda di sini...',
  msg_send_btn: 'Hantar Ucapan',
  msg_success_title: 'Mesej Dihantar',
  msg_success_sub: 'Terima kasih atas ucapan anda',
  msg_error: 'Ralat berlaku. Sila cuba lagi.',
  contact_groom_role: 'Pengantin Lelaki · Groom',
  contact_bride_role: 'Pengantin Perempuan · Bride',
  lang_label: 'EN',
}

export const translations: Record<Lang, T> = { en, my }
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- __tests__/lib/translations.test.ts
```

Expected: PASS — all keys present in both languages, `q_step` formats correctly.

- [ ] **Step 5: Commit**

```bash
git add lib/translations.ts __tests__/lib/translations.test.ts
git commit -m "feat: add EN/MY translations"
```

---

## Task 5: Language Context

**Files:**
- Create: `lib/language-context.tsx`

- [ ] **Step 1: Create `lib/language-context.tsx`**

```tsx
'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations } from './translations'
import type { Lang, T } from './translations'

const LANG_KEY = 'wedding-lang'

type LanguageContextValue = {
  lang: Lang
  t: T
  toggleLang: () => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  t: translations.en,
  toggleLang: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY)
      if (stored === 'en' || stored === 'my') setLang(stored)
    } catch {}
  }, [])

  function toggleLang() {
    const next: Lang = lang === 'en' ? 'my' : 'en'
    setLang(next)
    try {
      localStorage.setItem(LANG_KEY, next)
    } catch {}
  }

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  return useContext(LanguageContext)
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/language-context.tsx
git commit -m "feat: add LanguageProvider and useTranslation hook"
```

---

## Task 6: Global Styles & Layout

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-sage: #7a9e87;
  --color-gold: #c9a84c;
}

html,
body {
  height: 100%;
}
```

- [ ] **Step 2: Replace `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: '#7a9e87',
        gold: '#c9a84c',
        cream: '#faf8f5',
      },
      fontFamily: {
        script: ['var(--font-great-vibes)', 'cursive'],
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 3: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Great_Vibes, Cormorant_Garamond, Montserrat } from 'next/font/google'
import { LanguageProvider } from '@/lib/language-context'
import './globals.css'

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-great-vibes',
})

const cormorant = Cormorant_Garamond({
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
})

const montserrat = Montserrat({
  weight: ['300', '400'],
  subsets: ['latin'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'Hazim & Idayu — Walimatul Urus',
  description: 'Join us on 06 June 2026 · 20 Zulhijjah 1447',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${greatVibes.variable} ${cormorant.variable} ${montserrat.variable} font-sans`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Verify dev server renders without errors**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: default Next.js page renders. Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css tailwind.config.ts app/layout.tsx
git commit -m "feat: configure Tailwind theme, fonts, and root layout"
```

---

## Task 7: Botanical Background Component

**Files:**
- Create: `components/BotanicalBackground.tsx`

- [ ] **Step 1: Create `components/BotanicalBackground.tsx`**

```tsx
interface BotanicalBackgroundProps {
  intensity?: 'full' | 'light'
}

export default function BotanicalBackground({
  intensity = 'full',
}: BotanicalBackgroundProps) {
  const o = intensity === 'light' ? 0.55 : 1

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 390 720"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: o }}
      aria-hidden="true"
    >
      {/* Watercolour washes */}
      <ellipse cx="80" cy="80" rx="160" ry="130" fill="rgba(122,158,135,0.10)" />
      <ellipse cx="310" cy="640" rx="160" ry="130" fill="rgba(122,158,135,0.09)" />
      <ellipse cx="340" cy="100" rx="90" ry="70" fill="rgba(122,158,135,0.06)" />
      <ellipse cx="60" cy="620" rx="90" ry="70" fill="rgba(122,158,135,0.07)" />

      {/* Top-left cluster */}
      <path d="M10,10 Q60,80 30,160" stroke="#7a9e87" strokeWidth="1.5" fill="none" opacity="0.5" />
      <ellipse cx="22" cy="40" rx="14" ry="5" fill="#7a9e87" opacity="0.35" transform="rotate(-50 22 40)" />
      <ellipse cx="32" cy="65" rx="16" ry="5" fill="#7a9e87" opacity="0.30" transform="rotate(-40 32 65)" />
      <ellipse cx="36" cy="92" rx="18" ry="5" fill="#6a9178" opacity="0.30" transform="rotate(-30 36 92)" />
      <ellipse cx="34" cy="120" rx="16" ry="5" fill="#7a9e87" opacity="0.28" transform="rotate(-20 34 120)" />
      <ellipse cx="28" cy="145" rx="12" ry="4" fill="#7a9e87" opacity="0.25" transform="rotate(-10 28 145)" />
      <path d="M0,30 Q80,60 120,20" stroke="#7a9e87" strokeWidth="1.2" fill="none" opacity="0.4" />
      <ellipse cx="30" cy="28" rx="12" ry="4" fill="#7a9e87" opacity="0.28" transform="rotate(10 30 28)" />
      <ellipse cx="60" cy="32" rx="14" ry="4" fill="#5a8a6a" opacity="0.25" transform="rotate(5 60 32)" />
      <ellipse cx="90" cy="26" rx="12" ry="4" fill="#7a9e87" opacity="0.22" transform="rotate(-5 90 26)" />
      <circle cx="100" cy="45" r="9" fill="none" stroke="#7a9e87" strokeWidth="1.5" opacity="0.30" />
      <circle cx="118" cy="58" r="7" fill="none" stroke="#7a9e87" strokeWidth="1.3" opacity="0.25" />
      <circle cx="80" cy="72" r="8" fill="none" stroke="#6a9178" strokeWidth="1.2" opacity="0.22" />

      {/* Top-right cluster */}
      <path d="M390,10 Q340,80 360,160" stroke="#7a9e87" strokeWidth="1.5" fill="none" opacity="0.5" />
      <ellipse cx="378" cy="40" rx="14" ry="5" fill="#7a9e87" opacity="0.35" transform="rotate(50 378 40)" />
      <ellipse cx="368" cy="65" rx="16" ry="5" fill="#7a9e87" opacity="0.30" transform="rotate(40 368 65)" />
      <ellipse cx="364" cy="92" rx="18" ry="5" fill="#6a9178" opacity="0.30" transform="rotate(28 364 92)" />
      <ellipse cx="366" cy="120" rx="16" ry="5" fill="#7a9e87" opacity="0.28" transform="rotate(18 366 120)" />
      <path d="M390,25 Q310,55 270,20" stroke="#7a9e87" strokeWidth="1.2" fill="none" opacity="0.40" />
      <ellipse cx="360" cy="26" rx="12" ry="4" fill="#7a9e87" opacity="0.27" transform="rotate(-10 360 26)" />
      <ellipse cx="330" cy="30" rx="14" ry="4" fill="#5a8a6a" opacity="0.24" transform="rotate(-5 330 30)" />
      <circle cx="285" cy="50" r="9" fill="none" stroke="#7a9e87" strokeWidth="1.5" opacity="0.28" />
      <circle cx="268" cy="64" r="7" fill="none" stroke="#7a9e87" strokeWidth="1.3" opacity="0.24" />

      {/* Left-mid fern */}
      <path d="M0,310 Q55,330 20,420" stroke="#7a9e87" strokeWidth="1.3" fill="none" opacity="0.35" />
      <ellipse cx="14" cy="335" rx="12" ry="4" fill="#7a9e87" opacity="0.22" transform="rotate(-35 14 335)" />
      <ellipse cx="24" cy="358" rx="14" ry="4.5" fill="#7a9e87" opacity="0.20" transform="rotate(-25 24 358)" />
      <ellipse cx="27" cy="382" rx="14" ry="4.5" fill="#6a9178" opacity="0.18" transform="rotate(-15 27 382)" />

      {/* Right-mid fern */}
      <path d="M390,300 Q335,320 370,410" stroke="#7a9e87" strokeWidth="1.3" fill="none" opacity="0.35" />
      <ellipse cx="376" cy="325" rx="12" ry="4" fill="#7a9e87" opacity="0.22" transform="rotate(35 376 325)" />
      <ellipse cx="366" cy="348" rx="14" ry="4.5" fill="#7a9e87" opacity="0.20" transform="rotate(25 366 348)" />
      <ellipse cx="362" cy="372" rx="14" ry="4.5" fill="#6a9178" opacity="0.18" transform="rotate(14 362 372)" />

      {/* Bottom-left cluster */}
      <path d="M0,720 Q70,640 30,560" stroke="#7a9e87" strokeWidth="1.5" fill="none" opacity="0.50" />
      <ellipse cx="20" cy="688" rx="16" ry="5" fill="#7a9e87" opacity="0.35" transform="rotate(40 20 688)" />
      <ellipse cx="32" cy="662" rx="18" ry="5.5" fill="#7a9e87" opacity="0.30" transform="rotate(30 32 662)" />
      <ellipse cx="36" cy="634" rx="18" ry="5" fill="#6a9178" opacity="0.28" transform="rotate(20 36 634)" />
      <ellipse cx="32" cy="608" rx="15" ry="4.5" fill="#7a9e87" opacity="0.25" transform="rotate(10 32 608)" />
      <path d="M0,700 Q80,670 140,710" stroke="#7a9e87" strokeWidth="1.2" fill="none" opacity="0.38" />
      <ellipse cx="72" cy="682" rx="15" ry="4.5" fill="#5a8a6a" opacity="0.22" transform="rotate(-3 72 682)" />
      <circle cx="115" cy="660" r="10" fill="none" stroke="#7a9e87" strokeWidth="1.5" opacity="0.30" />
      <circle cx="135" cy="644" r="8" fill="none" stroke="#7a9e87" strokeWidth="1.3" opacity="0.26" />
      <circle cx="95" cy="645" r="9" fill="none" stroke="#6a9178" strokeWidth="1.2" opacity="0.23" />

      {/* Bottom-right cluster */}
      <path d="M390,720 Q320,640 360,555" stroke="#7a9e87" strokeWidth="1.5" fill="none" opacity="0.50" />
      <ellipse cx="370" cy="690" rx="16" ry="5" fill="#7a9e87" opacity="0.35" transform="rotate(-40 370 690)" />
      <ellipse cx="358" cy="664" rx="18" ry="5.5" fill="#7a9e87" opacity="0.30" transform="rotate(-30 358 664)" />
      <ellipse cx="354" cy="636" rx="18" ry="5" fill="#6a9178" opacity="0.28" transform="rotate(-20 354 636)" />
      <ellipse cx="358" cy="610" rx="15" ry="4.5" fill="#7a9e87" opacity="0.25" transform="rotate(-10 358 610)" />
      <path d="M390,705 Q310,672 248,708" stroke="#7a9e87" strokeWidth="1.2" fill="none" opacity="0.38" />
      <ellipse cx="318" cy="684" rx="15" ry="4.5" fill="#5a8a6a" opacity="0.22" transform="rotate(3 318 684)" />
      <circle cx="275" cy="658" r="10" fill="none" stroke="#7a9e87" strokeWidth="1.5" opacity="0.30" />
      <circle cx="255" cy="642" r="8" fill="none" stroke="#7a9e87" strokeWidth="1.3" opacity="0.26" />
      <circle cx="295" cy="643" r="9" fill="none" stroke="#6a9178" strokeWidth="1.2" opacity="0.23" />

      {/* Subtle centre ferns */}
      <path d="M150,200 Q170,240 155,280" stroke="#7a9e87" strokeWidth="0.8" fill="none" opacity="0.12" />
      <ellipse cx="157" cy="220" rx="10" ry="3" fill="#7a9e87" opacity="0.08" transform="rotate(-25 157 220)" />
      <ellipse cx="158" cy="248" rx="11" ry="3" fill="#7a9e87" opacity="0.08" transform="rotate(-15 158 248)" />
      <path d="M240,480 Q260,520 245,560" stroke="#7a9e87" strokeWidth="0.8" fill="none" opacity="0.10" />
      <ellipse cx="247" cy="500" rx="10" ry="3" fill="#7a9e87" opacity="0.07" transform="rotate(-20 247 500)" />
      <circle cx="170" cy="510" r="6" fill="none" stroke="#7a9e87" strokeWidth="1" opacity="0.10" />
      <circle cx="220" cy="200" r="5" fill="none" stroke="#7a9e87" strokeWidth="0.8" opacity="0.09" />
    </svg>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/BotanicalBackground.tsx
git commit -m "feat: add BotanicalBackground SVG component"
```

---

## Task 8: Language Toggle Component

**Files:**
- Create: `components/LanguageToggle.tsx`
- Create: `__tests__/components/LanguageToggle.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/LanguageToggle.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageProvider } from '@/lib/language-context'
import LanguageToggle from '@/components/LanguageToggle'

function Wrapper() {
  return (
    <LanguageProvider>
      <LanguageToggle />
    </LanguageProvider>
  )
}

describe('LanguageToggle', () => {
  beforeEach(() => localStorage.clear())

  it('renders EN and MY labels', () => {
    render(<Wrapper />)
    expect(screen.getByText('EN')).toBeInTheDocument()
    expect(screen.getByText('MY')).toBeInTheDocument()
  })

  it('saves "my" to localStorage on first click', () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByRole('button'))
    expect(localStorage.getItem('wedding-lang')).toBe('my')
  })

  it('toggles back to "en" on second click', () => {
    render(<Wrapper />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(localStorage.getItem('wedding-lang')).toBe('en')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- __tests__/components/LanguageToggle.test.tsx
```

Expected: FAIL — component not found.

- [ ] **Step 3: Create `components/LanguageToggle.tsx`**

```tsx
'use client'

import { useTranslation } from '@/lib/language-context'

export default function LanguageToggle() {
  const { lang, toggleLang } = useTranslation()

  return (
    <button
      onClick={toggleLang}
      className="absolute top-5 left-6 z-10 border border-sage px-2.5 py-1 rounded-full font-sans text-[10px] tracking-[2px] text-sage"
      aria-label={`Switch to ${lang === 'en' ? 'Malay' : 'English'}`}
    >
      <span className={lang === 'en' ? 'font-medium' : 'opacity-40'}>EN</span>
      <span className="opacity-40"> · </span>
      <span className={lang === 'my' ? 'font-medium' : 'opacity-40'}>MY</span>
    </button>
  )
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- __tests__/components/LanguageToggle.test.tsx
```

Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add components/LanguageToggle.tsx __tests__/components/LanguageToggle.test.tsx
git commit -m "feat: add LanguageToggle component"
```

---

## Task 9: Hero Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { loadGuestType } from '@/lib/guest-type'
import { useTranslation } from '@/lib/language-context'
import BotanicalBackground from '@/components/BotanicalBackground'
import LanguageToggle from '@/components/LanguageToggle'

export default function HeroPage() {
  const router = useRouter()
  const { t } = useTranslation()

  function handleCta() {
    const guestType = loadGuestType()
    router.push(guestType ? '/info' : '/questionnaire')
  }

  return (
    <main className="relative min-h-screen bg-white flex flex-col items-center justify-center overflow-hidden">
      <BotanicalBackground intensity="full" />
      <LanguageToggle />

      <div className="relative z-10 text-center px-8 py-10">
        <p className="font-sans text-[9px] tracking-[4px] text-sage uppercase mb-1">
          {t.hero_ceremony_label}
        </p>
        <p className="font-sans text-[8px] tracking-[3px] text-gray-400 uppercase mb-8">
          {t.hero_ceremony_sub}
        </p>

        <div className="font-script text-6xl text-gold leading-tight">Hazim</div>
        <div className="font-serif text-2xl text-gray-400 my-1">&amp;</div>
        <div className="font-script text-6xl text-gold leading-tight">Idayu</div>

        <div className="w-14 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-5" />

        <p className="font-sans text-[10px] tracking-[3px] text-gray-600 uppercase mb-1">
          06 June 2026
        </p>
        <p className="font-sans text-[9px] tracking-[2px] text-gray-400 uppercase mb-9">
          20 Zulhijjah 1447
        </p>

        <button
          onClick={handleCta}
          className="bg-sage text-white font-sans text-[10px] tracking-[3px] uppercase px-7 py-3 rounded-full"
        >
          {t.hero_cta}
        </button>
        <p className="font-sans text-[9px] text-gray-300 mt-3 tracking-wide">
          {t.hero_cta_sub}
        </p>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: hero page with gold names, sage botanical background, language toggle top-left, CTA button. Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add hero landing page"
```

---

## Task 10: Questionnaire Page

**Files:**
- Create: `app/questionnaire/page.tsx`

- [ ] **Step 1: Create `app/questionnaire/page.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveGuestType } from '@/lib/guest-type'
import { useTranslation } from '@/lib/language-context'
import BotanicalBackground from '@/components/BotanicalBackground'
import LanguageToggle from '@/components/LanguageToggle'

export default function QuestionnairePage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [step, setStep] = useState<1 | 2>(1)

  function handleFamily() {
    saveGuestType('family')
    router.push('/info')
  }

  function handleFriendsCouple() {
    saveGuestType('friends-couple')
    router.push('/info')
  }

  function handleFriendsParents() {
    saveGuestType('friends-parents')
    router.push('/info')
  }

  return (
    <main className="relative min-h-screen bg-white flex flex-col items-center justify-center overflow-hidden px-7 py-12">
      <BotanicalBackground intensity="light" />
      <LanguageToggle />

      {step === 2 && (
        <button
          onClick={() => setStep(1)}
          className="absolute top-5 right-6 z-10 font-sans text-[10px] tracking-wide text-gray-400"
        >
          {t.q_back}
        </button>
      )}

      <div className="relative z-10 w-full max-w-sm text-center">
        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center mb-6">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${step === 1 ? 'bg-sage' : 'bg-gray-200'}`} />
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${step === 2 ? 'bg-sage' : 'bg-gray-200'}`} />
        </div>

        <p className="font-sans text-[8px] tracking-[3px] text-sage uppercase mb-2">
          {t.q_step(step, 2)}
        </p>

        {step === 1 ? (
          <>
            <h1 className="font-serif text-2xl text-gray-800 font-light mb-2">{t.q1_question}</h1>
            <p className="font-sans text-[9px] text-gray-400 tracking-wide mb-5">{t.q1_sub}</p>
            <div className="w-10 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-7" />
            <ChoiceButton title={t.q1_family} sub={t.q1_family_sub} onClick={handleFamily} />
            <ChoiceButton title={t.q1_friends} sub={t.q1_friends_sub} onClick={() => setStep(2)} />
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl text-gray-800 font-light mb-2">{t.q2_question}</h1>
            <p className="font-sans text-[9px] text-gray-400 tracking-wide mb-5">{t.q2_sub}</p>
            <div className="w-10 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-7" />
            <ChoiceButton title={t.q2_couple} sub={t.q2_couple_sub} onClick={handleFriendsCouple} />
            <ChoiceButton title={t.q2_parents} sub={t.q2_parents_sub} onClick={handleFriendsParents} />
          </>
        )}
      </div>
    </main>
  )
}

function ChoiceButton({
  title,
  sub,
  onClick,
}: {
  title: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between bg-white border border-stone-200 rounded-xl px-5 py-3.5 mb-3 text-left hover:border-sage hover:bg-green-50 transition-colors"
    >
      <div>
        <p className="font-serif text-lg text-gray-800">{title}</p>
        <p className="font-sans text-[9px] text-gray-400 tracking-wide mt-0.5">{sub}</p>
      </div>
      <div className="w-5 h-5 rounded-full border border-stone-200 flex-shrink-0" />
    </button>
  )
}
```

- [ ] **Step 2: Verify flow in browser**

```bash
npm run dev
```

1. Open `http://localhost:3000`, click "View My Invitation" → goes to `/questionnaire`
2. Click "Family" → goes to `/info` (will be blank for now, that's fine)
3. Go back to `/questionnaire`, click "Friends" → step 2 appears
4. Click "← Back" → returns to step 1
5. Click either friends option → goes to `/info`

Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add app/questionnaire/page.tsx
git commit -m "feat: add two-step questionnaire page"
```

---

## Task 11: Timeslot Badge Component

**Files:**
- Create: `components/TimeslotBadge.tsx`

- [ ] **Step 1: Create `components/TimeslotBadge.tsx`**

```tsx
import { TIMESLOTS } from '@/lib/guest-type'
import type { GuestType } from '@/lib/guest-type'

interface TimeslotBadgeProps {
  guestType: GuestType
  arrivalLabel: string
  dateLabel: string
}

export default function TimeslotBadge({
  guestType,
  arrivalLabel,
  dateLabel,
}: TimeslotBadgeProps) {
  return (
    <div className="inline-flex flex-col items-center bg-sage text-white rounded-2xl px-7 py-3.5">
      <span className="font-sans text-[8px] tracking-[3px] uppercase opacity-85 mb-1">
        {arrivalLabel}
      </span>
      <span className="font-serif text-4xl font-light leading-none">
        {TIMESLOTS[guestType]}
      </span>
      <span className="font-sans text-[9px] tracking-[2px] opacity-80 mt-1">{dateLabel}</span>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/TimeslotBadge.tsx
git commit -m "feat: add TimeslotBadge component"
```

---

## Task 12: Info Page

> **Dependency:** `MessageForm` is used by this page but defined in Task 13. Step 1 below creates a temporary stub so this page compiles. Task 13 replaces it with the real implementation.

**Files:**
- Create: `components/MessageForm.tsx` (temporary stub, replaced in Task 13)
- Create: `app/info/page.tsx`

- [ ] **Step 1: Create a temporary `components/MessageForm.tsx` stub**

```tsx
export default function MessageForm() {
  return null
}
```

- [ ] **Step 3: Create `app/info/page.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadGuestType, clearGuestType } from '@/lib/guest-type'
import { useTranslation } from '@/lib/language-context'
import { VENUE, CONTACTS, STORY } from '@/lib/config'
import BotanicalBackground from '@/components/BotanicalBackground'
import LanguageToggle from '@/components/LanguageToggle'
import TimeslotBadge from '@/components/TimeslotBadge'
import MessageForm from '@/components/MessageForm'
import type { GuestType } from '@/lib/guest-type'

export default function InfoPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [guestType, setGuestType] = useState<GuestType | null>(null)

  useEffect(() => {
    const type = loadGuestType()
    if (!type) {
      router.replace('/questionnaire')
      return
    }
    setGuestType(type)
  }, [router])

  function handleChange() {
    clearGuestType()
    router.push('/questionnaire')
  }

  if (!guestType) return null

  const greeting =
    guestType === 'family' ? t.info_greeting_family : t.info_greeting_friends

  return (
    <div className="bg-white min-h-screen">
      {/* Hero strip */}
      <div className="relative bg-white px-7 pt-12 pb-7 text-center overflow-hidden">
        <BotanicalBackground intensity="light" />
        <LanguageToggle />
        <button
          onClick={handleChange}
          className="absolute top-5 right-6 z-10 font-sans text-[9px] tracking-wide text-gray-400"
        >
          {t.info_change}
        </button>

        <div className="relative z-10">
          <p className="font-sans text-[9px] tracking-[3px] text-sage uppercase mb-2">{greeting}</p>
          <div className="font-script text-4xl text-gold leading-tight">Hazim</div>
          <div className="font-serif text-xl text-gray-400 my-0.5">&amp;</div>
          <div className="font-script text-4xl text-gold leading-tight">Idayu</div>
          <div className="w-10 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-4" />
          <TimeslotBadge
            guestType={guestType}
            arrivalLabel={t.info_arrival_label}
            dateLabel={t.info_date}
          />
        </div>
      </div>

      {/* Sections */}
      <div className="bg-cream">
        {/* Venue */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_venue}</SectionTitle>
          <h2 className="font-serif text-xl text-gray-800 mb-1">{VENUE.name}</h2>
          <p className="font-sans text-[10px] text-gray-500 leading-6 mb-3 whitespace-pre-line">
            {VENUE.address}
          </p>
          <div className="rounded-xl overflow-hidden h-36 mb-2 bg-stone-100">
            <iframe
              src={VENUE.googleMapsEmbed}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Venue map"
            />
          </div>
          <a
            href={VENUE.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[9px] tracking-[2px] text-sage uppercase border-b border-sage/40 pb-0.5"
          >
            {t.venue_directions}
          </a>
        </section>

        {/* Our Story */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_story}</SectionTitle>
          <p className="font-serif text-sm text-gray-600 italic leading-7">"{STORY}"</p>
        </section>

        {/* Send a Message */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_message}</SectionTitle>
          <MessageForm />
        </section>

        {/* Contact */}
        <section className="px-6 py-5">
          <SectionTitle>{t.section_contact}</SectionTitle>
          <ContactRow
            initial="H"
            gradient="from-sage to-[#5a8a6a]"
            name="Hazim"
            role={t.contact_groom_role}
            phone={CONTACTS.hazim.phone}
          />
          <ContactRow
            initial="I"
            gradient="from-gold to-[#a8873e]"
            name="Idayu"
            role={t.contact_bride_role}
            phone={CONTACTS.idayu.phone}
          />
        </section>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="font-sans text-[8px] tracking-[3px] text-sage uppercase whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-stone-200" />
    </div>
  )
}

function ContactRow({
  initial,
  gradient,
  name,
  role,
  phone,
}: {
  initial: string
  gradient: string
  name: string
  role: string
  phone: string
}) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div
        className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-script text-lg text-white flex-shrink-0`}
      >
        {initial}
      </div>
      <div>
        <p className="font-sans text-xs text-gray-800">{name}</p>
        <p className="font-sans text-[9px] text-gray-400 tracking-wide mt-0.5">{role}</p>
        <p className="font-sans text-[11px] text-sage mt-0.5">{phone}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify full flow in browser**

```bash
npm run dev
```

1. Clear localStorage in DevTools (Application → Local Storage → Clear All)
2. Go to `http://localhost:3000/info` → redirects to `/questionnaire` ✓
3. Select "Family" → arrives at `/info` with "Welcome, Family" and "10:00 AM" badge ✓
4. Refresh page → stays on `/info` (localStorage preserved) ✓
5. Click "Change ↩" → clears and returns to `/questionnaire` ✓
6. Select Friends → Their Parents → "Welcome, Friends" + "12:00 PM" ✓
7. Repeat for Friends of Couple → "1:00 PM" ✓

Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add components/MessageForm.tsx app/info/page.tsx
git commit -m "feat: add personalised info page with MessageForm stub"
```

---

## Task 13: Message Form Component

**Files:**
- Create: `components/MessageForm.tsx`
- Create: `__tests__/components/MessageForm.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/MessageForm.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider } from '@/lib/language-context'
import MessageForm from '@/components/MessageForm'

global.fetch = jest.fn()

function Wrapper() {
  return (
    <LanguageProvider>
      <MessageForm />
    </LanguageProvider>
  )
}

describe('MessageForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  it('renders name field, message field, and send button', () => {
    render(<Wrapper />)
    expect(screen.getByPlaceholderText('e.g. Ahmad bin Yusof')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Write your wishes here...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send wishes/i })).toBeInTheDocument()
  })

  it('shows success state after successful submission', async () => {
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText('e.g. Ahmad bin Yusof'), 'Ali')
    await userEvent.type(screen.getByPlaceholderText('Write your wishes here...'), 'Congratulations!')
    fireEvent.click(screen.getByRole('button', { name: /send wishes/i }))
    await waitFor(() =>
      expect(screen.getByText('Message Sent')).toBeInTheDocument()
    )
  })

  it('shows error state on failed submission', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false })
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText('e.g. Ahmad bin Yusof'), 'Ali')
    await userEvent.type(screen.getByPlaceholderText('Write your wishes here...'), 'Congratulations!')
    fireEvent.click(screen.getByRole('button', { name: /send wishes/i }))
    await waitFor(() =>
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: /send wishes/i })).toBeEnabled()
  })

  it('POSTs the correct JSON body', async () => {
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText('e.g. Ahmad bin Yusof'), 'Ali')
    await userEvent.type(screen.getByPlaceholderText('Write your wishes here...'), 'Congrats!')
    fireEvent.click(screen.getByRole('button', { name: /send wishes/i }))
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/send-message',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Ali', recipient: 'both', message: 'Congrats!' }),
        })
      )
    )
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- __tests__/components/MessageForm.test.tsx
```

Expected: FAIL — component not found.

- [ ] **Step 3: Create `components/MessageForm.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/language-context'

type Recipient = 'hazim' | 'idayu' | 'both'
type Status = 'idle' | 'loading' | 'success' | 'error'

export default function MessageForm() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [recipient, setRecipient] = useState<Recipient>('both')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), recipient, message: message.trim() }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-5">
        <div className="w-11 h-11 rounded-full border-[1.5px] border-sage bg-green-50 flex items-center justify-center mx-auto mb-3">
          <svg
            width="20"
            height="16"
            viewBox="0 0 24 20"
            fill="none"
            stroke="#7a9e87"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h20v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3z" />
            <path d="M2 3l10 9 10-9" />
          </svg>
        </div>
        <p className="font-serif text-lg text-gray-800">{t.msg_success_title}</p>
        <p className="font-sans text-[9px] text-gray-400 tracking-wide mt-1">{t.msg_success_sub} ✦</p>
      </div>
    )
  }

  const recipients: { value: Recipient; label: string; sub: string }[] = [
    { value: 'hazim', label: t.msg_recipient_hazim, sub: t.msg_recipient_hazim_role },
    { value: 'idayu', label: t.msg_recipient_idayu, sub: t.msg_recipient_idayu_role },
    { value: 'both', label: t.msg_recipient_both, sub: t.msg_recipient_both_sub },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <p className="font-sans text-[10px] text-gray-500 leading-6 mb-3">{t.msg_intro}</p>

      <div className="mb-3">
        <label className="block font-sans text-[8px] tracking-[2px] text-gray-400 uppercase mb-1.5">
          {t.msg_name_label}
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t.msg_name_placeholder}
          required
          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 font-sans text-[11px] text-gray-800 outline-none focus:border-sage"
        />
      </div>

      <label className="block font-sans text-[8px] tracking-[2px] text-gray-400 uppercase mb-1.5">
        {t.msg_send_to}
      </label>
      <div className="flex gap-2 mb-3.5">
        {recipients.map(r => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRecipient(r.value)}
            className={`flex-1 border rounded-lg py-2 text-center transition-colors ${
              recipient === r.value
                ? 'border-sage bg-green-50'
                : 'border-stone-200 bg-white'
            }`}
          >
            <p className="font-sans text-[11px] text-gray-800">{r.label}</p>
            <p className="font-sans text-[8px] text-gray-400 tracking-wide mt-0.5">{r.sub}</p>
          </button>
        ))}
      </div>

      <div className="mb-4">
        <label className="block font-sans text-[8px] tracking-[2px] text-gray-400 uppercase mb-1.5">
          {t.msg_message_label}
        </label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={t.msg_message_placeholder}
          rows={4}
          required
          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 font-sans text-[11px] text-gray-800 outline-none focus:border-sage resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="font-sans text-[9px] text-red-400 mb-2">{t.msg_error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-sage text-white font-sans text-[10px] tracking-[3px] uppercase py-3 rounded-xl disabled:opacity-60"
      >
        {status === 'loading' ? '...' : t.msg_send_btn}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- __tests__/components/MessageForm.test.tsx
```

Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add components/MessageForm.tsx __tests__/components/MessageForm.test.tsx
git commit -m "feat: add MessageForm component with success/error states"
```

---

## Task 14: SMTP API Route

**Files:**
- Create: `app/api/send-message/route.ts`
- Create: `__tests__/api/send-message.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/api/send-message.test.ts`:

```ts
import { POST } from '@/app/api/send-message/route'
import { NextRequest } from 'next/server'
import nodemailer from 'nodemailer'

jest.mock('nodemailer')

const mockSendMail = jest.fn().mockResolvedValue({})
;(nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: mockSendMail })

function req(body: object) {
  return new NextRequest('http://localhost/api/send-message', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/send-message', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.SMTP_HOST = 'smtp.test.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_USER = 'test@test.com'
    process.env.SMTP_PASS = 'password'
    process.env.EMAIL_HAZIM = 'hazim@test.com'
    process.env.EMAIL_IDAYU = 'idayu@test.com'
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: mockSendMail })
  })

  it('returns 400 when name is missing', async () => {
    const res = await POST(req({ recipient: 'both', message: 'Hi' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when message is missing', async () => {
    const res = await POST(req({ name: 'Ali', recipient: 'both' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when name is blank whitespace', async () => {
    const res = await POST(req({ name: '   ', recipient: 'both', message: 'Hi' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid recipient', async () => {
    const res = await POST(req({ name: 'Ali', recipient: 'nobody', message: 'Hi' }))
    expect(res.status).toBe(400)
  })

  it('sends one email to hazim for recipient "hazim"', async () => {
    const res = await POST(req({ name: 'Ali', recipient: 'hazim', message: 'Hi' }))
    expect(res.status).toBe(200)
    expect(mockSendMail).toHaveBeenCalledTimes(1)
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'hazim@test.com' })
    )
  })

  it('sends one email to idayu for recipient "idayu"', async () => {
    const res = await POST(req({ name: 'Ali', recipient: 'idayu', message: 'Hi' }))
    expect(res.status).toBe(200)
    expect(mockSendMail).toHaveBeenCalledTimes(1)
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'idayu@test.com' })
    )
  })

  it('sends two separate emails for recipient "both"', async () => {
    const res = await POST(req({ name: 'Ali', recipient: 'both', message: 'Hi' }))
    expect(res.status).toBe(200)
    expect(mockSendMail).toHaveBeenCalledTimes(2)
  })

  it('uses sender name in email subject', async () => {
    await POST(req({ name: 'Ahmad', recipient: 'hazim', message: 'Congrats!' }))
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "A message from Ahmad — Hazim & Idayu's Wedding",
      })
    )
  })

  it('returns 500 when sendMail throws', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('SMTP error'))
    const res = await POST(req({ name: 'Ali', recipient: 'hazim', message: 'Hi' }))
    expect(res.status).toBe(500)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- __tests__/api/send-message.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `app/api/send-message/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

type Recipient = 'hazim' | 'idayu' | 'both'

function isValidRecipient(value: unknown): value is Recipient {
  return value === 'hazim' || value === 'idayu' || value === 'both'
}

export async function POST(request: NextRequest) {
  let body: { name?: unknown; recipient?: unknown; message?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, recipient, message } = body

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }
  if (!isValidRecipient(recipient)) {
    return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 })
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const subject = `A message from ${name.trim()} — Hazim & Idayu's Wedding`
  const html = `<p><strong>From:</strong> ${name.trim()}</p><p>${message
    .trim()
    .replace(/\n/g, '<br>')}</p>`

  const addresses: string[] = []
  if (recipient === 'hazim' || recipient === 'both') {
    addresses.push(process.env.EMAIL_HAZIM!)
  }
  if (recipient === 'idayu' || recipient === 'both') {
    addresses.push(process.env.EMAIL_IDAYU!)
  }

  try {
    for (const to of addresses) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        html,
      })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- __tests__/api/send-message.test.ts
```

Expected: PASS — 8 tests.

- [ ] **Step 5: Commit**

```bash
git add app/api/send-message/route.ts __tests__/api/send-message.test.ts
git commit -m "feat: add SMTP send-message API route"
```

---

## Task 15: Environment Setup & Deployment

**Files:**
- Create: `.env.local`

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```

Expected: All tests PASS. Fix any failures before continuing.

- [ ] **Step 2: Create `.env.local`**

```bash
# SMTP credentials — never commit this file
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

EMAIL_HAZIM=hazim@example.com
EMAIL_IDAYU=idayu@example.com
```

> **Gmail setup:** In your Google Account → Security → 2-Step Verification → App passwords → generate a password for "Mail". Use that as `SMTP_PASS`, not your main password.

> **Update `lib/config.ts`:** Fill in the real venue name, address, Google Maps embed URL, directions URL, and contact phone numbers before deploying.

- [ ] **Step 3: Test email sending locally**

```bash
npm run dev
```

1. Complete questionnaire at `http://localhost:3000`
2. On the info page, fill in the message form and click "Send Wishes"
3. Verify both email addresses receive the message

- [ ] **Step 4: Deploy to Vercel**

```bash
npx vercel
```

Follow prompts: link to your Vercel account, create new project, accept defaults.

- [ ] **Step 5: Add environment variables on Vercel**

Go to your project on `vercel.com` → Settings → Environment Variables. Add all six variables from `.env.local`:

```
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
EMAIL_HAZIM
EMAIL_IDAYU
```

- [ ] **Step 6: Trigger a production deployment**

```bash
npx vercel --prod
```

Expected: Deployment URL printed (e.g. `https://wedding-abc123.vercel.app`).

- [ ] **Step 7: Final end-to-end verification**

1. Open the Vercel URL
2. Go through the questionnaire for each guest type — verify correct timeslots appear
3. Toggle EN ↔ MY — verify all strings switch
4. Submit a message — verify emails arrive
5. Refresh on `/info` — verify localStorage persists without re-answering

- [ ] **Step 8: Final commit**

```bash
git add .
git commit -m "chore: complete wedding website — ready for production"
```
