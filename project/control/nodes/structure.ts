import { defineNodes } from '../types.js'

/** Structural design proposition; competent engineering retains its existing owners. */
export const structureNodes = defineNodes([
  {
    id: 'STR-00',
    owners: ['STR'],
    title: 'Establish the structural brief and coordinated architecture programme',
    dependencies: ['HRS-BASELINE'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Explicit owner direction on 30 October 2026; bounded brief/programme registration, not structural acceptance.' },
    closeoutEvidence: [
      'docs/reference-house/structural-brief.md',
      'project/str/structural-architecture-programme.md',
      'project/str/structural-direction-result.md'
    ]
  },
  {
    id: 'STR-MASONRY',
    owners: ['STR'],
    title: 'Compare solid wall roles and genuine masonry opening systems',
    dependencies: ['STR-00'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'STR-SPANS',
    owners: ['STR'],
    title: 'Compare primary floor and roof systems with direct support',
    dependencies: ['STR-00'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: [
      'docs/research/structural-floor-roof-options.md',
      'project/str/str-spans-result.md',
      'project/str/studies/span-envelopes.ts',
      'project/str/studies/span-envelopes.json',
      'project/str/studies/span-envelopes.svg'
    ]
  },
  {
    id: 'STR-HOUSE',
    owners: ['STR', 'HAD'],
    title: 'Coordinate whole-house structure with the inhabited plan and section',
    dependencies: ['STR-MASONRY', 'STR-SPANS', 'BCR-PREFLIGHT'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'STR-RECONCILE',
    owners: ['STR'],
    title: 'Reconcile structural interfaces and affected evidence for house selection',
    dependencies: ['STR-HOUSE'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  }
])
