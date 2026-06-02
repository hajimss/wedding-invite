# Emcee Photo Queue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/emcee` page that shows the full photo-taking queue as individually checkable items, colour-coded by bride/groom/both, with progress persisted in localStorage.

**Architecture:** Static data (PHOTO_LIST) lives in `lib/config.ts`. The page flattens groups into a 31-item list at module level, tracks a `Set<number>` of checked indices in state (seeded from localStorage on mount), and renders section headers + item rows with a gold highlight on the active item.

**Tech Stack:** Next.js 15 (app router), React, Tailwind CSS v4, TypeScript, Jest + Testing Library

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `lib/config.ts` | Modify | Add `PhotoGroup` type + `PHOTO_LIST` constant |
| `app/emcee/page.tsx` | Create | Client component — the full emcee queue page |
| `__tests__/lib/photo-list.test.ts` | Create | Validates PHOTO_LIST data shape and item count |
| `__tests__/app/emcee.test.tsx` | Create | Integration tests for the emcee page |

---

### Task 1: Add PhotoGroup type and PHOTO_LIST to config

**Files:**
- Modify: `lib/config.ts`
- Create: `__tests__/lib/photo-list.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/lib/photo-list.test.ts`:

```ts
import { PHOTO_LIST } from '@/lib/config'

describe('PHOTO_LIST', () => {
  const flatItems = PHOTO_LIST.flatMap(g => g.items)

  it('has 31 total checkable items', () => {
    expect(flatItems).toHaveLength(31)
  })

  it('every group has a valid category', () => {
    const valid = ['bride', 'groom', 'both']
    PHOTO_LIST.forEach(group => {
      expect(valid).toContain(group.category)
    })
  })

  it('every item is a non-empty string', () => {
    flatItems.forEach(item => {
      expect(typeof item).toBe('string')
      expect(item.trim().length).toBeGreaterThan(0)
    })
  })
})
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
npx jest __tests__/lib/photo-list.test.ts --no-coverage
```

Expected: FAIL — `PHOTO_LIST` is not exported from config

- [ ] **Step 3: Add the PhotoGroup type and PHOTO_LIST to `lib/config.ts`**

Add after the existing `WEDDING_EVENT` export:

```ts
export type PhotoGroup = {
  section?: string
  category: 'bride' | 'groom' | 'both'
  items: string[]
}

export const PHOTO_LIST: PhotoGroup[] = [
  { items: ['Grand Photo: Burhan and Sulaiman Family'], category: 'both' },
  {
    section: 'Idayu — Bride Side',
    category: 'bride',
    items: [
      'Burhan and Family',
      'Paklong and Family',
      'Nenek and Wan (both on wheelchair)',
      'Cik Roha and Family',
      'Keluarga dari Melaka',
      'Keluarga dari KL',
      'Keluarga dari Johor',
    ],
  },
  {
    section: 'Hazim — Groom Side',
    category: 'groom',
    items: [
      'Sulaiman and Family',
      'Keluarga besar Nemat',
      'Keluarga besar Mohamad Ali',
    ],
  },
  {
    section: 'Idayu — Bride Side 2nd Round',
    category: 'bride',
    items: [
      'fbaybeh',
      'shireen, hada, syafiqah and su',
      'wecreate studio (colleagues)',
    ],
  },
  {
    section: 'Hazim — Groom Side 2nd Round',
    category: 'groom',
    items: [
      'Pasir ris sec friends',
      'Mechanications',
      'Fly my kite friends',
      'DAH geng',
      'iCHAMP and change team',
    ],
  },
  { items: ['Cake Cutting'], category: 'both' },
  { items: ["Hazim's Speech"], category: 'groom' },
  { items: ["Idayu's Speech"], category: 'bride' },
  { items: ["Du'a Selamat by Idayu's Pak Long"], category: 'bride' },
  {
    section: 'After Cake/Speech',
    category: 'both',
    items: [
      'Taka/JL friends',
      'Cik Safura and Family',
      'Kakak Cute and Family',
      'Chinese Family',
      'Hi-5 Gang',
      '+any adhoc',
    ],
  },
  { items: ['Hazim & Idayu to walk around and mingle w the guests'], category: 'both' },
  { items: ['Tamat'], category: 'both' },
]
```

- [ ] **Step 4: Run the test to confirm it passes**

```bash
npx jest __tests__/lib/photo-list.test.ts --no-coverage
```

