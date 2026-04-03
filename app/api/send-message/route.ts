import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

type Recipient = 'hazim' | 'idayu' | 'both'

function isValidRecipient(value: unknown): value is Recipient {
  return value === 'hazim' || value === 'idayu' || value === 'both'
}

export async function POST(request: NextRequest) {
  let body: { name?: unknown; recipient?: unknown; message?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, recipient, message } = body

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }
  if (!isValidRecipient(recipient)) {
    return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 })
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const subject = `A message from ${name.trim()} — Hazim & Idayu's Wedding`
  const html = `<p><strong>From:</strong> ${name.trim()}</p><p>${message
    .trim()
    .replace(/\n/g, '<br>')}</p>`

  const addresses: string[] = []
  if (recipient === 'hazim' || recipient === 'both') {
    addresses.push(process.env.EMAIL_HAZIM!)
  }
  if (recipient === 'idayu' || recipient === 'both') {
    addresses.push(process.env.EMAIL_IDAYU!)
  }

  try {
    for (const to of addresses) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        html,
      })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
