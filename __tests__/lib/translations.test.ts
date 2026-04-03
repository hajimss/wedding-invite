import { translations } from '@/lib/translations'
import type { T } from '@/lib/translations'

const REQUIRED_KEYS: (keyof T)[] = [
  'hero_ceremony_label', 'hero_ceremony_sub', 'hero_cta', 'hero_cta_sub',
  'q1_question', 'q1_sub', 'q1_family', 'q1_family_sub', 'q1_friends', 'q1_friends_sub',
  'q2_question', 'q2_sub', 'q2_couple', 'q2_couple_sub', 'q2_parents', 'q2_parents_sub',
  'q_back', 'q_step',
  'info_greeting_family', 'info_greeting_friends', 'info_change',
  'info_arrival_label', 'info_date',
  'section_venue', 'section_story', 'section_message', 'section_contact',
  'venue_directions',
  'msg_intro', 'msg_name_label', 'msg_name_placeholder', 'msg_send_to',
  'msg_recipient_hazim', 'msg_recipient_hazim_role',
  'msg_recipient_idayu', 'msg_recipient_idayu_role',
  'msg_recipient_both', 'msg_recipient_both_sub',
  'msg_message_label', 'msg_message_placeholder',
  'msg_send_btn', 'msg_success_title', 'msg_success_sub', 'msg_error',
  'contact_groom_role', 'contact_bride_role', 'lang_label',
]

describe('EN translations', () => {
  REQUIRED_KEYS.forEach(key => {
    it(`has key: ${key}`, () => expect(translations.en[key]).toBeDefined())
  })
  it('q_step formats correctly', () => {
    expect(translations.en.q_step(1, 2)).toBe('Step 1 of 2')
  })
})

describe('MY translations', () => {
  REQUIRED_KEYS.forEach(key => {
    it(`has key: ${key}`, () => expect(translations.my[key]).toBeDefined())
  })
  it('q_step formats correctly', () => {
    expect(translations.my.q_step(1, 2)).toBe('Langkah 1 daripada 2')
  })
})
