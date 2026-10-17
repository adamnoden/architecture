import { execFileSync } from 'node:child_process'
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import { dependenciesForAdapter } from '../publication/adapters.js'
import { primerPublicationEntries, publicationEntries } from '../publication/publication.js'
import { nomenclatureFamilies, nomenclaturePattern } from '../project/nomenclature.js'
import { isPublicSource } from '../project/public-surface.js'

const repoRoot = process.cwd()
const filesArgument = process.argv.find((argument) => argument.startsWith('--files='))
const filesFamilyId = filesArgument?.slice('--files='.length)

const TEXT_EXTENSIONS = new Set(['.md', '.ts', '.js', '.json', '.svg', '.yml', '.yaml', '.css', '.html', '.txt'])
const EXCLUDED_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', '.work'])

const families = nomenclatureFamilies.map((family) => ({
  ...family,
  pattern: nomenclaturePattern(family)
}))

if (filesFamilyId && !families.some((family) => family.id === filesFamilyId)) {
  throw new Error(`Unknown nomenclature family requested by --files: ${filesFamilyId}`)
}

type Surface =
  | 'REPO_TOTAL'
  | 'SITE_PUBLIC_SOURCE'
  | 'PUBLICATION_SOURCE'
  | 'PUBLIC_MEDIA_SOURCE'
  | 'PUBLIC_MACHINE_SOURCE'
  | 'BOOK_FULL_RENDERED'
  | 'BOOK_PRIMER_RENDERED'
  | 'SITE_RENDERED'
  | 'INTERNAL_OR_PROVENANCE'

interface FamilyCounts {
  total: number
  files: Set<string>
  repoFiles: Set<string>
  examples: Set<string>
  bySurface: Map<Surface, number>
  representativePublicPaths: Set<string>
}

const publicationSources = new Set<string>()
for (const entry of [...publicationEntries, ...primerPublicationEntries]) {
  publicationSources.add(entry.source)
  for (const dependency of dependenciesForAdapter(entry.adapter)) publicationSources.add(dependency)
}

const publicMachineSources = new Set([
  'project/dataplate.json',
  'docs/reference-house/generated/output-manifest.json',
  'docs/reference-house/generated/service-register.md',
  'docs/reference-house/generated/boundary-register.md'
])

const counts = new Map<string, FamilyCounts>(
  families.map((family) => [
    family.id,
    {
      total: 0,
      files: new Set<string>(),
      repoFiles: new Set<string>(),
      examples: new Set<string>(),
      bySurface: new Map<Surface, number>(),
      representativePublicPaths: new Set<string>()
    }
  ])
)

const candidateTokens = new Map<string, { count: number; files: Set<string> }>()

function addSurface(record: FamilyCounts, surface: Surface, amount: number): void {
  record.bySurface.set(surface, (record.bySurface.get(surface) ?? 0) + amount)
}

