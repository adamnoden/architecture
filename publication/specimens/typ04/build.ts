import { execFileSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const specimenRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(specimenRoot, '../../..')

for (const format of ['a4', 'b5'] as const) {
  const env = { ...process.env, TYP04_FORMAT: format }
  execFileSync('npx', ['tsx', 'publication/specimens/typ04/prepare.ts'], {
    cwd: repoRoot,
    env,
    stdio: 'inherit'
  })
  execFileSync('npx', ['vivliostyle', 'build', '-c', 'publication/specimens/typ04/vivliostyle.config.js'], {
    cwd: repoRoot,
    env,
    stdio: 'inherit'
  })
}

console.log('Built TYP-04B hierarchy specimen in A4 and B5.')
