# Photo Upload Wall — Design Spec

**Date:** 2026-04-06
**Feature:** Guest photo upload wall with moderation
**Status:** Approved for implementation

---

## Overview

Guests can upload photos and their name to a shared wedding memory wall. Each upload is held in a pending state until approved via a one-click email link. Approved photos appear in an "Our Memories" section on the `/info` page. The upload page is always accessible (no date restriction).

---

## Architecture

**Stack additions:**
- **Cloudinary** — image storage, optimisation, and CDN delivery
- **Vercel KV (Redis)** — photo metadata storage (guest name, Cloudinary URL, approval status, approval token)
- **Nodemailer** (existing) — approval email notifications

**New routes:**
- `GET/POST /upload` — guest-facing photo upload page
- `POST /api/photos/upload` — receives multipart form, uploads to Cloudinary, writes metadata to KV, sends approval email
- `GET /api/photos/approve/[token]` — approves a photo by token, redirects to a confirmation page
- `GET /api/photos/reject/[token]` — rejects (deletes) a photo by token
- `GET /api/photos` — returns all approved photos for the gallery (used by the `/info` page)

---

## Data Model

Each photo is stored in Vercel KV as a hash under the key `photo:{id}`:

```
id          string   UUID v4
guestName   string   Provided by guest on upload
cloudinaryUrl  string   Public Cloudinary delivery URL
publicId    string   Cloudinary public ID (for deletion)
status      enum     "pending" | "approved" | "rejected"
token       string   UUID v4, single-use approval/rejection token
uploadedAt  number   Unix timestamp
```

A sorted set `photos:approved` (sorted by `uploadedAt`) is maintained for efficient gallery queries.

---

## User Flows

### Guest Upload Flow

1. Guest navigates to `/upload` (via QR code, link, or directly).
2. Enters their name and selects or takes a photo.
3. Submits the form → `POST /api/photos/upload`.
4. API validates: name required, file required, file must be an image, max 10MB.
5. Image uploaded to Cloudinary under folder `wedding/pending/`.
6. Metadata written to Vercel KV with `status: "pending"`.
7. Approval email sent to the couple.
8. Guest sees a success message: "Thanks [name]! Your photo is being reviewed."

### Approval Flow (Hazim / Idayu)

1. Approval email arrives containing: photo preview, guest name, upload time, Approve button, Reject button.
2. Clicking **Approve** → `GET /api/photos/approve/[token]`:
   - Sets `status: "approved"` in KV.
   - Adds photo to `photos:approved` sorted set.
   - Redirects to `/approved` showing a simple "Approved!" confirmation page.
3. Clicking **Reject** → `GET /api/photos/reject/[token]`:
   - Deletes the image from Cloudinary.
   - Sets `status: "rejected"` in KV (or deletes the key entirely).
   - Redirects to a "Photo rejected" confirmation page.
4. Tokens are single-use — subsequent clicks on the same link return a "Already processed" message.

### Gallery Display

- The `/info` page fetches approved photos from `GET /api/photos` on render.
- Photos displayed in a responsive masonry/grid layout in the "Our Memories" section, inserted between the "Our Playlist" and "Contact" sections.
- Each tile shows the photo with the guest's name overlaid at the bottom.
- If no approved photos exist yet, the section shows a friendly empty state.

---

## New Pages & Components

### `/upload` page (`app/upload/page.tsx`)
- Mobile-first form: name field + file input + submit button.
- Uses the existing `BotanicalBackground` and bilingual translation system.
- Client-side validation before submit (name required, file required, image type, size ≤ 10MB).
- Shows loading state during upload, success or error message on completion.

### `MemoryWall` component (`components/MemoryWall.tsx`)
- Accepts `photos: Photo[]` prop.
- Renders approved photos in a responsive CSS grid (2 cols mobile, 4 cols desktop).
- Each tile: `<img>` with Cloudinary URL + guest name overlay.
- Empty state: subtle text prompt ("Be the first to share a memory").
- Bilingual section heading ("Our Memories" / "Kenangan Kami").

---

## API Details

### `POST /api/photos/upload`
- Content-Type: `multipart/form-data`
- Fields: `name` (string), `photo` (file)
- Validation errors return `400` with JSON `{ error: string }`
- On success returns `200` with `{ message: string }`
- Uses Next.js `formidable` or native `request.formData()` for parsing

### `GET /api/photos`
- Returns `200` with `{ photos: Photo[] }` sorted newest-first
- Only returns `status: "approved"` photos
- No authentication required (public gallery)

### `GET /api/photos/approve/[token]` and `GET /api/photos/reject/[token]`
- Token looked up in KV; invalid/used tokens return a graceful HTML page ("This link has already been used.")
- No authentication beyond possession of the token (emailed only to the couple)

---

## Email Notification

Sent via existing Nodemailer/Gmail setup. Contains:
- Photo preview (Cloudinary URL rendered inline)
- Guest name and upload timestamp
- Approve button (links to `/api/photos/approve/[token]`)
- Reject button (links to `/api/photos/reject/[token]`)
- Plain-text fallback for email clients that block images

---

## Configuration

New entries added to `lib/config.ts`:
```ts
PHOTO_WALL: {
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  folder: "wedding",
}
```

New environment variables (added to `.env.local`):
```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

---

## Translations

New keys added to `lib/translations.ts` for EN and MY:
- `photoWall.title` — "Our Memories" / "Kenangan Kami"
- `photoWall.subtitle` — "Photos shared by our guests" / "Gambar yang dikongsi tetamu kami"
- `photoWall.empty` — "Be the first to share a memory" / "Jadilah yang pertama berkongsi kenangan"
- `upload.title` — "Share a Memory" / "Kongsi Kenangan"
- `upload.namePlaceholder` — "Your name" / "Nama anda"
- `upload.cta` — "Share Photo" / "Hantar Foto"
- `upload.success` — "Thanks {name}! Your photo is being reviewed." / "Terima kasih {name}! Foto anda sedang disemak."
- `upload.errorSize` — "Photo must be under 10MB." / "Foto mestilah kurang daripada 10MB."
- `upload.errorType` — "Please upload an image file." / "Sila muat naik fail imej."

---

## Testing

- Unit tests for `POST /api/photos/upload`: missing name, missing file, oversized file, invalid type, successful upload (Cloudinary and KV mocked)
- Unit tests for approve/reject routes: valid token, already-used token, invalid token
- Unit tests for `GET /api/photos`: returns only approved photos
- Component tests for `MemoryWall`: renders photos, renders empty state
- Component tests for `/upload` page: form validation, success state, error state
- Translation key parity test (existing pattern) extended to include new keys

---

## Out of Scope

- Admin dashboard for bulk moderation
- Photo lightbox / full-size view (future enhancement)
- Guest ability to delete their own photo
- Video uploads
