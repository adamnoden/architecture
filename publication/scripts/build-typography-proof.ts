import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '../..')
const publicationRoot = resolve(repoRoot, 'publication')
const proofRoot = resolve(publicationRoot, '.proof/typ09b')
const distRoot = resolve(publicationRoot, 'dist')

rmSync(proofRoot, { recursive: true, force: true })
mkdirSync(resolve(proofRoot, 'a4'), { recursive: true })
mkdirSync(resolve(proofRoot, 'b5'), { recursive: true })
mkdirSync(resolve(proofRoot, 'diagnostics'), { recursive: true })

execFileSync('npx', ['tsx', 'publication/scripts/prepare.ts', '--full'], {
  cwd: repoRoot,
  stdio: 'inherit'
})

for (const format of ['a4', 'b5'] as const) {
  execFileSync('npx', ['vivliostyle', 'build', '-c', 'publication/vivliostyle.config.js'], {
    cwd: repoRoot,
    env: { ...process.env, PUBLICATION_FORMAT: format },
    stdio: 'inherit'
  })

  const distPdf = resolve(distRoot, format === 'a4' ? 'ovids-house.pdf' : 'ovids-house-b5.pdf')
  const proofPdf = resolve(proofRoot, format, `publication-typography-production-${format}.pdf`)
  copyFileSync(distPdf, proofPdf)
  execFileSync('npx', ['tsx', 'publication/scripts/normalize-pdf-destinations.ts', proofPdf], {
    cwd: repoRoot,
    stdio: 'inherit'
  })
}

copyFileSync(resolve(publicationRoot, '.work/build.json'), resolve(proofRoot, 'build.json'))
copyFileSync(resolve(publicationRoot, '.work/typography-integration.json'), resolve(proofRoot, 'typography-integration.json'))
copyFileSync(resolve(publicationRoot, '.work/publication-fonts/upstream-evidence.json'), resolve(proofRoot, 'font-upstream-evidence.json'))

console.log('Built normalized production typography proof in A4 and conservative B5.')
