export type CalculationCheckStatus = 'PASS' | 'FAIL' | 'UNSUPPORTED'
export type CalculationUnit = 'mm' | 'deg'

export interface CalculationMethodAuthority {
  kind: 'statutory-guidance'
  jurisdiction: string
  documentTitle: string
  edition: string
  paragraph: string
  table?: string
  sourceUrl: string
  sourceCheckedOn: `${number}-${number}-${number}`
}

interface CalculationCriterionBase {
  id: string
  inputKey: string
  label: string
  unit: CalculationUnit
  authorityRef: string
}

export interface InclusiveRangeCriterion extends CalculationCriterionBase {
  kind: 'inclusive-range'
  min: number
  max: number
}

export interface MaximumCriterion extends CalculationCriterionBase {
  kind: 'maximum'
  max: number
}

export type CalculationCriterion = InclusiveRangeCriterion | MaximumCriterion

export interface CalculationMethod {
  id: string
  version: string
  title: string
  authority: CalculationMethodAuthority
  applicability: Readonly<Record<string, string>>
  criteria: readonly CalculationCriterion[]
  claim: string
  nonClaims: readonly string[]
}

export interface CalculationInputValue {
  value: number
  unit: CalculationUnit
  sourceIds: readonly string[]
}

export interface CalculationCheckInput {
  id: string
  context: Readonly<Record<string, string>>
  values: Readonly<Record<string, CalculationInputValue>>
}

export interface CalculationCriterionResult {
  criterionId: string
  label: string
  status: CalculationCheckStatus
  observed?: number
  unit: CalculationUnit
  target: string
  sourceIds: readonly string[]
  authorityRef: string
  message: string
}

export interface CalculationCheckDiagnostic {
  code: string
  message: string
}

export interface CalculationCheckResult {
  methodId: string
  methodVersion: string
  inputId: string
  status: CalculationCheckStatus
  authority: CalculationMethodAuthority
  claim: string
  nonClaims: readonly string[]
  criteria: CalculationCriterionResult[]
  diagnostics: CalculationCheckDiagnostic[]
}
