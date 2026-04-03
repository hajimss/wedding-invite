'use client'

import { useRouter } from 'next/navigation'
import { loadGuestType } from '@/lib/guest-type'
import { useTranslation } from '@/lib/language-context'
import BotanicalBackground from '@/components/BotanicalBackground'
import LanguageToggle from '@/components/LanguageToggle'

export default function HeroPage() {
  const router = useRouter()
  const { t } = useTranslation()

  function handleCta() {
    const guestType = loadGuestType()
    router.push(guestType ? '/info' : '/questionnaire')
  }

  return (
    <main className="relative min-h-screen bg-white flex flex-col items-center justify-center overflow-hidden">
      <BotanicalBackground intensity="full" />
      <LanguageToggle />

      <div className="relative z-10 text-center px-8 py-10">
        <p className="font-sans text-[10px] tracking-[5px] text-sage uppercase mb-1">
          {t.hero_ceremony_label}
        </p>
        <p className="font-sans text-[9px] tracking-[4px] text-gray-400 uppercase mb-8">
          {t.hero_ceremony_sub}
        </p>

        <div className="font-script text-[53px] text-gold leading-tight">Hazim</div>
        <div className="font-serif text-[22px] text-gray-400 font-light my-1">&amp;</div>
        <div className="font-script text-[53px] text-gold leading-tight">Idayu</div>

        <div className="w-14 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-5" />

        <p className="font-sans text-[10px] tracking-[4px] text-gray-600 uppercase mb-1">
          06 June 2026
        </p>
        <p className="font-sans text-[10px] tracking-[3px] text-gray-400 uppercase mb-9">
          20 Zulhijjah 1447
        </p>

        <button
          onClick={handleCta}
          className="bg-sage text-white font-sans text-[10px] tracking-[3px] uppercase px-7 py-3 rounded-full"
        >
          {t.hero_cta}
        </button>
        <p className="font-sans text-[10px] text-gray-300 mt-3 tracking-wide">
          {t.hero_cta_sub}
        </p>
      </div>
    </main>
  )
}
