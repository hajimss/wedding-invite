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
