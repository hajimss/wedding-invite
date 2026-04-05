import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/lib/language-context'
import SpotifyPlaylist from '@/components/SpotifyPlaylist'

function Wrapper() {
  return (
    <LanguageProvider>
      <SpotifyPlaylist />
    </LanguageProvider>
  )
}

describe('SpotifyPlaylist', () => {
  it('renders the intro copy', () => {
    render(<Wrapper />)
    expect(
      screen.getByText(
        'Add a song to our wedding playlist — open Spotify and contribute a track that means something to you.'
      )
    ).toBeInTheDocument()
  })

  it('renders the Spotify iframe embed', () => {
    render(<Wrapper />)
    const iframe = screen.getByTitle('Wedding playlist') as HTMLIFrameElement
    expect(iframe).toBeInTheDocument()
    expect(iframe.src).toContain('open.spotify.com/embed/playlist/0soLSTkWnbj8aYnB71n2Cf')
  })

  it('renders the CTA link pointing to the Spotify playlist', () => {
    render(<Wrapper />)
    const link = screen.getByRole('link', { name: /add a song/i })
    expect(link).toHaveAttribute('href', 'https://open.spotify.com/playlist/0soLSTkWnbj8aYnB71n2Cf')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
