import type { RhCompileStatus } from './model.js'

export const assertCanonicalArtefactGenerationAllowed = (
  gate: string,
  status: RhCompileStatus
): void => {
  if (status !== 'PASS') {
    throw new Error(`${gate} canonical artefact generation requires PASS; got ${status}.`)
  }
}
