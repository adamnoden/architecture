import { projectIdentity } from './identity.js'

export const nomenclatureClasses = {
  PUBLIC_NAME: 'Human-readable identity intended as ordinary publication language.',
  PUBLIC_REFERENCE: 'Compact stable identity that performs a real reader-facing cross-reference task.',
  PUBLIC_TECHNICAL: 'Identity useful on explicitly technical or machine-facing public surfaces, but not ordinary reading flow.',
  INTERNAL_STABLE: 'Durable machine identity used for joins, semantics, tests or lineage and not intended as reader-facing nomenclature.',
  WORKFLOW: 'Development phase, gate, programme, experiment or proof identity.',
  PROVENANCE_ONLY: 'Historical identity retained only in deliberately historical records.',
  LEGACY_PROHIBITED: 'Obsolete identity with no current semantic role outside bounded provenance.'
} as const

export type NomenclatureClass = keyof typeof nomenclatureClasses

export const nomenclatureSurfaces = {
  BOOK_PRIMARY: 'Main book prose, contents, headings and ordinary captions.',
  BOOK_TECHNICAL: 'Indexes, technical notes and controlled appendices.',
  SITE_PRIMARY: 'Reader-facing architectural and publication pages.',
  SITE_TECHNICAL: 'Computational, evidence and machine-reference pages deliberately exposed.',
  PUBLIC_MACHINE: 'Machine-readable data and artefact metadata intended for expert or machine inspection.',
  INTERNAL: 'Repository-only implementation, tests and development records.',
  PROVENANCE: 'Deliberately historical records.'
} as const

export type NomenclatureSurface = keyof typeof nomenclatureSurfaces

export type NomenclatureRole =
  | 'SEMANTIC_NAME'
  | 'IDENTITY_ONLY'
  | 'ORDINAL'
  | 'VERSIONED'
  | 'MATURITY'
  | 'WORKFLOW'
  | 'PROVENANCE'

export type StabilityPromise =
  | 'DURABLE'
  | 'VERSIONED'
  | 'MIGRATABLE'
  | 'WORKFLOW_LIFETIME'
  | 'PROVENANCE_ONLY'

export type BrandCoupling = 'ALLOWED' | 'PROHIBITED' | 'NOT_APPLICABLE'

export type MigrationStatus =
  | 'CURRENT'
  | 'LEGACY'
  | 'REPLACE_REQUIRED'

export interface NomenclatureFamily {
  id: string
  meaning: string
  owner: string
  examples: readonly string[]
  pattern: string
  classification: NomenclatureClass
  allowedSurfaces: readonly NomenclatureSurface[]
  roles: readonly NomenclatureRole[]
  stability: StabilityPromise
  brandCoupling: BrandCoupling
  migration: MigrationStatus
  exception?: string
}

const ALL_READER_SURFACES = [
  'BOOK_PRIMARY',
  'BOOK_TECHNICAL',
  'SITE_PRIMARY',
  'SITE_TECHNICAL',
  'PUBLIC_MACHINE',
  'INTERNAL',
  'PROVENANCE'
] as const satisfies readonly NomenclatureSurface[]

const TECHNICAL_SURFACES = [
  'BOOK_TECHNICAL',
  'SITE_TECHNICAL',
  'PUBLIC_MACHINE',
  'INTERNAL'
] as const satisfies readonly NomenclatureSurface[]

const MACHINE_SURFACES = ['SITE_TECHNICAL', 'PUBLIC_MACHINE', 'INTERNAL'] as const satisfies readonly NomenclatureSurface[]
const INTERNAL_MACHINE_SURFACES = ['PUBLIC_MACHINE', 'INTERNAL'] as const satisfies readonly NomenclatureSurface[]
const WORKFLOW_SURFACES = ['INTERNAL', 'PROVENANCE'] as const satisfies readonly NomenclatureSurface[]
const PROVENANCE_SURFACES = ['PROVENANCE'] as const satisfies readonly NomenclatureSurface[]

/**
 * Canonical PUB-NOM registry.
 *
 * This owns meaning/class/exposure. The occurrence scanner imports this registry;
 * do not maintain a second namespace-family list in publication tooling.
 */
