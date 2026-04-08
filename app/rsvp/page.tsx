'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/language-context'
import BotanicalBackground from '@/components/BotanicalBackground'
import LanguageToggle from '@/components/LanguageToggle'
import type { RsvpAttendance } from '@/lib/kv'

type RsvpState = 'idle' | 'loading' | 'success' | 'error'

export default function RsvpPage() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [attendance, setAttendance] = useState<RsvpAttendance | null>(null)
  const [pax, setPax] = useState('1')
  const [wish, setWish] = useState('')
  const [state, setState] = useState<RsvpState>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required')
      setState('error')
      return
    }
    if (!attendance) {
      setError('Please select your attendance')
      setState('error')
      return
    }

    setState('loading')
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), attendance, pax: Math.max(1, parseInt(pax) || 1), wish: wish.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? t.rsvp_error)
        setState('error')
      } else {
        setState('success')
      }
    } catch {
      setError(t.rsvp_error)
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-8">
        <div className="text-center">
          <p className="font-serif text-[22px] text-sage italic">{t.rsvp_success}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="relative bg-white px-7 pt-12 pb-7 text-center overflow-hidden">
        <BotanicalBackground intensity="light" />
        <LanguageToggle />
        <div className="relative z-10">
          <div className="font-script text-[40px] text-gold leading-tight">Hazim</div>
          <div className="font-serif text-[22px] text-gray-400 font-light my-0.5">&amp;</div>
          <div className="font-script text-[40px] text-gold leading-tight">Idayu</div>
          <div className="w-10 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-4" />
          <p className="font-script text-[22px] text-sage">RSVP</p>
        </div>
      </div>

      <div className="bg-cream px-6 py-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="mb-4">
            <label className="font-sans text-[10px] tracking-[2px] text-sage uppercase block mb-1">
              {t.rsvp_name_placeholder}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.rsvp_name_placeholder}
              className="w-full border border-stone-200 rounded-lg px-4 py-3 font-sans text-[13px] text-gray-700 bg-white focus:outline-none focus:border-sage"
            />
          </div>

          {/* Attendance toggle */}
          <div className="mb-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAttendance('attending')}
                className={[
                  'flex-1 rounded-xl py-3 font-sans text-[11px] tracking-[1px] border-2 transition-colors',
                  attendance === 'attending'
                    ? 'border-sage bg-sage/10 text-sage'
                    : 'border-stone-200 bg-white text-gray-400',
                ].join(' ')}
              >
                {t.rsvp_attending}
              </button>
              <button
                type="button"
                onClick={() => setAttendance('not-attending')}
                className={[
                  'flex-1 rounded-xl py-3 font-sans text-[11px] tracking-[1px] border-2 transition-colors',
                  attendance === 'not-attending'
                    ? 'border-[#c0a08a] bg-[#fdf6f0] text-[#c0a08a]'
                    : 'border-stone-200 bg-white text-gray-400',
                ].join(' ')}
              >
                {t.rsvp_not_attending}
              </button>
            </div>
          </div>

          {/* Pax — only when attending */}
          {attendance === 'attending' && (
            <div className="mb-4">
              <label
                htmlFor="pax-input"
                className="font-sans text-[10px] tracking-[2px] text-sage uppercase block mb-1"
              >
                {t.rsvp_pax_label}
              </label>
              <input
                id="pax-input"
                type="text"
                inputMode="numeric"
                value={pax}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '')
                  setPax(v)
                }}
                onBlur={() => {
                  if (!pax || parseInt(pax) < 1) setPax('1')
                }}
                placeholder="1"
                className="w-full border border-stone-200 rounded-lg px-4 py-3 font-sans text-[13px] text-gray-700 bg-white focus:outline-none focus:border-sage"
              />
            </div>
          )}

          {/* Wish — only when not attending */}
          {attendance === 'not-attending' && (
            <div className="mb-4">
              <label
                htmlFor="wish-input"
                className="font-sans text-[10px] tracking-[2px] text-sage uppercase block mb-1"
              >
                {t.rsvp_wish_label}
              </label>
              <textarea
                id="wish-input"
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                placeholder={t.rsvp_wish_placeholder}
                rows={3}
                className="w-full border border-stone-200 rounded-lg px-4 py-3 font-sans text-[13px] text-gray-700 bg-white focus:outline-none focus:border-sage resize-none"
              />
            </div>
          )}

          {state === 'error' && (
            <p className="font-sans text-[11px] text-red-500 mb-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={state === 'loading'}
            className="w-full bg-sage text-white font-sans text-[11px] tracking-[2px] uppercase py-3 rounded-lg disabled:opacity-50"
          >
            {state === 'loading' ? '...' : t.rsvp_submit_btn}
          </button>
        </form>
      </div>
    </div>
  )
}
