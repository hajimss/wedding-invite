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
  story: string
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
  hero_scroll_cta: string
  section_itinerary: string
  itinerary_cta: string
  itinerary_back: string
  itinerary_page_label: string
  itinerary_page_title: string
  itinerary_page_sub: string
  itinerary_event_nikah: string
  itinerary_event_buffet: string
  itinerary_event_reception: string
  itinerary_event_cake: string
  itinerary_event_end: string
  itinerary_closing_quote: string
  section_playlist: string
  playlist_intro: string
  playlist_cta: string
  lang_label: string
  section_memories: string
  memories_subtitle: string
  memories_empty: string
  upload_title: string
  upload_name_placeholder: string
  upload_cta: string
  upload_success: string
  upload_error_size: string
  upload_error_type: string
  section_rsvp: string
  rsvp_subtitle: string
  section_calendar: string
  calendar_subtitle: string
  rsvp_cta: string
  rsvp_name_placeholder: string
  rsvp_attending: string
  rsvp_not_attending: string
  rsvp_pax_label: string
  rsvp_wish_label: string
  rsvp_wish_placeholder: string
  rsvp_submit_btn: string
  rsvp_success: string
  rsvp_error: string
  shuttle_label: string
  shuttle_body: string
  shuttle_link: string
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
  section_story: 'Our Message to You ❤️',
  story: 'We\'ve shared a journey that brought us here today, and we couldn\'t be more grateful. Having you with us as we celebrate this moment would make it even more meaningful.',
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
  hero_scroll_cta: '↓ scroll for details',
  section_itinerary: 'Itinerary',
  itinerary_cta: 'View Programme',
  itinerary_back: '← Back',
  itinerary_page_label: '06 June 2026 · Begonia Pavilion',
  itinerary_page_title: 'Programme',
  itinerary_page_sub: 'Wedding Session · 10.00am – 4.00pm',
  itinerary_event_nikah: 'Nikah Ceremony',
  itinerary_event_buffet: 'Buffet Commences',
  itinerary_event_reception: 'Arrival of Hazim & Idayu. Kompang Time!',
  itinerary_event_cake: 'Cake Cutting & Speeches',
  itinerary_event_end: 'End of Event',
  itinerary_closing_quote: 'We look forward to celebrating with you',
  section_playlist: 'Our Playlist',
  playlist_intro:
    'Add a song to our wedding playlist — open Spotify and contribute a track that means something to you.',
  playlist_cta: 'Open Playlist & Join as Collaborator →',
  lang_label: 'MY',
  section_memories: 'Our Memories',
  memories_subtitle: 'Photos shared by our guests',
  memories_empty: 'Be the first to share a memory',
  upload_title: 'Share a Memory',
  upload_name_placeholder: 'Your name',
  upload_cta: 'Share Photo',
  upload_success: 'Thanks {name}! Your photo is being reviewed.',
  upload_error_size: 'Photo must be under 10MB.',
  upload_error_type: 'Please upload an image file.',
  section_rsvp: 'RSVP',
  rsvp_subtitle: "Let us know if you'll be joining us on the big day.",
  section_calendar: 'Add to Calendar',
  calendar_subtitle: 'Add our wedding to your calendar so you get a reminder on the day.',
  rsvp_cta: 'RSVP Now',
  rsvp_name_placeholder: 'Your full name',
  rsvp_attending: "Yes, I'll be there",
  rsvp_not_attending: "Sorry, can't make it",
  rsvp_pax_label: 'How many people are coming? (including yourself)',
  rsvp_wish_label: 'Send a wish (optional)',
  rsvp_wish_placeholder: 'Wishing you both a beautiful day…',
  rsvp_submit_btn: 'Confirm RSVP',
  rsvp_success: "Thank you! We've noted your RSVP.",
  rsvp_error: 'Something went wrong. Please try again.',
  shuttle_label: 'Free Shuttle Bus',
  shuttle_body: 'Available from Pasir Ris MRT to the venue',
  shuttle_link: 'View shuttle info →',
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
  section_story: 'Mesej Kami untuk Anda ❤️',
  story: 'Perjalanan kami dipenuhi dengan cinta, gelak tawa, dan kenangan indah. Kini, apabila kami melangkah ke fasa seterusnya, kami sangat berbesar hati jika anda dapat bersama kami meraikan hari istimewa ini.',
  section_message: 'Hantar Mesej',
  section_contact: 'Hubungi Kami',
  venue_directions: 'Dapatkan Arahan →',
  msg_intro:
    'Tinggalkan ucapan peribadi untuk pengantin. Kami akan menerimanya terus ke inbox.',
  msg_name_label: 'Nama anda',
  msg_name_placeholder: 'contoh. Ahmad bin Yusof',
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
  hero_scroll_cta: '↓ lanjut ke bawah untuk butiran',
  section_itinerary: 'Jadual Aturcara',
  itinerary_cta: 'Lihat Aturcara',
  itinerary_back: '← Kembali',
  itinerary_page_label: '06 Jun 2026 · Begonia Pavilion',
  itinerary_page_title: 'Aturcara',
  itinerary_page_sub: 'Sesi Majlis · 10.00pg – 4.00ptg',
  itinerary_event_nikah: 'Majlis Akad Nikah',
  itinerary_event_buffet: 'Hidangan Buffet Dibuka',
  itinerary_event_reception: 'Ketibaan Hazim & Idayu. Kompang Time!',
  itinerary_event_cake: 'Potong Kek & Ucapan',
  itinerary_event_end: 'Majlis Tamat',
  itinerary_closing_quote: 'Kami menantikan kehadiran anda bersama kami',
  section_playlist: 'Senarai Lagu Kami',
  playlist_intro:
    'Tambah lagu ke senarai lagu perkahwinan kami — buka Spotify dan sertakan lagu yang bermakna bagi anda.',
  playlist_cta: 'Buka Senarai Lagu & Sertai sebagai Kolaborator →',
  lang_label: 'EN',
  section_memories: 'Kenangan Kami',
  memories_subtitle: 'Gambar yang dikongsi tetamu kami',
  memories_empty: 'Jadilah yang pertama berkongsi kenangan',
  upload_title: 'Kongsi Kenangan',
  upload_name_placeholder: 'Nama anda',
  upload_cta: 'Hantar Foto',
  upload_success: 'Terima kasih {name}! Foto anda sedang disemak.',
  upload_error_size: 'Foto mestilah kurang daripada 10MB.',
  upload_error_type: 'Sila muat naik fail imej.',
  section_rsvp: 'RSVP',
  rsvp_subtitle: 'Maklumkan kehadiran anda pada hari istimewa kami.',
  section_calendar: 'Tambah ke Kalendar',
  calendar_subtitle: 'Tambah majlis kami ke kalendar anda supaya anda ingat pada hari tersebut.',
  rsvp_cta: 'RSVP Sekarang',
  rsvp_name_placeholder: 'Nama penuh anda',
  rsvp_attending: 'Ya, saya akan hadir',
  rsvp_not_attending: 'Maaf, tidak dapat hadir',
  rsvp_pax_label: 'Berapa ramai yang akan hadir? (termasuk anda)',
  rsvp_wish_label: 'Hantar ucapan (pilihan)',
  rsvp_wish_placeholder: 'Semoga hari istimewa kalian dipenuhi keberkatan…',
  rsvp_submit_btn: 'Hantar RSVP',
  rsvp_success: 'Terima kasih! Kami telah mencatat RSVP anda.',
  rsvp_error: 'Ada masalah. Sila cuba lagi.',
  shuttle_label: 'Bas Ulang-Alik Percuma',
  shuttle_body: 'Tersedia dari MRT Pasir Ris ke lokasi',
  shuttle_link: 'Lihat maklumat bas →',
}

export const translations: Record<Lang, T> = { en, my }
