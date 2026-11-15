export interface EastGroundReceivingReference {
  readonly east: {
    readonly receiverBounds: readonly [number, number, number, number]
    readonly bedMaximum: number
    readonly maximumWater: number
    readonly terminal: { readonly farLip: readonly [number, number, number] }
    readonly blockedOutletSpill: {
      readonly requiredContinuation: readonly [number, number, number, number]
      readonly farEndMaximumWater: number
      readonly maximumFaultedReceiverWater: number
      readonly edge: readonly (readonly [number, number, number])[]
    }
  }
  readonly north: { readonly blockedOutletSpill: { readonly requiredContinuation: readonly [number, number, number, number] } }
}

interface EastGroundLane {
  readonly b: number
  readonly yc: number
  readonly endDepth: number
  readonly tailEnergy: number
  readonly control: number
  readonly reachLoss: number
  readonly requiredHead: number
}

export function eastGroundReceiving(reference: EastGroundReceivingReference, assignedFlowsLps: readonly number[], tail: number): {
  readonly start: number
  readonly end: number
  readonly bed: number
  readonly endBed: number
  readonly crest: number
  readonly tail: number
  readonly staticResidual: number
  readonly flows: readonly {
    readonly flowLps: number
    readonly low: readonly [EastGroundLane, EastGroundLane]
    readonly bypass: EastGroundLane
    readonly faultWater: number
    readonly ordinaryReserve: number
    readonly faultReserve: number
    readonly downstreamSeparation: number
  }[]
}

export function eastGround(): { readonly wet: ReturnType<typeof eastGroundReceiving> }
