import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('interactive Mohr application', () => {
  it('renders the 2D reference state and updates the selected plane', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Mohr circle explorer' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Studio')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '2D Mohr circle' }),
    ).toBeInTheDocument()
    expect(screen.getByText('92.4264')).toBeInTheDocument()
    const selectedPoint = screen.getByTestId('selected-plane-point')
    const initialTau = Number(selectedPoint.getAttribute('data-tau'))

    fireEvent.change(
      screen.getByRole('slider', { name: '2D plane normal angle' }),
      { target: { value: '90' } },
    )

    expect(Number(screen.getByTestId('selected-plane-point').getAttribute('data-tau')))
      .not.toBe(initialTau)
    expect(screen.getByText('-30')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Principal stresses' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Selected plane' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '2D solution' }),
    ).toBeInTheDocument()
  })

  it('updates the 2D plane angle from keyboard and plot dragging', () => {
    vi.spyOn(
      SVGSVGElement.prototype,
      'getBoundingClientRect',
    ).mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 940,
      bottom: 580,
      width: 940,
      height: 580,
      toJSON: () => ({}),
    })
    render(<App />)

    const angleInput = screen.getByRole('slider', {
      name: '2D plane normal angle',
    })
    const selectedPoint = screen.getByRole('slider', {
      name: '2D plane angle',
    })

    fireEvent.keyDown(selectedPoint, { key: 'ArrowRight' })
    expect(angleInput).toHaveValue('31')

    const plot = screen.getByRole('img', { name: /2D Mohr circle/ })
    fireEvent.pointerDown(plot, {
      clientX: 760,
      clientY: 150,
      pointerId: 1,
    })
    fireEvent.pointerMove(plot, {
      clientX: 680,
      clientY: 120,
      pointerId: 1,
    })
    fireEvent.pointerUp(plot, { pointerId: 1 })

    expect(angleInput).not.toHaveValue('31')
  })

  it('switches to 3D without mixing the 2D state', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '3D' }))

    expect(
      screen.getByRole('heading', { name: '3D Mohr circles' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('3D plane normal azimuth')).toHaveValue('45')
    expect(
      Number(screen.getByTestId('selected-plane-point').getAttribute('data-tau')),
    ).toBeGreaterThanOrEqual(0)
    expect(screen.getByText('First invariant I₁')).toBeInTheDocument()
    expect(
      screen.queryByRole('slider', { name: '2D plane angle' }),
    ).not.toBeInTheDocument()
  })

  it('expands the compact controls and restores the reference state', async () => {
    const user = userEvent.setup()
    render(<App />)

    const controlsToggle = screen.getByRole('button', { name: 'Analysis parameters' })
    expect(controlsToggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(controlsToggle)
    expect(controlsToggle).toHaveAttribute('aria-expanded', 'true')

    const sigmaX = screen.getByLabelText(/σx.*Normal stress/)
    await user.clear(sigmaX)
    await user.type(sigmaX, '180')
    expect(sigmaX).toHaveValue(180)

    await user.click(screen.getByRole('button', { name: 'Reset reference state' }))
    expect(sigmaX).toHaveValue(80)
  })

  it('shows an inline error instead of plotting non-finite input', async () => {
    const user = userEvent.setup()
    render(<App />)

    const sigmaX = screen.getByLabelText(/σx.*Normal stress/)
    await user.clear(sigmaX)

    expect(screen.getByRole('alert')).toHaveTextContent('must be a finite number')
    expect(screen.queryByRole('img', { name: '2D Mohr circle' })).not.toBeInTheDocument()
  })

  it('offers a working SVG download action', async () => {
    const user = userEvent.setup()
    const createObjectUrl = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:mohrpy-test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      () => undefined,
    )
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Export SVG' }))

    expect(createObjectUrl).toHaveBeenCalledOnce()
  })
})
