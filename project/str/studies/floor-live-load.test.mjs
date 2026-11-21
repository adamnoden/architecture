import test from 'node:test'
import { execFileSync } from 'node:child_process'

test('net floor live load preserves actual plate force, moments, particular response and reversible zero control', () => {
  execFileSync('python3', ['-B', 'project/str/studies/floor_live_load_test.py'], {
    cwd: process.cwd(), stdio: 'pipe',
    env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' }
  })
})
