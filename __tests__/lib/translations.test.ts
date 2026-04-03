import { translations } from '@/lib/translations'
import type { T } from '@/lib/translations'

const REQUIRED_KEYS = Object.keys(translations.en) as (keyof T)[]

describe('EN translations', () => {
  REQUIRED_KEYS.forEach(key => {
    it(`has key: ${key}`, () => {
      if (key === 'q_step') {
        expect(translations.en[key]).toBeDefined()
      } else {
        expect(translations.en[key]).toBeTruthy()
      }
    })
  })
  it('q_step formats correctly', () => {
    expect(translations.en.q_step(1, 2)).toBe('Step 1 of 2')
  })
})

describe('MY translations', () => {
  REQUIRED_KEYS.forEach(key => {
    it(`has key: ${key}`, () => {
      if (key === 'q_step') {
        expect(translations.my[key]).toBeDefined()
      } else {
        expect(translations.my[key]).toBeTruthy()
      }
    })
  })
  it('q_step formats correctly', () => {
    expect(translations.my.q_step(1, 2)).toBe('Langkah 1 daripada 2')
  })
})
