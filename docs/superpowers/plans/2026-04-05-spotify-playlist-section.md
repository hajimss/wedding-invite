# Spotify Playlist Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a collaborative Spotify playlist section to the `/info` page, between "Send a Message" and "Contact", so guests can browse the playlist and tap a link to add their own song in Spotify.

**Architecture:** Add `SPOTIFY_PLAYLIST` config to `lib/config.ts`, add three bilingual translation keys to `lib/translations.ts`, create a self-contained `SpotifyPlaylist` component, and insert the new section into `app/info/page.tsx` following the exact same pattern as `MessageForm`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Jest + React Testing Library

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `lib/config.ts` | Modify | Add `SPOTIFY_PLAYLIST` constant with `url` and `embedUrl` |
| `lib/translations.ts` | Modify | Add `section_playlist`, `playlist_intro`, `playlist_cta` to `T` type and both `en`/`my` objects |
| `components/SpotifyPlaylist.tsx` | Create | Renders intro copy, Spotify iframe embed, and CTA link |
| `app/info/page.tsx` | Modify | Import `SpotifyPlaylist` and insert section between "Send a Message" and "Contact" |
| `__tests__/components/SpotifyPlaylist.test.tsx` | Create | Tests for the new component |

---

### Task 1: Add `SPOTIFY_PLAYLIST` to config

**Files:**
- Modify: `lib/config.ts`

- [ ] **Step 1: Add the constant**

Open `lib/config.ts` and append after the `STORY` export:

```ts
export const SPOTIFY_PLAYLIST = {
  url: 'https://open.spotify.com/playlist/0soLSTkWnbj8aYnB71n2Cf',
  embedUrl: 'https://open.spotify.com/embed/playlist/0soLSTkWnbj8aYnB71n2Cf?utm_source=generator',
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/config.ts
git commit -m "feat: add SPOTIFY_PLAYLIST to config"
```

---

### Task 2: Add translation keys

**Files:**
- Modify: `lib/translations.ts`

- [ ] **Step 1: Add keys to the `T` type**

In `lib/translations.ts`, add three new properties to the `T` type after `contact_bride_role`:

```ts
  section_playlist: string
  playlist_intro: string
  playlist_cta: string
```

- [ ] **Step 2: Add English values**

In the `en` object, add after `contact_bride_role`:

```ts
  section_playlist: 'Our Playlist',
  playlist_intro:
    'Add a song to our wedding playlist — open Spotify and contribute a track that means something to you.',
  playlist_cta: 'Add a Song →',
```

- [ ] **Step 3: Add Malay values**

In the `my` object, add after `contact_bride_role`:

```ts
  section_playlist: 'Senarai Lagu Kami',
  playlist_intro:
    'Tambah lagu ke senarai lagu perkahwinan kami — buka Spotify dan sertakan lagu yang bermakna bagi anda.',
  playlist_cta: 'Tambah Lagu →',
```

- [ ] **Step 4: Run the existing translation tests to verify all keys are present**

```bash
npx jest __tests__/lib/translations.test.ts --no-coverage
```

Expected: all tests pass. The test suite automatically validates that every key in the `T` type is present in both `en` and `my` — so if TypeScript compiles and these tests pass, the translations are complete.

- [ ] **Step 5: Commit**

```bash
git add lib/translations.ts
git commit -m "feat: add playlist translation keys (EN + MY)"
```

---

### Task 3: Create `SpotifyPlaylist` component

