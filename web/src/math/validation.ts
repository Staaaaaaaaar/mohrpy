const ZERO_TOLERANCE = 1e-12

export function assertFiniteRecord<T extends object>(
  values: T,
  context = '应力分量',
): void {
  for (const [name, value] of Object.entries(values)) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new RangeError(`${context} ${name} 必须是有限数值。`)
    }
  }
}

export function assertFiniteResult(
  values: readonly number[],
  context: string,
): void {
  if (values.some((value) => !Number.isFinite(value))) {
    throw new RangeError(`${context} 超出浏览器可计算的数值范围。`)
  }
}

export function degreesToRadians(degrees: number): number {
  if (!Number.isFinite(degrees)) {
    throw new RangeError('角度必须是有限数值。')
  }
  return (degrees * Math.PI) / 180
}

export function cleanZero(value: number, scale = 1): number {
  return Math.abs(value) <= ZERO_TOLERANCE * Math.max(1, scale) ? 0 : value
}
