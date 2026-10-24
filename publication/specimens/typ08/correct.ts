import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { posix, resolve } from 'node:path'

import { publicationEntries, type PublicationEntry } from '../../publication.js'
import { fetchOpenFontCandidate } from '../typ03/open-fonts.js'

const repoRoot = resolve(import.meta.dirname, '../../..')
const publicationRoot = resolve(repoRoot, 'publication')
const workRoot = resolve(publicationRoot, '.work')
const sourceRoot = resolve(workRoot, 'source')
const proofRoot = resolve(publicationRoot, '.proof/typ08a')
const buildPath = resolve(workRoot, 'build.json')
const manifestPath = resolve(proofRoot, 'manifest.json')

const sha256 = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex')
const escapeHtml = (value: string): string => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

function stripInline(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .trim()
}

function divisionMarker(division: string): string {
  return `<div class="typ08-context-marker typ08-division-context" aria-hidden="true"><span class="typ08-division-string">${escapeHtml(division)}</span></div>`
}

function entryMarker(division: string, entry: string): string {
  return `<div class="typ08-context-marker typ08-entry-context" aria-hidden="true"><span class="typ08-division-string">${escapeHtml(division)}</span><span class="typ08-entry-string">${escapeHtml(entry)}</span></div>`
}

function decorateHeadings(
  markdown: string,
  entry: PublicationEntry,
  division: string
): { markdown: string; divisionOpenings: number; entryOpenings: number } {
  const lines = markdown.split('\n')
  const out: string[] = []
  let inFence = false
  let h1Count = 0
  let divisionOpenings = 0
  let entryOpenings = 0

  for (const line of lines) {
    if (/^```/.test(line.trimStart())) {
      inFence = !inFence
      out.push(line)
      continue
    }

    const h1 = inFence ? null : line.match(/^#\s+(.+?)\s*$/)
    if (!h1) {
      out.push(line)
      continue
    }

    const title = stripInline(h1[1])
    h1Count += 1

    if (entry.kind === 'part' && h1Count === 1) {
      if (title !== entry.title) {
        throw new Error(`TYP-08C division title drift in ${entry.source}: expected ${entry.title}, found ${title}.`)
      }
      out.push(divisionMarker(title), '', line)
      divisionOpenings += 1
      continue
    }

    out.push(entryMarker(division, title), '', line)
    entryOpenings += 1
  }

  if (h1Count < 1) throw new Error(`TYP-08C found no H1 opening in ${entry.source}.`)
  if (entry.kind === 'part' && divisionOpenings !== 1) {
    throw new Error(`TYP-08C expected one division opening in ${entry.source}; found ${divisionOpenings}.`)
  }
  if (entry.kind !== 'part' && entryOpenings < 1) {
    throw new Error(`TYP-08C expected an entry opening in ${entry.source}.`)
  }

  return { markdown: out.join('\n'), divisionOpenings, entryOpenings }
}

function rewritePartINotes(markdown: string): { markdown: string; citationRows: number; urlRows: number } {
  const marker = '# Notes\n'
  const start = markdown.indexOf(marker)
  if (start < 0) throw new Error('TYP-08C Part I Notes heading changed.')

  const head = markdown.slice(0, start + marker.length)
  const tail = markdown.slice(start + marker.length)
  let citationRows = 0
  let urlRows = 0

  const transformed = tail.split('\n').map((line) => {
    const match = line.match(/^\[(\d+)\]\s+(.+?)(?:\s{2})?$/)
    if (!match) return line

    citationRows += 1
    const label = `[${match[1]}]`
    const raw = match[2].trim()
    const url = raw.match(/https?:\/\/[^\s)]+/)?.[0] ?? null
    const citation = stripInline(url ? raw.replace(url, '').replace(/[()]+\s*$/, '').trim() : raw)
    const urlHtml = url
      ? `<a class="reference-url" href="${escapeHtml(url)}">${escapeHtml(url)}</a>`
      : ''
    if (url) urlRows += 1

    return `<div class="reference-row notes-reference-row"><span class="reference-citation">${escapeHtml(`${label} ${citation}`)}</span>${urlHtml}</div>`
  }).join('\n')

  if (citationRows !== 31) {
    throw new Error(`TYP-08C expected 31 Part I note rows; found ${citationRows}.`)
  }
  if (urlRows < 20) {
    throw new Error(`TYP-08C expected at least 20 long-URL Part I notes; found ${urlRows}.`)
  }

  return { markdown: `${head}${transformed}`, citationRows, urlRows }
}

const build = JSON.parse(await readFile(buildPath, 'utf8')) as Record<string, unknown> & {
  mode: string
  titlePage: string
  entries: Array<{ id: string; source: string; title: string }>
}
if (build.mode !== 'full') throw new Error(`TYP-08C requires full mode, received ${build.mode}.`)
if (build.entries.length !== publicationEntries.length) {
  throw new Error(`TYP-08C entry count drift: ${build.entries.length} vs ${publicationEntries.length}.`)
}

// D01 + D02 — semantic running context and frozen division / entry openings.
let currentDivision = 'Ovid’s House'
let divisionOpenings = 0
let entryOpenings = 0

for (const entry of publicationEntries) {
  if (entry.kind === 'back-matter') currentDivision = 'Appendices'
  if (entry.kind === 'part') currentDivision = entry.title

  const preparedPath = resolve(sourceRoot, entry.source)
  const before = await readFile(preparedPath, 'utf8')
  const decorated = decorateHeadings(before, entry, currentDivision)
  divisionOpenings += decorated.divisionOpenings
  entryOpenings += decorated.entryOpenings

  let after = decorated.markdown
  if (entry.id === 'part-i') {
    const notes = rewritePartINotes(after)
    after = notes.markdown
  }
  await writeFile(preparedPath, after, 'utf8')
}

if (divisionOpenings !== 5) {
  throw new Error(`TYP-08C expected five division openings; found ${divisionOpenings}.`)
}

// D03 — record exact Part I Notes role mapping evidence after heading decoration.
const partIPrepared = await readFile(resolve(sourceRoot, 'docs/manuscript/part-i.md'), 'utf8')
const noteRows = [...partIPrepared.matchAll(/class="reference-row notes-reference-row"/g)].length
const noteUrls = [...partIPrepared.matchAll(/class="reference-url"/g)].length
if (noteRows !== 31 || noteUrls < 20) {
  throw new Error(`TYP-08C Part I Notes role mapping failed: ${noteRows} rows / ${noteUrls} URLs.`)
}

// D04 — keep the principal title page clear; move proof provenance to an imprint page.
const titlePath = resolve(sourceRoot, build.titlePage)
const titleBefore = await readFile(titlePath, 'utf8')
const metaPattern = /\n\s*<div class="publication-title__meta">([\s\S]*?)<\/div>\s*/
const metaMatch = titleBefore.match(metaPattern)
if (!metaMatch) throw new Error('TYP-08C title page no longer exposes the known provenance block.')
const titleAfter = titleBefore.replace(metaPattern, '\n')
if (/Revision\s+<code>|adamnoden\.github\.io\/architecture|\d{1,2}\s+\w+\s+20\d{2}/.test(titleAfter)) {
  throw new Error('TYP-08C title page still contains proof provenance after separation.')
}
await writeFile(titlePath, titleAfter, 'utf8')

const imprintPage = 'publication-imprint.html'
await writeFile(
  resolve(sourceRoot, imprintPage),
  `<!doctype html>\n<html lang="en-GB">\n<head>\n  <meta charset="utf-8">\n  <title>Imprint / provenance</title>\n</head>\n<body class="publication-imprint-page">\n  <main class="publication-imprint">\n    <h1>Imprint / provenance</h1>\n    <div class="publication-imprint__meta">${metaMatch[1].trim()}\n    </div>\n  </main>\n</body>\n</html>\n`,
  'utf8'
)
build.imprintPage = imprintPage
await writeFile(buildPath, `${JSON.stringify(build, null, 2)}\n`, 'utf8')

// D05 — replace repeated SVG data-URI faces with one generated shared exact-font resource pair.
const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as any
const fontEnv = await fetchOpenFontCandidate('source')
const sharedFontRoot = 'publication/typ08-fonts'
await mkdir(resolve(sourceRoot, sharedFontRoot), { recursive: true })

const sansFiles = [
  ['TYP03_SANS_REGULAR', 'SourceSans3-Regular.ttf', 'normal', 400],
  ['TYP03_SANS_BOLD', 'SourceSans3-Bold.ttf', 'normal', 700]
] as const
const sharedFontEvidence: Record<string, { sha256: string; source: string }> = {}
for (const [envName, outputName] of sansFiles) {
  const source = fontEnv[envName]
  const bytes = await readFile(source)
  await writeFile(resolve(sourceRoot, sharedFontRoot, outputName), bytes)
  sharedFontEvidence[outputName] = { sha256: sha256(bytes), source: source.split('/').at(-1) ?? source }
}

const embeddedFacePattern = /@font-face\{font-family:"TYP08 Source Sans";src:url\("data:[^"]+"\) format\("[^"]+"\);font-style:[^;]+;font-weight:(?:400|700);font-display:block\}/g
let removedEmbeddedFaces = 0
let correctedSvgCount = 0

for (const sourcePath of Object.keys(manifest.svgEvidence ?? {}).sort()) {
  const preparedPath = resolve(sourceRoot, sourcePath)
  const before = await readFile(preparedPath, 'utf8')
  const embeddedFaces = before.match(embeddedFacePattern) ?? []
  if (embeddedFaces.length !== 2) {
    throw new Error(`TYP-08C ${sourcePath} expected two embedded Source Sans faces; found ${embeddedFaces.length}.`)
  }

  let transformed = before.replace(embeddedFacePattern, '')
  const styleOpen = transformed.match(/<style(?:\s[^>]*)?>/)?.[0]
  if (!styleOpen) throw new Error(`TYP-08C ${sourcePath} lost its SVG style boundary.`)

  const rules = sansFiles.map(([, outputName, style, weight]) => {
    const relative = posix.relative(posix.dirname(sourcePath), `${sharedFontRoot}/${outputName}`)
    return `@font-face{font-family:"TYP08 Source Sans";src:url("${relative}") format("truetype");font-style:${style};font-weight:${weight};font-display:block}`
  }).join('')
  transformed = transformed.replace(styleOpen, `${styleOpen}${rules}`)

  if (transformed.includes('data:font/')) {
    throw new Error(`TYP-08C ${sourcePath} still contains an SVG font data URI.`)
  }
  if (!transformed.includes('font-family:"TYP08 Source Sans"')) {
    throw new Error(`TYP-08C ${sourcePath} lost the exact Source Sans family binding.`)
  }

  await writeFile(preparedPath, transformed, 'utf8')
  removedEmbeddedFaces += embeddedFaces.length
  correctedSvgCount += 1
  manifest.svgEvidence[sourcePath] = {
    ...manifest.svgEvidence[sourcePath],
    transformedSha256: sha256(transformed),
    fontTransport: 'shared-relative-file'
  }
}

if (correctedSvgCount !== 22 || removedEmbeddedFaces !== 44) {
  throw new Error(`TYP-08C SVG transport count drift: ${correctedSvgCount} SVGs / ${removedEmbeddedFaces} embedded faces removed.`)
}

manifest.correctionPacket = 'TYP-08C'
manifest.generatedTransforms = {
  ...manifest.generatedTransforms,
  semanticDivisionOpenings: divisionOpenings,
  semanticEntryOpenings: entryOpenings,
  partINoteCitationRows: noteRows,
  partINoteUrlRows: noteUrls,
  imprintPages: 1,
  sharedSvgFontResources: 2
}
manifest.svgFontTransport = {
  strategy: 'shared-relative-file',
  correctedSvgCount,
  removedEmbeddedFaces,
  resources: sharedFontEvidence
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

const correctionEvidence = {
  schemaVersion: 1,
  packet: 'TYP-08C',
  defects: {
    D01: { status: 'corrected', semanticDivisionOpenings: divisionOpenings, semanticEntryOpenings: entryOpenings },
    D02: { status: 'corrected', divisionOpenings, entryOpenings },
    D03: { status: 'corrected', citationRows: noteRows, urlRows: noteUrls },
    D04: { status: 'corrected', titleProvenanceMoved: true, imprintPage },
    D05: { status: 'corrected', correctedSvgCount, removedEmbeddedFaces, transport: 'shared-relative-file' }
  },
  boundaries: {
    canonicalManuscriptMutated: false,
    productionThemeMigrated: false,
    familyOrBodyMetricsChanged: false,
    appendixCRetuned: false,
    pltDrawingGeometryChanged: false
  }
}
await writeFile(resolve(proofRoot, 'corrections.json'), `${JSON.stringify(correctionEvidence, null, 2)}\n`, 'utf8')

console.log(`Applied TYP-08C bounded corrections: ${divisionOpenings} divisions, ${entryOpenings} entries, ${noteRows} Part I notes, ${correctedSvgCount} SVGs.`)
