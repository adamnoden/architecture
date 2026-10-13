import type { ReferenceHouseSource } from '../reference-house/model.js'
import type { StructuralTopologySource } from '../structure-slice/model.js'
import { mm } from '../units.js'

export const createReferenceHouseStructuralSource = (
  house: ReferenceHouseSource
): StructuralTopologySource => ({
  fixtureId: 'RH-C2-REFERENCE-HOUSE-STRUCTURE',
  planFixtureId: house.fixtureId,
  planeLevelId: 'FIRST',
  foundationDestinations: [
    {
      id: 'FDN-SITE-DESIGNED',
      kind: 'site-designed-foundations',
      provisional: true
    }
  ],
  lineElements: [
    {
      id: 'LB-OUTER-W',
      kind: 'bearing-wall',
      orientation: 'vertical',
      at: 'SHELL_WEST',
      from: 'SHELL_SOUTH',
      to: 'SHELL_NORTH',
      protected: true,
      provisional: true,
      foundationDestinationId: 'FDN-SITE-DESIGNED'
    },
    {
      id: 'LB-OUTER-E',
      kind: 'bearing-wall',
      orientation: 'vertical',
      at: 'SHELL_EAST',
      from: 'SHELL_SOUTH',
      to: 'SHELL_NORTH',
      protected: true,
      provisional: true,
      foundationDestinationId: 'FDN-SITE-DESIGNED'
    },
    {
      id: 'LB-OUTER-S',
      kind: 'bearing-wall',
      orientation: 'horizontal',
      at: 'SHELL_SOUTH',
      from: 'SHELL_WEST',
      to: 'SHELL_EAST',
      protected: true,
      provisional: true,
      foundationDestinationId: 'FDN-SITE-DESIGNED'
    },
    {
      id: 'LB-OUTER-N',
      kind: 'bearing-wall',
      orientation: 'horizontal',
      at: 'SHELL_NORTH',
      from: 'SHELL_WEST',
      to: 'SHELL_EAST',
      protected: true,
      provisional: true,
      foundationDestinationId: 'FDN-SITE-DESIGNED'
    },
    {
      id: 'LB-COURT-W',
      kind: 'bearing-wall',
      orientation: 'vertical',
      at: 'COURT_WEST',
      from: 'COURT_SOUTH',
      to: 'COURT_NORTH',
      protected: true,
      provisional: true,
      foundationDestinationId: 'FDN-SITE-DESIGNED'
    },
    {
      id: 'LB-COURT-E',
      kind: 'bearing-wall',
      orientation: 'vertical',
      at: 'COURT_EAST',
      from: 'COURT_SOUTH',
      to: 'COURT_NORTH',
      protected: true,
      provisional: true,
      foundationDestinationId: 'FDN-SITE-DESIGNED'
    },
    {
      id: 'LB-COURT-S',
      kind: 'bearing-wall',
      orientation: 'horizontal',
      at: 'COURT_SOUTH',
      from: 'COURT_WEST',
      to: 'COURT_EAST',
      protected: true,
      provisional: true,
      foundationDestinationId: 'FDN-SITE-DESIGNED'
    },
    {
      id: 'LB-COURT-N',
      kind: 'bearing-wall',
      orientation: 'horizontal',
      at: 'COURT_NORTH',
      from: 'COURT_WEST',
      to: 'COURT_EAST',
      protected: true,
      provisional: true,
      foundationDestinationId: 'FDN-SITE-DESIGNED'
    },
    {
      id: 'EB-W-S',
      kind: 'edge-beam',
      orientation: 'vertical',
      at: 'COURT_WEST',
      from: 'SHELL_SOUTH',
      to: 'COURT_SOUTH',
      protected: true,
      provisional: true,
      supportedByPathIds: ['SP-S-OUTER', 'SP-S-COURT']
    },
    {
      id: 'EB-E-S',
      kind: 'edge-beam',
      orientation: 'vertical',
      at: 'COURT_EAST',
      from: 'SHELL_SOUTH',
      to: 'COURT_SOUTH',
      protected: true,
      provisional: true,
      supportedByPathIds: ['SP-S-OUTER', 'SP-S-COURT']
    },
    {
      id: 'EB-W-N',
      kind: 'edge-beam',
      orientation: 'vertical',
      at: 'COURT_WEST',
      from: 'COURT_NORTH',
      to: 'SHELL_NORTH',
      protected: true,
      provisional: true,
      supportedByPathIds: ['SP-N-COURT', 'SP-N-OUTER']
    },
    {
      id: 'EB-E-N',
      kind: 'edge-beam',
      orientation: 'vertical',
      at: 'COURT_EAST',
      from: 'COURT_NORTH',
      to: 'SHELL_NORTH',
      protected: true,
      provisional: true,
      supportedByPathIds: ['SP-N-COURT', 'SP-N-OUTER']
    }
  ],
  supportPaths: [
    {
      id: 'SP-W-OUTER',
      orientation: 'vertical',
      at: 'SHELL_WEST',
      from: 'SHELL_SOUTH',
      to: 'SHELL_NORTH',
      segmentIds: ['LB-OUTER-W'],
      provisional: true
    },
    {
      id: 'SP-W-COURT',
      orientation: 'vertical',
      at: 'COURT_WEST',
      from: 'SHELL_SOUTH',
      to: 'SHELL_NORTH',
      segmentIds: ['EB-W-S', 'LB-COURT-W', 'EB-W-N'],
      provisional: true
    },
    {
      id: 'SP-E-COURT',
      orientation: 'vertical',
      at: 'COURT_EAST',
      from: 'SHELL_SOUTH',
      to: 'SHELL_NORTH',
      segmentIds: ['EB-E-S', 'LB-COURT-E', 'EB-E-N'],
      provisional: true
    },
    {
      id: 'SP-E-OUTER',
      orientation: 'vertical',
      at: 'SHELL_EAST',
      from: 'SHELL_SOUTH',
      to: 'SHELL_NORTH',
      segmentIds: ['LB-OUTER-E'],
      provisional: true
    },
    {
      id: 'SP-S-OUTER',
      orientation: 'horizontal',
      at: 'SHELL_SOUTH',
      from: 'SHELL_WEST',
      to: 'SHELL_EAST',
      segmentIds: ['LB-OUTER-S'],
      provisional: true
    },
    {
      id: 'SP-S-COURT',
      orientation: 'horizontal',
      at: 'COURT_SOUTH',
      from: 'COURT_WEST',
      to: 'COURT_EAST',
      segmentIds: ['LB-COURT-S'],
      provisional: true
    },
    {
      id: 'SP-N-COURT',
      orientation: 'horizontal',
      at: 'COURT_NORTH',
      from: 'COURT_WEST',
      to: 'COURT_EAST',
      segmentIds: ['LB-COURT-N'],
      provisional: true
    },
    {
      id: 'SP-N-OUTER',
      orientation: 'horizontal',
      at: 'SHELL_NORTH',
      from: 'SHELL_WEST',
      to: 'SHELL_EAST',
      segmentIds: ['LB-OUTER-N'],
      provisional: true
    }
  ],
  spanFields: [
    {
      id: 'F-W',
      levelId: 'FIRST',
      label: 'west floor strip',
      rectangles: [
        { x0: 'SHELL_WEST', x1: 'COURT_WEST', y0: 'SHELL_SOUTH', y1: 'SHELL_NORTH' }
      ],
      spanAxis: 'x',
      supportPathIds: ['SP-W-OUTER', 'SP-W-COURT'],
      provisional: true
    },
    {
      id: 'F-E',
      levelId: 'FIRST',
      label: 'east floor strip',
      rectangles: [
        { x0: 'COURT_EAST', x1: 'SHELL_EAST', y0: 'SHELL_SOUTH', y1: 'SHELL_NORTH' }
      ],
      spanAxis: 'x',
      supportPathIds: ['SP-E-COURT', 'SP-E-OUTER'],
      provisional: true
    },
    {
      id: 'F-S',
      levelId: 'FIRST',
      label: 'south centre floor strip',
      rectangles: [
        { x0: 'COURT_WEST', x1: 'COURT_EAST', y0: 'SHELL_SOUTH', y1: 'COURT_SOUTH' }
      ],
      spanAxis: 'y',
      supportPathIds: ['SP-S-OUTER', 'SP-S-COURT'],
      provisional: true
    },
    {
      id: 'F-N',
      levelId: 'FIRST',
      label: 'north centre floor strip',
      rectangles: [
        { x0: 'COURT_WEST', x1: 'COURT_EAST', y0: 'COURT_NORTH', y1: 'SHELL_NORTH' }
      ],
      spanAxis: 'y',
      supportPathIds: ['SP-N-COURT', 'SP-N-OUTER'],
      provisional: true
    }
  ],
  reactionNodes: [
    {
      id: 'RN-CW-S',
      x: 'COURT_WEST',
      y: 'COURT_SOUTH',
      elementIds: ['EB-W-S', 'LB-COURT-S', 'LB-COURT-W'],
      protected: true,
      provisional: true
    },
    {
      id: 'RN-CE-S',
      x: 'COURT_EAST',
      y: 'COURT_SOUTH',
      elementIds: ['EB-E-S', 'LB-COURT-E', 'LB-COURT-S'],
      protected: true,
      provisional: true
    },
    {
      id: 'RN-CW-N',
      x: 'COURT_WEST',
      y: 'COURT_NORTH',
      elementIds: ['EB-W-N', 'LB-COURT-N', 'LB-COURT-W'],
      protected: true,
      provisional: true
    },
    {
      id: 'RN-CE-N',
      x: 'COURT_EAST',
      y: 'COURT_NORTH',
      elementIds: ['EB-E-N', 'LB-COURT-E', 'LB-COURT-N'],
      protected: true,
      provisional: true
    }
  ],
  interruptions: [
    {
      id: 'ST-01',
      kind: 'stair-opening',
      hostFieldId: 'F-S',
      geometry: { kind: 'qualitative' },
      framingSystemId: 'TR-ST-01',
      protected: true,
      provisional: true
    },
    {
      id: 'PEN-SV-01',
      kind: 'service-opening',
      hostFieldId: 'F-E',
      geometry: {
        kind: 'approximate-envelope',
        width: mm(1050),
        depth: mm(850)
      },
      framingSystemId: 'TR-PEN-SV-01',
      protected: true,
      provisional: true
    }
  ],
  localFramingSystems: [
    {
      id: 'TR-ST-01',
      kind: 'local-trimmer-system',
      interruptionId: 'ST-01',
      hostFieldId: 'F-S',
      provisional: true
    },
    {
      id: 'TR-PEN-SV-01',
      kind: 'engineered-opening-trimmer',
      interruptionId: 'PEN-SV-01',
      hostFieldId: 'F-E',
      provisional: true
    }
  ],
  diaphragm: {
    id: 'DIA-FIRST-01',
    levelId: 'FIRST',
    fieldIds: ['F-W', 'F-E', 'F-S', 'F-N'],
    interruptionIds: ['ST-01', 'PEN-SV-01'],
    primaryLayer: 'structural-deck',
    changeableFinishStructural: false,
    provisional: true
  }
})

export const cloneReferenceHouseStructuralSource = (
  source: StructuralTopologySource
): StructuralTopologySource => structuredClone(source)
