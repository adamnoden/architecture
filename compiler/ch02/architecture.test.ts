import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, posix } from 'node:path'
import { describe, test } from 'node:test'
import ts from 'typescript'

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
  'service-slice': new Set(['plan-slice', 'structure-slice', 'units']),
  'boundary-slice': new Set(['plan-slice', 'service-slice']),
  'calculation-slice': new Set()
}

const typescriptFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = posix.join(directory, entry.name)
    if (entry.isDirectory()) return typescriptFiles(path)
    return entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') ? [path] : []
  }).sort()

const sourceFiles = (layer: string): string[] => typescriptFiles(posix.join(compilerRoot, layer))

const runtimeFiles = (layer: PermanentLayer): string[] =>
  sourceFiles(layer).filter((file) => !file.endsWith('/drawing.ts'))

const importSpecifiers = (source: string): string[] => {
  const results: string[] = []
  const tree = ts.createSourceFile('module.ts', source, ts.ScriptTarget.Latest, true)
  const visit = (node: ts.Node): void => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      results.push(node.moduleSpecifier.text)
    }
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) {
      results.push(node.argument.literal.text)
    }
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || ts.isIdentifier(node.expression) && node.expression.text === 'require')) {
      const argument = node.arguments[0]
      assert.ok(argument && ts.isStringLiteralLike(argument), 'Guarded runtime imports require a literal dependency')
      results.push(argument.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(tree)
  return results
}

const targetOf = (file: string, specifier: string): string =>
  posix.normalize(posix.join(dirname(file).replaceAll('\\', '/'), specifier.replace(/\.js$/, '.ts')))

const dependencyName = (target: string): DependencyName | 'other' => {
  if (target === 'compiler/units.ts') return 'units'
  for (const layer of permanentLayers) {
    if (target.startsWith(`compiler/${layer}/`)) return layer
  }
  return 'other'
}

describe('CH-02 permanent runtime architecture', () => {
  test('generic runtime domains obey the permanent dependency DAG', () => {
    for (const layer of permanentLayers) {
      for (const file of runtimeFiles(layer)) {
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

  test('generic runtime logic contains no Reference House fixture knowledge', () => {
    const fixtureKnowledge = /(?:RH-C\d|REFERENCE-HOUSE|Reference House|createReferenceHouse)/
    for (const layer of permanentLayers) {
      for (const file of runtimeFiles(layer)) {
        const source = readFileSync(file, 'utf8')
        assert.doesNotMatch(source, fixtureKnowledge, `${file} contains Reference House fixture knowledge`)
      }
    }
  })

  test('shared geometry is owned by core rather than the historical P0 gate', () => {
    const p0Geometry = readFileSync('compiler/p0/geometry.ts', 'utf8')
    assert.match(p0Geometry, /from '\.\.\/core\/geometry\.js'/)

    for (const layer of ['plan-slice', 'structure-slice'] as const) {
      for (const file of runtimeFiles(layer)) {
        assert.doesNotMatch(
          readFileSync(file, 'utf8'),
          /\.\.\/p0\//,
          `${file} still treats P0 as a permanent runtime dependency`
        )
      }
    }
  })
})

// These are generic representation/evaluation boundaries, not a ban on the
// deliberate Reference House adapters or retained historical RH-C helpers.
const representationDependencies: Record<string, readonly string[]> = {
  'publication-drawing': [],
  'publication-drawing-v2': ['publication-drawing'],
  'architectural-drawing': ['units', 'publication-drawing', 'publication-drawing-v2'],
  output: [],
  dpl: ['core', 'reference-house']
}

test('generic drawing and DPL modules retain their declared dependency boundaries recursively', () => {
  for (const [layer, allowed] of Object.entries(representationDependencies)) {
    for (const file of sourceFiles(layer)) {
      for (const specifier of importSpecifiers(readFileSync(file, 'utf8'))) {
        if (!specifier.startsWith('.')) {
          assert.ok(layer === 'dpl' && specifier.startsWith('node:'), `${file} imports unexpected external module ${specifier}`)
          continue
        }
        const target = targetOf(file, specifier)
        const own = target.startsWith(`compiler/${layer}/`)
        const permitted = allowed.some((dependency) => target === `compiler/${dependency}.ts` || target.startsWith(`compiler/${dependency}/`))
        assert.ok(own || permitted, `${file} imports ${target}, outside the allowed ${layer} boundary`)
      }
    }
  }
})

test('dependency scanner covers re-exports, dynamic literals and import types without matching comments', () => {
  assert.deepEqual(importSpecifiers(`
    // import './ignored.js'
    export { value } from './exported.js'
    const x = import('./dynamic.js')
    type T = import('./type.js').T
  `), ['./exported.js', './dynamic.js', './type.js'])
  assert.throws(() => importSpecifiers('const x = import(variable)'), /literal dependency/)
})
