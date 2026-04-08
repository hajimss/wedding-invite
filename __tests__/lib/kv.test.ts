/**
 * @jest-environment node
 */
import { kv } from '@vercel/kv'
import {
  savePhoto,
  getPhotoByToken,
  updatePhotoStatus,
  addToApprovedSet,
  removeToken,
  getApprovedPhotos,
  saveRsvp,
  getAllRsvps,
} from '@/lib/kv'
import type { Photo, Rsvp } from '@/lib/kv'

jest.mock('@vercel/kv', () => ({
  kv: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    zadd: jest.fn(),
    zrange: jest.fn(),
  },
}))

const mockKv = kv as jest.Mocked<typeof kv>

const photo: Photo = {
  id: 'test-id',
  guestName: 'Aishah',
  cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
  publicId: 'wedding/test',
  status: 'pending',
  token: 'test-token',
  uploadedAt: 1000000,
}

describe('savePhoto', () => {
  it('stores the photo JSON and token index', async () => {
    await savePhoto(photo)
    expect(mockKv.set).toHaveBeenCalledWith('photo:test-id', JSON.stringify(photo))
    expect(mockKv.set).toHaveBeenCalledWith('token:test-token', 'test-id')
  })
})

describe('getPhotoByToken', () => {
  it('returns null when token is not found', async () => {
    mockKv.get.mockResolvedValueOnce(null)
    const result = await getPhotoByToken('missing-token')
    expect(result).toBeNull()
  })

  it('returns null when photo is not found for token', async () => {
    mockKv.get.mockResolvedValueOnce('test-id')
    mockKv.get.mockResolvedValueOnce(null)
    const result = await getPhotoByToken('test-token')
    expect(result).toBeNull()
  })

  it('returns the photo when both token and photo exist', async () => {
    mockKv.get.mockResolvedValueOnce('test-id')
    mockKv.get.mockResolvedValueOnce(JSON.stringify(photo))
    const result = await getPhotoByToken('test-token')
    expect(result).toEqual(photo)
  })
})

describe('updatePhotoStatus', () => {
  it('saves updated photo with new status and returns it', async () => {
    const updated = await updatePhotoStatus(photo, 'approved')
    expect(updated.status).toBe('approved')
    expect(mockKv.set).toHaveBeenCalledWith(
      'photo:test-id',
      JSON.stringify({ ...photo, status: 'approved' })
    )
  })
})

describe('addToApprovedSet', () => {
  it('adds photo id to sorted set with uploadedAt as score', async () => {
    await addToApprovedSet(photo)
    expect(mockKv.zadd).toHaveBeenCalledWith('photos:approved', {
      score: 1000000,
      member: 'test-id',
    })
  })
})

describe('removeToken', () => {
  it('deletes the token key', async () => {
    await removeToken('test-token')
    expect(mockKv.del).toHaveBeenCalledWith('token:test-token')
  })
})

describe('getApprovedPhotos', () => {
  it('returns empty array when no approved photos', async () => {
    mockKv.zrange.mockResolvedValueOnce([])
    const result = await getApprovedPhotos()
    expect(result).toEqual([])
  })

  it('returns approved photos in order', async () => {
    mockKv.zrange.mockResolvedValueOnce(['test-id'])
    mockKv.get.mockResolvedValueOnce(JSON.stringify(photo))
    const result = await getApprovedPhotos()
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(photo)
  })

  it('skips ids whose photo data is missing', async () => {
    mockKv.zrange.mockResolvedValueOnce(['test-id', 'ghost-id'])
    mockKv.get.mockResolvedValueOnce(JSON.stringify(photo))
    mockKv.get.mockResolvedValueOnce(null)
    const result = await getApprovedPhotos()
    expect(result).toHaveLength(1)
  })
})

const rsvp: Rsvp = {
  id: 'rsvp-id-1',
  name: 'Ahmad',
  attendance: 'attending',
  pax: 2,
  wish: '',
  submittedAt: 2000000,
}

describe('saveRsvp', () => {
  it('stores the RSVP object and adds to sorted set', async () => {
    mockKv.set.mockResolvedValueOnce('OK' as never)
    mockKv.zadd.mockResolvedValueOnce(1 as never)
    await saveRsvp(rsvp)
    expect(mockKv.set).toHaveBeenCalledWith('rsvp:rsvp-id-1', rsvp)
    expect(mockKv.zadd).toHaveBeenCalledWith('rsvps:all', { score: 2000000, member: 'rsvp-id-1' })
  })
})

describe('getAllRsvps', () => {
  it('returns empty array when no RSVPs exist', async () => {
    mockKv.zrange.mockResolvedValueOnce([])
    const result = await getAllRsvps()
    expect(result).toEqual([])
  })

  it('returns RSVPs in reverse chronological order', async () => {
    mockKv.zrange.mockResolvedValueOnce(['rsvp-id-1'])
    mockKv.get.mockResolvedValueOnce(rsvp)
    const result = await getAllRsvps()
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(rsvp)
  })

  it('skips ids whose RSVP data is missing from KV', async () => {
    mockKv.zrange.mockResolvedValueOnce(['rsvp-id-1', 'ghost-id'])
    mockKv.get.mockResolvedValueOnce(rsvp)
    mockKv.get.mockResolvedValueOnce(null)
    const result = await getAllRsvps()
    expect(result).toHaveLength(1)
  })
})
