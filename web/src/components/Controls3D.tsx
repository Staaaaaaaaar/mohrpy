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
        <header className="control-section-header">
          <h2 className="control-heading" id="stress-3d-heading">
            Stress tensor
          </h2>
          <p>Six independent components of a symmetric tensor</p>
        </header>
        <div className="input-grid">
          <NumberField
            id="sigma-x-3d"
            symbol={<>σ<sub>x</sub></>}
            label="Normal stress"
            value={state.sigmaX}
            onChange={(value) => update('sigmaX', value)}
          />
          <NumberField
            id="sigma-y-3d"
            symbol={<>σ<sub>y</sub></>}
            label="Normal stress"
            value={state.sigmaY}
            onChange={(value) => update('sigmaY', value)}
          />
          <NumberField
            id="sigma-z-3d"
            symbol={<>σ<sub>z</sub></>}
            label="Normal stress"
            value={state.sigmaZ}
            onChange={(value) => update('sigmaZ', value)}
          />
          <NumberField
            id="tau-xy-3d"
            symbol={<>τ<sub>xy</sub></>}
            label="Shear stress"
            value={state.tauXY}
            onChange={(value) => update('tauXY', value)}
          />
          <NumberField
            id="tau-yz-3d"
            symbol={<>τ<sub>yz</sub></>}
            label="Shear stress"
            value={state.tauYZ}
            onChange={(value) => update('tauYZ', value)}
          />
          <NumberField
            id="tau-zx-3d"
            symbol={<>τ<sub>zx</sub></>}
            label="Shear stress"
            value={state.tauZX}
            onChange={(value) => update('tauZX', value)}
          />
        </div>
      </section>

      <section className="control-section" aria-labelledby="normal-3d-heading">
        <header className="control-section-header">
          <h2 className="control-heading" id="normal-3d-heading">
            Plane normal
          </h2>
          <p>Unit normal defined by azimuth and elevation</p>
        </header>
        <div className="field">
          <label className="field-label" htmlFor="normal-azimuth-3d">
            <span className="symbol">α</span>
            <span>Azimuth</span>
          </label>
          <span className="range-row">
            <input
              className="range-input"
              id="normal-azimuth-3d"
              type="range"
              min="-180"
              max="180"
              step="1"
              value={azimuth}
              aria-label="3D plane normal azimuth"
              onChange={(event) =>
                onAzimuthChange(event.currentTarget.valueAsNumber)
              }
            />
            <output className="range-value" htmlFor="normal-azimuth-3d">
              {azimuth.toFixed(0)}°
            </output>
          </span>
        </div>

        <div className="field spaced-field">
          <label className="field-label" htmlFor="normal-elevation-3d">
            <span className="symbol">β</span>
            <span>Elevation</span>
          </label>
          <span className="range-row">
            <input
              className="range-input"
              id="normal-elevation-3d"
              type="range"
              min="-90"
              max="90"
              step="1"
              value={elevation}
              aria-label="3D plane normal elevation"
              onChange={(event) =>
                onElevationChange(event.currentTarget.valueAsNumber)
              }
            />
            <output className="range-value" htmlFor="normal-elevation-3d">
              {elevation.toFixed(0)}°
            </output>
          </span>
        </div>

        {normal ? (
          <div className="normal-readout" aria-label="Unit normal components">
            <span>n<sub>x</sub> {normal.nx.toFixed(3)}</span>
            <span>n<sub>y</sub> {normal.ny.toFixed(3)}</span>
            <span>n<sub>z</sub> {normal.nz.toFixed(3)}</span>
          </div>
        ) : null}
      </section>
    </>
  )
}
