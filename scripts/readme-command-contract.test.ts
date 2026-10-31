import assert from 'node:assert/strict'
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
