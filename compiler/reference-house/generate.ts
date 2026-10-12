import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import { compileReferenceHouse } from './compile.js'
import { renderReferenceHouseDrawings } from './drawings.js'
import { createReferenceHouseSource } from './fixture.js'

export const RH_C1_DRAWING_PATHS = {
  groundFloor: 'docs/reference-house/rhc1-ground-floor.svg',
  firstFloor: 'docs/reference-house/rhc1-first-floor.svg',
  principalSection: 'docs/reference-house/rhc1-principal-section.svg'
} as const

export const generateReferenceHouseDrawings = (): void => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  if (result.status !== 'PASS') {
    throw new Error(
      `RH-C1 drawing generation requires a PASS compile; got ${result.status}: ${result.diagnostics.map((item) => item.code).join(', ')}`
    )
  }

  const drawings = renderReferenceHouseDrawings(result)
  for (const [key, path] of Object.entries(RH_C1_DRAWING_PATHS) as Array<
    [keyof typeof RH_C1_DRAWING_PATHS, string]
  >) {
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, drawings[key], 'utf8')
  }
}

if (process.argv[1]?.endsWith('generate.ts')) {
  generateReferenceHouseDrawings()
}
