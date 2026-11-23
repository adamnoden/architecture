import { scheduleText } from '../../../project/had/studies/current-house.mjs'
import {
  deriveBoundOccupiedServiceHouse, drawBoundOccupiedServiceHouse, occupiedServiceCompositorPath,
} from '../../../project/had/studies/current-house-service-outputs.mjs'
import type { CurrentDesignResolution } from './resolve.js'
import { layoutRevision } from '../georgian/layout-revision.js'
import { compareStairFootprints } from './stair-correspondence.js'

/** Bind the native occupied house to the explicit design and its input receipts. */
export function readBoundOccupiedServices(resolved: CurrentDesignResolution) {
  const binding = resolved.disciplineBindings.find(value => value.id === 'had-occupied-services')
  if (!binding) throw new Error('The occupied-service schedule requires an applicable selected HAD source')
  return { house: deriveBoundOccupiedServiceHouse(binding), binding }
}

function stairCorrespondence(resolved: CurrentDesignResolution, { house, binding }: ReturnType<typeof readBoundOccupiedServices>) {
  const nominalPath = 'compiler/reference-house/georgian/layout-revision.ts'
  const selectedPath = 'project/had/studies/water-replan.json'
  const nominalBinding = resolved.disciplineBindings.find(value => value.id === 'had-selected-water')
  const s = layoutRevision.stair
  return compareStairFootprints({ objectId: `${layoutRevision.id}/return-stair`,
    source: { path: nominalPath, gitBlob: nominalBinding?.identities[nominalPath] ?? '' },
    units: 'mm', datum: 'shell-south-west/source-ground-floor', footprintXYWHMm: [s.x, s.y, s.width, s.length],
    floorDatumsMm: [layoutRevision.levels.ground, layoutRevision.levels.first] },
  { objectId: 'HAD/selected-house/return-stair', source: { path: selectedPath, gitBlob: binding.identities[selectedPath] ?? '' },
    units: 'mm', datum: 'shell-south-west/source-ground-floor', footprintXYWHMm: house.model.stair,
    floorDatumsMm: [house.model.sections.groundFFL, house.model.sections.firstFFL] })
}

function serviceProof<const Id extends string>(binding: ReturnType<typeof readBoundOccupiedServices>['binding'], id: Id,
  correspondence: ReturnType<typeof compareStairFootprints>) {
  const sourcePath = occupiedServiceCompositorPath
  return {
    status: 'compiled' as const,
    method: { id, sourcePath, gitBlob: binding.identities[sourcePath] },
    source: { ...binding.applicability,
      scope: 'The accepted nominal document identifies the request; occupied HAD geometry remains its separately selected development source. Exact nominal-plan applicability and whole-house adoption are not established.' },
    applicability: { state: binding.state, authority: binding.authority,
      nominalPlanApplicability: { state: correspondence.diagnostics.length ? 'withheld-for-source-correspondence' as const : 'stair-correspondence-only' as const,
        diagnostics: correspondence.diagnostics } },
    bindingDigest: binding.digest,
  }
}

/** Run the selected HAD schedule calculation for an explicitly supplied accepted design. */
export function runOccupiedServiceSchedule(resolved: CurrentDesignResolution) {
  const current = readBoundOccupiedServices(resolved)
  const correspondence = stairCorrespondence(resolved, current)
  return { ...serviceProof(current.binding, 'HAD-OCCUPIED-SERVICE-SCHEDULE', correspondence),
    schedule: scheduleText(current.house), stairCorrespondence: correspondence }
}

export function runOccupiedServiceDrawings(resolved: CurrentDesignResolution) {
  const { house, binding } = readBoundOccupiedServices(resolved)
  const correspondence = stairCorrespondence(resolved, { house, binding })
  return {
    schema: 'had-occupied-service-drawings/1' as const,
    ...serviceProof(binding, 'HAD-OCCUPIED-SERVICE-DRAWINGS', correspondence), stairCorrespondence: correspondence,
    ...drawBoundOccupiedServiceHouse(house, binding),
  }
}
