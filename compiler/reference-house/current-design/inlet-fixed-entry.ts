import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { exactSegmentBoxDistance, finiteBends } from '../../../project/had/studies/incoming-water-geometry.mjs'
import { pathSeparation } from '../../../project/had/studies/service-interface-geometry.mjs'
import { reverseSleeveFlow, southInletReliefComparison } from '../../../project/had/studies/south-inlet-relief-hydraulics.mjs'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import { createSectionPaperProjection } from '../../publication-drawing/projection.js'
import type { DrawingSceneV2 } from '../../publication-drawing-v2/model.js'
import type { runInletFaultCase, readInletFaultCase } from './inlet-fault.js'
import type { runInletSillInsertCase } from './inlet-sill-insert.js'
import type { CurrentDesignResolution } from './resolve.js'

type Point = readonly [number, number, number]
type Box = readonly [number, number, number, number, number, number]
type Rect = readonly [number, number, number, number]
type Branch = 'utility' | 'plant'
type FaultCase = ReturnType<typeof readInletFaultCase>['fault']
export type FixedInletSources = {
  readonly insert: ReturnType<typeof runInletSillInsertCase>
  readonly fault: ReturnType<typeof runInletFaultCase>
  readonly faultCase: FaultCase
}
export type FixedInletSettings = {
  readonly riserYMm: number
  readonly plantSouthLegLevelMm: number
  readonly pipeBendRadiusMm: number
  readonly protectedLowerDiameterMm: number
  readonly outerCutYMm: number
  readonly lowerCutZMm: number
  readonly upperCutZMm: number
  readonly valveCentreZMm: number
  readonly wetGuardFrontYMm: number
  readonly pressureCeilingBar: number
  readonly cutterSweepRadiusMm: number
  readonly cutterHandRadiusMm: number
  readonly localPipeTemperatureRangeK: number
}
const ids = ['utility', 'plant'] as const
const root = 'project/had/studies/'
const portalPath = 'project/str/studies/floor-portal-interface-review.json'
const round = (value: number) => Number(value.toFixed(5))
const length = (a: Point, b: Point) => Math.hypot(...a.map((v, i) => v - b[i]))
const cross = (a: Point, b: Point): Point => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const fields = ['riserYMm', 'plantSouthLegLevelMm', 'pipeBendRadiusMm', 'protectedLowerDiameterMm',
  'outerCutYMm', 'lowerCutZMm', 'upperCutZMm', 'valveCentreZMm', 'wetGuardFrontYMm', 'pressureCeilingBar',
  'cutterSweepRadiusMm', 'cutterHandRadiusMm', 'localPipeTemperatureRangeK'] as const
export function readFixedInletSettings(): FixedInletSettings {
  return { riserYMm: 625, plantSouthLegLevelMm: 2585, pipeBendRadiusMm: 98, protectedLowerDiameterMm: 50,
    outerCutYMm: -300, lowerCutZMm: 1000, upperCutZMm: 1400, valveCentreZMm: 1200,
    wetGuardFrontYMm: 685, pressureCeilingBar: 9, cutterSweepRadiusMm: 100, cutterHandRadiusMm: 150,
    localPipeTemperatureRangeK: 40 }
}
export const fixedInletProductFacts = {
  pressurePipe: { outerDiameterMm: 28, minimumWallMm: 1.2, massKgM: .84, minimumBendFactor: 3.5,
    expansionMmMK: .0165, elasticModulusMpa: 200000,
    elasticModulusSource: 'https://www.thyssenkrupp-materials.co.uk/stainless-steel-316-14401.html/index.html',
    source: 'https://www.viega.co.uk/content/dam/viegadm/en/showpad-migration/uk/Sanpress%20Inox%20Instructions.pdf' },
  repairCoupling: { model: '2315.5', article: '436407', lengthMm: 96, minimumInsertionMm: 24,
    source: 'https://www.viega.co.uk/en/products/Catalogue/Piping-technology/Sanpress-Inox/Couplings/Sanpress-Inox-Slip-coupling-2315-5.html' },
  elbow: { model: '2316', article: '435660', portToVirtualCornerMm: 58, pipeEndToVirtualCornerMm: 34,
    nativeCad: { url: 'https://web-catalog.viega.com/CadData/4015211435660_STP3D.zip',
      stepSha256: '2813e42f16948f1ec1b5b390d5fc857d2a2d937452dfe390ea10823935c70b9e',
      boundsMm: [[-18.9,57.6],[-18.9,18.9],[-57.6,18.9]],
      sourceAxes: 'pressure axes +X and -Z; catalogue-rounded ports58 retained conservatively' },
    source: 'https://www.viega.co.uk/en/products/Catalogue/Piping-technology/Sanpress-Inox/Elbows/Sanpress-Inox-Elbow-90-2316.html' },
  valve: { model: '2375', article: '834487', pnBar: 16, catalogueLmm: 58, reservedAxialLengthMm: 116,
    stemToHandleOutsideMm: 91.3, handleHalfLengthMm: 51.2, lowerRadialDimensionMm: 22.25, spannerMm: 38,
    axialReservation: '2L conservative reservation; confirm full native CAD before fabrication',
    nativeCad: { url: 'https://web-catalog.viega.com/CadData/4015211834487_STP3D.zip',
      stepSha256: 'fbb0a2e6045a955f987cd2e1b05174d75be7570010a0841300a6492ff7fa1634',
      boundsMm: [[-57.45,57.45],[-22.25,22.25],[-22.25,91.29968]],
      sourceAxes: 'pipe X; stem +Z. Open bar turns about stem; full closed-control sweep remains separately reserved.',
      staticBoss: 'external CAD combines parts and does not identify a stationary metal wet-neck landing' },
    source: 'https://www.viega.co.uk/en/products/Catalogue/Valves/Easytop-system-valves/Stainless-steel-ball-valves/Easytop-Inox-Ball-valve-2375.html',
    instructions: 'https://pspstmsimanuals.blob.core.windows.net/pub-production/Manuals/9416f7b24ad34881ac114094160dd790_en_GB.pdf' },
  cutter: { model: 'Knipex TubiX S 90 31 01', sizeMm: [77, 55, 26], tubeRangeMm: [3, 30], maximumTubeWallMm: 2,
    source: 'https://www.knipex.com/products/pipe-cutter/pipe-cutters-for-metal-pipes/pipe-cutters-metal-pipes/903101',
    minimumTurningRadiusMm: 39.6875,
    radiusSource: 'https://web-assets.knipex.com/sites/default/files/2024-11/TubiX%20S%20Datasheet.pdf',
    turningDatum: 'Maker illustration labels minimal cutting radius1 9/16in;39.5mm FAQ applies15–28mm pipe with optimum knob. R100/R150 are larger authored working screens, not manufacturer hand dimensions.' },
  pressTool: { model: 'Pressgun Picco 6 Plus', machineWith3AhMm: [320, 100, 72], wallHeadRequirementsMm: [30, 80, 40],
    minimumAxialWallDistanceMm: 35, minimumAdjacentConnectorGapMm: 0,
    source: 'https://web-catalog.viega.com/fr_FR/html/Montage/Systemes-de-tuyauterie/Outils-de-sertissage/f6cc427612594248ac1140945c5f922a_3_fr_FR/pdf/ga_pressgun-picco-6-plus_3_en_--.pdf',
    systemInstructions: 'https://pspstmsimanuals.blob.core.windows.net/pub-production/Manuals/e951f22969c331bbac11409464b375ca_en_GB.pdf' },
  deburrer: { model: '2292.2', article: '343019', rangeMm: [12, 54], dimensions: 'not-established',
    source: 'https://www.viega.co.uk/en/products/Catalogue/Piping-technology/System-press-tools/Tools-for-pipe-preparation/Deburrers/Deburrer-2292-2.html' },
} as const

