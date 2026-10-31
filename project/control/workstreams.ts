export interface WorkstreamDefinition {
  code: string
  title: string
  issue?: number
  programme?: string
  aliases?: readonly string[]
}

const workstreamRegistry = [
  { code: 'ACO', title: 'Agent Claim Orchestration', issue: 960, programme: 'project/aco/agent-claim-orchestration-programme.md' },
  { code: 'ADE', title: 'Architectural Drawing Engine', issue: 812 },
  {
    code: 'BCR',
    title: 'Buildability & Construction Resolution',
    issue: 944,
    programme: 'project/bcr/buildability-construction-resolution-programme.md'
  },
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
    issue: 299,
    programme: 'project/dpl/deployment-programme.md'
  },
  { code: 'DRW', title: 'Architectural drawing programme' },
  { code: 'EDA', title: 'Editorial Doctrine Audit', programme: 'docs/editorial/eda-programme.md' },
  { code: 'EPR', title: 'External professional review', issue: 913 },
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
