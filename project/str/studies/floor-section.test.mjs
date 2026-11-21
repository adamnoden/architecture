import { execFileSync } from 'node:child_process'
import test from 'node:test'

test('actual floor-section analytical admission, material law and current-source matched/reversal receipt', () => {
  execFileSync('python3', ['-B', '-m', 'unittest', 'discover', '-s', 'project/str/studies', '-p', 'floor_section_successor_test.py'], { stdio: 'pipe' })
  execFileSync('python3', ['-B', 'project/str/studies/floor_section_proof.py', '--check'], { stdio: 'pipe' })
})
