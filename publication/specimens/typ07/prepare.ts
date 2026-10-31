import { createHash } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { extname, posix, resolve } from 'node:path'

import { publicationFigurePlacements } from '../../figures.js'
import { publicationPlatePlacements } from '../../plates.js'
import { publicationEntries } from '../../publication.js'
import { fetchOpenFontCandidate } from '../typ03/open-fonts.js'
import { typ07ProofUnits } from './manifest.js'

const repoRoot = resolve(import.meta.dirname, '../../..')
const format = process.env.TYP07_FORMAT === 'a4' ? 'a4' : 'b5'
const workRoot = resolve(repoRoot, 'publication/.work/typ07b', format)

const sourcePaths = {
  partI: 'docs/manuscript/part-i.md',
  partII: 'docs/manuscript/part-ii.md',
  partIII: 'publication/part-iii.md',
  partIV: 'docs/manuscript/part-iv.md',
  partV: 'docs/manuscript/part-v.md',
  schedule: 'docs/manuscript/reference-house-implementation-schedule.md',
  sources: 'docs/manuscript/sources-and-further-reading.md'
} as const

const sha256 = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex')
const escapeHtml = (value: string): string => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

function renderInline(markdown: string): string {
  return escapeHtml(markdown.trim())
    .replace(/`([^`]+)`/g, '<span class="inline-code">$1</span>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

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

function extractSection(markdown: string, heading: string): string {
  const marker = `${heading}\n`
  const start = markdown.indexOf(marker)
  if (start < 0) throw new Error(`TYP-07B missing source anchor: ${heading}`)
  const level = heading.match(/^#+/)?.[0].length
  if (!level) throw new Error(`TYP-07B invalid heading anchor: ${heading}`)
  const after = start + marker.length
  const remainder = markdown.slice(after)
  const nextHeading = new RegExp(`^#{1,${level}}\\s+`, 'm').exec(remainder)
  const end = nextHeading ? after + nextHeading.index : markdown.length
  return markdown.slice(after, end).trim()
}

function renderBlocks(markdown: string, start: number, count: number): string {
  return markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .slice(start, start + count)
    .map((block) => {
      if (block.startsWith('>')) {
        const text = block.split('\n').map((line) => line.replace(/^>\s?/, '').trim()).join(' ')
        return `<blockquote><p>${renderInline(text)}</p></blockquote>`
      }
      if (block.split('\n').every((line) => /^[-*]\s+/.test(line.trim()))) {
        const items = block.split('\n').map((line) => line.trim().replace(/^[-*]\s+/, ''))
        return `<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ul>`
      }
      if (/^#{1,6}\s+/.test(block)) return ''
      return `<p>${renderInline(block.split('\n').join(' '))}</p>`
    })
    .join('\n')
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
  throw new Error('TYP-07B expected a Markdown table but found none.')
}

function sourceRows(markdown: string, count: number): { citationMarkdown: string; url: string }[] {
  return markdown.split('\n')
    .filter((line) => /https?:\/\//.test(line))
    .map((line) => {
      const url = line.match(/https?:\/\/[^\s)]+/)?.[0] ?? ''
      const citationMarkdown = line
        .replace(url, '')
        .replace(/^\s*[-*+]\s*/, '')
        .replace(/[()]+\s*$/, '')
        .trim()
      return { citationMarkdown, url, score: url.length }
    })
    .filter((row) => row.url)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ citationMarkdown, url }) => ({ citationMarkdown, url }))
}

