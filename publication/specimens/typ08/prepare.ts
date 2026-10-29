import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { extname, posix, resolve } from 'node:path'

import { publicationFigurePlacements } from '../../figures.js'
import { publicationPlatePlacements } from '../../plates-current.js'
import { publicationEntries } from '../../publication.js'
import { fetchOpenFontCandidate } from '../typ03/open-fonts.js'

const repoRoot = resolve(import.meta.dirname, '../../..')
const publicationRoot = resolve(repoRoot, 'publication')
const workRoot = resolve(publicationRoot, '.work')
const sourceRoot = resolve(workRoot, 'source')
const candidateWorkRoot = resolve(workRoot, 'typ08a')
const proofRoot = resolve(publicationRoot, '.proof/typ08a')

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

function fontTransport(path: string): { mime: string; format: string } {
  const extension = extname(path).toLowerCase()
  if (extension === '.woff2') return { mime: 'font/woff2', format: 'woff2' }
  if (extension === '.otf') return { mime: 'font/otf', format: 'opentype' }
  if (extension === '.ttf') return { mime: 'font/ttf', format: 'truetype' }
  throw new Error(`TYP-08A unsupported font extension: ${extension || '(none)'}`)
}

function resolveAsset(sourcePath: string, asset: string): string {
  const resolved = posix.normalize(posix.join(posix.dirname(sourcePath), asset))
  if (resolved.startsWith('../') || resolved === '..') {
    throw new Error(`TYP-08A asset escaped repository root: ${sourcePath} -> ${asset}`)
  }
  return resolved
}

type ParsedTable = {
  headers: string[]
  rows: string[][]
  start: number
  end: number
}

function firstMarkdownTable(markdown: string): ParsedTable {
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
    return { headers, rows, start: index, end: cursor }
  }
  throw new Error('TYP-08A expected a Markdown table but found none.')
}

function scheduleRecords(markdown: string): { markdown: string; records: number } {
  if (!markdown.includes('## Implementation schedule')) {
    throw new Error('TYP-08A Appendix C implementation-schedule heading changed.')
  }
  const table = firstMarkdownTable(markdown)
  if (table.headers.length !== 5 || table.rows.length < 20) {
    throw new Error(`TYP-08A expected the prose-heavy five-column Appendix C schedule; found ${table.headers.length} columns / ${table.rows.length} rows.`)
  }

  const records = table.rows.map((row) => {
    const [subject, ...values] = row
    const fields = values.map((value, index) => `<div class="schedule-field"><dt class="schedule-label">${escapeHtml(table.headers[index + 1] ?? '')}</dt><dd class="schedule-value">${escapeHtml(value ?? '')}</dd></div>`).join('\n')
    return `<section class="schedule-record"><h3 class="schedule-subject">${escapeHtml(subject ?? '')}</h3><dl>${fields}</dl></section>`
  }).join('\n')

  const lines = markdown.split('\n')
  const replacement = `<div class="schedule-records">\n${records}\n</div>`
  return {
    markdown: [...lines.slice(0, table.start), replacement, ...lines.slice(table.end)].join('\n'),
    records: table.rows.length
  }
}

function replaceArrowSequence(markdown: string, owner: string): { markdown: string; replacements: number } {
  let replacements = 0
  const transformed = markdown.replace(/```text\s*\n([\s\S]*?)\n```/g, (whole, raw: string) => {
    const lines = raw.split('\n').map((line) => line.trim()).filter(Boolean)
    if (!lines.includes('↓')) return whole
    replacements += 1
    const content = lines.map((line) => line === '↓'
      ? '<div class="sequence-arrow" aria-hidden="true">↓</div>'
      : `<div class="sequence-step">${escapeHtml(line)}</div>`
    ).join('\n')
    return `<div class="sequence-block">\n${content}\n</div>`
  })
  if (replacements !== 1) {
    throw new Error(`TYP-08A expected exactly one architectural text/arrow sequence in ${owner}; found ${replacements}.`)
  }
  return { markdown: transformed, replacements }
}

function rewriteReferenceUrls(markdown: string): { markdown: string; rows: number } {
  let rows = 0
  const transformed = markdown.split('\n').map((line) => {
    if (!/^\s*[-*+]\s+/.test(line) || !/https?:\/\//.test(line)) return line
    const url = line.match(/https?:\/\/[^\s)]+/)?.[0]
    if (!url) return line
    rows += 1
    const citation = stripInline(
      line
        .replace(url, '')
        .replace(/^\s*[-*+]\s+/, '')
        .replace(/[()]+\s*$/, '')
        .trim()
    )
    return `<div class="reference-row"><span class="reference-citation">${escapeHtml(citation)}</span><a class="reference-url" href="${escapeHtml(url)}">${escapeHtml(url)}</a></div>`
  }).join('\n')
  if (rows < 5) throw new Error(`TYP-08A expected several long-URL source rows; found ${rows}.`)
  return { markdown: transformed, rows }
}

