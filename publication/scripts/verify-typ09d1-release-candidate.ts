import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '../..')
const proofRoot = resolve(repoRoot, 'publication/.proof/typ09b')
const candidate = JSON.parse(await readFile(resolve(repoRoot, 'publication/release-candidates/typ09d1.json'), 'utf8')) as any
const verification = JSON.parse(await readFile(resolve(proofRoot, 'verification.json'), 'utf8')) as any
const fontPins = await readFile(resolve(repoRoot, 'publication/fonts.ts'), 'utf8')
const typographyIntegration = await readFile(resolve(repoRoot, 'publication/scripts/typography.ts'), 'utf8')
const emphasisCss = await readFile(resolve(repoRoot, 'publication/typ09d1-emphasis.css'), 'utf8')

const provenancePage = 2
const sha256 = (value: Buffer | string): string => createHash('sha256').update(value).digest('hex')

type Fingerprints = {
  pages: number
  fingerprintedPages: number
  layoutTextSha256: string
  bboxLayoutSha256: string
  raster36DpiGrayPageSetSha256: string
}

async function fingerprints(pdf: string, totalPages: number): Promise<Fingerprints> {
  const directory = await mkdtemp(resolve(tmpdir(), 'typ09d1-fingerprint-'))
  try {
    const layoutFront = resolve(directory, 'layout-front.txt')
    const layoutBody = resolve(directory, 'layout-body.txt')
    const bboxFront = resolve(directory, 'bbox-front.html')
    const bboxBody = resolve(directory, 'bbox-body.html')
    const rasterPrefix = resolve(directory, 'page')

    execFileSync('pdftotext', ['-f', '1', '-l', '1', '-layout', pdf, layoutFront], { cwd: repoRoot, stdio: 'ignore' })
    execFileSync('pdftotext', ['-f', '3', '-l', String(totalPages), '-layout', pdf, layoutBody], { cwd: repoRoot, stdio: 'ignore' })
    execFileSync('pdftotext', ['-f', '1', '-l', '1', '-bbox-layout', pdf, bboxFront], { cwd: repoRoot, stdio: 'ignore' })
    execFileSync('pdftotext', ['-f', '3', '-l', String(totalPages), '-bbox-layout', pdf, bboxBody], { cwd: repoRoot, stdio: 'ignore' })
    execFileSync('pdftoppm', ['-r', '36', '-gray', pdf, rasterPrefix], { cwd: repoRoot, stdio: 'ignore' })

    const layoutBytes = Buffer.concat([
      await readFile(layoutFront),
      Buffer.from('\n-- TYP-09D.1 PROVENANCE PAGE 2 EXCLUDED --\n'),
      await readFile(layoutBody)
    ])
    const bboxBytes = Buffer.concat([
      await readFile(bboxFront),
      Buffer.from('\n<!-- TYP-09D.1 PROVENANCE PAGE 2 EXCLUDED -->\n'),
      await readFile(bboxBody)
    ])

    const files = (await readdir(directory)).filter((name) => name.endsWith('.pgm')).sort()
    const pageHashes: string[] = []
    for (const [index, file] of files.entries()) {
      if (index + 1 === provenancePage) continue
      pageHashes.push(sha256(await readFile(resolve(directory, file))))
    }

    return {
      pages: files.length,
      fingerprintedPages: pageHashes.length,
      layoutTextSha256: sha256(layoutBytes),
      bboxLayoutSha256: sha256(bboxBytes),
      raster36DpiGrayPageSetSha256: sha256(`${pageHashes.join('\n')}\n`)
    }
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

const failures: string[] = []
if (candidate.schemaVersion !== 1 || candidate.packet !== 'TYP-09D.1' || candidate.candidate !== 'publication-typography-v1-rc2') {
  failures.push('RC2 identity contract drifted.')
}
if (!['CALIBRATION', 'FROZEN_REBUILD_EQUIVALENCE'].includes(candidate.identityState)) {
  failures.push(`Unknown RC2 identity state: ${candidate.identityState}.`)
}
if (verification.result !== 'PASS') failures.push(`Production verification is ${verification.result}, not PASS.`)

if (!fontPins.includes("path: 'TTF/SourceSerif4-Semibold.ttf'") || !fontPins.includes("gitBlobSha: '151e9a9d5c08dfd4751650ab4bff92771a132888'")) {
  failures.push('Exact Source Serif 4 Semibold pin is missing.')
}
if (!typographyIntegration.includes("['PUBLICATION_SERIF_SEMIBOLD', 'Publication Serif', 'normal', 600]")) {
  failures.push('Generated Publication Serif face is not honestly declared as Semibold / 600.')
}
if (!/strong\s*\{\s*font-weight:\s*600;\s*\}/m.test(emphasisCss) || !/\.schedule-subject\s*\{\s*font-weight:\s*600;\s*\}/m.test(emphasisCss)) {
  failures.push('Bounded serif emphasis override is not exactly 600 for strong + schedule subject.')
}

const expectedFonts = [...candidate.productionObject.finishedFonts].sort()
const calibration: Record<string, unknown> = {
  schemaVersion: 1,
  packet: 'TYP-09D.1',
  candidate: candidate.candidate,
  identityState: candidate.identityState,
  formats: {}
}

for (const format of ['a4', 'b5'] as const) {
  const expected = candidate.productionObject[format]
  const actual = verification.formats?.[format]
  if (!actual) {
    failures.push(`Missing ${format.toUpperCase()} production verification.`)
    continue
  }
  if (actual.pages !== expected.pages) failures.push(`${format.toUpperCase()} pages drifted: ${actual.pages} != ${expected.pages}.`)
  if (actual.leaves !== expected.duplexLeaves) failures.push(`${format.toUpperCase()} leaves drifted: ${actual.leaves} != ${expected.duplexLeaves}.`)
  if (actual.imprintPage !== provenancePage) failures.push(`${format.toUpperCase()} provenance page moved from page 2.`)
  const actualFonts = [...(actual.finishedFonts ?? [])].sort()
  if (JSON.stringify(actualFonts) !== JSON.stringify(expectedFonts)) {
    failures.push(`${format.toUpperCase()} finished-font set drifted: ${JSON.stringify(actualFonts)}.`)
  }

  const pdf = resolve(proofRoot, format, `publication-typography-production-${format}.pdf`)
  const result = await fingerprints(pdf, expected.pages)
  ;(calibration.formats as any)[format] = result
  if (result.pages !== expected.pages || result.fingerprintedPages !== expected.pages - 1) {
    failures.push(`${format.toUpperCase()} reader-page fingerprint coverage drifted.`)
  }

  if (candidate.identityState === 'FROZEN_REBUILD_EQUIVALENCE') {
    for (const key of ['layoutTextSha256', 'bboxLayoutSha256', 'raster36DpiGrayPageSetSha256'] as const) {
      if (result[key] !== expected[key]) failures.push(`${format.toUpperCase()} ${key} drifted: ${result[key]}.`)
    }
  }
}

await writeFile(resolve(proofRoot, 'typ09d1-calibration.json'), `${JSON.stringify(calibration, null, 2)}\n`, 'utf8')
if (candidate.crossRunProof?.requiredIndependentReplicas !== 2 || candidate.crossRunProof?.provenancePageExcluded !== provenancePage) {
  failures.push('RC2 two-replica/provenance exclusion contract drifted.')
}
if (candidate.physicalOwnerVerdict !== 'REQUIRED_AFTER_FROZEN_RC2') failures.push('RC2 must not infer an owner verdict.')

if (failures.length) throw new Error(`TYP-09D.1 RC2 verification failed:\n- ${failures.join('\n- ')}`)
console.log(JSON.stringify(calibration, null, 2))
console.log(`TYP-09D.1 RC2 ${candidate.identityState} PASS; owner verdict remains pending.`)
