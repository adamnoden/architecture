import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { contrastPlan, drawContrastPlan } from '../../../compiler/architectural-drawing/contrast-fixture.js'
import { createReferenceHouseAdePlanScene } from '../../../compiler/reference-house/ade-plan-scene.js'
import { architecturalPlanEntities } from '../../../compiler/architectural-drawing/model.js'
import { compileOpeningUncertaintyInstruction } from '../../../compiler/architectural-drawing/opening-uncertainty.js'
import { renderDrawingSceneV2SvgWithTokens } from '../../../compiler/publication-drawing-v2/svg.js'
import { createReferenceHouseAdePlan } from '../../../compiler/reference-house/ade-plan.js'
import { compileReferenceHouse } from '../../../compiler/reference-house/compile.js'
import { createReferenceHouseSource } from '../../../compiler/reference-house/fixture.js'
import { createPlt03CurrentGroundPlanScene } from '../../../compiler/reference-house/plt03-ground-plan.js'
import { createGroundFloorPublicationPlanScene } from '../../../compiler/reference-house/publication-ground-plan.js'
import { createGroundFloorPublicationPlanSource } from '../../../compiler/reference-house/publication-plan-source.js'
import { renderDrawingSceneSvg } from '../../../compiler/publication-drawing/svg.js'
import { fetchOpenFontCandidate } from '../typ03/open-fonts.js'
import { ADE03B_PROOF_TOKENS } from '../ade03b/tokens.js'

const root = resolve(import.meta.dirname, '.work')
await mkdir(root, { recursive: true })
const source = createReferenceHouseSource()
const result = compileReferenceHouse(source)
const hash = (s: string | Buffer) => createHash('sha256').update(s).digest('hex')
const protectedV1 = await readFile(resolve(import.meta.dirname, '../../../docs/reference-house/publication-ground-floor-plan.svg'), 'utf8')
const regeneratedV1 = renderDrawingSceneSvg(createGroundFloorPublicationPlanScene(result, createGroundFloorPublicationPlanSource()))
if (protectedV1 !== regeneratedV1) throw new Error('Protected v1 baseline no longer regenerates byte-for-byte.')
const failedControl = createPlt03CurrentGroundPlanScene(result, source)
await writeFile(resolve(root, 'protected-v1.svg'), protectedV1)
await writeFile(resolve(root, 'failed-direct-primitives.svg'), renderDrawingSceneSvg(failedControl))
const manifest: Record<string, unknown> = { packet: 'ADE-07', fitScaling: false, ownerPhysicalVerdict: 'UNREVIEWED', printTokensFrozen: false,
  represented: { envelopeMm: 417.5, cavityMm: 160, partitionMm: 125, constructionSpecification: false },
  comparisons: { protectedV1: { release: 'drawing-publication-v1', sha256: hash(protectedV1), byteIdentical: true }, failedDirectPrimitiveControl: hash(renderDrawingSceneSvg(createPlt03CurrentGroundPlanScene(result, source))) } }
const fontEnv = await fetchOpenFontCandidate('source')
const fontCss = (await Promise.all(([['TYP03_SANS_REGULAR', 400], ['TYP03_SANS_BOLD', 700]] as const).map(async ([slot, weight]) => {
  const bytes = await readFile(fontEnv[slot])
  return `@font-face{font-family:Source Sans 3;src:url(data:font/ttf;base64,${bytes.toString('base64')}) format('truetype');font-weight:${weight};font-style:normal}`
}))).join('')
manifest.fonts = await Promise.all(['TYP03_SANS_REGULAR', 'TYP03_SANS_BOLD'].map(async (s) => ({ slot: s, sha256: hash(await readFile(fontEnv[s as keyof typeof fontEnv])) })))
const files: Record<string, unknown> = {}
for (const level of ['GROUND', 'FIRST'] as const) {
  const plan = createReferenceHouseAdePlan(result, source, level)
  await writeFile(resolve(root, `${level.toLowerCase()}-semantics.json`), JSON.stringify(plan, null, 2) + '\n')
  for (const scale of [100, 50] as const) {
    const scene = createReferenceHouseAdePlanScene(result, source, level, scale)
    const { widthMm, heightMm } = scene
    const svg = renderDrawingSceneV2SvgWithTokens(scene, ADE03B_PROOF_TOKENS).replace('</style>', `${fontCss}</style>`)
    const name = `${level.toLowerCase()}-${scale}.svg`
    await writeFile(resolve(root, name), svg)
    await writeFile(resolve(root, `${level.toLowerCase()}-${scale}-scene.json`), JSON.stringify(scene, null, 2) + '\n')
    files[name] = { sha256: hash(svg), widthMm, heightMm, scale, entities: scene.primitives.length }
  }
  manifest[level] = { semanticEntities: architecturalPlanEntities(plan).length,
    states: plan.openings.map((o) => compileOpeningUncertaintyInstruction(plan, o.id)),
    ledger: architecturalPlanEntities(plan).map((e) => ({ id: e.id, kind: e.kind, class: 'S', authority: e.provenance.authority, precision: e.provenance.precision, reason: 'Mapped from current architectural source or deterministic representation convention', sources: e.provenance.sourceIds })), X: [] }
}
for (const scale of [100, 50]) {
  const scene = drawContrastPlan(contrastPlan(), scale)
  const svg = renderDrawingSceneV2SvgWithTokens(scene, ADE03B_PROOF_TOKENS).replace('</style>', `${fontCss}</style>`)
  const name = `contrast-${scale}.svg`
  await writeFile(resolve(root, name), svg)
  files[name] = { sha256: hash(svg), widthMm: scene.widthMm, heightMm: scene.heightMm, scale, entities: scene.primitives.length }
}
manifest.controlLedger = failedControl.primitives.map((p) => {
  const family = p.id.replace(/^plt03-/, '').split('-')[0]
  const reasons: Record<string, string> = {
    wall: 'S: replace independent rectangles/lines with joined physical assemblies; partition authority now owned by ADE-05A',
    boundary: 'S: replace planning-boundary strokes with source-owned physical partition intent',
    partition: 'S: replace unresolved datum with source-owned physical partition intent',
    opening: 'S: replace white cuts/dashed pseudo-jambs with topology subtraction and external uncertainty',
    qualitative: 'S: replace dashed host trace with explicit host possibility band',
    adjacency: 'S: retain complete shared-edge obligation as offset bracket; select no door',
    label: 'R: retain room/court content; position and abbreviated labels follow the paper profile',
    stair: 'R: retain rise/going topology annotation without invented stair-plan geometry',
    dim: 'R: composed dimensions retain source values; rotate vertical labels',
    north: 'R: retain north convention in paper notation',
    front: 'R: retain authored bay axes as paper reference markers',
    scale: 'R: retain 3 m scale bar with fixed-paper ticks'
  }
  const reason = reasons[family]
  if (!reason) throw new Error(`Unexplained legacy control entity ${p.id}`)
  return { id: p.id, class: reason[0], reason: reason.slice(3) }
})
manifest.X = []
manifest.files = files
await writeFile(resolve(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log('Prepared ADE Reference House ground/first-floor BOOK 1:100 and A2 WALL 1:50 candidates.')
