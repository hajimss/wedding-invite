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
  await kv.set(`photo:${photo.id}`, photo)
  await kv.set(`token:${photo.token}`, photo.id)
}

export async function getPhotoByToken(token: string): Promise<Photo | null> {
  const id = await kv.get<string>(`token:${token}`)
  if (!id) return null
  const photo = await kv.get<Photo>(`photo:${id}`)
  return photo ?? null
}

export async function updatePhotoStatus(photo: Photo, status: PhotoStatus): Promise<Photo> {
  const updated: Photo = { ...photo, status }
  await kv.set(`photo:${photo.id}`, updated)
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
      const photo = await kv.get<Photo>(`photo:${id}`)
      return photo ?? null
    })
  )
  return photos.filter((p): p is Photo => p !== null)
}

// ── RSVP ──────────────────────────────────────────────────────────────────────

export type RsvpAttendance = 'attending' | 'not-attending'

export type Rsvp = {
  id: string
  name: string
  attendance: RsvpAttendance
  pax: number        // 0 when not attending
  wish: string       // empty string when attending
  submittedAt: number
}

export async function saveRsvp(rsvp: Rsvp): Promise<void> {
  await kv.set(`rsvp:${rsvp.id}`, rsvp)
  await kv.zadd('rsvps:all', { score: rsvp.submittedAt, member: rsvp.id })
}

export async function getAllRsvps(): Promise<Rsvp[]> {
  const ids = await kv.zrange<string[]>('rsvps:all', 0, -1, { rev: true })
  if (!ids || ids.length === 0) return []
  const rsvps = await Promise.all(
    ids.map(async (id) => {
      const rsvp = await kv.get<Rsvp>(`rsvp:${id}`)
      return rsvp ?? null
    })
  )
  return rsvps.filter((r): r is Rsvp => r !== null)
}
