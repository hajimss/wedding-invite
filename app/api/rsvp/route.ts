import { NextRequest, NextResponse } from 'next/server'
import { saveRsvp, getAllRsvps } from '@/lib/kv'
import { sendRsvpEmail } from '@/lib/rsvp-email'
import type { Rsvp, RsvpAttendance } from '@/lib/kv'

function isValidAttendance(v: unknown): v is RsvpAttendance {
  return v === 'attending' || v === 'not-attending'
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, attendance, pax, wish } = body

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (!isValidAttendance(attendance)) {
    return NextResponse.json({ error: 'Attendance must be attending or not-attending' }, { status: 400 })
  }
  if (attendance === 'attending' && (!Number.isInteger(pax) || (pax as number) < 1)) {
    return NextResponse.json({ error: 'Pax must be at least 1' }, { status: 400 })
  }

  const rsvp: Rsvp = {
    id: crypto.randomUUID(),
    name: name.trim(),
    attendance,
    pax: attendance === 'attending' ? (pax as number) : 0,
    wish: typeof wish === 'string' ? wish.trim() : '',
    submittedAt: Date.now(),
  }

  try {
    await saveRsvp(rsvp)
    await sendRsvpEmail(rsvp)
    return NextResponse.json({ message: `Thank you, ${rsvp.name}!` })
  } catch (err) {
    console.error('[POST /api/rsvp]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const rsvps = await getAllRsvps()
    const attending = rsvps.filter((r) => r.attendance === 'attending')
    const notAttending = rsvps.filter((r) => r.attendance === 'not-attending')
    const totalPax = attending.reduce((sum, r) => sum + r.pax, 0)
    return NextResponse.json({
      rsvps,
      summary: {
        total: rsvps.length,
        attending: attending.length,
        notAttending: notAttending.length,
        totalPax,
      },
    })
  } catch (err) {
    console.error('[GET /api/rsvp]', err)
    return NextResponse.json(
      { error: 'Something went wrong.', rsvps: [], summary: { total: 0, attending: 0, notAttending: 0, totalPax: 0 } },
      { status: 500 }
    )
  }
}
