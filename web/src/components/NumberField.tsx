import type { ReactNode } from 'react'

type NumberFieldProps = {
  id: string
  label: string
  symbol: ReactNode
  value: number
  onChange: (value: number) => void
}

export function NumberField({
  id,
  label,
  symbol,
  value,
  onChange,
}: NumberFieldProps) {
  const valid = Number.isFinite(value)

  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">
        <span className="symbol">{symbol}</span>
        <span>{label}</span>
      </span>
      <input
        className="number-input"
        id={id}
        type="number"
        inputMode="decimal"
        step="any"
        value={valid ? value : ''}
        aria-invalid={!valid}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
      />
    </label>
  )
}
