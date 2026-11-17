import type { deriveCurrentHouse } from './current-house.mjs'

type OccupiedHouse = ReturnType<typeof deriveCurrentHouse>
interface OccupiedServiceBinding {
  readonly identities: Readonly<Record<string, string>>
  readonly inputReceiptIdentities: Readonly<Record<string, string>>
}

type DrawingName = 'current-house-services.svg' | 'store-exchange.svg' | 'selected-service-interfaces.svg'
export const occupiedServiceCompositorPath: 'project/had/studies/current-house.mjs'
export function deriveBoundOccupiedServiceHouse(binding: OccupiedServiceBinding): OccupiedHouse
export function drawBoundOccupiedServiceHouse(house: OccupiedHouse, binding: OccupiedServiceBinding): {
  readonly renderers: readonly { readonly path: string; readonly gitBlob: string }[]
  readonly drawings: Readonly<Record<DrawingName, string>>
}
export function readNativeOccupiedServiceBinding(): OccupiedServiceBinding
