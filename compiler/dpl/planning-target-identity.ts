import type { RawTargetSlice } from './model.js'

export const strategicPlanningTargetId = (
  targets: readonly { authorityClass: string; target: RawTargetSlice }[]
): string => {
  const strategic = targets.filter((entry) => entry.authorityClass === 'LONDON_STRATEGIC_PLANNING')
  if (strategic.length !== 1) {
    throw new Error(`Expected exactly one London strategic planning target; found ${strategic.length}.`)
  }
  return strategic[0].target.id
}

export const assertBoroughStrategicParent = (
  boroughTarget: RawTargetSlice,
  expectedStrategicTargetId: string
): void => {
  const raw = boroughTarget as unknown as Record<string, unknown>
  const declaredParent = raw.parentStrategicTargetId
  if (typeof declaredParent !== 'string' || declaredParent.length === 0) {
    throw new Error(`Borough target ${boroughTarget.id} must declare parentStrategicTargetId.`)
  }
  if (declaredParent !== expectedStrategicTargetId) {
    throw new Error(
      `Borough target ${boroughTarget.id} declares strategic parent ${declaredParent}; expected ${expectedStrategicTargetId}.`
    )
  }

  const composition = raw.composition
  if (!composition || typeof composition !== 'object' || Array.isArray(composition)) {
    throw new Error(`Borough target ${boroughTarget.id} must declare composition.strategicTargetId.`)
  }
  const compositionTargetId = (composition as Record<string, unknown>).strategicTargetId
  if (compositionTargetId !== expectedStrategicTargetId) {
    throw new Error(
      `Borough target ${boroughTarget.id} composition declares strategic target ${String(compositionTargetId)}; expected ${expectedStrategicTargetId}.`
    )
  }
}
