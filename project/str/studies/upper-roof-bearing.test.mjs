import test from 'node:test'
import { execFileSync } from 'node:child_process'

test('named plate gravity, exact upper clear bodies and actual ring traces preserve their physical boundaries', () => {
  execFileSync('python3', ['-B', '-m', 'unittest', 'named_plate_load_test', 'upper_masonry_inventory_test', 'roof_bearing_trace_test'], {
    env: { ...process.env, PYTHONPATH: 'project/str/studies', OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' }, stdio: 'pipe',
  })
})

test('current full-system upper-seat evidence retains actual mutations, adverse actions and reversal', () => {
  execFileSync('python3', ['-B', 'project/str/studies/upper_roof_bearing_proof.py', '--check'], { stdio: 'pipe' })
})
