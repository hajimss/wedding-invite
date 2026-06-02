// Update all values below before deploying

export const VENUE = {
  name: 'Begonia Pavilion',
  address: '1 Pasir Ris Cl, Singapore 519599',
  // Get embed URL from Google Maps → Share → Embed a map → copy src value
  googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.666914089104!2d103.95401!3d1.3765304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da3db427a54c63%3A0xf0ba63dc0775b721!2sBegonia%20Pavilion!5e0!3m2!1sen!2ssg!4v1775230705260!5m2!1sen!2ssg',
  // Get directions URL from Google Maps → Share → Copy link
  googleMapsUrl: 'https://maps.app.goo.gl/pjeHNTvDtJJqwbJX9',
}

export const CONTACTS = {
  hazim: { phone: '+65 97221283', initial: 'H' },
  idayu: { phone: '+65 96548356', initial: 'I' },
}

export const STORY =
  'We\'ve shared a journey that brought us here today, and we couldn\'t be more grateful. Having you with us as we celebrate this moment would make it even more meaningful.'

export const SPOTIFY_PLAYLIST = {
  url: 'https://open.spotify.com/playlist/0soLSTkWnbj8aYnB71n2Cf?si=L1pNWIqOSHOFWwHbV0HQyQ&pt=3de0ceaf98360273fac0195daa785c17&pi=cUWWJ7fFTbSV4',
  embedUrl: 'https://open.spotify.com/embed/playlist/0soLSTkWnbj8aYnB71n2Cf?utm_source=generator',
}

export const PHOTO_WALL = {
  folder: 'wedding',
}

export const WEDDING_EVENT = {
  title: 'Hazim & Idayu Wedding',
  date: '20260606',     // YYYYMMDD — all-day ICS/Google Calendar format
  dateEnd: '20260607',  // exclusive end date (required by both formats)
  location: 'Begonia Pavilion, 1 Pasir Ris Cl, Singapore 519599',
  description: 'Join us as we celebrate our wedding day.',
}

export type PhotoGroup = {
  section?: string
  category: 'bride' | 'groom' | 'both'
  items: string[]
}

export const PHOTO_LIST: PhotoGroup[] = [
  { items: ['Grand Photo: Burhan and Sulaiman Family'], category: 'both' },
  {
    section: 'Idayu — Bride Side',
    category: 'bride',
    items: [
      'Burhan and Family',
      'Paklong and Family',
      'Nenek and Wan (both on wheelchair)',
      'Cik Roha and Family',
      'Keluarga dari Melaka',
      'Keluarga dari KL',
      'Keluarga dari Johor',
    ],
  },
  {
    section: 'Hazim — Groom Side',
    category: 'groom',
    items: [
      'Sulaiman and Family',
      'Keluarga besar Nemat',
      'Keluarga besar Mohamad Ali',
    ],
  },
  {
    section: 'Idayu — Bride Side 2nd Round',
    category: 'bride',
    items: [
      'fbaybeh',
      'shireen, hada, syafiqah and su',
      'wecreate studio (colleagues)',
    ],
  },
  {
    section: 'Hazim — Groom Side 2nd Round',
    category: 'groom',
    items: [
      'Pasir ris sec friends',
      'Mechanications',
      'Fly my kite friends',
      'DAH geng',
      'iCHAMP and change team',
    ],
  },
  { items: ['Cake Cutting'], category: 'both' },
  { items: ["Hazim's Speech"], category: 'groom' },
  { items: ["Idayu's Speech"], category: 'bride' },
  { items: ["Du'a Selamat by Idayu's Pak Long"], category: 'bride' },
  {
    section: 'After Cake/Speech',
    category: 'both',
    items: [
      'Taka/JL friends',
      'Cik Safura and Family',
      'Kakak Cute and Family',
      'Chinese Family',
      'Hi-5 Gang',
      '+any adhoc',
    ],
  },
  { items: ['Hazim & Idayu to walk around and mingle w the guests'], category: 'both' },
  { items: ['Tamat'], category: 'both' },
]
