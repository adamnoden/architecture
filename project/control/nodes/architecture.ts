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
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/oas/oas-01e-external-candidates.md', 'project/oas/studies/opening-candidate-budgets.svg']
  },
  {
    id: 'OAS-01I',
    owners: ['OAS'],
    title: 'Internal door assembly candidates',
    dependencies: ['TRIAD-IFACE-FREEZE'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/oas/oas-01i-internal-candidates.md', 'project/oas/studies/opening-candidate-budgets.svg']
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
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ias/ias-02s-services-access.md']
  },
  {
    id: 'IAS-02W',
    owners: ['IAS'],
    title: 'Wet-room and kitchen interior-system variants',
    dependencies: ['IAS-01V', 'IAS-01H', 'HAD-01S'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ias/ias-02w-wet-kitchen-variants.md']
  },
  {
    id: 'IAS-OAS-JUNCTION',
    owners: ['IAS', 'OAS'],
    title: 'Interior-system to opening-assembly junction reconciliation',
    dependencies: ['IAS-01V', 'IAS-01H', 'OAS-01E', 'OAS-01I'],
    lifecycle: 'complete',
    aliases: ['IAS-02O', 'OAS-02I'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/oas/ias-oas-junction.md']
  },
  {
    id: 'IAS-HAD-JUNCTION',
    owners: ['IAS', 'HAD'],
    title: 'Interior-system to architectural-expression reconciliation',
    dependencies: ['IAS-01V', 'IAS-01H', 'HAD-01P', 'HAD-01S'],
    lifecycle: 'complete',
    aliases: ['IAS-02H', 'HAD-02I'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ias/ias-had-junction.md', 'project/ias/ias-candidate-service-handoff.md']
  },
  {
    id: 'OAS-HAD-JUNCTION',
    owners: ['OAS', 'HAD'],
    title: 'Opening-assembly to facade/interior-expression reconciliation',
    dependencies: ['OAS-01E', 'OAS-01I', 'HAD-01E', 'HAD-01P', 'HAD-01S'],
    lifecycle: 'complete',
    aliases: ['OAS-02H', 'HAD-02O'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/oas/oas-had-junction.md']
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
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/had/had-02m-material-finish-synthesis.md', 'project/had/studies/selected-material-family.svg']
  },

  // Wave 3 — per-stream selection / convergence.
  {
    id: 'IAS-03',
    owners: ['IAS'],
    title: 'Selected interior family, drawings and disassembly set',
    dependencies: ['IAS-02S', 'IAS-02W', 'IAS-OAS-JUNCTION', 'IAS-HAD-JUNCTION', 'OAS-NORTH-EXPORT'],
    lifecycle: 'complete',
    aliases: ['IAS Wave 3'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ias/ias-03-selection-closeout.md'],
  },
  {
    id: 'OAS-03',
    owners: ['OAS'],
    title: 'Selected opening family and replacement/reinstatement set',
    dependencies: ['OAS-01E', 'OAS-01I', 'IAS-OAS-JUNCTION', 'OAS-HAD-JUNCTION'],
    lifecycle: 'complete',
    aliases: ['OAS Wave 3'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/oas/oas-03-selection-result.md', 'docs/reference-house/opening-assembly-selection.md', 'project/oas/studies/selected-opening-renewal.svg']
  },
  {
    id: 'HAD-BOUNDARY',
    owners: ['HAD'],
    title: 'Compare the Boundary Service Lodge and accessible external service raceway',
    dependencies: ['HAD-01E', 'DPL-SITE-BRIEF'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/had/boundary-service-lodge-options-result.md']
  },
  {
    id: 'HAD-03',
    owners: ['HAD'],
    title: 'Architectural design convergence and visual synthesis',
    dependencies: ['IAS-HAD-JUNCTION', 'OAS-HAD-JUNCTION', 'HAD-02M'],
    lifecycle: 'complete',
    aliases: ['HAD Wave 3'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/had/had-03-open-north-loggia.md', 'project/had/studies/open-north-loggia.json'],
  },

  // The materials comparison exposes a different heat plant, room duties,
  // cooker cutover and utility first releases than the imported Services model.
  {
    id: 'HAD-SERVICES-ADOPTION',
    owners: ['HAD', 'MAT', 'IAS'],
    title: 'Select and export one service system for the occupied house',
    dependencies: ['MAT-SERVICES', 'HAD-WATER-REPLAN', 'STR-RECONCILE'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/had/inhabited-services-selection.md', 'project/had/studies/current-house-services.json', 'project/had/studies/selected-service-interfaces.svg']
  },

  // RWT-06 rejects the selected common north-mouth failure, not merely a fitting.
  // Registry-only bootstrap under the RWT-06 lease: no HAD geometry is adopted;
  // the successor can be acquired only after this identity exists on main.
  {
    id: 'HAD-WATER-REPLAN',
    owners: ['HAD', 'RWT', 'ROF', 'STR'],
    title: 'Recompose the selected court and roof with independent passive water exits',
    dependencies: ['HAD-03', 'RWT-ROBUSTNESS', 'STR-MASONRY', 'STR-SPANS'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/had/water-replan-result.md', 'project/had/studies/water-replan.json', 'project/had/studies/north-protective-return.svg', 'project/had/studies/maintenance-rain.svg']
  },

  {
    id: 'HAD-COURT-INTAKE',
    owners: ['HAD', 'RWT', 'STR', 'OAS'],
    title: 'Join the east court intake, guarded access and live roof-corner renewal',
    dependencies: ['HAD-WATER-REPLAN', 'STR-HOUSE'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/had/court-intake-selection.md', 'project/had/studies/court-intake-selection.json', 'project/had/studies/court-intake-selection.svg', 'project/had/studies/court-intake-selection-detail.svg']
  },

  // RWT located a different wet body, floor contour and independently supported
  // buried return. The completed intake remains the source for this comparison.
  {
    id: 'HAD-COURT-BYPASS',
    owners: ['HAD', 'RWT', 'STR', 'MAT'],
    title: 'Select the permanent courtyard receiver and its blocked-basket return',
    dependencies: ['HAD-COURT-INTAKE', 'STR-RECONCILE'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/had/receiver-selection.md', 'project/had/studies/receiver-selection.json', 'project/had/studies/receiver-selection.svg', 'project/had/studies/receiver-service.svg']
  },

  // Final audit found the bounded OAS topology did not supply its dimensioned studies.
  {
    id: 'OAS-DETAIL',
    owners: ['OAS'],
    title: 'Representative dimensioned opening interfaces',
    dependencies: ['OAS-03'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/oas/representative-detail-completion.md', 'docs/reference-house/opening-interface-studies.md', 'project/oas/studies/nominal-interface-studies.svg']
  },

  // IAS export exposed an actual occurrence absent from bounded OAS family/nominal studies.
  {
    id: 'OAS-NORTH-EXPORT',
    owners: ['OAS'],
    title: 'FIRST north-window-0 assembly, upper guard and supported removal',
    dependencies: ['OAS-03', 'OAS-DETAIL', 'HAD-03'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/oas/north-export-occurrence-result.md'],
  },

  // Wave 4 — one house, including the separately reconciled roof/water system.
  {
    id: 'TRIAD-GATE',
    owners: ['IAS', 'OAS', 'HAD'],
    title: 'Shared selected-house integration gate',
    dependencies: ['IAS-03', 'OAS-03', 'HAD-03', 'OAS-DETAIL', 'OAS-NORTH-EXPORT', 'ROF-RWT-GATE', 'BCR-PREFLIGHT', 'MAT-COORDINATION', 'STR-RECONCILE', 'STR-FLOOR-PORTAL'],
    lifecycle: 'planned',
    aliases: ['IAS/OAS/HAD Wave 4'],
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/triad-integration-result.md'],
  },
  {
    id: 'BCR-SCAFFOLD',
    owners: ['BCR'],
    title: 'Construction-resolution inventory and matrix scaffolding',
    dependencies: ['BSR-ROOT'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/bcr/bcr-scaffold-result.md'],
  },
  {
    id: 'BCR-CONVERGENCE',
    owners: ['BCR'],
    title: 'Substantive construction-resolution convergence',
    dependencies: ['BCR-SCAFFOLD', 'TRIAD-GATE', 'MRA-04', 'BCR-PROPORTIONALITY', 'HRS-TECHNICAL', 'EPR-REFRESH', 'PHY-APPLICABILITY'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/bcr/bcr-convergence-result.md'],
  },
  {
    id: 'HRS-SYNTHESIS',
    owners: ['HRS'],
    title: 'Post-BCR final house resolution and synthesis',
    dependencies: ['BCR-CONVERGENCE', 'MRA-05', 'PCO-APPLICABILITY', 'DEL-CURRENT', 'EDA-NARRATIVE'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/hrs/hrs-synthesis-result.md'],
  },
  {
    id: 'HRS-BASELINE',
    owners: ['HRS'],
    title: 'Accepted 12 m house identity and historical-evidence applicability',
    dependencies: ['BSR-ROOT'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/hrs/hrs-baseline-result.md']
  },
  {
    id: 'BCR-STRUCTURE',
    owners: ['BCR'],
    title: 'Structure, stair and entry-void feasibility',
    dependencies: ['BCR-SCAFFOLD', 'HRS-BASELINE'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/bcr/bcr-structure-result.md']
  },
  {
    id: 'BCR-WET',
    owners: ['BCR'],
    title: 'Wet-room sections, sanitary fit and foul-drainage feasibility',
    dependencies: ['BCR-SCAFFOLD', 'HRS-BASELINE'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/bcr/bcr-wet-result.md']
  },
  {
    id: 'BCR-SERVICES',
    owners: ['BCR'],
    title: 'Plant, riser, distribution and replacement feasibility',
    dependencies: ['BCR-SCAFFOLD', 'HRS-BASELINE'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/bcr/bcr-services-result.md']
  },
  {
    id: 'BCR-WATER',
    owners: ['BCR'],
    title: 'Roof and courtyard normal/failure water-path feasibility',
    dependencies: ['BCR-SCAFFOLD', 'HRS-BASELINE'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/bcr/bcr-water-result.md']
  },
  {
    id: 'BCR-OCCUPATION',
    owners: ['BCR'],
    title: 'Complete occupation, escape and renewal actions',
    dependencies: ['BCR-SCAFFOLD', 'HRS-BASELINE'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/bcr/bcr-occupation-result.md']
  },
  {
    id: 'BCR-PROPORTIONALITY',
    owners: ['BCR'],
    title: 'Current-house conventional comparator and burden appraisal',
    dependencies: ['BCR-SCAFFOLD', 'HRS-BASELINE'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/bcr/bcr-proportionality-result.md']
  },
  {
    id: 'BCR-PREFLIGHT',
    owners: ['BCR'],
    title: 'Reconcile early feasibility findings into selection constraints',
    dependencies: ['BCR-STRUCTURE', 'BCR-WET', 'BCR-SERVICES', 'BCR-WATER', 'BCR-OCCUPATION'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/bcr/bcr-preflight-result.md']
  },
  {
    id: 'HRS-TECHNICAL',
    owners: ['HRS'],
    title: 'Current-house technical migration and computational applicability',
    dependencies: ['TRIAD-GATE', 'CCR-IDENTITY'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/hrs/hrs-technical-result.md']
  }
])
