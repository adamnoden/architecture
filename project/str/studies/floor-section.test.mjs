import { execFileSync } from 'node:child_process'
import test from 'node:test'

test('actual floor-section analytical admission, material law and current-source matched/reversal receipt', () => {
  execFileSync('python3', ['-B', '-m', 'unittest', 'discover', '-s', 'project/str/studies', '-p', 'floor_section_successor_test.py'], { stdio: 'pipe' })
  execFileSync('python3', ['-B', 'project/str/studies/floor_section_proof.py', '--check'], { stdio: 'pipe' })
  for (const pattern of ['seated_wet_support_test.py','finite_mapped_frame_test.py','finite_plate_receiver_test.py','floor_section_capture_test.py','receiver_action_recovery_test.py'])
    execFileSync('python3', ['-B','-m','unittest','discover','-s','project/str/studies','-p',pattern],{stdio:'pipe'})
  execFileSync(process.execPath,['--import','tsx','project/str/studies/floor-section-cuts.ts','--check'],{stdio:'pipe'})
})
