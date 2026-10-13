import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, posix } from 'node:path'
import { describe, test } from 'node:test'

const typescriptFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) return typescriptFiles(path)
      return entry.isFile() && entry.name.endsWith('.ts') ? [path.split('\\').join('/')] : []
    })
    .sort()

const compilerFiles = typescriptFiles('compiler')

describe('CH-08 distillation and deletion', () => {
  test('core geometry is the single Box2D type authority', () => {
    const interfaceOwners = compilerFiles.filter((path) =>
      /(?:export\s+)?interface\s+Box2D\b/.test(readFileSync(path, 'utf8'))
    )

    assert.deepEqual(interfaceOwners, ['compiler/core/geometry.ts'])

    const p0Model = readFileSync('compiler/p0/model.ts', 'utf8')
    assert.match(p0Model, /import type \{ Box2D as CoreBox2D \} from '\.\.\/core\/geometry\.js'/)
    assert.match(p0Model, /export type Box2D = CoreBox2D/)
  })

  test('unused RH-C3/RH-C4 barrel facades remain deleted', () => {
    assert.equal(existsSync(posix.join('compiler', 'rhc3', 'index.ts')), false)
    assert.equal(existsSync(posix.join('compiler', 'rhc4', 'index.ts')), false)
  })

  test('historical executable gate surfaces remain present as evidence', () => {
    for (const path of [
      'compiler/p0/p0.test.ts',
      'compiler/cf01/cf01.test.ts',
      'compiler/reference-house/reference-house.test.ts',
      'compiler/rhc2/rhc2.test.ts',
      'compiler/rhc3/rhc3.test.ts',
      'compiler/rhc4/rhc4.test.ts',
      'compiler/rhc5/rhc5.test.ts'
    ]) {
      assert.equal(existsSync(path), true, `Expected historical executable evidence ${path}`)
    }
  })
})
