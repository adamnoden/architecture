interface SourceIdentity {
  readonly path: string
  readonly blob: string
}

interface SelectedWaterSource extends SourceIdentity {
  readonly model: {
    readonly model: {
      readonly rwtReceivingInterface: { readonly source: SourceIdentity }
    }
  }
}

export function readSelected(): SelectedWaterSource
export function build(source: SelectedWaterSource): unknown
