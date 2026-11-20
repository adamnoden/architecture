import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

test('actual lower north RC receivers, finite caps and52-head compatibility preserve force and reciprocal energy', () => {
  execFileSync('python3', ['-B', fileURLToPath(new URL('north_portal_receiving_test.py', import.meta.url))], {
    stdio: 'pipe', timeout: 120000,
  })
})
