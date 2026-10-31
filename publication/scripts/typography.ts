import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { extname, posix, resolve } from 'node:path'

import { fetchPublicationFonts, type PublicationFontSlot } from '../fonts.js'
import { publicationFigurePlacements } from '../figures.js'
import { publicationPlatePlacements } from '../plates.js'
import { publicationEntries, type PublicationEntry } from '../publication.js'

export type ProductionTypographyContext = {
  repoRoot: string
  publicationRoot: string
  workRoot: string
  workSourceRoot: string
}

type Build = Record<string, unknown> & {
  mode: string
  titlePage: string
  entries: Array<{ id: string; source: string; title: string }>
}

type ParsedTable = { headers: string[]; rows: string[][]; start: number; end: number }

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
  throw new Error(`Unsupported publication font extension: ${extension || '(none)'}`)
}

function resolveAsset(sourcePath: string, asset: string): string {
  const resolved = posix.normalize(posix.join(posix.dirname(sourcePath), asset))
  if (resolved.startsWith('../') || resolved === '..') {
    throw new Error(`Publication asset escaped repository root: ${sourcePath} -> ${asset}`)
  }
  return resolved
}

function firstMarkdownTable(markdown: string): ParsedTable {
  const lines = markdown.split('\n')
  const separator = /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/
  const cells = (line: string): string[] => line
    .trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(stripInline)

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
  throw new Error('Production typography expected a Markdown table but found none.')
}

function scheduleRecords(markdown: string): { markdown: string; records: number } {
  if (!markdown.includes('## Implementation schedule')) {
    throw new Error('Appendix C implementation-schedule heading changed.')
  }
  const table = firstMarkdownTable(markdown)
  if (table.headers.length !== 5 || table.rows.length < 20) {
    throw new Error(`Expected five-column Appendix C schedule; found ${table.headers.length} columns / ${table.rows.length} rows.`)
  }
  const records = table.rows.map((row) => {
    const [subject, ...values] = row
    const fields = values.map((value, index) => `<div class="schedule-field"><dt class="schedule-label">${escapeHtml(table.headers[index + 1] ?? '')}</dt><dd class="schedule-value">${escapeHtml(value ?? '')}</dd></div>`).join('\n')
    return `<section class="schedule-record"><h3 class="schedule-subject">${escapeHtml(subject ?? '')}</h3><dl>${fields}</dl></section>`
  }).join('\n')
  const lines = markdown.split('\n')
  return {
    markdown: [...lines.slice(0, table.start), `<div class="schedule-records">\n${records}\n</div>`, ...lines.slice(table.end)].join('\n'),
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
  if (replacements !== 1) throw new Error(`Expected exactly one architectural arrow sequence in ${owner}; found ${replacements}.`)
  return { markdown: transformed, replacements }
}

function rewriteReferenceUrls(markdown: string): { markdown: string; rows: number } {
  let rows = 0
  const transformed = markdown.split('\n').map((line) => {
    if (!/^\s*[-*+]\s+/.test(line) || !/https?:\/\//.test(line)) return line
    const url = line.match(/https?:\/\/[^\s)]+/)?.[0]
    if (!url) return line
    rows += 1
    const citation = stripInline(line.replace(url, '').replace(/^\s*[-*+]\s+/, '').replace(/[()]+\s*$/, '').trim())
    return `<div class="reference-row"><span class="reference-citation">${escapeHtml(citation)}</span><a class="reference-url" href="${escapeHtml(url)}">${escapeHtml(url)}</a></div>`
  }).join('\n')
  if (rows < 5) throw new Error(`Expected several long-URL source rows; found ${rows}.`)
  return { markdown: transformed, rows }
}

function divisionMarker(division: string): string {
  return `<div class="publication-context-marker publication-division-context" aria-hidden="true"><span class="publication-division-string">${escapeHtml(division)}</span><span class="publication-entry-string">${escapeHtml(division)}</span></div>`
}

function entryMarker(division: string, entry: string): string {
  return `<div class="publication-context-marker publication-entry-context" aria-hidden="true"><span class="publication-division-string">${escapeHtml(division)}</span><span class="publication-entry-string">${escapeHtml(entry)}</span></div>`
}

function decorateHeadings(markdown: string, entry: PublicationEntry, division: string): { markdown: string; divisionOpenings: number; entryOpenings: number } {
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
      if (title !== entry.title) throw new Error(`Division title drift in ${entry.source}: expected ${entry.title}, found ${title}.`)
      out.push(divisionMarker(title), '', line)
      divisionOpenings += 1
    } else {
      out.push(entryMarker(division, title), '', line)
      entryOpenings += 1
    }
  }

  if (h1Count < 1) throw new Error(`No H1 opening found in ${entry.source}.`)
  if (entry.kind === 'part' && divisionOpenings !== 1) throw new Error(`Expected one division opening in ${entry.source}.`)
  if (entry.kind !== 'part' && entryOpenings < 1) throw new Error(`Expected an entry opening in ${entry.source}.`)
  return { markdown: out.join('\n'), divisionOpenings, entryOpenings }
}

