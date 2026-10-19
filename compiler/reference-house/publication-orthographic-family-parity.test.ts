import assert from 'node:assert/strict'
import test from 'node:test'

import { createReferenceHouseSource } from './fixture.js'
import { referenceHouseCourtGeometry } from './plan-adapter.js'
import { createCourtyardElevationPublicationSource } from './publication-courtyard-elevation-source.js'
import { createFirstFloorPublicationPlanSource } from './publication-first-floor-plan-source.js'
import { createFrontElevationPublicationSource } from './publication-front-elevation-source.js'
import { createGardenElevationPublicationSource } from './publication-garden-elevation-source.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'
import { createPrincipalSectionPublicationSource } from './publication-principal-section-source.js'
import { createRoofDrainagePublicationSource } from './publication-roof-drainage-source.js'
import { createServiceTransverseSectionSource } from './publication-service-section-source.js'
import { createServiceSideElevationPublicationSource } from './publication-service-side-elevation-source.js'
import { createSyntheticSettingPublicationSource } from './publication-synthetic-setting-source.js'

test('DRW-08F freezes one controlled shell and court substrate across the orthographic family', () => {
  const house = createReferenceHouseSource()
  const court = referenceHouseCourtGeometry(house)
  const front = createFrontElevationPublicationSource()
  const garden = createGardenElevationPublicationSource()
  const courtyard = createCourtyardElevationPublicationSource()
  const roof = createRoofDrainagePublicationSource()
  const service = createServiceTransverseSectionSource()
  const serviceSide = createServiceSideElevationPublicationSource()
  const setting = createSyntheticSettingPublicationSource()

  assert.equal(front.facadeWidth.value, house.shell.width.value)
  assert.equal(garden.facadeWidth.value, house.shell.width.value)
  assert.equal(service.substrate.shellWidth.value, house.shell.width.value)
  assert.equal(serviceSide.facadeDepth.value, house.shell.depth.value)
  assert.deepEqual(roof.substrate.shell.value, {
    width: house.shell.width.value,
    depth: house.shell.depth.value
  })
  assert.deepEqual(setting.house.shell.value, roof.substrate.shell.value)

  assert.deepEqual(roof.substrate.court.value, court)
  assert.deepEqual(setting.house.court.value, court)
  assert.deepEqual(courtyard.court.value, {
    width: house.court.value.width,
    depth: house.court.value.depth
  })
})

test('DRW-08F freezes common vertical datums and one roof family across section/elevation sources', () => {
  const house = createReferenceHouseSource()
  const front = createFrontElevationPublicationSource()
  const garden = createGardenElevationPublicationSource()
  const courtyard = createCourtyardElevationPublicationSource()
  const service = createServiceTransverseSectionSource()
  const serviceSide = createServiceSideElevationPublicationSource()
  const roof = createRoofDrainagePublicationSource()

  const expected = {
    groundFfl: house.levels.groundFfl.value,
    groundCeiling: house.levels.groundCeiling.value,
    firstFfl: house.levels.firstFfl.value,
    upperCeiling: house.levels.upperCeiling.value
  }

  for (const [name, levels] of Object.entries({
    front: front.levels,
    garden: garden.levels,
    courtyard: courtyard.levels,
    service: service.substrate.levels,
    serviceSide: serviceSide.levels
  })) {
    assert.equal(levels.groundFfl.value, expected.groundFfl, `${name} ground FFL drifted`)
    assert.equal(levels.groundCeiling.value, expected.groundCeiling, `${name} ground ceiling drifted`)
    assert.equal(levels.firstFfl.value, expected.firstFfl, `${name} first FFL drifted`)
    assert.equal(levels.upperCeiling.value, expected.upperCeiling, `${name} upper ceiling drifted`)
  }

  for (const [name, levels] of Object.entries({
    front: front.levels,
    garden: garden.levels,
    courtyard: courtyard.levels,
    serviceSide: serviceSide.levels
  })) {
    assert.equal(levels.corniceControl.value, house.levels.corniceControl.value, `${name} cornice control drifted`)
    assert.equal(levels.corniceControl.authority, 'PROVISIONAL')
  }

  assert.deepEqual(front.roof.value, house.roof.value)
  assert.deepEqual(garden.roof.value, house.roof.value)
  assert.deepEqual(serviceSide.roof.value, house.roof.value)
  assert.deepEqual(roof.roofFamily.value, house.roof.value)
})

