import { TIMESLOTS } from '@/lib/guest-type'
import type { GuestType } from '@/lib/guest-type'

interface TimeslotBadgeProps {
  guestType: GuestType
  arrivalLabel: string
  dateLabel: string
}

export default function TimeslotBadge({
  guestType,
  arrivalLabel,
  dateLabel,
}: TimeslotBadgeProps) {
  return (
    <div className="inline-flex flex-col items-center bg-sage text-white rounded-2xl px-7 py-3.5">
      <span className="font-sans text-[9px] tracking-[3px] uppercase opacity-85 mb-1">
        {arrivalLabel}
      </span>
      <span className="font-serif text-[40px] font-light leading-none">
        {TIMESLOTS[guestType]}
      </span>
      <span className="font-sans text-[10px] tracking-[2px] opacity-80 mt-1">{dateLabel}</span>
    </div>
  )
}
