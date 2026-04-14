import { render, screen } from '@testing-library/react'
import { LanguageProvider } from '@/lib/language-context'
import HomePage from '@/app/page'

global.fetch = jest.fn()

function Wrapper() {
  return (
    <LanguageProvider>
      <HomePage />
    </LanguageProvider>
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ photos: [] }),
    })
  })

  it('renders couple names in the hero', () => {
    render(<Wrapper />)
    const hazimElements = screen.getAllByText('Hazim')
    expect(hazimElements.length).toBeGreaterThan(0)
    const idayuElements = screen.getAllByText('Idayu')
    expect(idayuElements.length).toBeGreaterThan(0)
  })

  it('renders the ceremony duration badge instead of a timeslot', () => {
    render(<Wrapper />)
    expect(screen.getByText('11AM – 4PM')).toBeInTheDocument()
  })

  it('renders all info section titles on the same page', () => {
    render(<Wrapper />)
    expect(screen.getAllByText(/venue/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/rsvp/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/calendar/i).length).toBeGreaterThan(0)
  })

  it('does not render a CTA button routing away from the page', () => {
    render(<Wrapper />)
    expect(screen.queryByRole('button', { name: /view info|see details|enter|continue/i })).not.toBeInTheDocument()
  })
})
