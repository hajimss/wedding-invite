/**
 * @jest-environment node
 */
import { POST, GET } from '@/app/api/rsvp/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/kv', () => ({
  saveRsvp: jest.fn().mockResolvedValue(undefined),
  getAllRsvps: jest.fn().mockResolvedValue([]),
}))

jest.mock('@/lib/rsvp-email', () => ({
  sendRsvpEmail: jest.fn().mockResolvedValue(undefined),
}))

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/rsvp', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when name is missing', async () => {
    const res = await POST(makeRequest({ attendance: 'attending', pax: 2 }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/name/i)
  })

  it('returns 400 when name is blank whitespace', async () => {
    const res = await POST(makeRequest({ name: '   ', attendance: 'attending', pax: 2 }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when attendance is invalid', async () => {
    const res = await POST(makeRequest({ name: 'Ahmad', attendance: 'maybe' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/attendance/i)
  })

  it('returns 400 when attending but pax is less than 1', async () => {
    const res = await POST(makeRequest({ name: 'Ahmad', attendance: 'attending', pax: 0 }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/pax/i)
  })

  it('returns 200 and saves RSVP when attending with valid pax', async () => {
    const res = await POST(makeRequest({ name: 'Ahmad', attendance: 'attending', pax: 3 }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.message).toMatch(/Ahmad/)
    const { saveRsvp } = jest.requireMock('@/lib/kv')
    expect(saveRsvp).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Ahmad', attendance: 'attending', pax: 3 })
    )
  })

  it('returns 200 and sets pax to 0 when not attending', async () => {
    const res = await POST(makeRequest({ name: 'Siti', attendance: 'not-attending', wish: 'Best wishes!' }))
    expect(res.status).toBe(200)
    const { saveRsvp } = jest.requireMock('@/lib/kv')
    expect(saveRsvp).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Siti', attendance: 'not-attending', pax: 0, wish: 'Best wishes!' })
    )
  })

  it('calls sendRsvpEmail on every successful submission', async () => {
    await POST(makeRequest({ name: 'Ahmad', attendance: 'attending', pax: 2 }))
    const { sendRsvpEmail } = jest.requireMock('@/lib/rsvp-email')
    expect(sendRsvpEmail).toHaveBeenCalledTimes(1)
  })
})

describe('GET /api/rsvp', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns empty summary when no RSVPs', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.rsvps).toHaveLength(0)
    expect(body.summary).toEqual({ total: 0, attending: 0, notAttending: 0, totalPax: 0 })
  })

  it('returns correct summary when RSVPs exist', async () => {
    const { getAllRsvps } = jest.requireMock('@/lib/kv')
    getAllRsvps.mockResolvedValueOnce([
      { id: '1', name: 'Ahmad', attendance: 'attending', pax: 3, wish: '', submittedAt: 1000 },
      { id: '2', name: 'Siti', attendance: 'not-attending', pax: 0, wish: 'Best wishes!', submittedAt: 2000 },
    ])
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.rsvps).toHaveLength(2)
    expect(body.summary).toEqual({ total: 2, attending: 1, notAttending: 1, totalPax: 3 })
  })
})
