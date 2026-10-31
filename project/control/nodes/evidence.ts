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
    title: 'Internal floor-edge research, calculations and provisional option reduction',
    dependencies: ['PHY-APPLICABILITY'],
    lifecycle: 'complete',
    aliases: ['PHY-03', 'P03'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/phy/floor-edge-internal-study.md']
  },
  {
    id: 'PHY-04',
    owners: ['PHY'],
    title: 'Wall/ceiling movement-junction build and test',
    dependencies: ['PHY-APPLICABILITY'],
    lifecycle: 'planned',
    aliases: ['P04'],
    agentDispatch: {
      mode: 'manual',
      reason: 'The exit gate requires a physical build/test and cannot be completed by a generic repository agent.'
    },
    closeoutEvidence: []
  },
  {
    id: 'EPR-DESK-REVIEW',
    owners: ['EPR'],
    title: 'Answer current-house technical review questions through internal evidence and challenge',
    dependencies: ['EPR-REFRESH'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/epr/internal-technical-review.md']
  },
  {
    id: 'EPR-RH11',
    owners: ['EPR'],
    title: 'Obtain and process competent Reference House reviews',
    dependencies: ['EPR-REFRESH'],
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
  },
  {
    id: 'EPR-REFRESH',
    owners: ['EPR'],
    title: 'Refresh current-house review briefs and questions',
    dependencies: ['HRS-BASELINE', 'BCR-PREFLIGHT'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/epr/current-house-review-applicability.md']
  },
  {
    id: 'PHY-APPLICABILITY',
    owners: ['PHY'],
    title: 'Reconcile prototype applicability and earned evidence requirements',
    dependencies: ['HRS-BASELINE', 'BCR-PREFLIGHT'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/phy/current-house-prototype-applicability.md']
  },
  {
    id: 'DEL-CURRENT',
    owners: ['DEL'],
    title: 'Reconcile selected-house delivery and reinstatement requirements',
    dependencies: ['BCR-CONVERGENCE'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/del/current-house-delivery-result.md']
  }
])
