import type { Metadata } from 'next'
import { Great_Vibes, Cormorant_Garamond, Josefin_Sans } from 'next/font/google'
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

const josefinSans = Josefin_Sans({
  weight: ['100', '300', '400'],
  subsets: ['latin'],
  variable: '--font-josefin',
})

export const metadata: Metadata = {
  title: 'Hazim & Idayu — Walimatul Urus',
  description: 'Join us on 06 June 2026 · 20 Zulhijjah 1447',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${greatVibes.variable} ${cormorant.variable} ${josefinSans.variable} font-sans`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
