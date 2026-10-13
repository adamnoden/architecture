import type { CalculationCheckInput, CalculationMethod } from '../calculation-slice/model.js'
import type { ReferenceHouseCompileResult } from '../reference-house/model.js'
import type { RhC4CompileResult } from '../rhc4/compile.js'

export const privateStairGeometryMethod = {
  id: 'ADK-2013-PRIVATE-STAIR-GEOMETRY',
  version: '1.0.0',
  title: 'Approved Document K private-stair geometry calculation method',
  authority: {
    kind: 'statutory-guidance',
    jurisdiction: 'England',
    documentTitle: 'Approved Document K: protection from falling, collision and impact',
    edition: '2013 edition',
    paragraph: '1.3',
    table: 'Table 1.1',
    sourceUrl: 'https://www.gov.uk/government/publications/protection-from-falling-collision-and-impact-approved-document-k',
    sourceCheckedOn: '2026-10-13'
  },
  applicability: {
    jurisdiction: 'England',
    buildingType: 'dwelling',
    stairCategory: 'private'
  },
  criteria: [
    {
      id: 'ADK-K1-PRIVATE-RISE',
      inputKey: 'rise',
      label: 'Private-stair rise',
      unit: 'mm',
      kind: 'inclusive-range',
      min: 150,
      max: 220,
      authorityRef: 'Approved Document K 2013, para 1.3, Table 1.1'
    },
    {
      id: 'ADK-K1-PRIVATE-GOING',
      inputKey: 'going',
      label: 'Private-stair going',
      unit: 'mm',
      kind: 'inclusive-range',
      min: 220,
      max: 300,
      authorityRef: 'Approved Document K 2013, para 1.3, Table 1.1'
    },
    {
      id: 'ADK-K1-PRIVATE-PITCH',
      inputKey: 'pitch',
      label: 'Private-stair pitch',
      unit: 'deg',
      kind: 'maximum',
      max: 42,
      authorityRef: 'Approved Document K 2013, Table 1.1 note 1'
    },
    {
      id: 'ADK-K1-PRIVATE-2R+G',
      inputKey: 'twoRPlusG',
      label: 'Private-stair 2R+G relationship',
      unit: 'mm',
      kind: 'inclusive-range',
      min: 550,
      max: 700,
      authorityRef: 'Approved Document K 2013, Table 1.1 general note'
    }
  ],
  claim:
    'The represented private-stair rise, going, pitch and 2R+G values correspond to the selected Approved Document K numeric guidance values for this research fixture.',
  nonClaims: [
    'Building Regulations compliance',
    'Requirement K1 compliance as a whole',
    'release-grade compiler-target applicability or transitional basis',
    'headroom adequacy',
    'landing geometry adequacy',
    'handrail or guarding adequacy',
    'construction tolerance or workmanship compliance',
    'accessibility compliance',
    'fire or means-of-escape compliance'
  ]
} as const satisfies CalculationMethod

export const createReferenceHousePrivateStairInputFromHouse = (
  house: ReferenceHouseCompileResult
): CalculationCheckInput => {
  const stair = house.derived.stair
  return {
    id: 'RH-C5-REFERENCE-HOUSE-PRIVATE-STAIR',
    context: {
      jurisdiction: 'England',
      buildingType: 'dwelling',
      stairCategory: 'private'
    },
    values: {
      rise: {
        value: stair.rise,
        unit: 'mm',
        sourceIds: ['RHCF-FFL-1', 'RHCF-STAIR-N']
      },
      going: {
        value: stair.going,
        unit: 'mm',
        sourceIds: ['RHCF-STAIR-G']
      },
      pitch: {
        value: stair.pitch,
        unit: 'deg',
        sourceIds: ['RHCF-FFL-1', 'RHCF-STAIR-N', 'RHCF-STAIR-G']
      },
      twoRPlusG: {
        value: stair.twoRPlusG,
        unit: 'mm',
        sourceIds: ['RHCF-FFL-1', 'RHCF-STAIR-N', 'RHCF-STAIR-G']
      }
    }
  }
}

export const createReferenceHousePrivateStairInput = (
  c4: RhC4CompileResult
): CalculationCheckInput => createReferenceHousePrivateStairInputFromHouse(c4.c3.c2.house)
