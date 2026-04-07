# Memory Wall Peek Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static photo grid in `MemoryWall` with a CSS scroll-snap peek carousel where the active photo is centred, neighbours peek 52 px from each edge, and dot indicators track position.

**Architecture:** Each slide is `calc(100% - 104px)` wide inside a scroll container that has `padding: 0 52px` and `scroll-padding-left: 52px`. This makes the active slide fill the inner content area exactly while leaving 52 px on each side for the neighbouring slide to show through. A `useRef` + `onScroll` handler derives `activeIndex` from `scrollLeft / (offsetWidth - 104)`, which powers dot styles and keyboard navigation. No external library.

**Tech Stack:** React (`useState`, `useRef`, `useCallback`), Tailwind CSS arbitrary-value classes, CSS scroll-snap API.

---

### Task 1: Update existing tests and add carousel-specific ones

**Files:**
- Modify: `__tests__/components/MemoryWall.test.tsx`

The three existing tests (empty state, single photo, multiple photos) must keep passing. New tests cover: the scroll container exists as an accessible region, dot indicators appear only with ≥ 2 photos, the active dot is marked, and arrow keys call `scrollTo` with the correct pixel offset.

**Scroll-offset arithmetic used in tests:**
- `offsetWidth` is mocked to `300`
- `slideWidth = offsetWidth - 104 = 196` (the `calc(100%-104px)` value at this width)
- ArrowRight from slide 0 → `scrollTo({ left: 1 * 196, behavior: 'smooth' })` = `{ left: 196, … }`
- ArrowLeft from slide 0 → clamped to 0 → `scrollTo({ left: 0, behavior: 'smooth' })`

- [ ] **Step 1.1: Replace the entire test file**

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageProvider } from '@/lib/language-context'
import MemoryWall from '@/components/MemoryWall'
import type { Photo } from '@/lib/kv'

function Wrapper({ photos }: { photos: Photo[] }) {
  return (
    <LanguageProvider>
      <MemoryWall photos={photos} />
    </LanguageProvider>
  )
}

const photo: Photo = {
  id: 'id-1',
  guestName: 'Aishah',
  cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
  publicId: 'wedding/test',
  status: 'approved',
  token: 'tok-1',
  uploadedAt: 1000000,
}

const photo2: Photo = { ...photo, id: 'id-2', guestName: 'Hafiz', token: 'tok-2' }
const photo3: Photo = { ...photo, id: 'id-3', guestName: 'Siti', token: 'tok-3' }

