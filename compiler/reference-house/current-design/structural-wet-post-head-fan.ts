import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {sha256SemanticFingerprint} from '../../core/identity.js'
import type {runWetSupportCageComparison} from './structural-wet-support-cage.js'
const root=new URL('../../../',import.meta.url)
export const wetPostHeadFanPaths=['project/str/studies/wet_post_head_fan.py','project/str/studies/wet_post_head_fan_driver.py','compiler/reference-house/current-design/structural-wet-post-head-fan.ts'] as const
const record=(v:unknown):v is Record<string,any>=>v!==null&&typeof v==='object'&&!Array.isArray(v)
const same=(a:unknown,b:unknown)=>sha256SemanticFingerprint(a)===sha256SemanticFingerprint(b)
const sha=(path:string)=>createHash('sha256').update(readFileSync(new URL(path,root))).digest('hex')
const limits={finiteCCTNodesAccepted:false,anchorageAccepted:false,fullSectionContinuationAccepted:false,toleranceDomainAccepted:false,resistanceAccepted:false,completeSignedLoadEnvelope:false} as const
function unsupported(code:string,message:string){return{status:'unsupported' as const,diagnostics:[{code,message}],posts:[],...limits}}
/** Current native and independently generated cage are supplied by the floor stage.
 * A nominal equilibrium fan does not establish a finite concrete node or anchor. */
export function runWetPostHeadFan(native:unknown,cage:ReturnType<typeof runWetSupportCageComparison>|null){
 if(cage===null)return null
 try{
  const geometry:unknown=cage.comparison
  if(!record(native)||native.schema!=='str-coupled-floor-section-result/1'||!record(native.sourceSHA256)||Object.keys(native.sourceSHA256).length!==58
   ||!record(native.request)||!same(native.request.sourceSHA256,native.sourceSHA256)||!record(native.nativeVertical)||!record(native.nativeVertical.native)
   ||native.candidateAccepted!==false||native.completeHouseProof!==false
   ||cage.nativeCaseId!==native.nativeVertical.native.caseId||!same(cage.nativeSourceSHA256,native.sourceSHA256)||cage.source.rawGridIdentityVerified!==true
   ||!record(geometry)||!Array.isArray(geometry.links)||!Array.isArray(geometry.mainBars)||!same(cage.settings,geometry.settings))
   return unsupported('WET_HEAD_FAN_INPUT_UNSUPPORTED','Matching actual unadopted native floor and independently generated cage required')
  for(const[path,identity]of Object.entries(native.sourceSHA256)){
   if(!/^project\/[A-Za-z0-9/_.-]+$/.test(path)||path.split('/').includes('..')||sha(path)!==identity)return unsupported('WET_HEAD_FAN_SOURCE_STALE','Actual native source is stale: '+path)
  }
  for(const[path,identity]of Object.entries(cage.method.sourceSHA256))if(sha(path)!==identity)return unsupported('WET_HEAD_FAN_CAGE_METHOD_STALE','Actual cage method changed: '+path)
  const methods=Object.fromEntries(wetPostHeadFanPaths.map(path=>[path,sha(path)])),binding={sourceSHA256:native.sourceSHA256,request:native.request,nativeCaseId:cage.nativeCaseId}
  const response=JSON.parse(execFileSync('python3',['-B',fileURLToPath(new URL(wetPostHeadFanPaths[1],root))],{
   input:JSON.stringify({schema:'str-wet-head-fan-request/1',native,cage:geometry,binding}),encoding:'utf8',maxBuffer:16*1024*1024,stdio:'pipe'})) as unknown
  if(!record(response)||response.schema!=='str-wet-head-fan-response/1'||!record(response.result))throw Error('Versioned nominal fan response required')
  const result=response.result
  if(!['unsupported','computed-nominal-demand'].includes(result.status)||Object.keys(limits).some(key=>result[key]!==false))
   throw Error('Nominal fan result lost its explicit unsupported resistance boundary')
  if(result.status==='computed-nominal-demand'&&(!Array.isArray(result.posts)||result.posts.length!==2||!record(result.sourceBinding)
   ||!same(result.sourceBinding.sourceSHA256,binding.sourceSHA256)||!same(result.sourceBinding.request,binding.request)||result.sourceBinding.nativeCaseId!==binding.nativeCaseId))
   throw Error('Nominal fan result lost its actual source/request/post identities')
  if(wetPostHeadFanPaths.some(path=>sha(path)!==methods[path]))throw Error('Nominal fan method changed during recovery')
  for(const[path,identity]of Object.entries(native.sourceSHA256))if(sha(path)!==identity)throw Error('Native source changed during fan recovery')
  for(const[path,identity]of Object.entries(cage.method.sourceSHA256))if(sha(path)!==identity)throw Error('Cage method changed during fan recovery')
  return{...result,status:result.status as 'unsupported'|'computed-nominal-demand',posts:result.posts??[],method:{id:'str-current-wet-post-head-fan/1',sourceSHA256:methods},evidence:{...limits,
   nativeSourceValidationOwner:'compiler/reference-house/current-design/structural-floor-section.ts',
   cageGenerationOwner:'compiler/reference-house/current-design/structural-wet-support-cage.ts',
   scope:'Nominal discrete contact equilibrium only. Quadrature convergence, finite nodes, bends/anchors, placement and complete signed loading remain separate obligations.'}}
 }catch(error){return unsupported('WET_HEAD_FAN_METHOD_UNAVAILABLE',error instanceof Error?error.message:String(error))}
}
