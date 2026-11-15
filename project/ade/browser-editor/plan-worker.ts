import { createCandidatePlanScene } from '../../../compiler/reference-house/current-design/candidate-plan.js'
import { admitDesignSnapshot, type DesignSnapshot, type StoreyId } from '../../../compiler/reference-house/current-design/snapshot.js'
import { renderDrawingSceneV2Svg } from '../../../compiler/publication-drawing-v2/svg.js'

export interface PlanRequest { readonly requestId: string; readonly design: DesignSnapshot }
export type Plans = Readonly<Record<StoreyId, string>>
export type PlanResponse = { requestId: string } & ({ plans: Plans } | { error: string })

self.addEventListener('message', (event: MessageEvent<PlanRequest>) => {
  const { design, requestId } = event.data
  try {
    const admitted = admitDesignSnapshot(design)
    if (admitted.source.state !== 'candidate') throw new TypeError('Plan comparison requires a candidate document')
    const draw = (level: StoreyId) => renderDrawingSceneV2Svg(createCandidatePlanScene(admitted, level))
    self.postMessage({ requestId, plans: { GROUND: draw('GROUND'), FIRST: draw('FIRST') } } satisfies PlanResponse)
  } catch (error) {
    self.postMessage({ requestId, error: error instanceof Error ? error.message : String(error) } satisfies PlanResponse)
  }
})
