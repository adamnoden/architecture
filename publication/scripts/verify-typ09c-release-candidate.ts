import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '../..')
const candidate = JSON.parse(
  await readFile(resolve(repoRoot, 'publication/release-candidates/typ09c.json'), 'utf8')
) as any
const verification = JSON.parse(
  await readFile(resolve(repoRoot, 'publication/.proof/typ09b/verification.json'), 'utf8')
) as any
const typ06 = await readFile(
  resolve(repoRoot, 'docs/publication/publication-typography-typ06c-sans-drawing-interface-freeze.md'),
  'utf8'
)
const drawingTokens = await readFile(
  resolve(repoRoot, 'compiler/publication-drawing/tokens.ts'),
  'utf8'
)

const failures: string[] = []

if (candidate.packet !== 'TYP-09C' || candidate.candidate !== 'publication-typography-v1-rc1') {
  failures.push('Release-candidate identity drifted.')
}
if (verification.result !== 'PASS') failures.push(`Production verification is ${verification.result}, not PASS.`)

for (const format of ['a4', 'b5'] as const) {
  const expected = candidate.exactProductionObject?.[format]
  const actual = verification.formats?.[format]
  if (!expected || !actual) {
    failures.push(`Missing ${format.toUpperCase()} candidate or verification evidence.`)
    continue
  }
  if (actual.pages !== expected.pages) failures.push(`${format.toUpperCase()} page count drifted: ${actual.pages} != ${expected.pages}.`)
  if (actual.leaves !== expected.duplexLeaves) failures.push(`${format.toUpperCase()} duplex leaves drifted: ${actual.leaves} != ${expected.duplexLeaves}.`)
  if (actual.pdfSha256 !== expected.sha256) failures.push(`${format.toUpperCase()} PDF bytes drifted from RC1.`)
  if (actual.parserWarnings !== 0) failures.push(`${format.toUpperCase()} parser warnings are non-zero.`)
}

const expectedFonts = [...candidate.exactProductionObject.finishedFonts].sort()
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

if (candidate.coldPdfReview?.result !== 'PASS') failures.push('Cold PDF review is not recorded PASS.')
if (candidate.physicalOwnerVerdict !== 'REQUIRED_IN_TYP_09D') failures.push('TYP-09C must not invent the final physical owner verdict.')

if (failures.length) {
  throw new Error(`TYP-09C release-candidate verification failed:\n- ${failures.join('\n- ')}`)
}

console.log(
  `TYP-09C RC1 PASS: A4 ${candidate.exactProductionObject.a4.pages} pages; ` +
  `B5 ${candidate.exactProductionObject.b5.pages} pages; exact PDF hashes preserved; ` +
  'TYP-06→PLT contract compatible; final physical owner verdict remains TYP-09D.'
)
