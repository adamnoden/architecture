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

  // The frozen TYP-04 contract is semantic: every Part starts on recto. The
  // generated Part marker sits inside the actual ArticleEntry and carries
  // break-before:right in all five Part documents. Vivliostyle therefore adds a
  // genuine :blank page only when the preceding flow requires one; no page-count
  // prediction or synthetic parity document is needed.
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
