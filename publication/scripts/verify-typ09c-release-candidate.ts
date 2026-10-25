import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '../..')
const proofRoot = resolve(repoRoot, 'publication/.proof/typ09b')
const candidate = JSON.parse(
  await readFile(resolve(repoRoot, 'publication/release-candidates/typ09c.json'), 'utf8')
) as any
const verification = JSON.parse(
  await readFile(resolve(proofRoot, 'verification.json'), 'utf8')
) as any
const typ06 = await readFile(
  resolve(repoRoot, 'docs/publication/publication-typography-typ06c-sans-drawing-interface-freeze.md'),
  'utf8'
)
const drawingTokens = await readFile(
  resolve(repoRoot, 'compiler/publication-drawing/tokens.ts'),
  'utf8'
)

const sha256 = (value: Buffer | string): string => createHash('sha256').update(value).digest('hex')
const provenancePage = 2

type RebuildFingerprints = {
  layoutTextSha256: string
  bboxLayoutSha256: string
  rasterPages: number
  fingerprintedRasterPages: number
  rasterPageSetSha256: string
}

async function rebuildFingerprints(pdf: string, totalPages: number): Promise<RebuildFingerprints> {
  const directory = await mkdtemp(resolve(tmpdir(), 'typ09c-fingerprint-'))
  try {
    const layoutFront = resolve(directory, 'layout-front.txt')
    const layoutBody = resolve(directory, 'layout-body.txt')
    const bboxFront = resolve(directory, 'bbox-front.html')
    const bboxBody = resolve(directory, 'bbox-body.html')
    const rasterPrefix = resolve(directory, 'page')

    // Page 2 is the live imprint/provenance page. Its revision string intentionally
    // follows the checked-out commit (including GitHub's synthetic PR merge SHA), so
    // it is structurally verified by verify-typography.ts but excluded from cross-run
    // rebuild-equivalence fingerprints.
    execFileSync('pdftotext', ['-f', '1', '-l', '1', '-layout', pdf, layoutFront], { cwd: repoRoot, stdio: 'ignore' })
    execFileSync('pdftotext', ['-f', '3', '-l', String(totalPages), '-layout', pdf, layoutBody], { cwd: repoRoot, stdio: 'ignore' })
    execFileSync('pdftotext', ['-f', '1', '-l', '1', '-bbox-layout', pdf, bboxFront], { cwd: repoRoot, stdio: 'ignore' })
    execFileSync('pdftotext', ['-f', '3', '-l', String(totalPages), '-bbox-layout', pdf, bboxBody], { cwd: repoRoot, stdio: 'ignore' })
    execFileSync('pdftoppm', ['-r', '36', '-gray', pdf, rasterPrefix], { cwd: repoRoot, stdio: 'ignore' })

    const layoutBytes = Buffer.concat([
      await readFile(layoutFront),
      Buffer.from('\n-- TYP-09C PROVENANCE PAGE 2 EXCLUDED --\n'),
      await readFile(layoutBody)
    ])
    const bboxBytes = Buffer.concat([
      await readFile(bboxFront),
      Buffer.from('\n<!-- TYP-09C PROVENANCE PAGE 2 EXCLUDED -->\n'),
      await readFile(bboxBody)
    ])

    const files = (await readdir(directory)).filter((name) => name.endsWith('.pgm')).sort()
    const pageHashes: string[] = []
    for (const [index, file] of files.entries()) {
      if (index + 1 === provenancePage) continue
      pageHashes.push(sha256(await readFile(resolve(directory, file))))
    }

    return {
      layoutTextSha256: sha256(layoutBytes),
      bboxLayoutSha256: sha256(bboxBytes),
      rasterPages: files.length,
      fingerprintedRasterPages: pageHashes.length,
      rasterPageSetSha256: sha256(`${pageHashes.join('\n')}\n`)
    }
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

const failures: string[] = []

if (
  candidate.schemaVersion !== 3 ||
  candidate.packet !== 'TYP-09C' ||
  candidate.candidate !== 'publication-typography-v1-rc1' ||
  candidate.identityState !== 'FROZEN_REBUILD_EQUIVALENCE'
) {
  failures.push('Release-candidate identity / rebuild-equivalence contract drifted.')
}
if (verification.result !== 'PASS') failures.push(`Production verification is ${verification.result}, not PASS.`)
if (candidate.identityModel?.provenancePageExcludedFromCrossRunFingerprints !== provenancePage) {
  failures.push('Release-candidate contract does not explicitly exclude provenance page 2 from cross-run fingerprints.')
}

for (const format of ['a4', 'b5'] as const) {
  const expected = candidate.productionObject?.[format]
  const actual = verification.formats?.[format]
  if (!expected || !actual) {
    failures.push(`Missing ${format.toUpperCase()} candidate or verification evidence.`)
    continue
  }
  if (actual.pages !== expected.pages) failures.push(`${format.toUpperCase()} page count drifted: ${actual.pages} != ${expected.pages}.`)
  if (actual.leaves !== expected.duplexLeaves) failures.push(`${format.toUpperCase()} duplex leaves drifted: ${actual.leaves} != ${expected.duplexLeaves}.`)
  if (actual.parserWarnings !== 0) failures.push(`${format.toUpperCase()} parser warnings are non-zero.`)
  if (actual.imprintPage !== provenancePage) failures.push(`${format.toUpperCase()} provenance page moved from page ${provenancePage}.`)

  const normalization = JSON.parse(
    await readFile(resolve(proofRoot, format, `publication-typography-production-${format}.destination-normalization.json`), 'utf8')
  ) as any
  if (normalization.packet !== 'TYP-09C' || normalization.schemaVersion !== 2) {
    failures.push(`${format.toUpperCase()} is not using the TYP-09C canonicalization contract.`)
  }
  if (normalization.deterministicByteIdempotence !== 'PASS' || normalization.deterministicIdPasses !== 2) {
    failures.push(`${format.toUpperCase()} qpdf canonicalization is not proven idempotent within the build.`)
  }
  if ((normalization.volatileInfoDatesRemoved?.creationDate ?? 0) < 1 || (normalization.volatileInfoDatesRemoved?.modificationDate ?? 0) < 1) {
    failures.push(`${format.toUpperCase()} volatile PDF CreationDate/ModDate metadata was not removed.`)
  }
  if (normalization.qpdfCheck !== 'PASS') failures.push(`${format.toUpperCase()} canonical PDF failed qpdf integrity proof.`)
  if (normalization.outputSha256 !== actual.pdfSha256) failures.push(`${format.toUpperCase()} canonicalization evidence hash does not match this exact finished PDF artifact.`)

  const pdf = resolve(proofRoot, format, `publication-typography-production-${format}.pdf`)
  const fingerprints = await rebuildFingerprints(pdf, expected.pages)
  if (fingerprints.layoutTextSha256 !== expected.layoutTextSha256) {
    failures.push(`${format.toUpperCase()} extracted text-layout fingerprint drifted: ${fingerprints.layoutTextSha256}.`)
  }
  if (fingerprints.bboxLayoutSha256 !== expected.bboxLayoutSha256) {
    failures.push(`${format.toUpperCase()} bounding-box layout fingerprint drifted: ${fingerprints.bboxLayoutSha256}.`)
  }
  if (fingerprints.rasterPages !== expected.pages) {
    failures.push(`${format.toUpperCase()} raster proof produced ${fingerprints.rasterPages} pages, expected ${expected.pages}.`)
  }
  if (fingerprints.fingerprintedRasterPages !== expected.pages - 1) {
    failures.push(`${format.toUpperCase()} fingerprinted ${fingerprints.fingerprintedRasterPages} raster pages, expected ${expected.pages - 1} after excluding provenance page 2.`)
  }
  if (fingerprints.rasterPageSetSha256 !== expected.raster36DpiGrayPageSetSha256) {
    failures.push(`${format.toUpperCase()} 36 dpi grayscale reader-page fingerprint drifted: ${fingerprints.rasterPageSetSha256}.`)
  }
}

const expectedFonts = [...candidate.productionObject.finishedFonts].sort()
for (const format of ['a4', 'b5'] as const) {
  const actualFonts = [...(verification.formats?.[format]?.finishedFonts ?? [])].sort()
  if (JSON.stringify(actualFonts) !== JSON.stringify(expectedFonts)) {
    failures.push(`${format.toUpperCase()} finished-font set drifted from RC1.`)
  }
}

if (!typ06.includes('Source Sans 3') || !typ06.includes('Regular / 400') || !typ06.includes('Bold / 700')) {
  failures.push('TYP-06 Source Sans interface authority is missing or materially altered.')
}
if (!typ06.includes('No Source Sans italic drawing role is admitted.')) {
  failures.push('TYP-06 drawing italic boundary is missing.')
}
if (!typ06.includes('PUBLICATION_DRAWING_TOKENS')) {
  failures.push('TYP-06 central drawing-token API boundary is missing.')
}

if (candidate.pltCompatibility?.status !== 'CONTRACT_COMPATIBLE_PRE_V2') {
  failures.push('PLT compatibility status is not the bounded pre-v2 contract state.')
}
if (!drawingTokens.includes("fontFamily: 'Arial, Helvetica, sans-serif'")) {
  failures.push('Historical drawing-publication-v1 token state changed; reassess the PLT/TYP join rather than silently accepting it.')
}
if (drawingTokens.includes('Source Sans 3')) {
  failures.push('Source Sans 3 has entered the historical central token before PLT v2 owns that migration; reassess authority.')
}

if (
  candidate.crossRunProof?.result !== 'REQUIRES_TWO_CI_REPLICAS' ||
  candidate.crossRunProof?.requiredIndependentReplicas !== 2 ||
  candidate.crossRunProof?.pagesPerReplica !== 613 ||
  candidate.crossRunProof?.fingerprintedPagesPerReplica !== 611
) {
  failures.push('Two-replica CI rebuild-equivalence contract is missing or incomplete.')
}
if (candidate.coldPdfReview?.result !== 'PASS') failures.push('Cold PDF review is not recorded PASS.')
if (candidate.physicalOwnerVerdict !== 'REQUIRED_IN_TYP_09D') failures.push('TYP-09C must not invent the final physical owner verdict.')

if (failures.length) {
  throw new Error(`TYP-09C release-candidate verification failed:\n- ${failures.join('\n- ')}`)
}

console.log(
  `TYP-09C RC1 replica PASS: A4 ${candidate.productionObject.a4.pages} pages; ` +
  `B5 ${candidate.productionObject.b5.pages} pages; reader-page text/bbox/raster fingerprints preserved with live provenance page 2 excluded; ` +
  'TYP-06→PLT contract compatible; final physical owner verdict remains TYP-09D.'
)