function source<T>(resolved: CurrentDesignResolution, path: string, identities: Record<string, string>): T {
  const bytes = readFileSync(new URL('../../../' + path, import.meta.url))
  const blob = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex')
  const expected = resolved.disciplineBindings.flatMap(binding => binding.identities[path] ? [binding.identities[path]] : [])
  if (!expected.length || expected.some(value => value !== blob)) throw new Error('Stale fixed-inlet source: ' + path)
  identities[path] = blob
  return JSON.parse(bytes.toString('utf8'))
}
function admit(input: unknown): FixedInletSettings {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length !== fields.length
      || fields.some(key => !Object.hasOwn(input, key))) throw new Error('Expected complete authored fixed-inlet settings; evidence cannot be injected')
  const s = input as FixedInletSettings
  if (fields.some(key => !Number.isFinite(s[key])) || s.riserYMm < 550 || s.riserYMm > 700 || s.pipeBendRadiusMm < 50 || s.pipeBendRadiusMm > 150
      || s.protectedLowerDiameterMm < 28 || s.protectedLowerDiameterMm > 74 || s.outerCutYMm >= -140 || s.outerCutYMm < -600
      || s.lowerCutZMm < 850 || s.upperCutZMm > 1700
      || s.lowerCutZMm >= s.valveCentreZMm || s.upperCutZMm <= s.valveCentreZMm || s.pressureCeilingBar <= 0 || s.pressureCeilingBar > 16
      || s.wetGuardFrontYMm < s.riserYMm || s.wetGuardFrontYMm > 740 || s.cutterSweepRadiusMm <= 0 || s.cutterHandRadiusMm < s.cutterSweepRadiusMm
      || s.cutterHandRadiusMm > 200 || s.localPipeTemperatureRangeK < 0 || s.localPipeTemperatureRangeK > 80) throw new Error('Fixed-inlet settings exceed the bounded development case')
  return s
}
function drawing(branches: readonly { branch: Branch; drawingPressurePathMm: readonly Point[]; components: readonly { id: string; boxMm: Box }[] }[], digest: string): DrawingSceneV2 {
  const projection = createSectionPaperProjection({ scaleDenominator: 20, horizontalBounds: { min: 9900, max: 11600 },
    verticalBounds: { min: 0, max: 2850 }, paperOrigin: { x: 12, y: 25 } })
  const primitives: DrawingSceneV2['primitives'] = [
    { kind: 'text', id: 'fixed-title', x: 12, y: 9, role: 'label', value: 'Fixed south entry · conditional proposal' },
    { kind: 'text', id: 'fixed-key', x: 12, y: 16, role: 'note', value: 'Real factory elbows; R98 bent pipe; zero pressure before cold renewal' },
  ]
  for (const branch of branches) {
    for (const [i, end] of branch.drawingPressurePathMm.slice(1).entries()) {
      const start = branch.drawingPressurePathMm[i]
      primitives.push({ kind: 'line', id: branch.branch + '-pipe-' + i, role: 'primary',
        dash: branch.branch === 'plant' ? 'provisional' : 'none', a: projection.point(start[0], start[2]), b: projection.point(end[0], end[2]),
        metadata: { caseDigest: digest, fromYMm: start[1], toYMm: end[1] } })
    }
    for (const part of branch.components) {
      const [x, , z, width, , height] = part.boxMm
      const p = [[x, z], [x + width, z], [x + width, z + height], [x, z + height], [x, z]]
      for (let i = 1; i < p.length; i++) primitives.push({ kind: 'line', id: branch.branch + '-' + part.id + '-' + i, role: 'secondary',
        a: projection.point(p[i - 1][0], p[i - 1][1]), b: projection.point(p[i][0], p[i][1]), metadata: { caseDigest: digest, part: part.id, boxMm: part.boxMm.join(',') } })
    }
    primitives.push({ kind: 'text', id: branch.branch + '-axis-label', x: branch.branch === 'utility' ? 12 : 33, y: 172,
      role: 'note', value: (branch.branch === 'utility' ? 'U' : 'P') + ' · X' + branch.drawingPressurePathMm[0][0] })
  }
  return { viewId: 'HAD-FIXED-INLET-ELEVATION', sourceId: 'fixed-south-entry', scaleDenominator: 20,
    title: 'Fixed incoming-water entry and cold-renewal zones', description: 'X/Z projection of actual tube paths and reserved components. Exact three-dimensional coordinates, setting allowances and unresolved evidence accompany the result.',
    widthMm: 110, heightMm: 180, primitives }
}

