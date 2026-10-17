import { spawnSync } from 'node:child_process'
import {
  existsSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { projectIdentity } from '../project/identity.js'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDirectory, '..')
const args = new Set(process.argv.slice(2))
const sourceMode = args.has('--source')
const renderedMode = args.has('--rendered')

if (sourceMode === renderedMode) {
  throw new Error('Choose exactly one nomenclature regression mode: --source or --rendered.')
}

interface CommandResult {
  status: number | null
  output: string
}

interface TextMutation {
  path: string
  mutate: (original: string) => string
}

function absolute(path: string): string {
  return resolve(repoRoot, path)
}

function run(command: string, commandArgs: string[]): CommandResult {
  const result = spawnSync(command, commandArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 64 * 1024 * 1024
  })
  return {
    status: result.status,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`
  }
}

function expectSuccess(label: string, command: string, commandArgs: string[]): void {
  const result = run(command, commandArgs)
  if (result.status !== 0) {
    throw new Error(`${label} unexpectedly failed.\n${result.output}`)
  }
  console.log(`PASS baseline: ${label}`)
}

function expectFailure(
  label: string,
  command: string,
  commandArgs: string[],
  expectedText: string
): void {
  const result = run(command, commandArgs)
  if (result.status === 0) {
    throw new Error(`${label} unexpectedly passed; regression was not caught.`)
  }
  if (!result.output.includes(expectedText)) {
    throw new Error(
      `${label} failed, but not for the expected reason “${expectedText}”.\n${result.output}`
    )
  }
  console.log(`PASS adversarial: ${label}`)
}

function withTextMutations(mutations: readonly TextMutation[], body: () => void): void {
  const originals = new Map<string, string>()
  try {
    for (const mutation of mutations) {
      const path = absolute(mutation.path)
      const original = readFileSync(path, 'utf8')
      originals.set(path, original)
      const changed = mutation.mutate(original)
      if (changed === original) {
        throw new Error(`Regression mutation did not change ${mutation.path}.`)
      }
      writeFileSync(path, changed)
    }
    body()
  } finally {
    for (const [path, original] of originals) writeFileSync(path, original)
  }
}

function appendProbe(token: string): (original: string) => string {
  return (original) => `${original.trimEnd()}\n\nNOM-09 regression probe: ${token}\n`
}

function sourceValidatorFailure(label: string, expectedFamily: string): void {
  expectFailure(
    label,
    'npx',
    ['tsx', 'scripts/validate-public-nomenclature.ts', '--source'],
    expectedFamily
  )
}

function publicationValidatorFailure(label: string, expectedText: string): void {
  expectFailure(label, 'npx', ['tsx', 'publication/scripts/validate.ts'], expectedText)
}

function runSourceRegressions(): void {
  expectSuccess(
    'clean source nomenclature',
    'npx',
    ['tsx', 'scripts/validate-public-nomenclature.ts', '--source']
  )
  expectSuccess('clean publication identity/order', 'npx', ['tsx', 'publication/scripts/validate.ts'])
  expectSuccess('clean project data plate', 'npm', ['run', 'dataplate:check', '--silent'])

  const primaryCases = [
    ['legacy HSA pattern identity', 'HSA-P-001', 'legacy.pattern-hsa'],
    ['reader-facing PAT machine identity', 'PAT-001', 'pattern.pat'],
    ['workflow compiler gate', 'RH-C5', 'reference-house.compiler-gate'],
    ['legacy project name', 'House Design Doctrine', 'legacy.house-design-doctrine'],
    ['technical-only grammar version', 'G-01 v0.1', 'grammar.g01-version'],
    ['project maturity code in primary prose', 'M4', 'maturity.level']
  ] as const

  for (const [label, token, family] of primaryCases) {
    withTextMutations([{ path: 'README.md', mutate: appendProbe(token) }], () => {
      sourceValidatorFailure(label, family)
    })
  }

  withTextMutations(
    [
      {
        path: 'docs/manuscript/figures/pattern-language-fields-sequence.svg',
        mutate: (original) => {
          if (!original.includes('</svg>')) throw new Error('Publication SVG has no closing svg tag.')
          return original.replace('</svg>', '<text x="10" y="10">HSA-P-001</text>\n</svg>')
        }
      }
    ],
    () => sourceValidatorFailure('legacy machine identity in publication SVG', 'legacy.pattern-hsa')
  )

  withTextMutations(
    [
      {
        path: 'publication/publication.ts',
        mutate: (original) => original.replace(
          "pattern('PAT-001', 'controlled-utility-entry.md', 'Controlled Utility Entry')",
          "pattern('PAT-001', 'controlled-utility-entry.md', 'PAT-001 — Controlled Utility Entry')"
        )
      }
    ],
    () => publicationValidatorFailure('machine identity constructed into reader pattern title', 'reader-facing pattern title')
  )

  withTextMutations(
    [
      {
        path: 'docs/patterns/controlled-utility-entry.md',
        mutate: (original) => original.replace('id: PAT-001', 'id: PAT-999')
      }
    ],
    () => publicationValidatorFailure('pattern manifest/frontmatter identity divergence', 'PAT-999')
  )

  withTextMutations(
    [
      {
        path: 'project/patterns.ts',
        mutate: (original) => {
          const ids = [...original.matchAll(/'PAT-\d{3}'/g)].map((match) => match[0]).sort()
          if (ids.length !== 21) throw new Error(`Expected 21 canonical pattern IDs, found ${ids.length}.`)
          const replacement = `export const patternPublicationOrder = [\n${ids.map((id) => `  ${id}`).join(',\n')}\n] as const`
          return original.replace(/export const patternPublicationOrder = \[[\s\S]*?\n\] as const/, replacement)
        }
      },
      {
        path: 'publication/publication.ts',
        mutate: (original) => {
          const lines = original.split('\n')
          const patternIndexes = lines
            .map((line, index) => line.trimStart().startsWith("pattern('PAT-") ? index : -1)
            .filter((index) => index >= 0)
          if (patternIndexes.length !== 21) {
            throw new Error(`Expected 21 publication pattern entries, found ${patternIndexes.length}.`)
          }
          const first = patternIndexes[0]
          const last = patternIndexes[patternIndexes.length - 1]
          if (first === undefined || last === undefined) throw new Error('Pattern entry bounds are absent.')
          const sorted = lines
            .slice(first, last + 1)
            .filter((line) => line.trimStart().startsWith("pattern('PAT-"))
            .sort((a, b) => {
              const aId = a.match(/PAT-\d{3}/)?.[0]
              const bId = b.match(/PAT-\d{3}/)?.[0]
              if (!aId || !bId) throw new Error('Could not read publication pattern ID.')
              return aId.localeCompare(bId)
            })
          lines.splice(first, last - first + 1, ...sorted)
          return lines.join('\n')
        }
      }
    ],
    () => {
      const scopePath = absolute('docs/development/print-publication-scope-crosswalk.md')
      const originalScope = readFileSync(scopePath, 'utf8')
      try {
        expectSuccess(
          'regenerate scope under deliberately broken pattern order',
          'npm',
          ['run', 'publication:scope:update', '--silent']
        )
        publicationValidatorFailure(
          'reader pattern order collapsed to machine-ID order',
          'collapsed to machine-ID order'
        )
      } finally {
        writeFileSync(scopePath, originalScope)
      }
    }
  )

  withTextMutations(
    [
      {
        path: 'project/dataplate.json',
        mutate: (original) => original.replace(
          '"public-architectural-position": {\n      "level": "M4"',
          '"public-architectural-position": {\n      "level": "M5"'
        )
      }
    ],
    () => expectFailure(
      'public-machine data plate drift',
      'npm',
      ['run', 'dataplate:check', '--silent'],
      'Committed project data plate is stale.'
    )
  )

  expectSuccess(
    'restored source nomenclature',
    'npx',
    ['tsx', 'scripts/validate-public-nomenclature.ts', '--source']
  )
  expectSuccess('restored publication identity/order', 'npx', ['tsx', 'publication/scripts/validate.ts'])
  expectSuccess('restored project data plate', 'npm', ['run', 'dataplate:check', '--silent'])
}

function renderedValidatorFailure(label: string, expectedText: string): void {
  expectFailure(
    label,
    'npx',
    ['tsx', 'scripts/validate-public-nomenclature.ts', '--rendered'],
    expectedText
  )
}

function withRenamedPath(path: string, body: () => void): void {
  const source = absolute(path)
  const backup = `${source}.nom09-backup`
  if (!existsSync(source)) throw new Error(`Expected rendered path is absent before mutation: ${path}`)
  rmSync(backup, { recursive: true, force: true })
  renameSync(source, backup)
  try {
    body()
  } finally {
    if (existsSync(source)) rmSync(source, { recursive: true, force: true })
    renameSync(backup, source)
  }
}

function runRenderedRegressions(): void {
  expectSuccess(
    'clean rendered nomenclature',
    'npx',
    ['tsx', 'scripts/validate-public-nomenclature.ts', '--rendered']
  )

  withTextMutations(
    [{ path: '.vitepress/dist/index.html', mutate: appendProbe('HSA-P-001') }],
    () => renderedValidatorFailure('legacy machine identity in built site HTML', 'legacy.pattern-hsa')
  )

  withRenamedPath('.vitepress/dist', () => {
    renderedValidatorFailure('missing rendered site corpus fails closed', 'found no HTML')
  })

  for (const file of [
    `publication/dist/${projectIdentity.slug}.pdf`,
    `publication/dist/${projectIdentity.slug}-primer.pdf`
  ]) {
    withRenamedPath(file, () => {
      renderedValidatorFailure(`missing required PDF ${file}`, 'Missing required rendered publication PDF')
    })
  }

  const primerPath = absolute(`publication/dist/${projectIdentity.slug}-primer.pdf`)
  const originalPrimer = readFileSync(primerPath)
  try {
    withTextMutations(
      [{ path: 'publication/primer/proposition.md', mutate: appendProbe('HSA-P-001') }],
      () => {
        expectSuccess('build deliberately contaminated Primer', 'npm', ['run', 'publication:build:primer', '--silent'])
      }
    )
    renderedValidatorFailure('prohibited token extracted from rebuilt Primer PDF', 'legacy.pattern-hsa')
  } finally {
    writeFileSync(primerPath, originalPrimer)
  }

  expectSuccess(
    'restored rendered nomenclature',
    'npx',
    ['tsx', 'scripts/validate-public-nomenclature.ts', '--rendered']
  )
}

if (sourceMode) runSourceRegressions()
else runRenderedRegressions()

console.log(`NOM-09 ${sourceMode ? 'source/publication' : 'rendered'} adversarial regression proof passed.`)