**Files:**
- Create: `components/SpotifyPlaylist.tsx`
- Create: `__tests__/components/SpotifyPlaylist.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/SpotifyPlaylist.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/lib/language-context'
import SpotifyPlaylist from '@/components/SpotifyPlaylist'

function Wrapper() {
  return (
    <LanguageProvider>
      <SpotifyPlaylist />
    </LanguageProvider>
  )
}

describe('SpotifyPlaylist', () => {
  it('renders the intro copy', () => {
    render(<Wrapper />)
    expect(
      screen.getByText(
        'Add a song to our wedding playlist — open Spotify and contribute a track that means something to you.'
      )
    ).toBeInTheDocument()
  })

  it('renders the Spotify iframe embed', () => {
    render(<Wrapper />)
    const iframe = document.querySelector('iframe')
    expect(iframe).toBeInTheDocument()
    expect(iframe?.src).toContain('open.spotify.com/embed/playlist/0soLSTkWnbj8aYnB71n2Cf')
  })

  it('renders the CTA link pointing to the Spotify playlist', () => {
    render(<Wrapper />)
    const link = screen.getByRole('link', { name: /add a song/i })
    expect(link).toHaveAttribute('href', 'https://open.spotify.com/playlist/0soLSTkWnbj8aYnB71n2Cf')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest __tests__/components/SpotifyPlaylist.test.tsx --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/SpotifyPlaylist'`

- [ ] **Step 3: Create the component**

Create `components/SpotifyPlaylist.tsx`:

```tsx
'use client'

import { useTranslation } from '@/lib/language-context'
import { SPOTIFY_PLAYLIST } from '@/lib/config'

export default function SpotifyPlaylist() {
  const { t } = useTranslation()

  return (
    <>
      <p className="font-sans text-[11px] text-gray-500 leading-6 mb-3">{t.playlist_intro}</p>
      <div className="rounded-xl overflow-hidden mb-2 bg-stone-100">
        <iframe
          src={SPOTIFY_PLAYLIST.embedUrl}
          width="100%"
          height="352"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Wedding playlist"
        />
      </div>
      <a
        href={SPOTIFY_PLAYLIST.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-sans text-[10px] tracking-[2px] text-sage uppercase border-b border-sage/40 pb-0.5"
      >
        {t.playlist_cta}
      </a>
    </>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest __tests__/components/SpotifyPlaylist.test.tsx --no-coverage
```

Expected: all 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/SpotifyPlaylist.tsx __tests__/components/SpotifyPlaylist.test.tsx
git commit -m "feat: add SpotifyPlaylist component with tests"
```

---

### Task 4: Insert section into the info page

**Files:**
- Modify: `app/info/page.tsx`

- [ ] **Step 1: Add the import**

At the top of `app/info/page.tsx`, add the import after the `MessageForm` import line:

```ts
import SpotifyPlaylist from '@/components/SpotifyPlaylist'
```

- [ ] **Step 2: Insert the section**

In the JSX, find the "Send a Message" section closing tag and the "Contact" section opening tag. Insert the new section between them:

```tsx
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

        {/* Contact */}
        <section className="px-6 py-5">
```

- [ ] **Step 3: Run the full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests pass.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/info/page.tsx
git commit -m "feat: add playlist section to info page"
```

---

### Task 5: Smoke-test in the browser

**Files:** none — manual verification only

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open the app and navigate to the info page**

1. Go to `http://localhost:3000`
2. Tap "View My Invitation" on the home screen
3. Select any guest type (e.g. Friends → Hazim & Idayu)
4. You should land on `/info`

- [ ] **Step 3: Verify the section renders correctly**

Check the following:
- A section titled "OUR PLAYLIST" (with the sage/uppercase `SectionTitle` style) appears between "Send a Message" and "Contact"
- The Spotify iframe loads the playlist embed
- The "Add a Song →" link is visible below the iframe

- [ ] **Step 4: Verify Malay translation**

1. Tap the language toggle (top-right of the page) to switch to MY
2. The section title should read "SENARAI LAGU KAMI"
3. The intro copy should be in Malay
4. The CTA should read "Tambah Lagu →"

- [ ] **Step 5: Verify the CTA link**

Tap "Add a Song →" — it should open `https://open.spotify.com/playlist/0soLSTkWnbj8aYnB71n2Cf` in a new tab (or the Spotify app on mobile).