describe('MemoryWall', () => {
  // ── existing tests (must keep passing) ──────────────────────────────────

  it('shows empty state when no photos', () => {
    render(<Wrapper photos={[]} />)
    expect(screen.getByText('Be the first to share a memory')).toBeInTheDocument()
  })

  it('renders a photo tile with guest name', () => {
    render(<Wrapper photos={[photo]} />)
    const img = screen.getByAltText('Photo by Aishah') as HTMLImageElement
    expect(img).toBeInTheDocument()
    expect(img.src).toContain('cloudinary.com')
    expect(screen.getByText('Aishah')).toBeInTheDocument()
  })

  it('renders all provided photos', () => {
    render(<Wrapper photos={[photo, photo2]} />)
    expect(screen.getByAltText('Photo by Aishah')).toBeInTheDocument()
    expect(screen.getByAltText('Photo by Hafiz')).toBeInTheDocument()
  })

  // ── carousel tests ───────────────────────────────────────────────────────

  it('renders an accessible scroll container', () => {
    render(<Wrapper photos={[photo, photo2]} />)
    expect(screen.getByRole('region', { name: /memories/i })).toBeInTheDocument()
  })

  it('does not show dot indicators for a single photo', () => {
    render(<Wrapper photos={[photo]} />)
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('shows one dot per photo when there are multiple photos', () => {
    render(<Wrapper photos={[photo, photo2, photo3]} />)
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  it('marks the first dot as active on initial render', () => {
    render(<Wrapper photos={[photo, photo2]} />)
    const [first, second] = screen.getAllByRole('tab')
    expect(first).toHaveAttribute('aria-selected', 'true')
    expect(second).toHaveAttribute('aria-selected', 'false')
  })

  it('scrolls to slide 1 on ArrowRight from slide 0', () => {
    render(<Wrapper photos={[photo, photo2, photo3]} />)
    const container = screen.getByRole('region', { name: /memories/i })

    const scrollToMock = jest.fn()
    Object.defineProperty(container, 'scrollTo', { value: scrollToMock, writable: true })
    // slideWidth = offsetWidth - 104 = 300 - 104 = 196
    Object.defineProperty(container, 'offsetWidth', { value: 300, writable: true })

    fireEvent.keyDown(container, { key: 'ArrowRight' })
    expect(scrollToMock).toHaveBeenCalledWith({ left: 196, behavior: 'smooth' })
  })

  it('clamps to slide 0 on ArrowLeft from slide 0', () => {
    render(<Wrapper photos={[photo, photo2, photo3]} />)
    const container = screen.getByRole('region', { name: /memories/i })

    const scrollToMock = jest.fn()
    Object.defineProperty(container, 'scrollTo', { value: scrollToMock, writable: true })
    Object.defineProperty(container, 'offsetWidth', { value: 300, writable: true })

    fireEvent.keyDown(container, { key: 'ArrowLeft' })
    expect(scrollToMock).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' })
  })
})
```

- [ ] **Step 1.2: Run the tests — confirm new ones fail**

```bash
cd /Users/hazim/Documents/Projects/wedding
npx jest __tests__/components/MemoryWall.test.tsx --no-coverage 2>&1 | tail -30
```

Expected: the 3 original tests PASS, the 6 new tests FAIL (component still renders the old grid).

---

### Task 2: Rewrite `MemoryWall` as a peek carousel

**Files:**
- Modify: `components/MemoryWall.tsx`

**How the peek geometry works:**

```
Container  ┌──────────────────────────────────────────────────────┐
           │←52px→┌────────── slide (calc 100%-104px) ──────────┐←52px→│
           │ peek  │                 active photo                  │ peek │
           │       └──────────────────────────────────────────────┘      │
           └──────────────────────────────────────────────────────┘
```

The container has `padding: 0 52px` and `scroll-padding-left: 52px`. Each slide is `calc(100% - 104px)` wide and uses `snap-start`. When scrollLeft = N × slideWidth, slide N's left edge sits exactly at the 52 px scroll-padding boundary. The previous slide's right 52 px and the next slide's left 52 px are visible in the padding zones.

`slideWidth = container.offsetWidth - 104`

- [ ] **Step 2.1: Replace the entire component**

```tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import { useTranslation } from '@/lib/language-context'
import type { Photo } from '@/lib/kv'

const PEEK_PX = 52

export default function MemoryWall({ photos }: { photos: Photo[] }) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const slideWidth = el.offsetWidth - PEEK_PX * 2
    if (slideWidth <= 0) return
    const index = Math.round(el.scrollLeft / slideWidth)
    setActiveIndex(Math.max(0, Math.min(index, photos.length - 1)))
  }, [photos.length])

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = containerRef.current
      if (!el) return
      const slideWidth = el.offsetWidth - PEEK_PX * 2
      if (slideWidth <= 0) return
      const clamped = Math.max(0, Math.min(index, photos.length - 1))
      el.scrollTo({ left: clamped * slideWidth, behavior: 'smooth' })
    },
    [photos.length],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowRight') scrollToIndex(activeIndex + 1)
      if (e.key === 'ArrowLeft') scrollToIndex(activeIndex - 1)
    },
    [activeIndex, scrollToIndex],
  )

  if (photos.length === 0) {
    return (
      <p className="font-sans text-[11px] text-gray-400 text-center py-6">
        {t.memories_empty}
      </p>
    )
  }

  return (
    <div>
      {/* Scrollable carousel track */}
      <div
        ref={containerRef}
        role="region"
        aria-label="Memories carousel"
        tabIndex={0}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className={[
          'flex overflow-x-scroll scroll-smooth',
          'snap-x snap-mandatory',
          'px-[52px] [scroll-padding-left:52px]',
          '[-webkit-overflow-scrolling:touch]',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'outline-none',
        ].join(' ')}
      >
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            // Each slide is exactly slideWidth wide; snap-start + scroll-padding
            // ensures the left edge of the active slide sits at the padding boundary.
            className="snap-start [scroll-snap-stop:always] flex-shrink-0 w-[calc(100%-104px)]"
          >
            <div
              className={[
                'relative h-[200px] rounded-2xl overflow-hidden bg-stone-100',
                'transition-opacity duration-300',
                i === activeIndex
                  ? 'opacity-100 shadow-[0_4px_16px_rgba(0,0,0,0.15)]'
                  : 'opacity-45',
              ].join(' ')}
            >
              <img
                src={photo.cloudinaryUrl}
                alt={`Photo by ${photo.guestName}`}
                className="w-full h-full object-cover"
              />
              {/* Guest name gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2">
                <p className="font-sans text-[10px] text-white truncate">
                  {photo.guestName}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators — only shown when there are 2+ photos */}
      {photos.length >= 2 && (
        <div role="tablist" className="flex gap-[5px] justify-center mt-3">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Photo ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={[
                'transition-all duration-300 rounded-full',
                i === activeIndex
                  ? 'w-[14px] h-[5px] bg-stone-500'
                  : 'w-[5px] h-[5px] bg-stone-300',
              ].join(' ')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2.2: Run all MemoryWall tests — confirm they all pass**

```bash
npx jest __tests__/components/MemoryWall.test.tsx --no-coverage 2>&1 | tail -20
```

Expected: 9 tests, 0 failures.

- [ ] **Step 2.3: Run the full test suite to confirm no regressions**

```bash
npx jest --no-coverage 2>&1 | tail -15
```

Expected: same pass/fail count as before this feature. Pre-existing failures in `guest-type.test.ts` and `SpotifyPlaylist.test.tsx` are known — ignore them.

- [ ] **Step 2.4: Commit**

```bash
git add components/MemoryWall.tsx __tests__/components/MemoryWall.test.tsx
git commit -m "feat: replace memory wall grid with peek carousel"
```

---

### Task 3: Visual verification in preview

**Files:** none (read-only verification)

- [ ] **Step 3.1: Navigate to `/info` in the preview**

```
http://localhost:3010/info
```

Scroll to **Our Memories**. Confirm:
- Photos display in a horizontal strip; ~52 px of the next/previous photo peek in at each edge
- The active (centre) photo is fully opaque; peeking photos are dimmed
- Swiping/dragging snaps smoothly to the next photo
- Guest name appears on a dark gradient at the bottom of each photo

- [ ] **Step 3.2: Verify dot indicators**

- With 2+ approved photos: dots appear below the carousel, active dot is a wider pill
- With only 1 approved photo: no dots shown
- Clicking a dot scrolls smoothly to that photo

- [ ] **Step 3.3: Verify keyboard navigation**

Click the carousel to focus it (it has `tabIndex={0}`), then press **→** and **←**. Each press should snap to the adjacent slide with smooth animation.
