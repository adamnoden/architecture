import type {
  CalculationCheckInput,
  CalculationCheckResult,
  CalculationCheckStatus,
  CalculationCriterion,
  CalculationCriterionResult,
  CalculationMethod
} from './model.js'

const targetText = (criterion: CalculationCriterion): string => {
  if (criterion.kind === 'maximum') return `≤ ${criterion.max} ${criterion.unit}`
  return `${criterion.min}–${criterion.max} ${criterion.unit} inclusive`
}

const criterionResult = (
  criterion: CalculationCriterion,
  input: CalculationCheckInput
): CalculationCriterionResult => {
  const value = input.values[criterion.inputKey]
  if (!value) {
    return {
      criterionId: criterion.id,
      label: criterion.label,
      status: 'UNSUPPORTED',
      unit: criterion.unit,
      target: targetText(criterion),
      sourceIds: [],
      authorityRef: criterion.authorityRef,
      message: `Required input ${criterion.inputKey} is absent.`
    }
  }

  if (value.unit !== criterion.unit) {
    return {
      criterionId: criterion.id,
      label: criterion.label,
      status: 'UNSUPPORTED',
      observed: value.value,
      unit: criterion.unit,
      target: targetText(criterion),
      sourceIds: value.sourceIds,
      authorityRef: criterion.authorityRef,
      message: `Input ${criterion.inputKey} uses ${value.unit}; method requires ${criterion.unit}.`
    }
  }

  if (!Number.isFinite(value.value)) {
    return {
      criterionId: criterion.id,
      label: criterion.label,
      status: 'UNSUPPORTED',
      observed: value.value,
      unit: criterion.unit,
      target: targetText(criterion),
      sourceIds: value.sourceIds,
      authorityRef: criterion.authorityRef,
      message: `Input ${criterion.inputKey} is not a finite numeric value.`
    }
  }

  const passes = criterion.kind === 'maximum'
    ? value.value <= criterion.max
    : value.value >= criterion.min && value.value <= criterion.max

  return {
    criterionId: criterion.id,
    label: criterion.label,
    status: passes ? 'PASS' : 'FAIL',
    observed: value.value,
    unit: criterion.unit,
    target: targetText(criterion),
    sourceIds: value.sourceIds,
    authorityRef: criterion.authorityRef,
    message: passes
      ? `${criterion.label} satisfies the selected calculation target.`
      : `${criterion.label} does not satisfy the selected calculation target.`
  }
}

const methodDiagnostics = (method: CalculationMethod): string[] => {
  const issues: string[] = []
  if (method.criteria.length === 0) issues.push('Method has no criteria.')

  const ids = new Set<string>()
  for (const criterion of method.criteria) {
    if (ids.has(criterion.id)) issues.push(`Duplicate criterion id ${criterion.id}.`)
    ids.add(criterion.id)

    if (criterion.kind === 'inclusive-range') {
      if (!Number.isFinite(criterion.min) || !Number.isFinite(criterion.max) || criterion.min > criterion.max) {
        issues.push(`Criterion ${criterion.id} has an invalid inclusive range.`)
      }
    } else if (!Number.isFinite(criterion.max)) {
      issues.push(`Criterion ${criterion.id} has an invalid maximum.`)
    }
  }

  return issues
}

const aggregate = (criteria: readonly CalculationCriterionResult[]): CalculationCheckStatus => {
  if (criteria.some((item) => item.status === 'UNSUPPORTED')) return 'UNSUPPORTED'
  if (criteria.some((item) => item.status === 'FAIL')) return 'FAIL'
  return 'PASS'
}

export const runCalculationCheck = (
  method: CalculationMethod,
  input: CalculationCheckInput
): CalculationCheckResult => {
  const invalidMethod = methodDiagnostics(method)
  if (invalidMethod.length) {
    return {
      methodId: method.id,
      methodVersion: method.version,
      inputId: input.id,
      status: 'UNSUPPORTED',
      authority: method.authority,
      claim: method.claim,
      nonClaims: method.nonClaims,
      criteria: [],
      diagnostics: invalidMethod.map((message) => ({
        code: 'CALCULATION_METHOD_INVALID',
        message
      }))
    }
  }

  const mismatches = Object.entries(method.applicability)
    .filter(([key, expected]) => input.context[key] !== expected)

  if (mismatches.length) {
    return {
      methodId: method.id,
      methodVersion: method.version,
      inputId: input.id,
      status: 'UNSUPPORTED',
      authority: method.authority,
      claim: method.claim,
      nonClaims: method.nonClaims,
      criteria: [],
      diagnostics: mismatches.map(([key, expected]) => ({
        code: 'CALCULATION_METHOD_OUTSIDE_APPLICABILITY',
        message: `Method requires ${key}=${expected}; input provides ${input.context[key] ?? 'ABSENT'}.`
      }))
    }
  }

  const criteria = method.criteria.map((criterion) => criterionResult(criterion, input))
  return {
    methodId: method.id,
    methodVersion: method.version,
    inputId: input.id,
    status: aggregate(criteria),
    authority: method.authority,
    claim: method.claim,
    nonClaims: method.nonClaims,
    criteria,
    diagnostics: criteria
      .filter((item) => item.status === 'UNSUPPORTED')
      .map((item) => ({
        code: 'CALCULATION_METHOD_INPUT_UNSUPPORTED',
        message: item.message
      }))
  }
}
