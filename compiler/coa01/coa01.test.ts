import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join, posix } from 'node:path'
import { describe, test } from 'node:test'

import { FORMAT_POLICY, outputGenerationPolicy } from '../output/policy.js'
import { REFERENCE_HOUSE_OUTPUTS, REFERENCE_HOUSE_OUTPUT_SCHEMA_VERSION } from '../reference-house/output/contract.js'
import { createReferenceHouseOutputContext } from '../reference-house/output/context.js'

const semanticRoots = [
  'compiler/core',
  'compiler/plan-slice',
  'compiler/structure-slice',
  'compiler/service-slice',
  'compiler/boundary-slice',
  'compiler/calculation-slice',
  'compiler/reference-house'
] as const

const tsFiles = (root: string): string[] => {
  const files: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (path.replaceAll('\\', '/') === 'compiler/reference-house/output') continue
        walk(path)
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        files.push(path.replaceAll('\\', '/'))
      }
    }
  }
  walk(root)
  return files.sort()
}

describe('COA-01 output contract', () => {
  test('selects output medium from information character', () => {
    assert.deepEqual(FORMAT_POLICY, {
      MACHINE_IDENTITY: 'json',
      NON_SPATIAL_REGISTER: 'markdown',
      METRIC_SPATIAL: 'svg',
      METRIC_TOPOLOGY: 'svg'
    })
  })

  test('freezes one unique successor family with appropriate formats', () => {
    assert.equal(REFERENCE_HOUSE_OUTPUT_SCHEMA_VERSION, 'RH-OUTPUT-1')
    const outputs = Object.values(REFERENCE_HOUSE_OUTPUTS)
    assert.equal(new Set(outputs.map((item) => item.id)).size, outputs.length)
    assert.equal(new Set(outputs.map((item) => item.path)).size, outputs.length)
    assert.ok(outputs.every((item) => item.path.startsWith('docs/reference-house/generated/')))

    assert.equal(REFERENCE_HOUSE_OUTPUTS.groundFloorPlan.format, 'svg')
    assert.equal(REFERENCE_HOUSE_OUTPUTS.firstFloorPlan.format, 'svg')
    assert.equal(REFERENCE_HOUSE_OUTPUTS.principalSection.format, 'svg')
    assert.equal(REFERENCE_HOUSE_OUTPUTS.firstFloorStructure.format, 'svg')
    assert.equal(REFERENCE_HOUSE_OUTPUTS.serviceRegister.format, 'markdown')
    assert.equal(REFERENCE_HOUSE_OUTPUTS.boundaryRegister.format, 'markdown')
    assert.equal(REFERENCE_HOUSE_OUTPUTS.outputManifest.format, 'json')
  })

  test('fails closed and makes REVIEW visibility mandatory', () => {
    assert.deepEqual(outputGenerationPolicy('PASS'), {
      allowed: true,
      visibleStatusRequired: false
    })
    assert.deepEqual(outputGenerationPolicy('REVIEW'), {
      allowed: true,
      visibleStatusRequired: true
    })
    assert.deepEqual(outputGenerationPolicy('FAIL'), {
      allowed: false,
      visibleStatusRequired: false
    })
  })

  test('creates one canonical single-pass Reference House output context', () => {
    const context = createReferenceHouseOutputContext()
    assert.equal(context.result.status, 'PASS')
    assert.equal(context.reviewStateVisible, false)
    assert.equal(context.result.identity.schemaVersion, 'HK-RH-COMPILE-1')
    assert.ok(context.result.identity.compile.fingerprint.length > 0)

    const contextSource = readFileSync('compiler/reference-house/output/context.ts', 'utf8')
    assert.match(contextSource, /compileReferenceHouseSystem/)
    assert.doesNotMatch(contextSource, /compileReferenceHouse(?:Structural|Service|Boundary)View/)
    assert.doesNotMatch(contextSource, /\.\.\/\.\.\/rhc[2345]\//)
  })

  test('keeps the output layer downstream of semantic runtime', () => {
    const forbidden = /(?:\.\.\/)*output\//
    for (const root of semanticRoots) {
      for (const file of tsFiles(root)) {
        const source = readFileSync(file, 'utf8')
        const importPattern = /(?:from\s+|import\s+)['"]([^'"]+)['"]/g
        for (const match of source.matchAll(importPattern)) {
          const specifier = match[1]
          if (!specifier.startsWith('.')) continue
          const target = posix.normalize(posix.join(posix.dirname(file), specifier.replace(/\.js$/, '.ts')))
          assert.equal(
            forbidden.test(target),
            false,
            `${file} imports downstream output module ${target}`
          )
          forbidden.lastIndex = 0
        }
      }
    }
  })
})
