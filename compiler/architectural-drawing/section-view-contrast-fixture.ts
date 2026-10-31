import {compileOrthographicSectionView, type HostedFacade} from './section-view.js'
import {spatialSegmentsToDrawingPrimitives} from './spatial-line-drawing.js'
import type {ModelFace3D} from '../publication-drawing/projection-3d.js'
import type {DrawingSceneV2} from '../publication-drawing-v2/model.js'
import type {AdeProvenance} from './model.js'

/** Deliberately not a courtyard or a Reference House adapter. A model-mm
 * smoke specimen with asymmetrical roof, two different windows and a separate
 * cut screen that hides only one interval of the farther roof. */
export const contrastFacade: HostedFacade = {
  id: 'contrast-east-wall', axis: 'x', plane: 4000,
  start: 100, end: 5600, bottom: 0, top: 3650,
  openings: [
    {id: 'high-sash', start: 950, end: 2075, sill: 1700, head: 3150,
      grid: {columns: 3, rows: 4}},
    {id: 'low-opening', start: 3880, end: 4770, sill: 350, head: 1650}
  ]
}
export const contrastRoof: ModelFace3D = {
  id: 'contrast-leaning-roof',
  vertices: [
    {x: 1800, y: 100, z: 4980}, {x: 4000, y: 100, z: 3650},
    {x: 4000, y: 5600, z: 3650}, {x: 1800, y: 5600, z: 4980}
  ]
}
export const contrastCut: ModelFace3D = {
  id: 'contrast-cut-screen',
  vertices: [
    {x: 5000, y: 2800, z: 3450}, {x: 5000, y: 3350, z: 3450},
    {x: 5000, y: 3350, z: 5300}, {x: 5000, y: 2800, z: 5300}
  ]
}
const provenance: AdeProvenance = {
  sourceIds: ['compiler/architectural-drawing/section-view-contrast-fixture.ts'],
  authority: 'provisional', precision: 'approximate'
}
export function createSectionViewContrastScene(scale: 50 | 100): DrawingSceneV2 {
  const view = compileOrthographicSectionView({
    section: {axis: 'x', at: 5000, looking: 'negative'},
    facades: [contrastFacade], contextFaces: [contrastRoof], cutFaces: [contrastCut]
  })
  const options = {basis: view.basis, paperOrigin: scale === 100 ? {x: 20, y: 130} : {x: 90, y: 190},
    paperMmPerModelMm: 1 / scale, provenance}
  return {
    widthMm: scale === 100 ? 145 : 420,
    heightMm: scale === 100 ? 190 : 594,
    viewId: \`ADE-GENERIC-SECTION-CONTEXT-\${scale}\`,
    sourceId: 'ADE-SECTION-VIEW-CONTRAST-01',
    title: 'Orthographic section contrast',
    description: 'Hosted openings, far roof and cut screen; source geometry, not selected construction.',
    scaleDenominator: scale,
    primitives: [
      ...spatialSegmentsToDrawingPrimitives(view.background, options),
      ...spatialSegmentsToDrawingPrimitives(view.cut, options)
    ]
  }
}
