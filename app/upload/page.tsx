'use client'

import { useState, useRef } from 'react'
import { useTranslation } from '@/lib/language-context'
import BotanicalBackground from '@/components/BotanicalBackground'
import LanguageToggle from '@/components/LanguageToggle'

type UploadState = 'idle' | 'loading' | 'success' | 'error'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
const MAX_SIZE = 10 * 1024 * 1024

export default function UploadPage() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<UploadState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function validate(): string | null {
    if (!name.trim()) return 'Name is required'
    if (!file) return 'Photo is required'
    if (!ALLOWED_TYPES.includes(file.type)) return t.upload_error_type
    if (file.size > MAX_SIZE) return t.upload_error_size
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setErrorMessage(validationError)
      setState('error')
      return
    }

    setState('loading')
    const formData = new FormData()
    formData.append('name', name.trim())
    formData.append('photo', file!)

    try {
      const res = await fetch('/api/photos/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json()
        setErrorMessage(data.error ?? t.msg_error)
        setState('error')
      } else {
        setState('success')
      }
    } catch {
      setErrorMessage(t.msg_error)
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-8">
        <div className="text-center">
          <p className="font-serif text-[22px] text-sage italic">
            {t.upload_success.replace('{name}', name)}
          </p>
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
          <p className="font-script text-[22px] text-sage">{t.upload_title}</p>
        </div>
      </div>

      <div className="bg-cream px-6 py-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="font-sans text-[10px] tracking-[2px] text-sage uppercase block mb-1">
              {t.upload_name_placeholder}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.upload_name_placeholder}
              className="w-full border border-stone-200 rounded-lg px-4 py-3 font-sans text-[13px] text-gray-700 bg-white focus:outline-none focus:border-sage"
            />
          </div>

          <div className="mb-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-200 rounded-xl p-8 text-center cursor-pointer hover:border-sage transition-colors"
            >
              {file ? (
                <p className="font-sans text-[12px] text-sage">{file.name}</p>
              ) : (
                <>
                  <p className="font-sans text-[24px] mb-2">📷</p>
                  <p className="font-sans text-[11px] text-gray-400">Tap to choose a photo</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              data-testid="photo-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {state === 'error' && (
            <p className="font-sans text-[11px] text-red-500 mb-3">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={state === 'loading'}
            className="w-full bg-sage text-white font-sans text-[11px] tracking-[2px] uppercase py-3 rounded-lg disabled:opacity-50"
          >
            {state === 'loading' ? '...' : t.upload_cta}
          </button>
        </form>
      </div>
    </div>
  )
}
