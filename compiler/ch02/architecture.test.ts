import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, posix } from 'node:path'
import { describe, test } from 'node:test'

const compilerRoot = 'compiler'

const permanentLayers = [
  'core',
  'plan-slice',
  'structure-slice',
  'service-slice',
  'boundary-slice',
  'calculation-slice'
] as const

type PermanentLayer = (typeof permanentLayers)[number]

type DependencyName = PermanentLayer | 'units'

const allowedDependencies: Record<PermanentLayer, ReadonlySet<DependencyName>> = {
  core: new Set(),
  'plan-slice': new Set(['core', 'units']),
  'structure-slice': new Set(['core', 'plan-slice', 'units']),
  'service-slice': new Set(['plan-slice', 'structure-slice']),
  'boundary-slice': new Set(['plan-slice', 'service-slice']),
  'calculation-slice': new Set()
}

const sourceFiles = (layer: PermanentLayer): string[] =>
  readdirSync(join(compilerRoot, layer), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
    .map((entry) => posix.join(compilerRoot, layer, entry.name))
    .sort()

const importSpecifiers = (source: string): string[] => {
  const results: string[] = []
  const pattern = /(?:from\s+|import\s+)['"]([^'"]+)['"]/g
  for (const match of source.matchAll(pattern)) results.push(match[1])
  return results
}

const targetOf = (file: string, specifier: string): string =>
  posix.normalize(posix.join(dirname(file).replaceAll('\\', '/'), specifier.replace(/\.js$/, '.ts')))

const dependencyName = (target: string): DependencyName | 'self' | 'other' => {
  if (target === 'compiler/units.ts') return 'units'
  for (const layer of permanentLayers) {
    if (target.startsWith(`compiler/${layer}/`)) return layer
  }
  return 'other'
}

describe('CH-02 permanent runtime architecture', () => {
  test('generic domains obey the permanent dependency DAG', () => {
    for (const layer of permanentLayers) {
      for (const file of sourceFiles(layer)) {
        const source = readFileSync(file, 'utf8')
        for (const specifier of importSpecifiers(source)) {
          if (!specifier.startsWith('.')) continue
          const target = targetOf(file, specifier)
          const dependency = dependencyName(target)
          const ownPrefix = `compiler/${layer}/`
          if (target.startsWith(ownPrefix)) continue

          assert.notEqual(
            dependency,
            'other',
            `${file} imports non-permanent compiler module ${target}`
          )
          assert.ok(
            allowedDependencies[layer].has(dependency as DependencyName),
            `${file} imports ${target}, outside the allowed ${layer} dependency boundary`
          )
        }
      }
    }
  })

  test('generic runtime contains no Reference House fixture knowledge', () => {
    const fixtureKnowledge = /(?:RH-C\d|REFERENCE-HOUSE|Reference House|createReferenceHouse)/
    for (const layer of permanentLayers) {
      for (const file of sourceFiles(layer)) {
        const source = readFileSync(file, 'utf8')
        assert.doesNotMatch(source, fixtureKnowledge, `${file} contains Reference House fixture knowledge`)
      }
    }
  })

  test('shared geometry is owned by core rather than the historical P0 gate', () => {
    const p0Geometry = readFileSync('compiler/p0/geometry.ts', 'utf8')
    assert.match(p0Geometry, /from '\.\.\/core\/geometry\.js'/)

    for (const layer of ['plan-slice', 'structure-slice'] as const) {
      for (const file of sourceFiles(layer)) {
        assert.doesNotMatch(
          readFileSync(file, 'utf8'),
          /\.\.\/p0\//,
          `${file} still treats P0 as a permanent runtime dependency`
        )
      }
    }
  })
})
