import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { publicationFigurePlacements } from '../../figures.js'
import { publicationPlatePlacements } from '../../plates.js'
import { fetchOpenFontCandidate } from '../typ03/open-fonts.js'

const specimenRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(specimenRoot, '../../..')
const format = process.env.TYP05_FORMAT === 'a4' ? 'a4' : 'b5'
const workRoot = resolve(repoRoot, 'publication/.work/typ05b', format)

const sourcePaths = {
  partV: 'docs/manuscript/part-v.md',
  schedule: 'docs/manuscript/reference-house-implementation-schedule.md',
  externalMaintenance: 'docs/manuscript/maintenance-geography-external.md',
  partIII: 'publication/part-iii.md',
  sources: 'docs/manuscript/sources-and-further-reading.md',
  listControl: 'docs/patterns/controlled-utility-entry.md'
} as const

const sha256 = (content: string | Buffer): string => createHash('sha256').update(content).digest('hex')
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

function parseFirstMarkdownTable(markdown: string): { headers: string[]; rows: string[][] } {
  const lines = markdown.split('\n')
  const separator = /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/
  const cells = (line: string): string[] => line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(stripInline)

  for (let index = 0; index < lines.length - 1; index += 1) {
    if (!lines[index].includes('|') || !separator.test(lines[index + 1])) continue
    const headers = cells(lines[index])
    const rows: string[][] = []
    let cursor = index + 2
    while (cursor < lines.length && lines[cursor].includes('|') && lines[cursor].trim() !== '') {
      rows.push(cells(lines[cursor]))
      cursor += 1
    }
    return { headers, rows }
  }
  throw new Error('TYP-05B expected a Markdown table but found none.')
}

function fencedText(markdown: string): string[] {
  const match = markdown.match(/```text\s*\n([\s\S]*?)\n```/)
  if (!match) throw new Error('TYP-05B expected a fenced text sequence.')
  return match[1].split('\n').map((line) => line.trim()).filter(Boolean)
}

function extractSection(markdown: string, heading: string): string {
  const marker = `${heading}\n`
  const start = markdown.indexOf(marker)
  if (start < 0) throw new Error(`Missing TYP-05B source anchor: ${heading}`)
  const level = heading.match(/^#+/)?.[0].length
  if (!level) throw new Error(`Invalid heading anchor: ${heading}`)
  const after = start + marker.length
  const remainder = markdown.slice(after)
  const nextHeading = new RegExp(`^#{1,${level}}\\s+`, 'm').exec(remainder)
  const end = nextHeading ? after + nextHeading.index : markdown.length
  return markdown.slice(after, end).trim()
}

function sourceRows(markdown: string, count: number): { citation: string; url: string }[] {
  return markdown.split('\n')
    .filter((line) => /https?:\/\//.test(line))
    .map((line) => {
      const url = line.match(/https?:\/\/[^\s)]+/)?.[0] ?? ''
      const citation = stripInline(
        line.replace(url, '').replace(/^\s*[-*+]\s*/, '').replace(/[()]+\s*$/, '').trim()
      )
      return { citation, url, score: url.length }
    })
    .filter((row) => row.url)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ citation, url }) => ({ citation, url }))
}

function bulletItems(section: string, count: number): string[] {
  return section.split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => stripInline(line.slice(2)))
    .slice(0, count)
}

const sources = Object.fromEntries(
  await Promise.all(Object.entries(sourcePaths).map(async ([name, path]) => [name, await readFile(resolve(repoRoot, path), 'utf8')]))
) as Record<keyof typeof sourcePaths, string>

await rm(workRoot, { recursive: true, force: true })
await mkdir(workRoot, { recursive: true })

// Use the exact TYP-03 pins and put the verified bytes directly into proof CSS.
const fontEnv = await fetchOpenFontCandidate('source')
const fontSlots = [
  ['TYP03_SERIF_REGULAR', 'TYP05 Serif', 'normal', 400],
  ['TYP03_SERIF_ITALIC', 'TYP05 Serif', 'italic', 400],
  ['TYP03_SERIF_BOLD', 'TYP05 Serif', 'normal', 700],
  ['TYP03_SANS_REGULAR', 'TYP05 Sans', 'normal', 400],
  ['TYP03_SANS_BOLD', 'TYP05 Sans', 'normal', 700]
] as const

