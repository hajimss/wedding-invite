import { NextResponse } from 'next/server'
import { WEDDING_EVENT } from '@/lib/config'

export function GET() {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hazim & Idayu Wedding//EN',
    'BEGIN:VEVENT',
    'UID:wedding-hazim-idayu-20260606@hazimidayu.com',
    `DTSTART;VALUE=DATE:${WEDDING_EVENT.date}`,
    `DTEND;VALUE=DATE:${WEDDING_EVENT.dateEnd}`,
    `SUMMARY:${WEDDING_EVENT.title}`,
    `LOCATION:${WEDDING_EVENT.location}`,
    `DESCRIPTION:${WEDDING_EVENT.description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n') + '\r\n'

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="wedding-hazim-idayu.ics"',
    },
  })
}
