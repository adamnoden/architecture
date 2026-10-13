export type TargetCheckStatus = 'PASS' | 'FAIL' | 'UNSUPPORTED'
export type TargetUnit = 'mm' | 'deg'

export interface TargetMethodAuthority {
  kind: 'statutory-guidance'
  jurisdiction: string
  documentTitle: string
  edition: string
  paragraph: string
  table?: string
  sourceUrl: string
  verifiedCurrentOn: `${number}-${number}-${number}`
}

interface TargetCriterionBase {
  id: string
  inputKey: string
  label: string
  unit: TargetUnit
  authorityRef: string
}

export interface InclusiveRangeCriterion extends TargetCriterionBase {
  kind: 'inclusive-range'
  min: number
  max: number
}

export interface MaximumCriterion extends TargetCriterionBase {
  kind: 'maximum'
  max: number
}

export type TargetCriterion = InclusiveRangeCriterion | MaximumCriterion

export interface TargetMethod {
  id: string
  version: string
  title: string
  authority: TargetMethodAuthority
  applicability: Readonly<Record<string, string>>
  criteria: readonly TargetCriterion[]
  claim: string
  nonClaims: readonly string[]
}

export interface TargetInputValue {
  value: number
  unit: TargetUnit
  sourceIds: readonly string[]
}

export interface TargetCheckInput {
  id: string
  context: Readonly<Record<string, string>>
  values: Readonly<Record<string, TargetInputValue>>
}

export interface TargetCriterionResult {
  criterionId: string
  label: string
  status: TargetCheckStatus
  observed?: number
  unit: TargetUnit
  target: string
  sourceIds: readonly string[]
  authorityRef: string
  message: string
}

export interface TargetCheckDiagnostic {
  code: string
  message: string
}

export interface TargetCheckResult {
  methodId: string
  methodVersion: string
  inputId: string
  status: TargetCheckStatus
  authority: TargetMethodAuthority
  claim: string
  nonClaims: readonly string[]
  criteria: TargetCriterionResult[]
  diagnostics: TargetCheckDiagnostic[]
}
