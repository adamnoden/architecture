import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = import.meta.dirname
const repoRoot = resolve(root, '../../..')
const sourceWork = resolve(repoRoot, 'publication/specimens/plt03/.work')
const workRoot = resolve(root, '.work')
const sourceRoot = resolve(workRoot, 'source')

const sha256 = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex')
const SCALE_FACTOR = 2

const scaleNumber = (value: string): string => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) throw new Error(`PLT-03B.1 cannot scale non-finite SVG coordinate ${value}.`)
  const scaled = Math.round(numeric * SCALE_FACTOR * 1000) / 1000
  return Object.is(scaled, -0) ? '0' : String(scaled)
}

const scaleAttribute = (line: string, attribute: string): string => {
  const pattern = new RegExp(`\\b${attribute}="(-?\\d+(?:\\.\\d+)?)"`)
  if (!pattern.test(line)) throw new Error(`PLT-03B.1 expected ${attribute} on: ${line}`)
  return line.replace(pattern, (_match, value: string) => `${attribute}="${scaleNumber(value)}"`)
}

const scaleRotationPivot = (line: string): string =>
  line.replace(
    /transform="rotate\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\)"/,
    (_match, angle: string, x: string, y: string) =>
      `transform="rotate(${angle} ${scaleNumber(x)} ${scaleNumber(y)})"`
  )

const geometryScaleSvgTo50 = (source: string): string => {
  const lines = source.split('\n')
  let sawSvg = false
  let sawLine = false
  let sawRect = false
  let sawText = false

  const transformed = lines.map((rawLine) => {
    if (rawLine.startsWith('<svg ')) {
      sawSvg = true
      if (!rawLine.includes('width="136mm" height="145mm"')) {
        throw new Error('PLT-03B.1 source escaped the controlled 136 × 145 mm envelope.')
      }
      if (!rawLine.includes('viewBox="0 0 136 145"') || !rawLine.includes('data-scale-denominator="100"')) {
        throw new Error('PLT-03B.1 source is not the controlled 1:100 COMBINED specimen.')
      }
      return rawLine
        .replace('width="136mm" height="145mm"', 'width="272mm" height="290mm"')
        .replace('viewBox="0 0 136 145"', 'viewBox="0 0 272 290"')
        .replace('data-scale-denominator="100"', 'data-scale-denominator="50"')
        .replace('data-view-id="PLT03-CURRENT-GROUND-PLAN"', 'data-view-id="PLT03B1-CURRENT-GROUND-PLAN-WALL-50"')
    }

    if (rawLine.startsWith('<line ')) {
      sawLine = true
      return ['x1', 'y1', 'x2', 'y2'].reduce(scaleAttribute, rawLine)
    }

    if (rawLine.startsWith('<rect ')) {
      sawRect = true
      return ['x', 'y', 'width', 'height'].reduce(scaleAttribute, rawLine)
    }

    if (rawLine.startsWith('<text ')) {
      sawText = true
      const scaled = ['x', 'y'].reduce(scaleAttribute, rawLine)
      return scaleRotationPivot(scaled)
    }

    return rawLine
  })

  if (!sawSvg || !sawLine || !sawRect || !sawText) {
    throw new Error(`PLT-03B.1 unexpected SVG grammar: svg=${sawSvg} line=${sawLine} rect=${sawRect} text=${sawText}.`)
  }

  return transformed.join('\n')
}

await rm(workRoot, { recursive: true, force: true })
await mkdir(sourceRoot, { recursive: true })

const combined100 = await readFile(resolve(sourceWork, 'combined.svg'), 'utf8')
const sourceManifestText = await readFile(resolve(sourceWork, 'manifest.json'), 'utf8')
const sourceManifest = JSON.parse(sourceManifestText) as {
  candidates: { combined: { sha256: string; currentAuthority: boolean } }
  semanticDiff: { combined: { classes: string[]; unexplained: unknown[] } }
  fontFingerprints: Record<string, { sha256: string }>
}

