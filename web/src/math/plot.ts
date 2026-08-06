import type {
  AnalysisResult,
  MathBounds,
  PlotMargins,
  PlotTransform,
} from './types'
import { assertFiniteResult } from './validation'

export const DEFAULT_PLOT_MARGINS: PlotMargins = {
  left: 76,
  right: 24,
  top: 30,
  bottom: 62,
}

export function boundsForAnalysis(result: AnalysisResult): MathBounds {
  const outerCircle =
    result.mode === '2d' ? result.circle : result.circles.circle13
  let sigmaMin = outerCircle.center - outerCircle.radius
  let sigmaMax = outerCircle.center + outerCircle.radius
  let tauMin = -outerCircle.radius
  let tauMax = outerCircle.radius

  sigmaMin = Math.min(sigmaMin, result.traction.sigmaN)
  sigmaMax = Math.max(sigmaMax, result.traction.sigmaN)
  tauMin = Math.min(tauMin, result.traction.tau)
  tauMax = Math.max(tauMax, result.traction.tau)

  const magnitude = Math.max(
    1,
    Math.abs(outerCircle.center),
    Math.abs(result.traction.sigmaN),
    outerCircle.radius,
  )
  let sigmaSpan = sigmaMax - sigmaMin
  let tauSpan = tauMax - tauMin
  const minimumSpan = magnitude * 0.16

  if (sigmaSpan < minimumSpan) {
    const center = (sigmaMin + sigmaMax) / 2
    sigmaMin = center - minimumSpan / 2
    sigmaMax = center + minimumSpan / 2
    sigmaSpan = minimumSpan
  }
  if (tauSpan < minimumSpan) {
    const center = (tauMin + tauMax) / 2
    tauMin = center - minimumSpan / 2
    tauMax = center + minimumSpan / 2
    tauSpan = minimumSpan
  }

  const padding = 0.08 * Math.max(sigmaSpan, tauSpan)
  const bounds = {
    sigmaMin: sigmaMin - padding,
    sigmaMax: sigmaMax + padding,
    tauMin: tauMin - padding,
    tauMax: tauMax + padding,
  }
  assertFiniteResult(Object.values(bounds), 'Plot bounds')
  return bounds
}

export function createPlotTransform(
  sourceBounds: MathBounds,
  width: number,
  height: number,
  margins: PlotMargins = DEFAULT_PLOT_MARGINS,
): PlotTransform {
  const innerWidth = width - margins.left - margins.right
  const innerHeight = height - margins.top - margins.bottom
  if (innerWidth <= 0 || innerHeight <= 0) {
    throw new RangeError('Plot dimensions must be positive.')
  }

  const sigmaCenter = (sourceBounds.sigmaMin + sourceBounds.sigmaMax) / 2
  const tauCenter = (sourceBounds.tauMin + sourceBounds.tauMax) / 2
  const sigmaSpan = sourceBounds.sigmaMax - sourceBounds.sigmaMin
  const tauSpan = sourceBounds.tauMax - sourceBounds.tauMin
  const unitsPerPixel = Math.max(
    sigmaSpan / innerWidth,
    tauSpan / innerHeight,
  )
  const adjustedSigmaSpan = unitsPerPixel * innerWidth
  const adjustedTauSpan = unitsPerPixel * innerHeight
  const bounds = {
    sigmaMin: sigmaCenter - adjustedSigmaSpan / 2,
    sigmaMax: sigmaCenter + adjustedSigmaSpan / 2,
    tauMin: tauCenter - adjustedTauSpan / 2,
    tauMax: tauCenter + adjustedTauSpan / 2,
  }
  const scale = 1 / unitsPerPixel

  return {
    bounds,
    scale,
    mapX: (sigma) => margins.left + (sigma - bounds.sigmaMin) * scale,
    mapY: (tau) => margins.top + (bounds.tauMax - tau) * scale,
    unmapX: (x) => bounds.sigmaMin + (x - margins.left) / scale,
    unmapY: (y) => bounds.tauMax - (y - margins.top) / scale,
  }
}

export function niceTicks(
  minimum: number,
  maximum: number,
  targetCount = 6,
): number[] {
  const span = maximum - minimum
  if (!(span > 0) || !Number.isFinite(span)) {
    return [minimum]
  }

  const roughStep = span / Math.max(2, targetCount)
  const power = 10 ** Math.floor(Math.log10(roughStep))
  const normalized = roughStep / power
  const factor =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  const step = factor * power
  const first = Math.ceil(minimum / step) * step
  const ticks: number[] = []

  for (
    let value = first, index = 0;
    value <= maximum + step * 1e-9 && index < 100;
    value += step, index += 1
  ) {
    ticks.push(Math.abs(value) < step * 1e-12 ? 0 : value)
  }
  return ticks
}
