# Photo Upload Wall Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a guest photo upload wall — guests upload a photo + name, you approve via email, approved photos appear in a "Our Memories" section on the `/info` page.

**Architecture:** Cloudinary stores images; Vercel KV (Redis) stores photo metadata and a sorted set of approved photo IDs. The existing Nodemailer/Gmail setup sends approval emails. New API routes handle upload, gallery fetch, and approve/reject actions.

**Tech Stack:** `cloudinary` npm package, `@vercel/kv`, `crypto.randomUUID()` (built-in, no uuid package needed), existing Nodemailer, Next.js App Router route handlers, React client components.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `lib/kv.ts` | `Photo` type + all Vercel KV read/write helpers |
| Create | `lib/cloudinary.ts` | Cloudinary config + `uploadImage` / `deleteImage` |
| Create | `lib/photo-email.ts` | `sendApprovalEmail` — approval email with approve/reject links |
| Create | `app/upload/page.tsx` | Guest-facing upload form (client component) |
| Create | `app/approved/page.tsx` | Confirmation shown after approving a photo |
| Create | `app/rejected/page.tsx` | Confirmation shown after rejecting a photo |
| Create | `components/MemoryWall.tsx` | Approved photo grid with empty state |
| Create | `app/api/photos/upload/route.ts` | `POST` — validates, uploads to Cloudinary, saves to KV, sends email |
| Create | `app/api/photos/route.ts` | `GET` — returns approved photos for gallery |
| Create | `app/api/photos/approve/[token]/route.ts` | `GET` — approves photo by token |
| Create | `app/api/photos/reject/[token]/route.ts` | `GET` — rejects + deletes photo by token |
| Modify | `lib/config.ts` | Add `PHOTO_WALL` config block |
| Modify | `lib/translations.ts` | Add 9 new translation keys (EN + MY) |
| Modify | `app/info/page.tsx` | Add photo fetch + `MemoryWall` section between Playlist and Contact |
| Create | `__tests__/lib/kv.test.ts` | Unit tests for KV helpers |
| Create | `__tests__/api/photos-upload.test.ts` | Unit tests for POST /api/photos/upload |
| Create | `__tests__/api/photos.test.ts` | Unit tests for GET /api/photos |
| Create | `__tests__/api/photos-approve.test.ts` | Unit tests for GET /api/photos/approve/[token] |
| Create | `__tests__/api/photos-reject.test.ts` | Unit tests for GET /api/photos/reject/[token] |
| Create | `__tests__/components/MemoryWall.test.tsx` | Component tests for MemoryWall |
| Create | `__tests__/app/upload.test.tsx` | Component tests for /upload page |

---

## Task 1: Install dependencies

**Files:** `package.json`

- [ ] **Step 1: Install Cloudinary and Vercel KV**

```bash
npm install cloudinary @vercel/kv
```

Expected: both packages appear in `dependencies` in `package.json`.

- [ ] **Step 2: Install types for cloudinary**

```bash
npm install --save-dev @types/cloudinary
```

If this fails with "not found", skip it — `cloudinary` v2+ ships its own types.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add cloudinary and @vercel/kv"
```

---

## Task 2: Add config and translations

**Files:**
- Modify: `lib/config.ts`
- Modify: `lib/translations.ts`

- [ ] **Step 1: Add `PHOTO_WALL` to `lib/config.ts`**

Append to the bottom of `lib/config.ts`:

```ts
export const PHOTO_WALL = {
  folder: 'wedding',
}
```

- [ ] **Step 2: Add 9 new keys to the `T` type in `lib/translations.ts`**

Add these fields to the `T` type (after `lang_label`):

```ts
  section_memories: string
  memories_subtitle: string
  memories_empty: string
  upload_title: string
  upload_name_placeholder: string
  upload_cta: string
  upload_success: string
  upload_error_size: string
  upload_error_type: string
```

- [ ] **Step 3: Add EN values to `lib/translations.ts`**

Add to the `en` object (after `lang_label: 'MY'`):

```ts
  section_memories: 'Our Memories',
  memories_subtitle: 'Photos shared by our guests',
  memories_empty: 'Be the first to share a memory',
  upload_title: 'Share a Memory',
  upload_name_placeholder: 'Your name',
  upload_cta: 'Share Photo',
  upload_success: 'Thanks {name}! Your photo is being reviewed.',
  upload_error_size: 'Photo must be under 10MB.',
  upload_error_type: 'Please upload an image file.',
