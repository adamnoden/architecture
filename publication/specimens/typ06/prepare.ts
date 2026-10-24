import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'

import { fetchOpenFontCandidate } from '../typ03/open-fonts.js'

const repoRoot = resolve(import.meta.dirname, '../../..')
const format = process.env.TYP06_FORMAT === 'a4' ? 'a4' : 'b5'
const workRoot = resolve(repoRoot, 'publication/.work/typ06b', format)

const sourcePaths = {
  groundPlan: 'docs/reference-house/publication-ground-floor-plan.svg',
  principalSection: 'docs/reference-house/publication-principal-section.svg'
} as const

const expectedGeometry = {
  groundPlan: { widthMm: 136, heightMm: 145 },
  principalSection: { widthMm: 166, heightMm: 92 }
} as const

const legacyFamily = 'font-family:Arial, Helvetica, sans-serif'
const candidateFamily = 'font-family:"TYP06 Source Sans"'
const numericRule = '.text-note{font-variant-numeric:tabular-nums}'

const sha256 = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex')

const dataTransport = (path: string): { mime: string; format: string } => {
  const extension = extname(path).toLowerCase()
  if (extension === '.ttf') return { mime: 'font/ttf', format: 'truetype' }
  if (extension === '.otf') return { mime: 'font/otf', format: 'opentype' }
  if (extension === '.woff2') return { mime: 'font/woff2', format: 'woff2' }
  throw new Error(`Unsupported TYP-06 font extension: ${extension || '(none)'}`)
}

await rm(workRoot, { recursive: true, force: true })
await mkdir(workRoot, { recursive: true })

const fontEnv = await fetchOpenFontCandidate('source')
const faces = [
  ['TYP03_SANS_REGULAR', 400],
  ['TYP03_SANS_BOLD', 700]
] as const

const faceRules: string[] = []
const fontFingerprints: Record<string, { sourceName: string; sha256: string }> = {}
for (const [envName, weight] of faces) {
  const sourcePath = fontEnv[envName]
  const bytes = await readFile(sourcePath)
  const transport = dataTransport(sourcePath)
  const dataUri = `data:${transport.mime};base64,${bytes.toString('base64')}`
  faceRules.push(
    `@font-face{font-family:"TYP06 Source Sans";src:url("${dataUri}") format("${transport.format}");font-style:normal;font-weight:${weight};font-display:block}`
  )
  fontFingerprints[envName] = {
    sourceName: sourcePath.split('/').at(-1) ?? sourcePath,
    sha256: sha256(bytes)
  }
}

const injectedCss = `${faceRules.join('')}${numericRule}`

const assertGeometry = (name: keyof typeof expectedGeometry, svg: string): void => {
  const expected = expectedGeometry[name]
  const opening = svg.match(/^<svg[^>]+>/)?.[0]
  if (!opening) throw new Error(`TYP-06B ${name} source has no SVG opening element.`)
  if (!opening.includes(`width="${expected.widthMm}mm"`) || !opening.includes(`height="${expected.heightMm}mm"`)) {
    throw new Error(`TYP-06B ${name} source geometry drifted from ${expected.widthMm} × ${expected.heightMm} mm.`)
  }
}

const transformSvg = (name: keyof typeof sourcePaths, canonical: string): string => {
  assertGeometry(name, canonical)

  const legacyCount = canonical.split(legacyFamily).length - 1
  if (legacyCount !== 3) {
    throw new Error(`TYP-06B ${name} expected exactly three released Arial-family declarations; found ${legacyCount}.`)
  }
  if (!canonical.includes('<style>')) throw new Error(`TYP-06B ${name} source has no inline style boundary.`)

  const transformed = canonical
    .replace('<style>', `<style>${injectedCss}`)
    .replaceAll(legacyFamily, candidateFamily)

  if (transformed.includes(legacyFamily)) throw new Error(`TYP-06B ${name} retained a legacy Arial-family declaration.`)
  const transformedWithoutInjectedCss = transformed.replace(`<style>${injectedCss}`, '<style>')
  if ((transformedWithoutInjectedCss.split(candidateFamily).length - 1) !== 3) {
    throw new Error(`TYP-06B ${name} did not map all three semantic text roles to the candidate family.`)
  }

  // Prove the specimen transformation is typography-only. Removing the injected
  // face/numeral rules and restoring the released working-family declaration must
  // reproduce the protected canonical SVG bytes exactly.
  const reversed = transformedWithoutInjectedCss.replaceAll(candidateFamily, legacyFamily)
  if (reversed !== canonical) {
    throw new Error(`TYP-06B ${name} transformation changed more than the authorised typography seam.`)
  }

  return transformed
}

const canonicalEntries = await Promise.all(
  Object.entries(sourcePaths).map(async ([name, path]) => {
    const canonical = await readFile(resolve(repoRoot, path), 'utf8')
    const transformed = transformSvg(name as keyof typeof sourcePaths, canonical)
    return [name, { path, canonical, transformed }] as const
  })
)
const drawings = Object.fromEntries(canonicalEntries) as Record<
  keyof typeof sourcePaths,
  { path: string; canonical: string; transformed: string }
>

for (const [name, drawing] of Object.entries(drawings)) {
  await writeFile(resolve(workRoot, `${name}.source-sans.svg`), drawing.transformed, 'utf8')
}

const pageSize = format === 'b5' ? 'B5' : 'A4'
const contentHeight = format === 'b5' ? '240mm' : '287mm'
const html = `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <title>TYP-06B drawing-interface proof — ${format.toUpperCase()}</title>
  <style>
    @page { size: ${pageSize}; margin: 5mm; }
    html, body { margin: 0; padding: 0; background: #fff; }
    .proof-page {
      box-sizing: border-box;
      width: 100%;
      height: ${contentHeight};
      display: flex;
      align-items: center;
      justify-content: center;
      break-after: page;
    }
    .proof-page:last-child { break-after: auto; }
    .proof-page > svg { flex: none; }
  </style>
</head>
<body>
  <section class="proof-page">${drawings.groundPlan.transformed}</section>
  <section class="proof-page">${drawings.principalSection.transformed}</section>
</body>
</html>`
await writeFile(resolve(workRoot, 'specimen.html'), html, 'utf8')

const manifest = {
  schemaVersion: 1,
  packet: 'TYP-06B',
  format,
  proofBoundary: 'only inline architectural SVG text may contribute Source Sans fonts to the PDF',
  candidate: {
    family: 'Source Sans 3',
    faces: ['regular-400', 'bold-700'],
    italic: 'not-admitted',
    numericFeature: 'tabular-nums on existing note role',
    textGeometry: {
      labelPt: 7.5,
      notePt: 6.5,
      markerPt: 6.5,
      weights: { label: 400, note: 400, marker: 700 }
    }
  },
  canonicalMutation: false,
  sources: Object.fromEntries(
    Object.entries(drawings).map(([name, drawing]) => [name, {
      path: drawing.path,
      canonicalSha256: sha256(drawing.canonical),
      transformedSha256: sha256(drawing.transformed),
      geometry: expectedGeometry[name as keyof typeof expectedGeometry]
    }])
  ),
  fontFingerprints
}
await writeFile(resolve(workRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log(`Prepared TYP-06B ${format.toUpperCase()} drawing-interface specimen.`)
