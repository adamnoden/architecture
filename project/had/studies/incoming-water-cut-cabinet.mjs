import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { deriveCurrentHouse } from './current-house.mjs'
import { finiteBends } from './incoming-water-geometry.mjs'
import { pathSeparation } from './service-interface-geometry.mjs'
import { compareElevatedDrip } from './incoming-water-elevated-drip.mjs'

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const { selection, station } = read('./incoming-water.json')
const { dock } = read('../../mat/studies/plant-threshold.json')
const { spill } = read('../../ias/studies/household-water.json')
const { heat } = read('../../mat/studies/whole-house-service-baseline.json')
const { entry, geometry, tool, drain } = station
const priorI0 = geometry.cartridges.find(cartridge => cartridge.id === 'I0')
const d1 = drain.definitions.find(point => point.id === 'D1')
const r = entry.completePipeOD / 2
const intervalGap = ([firstMin, firstMax], [secondMin, secondMax]) => Math.max(firstMin - secondMax, secondMin - firstMax, 0)
const rectangleGap = (first, second) => Math.hypot(intervalGap(first.slice(0, 2), second.slice(0, 2)), intervalGap(first.slice(2), second.slice(2)))
const length = path => path.slice(1).reduce((sum, b, i) => sum + Math.hypot(...b.map((value, axis) => value - path[i][axis])), 0)

