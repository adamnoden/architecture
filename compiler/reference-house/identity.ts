import type { CalculationMethod } from '../calculation-slice/model.js'
import { sha256SemanticFingerprint } from '../core/identity.js'
import type { ReferenceHouseCoordinationSource } from './model.js'
import type { ReferenceHouseSystemCoreResult } from './system-compile.js'

export const REFERENCE_HOUSE_COMPILE_SCHEMA_VERSION = 'HK-RH-COMPILE-1' as const

const byId = <T extends { id: string }>(items: readonly T[]): T[] =>
  [...items].sort((a, b) => a.id.localeCompare(b.id))

/**
 * Canonicalizes only collections whose order is not an architectural source fact.
 * Nested arrays are otherwise preserved: stable hashing must not erase authored sequence.
 */
export const canonicalReferenceHouseSource = (
  source: ReferenceHouseCoordinationSource
): ReferenceHouseCoordinationSource => ({
  ...source,
  spaces: byId(source.spaces),
  boundaries: byId(source.boundaries),
  requiredAdjacencies: byId(source.requiredAdjacencies),
  openingFamilies: byId(source.openingFamilies),
  openings: byId(source.openings),
  qualitativeOpeningRelationships: byId(source.qualitativeOpeningRelationships)
})

export const referenceHouseSourceFingerprint = (source: ReferenceHouseCoordinationSource): string =>
  sha256SemanticFingerprint(canonicalReferenceHouseSource(source))

export const canonicalCalculationMethod = (method: CalculationMethod): CalculationMethod => ({
  ...method,
  criteria: byId(method.criteria)
})

export const calculationMethodSemanticFingerprint = (method: CalculationMethod): string =>
  sha256SemanticFingerprint(canonicalCalculationMethod(method))

const domainDiagnostics = (
  diagnostics: readonly { code: string; status: string; subjectIds: readonly string[] }[]
) =>
  diagnostics
    .map((item) => ({
      code: item.code,
      status: item.status,
      subjectIds: [...item.subjectIds].sort()
    }))
    .sort((a, b) => {
      const byCode = a.code.localeCompare(b.code)
      if (byCode) return byCode
      const byStatus = a.status.localeCompare(b.status)
      if (byStatus) return byStatus
      return a.subjectIds.join('|').localeCompare(b.subjectIds.join('|'))
    })

export const referenceHouseSemanticResultManifest = (
  result: ReferenceHouseSystemCoreResult
) => {
  const stair = result.calculations.privateStairGeometry
  return {
    schemaVersion: REFERENCE_HOUSE_COMPILE_SCHEMA_VERSION,
    fixtureId: result.house.fixtureId,
    status: result.status,
    statuses: {
      house: result.house.status,
      plan: result.plan.status,
      structure: result.structure.status,
      services: result.services.status,
      boundary: result.boundary.status,
      privateStairGeometry: stair.status
    },
    proof: result.proof,
    diagnostics: {
      house: domainDiagnostics(result.diagnostics.house),
      plan: domainDiagnostics(result.diagnostics.plan),
      structure: domainDiagnostics(result.diagnostics.structure),
      services: domainDiagnostics(result.diagnostics.services),
      boundary: domainDiagnostics(result.diagnostics.boundary),
      privateStairGeometry: result.diagnostics.privateStairGeometry
        .map((item) => ({ code: item.code }))
        .sort((a, b) => a.code.localeCompare(b.code))
    },
    derived: {
      shellMm: {
        width: result.house.derived.shell.width,
        depth: result.house.derived.shell.depth
      },
      courtyardMm: {
        width: result.house.derived.court.width,
        depth: result.house.derived.court.depth
      },
      floorZoneDepthMm: result.floorZoneDepth,
      planPlateAreaMm2: Object.fromEntries(
        [...result.plan.derived.plateAreas]
          .sort((a, b) => a.levelId.localeCompare(b.levelId))
          .map((item) => [item.levelId, item.area])
      ),
      structure: {
        spanFieldCount: result.structure.derived.spanFields.length,
        bearingOpeningCount: result.structure.derived.bearingOpenings.length,
        grossFieldAreaMm2: result.structure.derived.grossFieldArea
      },
      services: {
        networkCount: result.services.derived.networks.length,
        selectedCrossingIds: [...result.services.derived.selectedCrossingIds].sort()
      },
      boundary: {
        systemCount: result.boundary.derived.systems.length,
        carrierCount: result.boundary.derived.carriers.length,
        openingObligationCount: result.boundary.derived.openingObligations.length,
        serviceObligationCount: result.boundary.derived.serviceObligations.length,
        drainageRouteCount: result.boundary.derived.drainageRoutes.length,
        roofCatchmentTotalMm2: result.coordination.boundary.roofCatchmentTotal,
        enclosedPlateAreaMm2: result.coordination.boundary.enclosedPlateArea,
        courtyardOpenSkyAreaMm2: result.coordination.boundary.courtyardOpenSkyArea,
        wallPlanningStressThicknessMm: result.coordination.boundary.wallPlanningStressThicknessMm
      },
      privateStair: {
        methodId: stair.methodId,
        methodVersion: stair.methodVersion,
        inputId: stair.inputId,
        criteria: [...stair.criteria]
          .sort((a, b) => a.criterionId.localeCompare(b.criterionId))
          .map((item) => ({
            criterionId: item.criterionId,
            status: item.status,
            observed: item.observed,
            unit: item.unit,
            target: item.target,
            authorityRef: item.authorityRef,
            sourceIds: [...item.sourceIds].sort()
          }))
      }
    }
  }
}

export type ReferenceHouseSemanticResultManifest = ReturnType<
  typeof referenceHouseSemanticResultManifest
