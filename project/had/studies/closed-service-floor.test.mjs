import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

test('closed715 E body and actual-grid N frame source, energy, head, section and adverse controls', () => {
  execFileSync('python3', ['-B', fileURLToPath(new URL('closed_service_floor_test.py', import.meta.url))], { stdio: 'pipe', timeout: 120000 })
})
