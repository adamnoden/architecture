import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, sep } from 'node:path'
import { collectReadmes } from './readme-discovery.js'
import test from 'node:test'
import {
  missingReadmeNpmScripts,
  referencedNpmRunScripts
} from './readme-command-contract.js'

test('extracts distinct npm run commands from README prose and fences', () => {
  const markdown = `
Run \`npm run check\` before merging.

\`\`\`sh
npm run outputs:check
npm run check
\`\`\`
`

  assert.deepEqual(referencedNpmRunScripts(markdown), ['check', 'outputs:check'])
})

test('accepts README commands that exist in package scripts', () => {
  const failures = missingReadmeNpmScripts(
    [
      {
        path: 'README.md',
        markdown: 'Use `npm run check` and `npm run docs:dev`.'
      }
    ],
    {
      check: 'npm test',
      'docs:dev': 'vitepress dev .'
    }
  )

  assert.deepEqual(failures, [])
})

test('rejects a README command whose package script was removed or misspelled', () => {
  const failures = missingReadmeNpmScripts(
    [
      {
        path: 'publication/README.md',
        markdown: 'Verify with `npm run publication:valdiate`.'
      }
    ],
    {
      'publication:validate': 'tsx publication/scripts/validate.ts'
    }
  )

  assert.deepEqual(failures, ['publication/README.md -> npm run publication:valdiate'])
})

test('README discovery ignores build outputs while retaining authored publication READMEs', () => {
  const root = mkdtempSync(join(tmpdir(), 'readme-discovery-'))
  try {
    const authored = ['README.md', 'publication/README.md', 'publication/specimens/plt99/README.md',
      'publication/dist-notes/README.md', 'publication/specimens/plt99/.work-notes/README.md']
    const generated = ['.git/README.md', 'node_modules/pkg/README.md', '.vitepress/cache/README.md',
      '.vitepress/dist/README.md', 'publication/build/README.md', 'publication/.work/source/README.md',
      'publication/dist/README.md', 'publication/specimens/plt99/.work/source/README.md',
      'publication/specimens/plt99/dist/README.md']
    for (const path of [...authored, ...generated]) {
      mkdirSync(dirname(join(root, path)), { recursive: true })
      writeFileSync(join(root, path), '[Broken generated link](missing.md)')
    }
    assert.deepEqual(collectReadmes(root).map((path) => relative(root, path).split(sep).join('/')).sort(), authored.sort())
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
