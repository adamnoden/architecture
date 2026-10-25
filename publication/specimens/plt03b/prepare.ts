import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = import.meta.dirname
const repoRoot = resolve(root, '../../..')
const plt03Work = resolve(repoRoot, 'publication/specimens/plt03/.work')
const workRoot = resolve(root, '.work')
const sourceRoot = resolve(workRoot, 'source')

const sha256 = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex')

await rm(workRoot, { recursive: true, force: true })
await mkdir(sourceRoot, { recursive: true })

const names = ['baseline', 'hierarchy', 'articulation', 'combined'] as const
const svgs = Object.fromEntries(
  await Promise.all(names.map(async (name) => [name, await readFile(resolve(plt03Work, `${name}.svg`), 'utf8')]))
) as Record<(typeof names)[number], string>
const plt03ManifestText = await readFile(resolve(plt03Work, 'manifest.json'), 'utf8')
const plt03Manifest = JSON.parse(plt03ManifestText) as {
  baseline: { sha256: string }
  candidates: Record<string, { sha256: string }>
  semanticDiff: Record<string, { unexplained: unknown[]; classes: string[] }>
  currentAuthorityChecks: Record<string, unknown>
  fontFingerprints: Record<string, { sha256: string }>
}

for (const name of names) {
  if (!svgs[name].includes('width="136mm" height="145mm"')) {
    throw new Error(`PLT-03B ${name} is not the controlled 136 × 145 mm specimen envelope.`)
  }
  if (!svgs[name].includes('data-scale-denominator="100"')) {
    throw new Error(`PLT-03B ${name} is not a true 1:100 drawing.`)
  }
}
for (const [name, diff] of Object.entries(plt03Manifest.semanticDiff)) {
  if (diff.unexplained.length || diff.classes.includes('X')) {
    throw new Error(`PLT-03B cannot proof ${name}: semantic diff contains unexplained X.`)
  }
}

const exactFontRules = svgs.combined.match(/@font-face\{[^}]+\}/g) ?? []
if (exactFontRules.length !== 2) {
  throw new Error(`PLT-03B expected exactly two embedded Source Sans face rules, found ${exactFontRules.length}.`)
}
const proofFontStyle = `<style>${exactFontRules.join('')}</style>`

const escapeHtml = (value: string): string => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

const bookPage = (name: (typeof names)[number], index: number): string => `
<section class="proof-page proof-${name}" data-candidate="${name}">
  <header class="proof-header">
    <span class="proof-index">${String(index + 1).padStart(2, '0')}</span>
    <span class="proof-name">${name.toUpperCase()}</span>
    <span class="proof-scale">1:100</span>
  </header>
  <div class="drawing-frame">${svgs[name]}</div>
  <footer class="proof-footer">PLT-03B · ground-floor exemplar · exact physical comparison</footer>
</section>`

const bookHtml = `<!doctype html>
<html lang="en-GB">
<head><meta charset="utf-8"><title>PLT-03B ground-plan BOOK comparison</title>${proofFontStyle}</head>
<body>${names.map(bookPage).join('\n')}</body>
</html>`

const wallHtml = `<!doctype html>
<html lang="en-GB">
<head><meta charset="utf-8"><title>PLT-03B ground-plan WALL proof</title>${proofFontStyle}</head>
<body>
<section class="wall-page" data-candidate="combined">
  <header class="wall-header">
    <span class="proof-name">COMBINED</span>
    <span class="proof-scale">1:100</span>
  </header>
  <div class="wall-drawing">${svgs.combined}</div>
  <footer class="wall-footer">PLT-03B · A2 WALL proof · same semantic drawing, no fit scaling</footer>
</section>
</body>
</html>`

await writeFile(resolve(sourceRoot, 'book.html'), bookHtml, 'utf8')
await writeFile(resolve(sourceRoot, 'wall.html'), wallHtml, 'utf8')

const manifest = {
  schemaVersion: 1,
  packet: 'PLT-03B',
  sourcePacket: 'PLT-03A',
  sourceManifestSha256: sha256(plt03ManifestText),
  protectedBaselineSha256: plt03Manifest.baseline.sha256,
  specimens: Object.fromEntries(names.map((name) => [name, {
    sha256: sha256(svgs[name]),
    widthMm: 136,
    heightMm: 145,
    scaleDenominator: 100,
    semanticClasses: name === 'baseline' ? [] : plt03Manifest.semanticDiff[name]?.classes ?? []
  }])),
  pageProfiles: {
    bookB5: { widthMm: 176, heightMm: 250, candidateCount: 4, drawingScale: '1:100' },
    regressionA4: { widthMm: 210, heightMm: 297, candidateCount: 4, drawingScale: '1:100' },
    wallA2: { widthMm: 420, heightMm: 594, candidateCount: 1, drawingScale: '1:100', candidate: 'combined' }
  },
  fontFingerprints: plt03Manifest.fontFingerprints,
  authorityBoundary: plt03Manifest.currentAuthorityChecks,
  proofFurnitureFont: 'same exact embedded PLT03 Source Sans Regular/Bold bytes as current candidate',
  physicalVerdict: 'UNREVIEWED'
}
await writeFile(resolve(workRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log(`Prepared PLT-03B proof sources: ${escapeHtml(names.join(', '))}.`)