function renewalDrawing(branches: readonly { branch: Branch; pressurePathMm: readonly Point[];
  renewal: { translationMm: number[]; toWasherFirstRestAfter10Mm: number }; factoryElbow: { virtualCornerMm: Point } }[],
  washerFirstRest: Rect, lowerCut: number, digest: string): DrawingSceneV2 {
  const primitives: DrawingSceneV2['primitives'] = [
    {kind:'text',id:'renewal-title',x:10,y:9,role:'label',value:'Light pipe renewal · zero pressure · conditional working reservation'},
    {kind:'text',id:'renewal-key',x:10,y:16,role:'note',value:'Solid installed; dashed tip clear. Wet floors/reliefs stay. Roof plates, guard and jacket open.'},
  ]
  for (const [index,branch] of branches.entries()) {
    const originX=10+index*137
    const project=createSectionPaperProjection({scaleDenominator:20,horizontalBounds:{min:-500,max:2100},verticalBounds:{min:0,max:1600},paperOrigin:{x:originX,y:25}})
    const [,y,z]=branch.pressurePathMm[0],riserY=branch.factoryElbow.virtualCornerMm[1]
    const points:readonly (readonly [number,number])[]=[[y,z],[riserY,z],[riserY,lowerCut]]
    for (const [phase,dy] of [0,branch.renewal.translationMm[1]].entries()) for(let i=1;i<points.length;i++) primitives.push({
      kind:'line',id:branch.branch+'-renewal-'+phase+'-'+i,role:'primary',dash:phase?'provisional':'none',
      a:project.point(points[i-1][0]+dy,points[i-1][1]),b:project.point(points[i][0]+dy,points[i][1]),
      metadata:{caseDigest:digest,phase,translationYMm:dy,pipeIsolated:true},
    })
    const body=[[washerFirstRest[1],0],[washerFirstRest[1]+washerFirstRest[3],0],[washerFirstRest[1]+washerFirstRest[3],848],[washerFirstRest[1],848],[washerFirstRest[1],0]]
    for(let i=1;i<body.length;i++)primitives.push({kind:'line',id:branch.branch+'-washer-rest-'+i,role:'secondary',
      a:project.point(body[i-1][0],body[i-1][1]),b:project.point(body[i][0],body[i][1]),metadata:{caseDigest:digest,body:'existing-restrained-washer-first-rest'}})
    const finishedY=branch.pressurePathMm[2][1]
    primitives.push({kind:'line',id:branch.branch+'-finished-wall',role:'secondary',a:project.point(finishedY,0),b:project.point(finishedY,1600)})
    primitives.push({kind:'text',id:branch.branch+'-renewal-name',x:originX,y:22,role:'label',value:branch.branch+' · Y/Z 1:20'})
    primitives.push({kind:'text',id:branch.branch+'-renewal-travel',x:originX,y:113,role:'note',value:'Travel '+branch.renewal.translationMm[1]+'; washer reserve '+branch.renewal.toWasherFirstRestAfter10Mm+' after10'})
  }
  return {viewId:'HAD-FIXED-INLET-RENEWAL',sourceId:'fixed-south-entry',scaleDenominator:20,title:'Cold renewal of the light fixed entry pipe',
    description:'Y/Z working-motion reservation. Tube centreline is schematic through the bounded factory elbow; source-bound full assembly and setting checks accompany this view. No loaded carrier or in-situ lower pressing.',
    widthMm:284,heightMm:120,primitives}
}