export const nomenclatureFamilies = [
  {
    id: 'project.ovids-house',
    meaning: 'Current master project name',
    owner: 'project',
    examples: [projectIdentity.name],
    pattern: "Ovid[’']s House",
    classification: 'PUBLIC_NAME',
    allowedSurfaces: ALL_READER_SURFACES,
    roles: ['SEMANTIC_NAME'],
    stability: 'DURABLE',
    brandCoupling: 'ALLOWED',
    migration: 'CURRENT'
  },
  {
    id: 'project.house-kernel',
    meaning: 'Formal architectural-system name',
    owner: 'architectural-system',
    examples: [projectIdentity.formalSystemName],
    pattern: '\\bHouse Kernel\\b',
    classification: 'PUBLIC_NAME',
    allowedSurfaces: ALL_READER_SURFACES,
    roles: ['SEMANTIC_NAME'],
    stability: 'DURABLE',
    brandCoupling: 'ALLOWED',
    migration: 'CURRENT',
    exception: 'Former master-project use remains bounded by project/identity.ts; current use must denote the architectural system or explicit provenance.'
  },
  {
    id: 'project.metamorph-compiler',
    meaning: 'Compiler subsystem name',
    owner: 'compiler',
    examples: [projectIdentity.compilerName],
    pattern: '\\bMetamorph Compiler\\b',
    classification: 'PUBLIC_NAME',
    allowedSurfaces: ALL_READER_SURFACES,
    roles: ['SEMANTIC_NAME'],
    stability: 'DURABLE',
    brandCoupling: 'ALLOWED',
    migration: 'CURRENT'
  },
  {
    id: 'legacy.house-systems-architecture',
    meaning: 'Superseded master-project name',
    owner: 'provenance',
    examples: ['House Systems Architecture'],
    pattern: '\\bHouse Systems Architecture\\b',
    classification: 'PROVENANCE_ONLY',
    allowedSurfaces: PROVENANCE_SURFACES,
    roles: ['PROVENANCE'],
    stability: 'PROVENANCE_ONLY',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'LEGACY'
  },
  {
    id: 'legacy.house-design-doctrine',
    meaning: 'Superseded doctrine/project name',
    owner: 'provenance',
    examples: ['House Design Doctrine'],
    pattern: '\\bHouse Design Doctrine(?: v\\d+)?\\b',
    classification: 'PROVENANCE_ONLY',
    allowedSurfaces: PROVENANCE_SURFACES,
    roles: ['PROVENANCE'],
    stability: 'PROVENANCE_ONLY',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'LEGACY'
  },
  {
    id: 'legacy.long-life-house',
    meaning: 'Superseded project name',
    owner: 'provenance',
    examples: ['Long-Life House'],
    pattern: '\\b(?:The )?Long-Life House\\b',
    classification: 'PROVENANCE_ONLY',
    allowedSurfaces: PROVENANCE_SURFACES,
    roles: ['PROVENANCE'],
    stability: 'PROVENANCE_ONLY',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'LEGACY'
  },
  {
    id: 'legacy.pattern-hsa',
    meaning: 'Superseded House Systems Architecture-derived pattern machine identity',
    owner: 'provenance',
    examples: ['HSA-P-001'],
    pattern: '\\bHSA-P-\\d{3}\\b',
    classification: 'LEGACY_PROHIBITED',
    allowedSurfaces: PROVENANCE_SURFACES,
    roles: ['PROVENANCE'],
    stability: 'PROVENANCE_ONLY',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'LEGACY',
    exception: 'Retained only in bounded PUB-NOM migration/provenance records and Git history.'
  },
  {
    id: 'pattern.pat',
    meaning: 'Canonical brand-neutral pattern machine identity',
    owner: 'patterns',
    examples: ['PAT-001'],
    pattern: '\\bPAT-\\d{3}\\b',
    classification: 'INTERNAL_STABLE',
    allowedSurfaces: INTERNAL_MACHINE_SURFACES,
    roles: ['IDENTITY_ONLY'],
    stability: 'DURABLE',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT',
    exception: 'Exact machine join only; the pattern title is the ordinary reader identity.'
  },
  {
    id: 'grammar.g01',
    meaning: 'Georgian-derived grammar instance identity',
    owner: 'grammar',
    examples: ['G-01'],
    pattern: '\\bG-01\\b',
    classification: 'PUBLIC_REFERENCE',
    allowedSurfaces: ALL_READER_SURFACES,
    roles: ['IDENTITY_ONLY'],
    stability: 'DURABLE',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'grammar.g01-version',
    meaning: 'Versioned Georgian-derived grammar specification identity',
    owner: 'grammar',
    examples: ['G-01 v0.1'],
    pattern: '\\bG-01 v\\d+\\.\\d+\\b',
    classification: 'PUBLIC_TECHNICAL',
    allowedSurfaces: TECHNICAL_SURFACES,
    roles: ['IDENTITY_ONLY', 'VERSIONED'],
    stability: 'VERSIONED',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'grammar.gate',
    meaning: 'Grammar derivation and validation gate labels',
    owner: 'grammar-workflow',
    examples: ['D8', 'D10-S', 'D12'],
    pattern: '\\bD(?:5|6|8|9|10(?:-S)?|11|12|13)\\b',
    classification: 'WORKFLOW',
    allowedSurfaces: WORKFLOW_SURFACES,
    roles: ['WORKFLOW'],
    stability: 'WORKFLOW_LIFETIME',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'maturity.level',
    meaning: 'Project evidence/maturity scale M1–M5',
    owner: 'project-maturity',
    examples: ['M1', 'M5'],
    pattern: '\\bM[1-5]\\b',
    classification: 'PUBLIC_TECHNICAL',
    allowedSurfaces: TECHNICAL_SURFACES,
    roles: ['MATURITY'],
    stability: 'DURABLE',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'reference-house.design-gate',
    meaning: 'Reference House design/development gates',
    owner: 'reference-house-workflow',
    examples: ['RH-00', 'RH-11'],
    pattern: '\\bRH-(?:0\\d|1[01])\\b',
    classification: 'WORKFLOW',
    allowedSurfaces: WORKFLOW_SURFACES,
    roles: ['WORKFLOW', 'ORDINAL'],
    stability: 'WORKFLOW_LIFETIME',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'reference-house.compiler-gate',
    meaning: 'Reference House executable/compiler gates',
    owner: 'reference-house-compiler-workflow',
    examples: ['RH-C0', 'RH-C5'],
    pattern: '\\bRH-C\\d+\\b',
    classification: 'WORKFLOW',
    allowedSurfaces: WORKFLOW_SURFACES,
    roles: ['WORKFLOW', 'ORDINAL'],
    stability: 'WORKFLOW_LIFETIME',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'reference-house.fact',
    meaning: 'Reference House canonical source-fact identity',
    owner: 'reference-house-machine',
    examples: ['RHCF-*'],
    pattern: '\\bRHCF-[A-Z0-9-]+\\b',
    classification: 'INTERNAL_STABLE',
    allowedSurfaces: INTERNAL_MACHINE_SURFACES,
    roles: ['IDENTITY_ONLY'],
    stability: 'DURABLE',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'compiler.p0',
    meaning: 'P0 compiler programme gate',
    owner: 'compiler-workflow',
    examples: ['P0'],
    pattern: '\\bP0\\b',
    classification: 'WORKFLOW',
    allowedSurfaces: WORKFLOW_SURFACES,
    roles: ['WORKFLOW'],
    stability: 'WORKFLOW_LIFETIME',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'compiler.pattern-crosswalk',
    meaning: 'Pattern crosswalk programme gate',
    owner: 'compiler-workflow',
    examples: ['PAT-XW-01'],
    pattern: '\\bPAT-XW-\\d+\\b',
    classification: 'WORKFLOW',
    allowedSurfaces: WORKFLOW_SURFACES,
    roles: ['WORKFLOW', 'ORDINAL'],
    stability: 'WORKFLOW_LIFETIME',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'compiler.cf',
    meaning: 'Compiler generality / contrast-fixture gates',
    owner: 'compiler-workflow',
    examples: ['CF-01'],
    pattern: '\\bCF-\\d+\\b',
    classification: 'WORKFLOW',
    allowedSurfaces: WORKFLOW_SURFACES,
    roles: ['WORKFLOW', 'ORDINAL'],
    stability: 'WORKFLOW_LIFETIME',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'compiler.ch',
    meaning: 'Compiler Hardening gates',
    owner: 'compiler-workflow',
    examples: ['CH-00', 'CH-08'],
    pattern: '\\bCH-\\d+\\b',
    classification: 'WORKFLOW',
    allowedSurfaces: WORKFLOW_SURFACES,
    roles: ['WORKFLOW', 'ORDINAL'],
    stability: 'WORKFLOW_LIFETIME',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'compiler.coa',
    meaning: 'Compiler Output Architecture gates',
    owner: 'compiler-output-workflow',
    examples: ['COA-00'],
    pattern: '\\bCOA-\\d+\\b',
    classification: 'WORKFLOW',
    allowedSurfaces: WORKFLOW_SURFACES,
    roles: ['WORKFLOW', 'ORDINAL'],
    stability: 'WORKFLOW_LIFETIME',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'compiler.h1',
    meaning: 'H1 paper-compilation / technical-fixture identities',
    owner: 'compiler-workflow',
    examples: ['H1-*'],
    pattern: '\\bH1-[A-Z0-9]+(?:-[A-Z0-9]+)*\\b',
    classification: 'WORKFLOW',
    allowedSurfaces: WORKFLOW_SURFACES,
    roles: ['WORKFLOW', 'IDENTITY_ONLY'],
    stability: 'WORKFLOW_LIFETIME',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'publication.pr',
    meaning: 'Publication credibility/release gates',
    owner: 'publication-workflow',
    examples: ['PR-01', 'PR-02'],
    pattern: '\\bPR-\\d{2}[A-Z]?(?:-[A-Z0-9]+)*\\b',
    classification: 'WORKFLOW',
    allowedSurfaces: WORKFLOW_SURFACES,
    roles: ['WORKFLOW', 'ORDINAL'],
    stability: 'WORKFLOW_LIFETIME',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'publication.pub-san',
    meaning: 'Resolved-work sanitation programme identity',
    owner: 'publication-workflow',
    examples: ['PUB-SAN'],
    pattern: '\\bPUB-SAN\\b',
    classification: 'WORKFLOW',
    allowedSurfaces: WORKFLOW_SURFACES,
    roles: ['WORKFLOW'],
    stability: 'WORKFLOW_LIFETIME',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'publication.drw',
    meaning: 'Architectural drawing programme gates',
    owner: 'publication-workflow',
    examples: ['DRW-00'],
    pattern: '\\bDRW-\\d+\\b',
    classification: 'WORKFLOW',
    allowedSurfaces: WORKFLOW_SURFACES,
    roles: ['WORKFLOW', 'ORDINAL'],
    stability: 'WORKFLOW_LIFETIME',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'publication.pub-nom',
    meaning: 'Nomenclature programme identity',
    owner: 'publication-workflow',
    examples: ['PUB-NOM'],
    pattern: '\\bPUB-NOM\\b',
    classification: 'WORKFLOW',
    allowedSurfaces: WORKFLOW_SURFACES,
    roles: ['WORKFLOW'],
    stability: 'WORKFLOW_LIFETIME',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'publication.nom-gate',
    meaning: 'Nomenclature programme gates',
    owner: 'publication-workflow',
    examples: ['NOM-00', 'NOM-10'],
    pattern: '\\bNOM-\\d+\\b',
    classification: 'WORKFLOW',
    allowedSurfaces: WORKFLOW_SURFACES,
    roles: ['WORKFLOW', 'ORDINAL'],
    stability: 'WORKFLOW_LIFETIME',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'prototype.id',
    meaning: 'Physical prototype/specimen identity',
    owner: 'prototype-workflow',
    examples: ['P01', 'P04'],
    pattern: '\\bP0[1-4]\\b',
    classification: 'PUBLIC_TECHNICAL',
    allowedSurfaces: TECHNICAL_SURFACES,
    roles: ['IDENTITY_ONLY'],
    stability: 'DURABLE',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'prototype.w2',
    meaning: 'W2 wall-bay challenger/specimen identity',
    owner: 'prototype-workflow',
    examples: ['W2'],
    pattern: '\\bW2\\b',
    classification: 'PUBLIC_TECHNICAL',
    allowedSurfaces: TECHNICAL_SURFACES,
    roles: ['IDENTITY_ONLY'],
    stability: 'DURABLE',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT'
  },
  {
    id: 'figure.legacy-df',
    meaning: 'Superseded publication figure identity',
    owner: 'publication-figures',
    examples: ['D-F01'],
    pattern: '\\bD-F\\d{2}\\b',
    classification: 'LEGACY_PROHIBITED',
    allowedSurfaces: PROVENANCE_SURFACES,
    roles: ['PROVENANCE'],
    stability: 'PROVENANCE_ONLY',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'REPLACE_REQUIRED',
    exception: 'DRW owns the replacement public figure-reference architecture.'
  },
  {
    id: 'machine.rh-compile-schema',
    meaning: 'House Kernel Reference House source-compile schema identity',
    owner: 'compiler-machine',
    examples: ['HK-RH-COMPILE-1'],
    pattern: '\\bHK-RH-COMPILE-\\d+\\b',
    classification: 'PUBLIC_TECHNICAL',
    allowedSurfaces: MACHINE_SURFACES,
    roles: ['IDENTITY_ONLY', 'VERSIONED'],
    stability: 'VERSIONED',
    brandCoupling: 'ALLOWED',
    migration: 'CURRENT',
    exception: 'HK denotes the durable House Kernel architectural system rather than the current master-project title.'
  },
  {
    id: 'legacy.machine-rh-output-oh',
    meaning: 'Superseded Ovid’s House-coupled Reference House output/schema/artefact identity',
    owner: 'provenance',
    examples: ['OH-RH-OUTPUT-1'],
    pattern: '\\bOH-RH-[A-Z0-9-]+\\b',
    classification: 'LEGACY_PROHIBITED',
    allowedSurfaces: PROVENANCE_SURFACES,
    roles: ['PROVENANCE'],
    stability: 'PROVENANCE_ONLY',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'LEGACY',
    exception: 'Replaced atomically in NOM-06 by neutral RH-* output identities; retained only in bounded migration/provenance records and Git history.'
  },
  {
    id: 'machine.rh-output',
    meaning: 'Generated Reference House output/schema/artefact identity',
    owner: 'compiler-output-machine',
    examples: ['RH-OUTPUT-1', 'RH-PLAN-GROUND-1'],
    pattern: '\\bRH-(?:OUTPUT|PLAN|SECTION|STRUCTURE|SERVICE|BOUNDARY)-[A-Z0-9-]+\\b',
    classification: 'PUBLIC_TECHNICAL',
    allowedSurfaces: MACHINE_SURFACES,
    roles: ['IDENTITY_ONLY', 'VERSIONED'],
    stability: 'VERSIONED',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'CURRENT',
    exception: 'RH denotes the stable Reference House domain, not the Ovid’s House master-project brand; expose only on technical or machine surfaces.'
  },
  {
    id: 'legacy.house-kernel-build-meta',
    meaning: 'Superseded House Kernel-derived site build metadata keys',
    owner: 'provenance',
    examples: ['__HOUSE_KERNEL_BUILD_COMMIT__'],
    pattern: '(?:house-kernel-build-(?:commit|timestamp)|__HOUSE_KERNEL_BUILD_(?:COMMIT|TIMESTAMP)__)',
    classification: 'LEGACY_PROHIBITED',
    allowedSurfaces: PROVENANCE_SURFACES,
    roles: ['PROVENANCE'],
    stability: 'PROVENANCE_ONLY',
    brandCoupling: 'NOT_APPLICABLE',
    migration: 'LEGACY',
    exception: 'NOM-06 replaced these brand-coupled implementation keys with neutral build metadata; the neutral generic keys do not require a project-owned nomenclature family.'
  }
] as const satisfies readonly NomenclatureFamily[]