```

- [ ] **Step 4: Add MY values to `lib/translations.ts`**

Add to the `my` object (after `lang_label: 'EN'`):

```ts
  section_memories: 'Kenangan Kami',
  memories_subtitle: 'Gambar yang dikongsi tetamu kami',
  memories_empty: 'Jadilah yang pertama berkongsi kenangan',
  upload_title: 'Kongsi Kenangan',
  upload_name_placeholder: 'Nama anda',
  upload_cta: 'Hantar Foto',
  upload_success: 'Terima kasih {name}! Foto anda sedang disemak.',
  upload_error_size: 'Foto mestilah kurang daripada 10MB.',
  upload_error_type: 'Sila muat naik fail imej.',
```

- [ ] **Step 5: Run translation tests to confirm parity**

```bash
npm test -- --testPathPattern="translations" --no-coverage
```

Expected: all tests pass (the test auto-checks that every EN key exists in MY).

- [ ] **Step 6: Commit**

```bash
git add lib/config.ts lib/translations.ts
git commit -m "feat: add photo wall config and translation keys"
```

---

## Task 3: Create `lib/kv.ts` (Photo type + KV helpers)

**Files:**
- Create: `lib/kv.ts`
- Create: `__tests__/lib/kv.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/lib/kv.test.ts`:

```ts
/**
 * @jest-environment node
 */
import { kv } from '@vercel/kv'
import {
  savePhoto,
  getPhotoByToken,
  updatePhotoStatus,
  addToApprovedSet,
  removeToken,
  getApprovedPhotos,
} from '@/lib/kv'
import type { Photo } from '@/lib/kv'

jest.mock('@vercel/kv', () => ({
  kv: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    zadd: jest.fn(),
    zrange: jest.fn(),
  },
}))

const mockKv = kv as jest.Mocked<typeof kv>

const photo: Photo = {
  id: 'test-id',
  guestName: 'Aishah',
  cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
  publicId: 'wedding/test',
  status: 'pending',
  token: 'test-token',
  uploadedAt: 1000000,
}

describe('savePhoto', () => {
  it('stores the photo JSON and token index', async () => {
    await savePhoto(photo)
    expect(mockKv.set).toHaveBeenCalledWith('photo:test-id', JSON.stringify(photo))
    expect(mockKv.set).toHaveBeenCalledWith('token:test-token', 'test-id')
  })
})

describe('getPhotoByToken', () => {
  it('returns null when token is not found', async () => {
    mockKv.get.mockResolvedValueOnce(null)
    const result = await getPhotoByToken('missing-token')
    expect(result).toBeNull()
  })

  it('returns null when photo is not found for token', async () => {
    mockKv.get.mockResolvedValueOnce('test-id')
    mockKv.get.mockResolvedValueOnce(null)
    const result = await getPhotoByToken('test-token')
    expect(result).toBeNull()
  })

  it('returns the photo when both token and photo exist', async () => {
    mockKv.get.mockResolvedValueOnce('test-id')
    mockKv.get.mockResolvedValueOnce(JSON.stringify(photo))
    const result = await getPhotoByToken('test-token')
    expect(result).toEqual(photo)
  })
})

describe('updatePhotoStatus', () => {
  it('saves updated photo with new status and returns it', async () => {
    const updated = await updatePhotoStatus(photo, 'approved')
    expect(updated.status).toBe('approved')
    expect(mockKv.set).toHaveBeenCalledWith(
      'photo:test-id',
      JSON.stringify({ ...photo, status: 'approved' })
    )
  })
})

describe('addToApprovedSet', () => {
  it('adds photo id to sorted set with uploadedAt as score', async () => {
    await addToApprovedSet(photo)
    expect(mockKv.zadd).toHaveBeenCalledWith('photos:approved', {
      score: 1000000,
      member: 'test-id',
    })
  })
})

describe('removeToken', () => {
  it('deletes the token key', async () => {
    await removeToken('test-token')
    expect(mockKv.del).toHaveBeenCalledWith('token:test-token')
  })
})

