import { render, screen, fireEvent } from '@testing-library/react'
import { LanguageProvider } from '@/lib/language-context'
import LanguageToggle from '@/components/LanguageToggle'

function Wrapper() {
  return (
    <LanguageProvider>
      <LanguageToggle />
    </LanguageProvider>
  )
}

describe('LanguageToggle', () => {
  beforeEach(() => localStorage.clear())

  it('renders EN and MY labels', () => {
    render(<Wrapper />)
    expect(screen.getByText('EN')).toBeInTheDocument()
    expect(screen.getByText('MY')).toBeInTheDocument()
  })

  it('saves "my" to localStorage on first click', () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByRole('button'))
    expect(localStorage.getItem('wedding-lang')).toBe('my')
  })

  it('toggles back to "en" on second click', () => {
    render(<Wrapper />)
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(localStorage.getItem('wedding-lang')).toBe('en')
  })
})
