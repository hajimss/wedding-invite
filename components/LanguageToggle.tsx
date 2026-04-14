'use client'

import { useTranslation } from '@/lib/language-context'

export default function LanguageToggle() {
  const { lang, toggleLang } = useTranslation()

  return (
    <button
      onClick={toggleLang}
      className="absolute top-5 left-6 z-10 border border-sage px-2.5 py-1 rounded-full font-sans text-[11px] tracking-[2px] text-sage transition-colors hover:bg-sage/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
      aria-label={`Switch to ${lang === 'en' ? 'Malay' : 'English'}`}
    >
      <span className={lang === 'en' ? 'font-medium' : 'opacity-40'}>EN</span>
      <span className="opacity-40"> · </span>
      <span className={lang === 'my' ? 'font-medium' : 'opacity-40'}>MY</span>
    </button>
  )
}
