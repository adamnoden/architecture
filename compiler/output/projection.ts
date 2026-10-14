export interface OutputPoint {
  readonly x: number
  readonly y: number
}

export interface OutputRect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface NorthUpPlanProjection {
  readonly point: (xEast: number, yNorth: number) => OutputPoint
  readonly rect: (box: { readonly x: number; readonly y: number; readonly width: number; readonly height: number }) => OutputRect
}

/**
 * World convention: +X east, +Y north. SVG convention: +X right, +Y down.
 * Therefore north-up output keeps X and reflects Y about the shell depth.
 */
export const createNorthUpPlanProjection = (shellDepth: number): NorthUpPlanProjection => ({
  point: (xEast, yNorth) => ({ x: xEast, y: shellDepth - yNorth }),
  rect: (box) => ({
    x: box.x,
    y: shellDepth - (box.y + box.height),
    width: box.width,
    height: box.height
  })
})

/** Principal A–A is drawn south-to-north: south is left, north is right. */
export const createSouthToNorthSectionProjection = (zTop: number) => ({
  point: (planY: number, z: number): OutputPoint => ({ x: planY, y: zTop - z }),
  rect: (planY0: number, planY1: number, z0: number, z1: number): OutputRect => ({
    x: planY0,
    y: zTop - z1,
    width: planY1 - planY0,
    height: z1 - z0
  })
})
