import { NextRequest, NextResponse } from 'next/server'
import { getPhotoByToken, updatePhotoStatus, addToApprovedSet, removeToken } from '@/lib/kv'

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

  try {
    await updatePhotoStatus(photo, 'approved')
    await addToApprovedSet(photo)
    await removeToken(token)
  } catch (err) {
    console.error('[approve token]', err)
    return new NextResponse(`<p>Error approving photo: ${String(err)}</p>`, {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  return NextResponse.redirect(new URL('/approved', request.url))
}
