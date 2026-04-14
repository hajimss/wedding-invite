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
    window.location.href = '/api/calendar'
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
