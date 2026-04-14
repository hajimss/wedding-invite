# Spotify Collaborative Playlist Section — Design Spec

**Date:** 2026-04-05
**Page:** `/info`

## Overview

Add a section to the `/info` page allowing wedding guests to browse and contribute to a collaborative Spotify playlist. The section sits between "Send a Message" and "Contact", grouping the two participatory/interactive sections together.

## Playlist Details

- **Spotify Playlist URL:** `https://open.spotify.com/playlist/0soLSTkWnbj8aYnB71n2Cf`
- **Embed URL:** `https://open.spotify.com/embed/playlist/0soLSTkWnbj8aYnB71n2Cf?utm_source=generator`

## Page Order (after change)

1. Hero strip
2. Venue
3. Our Story
4. Send a Message
5. **Our Playlist** ← new
6. Contact

## Layout (Option C — Full Embed + Link)

The section renders:
1. **Section title** — via the existing `SectionTitle` component, using the `section_playlist` translation key
2. **Intro paragraph** — short copy inviting guests to add a song, styled to match existing section intros (`font-sans text-[11px] text-gray-500 leading-6 mb-3`)
3. **Spotify iframe embed** — standard Spotify playlist embed at full width, `height="352"`, `rounded-xl overflow-hidden`, `allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"`, `loading="lazy"`
4. **CTA link** — opens the playlist in Spotify app/browser (`target="_blank"`), styled identically to `venue_directions` (sage uppercase text with bottom border)

## Component Architecture (Option B)

### New file: `components/SpotifyPlaylist.tsx`

- `'use client'` directive
- Reads translations via `useTranslation()` hook
- Reads playlist URLs from `SPOTIFY_PLAYLIST` config constant
- No props — self-contained
- Renders: intro paragraph + iframe + CTA link

### Changes to existing files

**`lib/config.ts`**
Add `SPOTIFY_PLAYLIST` export:
```ts
export const SPOTIFY_PLAYLIST = {
  url: 'https://open.spotify.com/playlist/0soLSTkWnbj8aYnB71n2Cf',
  embedUrl: 'https://open.spotify.com/embed/playlist/0soLSTkWnbj8aYnB71n2Cf?utm_source=generator',
}
```

**`lib/translations.ts`**
Add 3 keys to the `T` type and both `en` and `my` translation objects:

| Key | EN | MY |
|-----|----|----|
| `section_playlist` | `Our Playlist` | `Senarai Lagu Kami` |
| `playlist_intro` | `Add a song to our wedding playlist — open Spotify and contribute a track that means something to you.` | `Tambah lagu ke senarai lagu perkahwinan kami — buka Spotify dan sertakan lagu yang bermakna bagi anda.` |
| `playlist_cta` | `Add a Song →` | `Tambah Lagu →` |

**`app/info/page.tsx`**
- Import `SpotifyPlaylist` from `@/components/SpotifyPlaylist`
- Insert new `<section>` with `border-b border-stone-100` between the "Send a Message" section and the "Contact" section:
  ```tsx
  <section className="px-6 py-5 border-b border-stone-100">
    <SectionTitle>{t.section_playlist}</SectionTitle>
    <SpotifyPlaylist />
  </section>
  ```

## Styling

All styles follow existing page conventions:
- Section background: `bg-cream` (inherited from parent)
- Section padding: `px-6 py-5`
- Section divider: `border-b border-stone-100`
- Intro text: `font-sans text-[11px] text-gray-500 leading-6 mb-3`
- Iframe wrapper: `rounded-xl overflow-hidden mb-2`
- CTA link: `font-sans text-[10px] tracking-[2px] text-sage uppercase border-b border-sage/40 pb-0.5`

## Out of Scope

- No backend — the section is a static embed + external link; no API calls
- No song submission form — guests add songs directly in the Spotify app
- No song count display — the embed shows this natively
