import { render, screen, fireEvent } from '@testing-library/react'
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

const photo2: Photo = { ...photo, id: 'id-2', guestName: 'Hafiz', token: 'tok-2' }
const photo3: Photo = { ...photo, id: 'id-3', guestName: 'Siti', token: 'tok-3' }

describe('MemoryWall', () => {
  // ── existing tests (must keep passing) ──────────────────────────────────

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
    render(<Wrapper photos={[photo, photo2]} />)
    expect(screen.getByAltText('Photo by Aishah')).toBeInTheDocument()
    expect(screen.getByAltText('Photo by Hafiz')).toBeInTheDocument()
  })

  // ── carousel tests ───────────────────────────────────────────────────────

  it('renders an accessible scroll container', () => {
    render(<Wrapper photos={[photo, photo2]} />)
    expect(screen.getByRole('region', { name: /memories/i })).toBeInTheDocument()
  })

  it('does not show dot indicators for a single photo', () => {
    render(<Wrapper photos={[photo]} />)
    expect(screen.queryByRole('button', { name: /slide 1 of 1/i })).not.toBeInTheDocument()
  })

  it('shows one dot per photo when there are multiple photos', () => {
    render(<Wrapper photos={[photo, photo2, photo3]} />)
    expect(screen.getAllByRole('button', { name: /^slide \d+ of 3$/i })).toHaveLength(3)
  })

  it('marks the first dot as active on initial render', () => {
    render(<Wrapper photos={[photo, photo2]} />)
    const first = screen.getByRole('button', { name: /slide 1 of 2/i })
    const second = screen.getByRole('button', { name: /slide 2 of 2/i })
    expect(first).toHaveAttribute('aria-current', 'true')
    expect(second).not.toHaveAttribute('aria-current')
  })

  it('scrolls to slide 1 on ArrowRight from slide 0', () => {
    render(<Wrapper photos={[photo, photo2, photo3]} />)
    const container = screen.getByRole('region', { name: /memories/i })

    const scrollToMock = jest.fn()
    Object.defineProperty(container, 'scrollTo', { value: scrollToMock, writable: true })
    // slideWidth = offsetWidth - 104 = 300 - 104 = 196
    Object.defineProperty(container, 'offsetWidth', { value: 300, writable: true })

    fireEvent.keyDown(container, { key: 'ArrowRight' })
    expect(scrollToMock).toHaveBeenCalledWith({ left: 196, behavior: 'smooth' })
  })

  it('clamps to slide 0 on ArrowLeft from slide 0', () => {
    render(<Wrapper photos={[photo, photo2, photo3]} />)
    const container = screen.getByRole('region', { name: /memories/i })

    const scrollToMock = jest.fn()
    Object.defineProperty(container, 'scrollTo', { value: scrollToMock, writable: true })
    Object.defineProperty(container, 'offsetWidth', { value: 300, writable: true })

    fireEvent.keyDown(container, { key: 'ArrowLeft' })
    expect(scrollToMock).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' })
  })
})