function matches(pattern: RegExp, text: string): RegExpMatchArray[] {
  const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`)
  return [...text.matchAll(regex)]
}

function publicSource(path: string): boolean {
  if (path === 'README.md') return true
  return path.startsWith('docs/') && path.endsWith('.md') && isPublicSource(path)
}

function publicMediaSource(path: string): boolean {
  return (
    (path.startsWith('docs/manuscript/figures/') || path.startsWith('docs/reference-house/generated/')) &&
    path.endsWith('.svg')
  )
}

function surfacesForRepositoryPath(path: string): Surface[] {
  const surfaces: Surface[] = ['REPO_TOTAL']
  if (publicSource(path)) surfaces.push('SITE_PUBLIC_SOURCE')
  if (publicationSources.has(path)) surfaces.push('PUBLICATION_SOURCE')
  if (publicMediaSource(path)) surfaces.push('PUBLIC_MEDIA_SOURCE')
  if (publicMachineSources.has(path)) surfaces.push('PUBLIC_MACHINE_SOURCE')
  if (surfaces.length === 1) surfaces.push('INTERNAL_OR_PROVENANCE')
  return surfaces
}

function isPublicSurface(surface: Surface): boolean {
  return surface === 'SITE_PUBLIC_SOURCE' ||
    surface === 'PUBLICATION_SOURCE' ||
    surface === 'PUBLIC_MEDIA_SOURCE' ||
    surface === 'PUBLIC_MACHINE_SOURCE' ||
    surface === 'BOOK_FULL_RENDERED' ||
    surface === 'BOOK_PRIMER_RENDERED' ||
    surface === 'SITE_RENDERED'
}

function tokenIsKnown(token: string): boolean {
  return families.some((family) => matches(family.pattern, token).some((match) => match[0] === token))
}

function scanText(path: string, text: string, surfaces: Surface[]): void {
  for (const family of families) {
    const familyMatches = matches(family.pattern, text)
    if (!familyMatches.length) continue

    const record = counts.get(family.id)!
    record.total += familyMatches.length
    record.files.add(path)
    if (surfaces.includes('REPO_TOTAL')) record.repoFiles.add(path)

    for (const match of familyMatches) {
      if (record.examples.size < 8) record.examples.add(match[0])
    }

    for (const surface of surfaces) addSurface(record, surface, familyMatches.length)

    if (surfaces.some(isPublicSurface) && record.representativePublicPaths.size < 8) {
      record.representativePublicPaths.add(path)
    }
  }

  const genericHyphen = /\b[A-Z]{2,8}(?:-[A-Z0-9]{1,12})+\b/g
  const genericUnderscore = /__[A-Z][A-Z0-9_]+__/g
  for (const match of [...text.matchAll(genericHyphen), ...text.matchAll(genericUnderscore)]) {
    const token = match[0]
    if (tokenIsKnown(token)) continue
    const current = candidateTokens.get(token) ?? { count: 0, files: new Set<string>() }
    current.count += 1
    current.files.add(path)
    candidateTokens.set(token, current)
  }
}

function collectFiles(root: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory() && EXCLUDED_DIRECTORIES.has(entry.name)) continue
    const absolute = join(root, entry.name)
    if (entry.isDirectory()) files.push(...collectFiles(absolute))
    else if (entry.isFile() && TEXT_EXTENSIONS.has(extname(entry.name))) files.push(absolute)
  }
  return files
}

function repoPath(absolute: string): string {
  return relative(repoRoot, absolute).split(sep).join('/')
}

for (const absolute of collectFiles(repoRoot)) {
  const path = repoPath(absolute)
  scanText(path, readFileSync(absolute, 'utf8'), surfacesForRepositoryPath(path))
}

function scanPdf(path: string, surface: Surface): void {
  const absolute = resolve(repoRoot, path)
  if (!existsSync(absolute) || !lstatSync(absolute).isFile()) return

  try {
    const text = execFileSync('pdftotext', [absolute, '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    scanText(path, text, [surface])
  } catch (error) {
    console.warn(`Could not scan ${path}: ${String(error)}`)
  }
}

scanPdf('publication/dist/ovids-house.pdf', 'BOOK_FULL_RENDERED')
scanPdf('publication/dist/ovids-house-primer.pdf', 'BOOK_PRIMER_RENDERED')

const siteDist = resolve(repoRoot, '.vitepress/dist')
if (existsSync(siteDist)) {
  for (const absolute of collectFiles(siteDist)) {
    if (extname(absolute) !== '.html') continue
    scanText(`rendered-site:${repoPath(absolute)}`, readFileSync(absolute, 'utf8'), ['SITE_RENDERED'])
  }
}

function value(id: string, surface: Surface): number {
  return counts.get(id)?.bySurface.get(surface) ?? 0
}

function revision(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim()
  } catch {
    return 'unknown'
  }
}

console.log('\n=== NOM-00 NOMENCLATURE INVENTORY ===')
console.log(`revision: ${revision()}`)
console.log(`conceptual namespace families: ${families.length}`)
console.log('| family | examples | repo tokens | repo files | site src | publication src | public media | public machine | site rendered | full PDF | primer |')
console.log('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
for (const family of families) {
  const record = counts.get(family.id)!
  console.log(
    `| ${family.id} | ${[...record.examples].join(', ')} | ${value(family.id, 'REPO_TOTAL')} | ${record.repoFiles.size} | ${value(family.id, 'SITE_PUBLIC_SOURCE')} | ${value(family.id, 'PUBLICATION_SOURCE')} | ${value(family.id, 'PUBLIC_MEDIA_SOURCE')} | ${value(family.id, 'PUBLIC_MACHINE_SOURCE')} | ${value(family.id, 'SITE_RENDERED')} | ${value(family.id, 'BOOK_FULL_RENDERED')} | ${value(family.id, 'BOOK_PRIMER_RENDERED')} |`
  )
}

console.log('\nRepresentative reader/public paths:')
for (const family of families) {
  const paths = [...counts.get(family.id)!.representativePublicPaths]
  if (!paths.length) continue
  console.log(`- ${family.id}: ${paths.join(', ')}`)
}

if (filesFamilyId) {
  console.log(`\nRepository files containing ${filesFamilyId}:`)
  for (const path of [...counts.get(filesFamilyId)!.repoFiles].sort()) console.log(`- ${path}`)
}

console.log('\nUnclassified compact-token candidates (top 80 by occurrence):')
for (const [token, record] of [...candidateTokens.entries()]
  .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
  .slice(0, 80)) {
  console.log(`- ${token}: ${record.count} occurrence(s) in ${record.files.size} file(s)`)
}
console.log('=== END NOM-00 NOMENCLATURE INVENTORY ===\n')
