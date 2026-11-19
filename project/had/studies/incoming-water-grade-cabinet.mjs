import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { compareExternalCutCabinet } from './incoming-water-cut-cabinet.mjs'
import { compareElevatedDrip } from './incoming-water-elevated-drip.mjs'
import { finiteBends, exactSegmentBoxDistance } from './incoming-water-geometry.mjs'
import { pathSeparation } from './service-interface-geometry.mjs'

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const { station } = read('./incoming-water.json')
const { dock, section } = read('../../mat/studies/plant-threshold.json')
const earliest = compareExternalCutCabinet()
const { independentOutlet: drip } = compareElevatedDrip()
const rangeGap = ([a, b], [c, d]) => Math.max(a - d, c - b, 0)
const boxGap = (path, box, radius) => Math.min(...path.slice(1).map((point, i) => exactSegmentBoxDistance(path[i], point, box))) - radius
const drawing = name => new URL(`./incoming-water-grade-cabinet.${name}`, import.meta.url)

export function compareGradeCutCabinet() {
  const { cabinet, supply, response } = earliest
  const { entry, geometry, tool } = station
  const grade = dock.outsideGrade
  const dropMM = cabinet.trialWorkingLevel - grade
  const trialWorkingFloor = grade
  const trayBottomZ = 250 - dropMM
  const trayTopZ = trayBottomZ + response.clearTray.usefulDepthMM
  const localFace = [12650, 13650, 2250, 3350]
  const shiftedY = 2590
  const cartridgeX = supply.cartridgeAxisX + 40
  const stance = [cabinet.stance[0], shiftedY]
  const bodyRadiusMM = 300
  const pipeRadiusMM = entry.completePipeOD / 2
  const settingMM = 10
  const drySideGapToRaisedDripMM = drip.drainY - stance[1] - bodyRadiusMM - drip.formedDiameterMM / 2 - settingMM
  const oldSouthFaceBodyDeficitMM = Math.max(0, cabinet.accessField[2] + bodyRadiusMM - stance[1])
  const shiftedHand = [cabinet.hand[0] + cartridgeX - supply.cartridgeAxisX, cabinet.hand[1], cabinet.hand[2] - dropMM]
  const shoulderZ = trialWorkingFloor + 1450
  const gripReachMM = Math.hypot(shiftedHand[0] - stance[0], shiftedHand[1] - stance[1], shiftedHand[2] - shoulderZ)
  const sourceI0 = geometry.cartridges.find(c => c.id === 'I0')
  const workingUnionZ = entry.point[2] - dropMM
  const spannerSectors = supply.trialEnds.map((y, end) => {
    const [a, b] = sourceI0.sectors[end]
    const samples = Array.from({ length: 1 + (b - a) * 4 }, (_, i) => {
      const angle = (a + i / 4) * Math.PI / 180
      return [cartridgeX - tool.length * Math.cos(angle), y + tool.length * Math.sin(angle), workingUnionZ + 50]
    })
    return Math.max(...samples.map(tip => Math.hypot(tip[0] - stance[0], tip[1] - stance[1], tip[2] - shoulderZ))) + tool.penaltyMM
  })
  const towerX = 12250
  const [entryX, entryY, entryZ] = entry.point
  const shiftedFeed = supply.upstreamVertices.map(([x, y, z], i) => [i >= 2 ? cartridgeX : x, y, z - dropMM - (i < 3 ? 15 : 0)])
  const deliveryVertices = [[cartridgeX, supply.trialEnds[1], workingUnionZ], [towerX, supply.trialEnds[1], workingUnionZ],
    [towerX, entryY, workingUnionZ], [towerX, entryY, entryZ], [entryX, entryY, entryZ]]
  const feed = finiteBends(shiftedFeed, geometry.bendR)
  const delivery = finiteBends(deliveryVertices, geometry.bendR)
  const beam = [section.outerBeamX[0], 0, -630, section.outerBeamX[1] - section.outerBeamX[0], dock.plan[3], 450]
  const formedRadius = entry.protectedRiserRadius
  const towerWestToBeamMM = towerX - formedRadius - section.outerBeamX[1]
  const isolatedPipeGapMM = pathSeparation(feed.path, delivery.path) - 2 * pipeRadiusMM - feed.hausdorffError - delivery.hausdorffError
  const actualDuctGapBeforeSettingsMM = pathSeparation(feed.path, delivery.path) - 2 * formedRadius - feed.hausdorffError - delivery.hausdorffError
  const protectedTowerToDripAfterSettingMM = drip.drainY - entryY - formedRadius - drip.formedDiameterMM / 2 - settingMM
  const deckArrivalReachAfterSettingMM = stance[1] - localFace[2] - bodyRadiusMM - settingMM
  const dryEscapeStartX = localFace[1]
  const paths = [{ x: 12300, offsetMM: 5 }, { x: 12500, offsetMM: 25 }].map(({ x, offsetMM }) => {
    const startY = cabinet.plan[2]
    const runMM = 1500
    const slopeFallMM = runMM / drip.fallRatio
    const crestZ = trayBottomZ + offsetMM
    return { x, startY, endY: startY - runMM, runMM, crestZ, widthMM: response.throatWidthM * 1000,
      maximumTrialTailwaterZ: crestZ - slopeFallMM - 75,
      toDryFieldAfterSettingMM: localFace[0] - x - response.throatWidthM * 500 - settingMM }
  })
  const governingFlow = response.byFlow.at(-1)
  const blockedPrimaryHalfSecondaryHeadMM = response.headM * 1000 * (governingFlow.flowLmin / governingFlow.halfClearControllingLmin) ** (2 / 3)
  const blockedPrimaryWaterZ = paths[1].crestZ + blockedPrimaryHalfSecondaryHeadMM
  const trappedLitresAtThatHead = response.clearTray.widthMM * response.clearTray.depthMM * (blockedPrimaryWaterZ - trayBottomZ) / 1e6
  return { status: 'GRADE_WORKING_MODEL_NOT_ADOPTION', selection: earliest.selection,
    access: { trialWorkingFloor, dropMM, localFace, stance, dryEscapeStartX, gripReachMM, spannerSectors,
      firstRest: { ...cabinet.firstRest, eastwardThrowMM: cabinet.firstRest.x - cartridgeX, packageTopAfterLiftMM: cabinet.firstRest.packageTopAfterLiftMM - dropMM, assumedClearHeadMM: cabinet.firstRest.assumedClearHeadMM - dropMM },
      drySideGapToRaisedDripMM, oldSouthFaceBodyDeficitMM, deckArrivalReachAfterSettingMM,
      protectionFromOutsideFloodAndDripNotVerified: true },
    supply: { shiftedFeed, deliveryVertices, bends: [...feed.bends, ...delivery.bends], workingUnionZ, towerX, cartridgeX,
      towerWestToBeamMM, protectedTowerToDripAfterSettingMM, isolatedPipeGapMM, actualDuctGapBeforeSettingsMM, actualDuctGapAfterSettingsMM: actualDuctGapBeforeSettingsMM - settingMM,
      protectedLowFeedToBeamMM: boxGap(feed.path, beam, formedRadius) - feed.hausdorffError,
      protectedPostCutToBeamMM: boxGap(delivery.path, beam, formedRadius) - delivery.hausdorffError,
      separatelyRenewableProtectedRiseProved: false, retainedWallPassage: entry.point },
    fault: { trayBottomZ, trayTopZ, paths, assumedActualTailwaterZ: null,
      bothPathsBlockedTimeToReserveS: governingFlow.cutTimeBeforeReserveS,
      blockedPrimaryHalfSecondaryHeadMM, blockedPrimaryWaterZ, trappedLitresAtThatHead,
      illustrativeResidualReserveLitres: response.trialNetLitres - trappedLitresAtThatHead,
      independentReceivingAreasProved: false, jetCaptureProved: false,
      dryWorkPathSeparationMM: rangeGap(paths.map(path => path.x), localFace.slice(0, 2)) } }
}

