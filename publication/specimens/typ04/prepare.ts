import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { publicationEntries } from '../../publication.js'
import { fetchOpenFontCandidate } from '../typ03/open-fonts.js'

const specimenRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(specimenRoot, '../../..')
const format = process.env.TYP04_FORMAT === 'a4' ? 'a4' : 'b5'
const workRoot = resolve(repoRoot, 'publication/.work/typ04', format)
const fontsRoot = resolve(workRoot, 'fonts')

const sourcePaths = {
  partI: 'docs/manuscript/part-i.md',
  partII: 'docs/manuscript/part-ii.md',
  partV: 'docs/manuscript/part-v.md',
  pattern: 'docs/patterns/controlled-utility-entry.md',
  appendix: 'docs/manuscript/evidence-and-precedent-notes.md',
  publication: 'publication/publication.ts'
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
    .replace(/\[\^(\d+)\]/g, '[$1]')
    .trim()
}

function extractSection(markdown: string, heading: string): string {
  const marker = `${heading}\n`
  const start = markdown.indexOf(marker)
  if (start < 0) throw new Error(`Missing TYP-04 source anchor: ${heading}`)
  const level = heading.match(/^#+/)?.[0].length
  if (!level) throw new Error(`Invalid Markdown heading anchor: ${heading}`)
  const after = start + marker.length
  const remainder = markdown.slice(after)
  const nextHeading = new RegExp(`^#{1,${level}}\\s+`, 'm').exec(remainder)
  const end = nextHeading ? after + nextHeading.index : markdown.length
  return markdown.slice(after, end).trim()
}

function proseParagraphs(section: string, count: number): string[] {
  return section
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) =>
      paragraph.length > 0 &&
      paragraph !== '---' &&
      !paragraph.startsWith('#') &&
      !paragraph.startsWith('- ') &&
      !paragraph.startsWith('* ') &&
      !paragraph.startsWith('>') &&
      !paragraph.startsWith('```')
    )
    .map(stripInline)
    .filter(Boolean)
    .slice(0, count)
}

