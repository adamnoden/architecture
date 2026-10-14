import type { OutputCompileStatus, OutputFormat } from './model.js'

export type OutputInformationCharacter =
  | 'MACHINE_IDENTITY'
  | 'NON_SPATIAL_REGISTER'
  | 'METRIC_SPATIAL'
  | 'METRIC_TOPOLOGY'

export const FORMAT_POLICY: Readonly<Record<OutputInformationCharacter, OutputFormat>> = {
  MACHINE_IDENTITY: 'json',
  NON_SPATIAL_REGISTER: 'markdown',
  METRIC_SPATIAL: 'svg',
  METRIC_TOPOLOGY: 'svg'
}

export interface OutputGenerationPolicy {
  readonly allowed: boolean
  readonly visibleStatusRequired: boolean
}

export const outputGenerationPolicy = (
  status: OutputCompileStatus
): OutputGenerationPolicy => {
  if (status === 'FAIL') {
    return { allowed: false, visibleStatusRequired: false }
  }
  if (status === 'REVIEW') {
    return { allowed: true, visibleStatusRequired: true }
  }
  return { allowed: true, visibleStatusRequired: false }
}

export const assertOutputGenerationAllowed = (status: OutputCompileStatus): void => {
  if (!outputGenerationPolicy(status).allowed) {
    throw new Error('Refusing to generate canonical inspection outputs from a failed compile.')
  }
}
