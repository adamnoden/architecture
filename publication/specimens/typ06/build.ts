import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '../../..')

for (const format of ['a4', 'b5'] as const) {
  const env = { ...process.env, TYP06_FORMAT: format }
  execFileSync('npx', ['tsx', 'publication/specimens/typ06/prepare.ts'], {
    cwd: repoRoot,
    env,
    stdio: 'inherit'
  })
  execFileSync('npx', ['vivliostyle', 'build', '-c', 'publication/specimens/typ06/vivliostyle.config.js'], {
    cwd: repoRoot,
    env,
    stdio: 'inherit'
  })
}

console.log('Built TYP-06B drawing-interface specimen in A4 and B5.')
