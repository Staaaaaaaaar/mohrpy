import { formatValue } from '../math/format'
import type { AnalysisResult } from '../math/types'

type DataRow = {
  label: string
  value: string
  featured?: boolean
}

type DataGroup = {
  title: string
  rows: DataRow[]
}

function dataGroups(result: AnalysisResult): DataGroup[] {
  if (result.mode === '2d') {
    return [
      {
        title: 'Principal stresses',
        rows: [
          { label: 'σ₁', value: formatValue(result.principals[0]), featured: true },
          { label: 'σ₂', value: formatValue(result.principals[1]), featured: true },
          { label: 'τ max', value: formatValue(result.maxShear) },
        ],
      },
      {
        title: 'Selected plane',
        rows: [
          { label: 'σₙ', value: formatValue(result.traction.sigmaN), featured: true },
          { label: 'τ', value: formatValue(result.traction.tau) },
          {
            label: 'n',
            value: `(${formatValue(result.normal.nx, 3)}, ${formatValue(result.normal.ny, 3)})`,
          },
        ],
      },
      {
        title: 'Circle geometry',
        rows: [
          { label: 'Center C', value: formatValue(result.circle.center) },
          { label: 'Radius R', value: formatValue(result.circle.radius) },
        ],
      },
    ]
  }

  return [
    {
      title: 'Principal stresses',
      rows: [
        ...result.principals.map((value, index) => ({
          label: `σ${index + 1}`,
          value: formatValue(value),
          featured: true,
        })),
        { label: 'τ max', value: formatValue(result.maxShear) },
      ],
    },
    {
      title: 'Selected plane',
      rows: [
        { label: 'σₙ', value: formatValue(result.traction.sigmaN), featured: true },
        { label: '|τ|', value: formatValue(result.traction.tau) },
        {
          label: 'τ vector',
          value: `(${result.traction.shearVector
            .map((value) => formatValue(value, 3))
            .join(', ')})`,
        },
      ],
    },
    {
      title: 'Stress invariants',
      rows: [
        { label: 'First invariant I₁', value: formatValue(result.invariants.i1) },
        { label: 'Second invariant I₂', value: formatValue(result.invariants.i2) },
        { label: 'Third invariant I₃', value: formatValue(result.invariants.i3) },
      ],
    },
  ]
}

export function DataPanel({ result }: { result: AnalysisResult }) {
  const groups = dataGroups(result)

  return (
    <section className="data-panel-content" aria-labelledby="results-heading">
      <header className="result-heading">
        <div className="panel-kicker">Current solution</div>
        <h2 id="results-heading">{result.mode === '2d' ? '2D solution' : '3D solution'}</h2>
      </header>

      <div className="key-result">
        <span className="result-mark" aria-hidden="true" />
        <div>
          <small>Selected plane</small>
          <strong>
            σₙ {formatValue(result.traction.sigmaN)}
          </strong>
        </div>
        <code>τ {formatValue(result.traction.tau)}</code>
      </div>

      {groups.map((group) => (
        <section className="data-section" key={group.title}>
          <h3 className="section-label">{group.title}</h3>
          <dl className="data-list">
            {group.rows.map((row) => (
              <div className={row.featured ? 'data-row featured' : 'data-row'} key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <p className="data-note">
        {result.mode === '2d'
          ? '2D shear stress retains its tangential sign.'
          : '3D shear stress is shown as a non-negative vector magnitude.'}
      </p>
    </section>
  )
}
