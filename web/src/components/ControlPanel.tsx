import type {
  AppMode,
  StressState2D,
  StressState3D,
  UnitNormal3D,
} from '../math/types'
import { Controls2D } from './Controls2D'
import { Controls3D } from './Controls3D'

type ControlPanelProps = {
  mode: AppMode
  state2D: StressState2D
  state3D: StressState3D
  angle2D: number
  azimuth3D: number
  elevation3D: number
  normal?: UnitNormal3D
  error: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onModeChange: (mode: AppMode) => void
  onState2DChange: (state: StressState2D) => void
  onState3DChange: (state: StressState3D) => void
  onAngle2DChange: (angle: number) => void
  onAzimuth3DChange: (angle: number) => void
  onElevation3DChange: (angle: number) => void
  onReset: () => void
}

export function ControlPanel({
  mode,
  state2D,
  state3D,
  angle2D,
  azimuth3D,
  elevation3D,
  normal,
  error,
  open,
  onOpenChange,
  onModeChange,
  onState2DChange,
  onState3DChange,
  onAngle2DChange,
  onAzimuth3DChange,
  onElevation3DChange,
  onReset,
}: ControlPanelProps) {
  return (
    <aside className={`control-panel panel${open ? ' is-open' : ''}`}>
      <button
        className="mobile-controls-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="analysis-controls"
        onClick={() => onOpenChange(!open)}
      >
        <span>Analysis parameters</span>
        <span aria-hidden="true">{open ? 'Collapse' : 'Expand'}</span>
      </button>

      <div className="controls-body" id="analysis-controls">
        <div className="panel-kicker">Analysis parameters</div>
        <div className="preset-row" aria-label="Analysis dimension">
          <button
            className="preset-button"
            type="button"
            aria-pressed={mode === '2d'}
            onClick={() => onModeChange('2d')}
          >
            2D
          </button>
          <button
            className="preset-button"
            type="button"
            aria-pressed={mode === '3d'}
            onClick={() => onModeChange('3d')}
          >
            3D
          </button>
        </div>

        {mode === '2d' ? (
          <Controls2D
            state={state2D}
            angle={angle2D}
            onStateChange={onState2DChange}
            onAngleChange={onAngle2DChange}
          />
        ) : (
          <Controls3D
            state={state3D}
            azimuth={azimuth3D}
            elevation={elevation3D}
            normal={normal}
            onStateChange={onState3DChange}
            onAzimuthChange={onAzimuth3DChange}
            onElevationChange={onElevation3DChange}
          />
        )}

        <p className="unit-note">Use one consistent unit for every stress component.</p>
        {error ? (
          <p className="error-banner" role="alert">
            {error}
          </p>
        ) : null}

        <button className="reset-button" type="button" onClick={onReset}>
          <span aria-hidden="true">↺</span>
          Reset reference state
        </button>
      </div>
    </aside>
  )
}