export function compileFixedInletCandidate(resolved: CurrentDesignResolution, input: unknown, joined: FixedInletSources) {
  const s = admit(input), identities: Record<string, string> = {}
  if (!joined.insert || !joined.fault || !joined.faultCase || joined.fault.source.insertCaseDigest !== joined.insert.source.caseDigest
      || joined.fault.source.caseDigest !== sha256SemanticFingerprint(joined.faultCase)) throw new Error('Fixed entry requires same-document insert and exact authored fault case')
  const under = source<{ branches: { id: Branch; coordinates: Point[] }[] }>(resolved, root + 'south-inlet-under-sill.json', identities)
  const cells = source<{ branches: { id: Branch; case: { plan: readonly (readonly [number, number])[]; permanentLowerTroughLipZ: number; roofZ: number } }[] }>(resolved, root + 'south-inlet-wet-box.json', identities)
  const relief = source<{ throughWallRupture: { preferredWideBore: { cleanBoreMM: number; bedObstructionMM: number; entranceLossK: number } }; hydraulics: { spareAirMM: number } }>(resolved, root + 'south-inlet-relief.json', identities)
  const { utility } = source<{ utility: { washer: Rect; washerFirstRest: Rect; PVworkingField: Rect; PVinverter: Rect; PVinverterLocalZ: readonly number[] } }>(resolved, root + 'current-house-services.json', identities)
  const hot = source<{ hot: { backbone: Point[]; terminal: Point[] } }>(resolved, root + 'utility-wide-capture.json', identities)
  const bowl = source<{ capture: { clearSweeps: { stage: number; box: Box }[] } }>(resolved, root + 'utility-dry-bowl-release.json', identities)
  const portal = source<{ geometry: { jambQmm: readonly number[]; jambNormalAlongMM: readonly number[]; occurrences: { face: string; opening: string; jambAxisPmm: number }[] } }>(resolved, portalPath, identities)
  const axes = portal.geometry.occurrences.filter(row => row.face === 'outer-south' && row.opening === 'south-window-4').map(row => row.jambAxisPmm)
  if (axes.length !== 2) throw new Error('Fixed entry requires the actual paired south RC jambs')
  const receiverXMm = Math.max(...axes), receiverYMm = Math.max(...portal.geometry.jambQmm)
  const tube = fixedInletProductFacts.pressurePipe, coupling = fixedInletProductFacts.repairCoupling, elbow = fixedInletProductFacts.elbow, valve = fixedInletProductFacts.valve
  const washer: Box = [utility.washer[0], utility.washer[1], 0, utility.washer[2], utility.washer[3], 848]
  const pv: Box = [utility.PVworkingField[0], utility.PVworkingField[1], 0, utility.PVworkingField[2], utility.PVworkingField[3], 2800]
  const hotPaths = [finiteBends(hot.hot.backbone, 75), finiteBends(hot.hot.terminal, 25)]
  const upperPaths = {} as Record<Branch, ReturnType<typeof finiteBends>>
  const geometryBlockers: string[] = []
  const branches = ids.map(branch => {
    const native = under.branches.find(row => row.id === branch)!, cell = cells.branches.find(row => row.id === branch)!
    const bore = joined.insert.calculation.bores.find(row => row.id === branch + '-pressure')!
    const fault = joined.fault.branchCases.find(row => row.id === branch)!, trial = joined.faultCase.branches[branch]
    if (!native || !cell || !bore || !fault || !trial) throw new Error('Incomplete fixed-entry branch: ' + branch)
    const [outer, inner] = bore.axis, x = inner[0], z = native.coordinates[1][2]
    const levelOuter: Point = [x, outer[1], z], levelInner: Point = [x, inner[1], z]
    const factoryCorner: Point = [x, s.riserYMm, z]
    const factoryPorts: readonly Point[] = [[x, s.riserYMm - elbow.portToVirtualCornerMm, z], [x, s.riserYMm, z + elbow.portToVirtualCornerMm]]
    const upper = native.coordinates.slice(3).map(([u, v, w], index): Point => [u, index <= 1 ? s.riserYMm : v,
      branch === 'plant' && index <= 2 ? s.plantSouthLegLevelMm : w])
    const upperPath = finiteBends([factoryPorts[1], ...upper], s.pipeBendRadiusMm)
    upperPaths[branch] = upperPath
    const pressurePath: Point[] = [[x, s.outerCutYMm, z], levelOuter, levelInner, factoryPorts[0], factoryCorner, factoryPorts[1], ...upper]
    const outerOffset = z - outer[2], innerOffset = z - inner[2]
    const radialReserve = relief.throughWallRupture.preferredWideBore.cleanBoreMM / 2 - s.protectedLowerDiameterMm / 2 - Math.max(Math.abs(outerOffset), Math.abs(innerOffset)) - 5
    const reversed = reverseSleeveFlow({ flowM3s: trial.flowLmin / 60000, diameterM: relief.throughWallRupture.preferredWideBore.cleanBoreMM / 1000,
      bedM: relief.throughWallRupture.preferredWideBore.bedObstructionMM / 1000, carrierM: s.protectedLowerDiameterMm / 1000,
      carrierRiseM: Math.min(outerOffset, innerOffset) / 1000, lengthM: (inner[1] - outer[1]) / 1000,
      riseM: (inner[2] - outer[2]) / 1000, roughness: southInletReliefComparison.roughness,
      entranceLossK: relief.throughWallRupture.preferredWideBore.entranceLossK, spareAirMM: relief.hydraulics.spareAirMM })
    const upperGuardTop=s.upperCutZMm+100+coupling.lengthMm/2+50
    const upperGuard: Box = [x - 40, s.riserYMm - 35, cell.case.roofZ, 80, s.wetGuardFrontYMm - s.riserYMm + 35, upperGuardTop - cell.case.roofZ]
    const elbowBox: Box = [x - 25, factoryPorts[0][1], z - 25, 50, elbow.portToVirtualCornerMm + 25, elbow.portToVirtualCornerMm + 25]
    const lowerFloor = fault.geometry.lowerInvertZMm - 3
    const lowerBore = joined.insert.calculation.bores.find(row => row.id === branch + '-relief')!
    const lowerClearRadius = lowerBore.axis[1][2] - fault.geometry.lowerInvertZMm
    const postBox: Box = [x + 60, 580, lowerFloor, 10, 40, z - lowerFloor]
    const components = [{ id: 'factory90-elbow-bound', boxMm: elbowBox },
      { id: 'fixed-upper-wet-guard', boxMm: upperGuard }, { id: 'fixed-plain-metal-post', boxMm: postBox }, { id: 'fixed-potable-valve-reservation',
        boxMm: [x - 22.25, s.riserYMm - 22.25, s.valveCentreZMm - valve.reservedAxialLengthMm / 2, 44.5, 44.5, valve.reservedAxialLengthMm] as Box },
      { id: 'initial-lower-splice', boxMm: [x - 25, s.riserYMm - 25, s.lowerCutZMm + 80 - coupling.lengthMm/2, 50, 50, coupling.lengthMm] as Box },
      { id: 'initial-upper-splice', boxMm: [x - 25, s.riserYMm - 25, s.upperCutZMm - 80 - coupling.lengthMm/2, 50, 50, coupling.lengthMm] as Box },
      { id: 'initial-exterior-splice', boxMm: [x - 25, s.outerCutYMm - 100 - coupling.lengthMm/2, z - 25, 50, coupling.lengthMm, 50] as Box }]
    const travel = inner[1] + 10 - s.outerCutYMm
    const lowerModuleStockLength = s.riserYMm - elbow.pipeEndToVirtualCornerMm - s.outerCutYMm + s.lowerCutZMm - z - elbow.pipeEndToVirtualCornerMm
    const renewal = { strategy: 'bench-prepressed-light-pipe-module' as const,
      firstPlainPipeCutsMm: [[x, s.outerCutYMm, z], [x, s.riserYMm, s.lowerCutZMm]],
      inSituLowJointRequired: false, inSituLowerElbowPressingRequired: false,
      pipeStockLengthMm: round(lowerModuleStockLength), barePipeStockMassKg: round(lowerModuleStockLength / 1000 * tube.massKgM),
      completeModuleMassKg: null,
      massLimit: 'factory elbow, clamps and remaining jacket mass require actual takeoff; bare stock is not gross mass',
      translationMm: [0, round(travel), 0], maximumRiserYMm: round(s.riserYMm + travel),
      temporaryMaximumRadiusMm: 25, removableJacketStripped: true,
      toWasherFirstRestAfter10Mm: round(utility.washerFirstRest[1] - s.riserYMm - travel - 25 - 10),
      abovePermanentTroughLipAfter10Mm: round(z - 25 - cell.case.permanentLowerTroughLipZ - 10),
      passageThroughSleeveAfter5Mm: round(relief.throughWallRupture.preferredWideBore.cleanBoreMM / 2 - 25 - Math.max(Math.abs(outerOffset), Math.abs(innerOffset)) - 5),
      pressureState: 'isolated-drained-zero-pressure', lowerTroughsAndReliefsRemainFixed: true,
      surfacesRemoved: ['light roof plates', 'upper service guard', 'renewable static neck and thermal jacket', 'opened pipe clamps'],
      neitherLoadedCarrierNorReusedPressJoint: true }
    const repairZones = [s.lowerCutZMm, s.upperCutZMm].map((cut, index) => ({ id: index ? 'upper-cut' : 'lower-cut', cutZMm: cut,
      madeBodyZMm: [cut - coupling.lengthMm / 2, cut + coupling.lengthMm / 2],
      parkedBodyZMm: index ? [cut, cut + coupling.lengthMm] : [cut - coupling.lengthMm, cut],
      insertionEachSideMm: coupling.lengthMm / 2, minimumInsertionMm: coupling.minimumInsertionMm,
      firstInstallationCouplingCentreZMm: index ? s.upperCutZMm - 80 : s.lowerCutZMm + 80,
      cutToInitialBodyAfter5Mm: 80 - coupling.lengthMm / 2 - 5,
      secondPlainPipeCutZMm: index ? cut + 100 : cut - 100,
      secondCutToFirstRepairBodyAfter5Mm: 100 - coupling.lengthMm / 2 - 5,
      initialBodyToValveMm: round(index ? cut - 80 - coupling.lengthMm/2 - s.valveCentreZMm - valve.reservedAxialLengthMm/2 :
        s.valveCentreZMm - valve.reservedAxialLengthMm/2 - cut - 80 - coupling.lengthMm/2),
      toValveBodyMm: round(index ? cut - coupling.lengthMm / 2 - s.valveCentreZMm - valve.reservedAxialLengthMm / 2 :
        s.valveCentreZMm - valve.reservedAxialLengthMm / 2 - cut - coupling.lengthMm / 2) }))
    const grip: Point = [x - valve.stemToHandleOutsideMm, s.riserYMm, s.valveCentreZMm]
    const exteriorPressReserves=[s.outerCutYMm,s.outerCutYMm+100].map(cut=>round(outer[1]-cut-coupling.lengthMm/2-fixedInletProductFacts.pressTool.minimumAxialWallDistanceMm-5))
    const shoulder: Point = [9766, 950, 1250]
    const pressureArea = Math.PI * ((tube.outerDiameterMm - 2 * tube.minimumWallMm) / 1000) ** 2 / 4
    const thrust = s.pressureCeilingBar * 1e5 * pressureArea
    const seat: Point = [receiverXMm, receiverYMm, z]
    const arm: Point = [x - seat[0], s.riserYMm - seat[1], 0]
    const processForce: Point = [0, thrust, thrust]
    const receiverMomentNmm = cross(arm, processForce)
    const stockAreaMm2 = Math.PI * (tube.outerDiameterMm ** 2 - (tube.outerDiameterMm - 2 * tube.minimumWallMm) ** 2) / 4
    const centrelineLengthMm = pressurePath.slice(1).reduce((sum, end, i) => sum + length(pressurePath[i], end), 0)
    const upperGap = (box: Box) => Math.min(...upperPath.path.slice(1).map((end, i) => exactSegmentBoxDistance(upperPath.path[i], end, box))) - 37 - upperPath.hausdorffError - 10
    const clearances = { upperPipeToPVFieldMm: round(upperGap(pv)), upperPipeToWasherMm: round(upperGap(washer)),
      upperPipeToHotMm: round(Math.min(...hotPaths.map((h, i) => pathSeparation(upperPath.path, h.path) - 37 - (i ? 25 : 37) - upperPath.hausdorffError - h.hausdorffError - 10))),
      upperPipeToBowlTransportMm: round(Math.min(...bowl.capture.clearSweeps.map(row => upperGap(row.box)))),
      guardToPermanentPVFieldMm: round(utility.PVworkingField[1] - Math.max(s.wetGuardFrontYMm, s.riserYMm + valve.handleHalfLengthMm) - 10),
      ordinaryReachMm: round(length(shoulder, grip)),
      ordinaryBodyToWasherMm: round(exactSegmentBoxDistance([9766, 950, 400], [9766, 950, 400], washer) - 300 - 10),
      upperCutterAndHandToWallMm: round(s.riserYMm - inner[1] - s.cutterHandRadiusMm - 10) }
    const blockers = [
      ...(radialReserve < 0 ? ['PROTECTED_TUBE_EXCEEDS_ACTUAL_SLEEVE'] : []),
      ...(s.pipeBendRadiusMm < tube.outerDiameterMm * tube.minimumBendFactor ? ['BENT_PIPE_RADIUS_BELOW_MATCHED_MINIMUM'] : []),
      ...(renewal.toWasherFirstRestAfter10Mm < 0 ? ['LOWER_MODULE_RENEWAL_REACHES_WASHER_FIRST_REST'] : []),
      ...(renewal.abovePermanentTroughLipAfter10Mm < 0 ? ['LOWER_MODULE_RENEWAL_INTERCEPTS_FIXED_TROUGH'] : []),
      ...(renewal.passageThroughSleeveAfter5Mm < 0 ? ['LOWER_MODULE_RENEWAL_EXCEEDS_SLEEVE'] : []),
      ...repairZones.filter(zone => zone.toValveBodyMm < 0).map(zone => zone.id + ':REPAIR_BODY_INTERCEPTS_VALVE'),
      ...repairZones.filter(zone => zone.initialBodyToValveMm < 0).map(zone => zone.id + ':INITIAL_BODY_INTERCEPTS_VALVE'),
      ...exteriorPressReserves.flatMap((reserve,index)=>reserve<0?['EXTERIOR_REPAIR_'+(index+1)+'_PRESS_HEAD_REACHES_WALL']:[]),
      ...Object.entries(clearances).filter(([key, value]) => key.endsWith('Mm') && !key.includes('Reach') && value < 0).map(([key]) => key + ':INTERFERENCE'),
      ...(clearances.ordinaryReachMm > 650 ? ['ORDINARY_VALVE_REACH'] : []),
      ...(fault.status !== 'within-conditional-open-flow' || !reversed?.ventedCrownRetained ? ['SOURCE_FED_FAULT_PATH_REJECTED'] : []),
    ]
    geometryBlockers.push(...blockers.map(code => branch + ':' + code))
    return { branch, primaryTubeAxis: 'level-through-sloping-secondary-sleeve' as const, pressurePathMm: pressurePath,
      drawingPressurePathMm: [...pressurePath.slice(0,6), ...upperPath.path.slice(1)] as readonly Point[],
      factoryElbow: { ...elbow, virtualCornerMm: factoryCorner, actualPortsMm: factoryPorts, bodyBoundMm: elbowBox,
        curveIsNotAnR98PipeBend: true, formerZ48L72VariantNotSubstituted: true },
      sleeve: { clearDiameterMm: relief.throughWallRupture.preferredWideBore.cleanBoreMM,
        primaryOffsetAtOuterInnerMm: [outerOffset, innerOffset], protectedTubeDiameterMm: s.protectedLowerDiameterMm,
        radialReserveAfter5Mm: round(radialReserve), wallInventoryLitres: round(pressureArea * (inner[1] - outer[1])),
        isolatedInventoryMustBeCaught: true, reverseFlowWithMinimumOffset: reversed,
        varyingOffsetIsNeverLessThanModelledMinimum: outerOffset >= innerOffset },
      components, renewal, repairZones,
      externalRepairZone: { cutYMm: s.outerCutYMm, reservationYMm: [s.outerCutYMm - 120, s.outerCutYMm + 120],
        couplingLengthMm: coupling.lengthMm, minimumInsertionMm: coupling.minimumInsertionMm,
        firstInstallationCouplingCentreYMm: s.outerCutYMm - 100,
        parkNewCouplingOnBenchModuleYMm: [s.outerCutYMm, s.outerCutYMm + coupling.lengthMm],
        madeBodyToInitialBodyMm: 100 - coupling.lengthMm,
        exteriorPressToWallAfter5Mm: exteriorPressReserves,
        secondPlainPipeCutYMm: s.outerCutYMm + 100,
        recurringRenewal: 'two declared plain-pipe repair cycles; beyond these reserves renew a longer accessible pipe run. Never cold-cut a96mm coupling as if it were28mm bare pipe.',
        straightWallTubeLengthMm: round(s.riserYMm - elbow.pipeEndToVirtualCornerMm - s.outerCutYMm),
        bareTubeMassKg: round((s.riserYMm - elbow.pipeEndToVirtualCornerMm - s.outerCutYMm) / 1000 * tube.massKgM),
        extraction: 'cold-cut exterior and upper ends; translate the drained lower L-pipe into the cleared interior bay, then lift away. Reverse for a bench-prepressed new module.' },
      valveControl: { ...valve, shaftDirection: 'west', gripMm: grip, shoulderMm: shoulder,
        nativeFactoryPressureGlandRetained: true, newRemoteDriveRequired: false,
        secondaryWetGuardNeck: { proposedBoundaryXMm: x - 40, nativeBossShapeAndStaticSeal: 'not-established', dynamicSealApproval: false },
        wholeValveRenewal: 'cold-cut and renew the accessible pipe module; no 165mm cartridge or assumed zero-pilot union' },
      clearances, support: { receiverJambAxisXMm: receiverXMm, receiverStructuralFaceYMm: receiverYMm, seatMm: seat,
        processPressureBar: s.pressureCeilingBar, actualTubeMetalAreaMm2: round(stockAreaMm2),
        blockedEndThrustN: round(thrust), orthogonalTurnForceN: round(Math.SQRT2 * thrust),
        unbalancedEndForceVectorN: processForce.map(round), unbalancedEndReceivingMomentNmm: receiverMomentNmm.map(round),
        freebody: { intactRestrainedPressurePipe: 'fluid pressure end force is balanced by pipe-wall/joint axial force; fullpA is not automatically an external clamp action',
          unbalancedEndComparison: 'fullpA per orthogonal direction retained as adverse envelope until end restraint and joint duties are established',
          maximumFlowMomentumPerTurnComponentN: round(1000 * (trial.flowLmin / 60000) ** 2 / pressureArea),
          jointDisconnectedUnderPressure: false },
        centrelineStockMassKg: round(centrelineLengthMm / 1000 * tube.massKgM),
        localTailAndHardwareMass: 'complete gross takeoff and tributary support assignment required',
        temperatureRangeK: s.localPipeTemperatureRangeK, expansionPer2250mmMm: round(tube.expansionMmMK * 2.25 * s.localPipeTemperatureRangeK),
        whollyRestrainedThermalForceN: round(tube.elasticModulusMpa * stockAreaMm2 * tube.expansionMmMK / 1000 * s.localPipeTemperatureRangeK),
        whollyRestrainedThermalStressMpa: round(tube.elasticModulusMpa * tube.expansionMmMK / 1000 * s.localPipeTemperatureRangeK),
        thermalReactionSolved: false,
        supportLaw: 'one declared fixed point; chloride-free gliding guides elsewhere; no wholly fixed thermal restraint assumption',
        pressureCounterholdSeparateFromLinerAndWindow: true, old1000NCarrierHandlingLoadApplied: false,
        receiverConcreteAnchorAndBracketCapacity: 'not-established' },
      fixedSupportPieces: {
        linerBearing: { structuralFloorThicknessMm: 3, separateRibsMm: [10, 50], ribPitchCeilingMm: 100,
          tubeClampPost: { centreMm: [x + 65, 600, (lowerFloor + z) / 2], plainSolidSectionMm: [10, 40],
            verticalExtentMm: [lowerFloor, z], topCounterholdMm: [x, s.riserYMm, z], bodyBoundMm: postBox,
            toLowerReliefClearCoreAfter5Mm: round(60 - lowerClearRadius - 5),
            toCellEastAfter5Mm: round(Math.max(...cell.case.plan.map(p => p[0])) - x - 70 - 5) },
          postToStructuralFloor: 'continuous welded boss/rib, no through-bolt or unsealed puncture in wet floor',
          independentSupportDuty: 'structural rib, fixed liner and low chassis form one supported wet subassembly; window and sibling shell carry no reaction',
          weldedJointAndLinerLocalCapacity: 'not-established', flowQualification: 'post remains outside the named100mm lower core; complete fitted entrance K unproved' },
      },
      fault: { inheritedLowerReliefAndIndependentReceiver: fault, upperMouth: 'blocked', admittedSourceCeilingLmin: trial.flowLmin,
        noManualOrSiblingCredit: true, exactSiteSupplyEstablished: false,
        ownUpperGuard: { bodyMm: upperGuard, drainIntoOwnFixedCellOnly: true,
          lowerOpenFootprintMm: [80,s.wetGuardFrontYMm-s.riserYMm+35], noSiblingBridge: true,
          completeBootSeamDrainAndSprayQualification: 'not-established' } },
      blockers }
  })
  const pair = round(pathSeparation(upperPaths.utility.path, upperPaths.plant.path) - 74 - upperPaths.utility.hausdorffError - upperPaths.plant.hausdorffError - 10)
  if (pair < 25) geometryBlockers.push('FIXED_UPPER_PIPE_PAIR_COMPARISON')
  const frame = { normalAxisYMm: 480, railAxesZMm: [40, 120], normalDepthMm: 80, verticalDepthMm: 60, wallMm: 4, densityKgM3: 8000 }
  const span = Math.max(...axes) - Math.min(...axes)
  const area = frame.normalDepthMm * frame.verticalDepthMm - (frame.normalDepthMm - 2 * frame.wallMm) * (frame.verticalDepthMm - 2 * frame.wallMm)
  const inertia = (frame.verticalDepthMm * frame.normalDepthMm ** 3 - (frame.verticalDepthMm - 2 * frame.wallMm) * (frame.normalDepthMm - 2 * frame.wallMm) ** 3) / 12
  const gauge = frame.railAxesZMm[1] - frame.railAxesZMm[0], centreZ = (frame.railAxesZMm[0] + frame.railAxesZMm[1]) / 2
  const receiving = branches.map(branch => {
    const x = branch.pressurePathMm[0][0], z = branch.factoryElbow.virtualCornerMm[2]
    const pressure = branch.support.blockedEndThrustN
    const declaredKnownTubeWeightN = branch.support.centrelineStockMassKg * 9.81
    const moment = pressure * Math.abs(z - centreZ) + (pressure + declaredKnownTubeWeightN) * Math.abs(s.riserYMm - frame.normalAxisYMm)
    const upperNormal = moment / gauge + pressure / 2
    const eastShare = (x - Math.min(...axes)) / span
    return { branch: branch.branch, pressureComponentN: pressure, knownTubeWeightN: round(declaredKnownTubeWeightN),
      maximumAbsoluteMomentAboutLowFrameNmm: round(moment), governingRailNormalN: round(upperNormal),
      westJambNormalN: round(upperNormal * (1 - eastShare)), eastJambNormalN: round(upperNormal * eastShare),
      excludesFittingsLinerHardwareThermalAndToolLoads: true }
  })
  const upperRailNormal = receiving.reduce((n, row) => n + row.governingRailNormalN, 0)
  const minimumWetFloor = Math.min(...branches.map(branch => branch.fault.inheritedLowerReliefAndIndependentReceiver.geometry.lowerInvertZMm)) - 3
  const supportFrame = { ...frame, jambAxesXMm: axes, spanMm: span,
    railBoxesMm: frame.railAxesZMm.map(z => [Math.min(...axes), frame.normalAxisYMm - frame.normalDepthMm / 2,
      z - frame.verticalDepthMm / 2, span, frame.normalDepthMm, frame.verticalDepthMm]),
    receivingBackplate: { alongWidthMm: 150, thicknessMm: 10, verticalExtentMm: [20, 160],
      anchorLinesMm: axes.flatMap(x => frame.railAxesZMm.map(z => [x, receiverYMm, z])),
      stockAndAnchorGroup: 'not-selected; actual group, drill/cage clearance, cracked-concrete resistance, prying and combined actions require STR design' },
    twoRailsMassKg: round(2 * area * span / 1e9 * frame.densityKgM3),
    aboveFinishedFloorAfter5Mm: frame.railAxesZMm[0] - frame.verticalDepthMm / 2 - 5,
    belowLowestFixedWetFloorAfter5Mm: round(minimumWetFloor - frame.railAxesZMm[1] - frame.verticalDepthMm / 2 - 5),
    knownActionCases: receiving, governingRailNormalN: round(upperRailNormal),
    elasticSimpleRailStressFromKnownActionsOnlyMpa: round(upperRailNormal * span / 4 / (inertia / (frame.normalDepthMm / 2))),
    noFloorMoisturePenetration: true, noFrontRailInElectricalField: true,
    completeCapacity: false, fixedLinerRibsAndPipePostsRequireJoinedLocalCheck: true }
  if (supportFrame.aboveFinishedFloorAfter5Mm < 0 || supportFrame.belowLowestFixedWetFloorAfter5Mm < 0) geometryBlockers.push('LOW_FIXED_CHASSIS_INTERCEPT')
  const caseDigest = sha256SemanticFingerprint({ input: s, identities, productFacts: fixedInletProductFacts,
    insert: joined.insert.source.caseDigest, fault: joined.fault.source.caseDigest })
  const methodBytes = readFileSync(new URL('./inlet-fixed-entry.ts', import.meta.url))
  return { schema: 'had-fixed-inlet-candidate/1' as const, status: geometryBlockers.length ? 'rejected-geometry' as const : 'conditional-whole-arrangement' as const,
    settings: s, source: { planDigest: joined.insert.source.planDigest, insertCaseDigest: joined.insert.source.caseDigest,
      faultCaseDigest: joined.fault.source.caseDigest, caseDigest, inputs: identities },
    method: { id: 'HAD-FIXED-INLET/1', gitBlob: createHash('sha1').update('blob ' + methodBytes.length + '\0').update(methodBytes).digest('hex') },
    productFacts: fixedInletProductFacts, branches, geometryBlockers, upperPipePairAfterSettingMm: pair, supportFrame,
    removes: ['loaded L-carrier and its1000N handling assumption', 'axially retracting dry companion', '165mm extracted valve module', 'in-situ low pressure joints', 'whole moving U-lid receiver', 'floor posts and front crossrails'],
    serviceSequence: ['Close both Lodge branch cuts for entry renewal; prove downstream isolation, zero pressure and drain inventories independently.',
      'Keep fixed lower troughs and their independent reliefs/receivers intact; retain factory pressure glands.',
      'Open only the isolated service guard. Move the washer to its restrained first rest for low wall-joint work; upper routine shutoff remains accessible with it installed.',
      'Clamp both sound ends independently, protect openings against swarf, cold-cut the exterior and upper pressure tails and catch the retained wall inventory.',
      'Open the pipe clamps, strip the renewable jacket and static neck, translate the drained small lower elbow/tail into the cleared interior bay and lift away; never slide a pressed joint off.',
      'Bench-press the replacement wall-tail, factory elbow and lower riser. Introduce its straight end through the sleeve from inside, translate it into final position and restore its independent supports.',
      'Park new stopless couplings wholly on the retained tails, introduce the exact replacement module, centre to marked engagements and perform both prescribed pressings.',
      'Deburr internally/externally, flush and pressure/leak test; restore static wet/air/thermal necks, guards, vents and separate free outlets before charging.',
      'Restore electrical and occupied states only after drying and inspection; reopen branch cuts separately.'],
    materialDisposition: { pressBranchIsSelected: false, knownPressSealCountPerBranch: 10,
      constituents: ['EPDM press seals', 'PTFE valve ball seals; exact count/mass unknown', 'stock plastic T-handle', 'undisclosed lubricants/other selector parts'],
      metalHandleAlternative: '2375 instructions name metal lever accessories; exact SKU, coating and complete swept shape remain unbound',
      existingNoSyntheticControl: 'MAT services-water-joints.md: Conex metal-sealing copper compression and explicit cold cut/repair; not a stainless or size substitute',
      noGenericSmallRenewableException: true, ownerExceptionRecorded: false },
    unresolved: [
      { boundary: 'internal-design', item: 'Bind native valve boss/static secondary wet neck and complete gasket, retainer and wet guard load path; the factory pressure gland alone is not a wet cover.' },
      { boundary: 'internal-design', item: 'Complete actual cutter rotation and grip, deburrer size, press jaws and320mm machine motion at both low and high joints. The100/150mm envelopes are conservative authored comparisons, not measured tool sweeps.' },
      { boundary: 'internal-design', item: 'Design independent bracket sections and actual anchor groups in the bound180×205 RC jambs under the reported pressure, stock, hardware, thermal and tool reactions; no capacity follows from fit.' },
      { boundary: 'internal-design', item: 'Name the complete ≤50mm lower thermal assembly and solve no-flow frost, condensation and air-boundary continuity; insulation diameter is not freeze protection.' },
      { boundary: 'owner-material-and-architecture', item: 'Reconcile exact constituents and ordinary compression control before any narrowly specified residue decision. Show window obscuration and removal before sash/frame renewal.' },
      { boundary: 'site-and-physical', item: 'Actual provider pressure/flow, frost weather, exterior standing/rest ground and independent tailwaters must meet the declared envelope; test complete assembled blocked-mouth/hood/relief/guard, loaded support and wet restoration before occupied acceptance.' },
    ],
    evidence: { preSiteArrangementComplete: false, selectedHouseAdoption: false, installedAcceptance: false,
      declaredToolOrPreparationIsPhysicalEvidence: false, exactGeometryIsWetOrAnchorApproval: false },
    drawing: drawing(branches, caseDigest), renewalDrawing: renewalDrawing(branches,utility.washerFirstRest,s.lowerCutZMm,caseDigest) }
}
