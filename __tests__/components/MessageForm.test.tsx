import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider } from '@/lib/language-context'
import MessageForm from '@/components/MessageForm'

global.fetch = jest.fn()

function Wrapper() {
  return (
    <LanguageProvider>
      <MessageForm />
    </LanguageProvider>
  )
}

describe('MessageForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  it('renders name field, message field, and send button', () => {
    render(<Wrapper />)
    expect(screen.getByPlaceholderText('e.g. Ahmad bin Yusof')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Write your wishes here...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send wishes/i })).toBeInTheDocument()
  })

  it('shows success state after successful submission', async () => {
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText('e.g. Ahmad bin Yusof'), 'Ali')
    await userEvent.type(screen.getByPlaceholderText('Write your wishes here...'), 'Congratulations!')
    fireEvent.click(screen.getByRole('button', { name: /send wishes/i }))
    await waitFor(() =>
      expect(screen.getByText('Message Sent')).toBeInTheDocument()
    )
  })

  it('shows error state on failed submission', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false })
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText('e.g. Ahmad bin Yusof'), 'Ali')
    await userEvent.type(screen.getByPlaceholderText('Write your wishes here...'), 'Congratulations!')
    fireEvent.click(screen.getByRole('button', { name: /send wishes/i }))
    await waitFor(() =>
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: /send wishes/i })).toBeEnabled()
  })

  it('POSTs the correct JSON body', async () => {
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText('e.g. Ahmad bin Yusof'), 'Ali')
    await userEvent.type(screen.getByPlaceholderText('Write your wishes here...'), 'Congrats!')
    fireEvent.click(screen.getByRole('button', { name: /send wishes/i }))
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/send-message',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Ali', recipient: 'both', message: 'Congrats!' }),
        })
      )
    )
  })
})