export function compareExternalCutCabinet() {
  const { model, id } = deriveCurrentHouse()
  if (id !== selection) throw new Error('Reconcile the external cut with the selected current house first')
  const [portX, portY, portZ] = entry.point
  const innerFaceX = model.shell - model.envelope
  const southFace = model.groundWalls.find(wall => wall.id === 'utility-north').finishedFaces[1]
  const northFace = model.groundWalls.find(wall => wall.id === 'plant-intermediate-arch').finishedFaces[0]
  const cabinet = [12125, 12650, 2450, 3350]
  const accessField = [12650, 13650, 2450, 3350]
  const workingLevel = -490
  const datumShift = portZ - priorI0.bottom
  const cartridgeX = 12350
  const mirroredX = value => cartridgeX + priorI0.x - value
  const handling = station.moduleContracts.find(module => module.id === priorI0.id)
  const trialEnds = priorI0.ends.map(y => y + portY - (priorI0.ends[0] + priorI0.ends[1]) / 2)
  const [lowerY, upperY] = trialEnds
  const dryStance = [cabinet[1] + 325, portY]
  const trialHand = [mirroredX(priorI0.hand[0]), portY, priorI0.hand[2] + datumShift]
  const trialShoulderHeight = workingLevel + priorI0.shoulder
  const controlReachMM = Math.hypot(trialHand[0] - dryStance[0], trialHand[2] - trialShoulderHeight)
  const exteriorVertices = [[cartridgeX, upperY, portZ], [12200, upperY, portZ], [12200, portY, portZ], entry.point]
  const interiorVertices = [entry.point, [11440, portY, portZ], [11440, 3520, 700],
    [11315, 3520, 700], [11315, 3175, 700], geometry.tee]
  const upstreamVertices = [[12250, portY, -150], [12250, portY, 400], [cartridgeX, lowerY, 400], [cartridgeX, lowerY, portZ]]
  const upstream = finiteBends(upstreamVertices, geometry.bendR)
  const outside = finiteBends(exteriorVertices, geometry.bendR)
  const indoorBendRadiusMM = 60
  const inside = finiteBends(interiorVertices, indoorBendRadiusMM)
  const wallTurnStart = inside.bends[0]
  const aroundBends = inside.path.filter(point => point[1] > portY)
  const twoAxisSettingsMM = 10
  const routeWalls = { eastBeyondSleeveTurn: innerFaceX - Math.max(...aroundBends.map(point => point[0])) - r - inside.hausdorffError,
    south: Math.min(...inside.path.map(point => point[1])) - southFace - r - inside.hausdorffError,
    north: northFace - Math.max(...inside.path.map(point => point[1])) - r - inside.hausdorffError }
  const retained = Object.entries(geometry.fixedVertices).filter(([name]) => !['entry', 'mainOut'].includes(name))
  const branchClearance = retained.map(([name, vertices]) => {
    const route = vertices.length > 2 ? finiteBends(vertices, geometry.bendR) : { path: vertices, hausdorffError: 0 }
    return { name, gapMM: pathSeparation(inside.path, route.path) - 2 * r - inside.hausdorffError - route.hausdorffError,
      sharedTee: vertices[0].every((value, axis) => value === geometry.tee[axis]) }
  })
  const coldRiser = [[11505, 2882, 900], [11505, 2882, 2725]]
  const heatClearance = heat.emitterSchedule.filter(e => ['utility-E', 'plant-N'].includes(e.id)).map(e => {
    const path = [...e.pressurePairBranchPlan.map(point => [...point, e.upperBranchAxisLocal]), [...e.pressurePairBranchPlan.at(-1), 0]]
    return { name: e.id, gapMM: pathSeparation(inside.path, path) - r - 84 - inside.hausdorffError }
  })
  const supportBase = 250
  const clearTray = { widthMM: 820, depthMM: 440, usefulDepthMM: 80 }
  const trayGrossLitres = clearTray.widthMM * clearTray.depthMM * clearTray.usefulDepthMM / 1e6
  const trialNetLitres = 24
  const reserveLitres = 6
  const headM = .025
  const throatWidthM = .16
  const idealWeir = clearFraction => 2 / 3 * .62 * throatWidthM * clearFraction * Math.sqrt(2 * 9.81) * headM ** 1.5 * 60000
  const byFlow = spill.flowsLmin.map(flowLmin => ({ flowLmin, cutTimeBeforeReserveS: (trialNetLitres - reserveLitres) * 60 / flowLmin,
    blockedSecondsToRim: trialNetLitres * 60 / flowLmin,
    clearControllingLmin: idealWeir(1), halfClearControllingLmin: idealWeir(.5),
    oneIndependentHalfClearThroatMeetsTrial: idealWeir(.5) >= flowLmin }))
  const drip = compareElevatedDrip().independentOutlet
  const supportBaseToDripZ = supportBase - drip.invertZ - drip.formedDiameterMM
  const padCorners = [[12225, 2525], [12225, 3275], [12575, 2525], [12575, 3275]]
  const padRadiusMM = 50
  const cap = entry.P17
  const p17 = [cap.xy[0] - cap.capXY[0] / 2, cap.xy[0] + cap.capXY[0] / 2,
    cap.xy[1] - cap.capXY[1] / 2, cap.xy[1] + cap.capXY[1] / 2]
  const pointRectGap = ([x, y], rect) => rectangleGap([x, x, y, y], rect)
  const firstRestX = 13000
  const transferEndBodyX = 13325
  const trialOpenFace = [2490, 3310]
  const openings = trialEnds.map((y, end) => {
    const [a, b] = priorI0.sectors[end]
    const tip = angle => {
      const angleRad = angle * Math.PI / 180
      return [cartridgeX - tool.length * Math.cos(angleRad), y + tool.length * Math.sin(angleRad)]
    }
    const tips = Array.from({ length: 1 + (b - a) * 4 }, (_, i) => tip(a + i / 4))
    const edgeMargin = Math.min(...tips.map(point => Math.min(point[1] - trialOpenFace[0], trialOpenFace[1] - point[1])))
    return { y, toolLateralGapMM: edgeMargin - tool.handR - tool.penaltyMM,
      farthestHandReachMM: Math.max(...tips.map(point => Math.hypot(point[0] - dryStance[0], point[1] - dryStance[1], portZ + 50 - trialShoulderHeight))) + tool.penaltyMM }
  })
  return { status: 'REFERENCE_COMPARISON_NOT_ADOPTION', selection: id,
    retained: { B0: 'Owner-side remote cut precedes the external I0, including its inlet union', I0: 'Separate immediately outside-wall house cut, subject to dry access and supplier',
      providerCut: 'Independent provider-authorised upstream cut for B0 failure', D0: 'Relocate isolated upstream drain and both-face proving outside',
      D1: 'Keep existing tee and prove the new lower pocket drains through a separate inlet-side controlled cut',
      U0P0: 'Both cartridges remain indoors with four pressure unions and branch isolation', D2: 'Dedicated vessel safety discharge, excluded from cabinet drainage' },
    cabinet: { plan: cabinet, accessField, trialWorkingLevel: workingLevel, trialGrade: dock.outsideGrade,
      workerPlatformRiseAtTrialGradeMM: workingLevel - dock.outsideGrade, stance: dryStance,
      actualDryApproachProved: false, reachMM: controlReachMM, hand: trialHand, trialOpenFace, openings,
      firstRest: { x: firstRestX, y: portY, eastwardThrowMM: firstRestX - cartridgeX, liftMM: handling.liftMM,
        packageTopAfterLiftMM: priorI0.crown + datumShift + r + handling.liftMM, assumedClearHeadMM: 1050,
        maximumDryHandledKg: handling.maximumDryHandledKg, operatorCentreX: transferEndBodyX,
        remainingPlatformRunMM: accessField[1] - transferEndBodyX - 300, operatorAndCaptureProved: false },
      cabinetToDockMM: rectangleGap(cabinet, dock.plan), approachToDockMM: rectangleGap(accessField, dock.plan),
      stanceToFaceAfterBodyMM: dryStance[0] - cabinet[1] - 300, pressureJetCaptureProved: false,
      supportBaseToDripZ, padCorners, padRadiusMM,
      smallestPadToP17MM: Math.min(...padCorners.map(point => pointRectGap(point, p17))) - padRadiusMM,
      smallestPadToDripAxisYMM: Math.min(...padCorners.map(point => Math.abs(point[1] - drip.drainY))) - padRadiusMM,
      sharedUnderfloorDischargeCredited: false },
    supply: { upstreamVertices, exteriorVertices, interiorVertices, cartridgeAxisX: cartridgeX, trialEnds, bends: [...upstream.bends, ...outside.bends, ...inside.bends],
      ordinaryJacketOD: 2 * r, sleeveRadialClearanceAfterSettingMM: entry.radialBudget - entry.settingBudget,
      indoorBendRadiusMM, nominal90BendCrosswiseEnvelopeMM: indoorBendRadiusMM + 2 * r,
      alignedPreformedBendAcrossBoreShortfallMM: indoorBendRadiusMM + 2 * r - entry.formedBore,
      straightInsideSleeveBeforeBendMM: innerFaceX - wallTurnStart.vertex[0] - wallTurnStart.tangent,
      interiorUnionsBefore: 6, relocatedI0Unions: 2, retainedU0P0Unions: 4,
      firstRepairableIndoorConnectionIfFieldBendUnavailable: 1,
      upstreamExposedRouteLengthMM: length(upstream.path), interiorRouteLengthMM: length(inside.path), exteriorRouteLengthMM: length(outside.path), routeWalls,
      wallClearanceAfterTwoSettingsMM: Object.fromEntries(Object.entries(routeWalls).map(([face, gap]) => [face, gap - twoAxisSettingsMM])),
      branchClearance, heatClearance,
      clearanceToColdRiserMM: pathSeparation(inside.path, coldRiser) - 2 * r - inside.hausdorffError,
      d1TeeOnStraightAfterBends: d1.tee[0] === 11315 && d1.tee[2] === 700 && d1.tee[1] > 3175 + inside.bends[3].tangent && d1.tee[1] < 3520 - inside.bends[2].tangent,
      routeInstallationAndWithdrawalProved: false },
    response: { clearTray, trayGrossLitres, trialNetLitres, reserveLitres, throatWidthM, headM, byFlow,
      sourceFlowMaximumEstablished: false, storageAfterClosureKnown: false, automatedCutCredited: false,
      outletIndependenceProved: false, controlledDripAndBurstHaveDistinctDuties: true } }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const path = new URL('./incoming-water-cut-cabinet.json', import.meta.url)
  const output = JSON.stringify(compareExternalCutCabinet(), null, 2) + '\n'
  if (process.argv.includes('--check')) {
    if (readFileSync(path, 'utf8') !== output) throw new Error('External cut cabinet receipt has changed')
  } else if (process.argv.includes('--write')) writeFileSync(path, output)
  else process.stdout.write(output)
}
