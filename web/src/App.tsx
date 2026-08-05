import { useMemo, useRef, useState } from 'react'

import { Controls2D } from './components/Controls2D'
import { Controls3D } from './components/Controls3D'
import { ExportButtons } from './components/ExportButtons'
import { MohrPlot } from './components/MohrPlot'
import { ResultsPanel } from './components/ResultsPanel'
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
  return error instanceof Error ? error.message : '计算失败，请检查输入。'
}

function App() {
  const [mode, setMode] = useState<AppMode>('2d')
  const [state2D, setState2D] = useState<StressState2D>(DEFAULT_STRESS_2D)
  const [state3D, setState3D] = useState<StressState3D>(DEFAULT_STRESS_3D)
  const [angle2D, setAngle2D] = useState(30)
  const [azimuth3D, setAzimuth3D] = useState(45)
  const [elevation3D, setElevation3D] = useState(20)
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
    <main className="app-shell">
      <header className="site-header">
        <a className="brand" href={import.meta.env.BASE_URL} aria-label="mohrpy 首页">
          <span className="brand-mark" aria-hidden="true">M</span>
          <span>mohrpy</span>
        </a>
        <a
          className="github-link"
          href="https://github.com/Staaaaaaaaar/mohrpy"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </header>

      <section className="hero-copy">
        <p className="eyebrow">INTERACTIVE STRESS ANALYSIS</p>
        <h1>交互式 Mohr 圆</h1>
        <p>
          实时探索二维与三维应力状态。输入分量、调整截面方向，并观察主应力与剪应力如何变化。
        </p>
      </section>

      <section className="workspace" aria-label="Mohr 圆分析工作区">
        <aside className="panel controls-panel">
          <p className="section-kicker">Analysis controls</p>
          <div className="mode-switcher" aria-label="分析维度">
            <button
              className="mode-button"
              type="button"
              aria-pressed={mode === '2d'}
              onClick={() => setMode('2d')}
            >
              2D 单圆
            </button>
            <button
              className="mode-button"
              type="button"
              aria-pressed={mode === '3d'}
              onClick={() => setMode('3d')}
            >
              3D 三圆
            </button>
          </div>

          {mode === '2d' ? (
            <Controls2D
              state={state2D}
              angle={angle2D}
              onStateChange={setState2D}
              onAngleChange={setAngle2D}
            />
          ) : (
            <Controls3D
              state={state3D}
              azimuth={azimuth3D}
              elevation={elevation3D}
              normal={
                outcome.result?.mode === '3d'
                  ? outcome.result.normal
                  : undefined
              }
              onStateChange={setState3D}
              onAzimuthChange={setAzimuth3D}
              onElevationChange={setElevation3D}
            />
          )}

          <section className="control-section">
            <button
              className="button"
              type="button"
              onClick={resetCurrentMode}
            >
              恢复示例数据
            </button>
            <p className="plot-subtitle" style={{ marginTop: 10 }}>
              所有应力分量必须使用相同单位。
            </p>
          </section>

          {outcome.error ? (
            <p className="error-banner" role="alert">
              {outcome.error}
            </p>
          ) : null}
        </aside>

        <section className="panel plot-panel">
          <header className="plot-toolbar">
            <div>
              <h2 className="panel-heading">
                {mode === '2d' ? '二维 Mohr 圆' : '三维 Mohr 三圆'}
              </h2>
              <p className="plot-subtitle">
                横轴为正应力 σ，纵轴为剪应力 τ，拉应力取正。
              </p>
            </div>
            {outcome.result ? (
              <ExportButtons svgRef={svgRef} mode={mode} />
            ) : null}
          </header>

          <div className="plot-frame">
            {outcome.result ? (
              <MohrPlot ref={svgRef} result={outcome.result} />
            ) : (
              <div className="plot-empty">
                输入有效的有限数值后，Mohr 圆将在这里实时更新。
              </div>
            )}
          </div>
        </section>
      </section>

      {outcome.result ? <ResultsPanel result={outcome.result} /> : null}

      <footer className="site-footer">
        <span>基于 mohrpy 数学模型 · 结果仅供分析与教学参考</span>
        <span>2D τ 有符号 · 3D τ 为模长</span>
      </footer>
    </main>
  )
}

export default App
