import { assertFiniteResult } from './validation'

export type SymmetricMatrix3 = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
]

const OFF_DIAGONAL_PAIRS = [
  [0, 1],
  [0, 2],
  [1, 2],
] as const

/**
 * Compute the eigenvalues of a real symmetric 3×3 matrix with Jacobi rotations.
 * The matrix is normalized first so large finite stress values do not overflow
 * during the iteration.
 */
export function eigenvaluesSymmetric3(
  matrix: SymmetricMatrix3,
): readonly [number, number, number] {
  const flat = matrix.flat()
  assertFiniteResult(flat, '三维应力张量')

  const scale = Math.max(...flat.map((value) => Math.abs(value)))
  if (scale === 0) {
    return [0, 0, 0]
  }

  const a = matrix.map((row) => row.map((value) => value / scale))
  const tolerance = 32 * Number.EPSILON

  for (let iteration = 0; iteration < 40; iteration += 1) {
    let pivotP = 0
    let pivotQ = 1
    let largest = 0

    for (const [p, q] of OFF_DIAGONAL_PAIRS) {
      const magnitude = Math.abs(a[p][q])
      if (magnitude > largest) {
        largest = magnitude
        pivotP = p
        pivotQ = q
      }
    }

    if (largest <= tolerance) {
      break
    }

    const p = pivotP
    const q = pivotQ
    const apq = a[p][q]
    const tau = (a[q][q] - a[p][p]) / (2 * apq)
    const tangent =
      (tau >= 0 ? 1 : -1) /
      (Math.abs(tau) + Math.sqrt(1 + tau * tau))
    const cosine = 1 / Math.sqrt(1 + tangent * tangent)
    const sine = tangent * cosine

    const app = a[p][p]
    const aqq = a[q][q]
    a[p][p] = app - tangent * apq
    a[q][q] = aqq + tangent * apq
    a[p][q] = 0
    a[q][p] = 0

    for (let r = 0; r < 3; r += 1) {
      if (r === p || r === q) {
        continue
      }
      const arp = a[r][p]
      const arq = a[r][q]
      const rotatedP = cosine * arp - sine * arq
      const rotatedQ = sine * arp + cosine * arq
      a[r][p] = rotatedP
      a[p][r] = rotatedP
      a[r][q] = rotatedQ
      a[q][r] = rotatedQ
    }
  }

  const eigenvalues = [a[0][0] * scale, a[1][1] * scale, a[2][2] * scale]
    .sort((left, right) => right - left)

  assertFiniteResult(eigenvalues, '三维主应力')
  return [eigenvalues[0], eigenvalues[1], eigenvalues[2]]
}
