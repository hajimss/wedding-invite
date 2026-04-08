import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider } from '@/lib/language-context'
import RsvpPage from '@/app/rsvp/page'

global.fetch = jest.fn()

function Wrapper() {
  return (
    <LanguageProvider>
      <RsvpPage />
    </LanguageProvider>
  )
}

describe('RsvpPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Thank you, Ahmad!' }),
    })
  })

  it('renders name input and attendance toggle buttons', () => {
    render(<Wrapper />)
    expect(screen.getByPlaceholderText(/your full name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /yes, i'll be there/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sorry, can't make it/i })).toBeInTheDocument()
  })

  it('shows pax input when attending is selected', () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByRole('button', { name: /yes, i'll be there/i }))
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
  })

  it('shows wish textarea when not-attending is selected', () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByRole('button', { name: /sorry, can't make it/i }))
    expect(screen.getByRole('textbox', { name: /send a wish/i })).toBeInTheDocument()
  })

  it('hides pax when switching from attending to not-attending', () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByRole('button', { name: /yes, i'll be there/i }))
    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /sorry, can't make it/i }))
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
  })

  it('shows error when name is blank on submit', async () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByRole('button', { name: /confirm rsvp/i }))
    await waitFor(() =>
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    )
  })

  it('shows error when attendance is not selected on submit', async () => {
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText(/your full name/i), 'Ahmad')
    fireEvent.click(screen.getByRole('button', { name: /confirm rsvp/i }))
    await waitFor(() =>
      expect(screen.getByText(/select your attendance/i)).toBeInTheDocument()
    )
  })

  it('shows success message after successful attending submission', async () => {
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText(/your full name/i), 'Ahmad')
    fireEvent.click(screen.getByRole('button', { name: /yes, i'll be there/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm rsvp/i }))
    await waitFor(() =>
      expect(screen.getByText(/we've noted your rsvp/i)).toBeInTheDocument()
    )
  })

  it('posts correct JSON body when attending', async () => {
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText(/your full name/i), 'Ahmad')
    fireEvent.click(screen.getByRole('button', { name: /yes, i'll be there/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm rsvp/i }))
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    const [, options] = (global.fetch as jest.Mock).mock.calls[0]
    const body = JSON.parse(options.body)
    expect(body).toMatchObject({ name: 'Ahmad', attendance: 'attending', pax: 1 })
  })

  it('shows server error message on failed request', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Something went wrong.' }),
    })
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText(/your full name/i), 'Ahmad')
    fireEvent.click(screen.getByRole('button', { name: /yes, i'll be there/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm rsvp/i }))
    await waitFor(() =>
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    )
  })
})
