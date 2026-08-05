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
        <h2 className="control-heading" id="stress-2d-heading">
          平面应力分量
        </h2>
        <div className="input-grid">
          <NumberField
            id="sigma-x-2d"
            symbol={<>σ<sub>x</sub></>}
            label="正应力"
            value={state.sigmaX}
            onChange={(value) => update('sigmaX', value)}
          />
          <NumberField
            id="sigma-y-2d"
            symbol={<>σ<sub>y</sub></>}
            label="正应力"
            value={state.sigmaY}
            onChange={(value) => update('sigmaY', value)}
          />
          <NumberField
            id="tau-xy-2d"
            symbol={<>τ<sub>xy</sub></>}
            label="剪应力"
            value={state.tauXY}
            onChange={(value) => update('tauXY', value)}
          />
        </div>
      </section>

      <section className="control-section" aria-labelledby="normal-2d-heading">
        <h2 className="control-heading" id="normal-2d-heading">
          截面法向
        </h2>
        <div className="range-row">
          <input
            className="range-input"
            type="range"
            min="0"
            max="180"
            step="1"
            value={angle}
            aria-label="二维截面法向角"
            onChange={(event) => onAngleChange(event.currentTarget.valueAsNumber)}
          />
          <output className="range-value">{angle.toFixed(0)}°</output>
        </div>
        <p className="plot-subtitle">
          法向从 +x 轴逆时针旋转；输入角度以度为单位。
        </p>
      </section>
    </>
  )
}
