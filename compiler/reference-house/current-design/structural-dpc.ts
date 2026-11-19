import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import type { CurrentDesignResolution } from './resolve.js'
import { partitionDpcOrigins, type OriginLoad, type OriginPathRule } from './dpc-origin-ledger.js'
import { runStructuralOriginAccount } from './structural.js'

const root = new URL('../../../', import.meta.url)
const policyPath = 'project/str/dpc-origin-paths.json'
const geometryPaths = {
  lateral: 'project/str/studies/current-house-lateral.json',
  grid: 'project/str/studies/current-house-grid.json',
  collar: 'project/str/studies/floor-portal-north-collar.json',
} as const

function boundRead(path: string, identities: Readonly<Record<string, string>>) {
  const bytes = readFileSync(new URL(path, root))
  const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
  if (identities[path] !== blob) throw new Error(`DPC load path source differs from its structural binding at ${path}`)
  return { blob, value: JSON.parse(bytes.toString('utf8')) }
}

export function runStructuralDpcOriginAudit(resolved: CurrentDesignResolution, cutZMm?: number) {
  const structure = resolved.disciplineBindings.find(binding => binding.id === 'str-conditional-interface')
  if (!structure) throw new Error('DPC originating load audit requires the current structural source')
  const policy = boundRead(policyPath, structure.identities)
  const lateral = boundRead(geometryPaths.lateral, structure.identities)
  const grid = boundRead(geometryPaths.grid, structure.identities)
  const collar = boundRead(geometryPaths.collar, structure.identities)
  const plane: [number, number] = lateral.value.capillarySplice.plateZ
  const cut = cutZMm ?? (plane[0] + plane[1]) / 2
  if (!Number.isFinite(cut) || !(plane[0] < cut && cut < plane[1])) {
    throw new Error('The DPC audit cut must lie inside the source imperforate plate')
  }
  if (policy.value.schema !== 'str-dpc-origin-paths/1' || !Array.isArray(policy.value.rules)) {
    throw new Error('Invalid DPC originating path policy')
  }
  const groundTop = Math.max(...Object.values(grid.value.girders as Record<string, { z: number[] }>).map(girder => girder.z[1]))
  const floorSoffit = collar.value.cornerCandidate.sameExistingSoffitOrdinarySlabTopAndCollarTopZmm[0]
  const actions = runStructuralOriginAccount(resolved)
  if (floorSoffit - groundTop !== actions.native.coreBudgetHeightsMm.ground) {
    throw new Error('The physical ground core interval differs from the native uniform load budget height')
  }
  const rules: OriginPathRule[] = policy.value.rules.map((rule: OriginPathRule & { verticalExtent?: string }) => {
    if (rule.verticalExtent && rule.verticalExtent !== 'ground-core-to-first-soffit') {
      throw new Error('Unknown DPC member vertical extent')
    }
    return { family: rule.family, path: rule.path, reason: rule.reason,
      ...(rule.verticalExtent ? { uniformVerticalExtentMm: [groundTop, floorSoffit] as const } : {}) }
  })
  const origins: readonly OriginLoad[] = actions.native.origins
  const combinations = [
    { id: 'GQ', factors: { G: 1.35, Q: 1.5 } },
    { id: 'stripped-suction', factors: { U: 1 } },
    { id: 'retained-suction', factors: { U: 1, retainedMin: 1 } },
  ] as const
  return {
    schema: 'str-dpc-origin-audit/1' as const, source: actions.source,
    status: 'incomplete-joint-demand' as const,
    sourcePlateZMm: plane, cutZMm: cut,
    method: { id: 'str-dpc-origin-path-partition/1', structuralReplay: actions.method,
      inputs: { [policyPath]: policy.blob, [geometryPaths.lateral]: lateral.blob,
        [geometryPaths.grid]: grid.blob, [geometryPaths.collar]: collar.blob } },
    cases: combinations.map(({ id, factors }) => ({ id, ...partitionDpcOrigins(origins, rules, cut, factors) })),
    completeSpliceDemand: null,
    installedAcceptance: false as const,
    diagnostics: [
      { code: 'DPC_GROSS_BUDGET_PARTITION_ONLY',
        message: 'The ground-core source is a gross uniform material/finish budget. Splitting it at a cut is accounting sensitivity, not a physical concrete slice inside the metal plate or an actual splice reaction.' },
      { code: 'DPC_CROSSING_OWNERSHIP_INCOMPLETE',
        message: 'Inner-wall totals are source-origin accounting over all inner crossings. Actual wall/pier distribution and mixed reserve extents are unresolved; these are not NW or NE splice demands.' },
      { code: 'DPC_SIGNED_LATERAL_CUT_MISSING',
        message: 'This partition preserves vertical force and two first moments. Signed six-component cut actions require originating lateral forces at their actual heights and exclude below-cut facade/plinth actions.' },
      { code: 'DPC_CANDIDATE_COMPATIBILITY_UNPROVED',
        message: 'Retained fixed-base load paths are recomputed. The widened collector, fixed wall head, tied roof sectors, joint stiffness and non-plastic moisture continuity require the joined successor model.' },
    ],
  }
}
