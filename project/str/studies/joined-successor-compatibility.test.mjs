import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

test('joined successor frame, unilateral interfaces and real 52-head source pass analytical and propagation checks', () => {
  execFileSync('python3', ['-B', fileURLToPath(new URL('joined_successor_compatibility_test.py', import.meta.url))], {
    stdio: 'pipe', timeout: 120000,
  })
})
