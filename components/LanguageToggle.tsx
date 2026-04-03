'use client'

import { useTranslation } from '@/lib/language-context'

export default function LanguageToggle() {
  const { lang, toggleLang } = useTranslation()

  return (
    <button
      onClick={toggleLang}
      className="absolute top-5 left-6 z-10 border border-sage px-2.5 py-1 rounded-full font-sans text-[10px] tracking-[2px] text-sage"
      aria-label={`Switch to ${lang === 'en' ? 'Malay' : 'English'}`}
    >
      <span className={lang === 'en' ? 'font-medium' : 'opacity-40'}>EN</span>
      <span className="opacity-40"> · </span>
      <span className={lang === 'my' ? 'font-medium' : 'opacity-40'}>MY</span>
    </button>
  )
}
