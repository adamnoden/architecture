import { defineNodes } from '../types.js'

export const roofWaterNodes = defineNodes([
  // ROF — roof systems architecture.
  {
    id: 'ROF-00',
    owners: ['ROF'],
    title: 'Roof constitution, baseline and inherited constraints',
    dependencies: ['BSR-ROOT'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/rof/rof-00-baseline-and-constraints.md']
  },
  {
    id: 'ROF-01',
    owners: ['ROF'],
    title: 'Roof evidence, failure model and evaluation frame',
    dependencies: ['ROF-00'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/rof/rof-01-evidence-and-evaluation.md']
  },
  {
    id: 'ROF-02',
    owners: ['ROF'],
    title: 'Roof topology and geometry families',
    dependencies: ['ROF-01'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/rof/rof-02-topology-and-geometry.md']
  },
  {
    id: 'ROF-03',
    owners: ['ROF'],
    title: 'Roof covering-system families',
    dependencies: ['ROF-01'],
    lifecycle: 'complete',
    aliases: ['ROF-03A', 'ROF-03B', 'ROF-03C'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/rof/rof-03-covering-system-families.md']
  },
  {
    id: 'ROF-04',
    owners: ['ROF'],
    title: 'Roof assembly beneath the covering',
    dependencies: ['ROF-01'],
    lifecycle: 'complete',
    aliases: ['ROF-04A', 'ROF-04B'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/rof/rof-04-assembly-and-support.md']
  },
  {
    id: 'ROF-05',
    owners: ['ROF'],
    title: 'Roof junction and penetration families',
    dependencies: ['ROF-02', 'ROF-03', 'ROF-04'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/rof/rof-05-junctions-and-penetrations.md']
  },
  {
    id: 'ROF-06',
    owners: ['ROF'],
    title: 'Roof access, maintenance, repair and renewal',
    dependencies: ['ROF-05'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/rof/rof-06-access-maintenance-renewal.md']
  },
  {
    id: 'ROF-07',
    owners: ['ROF'],
    title: 'Roof system synthesis and candidate families',
    dependencies: ['ROF-05', 'ROF-06'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/rof/rof-07-system-synthesis.md']
  },

  // RWT — building-side rainwater systems architecture.
  {
    id: 'RWT-00',
    owners: ['RWT'],
    title: 'Rainwater constitution, baseline and interfaces',
    dependencies: ['BSR-ROOT'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/rwt/rwt-00-baseline-and-interfaces.md']
  },
  {
    id: 'RWT-01',
    owners: ['RWT'],
    title: 'Rainfall and hydraulic basis',
    dependencies: ['RWT-00'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/rwt/rwt-01-rainfall-and-hydraulic-basis.md']
  },
  {
    id: 'RWT-02',
    owners: ['RWT'],
    title: 'Rainwater collection architecture',
    dependencies: ['RWT-01'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/rwt/rwt-02-collection-architecture.md']
  },
  {
    id: 'RWT-03',
    owners: ['RWT'],
    title: 'Rainwater conveyance topology',
    dependencies: ['RWT-01'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/rwt/rwt-03-conveyance-topology.md']
  },
  {
    id: 'RWT-04',
    owners: ['RWT'],
    title: 'Rainwater materials, joints and compatibility',
    dependencies: ['RWT-01'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/rwt/rwt-04-materials-joints-compatibility.md']
  },
  {
    id: 'RWT-05',
    owners: ['RWT'],
    title: 'Rainwater blockage, failure and exceedance',
    dependencies: ['RWT-02', 'RWT-03', 'RWT-04'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/rwt/rwt-05-blockage-failure-exceedance.md']
  },
  {
    id: 'RWT-06',
    owners: ['RWT'],
    title: 'Rainwater access, courtyard transition and site handoff',
    dependencies: ['RWT-03', 'RWT-05'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },

  // Owner-directed successor questions; original research remains historical evidence.
  {
    id: 'RWT-SHED',
    owners: ['RWT', 'ROF', 'HAD'],
    title: 'Develop free-shedding edges and planted ground-receiver comparisons',
    dependencies: ['MAT-00', 'RWT-01', 'ROF-02'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: [
      'docs/research/roof-shedding-and-ground-receivers.md',
      'project/rwt/rwt-shed-result.md',
      'project/rwt/studies/free-shedding.ts',
      'project/rwt/studies/free-shedding.json',
      'project/rwt/studies/free-shedding.svg'
    ]
  },
  {
    id: 'RWT-METALS',
    owners: ['RWT'],
    title: 'Develop copper collection, brass channels and non-plastic concealed routes',
    dependencies: ['MAT-00', 'RWT-04'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/rwt/rwt-metals-option-disposition.md']
  },
  {
    id: 'RWT-ROBUSTNESS',
    owners: ['RWT'],
    title: 'Test full-duty independent paths, reserve and common-cause rainwater failures',
    dependencies: ['RWT-SHED', 'RWT-METALS', 'RWT-05'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/rwt/rwt-robustness-result.md']
  },
  {
    id: 'RWT-07',
    owners: ['RWT'],
    title: 'Rainwater network synthesis and Reference House candidates',
    dependencies: ['RWT-02', 'RWT-03', 'RWT-04', 'RWT-05', 'RWT-06', 'ROF-02', 'RWT-SHED', 'RWT-METALS', 'RWT-ROBUSTNESS'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },

  // Shared integration remains distinct from the IAS/OAS/HAD triad.
  {
    id: 'ROF-RWT-GATE',
    owners: ['ROF', 'RWT', 'HAD'],
    title: 'Reference House roof and rainwater reconciliation gate',
    dependencies: ['ROF-07', 'RWT-07', 'HAD-03', 'OAS-03', 'OAS-DETAIL', 'STR-RECONCILE'],
    lifecycle: 'planned',
    aliases: ['ROOF-WATER-GATE'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },

  // Formalisation is deliberately downstream and not on the house-integration critical path.
  {
    id: 'ROF-09',
    owners: ['ROF'],
    title: 'Roof formalisation and regression admission',
    dependencies: ['ROF-RWT-GATE'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'RWT-08',
    owners: ['RWT'],
    title: 'Rainwater formalisation and regression admission',
    dependencies: ['ROF-RWT-GATE'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  }
])