export function gradeCabinetDrawing(result) {
  const x = n => 74 + (n - 11900) * .24
  const y = n => 322 - (n + 1900) * .102
  const planY = n => 514 - (n - 900) * .078
  const line = (x1, y1, x2, y2, colour, width = 2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colour}" stroke-width="${width}"/>`
  const label = (xx, yy, text, size = 13) => `<text x="${xx}" y="${yy}" fill="#263c3b" font-family="sans-serif" font-size="${size}">${text}</text>`
  const rect = (x1, y1, w, h, fill) => `<rect x="${x1}" y="${y1}" width="${w}" height="${h}" fill="${fill}" stroke="#405e59"/>`
  const [cabinetWest, cabinetEast, cabinetSouth, cabinetNorth] = earliest.cabinet.plan
  const [fieldWest, fieldEast, fieldSouth, fieldNorth] = result.access.localFace
  const { workingUnionZ, towerX, cartridgeX } = result.supply
  return `<svg xmlns="http://www.w3.org/2000/svg" width="860" height="560" viewBox="0 0 860 560" role="img" aria-labelledby="title desc">
<title id="title">Ground-level external I0 comparison</title>
<desc id="desc">North-south footprint and east section locate the retained house port, segregated post-valve riser, dry access geometry and separated trial cabinet fault routes.</desc>
<rect width="860" height="560" fill="#f6f4eb"/>
${label(24, 28, 'Retain the house port, work from the ground', 22)}
${label(24, 50, 'Reference geometry and trial levels in millimetres. Site and fabrication unproved.')}
${label(530, 79, 'East section at the inlet axis', 15)}
${rect(x(12000), y(680), x(12090) - x(12000), y(-180) - y(680), '#d7d2bf')}
${line(x(11900), y(-1800), x(13700), y(-1800), '#405e59')}
${rect(x(cabinetWest), y(result.access.firstRest.assumedClearHeadMM), x(cabinetEast) - x(cabinetWest), y(result.fault.trayBottomZ) - y(result.access.firstRest.assumedClearHeadMM), '#d6e4db')}
${line(x(towerX), y(workingUnionZ), x(towerX), y(600), '#174c70', 3)}
${line(x(towerX), y(600), x(12090), y(600), '#174c70', 3)}
${line(x(cartridgeX), y(workingUnionZ), x(towerX), y(workingUnionZ), '#174c70', 3)}
${line(x(cartridgeX), y(workingUnionZ), x(cartridgeX), y(workingUnionZ + 250), '#174c70', 3)}
${line(x(cabinetWest), y(result.fault.trayBottomZ), x(cabinetEast), y(result.fault.trayBottomZ), '#9c5837', 3)}
${label(254, 106, 'Z600 retained house port')}
${label(254, 133, 'Post-I0 enclosed rise at X12250')}
${label(280, y(workingUnionZ + 35), `I0 union at Z${workingUnionZ}`)}
${label(280, y(result.fault.trayBottomZ) + 5, `Fault tray at Z${result.fault.trayBottomZ}`)}
${label(530, y(-1800) + 4, 'Z−1800 comparative working grade')}
${label(530, 340, 'Plan below the raised drip route', 15)}
${rect(x(cabinetWest), planY(cabinetNorth), x(cabinetEast) - x(cabinetWest), planY(cabinetSouth) - planY(cabinetNorth), '#d6e4db')}
${rect(x(fieldWest), planY(fieldNorth), x(fieldEast) - x(fieldWest), planY(fieldSouth) - planY(fieldNorth), '#e4ead7')}
${line(x(12090), planY(drip.drainY), x(13717.5), planY(drip.drainY), '#174c70', 3)}
${result.fault.paths.map(path => line(x(path.x), planY(path.startY), x(path.x), planY(path.endY), '#9c5837', 3)).join('')}
<ellipse cx="${x(result.access.stance[0])}" cy="${planY(result.access.stance[1])}" rx="72" ry="23.4" fill="#778f62" opacity=".45"/>
${label(530, 364, 'Raised gravity-drip pipe at Y2975')}
${label(530, 388, 'Dry standing and module first rest to east')}
${label(530, 412, 'South fault outlets, each with a free reception')}
${label(530, 446, 'Plan separation only. No roof, threshold,')}
${label(530, 464, 'pressure jet or saturated site credit.')}
</svg>\n`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = compareGradeCutCabinet()
  const output = [['json', JSON.stringify(result, null, 2) + '\n'], ['svg', gradeCabinetDrawing(result)]]
  if (process.argv.includes('--write')) for (const [name, content] of output) writeFileSync(drawing(name), content)
  else if (process.argv.includes('--check')) {
    for (const [name, content] of output) if (readFileSync(drawing(name), 'utf8') !== content) throw new Error(`Grade cabinet ${name} changed`)
  } else process.stdout.write(output[0][1])
}
