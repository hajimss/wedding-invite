import nodemailer from 'nodemailer'
import type { Rsvp } from '@/lib/kv'

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendRsvpEmail(rsvp: Rsvp): Promise<void> {
  const isAttending = rsvp.attendance === 'attending'
  const date = new Date(rsvp.submittedAt).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })

  const subject = isAttending
    ? `🎉 RSVP: ${rsvp.name} is coming (${rsvp.pax} pax)`
    : `😔 RSVP: ${rsvp.name} can't make it`

  const html = `
    <div style="font-family:sans-serif;max-width:520px;">
      <h2 style="margin:0 0 8px;">${isAttending ? '🎉' : '😔'} ${rsvp.name}</h2>
      <p><strong>Status:</strong> ${isAttending ? 'Attending' : 'Not attending'}</p>
      ${isAttending ? `<p><strong>Guests:</strong> ${rsvp.pax} pax</p>` : ''}
      ${!isAttending && rsvp.wish ? `<p><strong>Wish:</strong> &ldquo;${rsvp.wish}&rdquo;</p>` : ''}
      <p style="color:#999;font-size:12px;">${date}</p>
    </div>
  `

  const transporter = createTransporter()
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: [process.env.EMAIL_HAZIM!, process.env.EMAIL_IDAYU!].join(', '),
    subject,
    html,
    text: `${rsvp.name} — ${isAttending ? `Attending (${rsvp.pax} pax)` : 'Not attending'}${rsvp.wish ? ` — "${rsvp.wish}"` : ''}`,
  })
}
