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
