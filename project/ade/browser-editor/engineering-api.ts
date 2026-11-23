import type { IncomingMessage, ServerResponse } from 'node:http'
import { compileEngineeringDocument, readEngineeringDocument } from '../../../compiler/reference-house/current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from '../../../compiler/reference-house/current-design/georgian-source.js'
import { isEngineeringTicket, readEngineeringEditDocument } from '../../../compiler/reference-house/current-design/engineering-edit.js'
import { renderDrawingSceneV2Svg } from '../../../compiler/publication-drawing-v2/svg.js'

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
  const lighting = bundle.engineering.studyLighting
  const inlet=bundle.engineering.inletSourceEnvelope, bank=inlet?.joinedDirection.room.bankReceiver
  return { ticket, documentIdentity: bundle.documentIdentity, manifest: bundle.manifest,
    coordinationDiagnostics: bundle.coordinationDiagnostics, evidence: bundle.evidence,
    floorEvidence: floor ? { headCount:floor.native.heads.length, contactComputed:floor.wetBearingContact?.status==='computed-comparison',
      nominalHeadFanStatus:floor.wetPostHeadFan?.status??null, jointStatus:floor.fourLJointDemands.status, jointDiagnostics:floor.fourLJointDemands.diagnostics, finiteJointCapacityAvailable:false as const } : null,
    studyLighting: lighting ? { svg: lighting.commonDepthCornerSvg, comparison: lighting.lighting.commonDepthCornerComparison } : null,
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
