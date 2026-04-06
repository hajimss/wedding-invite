import { NextRequest, NextResponse } from 'next/server'
import { getPhotoByToken, updatePhotoStatus, removeToken } from '@/lib/kv'
import { deleteImage } from '@/lib/cloudinary'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const photo = await getPhotoByToken(token)
  if (!photo) {
    return new NextResponse('<p>This link has already been used or is invalid.</p>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  if (photo.status !== 'pending') {
    return new NextResponse('<p>This photo has already processed.</p>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  await deleteImage(photo.publicId)
  await updatePhotoStatus(photo, 'rejected')
  await removeToken(token)

  return NextResponse.redirect(new URL('/rejected', request.url))
}
