import type { OutputDescriptor } from '../../output/model.js'

export const REFERENCE_HOUSE_OUTPUT_SCHEMA_VERSION = 'OH-RH-OUTPUT-1' as const
export const REFERENCE_HOUSE_OUTPUT_RENDERER_VERSION = '1.0.0' as const

const authorityNote =
  'Generated semantic inspection output. It is downstream of the compiled Reference House state and does not establish physical, regulatory or engineering adequacy.'

export const REFERENCE_HOUSE_OUTPUTS = {
  groundFloorPlan: {
    id: 'OH-RH-PLAN-GROUND-1',
    classes: ['SPATIAL_INSPECTION', 'PUBLICATION_SOURCE_CANDIDATE'],
    format: 'svg',
    path: 'docs/reference-house/generated/ground-floor-plan.svg',
    rendererVersion: REFERENCE_HOUSE_OUTPUT_RENDERER_VERSION,
    authorityNote
  },
  firstFloorPlan: {
    id: 'OH-RH-PLAN-FIRST-1',
    classes: ['SPATIAL_INSPECTION', 'PUBLICATION_SOURCE_CANDIDATE'],
    format: 'svg',
    path: 'docs/reference-house/generated/first-floor-plan.svg',
    rendererVersion: REFERENCE_HOUSE_OUTPUT_RENDERER_VERSION,
    authorityNote
  },
  principalSection: {
    id: 'OH-RH-SECTION-AA-1',
    classes: ['SPATIAL_INSPECTION', 'PUBLICATION_SOURCE_CANDIDATE'],
    format: 'svg',
    path: 'docs/reference-house/generated/principal-section.svg',
    rendererVersion: REFERENCE_HOUSE_OUTPUT_RENDERER_VERSION,
    authorityNote
  },
  firstFloorStructure: {
    id: 'OH-RH-STRUCTURE-FIRST-1',
    classes: ['SPATIAL_INSPECTION', 'PUBLICATION_SOURCE_CANDIDATE'],
    format: 'svg',
    path: 'docs/reference-house/generated/first-floor-structure.svg',
    rendererVersion: REFERENCE_HOUSE_OUTPUT_RENDERER_VERSION,
    authorityNote
  },
  serviceRegister: {
    id: 'OH-RH-SERVICE-REGISTER-1',
    classes: ['SEMANTIC_REPORT'],
    format: 'markdown',
    path: 'docs/reference-house/generated/service-register.md',
    rendererVersion: REFERENCE_HOUSE_OUTPUT_RENDERER_VERSION,
    authorityNote
  },
  boundaryRegister: {
    id: 'OH-RH-BOUNDARY-REGISTER-1',
    classes: ['SEMANTIC_REPORT'],
    format: 'markdown',
    path: 'docs/reference-house/generated/boundary-register.md',
    rendererVersion: REFERENCE_HOUSE_OUTPUT_RENDERER_VERSION,
    authorityNote
  },
  outputManifest: {
    id: 'OH-RH-OUTPUT-MANIFEST-1',
    classes: ['MACHINE_PROOF'],
    format: 'json',
    path: 'docs/reference-house/generated/output-manifest.json',
    rendererVersion: REFERENCE_HOUSE_OUTPUT_RENDERER_VERSION,
    authorityNote
  }
} as const satisfies Readonly<Record<string, OutputDescriptor>>

export type ReferenceHouseOutputKey = keyof typeof REFERENCE_HOUSE_OUTPUTS
