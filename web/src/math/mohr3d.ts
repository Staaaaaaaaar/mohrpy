import {
  eigenvaluesSymmetric3,
  type SymmetricMatrix3,
} from './eigen3'
import type {
  AnalysisResult3D,
  PlaneTraction3D,
  StressInvariants3D,
  StressState3D,
  UnitNormal3D,
} from './types'
import {
  assertFiniteRecord,
  assertFiniteResult,
  cleanZero,
  degreesToRadians,
} from './validation'

export const DEFAULT_STRESS_3D: StressState3D = {
  sigmaX: 80,
  sigmaY: 50,
  sigmaZ: 20,
  tauXY: 10,
  tauYZ: 5,
  tauZX: 0,
}

export function stressTensor3D(state: StressState3D): SymmetricMatrix3 {
  return [
    [state.sigmaX, state.tauXY, state.tauZX],
    [state.tauXY, state.sigmaY, state.tauYZ],
    [state.tauZX, state.tauYZ, state.sigmaZ],
  ]
}

export function normal3DFromAnglesDegrees(
  azimuthDegrees: number,
  elevationDegrees: number,
): UnitNormal3D {
  const azimuth = degreesToRadians(azimuthDegrees)
  const elevation = degreesToRadians(elevationDegrees)
  const cosElevation = Math.cos(elevation)

  return {
    nx: cleanZero(cosElevation * Math.cos(azimuth)),
    ny: cleanZero(cosElevation * Math.sin(azimuth)),
    nz: cleanZero(Math.sin(elevation)),
  }
}

export function invariants3D(state: StressState3D): StressInvariants3D {
  const { sigmaX, sigmaY, sigmaZ, tauXY, tauYZ, tauZX } = state
  const i1 = sigmaX + sigmaY + sigmaZ
  const i2 =
    sigmaX * sigmaY +
    sigmaY * sigmaZ +
    sigmaZ * sigmaX -
    tauXY * tauXY -
    tauYZ * tauYZ -
    tauZX * tauZX
  const i3 =
    sigmaX * sigmaY * sigmaZ +
    2 * tauXY * tauYZ * tauZX -
    sigmaX * tauYZ * tauYZ -
    sigmaY * tauZX * tauZX -
    sigmaZ * tauXY * tauXY

  assertFiniteResult([i1, i2, i3], '三维应力不变量')
  return { i1, i2, i3 }
}

export function stressOnPlane3D(
  state: StressState3D,
  normal: UnitNormal3D,
): PlaneTraction3D {
  const tractionX =
    state.sigmaX * normal.nx +
    state.tauXY * normal.ny +
    state.tauZX * normal.nz
  const tractionY =
    state.tauXY * normal.nx +
    state.sigmaY * normal.ny +
    state.tauYZ * normal.nz
  const tractionZ =
    state.tauZX * normal.nx +
    state.tauYZ * normal.ny +
    state.sigmaZ * normal.nz

  const sigmaN =
    normal.nx * tractionX +
    normal.ny * tractionY +
    normal.nz * tractionZ
  const shearX = tractionX - sigmaN * normal.nx
  const shearY = tractionY - sigmaN * normal.ny
  const shearZ = tractionZ - sigmaN * normal.nz
  const tau = Math.hypot(shearX, shearY, shearZ)
  assertFiniteResult(
    [sigmaN, shearX, shearY, shearZ, tau],
    '三维斜截面应力',
  )

  const scale = Math.max(...Object.values(state).map((value) => Math.abs(value)))
  return {
    sigmaN: cleanZero(sigmaN, scale),
    tau: cleanZero(tau, scale),
    shearVector: [
      cleanZero(shearX, scale),
      cleanZero(shearY, scale),
      cleanZero(shearZ, scale),
    ],
  }
}

export function analyze3D(
  state: StressState3D,
  azimuthDegrees: number,
  elevationDegrees: number,
): AnalysisResult3D {
  assertFiniteRecord(state)

  const [sigma1, sigma2, sigma3] = eigenvaluesSymmetric3(
    stressTensor3D(state),
  )
  const circle12 = {
    center: sigma1 / 2 + sigma2 / 2,
    radius: (sigma1 - sigma2) / 2,
  }
  const circle23 = {
    center: sigma2 / 2 + sigma3 / 2,
    radius: (sigma2 - sigma3) / 2,
  }
  const circle13 = {
    center: sigma1 / 2 + sigma3 / 2,
    radius: (sigma1 - sigma3) / 2,
  }
  assertFiniteResult(
    [
      circle12.center,
      circle12.radius,
      circle23.center,
      circle23.radius,
      circle13.center,
      circle13.radius,
    ],
    '三维 Mohr 圆计算结果',
  )

  const normal = normal3DFromAnglesDegrees(
    azimuthDegrees,
    elevationDegrees,
  )
  return {
    mode: '3d',
    state,
    normal,
    principals: [sigma1, sigma2, sigma3],
    maxShear: circle13.radius,
    circles: { circle12, circle23, circle13 },
    invariants: invariants3D(state),
    traction: stressOnPlane3D(state, normal),
  }
}
