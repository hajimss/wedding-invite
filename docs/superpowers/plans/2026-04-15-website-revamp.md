# Website Revamp — Single Scrollable Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the hero and info pages into one scrollable page at `/`, removing the questionnaire flow and replacing per-guest arrival times with a single `11AM – 4PM` duration badge.

**Architecture:** `app/page.tsx` is rewritten to contain both the full-screen hero zone and all info sections. The `/info` and `/questionnaire` routes are eliminated — server-side redirects in `next.config.ts` send any bookmarked links back to `/`. `TimeslotBadge` is deleted; its replacement is inlined directly in the hero zone.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Jest + Testing Library

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `next.config.ts` | Add permanent redirects for `/info` → `/` and `/questionnaire` → `/` |
| Create | `__tests__/app/page.test.tsx` | Tests for the merged homepage |
| Rewrite | `app/page.tsx` | Merged hero + all info sections |
| Delete | `app/info/page.tsx` | Replaced by `app/page.tsx` |
| Delete | `app/questionnaire/page.tsx` | Removed entirely |
| Delete | `components/TimeslotBadge.tsx` | Replaced by inline duration badge in `app/page.tsx` |

---

## Task 1: Add server-side redirects

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Add redirects to next.config.ts**

Replace the entire file with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/info', destination: '/', permanent: true },
      { source: '/questionnaire', destination: '/', permanent: true },
    ]
  },
};

export default nextConfig;
```

- [ ] **Step 2: Commit**

```bash
git add next.config.ts
git commit -m "feat: redirect /info and /questionnaire to /"
```

---

## Task 2: Write failing homepage tests

**Files:**
- Create: `__tests__/app/page.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/lib/language-context'
import HomePage from '@/app/page'

global.fetch = jest.fn()

