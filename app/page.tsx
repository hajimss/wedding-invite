'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from '@/lib/language-context'
import { VENUE, CONTACTS } from '@/lib/config'
import BotanicalBackground from '@/components/BotanicalBackground'
import LanguageToggle from '@/components/LanguageToggle'
import MessageForm from '@/components/MessageForm'
import SpotifyPlaylist from '@/components/SpotifyPlaylist'
import MemoryWall from '@/components/MemoryWall'
import AddToCalendar from '@/components/AddToCalendar'
import type { Photo } from '@/lib/kv'

export default function HomePage() {
  const { t } = useTranslation()
  const [photos, setPhotos] = useState<Photo[]>([])

  useEffect(() => {
    fetch('/api/photos')
      .then((res) => res.json())
      .then((data) => setPhotos(data.photos ?? []))
      .catch(() => {})
  }, [])

  return (
    <div className="bg-white min-h-screen">
      {/* Hero zone */}
      <div className="relative bg-white px-6 py-10 min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        <BotanicalBackground intensity="full" />
        {/* Centre spotlight — lifts names off the botanical layer */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_70%_60%_at_50%_47%,white_25%,transparent_78%)]" />
        <LanguageToggle />

        <div className="relative z-10 w-full">
          {/* Editorial ceremony label with flanking hairlines */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-px bg-sage/25" />
            <p className="font-sans text-[9px] tracking-[5px] text-sage uppercase whitespace-nowrap">
              {t.hero_ceremony_label}
            </p>
            <div className="flex-1 h-px bg-sage/25" />
          </div>
          <p className="font-sans text-[9px] tracking-[4px] text-gray-400 uppercase mb-10">
            {t.hero_ceremony_sub}
          </p>

          <div className="font-script text-[74px] text-gold leading-[1.05]">Hazim</div>
          <div className="font-serif text-[26px] text-gold/30 font-light mt-1 mb-3">&amp;</div>
          <div className="font-script text-[74px] text-gold leading-[1.05]">Idayu</div>

          {/* Full-bleed architectural rule */}
          <div className="-mx-6 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent my-7" />

          <div className="inline-flex flex-col items-center mb-10">
            <p className="font-sans text-[14px] tracking-[5px] text-gray-700 uppercase mb-1.5">
              06 June 2026
            </p>
            <p className="font-sans text-[9px] tracking-[3px] text-gray-400 uppercase mb-5">
              20 Zulhijjah 1447
            </p>
            <p className="font-sans text-[42px] font-light text-gold leading-none tracking-[6px]">
              11AM – 4PM
            </p>
          </div>

          <p className="font-sans text-[10px] tracking-[3px] text-gray-400 uppercase motion-safe:animate-bounce">
            {t.hero_scroll_cta}
          </p>
        </div>
      </div>

      {/* Info sections */}
      <div className="bg-cream">
        {/* Venue */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_venue}</SectionTitle>
          <h2 className="font-serif text-[22px] text-gray-800 mb-1">{VENUE.name}</h2>
          <p className="font-sans text-[11px] text-gray-500 leading-6 mb-3 whitespace-pre-line">
            {VENUE.address}
          </p>
          <div className="rounded-xl overflow-hidden h-36 mb-2 bg-stone-100">
            <iframe
              src={VENUE.googleMapsEmbed}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Venue map"
            />
          </div>
          <p className="font-serif text-[10px] lowercase text-gray-500 italic mb-2">
            &ldquo;sorry there&rsquo;s no free parking but i promise you it&rsquo;s cheap&rdquo; — hazim
          </p>
          <a
            href={VENUE.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[10px] tracking-[2px] text-sage uppercase border-b border-sage/40 pb-0.5 transition-opacity hover:opacity-70"
          >
            {t.venue_directions}
          </a>
        </section>

        {/* Our Story */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_story}</SectionTitle>
          <p className="font-serif text-[15px] text-gray-600 italic leading-7">&ldquo;{t.story}&rdquo;</p>
        </section>

        {/* RSVP */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_rsvp}</SectionTitle>
          <p className="font-sans text-[11px] text-gray-500 leading-6 mb-3">
            {t.rsvp_subtitle}
          </p>
          <a
            href="/rsvp"
            className="inline-block w-full text-center bg-sage text-white font-sans text-[11px] tracking-[3px] uppercase py-3 rounded-xl transition-opacity hover:opacity-90"
          >
            {t.rsvp_cta} →
          </a>
        </section>

        {/* Add to Calendar */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_calendar}</SectionTitle>
          <p className="font-sans text-[11px] text-gray-500 leading-6 mb-3">{t.calendar_subtitle}</p>
          <AddToCalendar />
        </section>

        {/* Send a Message */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_message}</SectionTitle>
          <MessageForm />
        </section>

        {/* Itinerary */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_itinerary}</SectionTitle>
          <div className="flex flex-col items-center text-center py-5 gap-3">
            <div className="w-8 h-8 rounded-full border border-gold/40 flex items-center justify-center text-gold/60 text-[15px]">
              ◷
            </div>
            <p className="font-serif text-[15px] text-gray-700 italic">{t.itinerary_coming_soon}</p>
            <p className="font-sans text-[10px] tracking-[0.5px] text-gray-400 leading-5 max-w-xs">
              {t.itinerary_coming_soon_sub}
            </p>
          </div>
        </section>

        {/* Playlist */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_playlist}</SectionTitle>
          <SpotifyPlaylist />
        </section>

        {/* Our Memories */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_memories}</SectionTitle>
          <p className="font-sans text-[11px] text-gray-500 leading-6 mb-3">
            {t.memories_subtitle}
          </p>
          <MemoryWall photos={photos} />
          <a
            href="/upload"
            className="inline-block mt-3 font-sans text-[10px] tracking-[2px] text-sage uppercase border-b border-sage/40 pb-0.5 transition-opacity hover:opacity-70"
          >
            {t.upload_cta} →
          </a>
        </section>

        {/* Contact */}
        <section className="px-6 py-5">
          <SectionTitle>{t.section_contact}</SectionTitle>
          <ContactRow
            initial="H"
            gradient="from-sage to-[#5a8a6a]"
            name="Hazim"
            role={t.contact_groom_role}
            phone={CONTACTS.hazim.phone}
          />
          <ContactRow
            initial="I"
            gradient="from-gold to-[#a8873e]"
            name="Idayu"
            role={t.contact_bride_role}
            phone={CONTACTS.idayu.phone}
          />
        </section>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="font-sans text-[9px] tracking-[3px] text-sage uppercase whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-stone-200" />
    </div>
  )
}

function ContactRow({
  initial,
  gradient,
  name,
  role,
  phone,
}: {
  initial: string
  gradient: string
  name: string
  role: string
  phone: string
}) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div
        className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-script text-[20px] text-white flex-shrink-0`}
      >
        {initial}
      </div>
      <div>
        <p className="font-sans text-[13px] text-gray-800">{name}</p>
        <p className="font-sans text-[10px] text-gray-400 tracking-wide mt-0.5">{role}</p>
        <a href={`tel:${phone}`} className="font-sans font-light text-[12px] text-sage mt-0.5 transition-opacity hover:opacity-70">{phone}</a>
      </div>
    </div>
  )
}
