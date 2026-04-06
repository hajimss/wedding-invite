import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/lib/language-context'
import MemoryWall from '@/components/MemoryWall'
import type { Photo } from '@/lib/kv'

function Wrapper({ photos }: { photos: Photo[] }) {
  return (
    <LanguageProvider>
      <MemoryWall photos={photos} />
    </LanguageProvider>
  )
}

const photo: Photo = {
  id: 'id-1',
  guestName: 'Aishah',
  cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/test.jpg',
  publicId: 'wedding/test',
  status: 'approved',
  token: 'tok-1',
  uploadedAt: 1000000,
}

describe('MemoryWall', () => {
  it('shows empty state when no photos', () => {
    render(<Wrapper photos={[]} />)
    expect(screen.getByText('Be the first to share a memory')).toBeInTheDocument()
  })

  it('renders a photo tile with guest name', () => {
    render(<Wrapper photos={[photo]} />)
    const img = screen.getByAltText('Photo by Aishah') as HTMLImageElement
    expect(img).toBeInTheDocument()
    expect(img.src).toContain('cloudinary.com')
    expect(screen.getByText('Aishah')).toBeInTheDocument()
  })

  it('renders all provided photos', () => {
    const photos: Photo[] = [
      photo,
      { ...photo, id: 'id-2', guestName: 'Hafiz', token: 'tok-2' },
    ]
    render(<Wrapper photos={photos} />)
    expect(screen.getByAltText('Photo by Aishah')).toBeInTheDocument()
    expect(screen.getByAltText('Photo by Hafiz')).toBeInTheDocument()
  })
})
