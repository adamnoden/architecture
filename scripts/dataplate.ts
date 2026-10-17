import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { publicationEntries, primerPublicationEntries } from '../publication/publication.js'
import { projectAuthority } from '../project/authority.js'
import { projectIdentity } from '../project/identity.js'
import { workstreamStatuses } from '../project/maturity.js'
import { isPublicSource } from '../project/public-surface.js'
import { routeForSource } from '../project/site-routes.js'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDirectory, '..')
const canonicalPath = resolve(repoRoot, 'project/dataplate.json')

const args = process.argv.slice(2)
const writeMode = args.includes('--write')
const checkMode = args.includes('--check')
const stampIndex = args.indexOf('--stamp')
const stampMode = stampIndex >= 0
if ([writeMode, checkMode, stampMode].filter(Boolean).length !== 1) {
  throw new Error('Choose exactly one data plate mode: --write, --check or --stamp <output>.')
}
const stampOutput = stampMode ? args[stampIndex + 1] : undefined
if (stampMode && !stampOutput) throw new Error('--stamp requires an output path.')

interface PublicationMetadata {
  readonly schemaVersion: number
  readonly workingEdition: {
    readonly file: string
    readonly pages: number
    readonly duplexLeaves: number
    readonly pageSize: {
      readonly format: string | null
      readonly widthMm: number
      readonly heightMm: number
      readonly orientation: string
    }
    readonly entries: number
    readonly figures?: number
  }
  readonly primer: {
    readonly file: string
    readonly pages: number
    readonly duplexLeaves: number
    readonly pageSize: {
      readonly format: string | null
      readonly widthMm: number
      readonly heightMm: number
      readonly orientation: string
    }
    readonly entries: number
    readonly figures?: number
  }
}

interface ReferenceHouseOutputManifest {
  readonly schemaVersion: string
  readonly sourceCompile: {
    readonly schemaVersion: string
    readonly fingerprint: string
  }
  readonly status: string
  readonly artefacts: readonly {
    readonly artefactId: string
    readonly path: string
    readonly format: string
    readonly rendererVersion: string
    readonly sourceCompileFingerprint: string
    readonly content: {
      readonly algorithm: string
      readonly fingerprint: string
    }
  }[]
}

interface PackageLock {
  readonly lockfileVersion: number
  readonly packages: Readonly<Record<string, { readonly version?: string }>>
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8')) as T
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function gitOutput(args: string[]): string {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).trim()
}

function sourcePath(path: string): string {
  return relative(repoRoot, path).split(sep).join('/')
}

function collectMarkdown(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...collectMarkdown(path))
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(path)
  }
  return files
}

function excludedFromNavigation(path: string): boolean {
  return readFileSync(path, 'utf8').includes('<!-- nav-exclude: redirect -->')
}

function publicRouteCount(): number {
  const files = [resolve(repoRoot, 'README.md'), ...collectMarkdown(resolve(repoRoot, 'docs'))]
  const routes = files
    .filter((file) => isPublicSource(sourcePath(file)))
    .filter((file) => !excludedFromNavigation(file))
    .map((file) => routeForSource(sourcePath(file)))
  return new Set(routes).size
}

function resolvedPackageVersion(lock: PackageLock, packageName: string): string {
  const version = lock.packages[`node_modules/${packageName}`]?.version
  if (!version) throw new Error(`Could not resolve locked package version: ${packageName}`)
  return version
}

function artefactSetFingerprint(manifest: ReferenceHouseOutputManifest): string {
  const index = manifest.artefacts.map((artefact) => ({
    id: artefact.artefactId,
    path: artefact.path,
    format: artefact.format,
    rendererVersion: artefact.rendererVersion,
    sourceCompileFingerprint: artefact.sourceCompileFingerprint,
    contentAlgorithm: artefact.content.algorithm,
    contentFingerprint: artefact.content.fingerprint
  }))
  return sha256(JSON.stringify(index))
}

function generateCanonicalPlate() {
  const publication = readJson<PublicationMetadata>('publication/metadata.json')
  const outputManifest = readJson<ReferenceHouseOutputManifest>(
    'docs/reference-house/generated/output-manifest.json'
  )
  const lock = readJson<PackageLock>('package-lock.json')
  const nodeMajor = readFileSync(resolve(repoRoot, '.nvmrc'), 'utf8').trim()

  const maturity = Object.fromEntries(
    workstreamStatuses.map((status) => [
      status.id,
      {
        level: status.maturity,
        reviewedOn: status.reviewedOn
      }
    ])
  )

  return {
    schemaVersion: 1,
    identity: {
      project: projectIdentity.name,
      slug: projectIdentity.slug,
      architecturalSystem: projectIdentity.formalSystemName,
      compiler: projectIdentity.compilerName,
      repository: 'adamnoden/architecture'
    },
    authority: projectAuthority,
    maturity,
    corpus: {
      activePatterns: publicationEntries.filter((entry) => entry.kind === 'pattern').length,
      strategies: publicationEntries.filter((entry) => entry.kind === 'strategy').length,
      heldCandidates: publicationEntries.filter((entry) => entry.kind === 'candidate').length,
      publicRoutes: publicRouteCount(),
      workingEditionEntries: publicationEntries.length,
      primerEntries: primerPublicationEntries.length
    },
    publication,
    referenceHouseOutputs: {
      schemaVersion: outputManifest.schemaVersion,
      status: outputManifest.status,
      sourceCompile: outputManifest.sourceCompile,
      generatedArtefacts: outputManifest.artefacts.length,
      rendererVersions: [...new Set(outputManifest.artefacts.map((artefact) => artefact.rendererVersion))],
      artefactSetFingerprint: {
        algorithm: 'sha256',
        fingerprint: artefactSetFingerprint(outputManifest)
      }
    },
    toolchain: {
      nodeMajor,
      typescript: resolvedPackageVersion(lock, 'typescript'),
      vitepress: resolvedPackageVersion(lock, 'vitepress'),
      vivliostyle: resolvedPackageVersion(lock, '@vivliostyle/cli'),
      mermaid: resolvedPackageVersion(lock, 'mermaid'),
      npmLockfileVersion: lock.lockfileVersion
    }
  } as const
}

