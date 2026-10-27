import type { ReferenceHouseCoordinationSource } from '../reference-house/model.js'
import type { ServiceTopologySource } from '../service-slice/model.js'

export const createReferenceHouseServiceSource = (
  house: ReferenceHouseCoordinationSource
): ServiceTopologySource => {
 const source:ServiceTopologySource = ({
  fixtureId: 'RH-C3-REFERENCE-HOUSE-SERVICES',
  planFixtureId: house.fixtureId,
  structuralFixtureId: 'RH-C2-REFERENCE-HOUSE-STRUCTURE',
  protectedPrimaryFreeSpaceIds: [
    'G-DRAW-02',
    'G-FAM-02',
    'U-BED-02',
    'U-BED-P01',
    'U-BED-03',
    'U-BED-04'
  ],
  nodes: [
    { id: 'EXT-WATER', kind: 'external-source', label: 'incoming water', hostSpaceIds: [], requiredAccessKinds: [], provisional: true },
    { id: 'EXT-ELECTRIC', kind: 'external-source', label: 'incoming electricity', hostSpaceIds: [], requiredAccessKinds: [], provisional: true },
    { id: 'EXT-COMMS', kind: 'external-source', label: 'incoming communications', hostSpaceIds: [], requiredAccessKinds: [], provisional: true },
    { id: 'EXT-SEWER', kind: 'external-destination', label: 'external foul drainage handoff', hostSpaceIds: [], requiredAccessKinds: [], provisional: true },
    { id: 'EXT-AIR', kind: 'external-destination', label: 'outside air / discharge', hostSpaceIds: [], requiredAccessKinds: [], provisional: true },
    { id: 'ASHP-01', kind: 'external-source', label: 'external air-source heat pump', hostSpaceIds: [], requiredAccessKinds: ['replacement'], provisional: true },
    { id: 'PV-01', kind: 'external-source', label: 'roof PV field', hostSpaceIds: [], requiredAccessKinds: [], provisional: true },
    { id: 'G-PLANT-01', kind: 'plant', label: 'plant / isolation / distribution hub', hostSpaceIds: ['G-SVC-02'], requiredAccessKinds: ['working', 'replacement', 'isolation'], provisional: true },
    { id: 'MVHR-01', kind: 'equipment', label: 'central MVHR unit', hostSpaceIds: ['G-SVC-02'], requiredAccessKinds: ['working', 'replacement', 'filter-service'], provisional: true },
    { id: 'SV-01', kind: 'riser', label: 'vertical service zone', hostSpaceIds: ['G-SVC-02', 'U-BATH-01'], requiredAccessKinds: ['inspection'], provisional: true },
    { id: 'FS-BASE-01', kind: 'inspection-point', label: 'foul stack base / rodding', hostSpaceIds: ['G-SVC-02'], requiredAccessKinds: ['inspection'], provisional: true },
    { id: 'G-WET-TERMINALS', kind: 'terminal', label: 'kitchen / utility / WC wet terminals', hostSpaceIds: ['G-KIT-02', 'G-SVC-02'], requiredAccessKinds: [], provisional: true },
    { id: 'U-BATH-TERMINALS', kind: 'terminal', label: 'family bathroom wet terminals', hostSpaceIds: ['U-BATH-01'], requiredAccessKinds: [], provisional: true },
    { id: 'DRY-G-01', kind: 'distribution-hub', label: 'ground dry route', hostSpaceIds: ['G-GAL-01', 'G-HALL-02'], requiredAccessKinds: [], provisional: true },
    { id: 'DRY-U-01', kind: 'distribution-hub', label: 'upper dry route', hostSpaceIds: ['U-GAL-02', 'U-STAIR-01', 'U-LAND-N01'], requiredAccessKinds: [], provisional: true },
    { id: 'DRY-G-TERMINALS', kind: 'terminal', label: 'ground room dry branches', hostSpaceIds: ['G-DRAW-02', 'G-FAM-02', 'G-STUDY-02', 'G-KIT-02'], requiredAccessKinds: [], provisional: true },
    { id: 'DRY-U-TERMINALS', kind: 'terminal', label: 'upper room dry branches', hostSpaceIds: ['U-BED-02', 'U-BED-P01', 'U-BED-03', 'U-BED-04'], requiredAccessKinds: [], provisional: true },
    { id: 'HYD-G-01', kind: 'distribution-hub', label: 'ground hydronic distribution', hostSpaceIds: ['G-GAL-01', 'G-HALL-02'], requiredAccessKinds: [], provisional: true },
    { id: 'HYD-U-01', kind: 'distribution-hub', label: 'upper hydronic distribution', hostSpaceIds: ['U-GAL-02', 'U-STAIR-01', 'U-LAND-N01'], requiredAccessKinds: [], provisional: true },
    { id: 'HYD-G-TERMINALS', kind: 'terminal', label: 'ground low-temperature emitters', hostSpaceIds: ['G-DRAW-02', 'G-FAM-02', 'G-STUDY-02', 'G-GARDEN-02', 'G-KIT-02'], requiredAccessKinds: [], provisional: true },
    { id: 'HYD-U-TERMINALS', kind: 'terminal', label: 'upper low-temperature emitters', hostSpaceIds: ['U-BED-02', 'U-BED-P01', 'U-BED-03', 'U-BED-04'], requiredAccessKinds: [], provisional: true },
    { id: 'MV-G-SUPPLY', kind: 'distribution-hub', label: 'ground MVHR supply branch geography', hostSpaceIds: ['G-GAL-01', 'G-HALL-02'], requiredAccessKinds: [], provisional: true },
    { id: 'MV-U-SUPPLY', kind: 'distribution-hub', label: 'upper MVHR supply branch geography', hostSpaceIds: ['U-GAL-02', 'U-STAIR-01', 'U-LAND-N01'], requiredAccessKinds: [], provisional: true },
    { id: 'MV-G-SUPPLY-TERMINALS', kind: 'terminal', label: 'ground habitable MVHR supply terminals', hostSpaceIds: ['G-DRAW-02', 'G-FAM-02', 'G-STUDY-02', 'G-GARDEN-02'], requiredAccessKinds: [], provisional: true },
    { id: 'MV-U-SUPPLY-TERMINALS', kind: 'terminal', label: 'bedroom MVHR supply terminals', hostSpaceIds: ['U-BED-02', 'U-BED-P01', 'U-BED-03', 'U-BED-04'], requiredAccessKinds: [], provisional: true },
    { id: 'MV-G-EXTRACT-TERMINALS', kind: 'terminal', label: 'ground kitchen / utility / WC extract terminals', hostSpaceIds: ['G-KIT-02', 'G-SVC-02'], requiredAccessKinds: [], provisional: true },
    { id: 'MV-U-BATH-EXTRACT', kind: 'terminal', label: 'family bathroom MVHR extract terminal', hostSpaceIds: ['U-BATH-01'], requiredAccessKinds: [], provisional: true },
    { id: 'KX-01', kind: 'terminal', label: 'cooker source-capture hood', hostSpaceIds: ['G-KIT-02'], requiredAccessKinds: ['inspection'], provisional: true }
  ],
  routes: [
    { id: 'R-UE-WATER', networkId: 'NET-UTILITY-WATER', serviceClass: 'utility-water', fromNodeId: 'EXT-WATER', toNodeId: 'G-PLANT-01', role: 'entry', hostSpaceIds: ['G-SVC-02'], crossingIds: ['PEN-UE-01'], primaryInfrastructure: true, structuralInteraction: 'none', provisional: true },
    { id: 'R-UE-ELECTRIC', networkId: 'NET-UTILITY-ELECTRIC', serviceClass: 'utility-electricity', fromNodeId: 'EXT-ELECTRIC', toNodeId: 'G-PLANT-01', role: 'entry', hostSpaceIds: ['G-SVC-02'], crossingIds: ['PEN-UE-01'], primaryInfrastructure: true, structuralInteraction: 'none', provisional: true },
    { id: 'R-UE-COMMS', networkId: 'NET-UTILITY-COMMS', serviceClass: 'communications', fromNodeId: 'EXT-COMMS', toNodeId: 'G-PLANT-01', role: 'entry', hostSpaceIds: ['G-SVC-02'], crossingIds: ['PEN-UE-01'], primaryInfrastructure: true, structuralInteraction: 'none', provisional: true },

    { id: 'R-WATER-GROUND', networkId: 'NET-DOMESTIC-WATER', serviceClass: 'domestic-water', fromNodeId: 'G-PLANT-01', toNodeId: 'G-WET-TERMINALS', role: 'distribution', hostSpaceIds: ['G-SVC-02', 'G-KIT-02'], crossingIds: [], primaryInfrastructure: false, structuralInteraction: 'none', provisional: true },
    { id: 'R-WATER-RISER', networkId: 'NET-DOMESTIC-WATER', serviceClass: 'domestic-water', fromNodeId: 'G-PLANT-01', toNodeId: 'SV-01', role: 'vertical-trunk', hostSpaceIds: ['G-SVC-02', 'U-BATH-01'], crossingIds: ['PEN-SV-01'], primaryInfrastructure: true, structuralInteraction: 'declared-crossing', provisional: true },
    { id: 'R-WATER-BATH', networkId: 'NET-DOMESTIC-WATER', serviceClass: 'domestic-water', fromNodeId: 'SV-01', toNodeId: 'U-BATH-TERMINALS', role: 'local-branch', hostSpaceIds: ['U-BATH-01'], crossingIds: [], primaryInfrastructure: false, structuralInteraction: 'none', provisional: true },

    { id: 'R-FOUL-GROUND', networkId: 'NET-FOUL', serviceClass: 'foul', fromNodeId: 'G-WET-TERMINALS', toNodeId: 'FS-BASE-01', role: 'distribution', hostSpaceIds: ['G-SVC-02', 'G-KIT-02'], crossingIds: [], primaryInfrastructure: true, structuralInteraction: 'none', provisional: true },
    { id: 'R-FOUL-BATH', networkId: 'NET-FOUL', serviceClass: 'foul', fromNodeId: 'U-BATH-TERMINALS', toNodeId: 'SV-01', role: 'local-branch', hostSpaceIds: ['U-BATH-01'], crossingIds: [], primaryInfrastructure: false, structuralInteraction: 'none', provisional: true },
    { id: 'R-FOUL-STACK', networkId: 'NET-FOUL', serviceClass: 'foul', fromNodeId: 'SV-01', toNodeId: 'FS-BASE-01', role: 'vertical-trunk', hostSpaceIds: ['G-SVC-02', 'U-BATH-01'], crossingIds: ['PEN-SV-01'], primaryInfrastructure: true, structuralInteraction: 'declared-crossing', provisional: true },
    { id: 'R-FOUL-EXIT', networkId: 'NET-FOUL', serviceClass: 'foul', fromNodeId: 'FS-BASE-01', toNodeId: 'EXT-SEWER', role: 'boundary-link', hostSpaceIds: ['G-SVC-02'], crossingIds: ['PEN-FD-01'], primaryInfrastructure: true, structuralInteraction: 'none', provisional: true },
    { id: 'R-SOIL-VENT', networkId: 'NET-FOUL', serviceClass: 'foul', fromNodeId: 'SV-01', toNodeId: 'EXT-AIR', role: 'vent', hostSpaceIds: ['U-BATH-01'], crossingIds: ['PEN-SV-RF-01'], primaryInfrastructure: true, structuralInteraction: 'none', provisional: true },

    { id: 'R-DRY-G', networkId: 'NET-DRY', serviceClass: 'electrical-data', fromNodeId: 'G-PLANT-01', toNodeId: 'DRY-G-01', role: 'primary', hostSpaceIds: ['G-SVC-02', 'G-GAL-01', 'G-HALL-02'], crossingIds: [], primaryInfrastructure: true, structuralInteraction: 'none', provisional: true },
    { id: 'R-DRY-G-BRANCH', networkId: 'NET-DRY', serviceClass: 'electrical-data', fromNodeId: 'DRY-G-01', toNodeId: 'DRY-G-TERMINALS', role: 'local-branch', hostSpaceIds: ['G-DRAW-02', 'G-FAM-02', 'G-STUDY-02', 'G-KIT-02'], crossingIds: [], primaryInfrastructure: false, structuralInteraction: 'none', provisional: true },
    { id: 'R-DRY-RISER', networkId: 'NET-DRY', serviceClass: 'electrical-data', fromNodeId: 'G-PLANT-01', toNodeId: 'SV-01', role: 'vertical-trunk', hostSpaceIds: ['G-SVC-02', 'U-BATH-01'], crossingIds: ['PEN-SV-01'], primaryInfrastructure: true, structuralInteraction: 'declared-crossing', provisional: true },
    { id: 'R-DRY-U', networkId: 'NET-DRY', serviceClass: 'electrical-data', fromNodeId: 'SV-01', toNodeId: 'DRY-U-01', role: 'primary', hostSpaceIds: ['U-GAL-02', 'U-STAIR-01', 'U-LAND-N01'], crossingIds: [], primaryInfrastructure: true, structuralInteraction: 'none', provisional: true },
    { id: 'R-DRY-U-BRANCH', networkId: 'NET-DRY', serviceClass: 'electrical-data', fromNodeId: 'DRY-U-01', toNodeId: 'DRY-U-TERMINALS', role: 'local-branch', hostSpaceIds: ['U-BED-02', 'U-BED-P01', 'U-BED-03', 'U-BED-04'], crossingIds: [], primaryInfrastructure: false, structuralInteraction: 'none', provisional: true },

    { id: 'R-HYD-G', networkId: 'NET-HYDRONIC', serviceClass: 'hydronic', fromNodeId: 'G-PLANT-01', toNodeId: 'HYD-G-01', role: 'distribution', hostSpaceIds: ['G-SVC-02', 'G-GAL-01', 'G-HALL-02'], crossingIds: [], primaryInfrastructure: true, structuralInteraction: 'none', provisional: true },
    { id: 'R-HYD-G-BRANCH', networkId: 'NET-HYDRONIC', serviceClass: 'hydronic', fromNodeId: 'HYD-G-01', toNodeId: 'HYD-G-TERMINALS', role: 'local-branch', hostSpaceIds: ['G-DRAW-02', 'G-FAM-02', 'G-STUDY-02', 'G-GARDEN-02', 'G-KIT-02'], crossingIds: [], primaryInfrastructure: false, structuralInteraction: 'none', provisional: true },
    { id: 'R-HYD-RISER', networkId: 'NET-HYDRONIC', serviceClass: 'hydronic', fromNodeId: 'G-PLANT-01', toNodeId: 'SV-01', role: 'vertical-trunk', hostSpaceIds: ['G-SVC-02', 'U-BATH-01'], crossingIds: ['PEN-SV-01'], primaryInfrastructure: true, structuralInteraction: 'declared-crossing', provisional: true },
    { id: 'R-HYD-U', networkId: 'NET-HYDRONIC', serviceClass: 'hydronic', fromNodeId: 'SV-01', toNodeId: 'HYD-U-01', role: 'distribution', hostSpaceIds: ['U-GAL-02', 'U-STAIR-01', 'U-LAND-N01'], crossingIds: [], primaryInfrastructure: true, structuralInteraction: 'none', provisional: true },
    { id: 'R-HYD-U-BRANCH', networkId: 'NET-HYDRONIC', serviceClass: 'hydronic', fromNodeId: 'HYD-U-01', toNodeId: 'HYD-U-TERMINALS', role: 'local-branch', hostSpaceIds: ['U-BED-02', 'U-BED-P01', 'U-BED-03', 'U-BED-04'], crossingIds: [], primaryInfrastructure: false, structuralInteraction: 'none', provisional: true },

    { id: 'R-MV-SUP-G', networkId: 'NET-MVHR-SUPPLY', serviceClass: 'mvhr-supply', fromNodeId: 'MVHR-01', toNodeId: 'MV-G-SUPPLY', role: 'distribution', hostSpaceIds: ['G-SVC-02', 'G-GAL-01', 'G-HALL-02'], crossingIds: [], primaryInfrastructure: true, structuralInteraction: 'none', provisional: true },
    { id: 'R-MV-SUP-G-BRANCH', networkId: 'NET-MVHR-SUPPLY', serviceClass: 'mvhr-supply', fromNodeId: 'MV-G-SUPPLY', toNodeId: 'MV-G-SUPPLY-TERMINALS', role: 'local-branch', hostSpaceIds: ['G-DRAW-02', 'G-FAM-02', 'G-STUDY-02', 'G-GARDEN-02'], crossingIds: [], primaryInfrastructure: false, structuralInteraction: 'none', provisional: true },
    { id: 'R-MV-SUP-RISER', networkId: 'NET-MVHR-SUPPLY', serviceClass: 'mvhr-supply', fromNodeId: 'MVHR-01', toNodeId: 'SV-01', role: 'vertical-trunk', hostSpaceIds: ['G-SVC-02', 'U-BATH-01'], crossingIds: ['PEN-SV-01'], primaryInfrastructure: true, structuralInteraction: 'declared-crossing', provisional: true },
    { id: 'R-MV-SUP-U', networkId: 'NET-MVHR-SUPPLY', serviceClass: 'mvhr-supply', fromNodeId: 'SV-01', toNodeId: 'MV-U-SUPPLY', role: 'distribution', hostSpaceIds: ['U-GAL-02', 'U-STAIR-01', 'U-LAND-N01'], crossingIds: [], primaryInfrastructure: true, structuralInteraction: 'none', provisional: true },
    { id: 'R-MV-SUP-U-BRANCH', networkId: 'NET-MVHR-SUPPLY', serviceClass: 'mvhr-supply', fromNodeId: 'MV-U-SUPPLY', toNodeId: 'MV-U-SUPPLY-TERMINALS', role: 'local-branch', hostSpaceIds: ['U-BED-02', 'U-BED-P01', 'U-BED-03', 'U-BED-04'], crossingIds: [], primaryInfrastructure: false, structuralInteraction: 'none', provisional: true },

    { id: 'R-MV-EXT-G', networkId: 'NET-MVHR-EXTRACT', serviceClass: 'mvhr-extract', fromNodeId: 'MV-G-EXTRACT-TERMINALS', toNodeId: 'MVHR-01', role: 'distribution', hostSpaceIds: ['G-KIT-02', 'G-SVC-02'], crossingIds: [], primaryInfrastructure: false, structuralInteraction: 'none', provisional: true },
    { id: 'R-MV-EXT-BATH', networkId: 'NET-MVHR-EXTRACT', serviceClass: 'mvhr-extract', fromNodeId: 'MV-U-BATH-EXTRACT', toNodeId: 'SV-01', role: 'local-branch', hostSpaceIds: ['U-BATH-01'], crossingIds: [], primaryInfrastructure: false, structuralInteraction: 'none', provisional: true },
    { id: 'R-MV-EXT-RISER', networkId: 'NET-MVHR-EXTRACT', serviceClass: 'mvhr-extract', fromNodeId: 'SV-01', toNodeId: 'MVHR-01', role: 'vertical-trunk', hostSpaceIds: ['G-SVC-02', 'U-BATH-01'], crossingIds: ['PEN-SV-01'], primaryInfrastructure: true, structuralInteraction: 'declared-crossing', provisional: true },

    { id: 'R-MV-OA', networkId: 'NET-MVHR-OUTSIDE', serviceClass: 'mvhr-outdoor-air', fromNodeId: 'EXT-AIR', toNodeId: 'MVHR-01', role: 'boundary-link', hostSpaceIds: ['G-SVC-02'], crossingIds: ['PEN-MV-01'], primaryInfrastructure: true, structuralInteraction: 'none', provisional: true },
    { id: 'R-MV-EA', networkId: 'NET-MVHR-OUTSIDE', serviceClass: 'mvhr-exhaust-air', fromNodeId: 'MVHR-01', toNodeId: 'EXT-AIR', role: 'boundary-link', hostSpaceIds: ['G-SVC-02'], crossingIds: ['PEN-MV-01'], primaryInfrastructure: true, structuralInteraction: 'none', provisional: true },

    { id: 'R-KX-01', networkId: 'NET-COOKER-EXTRACT', serviceClass: 'cooker-extract', fromNodeId: 'KX-01', toNodeId: 'EXT-AIR', role: 'boundary-link', hostSpaceIds: ['G-KIT-02'], crossingIds: ['PEN-KX-01'], primaryInfrastructure: false, structuralInteraction: 'none', provisional: true },
    { id: 'R-ASHP-01', networkId: 'NET-HEAT-PUMP', serviceClass: 'heat-pump-link', fromNodeId: 'ASHP-01', toNodeId: 'G-PLANT-01', role: 'boundary-link', hostSpaceIds: ['G-SVC-02'], crossingIds: ['PEN-HS-01'], primaryInfrastructure: true, structuralInteraction: 'none', provisional: true },
    { id: 'R-PV-01', networkId: 'NET-PV', serviceClass: 'pv-electrical', fromNodeId: 'PV-01', toNodeId: 'G-PLANT-01', role: 'boundary-link', hostSpaceIds: ['G-SVC-02'], crossingIds: ['PEN-PV-01'], primaryInfrastructure: true, structuralInteraction: 'none', provisional: true }
  ],
  networks: [
    { id: 'NET-UTILITY-WATER', label: 'utility water entry', serviceClasses: ['utility-water'], requiredNodeIds: ['EXT-WATER', 'G-PLANT-01'], routeIds: ['R-UE-WATER'] },
    { id: 'NET-UTILITY-ELECTRIC', label: 'utility electricity entry', serviceClasses: ['utility-electricity'], requiredNodeIds: ['EXT-ELECTRIC', 'G-PLANT-01'], routeIds: ['R-UE-ELECTRIC'] },
    { id: 'NET-UTILITY-COMMS', label: 'communications entry', serviceClasses: ['communications'], requiredNodeIds: ['EXT-COMMS', 'G-PLANT-01'], routeIds: ['R-UE-COMMS'] },
    { id: 'NET-DOMESTIC-WATER', label: 'domestic water distribution', serviceClasses: ['domestic-water'], requiredNodeIds: ['G-PLANT-01', 'G-WET-TERMINALS', 'SV-01', 'U-BATH-TERMINALS'], routeIds: ['R-WATER-GROUND', 'R-WATER-RISER', 'R-WATER-BATH'] },
    { id: 'NET-FOUL', label: 'foul / soil / vent', serviceClasses: ['foul'], requiredNodeIds: ['G-WET-TERMINALS', 'U-BATH-TERMINALS', 'SV-01', 'FS-BASE-01', 'EXT-SEWER', 'EXT-AIR'], routeIds: ['R-FOUL-GROUND', 'R-FOUL-BATH', 'R-FOUL-STACK', 'R-FOUL-EXIT', 'R-SOIL-VENT'] },
    { id: 'NET-DRY', label: 'electrical / data distribution', serviceClasses: ['electrical-data'], requiredNodeIds: ['G-PLANT-01', 'DRY-G-01', 'DRY-G-TERMINALS', 'SV-01', 'DRY-U-01', 'DRY-U-TERMINALS'], routeIds: ['R-DRY-G', 'R-DRY-G-BRANCH', 'R-DRY-RISER', 'R-DRY-U', 'R-DRY-U-BRANCH'] },
    { id: 'NET-HYDRONIC', label: 'low-temperature hydronic distribution', serviceClasses: ['hydronic'], requiredNodeIds: ['G-PLANT-01', 'HYD-G-01', 'HYD-G-TERMINALS', 'SV-01', 'HYD-U-01', 'HYD-U-TERMINALS'], routeIds: ['R-HYD-G', 'R-HYD-G-BRANCH', 'R-HYD-RISER', 'R-HYD-U', 'R-HYD-U-BRANCH'] },
    { id: 'NET-MVHR-SUPPLY', label: 'MVHR supply', serviceClasses: ['mvhr-supply'], requiredNodeIds: ['MVHR-01', 'MV-G-SUPPLY', 'MV-G-SUPPLY-TERMINALS', 'SV-01', 'MV-U-SUPPLY', 'MV-U-SUPPLY-TERMINALS'], routeIds: ['R-MV-SUP-G', 'R-MV-SUP-G-BRANCH', 'R-MV-SUP-RISER', 'R-MV-SUP-U', 'R-MV-SUP-U-BRANCH'] },
    { id: 'NET-MVHR-EXTRACT', label: 'MVHR extract', serviceClasses: ['mvhr-extract'], requiredNodeIds: ['MV-G-EXTRACT-TERMINALS', 'MV-U-BATH-EXTRACT', 'SV-01', 'MVHR-01'], routeIds: ['R-MV-EXT-G', 'R-MV-EXT-BATH', 'R-MV-EXT-RISER'] },
    { id: 'NET-MVHR-OUTSIDE', label: 'MVHR outdoor air / exhaust', serviceClasses: ['mvhr-outdoor-air', 'mvhr-exhaust-air'], requiredNodeIds: ['EXT-AIR', 'MVHR-01'], routeIds: ['R-MV-OA', 'R-MV-EA'] },
    { id: 'NET-COOKER-EXTRACT', label: 'cooker source capture', serviceClasses: ['cooker-extract'], requiredNodeIds: ['KX-01', 'EXT-AIR'], routeIds: ['R-KX-01'] },
    { id: 'NET-HEAT-PUMP', label: 'external heat-pump connection', serviceClasses: ['heat-pump-link'], requiredNodeIds: ['ASHP-01', 'G-PLANT-01'], routeIds: ['R-ASHP-01'] },
    { id: 'NET-PV', label: 'PV electrical route', serviceClasses: ['pv-electrical'], requiredNodeIds: ['PV-01', 'G-PLANT-01'], routeIds: ['R-PV-01'] }
  ],
  crossings: [
    { id: 'PEN-UE-01', occurrenceId: 'RH-P005-07', selected: true, routeIds: ['R-UE-WATER', 'R-UE-ELECTRIC', 'R-UE-COMMS'], host: { kind: 'plan-boundary', boundaryId: 'G-OUTER-EAST' }, obligations: ['supplier-separation', 'bearing', 'weather', 'airtightness', 'thermal', 'damp-pest-security', 'replacement'], provisional: true },
    { id: 'PEN-SV-01', occurrenceId: 'RH-P005-08', selected: true, routeIds: ['R-WATER-RISER', 'R-FOUL-STACK', 'R-DRY-RISER', 'R-HYD-RISER', 'R-MV-SUP-RISER', 'R-MV-EXT-RISER'], host: { kind: 'structural-interruption', interruptionId: 'PEN-SV-01' }, obligations: ['engineered-trimming', 'diaphragm-continuity', 'fire-acoustic-closure', 'service-supports', 'inspection'], provisional: true },
    { id: 'PEN-FD-01', occurrenceId: 'RH-P005-09', selected: true, routeIds: ['R-FOUL-EXIT'], host: { kind: 'external-handoff', description: 'east foundation / external-wall zone below plant' }, obligations: ['foundation-load-path', 'settlement', 'gas-moisture-seal', 'rodent-control', 'rodding-access'], provisional: true },
    { id: 'PEN-KX-01', occurrenceId: 'RH-P005-10', selected: true, routeIds: ['R-KX-01'], host: { kind: 'plan-boundary', boundaryId: 'G-OUTER-EAST' }, obligations: ['bearing-if-required', 'weather', 'airtightness', 'thermal', 'grease-cleaning', 'condensate', 'terminal-clearance'], provisional: true },
    { id: 'PEN-BX-01', occurrenceId: 'RH-P005-11', selected: false, routeIds: [], host: { kind: 'plan-boundary', boundaryId: 'U-OUTER-EAST' }, obligations: ['fallback-only', 'weather', 'airtightness', 'thermal-condensate', 'acoustics'], provisional: true },
    { id: 'PEN-HS-01', occurrenceId: 'RH-P005-12', selected: true, routeIds: ['R-ASHP-01'], host: { kind: 'plan-boundary', boundaryId: 'G-OUTER-EAST' }, obligations: ['weather', 'airtightness', 'thermal', 'vibration', 'condensate-frost', 'maintenance', 'isolation'], provisional: true },
    { id: 'PEN-MV-01', occurrenceId: 'RH-P005-13', selected: true, routeIds: ['R-MV-OA', 'R-MV-EA'], host: { kind: 'plan-boundary', boundaryId: 'G-OUTER-EAST' }, obligations: ['weather', 'airtightness', 'thermal-condensation', 'acoustic-breakout', 'air-separation', 'inspection-cleaning'], provisional: true },
    { id: 'PEN-SV-RF-01', occurrenceId: 'RH-P005-15', selected: true, routeIds: ['R-SOIL-VENT'], host: { kind: 'external-handoff', description: 'service-side roof boundary' }, obligations: ['waterproofing', 'structure', 'airtight-thermal-continuity', 'terminal-clearance', 'inspection'], provisional: true },
    { id: 'PEN-PV-01', occurrenceId: 'RH-P005-16', selected: true, routeIds: ['R-PV-01'], host: { kind: 'external-handoff', description: 'east/service roof boundary to service geography' }, obligations: ['roof-weathering', 'fire', 'airtight-thermal-continuity', 'electrical-segregation', 'safe-isolation', 'documented-route'], provisional: true }
  ],
  access: [
    { id: 'ACC-PLANT-WORK', targetNodeId: 'G-PLANT-01', kind: 'working', viaSpaceIds: ['G-GAL-01', 'G-SVC-02'], external: false },
    { id: 'ACC-PLANT-REPLACE', targetNodeId: 'G-PLANT-01', kind: 'replacement', viaSpaceIds: ['G-SVC-02'], external: true },
    { id: 'ACC-PLANT-ISOLATE', targetNodeId: 'G-PLANT-01', kind: 'isolation', viaSpaceIds: ['G-GAL-01', 'G-SVC-02'], external: false },
    { id: 'ACC-MVHR-WORK', targetNodeId: 'MVHR-01', kind: 'working', viaSpaceIds: ['G-SVC-02'], external: false },
    { id: 'ACC-MVHR-REPLACE', targetNodeId: 'MVHR-01', kind: 'replacement', viaSpaceIds: ['G-SVC-02'], external: true },
    { id: 'ACC-MVHR-FILTER', targetNodeId: 'MVHR-01', kind: 'filter-service', viaSpaceIds: ['G-SVC-02'], external: false },
    { id: 'ACC-SV-INSPECT', targetNodeId: 'SV-01', kind: 'inspection', viaSpaceIds: ['G-GAL-01', 'G-SVC-02', 'U-GAL-02', 'U-BATH-01'], external: false },
    { id: 'ACC-FS-BASE', targetNodeId: 'FS-BASE-01', kind: 'inspection', viaSpaceIds: ['G-SVC-02'], external: false },
    { id: 'ACC-ASHP-REPLACE', targetNodeId: 'ASHP-01', kind: 'replacement', viaSpaceIds: [], external: true },
    { id: 'ACC-KX-INSPECT', targetNodeId: 'KX-01', kind: 'inspection', viaSpaceIds: ['G-KIT-02'], external: false }
  ]
 })
 if(house.spaces.some(s=>s.id==='G-WC-01')){
  const remap=(id:string)=>id==='G-DRAW-02'?'G-STUDY-02':id==='G-STUDY-02'?'G-CLOAK-01':id
  source.protectedPrimaryFreeSpaceIds=source.protectedPrimaryFreeSpaceIds.map(remap)
  for(const node of source.nodes)node.hostSpaceIds=node.hostSpaceIds.map(remap)
  for(const route of source.routes)route.hostSpaceIds=route.hostSpaceIds.map(remap)
  for(const id of ['G-WET-TERMINALS','MV-G-EXTRACT-TERMINALS','DRY-G-TERMINALS','HYD-G-TERMINALS'])source.nodes.find(n=>n.id===id)!.hostSpaceIds.push('G-WC-01')
  for(const id of ['R-WATER-GROUND','R-FOUL-GROUND','R-MV-EXT-G','R-DRY-G-BRANCH','R-HYD-G-BRANCH'])source.routes.find(r=>r.id===id)!.hostSpaceIds.push('G-WC-01')
  // Closable private study retains the primary-infrastructure-free protection.
  // WC service lining adjoins the suite; no route crosses the cloakroom/study.
 }
 return source
}

export const cloneReferenceHouseServiceSource = (
  source: ServiceTopologySource
): ServiceTopologySource => structuredClone(source)
