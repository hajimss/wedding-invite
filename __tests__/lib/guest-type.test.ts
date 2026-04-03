import {
  isValidGuestType,
  saveGuestType,
  loadGuestType,
  clearGuestType,
  TIMESLOTS,
} from '@/lib/guest-type'

describe('isValidGuestType', () => {
  it('returns true for valid types', () => {
    expect(isValidGuestType('family')).toBe(true)
    expect(isValidGuestType('friends-parents')).toBe(true)
    expect(isValidGuestType('friends-couple')).toBe(true)
  })
  it('returns false for invalid values', () => {
    expect(isValidGuestType(null)).toBe(false)
    expect(isValidGuestType('unknown')).toBe(false)
    expect(isValidGuestType('')).toBe(false)
  })
})

describe('localStorage helpers', () => {
  beforeEach(() => localStorage.clear())

  it('saves and loads guest type', () => {
    saveGuestType('family')
    expect(loadGuestType()).toBe('family')
  })
  it('returns null when nothing is stored', () => {
    expect(loadGuestType()).toBeNull()
  })
  it('clears the stored guest type', () => {
    saveGuestType('friends-couple')
    clearGuestType()
    expect(loadGuestType()).toBeNull()
  })
})

describe('localStorage error paths', () => {
  afterEach(() => jest.restoreAllMocks())

  it('saveGuestType does not throw when localStorage.setItem throws', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('storage error') })
    expect(() => saveGuestType('family')).not.toThrow()
  })

  it('loadGuestType returns null when localStorage.getItem throws', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('storage error') })
    expect(loadGuestType()).toBeNull()
  })

  it('clearGuestType does not throw when localStorage.removeItem throws', () => {
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('storage error') })
    expect(() => clearGuestType()).not.toThrow()
  })
})

describe('TIMESLOTS', () => {
  it('maps family to 10:00 AM', () => expect(TIMESLOTS.family).toBe('10:00 AM'))
  it('maps friends-parents to 12:00 PM', () => expect(TIMESLOTS['friends-parents']).toBe('12:00 PM'))
  it('maps friends-couple to 1:00 PM', () => expect(TIMESLOTS['friends-couple']).toBe('1:00 PM'))
})
