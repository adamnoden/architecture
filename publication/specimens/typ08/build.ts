import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { relative, resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '../../..')
const proofRoot = resolve(repoRoot, 'publication/.proof/typ08a')

rmSync(proofRoot, { recursive: true, force: true })
mkdirSync(resolve(proofRoot, 'a4'), { recursive: true })
mkdirSync(resolve(proofRoot, 'b5'), { recursive: true })

execFileSync('npx', ['tsx', 'publication/scripts/prepare.ts', '--full'], {
  cwd: repoRoot,
  env: { ...process.env, PUBLICATION_RAW_PREPARE: '1' },
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
execFileSync('npx', ['tsx', 'publication/specimens/typ08/restore-svg-fonts.ts'], {
  cwd: repoRoot,
  stdio: 'inherit'
})

for (const format of ['a4', 'b5'] as const) {
  const pdf = resolve(proofRoot, format, `typ08a-full-book-${format}.pdf`)
  const relativePdf = relative(repoRoot, pdf)

  // Historical TYP-08 stays pinned to raw publication preparation and its own
  // candidate-only transformations. TYP-09 production typography is deliberately
  // bypassed above so this proof remains a reproducible frozen reference object.
  execFileSync('npx', ['vivliostyle', 'build', '-c', 'publication/specimens/typ08/vivliostyle.config.js'], {
    cwd: repoRoot,
    env: { ...process.env, TYP08_FORMAT: format },
    stdio: 'inherit'
  })
  execFileSync('npx', ['tsx', 'publication/specimens/typ08/normalize-pdf-destinations.ts', pdf], {
    cwd: repoRoot,
    stdio: 'inherit'
  })

  console.log(`Built TYP-08C ${format} final candidate from ${relativePdf}.`)
}

console.log('Built TYP-08C corrected full-book candidate in A4 and conservative B5.')
