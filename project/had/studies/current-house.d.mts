/** The current compile consumes source identities and the native schedule writer. */
interface OccupiedHouse {
  readonly inputs: Readonly<Record<string, string>>
}

export function deriveCurrentHouse(): OccupiedHouse
export function scheduleText(house: OccupiedHouse): string
