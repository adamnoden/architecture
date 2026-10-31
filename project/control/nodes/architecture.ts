import { defineNodes } from '../types.js'

export const architectureNodes = defineNodes([
  {
    id: 'BSR-ROOT',
    owners: ['BSR'],
    title: 'Book structure root and authority handoff',
    dependencies: [],
    lifecycle: 'complete',
    aliases: ['BSR-00…BSR-03'],
    closeoutEvidence: ['project/book-resolution-programme.md']
  },

  // Wave 0 — constitutions / baselines.
  {
    id: 'IAS-00',
    owners: ['IAS'],
    title: 'Interior architecture baseline, challengers and invariants',
    dependencies: ['BSR-ROOT'],
    lifecycle: 'complete',
    closeoutEvidence: ['project/ias/ias-00-baseline-and-challengers.md']
  },
  {
    id: 'OAS-00',
    owners: ['OAS'],
    title: 'Opening taxonomy, baselines and invariants',
    dependencies: ['BSR-ROOT'],
    lifecycle: 'complete',
    closeoutEvidence: ['project/oas/oas-00-baseline-and-invariants.md']
  },
  {
    id: 'HAD-00',
    owners: ['HAD'],
    title: 'Architectural brief, hierarchy and invariants',
    dependencies: ['BSR-ROOT'],
    lifecycle: 'complete',
    closeoutEvidence: ['project/had/had-00-brief-result.md', 'docs/reference-house/architectural-design-brief.md']
  },

  // Wave 0.5 — one shared interface contract, not three duplicated tasks.
  {
    id: 'TRIAD-IFACE-FREEZE',
    owners: ['IAS', 'OAS', 'HAD'],
    title: 'Shared IAS/OAS/HAD interface freeze',
    dependencies: ['IAS-00', 'OAS-00', 'HAD-00'],
    lifecycle: 'complete',
    aliases: ['IAS/OAS/HAD Wave 0.5'],
    closeoutEvidence: ['project/triad-interface-contract.md']
  },

  // Wave 1 — genuinely independent core exploration.
  {
    id: 'IAS-01V',
    owners: ['IAS'],
    title: 'Vertical interior system candidates',
    dependencies: ['TRIAD-IFACE-FREEZE'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ias/ias-01v-vertical-candidates.md', 'project/ias/studies/ias-core-sections.svg']
  },
  {
    id: 'IAS-01H',
    owners: ['IAS'],
    title: 'Horizontal interior system candidates',
    dependencies: ['TRIAD-IFACE-FREEZE'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ias/ias-01h-horizontal-candidates.md', 'project/ias/studies/ias-core-sections.svg']
  },
  {
    id: 'OAS-01E',
    owners: ['OAS'],
    title: 'Envelope openings, external doors, thresholds and boundary candidates',
    dependencies: ['TRIAD-IFACE-FREEZE'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'OAS-01I',
    owners: ['OAS'],
    title: 'Internal door assembly candidates',
    dependencies: ['TRIAD-IFACE-FREEZE'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'HAD-01E',
    owners: ['HAD'],
    title: 'Exterior and courtyard architectural design',
    dependencies: ['TRIAD-IFACE-FREEZE'],
    lifecycle: 'complete',
    closeoutEvidence: ['project/had/had-01e-exterior-candidates.md', 'project/had/studies/exterior-candidates.svg', 'project/had/studies/courtyard-candidates.svg']
  },
  {
    id: 'HAD-01P',
    owners: ['HAD'],
    title: 'Principal-interior architectural design',
    dependencies: ['TRIAD-IFACE-FREEZE'],
    lifecycle: 'complete',
    closeoutEvidence: ['project/had/had-01p-principal-interior-candidates.md', 'project/had/studies/principal-wall-candidates.svg']
  },
  {
    id: 'HAD-01S',
    owners: ['HAD'],
    title: 'Private and service-interior architectural design',
    dependencies: ['TRIAD-IFACE-FREEZE'],
    lifecycle: 'complete',
    closeoutEvidence: ['project/had/had-01s-private-service-candidates.md', 'project/had/had-01-candidate-handoff.md']
  },

  // Wave 2 — stream-specific burdens and canonical shared interfaces.
  {
    id: 'IAS-02S',
    owners: ['IAS'],
    title: 'Interior services and access family',
    dependencies: ['IAS-01V', 'IAS-01H'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'IAS-02W',
    owners: ['IAS'],
    title: 'Wet-room and kitchen interior-system variants',
    dependencies: ['IAS-01V', 'IAS-01H', 'HAD-01S'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'IAS-OAS-JUNCTION',
    owners: ['IAS', 'OAS'],
    title: 'Interior-system to opening-assembly junction reconciliation',
    dependencies: ['IAS-01V', 'IAS-01H', 'OAS-01E', 'OAS-01I'],
    lifecycle: 'planned',
    aliases: ['IAS-02O', 'OAS-02I'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'IAS-HAD-JUNCTION',
    owners: ['IAS', 'HAD'],
    title: 'Interior-system to architectural-expression reconciliation',
    dependencies: ['IAS-01V', 'IAS-01H', 'HAD-01P', 'HAD-01S'],
    lifecycle: 'planned',
    aliases: ['IAS-02H', 'HAD-02I'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'OAS-HAD-JUNCTION',
    owners: ['OAS', 'HAD'],
    title: 'Opening-assembly to facade/interior-expression reconciliation',
    dependencies: ['OAS-01E', 'OAS-01I', 'HAD-01E', 'HAD-01P', 'HAD-01S'],
    lifecycle: 'planned',
    aliases: ['OAS-02H', 'HAD-02O'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'HAD-02M',
    owners: ['HAD'],
    title: 'Material and finish synthesis',
    dependencies: [
      'HAD-01E',
      'HAD-01P',
      'HAD-01S',
      'IAS-HAD-JUNCTION',
      'OAS-HAD-JUNCTION'
    ],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },

  // Wave 3 — per-stream selection / convergence.
  {
    id: 'IAS-03',
    owners: ['IAS'],
    title: 'Selected interior family, drawings and disassembly set',
    dependencies: ['IAS-02S', 'IAS-02W', 'IAS-OAS-JUNCTION', 'IAS-HAD-JUNCTION'],
    lifecycle: 'planned',
    aliases: ['IAS Wave 3'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'OAS-03',
    owners: ['OAS'],
    title: 'Selected opening family and replacement/reinstatement set',
    dependencies: ['OAS-01E', 'OAS-01I', 'IAS-OAS-JUNCTION', 'OAS-HAD-JUNCTION'],
    lifecycle: 'planned',
    aliases: ['OAS Wave 3'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'HAD-03',
    owners: ['HAD'],
    title: 'Architectural design convergence and visual synthesis',
    dependencies: ['IAS-HAD-JUNCTION', 'OAS-HAD-JUNCTION', 'HAD-02M'],
    lifecycle: 'planned',
    aliases: ['HAD Wave 3'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },

  // Wave 4 — one house, then construction-resolution convergence.
  {
    id: 'TRIAD-GATE',
    owners: ['IAS', 'OAS', 'HAD'],
    title: 'Shared selected-house integration gate',
    dependencies: ['IAS-03', 'OAS-03', 'HAD-03'],
    lifecycle: 'planned',
    aliases: ['IAS/OAS/HAD Wave 4'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'BCR-SCAFFOLD',
    owners: ['BCR'],
    title: 'Construction-resolution inventory and matrix scaffolding',
    dependencies: ['BSR-ROOT'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'BCR-CONVERGENCE',
    owners: ['BCR'],
    title: 'Substantive construction-resolution convergence',
    dependencies: ['BCR-SCAFFOLD', 'TRIAD-GATE', 'MRA-04'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'HRS-SYNTHESIS',
    owners: ['HRS'],
    title: 'Post-BCR final house resolution and synthesis',
    dependencies: ['BCR-CONVERGENCE', 'MRA-05'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  }
])