const fontFingerprints: Record<string, { sourceName: string; sha256: string }> = {}
const faceRules: string[] = []
for (const [envName, family, style, weight] of fontSlots) {
  const supplied = fontEnv[envName]
  const bytes = await readFile(supplied)
  const extension = extname(supplied).toLowerCase()
  const transport = extension === '.woff2'
    ? { mime: 'font/woff2', format: 'woff2' }
    : extension === '.otf'
      ? { mime: 'font/otf', format: 'opentype' }
      : extension === '.ttf'
        ? { mime: 'font/ttf', format: 'truetype' }
        : null
  if (!transport) throw new Error(`Unsupported TYP-05 font extension: ${extension || '(none)'}`)

  fontFingerprints[envName] = {
    sourceName: supplied.split('/').at(-1) ?? supplied,
    sha256: sha256(bytes)
  }
  const dataUri = `data:${transport.mime};base64,${bytes.toString('base64')}`
  faceRules.push(`@font-face {\n  font-family: "${family}";\n  src: url("${dataUri}") format("${transport.format}");\n  font-style: ${style};\n  font-weight: ${weight};\n  font-display: block;\n}`)
}
await writeFile(
  resolve(workRoot, 'fonts.css'),
  `${faceRules.join('\n\n')}\n\n:root {\n  --typ05-serif: "TYP05 Serif", serif;\n  --typ05-sans: "TYP05 Sans", sans-serif;\n}\n`,
  'utf8'
)

