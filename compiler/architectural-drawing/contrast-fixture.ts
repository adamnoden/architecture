import { compileArchitecturalPlanScene } from './compile-plan.js'
import type { AdeArchitecturalPlan, AdeProvenance } from './model.js'
import { createPlanPaperProjection } from '../publication-drawing/projection.js'
import { mm } from '../units.js'

const p: AdeProvenance = { sourceIds: ['CONTRAST'], authority: 'controlled', precision: 'exact' }
export const contrastPlan = (): AdeArchitecturalPlan => ({
  id: 'ASYMMETRIC-CONTRAST', sourceId: 'NON-RH',
  nodes: [[0, 0], [6300, 0], [6300, 2800], [4100, 2800], [4100, 5300], [0, 5300]].map(([x, y], i) => ({ kind: 'node', id: `N${i}`, point: { x: mm(x), y: mm(y) }, provenance: p })),
  wallAssemblies: [{ kind: 'wall-assembly', id: 'MONO', thickness: { kind: 'exact', value: mm(300) }, provenance: p }],
  walls: Array.from({ length: 6 }, (_, i) => ({ kind: 'wall', id: `W${i}`, fromNodeId: `N${i}`, toNodeId: `N${(i + 1) % 6}`, reference: 'right-face', assemblyId: 'MONO', provenance: p })),
  openings: [{ kind: 'opening', id: 'OPEN', hostWallId: 'W0', role: 'window', centreOffset: { kind: 'exact', value: mm(2000) }, width: { kind: 'range', min: mm(900), max: mm(1200) }, provenance: { ...p, authority: 'provisional', precision: 'range' } }],
  spaces: [], adjacencies: [], labels: [], dimensions: [], partitionDatums: []
})
export const drawContrastPlan = (plan: AdeArchitecturalPlan, scale = 100) => compileArchitecturalPlanScene(plan, {
  profile: { id: 'CONTRAST', output: 'PROOF', scaleDenominator: scale },
  projection: createPlanPaperProjection({ scaleDenominator: scale, modelBounds: { x: 0, y: 0, width: 6300, height: 5300 }, paperOrigin: { x: 20, y: 20 } }),
  widthMm: 180, heightMm: 160, title: 'Asymmetric contrast', resolveAssemblyThicknessMm: () => mm(300),
  resolveLayerThicknessMm: () => { throw new Error('No layers selected') }, openingSide: () => 'right'
})

