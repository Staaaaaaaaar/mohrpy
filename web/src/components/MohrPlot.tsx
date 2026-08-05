import { forwardRef, useId } from 'react'

import { formatTick, formatValue } from '../math/format'
import {
  boundsForAnalysis,
  createPlotTransform,
  DEFAULT_PLOT_MARGINS,
  niceTicks,
} from '../math/plot'
import type {
  AnalysisResult,
  CircleGeometry,
} from '../math/types'

const WIDTH = 940
const HEIGHT = 580

type MohrPlotProps = {
  result: AnalysisResult
}

type CircleSpec = {
  geometry: CircleGeometry
  className: string
  label: string
}

export const MohrPlot = forwardRef<SVGSVGElement, MohrPlotProps>(
  function MohrPlot({ result }, ref) {
    const titleId = useId()
    const descriptionId = useId()
    const clipId = useId().replaceAll(':', '')
    const transform = createPlotTransform(
      boundsForAnalysis(result),
      WIDTH,
      HEIGHT,
    )
    const { bounds, mapX, mapY, scale } = transform
    const xTicks = niceTicks(bounds.sigmaMin, bounds.sigmaMax, 7)
    const yTicks = niceTicks(bounds.tauMin, bounds.tauMax, 6)
    const circles: CircleSpec[] =
      result.mode === '2d'
        ? [
            {
              geometry: result.circle,
              className: 'circle-2d',
              label: '2D Mohr 圆',
            },
          ]
        : [
            {
              geometry: result.circles.circle12,
              className: 'circle-12',
              label: '圆 1–2',
            },
            {
              geometry: result.circles.circle23,
              className: 'circle-23',
              label: '圆 2–3',
            },
            {
              geometry: result.circles.circle13,
              className: 'circle-13',
              label: '圆 1–3',
            },
          ]
    const principals = result.principals
    const selectedX = mapX(result.traction.sigmaN)
    const selectedY = mapY(result.traction.tau)
    const plotLeft = DEFAULT_PLOT_MARGINS.left
    const plotRight = WIDTH - DEFAULT_PLOT_MARGINS.right
    const plotTop = DEFAULT_PLOT_MARGINS.top
    const plotBottom = HEIGHT - DEFAULT_PLOT_MARGINS.bottom

    return (
      <svg
        ref={ref}
        className="mohr-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id={titleId}>
          {result.mode === '2d' ? '二维 Mohr 圆' : '三维 Mohr 三圆'}
        </title>
        <desc id={descriptionId}>
          横轴为正应力，纵轴为剪应力。图中标出了主应力和当前截面对应的应力点。
        </desc>
        <defs>
          <clipPath id={clipId}>
            <rect
              x={plotLeft}
              y={plotTop}
              width={plotRight - plotLeft}
              height={plotBottom - plotTop}
            />
          </clipPath>
        </defs>

        <rect className="plot-bg" width={WIDTH} height={HEIGHT} />

        {xTicks.map((tick) => {
          const x = mapX(tick)
          return (
            <g key={`x-${tick}`}>
              <line
                className="plot-grid"
                x1={x}
                x2={x}
                y1={plotTop}
                y2={plotBottom}
              />
              <text
                className="plot-tick-label"
                x={x}
                y={plotBottom + 22}
                textAnchor="middle"
              >
                {formatTick(tick)}
              </text>
            </g>
          )
        })}

        {yTicks.map((tick) => {
          const y = mapY(tick)
          return (
            <g key={`y-${tick}`}>
              <line
                className="plot-grid"
                x1={plotLeft}
                x2={plotRight}
                y1={y}
                y2={y}
              />
              <text
                className="plot-tick-label"
                x={plotLeft - 10}
                y={y + 4}
                textAnchor="end"
              >
                {formatTick(tick)}
              </text>
            </g>
          )
        })}

        {bounds.tauMin <= 0 && bounds.tauMax >= 0 ? (
          <line
            className="plot-axis"
            x1={plotLeft}
            x2={plotRight}
            y1={mapY(0)}
            y2={mapY(0)}
          />
        ) : null}
        {bounds.sigmaMin <= 0 && bounds.sigmaMax >= 0 ? (
          <line
            className="plot-axis"
            x1={mapX(0)}
            x2={mapX(0)}
            y1={plotTop}
            y2={plotBottom}
          />
        ) : null}

        <g clipPath={`url(#${clipId})`}>
          {circles.map(({ geometry, className, label }) => (
            <circle
              key={label}
              className={className}
              cx={mapX(geometry.center)}
              cy={mapY(0)}
              r={Math.max(geometry.radius * scale, 1.5)}
            >
              <title>
                {label}：C = {formatValue(geometry.center)}，R ={' '}
                {formatValue(geometry.radius)}
              </title>
            </circle>
          ))}

          <line
            className="selected-guide"
            x1={selectedX}
            x2={selectedX}
            y1={mapY(0)}
            y2={selectedY}
          />

          {principals.map((principal, index) => (
            <g key={`principal-${index}`}>
              <circle
                className="principal-point"
                cx={mapX(principal)}
                cy={mapY(0)}
                r="5"
              >
                <title>
                  σ{index + 1} = {formatValue(principal)}
                </title>
              </circle>
              <text
                className="plot-annotation"
                x={mapX(principal)}
                y={mapY(0) + (index % 2 === 0 ? -10 : 18)}
                textAnchor="middle"
              >
                σ{index + 1}
              </text>
            </g>
          ))}

          <circle
            className="selected-point"
            cx={selectedX}
            cy={selectedY}
            r="7"
            data-testid="selected-plane-point"
            data-sigma={result.traction.sigmaN}
            data-tau={result.traction.tau}
          >
            <title>
              选中截面：σₙ = {formatValue(result.traction.sigmaN)}，τ ={' '}
              {formatValue(result.traction.tau)}
            </title>
          </circle>
        </g>

        <text
          className="plot-axis-label"
          x={(plotLeft + plotRight) / 2}
          y={HEIGHT - 14}
          textAnchor="middle"
        >
          正应力 σ
        </text>
        <text
          className="plot-axis-label"
          x={18}
          y={(plotTop + plotBottom) / 2}
          textAnchor="middle"
          transform={`rotate(-90 18 ${(plotTop + plotBottom) / 2})`}
        >
          剪应力 τ
        </text>

        <g transform={`translate(${plotRight - 120} ${plotTop + 14})`}>
          {circles.map(({ className, label }, index) => (
            <g key={`legend-${label}`} transform={`translate(0 ${index * 20})`}>
              <line className={className} x1="0" x2="24" y1="0" y2="0" />
              <text className="plot-legend" x="32" y="4">
                {label}
              </text>
            </g>
          ))}
          <g transform={`translate(0 ${circles.length * 20})`}>
            <circle className="selected-point" cx="12" cy="0" r="4" />
            <text className="plot-legend" x="32" y="4">
              选中截面
            </text>
          </g>
        </g>
      </svg>
    )
  },
)
