# Shuttle FYI Notice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bilingual sage-tinted callout in the Venue section telling guests about the free shuttle bus from Pasir Ris MRT, with a link to the Downtown East shuttle page.

**Architecture:** Two-file change only — add three translation keys to `lib/translations.ts` (type + both locales), then add the callout JSX inline in the Venue section of `app/page.tsx`. No new files or components needed.

**Tech Stack:** Next.js (app router), React, Tailwind CSS, TypeScript, Jest + Testing Library

---

### Task 1: Add translation keys

**Files:**
- Modify: `lib/translations.ts`

- [ ] **Step 1: Add keys to the `T` type**

In `lib/translations.ts`, add three new string fields to the `T` type (after `rsvp_error`):

```ts
  shuttle_label: string
  shuttle_body: string
  shuttle_link: string
```

- [ ] **Step 2: Add English values**

In the `en` object (after `rsvp_error: '...'`):

```ts
  shuttle_label: 'Free Shuttle Bus',
  shuttle_body: 'Available from Pasir Ris MRT to the venue',
  shuttle_link: 'View shuttle info →',
```

- [ ] **Step 3: Add Malay values**

In the `my` object (after `rsvp_error: '...'`):

```ts
  shuttle_label: 'Bas Ulang-Alik Percuma',
  shuttle_body: 'Tersedia dari MRT Pasir Ris ke lokasi',
  shuttle_link: 'Lihat maklumat bas →',
```

- [ ] **Step 4: Run translation tests to confirm they pass**

```bash
npx jest __tests__/lib/translations.test.ts --no-coverage
```

Expected: all tests pass, including three new auto-generated key tests for `shuttle_label`, `shuttle_body`, `shuttle_link` in both EN and MY.

- [ ] **Step 5: Commit**

```bash
git add lib/translations.ts
git commit -m "feat: add shuttle FYI translation keys (en + my)"
```

---

### Task 2: Write failing test for the shuttle callout

**Files:**
- Modify: `__tests__/app/page.test.tsx`

- [ ] **Step 1: Add the failing test**

In `__tests__/app/page.test.tsx`, add inside the `describe('HomePage', ...)` block:

```ts
it('renders the shuttle FYI callout with a link to the shuttle page', () => {
  render(<Wrapper />)
  expect(screen.getByText('Free Shuttle Bus')).toBeInTheDocument()
  expect(screen.getByText('Available from Pasir Ris MRT to the venue')).toBeInTheDocument()
  const link = screen.getByRole('link', { name: /view shuttle info/i })
  expect(link).toHaveAttribute('href', 'https://www.downtowneast.com.sg/services/pasir-ris-mrt-shuttle')
})
```

- [ ] **Step 2: Run the test to confirm it fails**

```bash
npx jest __tests__/app/page.test.tsx --no-coverage
```

Expected: FAIL — "Unable to find an element with the text: Free Shuttle Bus"

---

### Task 3: Implement the shuttle callout

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the callout JSX in the Venue section**

In `app/page.tsx`, locate the Venue section. Find this block (around line 98–108):

```tsx
          <p className="font-serif text-[10px] lowercase text-gray-500 italic mb-2">
            &ldquo;sorry there&rsquo;s no free parking but i promise you it&rsquo;s cheap&rdquo; — hazim
          </p>
          <a
            href={VENUE.googleMapsUrl}
```

Replace it with:

```tsx
          <p className="font-serif text-[10px] lowercase text-gray-500 italic mb-2">
            &ldquo;sorry there&rsquo;s no free parking but i promise you it&rsquo;s cheap&rdquo; — hazim
          </p>
          <div className="flex items-start gap-3 bg-sage/10 border border-sage/20 rounded-xl px-3 py-2.5 mb-3">
            <span className="text-[18px] leading-none mt-0.5">🚌</span>
            <div>
              <p className="font-sans text-[9px] tracking-[2px] uppercase text-sage mb-0.5">{t.shuttle_label}</p>
              <p className="font-sans text-[11px] text-gray-500 leading-5 mb-1">{t.shuttle_body}</p>
              <a
                href="https://www.downtowneast.com.sg/services/pasir-ris-mrt-shuttle"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-[10px] tracking-[1px] text-sage border-b border-sage/40 pb-0.5 transition-opacity hover:opacity-70"
              >
                {t.shuttle_link}
              </a>
            </div>
          </div>
          <a
            href={VENUE.googleMapsUrl}
```

- [ ] **Step 2: Run all tests to confirm they pass**

```bash
npx jest --no-coverage
```

Expected: all tests pass, including the new shuttle callout test.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx __tests__/app/page.test.tsx
git commit -m "feat: add shuttle FYI callout to venue section"
```