Expected: 3 tests pass

- [ ] **Step 5: Commit**

```bash
git add lib/config.ts __tests__/lib/photo-list.test.ts
git commit -m "feat: add PhotoGroup type and PHOTO_LIST to config"
```

---

### Task 2: Write failing tests for the emcee page

**Files:**
- Create: `__tests__/app/emcee.test.tsx`

- [ ] **Step 1: Create the test file**

Create `__tests__/app/emcee.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import EmceePage from '@/app/emcee/page'

beforeEach(() => {
  localStorage.clear()
})

describe('EmceePage', () => {
  it('renders the Photo Queue heading', () => {
    render(<EmceePage />)
    expect(screen.getByRole('heading', { name: /photo queue/i })).toBeInTheDocument()
  })

  it('shows 0 / 31 done on first load', () => {
    render(<EmceePage />)
    expect(screen.getByText('0 / 31 done')).toBeInTheDocument()
  })

  it('renders the first item as active with a Done button', () => {
    render(<EmceePage />)
    expect(screen.getByText('Grand Photo: Burhan and Sulaiman Family')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument()
  })

  it('advances progress after tapping Done', () => {
    render(<EmceePage />)
    fireEvent.click(screen.getByRole('button', { name: /done/i }))
    expect(screen.getByText('1 / 31 done')).toBeInTheDocument()
  })

  it('renders section headers for grouped items', () => {
    render(<EmceePage />)
    expect(screen.getByText('Idayu — Bride Side')).toBeInTheDocument()
    expect(screen.getByText('Hazim — Groom Side')).toBeInTheDocument()
  })

  it('renders items from all three categories', () => {
    render(<EmceePage />)
    expect(screen.getAllByText('bride').length).toBeGreaterThan(0)
    expect(screen.getAllByText('groom').length).toBeGreaterThan(0)
    expect(screen.getAllByText('both').length).toBeGreaterThan(0)
  })

  it('persists progress to localStorage when Done is tapped', () => {
    render(<EmceePage />)
    fireEvent.click(screen.getByRole('button', { name: /done/i }))
    const stored = JSON.parse(localStorage.getItem('emcee-photo-queue') ?? '[]')
    expect(stored).toContain(0)
  })
})
```

- [ ] **Step 2: Run the tests to confirm they all fail**

```bash
npx jest __tests__/app/emcee.test.tsx --no-coverage
```

Expected: 7 tests FAIL — `Cannot find module '@/app/emcee/page'`

---

### Task 3: Implement the emcee page

**Files:**
- Create: `app/emcee/page.tsx`

- [ ] **Step 1: Create the page**

