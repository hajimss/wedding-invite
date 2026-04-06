export type GuestType = 'family' | 'friends-parents' | 'friends-couple'

export const GUEST_TYPE_KEY = 'wedding-guest-type'

export const TIMESLOTS: Record<GuestType, string> = {
  family: '10:00 AM',
  'friends-parents': '11:00 PM',
  'friends-couple': '12:00 PM',
}

export function isValidGuestType(value: string | null): value is GuestType {
  return (
    value === 'family' ||
    value === 'friends-parents' ||
    value === 'friends-couple'
  )
}

export function saveGuestType(type: GuestType): void {
  try {
    localStorage.setItem(GUEST_TYPE_KEY, type)
  } catch {}
}

export function loadGuestType(): GuestType | null {
  try {
    const value = localStorage.getItem(GUEST_TYPE_KEY)
    return isValidGuestType(value) ? value : null
  } catch {
    return null
  }
}

export function clearGuestType(): void {
  try {
    localStorage.removeItem(GUEST_TYPE_KEY)
  } catch {}
}
