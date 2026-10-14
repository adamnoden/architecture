import { createHash } from 'node:crypto'

import type { GeneratedOutputIdentity, OutputManifest } from '../../output/model.js'
import { REFERENCE_HOUSE_OUTPUT_SCHEMA_VERSION, REFERENCE_HOUSE_OUTPUTS } from './contract.js'
import { createReferenceHouseOutputContext } from './context.js'
import { renderBoundaryRegisterMarkdown, renderServiceRegisterMarkdown } from './reports.js'
import { renderReferenceHouseSpatialInspectionSet } from './spatial.js'
import { renderReferenceHouseStructuralInspection } from './structure.js'

export interface BuiltReferenceHouseOutput {
  readonly descriptor: (typeof REFERENCE_HOUSE_OUTPUTS)[keyof typeof REFERENCE_HOUSE_OUTPUTS]
  readonly content: string
}

const sha256 = (content: string): string =>
  createHash('sha256').update(content, 'utf8').digest('hex')

export const buildReferenceHouseSuccessorOutputs = (): readonly BuiltReferenceHouseOutput[] => {
  const context = createReferenceHouseOutputContext()
  const spatial = renderReferenceHouseSpatialInspectionSet(context)
  const outputs: BuiltReferenceHouseOutput[] = [
    { descriptor: REFERENCE_HOUSE_OUTPUTS.groundFloorPlan, content: spatial.groundFloor },
    { descriptor: REFERENCE_HOUSE_OUTPUTS.firstFloorPlan, content: spatial.firstFloor },
    { descriptor: REFERENCE_HOUSE_OUTPUTS.principalSection, content: spatial.principalSection },
    { descriptor: REFERENCE_HOUSE_OUTPUTS.firstFloorStructure, content: renderReferenceHouseStructuralInspection(context) },
    { descriptor: REFERENCE_HOUSE_OUTPUTS.serviceRegister, content: renderServiceRegisterMarkdown(context) },
    { descriptor: REFERENCE_HOUSE_OUTPUTS.boundaryRegister, content: renderBoundaryRegisterMarkdown(context) }
  ]
  return outputs
}

export const buildReferenceHouseOutputManifest = (
  outputs: readonly BuiltReferenceHouseOutput[] = buildReferenceHouseSuccessorOutputs()
): OutputManifest => {
  const context = createReferenceHouseOutputContext()
  if (context.result.status === 'FAIL') {
    throw new Error('Cannot build canonical successor output manifest from a failed Reference House compile.')
  }
  const artefacts: GeneratedOutputIdentity[] = outputs.map(({ descriptor, content }) => ({
    artefactId: descriptor.id,
    path: descriptor.path,
    format: descriptor.format,
    rendererVersion: descriptor.rendererVersion,
    sourceCompileFingerprint: context.result.identity.compile.fingerprint,
    content: {
      algorithm: 'sha256',
      fingerprint: sha256(content)
    }
  }))
  return {
    schemaVersion: REFERENCE_HOUSE_OUTPUT_SCHEMA_VERSION,
    sourceCompile: {
      schemaVersion: context.result.identity.schemaVersion,
      fingerprint: context.result.identity.compile.fingerprint
    },
    status: context.result.status,
    artefacts
  }
}

export const renderReferenceHouseOutputManifest = (
  outputs: readonly BuiltReferenceHouseOutput[] = buildReferenceHouseSuccessorOutputs()
): string => `${JSON.stringify(buildReferenceHouseOutputManifest(outputs), null, 2)}\n`
