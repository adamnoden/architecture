import {fittingToDrawingPrimitives} from './fitting-drawing.js'
import { returnStairToDrawingPrimitives } from './stair-drawing.js'
import { openingSymbolToDrawingPrimitives } from './opening-symbol.js'
import { compileWallAssemblyTopology, type AdeWallAssemblyTopologyOptions } from './assembly-topology.js'
import { wallAssemblyBandToDrawingPath } from './assembly-drawing.js'
import { dimensionToDrawingPrimitives, type AdeDimensionDrawingOptions } from './dimension-drawing.js'
import type { AdeArchitecturalPlan, AdeAdjacencyObligation, AdeOpening, AdePlanLabel, AdeWallAssembly } from './model.js'
import { compileOpeningCutouts, applyOpeningCutoutsToAssemblyBands, applyOpeningCutoutsToWallRegions } from './opening-topology.js'
import { compileOpeningUncertaintyInstruction, openingUncertaintyToDrawingPrimitives } from './opening-uncertainty.js'
import { adjacencyObligationToDrawingPrimitives, partitionDatumToDrawingPath } from './partition-adjacency.js'
import { assertAdeRepresentationProfile, type AdeRepresentationProfile } from './profile.js'
import { subtractRectilinearRectangles } from './rectilinear-region.js'
import { compileWallTopology } from './topology.js'
import { wallTopologyRegionToDrawingPath } from './wall-drawing.js'
import { assertValidArchitecturalPlan } from './validate.js'
import type { DrawingSceneV2 } from '../publication-drawing-v2/model.js'
import type { PlanPaperProjection } from '../publication-drawing/projection.js'

export interface AdePlanDrawingOptions extends AdeWallAssemblyTopologyOptions {
  profile: AdeRepresentationProfile
  projection: PlanPaperProjection
  widthMm: number
  heightMm: number
  title: string
  /** Explicit material abutments: subject bodies stop at host material, never by paint order. */
  abutments?: Readonly<Record<string, readonly string[]>>
  /** Faint boundaries make the cavity legible without inventing masonry bond. */
  layerBoundaryOpacity?: number
  /** Opt-in successor IDs preserve historical specimen fingerprints. */
  wallRegionIds?: 'legacy' | 'assembly-qualified'
  openingSide: (opening: AdeOpening) => 'left' | 'right'
  adjacencySide?: (adjacency: AdeAdjacencyObligation) => 'left' | 'right'
  dimensionOptions?: AdeDimensionDrawingOptions
  labelLayout?: (label: AdePlanLabel) => { dxPaperMm?: number; dyPaperMm?: number; rotateDeg?: number }
}

