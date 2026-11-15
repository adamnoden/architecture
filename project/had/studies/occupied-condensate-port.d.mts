import { deriveCurrentHouse } from './current-house.mjs'

type House = ReturnType<typeof deriveCurrentHouse>
type Point3 = readonly [number, number, number]
interface TerminalGeometry {
  readonly id: 'ground-WC-condensate'
  readonly wall: 'outer-south'
  readonly point: Point3
  readonly route: readonly Point3[]
  readonly radius: number
  readonly faceWidth: number
  readonly neighboringMain: { readonly point: Point3; readonly faceWidth: number }
}

export function readGroundWCCondensate(house: House): TerminalGeometry
export function developGroundWCCondensate(house: House, structure: object, corner: object, levelMm: number): {
  trial: House
  reference: TerminalGeometry
  port: TerminalGeometry
  fit: {
    fall: readonly {horizontalMm: number; fallMm: number}[]
    apertureMm: number
    weatherFaceMm: number
    drainToExhaustMm: number
    roomToolMm: number
    roomToolMaximumMm: number
    temporaryBlankToolMm: number
    temporaryBlankToolMaximumMm: number
    exteriorGuardMm: number
    outletIndoorToolTarget: Point3
    drawMm: number
  }
}
