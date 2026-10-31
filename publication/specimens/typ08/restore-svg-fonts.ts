import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'

import { fetchOpenFontCandidate } from '../typ03/open-fonts.js'

const repoRoot = resolve(import.meta.dirname, '../../..')
const sourceRoot = resolve(repoRoot, 'publication/.work/source')
const proofRoot = resolve(repoRoot, 'publication/.proof/typ08a')
const manifestPath = resolve(proofRoot, 'manifest.json')
const correctionsPath = resolve(proofRoot, 'corrections.json')

const sha256 = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex')

function fontTransport(path: string): { mime: string; format: string } {
  const extension = extname(path).toLowerCase()
  if (extension === '.woff2') return { mime: 'font/woff2', format: 'woff2' }
  if (extension === '.otf') return { mime: 'font/otf', format: 'opentype' }
  if (extension === '.ttf') return { mime: 'font/ttf', format: 'truetype' }
  throw new Error(`TYP-08C unsupported font extension: ${extension || '(none)'}`)
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as any
const corrections = JSON.parse(await readFile(correctionsPath, 'utf8')) as any
const fontEnv = await fetchOpenFontCandidate('source')

const sansSlots = [
  ['TYP03_SANS_REGULAR', 'normal', 400],
  ['TYP03_SANS_BOLD', 'normal', 700]
] as const

const exactRules: string[] = []
const resourceEvidence: Record<string, { sourceName: string; sha256: string }> = {}
for (const [envName, style, weight] of sansSlots) {
  const source = fontEnv[envName]
  const bytes = await readFile(source)
  const transport = fontTransport(source)
  const dataUri = `data:${transport.mime};base64,${bytes.toString('base64')}`
  exactRules.push(`@font-face{font-family:"TYP08 Source Sans";src:url("${dataUri}") format("${transport.format}");font-style:${style};font-weight:${weight};font-display:block}`)
  resourceEvidence[envName] = {
    sourceName: source.split('/').at(-1) ?? source,
    sha256: sha256(bytes)
  }
}

const sharedRulePattern = /@font-face\{font-family:"TYP08 Source Sans";src:url\("[^"]*SourceSans3-(?:Regular|Bold)\.ttf"\) format\("truetype"\);font-style:normal;font-weight:(?:400|700);font-display:block\}/g
let correctedSvgCount = 0
let removedSharedRules = 0

for (const sourcePath of Object.keys(manifest.svgEvidence ?? {}).sort()) {
  const preparedPath = resolve(sourceRoot, sourcePath)
  const before = await readFile(preparedPath, 'utf8')
  const sharedRules = before.match(sharedRulePattern) ?? []
  if (sharedRules.length !== 2) {
    throw new Error(`TYP-08C ${sourcePath} expected two shared-file Source Sans faces; found ${sharedRules.length}.`)
  }

  const withoutShared = before.replace(sharedRulePattern, '')
  const styleOpen = withoutShared.match(/<style(?:\s[^>]*)?>/)?.[0]
  if (!styleOpen) throw new Error(`TYP-08C ${sourcePath} lost its SVG style boundary.`)
  const transformed = withoutShared.replace(styleOpen, `${styleOpen}${exactRules.join('')}`)

  if (!transformed.includes('data:font/')) {
    throw new Error(`TYP-08C ${sourcePath} did not restore embedded exact Source Sans transport.`)
  }
  if (!transformed.includes('font-family:"TYP08 Source Sans"')) {
    throw new Error(`TYP-08C ${sourcePath} lost the exact Source Sans family binding.`)
  }

  await writeFile(preparedPath, transformed, 'utf8')
  correctedSvgCount += 1
  removedSharedRules += sharedRules.length
  manifest.svgEvidence[sourcePath] = {
    ...manifest.svgEvidence[sourcePath],
    transformedSha256: sha256(transformed),
    fontTransport: 'embedded-data-uri'
  }
}

if (correctedSvgCount !== 22 || removedSharedRules !== 44) {
  throw new Error(`TYP-08C SVG transport restore drift: ${correctedSvgCount} SVGs / ${removedSharedRules} shared rules removed.`)
}

if (manifest.generatedTransforms) delete manifest.generatedTransforms.sharedSvgFontResources
manifest.svgFontTransport = {
  strategy: 'embedded-data-uri',
  correctedSvgCount,
  resourceEvidence,
  note: 'Restored the TYP-08A exact-font transport after proving the shared-relative-file experiment caused system-font fallback. D05 is verified at the finished-PDF destination/post-processing layer.'
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

corrections.defects.D05 = {
  status: 'corrected',
  diagnosis: 'Vivliostyle overlong named PDF destinations, not SVG font data URIs',
  svgFontTransport: 'embedded-data-uri',
  correctedSvgCount,
  pdfPostprocessor: 'Vivliostyle CLI 11.4.0 candidate',
  acceptance: 'exact five Source faces plus zero Poppler parser stderr'
}
await writeFile(correctionsPath, `${JSON.stringify(corrections, null, 2)}\n`, 'utf8')

console.log(`Restored exact embedded Source Sans transport in ${correctedSvgCount} generated SVG copies; D05 now belongs to PDF destination post-processing.`)
