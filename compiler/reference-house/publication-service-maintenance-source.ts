import { createReferenceHouseServiceSource } from '../rhc3/fixture.js'
import { createReferenceHouseSource } from './fixture.js'
import { createServiceTransverseSectionSource } from './publication-service-section-source.js'

export type ServiceMaintenanceAuthority =
  | 'RH_C3_SERVICE_TOPOLOGY'
  | 'TECHNICAL_COORDINATION_SELECTED_OUTSIDE_RH_C1'

export interface SelectedServiceMaintenanceFact<T> {
  id: string
  value: T
  authority: ServiceMaintenanceAuthority
  precision: 'architectural-geography' | 'qualitative'
  provenance: readonly string[]
}

const selected = <T>(
  id: string,
  value: T,
  authority: ServiceMaintenanceAuthority,
  precision: SelectedServiceMaintenanceFact<T>['precision'],
  provenance: readonly string[]
): SelectedServiceMaintenanceFact<T> => ({ id, value, authority, precision, provenance })

const unique = (values: readonly string[]): string[] => [...new Set(values)]

export const createServiceMaintenanceOverlaySource = () => {
  const house = createReferenceHouseSource()
  const topology = createReferenceHouseServiceSource(house)
  const section = createServiceTransverseSectionSource()

  const node = (id: string) => {
    const found = topology.nodes.find((candidate) => candidate.id === id)
    if (!found) throw new Error(`DRW-10B requires RHC3 service node ${id}.`)
    return found
  }

  const hostSpaces = (...nodeIds: string[]): string[] =>
    unique(nodeIds.flatMap((id) => node(id).hostSpaceIds))

  const groundDistributionHosts = hostSpaces('DRY-G-01', 'HYD-G-01', 'MV-G-SUPPLY')
  const firstDistributionHosts = hostSpaces('DRY-U-01', 'HYD-U-01', 'MV-U-SUPPLY')
  const groundWetHosts = hostSpaces('G-WET-TERMINALS')
  const firstWetHosts = hostSpaces('U-BATH-TERMINALS')
  const groundProtected = topology.protectedPrimaryFreeSpaceIds.filter((id) => id.startsWith('G-'))
  const firstProtected = topology.protectedPrimaryFreeSpaceIds.filter((id) => id.startsWith('U-'))

  return {
    views: {
      ground: {
        id: 'REFERENCE-HOUSE-GROUND-SERVICE-MAINTENANCE-OVERLAY' as const,
        substrate: 'REFERENCE-HOUSE-GROUND-PLAN' as const,
        scale: 100 as const
      },
      first: {
        id: 'REFERENCE-HOUSE-FIRST-SERVICE-MAINTENANCE-OVERLAY' as const,
        substrate: 'REFERENCE-HOUSE-FIRST-FLOOR-PLAN' as const,
        scale: 100 as const
      }
    },
    topology: selected(
      'DRW10B-RHC3-TOPOLOGY',
      { fixtureId: topology.fixtureId, planFixtureId: topology.planFixtureId },
      'RH_C3_SERVICE_TOPOLOGY',
      'architectural-geography',
      ['compiler/rhc3/fixture.ts', 'compiler/rhc3/README.md']
    ),
    ground: {
      plantHostSpaceIds: selected(
        'DRW10B-GROUND-PLANT-HOSTS',
        hostSpaces('G-PLANT-01', 'MVHR-01', 'FS-BASE-01'),
        'RH_C3_SERVICE_TOPOLOGY',
        'architectural-geography',
        ['G-PLANT-01', 'MVHR-01', 'FS-BASE-01']
      ),
      wetHostSpaceIds: selected(
        'DRW10B-GROUND-WET-HOSTS',
        groundWetHosts,
        'RH_C3_SERVICE_TOPOLOGY',
        'architectural-geography',
        ['G-WET-TERMINALS']
      ),
      distributionHostSpaceIds: selected(
        'DRW10B-GROUND-DISTRIBUTION-HOSTS',
        groundDistributionHosts,
        'RH_C3_SERVICE_TOPOLOGY',
        'architectural-geography',
        ['DRY-G-01', 'HYD-G-01', 'MV-G-SUPPLY']
      ),
      protectedPrimarySpaceIds: selected(
        'DRW10B-GROUND-PROTECTED',
        groundProtected,
        'RH_C3_SERVICE_TOPOLOGY',
        'qualitative',
        ['protectedPrimaryFreeSpaceIds']
      ),
      riserReservation: section.serviceZone.clearReservation,
      access: section.serviceZone.access,
      plant: section.sectionContexts.groundPlant
    },
    first: {
      wetHostSpaceIds: selected(
        'DRW10B-FIRST-WET-HOSTS',
        firstWetHosts,
        'RH_C3_SERVICE_TOPOLOGY',
        'architectural-geography',
        ['U-BATH-TERMINALS']
      ),
      distributionHostSpaceIds: selected(
        'DRW10B-FIRST-DISTRIBUTION-HOSTS',
        firstDistributionHosts,
        'RH_C3_SERVICE_TOPOLOGY',
        'architectural-geography',
        ['DRY-U-01', 'HYD-U-01', 'MV-U-SUPPLY']
      ),
      protectedPrimarySpaceIds: selected(
        'DRW10B-FIRST-PROTECTED',
        firstProtected,
        'RH_C3_SERVICE_TOPOLOGY',
        'qualitative',
        ['protectedPrimaryFreeSpaceIds']
      ),
      riserReservation: section.serviceZone.clearReservation,
      bathroom: section.sectionContexts.upperBathroom,
      gallery: section.sectionContexts.eastGallery,
      access: section.serviceZone.access,
      remoteEnsuiteInfrastructure: selected(
        'DRW10B-REMOTE-ENSUITE-ABSENCE',
        'REMOVED_RATHER_THAN_ADD_SECOND_PERMANENT_STACK' as const,
        'TECHNICAL_COORDINATION_SELECTED_OUTSIDE_RH_C1',
        'qualitative',
        ['docs/reference-house/structural-coordination.md']
      )
    },
    technicalAbsences: {
      routeCentrelines: 'ABSENT_TECHNICAL' as const,
      exactPipeDuctCableSizes: 'ABSENT_TECHNICAL' as const,
      plantPacking: section.technicalAbsences.plantEquipmentPacking,
      penetrationCoordinates: section.technicalAbsences.penetrationCoordinates,
      finalStructuralOpening: section.technicalAbsences.finalStructuralOpening
    }
  }
}

export type ServiceMaintenanceOverlaySource = ReturnType<typeof createServiceMaintenanceOverlaySource>
