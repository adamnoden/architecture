export type Millimetres = number & { readonly __unit: 'mm' }
export type SquareMillimetres = number & { readonly __unit: 'mm2' }
export type Degrees = number & { readonly __unit: 'deg' }

export const mm = (value: number): Millimetres => value as Millimetres
export const mm2 = (value: number): SquareMillimetres => value as SquareMillimetres
export const deg = (value: number): Degrees => value as Degrees

export const square = (a: Millimetres, b: Millimetres): SquareMillimetres => mm2(a * b)
export const toSquareMetres = (area: SquareMillimetres): number => area / 1_000_000
