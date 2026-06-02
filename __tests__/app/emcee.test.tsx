import { render, screen, fireEvent } from '@testing-library/react'
import EmceePage from '@/app/emcee/page'

beforeEach(() => {
  localStorage.clear()
})

describe('EmceePage', () => {
  it('renders the Photo Queue heading', () => {
    render(<EmceePage />)
    expect(screen.getByRole('heading', { name: /photo queue/i })).toBeInTheDocument()
  })

  it('shows 0 / 31 done on first load', () => {
    render(<EmceePage />)
    expect(screen.getByText('0 / 31 done')).toBeInTheDocument()
  })

  it('renders the first item as active with a Done button', () => {
    render(<EmceePage />)
    expect(screen.getByText('Grand Photo: Burhan and Sulaiman Family')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument()
  })

  it('advances progress after tapping Done', () => {
    render(<EmceePage />)
    fireEvent.click(screen.getByRole('button', { name: /done/i }))
    expect(screen.getByText('1 / 31 done')).toBeInTheDocument()
  })

  it('renders section headers for grouped items', () => {
    render(<EmceePage />)
    expect(screen.getByText('Idayu — Bride Side')).toBeInTheDocument()
    expect(screen.getByText('Hazim — Groom Side')).toBeInTheDocument()
  })

  it('renders items from all three categories', () => {
    render(<EmceePage />)
    expect(screen.getAllByText('bride').length).toBeGreaterThan(0)
    expect(screen.getAllByText('groom').length).toBeGreaterThan(0)
    expect(screen.getAllByText('both').length).toBeGreaterThan(0)
  })

  it('persists progress to localStorage when Done is tapped', () => {
    render(<EmceePage />)
    fireEvent.click(screen.getByRole('button', { name: /done/i }))
    const stored = JSON.parse(localStorage.getItem('emcee-photo-queue') ?? '[]')
    expect(stored).toContain(0)
  })

  it('restores checked items from localStorage on mount', () => {
    localStorage.setItem('emcee-photo-queue', JSON.stringify([0, 1, 2]))
    render(<EmceePage />)
    expect(screen.getByText('3 / 31 done')).toBeInTheDocument()
  })

  it('shows a completion banner when all items are checked', () => {
    const allIndices = Array.from({ length: 31 }, (_, i) => i)
    localStorage.setItem('emcee-photo-queue', JSON.stringify(allIndices))
    render(<EmceePage />)
    expect(screen.getByText('All done!')).toBeInTheDocument()
  })
})
