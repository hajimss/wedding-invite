import { render, screen, fireEvent } from '@testing-library/react'
import AddToCalendar from '@/components/AddToCalendar'

describe('AddToCalendar', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:fake')
    global.URL.revokeObjectURL = jest.fn()
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders Google Calendar and Apple Calendar buttons', () => {
    render(<AddToCalendar />)
    expect(screen.getByText('Google Calendar')).toBeInTheDocument()
    expect(screen.getByText('Apple Calendar')).toBeInTheDocument()
  })

  it('opens Google Calendar URL in new tab when clicked', () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null)
    render(<AddToCalendar />)
    fireEvent.click(screen.getByText('Google Calendar'))
    expect(open).toHaveBeenCalledWith(
      expect.stringContaining('calendar.google.com'),
      '_blank'
    )
  })

  it('includes correct event data in Google Calendar URL', () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null)
    render(<AddToCalendar />)
    fireEvent.click(screen.getByText('Google Calendar'))
    const url = open.mock.calls[0][0] as string
    expect(url).toContain('Hazim')
    expect(url).toContain('20260606')
    expect(url).toContain('Begonia')
  })

  it('triggers ICS blob download on Apple Calendar click', () => {
    render(<AddToCalendar />)
    fireEvent.click(screen.getByText('Apple Calendar'))
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake')
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
  })
})
