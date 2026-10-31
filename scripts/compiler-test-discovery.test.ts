import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { posix } from 'node:path'
import { test } from 'node:test'
import { missingCompilerTests } from './compiler-test-discovery.js'

const compilerTests = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = posix.join(directory, entry.name)
    return entry.isDirectory() ? compilerTests(path) : entry.name.endsWith('.test.ts') ? [path] : []
  })

test('every compiler test is covered by a suite reachable from npm test', () => {
  const { scripts } = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> }
  const files = compilerTests('compiler')
  assert.ok(files.length > 0, 'Compiler test inventory must not be empty')
  const missing = missingCompilerTests(scripts, files)
  assert.deepEqual(missing, [], `Compiler tests omitted from npm test:\n${missing.join('\n')}`)
})

test('a suite that exists but is not called cannot conceal an omitted directory', () => {
  const scripts = {
    test: 'npm run current',
    current: 'node --import tsx --test compiler/current/*.test.ts',
    forgotten: 'node --import tsx --test compiler/new/*.test.ts'
  }
  assert.deepEqual(missingCompilerTests(scripts, ['compiler/current/a.test.ts', 'compiler/new/b.test.ts']), ['compiler/new/b.test.ts'])
  assert.deepEqual(missingCompilerTests({ ...scripts, test: 'npm run current && npm run forgotten' }, ['compiler/new/b.test.ts']), [])
})

test('new and nested tests are detected without letting a single-level glob overclaim coverage', () => {
  const scripts = { test: 'npm run suite', suite: 'npm run leaf', leaf: 'node --import tsx --test compiler/a/*.test.ts compiler/exact.test.ts' }
  assert.deepEqual(missingCompilerTests(scripts, [
    'compiler/a/one.test.ts', 'compiler/a/deep/two.test.ts', 'compiler/exact.test.ts', 'compiler/new.test.ts'
  ]), ['compiler/a/deep/two.test.ts', 'compiler/new.test.ts'])
})

test('unsupported runner/filter/glob syntax and broken aliases fail rather than give false assurance', () => {
  for (const test of [
    'echo node --import tsx --test compiler/a/*.test.ts',
    'node --import tsx --test --test-name-pattern=one compiler/a/*.test.ts',
    'node --import tsx --test compiler/**/*.test.ts'
  ]) assert.throws(() => missingCompilerTests({ test }, []), /Unsupported compiler test/)
  assert.throws(() => missingCompilerTests({ test: 'npm run missing' }, []), /Missing npm test script/)
  assert.throws(() => missingCompilerTests({ test: 'npm run again', again: 'npm run test' }, []), /Cyclic npm test script/)
})
