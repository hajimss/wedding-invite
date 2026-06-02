import { PHOTO_LIST } from '@/lib/config'

describe('PHOTO_LIST', () => {
  const flatItems = PHOTO_LIST.flatMap(g => g.items)

  it('has 31 total checkable items', () => {
    expect(flatItems).toHaveLength(31)
  })

  it('every group has a valid category', () => {
    const valid = ['bride', 'groom', 'both']
    PHOTO_LIST.forEach(group => {
      expect(valid).toContain(group.category)
    })
  })

  it('every item is a non-empty string', () => {
    flatItems.forEach(item => {
      expect(typeof item).toBe('string')
      expect(item.trim().length).toBeGreaterThan(0)
    })
  })
})
