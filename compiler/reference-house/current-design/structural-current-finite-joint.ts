/** Full saved-case replacement, not a retained local contour response. */
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {sha256SemanticFingerprint} from '../../core/identity.js'
import {readCurrentFiniteJointSettings} from './structural-current-finite-joint-settings.js'
export {readCurrentFiniteJointSettings,currentFiniteJointDefaults} from './structural-current-finite-joint-settings.js'
const root=new URL('../../../',import.meta.url)
const same=(a:unknown,b:unknown)=>sha256SemanticFingerprint(a)===sha256SemanticFingerprint(b)
export const currentFiniteJointPaths=[
 'compiler/reference-house/current-design/structural-current-finite-joint.ts',
 'compiler/reference-house/current-design/structural-current-finite-joint-settings.ts',
 'project/str/studies/current_finite_rc_joint.py','project/str/studies/finite_rc_joint_solid.py',
 'project/str/studies/finite_joint_contact_trace.py','project/str/studies/finite_joint_membrane_trace.py','project/str/studies/finite-joint-solid-requirements.txt',
] as const
const sha=(p:string)=>createHash('sha256').update(readFileSync(new URL(p,root))).digest('hex')
const limits={candidateAccepted:false,completeHouseProof:false,resistanceAccepted:false,architecturalEvidenceApplicable:false} as const
export function runCurrentFiniteJointComparison(nativeCase:unknown,value:unknown,source:{planDigest:string;bindingDigest:string;caseDigest:string},caseId:string){
 if(value===undefined)return null
 const controls=readCurrentFiniteJointSettings(value)
 const settings={enabled:controls.enabled,youngMPa:controls.youngMPa,solidPitchMm:controls.solidPitchMm}
 const request={nativeCase,settings,caseId,source}
 const methods=Object.fromEntries(currentFiniteJointPaths.map(p=>[p,sha(p)]))
 const method={id:'str-current-finite-rc-joint/1',sourceSHA256:methods}
 if(controls.execution==='deferred')return{status:'analysis-pending' as const,...limits,source,request,controls,method,diagnostics:[{code:'FINITE_JOINT_PENDING',message:'Exact saved native controls await a full conventional RC/finite SW house comparison; no archived component or response substitutes.'}]}
 try{
  const python=process.env.STR_FINITE_SOLID_PYTHON??'python3'
  const code="import json,sys;sys.path.insert(0,'project/str/studies');from current_finite_rc_joint import run_current_finite_joint;r=json.load(sys.stdin);json.dump(run_current_finite_joint(r['nativeCase'],r['settings'],'.'),sys.stdout,allow_nan=False)"
  const output=JSON.parse(execFileSync(python,['-B','-c',code],{cwd:fileURLToPath(root),input:JSON.stringify(request),encoding:'utf8',timeout:900000,maxBuffer:160*1024*1024,env:{...process.env,OPENBLAS_NUM_THREADS:'1',OMP_NUM_THREADS:'1'}}))
  if(output.schema!=='str-current-finite-rc-joint/1'||!same(output.authoredNativeCase,nativeCase)||!same(output.settings,settings)||Object.keys(limits).filter(k=>k!=='architecturalEvidenceApplicable').some(k=>output[k]!==false))throw Error('Finite joint result lost same saved source, case controls or nonacceptance')
  const heads=output.native?.nativeVertical?.native?.heads,balance=output.native?.nativeVertical?.native?.equilibriumResidualKN_KNm
  if(!Array.isArray(heads)||heads.length!==52||new Set(heads.map((h:any)=>h.id)).size!==52||heads.some((h:any)=>!Array.isArray(h.reactionKN_KNm)||h.reactionKN_KNm.length!==6||h.reactionKN_KNm.some((v:unknown)=>typeof v!=='number'||!Number.isFinite(v)))||!Array.isArray(balance)||balance.length!==6||balance.some((v:unknown)=>typeof v!=='number'||!Number.isFinite(v)||Math.abs(v)>1e-5))throw Error('Full finite-joint house comparison lacks actual52-head six-wrench equilibrium')
  if(!same(methods,Object.fromEntries(currentFiniteJointPaths.map(p=>[p,sha(p)]))))throw Error('Finite joint method changed during execution')
  return{status:'computed-unselected-comparison' as const,...limits,source,request,controls,method,result:output,diagnostics:[{code:'FINITE_JOINT_UNSELECTED',message:'One actual SW finite joint in the full52-head house, with explicit conventional isotropic secant RC laws and separately retained steel chord. Complete signed loading, convergence, reinforcement, material, weather and house adoption remain unqualified.'}]}
 }catch(error){return{status:'unsupported' as const,...limits,source,request,controls,method,diagnostics:[{code:'FINITE_JOINT_UNSUPPORTED',message:error instanceof Error?error.message:String(error)}]}}
}
