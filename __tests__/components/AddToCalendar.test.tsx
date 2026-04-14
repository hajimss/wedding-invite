import { render, screen, fireEvent } from '@testing-library/react'
import AddToCalendar from '@/components/AddToCalendar'

describe('AddToCalendar', () => {
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
      '_blank',
      'noopener,noreferrer'
    )
    open.mockRestore()
  })

  it('includes correct event data in Google Calendar URL', () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => null)
    render(<AddToCalendar />)
    fireEvent.click(screen.getByText('Google Calendar'))
    const url = open.mock.calls[0][0] as string
    expect(url).toContain('Hazim')
    expect(url).toContain('20260606')
    expect(url).toContain('Begonia')
    open.mockRestore()
  })

  it('Apple Calendar button is clickable without throwing', () => {
    render(<AddToCalendar />)
    expect(() => fireEvent.click(screen.getByText('Apple Calendar'))).not.toThrow()
  })
})