function h1Titles(markdown: string): string[] {
  return [...markdown.matchAll(/^#\s+(.+)$/gm)]
    .map((match) => stripInline(match[1]))
    .filter((title) => /^\d+\.\s+/.test(title))
}

const sources = Object.fromEntries(
  await Promise.all(Object.entries(sourcePaths).map(async ([name, path]) => {
    const content = await readFile(resolve(repoRoot, path), 'utf8')
    return [name, content]
  }))
) as Record<keyof typeof sourcePaths, string>

await rm(workRoot, { recursive: true, force: true })
await mkdir(fontsRoot, { recursive: true })

const fontEnv = await fetchOpenFontCandidate('source')
const fontSlots = [
  ['TYP03_SERIF_REGULAR', 'SourceSerif4-Regular.ttf', 'TYP04 Serif', 'normal', 400],
  ['TYP03_SERIF_ITALIC', 'SourceSerif4-It.ttf', 'TYP04 Serif', 'italic', 400],
  ['TYP03_SERIF_BOLD', 'SourceSerif4-Bold.ttf', 'TYP04 Serif', 'normal', 700],
  ['TYP03_SANS_REGULAR', 'SourceSans3-Regular.ttf', 'TYP04 Sans', 'normal', 400],
  ['TYP03_SANS_BOLD', 'SourceSans3-Bold.ttf', 'TYP04 Sans', 'normal', 700]
] as const

const fontFingerprints: Record<string, { sourceName: string; sha256: string }> = {}
const faceRules: string[] = []
for (const [envName, localName, family, style, weight] of fontSlots) {
  const supplied = fontEnv[envName]
  const bytes = await readFile(supplied)
  await copyFile(supplied, resolve(fontsRoot, localName))
  fontFingerprints[envName] = { sourceName: basename(supplied), sha256: sha256(bytes) }
  faceRules.push(`@font-face {\n  font-family: "${family}";\n  src: url("fonts/${localName}");\n  font-style: ${style};\n  font-weight: ${weight};\n  font-display: block;\n}`)
}
await writeFile(
  resolve(workRoot, 'fonts.css'),
  `${faceRules.join('\n\n')}\n\n:root {\n  --typ04-serif: "TYP04 Serif", serif;\n  --typ04-sans: "TYP04 Sans", sans-serif;\n}\n`,
  'utf8'
)

const chapterOne = proseParagraphs(extractSection(sources.partI, '# 1. The house after completion'), 6)
const selectivePermanence = proseParagraphs(extractSection(sources.partI, '# 3. Selective permanence'), 4)
const permanenceWithoutStasis = proseParagraphs(extractSection(sources.partI, '## Permanence without stasis'), 3)
const patternContext = proseParagraphs(extractSection(sources.pattern, '## Context'), 1)
const patternProblem = proseParagraphs(extractSection(sources.pattern, '## Problem'), 1)
const patternPattern = proseParagraphs(extractSection(sources.pattern, '## Pattern'), 2)
const patternForces = extractSection(sources.pattern, '## Forces')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.startsWith('- '))
  .map((line) => stripInline(line.slice(2)))
  .slice(0, 5)
const appendixIntro = proseParagraphs(sources.appendix.replace(/^# .+\n/, ''), 2)
const appendixSection = proseParagraphs(extractSection(sources.appendix, '## 1. Four uses of evidence'), 1)
const appendixMinor = proseParagraphs(extractSection(sources.appendix, '### Established external knowledge'), 2)

const partIChapters = h1Titles(sources.partI)
const partIIChapters = h1Titles(sources.partII)
const partVChapters = h1Titles(sources.partV)
const partIIIEntries = publicationEntries.filter((entry) => ['pattern', 'strategy', 'candidate'].includes(entry.kind))
const backMatter = publicationEntries.filter((entry) => entry.kind === 'back-matter')

let pageSeed = 1
const tocRow = (title: string, level: 'primary' | 'secondary', qualifier?: string): string => {
  pageSeed += level === 'primary' ? 4 : 2
  const label = qualifier ? `<span class="toc-qualifier">${escapeHtml(qualifier)}</span>${escapeHtml(title)}` : escapeHtml(title)
  return `<li class="toc-row toc-${level}"><span class="toc-label">${label}</span><span class="toc-page">${pageSeed}</span></li>`
}

const tocRows = [
  tocRow('Preface — The Obvious, Eventually', 'primary'),
  tocRow("Reader's Guide", 'primary'),
  tocRow('Part I — The Proposition', 'primary'),
  ...partIChapters.map((title) => tocRow(title, 'secondary')),
  tocRow('Part II — Architecture of the Platform', 'primary'),
  ...partIIChapters.map((title) => tocRow(title, 'secondary')),
  tocRow('Part III — Patterns and Generative Sequences', 'primary'),
  ...partIIIEntries.map((entry) => tocRow(entry.title, 'secondary', entry.kind === 'pattern' ? undefined : `${entry.kind} · `)),
  tocRow('Part IV — Reference House', 'primary'),
  tocRow('Part V — Making and Testing the Platform', 'primary'),
  ...partVChapters.map((title) => tocRow(title, 'secondary')),
  ...backMatter.map((entry) => tocRow(entry.title, 'primary'))
].join('\n')

const paragraphs = (items: string[]): string => items.map((item) => `<p>${escapeHtml(item)}</p>`).join('\n')
const listItems = (items: string[]): string => items.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n')

const specimen = `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <title>TYP-04B hierarchy specimen — ${format.toUpperCase()}</title>
</head>
<body>
  <section class="title-page">
    <h1 class="book-title">Ovid’s House</h1>
  </section>

  <section class="imprint-page reading-column">
    <p class="edition-label">Private proof</p>
    <h2 class="imprint-title">Typography hierarchy specimen</h2>
    <p>TYP-04B · serif-led openings / sans-led navigation</p>
    <p>${format.toUpperCase()} · black only · exact pinned Source Serif 4 + Source Sans 3</p>
    <p class="imprint-note">This page carries proof provenance so the principal title page does not.</p>
  </section>

  <section class="contents-page reading-column">
    <h2 class="contents-title">Contents</h2>
    <p class="contents-note">Two reader-facing levels. Page numerals are deterministic specimen placeholders, not Working Edition pagination.</p>
    <ol class="toc-list">${tocRows}</ol>
  </section>

  <section class="division-page reading-column">
    <span class="division-string">Part I · The Proposition</span>
    <p class="division-label">Part I</p>
    <h1 class="division-title">The Proposition</h1>
  </section>

  <section class="entry-opening-page reading-column">
    <span class="entry-string">1. The house after completion</span>
    <h2 class="entry-title">1. The house after completion</h2>
    ${paragraphs(chapterOne.slice(0, 2))}
  </section>

  <section class="body-page reading-column">
    ${paragraphs(chapterOne.slice(2, 5))}
    <p>The architecture is developed further in <a class="xref" href="#pattern-entry">Controlled Utility Entry</a>, where the same whole-life proposition becomes a repeatable architectural condition.</p>
    <h3 class="section-title">Selective permanence</h3>
    ${paragraphs(selectivePermanence.slice(0, 2))}
    <h4 class="minor-title">Permanence without stasis</h4>
    ${paragraphs(permanenceWithoutStasis.slice(0, 2))}
  </section>

  <section id="pattern-entry" class="entry-opening-page reading-column">
    <span class="division-string">Part III · Patterns and Generative Sequences</span>
    <span class="entry-string">Controlled Utility Entry</span>
    <h2 class="entry-title">Controlled Utility Entry</h2>
    <h3 class="section-title">Context</h3>
    ${paragraphs(patternContext)}
    <h3 class="section-title">Problem</h3>
    ${paragraphs(patternProblem)}
  </section>

  <section class="body-page reading-column">
    <h3 class="section-title">Pattern</h3>
    ${paragraphs(patternPattern)}
    <h3 class="section-title">Forces</h3>
    <ul>${listItems(patternForces)}</ul>
    <p>See also <a class="xref" href="#appendix-entry">Evidence and Precedent Notes</a>. An external source would retain ordinary link marking rather than this quiet internal-reference treatment.</p>
  </section>

  <section id="appendix-entry" class="entry-opening-page reading-column">
    <span class="division-string">Appendices</span>
    <span class="entry-string">Appendix A · Evidence and Precedent Notes</span>
    <h2 class="entry-title">Appendix A — Evidence and Precedent Notes</h2>
    ${paragraphs(appendixIntro)}
  </section>

  <section class="body-page reading-column">
    <h3 class="section-title">1. Four uses of evidence</h3>
    ${paragraphs(appendixSection)}
    <h4 class="minor-title">Established external knowledge</h4>
    ${paragraphs(appendixMinor)}
  </section>

  <section class="division-page reading-column final-division">
    <span class="division-string">Part IV · Reference House</span>
    <p class="division-label">Part IV</p>
    <h1 class="division-title">Reference House</h1>
    <p class="division-deck">A deliberate recto start follows the preceding material so the specimen can expose parity-blank behaviour and furniture suppression.</p>
  </section>
</body>
</html>
`
await writeFile(resolve(workRoot, 'specimen.html'), specimen, 'utf8')

const manifest = {
  schemaVersion: 1,
  packet: 'TYP-04B',
  candidate: 'serif-led-openings-sans-navigation',
  format,
  body: {
    serif: 'Source Serif 4',
    sans: 'Source Sans 3',
    sizePt: 10.5,
    leading: 1.5,
    measureMm: format === 'b5' ? 112 : 125,
    rhythm: 'spaced',
    alignment: 'ragged',
    hyphenation: 'off'
  },
  roleMetrics: {
    bookTitlePt: 31,
    divisionTitlePt: 24,
    entryTitlePt: 18,
    sectionTitlePt: 11,
    minorTitlePt: 9.5,
    tocPrimaryPt: 9.5,
    tocSecondaryPt: 9,
    runningPt: 7.2,
    folioPt: 7.5
  },
  sourceHashes: Object.fromEntries(Object.entries(sources).map(([name, content]) => [name, sha256(content)])),
  fontFingerprints
}
await writeFile(resolve(workRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log(`Prepared TYP-04B ${format.toUpperCase()} serif-led hierarchy specimen with exact pinned Source fonts.`)
