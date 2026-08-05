import { formatValue } from '../math/format'
import type { AnalysisResult } from '../math/types'

type ResultItem = {
  label: string
  value: string
  note?: string
}

function resultItems(result: AnalysisResult): ResultItem[] {
  if (result.mode === '2d') {
    return [
      { label: '主应力 σ₁', value: formatValue(result.principals[0]) },
      { label: '主应力 σ₂', value: formatValue(result.principals[1]) },
      {
        label: '面内最大剪应力',
        value: formatValue(result.maxShear),
        note: '(σ₁ − σ₂) / 2',
      },
      { label: '圆心 C', value: formatValue(result.circle.center) },
      { label: '半径 R', value: formatValue(result.circle.radius) },
      {
        label: '截面正应力 σₙ',
        value: formatValue(result.traction.sigmaN),
      },
      {
        label: '截面剪应力 τ',
        value: formatValue(result.traction.tau),
        note: '相对逆时针切向的有符号分量',
      },
      {
        label: '单位法向 n',
        value: `(${formatValue(result.normal.nx, 3)}, ${formatValue(result.normal.ny, 3)})`,
      },
    ]
  }

  return [
    { label: '主应力 σ₁', value: formatValue(result.principals[0]) },
    { label: '主应力 σ₂', value: formatValue(result.principals[1]) },
    { label: '主应力 σ₃', value: formatValue(result.principals[2]) },
    {
      label: '最大剪应力',
      value: formatValue(result.maxShear),
      note: '(σ₁ − σ₃) / 2',
    },
    {
      label: '截面正应力 σₙ',
      value: formatValue(result.traction.sigmaN),
    },
    {
      label: '剪应力模长 |τ|',
      value: formatValue(result.traction.tau),
      note: '始终大于或等于零',
    },
    { label: '第一不变量 I₁', value: formatValue(result.invariants.i1) },
    { label: '第二不变量 I₂', value: formatValue(result.invariants.i2) },
    { label: '第三不变量 I₃', value: formatValue(result.invariants.i3) },
    {
      label: '外圆圆心 C₁₃',
      value: formatValue(result.circles.circle13.center),
    },
    {
      label: '外圆半径 R₁₃',
      value: formatValue(result.circles.circle13.radius),
    },
    {
      label: '剪应力向量',
      value: `(${result.traction.shearVector
        .map((value) => formatValue(value, 3))
        .join(', ')})`,
    },
  ]
}

export function ResultsPanel({ result }: { result: AnalysisResult }) {
  const items = resultItems(result)

  return (
    <section className="results-section" aria-labelledby="results-heading">
      <header className="results-header">
        <h2 className="panel-heading" id="results-heading">
          计算结果
        </h2>
        <p>数值沿用输入应力单位；页面不执行单位换算。</p>
      </header>

      <dl className="results-grid">
        {items.map((item) => (
          <div className="result-card" key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
            {item.note ? <small>{item.note}</small> : null}
          </div>
        ))}
      </dl>

      <div className="explanation">
        {result.mode === '2d'
          ? '二维点位于 Mohr 圆周上。这里的最大剪应力是 x–y 平面内的最大值；若将其解释为平面应力的三维状态，还需要同时考虑 σz = 0。'
          : '三维截面点使用剪应力向量的模长，因此绘制在 τ ≥ 0 半平面。一般截面点位于 σ₁–σ₃ 外圆内部，并不要求落在任一圆周上。'}
      </div>
    </section>
  )
}
