'use client'

import { WEDDING_EVENT } from '@/lib/config'

export default function AddToCalendar() {
  function handleGoogle() {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: WEDDING_EVENT.title,
      dates: `${WEDDING_EVENT.date}/${WEDDING_EVENT.dateEnd}`,
      details: WEDDING_EVENT.description,
      location: WEDDING_EVENT.location,
    })
    window.open(`https://calendar.google.com/calendar/render?${params}`, '_blank', 'noopener,noreferrer')
  }

  function handleApple() {
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

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    if (isIOS) {
      // Data URI lets the OS intercept and open Calendar regardless of browser
      window.location.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics)
    } else {
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'wedding-hazim-idayu.ics'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 gap-y-2 mt-3">
      <button
        onClick={handleGoogle}
        className="font-sans text-[10px] tracking-[2px] text-sage uppercase border border-sage/40 rounded px-3 py-1.5"
      >
        Google Calendar
      </button>
      <button
        onClick={handleApple}
        className="font-sans text-[10px] tracking-[2px] text-sage uppercase border border-sage/40 rounded px-3 py-1.5"
      >
        Apple Calendar
      </button>
    </div>
  )
}
