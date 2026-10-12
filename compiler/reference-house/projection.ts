import type { Box2D } from '../p0/model.js'

export interface Point2D {
  x: number
  y: number
}

export interface ProjectedRect {
  x: number
  y: number
  width: number
  height: number
}

export interface PlanProjection {
  point: (x: number, y: number) => Point2D
  rect: (box: Box2D) => ProjectedRect
}

export const createPlanProjection = (shellDepth: number): PlanProjection => ({
  point: (x, y) => ({ x, y: shellDepth - y }),
  rect: (box) => ({
    x: box.x,
    y: shellDepth - (box.y + box.height),
    width: box.width,
    height: box.height
  })
})

export interface SectionProjection {
  point: (planY: number, z: number) => Point2D
  rect: (planY0: number, planY1: number, z0: number, z1: number) => ProjectedRect
}

export const createSectionProjection = (zTop: number): SectionProjection => ({
  point: (planY, z) => ({ x: planY, y: zTop - z }),
  rect: (planY0, planY1, z0, z1) => ({
    x: planY0,
    y: zTop - z1,
    width: planY1 - planY0,
    height: z1 - z0
  })
})