test('DRW-08F freezes garden and courtyard alignment without laundering view-local proxies into 3D authority', () => {
  const house = createReferenceHouseSource()
  const court = referenceHouseCourtGeometry(house)
  const ground = createGroundFloorPublicationPlanSource()
  const first = createFirstFloorPublicationPlanSource()
  const section = createPrincipalSectionPublicationSource()
  const garden = createGardenElevationPublicationSource()
  const courtyard = createCourtyardElevationPublicationSource()

  const gardenAxes = [...garden.axes.value]
  assert.deepEqual(ground.gardenOpenings.map((opening) => opening.centreCoordinate.value), gardenAxes)
  assert.deepEqual(first.gardenOpenings.map((opening) => opening.centreCoordinate.value), gardenAxes)

  const groundGardenCentre = ground.gardenOpenings.find((opening) => opening.id === 'G-GARDEN-CENTRE-PUB-01')
  const elevationGardenCentre = garden.openings.find((opening) => opening.id === 'G-GARDEN-CENTRE')
  const sectionGardenCentre = section.openings.find(
    (opening) => opening.host === 'outer-north' && opening.level === 'GROUND'
  )
  assert.ok(groundGardenCentre && elevationGardenCentre && sectionGardenCentre)
  assert.equal(groundGardenCentre.width.authority, 'PROVISIONAL')
  assert.equal(elevationGardenCentre.width, 'ABSENT')
  assert.equal(elevationGardenCentre.head, 'ABSENT')
  assert.equal(sectionGardenCentre.headAboveLevel.authority, 'PROVISIONAL')
  assert.equal(garden.absent.gardenDoorApertureWidth, 'ABSENT')
  assert.equal(garden.absent.gardenDoorHead, 'ABSENT')

  const southFace = courtyard.faces.find((face) => face.id === 'SOUTH')
  const groundCourtSouth = ground.courtyardOpenings.find((opening) => opening.id === 'G-COURT-SOUTH-PUB-01')
  assert.ok(southFace && groundCourtSouth)
  assert.deepEqual(southFace.axisCoordinates, [house.court.value.width / 2])
  assert.equal(groundCourtSouth.centreCoordinate.value, court.x0 + house.court.value.width / 2)
  assert.equal(groundCourtSouth.width.authority, 'PROVISIONAL')
  assert.equal(southFace.apertureGeometry, 'ABSENT')
  assert.equal(courtyard.absent.southOpeningWidth, 'ABSENT')
})

test('DRW-08F freezes service-side topology against the service section and roof drainage family', () => {
  const house = createReferenceHouseSource()
  const court = referenceHouseCourtGeometry(house)
  const service = createServiceTransverseSectionSource()
  const serviceSide = createServiceSideElevationPublicationSource()
  const roof = createRoofDrainagePublicationSource()

  const middle = serviceSide.fields.find((field) => field.id === 'middle')
  assert.ok(middle)
  assert.deepEqual(middle.extent.value, { y0: court.y0, y1: court.y1 })
  assert.ok(service.view.cutPlaneY >= middle.extent.value.y0 && service.view.cutPlaneY <= middle.extent.value.y1)
  assert.equal(serviceSide.view.facadePlaneX, house.shell.width.value)

  assert.deepEqual(serviceSide.technicalOccurrences.mvhrBoundary, service.externalInterfaces.mvhrBoundary)
  assert.deepEqual(serviceSide.technicalOccurrences.heatPumpBoundary, service.externalInterfaces.heatPumpBoundary)
  assert.deepEqual(
    serviceSide.technicalOccurrences.soilVentRoofContinuation,
    service.externalInterfaces.soilVentRoofContinuation
  )
  assert.equal(
    serviceSide.technicalOccurrences.soilVentRoofContinuation.value.zone,
    roof.roofService.value.zone
  )

  const roofRwpIds = new Set(roof.rwps.map((rwp) => rwp.id))
  assert.ok(roofRwpIds.has(serviceSide.technicalOccurrences.rainwaterReturns.value.south.id))
  assert.ok(roofRwpIds.has(serviceSide.technicalOccurrences.rainwaterReturns.value.north.id))
  assert.equal(serviceSide.technicalOccurrences.rainwaterReturns.value.exactCentrelines, 'ABSENT_TECHNICAL')
  assert.ok(roof.rwps.every((rwp) => rwp.exactPosition === 'ABSENT'))
})

test('DRW-08F keeps the synthetic setting outside the orthographic geometry freeze where real site facts are absent', () => {
  const setting = createSyntheticSettingPublicationSource()

  assert.equal(setting.view.value.scale, 200)
  assert.equal(setting.absences.plotDepth, 'ABSENT')
  assert.equal(setting.absences.legalBoundary, 'ABSENT')
  assert.equal(setting.absences.geographicNorth, 'ABSENT')
  assert.equal(setting.absences.topography, 'ABSENT')
  assert.equal(setting.laterOverlay.owner, 'DRW-10D')
  assert.equal(setting.laterOverlay.geometryAuthority, 'NOT_PART_OF_SETTING_SUBSTRATE')
})
