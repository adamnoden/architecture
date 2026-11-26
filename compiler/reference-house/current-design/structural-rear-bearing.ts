/** Optional saved rear-wall/lintel comparison in the same full native house. */
import {execFileSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {sha256SemanticFingerprint} from '../../core/identity.js'
import {readCurrentFiniteJointSettings} from './structural-current-finite-joint-settings.js'

const root=new URL('../../../',import.meta.url)
export const rearBearingPaths=[
 'compiler/reference-house/current-design/structural-rear-bearing.ts',
 'project/str/studies/rear_direct_bearing.py','project/str/studies/rear_bearing_plan.py',
 'project/ias/studies/selected-family-convergence.json',
] as const
const domains={lintelWidthMm:[140,300],lintelDepthMm:[200,400],bearingLengthMm:[150,350],
 jointThicknessMm:[5,20],jointNormalComplianceMmPerMPa:[.001,10],concreteUnitWeightKNPerM3:[18,30],
 jointUnitWeightKNPerM3:[15,25],maxBeamPitchMm:[250,1000]} as const
export function readRearBearingSettings(value:unknown){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Explicit optional rear bearing choices required')
 const v=value as Record<string,unknown>,keys=['mode','openingYMm','masonryUnitWeightKNPerM3','bearingQuadratureOrder','execution',...Object.keys(domains)]
 if(Object.keys(v).sort().join('|')!==keys.sort().join('|')||v.mode!=='direct-masonry-short-rc-lintel'||!['compute','deferred'].includes(String(v.execution)))throw Error('Exact rear bearing comparison fields required')
 if(!Array.isArray(v.openingYMm)||v.openingYMm.length!==2||v.openingYMm.some(x=>typeof x!=='number'||!Number.isFinite(x))||v.openingYMm[1]<=v.openingYMm[0])throw Error('Ordered finite rear opening required')
 for(const [key,[lo,hi]]of Object.entries(domains))if(typeof v[key]!=='number'||!Number.isFinite(v[key])||(v[key] as number)<lo||(v[key] as number)>hi)throw Error('Unsupported rear bearing choice: '+key)
 if(v.masonryUnitWeightKNPerM3!==20||!Number.isInteger(v.bearingQuadratureOrder)||![2,4,8,16,32].includes(v.bearingQuadratureOrder as number))throw Error('Actual20kN/m3 masonry and supported bearing quadrature required')
 return structuredClone(v)
}
const limits={candidateAccepted:false,wholeHouseAccepted:false,strengthAccepted:false,ownerAccepted:false}as const
export function runRearBearingComparison(nativeCase:unknown,value:unknown,finiteSettings:unknown,source:unknown){
 if(value===undefined)return null
 const choices=readRearBearingSettings(value)
 const finite=readCurrentFiniteJointSettings(finiteSettings)
 if(!finite.enabled)throw Error('Rear bearing comparison requires the same explicitly enabled finite SW house control')
 const settings={enabled:finite.enabled,youngMPa:finite.youngMPa,solidPitchMm:finite.solidPitchMm}
 const request={nativeCase,choices,finiteSettings:settings};const requestDigest=sha256SemanticFingerprint(request)
 try{
  const python=process.env.STR_FINITE_SOLID_PYTHON??'python3'
  const args=['-B','project/str/studies/rear_direct_bearing.py',...(choices.execution==='deferred'?['--plan']:[])]
  const result=JSON.parse(execFileSync(python,args,{cwd:fileURLToPath(root),input:JSON.stringify(request),encoding:'utf8',
   timeout:900000,maxBuffer:180*1024*1024,env:{...process.env,OPENBLAS_NUM_THREADS:'1',OMP_NUM_THREADS:'1'}}))
  if(choices.execution==='deferred')return{status:'analysis-pending' as const,...limits,source,request,requestDigest,result,
   diagnostics:[{code:'REAR_BEARING_PENDING',message:'Same-source Living/reading layout and renewal geometry only; actual52-head replacement awaits explicit compute. Straight RC does not fulfil the genuine masonry arch preference.'}]}
  if(result.schema!=='str-rear-direct-bearing-comparison/1'||sha256SemanticFingerprint(result.authoredNativeCase)!==sha256SemanticFingerprint(nativeCase)||sha256SemanticFingerprint(result.choices)!==sha256SemanticFingerprint(choices)||Object.keys(limits).some(k=>result[k]!==false))throw Error('Rear bearing comparison lost saved controls or nonacceptance boundary')
  return{status:'computed-unselected-comparison' as const,...limits,source,request,requestDigest,result,
   diagnostics:[{code:'REAR_BEARING_UNSELECTED',message:'Actual shorter RC lintel and axial masonry bearing bodies in the full saved finite house. Two RC posts are removed; a shorter transfer remains. Geometry/renewal comparisons earn no material resistance, handler capability, genuine arch preference or owner acceptance.'}]}
 }catch(error){return{status:'unsupported' as const,...limits,source,request,requestDigest,
  diagnostics:[{code:'REAR_BEARING_UNSUPPORTED',message:error instanceof Error?error.message:String(error)}]}}
}
