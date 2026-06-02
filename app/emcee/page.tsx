'use client'

import { useEffect, useState } from 'react'
import { PHOTO_LIST, type PhotoGroup } from '@/lib/config'

type FlatItem = {
  flatIndex: number
  label: string
  category: 'bride' | 'groom' | 'both'
  section?: string
}

function flattenPhotoList(groups: PhotoGroup[]): FlatItem[] {
  const result: FlatItem[] = []
  for (const group of groups) {
    group.items.forEach((label, i) => {
      result.push({
        flatIndex: result.length,
        label,
        category: group.category,
        section: i === 0 ? group.section : undefined,
      })
    })
  }
  return result
}

const STORAGE_KEY = 'emcee-photo-queue'
const flatItems = flattenPhotoList(PHOTO_LIST)

const CATEGORY_STYLES: Record<string, { row: string; badge: string; dot: string; header: string; rule: string }> = {
  bride: {
    row: 'bg-purple-50 border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    dot: 'bg-purple-100 text-purple-400',
    header: 'text-purple-600',
    rule: 'bg-purple-200',
  },
  groom: {
    row: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-100 text-blue-400',
    header: 'text-blue-600',
    rule: 'bg-blue-200',
  },
  both: {
    row: 'bg-stone-50 border-stone-200',
    badge: 'bg-stone-100 text-stone-500',
    dot: 'bg-stone-100 text-stone-400',
    header: 'text-stone-500',
    rule: 'bg-stone-200',
  },
}

export default function EmceePage() {
  const [checked, setChecked] = useState<Set<number>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setChecked(new Set(JSON.parse(stored) as number[]))
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  function markDone(index: number) {
    setChecked(prev => {
      const next = new Set(prev)
      next.add(index)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      } catch {}
      return next
    })
  }

  const activeIndex = flatItems.findIndex(item => !checked.has(item.flatIndex))

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-sm mx-auto bg-white shadow-sm">

        {/* Header */}
        <div className="bg-white border-b border-stone-100 px-5 py-4">
          <p className="font-sans text-[9px] tracking-[4px] text-sage uppercase mb-1">
            06 JUNE 2026 · BEGONIA PAVILION
          </p>
          <h1 className="font-serif text-[22px] text-gray-800 font-normal mb-3">Photo Queue</h1>
          <div className="flex gap-4">
            <LegendItem swatch="bg-purple-100 border border-purple-200" label="Bride" />
            <LegendItem swatch="bg-blue-100 border border-blue-200" label="Groom" />
            <LegendItem swatch="bg-stone-100 border border-stone-200" label="Both" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-3 bg-white border-b border-stone-100 flex items-center gap-3">
          <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage rounded-full transition-all duration-300"
              style={{ width: `${(checked.size / flatItems.length) * 100}%` }}
            />
          </div>
          <span className="font-sans text-[10px] text-gray-400 whitespace-nowrap">
            {checked.size} / {flatItems.length} done
          </span>
        </div>

        {/* Items */}
        <div className="px-4 py-3 flex flex-col gap-2">
          {flatItems.map(item => {
            const isDone = checked.has(item.flatIndex)
            const isActive = item.flatIndex === activeIndex
            const styles = CATEGORY_STYLES[item.category]

            return (
              <div key={item.flatIndex}>
                {item.section && (
                  <div className="flex items-center gap-2 pt-2 pb-1 px-1">
                    <span className={`font-sans text-[9px] tracking-[2px] uppercase font-semibold whitespace-nowrap ${styles.header}`}>
                      {item.section}
                    </span>
                    <div className={`flex-1 h-px ${styles.rule}`} />
                  </div>
                )}
                <div className={[
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all',
                  isDone ? 'bg-green-50 border-green-200 opacity-60' : '',
                  isActive ? 'bg-amber-50 border-gold border-2 shadow-[0_2px_8px_rgba(201,168,76,0.15)]' : '',
                  !isDone && !isActive ? styles.row : '',
                ].join(' ')}>
                  <div className={[
                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px]',
                    isDone ? 'bg-sage text-white' : '',
                    isActive ? 'bg-gold text-white' : '',
                    !isDone && !isActive ? styles.dot : '',
                  ].join(' ')}>
                    {isDone ? '✓' : isActive ? '▶' : '○'}
                  </div>

                  <p className={[
                    'flex-1 font-serif text-[13px] leading-snug',
                    isDone ? 'text-gray-400 line-through' : '',
                    isActive ? 'text-gray-900' : '',
                    !isDone && !isActive ? 'text-gray-600' : '',
                  ].join(' ')}>
                    {item.label}
                  </p>

                  <span className={`font-sans text-[9px] tracking-[1px] uppercase rounded px-1.5 py-0.5 flex-shrink-0 ${styles.badge}`}>
                    {item.category}
                  </span>

                  {isActive && (
                    <button
                      onClick={() => markDone(item.flatIndex)}
                      className="bg-gold text-white font-sans text-[9px] tracking-[1px] uppercase rounded-lg px-3 py-1.5 transition-opacity hover:opacity-80 flex-shrink-0"
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* All done banner */}
        {activeIndex === -1 && (
          <div className="mx-4 mb-3 bg-sage/10 border border-sage/20 rounded-xl px-4 py-3 text-center">
            <p className="font-serif text-[15px] text-sage mb-0.5">All done!</p>
            <p className="font-sans text-[10px] text-gray-400">Every group has been photographed.</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-4 border-t border-stone-100">
          <p className="font-sans text-[10px] text-gray-300 text-center">
            Tap &ldquo;Done&rdquo; to check off · Progress saves in browser
          </p>
        </div>

      </div>
    </div>
  )
}

function LegendItem({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="font-sans text-[10px] text-gray-500 flex items-center gap-1.5">
      <span className={`inline-block w-2.5 h-2.5 rounded-sm ${swatch}`} />
      {label}
    </span>
  )
}
