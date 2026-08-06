import type { StressState2D } from '../math/types'
import { NumberField } from './NumberField'

type Controls2DProps = {
  state: StressState2D
  angle: number
  onStateChange: (state: StressState2D) => void
  onAngleChange: (angle: number) => void
}

export function Controls2D({
  state,
  angle,
  onStateChange,
  onAngleChange,
}: Controls2DProps) {
  const update = (key: keyof StressState2D, value: number) => {
    onStateChange({ ...state, [key]: value })
  }

  return (
    <>
      <section className="control-section" aria-labelledby="stress-2d-heading">
        <header className="control-section-header">
          <h2 className="control-heading" id="stress-2d-heading">
            Plane stress
          </h2>
          <p>Components in the x–y coordinate system</p>
        </header>
        <div className="input-grid">
          <NumberField
            id="sigma-x-2d"
            symbol={<>σ<sub>x</sub></>}
            label="Normal stress"
            value={state.sigmaX}
            onChange={(value) => update('sigmaX', value)}
          />
          <NumberField
            id="sigma-y-2d"
            symbol={<>σ<sub>y</sub></>}
            label="Normal stress"
            value={state.sigmaY}
            onChange={(value) => update('sigmaY', value)}
          />
          <NumberField
            id="tau-xy-2d"
            symbol={<>τ<sub>xy</sub></>}
            label="Shear stress"
            value={state.tauXY}
            onChange={(value) => update('tauXY', value)}
          />
        </div>
      </section>

      <section className="control-section" aria-labelledby="normal-2d-heading">
        <header className="control-section-header">
          <label
            className="control-heading"
            id="normal-2d-heading"
            htmlFor="normal-angle-2d"
          >
            Plane normal
          </label>
          <p>Measured counterclockwise from +x</p>
        </header>
        <div className="range-row">
          <input
            className="range-input"
            id="normal-angle-2d"
            type="range"
            min="0"
            max="180"
            step="1"
            value={angle}
            aria-label="2D plane normal angle"
            onChange={(event) => onAngleChange(event.currentTarget.valueAsNumber)}
          />
          <output className="range-value" htmlFor="normal-angle-2d">
            {angle.toFixed(0)}°
          </output>
        </div>
      </section>
    </>
  )
}
