export const projectAuthority = {
  schemaVersion: 1,
  referenceHouseScope: 'virtual-design',
  compilerScope: 'bounded-internal-proof',
  physicalValidation: 'not-established',
  competentExternalReview: 'not-established',
  regulatoryCompliance: 'not-established',
  constructionAdequacy: 'not-established'
} as const

/**
 * This is the canonical machine-readable claim ceiling for the project.
 * Raise a field only when explicit evidence has earned the stronger claim;
 * maturity or progress alone must never silently broaden authority.
 */
export type ProjectAuthority = typeof projectAuthority
