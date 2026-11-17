import { scheduleText } from '../../../project/had/studies/current-house.mjs'
import {
  deriveBoundOccupiedServiceHouse, drawBoundOccupiedServiceHouse, occupiedServiceCompositorPath,
} from '../../../project/had/studies/current-house-service-outputs.mjs'
import type { CurrentDesignResolution } from './resolve.js'

/** Bind the native occupied house to the explicit design and its input receipts. */
export function readBoundOccupiedServices(resolved: CurrentDesignResolution) {
  const binding = resolved.disciplineBindings.find(value => value.id === 'had-occupied-services')
  if (!binding) throw new Error('The occupied-service schedule requires an applicable selected HAD source')
  return { house: deriveBoundOccupiedServiceHouse(binding), binding }
}

function serviceProof<const Id extends string>(binding: ReturnType<typeof readBoundOccupiedServices>['binding'], id: Id) {
  const sourcePath = occupiedServiceCompositorPath
  return {
    status: 'compiled' as const,
    method: { id, sourcePath, gitBlob: binding.identities[sourcePath] },
    source: binding.applicability,
    applicability: { state: binding.state, authority: binding.authority },
    bindingDigest: binding.digest,
  }
}

/** Run the selected HAD schedule calculation for an explicitly supplied accepted design. */
export function runOccupiedServiceSchedule(resolved: CurrentDesignResolution) {
  const { house, binding } = readBoundOccupiedServices(resolved)
  return { ...serviceProof(binding, 'HAD-OCCUPIED-SERVICE-SCHEDULE'), schedule: scheduleText(house) }
}

export function runOccupiedServiceDrawings(resolved: CurrentDesignResolution) {
  const { house, binding } = readBoundOccupiedServices(resolved)
  return {
    schema: 'had-occupied-service-drawings/1' as const,
    ...serviceProof(binding, 'HAD-OCCUPIED-SERVICE-DRAWINGS'),
    ...drawBoundOccupiedServiceHouse(house, binding),
  }
}
