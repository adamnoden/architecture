/** Experimental replacement consumes this exact saved native request; no archive fallback. */
import {execFileSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {sha256SemanticFingerprint} from '../../core/identity.js'
import {readLowerMasonrySettings} from './structural-lower-masonry-settings.js'
const root=new URL('../../../',import.meta.url)
export const lowerMasonryPaths=[
 'compiler/reference-house/current-design/structural-lower-masonry.ts','compiler/reference-house/current-design/structural-lower-masonry-settings.ts',
 'project/str/studies/wet_masonry_arch_bed.py','project/str/studies/wet_masonry_arch_rise.py',
 'project/str/studies/wet_masonry_arch_released.py','project/str/studies/wet_masonry_arch_native.py',
 'project/str/studies/wet_masonry_arch_comparison.py','project/str/studies/wet-masonry-arch-comparison-inputs.json',
] as const
const same=(a:unknown,b:unknown)=>sha256SemanticFingerprint(a)===sha256SemanticFingerprint(b)
const sha=(p:string)=>createHash('sha256').update(readFileSync(new URL(p,root))).digest('hex')
const limits={candidateAccepted:false,wholeHouseAccepted:false,actualMasonryResistanceAccepted:false,contactConverged:false,
 keyMaterialAndResistanceAccepted:false,completeSignedLoadEnvelope:false,architecturalEvidenceApplicable:false} as const
export function runLowerMasonryComparison(comparison:Record<string,any>,value:unknown,identity:{planDigest:string;bindingDigest:string;caseDigest:string},caseId:string){
 if(value===undefined)return null
 const controls=readLowerMasonrySettings(value),source={...identity,nativeRequestDigest:sha256SemanticFingerprint(comparison)}
 const unavailable=(code:string,message:string)=>({status:'unsupported' as const,...limits,controls,source,diagnostics:[{code,message}],drawings:{} as Record<string,string>})
 if(comparison.thicknessMm!==200||!comparison.wetSupport)return unavailable('LOWER_MASONRY_RC200_SUPPORT_REQUIRED','The lower replacement has only explicit source RC200/wet-support geometry; changed thickness or missing source support is unsupported.')
 try{
  for(const [p,v] of Object.entries(comparison.sourceSHA256??{}))if(!/^project\/[A-Za-z0-9/_.-]+$/.test(p)||p.split('/').includes('..')||sha(p)!==v)return unavailable('LOWER_MASONRY_SOURCE_STALE','Current native source differs: '+p)
  if(Object.keys(comparison.sourceSHA256??{}).length!==58)return unavailable('LOWER_MASONRY_SOURCE_MISSING','The complete actual58 native-source inventory is required.')
  const methods=Object.fromEntries(lowerMasonryPaths.map(p=>[p,sha(p)])),archChoices=JSON.parse(readFileSync(new URL('project/str/studies/wet-masonry-arch-comparison-inputs.json',root),'utf8'))
  const request={schema:'str-wet-masonry-arch-bed-request/1',caseId:caseId+':lower-masonry',archChoices,archSegments:16,jointHypothesis:'spring-and-crown-independent-global-rx',
   masonryElasticModulusMPa:controls.masonryElasticModulusMPa,bearingCellsY:controls.bearingCellsY,
   floorNormalComplianceMmPerMPa:controls.floorNormalComplianceMmPerMPa,nativeCase:comparison,archRiseMm:controls.archRiseMm,normalBed:controls.normalBed}
  if(controls.execution==='deferred')return{status:'analysis-pending' as const,...limits,controls,source,request,method:{id:'str-current-lower-masonry/1',sourceSHA256:methods},drawings:{} as Record<string,string>,diagnostics:[{code:'LOWER_MASONRY_ANALYSIS_PENDING',message:'This exact saved lower-replacement request is pending; no retained response or ordinary floor is substituted.'}]}
  const code="import json,sys;sys.path.insert(0,'project/str/studies');from wet_masonry_arch_bed import run;json.dump(run(json.load(sys.stdin)),sys.stdout,allow_nan=False)"
  const output=JSON.parse(execFileSync('python3',['-B','-c',code],{cwd:fileURLToPath(root),input:JSON.stringify(request),encoding:'utf8',stdio:'pipe',maxBuffer:128*1024*1024,timeout:600000,env:{...process.env,OPENBLAS_NUM_THREADS:'1',OMP_NUM_THREADS:'1'}}))
  if(output.schema!=='str-experimental-wet-masonry-bed-comparison/1'||!same(output.experimentalRequest,request)||!same(output.sourceSHA256,comparison.sourceSHA256)
   ||output.candidateAccepted!==false||output.completeHouseProof!==false||!output.experimentalArch||output.experimentalArch.candidateAccepted!==false
   ||!Array.isArray(output.nativeVertical?.native?.heads)||output.nativeVertical.native.heads.length!==52
   ||new Set(output.nativeVertical.native.heads.map((h:any)=>h.id)).size!==52||output.nativeVertical.native.heads.some((h:any)=>typeof h.id!=='string'||!Array.isArray(h.reactionKN_KNm)||h.reactionKN_KNm.length!==6||h.reactionKN_KNm.some((v:number)=>!Number.isFinite(v)))
   ||!Array.isArray(output.nativeVertical.native.equilibriumResidualKN_KNm)||output.nativeVertical.native.equilibriumResidualKN_KNm.length!==6||output.nativeVertical.native.equilibriumResidualKN_KNm.some((n:number)=>!Number.isFinite(n)||Math.abs(n)>1e-5)
   ||output.floorSection?.finishStairServiceEvidenceApplicable!==false)throw Error('Lower candidate lost exact request,52-head balance or explicit nonacceptance boundaries')
  if(!same(methods,Object.fromEntries(lowerMasonryPaths.map(p=>[p,sha(p)]))))throw Error('Lower comparison method changed during execution')
  for(const [p,v] of Object.entries(comparison.sourceSHA256))if(sha(p)!==v)throw Error('Native source changed during lower comparison')
  return{status:'computed-unselected-candidate' as const,...limits,controls,source,request,method:{id:'str-current-lower-masonry/1',sourceSHA256:methods},
   native:output.nativeVertical.native,arch:output.experimentalArch.arch,mass:output.mass,plateBending:output.plateBending,
   candidateFloorSection:output.floorSection,drawings:{} as Record<string,string>,diagnostics:[{code:'LOWER_MASONRY_CANDIDATE_UNQUALIFIED',message:'Separately re-solved lower replacement on the exact saved native request. Normal bed, ideal key, masonry/tie resistance, reinforcement, complete signed demands and architectural interfaces are unqualified; ordinary floor/beam outputs are separate controls.'}]}
 }catch(error){return unavailable('LOWER_MASONRY_METHOD_UNAVAILABLE',error instanceof Error?error.message:String(error))}
}
