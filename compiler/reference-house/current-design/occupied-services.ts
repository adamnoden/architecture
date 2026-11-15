import { stableJsonStringify } from '../../core/identity.js'
import { deriveCurrentHouse, scheduleText } from '../../../project/had/studies/current-house.mjs'
import type { CurrentDesignResolution } from './resolve.js'

/** Run the selected HAD schedule calculation for an explicitly supplied accepted design. */
export function runOccupiedServiceSchedule(resolved: CurrentDesignResolution) {
  const binding = resolved.disciplineBindings.find(value => value.id === 'had-occupied-services')
  if (!binding) throw new Error('The occupied-service schedule requires an applicable selected HAD source')

  const house = deriveCurrentHouse()
  if (stableJsonStringify(house.inputs) !== stableJsonStringify(binding.inputReceiptIdentities)) {
    throw new Error('The occupied-service compositor used inputs outside the resolved HAD source binding')
  }

  const sourcePath = 'project/had/studies/current-house.mjs'
  const gitBlob = binding.identities[sourcePath]
  if (!gitBlob) throw new Error(`Missing resolved method identity for ${sourcePath}`)
  return {
    status: 'compiled' as const,
    method: { id: 'HAD-OCCUPIED-SERVICE-SCHEDULE', sourcePath, gitBlob },
    source: binding.applicability,
    applicability: { state: binding.state, authority: binding.authority },
    bindingDigest: binding.digest,
    schedule: scheduleText(house),
  }
}
