import { readFileSync, writeFileSync } from 'node:fs'
import { readCurrentDesignResolution } from '../../../compiler/reference-house/current-design/resolve.js'
import { readInletSourceEnvelopeCase, runInletSourceEnvelopeCase, readLocalUtilityPocketSettings } from '../../../compiler/reference-house/current-design/inlet-source-envelope.js'
import { readGroundSectionCase, runGroundSectionCase } from '../../../compiler/reference-house/current-design/structural-ground.js'
const resolved = readCurrentDesignResolution(), request = readInletSourceEnvelopeCase(resolved)
const { reviewSvg, ...result } = runInletSourceEnvelopeCase(resolved, request.sourceEnvelope)
const { ground: groundCase } = readGroundSectionCase(resolved), ground = runGroundSectionCase(resolved, groundCase)
if (ground.native.levelsMm.ffl !== 530 || JSON.stringify((ground.native.levelsMm as unknown as Record<string, unknown>).accessibleDistribution) !== '[450,515]') throw new Error('The local530 Utility pocket requires its unchanged global ground530/65 reference')
const localResult = runInletSourceEnvelopeCase(resolved, { ...request.sourceEnvelope, settings: readLocalUtilityPocketSettings() }, ground)
const local = { schema: 'had-local-room-pocket-receipt/1', source: localResult.source, authoredSettings: localResult.settings,
  ground: { source: ground.source, method: ground.method, authoredCase: ground.authoredCase },
  sourceOnlyEvent: localResult.bound, branches: localResult.branches, roomCatchment: localResult.roomCatchment, indoorCuts:localResult.joinedDirection.room.indoorCuts, indoorRoutes:localResult.joinedDirection.room.indoorRoutes,
  houseAdopted: false, physicalInstallationAdmitted: false }
for (const [name, content] of [['inlet-source-envelope.results.json', JSON.stringify(result, null, 2) + '\n'],
  ['inlet-source-envelope.svg', reviewSvg + '\n'],
  ['inlet-indoor-cuts.svg', result.joinedDirection.room.indoorCuts.reviewSvg + '\n'],
  ['inlet-indoor-routes.svg', result.joinedDirection.room.indoorRoutes.reviewSvg + '\n'],
  ['inlet-local-pan.svg', localResult.roomCatchment.state === 'whole-room-development-comparison' ? localResult.roomCatchment.room.actualGradedPanSvg + '\n' : ''],
  ['inlet-local-pocket.results.json', JSON.stringify(local, null, 2) + '\n'],
  ['inlet-local-pocket.svg', localResult.roomCatchment.state === 'whole-room-development-comparison' ? localResult.roomCatchment.localPocketSvg + '\n' : ''],
  ['inlet-frame-support.svg', result.joinedDirection.room.electricalScreen.supportFrame.reviewSvg + '\n']]) {
  const path = new URL(name, import.meta.url)
  if (process.argv.includes('--check')) { if (readFileSync(path, 'utf8') !== content) throw new Error('Stale source-and-room decision: ' + name) }
  else writeFileSync(path, content)
}
console.log(result.state + '; whole internal wet station, actual source and material acceptance remain open.')
