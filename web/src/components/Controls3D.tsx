import type { StressState3D, UnitNormal3D } from '../math/types'
import { NumberField } from './NumberField'

type Controls3DProps = {
  state: StressState3D
  azimuth: number
  elevation: number
  normal?: UnitNormal3D
  onStateChange: (state: StressState3D) => void
  onAzimuthChange: (angle: number) => void
  onElevationChange: (angle: number) => void
}

export function Controls3D({
  state,
  azimuth,
  elevation,
  normal,
  onStateChange,
  onAzimuthChange,
  onElevationChange,
}: Controls3DProps) {
  const update = (key: keyof StressState3D, value: number) => {
    onStateChange({ ...state, [key]: value })
  }

  return (
    <>
      <section className="control-section" aria-labelledby="stress-3d-heading">
        <h2 className="control-heading" id="stress-3d-heading">
          三维应力分量
        </h2>
        <div className="input-grid">
          <NumberField
            id="sigma-x-3d"
            symbol={<>σ<sub>x</sub></>}
            label="正应力"
            value={state.sigmaX}
            onChange={(value) => update('sigmaX', value)}
          />
          <NumberField
            id="sigma-y-3d"
            symbol={<>σ<sub>y</sub></>}
            label="正应力"
            value={state.sigmaY}
            onChange={(value) => update('sigmaY', value)}
          />
          <NumberField
            id="sigma-z-3d"
            symbol={<>σ<sub>z</sub></>}
            label="正应力"
            value={state.sigmaZ}
            onChange={(value) => update('sigmaZ', value)}
          />
          <NumberField
            id="tau-xy-3d"
            symbol={<>τ<sub>xy</sub></>}
            label="剪应力"
            value={state.tauXY}
            onChange={(value) => update('tauXY', value)}
          />
          <NumberField
            id="tau-yz-3d"
            symbol={<>τ<sub>yz</sub></>}
            label="剪应力"
            value={state.tauYZ}
            onChange={(value) => update('tauYZ', value)}
          />
          <NumberField
            id="tau-zx-3d"
            symbol={<>τ<sub>zx</sub></>}
            label="剪应力"
            value={state.tauZX}
            onChange={(value) => update('tauZX', value)}
          />
        </div>
      </section>

      <section className="control-section" aria-labelledby="normal-3d-heading">
        <h2 className="control-heading" id="normal-3d-heading">
          截面法向
        </h2>
        <label className="field">
          <span className="field-label">
            <span className="symbol">α</span>
            <span>方位角</span>
          </span>
          <span className="range-row">
            <input
              className="range-input"
              type="range"
              min="-180"
              max="180"
              step="1"
              value={azimuth}
              aria-label="三维截面法向方位角"
              onChange={(event) =>
                onAzimuthChange(event.currentTarget.valueAsNumber)
              }
            />
            <output className="range-value">{azimuth.toFixed(0)}°</output>
          </span>
        </label>

        <label className="field" style={{ marginTop: 14 }}>
          <span className="field-label">
            <span className="symbol">β</span>
            <span>俯仰角</span>
          </span>
          <span className="range-row">
            <input
              className="range-input"
              type="range"
              min="-90"
              max="90"
              step="1"
              value={elevation}
              aria-label="三维截面法向俯仰角"
              onChange={(event) =>
                onElevationChange(event.currentTarget.valueAsNumber)
              }
            />
            <output className="range-value">{elevation.toFixed(0)}°</output>
          </span>
        </label>

        {normal ? (
          <div className="normal-readout" aria-label="单位法向分量">
            <span>n<sub>x</sub> {normal.nx.toFixed(3)}</span>
            <span>n<sub>y</sub> {normal.ny.toFixed(3)}</span>
            <span>n<sub>z</sub> {normal.nz.toFixed(3)}</span>
          </div>
        ) : null}
      </section>
    </>
  )
}
