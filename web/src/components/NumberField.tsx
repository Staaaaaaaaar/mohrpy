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
  const errorId = `${id}-error`

  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">
        <span className="symbol">{symbol}</span>
        <span className="field-kind">{label}</span>
      </span>
      <input
        className="number-input"
        id={id}
        name={id}
        type="number"
        inputMode="decimal"
        autoComplete="off"
        step="any"
        value={valid ? value : ''}
        aria-invalid={!valid}
        aria-describedby={!valid ? errorId : undefined}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
      />
      {!valid ? (
        <span className="field-error" id={errorId}>
          Enter a finite number
        </span>
      ) : null}
    </label>
  )
}
