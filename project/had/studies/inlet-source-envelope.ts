import { readFileSync, writeFileSync } from 'node:fs'
import { readCurrentDesignResolution, type CurrentDesignResolution } from '../../../compiler/reference-house/current-design/resolve.js'
import { fileURLToPath } from 'node:url'
import { readInletSourceEnvelopeCase, runInletSourceEnvelopeCase, readLocalUtilityPocketSettings } from '../../../compiler/reference-house/current-design/inlet-source-envelope.js'
import { readGroundSectionCase, runGroundSectionCase } from '../../../compiler/reference-house/current-design/structural-ground.js'
export function produceInletSourceEnvelopeOutputs(resolved:CurrentDesignResolution,check=false){
const request = readInletSourceEnvelopeCase(resolved)
const { reviewSvg, ...result } = runInletSourceEnvelopeCase(resolved, request.sourceEnvelope)
const { ground: groundCase } = readGroundSectionCase(resolved), ground = runGroundSectionCase(resolved, groundCase)
if (ground.native.levelsMm.ffl !== 530 || JSON.stringify((ground.native.levelsMm as unknown as Record<string, unknown>).accessibleDistribution) !== '[450,515]') throw new Error('The local530 Utility pocket requires its unchanged global ground530/65 reference')
const localResult = runInletSourceEnvelopeCase(resolved, { ...request.sourceEnvelope, settings: readLocalUtilityPocketSettings() }, ground)
const local = { schema: 'had-local-room-pocket-receipt/1', source: localResult.source, authoredSettings: localResult.settings,
  ground: { source: ground.source, method: ground.method, authoredCase: ground.authoredCase },
  sourceOnlyEvent: localResult.bound, branches: localResult.branches, roomCatchment: localResult.roomCatchment, indoorCuts:localResult.joinedDirection.room.indoorCuts, indoorRoutes:localResult.joinedDirection.room.indoorRoutes, bankReceiver:localResult.joinedDirection.room.bankReceiver, bankShelfCarrier:localResult.joinedDirection.room.bankShelfCarrier,
  houseAdopted: false, physicalInstallationAdmitted: false }
for (const [name, content] of [['inlet-source-envelope.results.json', JSON.stringify(result, null, 2) + '\n'],
  ['inlet-source-envelope.svg', reviewSvg + '\n'],
  ['inlet-indoor-cuts.svg', result.joinedDirection.room.indoorCuts.reviewSvg + '\n'],
  ['inlet-indoor-routes.svg', result.joinedDirection.room.indoorRoutes.reviewSvg + '\n'],
  ['inlet-route-candidate.svg', (result.joinedDirection.room.indoorRoutes.candidateComparison.comparison?.reviewSvg??'<svg xmlns="http://www.w3.org/2000/svg"><text x="20" y="30">Unsupported candidate/current connections; no adoption.</text></svg>')+'\n'],
  ['inlet-bank-receiver.svg', result.joinedDirection.room.bankReceiver.reviewSvg + '\n'],
  ['inlet-bank-carrier.svg', result.joinedDirection.room.bankShelfCarrier.reviewSvg + '\n'],
  ['inlet-bank-carrier.results.json', JSON.stringify({source:result.source,comparison:result.joinedDirection.room.bankShelfCarrier},null,2)+'\n'],
  ['inlet-local-pan.svg', localResult.roomCatchment.state === 'whole-room-development-comparison' ? localResult.roomCatchment.room.actualGradedPanSvg + '\n' : ''],
  ['inlet-local-pocket.results.json', JSON.stringify(local, null, 2) + '\n'],
  ['inlet-local-pocket.svg', localResult.roomCatchment.state === 'whole-room-development-comparison' ? localResult.roomCatchment.localPocketSvg + '\n' : ''],
  ['inlet-frame-support.svg', result.joinedDirection.room.electricalScreen.supportFrame.reviewSvg + '\n']]) {
  const path = new URL(name, import.meta.url)
  if (check) { if (readFileSync(path, 'utf8') !== content) throw new Error('Stale source-and-room decision: ' + name) }
  else writeFileSync(path, content)
}
console.log(result.state + '; whole internal wet station, actual source and material acceptance remain open.')

}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1])produceInletSourceEnvelopeOutputs(readCurrentDesignResolution(),process.argv.includes('--check'))
