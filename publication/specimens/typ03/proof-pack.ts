import { randomInt } from 'node:crypto'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { fetchOpenFontCandidate } from './open-fonts.js'

type Candidate = 'baseline' | 'lyon-atlas' | 'tiempos-soehne' | 'scala' | 'source' | 'newsreader-source'
type FontEnvName =
  | 'TYP03_SERIF_REGULAR'
  | 'TYP03_SERIF_ITALIC'
  | 'TYP03_SERIF_BOLD'
  | 'TYP03_SANS_REGULAR'
  | 'TYP03_SANS_BOLD'

const specimenRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(specimenRoot, '../../..')
const workRoot = resolve(repoRoot, 'publication/.work/typ03')
const packsRoot = resolve(repoRoot, 'publication/.work/typ03-proof-packs')
const configPath = resolve(specimenRoot, 'vivliostyle.config.js')
const preparePath = resolve(specimenRoot, 'prepare.ts')
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'

const args = new Set(process.argv.slice(2))
const mode = args.has('--full') ? 'full' : args.has('--open-only') ? 'open-only' : null
if (!mode || (args.has('--full') && args.has('--open-only'))) {
  throw new Error('Usage: npx tsx publication/specimens/typ03/proof-pack.ts <--open-only|--full>')
}

const rhythm = process.env.TYP03_RHYTHM ?? 'spaced'
const alignment = process.env.TYP03_ALIGN ?? 'ragged'
if (!['spaced', 'indented'].includes(rhythm)) throw new Error(`Unsupported TYP03_RHYTHM: ${rhythm}`)
if (!['ragged', 'justified'].includes(alignment)) throw new Error(`Unsupported TYP03_ALIGN: ${alignment}`)

const generatedId = new Date().toISOString().replace(/[:.]/g, '-')
const packId = process.env.TYP03_PACK_ID?.trim() || `${mode}-${rhythm}-${alignment}-${generatedId}`
if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,95}$/.test(packId)) {
  throw new Error(`Unsafe TYP03_PACK_ID: ${packId}`)
}
const packRoot = resolve(packsRoot, packId)
const privateRoot = resolve(packRoot, 'private')
await mkdir(packsRoot, { recursive: true })
await mkdir(packRoot, { recursive: false })
await mkdir(privateRoot, { recursive: false })

const run = (command: string, commandArgs: string[], env: NodeJS.ProcessEnv): void => {
  const result = spawnSync(command, commandArgs, {
    cwd: repoRoot,
    env,
    stdio: 'inherit'
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(`${command} ${commandArgs.join(' ')} failed with exit code ${result.status}`)
  }
}

const shuffle = <T>(values: T[]): T[] => {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

const genericFontEnvNames: FontEnvName[] = [
  'TYP03_SERIF_REGULAR',
  'TYP03_SERIF_ITALIC',
  'TYP03_SERIF_BOLD',
  'TYP03_SANS_REGULAR',
  'TYP03_SANS_BOLD'
]

const proprietaryEnv = (candidate: Exclude<Candidate, 'baseline' | 'source' | 'newsreader-source'>): NodeJS.ProcessEnv => {
  const prefix = candidate.replaceAll('-', '_').toUpperCase()
  const rightsName = `TYP03_${prefix}_FONT_RIGHTS`
  const rights = process.env[rightsName]
  if (rights !== 'pdf-embed-ok') {
    throw new Error(
      `${rightsName}=pdf-embed-ok is required for --full. If the candidate licence is preview-only, use the blind preview route documented in TYP-03E and do not save a PDF.`
    )
  }

  const resolved: NodeJS.ProcessEnv = { TYP03_FONT_RIGHTS: rights }
  for (const genericName of genericFontEnvNames) {
    const suffix = genericName.replace('TYP03_', '')
    const candidateName = `TYP03_${prefix}_${suffix}`
    const value = process.env[candidateName]
    if (!value) throw new Error(`${candidateName} is required for --full`)
    resolved[genericName] = value
  }
  return resolved
}

const finalistCandidates: Exclude<Candidate, 'baseline'>[] = [
  'lyon-atlas',
  'tiempos-soehne',
  'scala',
  'source',
  'newsreader-source'
]

const mapping: Array<{ candidate: Candidate; label: string }> = mode === 'full'
  ? [
      { candidate: 'baseline', label: 'BASELINE' },
      ...shuffle(finalistCandidates).map((candidate, index) => ({
        candidate,
        label: String.fromCharCode('A'.charCodeAt(0) + index)
      }))
    ]
  : [
      { candidate: 'baseline', label: 'BASELINE' },
      { candidate: 'source', label: 'SHAKEDOWN-A' },
      { candidate: 'newsreader-source', label: 'SHAKEDOWN-B' }
    ]

const manifests: unknown[] = []

for (const { candidate, label } of mapping) {
  let candidateEnv: NodeJS.ProcessEnv = {}

  if (candidate === 'source' || candidate === 'newsreader-source') {
    candidateEnv = {
      ...(await fetchOpenFontCandidate(candidate)),
      TYP03_FONT_RIGHTS: 'pdf-embed-ok'
    }
  } else if (candidate !== 'baseline') {
    candidateEnv = proprietaryEnv(candidate)
  }

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    ...candidateEnv,
    TYP03_CANDIDATE: candidate,
    TYP03_FORMAT: 'b5',
    TYP03_RHYTHM: rhythm,
    TYP03_ALIGN: alignment,
    TYP03_BLIND_LABEL: label
  }

  run(npx, ['tsx', preparePath], env)
  run(npx, ['vivliostyle', 'build', '-c', configPath], env)

  const identity = `set-${label.toLowerCase()}`
  const pdfName = `typ03-${identity}-b5-${rhythm}-${alignment}.pdf`
  const pdfPath = resolve(workRoot, 'dist', pdfName)
  const manifest = JSON.parse(await readFile(resolve(workRoot, 'manifest.json'), 'utf8')) as unknown

  await copyFile(pdfPath, resolve(packRoot, pdfName))
  await writeFile(resolve(privateRoot, `${identity}-manifest.json`), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  manifests.push(manifest)
}

const evidence = {
  schemaVersion: 1,
  mode,
  admissibleForBlindDecision: mode === 'full',
  packId,
  format: 'b5',
  rhythm,
  alignment,
  mapping,
  manifests,
  warning: mode === 'open-only'
    ? 'SHAKEDOWN ONLY. This pack omits proprietary finalists and must not be used to choose the TYP-03 winner.'
    : 'Keep this mapping record out of sight until anonymous reading notes are frozen.'
}

await writeFile(resolve(privateRoot, 'PRIVATE-MAPPING.json'), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8')
await writeFile(
  resolve(packRoot, 'PRINT-ME.txt'),
  mode === 'full'
    ? `TYP-03 full blind B5 pack\nPrint BASELINE and Sets A-E at 100% / actual size on the same printer, settings and paper batch.\nDo not inspect private/ until reading notes are frozen.\n`
    : `TYP-03 open-font shakedown pack\nPrint at 100% / actual size only to test machinery, scale and the two open systems.\nThis is not admissible final TYP-03 comparison evidence because three finalists are absent.\n`,
  'utf8'
)

console.log(`Built TYP-03 ${mode} proof pack: ${packRoot}`)
