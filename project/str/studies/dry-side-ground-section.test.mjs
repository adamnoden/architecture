import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

test('the complete dry-ground comparison preserves original quantities, component support and adverse section boundaries', () => {
  execFileSync('python3', ['-B', fileURLToPath(new URL('dry_side_ground_section_test.py', import.meta.url))], {
    stdio: 'pipe', timeout: 120000,
  })
  execFileSync('python3', ['-B', fileURLToPath(new URL('dry_side_ground_section.py', import.meta.url)), '--check'], {
    stdio: 'pipe', timeout: 120000,
  })
})
