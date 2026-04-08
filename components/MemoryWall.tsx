'use client'

import { useState, useRef, useCallback } from 'react'
import { useTranslation } from '@/lib/language-context'
import type { Photo } from '@/lib/kv'

const PEEK_PX = 52

export default function MemoryWall({ photos }: { photos: Photo[] }) {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const slideWidth = el.offsetWidth - PEEK_PX * 2
    if (slideWidth <= 0) return
    const index = Math.round(el.scrollLeft / slideWidth)
    setActiveIndex(Math.max(0, Math.min(index, photos.length - 1)))
  }, [photos.length])

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = containerRef.current
      if (!el) return
      const slideWidth = el.offsetWidth - PEEK_PX * 2
      if (slideWidth <= 0) return
      const clamped = Math.max(0, Math.min(index, photos.length - 1))
      el.scrollTo({ left: clamped * slideWidth, behavior: 'smooth' })
    },
    [photos.length],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowRight') scrollToIndex(activeIndex + 1)
      if (e.key === 'ArrowLeft') scrollToIndex(activeIndex - 1)
    },
    [activeIndex, scrollToIndex],
  )

  if (photos.length === 0) {
    return (
      <p className="font-sans text-[11px] text-gray-400 text-center py-6">
        {t.memories_empty}
      </p>
    )
  }

  return (
    <div>
      {/* Scrollable carousel track */}
      <div
        ref={containerRef}
        role="region"
        aria-label={`${t.section_memories} carousel`}
        tabIndex={0}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className={[
          'flex overflow-x-scroll scroll-smooth',
          'snap-x snap-mandatory',
          'px-[52px] [scroll-padding-left:52px]',
          '[-webkit-overflow-scrolling:touch]',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'outline-none',
        ].join(' ')}
      >
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className="snap-start [scroll-snap-stop:always] flex-shrink-0 w-full"
          >
            <div
              className={[
                'relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100',
                'transition-opacity duration-300',
                i === activeIndex
                  ? 'opacity-100 shadow-[0_4px_16px_rgba(0,0,0,0.15)]'
                  : 'opacity-45',
              ].join(' ')}
            >
              <img
                src={photo.cloudinaryUrl}
                alt={`Photo by ${photo.guestName}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              {/* Guest name gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2">
                <p className="font-sans text-[10px] text-white truncate">
                  {photo.guestName}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators — only shown when there are 2+ photos */}
      {photos.length >= 2 && (
        <div className="flex gap-[5px] justify-center mt-3">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              aria-label={`Slide ${i + 1} of ${photos.length}`}
              aria-current={i === activeIndex ? true : undefined}
              onClick={() => scrollToIndex(i)}
              className={[
                'transition-all duration-300 rounded-full',
                i === activeIndex
                  ? 'w-[14px] h-[5px] bg-stone-500'
                  : 'w-[5px] h-[5px] bg-stone-300',
              ].join(' ')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
