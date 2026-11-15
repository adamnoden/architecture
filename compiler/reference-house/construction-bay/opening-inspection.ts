import { compileOpeningCutouts } from '../../architectural-drawing/opening-topology.js'
import type { AdeArchitecturalPlan, AdeDistanceAuthority, AdeProvenance } from '../../architectural-drawing/model.js'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import { mm } from '../../units.js'
import { readGeorgianDesignSnapshot } from '../current-design/georgian-source.js'
import { resolveCurrentDesign } from '../current-design/resolve.js'
import { lookupDesignWall, type StoreyId, type StoreyObjectId } from '../current-design/snapshot.js'

interface OpeningReference {
  readonly bayId: string
  readonly level: StoreyId
  readonly hostWallId: StoreyObjectId
  readonly openingId: StoreyObjectId
}

const frontStudy = {
  bayId: 'BAY-FRONT-STUDY-01',
  level: 'GROUND',
  hostWallId: 'GROUND/outer-south',
  openingId: 'GROUND/south-window-0',
} satisfies OpeningReference

const exact = (value: number) => ({ kind: 'exact', value: mm(value) }) as const
function known(distance: AdeDistanceAuthority) {
  if (distance.kind !== 'exact') throw new TypeError('Opening inspection requires a resolved model distance')
  return distance.value
}

export function inspectHostedOpening(input: unknown, ref: OpeningReference) {
  const { design, disciplineBindings } = resolveCurrentDesign(input)
  const level = design.storeys[ref.level]
  const opening = level?.openings.find(occurrence => occurrence.id === ref.openingId)
  if (!opening) throw new TypeError(`Missing opening ${ref.openingId} on ${ref.level}`)
  if (opening.hostWallId !== ref.hostWallId) throw new TypeError(`Opening ${opening.id} is hosted by ${opening.hostWallId}, expected ${ref.hostWallId}`)

  const host = lookupDesignWall(design, ref.level, opening.hostWallId)
  const assembly = design.assemblies.find(candidate => candidate.id === host.assemblyId)
  if (!assembly) throw new TypeError(`Missing host assembly ${host.assemblyId}`)
  const horizontal = host.from[1] === host.to[1]
  const axis = horizontal ? 0 : 1
  const fromId = `${opening.hostWallId}/start`
  const toId = `${opening.hostWallId}/end`
  const id = `${ref.bayId}/opening/${opening.id}`
  const provenance: AdeProvenance = {
    sourceIds: [design.source.id, opening.hostWallId, opening.id, assembly.id],
    authority: 'provisional', precision: 'exact',
  }
  const plan: AdeArchitecturalPlan = {
    id, sourceId: design.source.id,
    nodes: [host.from, host.to].map(([x, y], i) => ({ kind: 'node', id: i === 0 ? fromId : toId, point: { x: mm(x), y: mm(y) }, provenance })),
    wallAssemblies: [{ kind: 'wall-assembly', id: assembly.id, thickness: exact(assembly.depthMm), provenance }],
    walls: [{ kind: 'wall', id: opening.hostWallId, fromNodeId: fromId, toNodeId: toId, reference: host.reference, assemblyId: assembly.id, provenance }],
    openings: [{ kind: 'opening', id: opening.id, hostWallId: opening.hostWallId, role: opening.kind,
      centreOffset: exact((opening.centreMm - host.from[axis]) * Math.sign(host.to[axis] - host.from[axis])),
      width: exact(opening.widthMm), provenance }],
    partitionDatums: [], spaces: [], adjacencies: [], dimensions: [], labels: [],
  }
  const [cutout] = compileOpeningCutouts(plan, {
    resolveAssemblyThicknessMm: item => known(item.thickness),
    resolveOpeningCentreOffsetMm: item => known(item.centreOffset),
    resolveOpeningWidthMm: item => known(item.width),
  })
  const { x0, y0, x1, y1 } = cutout.rect
  return {
    schema: 'ade-opening-inspection/1',
    purpose: 'nominal-model-inspection',
    source: { ...design.source, planDigest: sha256SemanticFingerprint(design) },
    units: design.units,
    datum: design.datum,
    sourceBindings: disciplineBindings.map(({ id, state, digest }) => ({ id, state, digest })),
    model: { plan, cutout },
    row: {
      id, level: ref.level, openingId: opening.id, hostWallId: opening.hostWallId, kind: opening.kind,
      cutoutId: cutout.id, levelElevationMm: level.elevationMm, widthMm: horizontal ? x1 - x0 : y1 - y0,
      axisIntervalMm: horizontal ? [x0, x1] : [y0, y1],
      hostAssembly: { id: assembly.id, depthMm: assembly.depthMm, state: assembly.state },
      unresolved: {
        verticalExtent: { state: 'unresolved', reason: 'The snapshot supplies a plan aperture. The section source controls sill and head.' },
        installedComponents: { state: 'unresolved', reason: design.coverage['installed-assemblies'].reason },
        quantities: { state: 'unresolved', reason: 'Installed assembly and component counts require controlled specification inputs.' },
      },
    },
  } as const
}

export function inspectGeorgianFrontStudyBay() {
  const inspection = inspectHostedOpening(readGeorgianDesignSnapshot(), frontStudy)
  return {
    ...inspection,
    technicalBayApplicability: {
      state: 'withheld',
      reason: 'The composed SAP-C1 investigation uses a different aperture position, wall and structural backing. Technical inspection requires its own admitted source.',
      reference: 'project/bcr/bay-interface-study.md',
    },
    references: {
      bay: 'project/bcr/bay-brief-result.md',
      apertureBasis: 'compiler/reference-house/georgian/layout-revision.ts',
      verticalExtent: 'compiler/reference-house/georgian/layout-family.ts',
      installedComponents: 'project/oas/study-subframe-comparison.md',
      coordinatedFitAndQuantities: 'project/bcr/bay-interface-study.md',
    },
  } as const
}
