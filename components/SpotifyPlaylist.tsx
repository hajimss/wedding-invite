'use client'

import { useTranslation } from '@/lib/language-context'
import { SPOTIFY_PLAYLIST } from '@/lib/config'

export default function SpotifyPlaylist() {
  const { t } = useTranslation()

  return (
    <>
      <p className="font-sans text-[11px] text-gray-500 leading-6 mb-3">{t.playlist_intro}</p>
      <div className="rounded-xl overflow-hidden mb-2 bg-stone-100">
        <iframe
          src={SPOTIFY_PLAYLIST.embedUrl}
          width="100%"
          height="352"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Wedding playlist"
        />
      </div>
      <a
        href={SPOTIFY_PLAYLIST.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-sans text-[10px] tracking-[2px] text-sage uppercase border-b border-sage/40 pb-0.5"
      >
        {t.playlist_cta}
      </a>
    </>
  )
}
