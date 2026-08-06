import { useMemo, useRef, useState } from 'react'

import { ControlPanel } from './components/ControlPanel'
import { DataPanel } from './components/DataPanel'
import { ExportButtons } from './components/ExportButtons'
import { MohrPlot } from './components/MohrPlot'
import { analyze2D, DEFAULT_STRESS_2D } from './math/mohr2d'
import { analyze3D, DEFAULT_STRESS_3D } from './math/mohr3d'
import type {
  AnalysisResult,
  AppMode,
  StressState2D,
  StressState3D,
} from './math/types'

type AnalysisOutcome = {
  result: AnalysisResult | null
  error: string | null
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Analysis failed. Check the input values.'
}

function App() {
  const [mode, setMode] = useState<AppMode>('2d')
  const [state2D, setState2D] = useState<StressState2D>(DEFAULT_STRESS_2D)
  const [state3D, setState3D] = useState<StressState3D>(DEFAULT_STRESS_3D)
  const [angle2D, setAngle2D] = useState(30)
  const [azimuth3D, setAzimuth3D] = useState(45)
  const [elevation3D, setElevation3D] = useState(20)
  const [controlsOpen, setControlsOpen] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const outcome = useMemo<AnalysisOutcome>(() => {
    try {
      const result =
        mode === '2d'
          ? analyze2D(state2D, angle2D)
          : analyze3D(state3D, azimuth3D, elevation3D)
      return { result, error: null }
    } catch (error) {
      return { result: null, error: errorMessage(error) }
    }
  }, [angle2D, azimuth3D, elevation3D, mode, state2D, state3D])

  const resetCurrentMode = () => {
    if (mode === '2d') {
      setState2D(DEFAULT_STRESS_2D)
      setAngle2D(30)
    } else {
      setState3D(DEFAULT_STRESS_3D)
      setAzimuth3D(45)
      setElevation3D(20)
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#analysis-workspace">
        Skip to analysis workspace
      </a>
      <header className="site-header">
        <a className="brand" href={import.meta.env.BASE_URL} aria-label="mohrpy home">
          <b>mohrpy</b>
          <small>Studio</small>
        </a>
        <a
          className="github-link"
          href="https://github.com/Staaaaaaaaar/mohrpy"
          target="_blank"
          rel="noreferrer"
          aria-label="View mohrpy on GitHub"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16">
            <path
              fill="currentColor"
              d="M8 0C3.58 0 0 3.64 0 8.13c0 3.59 2.29 6.64 5.47 7.71.4.08.55-.18.55-.39 0-.19-.01-.83-.01-1.51-2.01.38-2.53-.5-2.69-.96-.09-.23-.48-.96-.82-1.15-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.83.72 1.23 1.87.88 2.33.67.07-.53.28-.88.51-1.08-1.78-.21-3.64-.91-3.64-4.02 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.47 7.47 0 0 1 8 3.91c.68 0 1.36.09 2 .27 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.29.82 2.19 0 3.12-1.87 3.81-3.65 4.02.29.25.54.74.54 1.51 0 1.09-.01 1.96-.01 2.23 0 .21.15.47.55.39A8.13 8.13 0 0 0 16 8.13C16 3.64 12.42 0 8 0Z"
            />
          </svg>
        </a>
      </header>

      <main>
        <section className="instrument-heading">
          <div>
            <h1>Mohr circle explorer</h1>
          </div>
          <p>
            Adjust the stress tensor and plane orientation to inspect principal
            stresses, plane traction and Mohr circle geometry in real time.
          </p>
        </section>

        <section
          className="workspace"
          id="analysis-workspace"
          aria-label="Mohr circle analysis workspace"
        >
          <ControlPanel
            mode={mode}
            state2D={state2D}
            state3D={state3D}
            angle2D={angle2D}
            azimuth3D={azimuth3D}
            elevation3D={elevation3D}
            normal={
              outcome.result?.mode === '3d' ? outcome.result.normal : undefined
            }
            error={outcome.error}
            open={controlsOpen}
            onOpenChange={setControlsOpen}
            onModeChange={setMode}
            onState2DChange={setState2D}
            onState3DChange={setState3D}
            onAngle2DChange={setAngle2D}
            onAzimuth3DChange={setAzimuth3D}
            onElevation3DChange={setElevation3D}
            onReset={resetCurrentMode}
          />

          <section className="plot-stage" aria-labelledby="plot-heading">
            <div className="stage-meta">
              <span>{mode === '2d' ? 'Plane stress / 2D' : 'Stress tensor / 3D'}</span>
              <span className="drag-hint">
                {mode === '2d' ? 'Drag the point to rotate the plane' : 'Move to inspect σ / τ'}
              </span>
            </div>
            <header className="plot-heading">
              <div className="plot-heading-copy">
                <h2 id="plot-heading">
                  {mode === '2d' ? '2D Mohr circle' : '3D Mohr circles'}
                </h2>
                <p>Normal stress σ on the horizontal axis; shear stress τ vertically.</p>
              </div>
              {outcome.result ? (
                <ExportButtons svgRef={svgRef} mode={mode} />
              ) : null}
            </header>
            <div className="plot-frame">
              {outcome.result ? (
                <MohrPlot
                  ref={svgRef}
                  result={outcome.result}
                  onAngleChange={
                    outcome.result.mode === '2d' ? setAngle2D : undefined
                  }
                />
              ) : (
                <div className="plot-empty">
                  Enter finite values to restore the Mohr circle.
                </div>
              )}
            </div>
            <div className="stage-legend" aria-label="Plot legend">
              {mode === '3d' ? (
                <>
                  <span><i className="legend-line circle-13" />Circle 1–3</span>
                  <span><i className="legend-line circle-12" />Circle 1–2</span>
                  <span><i className="legend-line circle-23" />Circle 2–3</span>
                </>
              ) : (
                <span><i className="legend-line circle-2d" />Mohr circle</span>
              )}
              <span><i className="legend-point" />Selected plane</span>
            </div>
          </section>

          <aside className="data-panel panel" aria-live="polite">
            {outcome.result ? (
              <DataPanel result={outcome.result} />
            ) : (
              <div className="results-empty">
                <div className="panel-kicker">Current solution</div>
                <h2>Waiting for valid input</h2>
                <p>Correct the invalid value to restore the analysis.</p>
              </div>
            )}
          </aside>
        </section>
      </main>
    </div>
  )
}

export default App
