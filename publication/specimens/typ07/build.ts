import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '../../..')

for (const format of ['a4', 'b5'] as const) {
  const env = { ...process.env, TYP07_FORMAT: format }
  execFileSync('npx', ['tsx', 'publication/specimens/typ07/prepare.ts'], {
    cwd: repoRoot,
    env,
    stdio: 'inherit'
  })
  execFileSync('npx', ['vivliostyle', 'build', '-c', 'publication/specimens/typ07/vivliostyle.config.js'], {
    cwd: repoRoot,
    env,
    stdio: 'inherit'
  })
}

console.log('Built TYP-07B representative signature in A4 and B5.')
