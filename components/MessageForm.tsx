'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/language-context'

type Recipient = 'hazim' | 'idayu' | 'both'
type Status = 'idle' | 'loading' | 'success' | 'error'

export default function MessageForm() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [recipient, setRecipient] = useState<Recipient>('both')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), recipient, message: message.trim() }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-5">
        <div className="w-11 h-11 rounded-full border-[1.5px] border-sage bg-green-50 flex items-center justify-center mx-auto mb-3">
          <svg
            width="20"
            height="16"
            viewBox="0 0 24 20"
            fill="none"
            stroke="#7a9e87"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h20v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3z" />
            <path d="M2 3l10 9 10-9" />
          </svg>
        </div>
        <p className="font-serif text-[20px] text-gray-800">{t.msg_success_title}</p>
        <p className="font-sans text-[10px] text-gray-400 tracking-wide mt-1">{t.msg_success_sub} ✦</p>
      </div>
    )
  }

  const recipients: { value: Recipient; label: string; sub: string }[] = [
    { value: 'hazim', label: t.msg_recipient_hazim, sub: t.msg_recipient_hazim_role },
    { value: 'idayu', label: t.msg_recipient_idayu, sub: t.msg_recipient_idayu_role },
    { value: 'both', label: t.msg_recipient_both, sub: t.msg_recipient_both_sub },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <p className="font-sans text-[11px] text-gray-500 leading-6 mb-3">{t.msg_intro}</p>

      <div className="mb-3">
        <label className="block font-sans text-[9px] tracking-[2px] text-gray-400 uppercase mb-1.5">
          {t.msg_name_label}
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t.msg_name_placeholder}
          required
          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 font-sans text-[12px] text-gray-800 outline-none focus:border-sage transition-colors"
        />
      </div>

      <label className="block font-sans text-[9px] tracking-[2px] text-gray-400 uppercase mb-1.5">
        {t.msg_send_to}
      </label>
      <div className="flex gap-2 mb-3.5">
        {recipients.map(r => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRecipient(r.value)}
            className={`flex-1 border rounded-lg py-2 text-center transition-colors ${
              recipient === r.value
                ? 'border-sage bg-sage/5'
                : 'border-stone-200 bg-white hover:border-stone-300'
            }`}
          >
            <p className="font-sans text-[12px] text-gray-800">{r.label}</p>
            <p className="font-sans text-[9px] text-gray-400 tracking-wide mt-0.5">{r.sub}</p>
          </button>
        ))}
      </div>

      <div className="mb-4">
        <label className="block font-sans text-[9px] tracking-[2px] text-gray-400 uppercase mb-1.5">
          {t.msg_message_label}
        </label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={t.msg_message_placeholder}
          rows={4}
          required
          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 font-sans text-[12px] text-gray-800 outline-none focus:border-sage resize-none transition-colors"
        />
      </div>

      {status === 'error' && (
        <p className="font-sans text-[10px] text-red-400 mb-2">{t.msg_error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-sage text-white font-sans text-[11px] tracking-[3px] uppercase py-3 rounded-xl disabled:opacity-60 transition-opacity hover:opacity-90"
      >
        {status === 'loading' ? '...' : t.msg_send_btn}
      </button>
    </form>
  )
}
