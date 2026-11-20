import { execFileSync } from 'node:child_process'
import test from 'node:test'

test('one authored ground case drives the whole-house vertical proposal without force or roof adoption', { timeout: 30000 }, () => {
  execFileSync('python3', ['-B', '-m', 'unittest', 'discover', '-s', 'project/had/studies', '-p', 'house_vertical_profile_test.py'], { stdio: 'pipe' })
  execFileSync('python3', ['-B', 'project/had/studies/house_vertical_profile.py', '--check'], { stdio: 'pipe' })
})
