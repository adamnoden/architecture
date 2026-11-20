import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { renderDrawingSceneV2Svg } from '../../../compiler/publication-drawing-v2/svg.js'
import { prepareCurrentDesignCompile } from '../../../compiler/reference-house/current-design/compile.js'
import { readGeorgianDesignSnapshot } from '../../../compiler/reference-house/current-design/georgian-source.js'

const [mode, ...extra] = process.argv.slice(2)
if (extra.length || (mode !== '--check' && mode !== '--write')) {
  throw new Error('Use --check or --write for the current projection witnesses')
}

const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
const [{ intake }, tile, skirting, heavyTile, linings, openings] = await Promise.all([
  compile.readCourtIntakeCase(), compile.studyAssembly({ pitchMm: 450 }), compile.studyAssembly({ skirting: 'service' }),
  compile.studyAssembly({ wearingFace: 'stone-steel' }),
  compile.studyLinings({ panelPitchMm: 450, backing: 'retain-mineral', slotWidthMm: 5 }),
  compile.renewableOpenings({ schema: 'oas-study-width-case/1', widthMm: 1020 }),
])
const [[low, high], ...remaining] = intake.route.intervalsYMm
const narrowed = await compile.courtIntake({ ...intake, route: { intervalsYMm: [[low, high - 25], ...remaining] } })
const [, south] = await compile.readInletRouteCases()
const raised = await compile.inletRoute({ ...south.inlet, plantSouthLegLevelMm: 2635 })
const { receiving } = await compile.readEastGroundReceivingCase()
const lowered = await compile.eastGroundReceiving({ ...receiving, farEndWaterLevelMm: receiving.farEndWaterLevelMm - 20 })
const { condensate } = await compile.readOccupiedCondensateCase()
const loweredCondensate = await compile.occupiedCondensate({ ...condensate, portLevelMm: 2675 })
const { roof } = await compile.readRoofPitchCase()
const raisedRoof = await compile.roofPitch({ ...roof, pitchDeg: 27 })
const witnesses = [
  ['roof-pitch-27deg-field-section.svg', raisedRoof.drawing],
  ['ground-wc-condensate-25mm-lowering.svg', loweredCondensate.drawing],
  ['east-ground-receiving-20mm-lower.svg', lowered.drawing],
  ['inlet-plant-25mm-raise.svg', raised.drawing],
  ['court-intake-25mm-narrowing.svg', narrowed.drawing],
  ['study-floor-450mm-plan.svg', tile.plan],
  ['study-service-skirting-section.svg', skirting.section],
  ['study-stone-steel-section.svg', heavyTile.section],
  ['study-450mm-panelling.svg', linings.elevation],
  ['study-wall-grille-section.svg', linings.detail],
] as const
const rendered = witnesses.map(([filename, scene]) => [filename, renderDrawingSceneV2Svg(scene)] as const)
for (const [filename, svg] of [...rendered, ['study-window-1020mm-jamb.svg', openings.window.jambSvg] as const]) {
  const path = new URL(filename, import.meta.url)
  if (mode === '--check') assert.equal(readFileSync(path, 'utf8'), svg, 'Stale witness ' + filename)
  else writeFileSync(path, svg)
}
