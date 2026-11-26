import {readRearBearingSettings} from '../../../compiler/reference-house/current-design/structural-rear-bearing.js'
import {sha256SemanticFingerprint} from '../../../compiler/core/identity.js'
import {readWetBeamEndDevelopmentControls} from '../../../compiler/reference-house/current-design/structural-wet-beam-end-settings.js'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { compileEngineeringDocument, readEngineeringDocument } from '../../../compiler/reference-house/current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from '../../../compiler/reference-house/current-design/georgian-source.js'
import { isEngineeringTicket, readEngineeringEditDocument } from '../../../compiler/reference-house/current-design/engineering-edit.js'
import { renderDrawingSceneV2Svg } from '../../../compiler/publication-drawing-v2/svg.js'

/** Compact presentation of the authoritative same-native end result. */
export function wetBeamEndReview(value: unknown) {
  if (value === null || value === undefined) return null
  const record = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v)
  if (!record(value)) throw new TypeError('Expected the compiler local end result')
  const diagnostics = (Array.isArray(value.diagnostics) ? value.diagnostics : []).map((row: unknown) => {
    if (!record(row) || typeof row.code !== 'string' || typeof row.message !== 'string') throw new TypeError('Invalid local end diagnostic')
    return {code:row.code,message:row.message}
  })
  if (value.status === 'unsupported') return {status:'unsupported' as const,diagnostics,comparison:null}
  if (value.status !== 'computed-development-comparison' || !record(value.collisions) || !record(value.internalClosures)
    || !record(value.cover) || !record(value.quantities) || !record(value.drawings)
    || !Array.isArray(value.internalClosures.failures) || !Array.isArray(value.cover.failedPaths)
    || typeof value.drawings['wet-beam-end.svg'] !== 'string' || typeof value.nativeCaseId !== 'string'
    || !Number.isSafeInteger(value.collisions.failedPairCount) || value.collisions.failedPairCount < 0
    || typeof value.quantities.actualSteelMassUpperKg !== 'number' || !Number.isFinite(value.quantities.actualSteelMassUpperKg)
    || value.candidateAccepted !== false || value.nativeSolveExecuted !== false || value.nativeCageMassFeedbackApplied !== false
    || value.beamEndDRegionAccepted !== false || value.bendPressureAccepted !== false || value.bondAndAnchorageAccepted !== false) {
    throw new TypeError('Local end result lost actual geometry, drawing or proof limits')
  }
  return {status:'computed-development-comparison' as const,diagnostics,comparison:{
    controls:readWetBeamEndDevelopmentControls(value.controls),nativeCaseId:value.nativeCaseId,
    geometry:{independentPathFailureCount:value.collisions.failedPairCount as number,
      internalClosureFailureCount:value.internalClosures.failures.length,coverFailureCount:value.cover.failedPaths.length},
    steelMassUpperKg:value.quantities.actualSteelMassUpperKg as number,svg:value.drawings['wet-beam-end.svg'] as string,
    candidateAccepted:false as const,nativeSolveExecuted:false as const,nativeCageMassFeedbackApplied:false as const,
    compatibleCurvedBarForceAvailable:false as const,beamEndDRegionAccepted:false as const,bondAndAnchorageAccepted:false as const,
  }}
}
/** Present only the actual proposal emitted for this saved rear comparison. */
export function rearBearingReview(value: unknown) {
  if(value===null||value===undefined)return null
  const record=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v)
  const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)
  const pair=(v:unknown)=>Array.isArray(v)&&v.length===2&&v.every(finite)
  if(!record(value)||!['analysis-pending','computed-unselected-comparison','unsupported'].includes(value.status)
    ||!record(value.request)||typeof value.requestDigest!=='string'||sha256SemanticFingerprint(value.request)!==value.requestDigest
    ||['candidateAccepted','wholeHouseAccepted','strengthAccepted','ownerAccepted'].some(k=>value[k]!==false))throw new TypeError('Rear comparison lost its saved request or unselected scope')
  const controls=readRearBearingSettings(value.request.choices)
  const diagnostics=(Array.isArray(value.diagnostics)?value.diagnostics:[]).map((d:unknown)=>{
    if(!record(d)||typeof d.code!=='string'||typeof d.message!=='string')throw new TypeError('Invalid rear bearing diagnostic')
    return{code:d.code,message:d.message}
  })
  const result=record(value.result)?value.result:null
  const geometry=result?(value.status==='computed-unselected-comparison'?result.actualReplacement?.geometry:result.geometry):null
  let proposal=null
  if(geometry!==null&&geometry!==undefined){
    const g=geometry
    if(!record(g)||g.schema!=='str-rear-direct-bearing-plan/1'||!pair(g.rawOpeningYMm)||!pair(g.finishedOpeningYMm)
      ||!finite(g.finishedClearWidthMm)||!finite(g.axisXMm)||!finite(g.lintelBottomZMm)||!finite(g.southCrossPassageMm)
      ||typeof g.planPass!=='boolean'||typeof g.sourceGeometryDigest!=='string'
      ||sha256SemanticFingerprint(g.choices)!==sha256SemanticFingerprint(controls)||JSON.stringify(g.rawOpeningYMm)!==JSON.stringify(controls.openingYMm)
      ||!record(result?.drawings)||typeof result.drawings['rear-bearing-plan.svg']!=='string'||typeof result.drawings['rear-bearing-section.svg']!=='string'
      ||['candidateAccepted','appearanceAccepted','physicalHandlingAccepted'].some(k=>g[k]!==false)
      ||(value.status==='analysis-pending'&&!g.planPass))throw new TypeError('Rear comparison lost current geometry, drawings or proof limits')
    proposal={rawOpeningYMm:g.rawOpeningYMm as [number,number],finishedOpeningYMm:g.finishedOpeningYMm as [number,number],
      finishedClearWidthMm:g.finishedClearWidthMm as number,axisXMm:g.axisXMm as number,lintelBottomZMm:g.lintelBottomZMm as number,
      southCrossPassageMm:g.southCrossPassageMm as number,planPass:g.planPass as boolean,sourceGeometryDigest:g.sourceGeometryDigest as string,
      planSvg:result!.drawings['rear-bearing-plan.svg'] as string,sectionSvg:result!.drawings['rear-bearing-section.svg'] as string}
  }else if(value.status!=='unsupported')throw new TypeError('Rear comparison has no actual proposal')
  const heads=value.status==='computed-unselected-comparison'?result?.finiteHouseResult?.native?.nativeVertical?.native?.heads:undefined
  if(value.status==='computed-unselected-comparison'&&(!Array.isArray(heads)||heads.length!==52))throw new TypeError('Rear comparison lost its actual full-house result')
  return{status:value.status as 'analysis-pending'|'computed-unselected-comparison'|'unsupported',controls,requestDigest:value.requestDigest as string,
    diagnostics,proposal,nativeHeadCount:Array.isArray(heads)?heads.length:null,
    candidateAccepted:false as const,wholeHouseAccepted:false as const,strengthAccepted:false as const,ownerAccepted:false as const}
}
export async function readEditorEngineeringDocument() {
  const document = await readEngineeringDocument(readGeorgianDesignSnapshot())
  // Explicit initial scope, not a fallback or silent stage deletion on import.
  return { ...document, stages: { roofPitch: document.stages.roofPitch } }
}
export async function runEditorEngineeringRequest(input: unknown) {
  if (!input || typeof input !== 'object' || Object.keys(input).length !== 1 || !Object.hasOwn(input, 'ticket')) throw new TypeError('Expected one revision-bound engineering ticket')
  const { ticket } = input as { ticket: unknown }
  if (!isEngineeringTicket(ticket)) throw new TypeError('Invalid engineering revision ticket')
  const document = readEngineeringEditDocument(JSON.parse(ticket.documentJson))
  const bundle = await compileEngineeringDocument(document)
  const roof = bundle.engineering.roofPitch
  if (!roof) throw new TypeError('The saved document has no compiled roof-pitch stage')
  const floor = bundle.engineering.floorSection
  const cage = floor?.cageComparison
  const fanReserves = floor?.wetPostHeadFan?.posts.flatMap((post: any) =>
    typeof post.necessaryPlacementDomain?.minimumReserveMm === 'number' ? [post.necessaryPlacementDomain.minimumReserveMm] : []) ?? []
  const lighting = bundle.engineering.studyLighting
  const finite=floor?.finiteJointComparison
  const inlet=bundle.engineering.inletSourceEnvelope, bank=inlet?.joinedDirection.room.bankReceiver
  const ground=bundle.engineering.groundPocketLoads
  return { ticket, documentIdentity: bundle.documentIdentity, manifest: bundle.manifest,
    coordinationDiagnostics: bundle.coordinationDiagnostics, evidence: bundle.evidence,
    floorEvidence: floor ? { headCount:floor.native.heads.length, contactComputed:floor.wetBearingContact?.status==='computed-comparison',
      finiteJointStatus:floor.finiteJointComparison?.status??null,finiteJointDiagnostics:floor.finiteJointComparison?.diagnostics??[],lowerMasonryStatus:floor.lowerMasonryComparison?.status??null,lowerMasonryDiagnostics:floor.lowerMasonryComparison?.diagnostics??[],contourStatus:floor.contourComponent?.status??null,contourDiagnostics:floor.contourComponent?.diagnostics??[],slabSolidCompatibility:floor.slabSolidCompatibility, nominalHeadFanPlacementReserveMm:fanReserves.length?Math.min(...fanReserves):null, nominalHeadFanStatus:floor.wetPostHeadFan?.status??null, jointStatus:floor.fourLJointDemands.status, jointDiagnostics:floor.fourLJointDemands.diagnostics, finiteJointCapacityAvailable:false as const } : null,
    wetBeamEnd: wetBeamEndReview(floor?.wetBeamEndDevelopment),
    rearBearing: rearBearingReview(floor?.rearBearingComparison),
    groundPocketLoads:ground?{status:ground.status,controls:ground.controls,diagnostics:ground.diagnostics,
      headCount:ground.status==='computed-unselected-candidate'?ground.native.heads.length:null,
      addedPhysicalGKN:ground.status==='computed-unselected-candidate'?ground.comparison.addedPhysicalGKN:null,
      receiverCutsAvailable:ground.status==='computed-unselected-candidate'&&ground.comparison.receiverCutRecovery?.physicalElementCutsAvailable===true,
      receiverMemberCount:ground.status==='computed-unselected-candidate'&&ground.comparison.receiverCutRecovery?.physicalElementCutsAvailable===true?ground.comparison.receiverCutRecovery.memberIds.length:null,
      candidateAccepted:false as const,completeInstalledInventory:false as const}:null,
    currentFiniteJoint:finite?{status:finite.status,controls:finite.controls,diagnostics:finite.diagnostics,
      headCount:finite.status==='computed-unselected-comparison'?finite.result.native.nativeVertical.native.heads.length:null,
      floorSvg:finite.status==='computed-unselected-comparison'?finite.result.native.drawings['floor-section-floor.svg'] as string:null,
      candidateAccepted:false as const,resistanceAccepted:false as const}:null,
    studyLighting: lighting ? { svg: lighting.commonDepthCornerSvg, comparison: lighting.lighting.commonDepthCornerComparison,
      homeRunSvg:lighting.constructionSvg,homeRuns:lighting.lighting.construction.localHomeRunComparison } : null,
    studyRoom: bundle.engineering.studyRoomKit?.eyeLevel ?? null,
    plantRoom: inlet?.splitPlantRoom ?? null,
    storeDrain: inlet?.storeDrain ?? null,
    inletBank: inlet&&bank?{settings:inlet.settings,receiver:bank,carrier:inlet.joinedDirection.room.bankShelfCarrier,route:inlet.joinedDirection.room.indoorRoutes,sourceOnlyBound:inlet.bound}:null,
    roof: { ...roof, svg: renderDrawingSceneV2Svg(roof.drawing) },
    wetCage: cage ? { settings: cage.settings, geometry: cage.geometry, quantities: cage.quantities,
      nativeCaseId: cage.nativeCaseId, nativeSourceSHA256: cage.nativeSourceSHA256, method: cage.method, evidence: cage.evidence } : null }
}
function send(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  response.end(JSON.stringify(body))
}
/** Local Vite transport only. No model, stage or calculation is implemented here. */
export function engineeringApi(request: IncomingMessage, response: ServerResponse, next: () => void) {
  const path = request.url?.split('?')[0]
  if (!path?.startsWith('/api/engineering/')) { next(); return }
  void (async () => {
    try {
      if (request.method === 'GET' && path === '/api/engineering/document') {
        send(response, 200, await readEditorEngineeringDocument()); return
      }
      if (request.method !== 'POST' || path !== '/api/engineering/compile') { send(response, 404, { error: 'Unknown engineering request' }); return }
      const chunks: Buffer[] = []
      let size = 0
      for await (const chunk of request) {
        size += chunk.length
        if (size > 16 * 1024 * 1024) throw new TypeError('Engineering request exceeds 16 MiB')
        chunks.push(Buffer.from(chunk))
      }
      send(response, 200, await runEditorEngineeringRequest(JSON.parse(Buffer.concat(chunks).toString('utf8'))))
    } catch (error) { send(response, 422, { error: error instanceof Error ? error.message : String(error) }) }
  })()
}
export type EngineeringReply = Awaited<ReturnType<typeof runEditorEngineeringRequest>>
