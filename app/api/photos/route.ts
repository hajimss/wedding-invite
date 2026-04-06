import { NextResponse } from 'next/server'
import { getApprovedPhotos } from '@/lib/kv'

export async function GET() {
  const photos = await getApprovedPhotos()
  return NextResponse.json({ photos })
}
