import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import { layoutRevision } from '../georgian/layout-revision.js'
import { readBoundOccupiedServices } from './occupied-services.js'
import type { CurrentDesignResolution } from './resolve.js'
import { admitSteelPrecastSettings, calculateSteelPrecast, type BeamModel, type SteelPrecastGeometry } from './steel-precast-kernel.js'
import { drawSteelPrecastComparison } from './steel-precast-view.js'

export const steelPrecastDefaultsPath = 'project/str/studies/steel-precast-inputs.json'
const root = new URL('../../../', import.meta.url)
const inputPaths = [steelPrecastDefaultsPath, 'project/str/studies/steel-precast-sources.json', 'project/str/studies/open-loggia-support.json', 'project/str/studies/physical-slab-join.json',
  'compiler/reference-house/georgian/layout-revision.ts', 'compiler/reference-house/current-design/steel-precast-kernel.ts',
  'compiler/reference-house/current-design/structural-steel-precast.ts', 'compiler/reference-house/current-design/steel-precast-view.ts'] as const
const read = (path: string) => readFileSync(new URL(path, root))
type Wall = { id: string; a: [number, number]; b: [number, number]; structuralCore: [number, number]; holes: number[][] }
type FloorSource = { floor_fields: Array<{ id: string; direction: string; rectangle: number[]; axis_span: number }>;
  actual_roof: { north_frames_x: number[]; seat_y: number[] };
  finite_floor_frame: { stair: { midlanding_slab: { NSsupport_axes: number[] }; midlanding_post_core: number[];
    midlanding_beam: { west_RC_sill_receiver: number[] } } } }
type SurfaceSource = { inner_axis_rectangle_mm: number[]; gross_surface_m2: number; bridge_m2: number; residual_m2: number }
interface ComparisonOccupiedModel {
  upperWalls: Wall[]; groundWalls: Wall[]; stair: number[]; void: number[]; court: number[]; envelope: number; shell: number
  finishRewind: { dry: { total: number } }
  openings: { GROUND: { wall: string; centre: number; width: number }[] }
  archOpeningRegister: { GROUND: { wall: string; centre: number; width: number; head: number; radialRingTrial: number }[] }
  outerServiceArch: { rawY: number[]; ringTop: number; supports: { axisX: number; nodeAxesY: number[] } }
  sections: { groundFFL: number; firstFFL: number; atticDatum: number;
    groundFloorRC: { top: number };
    loggiaSoffit: { insulation: number; railLathTerritory: number; mineralProtection: number } }
  insulatedPortal: { coreAxial: number; rawCrown: number; ring: number }
  roofDevelopment: { eavesDatum: number }
  roofSelectionComparison: { retained: { ridge: number } }
  stairFinishRewind: { provisionalEqualFlightWidth: number }
  stairGuard: { finishedAperture: number[]; lowerFlightX: number[]; upperFlightX: number[];
    treadGeometry: { bearingAxesY: number[] }; minimumDeclaredHeadrooms: { upperArrivalBelowRoofControl: number } }
  lowCillWindowGuard: { opening: { sill: number; head: number }; supportEnquiry: { retainedPlateAtZ: number } }
}

function bind(resolved: CurrentDesignResolution, reader = read) {
  const binding = resolved.disciplineBindings.find(v => v.id === 'str-steel-precast-comparison')
  if (!binding) throw new Error('Steel/precast comparison requires its current source family')
  const observed = Object.fromEntries(inputPaths.map(path => {
    const bytes = reader(path), blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    if (binding.identities[path] !== blob) throw new Error(`Stale steel/precast source: ${path}`)
    return [path, { bytes, blob }]
  }))
  const occupied = readBoundOccupiedServices(resolved)
  return { binding, observed, occupied, sourceDigest: sha256SemanticFingerprint({ structural: binding.digest, occupied: occupied.binding.digest }) }
}

