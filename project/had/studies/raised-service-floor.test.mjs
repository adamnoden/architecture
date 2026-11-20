import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

test('raised715 service floor preserves source layers and challenges water, openings, covers and source applicability', () => {
  execFileSync('python3', ['-B', fileURLToPath(new URL('raised_service_floor_test.py', import.meta.url))], { stdio: 'pipe', timeout: 30000 })
})
