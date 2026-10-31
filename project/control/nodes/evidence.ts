import { defineNodes } from '../types.js'

/**
 * Independent evidence/delivery routes that are live in the programme but are
 * deliberately NOT hard dependencies of BCR until a concrete BCR obligation
 * explicitly earns that edge.
 */
export const evidenceNodes = defineNodes([
  {
    id: 'PHY-01',
    owners: ['PHY'],
    title: 'W2 wall-bay optional physical research',
    dependencies: [],
    lifecycle: 'held',
    aliases: ['P01'],
    agentDispatch: {
      mode: 'manual',
      reason: 'Physical research requires deliberate real-world execution rather than generic agent self-service.'
    },
    closeoutEvidence: []
  },
  {
    id: 'PHY-02',
    owners: ['PHY'],
    title: 'Selective floor-access physical research',
    dependencies: [],
    lifecycle: 'held',
    aliases: ['P02'],
    agentDispatch: {
      mode: 'manual',
      reason: 'Physical research requires deliberate real-world execution rather than generic agent self-service.'
    },
    closeoutEvidence: []
  },
  {
    id: 'PHY-03-ENGINEERING',
    owners: ['PHY'],
    title: 'Structural floor-edge engineering option reduction',
    dependencies: [],
    lifecycle: 'planned',
    aliases: ['PHY-03', 'P03'],
    agentDispatch: {
      mode: 'manual',
      reason: 'The gate requires competent structural-engineering judgement; an agent may assist only when explicitly directed.'
    },
    closeoutEvidence: []
  },
  {
    id: 'PHY-04',
    owners: ['PHY'],
    title: 'Wall/ceiling movement-junction build and test',
    dependencies: [],
    lifecycle: 'planned',
    aliases: ['P04'],
    agentDispatch: {
      mode: 'manual',
      reason: 'The exit gate requires a physical build/test and cannot be completed by a generic repository agent.'
    },
    closeoutEvidence: []
  },
  {
    id: 'EPR-RH11',
    owners: ['EPR'],
    title: 'Obtain and process competent Reference House reviews',
    dependencies: [],
    lifecycle: 'planned',
    aliases: ['RH-11'],
    agentDispatch: {
      mode: 'manual',
      reason: 'Competent independent professional review must be deliberately commissioned/received; it is not generic agent work.'
    },
    closeoutEvidence: []
  },
  {
    id: 'DEL-00',
    owners: ['DEL'],
    title: 'Delivery responsibility and evidence baseline',
    dependencies: [],
    lifecycle: 'complete',
    closeoutEvidence: ['project/del/del-00-delivery-baseline.md']
  }
])
