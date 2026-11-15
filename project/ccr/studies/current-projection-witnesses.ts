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
const [{ intake }, tile, skirting] = await Promise.all([
  compile.readCourtIntakeCase(), compile.studyAssembly({ pitchMm: 450 }), compile.studyAssembly({ skirting: 'service' }),
])
const [[low, high], ...remaining] = intake.route.intervalsYMm
const narrowed = await compile.courtIntake({ ...intake, route: { intervalsYMm: [[low, high - 25], ...remaining] } })
const witnesses = [
  ['court-intake-25mm-narrowing.svg', narrowed.drawing],
  ['study-floor-450mm-plan.svg', tile.plan],
  ['study-service-skirting-section.svg', skirting.section],
] as const
for (const [filename, scene] of witnesses) {
  const path = new URL(filename, import.meta.url)
  const svg = renderDrawingSceneV2Svg(scene)
  if (mode === '--check') assert.equal(readFileSync(path, 'utf8'), svg, 'Stale witness ' + filename)
  else writeFileSync(path, svg)
}
