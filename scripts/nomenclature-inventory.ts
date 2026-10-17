import { execFileSync } from 'node:child_process'
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import { dependenciesForAdapter } from '../publication/adapters.js'
import { primerPublicationEntries, publicationEntries } from '../publication/publication.js'
import { isPublicSource } from '../project/public-surface.js'

const repoRoot = process.cwd()

const TEXT_EXTENSIONS = new Set(['.md', '.ts', '.js', '.json', '.svg', '.yml', '.yaml', '.css', '.html', '.txt'])
const EXCLUDED_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', '.work'])

interface NamespaceFamily {
  id: string
  owner: string
  description: string
  pattern: RegExp
}

const families: readonly NamespaceFamily[] = [
  {
    id: 'project.ovids-house',
    owner: 'project',
    description: 'Current master project name',
    pattern: /Ovid[’']s House/g
  },
  {
    id: 'project.house-kernel',
    owner: 'architectural-system',
    description: 'Formal architectural-system name / former master name',
    pattern: /\bHouse Kernel\b/g
  },
  {
    id: 'project.metamorph-compiler',
    owner: 'compiler',
    description: 'Compiler product/subsystem name',
    pattern: /\bMetamorph Compiler\b/g
  },
  {
    id: 'legacy.house-systems-architecture',
    owner: 'provenance',
    description: 'Legacy master-project name',
    pattern: /\bHouse Systems Architecture\b/g
  },
  {
    id: 'legacy.house-design-doctrine',
    owner: 'provenance',
    description: 'Legacy doctrine/project name',
    pattern: /\bHouse Design Doctrine(?: v\d+)?\b/g
  },
  {
    id: 'legacy.long-life-house',
    owner: 'provenance',
    description: 'Legacy project name',
    pattern: /\b(?:The )?Long-Life House\b/g
  },
  {
    id: 'pattern.hsa',
    owner: 'patterns',
    description: 'Canonical pattern identifier namespace derived from House Systems Architecture',
    pattern: /\bHSA-P-\d{3}\b/g
  },
  {
    id: 'grammar.g01',
    owner: 'grammar',
    description: 'Georgian-derived grammar instance identity',
    pattern: /\bG-01\b/g
  },
  {
    id: 'grammar.g01-version',
    owner: 'grammar',
    description: 'Versioned grammar identity',
    pattern: /\bG-01 v\d+\.\d+\b/g
  },
  {
    id: 'grammar.gate',
    owner: 'grammar-workflow',
    description: 'Grammar derivation / validation gate labels',
    pattern: /\bD(?:5|6|8|9|10(?:-S)?|11|12|13)\b/g
  },
  {
    id: 'maturity.level',
    owner: 'project-maturity',
    description: 'Project-specific maturity levels',
    pattern: /\bM[1-5]\b/g
  },
  {
    id: 'reference-house.design-gate',
    owner: 'reference-house-workflow',
    description: 'Reference House design/development gates',
    pattern: /\bRH-(?:0\d|1[01])\b/g
  },
  {
    id: 'reference-house.compiler-gate',
    owner: 'reference-house-compiler-workflow',
    description: 'Reference House executable/compiler gates',
    pattern: /\bRH-C\d+\b/g
  },
  {
    id: 'reference-house.fact',
    owner: 'reference-house-machine',
    description: 'Reference House source-fact identifiers',
    pattern: /\bRHCF-[A-Z0-9-]+\b/g
  },
  {
    id: 'compiler.p0',
    owner: 'compiler-workflow',
    description: 'P0 compiler gate',
    pattern: /\bP0\b/g
  },
  {
    id: 'compiler.pattern-crosswalk',
    owner: 'compiler-workflow',
    description: 'Pattern crosswalk gate',
    pattern: /\bPAT-XW-\d+\b/g
  },
  {
    id: 'compiler.cf',
    owner: 'compiler-workflow',
    description: 'Compiler generality / contrast-fixture gates',
    pattern: /\bCF-\d+\b/g
  },
  {
    id: 'compiler.ch',
    owner: 'compiler-workflow',
    description: 'Compiler Hardening gates',
    pattern: /\bCH-\d+\b/g
  },
  {
    id: 'compiler.coa',
    owner: 'compiler-output-workflow',
    description: 'Compiler Output Architecture gates',
    pattern: /\bCOA-\d+\b/g
  },
  {
    id: 'compiler.h1',
    owner: 'compiler-workflow',
    description: 'H1 paper-compilation / technical fixture identities',
    pattern: /\bH1(?:-[A-Z0-9]+)*\b/g
  },
  {
    id: 'publication.pr',
    owner: 'publication-workflow',
    description: 'Publication credibility/release gates',
    pattern: /\bPR-\d{2}[A-Z]?(?:-[A-Z0-9]+)*\b/g
  },
  {
    id: 'publication.pub-san',
    owner: 'publication-workflow',
    description: 'Resolved-work sanitation programme identity',
    pattern: /\bPUB-SAN\b/g
  },
  {
    id: 'publication.drw',
    owner: 'publication-workflow',
    description: 'Architectural drawing programme gates',
    pattern: /\bDRW-\d+\b/g
  },
  {
    id: 'publication.pub-nom',
    owner: 'publication-workflow',
    description: 'Nomenclature programme identity',
    pattern: /\bPUB-NOM\b/g
  },
  {
    id: 'publication.nom-gate',
    owner: 'publication-workflow',
    description: 'Nomenclature programme gates',
    pattern: /\bNOM-\d+\b/g
  },
  {
    id: 'prototype.id',
    owner: 'prototype-workflow',
    description: 'Physical prototype identities',
    pattern: /\bP0[1-4]\b/g
  },
  {
    id: 'prototype.w2',
    owner: 'prototype-workflow',
    description: 'W2 wall-bay challenger identity',
    pattern: /\bW2\b/g
  },
  {
    id: 'figure.legacy-df',
    owner: 'publication-figures',
    description: 'Legacy publication figure identities',
    pattern: /\bD-F\d{2}\b/g
  },
  {
    id: 'machine.rh-compile-schema',
    owner: 'compiler-machine',
    description: 'Reference House compile schema namespace',
    pattern: /\bHK-RH-COMPILE-\d+\b/g
  },
  {
    id: 'machine.rh-output',
    owner: 'compiler-output-machine',
    description: 'Generated Reference House output/schema/artefact namespace',
    pattern: /\bOH-RH-[A-Z0-9-]+\b/g
  }
] as const

type Surface =
  | 'REPO_TOTAL'
  | 'SITE_PUBLIC_SOURCE'
  | 'PUBLICATION_SOURCE'
  | 'PUBLIC_MACHINE_SOURCE'
  | 'BOOK_FULL_RENDERED'
  | 'BOOK_PRIMER_RENDERED'
  | 'SITE_RENDERED'
  | 'INTERNAL_OR_PROVENANCE'

interface FamilyCounts {
  total: number
  files: Set<string>
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
      bySurface: new Map<Surface, number>(),
      representativePublicPaths: new Set<string>()
    }
  ])
)

