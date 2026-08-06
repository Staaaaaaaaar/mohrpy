import type {
  AnalysisResult2D,
  PlaneTraction2D,
  StressState2D,
  UnitNormal2D,
} from './types'
import {
  assertFiniteRecord,
  assertFiniteResult,
  cleanZero,
  degreesToRadians,
} from './validation'

export const DEFAULT_STRESS_2D: StressState2D = {
  sigmaX: 80,
  sigmaY: 20,
  tauXY: 30,
}

export function normal2DFromAngleDegrees(angleDegrees: number): UnitNormal2D {
  const angleRadians = degreesToRadians(angleDegrees)
  return {
    nx: cleanZero(Math.cos(angleRadians)),
    ny: cleanZero(Math.sin(angleRadians)),
  }
}

export function stressOnPlane2D(
  state: StressState2D,
  normal: UnitNormal2D,
): PlaneTraction2D {
  const tractionX = state.sigmaX * normal.nx + state.tauXY * normal.ny
  const tractionY = state.tauXY * normal.nx + state.sigmaY * normal.ny
  const sigmaN = normal.nx * tractionX + normal.ny * tractionY

  // Match mohrpy: tangent is 90° counter-clockwise from the normal.
  const tangentX = -normal.ny
  const tangentY = normal.nx
  const tau = tangentX * tractionX + tangentY * tractionY
  assertFiniteResult([sigmaN, tau], '2D plane traction')

  const scale = Math.max(
    Math.abs(state.sigmaX),
    Math.abs(state.sigmaY),
    Math.abs(state.tauXY),
  )
  return {
    sigmaN: cleanZero(sigmaN, scale),
    tau: cleanZero(tau, scale),
  }
}

export function angleDegreesFromMohrPoint(
  state: StressState2D,
  sigmaN: number,
  tau: number,
): number | null {
  assertFiniteRecord(state)
  assertFiniteResult([sigmaN, tau], '2D Mohr circle interaction point')

  const center = state.sigmaX / 2 + state.sigmaY / 2
  const halfDifference = state.sigmaX / 2 - state.sigmaY / 2
  const radius = Math.hypot(halfDifference, state.tauXY)
  if (radius === 0) {
    return null
  }

  const referenceAngle = Math.atan2(state.tauXY, halfDifference)
  const pointAngle = Math.atan2(tau, sigmaN - center)
  const rawDegrees = ((referenceAngle - pointAngle) * 90) / Math.PI
  return ((rawDegrees % 180) + 180) % 180
}

export function analyze2D(
  state: StressState2D,
  normalAngleDegrees: number,
): AnalysisResult2D {
  assertFiniteRecord(state)

  const center = state.sigmaX / 2 + state.sigmaY / 2
  const halfDifference = state.sigmaX / 2 - state.sigmaY / 2
  const radius = Math.hypot(halfDifference, state.tauXY)
  const sigma1 = center + radius
  const sigma2 = center - radius
  assertFiniteResult(
    [center, radius, sigma1, sigma2],
    '2D Mohr circle result',
  )

  const normal = normal2DFromAngleDegrees(normalAngleDegrees)
  return {
    mode: '2d',
    state,
    normal,
    principals: [sigma1, sigma2],
    maxShear: radius,
    circle: { center, radius },
    traction: stressOnPlane2D(state, normal),
  }
}
