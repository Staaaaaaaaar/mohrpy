import { useState, type RefObject } from 'react'

type ExportButtonsProps = {
  svgRef: RefObject<SVGSVGElement | null>
  mode: '2d' | '3d'
}

const STYLE_PROPERTIES = [
  'fill',
  'stroke',
  'stroke-width',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'opacity',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
] as const

function serializeSvg(source: SVGSVGElement): string {
  const clone = source.cloneNode(true) as SVGSVGElement
  const sourceElements = [source, ...source.querySelectorAll('*')]
  const clonedElements = [clone, ...clone.querySelectorAll('*')]

  sourceElements.forEach((element, index) => {
    const target = clonedElements[index] as SVGElement | undefined
    if (!target) {
      return
    }
    const computed = window.getComputedStyle(element)
    for (const property of STYLE_PROPERTIES) {
      const value = computed.getPropertyValue(property)
      if (value) {
        target.style.setProperty(property, value)
      }
    }
  })

  clone
    .querySelectorAll('.plot-hit-area, .cursor-crosshair, .cursor-hud')
    .forEach((element) => element.remove())
  clone.setAttribute('width', '940')
  clone.setAttribute('height', '580')
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  return new XMLSerializer().serializeToString(clone)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function timestamp() {
  return new Date().toISOString().replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z')
}

export function ExportButtons({ svgRef, mode }: ExportButtonsProps) {
  const [busy, setBusy] = useState(false)

  const exportSvg = () => {
    if (!svgRef.current) {
      return
    }
    const source = serializeSvg(svgRef.current)
    downloadBlob(
      new Blob([source], { type: 'image/svg+xml;charset=utf-8' }),
      `mohrpy-${mode}-${timestamp()}.svg`,
    )
  }

  const exportPng = async () => {
    if (!svgRef.current || busy) {
      return
    }
    setBusy(true)
    const source = serializeSvg(svgRef.current)
    const svgBlob = new Blob([source], {
      type: 'image/svg+xml;charset=utf-8',
    })
    const url = URL.createObjectURL(svgBlob)

    try {
      const image = new Image()
      image.decoding = 'async'
      image.src = url
      await image.decode()

      const canvas = document.createElement('canvas')
      canvas.width = 1880
      canvas.height = 1160
      const context = canvas.getContext('2d')
      if (!context) {
        throw new Error('Canvas 2D is unavailable in this browser.')
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) =>
            blob ? resolve(blob) : reject(new Error('PNG encoding failed.')),
          'image/png',
        )
      })
      downloadBlob(pngBlob, `mohrpy-${mode}-${timestamp()}.png`)
    } finally {
      URL.revokeObjectURL(url)
      setBusy(false)
    }
  }

  return (
    <div className="action-row export-actions" aria-label="Export plot">
      <button
        className="button secondary"
        type="button"
        aria-label="Export SVG"
        onClick={exportSvg}
      >
        Export SVG
      </button>
      <button
        className="button primary"
        type="button"
        disabled={busy}
        aria-busy={busy}
        aria-label={busy ? 'Exporting PNG' : 'Export PNG'}
        onClick={() => void exportPng()}
      >
        {busy ? 'Exporting…' : 'Export PNG'}
      </button>
    </div>
  )
}