/** Source geometry only. RC section resistances, forces and previous pass/fail flags are deliberately not inputs. */
function geometryFrom(bound: ReturnType<typeof bind>): SteelPrecastGeometry {
  const m = bound.occupied.house.model as unknown as ComparisonOccupiedModel
  if (!Array.isArray(m.upperWalls) || !Array.isArray(m.groundWalls) || !m.insulatedPortal || !m.sections.loggiaSoffit
    || !m.roofDevelopment || !m.roofSelectionComparison || !m.stairFinishRewind || !m.stairGuard || !m.lowCillWindowGuard
    || !m.outerServiceArch || !m.openings || !m.finishRewind
    || [m.stair, m.void, m.court].some(r => !Array.isArray(r) || r.length !== 4 || !r.every(Number.isFinite))) {
    throw new Error('Current occupied source lacks the declared steel/precast geometry')
  }
  const floor = JSON.parse(bound.observed['project/str/studies/open-loggia-support.json'].bytes.toString()) as FloorSource
  const surface = JSON.parse(bound.observed['project/str/studies/physical-slab-join.json'].bytes.toString()) as SurfaceSource
  const wall = (id: string, upper = true) => {
    const v = ((upper ? m.upperWalls : m.groundWalls) as Wall[]).find(w => w.id === id)
    if (!v || !v.structuralCore) throw new Error(`Missing current wall: ${id}`)
    return v
  }
  const [outerWest, outerSouth, outerEast, outerNorth] = surface.inner_axis_rectangle_mm
  const [loggiaWest, loggiaEast] = floor.actual_roof.north_frames_x
  const [courtNorth, gardenNorth] = floor.actual_roof.seat_y
  const wet = wall('rear-wet-east'), rear = wall('rear-west', false), bath = wall('bath-north')
  const studyNorth = wall('study-cloak-north', false)
  const southCourt = floor.floor_fields.find(f => f.id === 'south-W-gallery')!.rectangle[3]
  const core = (w: Wall) => w.structuralCore[1] - w.structuralCore[0]
  const plain = { floorTributaryMm: 0, wallCoreMm: 0, wallLoadedLengthMm: 0, roofTributaryMm: 0 }
  const beams: BeamModel[] = [
    ...[courtNorth, gardenNorth].map((y, i): BeamModel => ({ ...plain, id: i ? 'portal-garden' : 'portal-court', role: 'portal',
      a: [loggiaWest, y], b: [loggiaEast, y], supports: ['west weather wall / arch-pier junction', 'east weather wall / arch-pier junction'],
      wallCoreMm: m.insulatedPortal.coreAxial, wallLoadedLengthMm: loggiaEast - loggiaWest,
      roofTributaryMm: (gardenNorth - courtNorth) / 2 })),
    { ...plain, id: 'rear-wet', role: 'floor', a: [wet.a[0], rear.a[1]], b: [wet.a[0], outerNorth],
      supports: ['rear-west wall beside stair landing', 'outer-north solid pier between windows'],
      floorTributaryMm: (loggiaWest - outerWest) / 2, wallCoreMm: core(wet), wallLoadedLengthMm: outerNorth - rear.a[1] },
    { ...plain, id: 'stair-east', role: 'edge', a: [m.stair[0] + m.stair[2], studyNorth.a[1]], b: [m.stair[0] + m.stair[2], rear.a[1]],
      supports: ['study-cloak-north solid wall', 'rear-west wall beside rear-wet bearing'] },
    ...['bed2-east', 'bed3-west'].map((id, i): BeamModel => {
      const w = wall(id)
      return { ...plain, id: i ? 'entrance-east' : 'entrance-west', role: 'edge', a: [w.a[0], outerSouth], b: [w.a[0], southCourt],
        supports: ['outer-south pier beside entrance', 'court-south pier beside door'], wallCoreMm: core(w), wallLoadedLengthMm: w.b[1] - outerSouth }
    }),
    { ...plain, id: 'bath-north', role: 'floor', a: [bath.a[0], bath.a[1]], b: [outerEast, bath.a[1]],
      supports: ['service-spine solid wall', 'outer-east wall above actual arched water opening'], wallCoreMm: core(bath), wallLoadedLengthMm: outerEast - bath.a[0] },
  ]
  const soffit = m.sections.loggiaSoffit
  const stairSource = floor.finite_floor_frame.stair
  const headerY = m.stairGuard.treadGeometry.bearingAxesY[0]
  const stairUpperWindow = m.archOpeningRegister.GROUND.find(o => o.wall === 'outer-west' && o.centre - o.width / 2 < headerY && o.centre + o.width / 2 > headerY)
  if (!stairUpperWindow) throw new Error('Expected actual west stair-header window in the source arch register')
  return { referenceGroundFflMm: m.sections.groundFFL, referenceFirstFflMm: m.sections.firstFFL, referenceAtticDatumMm: m.sections.atticDatum,
    referenceEavesMm: m.roofDevelopment.eavesDatum, referenceRidgeMm: m.roofSelectionComparison.retained.ridge,
    stair: { risers: layoutRevision.stair.risers, goingMm: layoutRevision.stair.going, footprintXYWHMm: m.stair,
      finishedFlightWidthBeforeRailMm: m.stairFinishRewind.provisionalEqualFlightWidth,
      bearingAxesYMm: m.stairGuard.treadGeometry.bearingAxesY,
      flightCentreXMm: [m.stairGuard.lowerFlightX, m.stairGuard.upperFlightX].map(r => (r[0] + r[1]) / 2),
      landingNorthAxisYMm: stairSource.midlanding_slab.NSsupport_axes[1], sourcePostXYWHMm: stairSource.midlanding_post_core,
      westSillXYWHMm: stairSource.midlanding_beam.west_RC_sill_receiver,
      headerFloorTributaryMm: floor.floor_fields.find(f => f.id === 'west-south')!.axis_span / 2,
      finishedWestEdgeMm: m.stairGuard.finishedAperture[0], referenceWindowSillMm: m.lowCillWindowGuard.opening.sill,
      referenceWindowHeadMm: m.lowCillWindowGuard.opening.head, referenceGuardBaseMm: m.lowCillWindowGuard.supportEnquiry.retainedPlateAtZ,
      referenceUpperHeadroomMm: m.stairGuard.minimumDeclaredHeadrooms.upperArrivalBelowRoofControl,
      groundSupportTopMm: m.sections.groundFloorRC.top,
      upperWindowYMm: [stairUpperWindow.centre - stairUpperWindow.width / 2, stairUpperWindow.centre + stairUpperWindow.width / 2],
      upperWindowOuterCrownMm: stairUpperWindow.head + stairUpperWindow.radialRingTrial,
      allWestOpeningsYMm: m.openings.GROUND.filter(o => o.wall === 'outer-west').map(o => [o.centre - o.width / 2, o.centre + o.width / 2]),
      westRoofTributaryMm: (floor.floor_fields.find(f => f.id === 'west-stair-gallery')!.rectangle[2] - outerWest) / 2,
      southWallExtentXMm: [studyNorth.a[0], studyNorth.b[0]], southWallOpeningsXMm: studyNorth.holes, southWallCoreYMm: studyNorth.structuralCore },
    entranceVoidXYWHMm: m.void, archOuterCrownMm: m.insulatedPortal.rawCrown + m.insulatedPortal.ring,
    loggiaSoffitLayersMm: soffit.insulation + soffit.railLathTerritory + soffit.mineralProtection,
    floorEnvelopeXYXYMm: surface.inner_axis_rectangle_mm, courtXYWHMm: m.court,
    floorFields: floor.floor_fields.map(f => ({ id: f.id, rectangleXYXYMm: f.rectangle, direction: f.direction, spanMm: f.axis_span })),
    grossSourceFloorAreaM2: surface.gross_surface_m2, bridgeAreaM2: surface.bridge_m2, residualAreaM2: surface.residual_m2,
    westGallerySupportXMm: loggiaWest, rearReceivingWall: { axisYMm: rear.a[1], coreYMm: rear.structuralCore,
      extentXMm: [rear.a[0], rear.b[0]], openingsXMm: rear.holes },
    eastArchReceiver: { wallAxisXMm: m.outerServiceArch.supports.axisX,
      coreWidthMm: 2 * (m.envelope - m.finishRewind.dry.total - outerWest), finishedInsideXMm: m.shell - m.envelope,
      openingYMm: m.outerServiceArch.rawY, archOuterCrownMm: m.outerServiceArch.ringTop,
      groundSupportAxesYMm: m.outerServiceArch.supports.nodeAxesY,
      allOpeningsYMm: m.openings.GROUND.filter(o => o.wall === 'outer-east').map(o => [o.centre - o.width / 2, o.centre + o.width / 2]),
      floorTributaryMm: floor.floor_fields.find(f => f.id === 'east-strip')!.axis_span / 2,
      roofTributaryMm: (outerEast - floor.floor_fields.find(f => f.id === 'east-gallery')!.rectangle[0]) / 2 }, beams }
}

