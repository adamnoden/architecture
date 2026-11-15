export type FloorRect = readonly [number, number, number, number]
export type FloorPoint = readonly [number, number]
export type FloorObstacle = readonly [string, FloorRect]

export function tileField(
  pitch: number,
  origin: FloorPoint,
  roomBands: readonly FloorRect[],
  roomItems: readonly FloorObstacle[],
): { box: FloorRect; clipped: FloorRect[]; full: boolean; fixedObstructions: string[] }[]
