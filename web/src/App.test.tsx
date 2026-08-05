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
      screen.getByRole('heading', { name: '二维 Mohr 圆' }),
    ).toBeInTheDocument()
    expect(screen.getByText('92.4264')).toBeInTheDocument()
    const selectedPoint = screen.getByTestId('selected-plane-point')
    const initialTau = Number(selectedPoint.getAttribute('data-tau'))

    fireEvent.change(
      screen.getByRole('slider', { name: '二维截面法向角' }),
      { target: { value: '90' } },
    )

    expect(Number(screen.getByTestId('selected-plane-point').getAttribute('data-tau')))
      .not.toBe(initialTau)
    expect(screen.getByText('-30')).toBeInTheDocument()
  })

  it('switches to 3D without mixing the 2D state', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '3D 三圆' }))

    expect(
      screen.getByRole('heading', { name: '三维 Mohr 三圆' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('三维截面法向方位角')).toHaveValue('45')
    expect(
      Number(screen.getByTestId('selected-plane-point').getAttribute('data-tau')),
    ).toBeGreaterThanOrEqual(0)
    expect(screen.getByText('第一不变量 I₁')).toBeInTheDocument()
  })

  it('shows an inline error instead of plotting non-finite input', async () => {
    const user = userEvent.setup()
    render(<App />)

    const sigmaX = screen.getByLabelText(/σx.*正应力/)
    await user.clear(sigmaX)

    expect(screen.getByRole('alert')).toHaveTextContent('必须是有限数值')
    expect(screen.queryByRole('img', { name: '二维 Mohr 圆' })).not.toBeInTheDocument()
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

    await user.click(screen.getByRole('button', { name: '导出 SVG' }))

    expect(createObjectUrl).toHaveBeenCalledOnce()
  })
})