>

export interface ReferenceHouseCompileManifest {
  readonly schemaVersion: typeof REFERENCE_HOUSE_COMPILE_SCHEMA_VERSION
  readonly sourceFingerprint: string
  readonly methods: {
    readonly privateStairGeometry: {
      readonly id: string
      readonly version: string
      readonly semanticFingerprint: string
    }
  }
  readonly resultFingerprint: string
}

export interface ReferenceHouseCompileIdentity {
  readonly schemaVersion: typeof REFERENCE_HOUSE_COMPILE_SCHEMA_VERSION
  readonly source: {
    readonly algorithm: 'sha256'
    readonly semanticFingerprint: string
  }
  readonly methods: {
    readonly privateStairGeometry: {
      readonly id: string
      readonly version: string
      readonly algorithm: 'sha256'
      readonly semanticFingerprint: string
    }
  }
  readonly result: {
    readonly algorithm: 'sha256'
    readonly semanticFingerprint: string
    readonly manifest: ReferenceHouseSemanticResultManifest
  }
  readonly compile: {
    readonly algorithm: 'sha256'
    readonly fingerprint: string
    readonly manifest: ReferenceHouseCompileManifest
  }
}

export const createReferenceHouseCompileIdentity = (
  source: ReferenceHouseCoordinationSource,
  result: ReferenceHouseSystemCoreResult,
  privateStairMethod: CalculationMethod
): ReferenceHouseCompileIdentity => {
  const sourceFingerprint = referenceHouseSourceFingerprint(source)
  const methodFingerprint = calculationMethodSemanticFingerprint(privateStairMethod)
  const resultManifest = referenceHouseSemanticResultManifest(result)
  const resultFingerprint = sha256SemanticFingerprint(resultManifest)
  const compileManifest: ReferenceHouseCompileManifest = {
    schemaVersion: REFERENCE_HOUSE_COMPILE_SCHEMA_VERSION,
    sourceFingerprint,
    methods: {
      privateStairGeometry: {
        id: privateStairMethod.id,
        version: privateStairMethod.version,
        semanticFingerprint: methodFingerprint
      }
    },
    resultFingerprint
  }
  const compileFingerprint = sha256SemanticFingerprint(compileManifest)

  return {
    schemaVersion: REFERENCE_HOUSE_COMPILE_SCHEMA_VERSION,
    source: {
      algorithm: 'sha256',
      semanticFingerprint: sourceFingerprint
    },
    methods: {
      privateStairGeometry: {
        id: privateStairMethod.id,
        version: privateStairMethod.version,
        algorithm: 'sha256',
        semanticFingerprint: methodFingerprint
      }
    },
    result: {
      algorithm: 'sha256',
      semanticFingerprint: resultFingerprint,
      manifest: resultManifest
    },
    compile: {
      algorithm: 'sha256',
      fingerprint: compileFingerprint,
      manifest: compileManifest
    }
  }
}

export interface ReferenceHouseLineageEntry {
  readonly sourceFactIds: readonly string[]
  readonly methodId?: string
  readonly ruleId?: string
}

export interface ReferenceHouseLineage {
  readonly floorZoneDepth: ReferenceHouseLineageEntry
  readonly boundaryCoordination: {
    readonly roofCatchmentTotal: ReferenceHouseLineageEntry
    readonly enclosedPlateArea: ReferenceHouseLineageEntry
    readonly courtyardOpenSkyArea: ReferenceHouseLineageEntry
    readonly wallPlanningStressThickness: ReferenceHouseLineageEntry
  }
  readonly privateStairGeometry: {
    readonly methodId: string
    readonly criteria: Readonly<Record<string, ReferenceHouseLineageEntry>>
  }
}

export const createReferenceHouseLineage = (
  source: ReferenceHouseCoordinationSource,
  result: ReferenceHouseSystemCoreResult
): ReferenceHouseLineage => {
  const stair = result.calculations.privateStairGeometry
  return {
    floorZoneDepth: {
      sourceFactIds: [source.levels.groundCeiling.id, source.levels.firstFfl.id],
      ruleId: 'RH-FLOOR-ZONE-DEPTH'
    },
    boundaryCoordination: {
      roofCatchmentTotal: {
        sourceFactIds: [source.shell.width.id, source.shell.depth.id, source.court.id],
        ruleId: 'RH-C4-ROOF-CATCHMENT-GEOMETRY'
      },
      enclosedPlateArea: {
        sourceFactIds: [source.shell.width.id, source.shell.depth.id, source.court.id],
        ruleId: 'RH-C4-ENCLOSED-PLATE-CLOSURE'
      },
      courtyardOpenSkyArea: {
        sourceFactIds: [source.court.id],
        ruleId: 'RH-C4-COURTYARD-CATCHMENT-GEOMETRY'
      },
      wallPlanningStressThickness: {
        sourceFactIds: [source.wallPlanning.stressThickness.id],
        ruleId: 'RH-C4-WALL-PLANNING-STRESS'
      }
    },
    privateStairGeometry: {
      methodId: stair.methodId,
      criteria: Object.fromEntries(
        stair.criteria.map((criterion) => [
          criterion.criterionId,
          {
            sourceFactIds: [...criterion.sourceIds].sort(),
            methodId: stair.methodId
          }
        ])
      )
    }
  }
}

export const linkReferenceHouseArtefacts = <T extends Readonly<Record<string, unknown>>>(
  identity: ReferenceHouseCompileIdentity,
  artefacts: T
) => ({
  schemaVersion: identity.schemaVersion,
  compileFingerprint: identity.compile.fingerprint,
  sourceFingerprint: identity.source.semanticFingerprint,
  artefacts
})
