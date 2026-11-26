/** Local finite solid development. This never replaces an ordinary floor operator. */
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {sha256SemanticFingerprint} from '../../core/identity.js'
import type {CurrentDesignResolution} from './resolve.js'
import {readFiniteFloorContourSettings,type FiniteFloorContourSettings} from './structural-finite-floor-contour-settings.js'
export {readFiniteFloorContourSettings,finiteFloorContourDefaults} from './structural-finite-floor-contour-settings.js'
export type {FiniteFloorContourSettings} from './structural-finite-floor-contour-settings.js'
const root=new URL('../../../',import.meta.url)
const record=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v)
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)
const same=(a:unknown,b:unknown)=>sha256SemanticFingerprint(a)===sha256SemanticFingerprint(b)
const sha=(p:string)=>createHash('sha256').update(readFileSync(new URL(p,root))).digest('hex')
export const finiteFloorContourPaths=[
 'compiler/reference-house/current-design/structural-finite-floor-contour.ts',
 'compiler/reference-house/current-design/structural-finite-floor-contour-settings.ts',
 'project/str/studies/finite_floor_contour.py','project/str/studies/finite_floor_contour_run.py',
 'project/str/studies/finite-joint-solid-requirements.txt','project/str/studies/finite-floor-contour-inputs.json',
 'project/str/studies/fixed-normal-experiment-inputs.json',
 'project/str/studies/fixed-normal-experiment-captures.tar.xz',
 'project/str/studies/four-l-joint-material-audit.json',
] as const
const limits={nativeFloorAdmission:false,globalReplacementAvailable:false,jointResistanceAvailable:false,
 nativeConstitutiveEquivalence:false,outerBandAndChordInterfaceAvailable:false} as const
function reference(){
 const input=JSON.parse(readFileSync(new URL('project/str/studies/fixed-normal-experiment-inputs.json',root),'utf8'))
 if(input.schema!=='str-fixed-normal-experiment-inputs/1'||!record(input.baseNativeRequest))throw Error('Explicit experimental contour reference required')
 const comparison=input.baseNativeRequest
 for(const[p,identity]of Object.entries(comparison.sourceSHA256)){
  if(!/^project\/[A-Za-z0-9/_.-]+$/.test(p)||p.split('/').includes('..')||sha(p)!==identity)throw Error('Stale finite contour native source: '+p)
 }
 return comparison
}
function methods(){return Object.fromEntries(finiteFloorContourPaths.map(p=>[p,sha(p)]))}
function unavailable(status:'unsupported'|'deferred',code:string,message:string,settings:FiniteFloorContourSettings,binding:unknown){
 return{status,...limits,settings,source:binding,diagnostics:[{code,message}],component:null as Record<string,any>|null}
}
/** Authoritative native comparison comes from the sole saved floor stage, not a receipt. */
export function runFiniteFloorContourComponent(resolved:CurrentDesignResolution,comparison:unknown,value:unknown,binding:unknown){
 if(value===undefined||value===null)return null
 const settings=readFiniteFloorContourSettings(value)
 const owner=resolved.disciplineBindings.find(row=>row.id==='str-finite-joint-development')
 if(resolved.design.source.kind!=='georgian-layout-revision'||!owner)throw Error('Missing current finite-joint-development owning binding')
 for(const path of finiteFloorContourPaths){
  const bytes=readFileSync(new URL(path,root)),blob=createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
  if(owner.identities[path]!==blob)throw Error('Stale or missing finite contour owning method: '+path)
 }
 if(!record(binding)||binding.planDigest!==sha256SemanticFingerprint(resolved.design)||typeof binding.caseDigest!=='string'
  ||binding.nativeRequestDigest!==sha256SemanticFingerprint(comparison))throw Error('Actual saved floor revision/request binding required')
 const inputs=methods(),expected=reference()
 if(!same(comparison,expected))return unavailable('unsupported','FINITE_CONTOUR_CHANGED_NATIVE_CASE',
  'The retained contour stations belong only to the exact declared native500 experimental request. Changed geometry, support, load, slab or material inputs require fresh contour evidence; no historical fallback is used.',settings,binding)
 if(settings.execution==='deferred')return unavailable('deferred','FINITE_CONTOUR_ANALYSIS_PENDING',
  'The saved local contour comparison is deferred. No finite component or global joint evidence is available; explicit compute runs the same versioned method used by CLI and batch.',settings,binding)
 try{
  const python=process.env.STR_FINITE_SOLID_PYTHON??'python3'
  const response=JSON.parse(execFileSync(python,['-B',fileURLToPath(new URL('project/str/studies/finite_floor_contour_run.py',root)),'--root',fileURLToPath(root),'--adapter'],{
   input:JSON.stringify({schema:'str-finite-floor-contour-execute/1',comparison,settings}),encoding:'utf8',maxBuffer:16*1024*1024,
   env:{...process.env,OPENBLAS_NUM_THREADS:'1',OMP_NUM_THREADS:'1'},timeout:600000,stdio:'pipe'}))
  const result=response.result
  if(response.schema!=='str-finite-floor-contour-response/1'||response.status!=='computed-local-comparison'||!record(result)
   ||result.schema!=='ovids-house/str-finite-floor-contour-experiment/1'||Object.keys(limits).some(k=>result[k]!==false)
   ||!same(result.inputs?.nativeSourceSHA256,expected.sourceSHA256)||result.pitchMm!==settings.pitchMm
   ||result.youngKNPerM2!==settings.youngKNPerM2||result.poisson!==settings.poisson||result.floorLiveKPa!==settings.slabVolumeLoadEquivalentKPa
   ||result.runtime?.['scikit-fem']!=='12.0.2'||!Array.isArray(result.ports)||new Set(result.ports.map((p:any)=>p.id)).size!==result.ports.length
   ||!Array.isArray(result.condensedStiffness)||result.condensedStiffness.length!==result.ports.length
   ||result.condensedStiffness.some((r:any)=>!Array.isArray(r)||r.length!==result.ports.length||!r.every(finite))
   ||!Array.isArray(result.consistentLoad)||result.consistentLoad.length!==result.ports.length||!result.consistentLoad.every(finite)
   ||result.freeRigidModes!==6||result.positiveRelativeModes!==result.ports.length-6
   ||!finite(result.relativeRigidModeResidual)||result.relativeRigidModeResidual>1e-9
   ||!finite(result.loadWrenchResidualKN_KNM)||result.loadWrenchResidualKN_KNM>1e-7)throw Error('Finite contour result lost source, physical port work or explicit limits')
  for(const name of ['finite_floor_contour.py','finite_floor_contour_run.py'])if(result.methodSHA256?.[name]!==inputs['project/str/studies/'+name])throw Error('Finite contour executed method mismatch')
  if(!same(methods(),inputs)||!same(reference(),expected))throw Error('Finite contour source/method changed during solve')
  return{status:'computed-local-comparison' as const,...limits,settings,source:binding,
   method:{id:'str-current-finite-floor-contour/1',sourceSHA256:inputs},component:result,
   diagnostics:[{code:'FINITE_CONTOUR_GLOBAL_REPLACEMENT_UNAVAILABLE',message:result.scope}]}
 }catch(error){return unavailable('unsupported','FINITE_CONTOUR_METHOD_UNAVAILABLE',error instanceof Error?error.message:String(error),settings,binding)}
}
