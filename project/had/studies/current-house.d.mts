/** The current compile consumes source identities and the native schedule writer. */
interface OccupiedHouse {
  readonly inputs: Readonly<Record<string, string>>
  readonly model: {
    readonly studyDoorOperation: {
      readonly rough: readonly [number, number]
      readonly hinge: readonly [number, number]
      readonly checkedFramePieces: readonly (readonly [number, number, number, number])[]
    }
  }
}

export function deriveCurrentHouse(): OccupiedHouse
export function scheduleText(house: OccupiedHouse): string
