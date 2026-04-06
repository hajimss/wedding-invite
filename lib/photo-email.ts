import nodemailer from 'nodemailer'
import type { Photo } from '@/lib/kv'

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

export async function sendApprovalEmail(photo: Photo, baseUrl: string): Promise<void> {
  const approveUrl = `${baseUrl}/api/photos/approve/${photo.token}`
  const rejectUrl = `${baseUrl}/api/photos/reject/${photo.token}`
  const date = new Date(photo.uploadedAt).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })

  const html = `
    <div style="font-family: sans-serif; max-width: 520px;">
      <p><strong>New photo from ${photo.guestName}</strong> &middot; ${date}</p>
      <img src="${photo.cloudinaryUrl}" alt="Guest photo" style="max-width:100%;border-radius:8px;margin:12px 0;" />
      <p>Approve to add it to the wedding memory wall.</p>
      <table><tr>
        <td style="padding-right:8px;">
          <a href="${approveUrl}" style="background:#7a9e87;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">✓ Approve</a>
        </td>
        <td>
          <a href="${rejectUrl}" style="background:#e8e4dc;color:#888;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">✕ Reject</a>
        </td>
      </tr></table>
    </div>
  `

  const transporter = createTransporter()
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: [process.env.EMAIL_HAZIM!, process.env.EMAIL_IDAYU!].join(', '),
    subject: `📸 New photo from ${photo.guestName} — approve?`,
    html,
    text: `New photo from ${photo.guestName}.\nApprove: ${approveUrl}\nReject: ${rejectUrl}`,
  })
}
