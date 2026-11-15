interface SourceIdentity {
  readonly path: string
  readonly blob: string
}

interface SelectedWaterSource extends SourceIdentity {
  readonly model: {
    readonly model: {
      readonly rwtReceivingInterface: { readonly source: SourceIdentity }
      readonly firstWetReference: { readonly permittedQuietStage: number }
    }
    readonly renewal: {
      readonly courtCollector: {
        readonly actualOpenEntries: {
          readonly west: {
            readonly planeX: number
            readonly y: readonly [number, number]
            readonly creditedIntervals: readonly (readonly [number, number])[]
          }
        }
      }
    }
    readonly hydraulicProbe: {
      readonly assignedInwardRoofAndCourtLps: number
    }
  }
}

export function readSelected(): SelectedWaterSource
export function build(source: SelectedWaterSource): unknown


export function mouthFlow(stageMm: number, intervals: readonly (readonly [number, number])[],
  options?: { readonly lossK?: number; readonly remainingFraction?: number }): number
export function mouthStage(flowLps: number, intervals: readonly (readonly [number, number])[],
  options?: { readonly lossK?: number; readonly remainingFraction?: number }): number