const build = JSON.parse(await readFile(resolve(workRoot, 'build.json'), 'utf8')) as {
  mode: string
  entries: Array<{ id: string; source: string; title: string }>
}
if (build.mode !== 'full') throw new Error(`TYP-08A requires full publication preparation, received ${build.mode}.`)
if (build.entries.length !== publicationEntries.length) {
  throw new Error(`TYP-08A prepared-entry count changed: ${build.entries.length} vs canonical ${publicationEntries.length}.`)
}

await mkdir(candidateWorkRoot, { recursive: true })
await mkdir(proofRoot, { recursive: true })

// Exact pinned Source family bytes; no installed-system-font dependency is admissible.
const fontEnv = await fetchOpenFontCandidate('source')
const fontSlots = [
  ['TYP03_SERIF_REGULAR', 'TYP08 Serif', 'normal', 400],
  ['TYP03_SERIF_ITALIC', 'TYP08 Serif', 'italic', 400],
  ['TYP03_SERIF_BOLD', 'TYP08 Serif', 'normal', 700],
  ['TYP03_SANS_REGULAR', 'TYP08 Sans', 'normal', 400],
  ['TYP03_SANS_BOLD', 'TYP08 Sans', 'normal', 700]
] as const

const fontFingerprints: Record<string, { sourceName: string; sha256: string }> = {}
const faceRules: string[] = []
const svgSansFaceRules: string[] = []
for (const [envName, family, style, weight] of fontSlots) {
  const supplied = fontEnv[envName]
  const bytes = await readFile(supplied)
  const transport = fontTransport(supplied)
  const dataUri = `data:${transport.mime};base64,${bytes.toString('base64')}`
  fontFingerprints[envName] = {
    sourceName: supplied.split('/').at(-1) ?? supplied,
    sha256: sha256(bytes)
  }
  faceRules.push(`@font-face { font-family:"${family}"; src:url("${dataUri}") format("${transport.format}"); font-style:${style}; font-weight:${weight}; font-display:block; }`)
  if (family === 'TYP08 Sans') {
    svgSansFaceRules.push(`@font-face{font-family:"TYP08 Source Sans";src:url("${dataUri}") format("${transport.format}");font-style:${style};font-weight:${weight};font-display:block}`)
  }
}
await writeFile(
  resolve(candidateWorkRoot, 'fonts.css'),
  `${faceRules.join('\n')}\n:root { --typ08-serif:"TYP08 Serif",serif; --typ08-sans:"TYP08 Sans",sans-serif; }\n`,
  'utf8'
)

// Candidate-only mixed-content integration on prepared copies.
const schedulePath = resolve(sourceRoot, 'docs/manuscript/reference-house-implementation-schedule.md')
const scheduleBefore = await readFile(schedulePath, 'utf8')
const schedule = scheduleRecords(scheduleBefore)
await writeFile(schedulePath, schedule.markdown, 'utf8')

const partIIPath = resolve(sourceRoot, 'docs/manuscript/part-ii.md')
const partIIBefore = await readFile(partIIPath, 'utf8')
const partIISequence = replaceArrowSequence(partIIBefore, 'prepared Part II')
await writeFile(partIIPath, partIISequence.markdown, 'utf8')

const partIIIPath = resolve(sourceRoot, 'publication/part-iii.md')
const partIIIBefore = await readFile(partIIIPath, 'utf8')
const partIIISequence = replaceArrowSequence(partIIIBefore, 'prepared Part III')
await writeFile(partIIIPath, partIIISequence.markdown, 'utf8')

const sourcesPath = resolve(sourceRoot, 'docs/manuscript/sources-and-further-reading.md')
const sourcesBefore = await readFile(sourcesPath, 'utf8')
const referenceRows = rewriteReferenceUrls(sourcesBefore)
await writeFile(sourcesPath, referenceRows.markdown, 'utf8')

// Remove only the generated working A4 plate stylesheet. The real plate markup and images remain.
const partIVPath = resolve(sourceRoot, 'docs/manuscript/part-iv.md')
const partIVBefore = await readFile(partIVPath, 'utf8')
const plateStylePattern = /<style>\s*@page hk-plate[\s\S]*?<\/style>\s*/g
const plateStyles = partIVBefore.match(plateStylePattern) ?? []
if (plateStyles.length !== 1) {
  throw new Error(`TYP-08A expected one generated working plate stylesheet in prepared Part IV; found ${plateStyles.length}.`)
}
if (!plateStyles[0].includes('Arial, Helvetica, sans-serif') || !plateStyles[0].includes('size: A4')) {
  throw new Error('TYP-08A prepared Part IV plate stylesheet no longer matches the known working A4 seam.')
}
const partIVAfter = partIVBefore.replace(plateStylePattern, '')
await writeFile(partIVPath, partIVAfter, 'utf8')