export function readSteelPrecastSettings() { return admitSteelPrecastSettings(JSON.parse(read(steelPrecastDefaultsPath).toString())) }

export function readSteelPrecastCase(resolved: CurrentDesignResolution) {
  const bound = bind(resolved)
  return { schema: 'str-steel-precast-request/1' as const, design: resolved.design,
    comparison: { schema: 'str-steel-precast-case/1' as const, planDigest: bound.binding.applicability.planDigest,
      bindingDigest: bound.sourceDigest, settings: readSteelPrecastSettings() } }
}

export function runSteelPrecastCase(resolved: CurrentDesignResolution, input: unknown, reader = read) {
  const bound = bind(resolved, reader)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).sort().join(',') !== 'bindingDigest,planDigest,schema,settings') {
    throw new TypeError('Expected the explicit versioned steel/precast case')
  }
  const trial = input as ReturnType<typeof readSteelPrecastCase>['comparison']
  if (trial.schema !== 'str-steel-precast-case/1' || trial.planDigest !== bound.binding.applicability.planDigest || trial.bindingDigest !== bound.sourceDigest) {
    throw new Error('Stale or unsupported steel/precast case binding')
  }
  const result = calculateSteelPrecast(geometryFrom(bound), trial.settings)
  return { ...result, source: { planDigest: trial.planDigest, bindingDigest: bound.sourceDigest, caseDigest: sha256SemanticFingerprint(trial),
    occupiedBindingDigest: bound.occupied.binding.digest, files: Object.fromEntries(inputPaths.map(p => [p, bound.observed[p].blob])) },
    drawings: drawSteelPrecastComparison(result) }
}
