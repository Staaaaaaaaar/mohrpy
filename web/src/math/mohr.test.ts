import { describe, expect, it } from 'vitest'

import { analyze2D } from './mohr2d'
import { analyze3D } from './mohr3d'
import { boundsForAnalysis, createPlotTransform } from './plot'

describe('2D Mohr analysis', () => {
  it('matches the Python reference example', () => {
    const result = analyze2D(
      { sigmaX: 80, sigmaY: 20, tauXY: 30 },
      30,
    )

    expect(result.principals[0]).toBeCloseTo(92.4264068712, 9)
    expect(result.principals[1]).toBeCloseTo(7.5735931288, 9)
    expect(result.circle.center).toBeCloseTo(50, 12)
    expect(result.circle.radius).toBeCloseTo(42.4264068712, 9)
    expect(result.traction.sigmaN).toBeCloseTo(90.9807621135, 9)
    expect(result.traction.tau).toBeCloseTo(-10.9807621135, 9)
  })

  it('preserves the signed shear convention on axis-aligned planes', () => {
    const state = { sigmaX: 80, sigmaY: 20, tauXY: 30 }
    expect(analyze2D(state, 0).traction).toEqual({ sigmaN: 80, tau: 30 })
    expect(analyze2D(state, 90).traction.sigmaN).toBeCloseTo(20, 12)
    expect(analyze2D(state, 90).traction.tau).toBeCloseTo(-30, 12)
  })

  it('keeps every selected plane point on the circle', () => {
    const state = { sigmaX: -12, sigmaY: 65, tauXY: 19 }
    for (let angle = 0; angle <= 180; angle += 7.5) {
      const result = analyze2D(state, angle)
      const distance = Math.hypot(
        result.traction.sigmaN - result.circle.center,
        result.traction.tau,
      )
      expect(distance).toBeCloseTo(result.circle.radius, 10)
    }
  })

  it('rejects non-finite inputs', () => {
    expect(() =>
      analyze2D({ sigmaX: Number.NaN, sigmaY: 20, tauXY: 30 }, 0),
    ).toThrow(/有限数值/)
  })
})

describe('3D Mohr analysis', () => {
  it('returns sorted principal stresses for a diagonal tensor', () => {
    const result = analyze3D(
      {
        sigmaX: 120,
        sigmaY: 90,
        sigmaZ: 30,
        tauXY: 0,
        tauYZ: 0,
        tauZX: 0,
      },
      0,
      0,
    )

    expect(result.principals).toEqual([120, 90, 30])
    expect(result.maxShear).toBe(45)
    expect(result.circles.circle12).toEqual({ center: 105, radius: 15 })
    expect(result.circles.circle23).toEqual({ center: 60, radius: 30 })
    expect(result.circles.circle13).toEqual({ center: 75, radius: 45 })
  })

  it('matches Python invariants and selected-plane values', () => {
    const result = analyze3D(
      {
        sigmaX: 80,
        sigmaY: 50,
        sigmaZ: 20,
        tauXY: 10,
        tauYZ: 5,
        tauZX: 0,
      },
      45,
      20,
    )

    expect(result.invariants).toEqual({ i1: 150, i2: 6475, i3: 76000 })
    expect(result.traction.sigmaN).toBeCloseTo(70.8388195741, 9)
    expect(result.traction.tau).toBeCloseTo(19.7510192684, 9)

    const { circle12, circle23, circle13 } = result.circles
    const point = result.traction
    expect(Math.hypot(point.sigmaN - circle13.center, point.tau)).toBeLessThanOrEqual(
      circle13.radius + 1e-10,
    )
    expect(Math.hypot(point.sigmaN - circle12.center, point.tau)).toBeGreaterThanOrEqual(
      circle12.radius - 1e-10,
    )
    expect(Math.hypot(point.sigmaN - circle23.center, point.tau)).toBeGreaterThanOrEqual(
      circle23.radius - 1e-10,
    )
  })

  it('handles hydrostatic and repeated-principal states', () => {
    const hydrostatic = analyze3D(
      {
        sigmaX: 42,
        sigmaY: 42,
        sigmaZ: 42,
        tauXY: 0,
        tauYZ: 0,
        tauZX: 0,
      },
      120,
      -40,
    )
    expect(hydrostatic.principals).toEqual([42, 42, 42])
    expect(hydrostatic.maxShear).toBe(0)
    expect(hydrostatic.traction.tau).toBe(0)
  })

  it('keeps the characteristic invariants across general tensors', () => {
    const states = [
      [15, -27, 42, 8, -11, 4],
      [-90, -25, 12, 30, 7, -18],
      [0.2, 0.4, -0.7, 1.1, -0.3, 0.9],
      [1_000_000, 850_000, -120_000, 75_000, 22_000, -61_000],
    ] as const

    for (const [sigmaX, sigmaY, sigmaZ, tauXY, tauYZ, tauZX] of states) {
      const result = analyze3D(
        { sigmaX, sigmaY, sigmaZ, tauXY, tauYZ, tauZX },
        17,
        -31,
      )
      const [s1, s2, s3] = result.principals
      const actual = [
        s1 + s2 + s3,
        s1 * s2 + s2 * s3 + s3 * s1,
        s1 * s2 * s3,
      ]
      const expected = [
        result.invariants.i1,
        result.invariants.i2,
        result.invariants.i3,
      ]
      actual.forEach((value, index) => {
        const relativeError =
          Math.abs(value - expected[index]) /
          Math.max(1, Math.abs(expected[index]))
        expect(relativeError).toBeLessThan(1e-10)
      })
    }
  })
})

describe('plot mapping', () => {
  it('keeps equal mathematical scale on both axes', () => {
    const analysis = analyze2D(
      { sigmaX: 1001, sigmaY: 999, tauXY: 0 },
      0,
    )
    const bounds = boundsForAnalysis(analysis)
    const transform = createPlotTransform(bounds, 900, 560)

    expect(bounds.sigmaMin).toBeGreaterThan(900)
    expect(transform.mapX(1) - transform.mapX(0)).toBeCloseTo(
      transform.mapY(0) - transform.mapY(1),
      12,
    )
  })
})
