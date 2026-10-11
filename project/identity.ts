export const projectIdentity = {
  name: 'House Kernel',
  slug: 'house-kernel',
  legacyNames: [
    'House Systems Architecture',
    'The Long-Life House',
    'Long-Life House',
    'House Design Doctrine'
  ]
} as const

export type LegacyProjectName = (typeof projectIdentity.legacyNames)[number]