function Wrapper() {
  return (
    <LanguageProvider>
      <HomePage />
    </LanguageProvider>
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ photos: [] }),
    })
  })

  it('renders couple names in the hero', () => {
    render(<Wrapper />)
    const hazimElements = screen.getAllByText('Hazim')
    expect(hazimElements.length).toBeGreaterThan(0)
    const idayuElements = screen.getAllByText('Idayu')
    expect(idayuElements.length).toBeGreaterThan(0)
  })

  it('renders the ceremony duration badge instead of a timeslot', () => {
    render(<Wrapper />)
    expect(screen.getByText('11AM – 4PM')).toBeInTheDocument()
  })

  it('renders all info section titles on the same page', () => {
    render(<Wrapper />)
    expect(screen.getByText(/venue/i)).toBeInTheDocument()
    expect(screen.getByText(/rsvp/i)).toBeInTheDocument()
    expect(screen.getByText(/calendar/i)).toBeInTheDocument()
  })

  it('does not render a CTA button routing away from the page', () => {
    render(<Wrapper />)
    // The old "View Info" / "See Details" CTA navigated away — it must not exist
    expect(screen.queryByRole('button', { name: /view info|see details|enter|continue/i })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- __tests__/app/page.test.tsx
```

Expected: FAIL — `Cannot find module '@/app/page'` or test assertions fail because the current `app/page.tsx` still has the old hero-only structure.

---

## Task 3: Rewrite app/page.tsx

**Files:**
- Rewrite: `app/page.tsx`

- [ ] **Step 1: Replace app/page.tsx with the merged page**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from '@/lib/language-context'
import { VENUE, CONTACTS } from '@/lib/config'
import BotanicalBackground from '@/components/BotanicalBackground'
import LanguageToggle from '@/components/LanguageToggle'
import MessageForm from '@/components/MessageForm'
import SpotifyPlaylist from '@/components/SpotifyPlaylist'
import MemoryWall from '@/components/MemoryWall'
import AddToCalendar from '@/components/AddToCalendar'
import type { Photo } from '@/lib/kv'

export default function HomePage() {
  const { t } = useTranslation()
  const [photos, setPhotos] = useState<Photo[]>([])

  useEffect(() => {
    fetch('/api/photos')
      .then((res) => res.json())
      .then((data) => setPhotos(data.photos ?? []))
      .catch(() => {})
  }, [])

  return (
    <div className="bg-white min-h-screen">
      {/* Hero zone */}
      <div className="relative bg-white px-8 py-10 min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        <BotanicalBackground intensity="full" />
        <LanguageToggle />

        <div className="relative z-10">
          <p className="font-sans text-[10px] tracking-[5px] text-sage uppercase mb-1">
            {t.hero_ceremony_label}
          </p>
          <p className="font-sans text-[9px] tracking-[4px] text-gray-400 uppercase mb-8">
            {t.hero_ceremony_sub}
          </p>

          <div className="font-script text-[53px] text-gold leading-tight">Hazim</div>
          <div className="font-serif text-[22px] text-gray-400 font-light my-1">&amp;</div>
          <div className="font-script text-[53px] text-gold leading-tight">Idayu</div>

          <div className="w-14 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-5" />

          <p className="font-sans text-[10px] tracking-[4px] text-gray-600 uppercase mb-1">
            06 June 2026
          </p>
          <p className="font-sans text-[10px] tracking-[3px] text-gray-400 uppercase mb-9">
            20 Zulhijjah 1447
          </p>

          <div className="inline-flex flex-col items-center bg-sage text-white rounded-2xl px-7 py-3.5 mb-9">
            <span className="font-sans text-[9px] tracking-[3px] uppercase opacity-85 mb-1">
              Ceremony
            </span>
            <span className="font-serif text-[40px] font-light leading-none">11AM – 4PM</span>
            <span className="font-sans text-[10px] tracking-[2px] opacity-80 mt-1">06 June 2026</span>
          </div>

          <p className="font-sans text-[10px] tracking-[3px] text-gray-300 uppercase">
            ↓ scroll for details
          </p>
        </div>
      </div>

      {/* Info sections */}
      <div className="bg-cream">
        {/* Venue */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_venue}</SectionTitle>
          <h2 className="font-serif text-[22px] text-gray-800 mb-1">{VENUE.name}</h2>
          <p className="font-sans text-[11px] text-gray-500 leading-6 mb-3 whitespace-pre-line">
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
            className="font-sans text-[10px] tracking-[2px] text-sage uppercase border-b border-sage/40 pb-0.5"
          >
            <p className="font-serif text-[10px] lowercase text-gray-600 italic">
              &ldquo;sorry there&rsquo;s no free parking but i promise you it&rsquo;s cheap&rdquo; - hazim
            </p>
            {t.venue_directions}
          </a>
        </section>

        {/* Our Story */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_story}</SectionTitle>
          <p className="font-serif text-[15px] text-gray-600 italic leading-7">&ldquo;{t.story}&rdquo;</p>
        </section>

        {/* RSVP */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_rsvp}</SectionTitle>
          <p className="font-sans text-[11px] text-gray-500 leading-6 mb-3">
            {t.rsvp_subtitle}
          </p>
          <a
            href="/rsvp"
            className="inline-block font-sans text-[10px] tracking-[2px] text-sage uppercase border-b border-sage/40 pb-0.5"
          >
            {t.rsvp_cta} →
          </a>
        </section>

        {/* Add to Calendar */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_calendar}</SectionTitle>
          <p className="font-sans text-[11px] text-gray-500 leading-6 mb-3">{t.calendar_subtitle}</p>
          <AddToCalendar />
        </section>

        {/* Send a Message */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_message}</SectionTitle>
          <MessageForm />
        </section>

        {/* Playlist */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_playlist}</SectionTitle>
          <SpotifyPlaylist />
        </section>

        {/* Our Memories */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_memories}</SectionTitle>
          <p className="font-sans text-[11px] text-gray-500 leading-6 mb-3">
            {t.memories_subtitle}
          </p>
          <MemoryWall photos={photos} />
          <a
            href="/upload"
            className="inline-block mt-3 font-sans text-[10px] tracking-[2px] text-sage uppercase border-b border-sage/40 pb-0.5"
          >
            {t.upload_cta} →
          </a>
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
      <span className="font-sans text-[9px] tracking-[3px] text-sage uppercase whitespace-nowrap">
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
        className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-script text-[20px] text-white flex-shrink-0`}
      >
        {initial}
      </div>
      <div>
        <p className="font-sans text-[13px] text-gray-800">{name}</p>
        <p className="font-sans text-[10px] text-gray-400 tracking-wide mt-0.5">{role}</p>
        <p className="font-sans font-light text-[12px] text-sage mt-0.5">{phone}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run the new page tests**

```bash
npm test -- __tests__/app/page.test.tsx
```

Expected: All 4 tests PASS.

- [ ] **Step 3: Run the full test suite to check for regressions**

```bash
npm test
```

Expected: All tests pass. The `TimeslotBadge` tests don't exist (never had one), so nothing breaks there.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx __tests__/app/page.test.tsx
git commit -m "feat: merge hero and info into single scrollable homepage"
```

---

## Task 4: Delete app/info/page.tsx and app/questionnaire/page.tsx

**Files:**
- Delete: `app/info/page.tsx`
- Delete: `app/questionnaire/page.tsx`

- [ ] **Step 1: Delete both page files**

```bash
rm app/info/page.tsx
rm app/questionnaire/page.tsx
```

- [ ] **Step 2: Verify the app/info and app/questionnaire directories are now empty, and remove them**

```bash
rmdir app/info
rmdir app/questionnaire
```

- [ ] **Step 3: Run the full test suite**

```bash
npm test
```

Expected: All tests pass. No test imported these pages directly.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: remove /info and /questionnaire pages"
```

---

## Task 5: Delete components/TimeslotBadge.tsx

**Files:**
- Delete: `components/TimeslotBadge.tsx`

- [ ] **Step 1: Confirm nothing still imports TimeslotBadge**

```bash
grep -r "import.*TimeslotBadge" . --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.next
```

Expected: No output — the only importer was `app/info/page.tsx`, which was deleted in Task 4.

- [ ] **Step 2: Delete the component**

```bash
rm components/TimeslotBadge.tsx
```

- [ ] **Step 3: Run the full test suite**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: remove TimeslotBadge, replaced by inline duration badge"
```

---

## Task 6: Final build verification

- [ ] **Step 1: Run a production build**

```bash
npm run build
```

Expected: Build succeeds with no errors or type errors. This catches any import references missed by the test suite (e.g. a dead import in a non-tested file).

- [ ] **Step 2: If the build passes, you're done. If it fails, read the error output carefully — it will point to the exact file and line causing the issue.**
