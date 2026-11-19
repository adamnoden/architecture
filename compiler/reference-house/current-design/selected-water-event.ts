import { build, readSelected } from '../../../project/rwt/studies/selected-water-event.mjs'
import type { CurrentDesignResolution } from './resolve.js'

/** Resolve the actual HAD geometry and RWT receiver used by the selected event. */
export function readBoundSelectedWaterEvent(resolved: CurrentDesignResolution) {
  const binding = resolved.disciplineBindings.find(value => value.id === 'rwt-conditional-receiving')
  if (!binding) throw new Error('The selected water event requires an applicable RWT source')

  const house = readSelected()
  const receiving = house.model.model.rwtReceivingInterface.source
  for (const { path, blob } of [house, receiving]) {
    if (binding.identities[path] !== blob) {
      throw new Error(`The selected water event input ${path} differs from the resolved RWT source binding`)
    }
  }

  const sourcePath = 'project/rwt/studies/selected-water-event.mjs'
  const gitBlob = binding.identities[sourcePath]
  if (!gitBlob) throw new Error(`Missing resolved method identity for ${sourcePath}`)
  return { house, binding, method: { id: 'RWT-06-SELECTED-WATER-EVENT', sourcePath, gitBlob } }
}

/** Replay the bounded RWT event against an explicitly supplied accepted design. */
export function runSelectedWaterEvent(resolved: CurrentDesignResolution) {
  const { house, binding, method } = readBoundSelectedWaterEvent(resolved)
  return {
    status: 'compiled' as const,
    method,
    source: binding.applicability,
    applicability: { state: binding.state, authority: binding.authority },
    bindingDigest: binding.digest,
    event: JSON.stringify(build(house), null, 2) + '\n',
  }
}
