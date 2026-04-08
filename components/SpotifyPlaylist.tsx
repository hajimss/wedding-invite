'use client'

import { useTranslation } from '@/lib/language-context'
import { SPOTIFY_PLAYLIST } from '@/lib/config'

export default function SpotifyPlaylist() {
  const { t } = useTranslation()

  return (
    <>
      <p className="font-sans text-[11px] text-gray-500 leading-6 mb-3">{t.playlist_intro}</p>
      <a
        href={SPOTIFY_PLAYLIST.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-sage text-white font-sans text-[11px] tracking-[1.5px] uppercase py-3 rounded-lg mb-4"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 01-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.519.781.781 0 01.52-.974c3.632-1.102 8.147-.568 11.233 1.329a.78.78 0 01.257 1.073zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.794c3.543-1.073 9.437-.866 13.157 1.322a.937.937 0 11-.997 1.59z"/>
        </svg>
        {t.playlist_cta}
      </a>
      <div className="rounded-xl overflow-hidden bg-stone-100">
        <iframe
          src={SPOTIFY_PLAYLIST.embedUrl}
          width="100%"
          height="352"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Wedding playlist"
        />
      </div>
    </>
  )
}
