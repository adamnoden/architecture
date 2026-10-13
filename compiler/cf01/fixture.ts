import type { PlanSliceSource } from '../plan-slice/model.js'
import { mm } from '../units.js'

export const createCf01ContrastSource = (): PlanSliceSource => ({
  fixtureId: 'CF-01-CONTRAST-HOUSE',
  shell: {
    id: 'CF-SHELL',
    width: mm(9600),
    depth: mm(7200)
  },
  levels: [{ id: 'GROUND', datum: mm(0) }],
  planLines: [
    { id: 'X0', coordinate: mm(0), provisional: false },
    { id: 'X-LIVING', coordinate: mm(3100), provisional: false },
    { id: 'X-HALL', coordinate: mm(5850), provisional: false },
    { id: 'X9', coordinate: mm(9600), provisional: false },
    { id: 'Y0', coordinate: mm(0), provisional: false },
    { id: 'Y-FRONT', coordinate: mm(2750), provisional: false },
    { id: 'Y7', coordinate: mm(7200), provisional: false }
  ],
  voids: [],
  spaces: [
    {
      id: 'CF-LIVING',
      levelId: 'GROUND',
      kind: 'room',
      label: 'living',
      rectangles: [{ x0: 'X0', x1: 'X-LIVING', y0: 'Y0', y1: 'Y-FRONT' }],
      provisional: false
    },
    {
      id: 'CF-HALL',
      levelId: 'GROUND',
      kind: 'circulation',
      label: 'hall',
      rectangles: [{ x0: 'X-LIVING', x1: 'X-HALL', y0: 'Y0', y1: 'Y-FRONT' }],
      provisional: false
    },
    {
      id: 'CF-STUDY',
      levelId: 'GROUND',
      kind: 'room',
      label: 'study',
      rectangles: [{ x0: 'X-HALL', x1: 'X9', y0: 'Y0', y1: 'Y-FRONT' }],
      provisional: false
    },
    {
      id: 'CF-KITCHEN-DINING',
      levelId: 'GROUND',
      kind: 'room',
      label: 'kitchen / dining',
      rectangles: [{ x0: 'X0', x1: 'X-HALL', y0: 'Y-FRONT', y1: 'Y7' }],
      provisional: false
    },
    {
      id: 'CF-BEDROOM',
      levelId: 'GROUND',
      kind: 'room',
      label: 'bedroom',
      rectangles: [{ x0: 'X-HALL', x1: 'X9', y0: 'Y-FRONT', y1: 'Y7' }],
      provisional: false
    }
  ],
  boundaries: [
    {
      id: 'CF-SOUTH',
      levelId: 'GROUND',
      kind: 'outer',
      orientation: 'horizontal',
      at: 'Y0',
      from: 'X0',
      to: 'X9',
      provisional: false
    },
    {
      id: 'CF-NORTH',
      levelId: 'GROUND',
      kind: 'outer',
      orientation: 'horizontal',
      at: 'Y7',
      from: 'X0',
      to: 'X9',
      provisional: false
    },
    {
      id: 'CF-WEST',
      levelId: 'GROUND',
      kind: 'outer',
      orientation: 'vertical',
      at: 'X0',
      from: 'Y0',
      to: 'Y7',
      provisional: false
    },
    {
      id: 'CF-EAST',
      levelId: 'GROUND',
      kind: 'outer',
      orientation: 'vertical',
      at: 'X9',
      from: 'Y0',
      to: 'Y7',
      provisional: false
    },
    {
      id: 'CF-FRONT-SPLIT',
      levelId: 'GROUND',
      kind: 'internal-planning',
      orientation: 'horizontal',
      at: 'Y-FRONT',
      from: 'X0',
      to: 'X9',
      provisional: false
    },
    {
      id: 'CF-LIVING-HALL',
      levelId: 'GROUND',
      kind: 'internal-planning',
      orientation: 'vertical',
      at: 'X-LIVING',
      from: 'Y0',
      to: 'Y-FRONT',
      provisional: false
    },
    {
      id: 'CF-HALL-STUDY',
      levelId: 'GROUND',
      kind: 'internal-planning',
      orientation: 'vertical',
      at: 'X-HALL',
      from: 'Y0',
      to: 'Y7',
      provisional: false
    }
  ],
  requiredAdjacencies: [
    { id: 'CF-ADJ-01', levelId: 'GROUND', a: 'CF-LIVING', b: 'CF-HALL' },
    { id: 'CF-ADJ-02', levelId: 'GROUND', a: 'CF-HALL', b: 'CF-KITCHEN-DINING' },
    { id: 'CF-ADJ-03', levelId: 'GROUND', a: 'CF-STUDY', b: 'CF-BEDROOM' }
  ],
  openingFamilies: [
    {
      id: 'CF-WINDOW',
      width: { kind: 'approximate', value: mm(1100) },
      vertical: {
        sill: { kind: 'approximate', value: mm(800) },
        head: { kind: 'approximate', value: mm(2300) }
      },
      provisional: false
    },
    {
      id: 'CF-DOOR',
      width: { kind: 'approximate', value: mm(1000) },
      vertical: { head: { kind: 'approximate', value: mm(2200) } },
      provisional: false
    }
  ],
  openings: [
    {
      id: 'CF-W01',
      levelId: 'GROUND',
      hostBoundaryId: 'CF-SOUTH',
      role: 'window',
      familyId: 'CF-WINDOW',
      spaceIds: ['CF-LIVING'],
      placement: { kind: 'at-coordinate', coordinate: mm(1350) },
      provisional: false
    },
    {
      id: 'CF-D01',
      levelId: 'GROUND',
      hostBoundaryId: 'CF-SOUTH',
      role: 'entrance',
      familyId: 'CF-DOOR',
      spaceIds: ['CF-HALL'],
      placement: { kind: 'at-coordinate', coordinate: mm(4275) },
      provisional: false
    },
    {
      id: 'CF-W02',
      levelId: 'GROUND',
      hostBoundaryId: 'CF-SOUTH',
      role: 'window',
      familyId: 'CF-WINDOW',
      spaceIds: ['CF-STUDY'],
      placement: { kind: 'at-coordinate', coordinate: mm(7825) },
      provisional: false
    },
    {
      id: 'CF-W03',
      levelId: 'GROUND',
      hostBoundaryId: 'CF-NORTH',
      role: 'window',
      familyId: 'CF-WINDOW',
      spaceIds: ['CF-KITCHEN-DINING'],
      placement: { kind: 'at-coordinate', coordinate: mm(2400) },
      provisional: false
    },
    {
      id: 'CF-W04',
      levelId: 'GROUND',
      hostBoundaryId: 'CF-NORTH',
      role: 'window',
      familyId: 'CF-WINDOW',
      spaceIds: ['CF-BEDROOM'],
      placement: { kind: 'at-coordinate', coordinate: mm(7700) },
      provisional: false
    }
  ],
  qualitativeOpeningRelationships: []
})
