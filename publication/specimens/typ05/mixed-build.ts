import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const specimenRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(specimenRoot, '../../..')

for (const format of ['a4', 'b5'] as const) {
  const env = { ...process.env, TYP05_FORMAT: format }
  execFileSync('npx', ['tsx', 'publication/specimens/typ05/mixed-prepare.ts'], {
    cwd: repoRoot,
    env,
    stdio: 'inherit'
  })
  execFileSync('npx', ['vivliostyle', 'build', '-c', 'publication/specimens/typ05/mixed-vivliostyle.config.js'], {
    cwd: repoRoot,
    env,
    stdio: 'inherit'
  })
}

console.log('Built TYP-05B mixed-content specimen in A4 and B5.')
