import { defineNodes } from '../types.js'

/** Owner-house delivery route. Publication completion is not a prerequisite. */
export const houseDeliveryNodes = defineNodes([
  {
    id: 'DEL-BRIEF', owners: ['DEL'], title: 'Reconcile owner requirements and open project decisions',
    dependencies: [], lifecycle: 'complete', agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/del/owner-brief-result.md']
  },
  {
    id: 'DEL-ISSUE-PROFILES', owners: ['DEL'], title: 'Define purpose-specific information and issue requirements',
    dependencies: [], lifecycle: 'complete', agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/del/issue-profiles-result.md']
  },
  {
    id: 'ADE-DELIVERY-AUDIT', owners: ['ADE'], title: 'Map construction-information needs to existing capabilities',
    dependencies: [], lifecycle: 'complete', agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ade/delivery-audit-result.md']
  },
  {
    id: 'BCR-BAY-BRIEF', owners: ['BCR'], title: 'Select one consequential construction bay and its proof obligations',
    dependencies: ['DEL-BRIEF', 'HRS-BASELINE', 'BCR-PREFLIGHT'], lifecycle: 'complete', agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/bcr/bay-brief-result.md']
  },
  {
    id: 'BCR-BAY-DESIGN', owners: ['BCR'], title: 'Resolve the selected bay as a coordinated design study',
    dependencies: ['BCR-BAY-BRIEF', 'TRIAD-GATE'], lifecycle: 'planned', agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/bcr/bay-design-result.md']
  },
  // Owner-directed ADE section-view uplift, 31 Oct 2026 (#1187).
  // Exceptional registry-only bootstrap: these nodes must exist on main before an
  // ACO claim can be safely written without blocking dispatcher on an unknown ID.
  {
    id: 'ADE-SECTION-VIEW', owners: ['ADE'],
    title: 'Prove source-owned orthographic cut, context and occlusion semantics',
    dependencies: ['ADE-DELIVERY-AUDIT'], lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed section-view engine uplift; prove generality before Reference House migration.' },
    closeoutEvidence: ['project/ade/section-view-result.md']
  },
  {
    id: 'ADE-SECTION-PARITY', owners: ['ADE'],
    title: 'Migrate principal and service sections to source-bound visible geometry and cross-view parity',
    dependencies: ['ADE-SECTION-VIEW', 'PLT-CURRENT-REVIEW'], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ade/section-parity-result.md']
  },
  {
    id: 'ADE-MODEL', owners: ['ADE'], title: 'Connect current design identities to construction-information outputs',
    dependencies: ['ADE-DELIVERY-AUDIT', 'HRS-TECHNICAL'], lifecycle: 'planned', agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ade/model-integration-result.md']
  },
  {
    id: 'ADE-DETAILS', owners: ['ADE'], title: 'Produce source-bound technical bay drawings and details',
    dependencies: ['ADE-MODEL', 'BCR-BAY-DESIGN'], lifecycle: 'planned', agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ade/detail-output-result.md']
  },
  {
    id: 'ADE-SCHEDULES', owners: ['ADE'], title: 'Produce linked bay schedules specifications and quantities',
    dependencies: ['ADE-MODEL', 'BCR-BAY-DESIGN'], lifecycle: 'planned', agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ade/schedule-output-result.md']
  },
  {
    id: 'ADE-EVIDENCE', owners: ['ADE'], title: 'Bind bay calculations and external evidence to controlling inputs',
    dependencies: ['ADE-DELIVERY-AUDIT', 'BCR-BAY-DESIGN', 'CCR-IDENTITY', 'PCO-APPLICABILITY'], lifecycle: 'planned', agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ade/evidence-integration-result.md']
  },
  {
    id: 'DEL-BAY-PACK', owners: ['DEL'], title: 'Assemble one coherent construction-bay review issue',
    dependencies: ['ADE-DETAILS', 'ADE-SCHEDULES', 'ADE-EVIDENCE', 'DEL-ISSUE-PROFILES'], lifecycle: 'planned', agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/del/bay-pack-result.md']
  },
  {
    id: 'EPR-BAY-REVIEW', owners: ['EPR'], title: 'Obtain and disposition actual designer and contractor bay feedback',
    dependencies: ['DEL-BAY-PACK'], lifecycle: 'planned',
    agentDispatch: { mode: 'manual', reason: 'Requires real competent practitioner responses and any separately authorised commissioning; agents cannot simulate review or authorise spend.' },
    closeoutEvidence: ['project/epr/bay-review-result.md']
  },
  {
    id: 'DPL-SITE-BRIEF', owners: ['DPL'], title: 'Derive owner-house plot criteria and evidence requirements',
    dependencies: ['DEL-BRIEF', 'HRS-BASELINE'], lifecycle: 'complete', agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/dpl/owner-site-brief.md']
  },
  {
    id: 'DPL-COMMISSION', owners: ['DPL'], title: 'Receive owner-nominated real plot and authorised assessment scope',
    dependencies: ['DPL-SITE-BRIEF'], lifecycle: 'planned',
    agentDispatch: { mode: 'manual', reason: 'Needs an actual owner-nominated plot and authorised study scope; a hypothetical site cannot satisfy this gate.' },
    closeoutEvidence: ['project/dpl/commission-activation.md']
  },
  {
    id: 'DPL-SITE-ASSESSMENT', owners: ['DPL'], title: 'Assess actual site applicability and explicit adaptation choices',
    dependencies: ['DPL-COMMISSION'], lifecycle: 'planned', agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/dpl/site-assessment-result.md']
  },
  {
    id: 'DEL-COMMISSION-PLAN', owners: ['DEL'], title: 'Register grounded whole-house design construction and handover packets',
    dependencies: ['DPL-SITE-ASSESSMENT', 'DEL-BAY-PACK'], lifecycle: 'planned', agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/del/commission-execution-plan.md']
  }
])
