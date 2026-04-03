export type Lang = 'en' | 'my'

export type T = {
  hero_ceremony_label: string
  hero_ceremony_sub: string
  hero_cta: string
  hero_cta_sub: string
  q1_question: string
  q1_sub: string
  q1_family: string
  q1_family_sub: string
  q1_friends: string
  q1_friends_sub: string
  q2_question: string
  q2_sub: string
  q2_couple: string
  q2_couple_sub: string
  q2_parents: string
  q2_parents_sub: string
  q_back: string
  q_step: (current: number, total: number) => string
  info_greeting_family: string
  info_greeting_friends: string
  info_change: string
  info_arrival_label: string
  info_date: string
  section_venue: string
  section_story: string
  section_message: string
  section_contact: string
  venue_directions: string
  msg_intro: string
  msg_name_label: string
  msg_name_placeholder: string
  msg_send_to: string
  msg_recipient_hazim: string
  msg_recipient_hazim_role: string
  msg_recipient_idayu: string
  msg_recipient_idayu_role: string
  msg_recipient_both: string
  msg_recipient_both_sub: string
  msg_message_label: string
  msg_message_placeholder: string
  msg_send_btn: string
  msg_success_title: string
  msg_success_sub: string
  msg_error: string
  contact_groom_role: string
  contact_bride_role: string
  lang_label: string
}

const en: T = {
  hero_ceremony_label: 'Walimatul Urus',
  hero_ceremony_sub: 'Wedding Ceremony',
  hero_cta: 'View My Invitation',
  hero_cta_sub: 'Tap to see your details',
  q1_question: 'You are joining us as...',
  q1_sub: 'Please select one to continue',
  q1_family: 'Family',
  q1_family_sub: 'Keluarga',
  q1_friends: 'Friends',
  q1_friends_sub: 'Rakan-rakan',
  q2_question: 'You are friends of...',
  q2_sub: 'Please select one to continue',
  q2_couple: 'Hazim & Idayu',
  q2_couple_sub: 'The Bride & Groom',
  q2_parents: 'Their Parents',
  q2_parents_sub: 'Ibu bapa pengantin',
  q_back: '← Back',
  q_step: (current, total) => `Step ${current} of ${total}`,
  info_greeting_family: 'Welcome, Family',
  info_greeting_friends: 'Welcome, Friends',
  info_change: 'Change ↩',
  info_arrival_label: 'Your arrival time',
  info_date: 'Saturday · 06 June 2026',
  section_venue: 'Venue',
  section_story: 'Our Story',
  section_message: 'Send a Message',
  section_contact: 'Contact',
  venue_directions: 'Get Directions →',
  msg_intro:
    "Leave a personal wish for the bride, groom, or both. We'll receive it straight to our inbox.",
  msg_name_label: 'Your name',
  msg_name_placeholder: 'e.g. Ahmad bin Yusof',
  msg_send_to: 'Send to',
  msg_recipient_hazim: 'Hazim',
  msg_recipient_hazim_role: 'Groom',
  msg_recipient_idayu: 'Idayu',
  msg_recipient_idayu_role: 'Bride',
  msg_recipient_both: 'Both',
  msg_recipient_both_sub: 'of us',
  msg_message_label: 'Your message',
  msg_message_placeholder: 'Write your wishes here...',
  msg_send_btn: 'Send Wishes',
  msg_success_title: 'Message Sent',
  msg_success_sub: 'Thank you for your wishes',
  msg_error: 'Something went wrong. Please try again.',
  contact_groom_role: 'Groom · Pengantin Lelaki',
  contact_bride_role: 'Bride · Pengantin Perempuan',
  lang_label: 'MY',
}

const my: T = {
  hero_ceremony_label: 'Walimatul Urus',
  hero_ceremony_sub: 'Majlis Perkahwinan',
  hero_cta: 'Lihat Jemputan Saya',
  hero_cta_sub: 'Ketik untuk melihat butiran anda',
  q1_question: 'Anda hadir sebagai...',
  q1_sub: 'Sila pilih satu untuk meneruskan',
  q1_family: 'Keluarga',
  q1_family_sub: 'Family',
  q1_friends: 'Rakan-rakan',
  q1_friends_sub: 'Friends',
  q2_question: 'Anda rakan kepada...',
  q2_sub: 'Sila pilih satu untuk meneruskan',
  q2_couple: 'Hazim & Idayu',
  q2_couple_sub: 'Pengantin',
  q2_parents: 'Ibu Bapa Mereka',
  q2_parents_sub: 'Ibu bapa pengantin',
  q_back: '← Kembali',
  q_step: (current, total) => `Langkah ${current} daripada ${total}`,
  info_greeting_family: 'Selamat datang, Keluarga',
  info_greeting_friends: 'Selamat datang, Rakan',
  info_change: 'Tukar ↩',
  info_arrival_label: 'Masa ketibaan anda',
  info_date: 'Sabtu · 06 Jun 2026',
  section_venue: 'Lokasi',
  section_story: 'Kisah Kami',
  section_message: 'Hantar Mesej',
  section_contact: 'Hubungi Kami',
  venue_directions: 'Dapatkan Arah →',
  msg_intro:
    'Tinggalkan ucapan peribadi untuk pengantin. Kami akan menerimanya terus ke peti masuk kami.',
  msg_name_label: 'Nama anda',
  msg_name_placeholder: 'cth. Ahmad bin Yusof',
  msg_send_to: 'Hantar kepada',
  msg_recipient_hazim: 'Hazim',
  msg_recipient_hazim_role: 'Pengantin Lelaki',
  msg_recipient_idayu: 'Idayu',
  msg_recipient_idayu_role: 'Pengantin Perempuan',
  msg_recipient_both: 'Kedua-dua',
  msg_recipient_both_sub: 'pengantin',
  msg_message_label: 'Mesej anda',
  msg_message_placeholder: 'Tulis ucapan anda di sini...',
  msg_send_btn: 'Hantar Ucapan',
  msg_success_title: 'Mesej Dihantar',
  msg_success_sub: 'Terima kasih atas ucapan anda',
  msg_error: 'Ralat berlaku. Sila cuba lagi.',
  contact_groom_role: 'Pengantin Lelaki · Groom',
  contact_bride_role: 'Pengantin Perempuan · Bride',
  lang_label: 'EN',
}

export const translations: Record<Lang, T> = { en, my }
