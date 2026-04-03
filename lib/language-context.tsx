'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations } from './translations'
import type { Lang, T } from './translations'

const LANG_KEY = 'wedding-lang'

type LanguageContextValue = {
  lang: Lang
  t: T
  toggleLang: () => void
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  t: translations.en,
  toggleLang: () => {},
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY)
      if (stored === 'en' || stored === 'my') setLang(stored)
    } catch {}
  }, [])

  function toggleLang() {
    const next: Lang = lang === 'en' ? 'my' : 'en'
    setLang(next)
    try {
      localStorage.setItem(LANG_KEY, next)
    } catch {}
  }

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  return useContext(LanguageContext)
}
