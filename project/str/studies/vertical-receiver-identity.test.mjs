import test from 'node:test'
import { execFileSync } from 'node:child_process'

test('retained roof points reuse physical plate traces and carry actual point-load energy', () => {
  execFileSync('python3', ['-B', 'project/str/studies/vertical_receiver_identity_test.py'], {
    cwd: process.cwd(), stdio: 'pipe'
  })
})
