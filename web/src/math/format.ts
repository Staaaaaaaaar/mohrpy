export function formatValue(value: number, digits = 4): string {
  if (!Number.isFinite(value)) {
    return '—'
  }
  if (Object.is(value, -0) || Math.abs(value) < 1e-12) {
    return '0'
  }

  const magnitude = Math.abs(value)
  if (magnitude >= 1e6 || magnitude < 1e-4) {
    return value.toExponential(Math.max(2, digits - 1))
  }
  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: digits,
  }).format(value)
}

export function formatTick(value: number): string {
  return formatValue(value, 3)
}
