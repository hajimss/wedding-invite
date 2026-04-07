import { NextResponse } from 'next/server'
import { getApprovedPhotos } from '@/lib/kv'

export async function GET() {
  try {
    const photos = await getApprovedPhotos()
    return NextResponse.json({ photos })
  } catch (err) {
    console.error('[GET /api/photos]', err)
    return NextResponse.json({ error: String(err), photos: [] }, { status: 500 })
  }
}
