import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import { assertCanonicalArtefactGenerationAllowed } from '../reference-house/artifact-generation.js'

type PackageJson = {
  scripts: Record<string, string>
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as PackageJson

const generatorPaths = [
  'compiler/reference-house/generate.ts',
  'compiler/rhc2/generate.ts',
  'compiler/rhc3/generate.ts',
  'compiler/rhc4/generate.ts'
] as const

describe('CH-07 toolchain and developer ergonomics', () => {
  test('canonical artefact generation is PASS-only', () => {
    assert.doesNotThrow(() => assertCanonicalArtefactGenerationAllowed('TEST', 'PASS'))
    assert.throws(
      () => assertCanonicalArtefactGenerationAllowed('TEST', 'REVIEW'),
      /canonical artefact generation requires PASS; got REVIEW/
    )
    assert.throws(
      () => assertCanonicalArtefactGenerationAllowed('TEST', 'FAIL'),
      /canonical artefact generation requires PASS; got FAIL/
    )

    for (const path of generatorPaths) {
      const source = readFileSync(path, 'utf8')
      assert.match(source, /assertCanonicalArtefactGenerationAllowed/)
      assert.match(source, /assertCanonicalArtefactGenerationAllowed\('RH-C[1-4]', result\.status\)/)
    }
  })

  test('one explicit health command owns the normal repository check', () => {
    assert.equal(packageJson.scripts.check, 'npm test && npm run docs:build')

    for (const workflowPath of [
      '.github/workflows/validate-pr.yml',
      '.github/workflows/docs-pages.yml'
    ]) {
      const workflow = readFileSync(workflowPath, 'utf8')
      assert.match(workflow, /run: npm run check/)
      assert.match(workflow, /node-version-file: \.nvmrc/)
      assert.match(workflow, /cache: npm/)
    }

    const pullRequestWorkflow = readFileSync('.github/workflows/validate-pr.yml', 'utf8')
    assert.match(pullRequestWorkflow, /cancel-in-progress: true/)
  })

  test('artefact verification is explicit, focused and non-mutating', () => {
    assert.equal(packageJson.scripts['artifacts:check'], 'npm run test:ch00 && npm run test:ch05')
    assert.doesNotMatch(packageJson.scripts['artifacts:check'], /generate|write|prepare/)
    assert.equal(
      packageJson.scripts['artifacts:generate'],
      'npm run rh-c1:generate && npm run rh-c2:generate && npm run rh-c3:generate && npm run rh-c4:generate'
    )
  })

  test('local and CI use the same canonical Node major', () => {
    assert.equal(readFileSync('.nvmrc', 'utf8').trim(), '24')
  })
})
