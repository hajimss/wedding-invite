'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadGuestType, clearGuestType } from '@/lib/guest-type'
import { useTranslation } from '@/lib/language-context'
import { VENUE, CONTACTS, STORY } from '@/lib/config'
import BotanicalBackground from '@/components/BotanicalBackground'
import LanguageToggle from '@/components/LanguageToggle'
import TimeslotBadge from '@/components/TimeslotBadge'
import MessageForm from '@/components/MessageForm'
import SpotifyPlaylist from '@/components/SpotifyPlaylist'
import type { GuestType } from '@/lib/guest-type'

export default function InfoPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [guestType, setGuestType] = useState<GuestType | null>(null)

  useEffect(() => {
    const type = loadGuestType()
    if (!type) {
      router.replace('/questionnaire')
      return
    }
    setGuestType(type)
  }, [router])

  function handleChange() {
    clearGuestType()
    router.push('/questionnaire')
  }

  if (!guestType) return null

  const greeting =
    guestType === 'family' ? t.info_greeting_family : t.info_greeting_friends

  return (
    <div className="bg-white min-h-screen">
      {/* Hero strip */}
      <div className="relative bg-white px-7 pt-12 pb-7 text-center overflow-hidden">
        <BotanicalBackground intensity="light" />
        <LanguageToggle />
        <button
          onClick={handleChange}
          className="absolute top-5 right-6 z-10 font-sans text-[10px] tracking-wide text-gray-400"
        >
          {t.info_change}
        </button>

        <div className="relative z-10">
          <p className="font-sans text-[10px] tracking-[3px] text-sage uppercase mb-2">{greeting}</p>
          <div className="font-script text-[40px] text-gold leading-tight">Hazim</div>
          <div className="font-serif text-[22px] text-gray-400 font-light my-0.5">&amp;</div>
          <div className="font-script text-[40px] text-gold leading-tight">Idayu</div>
          <div className="w-10 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-4" />
          <TimeslotBadge
            guestType={guestType}
            arrivalLabel={t.info_arrival_label}
            dateLabel={t.info_date}
          />
        </div>
      </div>

      {/* Sections */}
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
          <a
            href={VENUE.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[10px] tracking-[2px] text-sage uppercase border-b border-sage/40 pb-0.5"
          >
            {t.venue_directions}
          </a>
        </section>

        {/* Our Story */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_story}</SectionTitle>
          <p className="font-serif text-[15px] text-gray-600 italic leading-7">"{STORY}"</p>
        </section>

        {/* Send a Message */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_message}</SectionTitle>
          <MessageForm />
        </section>

        {/* Playlist */}
        <section className="px-6 py-5 border-b border-stone-100">
          <SectionTitle>{t.section_playlist}</SectionTitle>
          <SpotifyPlaylist />
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
        <p className="font-sans font-light text-[12px] text-sage mt-0.5">{phone}</p>
      </div>
    </div>
  )
}
