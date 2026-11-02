import { defineNodes } from '../types.js'

/** Owner-specific material requirement; selection is not a universal material claim. */
export const materialNodes = defineNodes([
  {
    id: 'MAT-00',
    owners: ['MAT'],
    title: 'Establish whole-house material policy and coordinated rainwater rebrief',
    dependencies: ['HRS-BASELINE'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Explicit owner direction on 30 October 2026; bounded policy/programme registration, not house material acceptance.' },
    closeoutEvidence: [
      'docs/reference-house/material-policy.md',
      'project/mat/material-integrity-programme.md',
      'project/mat/material-water-direction-result.md',
      'project/rwt/rainwater-elegance-brief.md'
    ]
  },
  {
    id: 'MAT-AUDIT',
    owners: ['MAT'],
    title: 'Inventory synthetic constituents across visible and concealed house assemblies',
    dependencies: ['MAT-00'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/mat/constituent-audit.md']
  },
  {
    id: 'MAT-ENVELOPE',
    owners: ['MAT'],
    title: 'Resolve non-plastic envelope and structural assembly alternatives',
    dependencies: ['MAT-AUDIT'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'MAT-SERVICES',
    owners: ['MAT'],
    title: 'Resolve non-plastic service systems and disclose functional residues',
    dependencies: ['MAT-AUDIT'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'MAT-INTERIORS',
    owners: ['MAT'],
    title: 'Resolve non-plastic interior and wet-room assembly alternatives',
    dependencies: ['MAT-AUDIT'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: [
      'project/mat/interiors-whole-house-assembly-schedule.md',
      'project/mat/studies/interiors-whole-house-assembly.json',
      'project/mat/interiors-b-wetroom-assembly.md'
    ]
  },
  {
    id: 'MAT-COORDINATION',
    owners: ['MAT'],
    title: 'Reconcile selected-house material compliance and explicit owner exceptions',
    dependencies: ['MAT-ENVELOPE', 'MAT-SERVICES', 'MAT-INTERIORS', 'IAS-03', 'HAD-03', 'OAS-DETAIL', 'ROF-RWT-GATE'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  }
])
