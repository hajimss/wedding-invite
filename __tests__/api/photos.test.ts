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