function withPartBodyMetadata(markdown: string): string {
  if (/^---\s*\n/.test(markdown)) throw new Error('Generated Part source unexpectedly already has VFM frontmatter.')
  return `---\nbody:\n  class: publication-part-document\n---\n\n${markdown}`
}

function rewritePartINotes(markdown: string): { markdown: string; citationRows: number; urlRows: number } {
  const marker = '# Notes\n'
  const start = markdown.indexOf(marker)
  if (start < 0) throw new Error('Part I Notes heading changed.')
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
    if (url) urlRows += 1
    return `<div class="reference-row notes-reference-row"><span class="reference-citation">${escapeHtml(`${label} ${citation}`)}</span>${url ? `<a class="reference-url" href="${escapeHtml(url)}">${escapeHtml(url)}</a>` : ''}</div>`
  }).join('\n')
  if (citationRows !== 31) throw new Error(`Expected 31 Part I note rows; found ${citationRows}.`)
  if (urlRows < 20) throw new Error(`Expected at least 20 long-URL Part I notes; found ${urlRows}.`)
  return { markdown: `${head}${transformed}`, citationRows, urlRows }
}

export async function applyProductionTypography(context: ProductionTypographyContext): Promise<void> {
  const { repoRoot, workRoot, workSourceRoot } = context
  const buildPath = resolve(workRoot, 'build.json')
  const build = JSON.parse(await readFile(buildPath, 'utf8')) as Build
  if (build.mode !== 'full') throw new Error(`Production typography integration requires full mode, received ${build.mode}.`)
  if (build.entries.length !== publicationEntries.length) throw new Error('Production typography entry count drifted from canonical publication order.')

  const fontSlots = await fetchPublicationFonts(resolve(workRoot, 'publication-fonts'))
  const fontDefinitions = [
    ['PUBLICATION_SERIF_REGULAR', 'Publication Serif', 'normal', 400],
    ['PUBLICATION_SERIF_ITALIC', 'Publication Serif', 'italic', 400],
    ['PUBLICATION_SERIF_SEMIBOLD', 'Publication Serif', 'normal', 600],
    ['PUBLICATION_SANS_REGULAR', 'Publication Sans', 'normal', 400],
    ['PUBLICATION_SANS_BOLD', 'Publication Sans', 'normal', 700]
  ] as const satisfies ReadonlyArray<readonly [PublicationFontSlot, string, string, number]>

  const faceRules: string[] = []
  const svgSansFaceRules: string[] = []
  const fontFingerprints: Record<string, { sourceName: string; sha256: string }> = {}
  for (const [slot, family, style, weight] of fontDefinitions) {
    const source = fontSlots[slot]
    const bytes = await readFile(source)
    const transport = fontTransport(source)
    const dataUri = `data:${transport.mime};base64,${bytes.toString('base64')}`
    fontFingerprints[slot] = { sourceName: source.split('/').at(-1) ?? source, sha256: sha256(bytes) }
    faceRules.push(`@font-face { font-family:"${family}"; src:url("${dataUri}") format("${transport.format}"); font-style:${style}; font-weight:${weight}; font-display:block; }`)
    if (family === 'Publication Sans') {
      svgSansFaceRules.push(`@font-face{font-family:"Publication Source Sans";src:url("${dataUri}") format("${transport.format}");font-style:${style};font-weight:${weight};font-display:block}`)
    }
  }
  await writeFile(
    resolve(workRoot, 'typography-fonts.css'),
    `${faceRules.join('\n')}\n:root { --publication-serif:"Publication Serif",serif; --publication-sans:"Publication Sans",sans-serif; }\n`,
    'utf8'
  )

  const schedulePath = resolve(workSourceRoot, 'docs/manuscript/reference-house-implementation-schedule.md')
  const schedule = scheduleRecords(await readFile(schedulePath, 'utf8'))
  await writeFile(schedulePath, schedule.markdown, 'utf8')

  const partIIPath = resolve(workSourceRoot, 'docs/manuscript/part-ii.md')
  const partIISequence = replaceArrowSequence(await readFile(partIIPath, 'utf8'), 'prepared Part II')
  await writeFile(partIIPath, partIISequence.markdown, 'utf8')

  const partIIIPath = resolve(workSourceRoot, 'publication/part-iii.md')
  const partIIISequence = replaceArrowSequence(await readFile(partIIIPath, 'utf8'), 'prepared Part III')
  await writeFile(partIIIPath, partIIISequence.markdown, 'utf8')

  const sourcesPath = resolve(workSourceRoot, 'docs/manuscript/sources-and-further-reading.md')
  const references = rewriteReferenceUrls(await readFile(sourcesPath, 'utf8'))
  await writeFile(sourcesPath, references.markdown, 'utf8')

  const partIVPath = resolve(workSourceRoot, 'docs/manuscript/part-iv.md')
  const partIVBefore = await readFile(partIVPath, 'utf8')
  const plateStylePattern = /<style>\s*@page hk-plate[\s\S]*?<\/style>\s*/g
  const plateStyles = partIVBefore.match(plateStylePattern) ?? []
  if (plateStyles.length !== 1 || !plateStyles[0].includes('Arial, Helvetica, sans-serif') || !plateStyles[0].includes('size: A4')) {
    throw new Error(`Prepared Part IV no longer exposes the one known working A4 plate stylesheet; found ${plateStyles.length}.`)
  }
  // The frozen drawing register inserts plates directly after section headings.
  // In production, keep each heading with its opening explanation before the
  // full-page plate. This changes pagination, not the frozen register or views.
  let plateHeadingParagraphs = 0
  const partIVWithoutWorkingStyle = partIVBefore.replace(plateStylePattern, '')
  const partIVWithExplanations = partIVWithoutWorkingStyle.replace(
    /(^## [^\n]+\n\n)((?:<section class="hk-plate-page\b[\s\S]*?<\/section>\s*)+)([^\n]+)(?=\n\n|$)/gm,
    (_whole, heading: string, plates: string, paragraph: string) => {
      if (/^[#<|>*-]/.test(paragraph)) throw new Error('A plate heading has no opening explanatory paragraph.')
      plateHeadingParagraphs += 1
      return `${heading}${paragraph}\n\n${plates.trimEnd()}`
    }
  )
  const expectedPlateHeadingParagraphs = publicationPlatePlacements().filter((placement) => placement.anchor.startsWith('## ')).length
  if (plateHeadingParagraphs !== expectedPlateHeadingParagraphs) {
    throw new Error(`Expected ${expectedPlateHeadingParagraphs} plate headings with opening explanations; found ${plateHeadingParagraphs}.`)
  }
  await writeFile(partIVPath, partIVWithExplanations, 'utf8')

  const entryById = new Map(publicationEntries.map((entry) => [entry.id, entry]))
  const controlledAssets = new Set<string>()
  for (const placement of publicationFigurePlacements()) {
    const entry = entryById.get(placement.entryId)
    if (!entry) throw new Error(`Figure placement has no publication entry: ${placement.entryId}`)
    controlledAssets.add(resolveAsset(entry.source, placement.image))
  }
  for (const placement of publicationPlatePlacements()) {
    const entry = entryById.get(placement.entryId)
    if (!entry) throw new Error(`Plate placement has no publication entry: ${placement.entryId}`)
    for (const view of placement.views) controlledAssets.add(resolveAsset(entry.source, view.image))
  }

  const svgEvidence: Record<string, { canonicalSha256: string; transformedSha256: string; familyDeclarations: number; tabularNotes: boolean }> = {}
  for (const sourcePath of [...controlledAssets].sort()) {
    const canonical = await readFile(resolve(repoRoot, sourcePath), 'utf8')
    const preparedPath = resolve(workSourceRoot, sourcePath)
    const prepared = await readFile(preparedPath, 'utf8')
    if (prepared !== canonical) throw new Error(`Controlled SVG copy diverged before production typography rebinding: ${sourcePath}`)
    const legacyFamilies = ['font-family:Arial, Helvetica, sans-serif', 'font-family:Arial,Helvetica,sans-serif'] as const
    const matching = legacyFamilies.filter((family) => canonical.includes(family))
    if (matching.length !== 1) throw new Error(`${sourcePath} expected one legacy Arial family syntax; found ${matching.length}.`)
    const legacyFamily = matching[0]
    const familyDeclarations = canonical.split(legacyFamily).length - 1
    const styleOpen = canonical.match(/<style(?:\s[^>]*)?>/)?.[0]
    if (!styleOpen || familyDeclarations < 1) throw new Error(`${sourcePath} lacks the expected SVG typography seam.`)
    const tabularNotes = sourcePath.startsWith('docs/reference-house/')
    const numericRule = tabularNotes ? '.text-note{font-variant-numeric:tabular-nums}' : ''
    const injectedCss = `${svgSansFaceRules.join('')}${numericRule}`
    const productionFamily = 'font-family:"Publication Source Sans"'
    const transformed = canonical.replace(styleOpen, `${styleOpen}${injectedCss}`).replaceAll(legacyFamily, productionFamily)
    const reversed = transformed.replace(`${styleOpen}${injectedCss}`, styleOpen).replaceAll(productionFamily, legacyFamily)
    if (reversed !== canonical) throw new Error(`${sourcePath} typography-only transformation is not byte reversible.`)
    await writeFile(preparedPath, transformed, 'utf8')
    svgEvidence[sourcePath] = {
      canonicalSha256: sha256(canonical), transformedSha256: sha256(transformed), familyDeclarations, tabularNotes
    }
  }

  let currentDivision = 'Ovid’s House'
  let divisionOpenings = 0
  let entryOpenings = 0
  let noteRows = 0
  let noteUrls = 0
  for (const entry of publicationEntries) {
    if (entry.kind === 'back-matter') currentDivision = 'Appendices'
    if (entry.kind === 'part') currentDivision = entry.title
    const preparedPath = resolve(workSourceRoot, entry.source)
    const decorated = decorateHeadings(await readFile(preparedPath, 'utf8'), entry, currentDivision)
    divisionOpenings += decorated.divisionOpenings
    entryOpenings += decorated.entryOpenings
    let after = decorated.markdown
    if (entry.id === 'part-i') {
      const notes = rewritePartINotes(after)
      after = notes.markdown
      noteRows = notes.citationRows
      noteUrls = notes.urlRows
    }
    if (entry.kind === 'part') after = withPartBodyMetadata(after)
    await writeFile(preparedPath, after, 'utf8')
  }
  if (divisionOpenings !== 6) throw new Error(`Expected six production division openings; found ${divisionOpenings}.`)

  const titlePath = resolve(workSourceRoot, build.titlePage)
  const titleBefore = await readFile(titlePath, 'utf8')
  const metaPattern = /\n\s*<div class="publication-title__meta">([\s\S]*?)<\/div>\s*/
  const metaMatch = titleBefore.match(metaPattern)
  if (!metaMatch) throw new Error('Production title page no longer exposes the known provenance block.')
  const titleAfter = titleBefore.replace(metaPattern, '\n')
  if (/Revision\s+<code>|adamnoden\.github\.io\/architecture|\d{1,2}\s+\w+\s+20\d{2}/.test(titleAfter)) {
    throw new Error('Principal title page still contains provenance after production separation.')
  }
  await writeFile(titlePath, titleAfter, 'utf8')

  const imprintPage = 'publication-imprint.html'
  await writeFile(
    resolve(workSourceRoot, imprintPage),
    `<!doctype html>\n<html lang="en-GB">\n<head>\n  <meta charset="utf-8">\n  <title>Imprint / provenance</title>\n</head>\n<body class="publication-imprint-page">\n  <main class="publication-imprint">\n    <h1>Imprint / provenance</h1>\n    <div class="publication-imprint__meta">${metaMatch[1].trim()}\n    </div>\n  </main>\n</body>\n</html>\n`,
    'utf8'
  )
  build.imprintPage = imprintPage
  build.typography = {
    contract: 'TYP-09A production integration',
    fonts: fontFingerprints,
    semanticDivisionOpenings: divisionOpenings,
    semanticEntryOpenings: entryOpenings,
    partINoteCitationRows: noteRows,
    partINoteUrlRows: noteUrls,
    scheduleRecords: schedule.records,
    arrowSequences: partIISequence.replacements + partIIISequence.replacements,
    referenceUrlRows: references.rows,
    strippedWorkingPlateStyles: plateStyles.length,
    plateHeadingsWithOpeningParagraph: plateHeadingParagraphs,
    controlledSvgCount: controlledAssets.size
  }
  await writeFile(buildPath, `${JSON.stringify(build, null, 2)}\n`, 'utf8')
  await writeFile(
    resolve(workRoot, 'typography-integration.json'),
    `${JSON.stringify({
      schemaVersion: 1,
      packet: 'TYP-09A',
      canonicalMutation: false,
      productionThemeMigrated: true,
      familyOrBodyMetricsChangedFromFrozenContract: false,
      fonts: fontFingerprints,
      transforms: build.typography,
      svgEvidence
    }, null, 2)}\n`,
    'utf8'
  )

  console.log(`Applied frozen production typography: ${divisionOpenings} divisions, ${entryOpenings} entries, ${controlledAssets.size} controlled SVGs.`)
}