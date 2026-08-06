import {
  forwardRef,
  useId,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'

import { formatTick, formatValue } from '../math/format'
import { angleDegreesFromMohrPoint } from '../math/mohr2d'
import {
  boundsForAnalysis,
  createPlotTransform,
  DEFAULT_PLOT_MARGINS,
  niceTicks,
} from '../math/plot'
import type { AnalysisResult, CircleGeometry } from '../math/types'

const WIDTH = 940
const HEIGHT = 580

type MohrPlotProps = {
  result: AnalysisResult
  onAngleChange?: (angle: number) => void
}

type CircleSpec = {
  geometry: CircleGeometry
  className: string
  label: string
}

type CursorReadout = {
  x: number
  y: number
  sigma: number
  tau: number
}

function pointerPosition(event: PointerEvent<SVGSVGElement>) {
  const bounds = event.currentTarget.getBoundingClientRect()
  return {
    x: ((event.clientX - bounds.left) / bounds.width) * WIDTH,
    y: ((event.clientY - bounds.top) / bounds.height) * HEIGHT,
  }
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

export const MohrPlot = forwardRef<SVGSVGElement, MohrPlotProps>(
  function MohrPlot({ result, onAngleChange }, ref) {
    const titleId = useId()
    const descriptionId = useId()
    const clipId = useId().replaceAll(':', '')
    const [cursor, setCursor] = useState<CursorReadout | null>(null)
    const [dragging, setDragging] = useState(false)
    const transform = createPlotTransform(
      boundsForAnalysis(result),
      WIDTH,
      HEIGHT,
    )
    const { bounds, mapX, mapY, unmapX, unmapY, scale } = transform
    const xTicks = niceTicks(bounds.sigmaMin, bounds.sigmaMax, 7)
    const yTicks = niceTicks(bounds.tauMin, bounds.tauMax, 6)
    const circles: CircleSpec[] =
      result.mode === '2d'
        ? [
            {
              geometry: result.circle,
              className: 'circle-2d',
              label: '2D Mohr circle',
            },
          ]
        : [
            {
              geometry: result.circles.circle12,
              className: 'circle-12',
              label: 'Circle 1–2',
            },
            {
              geometry: result.circles.circle23,
              className: 'circle-23',
              label: 'Circle 2–3',
            },
            {
              geometry: result.circles.circle13,
              className: 'circle-13',
              label: 'Circle 1–3',
            },
          ]
    const principals = result.principals
    const selectedX = mapX(result.traction.sigmaN)
    const selectedY = mapY(result.traction.tau)
    const plotLeft = DEFAULT_PLOT_MARGINS.left
    const plotRight = WIDTH - DEFAULT_PLOT_MARGINS.right
    const plotTop = DEFAULT_PLOT_MARGINS.top
    const plotBottom = HEIGHT - DEFAULT_PLOT_MARGINS.bottom
    const currentAngle =
      result.mode === '2d'
        ? (((Math.atan2(result.normal.ny, result.normal.nx) * 180) / Math.PI) %
            180 +
            180) %
          180
        : undefined

    const updateCursor = (x: number, y: number) => {
      const boundedX = clamp(x, plotLeft, plotRight)
      const boundedY = clamp(y, plotTop, plotBottom)
      setCursor({
        x: boundedX,
        y: boundedY,
        sigma: unmapX(boundedX),
        tau: unmapY(boundedY),
      })
    }

    const update2DAngle = (x: number, y: number) => {
      if (result.mode !== '2d' || !onAngleChange || result.circle.radius === 0) {
        return
      }
      const sigma = unmapX(x)
      const tau = unmapY(y)
      const dx = sigma - result.circle.center
      const distance = Math.hypot(dx, tau)
      if (distance === 0) {
        return
      }
      const projectedSigma =
        result.circle.center + (dx / distance) * result.circle.radius
      const projectedTau = (tau / distance) * result.circle.radius
      const angle = angleDegreesFromMohrPoint(
        result.state,
        projectedSigma,
        projectedTau,
      )
      if (angle !== null) {
        onAngleChange(angle)
      }
    }

    const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
      const point = pointerPosition(event)
      updateCursor(point.x, point.y)
      if (dragging) {
        update2DAngle(point.x, point.y)
      }
    }

    const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
      if (result.mode !== '2d' || !onAngleChange || result.circle.radius === 0) {
        return
      }
      const point = pointerPosition(event)
      setDragging(true)
      event.currentTarget.setPointerCapture?.(event.pointerId)
      updateCursor(point.x, point.y)
      update2DAngle(point.x, point.y)
    }

    const stopDragging = (event: PointerEvent<SVGSVGElement>) => {
      if (dragging) {
        event.currentTarget.releasePointerCapture?.(event.pointerId)
      }
      setDragging(false)
    }

    const handlePointKeyDown = (event: KeyboardEvent<SVGCircleElement>) => {
      if (currentAngle === undefined || !onAngleChange) {
        return
      }
      const step = event.shiftKey ? 10 : 1
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault()
        onAngleChange((currentAngle - step + 180) % 180)
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault()
        onAngleChange((currentAngle + step) % 180)
      }
    }

    const hudX = cursor ? clamp(cursor.x + 14, plotLeft + 8, plotRight - 158) : 0
    const hudY = cursor ? clamp(cursor.y - 58, plotTop + 8, plotBottom - 58) : 0

    return (
      <svg
        ref={ref}
        className={`mohr-svg${dragging ? ' is-dragging' : ''}`}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-labelledby={`${titleId} ${descriptionId}`}
        xmlns="http://www.w3.org/2000/svg"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onPointerLeave={(event) => {
          stopDragging(event)
          setCursor(null)
        }}
      >
        <title id={titleId}>
          {result.mode === '2d' ? '2D Mohr circle' : '3D Mohr circles'}
        </title>
        <desc id={descriptionId}>
          Normal stress is horizontal and shear stress is vertical. Principal
          stresses and the selected plane are marked.
          {result.mode === '2d' ? ' Drag the selected point to rotate the plane.' : ''}
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
                {label}: C = {formatValue(geometry.center)}, R ={' '}
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
            <circle
              key={`principal-${index}`}
              className="principal-point"
              cx={mapX(principal)}
              cy={mapY(0)}
              r="5"
            >
              <title>
                σ{index + 1} = {formatValue(principal)}
              </title>
            </circle>
          ))}

          {cursor ? (
            <g className="cursor-crosshair" aria-hidden="true">
              <line
                x1={cursor.x}
                x2={cursor.x}
                y1={plotTop}
                y2={plotBottom}
              />
              <line
                x1={plotLeft}
                x2={plotRight}
                y1={cursor.y}
                y2={cursor.y}
              />
            </g>
          ) : null}

          <circle
            className="selected-halo"
            cx={selectedX}
            cy={selectedY}
            r="12"
            aria-hidden="true"
          />
          <circle
            className="selected-point"
            cx={selectedX}
            cy={selectedY}
            r="7"
            data-testid="selected-plane-point"
            data-sigma={result.traction.sigmaN}
            data-tau={result.traction.tau}
            tabIndex={result.mode === '2d' ? 0 : undefined}
            role={result.mode === '2d' ? 'slider' : undefined}
            aria-label={result.mode === '2d' ? '2D plane angle' : undefined}
            aria-valuemin={result.mode === '2d' ? 0 : undefined}
            aria-valuemax={result.mode === '2d' ? 180 : undefined}
            aria-valuenow={
              currentAngle === undefined ? undefined : Math.round(currentAngle)
            }
            onKeyDown={handlePointKeyDown}
          >
            <title>
              Selected plane: σₙ = {formatValue(result.traction.sigmaN)}, τ ={' '}
              {formatValue(result.traction.tau)}
            </title>
          </circle>
        </g>

        <rect
          className="plot-hit-area"
          x={plotLeft}
          y={plotTop}
          width={plotRight - plotLeft}
          height={plotBottom - plotTop}
          aria-hidden="true"
        />

        <text
          className="plot-axis-label"
          x={(plotLeft + plotRight) / 2}
          y={HEIGHT - 14}
          textAnchor="middle"
        >
          Normal stress σ
        </text>
        <text
          className="plot-axis-label"
          x={18}
          y={(plotTop + plotBottom) / 2}
          textAnchor="middle"
          transform={`rotate(-90 18 ${(plotTop + plotBottom) / 2})`}
        >
          Shear stress τ
        </text>

        {cursor ? (
          <g
            className="cursor-hud"
            transform={`translate(${hudX} ${hudY})`}
            aria-hidden="true"
          >
            <rect width="150" height="50" rx="3" />
            <text x="12" y="20">
              σ {formatValue(cursor.sigma)}
            </text>
            <text x="12" y="39">
              τ {formatValue(cursor.tau)}
            </text>
          </g>
        ) : null}
      </svg>
    )
  },
)