describe('getApprovedPhotos', () => {
  it('returns empty array when no approved photos', async () => {
    mockKv.zrange.mockResolvedValueOnce([])
    const result = await getApprovedPhotos()
    expect(result).toEqual([])
  })

  it('returns approved photos in order', async () => {
    mockKv.zrange.mockResolvedValueOnce(['test-id'])
    mockKv.get.mockResolvedValueOnce(JSON.stringify(photo))
    const result = await getApprovedPhotos()
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(photo)
  })

  it('skips ids whose photo data is missing', async () => {
    mockKv.zrange.mockResolvedValueOnce(['test-id', 'ghost-id'])
    mockKv.get.mockResolvedValueOnce(JSON.stringify(photo))
    mockKv.get.mockResolvedValueOnce(null)
    const result = await getApprovedPhotos()
    expect(result).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern="kv.test" --no-coverage
```

Expected: FAIL — `Cannot find module '@/lib/kv'`

- [ ] **Step 3: Create `lib/kv.ts`**

```ts
import { kv } from '@vercel/kv'

export type PhotoStatus = 'pending' | 'approved' | 'rejected'

export type Photo = {
  id: string
  guestName: string
  cloudinaryUrl: string
  publicId: string
  status: PhotoStatus
  token: string
  uploadedAt: number
}

export async function savePhoto(photo: Photo): Promise<void> {
  await kv.set(`photo:${photo.id}`, JSON.stringify(photo))
  await kv.set(`token:${photo.token}`, photo.id)
}

export async function getPhotoByToken(token: string): Promise<Photo | null> {
  const id = await kv.get<string>(`token:${token}`)
  if (!id) return null
  const raw = await kv.get<string>(`photo:${id}`)
  if (!raw) return null
  return JSON.parse(raw) as Photo
}

export async function updatePhotoStatus(photo: Photo, status: PhotoStatus): Promise<Photo> {
  const updated: Photo = { ...photo, status }
  await kv.set(`photo:${photo.id}`, JSON.stringify(updated))
  return updated
}

export async function addToApprovedSet(photo: Photo): Promise<void> {
  await kv.zadd('photos:approved', { score: photo.uploadedAt, member: photo.id })
}

export async function removeToken(token: string): Promise<void> {
  await kv.del(`token:${token}`)
}

export async function getApprovedPhotos(): Promise<Photo[]> {
  const ids = await kv.zrange<string[]>('photos:approved', 0, -1, { rev: true })
  if (!ids || ids.length === 0) return []
  const photos = await Promise.all(
    ids.map(async (id) => {
      const raw = await kv.get<string>(`photo:${id}`)
      return raw ? (JSON.parse(raw) as Photo) : null
    })
  )
  return photos.filter((p): p is Photo => p !== null)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="kv.test" --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/kv.ts __tests__/lib/kv.test.ts
git commit -m "feat: add KV photo helpers with tests"
```

---

## Task 4: Create `lib/cloudinary.ts`

**Files:**
- Create: `lib/cloudinary.ts`

> No unit tests for this file — it wraps the Cloudinary SDK directly. It will be mocked in API route tests.

- [ ] **Step 1: Create `lib/cloudinary.ts`**

```ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(
  buffer: Buffer,
  folder: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: 'image' }, (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'))
        resolve({ url: result.secure_url, publicId: result.public_id })
      })
      .end(buffer)
  })
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/cloudinary.ts
git commit -m "feat: add Cloudinary upload/delete helpers"
```

---

## Task 5: Create `lib/photo-email.ts`

**Files:**
- Create: `lib/photo-email.ts`

> No unit tests — Nodemailer is already tested in `__tests__/api/send-message.test.ts`. This module will be mocked in API route tests.

- [ ] **Step 1: Create `lib/photo-email.ts`**

```ts
import nodemailer from 'nodemailer'
import type { Photo } from '@/lib/kv'

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendApprovalEmail(photo: Photo, baseUrl: string): Promise<void> {
  const approveUrl = `${baseUrl}/api/photos/approve/${photo.token}`
  const rejectUrl = `${baseUrl}/api/photos/reject/${photo.token}`
  const date = new Date(photo.uploadedAt).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })

  const html = `
    <div style="font-family: sans-serif; max-width: 520px;">
      <p><strong>New photo from ${photo.guestName}</strong> &middot; ${date}</p>
      <img src="${photo.cloudinaryUrl}" alt="Guest photo" style="max-width:100%;border-radius:8px;margin:12px 0;" />
      <p>Approve to add it to the wedding memory wall.</p>
      <table><tr>
        <td style="padding-right:8px;">
          <a href="${approveUrl}" style="background:#7a9e87;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">✓ Approve</a>
        </td>
        <td>
          <a href="${rejectUrl}" style="background:#e8e4dc;color:#888;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">✕ Reject</a>
        </td>
      </tr></table>
    </div>
  `

  const transporter = createTransporter()
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: [process.env.EMAIL_HAZIM!, process.env.EMAIL_IDAYU!].join(', '),
    subject: `📸 New photo from ${photo.guestName} — approve?`,
    html,
    text: `New photo from ${photo.guestName}.\nApprove: ${approveUrl}\nReject: ${rejectUrl}`,
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/photo-email.ts
git commit -m "feat: add photo approval email helper"
```

---

## Task 6: Create `POST /api/photos/upload`

**Files:**
- Create: `app/api/photos/upload/route.ts`
- Create: `__tests__/api/photos-upload.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/api/photos-upload.test.ts`:

```ts
/**
 * @jest-environment node
 */
import { POST } from '@/app/api/photos/upload/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/cloudinary', () => ({
  uploadImage: jest.fn().mockResolvedValue({
    url: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
    publicId: 'wedding/test',
  }),
}))

