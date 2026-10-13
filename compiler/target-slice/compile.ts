import type {
  TargetCheckInput,
  TargetCheckResult,
  TargetCheckStatus,
  TargetCriterion,
  TargetCriterionResult,
  TargetMethod
} from './model.js'

const targetText = (criterion: TargetCriterion): string => {
  if (criterion.kind === 'maximum') return `≤ ${criterion.max} ${criterion.unit}`
  return `${criterion.min}–${criterion.max} ${criterion.unit} inclusive`
}

const criterionResult = (
  criterion: TargetCriterion,
  input: TargetCheckInput
): TargetCriterionResult => {
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
      ? `${criterion.label} satisfies the selected target.`
      : `${criterion.label} does not satisfy the selected target.`
  }
}

const aggregate = (criteria: readonly TargetCriterionResult[]): TargetCheckStatus => {
  if (criteria.some((item) => item.status === 'FAIL')) return 'FAIL'
  if (criteria.some((item) => item.status === 'UNSUPPORTED')) return 'UNSUPPORTED'
  return 'PASS'
}

export const runTargetCheck = (
  method: TargetMethod,
  input: TargetCheckInput
): TargetCheckResult => {
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
        code: 'TARGET_METHOD_OUTSIDE_APPLICABILITY',
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
        code: 'TARGET_METHOD_INPUT_UNSUPPORTED',
        message: item.message
      }))
  }
}
