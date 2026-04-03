/**
 * @jest-environment node
 */
import { POST } from '@/app/api/send-message/route'
import { NextRequest } from 'next/server'
import nodemailer from 'nodemailer'

jest.mock('nodemailer')

const mockSendMail = jest.fn().mockResolvedValue({})
;(nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: mockSendMail })

function req(body: object) {
  return new NextRequest('http://localhost/api/send-message', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/send-message', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.SMTP_HOST = 'smtp.test.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_USER = 'test@test.com'
    process.env.SMTP_PASS = 'password'
    process.env.EMAIL_HAZIM = 'hazim@test.com'
    process.env.EMAIL_IDAYU = 'idayu@test.com'
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: mockSendMail })
  })

  it('returns 400 when name is missing', async () => {
    const res = await POST(req({ recipient: 'both', message: 'Hi' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when message is missing', async () => {
    const res = await POST(req({ name: 'Ali', recipient: 'both' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when name is blank whitespace', async () => {
    const res = await POST(req({ name: '   ', recipient: 'both', message: 'Hi' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid recipient', async () => {
    const res = await POST(req({ name: 'Ali', recipient: 'nobody', message: 'Hi' }))
    expect(res.status).toBe(400)
  })

  it('sends one email to hazim for recipient "hazim"', async () => {
    const res = await POST(req({ name: 'Ali', recipient: 'hazim', message: 'Hi' }))
    expect(res.status).toBe(200)
    expect(mockSendMail).toHaveBeenCalledTimes(1)
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'hazim@test.com' })
    )
  })

  it('sends one email to idayu for recipient "idayu"', async () => {
    const res = await POST(req({ name: 'Ali', recipient: 'idayu', message: 'Hi' }))
    expect(res.status).toBe(200)
    expect(mockSendMail).toHaveBeenCalledTimes(1)
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'idayu@test.com' })
    )
  })

  it('sends two separate emails for recipient "both"', async () => {
    const res = await POST(req({ name: 'Ali', recipient: 'both', message: 'Hi' }))
    expect(res.status).toBe(200)
    expect(mockSendMail).toHaveBeenCalledTimes(2)
  })

  it('uses sender name in email subject', async () => {
    await POST(req({ name: 'Ahmad', recipient: 'hazim', message: 'Congrats!' }))
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "A message from Ahmad — Hazim & Idayu's Wedding",
      })
    )
  })

  it('returns 500 when sendMail throws', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('SMTP error'))
    const res = await POST(req({ name: 'Ali', recipient: 'hazim', message: 'Hi' }))
    expect(res.status).toBe(500)
  })
})
