import type { Metadata } from 'next'
import { Great_Vibes, Cormorant_Garamond, Montserrat } from 'next/font/google'
import { LanguageProvider } from '@/lib/language-context'
import './globals.css'

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-great-vibes',
})

const cormorant = Cormorant_Garamond({
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
})

const montserrat = Montserrat({
  weight: ['300', '400'],
  subsets: ['latin'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'Hazim & Idayu — Walimatul Urus',
  description: 'Join us on 06 June 2026 · 20 Zulhijjah 1447',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${greatVibes.variable} ${cormorant.variable} ${montserrat.variable} font-sans`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
