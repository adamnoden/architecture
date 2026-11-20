export type OriginVector = readonly [number, number, number]
export type OriginLoad = {
  readonly family: string
  readonly case: string
  readonly N_Xmoment_Ymoment: OriginVector
}
export type OriginPathRule = {
  readonly family: string
  readonly path: 'inner-wall' | 'below-or-bypass' | 'weather-leaf' | 'unresolved'
  readonly reason: string
  readonly uniformVerticalExtentMm?: readonly [number, number]
}

const zero = (): [number, number, number] => [0, 0, 0]
const add = (target: number[], vector: OriginVector, factor = 1) => {
  vector.forEach((value, index) => { target[index] += value * factor })
}

export function partitionDpcOrigins(
  origins: readonly OriginLoad[], rules: readonly OriginPathRule[], cutZMm: number,
  factors: Readonly<Record<string, number>>,
) {
  if (!Number.isFinite(cutZMm) || !Object.keys(factors).length
      || Object.entries(factors).some(([key, factor]) => !['G', 'Q', 'U', 'retainedMin'].includes(key)
        || !Number.isFinite(factor) || factor < 0)) throw new Error('Invalid DPC cut or signed load factors')
  const byFamily = new Map(rules.map(rule => [rule.family, rule]))
  if (byFamily.size !== rules.length) throw new Error('Duplicate originating load path rule')
  for (const rule of rules) {
    if (!rule.reason || !['inner-wall', 'below-or-bypass', 'weather-leaf', 'unresolved'].includes(rule.path)) {
      throw new Error('Invalid originating load path rule')
    }
    const extent = rule.uniformVerticalExtentMm
    if (extent && (rule.path !== 'inner-wall' || extent.length !== 2 || !extent.every(Number.isFinite)
        || extent[1] <= extent[0])) throw new Error('Invalid uniform member vertical extent')
  }
  const ids = new Set<string>()
  const totals = { all: zero(), innerWallAboveCut: zero(), belowOrBypass: zero(), weatherLeaf: zero(), unresolved: zero() }
  const entries = origins.map(origin => {
    const id = `${origin.family}/${origin.case}`
    if (ids.has(id) || !origin.family || !['G', 'Q', 'U', 'retainedMin'].includes(origin.case)
        || origin.N_Xmoment_Ymoment.length !== 3 || !origin.N_Xmoment_Ymoment.every(Number.isFinite)) {
      throw new Error('Invalid or duplicate originating load')
    }
    ids.add(id)
    const rule = byFamily.get(origin.family)
    const factor = factors[origin.case] ?? 0
    const scaled = origin.N_Xmoment_Ymoment.map(value => value * factor) as [number, number, number]
    add(totals.all, scaled)
    let aboveFraction: number | null = null
    if (rule?.path === 'inner-wall') {
      const extent = rule.uniformVerticalExtentMm
      aboveFraction = extent ? Math.max(0, Math.min(1, (extent[1] - cutZMm) / (extent[1] - extent[0]))) : 1
      add(totals.innerWallAboveCut, scaled, aboveFraction)
      add(totals.belowOrBypass, scaled, 1 - aboveFraction)
    } else {
      add(totals[rule?.path === 'below-or-bypass' ? 'belowOrBypass'
        : rule?.path === 'weather-leaf' ? 'weatherLeaf' : 'unresolved'], scaled)
    }
    return {
      id, family: origin.family, loadCase: origin.case, factor,
      path: rule?.path ?? 'unresolved', reason: rule?.reason ?? 'No authored crossing identity for this originating family.',
      characteristic: origin.N_Xmoment_Ymoment, factored: scaled, aboveFraction,
      ...(rule?.uniformVerticalExtentMm ? { uniformVerticalExtentMm: rule.uniformVerticalExtentMm } : {}),
    }
  })
  const partitioned = zero()
  for (const name of ['innerWallAboveCut', 'belowOrBypass', 'weatherLeaf', 'unresolved'] as const) add(partitioned, totals[name])
  const residual = partitioned.map((value, index) => value - totals.all[index])
  if (residual.some(value => Math.abs(value) > 1e-7)) throw new Error('DPC originating load partition loses force or first moment')
  return {
    cutZMm, componentOrder: ['N_kN', 'X_first_moment_kNm', 'Y_first_moment_kNm'] as const,
    entries, totals, partitionResidual: residual,
    unknownFamilies: [...new Set(entries.filter(entry => entry.path === 'unresolved').map(entry => entry.family))].sort(),
    completeSpliceDemand: null,
    installedAcceptance: false as const,
  }
}
