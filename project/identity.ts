export const projectIdentity = {
  name: 'Ovid’s House',
  slug: 'ovids-house',
  formalSystemName: 'House Kernel',
  compilerName: 'Metamorph Compiler',
  formerMasterNames: ['House Kernel'],
  formerMasterNameAllowedSources: [
    'STATUS.md',
    'docs/manuscript/publication-architecture.md'
  ],
  legacyNames: [
    'House Systems Architecture',
    'The Long-Life House',
    'Long-Life House',
    'House Design Doctrine'
  ],
  legacyNameProvenanceSources: [
    'STATUS.md',
    'docs/manuscript/doctrine-register-crosswalk.md'
  ]
} as const

export type FormerMasterProjectName = (typeof projectIdentity.formerMasterNames)[number]
export type LegacyProjectName = (typeof projectIdentity.legacyNames)[number]