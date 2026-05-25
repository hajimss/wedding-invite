'use client'

import { useTranslation } from '@/lib/language-context'
import Link from 'next/link'

function LangToggle() {
  const { lang, toggleLang } = useTranslation()
  return (
    <button
      onClick={toggleLang}
      className="border border-sage px-2.5 py-1 rounded-full font-sans text-[11px] tracking-[2px] text-sage transition-colors hover:bg-sage/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
      aria-label={`Switch to ${lang === 'en' ? 'Malay' : 'English'}`}
    >
      <span className={lang === 'en' ? 'font-medium' : 'opacity-40'}>EN</span>
      <span className="opacity-40"> · </span>
      <span className={lang === 'my' ? 'font-medium' : 'opacity-40'}>MY</span>
    </button>
  )
}

type DotVariant = 'major' | 'minor'

function TimelineItem({
  time,
  title,
  sub,
  dot = 'minor',
}: {
  time: string
  title: string
  sub?: string
  dot?: DotVariant
}) {
  return (
    <div className="relative mb-6 last:mb-0">
      <div
        className={`absolute -left-[39px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
          dot === 'major'
            ? 'bg-gold border-gold shadow-[0_0_0_4px_rgba(201,168,76,0.13)]'
            : 'bg-cream border-gold shadow-[0_0_0_3px_rgba(201,168,76,0.1)]'
        }`}
      />
      <p className="font-sans text-[9px] tracking-[2px] uppercase text-gold mb-0.5">{time}</p>
      <p className="font-serif text-[13px] text-gray-800 leading-snug">{title}</p>
      {sub && <p className="font-sans text-[10px] text-gray-400 mt-0.5 leading-relaxed">{sub}</p>}
    </div>
  )
}

export default function ItineraryPage() {
  const { t } = useTranslation()

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white px-6 py-8 flex flex-col items-center text-center">
        {/* Top bar: back link left, lang toggle right */}
        <div className="w-full flex items-center justify-between mb-6">
          <Link
            href="/"
            className="font-sans text-[10px] tracking-[2px] uppercase text-sage transition-opacity hover:opacity-70"
          >
            {t.itinerary_back}
          </Link>
          <LangToggle />
        </div>

        <p className="font-sans text-[8px] tracking-[5px] uppercase text-sage mb-1.5">
          {t.itinerary_page_label}
        </p>
        <h1 className="font-script text-[48px] text-gold leading-none mb-2">
          {t.itinerary_page_title}
        </h1>
        <p className="font-sans text-[9px] tracking-[3px] uppercase text-gray-400">
          {t.itinerary_page_sub}
        </p>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mt-6" />
      </div>

      {/* Timeline */}
      <div className="bg-cream px-6 py-8">
        <div className="relative pl-[52px]">
          {/* Connecting line */}
          <div className="absolute left-5 top-1.5 bottom-1.5 w-px bg-gradient-to-b from-stone-200 via-stone-200 to-transparent" />

          <TimelineItem time="10.00am" title={t.itinerary_event_nikah} dot="major" />
          <TimelineItem time="11.00am" title={t.itinerary_event_buffet} />
          <TimelineItem
            time="12.30pm"
            title={t.itinerary_event_reception}
            sub={t.itinerary_event_reception_sub}
            dot="major"
          />
          <TimelineItem time="2.15pm" title={t.itinerary_event_cake} />
          <TimelineItem time="3.45pm" title={t.itinerary_event_end} />
        </div>

        <div className="-mx-6 h-px bg-stone-100 mt-8 mb-6" />

        <p className="font-serif text-[13px] text-gray-400 italic text-center leading-relaxed">
          &ldquo;{t.itinerary_closing_quote}&rdquo;
        </p>
      </div>
    </div>
  )
}
