import type { ServiceTopologySource } from '../service-slice/model.js'
import { mm } from '../units.js'

export const applyReferenceHouseServiceCoordinationAuthority = (
  source: ServiceTopologySource
): ServiceTopologySource => {
  const result = structuredClone(source)
  const riser = result.nodes.find((item) => item.id === 'SV-01')
  if (!riser) throw new Error('RH-C3 source is missing SV-01.')
  if (!riser.coordinationEnvelope) {
    riser.coordinationEnvelope = {
      width: mm(900),
      depth: mm(700),
      structuralInterruptionId: 'PEN-SV-01'
    }
  }
  return result
}