jest.mock('@/lib/kv', () => ({
  savePhoto: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/photo-email', () => ({
  sendApprovalEmail: jest.fn().mockResolvedValue(undefined),
}))

function makeRequest(fields: Record<string, string | [Blob, string]>) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      formData.append(key, value[0], value[1])
    } else {
      formData.append(key, value)
    }
  }
  return new NextRequest('http://localhost/api/photos/upload', {
    method: 'POST',
    body: formData,
  })
}

function makeImageBlob(sizeBytes = 1000, type = 'image/jpeg'): Blob {
  return new Blob([new Uint8Array(sizeBytes)], { type })
}

describe('POST /api/photos/upload', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when name is missing', async () => {
    const req = makeRequest({ photo: [makeImageBlob(), 'test.jpg'] })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/name/i)
  })

  it('returns 400 when name is blank whitespace', async () => {
    const req = makeRequest({ name: '   ', photo: [makeImageBlob(), 'test.jpg'] })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when photo is missing', async () => {
    const req = makeRequest({ name: 'Aishah' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/photo/i)
  })

  it('returns 400 when file type is not an image', async () => {
    const pdfBlob = new Blob(['%PDF'], { type: 'application/pdf' })
    const req = makeRequest({ name: 'Aishah', photo: [pdfBlob, 'doc.pdf'] })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/image/i)
  })

  it('returns 400 when file exceeds 10MB', async () => {
    const bigBlob = makeImageBlob(11 * 1024 * 1024)
    const req = makeRequest({ name: 'Aishah', photo: [bigBlob, 'big.jpg'] })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/10MB/i)
  })

  it('returns 200 with success message on valid upload', async () => {
    const req = makeRequest({ name: 'Aishah', photo: [makeImageBlob(), 'photo.jpg'] })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.message).toMatch(/Aishah/)
  })

  it('calls uploadImage, savePhoto, and sendApprovalEmail on success', async () => {
    const { uploadImage } = jest.requireMock('@/lib/cloudinary')
    const { savePhoto } = jest.requireMock('@/lib/kv')
    const { sendApprovalEmail } = jest.requireMock('@/lib/photo-email')

    const req = makeRequest({ name: 'Aishah', photo: [makeImageBlob(), 'photo.jpg'] })
    await POST(req)

    expect(uploadImage).toHaveBeenCalledTimes(1)
    expect(savePhoto).toHaveBeenCalledTimes(1)
    expect(sendApprovalEmail).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern="photos-upload" --no-coverage
```

Expected: FAIL — `Cannot find module '@/app/api/photos/upload/route'`

- [ ] **Step 3: Create `app/api/photos/upload/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'
import { savePhoto } from '@/lib/kv'
import { sendApprovalEmail } from '@/lib/photo-email'
import type { Photo } from '@/lib/kv'

const MAX_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']

export async function POST(request: NextRequest) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const name = formData.get('name')
  const file = formData.get('photo') as File | null

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'Photo is required' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Please upload an image file.' }, { status: 400 })
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Photo must be under 10MB.' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const { url, publicId } = await uploadImage(buffer, 'wedding')

  const photo: Photo = {
    id: crypto.randomUUID(),
    guestName: name.trim(),
    cloudinaryUrl: url,
    publicId,
    status: 'pending',
    token: crypto.randomUUID(),
    uploadedAt: Date.now(),
  }

  await savePhoto(photo)

  const host = request.headers.get('host') ?? 'localhost'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`
  await sendApprovalEmail(photo, baseUrl)

  return NextResponse.json({ message: `Thanks ${photo.guestName}! Your photo is being reviewed.` })
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="photos-upload" --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/photos/upload/route.ts __tests__/api/photos-upload.test.ts
git commit -m "feat: add POST /api/photos/upload route with tests"
```

---

## Task 7: Create `GET /api/photos`

**Files:**
- Create: `app/api/photos/route.ts`
- Create: `__tests__/api/photos.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/api/photos.test.ts`:

```ts
/**
 * @jest-environment node
 */
import { GET } from '@/app/api/photos/route'
import type { Photo } from '@/lib/kv'

const approvedPhoto: Photo = {
  id: 'id-1',
  guestName: 'Aishah',
  cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
  publicId: 'wedding/test',
  status: 'approved',
  token: 'tok-1',
  uploadedAt: 1000000,
}

jest.mock('@/lib/kv', () => ({
  getApprovedPhotos: jest.fn(),
}))

describe('GET /api/photos', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 200 with empty photos array when none approved', async () => {
    const { getApprovedPhotos } = jest.requireMock('@/lib/kv')
    getApprovedPhotos.mockResolvedValue([])
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.photos).toEqual([])
  })

  it('returns approved photos', async () => {
    const { getApprovedPhotos } = jest.requireMock('@/lib/kv')
    getApprovedPhotos.mockResolvedValue([approvedPhoto])
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.photos).toHaveLength(1)
    expect(body.photos[0].guestName).toBe('Aishah')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern="photos.test" --no-coverage
```

Expected: FAIL — `Cannot find module '@/app/api/photos/route'`

- [ ] **Step 3: Create `app/api/photos/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { getApprovedPhotos } from '@/lib/kv'

export async function GET() {
  const photos = await getApprovedPhotos()
  return NextResponse.json({ photos })
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="photos.test" --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/photos/route.ts __tests__/api/photos.test.ts
git commit -m "feat: add GET /api/photos route with tests"
```

---

## Task 8: Create `GET /api/photos/approve/[token]`

**Files:**
- Create: `app/api/photos/approve/[token]/route.ts`
- Create: `__tests__/api/photos-approve.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/api/photos-approve.test.ts`:

```ts
/**
 * @jest-environment node
 */
import { GET } from '@/app/api/photos/approve/[token]/route'
import { NextRequest } from 'next/server'
import type { Photo } from '@/lib/kv'

jest.mock('@/lib/kv', () => ({
  getPhotoByToken: jest.fn(),
  updatePhotoStatus: jest.fn(),
  addToApprovedSet: jest.fn(),
  removeToken: jest.fn(),
}))

const pendingPhoto: Photo = {
  id: 'id-1',
  guestName: 'Aishah',
  cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
  publicId: 'wedding/test',
  status: 'pending',
  token: 'valid-token',
  uploadedAt: 1000000,
}

function makeCtx(token: string) {
  return { params: Promise.resolve({ token }) }
}

describe('GET /api/photos/approve/[token]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const { updatePhotoStatus } = jest.requireMock('@/lib/kv')
    updatePhotoStatus.mockImplementation((photo: Photo, status: string) =>
      Promise.resolve({ ...photo, status })
    )
  })

  it('returns 200 HTML with "already been used" when token not found', async () => {
    const { getPhotoByToken } = jest.requireMock('@/lib/kv')
    getPhotoByToken.mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/photos/approve/bad-token')
    const res = await GET(req, makeCtx('bad-token'))
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toMatch(/already been used/i)
  })

  it('returns 200 HTML with "already processed" when photo is not pending', async () => {
    const { getPhotoByToken } = jest.requireMock('@/lib/kv')
    getPhotoByToken.mockResolvedValue({ ...pendingPhoto, status: 'approved' })
    const req = new NextRequest('http://localhost/api/photos/approve/valid-token')
    const res = await GET(req, makeCtx('valid-token'))
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toMatch(/already processed/i)
  })

  it('approves photo, updates KV, and redirects to /approved', async () => {
    const { getPhotoByToken, updatePhotoStatus, addToApprovedSet, removeToken } =
      jest.requireMock('@/lib/kv')
    getPhotoByToken.mockResolvedValue(pendingPhoto)
    const req = new NextRequest('http://localhost/api/photos/approve/valid-token')
    const res = await GET(req, makeCtx('valid-token'))
    expect(updatePhotoStatus).toHaveBeenCalledWith(pendingPhoto, 'approved')
    expect(addToApprovedSet).toHaveBeenCalled()
    expect(removeToken).toHaveBeenCalledWith('valid-token')
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch(/\/approved/)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern="photos-approve" --no-coverage
```

Expected: FAIL — `Cannot find module '@/app/api/photos/approve/[token]/route'`

- [ ] **Step 3: Create `app/api/photos/approve/[token]/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getPhotoByToken, updatePhotoStatus, addToApprovedSet, removeToken } from '@/lib/kv'

export async function GET(request: NextRequest, ctx: RouteContext<'/api/photos/approve/[token]'>) {
  const { token } = await ctx.params

  const photo = await getPhotoByToken(token)
  if (!photo) {
    return new NextResponse('<p>This link has already been used or is invalid.</p>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  if (photo.status !== 'pending') {
    return new NextResponse('<p>This photo has already been processed.</p>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  await updatePhotoStatus(photo, 'approved')
  await addToApprovedSet(photo)
  await removeToken(token)

  return NextResponse.redirect(new URL('/approved', request.url))
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="photos-approve" --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add "app/api/photos/approve/[token]/route.ts" __tests__/api/photos-approve.test.ts
git commit -m "feat: add GET /api/photos/approve/[token] route with tests"
```

---

## Task 9: Create `GET /api/photos/reject/[token]`

**Files:**
- Create: `app/api/photos/reject/[token]/route.ts`
- Create: `__tests__/api/photos-reject.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/api/photos-reject.test.ts`:

```ts
/**
 * @jest-environment node
 */
import { GET } from '@/app/api/photos/reject/[token]/route'
import { NextRequest } from 'next/server'
import type { Photo } from '@/lib/kv'

jest.mock('@/lib/kv', () => ({
  getPhotoByToken: jest.fn(),
  updatePhotoStatus: jest.fn(),
  removeToken: jest.fn(),
}))

jest.mock('@/lib/cloudinary', () => ({
  deleteImage: jest.fn().mockResolvedValue(undefined),
}))

const pendingPhoto: Photo = {
  id: 'id-1',
  guestName: 'Aishah',
  cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
  publicId: 'wedding/test',
  status: 'pending',
  token: 'valid-token',
  uploadedAt: 1000000,
}

function makeCtx(token: string) {
  return { params: Promise.resolve({ token }) }
}

describe('GET /api/photos/reject/[token]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const { updatePhotoStatus } = jest.requireMock('@/lib/kv')
    updatePhotoStatus.mockImplementation((photo: Photo, status: string) =>
      Promise.resolve({ ...photo, status })
    )
  })

  it('returns 200 HTML with "already been used" when token not found', async () => {
    const { getPhotoByToken } = jest.requireMock('@/lib/kv')
    getPhotoByToken.mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/photos/reject/bad-token')
    const res = await GET(req, makeCtx('bad-token'))
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toMatch(/already been used/i)
  })

  it('returns 200 HTML with "already processed" when photo is not pending', async () => {
    const { getPhotoByToken } = jest.requireMock('@/lib/kv')
    getPhotoByToken.mockResolvedValue({ ...pendingPhoto, status: 'rejected' })
    const req = new NextRequest('http://localhost/api/photos/reject/valid-token')
    const res = await GET(req, makeCtx('valid-token'))
    expect(res.status).toBe(200)
    const text = await res.text()
    expect(text).toMatch(/already processed/i)
  })

  it('deletes image, updates status, removes token, and redirects to /rejected', async () => {
    const { getPhotoByToken, updatePhotoStatus, removeToken } = jest.requireMock('@/lib/kv')
    const { deleteImage } = jest.requireMock('@/lib/cloudinary')
    getPhotoByToken.mockResolvedValue(pendingPhoto)
    const req = new NextRequest('http://localhost/api/photos/reject/valid-token')
    const res = await GET(req, makeCtx('valid-token'))
    expect(deleteImage).toHaveBeenCalledWith('wedding/test')
    expect(updatePhotoStatus).toHaveBeenCalledWith(pendingPhoto, 'rejected')
    expect(removeToken).toHaveBeenCalledWith('valid-token')
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toMatch(/\/rejected/)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern="photos-reject" --no-coverage
```

Expected: FAIL — `Cannot find module '@/app/api/photos/reject/[token]/route'`

- [ ] **Step 3: Create `app/api/photos/reject/[token]/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getPhotoByToken, updatePhotoStatus, removeToken } from '@/lib/kv'
import { deleteImage } from '@/lib/cloudinary'

export async function GET(request: NextRequest, ctx: RouteContext<'/api/photos/reject/[token]'>) {
  const { token } = await ctx.params

  const photo = await getPhotoByToken(token)
  if (!photo) {
    return new NextResponse('<p>This link has already been used or is invalid.</p>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  if (photo.status !== 'pending') {
    return new NextResponse('<p>This photo has already been processed.</p>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  await deleteImage(photo.publicId)
  await updatePhotoStatus(photo, 'rejected')
  await removeToken(token)

  return NextResponse.redirect(new URL('/rejected', request.url))
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="photos-reject" --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add "app/api/photos/reject/[token]/route.ts" __tests__/api/photos-reject.test.ts
git commit -m "feat: add GET /api/photos/reject/[token] route with tests"
```

---

## Task 10: Create `components/MemoryWall.tsx`

**Files:**
- Create: `components/MemoryWall.tsx`
- Create: `__tests__/components/MemoryWall.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/MemoryWall.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
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

describe('MemoryWall', () => {
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
    const photos: Photo[] = [
      photo,
      { ...photo, id: 'id-2', guestName: 'Hafiz', token: 'tok-2' },
    ]
    render(<Wrapper photos={photos} />)
    expect(screen.getByAltText('Photo by Aishah')).toBeInTheDocument()
    expect(screen.getByAltText('Photo by Hafiz')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern="MemoryWall" --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/MemoryWall'`

- [ ] **Step 3: Create `components/MemoryWall.tsx`**

```tsx
'use client'

import { useTranslation } from '@/lib/language-context'
import type { Photo } from '@/lib/kv'

export default function MemoryWall({ photos }: { photos: Photo[] }) {
  const { t } = useTranslation()

  if (photos.length === 0) {
    return (
      <p className="font-sans text-[11px] text-gray-400 text-center py-6">
        {t.memories_empty}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="relative aspect-square rounded-lg overflow-hidden bg-stone-100"
        >
          <img
            src={photo.cloudinaryUrl}
            alt={`Photo by ${photo.guestName}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1">
            <p className="font-sans text-[9px] text-white truncate">{photo.guestName}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="MemoryWall" --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add components/MemoryWall.tsx __tests__/components/MemoryWall.test.tsx
git commit -m "feat: add MemoryWall component with tests"
```

---

## Task 11: Create `app/upload/page.tsx`

**Files:**
- Create: `app/upload/page.tsx`
- Create: `__tests__/app/upload.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/app/upload.test.tsx`:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider } from '@/lib/language-context'
import UploadPage from '@/app/upload/page'

global.fetch = jest.fn()

function Wrapper() {
  return (
    <LanguageProvider>
      <UploadPage />
    </LanguageProvider>
  )
}

describe('UploadPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Thanks Aishah! Your photo is being reviewed.' }),
    })
  })

  it('renders the name field and submit button', () => {
    render(<Wrapper />)
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /share photo/i })).toBeInTheDocument()
  })

  it('shows success message after successful upload', async () => {
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Aishah')

    const file = new File([new Uint8Array(100)], 'photo.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('photo-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    fireEvent.click(screen.getByRole('button', { name: /share photo/i }))
    await waitFor(() =>
      expect(screen.getByText(/your photo is being reviewed/i)).toBeInTheDocument()
    )
  })

  it('shows error message when name is blank', async () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByRole('button', { name: /share photo/i }))
    await waitFor(() =>
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    )
  })

  it('shows error message when no file is selected', async () => {
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Aishah')
    fireEvent.click(screen.getByRole('button', { name: /share photo/i }))
    await waitFor(() =>
      expect(screen.getByText(/photo is required/i)).toBeInTheDocument()
    )
  })

  it('shows error when file type is not an image', async () => {
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Aishah')
    const file = new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('photo-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: /share photo/i }))
    await waitFor(() =>
      expect(screen.getByText(/image file/i)).toBeInTheDocument()
    )
  })

  it('shows error when server returns error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Upload failed' }),
    })
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Aishah')
    const file = new File([new Uint8Array(100)], 'photo.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('photo-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: /share photo/i }))
    await waitFor(() =>
      expect(screen.getByText('Upload failed')).toBeInTheDocument()
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern="upload.test" --no-coverage
```

Expected: FAIL — `Cannot find module '@/app/upload/page'`

- [ ] **Step 3: Create `app/upload/page.tsx`**

```tsx
'use client'

import { useState, useRef } from 'react'
import { useTranslation } from '@/lib/language-context'
import BotanicalBackground from '@/components/BotanicalBackground'
import LanguageToggle from '@/components/LanguageToggle'

type UploadState = 'idle' | 'loading' | 'success' | 'error'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
const MAX_SIZE = 10 * 1024 * 1024

export default function UploadPage() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<UploadState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function validate(): string | null {
    if (!name.trim()) return 'Name is required'
    if (!file) return 'Photo is required'
    if (!ALLOWED_TYPES.includes(file.type)) return t.upload_error_type
    if (file.size > MAX_SIZE) return t.upload_error_size
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setErrorMessage(validationError)
      setState('error')
      return
    }

    setState('loading')
    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('photo', file!)

    try {
      const res = await fetch('/api/photos/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json()
        setErrorMessage(data.error ?? t.msg_error)
        setState('error')
      } else {
        setState('success')
      }
    } catch {
      setErrorMessage(t.msg_error)
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-8">
        <div className="text-center">
          <p className="font-serif text-[22px] text-sage italic">
            {t.upload_success.replace('{name}', name)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="relative bg-white px-7 pt-12 pb-7 text-center overflow-hidden">
        <BotanicalBackground intensity="light" />
        <LanguageToggle />
        <div className="relative z-10">
          <div className="font-script text-[40px] text-gold leading-tight">Hazim</div>
          <div className="font-serif text-[22px] text-gray-400 font-light my-0.5">&amp;</div>
          <div className="font-script text-[40px] text-gold leading-tight">Idayu</div>
          <div className="w-10 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-4" />
          <p className="font-script text-[22px] text-sage">{t.upload_title}</p>
        </div>
      </div>

      <div className="bg-cream px-6 py-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="font-sans text-[10px] tracking-[2px] text-sage uppercase block mb-1">
              {t.upload_name_placeholder}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.upload_name_placeholder}
              className="w-full border border-stone-200 rounded-lg px-4 py-3 font-sans text-[13px] text-gray-700 bg-white focus:outline-none focus:border-sage"
            />
          </div>

          <div className="mb-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center cursor-pointer hover:border-sage transition-colors"
            >
              {file ? (
                <p className="font-sans text-[12px] text-sage">{file.name}</p>
              ) : (
                <>
                  <p className="font-sans text-[24px] mb-2">📷</p>
                  <p className="font-sans text-[11px] text-gray-400">Tap to choose a photo</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              data-testid="photo-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {state === 'error' && (
            <p className="font-sans text-[11px] text-red-500 mb-3">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={state === 'loading'}
            className="w-full bg-sage text-white font-sans text-[11px] tracking-[2px] uppercase py-3 rounded-lg disabled:opacity-50"
          >
            {state === 'loading' ? '...' : t.upload_cta}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern="upload.test" --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/upload/page.tsx __tests__/app/upload.test.tsx
git commit -m "feat: add /upload page with tests"
```

---

## Task 12: Add MemoryWall to `/info` and create confirmation pages

**Files:**
- Modify: `app/info/page.tsx`
- Create: `app/approved/page.tsx`
- Create: `app/rejected/page.tsx`

- [ ] **Step 1: Create `app/approved/page.tsx`**

```tsx
export default function ApprovedPage() {
  return (
    <div className="bg-cream min-h-screen flex items-center justify-center px-8">
      <div className="text-center">
        <p className="font-serif text-[28px] text-sage italic mb-2">Photo approved</p>
        <p className="font-sans text-[11px] text-gray-400 tracking-wide">
          It will now appear on the memory wall.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/rejected/page.tsx`**

```tsx
export default function RejectedPage() {
  return (
    <div className="bg-cream min-h-screen flex items-center justify-center px-8">
      <div className="text-center">
        <p className="font-serif text-[28px] text-sage italic mb-2">Photo rejected</p>
        <p className="font-sans text-[11px] text-gray-400 tracking-wide">
          The photo has been removed.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Update `app/info/page.tsx` — add imports**

At the top of `app/info/page.tsx`, add these two imports after the existing imports:

```tsx
import MemoryWall from '@/components/MemoryWall'
import type { Photo } from '@/lib/kv'
```

- [ ] **Step 4: Update `app/info/page.tsx` — add photos state and fetch**

In the `InfoPage` component body, add a `photos` state and a `useEffect` to fetch them. Insert this after the existing `useState` line:

```tsx
const [photos, setPhotos] = useState<Photo[]>([])

useEffect(() => {
  fetch('/api/photos')
    .then((res) => res.json())
    .then((data) => setPhotos(data.photos ?? []))
    .catch(() => {})
}, [])
```

- [ ] **Step 5: Update `app/info/page.tsx` — insert MemoryWall section**

Insert a new section between the Playlist section and the Contact section:

```tsx
{/* Our Memories */}
<section className="px-6 py-5 border-b border-stone-100">
  <SectionTitle>{t.section_memories}</SectionTitle>
  <p className="font-sans text-[11px] text-gray-500 leading-6 mb-3">
    {t.memories_subtitle}
  </p>
  <MemoryWall photos={photos} />
</section>
```

- [ ] **Step 6: Run the full test suite**

```bash
npm test -- --no-coverage
```

Expected: all tests PASS. If any fail, fix the issue before committing.

- [ ] **Step 7: Commit**

```bash
git add app/info/page.tsx app/approved/page.tsx app/rejected/page.tsx
git commit -m "feat: wire MemoryWall into /info and add confirmation pages"
```

---

## Task 13: Add environment variables

**Files:** `.env.local` (not committed — manual step)

- [ ] **Step 1: Sign up for Cloudinary (free tier)**

Go to cloudinary.com, create a free account. Under **Dashboard**, copy:
- Cloud name → `CLOUDINARY_CLOUD_NAME`
- API Key → `CLOUDINARY_API_KEY`
- API Secret → `CLOUDINARY_API_SECRET`

- [ ] **Step 2: Set up Vercel KV**

In the Vercel dashboard → your project → Storage → Create KV database. Copy the environment variables shown (they start with `KV_`).

- [ ] **Step 3: Add to `.env.local`**

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

`NEXT_PUBLIC_BASE_URL` is used to build approve/reject links in emails. Set it to your production URL. In local dev, the code falls back to the request host.

- [ ] **Step 4: Verify dev server starts without errors**

```bash
npm run dev
```

Navigate to `http://localhost:3000/upload` and confirm the page renders.

---

## Task 14: Final verification

- [ ] **Step 1: Run the full test suite**

```bash
npm test -- --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 2: Build to check for TypeScript errors**

```bash
npm run build
```

Expected: build succeeds with no type errors. If you see `RouteContext` type errors, run `next typegen` first:

```bash
npx next typegen
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: photo upload wall complete"
```
