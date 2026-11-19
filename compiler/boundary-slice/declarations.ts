/** Text identity only: this does not establish a physical drainage destination. */
export const normaliseDrainageDeclaration = (value: string): string =>
  typeof value === 'string' ? value.trim().replace(/\s+/gu, ' ') : ''