/**
 * Admission rule for the NOM-00 secondary token queue.
 * PUB-NOM governs project-owned identity, not every uppercase technical token.
 */
export const nomenclatureAdmissionPolicy = {
  governWhen: [
    'The project owns the token and expects it to remain stable across more than one artefact or subsystem.',
    'The token is intentionally exposed as a reader or machine cross-reference.',
    'The token carries order, version, maturity or authority semantics whose interpretation affects readers.',
    'The token is a workflow/provenance identity that must be actively excluded from resolved public surfaces.'
  ],
  doNotPromoteWhen: [
    'The token is ordinary external technical notation, a material/standard acronym or a cryptographic/technology term.',
    'The token is bibliographic/source shorthand whose meaning is owned by the source corpus rather than Ovid’s House.',
    'The token is a one-off local datum/test label with no public cross-reference or cross-subsystem stability promise.'
  ],
  explicitDomainDataExamples: ['IEA-EBC', 'UCL-EBL', 'SHA-256', 'CAD-CAM', 'PVC-U'],
  variantRule: 'A syntax variant of an existing project-owned workflow family inherits that family classification until NOM-02/NOM-05 either broadens the canonical pattern or promotes a distinct family.'
} as const

export function nomenclaturePattern(family: NomenclatureFamily): RegExp {
  return new RegExp(family.pattern, 'g')
}