Create `app/emcee/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { PHOTO_LIST, type PhotoGroup } from '@/lib/config'

type FlatItem = {
  flatIndex: number
  label: string
  category: 'bride' | 'groom' | 'both'
  section?: string
}

function flattenPhotoList(groups: PhotoGroup[]): FlatItem[] {
  const result: FlatItem[] = []
  for (const group of groups) {
    group.items.forEach((label, i) => {
      result.push({
        flatIndex: result.length,
        label,
        category: group.category,
        section: i === 0 ? group.section : undefined,
      })
    })
  }
  return result
}

const STORAGE_KEY = 'emcee-photo-queue'
const flatItems = flattenPhotoList(PHOTO_LIST)

const CATEGORY_STYLES: Record<string, { row: string; badge: string; dot: string; header: string; rule: string }> = {
  bride: {
    row: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    dot: 'bg-purple-100 text-purple-400',
    header: 'text-purple-600',
    rule: 'bg-purple-200',
  },
  groom: {
    row: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-100 text-blue-400',
    header: 'text-blue-600',
    rule: 'bg-blue-200',
  },
  both: {
    row: 'bg-stone-50 border-stone-200',
    badge: 'bg-stone-100 text-stone-500',
    dot: 'bg-stone-100 text-stone-400',
    header: 'text-stone-500',
    rule: 'bg-stone-200',
  },
}

export default function EmceePage() {
  const [checked, setChecked] = useState<Set<number>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setChecked(new Set(JSON.parse(stored) as number[]))
    } catch {}
  }, [])

  function markDone(index: number) {
    setChecked(prev => {
      const next = new Set(prev)
      next.add(index)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      } catch {}
      return next
    })
  }

  const activeIndex = flatItems.findIndex(item => !checked.has(item.flatIndex))

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-sm mx-auto bg-white shadow-sm">

        {/* Header */}
        <div className="bg-white border-b border-stone-100 px-5 py-4">
          <p className="font-sans text-[9px] tracking-[4px] text-sage uppercase mb-1">
            06 JUNE 2026 · BEGONIA PAVILION
          </p>
          <h1 className="font-serif text-[22px] text-gray-800 font-normal mb-3">Photo Queue</h1>
          <div className="flex gap-4">
            <LegendItem swatch="bg-purple-100 border border-purple-200" label="Bride" />
            <LegendItem swatch="bg-blue-100 border border-blue-200" label="Groom" />
            <LegendItem swatch="bg-stone-100 border border-stone-200" label="Both" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-3 bg-white border-b border-stone-100 flex items-center gap-3">
          <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage rounded-full transition-all duration-300"
              style={{ width: `${(checked.size / flatItems.length) * 100}%` }}
            />
          </div>
          <span className="font-sans text-[10px] text-gray-400 whitespace-nowrap">
            {checked.size} / {flatItems.length} done
          </span>
        </div>

        {/* Items */}
        <div className="px-4 py-3 flex flex-col gap-2">
          {flatItems.map(item => {
            const isDone = checked.has(item.flatIndex)
            const isActive = item.flatIndex === activeIndex
            const styles = CATEGORY_STYLES[item.category]

            return (
              <div key={item.flatIndex}>
                {item.section && (
                  <div className="flex items-center gap-2 pt-2 pb-1 px-1">
                    <span className={`font-sans text-[9px] tracking-[2px] uppercase font-semibold whitespace-nowrap ${styles.header}`}>
                      {item.section}
                    </span>
                    <div className={`flex-1 h-px ${styles.rule}`} />
                  </div>
                )}
                <div className={[
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all',
                  isDone ? 'bg-green-50 border-green-200 opacity-60' : '',
                  isActive ? 'bg-amber-50 border-gold border-2 shadow-[0_2px_8px_rgba(201,168,76,0.15)]' : '',
                  !isDone && !isActive ? styles.row : '',
                ].join(' ')}>
                  <div className={[
                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px]',
                    isDone ? 'bg-sage text-white' : '',
                    isActive ? 'bg-gold text-white' : '',
                    !isDone && !isActive ? styles.dot : '',
                  ].join(' ')}>
                    {isDone ? '✓' : isActive ? '▶' : '○'}
                  </div>

                  <p className={[
                    'flex-1 font-serif text-[13px] leading-snug',
                    isDone ? 'text-gray-400 line-through' : '',
                    isActive ? 'text-gray-900' : '',
                    !isDone && !isActive ? 'text-gray-600' : '',
                  ].join(' ')}>
                    {item.label}
                  </p>

                  <span className={`font-sans text-[9px] tracking-[1px] uppercase rounded px-1.5 py-0.5 flex-shrink-0 ${styles.badge}`}>
                    {item.category}
                  </span>

                  {isActive && (
                    <button
                      onClick={() => markDone(item.flatIndex)}
                      className="bg-gold text-white font-sans text-[9px] tracking-[1px] uppercase rounded-lg px-3 py-1.5 transition-opacity hover:opacity-80 flex-shrink-0"
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-stone-100">
          <p className="font-sans text-[10px] text-gray-300 text-center">
            Tap &ldquo;Done&rdquo; to check off · Progress saves in browser
          </p>
        </div>

      </div>
    </div>
  )
}

function LegendItem({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="font-sans text-[10px] text-gray-500 flex items-center gap-1.5">
      <span className={`inline-block w-2.5 h-2.5 rounded-sm ${swatch}`} />
      {label}
    </span>
  )
}
```

- [ ] **Step 2: Run all tests to confirm the emcee tests now pass**

```bash
npx jest __tests__/app/emcee.test.tsx --no-coverage
```

Expected: 7 tests pass

- [ ] **Step 3: Run the full test suite to confirm no regressions**

```bash
npx jest --no-coverage
```

Expected: all previously-passing tests still pass (the 6 pre-existing failures in `guest-type`, `kv`, and `SpotifyPlaylist` are unrelated and were present before this work)

- [ ] **Step 4: Commit**

```bash
git add app/emcee/page.tsx __tests__/app/emcee.test.tsx
git commit -m "feat: add emcee photo queue page at /emcee"
```
