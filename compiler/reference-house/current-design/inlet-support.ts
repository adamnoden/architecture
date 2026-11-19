import { exactSegmentBoxDistance, finiteBends } from '../../../project/had/studies/incoming-water-geometry.mjs'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import { createPlanPaperProjection } from '../../publication-drawing/projection.js'
import type { DrawingSceneV2 } from '../../publication-drawing-v2/model.js'

type Point = readonly [number, number, number]
type Box = readonly [number, number, number, number, number, number]
type Branch = 'utility' | 'plant'
export type InletSupportSettings = {
  readonly centreYMm: number
  readonly lowerZMm: number
  readonly upperZMm: number
  readonly normalDepthMm: number
  readonly verticalDepthMm: number
}
type Context = {
  readonly jambAxesXMm: readonly number[]
  readonly jambNormalFacesYMm: readonly number[]
  readonly occupied: readonly { id: string; box: Box }[]
  readonly branches: readonly {
    id: Branch; route: readonly Point[]; cut: Point; drawMm: number
    radiusMm: number; releasedTip: Point
    wetPlan: readonly (readonly [number, number])[]; wetZ: readonly [number, number]
  }[]
}
const fields = ['centreYMm', 'lowerZMm', 'upperZMm', 'normalDepthMm', 'verticalDepthMm'] as const
const round = (value: number) => Number(value.toFixed(4))
const overlaps = (a: Box, b: Box) => [0, 1, 2].every(i => Math.min(a[i] + a[i + 3], b[i] + b[i + 3]) > Math.max(a[i], b[i]))
export const readInletSupportSettings = (): InletSupportSettings => ({ centreYMm: 720, lowerZMm: 100, upperZMm: 350, normalDepthMm: 60, verticalDepthMm: 60 })

