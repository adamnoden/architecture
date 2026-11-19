type Range = readonly [number, number]
type Point = readonly [number, number, number]
type Axis = readonly [Point, Point]
type Aperture = { readonly x: Range; readonly z: Range }
type Clearance = { readonly westMM: number; readonly eastMM: number; readonly baseMM: number; readonly headerMM: number }

export const southInletWindowId: 'GROUND/south-window-4'
export const southInletSillInsertInputPaths: Readonly<Record<string, string>>

interface SillInsertInputs {
  readonly window: { readonly side: string; readonly old: number; readonly new: number; readonly clear: Range; readonly sill: number }
}

export interface SillInsertGeometry {
  readonly eastEdgeMm: number
  readonly headZMm: number
  readonly plantPressureAxisXMm: number
}

export function readSouthInletSillInsertInputs(read: (path: string) => unknown): SillInsertInputs
export function sourceSouthInletSillInsertCase(input: SillInsertInputs): SillInsertGeometry
export function deriveSouthInletSillInsert(input: SillInsertInputs, trial: SillInsertGeometry): {
  readonly jambAndSill: { readonly clearX: Range; readonly rawSillZ: number; readonly jambs: readonly Range[] }
  readonly opening: Aperture
  readonly frame: Aperture & { readonly innerHeaderZ: Range; readonly eastSideX: Range; readonly bearingAxesX: Range }
  readonly bores: readonly { readonly id: string; readonly axis: Axis; readonly formedReserveODMM: number; readonly apertureAfter10: Clearance }[]
  readonly vents: readonly { readonly axis: Axis; readonly outerDiameterMM: number; readonly clearMM: number; readonly apertureAfter5: Clearance;
    readonly mainBoreReserveAfter5MM: number; readonly freeCoreAboveWetStageGrossMM: number }[]
  readonly loads: {
    readonly idealSillRhsMM: readonly [number, number, number]
    readonly combinedElasticCornerStressMPa: number
    readonly eachSupportVerticalAndNormalKN: Range
    readonly eastStile: { readonly afterTwo2MMSettingsFrameWidthReserveMM: number }
    readonly outerSUncut: { readonly addedSimpleBalanceVerticalKN: Range }
  }
  readonly plantWetCellPackingAfterSettingMm: number
  readonly retainedInsideCellBoundaries: readonly { readonly id: string; readonly wetBoxX: Range; readonly retainedTroughLipZ: number }[]
  readonly throughLoadArchRestraintAndWholeBarrierVerified: false
}
