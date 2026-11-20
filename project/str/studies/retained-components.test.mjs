import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

test('source-bound retained components subtract actual openings, withhold unresolved paths and replace native global-contact families', () => {
  execFileSync('python3', ['-B', fileURLToPath(new URL('retained_components_test.py', import.meta.url))], {
    stdio: 'pipe', timeout: 120000,
  })
})