export function compareInletSupport(input: unknown, context: Context) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length !== fields.length
      || fields.some(key => !Object.hasOwn(input, key))) throw new Error('Expected explicit inlet support-rail settings')
  const settings = input as InletSupportSettings
  if (fields.some(key => !Number.isFinite(settings[key])) || settings.centreYMm < 300 || settings.centreYMm > 1000
      || settings.lowerZMm < 0 || settings.upperZMm <= settings.lowerZMm || settings.upperZMm > 700
      || settings.normalDepthMm <= 0 || settings.normalDepthMm > 160 || settings.verticalDepthMm <= 0 || settings.verticalDepthMm > 160) {
    throw new Error('Inlet support rails exceed the bounded jamb-to-jamb comparison')
  }
  const left = Math.min(...context.jambAxesXMm), right = Math.max(...context.jambAxesXMm)
  if (context.jambAxesXMm.length !== 2 || right <= left || context.jambNormalFacesYMm.length !== 2) throw new Error('The support requires the actual paired jamb faces')
  const rails = [settings.lowerZMm, settings.upperZMm].map((z, index) => ({ id: index ? 'upper-rail' : 'lower-rail',
    box: [left, settings.centreYMm - settings.normalDepthMm / 2, z - settings.verticalDepthMm / 2,
      right - left, settings.normalDepthMm, settings.verticalDepthMm] as Box }))
  const wet = context.branches.map(branch => {
    const xs = branch.wetPlan.map(point => point[0]), ys = branch.wetPlan.map(point => point[1])
    if (Math.min(...xs) < left || Math.max(...xs) > right) throw new Error('The transverse rail does not span the complete wet-cell reservation')
    return { id: branch.id + '-fixed-wet-cell', box: [Math.min(...xs), Math.min(...ys), branch.wetZ[0],
      Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), branch.wetZ[1] - branch.wetZ[0]] as Box }
  })
  const obstructions = rails.flatMap(rail => [...context.occupied, ...wet].filter(obstacle => overlaps(rail.box, obstacle.box))
    .map(obstacle => ({ rail: rail.id, objectId: obstacle.id, code: obstacle.id.endsWith('-fixed-wet-cell') ? 'FIXED_WET_CELL_INTERCEPT' : 'PERMANENT_OCCUPIED_FIELD_INTERCEPT' })))
  const carrierClearances = context.branches.flatMap(branch => {
    const bend = finiteBends([branch.route[1], branch.route[2], branch.cut])
    return rails.map(rail => {
      const [x, y, z, width, depth, height] = rail.box
      const inverse: Box = [x, y - branch.drawMm, z, width, depth + branch.drawMm, height]
      const jacketGap = Math.min(...bend.path.slice(1).map((end, i) => exactSegmentBoxDistance(bend.path[i], end, inverse))) - branch.radiusMm - bend.hausdorffError
      const bareGap = exactSegmentBoxDistance(branch.releasedTip, branch.route[1], inverse) - 14
      return { branch: branch.id, rail: rail.id, afterSettingMm: round(Math.min(jacketGap, bareGap) - 10) }
    })
  })
  const diagnostics = [...obstructions, ...carrierClearances.filter(row => row.afterSettingMm < 0)
    .map(row => ({ rail: row.rail, objectId: row.branch, code: 'CARRIER_DRAW_INTERCEPT' }))]
  const digest = sha256SemanticFingerprint({ settings, context })
  const planBottom = Math.max(1450, ...context.occupied.map(obstacle => obstacle.box[1] + obstacle.box[4])) + 40
  const projection = createPlanPaperProjection({ scaleDenominator: 20,
    modelBounds: { x: left - 120, y: 300, width: right - left + 240, height: planBottom - 300 }, paperOrigin: { x: 10, y: 20 } })
  const primitives: DrawingSceneV2['primitives'] = []
  const rectangle = (id: string, box: Box, role: 'primary' | 'secondary') => {
    const [x, y, , width, depth] = box
    for (const [i, [a, b]] of [[[x, y], [x + width, y]], [[x + width, y], [x + width, y + depth]],
      [[x + width, y + depth], [x, y + depth]], [[x, y + depth], [x, y]]].entries()) {
      primitives.push({ kind: 'line', id: id + '-' + i, role, a: projection.point(a[0], a[1]), b: projection.point(b[0], b[1]),
        metadata: { caseDigest: digest, boxMm: box.join(',') } })
    }
  }
  for (const obstacle of [...context.occupied, ...wet]) rectangle(obstacle.id, obstacle.box, 'secondary')
  rectangle('support-rails-plan', rails[0].box, 'primary')
  primitives.push({ kind: 'text', id: 'support-title', x: 10, y: 9, role: 'label', value: 'Inlet support · actual occupied fields' })
  for (const obstacle of context.occupied) {
    const point = projection.point(obstacle.box[0] + 20, obstacle.box[1] + obstacle.box[4] / 2)
    primitives.push({ kind: 'text', id: obstacle.id + '-label', x: point.x, y: point.y, role: 'note',
      value: obstacle.id.startsWith('PV') ? 'Inverter working field' : 'Washer through first rest' })
  }
  const foot = 27 + (planBottom - 300) / 20
  primitives.push({ kind: 'text', id: 'support-levels', x: 10, y: foot, role: 'note',
    value: `Rails: Y${settings.centreYMm}; Z${settings.lowerZMm}/${settings.upperZMm} mm` },
  { kind: 'text', id: 'support-boundary', x: 10, y: foot + 6, role: 'note', value: 'Receiving connections and capacity unproved' })
  const drawing: DrawingSceneV2 = { viewId: 'HAD-INLET-SUPPORT-PLAN', sourceId: 'south-inlet-support-comparison',
    title: 'Inlet support and actual occupied fields', description: 'Plan of both transverse rails. Individual levels, carrier sweeps and three-dimensional obstructions belong to the result schedule. No receiving capacity is inferred.',
    scaleDenominator: 20, widthMm: 20 + (right - left + 240) / 20, heightMm: 40 + (planBottom - 300) / 20, primitives }
  return { schema: 'had-inlet-support-comparison/1' as const, candidate: 'independent-jamb-to-jamb-front-rails',
    disposition: diagnostics.length ? 'reject-geometric-arrangement' as const : 'geometric-comparison-only' as const,
    sourceContextDigest: digest, settings, jambAxesXMm: context.jambAxesXMm, structuralRoomFaceYMm: Math.max(...context.jambNormalFacesYMm),
    roomSideProjectionMm: round(settings.centreYMm - Math.max(...context.jambNormalFacesYMm)),
    rails, obstructions, carrierClearances, diagnostics, drawing,
    receivingCapacity: 'not-established', selectedSupport: false, inheritedWindowOrInsertCapacity: false }
}
