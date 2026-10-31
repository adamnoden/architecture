import type { Millimetres } from '../units.js'
import type { AdeDistanceAuthority } from './model.js'

const EPSILON = 1e-6

export const assertResolvedDistanceWithinAuthority = (
  ownerId: string,
  label: string,
  authority: AdeDistanceAuthority,
  resolved: Millimetres
): void => {
  if (!Number.isFinite(resolved) || resolved <= 0) {
    throw new Error(`${ownerId} ${label} resolved to a non-positive/non-finite distance.`)
  }

  switch (authority.kind) {
    case 'exact':
      if (Math.abs(resolved - authority.value) > EPSILON) {
        throw new Error(`${ownerId} ${label} resolved ${resolved} mm outside exact authority ${authority.value} mm.`)
      }
      return
    case 'approximate':
      // Approximate means the source owns a nominal value but not a tolerance
      // policy. Until a representation profile explicitly supplies one, ADE may
      // use only that nominal value rather than invent a tolerance envelope.
      if (Math.abs(resolved - authority.value) > EPSILON) {
        throw new Error(`${ownerId} ${label} resolved ${resolved} mm away from approximate nominal ${authority.value} mm without an authored representation rule.`)
      }
      return
    case 'range':
      if (resolved < authority.min - EPSILON || resolved > authority.max + EPSILON) {
        throw new Error(`${ownerId} ${label} resolved ${resolved} mm outside authored range ${authority.min}–${authority.max} mm.`)
      }
      return
    case 'qualitative':
    case 'unknown':
      throw new Error(`${ownerId} ${label} has ${authority.kind} distance authority and cannot compile resolved physical geometry.`)
  }
}
