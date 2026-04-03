'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveGuestType } from '@/lib/guest-type'
import { useTranslation } from '@/lib/language-context'
import BotanicalBackground from '@/components/BotanicalBackground'
import LanguageToggle from '@/components/LanguageToggle'

export default function QuestionnairePage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [step, setStep] = useState<1 | 2>(1)

  function handleFamily() {
    saveGuestType('family')
    router.push('/info')
  }

  function handleFriendsCouple() {
    saveGuestType('friends-couple')
    router.push('/info')
  }

  function handleFriendsParents() {
    saveGuestType('friends-parents')
    router.push('/info')
  }

  return (
    <main className="relative min-h-screen bg-white flex flex-col items-center justify-center overflow-hidden px-7 py-12">
      <BotanicalBackground intensity="light" />
      <LanguageToggle />

      {step === 2 && (
        <button
          onClick={() => setStep(1)}
          className="absolute top-5 right-6 z-10 font-sans text-[10px] tracking-wide text-gray-400"
        >
          {t.q_back}
        </button>
      )}

      <div className="relative z-10 w-full max-w-sm text-center">
        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center mb-6">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${step === 1 ? 'bg-sage' : 'bg-gray-200'}`} />
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${step === 2 ? 'bg-sage' : 'bg-gray-200'}`} />
        </div>

        <p className="font-sans text-[8px] tracking-[3px] text-sage uppercase mb-2">
          {t.q_step(step, 2)}
        </p>

        {step === 1 ? (
          <>
            <h1 className="font-serif text-2xl text-gray-800 font-light mb-2">{t.q1_question}</h1>
            <p className="font-sans text-[9px] text-gray-400 tracking-wide mb-5">{t.q1_sub}</p>
            <div className="w-10 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-7" />
            <ChoiceButton title={t.q1_family} sub={t.q1_family_sub} onClick={handleFamily} />
            <ChoiceButton title={t.q1_friends} sub={t.q1_friends_sub} onClick={() => setStep(2)} />
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl text-gray-800 font-light mb-2">{t.q2_question}</h1>
            <p className="font-sans text-[9px] text-gray-400 tracking-wide mb-5">{t.q2_sub}</p>
            <div className="w-10 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-7" />
            <ChoiceButton title={t.q2_couple} sub={t.q2_couple_sub} onClick={handleFriendsCouple} />
            <ChoiceButton title={t.q2_parents} sub={t.q2_parents_sub} onClick={handleFriendsParents} />
          </>
        )}
      </div>
    </main>
  )
}

function ChoiceButton({
  title,
  sub,
  onClick,
}: {
  title: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between bg-white border border-stone-200 rounded-xl px-5 py-3.5 mb-3 text-left hover:border-sage hover:bg-green-50 transition-colors"
    >
      <div>
        <p className="font-serif text-lg text-gray-800">{title}</p>
        <p className="font-sans text-[9px] text-gray-400 tracking-wide mt-0.5">{sub}</p>
      </div>
      <div className="w-5 h-5 rounded-full border border-stone-200 flex-shrink-0" />
    </button>
  )
}
