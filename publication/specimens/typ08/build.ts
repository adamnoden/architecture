import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '../../..')
const proofRoot = resolve(repoRoot, 'publication/.proof/typ08a')

rmSync(proofRoot, { recursive: true, force: true })
mkdirSync(resolve(proofRoot, 'a4'), { recursive: true })
mkdirSync(resolve(proofRoot, 'b5'), { recursive: true })

execFileSync('npx', ['tsx', 'publication/scripts/prepare.ts', '--full'], {
  cwd: repoRoot,
  stdio: 'inherit'
})
execFileSync('npx', ['tsx', 'publication/specimens/typ08/prepare.ts'], {
  cwd: repoRoot,
  stdio: 'inherit'
})
execFileSync('npx', ['tsx', 'publication/specimens/typ08/correct.ts'], {
  cwd: repoRoot,
  stdio: 'inherit'
})

for (const format of ['a4', 'b5'] as const) {
  const env = { ...process.env, TYP08_FORMAT: format }
  execFileSync('npx', ['vivliostyle', 'build', '-c', 'publication/specimens/typ08/vivliostyle.config.js'], {
    cwd: repoRoot,
    env,
    stdio: 'inherit'
  })
}

console.log('Built TYP-08C corrected full-book candidate in A4 and conservative B5.')