const compactTable = parseFirstMarkdownTable(sources.partV)
const scheduleTable = parseFirstMarkdownTable(sources.schedule)
const scheduleRows = scheduleTable.rows
  .map((row, index) => ({ row, index, score: row.reduce((sum, cell) => sum + cell.length, 0) }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 4)
  .sort((a, b) => a.index - b.index)
  .map(({ row }) => row)

const externalSequence = fencedText(sources.externalMaintenance)
const serviceSequence = fencedText(sources.partIII)
const references = sourceRows(sources.sources, 5)
const listContext = stripInline(extractSection(sources.listControl, '## Context').split(/\n{2,}/)[0] ?? '')
const listForces = bulletItems(extractSection(sources.listControl, '## Forces'), 7)

const figures = publicationFigurePlacements()
const longestFigure = [...figures].sort((a, b) => b.caption.length - a.caption.length)[0]

// Existing figure SVGs currently carry their own drawing typography (including
// legacy Arial declarations). TYP-05 owns the publication caption, not the
// lettering inside the figure. Use canonical caption metadata beside a neutral
// field so the finished-PDF font gate cannot be weakened by drawing-internal fonts.
const plateViews = publicationPlatePlacements().flatMap((placement) => placement.views)
const numericPlate = plateViews.find((view) => view.scale === '1:100') ?? plateViews[0]
const ntsPlate = plateViews.find((view) => view.scale === 'NTS')
if (!numericPlate || !ntsPlate) throw new Error('TYP-05B expected numeric and NTS plate furniture examples.')

const tableHtml = `<table class="compact-table">
  <thead><tr>${compactTable.headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead>
  <tbody>${compactTable.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('\n')}</tbody>
</table>`

const scheduleHtml = scheduleRows.map((row) => {
  const [subject, ...values] = row
  return `<article class="schedule-record">
    <h3 class="schedule-subject">${escapeHtml(subject ?? '')}</h3>
    <dl>${values.map((value, index) => `<div class="schedule-field"><dt>${escapeHtml(scheduleTable.headers[index + 1] ?? '')}</dt><dd>${escapeHtml(value ?? '')}</dd></div>`).join('\n')}</dl>
  </article>`
}).join('\n')

const sequenceHtml = (lines: string[]): string => `<div class="sequence-block">${lines.map((line) =>
  line === '↓'
    ? '<div class="sequence-arrow" aria-hidden="true">↓</div>'
    : `<div class="sequence-step">${escapeHtml(line)}</div>`
).join('\n')}</div>`

const sourcesHtml = references.map((row) => `<li class="source-row"><span class="source-citation">${escapeHtml(row.citation)}</span><span class="source-url">${escapeHtml(row.url)}</span></li>`).join('\n')
const listHtml = listForces.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n')
const neutralField = '<div class="drawing-placeholder" role="img" aria-label="Neutral visual field omitted from typography proof"></div>'
const plateHtml = (title: string, scale: string, caption: string): string => `<figure class="plate-sample">
  <header><h2>${escapeHtml(title)}</h2><span class="plate-scale">${escapeHtml(scale)}</span></header>
  ${neutralField}
  <figcaption>${escapeHtml(caption)}</figcaption>
</figure>`

const specimen = `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <title>TYP-05B mixed-content specimen — ${format.toUpperCase()}</title>
</head>
<body>
  <section class="proof-title specimen-page reading-column">
    <p class="proof-label">TYP-05B · mixed-content proof</p>
    <h1>Technical material without a second book</h1>
    <p class="proof-intro">Exact pinned Source Serif 4 + Source Sans 3. Frozen TYP-03 body and TYP-04 hierarchy. No mono family. Candidate technical roles only.</p>
    <p class="proof-meta">${format.toUpperCase()} · black only · actual-size review</p>
  </section>

  <section class="specimen-page reading-column">
    <p class="proof-label">01 · compact analytical table</p>
    <h2 class="section-title">The test ladder</h2>
    <p class="specimen-note">Part V, B0–B3. A conventional table remains a table.</p>
    ${tableHtml}
  </section>

  <section class="specimen-page reading-column schedule-page">
    <p class="proof-label">02 · dense implementation schedule</p>
    <h2 class="section-title">Appendix C — implementation schedule</h2>
    <p class="specimen-note">Four source rows selected deterministically for maximum text stress. The five-column source semantics are preserved as labelled records rather than miniaturised into a report grid.</p>
    ${scheduleHtml}
  </section>

  <section class="specimen-page reading-column">
    <p class="proof-label">03 · ordered architectural sequence</p>
    <h2 class="section-title">External maintenance route</h2>
    <p class="specimen-note">The source is a fenced <em>text</em> block, but its content is an architectural sequence rather than code.</p>
    ${sequenceHtml(externalSequence)}
  </section>

  <section class="specimen-page reading-column">
    <p class="proof-label">04 · longer generative sequence</p>
    <h2 class="section-title">Service topology</h2>
    ${sequenceHtml(serviceSequence)}
  </section>

  <section class="specimen-page reading-column">
    <p class="proof-label">05 · sources and long URLs</p>
    <h2 class="section-title">Sources and further reading</h2>
    <p class="specimen-note">Five of the longest reader-facing URLs. Bibliographic voice remains primary; the address is subordinate and allowed to break.</p>
    <ol class="source-list">${sourcesHtml}</ol>
  </section>

  <section class="specimen-page reading-column figure-page">
    <p class="proof-label">06 · sustained figure caption</p>
    <figure class="inline-figure">
      ${neutralField}
      <figcaption>${escapeHtml(longestFigure.caption)}</figcaption>
    </figure>
  </section>

  <section class="specimen-page plate-page">
    <p class="proof-label reading-column">07 · architectural plate furniture</p>
    ${plateHtml(numericPlate.title, numericPlate.scale, numericPlate.caption)}
  </section>

  <section class="specimen-page plate-page">
    <p class="proof-label reading-column">08 · NTS plate furniture</p>
    ${plateHtml(ntsPlate.title, ntsPlate.scale, ntsPlate.caption)}
  </section>

  <section class="specimen-page reading-column list-control">
    <p class="proof-label">09 · dense-list control</p>
    <h2 class="section-title">Controlled Utility Entry — Forces</h2>
    <p>${escapeHtml(listContext)}</p>
    <ul>${listHtml}</ul>
    <p class="specimen-note final-note">No technical-list role has been added. This page deliberately uses the frozen body + heading system.</p>
  </section>
</body>
</html>`

await writeFile(resolve(workRoot, 'specimen.html'), specimen, 'utf8')

const manifest = {
  schemaVersion: 3,
  packet: 'TYP-05B',
  candidate: 'source-two-family-minimal-technical-roles',
  format,
  fontTransport: 'verified-bytes-data-uri',
  visualFieldBoundary: 'neutral fields; figure-internal and generated-drawing typography intentionally excluded from TYP-05 proof inputs',
  bodyAuthority: {
    serif: 'Source Serif 4',
    sans: 'Source Sans 3',
    bodySizePt: 10.5,
    leading: 1.5,
    measureMm: format === 'b5' ? 112 : 125,
    rhythm: 'spaced',
    alignment: 'ragged',
    hyphenation: 'off'
  },
  candidateMetrics: {
    compactTable: { family: 'Source Sans 3', sizePt: 8.5, leading: 1.32 },
    scheduleSubject: { family: 'Source Serif 4', weight: 700, sizePt: 10.5, leading: 1.25 },
    scheduleFieldLabel: { family: 'Source Sans 3', weight: 700, sizePt: 7.2, leading: 1.2 },
    scheduleFieldBody: { family: 'Source Serif 4', sizePt: 9.2, leading: 1.38 },
    sequence: { family: 'Source Sans 3', sizePt: 8.5, leading: 1.25 },
    sourceCitation: { family: 'Source Serif 4', sizePt: 9.3, leading: 1.4 },
    sourceUrl: { family: 'Source Sans 3', sizePt: 7.6, leading: 1.3 },
    caption: { family: 'Source Sans 3', sizePt: 8.3, leading: 1.35 },
    plateTitle: { family: 'Source Sans 3', weight: 700, sizePt: 11, leading: 1.15 },
    plateScale: { family: 'Source Sans 3', sizePt: 8.3, leading: 1 },
    monoFamilyAdmitted: false
  },
  scheduleRows: scheduleRows.map((row) => row[0]),
  longestFigure: {
    entryId: longestFigure.entryId,
    alt: longestFigure.alt,
    captionChars: longestFigure.caption.length
  },
  plateViews: [numericPlate.title, ntsPlate.title],
  sourceHashes: Object.fromEntries(Object.entries(sources).map(([name, content]) => [name, sha256(content)])),
  fontFingerprints
}
await writeFile(resolve(workRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log(`Prepared TYP-05B ${format.toUpperCase()} mixed-content specimen with exact pinned Source fonts.`)
