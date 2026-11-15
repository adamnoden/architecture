import { compileArchitecturalPlanScene } from '../../architectural-drawing/compile-plan.js'
import type { AdeWallAssembly } from '../../architectural-drawing/model.js'
import { createPlanPaperProjection } from '../../publication-drawing/projection.js'
import { mm } from '../../units.js'
import { createOrthogonalPlanModel } from '../georgian/plan.js'
import type { Opening } from '../georgian/source.js'
import type { DesignSnapshot, StoreyId, StoreyObjectId } from './snapshot.js'

const scaleDenominator = 100
export const candidatePlanMethod = { id: 'ORTHOGONAL-CANDIDATE-PLAN-1', scaleDenominator } as const

/** Independent schematic views of the supplied candidate's nominal plan geometry. */
export function createCandidatePlanScene(design: DesignSnapshot, level: StoreyId) {
  const { widthMm, depthMm, court } = design.envelope
  const storey = design.storeys[level]
  const sourceId = design.source.id
  const provenance = { authority: 'provisional', precision: 'approximate', sourceIds: [sourceId] } as const
  const localId = (id: StoreyObjectId) => id.slice(level.length + 1)
  const wallAssembly = (role: 'envelope' | 'partition'): AdeWallAssembly => {
    const id = design.assemblyRefs[role]
    const assembly = design.assemblies.find(value => value.id === id)
    if (!assembly) throw new Error(`Missing nominal ${role} assembly ${id}`)
    return { kind: 'wall-assembly', id, thickness: { kind: 'approximate', value: mm(assembly.depthMm) }, provenance }
  }
  const openings = storey.openings.map((opening): Opening => {
    const base = { id: localId(opening.id), wall: localId(opening.hostWallId),
      centre: opening.centreMm, width: opening.widthMm, kind: opening.kind }
    if (opening.kind === 'window') return base
    const { leaves, swing, hinge } = opening.operation
    return { ...base, leaves, swing, ...(hinge === null ? {} : { hinge }) }
  })
  const envelopeAssembly = wallAssembly('envelope')
  const partitionAssembly = wallAssembly('partition')
  const thickness = (assembly: AdeWallAssembly) => {
    if (assembly.thickness.kind !== 'approximate') throw new Error(`Missing nominal thickness for ${assembly.id}`)
    return assembly.thickness.value
  }
  const plan = createOrthogonalPlanModel(level, {
    id: `${sourceId}-${level}`,
    sourceId,
    widthMm,
    depthMm,
    court,
    partitions: storey.partitions.map(wall => ({ id: localId(wall.id), a: [...wall.from], b: [...wall.to] })),
    openings,
    envelopeAssembly,
    partitionAssembly,
    provenance,
  })
  const longestSwing = Math.max(0, ...storey.openings
    .filter(opening => opening.kind === 'door')
    .map(opening => opening.widthMm / opening.operation.leaves))
  const margin = 10 + (longestSwing + Math.max(thickness(envelopeAssembly), thickness(partitionAssembly))) / scaleDenominator
  const projection = createPlanPaperProjection({
    scaleDenominator,
    modelBounds: { x: 0, y: 0, width: widthMm, height: depthMm },
    paperOrigin: { x: margin, y: margin },
  })
  return compileArchitecturalPlanScene(plan, {
    profile: { ...candidatePlanMethod, output: 'PROOF' },
    projection,
    widthMm: projection.length(widthMm) + 2 * margin,
    heightMm: projection.length(depthMm) + 2 * margin,
    title: `${level} · schematic candidate plan`,
    wallRegionIds: 'assembly-qualified',
    resolveAssemblyThicknessMm: thickness,
    resolveLayerThicknessMm: () => { throw new Error('Candidate plans have no selected wall layers') },
    abutments: plan.walls.some(wall => wall.assemblyId === partitionAssembly.id)
      ? { [partitionAssembly.id]: [envelopeAssembly.id] } : undefined,
    openingSide: () => 'right',
  })
}
