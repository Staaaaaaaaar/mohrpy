export type AppMode = '2d' | '3d'

export type StressState2D = {
  sigmaX: number
  sigmaY: number
  tauXY: number
}

export type StressState3D = {
  sigmaX: number
  sigmaY: number
  sigmaZ: number
  tauXY: number
  tauYZ: number
  tauZX: number
}

export type UnitNormal2D = {
  nx: number
  ny: number
}

export type UnitNormal3D = {
  nx: number
  ny: number
  nz: number
}

export type CircleGeometry = {
  center: number
  radius: number
}

export type MohrCircles3D = {
  circle12: CircleGeometry
  circle23: CircleGeometry
  circle13: CircleGeometry
}

export type PlaneTraction2D = {
  sigmaN: number
  tau: number
}

export type PlaneTraction3D = {
  sigmaN: number
  tau: number
  shearVector: readonly [number, number, number]
}

export type StressInvariants3D = {
  i1: number
  i2: number
  i3: number
}

export type AnalysisResult2D = {
  mode: '2d'
  state: StressState2D
  normal: UnitNormal2D
  principals: readonly [number, number]
  maxShear: number
  circle: CircleGeometry
  traction: PlaneTraction2D
}

export type AnalysisResult3D = {
  mode: '3d'
  state: StressState3D
  normal: UnitNormal3D
  principals: readonly [number, number, number]
  maxShear: number
  circles: MohrCircles3D
  invariants: StressInvariants3D
  traction: PlaneTraction3D
}

export type AnalysisResult = AnalysisResult2D | AnalysisResult3D

export type MathBounds = {
  sigmaMin: number
  sigmaMax: number
  tauMin: number
  tauMax: number
}

export type PlotMargins = {
  left: number
  right: number
  top: number
  bottom: number
}

export type PlotTransform = {
  bounds: MathBounds
  scale: number
  mapX: (sigma: number) => number
  mapY: (tau: number) => number
  unmapX: (x: number) => number
  unmapY: (y: number) => number
}