const candidateTokens = new Map<string, { count: number; files: Set<string> }>()

function addSurface(record: FamilyCounts, surface: Surface, amount: number): void {
  record.bySurface.set(surface, (record.bySurface.get(surface) ?? 0) + amount)
}

function matchingCount(pattern: RegExp, text: string): number {
  const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`)
  return [...text.matchAll(regex)].length
}

function publicSource(path: string): boolean {
  if (path === 'README.md') return true
  return path.startsWith('docs/') && path.endsWith('.md') && isPublicSource(path)
}

function surfacesForRepositoryPath(path: string): Surface[] {
  const surfaces: Surface[] = ['REPO_TOTAL']
  if (publicSource(path)) surfaces.push('SITE_PUBLIC_SOURCE')
  if (publicationSources.has(path)) surfaces.push('PUBLICATION_SOURCE')
  if (publicMachineSources.has(path)) surfaces.push('PUBLIC_MACHINE_SOURCE')
  if (surfaces.length === 1) surfaces.push('INTERNAL_OR_PROVENANCE')
  return surfaces
}

function isPublicSurface(surface: Surface): boolean {
  return surface === 'SITE_PUBLIC_SOURCE' ||
    surface === 'PUBLICATION_SOURCE' ||
    surface === 'PUBLIC_MACHINE_SOURCE' ||
    surface === 'BOOK_FULL_RENDERED' ||
    surface === 'BOOK_PRIMER_RENDERED' ||
    surface === 'SITE_RENDERED'
}

function scanText(path: string, text: string, surfaces: Surface[]): void {
  for (const family of families) {
    const amount = matchingCount(family.pattern, text)
    if (!amount) continue
    const record = counts.get(family.id)!
    record.total += amount
    record.files.add(path)
    for (const surface of surfaces) addSurface(record, surface, amount)
    if (surfaces.some(isPublicSurface) && record.representativePublicPaths.size < 8) {
      record.representativePublicPaths.add(path)
    }
  }

  const generic = /\b[A-Z]{2,8}(?:-[A-Z0-9]{1,12})+\b/g
  for (const match of text.matchAll(generic)) {
    const token = match[0]
    if (families.some((family) => new RegExp(`^(?:${family.pattern.source})$`).test(token))) continue
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
console.log('| family | repo tokens | source files | site src | publication src | public machine | site rendered | full PDF | primer |')
console.log('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
for (const family of families) {
  const record = counts.get(family.id)!
  console.log(
    `| ${family.id} | ${record.total} | ${record.files.size} | ${value(family.id, 'SITE_PUBLIC_SOURCE')} | ${value(family.id, 'PUBLICATION_SOURCE')} | ${value(family.id, 'PUBLIC_MACHINE_SOURCE')} | ${value(family.id, 'SITE_RENDERED')} | ${value(family.id, 'BOOK_FULL_RENDERED')} | ${value(family.id, 'BOOK_PRIMER_RENDERED')} |`
  )
}

console.log('\nRepresentative reader/public paths:')
for (const family of families) {
  const paths = [...counts.get(family.id)!.representativePublicPaths]
  if (!paths.length) continue
  console.log(`- ${family.id}: ${paths.join(', ')}`)
}

console.log('\nUnclassified uppercase-hyphen candidate tokens (top 60 by occurrence):')
for (const [token, record] of [...candidateTokens.entries()]
  .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
  .slice(0, 60)) {
  console.log(`- ${token}: ${record.count} occurrence(s) in ${record.files.size} file(s)`)
}
console.log('=== END NOM-00 NOMENCLATURE INVENTORY ===\n')
