# Add to Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google Calendar and Apple Calendar (ICS) buttons to the /info venue section and RSVP success screen.

**Architecture:** A single reusable `AddToCalendar` client component builds the Google Calendar URL and ICS blob entirely in the browser using event data from `lib/config.ts`. No external libraries or API routes needed.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Jest + Testing Library

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `lib/config.ts` | Modify | Add `WEDDING_EVENT` export |
| `components/AddToCalendar.tsx` | Create | Google + Apple Calendar buttons |
| `__tests__/components/AddToCalendar.test.tsx` | Create | Unit tests for the component |
| `app/info/page.tsx` | Modify | Mount component in Venue section |
| `app/rsvp/page.tsx` | Modify | Mount component in success state |

---

## Task 1: Add WEDDING_EVENT to config

**Files:**
- Modify: `lib/config.ts`

- [ ] **Step 1: Add the export**

Open `lib/config.ts` and append after the existing exports:

```ts
export const WEDDING_EVENT = {
  title: 'Hazim & Idayu Wedding',
  date: '20260606',     // YYYYMMDD — all-day ICS/Google Calendar format
  dateEnd: '20260607',  // exclusive end date (required by both formats)
  location: 'Begonia Pavilion, 1 Pasir Ris Cl, Singapore 519599',
  description: 'Join us as we celebrate our wedding day.',
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
git commit -m "feat: add WEDDING_EVENT to config"
```

---

## Task 2: Build AddToCalendar component (TDD)

**Files:**
- Create: `__tests__/components/AddToCalendar.test.tsx`
- Create: `components/AddToCalendar.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/AddToCalendar.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import AddToCalendar from '@/components/AddToCalendar'

describe('AddToCalendar', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:fake')
    global.URL.revokeObjectURL = jest.fn()
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders Google Calendar and Apple Calendar buttons', () => {
    render(<AddToCalendar />)
    expect(screen.getByText('Google Calendar')).toBeInTheDocument()
    expect(screen.getByText('Apple Calendar')).toBeInTheDocument()
  })

  it('opens Google Calendar URL in new tab when clicked', () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null)
    render(<AddToCalendar />)
    fireEvent.click(screen.getByText('Google Calendar'))
    expect(open).toHaveBeenCalledWith(
      expect.stringContaining('calendar.google.com'),
      '_blank'
    )
  })

  it('includes correct event data in Google Calendar URL', () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null)
    render(<AddToCalendar />)
    fireEvent.click(screen.getByText('Google Calendar'))
    const url = open.mock.calls[0][0] as string
    expect(url).toContain('Hazim')
    expect(url).toContain('20260606')
    expect(url).toContain('Begonia')
  })

  it('triggers ICS blob download on Apple Calendar click', () => {
    render(<AddToCalendar />)
    fireEvent.click(screen.getByText('Apple Calendar'))
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake')
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest __tests__/components/AddToCalendar.test.tsx --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/AddToCalendar'`

- [ ] **Step 3: Implement the component**

Create `components/AddToCalendar.tsx`:

```tsx
'use client'

import { WEDDING_EVENT } from '@/lib/config'

export default function AddToCalendar() {
  function handleGoogle() {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: WEDDING_EVENT.title,
      dates: `${WEDDING_EVENT.date}/${WEDDING_EVENT.dateEnd}`,
      details: WEDDING_EVENT.description,
      location: WEDDING_EVENT.location,
    })
    window.open(`https://calendar.google.com/calendar/render?${params}`, '_blank')
  }

  function handleApple() {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${WEDDING_EVENT.date}`,
      `DTEND;VALUE=DATE:${WEDDING_EVENT.dateEnd}`,
      `SUMMARY:${WEDDING_EVENT.title}`,
      `LOCATION:${WEDDING_EVENT.location}`,
      `DESCRIPTION:${WEDDING_EVENT.description}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wedding-hazim-idayu.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-2 mt-3">
      <button
        onClick={handleGoogle}
        className="font-sans text-[10px] tracking-[2px] text-sage uppercase border border-sage/40 rounded px-3 py-1.5"
      >
        Google Calendar
      </button>
      <button
        onClick={handleApple}
        className="font-sans text-[10px] tracking-[2px] text-sage uppercase border border-sage/40 rounded px-3 py-1.5"
      >
        Apple Calendar
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest __tests__/components/AddToCalendar.test.tsx --no-coverage
```

Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add components/AddToCalendar.tsx __tests__/components/AddToCalendar.test.tsx
git commit -m "feat: add AddToCalendar component"
```

---

## Task 3: Place component in /info venue section

**Files:**
- Modify: `app/info/page.tsx`

- [ ] **Step 1: Add the import**

In `app/info/page.tsx`, add to the existing import block (after the last import):

```tsx
import AddToCalendar from '@/components/AddToCalendar'
```

- [ ] **Step 2: Mount the component**

In `app/info/page.tsx`, locate the Venue section (around line 97–108). It ends with an `<a>` tag for directions. Add `<AddToCalendar />` immediately after that closing `</a>` tag, still inside the `<section>`:

```tsx
          <a
            href={VENUE.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[10px] tracking-[2px] text-sage uppercase border-b border-sage/40 pb-0.5"
          >
            <p className="font-serif text-[10px] lowercase text-gray-600 italic">
              "sorry there's no free parking but i promise you it's cheap" -
              hazim
            </p>
            {t.venue_directions}
          </a>
          <AddToCalendar />
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/info/page.tsx
git commit -m "feat: add calendar buttons to venue section"
```

---

## Task 4: Place component in RSVP success screen

**Files:**
- Modify: `app/rsvp/page.tsx`

- [ ] **Step 1: Add the import**

In `app/rsvp/page.tsx`, add to the existing import block:

```tsx
import AddToCalendar from '@/components/AddToCalendar'
```

- [ ] **Step 2: Expand the success state**

In `app/rsvp/page.tsx`, find the success state block (around line 53–61). Replace it with:

```tsx
  if (state === 'success') {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-8">
        <div className="text-center">
          <p className="font-serif text-[22px] text-sage italic">{t.rsvp_success}</p>
          <AddToCalendar />
        </div>
      </div>
    )
  }
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Run full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests passing.

- [ ] **Step 5: Commit**

```bash
git add app/rsvp/page.tsx
git commit -m "feat: add calendar buttons to RSVP success screen"
```
