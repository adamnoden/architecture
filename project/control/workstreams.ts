export interface WorkstreamDefinition {
  code: string
  title: string
  issue?: number
  programme?: string
  aliases?: readonly string[]
}

const workstreamRegistry = [
  { code: 'ACO', title: 'Agent Claim Orchestration', issue: 960, programme: 'project/aco/agent-claim-orchestration-programme.md' },
  { code: 'ADE', title: 'Architectural Drawing Engine', issue: 1008, programme: 'project/ade/construction-information-programme.md' },
  {
    code: 'BCR',
    title: 'Buildability & Construction Resolution',
    issue: 944,
    programme: 'project/bcr/buildability-construction-resolution-programme.md'
  },
  { code: 'CCR', title: 'Compiler Correctness Repair', issue: 1004, programme: 'project/ccr/compiler-correctness-repair-programme.md' },
  { code: 'BSR', title: 'Book Structure Refactor', issue: 940, programme: 'project/book-resolution-programme.md' },
  {
    code: 'DEL',
    title: 'Delivery requirements',
    issue: 854,
    programme: 'project/del/delivery-programme.md'
  },
  {
    code: 'DPL',
    title: 'Deployment / real-site design study',
    issue: 1009,
    programme: 'project/dpl/owner-house-site-programme.md'
  },
  { code: 'DRW', title: 'Architectural drawing programme' },
  { code: 'EDA', title: 'Editorial Doctrine Audit', issue: 1005, programme: 'docs/editorial/eda-programme.md' },
  { code: 'EPR', title: 'External professional review', issue: 913, programme: 'project/epr/external-professional-review-programme.md' },
  {
    code: 'HAD',
    title: 'House Architectural Design',
    issue: 943,
    programme: 'project/had/house-architectural-design-programme.md'
  },
  { code: 'HFI', title: 'Human factors / low-friction inhabitation' },
  {
    code: 'HRS',
    title: 'House Resolution & Synthesis',
    issue: 945,
    programme: 'project/hrs/house-resolution-synthesis-programme.md'
  },
  {
    code: 'IAS',
    title: 'Interior Architecture System',
    issue: 941,
    programme: 'project/ias/interior-architecture-system-programme.md'
  },
  { code: 'ILA', title: 'ILA workstream' },
  {
    code: 'MAT',
    title: 'Material Integrity and Synthetic-Polymer Avoidance',
    issue: 1100,
    programme: 'project/mat/material-integrity-programme.md'
  },
  {
    code: 'MRA',
    title: 'Moisture Resilience Assurance',
    issue: 959,
    programme: 'project/mra/moisture-resilience-assurance-programme.md'
  },
  {
    code: 'OAS',
    title: 'Opening Assembly System',
    issue: 942,
    programme: 'project/oas/opening-assembly-system-programme.md'
  },
  { code: 'OCG', title: 'OCG workstream' },
  {
    code: 'PCO',
    title: 'Project Control & Orchestration',
    issue: 953,
    programme: 'project/pco/project-control-orchestration-programme.md'
  },
  {
    code: 'PHY',
    title: 'Physical validation',
    issue: 912,
    programme: 'docs/development/tectonic-prototype-programme.md',
    aliases: ['P01…P04']
  },
  { code: 'PLT', title: 'Architectural Plate Refinement', issue: 422 },
  { code: 'PUB', title: 'Publication credibility and release', issue: 71, aliases: ['PR'] },
  {
    code: 'ROF',
    title: 'Roof Systems Architecture',
    issue: 991,
    programme: 'project/rof/roof-systems-programme.md'
  },
  {
    code: 'RWT',
    title: 'Rainwater Systems Architecture',
    issue: 992,
    programme: 'project/rwt/rainwater-systems-programme.md'
  },
  {
    code: 'STR',
    title: 'Structural Architecture',
    issue: 1103,
    programme: 'project/str/structural-architecture-programme.md'
  },
  { code: 'SWE', title: 'Software Reliability and Efficiency', issue: 1174, programme: 'project/swe/software-reliability-programme.md' },
  { code: 'TYP', title: 'Publication typography' }
] as const satisfies readonly WorkstreamDefinition[]

export type WorkstreamCode = (typeof workstreamRegistry)[number]['code']

/**
 * Widened public view keeps optional metadata ergonomic for generic validators
 * while `WorkstreamCode` remains the literal union derived from the registry.
 */
export const workstreams: readonly WorkstreamDefinition[] = workstreamRegistry

const workstreamCodeSet = new Set<string>(workstreams.map((workstream) => workstream.code))

export function isWorkstreamCode(value: string): value is WorkstreamCode {
  return workstreamCodeSet.has(value)
}

export function workstreamByCode(code: WorkstreamCode): WorkstreamDefinition {
  const workstream = workstreams.find((candidate) => candidate.code === code)
  if (!workstream) throw new Error(`Unknown registered workstream: ${code}`)
  return workstream
}
