import type {InletCornerContext} from './inlet-utility-corner.js'
/** Re-solve known local floor stock from this saved document, never a retained receipt. */
import {execFileSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {sha256SemanticFingerprint} from '../../core/identity.js'
import {readGroundPocketSettings} from './structural-ground-pocket-settings.js'
import {runInletSourceEnvelopeCase} from './inlet-source-envelope.js'
import type {CurrentDesignResolution} from './resolve.js'
import type {runGroundSectionCase} from './structural-ground.js'
import type {runHouseVerticalProfileCase} from './house-vertical-profile.js'
import type {savedFloorSectionCase,runFloorSectionCase} from './structural-floor-section.js'
const root=new URL('../../../',import.meta.url)
export const groundPocketPaths=['compiler/reference-house/current-design/structural-ground-pockets.ts','compiler/reference-house/current-design/structural-ground-pocket-settings.ts','project/str/studies/service_room_ground.py'] as const
const sha=(p:string)=>createHash('sha256').update(readFileSync(new URL(p,root))).digest('hex')
const same=(a:unknown,b:unknown)=>sha256SemanticFingerprint(a)===sha256SemanticFingerprint(b)
const limits={candidateAccepted:false,wholeHouseAccepted:false,materialStiffnessQualified:false,completeInstalledInventory:false,completeReceiverResistance:false,architecturalEvidenceApplicable:false} as const
/** Authenticate the experimental response separately from numerical adequacy. */
export function assertGroundPocketResponseIdentity(output:any,request:any,headIds:readonly string[],methodSHA256:string){
 if(output.schema!=='str-service-room-ground-response/1'||!same(output.experimentalRequest,request)||!same(output.sourceSHA256,request.nativeCase.sourceSHA256)||!same(output.experimentalMethodSHA256,{'project/str/studies/service_room_ground.py':methodSHA256})||output.candidateAccepted!==false||output.wholeHouseAccepted!==false||output.removedNativeGKN!==0||output.baselineNativeGroundStockEvidence?.creditedWeightKN!==0)throw Error('Ground comparison lost exact request, executed method, native stock reconciliation or nonacceptance')
 const heads=output.native?.heads
 if(!Array.isArray(heads)||heads.length!==headIds.length||new Set(heads.map((h:any)=>h.id)).size!==headIds.length||heads.some((h:any)=>!headIds.includes(h.id)))throw Error('Ground comparison lost the actual ordinary foundation-head catalogue')
}
export function runGroundPocketComparison(resolved:CurrentDesignResolution,value:unknown,floor:ReturnType<typeof savedFloorSectionCase>,ordinary:ReturnType<typeof runFloorSectionCase>,inletInput:unknown,ground:ReturnType<typeof runGroundSectionCase>,profile?:ReturnType<typeof runHouseVerticalProfileCase>,geometryContext?:InletCornerContext){
 const controls=readGroundPocketSettings(value)
 const unavailable=(message:string)=>({status:'unsupported' as const,...limits,controls,diagnostics:[{code:'GROUND_POCKET_UNSUPPORTED',message}],drawings:{} as Record<string,string>})
 try{
  // Recompute and validate the actual inlet case against current discipline
  // bindings. Caller-supplied stock rows or provenance are never an input.
  const inlet=runInletSourceEnvelopeCase(resolved,inletInput,ground,profile,geometryContext),inventory=inlet.knownGravityInventory,bodies=inventory.structuralFloorBodies
  if(ordinary.source.caseDigest!==sha256SemanticFingerprint(floor)||ordinary.source.planDigest!==inlet.source.planDigest||inlet.source.planDigest!==sha256SemanticFingerprint(resolved.design))throw Error('Saved floor/inlet plan or case identity differs')
  if(ground.native.levelsMm.ffl!==530||!bodies.length||bodies.some(b=>b.requiredUnrepresentedPlinthMm!==0||b.profile.fflMm!==530||b.profile.coldGridTopMm!==-180||b.profile.rigidZTransformApplied||!same(b.rcZMm,[-30,170])||!same(b.mineralZMm,[-180,-30])||!same(b.source,inventory.source)||b.source.groundCaseDigest!==ground.source.caseDigest))throw Error('Only exact530-profile stock on unchanged cold grid−180 with represented mineral course is supported')
  if(Object.keys(floor.comparison.sourceSHA256).length!==58)throw Error('Complete actual58 native source identities required')
  const checkNative=()=>{for(const [p,h] of Object.entries(floor.comparison.sourceSHA256)){if(!/^project\/[A-Za-z0-9/_.-]+$/.test(p)||p.split('/').includes('..')||sha(p)!==h)throw Error('Native source changed: '+p)}}
  checkNative();const methods=Object.fromEntries(groundPocketPaths.map(p=>[p,sha(p)]))
  const source={planDigest:inlet.source.planDigest,floorCaseDigest:ordinary.source.caseDigest,inletSource:inventory.source,structuralBodiesDigest:sha256SemanticFingerprint(bodies),controlsDigest:sha256SemanticFingerprint(controls)}
  const request={schema:'str-service-room-ground-request/1',caseId:floor.caseId+':known-ground-stock',nativeCase:floor.comparison,structuralFloorBodies:bodies,settings:controls.settings,stockSource:source}
  const method={id:'str-current-known-ground-stock/1',sourceSHA256:methods}
  if(controls.execution==='deferred')return{status:'analysis-pending' as const,...limits,controls,source,method,request,drawings:{} as Record<string,string>,diagnostics:[{code:'GROUND_POCKET_ANALYSIS_PENDING',message:'Exact saved room bodies and native floor request pending; no archived response or ordinary floor result substitutes for this candidate.'}]}
  const code="import json,sys;sys.path.insert(0,'project/str/studies');from service_room_ground import run;json.dump(run(json.load(sys.stdin)),sys.stdout,allow_nan=False)"
  const output=JSON.parse(execFileSync('python3',['-B','-c',code],{cwd:fileURLToPath(root),input:JSON.stringify(request),encoding:'utf8',maxBuffer:128*1024*1024,timeout:600000,env:{...process.env,OPENBLAS_NUM_THREADS:'1',OMP_NUM_THREADS:'1'}}))
  assertGroundPocketResponseIdentity(output,request,ordinary.native.heads.map(h=>h.id),methods['project/str/studies/service_room_ground.py'])
  const native=output.native
  if(!Array.isArray(native?.heads)||native.heads.length!==52||new Set(native.heads.map((h:any)=>h.id)).size!==52||native.heads.some((h:any)=>!Array.isArray(h.reactionKN_KNm)||h.reactionKN_KNm.length!==6||h.reactionKN_KNm.some((v:number)=>!Number.isFinite(v)))||!Array.isArray(native.equilibriumResidualKN_KNm)||native.equilibriumResidualKN_KNm.length!==6||native.equilibriumResidualKN_KNm.some((v:number)=>!Number.isFinite(v)||Math.abs(v)>1e-5))throw Error('Actual52-head six-wrench closure unavailable')
  const weight=bodies.reduce((s,b)=>s+b.independentKnownGravity.rcGKN+b.independentKnownGravity.mineralGKN,0)*(controls.settings.enabled?1:0)
  const ordinaryMass=ordinary.mass as Record<string,unknown>
  if(typeof ordinaryMass.joinedPhysicalGKN!=='number'||!Number.isFinite(ordinaryMass.joinedPhysicalGKN)||typeof output.mass?.joinedPhysicalGKN!=='number'||!Number.isFinite(output.mass.joinedPhysicalGKN)||Math.abs(output.mass.joinedPhysicalGKN-ordinaryMass.joinedPhysicalGKN-weight)>1e-6)throw Error('Known ground G not reconciled with ordinary whole-system inventory')
  checkNative();if(!same(methods,Object.fromEntries(groundPocketPaths.map(p=>[p,sha(p)]))))throw Error('Ground method changed during solve')
  return{status:'computed-unselected-candidate' as const,...limits,controls,source,method,request,comparison:output.comparison,native,mass:output.mass,baselineNativeGroundStockEvidence:output.baselineNativeGroundStockEvidence,drawings:{} as Record<string,string>,diagnostics:[{code:'GROUND_POCKET_PARTIAL_GRAVITY_ONLY',message:output.diagnostics.join(' ')}]}
 }catch(error){return unavailable(error instanceof Error?error.message:String(error))}
}