function chapterTitles(markdown: string, count: number): string[] {
  return [...markdown.matchAll(/^#\s+(\d+\.\s+.+)$/gm)].map((match) => match[1].trim()).slice(0, count)
}

function resolveAsset(sourcePath: string, asset: string): string {
  const path = posix.normalize(posix.join(posix.dirname(sourcePath), asset))
  if (path.startsWith('../')) throw new Error(`TYP-07B asset escaped repository root: ${asset}`)
  return path
}

function dataTransport(path: string): { mime: string; format: string } {
  const extension = extname(path).toLowerCase()
  if (extension === '.woff2') return { mime: 'font/woff2', format: 'woff2' }
  if (extension === '.otf') return { mime: 'font/otf', format: 'opentype' }
  if (extension === '.ttf') return { mime: 'font/ttf', format: 'truetype' }
  throw new Error(`Unsupported TYP-07 font extension: ${extension || '(none)'}`)
}

await rm(workRoot, { recursive: true, force: true })
await mkdir(workRoot, { recursive: true })

const sources = Object.fromEntries(
  await Promise.all(Object.entries(sourcePaths).map(async ([name, path]) => [name, await readFile(resolve(repoRoot, path), 'utf8')]))
) as Record<keyof typeof sourcePaths, string>

const fontEnv = await fetchOpenFontCandidate('source')
const fontSlots = [
  ['TYP03_SERIF_REGULAR', 'TYP07 Serif', 'normal', 400],
  ['TYP03_SERIF_ITALIC', 'TYP07 Serif', 'italic', 400],
  ['TYP03_SERIF_BOLD', 'TYP07 Serif', 'normal', 700],
  ['TYP03_SANS_REGULAR', 'TYP07 Sans', 'normal', 400],
  ['TYP03_SANS_BOLD', 'TYP07 Sans', 'normal', 700]
] as const

const fontFingerprints: Record<string, { sourceName: string; sha256: string }> = {}
const faceRules: string[] = []
const svgSansFaceRules: string[] = []
for (const [envName, family, style, weight] of fontSlots) {
  const supplied = fontEnv[envName]
  const bytes = await readFile(supplied)
  const transport = dataTransport(supplied)
  const dataUri = `data:${transport.mime};base64,${bytes.toString('base64')}`
  fontFingerprints[envName] = {
    sourceName: supplied.split('/').at(-1) ?? supplied,
    sha256: sha256(bytes)
  }
  faceRules.push(`@font-face { font-family:"${family}"; src:url("${dataUri}") format("${transport.format}"); font-style:${style}; font-weight:${weight}; font-display:block; }`)
  if (family === 'TYP07 Sans') {
    svgSansFaceRules.push(`@font-face{font-family:"TYP07 Source Sans";src:url("${dataUri}") format("${transport.format}");font-style:${style};font-weight:${weight};font-display:block}`)
  }
}

await writeFile(
  resolve(workRoot, 'fonts.css'),
  `${faceRules.join('\n')}\n:root { --typ07-serif:"TYP07 Serif",serif; --typ07-sans:"TYP07 Sans",sans-serif; }\n`,
  'utf8'
)

const svgEvidence: Record<string, {
  path: string
  canonicalSha256: string
  transformedSha256: string
  legacyFamily: string
  familyDeclarations: number
}> = {}

async function exactSansSvg(sourcePath: string, evidenceId: string, tabularNotes = false): Promise<string> {
  const canonical = await readFile(resolve(repoRoot, sourcePath), 'utf8')
  const legacyFamilies = [
    'font-family:Arial,Helvetica,sans-serif',
    'font-family:Arial, Helvetica, sans-serif'
  ] as const
  const matching = legacyFamilies.filter((family) => canonical.includes(family))
  if (matching.length !== 1) throw new Error(`TYP-07B ${sourcePath} expected one legacy Arial family syntax; found ${matching.length}.`)
  const legacyFamily = matching[0]
  const familyDeclarations = canonical.split(legacyFamily).length - 1
  if (familyDeclarations < 1) throw new Error(`TYP-07B ${sourcePath} has no legacy family declaration.`)

  const styleOpen = canonical.match(/<style(?:\s[^>]*)?>/)?.[0]
  if (!styleOpen) throw new Error(`TYP-07B ${sourcePath} has no SVG style boundary.`)
  const candidateFamily = 'font-family:"TYP07 Source Sans"'
  const numericRule = tabularNotes ? '.text-note{font-variant-numeric:tabular-nums}' : ''
  const injectedCss = `${svgSansFaceRules.join('')}${numericRule}`
  const transformed = canonical
    .replace(styleOpen, `${styleOpen}${injectedCss}`)
    .replaceAll(legacyFamily, candidateFamily)

  const reversed = transformed
    .replace(`${styleOpen}${injectedCss}`, styleOpen)
    .replaceAll(candidateFamily, legacyFamily)
  if (reversed !== canonical) {
    throw new Error(`TYP-07B ${sourcePath} transformation changed more than the reversible typography seam.`)
  }

  svgEvidence[evidenceId] = {
    path: sourcePath,
    canonicalSha256: sha256(canonical),
    transformedSha256: sha256(transformed),
    legacyFamily,
    familyDeclarations
  }
  return transformed
}

const partIChapter = extractSection(sources.partI, '# 1. The house after completion')
const openingProse = renderBlocks(partIChapter, 0, 2)
const sustainedProse = renderBlocks(partIChapter, 5, 14)

const compactSection = extractSection(sources.partV, '## Four burdens of provision')
const compactTable = parseFirstMarkdownTable(compactSection)
const compactTableHtml = `<table class="compact-table"><thead><tr>${compactTable.headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead><tbody>${compactTable.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`

const scheduleSection = extractSection(sources.schedule, '## Implementation schedule')
const scheduleTable = parseFirstMarkdownTable(scheduleSection)
const scheduleRows = scheduleTable.rows
  .map((row, index) => ({ row, index, score: row.reduce((sum, cell) => sum + cell.length, 0) }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 4)
  .sort((a, b) => a.index - b.index)
  .map(({ row }) => row)
const scheduleHtml = scheduleRows.map((row) => {
  const [subject, ...values] = row
  return `<article class="schedule-record"><h3 class="schedule-subject">${escapeHtml(subject ?? '')}</h3><dl>${values.map((value, index) => `<div class="schedule-field"><dt class="schedule-label">${escapeHtml(scheduleTable.headers[index + 1] ?? '')}</dt><dd class="schedule-value">${escapeHtml(value ?? '')}</dd></div>`).join('')}</dl></article>`
}).join('\n')

const parts = publicationEntries.filter((entry) => entry.kind === 'part').slice(0, 5)
if (parts.length !== 5) throw new Error(`TYP-07B expected five canonical Part entries; found ${parts.length}.`)
const backMatter = publicationEntries.filter((entry) => entry.kind === 'back-matter').slice(0, 5)
const tocRows: { level: 'primary' | 'secondary'; title: string }[] = []
for (const entry of parts) {
  tocRows.push({ level: 'primary', title: entry.title })
  const chapterSource = await readFile(resolve(repoRoot, entry.source), 'utf8')
  for (const title of chapterTitles(chapterSource, 2)) tocRows.push({ level: 'secondary', title })
}
for (const entry of backMatter) tocRows.push({ level: 'primary', title: entry.title })
const tocHtml = tocRows.map((row, index) => `<li class="toc-row toc-${row.level}"><span>${escapeHtml(row.title)}</span><span class="toc-page-number">${12 + index * 11}</span></li>`).join('\n')

const figures = publicationFigurePlacements()
const flowPlacement = figures.find((placement) => placement.entryId === 'part-ii' && placement.image === 'figures/failure-architecture-sequence.svg')
const captionPlacement = figures.find((placement) => placement.entryId === 'part-iii' && placement.image === '../docs/manuscript/figures/pattern-language-fields-sequence.svg')
if (!flowPlacement || !captionPlacement) throw new Error('TYP-07B canonical figure placements changed.')
const flowPath = resolveAsset(sourcePaths.partII, flowPlacement.image)
const captionPath = resolveAsset(sourcePaths.partIII, captionPlacement.image)
const flowSvg = await exactSansSvg(flowPath, 'flow-failure-architecture')
const captionSvg = await exactSansSvg(captionPath, 'flow-pattern-language-fields')

const plates = publicationPlatePlacements()
const frontPlacement = plates.find((placement) => placement.pageClass === 'PLATE_SINGLE' && placement.views.some((view) => view.title === 'Principal front elevation'))
const planPlacement = plates.find((placement) => placement.pageClass === 'PLATE_PAIR' && placement.views.some((view) => view.title === 'Ground-floor plan'))
if (!frontPlacement || !planPlacement || planPlacement.views.length !== 2) throw new Error('TYP-07B canonical plate selections changed.')
const frontView = frontPlacement.views.find((view) => view.title === 'Principal front elevation')
const groundView = planPlacement.views.find((view) => view.title === 'Ground-floor plan')
const firstView = planPlacement.views.find((view) => view.title === 'First-floor plan')
if (!frontView || !groundView || !firstView) throw new Error('TYP-07B expected front elevation and paired plans.')

const plateSvg = async (view: typeof frontView, id: string): Promise<string> => exactSansSvg(resolveAsset(sourcePaths.partIV, view.image), id, true)
const frontSvg = await plateSvg(frontView, 'plate-principal-front')
const groundSvg = await plateSvg(groundView, 'plate-ground-plan')
const firstSvg = await plateSvg(firstView, 'plate-first-plan')

const references = sourceRows(sources.sources, 8)
const referencesHtml = references.map((row) => `<li class="reference-row"><span class="reference-citation">${renderInline(row.citationMarkdown)}</span><span class="reference-url">${escapeHtml(row.url)}</span></li>`).join('\n')

const platePage = (view: typeof frontView, svg: string, extraClass = ''): string => `<section class="plate-page ${extraClass}"><header class="plate-header"><h2 class="plate-title">${escapeHtml(view.title)}</h2><p class="plate-scale">${escapeHtml(view.scale)}</p></header><div class="plate-drawing">${svg}</div><p class="plate-caption">${escapeHtml(view.caption)}</p></section>`

const specimen = `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <title>TYP-07B representative signature — ${format.toUpperCase()}</title>
</head>
<body>
  <section class="contents-page reading-column">
    <h1 class="contents-title">Contents</h1>
    <p class="contents-note">Representative navigation proof from the canonical Working Edition manifest. Numerals are specimen-only furniture, not production pagination.</p>
    <ol class="toc-list">${tocHtml}</ol>
  </section>

  <section class="division-page reading-column">
    <span class="division-string">Part I — The Proposition</span>
    <p class="division-label">Part I</p>
    <h1 class="division-title">The Proposition</h1>
  </section>

  <section class="entry-page reading-column">
    <span class="entry-string">1. The house after completion</span>
    <h1 class="entry-title">1. The house after completion</h1>
    ${openingProse}
  </section>

  <section class="body-page reading-column">
    <h2 class="section-title">The house after completion</h2>
    ${sustainedProse}
  </section>

  <section class="technical-page reading-column">
    <h2 class="section-title">Four burdens of provision</h2>
    <p>For early architectural decisions, classify the present burden before arguing about future benefit.</p>
    ${compactTableHtml}
  </section>

  <section class="technical-page reading-column">
    <h2 class="section-title">Reference House implementation schedule</h2>
    <p class="running-note">Four longest current records, preserving the accepted TYP-05 labelled-record composition.</p>
    ${scheduleHtml}
  </section>

  <section class="figure-page reading-column">
    <h2 class="section-title">Failure as architecture</h2>
    <figure class="inline-figure">${flowSvg}<figcaption class="caption">${escapeHtml(flowPlacement.caption)}</figcaption></figure>
  </section>

  ${platePage(frontView, frontSvg)}
  ${platePage(groundView, groundSvg, 'plate-page--pair-start')}
  ${platePage(firstView, firstSvg)}

  <section class="figure-page reading-column">
    <h2 class="section-title">A pattern language as a set of fields</h2>
    <figure class="inline-figure">${captionSvg}<figcaption class="caption">${escapeHtml(captionPlacement.caption)}</figcaption></figure>
  </section>

  <section class="reference-page reading-column">
    <h2 class="entry-title">Sources and further reading</h2>
    <p>Selected dense real references from the canonical reader-facing bibliography.</p>
    <ol class="reference-list">${referencesHtml}</ol>
  </section>
</body>
</html>`

await writeFile(resolve(workRoot, 'specimen.html'), specimen, 'utf8')

const sourceFingerprints = Object.fromEntries(
  Object.entries(sourcePaths).map(([name, path]) => [name, { path, sha256: sha256(sources[name as keyof typeof sources]) }])
)

await writeFile(
  resolve(workRoot, 'manifest.json'),
  `${JSON.stringify({
    schemaVersion: 1,
    packet: 'TYP-07B',
    format,
    canonicalMutation: false,
    proofUnits: typ07ProofUnits.map((unit) => unit.id),
    publicationEntryCount: publicationEntries.length,
    representativeExtent: 'measured from finished PDFs by verify.ts',
    wholeBookImplication: 'not numerically frozen here; a representative subset is not a defensible spine proxy and TYP-08 owns the full candidate book',
    sourceFingerprints,
    fontFingerprints,
    svgEvidence
  }, null, 2)}\n`,
  'utf8'
)

console.log(`Prepared TYP-07B ${format.toUpperCase()} representative signature.`)