type CanonicalPlate = ReturnType<typeof generateCanonicalPlate>

function serialized(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

function assertCanonicalCurrent(canonical: CanonicalPlate): void {
  if (!existsSync(canonicalPath)) {
    throw new Error('project/dataplate.json is missing. Run `npm run dataplate:update`.')
  }
  const committed = readFileSync(canonicalPath, 'utf8')
  const actual = serialized(canonical)
  if (committed !== actual) {
    console.error('Committed project data plate is stale.')
    console.error('\nExpected committed data plate:\n')
    console.error(actual)
    throw new Error('Run `npm run dataplate:update` and commit project/dataplate.json.')
  }
}

function buildProvenance(canonical: CanonicalPlate) {
  const commit = gitOutput(['rev-parse', 'HEAD'])
  return {
    commit,
    shortCommit: commit.slice(0, 7),
    tree: gitOutput(['show', '-s', '--format=%T', 'HEAD']),
    commitDate: gitOutput(['show', '-s', '--format=%cs', 'HEAD']),
    canonicalPlate: {
      algorithm: 'sha256',
      fingerprint: sha256(serialized(canonical))
    }
  } as const
}

function stampedPlate(canonical: CanonicalPlate) {
  return {
    ...canonical,
    build: buildProvenance(canonical)
  }
}

function summary(canonical: CanonicalPlate): string {
  const build = buildProvenance(canonical)
  const maturityRows = Object.entries(canonical.maturity).map(
    ([id, state]) => `| ${id} | ${state.level} | ${state.reviewedOn} |`
  )
  const lines = [
    '## Ovid’s House data plate',
    '',
    `Revision \`${build.shortCommit}\` · canonical plate \`${build.canonicalPlate.fingerprint.slice(0, 12)}…\``,
    '',
    '| Field | Value |',
    '| --- | --- |',
    `| Working Edition | ${canonical.publication.workingEdition.pages} pages · ${canonical.publication.workingEdition.pageSize.format ?? 'custom trim'} · ${canonical.publication.workingEdition.entries} entries · ${canonical.publication.workingEdition.figures ?? 0} figures |`,
    `| Primer | ${canonical.publication.primer.pages} pages · ${canonical.publication.primer.pageSize.format ?? 'custom trim'} · ${canonical.publication.primer.entries} entries |`,
    `| Pattern corpus | ${canonical.corpus.activePatterns} active · ${canonical.corpus.strategies} strategies · ${canonical.corpus.heldCandidates} held candidates |`,
    `| Public surface | ${canonical.corpus.publicRoutes} routes |`,
    `| Reference House outputs | ${canonical.referenceHouseOutputs.status} · ${canonical.referenceHouseOutputs.generatedArtefacts} artefacts · compile \`${canonical.referenceHouseOutputs.sourceCompile.fingerprint.slice(0, 12)}…\` |`,
    `| Claim ceiling | Reference House ${canonical.authority.referenceHouseScope}; compiler ${canonical.authority.compilerScope}; physical validation ${canonical.authority.physicalValidation}; external review ${canonical.authority.competentExternalReview} |`,
    '',
    '### Maturity',
    '',
    '| Workstream | Level | Reviewed |',
    '| --- | --- | --- |',
    ...maturityRows,
    ''
  ]
  return lines.join('\n')
}

function writeCiSummary(canonical: CanonicalPlate): void {
  const path = process.env.GITHUB_STEP_SUMMARY
  if (!path) return
  writeFileSync(path, summary(canonical), { flag: 'a' })
}

const canonical = generateCanonicalPlate()

if (writeMode) {
  writeFileSync(canonicalPath, serialized(canonical))
  console.log('Wrote canonical project data plate to project/dataplate.json.')
  console.log(summary(canonical))
} else if (checkMode) {
  assertCanonicalCurrent(canonical)
  writeCiSummary(canonical)
  console.log('Project data plate is current.')
  console.log(summary(canonical))
} else {
  assertCanonicalCurrent(canonical)
  const outputPath = resolve(repoRoot, stampOutput as string)
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, serialized(stampedPlate(canonical)))
  writeCiSummary(canonical)
  console.log(`Stamped project data plate at ${relative(repoRoot, outputPath)}.`)
}