if (sha256(combined100) !== sourceManifest.candidates.combined.sha256) {
  throw new Error('PLT-03B.1 source COMBINED SVG does not match its PLT-03A manifest.')
}
if (!sourceManifest.candidates.combined.currentAuthority) {
  throw new Error('PLT-03B.1 source COMBINED candidate is not marked current-authority.')
}
if (sourceManifest.semanticDiff.combined.unexplained.length || sourceManifest.semanticDiff.combined.classes.includes('X')) {
  throw new Error('PLT-03B.1 cannot scale a candidate with unexplained semantic change.')
}

const combined50 = geometryScaleSvgTo50(combined100)

// The physical graphic grammar must be identical. Geometry and declared scale
// change; the CSS style block — including line weights, dash lengths, text sizes
// and exact embedded Source Sans bytes — must not.
const styleOf = (svg: string): string => svg.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? ''
if (!styleOf(combined100) || styleOf(combined50) !== styleOf(combined100)) {
  throw new Error('PLT-03B.1 changed the physical line/type/dash grammar while scaling geometry.')
}

await writeFile(resolve(workRoot, 'combined-100.svg'), combined100, 'utf8')
await writeFile(resolve(workRoot, 'combined-50.svg'), combined50, 'utf8')

const exactFontRules = combined50.match(/@font-face\{[^}]+\}/g) ?? []
if (exactFontRules.length !== 2) throw new Error('PLT-03B.1 expected exact Regular/Bold Source Sans face rules.')
const fontStyle = `<style>${exactFontRules.join('')}</style>`

const page = (scale: 100 | 50, svg: string, verdict: string): string => `
<section class="wall-page wall-${scale}" data-scale="1:${scale}">
  <header class="wall-header">
    <span>COMBINED</span>
    <span>1:${scale}</span>
  </header>
  <div class="wall-drawing wall-drawing-${scale}">${svg}</div>
  <footer class="wall-footer">${verdict}</footer>
</section>`

const html = `<!doctype html>
<html lang="en-GB">
<head><meta charset="utf-8"><title>PLT-03B.1 A2 WALL scale comparison</title>${fontStyle}</head>
<body>
${page(100, combined100, 'PLT-03B · rejected WALL scale profile · mechanically valid')}
${page(50, combined50, 'PLT-03B.1 · true 1:50 WALL candidate · same semantic drawing and physical graphic grammar')}
</body>
</html>`
await writeFile(resolve(sourceRoot, 'wall-comparison.html'), html, 'utf8')

const manifest = {
  schemaVersion: 1,
  packet: 'PLT-03B.1',
  issue: 772,
  sourcePacket: 'PLT-03A COMBINED',
  sourceManifestSha256: sha256(sourceManifestText),
  semanticChange: 'none',
  graphicGrammarChange: 'none',
  profiles: {
    rejected100: {
      sha256: sha256(combined100),
      widthMm: 136,
      heightMm: 145,
      scaleDenominator: 100,
      screenVerdict: 'REJECT_WALL_SCALE'
    },
    candidate50: {
      sha256: sha256(combined50),
      widthMm: 272,
      heightMm: 290,
      scaleDenominator: 50,
      screenVerdict: 'UNREVIEWED'
    }
  },
  a2: {
    pageWidthMm: 420,
    pageHeightMm: 594,
    marginMm: 24,
    contentWidthMm: 372,
    contentHeightMm: 546,
    placement100: { leftMm: 118, topMm: 200.5 },
    placement50: { leftMm: 50, topMm: 128 }
  },
  fontFingerprints: sourceManifest.fontFingerprints,
  physicalVerdict: 'UNREVIEWED'
}
await writeFile(resolve(workRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log('Prepared PLT-03B.1 exact A2 1:100 versus true 1:50 WALL comparison.')
