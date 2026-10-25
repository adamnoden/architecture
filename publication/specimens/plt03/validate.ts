import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = import.meta.dirname
const repoRoot = resolve(root, '../../..')
const workRoot = resolve(root, '.work')
const canonicalPath = resolve(repoRoot, 'docs/reference-house/publication-ground-floor-plan.svg')

const sha256 = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex')
const protectedBaselineSha256 = '91eec9c3dd32e3a2154cf42c9d8db8525efeb92677289ca78056e0b1aa9c25ba'
const expectedFonts = {
  TYP03_SANS_REGULAR: '4644c81b86ec9caaa76b634889968ed3c4f4f52f054855933acc7c2b21e53b0f',
  TYP03_SANS_BOLD: '9214b9d95e4231c609802815c2646c98174e2102d0d37f88978a7f8e71006e6a'
} as const

const [canonical, baseline, hierarchy, articulation, combined, manifestText] = await Promise.all([
  readFile(canonicalPath, 'utf8'),
  readFile(resolve(workRoot, 'baseline.svg'), 'utf8'),
  readFile(resolve(workRoot, 'hierarchy.svg'), 'utf8'),
  readFile(resolve(workRoot, 'articulation.svg'), 'utf8'),
  readFile(resolve(workRoot, 'combined.svg'), 'utf8'),
  readFile(resolve(workRoot, 'manifest.json'), 'utf8')
])

const manifest = JSON.parse(manifestText) as {
  baseline: { sha256: string; regeneratedByteIdentical: boolean }
  candidates: Record<string, { sha256: string; currentAuthority: boolean }>
  currentAuthorityChecks: Record<string, unknown>
  semanticDiff: Record<string, { classes: string[]; unexplained: unknown[] }>
  candidateTokens: { status: string }
  fontFingerprints: Record<string, { sha256: string }>
}

if (canonical !== baseline) throw new Error('PLT-03A baseline artifact is not byte-identical to the protected canonical SVG.')
if (sha256(canonical) !== protectedBaselineSha256) {
  throw new Error(`PLT-03A protected baseline drifted: ${sha256(canonical)}.`)
}
if (!manifest.baseline.regeneratedByteIdentical || manifest.baseline.sha256 !== protectedBaselineSha256) {
  throw new Error('PLT-03A manifest does not preserve the protected v1 baseline identity.')
}

for (const [name, svg] of Object.entries({ hierarchy, articulation, combined })) {
  if (!svg.includes('font-family:"PLT03 Source Sans"')) {
    throw new Error(`PLT-03A ${name} does not consume the frozen Source Sans specimen family.`)
  }
  if ((svg.match(/@font-face\{/g) ?? []).length !== 2) {
    throw new Error(`PLT-03A ${name} must embed exactly Regular and Bold Source Sans faces.`)
  }
  if (manifest.candidates[name]?.sha256 !== sha256(svg)) {
    throw new Error(`PLT-03A ${name} fingerprint does not match the manifest.`)
  }
}

for (const [envName, expected] of Object.entries(expectedFonts)) {
  const actual = manifest.fontFingerprints[envName]?.sha256
  if (actual !== expected) throw new Error(`PLT-03A ${envName} font bytes drifted: ${actual ?? '(missing)'}.`)
}

if (!hierarchy.includes('data-representation="light-poche"')) {
  throw new Error('PLT-03A hierarchy candidate did not apply the isolated light-poche treatment.')
}
if (!combined.includes('data-representation="light-poche"')) {
  throw new Error('PLT-03A combined candidate did not apply the isolated light-poche treatment.')
}
if (articulation.includes('data-representation="light-poche"')) {
  throw new Error('PLT-03A articulation candidate accidentally includes the hierarchy poche treatment.')
}

const forbiddenCurrentAuthorityFragments = [
  'DRW03B-',
  'G-STAIR-PUB-01',
  'G-INT-DRAW-FAM-01',
  'G-INT-DRAW-HALL-01',
  'G-INT-HALL-GAL-01',
  'G-INT-STUDY-GAL-01',
  'G-INT-SVC-GAL-01',
  'G-INT-FAM-GARDEN-01',
  'G-INT-GARDEN-KIT-01',
  '-PUB-01',
  '-PUB-02',
  'stair-flight-trace',
  'stair-reservation',
  'frame-G-'
]

for (const [name, svg] of Object.entries({ articulation, combined })) {
  if (!svg.includes('data-view-id="PLT03-CURRENT-GROUND-PLAN"')) {
    throw new Error(`PLT-03A ${name} is not rendered from the current-authority semantic scene.`)
  }
  if (svg.includes('data-authorityClass="C"') || svg.includes('data-diffClass="X"')) {
    throw new Error(`PLT-03A ${name} contains forbidden C/X authority metadata.`)
  }
  for (const fragment of forbiddenCurrentAuthorityFragments) {
    if (svg.includes(fragment)) {
      throw new Error(`PLT-03A ${name} leaked legacy publication-only geometry: ${fragment}.`)
    }
  }
  if (!svg.includes('data-geometry="shared-edge-obligation"')) {
    throw new Error(`PLT-03A ${name} does not expose current required-adjacency semantics.`)
  }
  if (!svg.includes('data-exactDoorPosition="false"')) {
    throw new Error(`PLT-03A ${name} does not explicitly deny exact internal door position.`)
  }
  if (!svg.includes('data-planGeometry="unresolved"')) {
    throw new Error(`PLT-03A ${name} does not preserve the unresolved stair-plan boundary.`)
  }
  if (!svg.includes('data-constructionClaim="false"')) {
    throw new Error(`PLT-03A ${name} does not bound the 400 mm wall representation as non-construction geometry.`)
  }
  if (!svg.includes('data-representation="extended-centre-occurrence-marker"')) {
    throw new Error(`PLT-03A ${name} does not keep unknown-width occurrence markers legible against poche.`)
  }
  if (!svg.includes('data-representation="offset-host-relationship-trace"')) {
    throw new Error(`PLT-03A ${name} does not keep qualitative host relationships visibly separate from poche.`)
  }
  if (!svg.includes('data-representation="rotated-for-narrow-gallery"') || !svg.includes('rotate(-90')) {
    throw new Error(`PLT-03A ${name} does not preserve the collision-free gallery label treatment.`)
  }
}

for (const [name, diff] of Object.entries(manifest.semanticDiff)) {
  if (diff.unexplained.length !== 0) throw new Error(`PLT-03A ${name} semantic diff contains unexplained X items.`)
  if (diff.classes.includes('X')) throw new Error(`PLT-03A ${name} semantic diff declares class X.`)
}

if (manifest.candidateTokens.status !== 'specimen-only-not-frozen') {
  throw new Error('PLT-03A candidate tokens were accidentally represented as frozen.')
}
if (manifest.currentAuthorityChecks.internalDoorGeometry !== 'absent') {
  throw new Error('PLT-03A current-authority manifest no longer excludes exact internal door geometry.')
}
if (manifest.currentAuthorityChecks.stairPlanPathOrWell !== 'absent') {
  throw new Error('PLT-03A current-authority manifest no longer excludes finished stair plan geometry.')
}

console.log('PLT-03A PASS — protected baseline, A/B authority boundary, Source Sans identity and R/S/X ledger are coherent.')
