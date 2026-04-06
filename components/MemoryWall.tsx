'use client'

import { useTranslation } from '@/lib/language-context'
import type { Photo } from '@/lib/kv'

export default function MemoryWall({ photos }: { photos: Photo[] }) {
  const { t } = useTranslation()

  if (photos.length === 0) {
    return (
      <p className="font-sans text-[11px] text-gray-400 text-center py-6">
        {t.memories_empty}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="relative aspect-square rounded-lg overflow-hidden bg-stone-100"
        >
          <img
            src={photo.cloudinaryUrl}
            alt={`Photo by ${photo.guestName}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1">
            <p className="font-sans text-[9px] text-white truncate">{photo.guestName}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