/** Compose accepted architectural capabilities. No Reference House IDs or source choices live here. */
export const compileArchitecturalPlanScene = (plan: AdeArchitecturalPlan, options: AdePlanDrawingOptions): DrawingSceneV2 => {
  assertValidArchitecturalPlan(plan)
  assertAdeRepresentationProfile(options.profile)
  if (options.profile.scaleDenominator !== options.projection.scaleDenominator) throw new Error('ADE profile/projection scale mismatch.')
  if (![options.widthMm, options.heightMm].every((n) => Number.isFinite(n) && n > 0)) throw new Error('ADE scene requires positive finite paper dimensions.')
  const primitives: DrawingSceneV2['primitives'] = []
  const instructions = plan.openings.map((opening) => compileOpeningUncertaintyInstruction(plan, opening.id))
  // Unknown/host-only states never become plausible cuts. Ranges cut only the guaranteed minimum.
  const cuttable = plan.openings.filter((opening) =>
    instructions.some((i) => i.openingId === opening.id && ['exact', 'approximate-aperture', 'range-width'].includes(i.kind)))
  const cutouts = compileOpeningCutouts({ ...plan, openings: cuttable }, {
    resolveAssemblyThicknessMm: options.resolveAssemblyThicknessMm,
    resolveOpeningCentreOffsetMm: (o) => {
      if (o.centreOffset.kind !== 'exact' && o.centreOffset.kind !== 'approximate') throw new Error(`Unresolved centre ${o.id}.`)
      return o.centreOffset.value
    },
    resolveOpeningWidthMm: (o) => {
      if (o.width.kind === 'range') return o.width.min
      if (o.width.kind !== 'exact' && o.width.kind !== 'approximate') throw new Error(`Unresolved width ${o.id}.`)
      return o.width.value
    }
  })
  const familyPlan = (assembly: AdeWallAssembly): AdeArchitecturalPlan => ({
    ...plan, wallAssemblies: [assembly], walls: plan.walls.filter((w) => w.assemblyId === assembly.id),
    openings: [], partitionDatums: [], adjacencies: [], dimensions: [], labels: []
  })
  const topologyByAssembly = new Map(plan.wallAssemblies.filter((a) => plan.walls.some((w) => w.assemblyId === a.id))
    .map((a) => [a.id, compileWallTopology(familyPlan(a), options)]))
  for (const [subject, hosts] of Object.entries(options.abutments ?? {})) {
    if (!topologyByAssembly.has(subject) || hosts.some((id) => !topologyByAssembly.has(id) || id === subject)) throw new Error(`Invalid ADE abutment ${subject}.`)
  }
  for (const assembly of plan.wallAssemblies) {
    const topology = topologyByAssembly.get(assembly.id)
    if (!topology) continue
    const hostRects = (options.abutments?.[assembly.id] ?? []).flatMap((id) => topologyByAssembly.get(id)!.sourceRectangles)
    const regions = applyOpeningCutoutsToWallRegions(topology.regions, cutouts).map((region) => ({
      ...region, id: options.wallRegionIds === 'assembly-qualified' ? `${region.id}::${assembly.id}` : region.id, rings: hostRects.length ? subtractRectilinearRectangles(region.rings, hostRects) : region.rings
    }))
    const metadata = { authorityClass: 'A+B', authority: assembly.provenance.authority, precision: assembly.provenance.precision,
      assembly: assembly.id, assemblySources: assembly.provenance.sourceIds.join(',') }
    if (assembly.layers?.length) {
      const bands = applyOpeningCutoutsToAssemblyBands(compileWallAssemblyTopology(familyPlan(assembly), assembly.id, options).bands, cutouts)
      for (const band of bands) {
        if (band.layerRole === 'cavity-zone') continue
        const rings = hostRects.length ? subtractRectilinearRectangles(band.rings, hostRects) : band.rings
        if (!rings.length) continue
        const path = wallAssemblyBandToDrawingPath({ ...band, rings }, options.projection, {
          fill: ['structural-leaf', 'finish-zone'].includes(band.layerRole) ? 'context' : 'faint',
          stroke: options.layerBoundaryOpacity === undefined ? undefined : 'secondary', metadata
        })
        if (options.layerBoundaryOpacity !== undefined) path.strokeOpacity = options.layerBoundaryOpacity
        primitives.push(path)
      }
      for (const region of regions) if (region.rings.length) primitives.push(wallTopologyRegionToDrawingPath(region, options.projection, { stroke: 'profile', fill: 'none', metadata }))
    } else {
      for (const region of regions) if (region.rings.length) primitives.push(wallTopologyRegionToDrawingPath(region, options.projection, { stroke: 'secondary', fill: 'faint', metadata }))
    }
  }
  for (const instruction of instructions) {
    const opening = plan.openings.find((o) => o.id === instruction.openingId)!
    if (opening.symbol) {
      primitives.push(...openingSymbolToDrawingPrimitives(plan, opening, options.projection, options.resolveAssemblyThicknessMm))
      continue
    }
    primitives.push(...openingUncertaintyToDrawingPrimitives(plan, instruction, options.projection, {
      annotationSide: options.openingSide(opening), resolveAssemblyThicknessMm: options.resolveAssemblyThicknessMm,
      gapPaperMm: 2.5, showLabels: false
    }))
  }
  for (const datum of plan.partitionDatums) primitives.push(partitionDatumToDrawingPath(plan, datum, options.projection))
  for (const adjacency of plan.adjacencies) primitives.push(...adjacencyObligationToDrawingPrimitives(plan, adjacency, options.projection, {
    annotationSide: options.adjacencySide?.(adjacency) ?? 'left', offsetPaperMm: 2.5, tickPaperMm: 1.3,
    minimumSegmentPaperMm: 2 * (Math.max(...plan.wallAssemblies.map((a) => options.projection.length(options.resolveAssemblyThicknessMm(a))), 0) + 1),
    endpointInsetPaperMm: Math.max(...plan.wallAssemblies.map((a) => options.projection.length(options.resolveAssemblyThicknessMm(a))), 0) + 1
  }))
  for (const stair of plan.stairs ?? []) primitives.push(...returnStairToDrawingPrimitives(stair, options.projection))
  for(const fitting of plan.fittings ?? [])primitives.push(...fittingToDrawingPrimitives(fitting,options.projection))
  for (const dimension of plan.dimensions) primitives.push(...dimensionToDrawingPrimitives(dimension, options.projection,
    options.dimensionOptions ?? { annotationSide: 'right', offsetPaperMm: 13 }))
  for (const label of plan.labels) {
    const point = options.projection.point(label.anchor.x, label.anchor.y)
    const layout = options.labelLayout?.(label) ?? {}
    primitives.push({ kind: 'text', id: label.id, x: point.x + (layout.dxPaperMm ?? 0), y: point.y + (layout.dyPaperMm ?? 0),
      value: label.text, role: label.role === 'space' ? 'label' : label.role === 'marker' ? 'marker' : 'note', anchor: 'middle', rotateDeg: layout.rotateDeg,
      metadata: { authorityClass: 'A+B', target: label.targetId, authority: label.provenance.authority, precision: label.provenance.precision, sources: label.provenance.sourceIds.join(',') } })
  }
  return { widthMm: options.widthMm, heightMm: options.heightMm, viewId: `${plan.id}-${options.profile.id}`, title: options.title,
    description: 'Coordination representation; provisional construction and unresolved openings remain explicit. No technical adequacy asserted.',
    scaleDenominator: options.profile.scaleDenominator, sourceId: plan.sourceId, primitives }
}
