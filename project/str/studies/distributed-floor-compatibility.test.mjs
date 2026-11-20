import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

test('four-wall diaphragm coupling preserves source geometry, signed actions, energy and all52head equilibrium', () => {
  execFileSync('python3', ['-B', fileURLToPath(new URL('distributed_floor_compatibility_test.py', import.meta.url))], {
    stdio: 'pipe', timeout: 120000,
  })
})
