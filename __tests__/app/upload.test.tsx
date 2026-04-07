import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider } from '@/lib/language-context'
import UploadPage from '@/app/upload/page'

global.fetch = jest.fn()

function Wrapper() {
  return (
    <LanguageProvider>
      <UploadPage />
    </LanguageProvider>
  )
}

describe('UploadPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Thanks Aishah! Your photo is being reviewed.' }),
    })
  })

  it('renders the name field and submit button', () => {
    render(<Wrapper />)
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /share photo/i })).toBeInTheDocument()
  })

  it('shows success message after successful upload', async () => {
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Aishah')

    const file = new File([new Uint8Array(100)], 'photo.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('photo-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    fireEvent.click(screen.getByRole('button', { name: /share photo/i }))
    await waitFor(() =>
      expect(screen.getByText(/your photo is being reviewed/i)).toBeInTheDocument()
    )
  })

  it('shows error message when name is blank', async () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByRole('button', { name: /share photo/i }))
    await waitFor(() =>
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    )
  })

  it('shows error message when no file is selected', async () => {
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Aishah')
    fireEvent.click(screen.getByRole('button', { name: /share photo/i }))
    await waitFor(() =>
      expect(screen.getByText(/photo is required/i)).toBeInTheDocument()
    )
  })

  it('shows error when file type is not an image', async () => {
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Aishah')
    const file = new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('photo-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: /share photo/i }))
    await waitFor(() =>
      expect(screen.getByText(/image file/i)).toBeInTheDocument()
    )
  })

  it('shows error when server returns error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Upload failed' }),
    })
    render(<Wrapper />)
    await userEvent.type(screen.getByPlaceholderText('Your name'), 'Aishah')
    const file = new File([new Uint8Array(100)], 'photo.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('photo-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: /share photo/i }))
    await waitFor(() =>
      expect(screen.getByText('Upload failed')).toBeInTheDocument()
    )
  })
})