// Rebind all controlled reader-facing FLOW and DRW SVGs in the generated source tree only.
const entryById = new Map(publicationEntries.map((entry) => [entry.id, entry]))
const controlledAssets = new Set<string>()
for (const placement of publicationFigurePlacements()) {
  const entry = entryById.get(placement.entryId)
  if (!entry) throw new Error(`TYP-08A figure placement has no publication entry: ${placement.entryId}`)
  controlledAssets.add(resolveAsset(entry.source, placement.image))
}
for (const placement of publicationPlatePlacements()) {
  const entry = entryById.get(placement.entryId)
  if (!entry) throw new Error(`TYP-08A plate placement has no publication entry: ${placement.entryId}`)
  for (const view of placement.views) controlledAssets.add(resolveAsset(entry.source, view.image))
}

const svgEvidence: Record<string, {
  canonicalSha256: string
  transformedSha256: string
  familyDeclarations: number
  tabularNotes: boolean
  reversible: boolean
}> = {}

for (const sourcePath of [...controlledAssets].sort()) {
  const canonical = await readFile(resolve(repoRoot, sourcePath), 'utf8')
  const preparedPath = resolve(sourceRoot, sourcePath)
  const prepared = await readFile(preparedPath, 'utf8')
  if (prepared !== canonical) {
    throw new Error(`TYP-08A controlled SVG copy diverged before typography rebinding: ${sourcePath}`)
  }

  const legacyFamilies = [
    'font-family:Arial, Helvetica, sans-serif',
    'font-family:Arial,Helvetica,sans-serif'
  ] as const
  const matching = legacyFamilies.filter((family) => canonical.includes(family))
  if (matching.length !== 1) {
    throw new Error(`TYP-08A ${sourcePath} expected one legacy Arial family syntax; found ${matching.length}.`)
  }
  const legacyFamily = matching[0]
  const familyDeclarations = canonical.split(legacyFamily).length - 1
  const styleOpen = canonical.match(/<style(?:\s[^>]*)?>/)?.[0]
  if (!styleOpen || familyDeclarations < 1) {
    throw new Error(`TYP-08A ${sourcePath} lacks the expected SVG typography seam.`)
  }

  const tabularNotes = sourcePath.startsWith('docs/reference-house/')
  const numericRule = tabularNotes ? '.text-note{font-variant-numeric:tabular-nums}' : ''
  const injectedCss = `${svgSansFaceRules.join('')}${numericRule}`
  const candidateFamily = 'font-family:"TYP08 Source Sans"'
  const transformed = canonical
    .replace(styleOpen, `${styleOpen}${injectedCss}`)
    .replaceAll(legacyFamily, candidateFamily)
  const reversed = transformed
    .replace(`${styleOpen}${injectedCss}`, styleOpen)
    .replaceAll(candidateFamily, legacyFamily)
  if (reversed !== canonical) {
    throw new Error(`TYP-08A ${sourcePath} typography-only transformation is not byte reversible.`)
  }

  await writeFile(preparedPath, transformed, 'utf8')
  svgEvidence[sourcePath] = {
    canonicalSha256: sha256(canonical),
    transformedSha256: sha256(transformed),
    familyDeclarations,
    tabularNotes,
    reversible: true
  }
}

const manifest = {
  schemaVersion: 1,
  packet: 'TYP-08A',
  preparedFrom: 'publication/scripts/prepare.ts --full',
  canonicalMutation: false,
  candidateOnlyIntegration: true,
  entryCount: build.entries.length,
  fonts: fontFingerprints,
  generatedTransforms: {
    scheduleRecords: schedule.records,
    arrowSequences: partIISequence.replacements + partIIISequence.replacements,
    referenceUrlRows: referenceRows.rows,
    strippedWorkingPlateStyles: plateStyles.length,
    controlledSvgCount: controlledAssets.size
  },
  svgEvidence,
  boundaries: {
    productionThemeMigrated: false,
    manuscriptRewritten: false,
    canonicalFiguresOrDrawingsMutated: false,
    pltDrawingSizesChanged: false,
    finalProductionReleaseClaimed: false
  }
}

await writeFile(resolve(proofRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
console.log(`Prepared TYP-08A full-book candidate: ${build.entries.length} entries, ${controlledAssets.size} controlled SVGs, ${schedule.records} schedule records.`)
