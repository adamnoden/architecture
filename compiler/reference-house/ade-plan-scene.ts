import { compileArchitecturalPlanScene } from '../architectural-drawing/compile-plan.js'
import { createPlanPaperProjection } from '../publication-drawing/projection.js'
import { createReferenceHouseAdePlan } from './ade-plan.js'
import type { LevelId, ReferenceHouseCompileResult, ReferenceHouseSource } from './model.js'
import { mm } from '../units.js'

/** Publication candidate profiles; no terminal token freeze is implied. */
export const createReferenceHouseAdePlanScene = (result: ReferenceHouseCompileResult, source: ReferenceHouseSource, level: LevelId, scale: 100 | 50) => {
  const plan = createReferenceHouseAdePlan(result, source, level)
  const widthMm = scale === 100 ? 140 : 420
  const heightMm = scale === 100 ? 155 : 594
  const origin = scale === 100 ? { x: 16, y: 20 } : { x: 90, y: 155 }
  const scene = compileArchitecturalPlanScene(plan, {
    title: `Reference House ${level === 'GROUND' ? 'ground' : 'first'} floor — ${scale === 100 ? 'BOOK' : 'WALL A2'} 1:${scale}`,
    profile: { id: `${scale === 100 ? 'BOOK' : 'WALL'}-${scale}`, output: scale === 100 ? 'BOOK' : 'WALL', scaleDenominator: scale },
    projection: createPlanPaperProjection({ scaleDenominator: scale,
      modelBounds: { x: 0, y: 0, width: result.derived.shell.width, height: result.derived.shell.depth }, paperOrigin: origin }),
    widthMm, heightMm,
    resolveAssemblyThicknessMm: (a) => mm(a.id === 'RH-ADE-ENVELOPE' ? 417.5 : 125),
    resolveLayerThicknessMm: (l) => {
      if (l.thickness.kind === 'approximate' || l.thickness.kind === 'exact') return l.thickness.value
      if (l.id === 'RH-ADE-CAVITY') return mm(160)
      throw new Error(`Unresolved layer ${l.id}`)
    },
    abutments: { 'RH-PART-DRY-01': ['RH-ADE-ENVELOPE'] },
    openingSide: () => 'right', // Model-right is the weathering side; projection handedness is handled in ADE.
    dimensionOptions: { annotationSide: 'right', offsetPaperMm: 10 },
    labelLayout: (l) => l.id.endsWith('-court-size') ? { dyPaperMm: 4 } : l.id.endsWith('-court-label') ? { dyPaperMm: -1.5 }
      : l.id.endsWith('-stair-note') ? { dyPaperMm: 5 }
        : /G-GAL-01-label|U-GAL-02-label/.test(l.id) ? { rotateDeg: -90 } : l.id === 'U-DRESS-01-label' ? { dxPaperMm: -1 } : l.id === 'U-LIN-01-label' ? { dxPaperMm: 1 } : {}
  })
  // Preserve authored bay axes as reference markers, separate from uncertain aperture extents.
  const frontY = origin.y + result.derived.shell.depth / scale
  result.derived.frontAxes.forEach((axis, i) => {
    const x = origin.x + axis / scale
    scene.primitives.push({ kind: 'line', id: `front-axis-${i + 1}`, a: { x, y: frontY + 6 }, b: { x, y: frontY + 8 }, role: 'secondary', metadata: { authorityClass: 'A+B', sources: source.frontField.id } })
    scene.primitives.push({ kind: 'text', id: `front-axis-label-${i + 1}`, x, y: frontY + 11, value: `B${i + 1}`, role: 'note', anchor: 'middle', metadata: { authorityClass: 'A+B', sources: source.frontField.id } })
  })

  // Direction and scale are paper notation; architecture stays in the semantic plan.
  const y = origin.y + result.derived.shell.depth / scale + 19
  const x = origin.x + result.derived.shell.width / scale - 3000 / scale
  scene.primitives.push({ kind: 'line', id: 'scale-bar', a: { x, y }, b: { x: x + 3000 / scale, y }, role: 'primary', metadata: { authorityClass: 'B', modelSpanMm: 3000 } })
  for (const i of [0, 1, 2, 3]) scene.primitives.push({ kind: 'line', id: `scale-tick-${i}`, a: { x: x + i * 1000 / scale, y: y - 1 }, b: { x: x + i * 1000 / scale, y: y + 1 }, role: 'secondary', metadata: { authorityClass: 'B' } })
  scene.primitives.push({ kind: 'text', id: 'scale-label', x: x + 1500 / scale, y: y + 4, value: '3 m', role: 'note', anchor: 'middle', metadata: { authorityClass: 'B' } })
  scene.primitives.push({ kind: 'text', id: 'north', x: origin.x + 6, y: y + 2, value: 'N ↑', role: 'marker', anchor: 'middle', metadata: { authorityClass: 'B' } })
  return scene
}
