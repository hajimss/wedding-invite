/**
 * @jest-environment node
 */
import { POST } from '@/app/api/photos/upload/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/cloudinary', () => ({
  uploadImage: jest.fn().mockResolvedValue({
    url: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
    publicId: 'wedding/test',
  }),
}))

jest.mock('@/lib/kv', () => ({
  savePhoto: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/photo-email', () => ({
  sendApprovalEmail: jest.fn().mockResolvedValue(undefined),
}))

function makeRequest(fields: Record<string, string | [Blob, string]>) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      formData.append(key, value[0], value[1])
    } else {
      formData.append(key, value)
    }
  }
  return new NextRequest('http://localhost/api/photos/upload', {
    method: 'POST',
    body: formData,
  })
}

function makeImageBlob(sizeBytes = 1000, type = 'image/jpeg'): Blob {
  return new Blob([new Uint8Array(sizeBytes)], { type })
}

describe('POST /api/photos/upload', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when name is missing', async () => {
    const req = makeRequest({ photo: [makeImageBlob(), 'test.jpg'] })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/name/i)
  })

  it('returns 400 when name is blank whitespace', async () => {
    const req = makeRequest({ name: '   ', photo: [makeImageBlob(), 'test.jpg'] })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when photo is missing', async () => {
    const req = makeRequest({ name: 'Aishah' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/photo/i)
  })

  it('returns 400 when file type is not an image', async () => {
    const pdfBlob = new Blob(['%PDF'], { type: 'application/pdf' })
    const req = makeRequest({ name: 'Aishah', photo: [pdfBlob, 'doc.pdf'] })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/image/i)
  })

  it('returns 400 when file exceeds 10MB', async () => {
    const bigBlob = makeImageBlob(11 * 1024 * 1024)
    const req = makeRequest({ name: 'Aishah', photo: [bigBlob, 'big.jpg'] })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/10MB/i)
  })

  it('returns 200 with success message on valid upload', async () => {
    const req = makeRequest({ name: 'Aishah', photo: [makeImageBlob(), 'photo.jpg'] })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.message).toMatch(/Aishah/)
  })

  it('calls uploadImage, savePhoto, and sendApprovalEmail on success', async () => {
    const { uploadImage } = jest.requireMock('@/lib/cloudinary')
    const { savePhoto } = jest.requireMock('@/lib/kv')
    const { sendApprovalEmail } = jest.requireMock('@/lib/photo-email')

    const req = makeRequest({ name: 'Aishah', photo: [makeImageBlob(), 'photo.jpg'] })
    await POST(req)

    expect(uploadImage).toHaveBeenCalledTimes(1)
    expect(savePhoto).toHaveBeenCalledTimes(1)
    expect(sendApprovalEmail).toHaveBeenCalledTimes(1)
  })
})
