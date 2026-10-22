import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(root, '../../..')
const workRoot = resolve(repoRoot, 'publication/.work/typ03')
const fontsRoot = resolve(workRoot, 'fonts')
const sourceRoot = resolve(workRoot, 'source')
const sourcePath = resolve(repoRoot, 'docs/manuscript/part-i.md')

const candidates = new Set(['baseline', 'lyon-atlas', 'tiempos-soehne', 'scala', 'source'])
const formats = new Set(['a4', 'b5'])
const rhythms = new Set(['spaced', 'indented'])
const alignments = new Set(['ragged', 'justified'])
const fontRightsModes = new Set(['preview-only', 'pdf-embed-ok'])

const candidate = process.env.TYP03_CANDIDATE ?? 'baseline'
const format = process.env.TYP03_FORMAT ?? 'a4'
const rhythm = process.env.TYP03_RHYTHM ?? 'spaced'
const alignment = process.env.TYP03_ALIGN ?? 'ragged'
const fontRights = candidate === 'baseline' ? 'system-baseline' : process.env.TYP03_FONT_RIGHTS

if (!candidates.has(candidate)) throw new Error(`Unsupported TYP03_CANDIDATE: ${candidate}`)
if (!formats.has(format)) throw new Error(`Unsupported TYP03_FORMAT: ${format}`)
if (!rhythms.has(rhythm)) throw new Error(`Unsupported TYP03_RHYTHM: ${rhythm}`)
if (!alignments.has(alignment)) throw new Error(`Unsupported TYP03_ALIGN: ${alignment}`)
if (candidate !== 'baseline' && !fontRightsModes.has(fontRights ?? '')) {
  throw new Error(
    `TYP03_FONT_RIGHTS must be preview-only or pdf-embed-ok for TYP03_CANDIDATE=${candidate}`
  )
}

const sha256 = (content: string | Buffer): string => createHash('sha256').update(content).digest('hex')

function extractSection(markdown: string, heading: string, stopAtAnyHeading = false): string {
  const marker = `${heading}\n`
  const start = markdown.indexOf(marker)
  if (start < 0) throw new Error(`Missing TYP-03 source anchor: ${heading}`)

  const level = heading.match(/^#+/)?.[0].length
  if (!level) throw new Error(`Invalid Markdown heading anchor: ${heading}`)

  const after = start + marker.length
  const remainder = markdown.slice(after)
  const nextHeadingPattern = stopAtAnyHeading ? /^#{1,6}\s+/m : new RegExp(`^#{1,${level}}\\s+`, 'm')
  const nextHeading = nextHeadingPattern.exec(remainder)
  const end = nextHeading ? after + nextHeading.index : markdown.length
  return markdown.slice(start, end).trim()
}

const canonical = await readFile(sourcePath, 'utf8')
const sections = [
  extractSection(canonical, '# 1. The house after completion', true),
  extractSection(canonical, '## Permanence without stasis'),
  extractSection(canonical, '## Repose as a domestic requirement')
]

await rm(workRoot, { recursive: true, force: true })
await mkdir(fontsRoot, { recursive: true })
await mkdir(sourceRoot, { recursive: true })

const fontSlots = [
  ['TYP03_SERIF_REGULAR', 'serif-regular', 'normal', 400],
  ['TYP03_SERIF_ITALIC', 'serif-italic', 'italic', 400],
  ['TYP03_SERIF_BOLD', 'serif-bold', 'normal', 700],
  ['TYP03_SANS_REGULAR', 'sans-regular', 'normal', 400],
  ['TYP03_SANS_BOLD', 'sans-bold', 'normal', 700]
] as const

const fontFingerprints: Record<string, { sourceName: string; sha256: string }> = {}
let fontCss = ''

if (candidate === 'baseline') {
  fontCss = `:root {\n  --typ03-serif: Georgia, Cambria, "Times New Roman", Times, serif;\n  --typ03-sans: Arial, Helvetica, sans-serif;\n}\n`
} else {
  const declarations: string[] = []
  for (const [envName, stem, style, weight] of fontSlots) {
    const supplied = process.env[envName]
    if (!supplied) throw new Error(`${envName} is required for TYP03_CANDIDATE=${candidate}`)

    const absolute = resolve(supplied)
    const bytes = await readFile(absolute)
    const extension = extname(absolute).toLowerCase()
    if (!['.otf', '.ttf', '.woff2'].includes(extension)) {
      throw new Error(`${envName} must point to an OTF, TTF or WOFF2 file; got ${extension || '(no extension)'}`)
    }

    const localName = `${stem}${extension}`
    await copyFile(absolute, resolve(fontsRoot, localName))
    fontFingerprints[envName] = { sourceName: basename(absolute), sha256: sha256(bytes) }

    const family = stem.startsWith('serif') ? 'TYP03 Serif' : 'TYP03 Sans'
    declarations.push(`@font-face {\n  font-family: "${family}";\n  src: url("fonts/${localName}");\n  font-style: ${style};\n  font-weight: ${weight};\n  font-display: block;\n}`)
  }
  fontCss = `${declarations.join('\n\n')}\n\n:root {\n  --typ03-serif: "TYP03 Serif", serif;\n  --typ03-sans: "TYP03 Sans", sans-serif;\n}\n`
}

const rhythmCss = rhythm === 'spaced'
  ? `p + p { margin-top: 0.75em; }`
  : `p + p { text-indent: 1.35em; }\nh1 + p, h2 + p, blockquote + p, .typ03-meta + p { text-indent: 0; }`
const alignmentCss = alignment === 'justified'
  ? `body { text-align: justify; hyphens: auto; }`
  : `body { text-align: left; hyphens: none; }`

fontCss += `\n:root {\n  --typ03-candidate: "${candidate}";\n}\n\n${rhythmCss}\n${alignmentCss}\n`
await writeFile(resolve(workRoot, 'candidate.css'), fontCss, 'utf8')

const specimen = `# TYP-03 body-text specimen\n\n<p class="typ03-meta">Candidate: ${candidate} · ${format.toUpperCase()} · ${rhythm} · ${alignment}</p>\n\n${sections.join('\n\n<div class="typ03-section-break"></div>\n\n')}\n`
await writeFile(resolve(sourceRoot, 'specimen.md'), specimen, 'utf8')

const manifest = {
  schemaVersion: 1,
  candidate,
  format,
  rhythm,
  alignment,
  fontRights,
  source: 'docs/manuscript/part-i.md',
  sourceSha256: sha256(canonical),
  anchors: [
    '# 1. The house after completion',
    '## Permanence without stasis',
    '## Repose as a domestic requirement'
  ],
  fontFingerprints
}
await writeFile(resolve(workRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log(`Prepared TYP-03 ${candidate} ${format}/${rhythm}/${alignment} specimen (${fontRights}).`)