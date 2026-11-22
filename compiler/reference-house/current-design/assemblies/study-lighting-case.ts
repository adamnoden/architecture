/** Browser-safe authored lighting choices. No source loading or compilation. */
export const studyLightingStageFields = ['arrangement', 'socketCentreZMm', 'serviceTotalDepthMm', 'lampHand', 'failedSourceId', 'finishTrial', 'automationConnected', 'localWallModule'] as const
export const studyLightingArrangements = ['portable', 'lamps-with-wall', 'wall-led', 'ceiling-with-lamps'] as const
export interface StudyLightingCase {
  readonly schema: 'ias-study-lighting-case/1'; readonly units: 'mm'
  readonly arrangement: typeof studyLightingArrangements[number]
  readonly socketCentreZMm: number; readonly serviceTotalDepthMm: number
  readonly lampHand: 'left' | 'right'; readonly failedSourceId: string | null
  readonly finishTrial: 'crafted-oak' | 'darker-oak'; readonly automationConnected: boolean; readonly localWallModule: boolean
}

const plain = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype
const sourceIds = ['desk-task', 'floor-fill', 'side-task', 'wall-arrival', 'wall-task', 'wall-fill', 'ceiling-general']
export function admitStudyLightingCase(value: unknown): StudyLightingCase {
  const keys = ['schema', 'units', ...studyLightingStageFields]
  if (!plain(value) || Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))
    || value.schema !== 'ias-study-lighting-case/1' || value.units !== 'mm'
    || !studyLightingArrangements.includes(value.arrangement as StudyLightingCase['arrangement'])
    || !['left', 'right'].includes(value.lampHand as string) || !['crafted-oak', 'darker-oak'].includes(value.finishTrial as string)
    || typeof value.socketCentreZMm !== 'number' || !Number.isFinite(value.socketCentreZMm) || value.socketCentreZMm < 150 || value.socketCentreZMm > 1400
    || typeof value.serviceTotalDepthMm !== 'number' || !Number.isFinite(value.serviceTotalDepthMm) || value.serviceTotalDepthMm < 25 || value.serviceTotalDepthMm > 100
    || typeof value.automationConnected !== 'boolean' || typeof value.localWallModule !== 'boolean'
    || !(value.failedSourceId === null || sourceIds.includes(value.failedSourceId as string))) throw new TypeError('IAS_LIGHTING_UNSUPPORTED_INPUT: exact authored choices, known source IDs and finite mm dimensions required')
  return structuredClone(value) as unknown as StudyLightingCase
}
