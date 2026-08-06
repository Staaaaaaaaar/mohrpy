const ZERO_TOLERANCE = 1e-12

export function assertFiniteRecord<T extends object>(
  values: T,
  context = 'Stress component',
): void {
  for (const [name, value] of Object.entries(values)) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new RangeError(`${context} ${name} must be a finite number.`)
    }
  }
}

export function assertFiniteResult(
  values: readonly number[],
  context: string,
): void {
  if (values.some((value) => !Number.isFinite(value))) {
    throw new RangeError(`${context} exceeds the browser's numeric range.`)
  }
}

export function degreesToRadians(degrees: number): number {
  if (!Number.isFinite(degrees)) {
    throw new RangeError('Angle must be a finite number.')
  }
  return (degrees * Math.PI) / 180
}

export function cleanZero(value: number, scale = 1): number {
  return Math.abs(value) <= ZERO_TOLERANCE * Math.max(1, scale) ? 0 : value
}
