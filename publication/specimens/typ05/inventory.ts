import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyAdapter } from '../../adapters.js'
import { publicationFigurePlacements } from '../../figures.js'
import { publicationPlatePlacements } from '../../plates.js'
import { publicationEntries } from '../../publication.js'

const specimenRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(specimenRoot, '../../..')
const outRoot = resolve(repoRoot, 'publication/.work/typ05')

interface TableShape {
  columns: number
  rows: number
  maxCellChars: number
}

interface EntryInventory {
  id: string
  title: string
  kind: string
  source: string
  characters: number
  tables: TableShape[]
  fencedCodeBlocks: number
  fencedLanguages: string[]
  inlineCodeSpans: number
  bareUrls: number
  markdownLinks: number
  unorderedListItems: number
  orderedListItems: number
  blockquotes: number
  footnoteReferences: number
  unitOccurrences: number
  symbolicOccurrences: number
  displayMathMarkers: number
}

function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith('---\n')) return markdown
  const end = markdown.indexOf('\n---\n', 4)
  return end < 0 ? markdown : markdown.slice(end + 5)
}

function tableShapes(markdown: string): TableShape[] {
  const lines = markdown.split('\n')
  const results: TableShape[] = []
  const separator = /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/

  const cells = (line: string): string[] => line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())

  for (let index = 0; index < lines.length - 1; index += 1) {
    if (!lines[index].includes('|') || !separator.test(lines[index + 1])) continue

    const rows = [lines[index]]
    let cursor = index + 2
    while (cursor < lines.length && lines[cursor].includes('|') && lines[cursor].trim() !== '') {
      rows.push(lines[cursor])
      cursor += 1
    }

    const parsed = rows.map(cells)
    results.push({
      columns: Math.max(...parsed.map((row) => row.length)),
      rows: parsed.length,
      maxCellChars: Math.max(...parsed.flat().map((cell) => cell.replace(/[*_`]/g, '').length))
    })
    index = cursor - 1
  }

  return results
}

function fencedCode(markdown: string): { count: number; languages: string[]; bodyWithoutFences: string } {
  const lines = markdown.split('\n')
  const languages: string[] = []
  let count = 0
  let inFence = false
  const kept: string[] = []

  for (const line of lines) {
    const match = line.match(/^\s*```\s*([^\s`]*)/)
    if (match) {
      if (!inFence) {
        count += 1
        if (match[1]) languages.push(match[1])
      }
      inFence = !inFence
      continue
    }
    if (!inFence) kept.push(line)
  }

  return { count, languages, bodyWithoutFences: kept.join('\n') }
}

const entries: EntryInventory[] = []

for (const entry of publicationEntries) {
  const source = await readFile(resolve(repoRoot, entry.source), 'utf8')
  const adapted = stripFrontmatter(applyAdapter(entry.adapter, source, { repoRoot, workSourceRoot: repoRoot }))
  const fenced = fencedCode(adapted)
  const prose = fenced.bodyWithoutFences

  entries.push({
    id: entry.id,
    title: entry.title,
    kind: entry.kind,
    source: entry.source,
    characters: adapted.length,
    tables: tableShapes(adapted),
    fencedCodeBlocks: fenced.count,
    fencedLanguages: [...new Set(fenced.languages)].sort(),
    inlineCodeSpans: (prose.match(/`[^`\n]+`/g) ?? []).length,
    bareUrls: (prose.match(/https?:\/\/[^\s)>]+/g) ?? []).length,
    markdownLinks: (prose.match(/\[[^\]]+\]\([^)]+\)/g) ?? []).length,
    unorderedListItems: (prose.match(/^\s*[-*+]\s+.+$/gm) ?? []).length,
    orderedListItems: (prose.match(/^\s*\d+\.\s+.+$/gm) ?? []).length,
    blockquotes: (prose.match(/^\s*>\s+/gm) ?? []).length,
    footnoteReferences: (prose.match(/\[\^[^\]]+\]/g) ?? []).length,
    unitOccurrences: (prose.match(/\b\d+(?:\.\d+)?\s?(?:mm|cm|m²|m³|m|kW|W|Pa|°C|pt|%)\b/g) ?? []).length,
    symbolicOccurrences: (prose.match(/[×→≤≥±≈]/g) ?? []).length,
    displayMathMarkers: (prose.match(/\$\$|\\\[|\\\]/g) ?? []).length
  })
}

const figures = publicationFigurePlacements().map((figure) => ({
  entryId: figure.entryId,
  alt: figure.alt,
  captionChars: figure.caption.length
}))
const plates = publicationPlatePlacements().flatMap((placement) =>
  placement.views.map((view) => ({
    entryId: placement.entryId,
    pageClass: placement.pageClass,
    title: view.title,
    scale: view.scale,
    captionChars: view.caption.length
  }))
)

const totals = {
  entries: entries.length,
  tables: entries.reduce((sum, entry) => sum + entry.tables.length, 0),
  fencedCodeBlocks: entries.reduce((sum, entry) => sum + entry.fencedCodeBlocks, 0),
  inlineCodeSpans: entries.reduce((sum, entry) => sum + entry.inlineCodeSpans, 0),
  bareUrls: entries.reduce((sum, entry) => sum + entry.bareUrls, 0),
  markdownLinks: entries.reduce((sum, entry) => sum + entry.markdownLinks, 0),
  unorderedListItems: entries.reduce((sum, entry) => sum + entry.unorderedListItems, 0),
  orderedListItems: entries.reduce((sum, entry) => sum + entry.orderedListItems, 0),
  blockquotes: entries.reduce((sum, entry) => sum + entry.blockquotes, 0),
  footnoteReferences: entries.reduce((sum, entry) => sum + entry.footnoteReferences, 0),
  unitOccurrences: entries.reduce((sum, entry) => sum + entry.unitOccurrences, 0),
  symbolicOccurrences: entries.reduce((sum, entry) => sum + entry.symbolicOccurrences, 0),
  displayMathMarkers: entries.reduce((sum, entry) => sum + entry.displayMathMarkers, 0),
  controlledFigures: figures.length,
  controlledPlateViews: plates.length
}

const tableEntries = entries
  .filter((entry) => entry.tables.length)
  .map((entry) => ({ id: entry.id, title: entry.title, tables: entry.tables }))
const urlEntries = entries
  .filter((entry) => entry.bareUrls)
  .sort((a, b) => b.bareUrls - a.bareUrls)
  .map((entry) => ({ id: entry.id, title: entry.title, bareUrls: entry.bareUrls }))
const codeEntries = entries
  .filter((entry) => entry.fencedCodeBlocks || entry.inlineCodeSpans)
  .map((entry) => ({
    id: entry.id,
    title: entry.title,
    fencedCodeBlocks: entry.fencedCodeBlocks,
    fencedLanguages: entry.fencedLanguages,
    inlineCodeSpans: entry.inlineCodeSpans
  }))
const unitEntries = entries
  .filter((entry) => entry.unitOccurrences)
  .sort((a, b) => b.unitOccurrences - a.unitOccurrences)
  .slice(0, 12)
  .map((entry) => ({ id: entry.id, title: entry.title, unitOccurrences: entry.unitOccurrences }))
const listEntries = entries
  .map((entry) => ({
    id: entry.id,
    title: entry.title,
    listItems: entry.unorderedListItems + entry.orderedListItems
  }))
  .filter((entry) => entry.listItems)
  .sort((a, b) => b.listItems - a.listItems)
  .slice(0, 12)

const inventory = {
  schemaVersion: 1,
  packet: 'TYP-05A',
  sourceAuthority: 'publication/publication.ts + publication adapters + controlled figure/plate registries',
  totals,
  tableEntries,
  codeEntries,
  urlEntries,
  unitEntries,
  listEntries,
  figures,
  plates,
  entries
}

const tableLines = tableEntries.length
  ? tableEntries.flatMap((entry) => entry.tables.map((table, index) =>
      `- ${entry.id} — ${entry.title}: table ${index + 1}, ${table.columns} columns × ${table.rows} reader rows, longest cell ${table.maxCellChars} chars`
    ))
  : ['- none']
const codeLines = codeEntries.length
  ? codeEntries.map((entry) => `- ${entry.id} — ${entry.title}: ${entry.fencedCodeBlocks} fenced block(s), ${entry.inlineCodeSpans} inline-code span(s)${entry.fencedLanguages.length ? `; languages ${entry.fencedLanguages.join(', ')}` : ''}`)
  : ['- none']
const urlLines = urlEntries.length
  ? urlEntries.map((entry) => `- ${entry.id} — ${entry.title}: ${entry.bareUrls} bare URL(s)`)
  : ['- none']

const report = `# TYP-05A executable difficult-content inventory\n\n` +
`Generated from the current Working Edition manifest after publication adapters, with controlled figures and plate furniture inventoried from their registries rather than from implementation HTML.\n\n` +
`## Aggregate\n\n` +
`- publication entries: **${totals.entries}**\n` +
`- Markdown tables: **${totals.tables}**\n` +
`- fenced code blocks: **${totals.fencedCodeBlocks}**\n` +
`- inline-code spans: **${totals.inlineCodeSpans}**\n` +
`- bare URLs: **${totals.bareUrls}**\n` +
`- Markdown links: **${totals.markdownLinks}**\n` +
`- list items: **${totals.unorderedListItems + totals.orderedListItems}**\n` +
`- blockquotes: **${totals.blockquotes}**\n` +
`- footnote references: **${totals.footnoteReferences}**\n` +
`- numeric unit occurrences: **${totals.unitOccurrences}**\n` +
`- symbolic ×/→/≤/≥/±/≈ occurrences: **${totals.symbolicOccurrences}**\n` +
`- display-math markers: **${totals.displayMathMarkers}**\n` +
`- controlled inline figures: **${totals.controlledFigures}**\n` +
`- controlled plate views: **${totals.controlledPlateViews}**\n\n` +
`## Tables\n\n${tableLines.join('\n')}\n\n` +
`## Code / machine text\n\n${codeLines.join('\n')}\n\n` +
`## Bare URLs\n\n${urlLines.join('\n')}\n\n` +
`## Highest unit density\n\n${unitEntries.map((entry) => `- ${entry.id} — ${entry.title}: ${entry.unitOccurrences}`).join('\n') || '- none'}\n\n` +
`## Highest list density\n\n${listEntries.map((entry) => `- ${entry.id} — ${entry.title}: ${entry.listItems}`).join('\n') || '- none'}\n\n` +
`## Controlled visual furniture\n\n` +
`- inline figure captions: **${figures.length}**; longest caption **${Math.max(0, ...figures.map((figure) => figure.captionChars))} chars**\n` +
`- architectural plate views: **${plates.length}**; longest plate caption **${Math.max(0, ...plates.map((plate) => plate.captionChars))} chars**\n` +
`- plate scales present: **${[...new Set(plates.map((plate) => plate.scale))].join(', ') || 'none'}**\n`

await mkdir(outRoot, { recursive: true })
await writeFile(resolve(outRoot, 'inventory.json'), `${JSON.stringify(inventory, null, 2)}\n`, 'utf8')
await writeFile(resolve(outRoot, 'inventory.md'), report, 'utf8')

console.log(report)
