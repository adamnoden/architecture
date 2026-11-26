import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { StudyStructuralContext } from './study-structural-context.js'
import type { StudyOrdinaryHandlingPlan } from './study-ordinary-handling.js'
import type { compileStudyFurnitureMotion } from './study-furniture-motion.js'
import type { compileStudyInstalledInlet } from './study-installed-inlet.js'

type Box=readonly[number,number,number,number]
type Part={readonly id:string;readonly facePieces:readonly Box[];readonly grip:{readonly centres:readonly (readonly[number,number])[]}|null}
type Ordinary=NonNullable<NonNullable<ReturnType<typeof compileStudyFurnitureMotion>['firstRest']>['ordinaryHandling']>
const root=new URL('../../../../',import.meta.url)
const paths=['project/ias/studies/study-structural-renewal.py','project/ias/studies/study-floor-handling.py','project/ias/studies/study-furniture-motion.py',
  'project/bcr/studies/bay-interface-study.py','project/str/studies/finite_joint_geometry.py']as const

type Result={readonly schema:'ias-study-structural-renewal-result/1';readonly contextDigest:string;readonly physicalAcceptance:false;
 readonly preparation:Readonly<Record<string,unknown>>;readonly furniture:Readonly<Record<string,unknown>>;readonly ordinaryHandling:Ordinary|null;
 readonly sourceSHA256?:Readonly<Record<string,string>>}

export function compileStudyStructuralRenewal(context:StudyStructuralContext,parts:readonly Part[],emitterPlinth:{readonly state:string;readonly box?:Box},
 ordinaryHandling:StudyOrdinaryHandlingPlan,installedServices:ReturnType<typeof compileStudyInstalledInlet>){
  const ids=parts.map(p=>p.id),protocolIds=ordinaryHandling.protocols.map(p=>p.partId)
  if(emitterPlinth.state!=='geometry-screen-only'||!emitterPlinth.box||protocolIds.length!==ids.length||new Set(protocolIds).size!==ids.length||ids.some(id=>!protocolIds.includes(id))){
    return{schema:'ias-study-structural-renewal-result/1' as const,contextDigest:context.digest,physicalAcceptance:false as const,
      status:'source-withheld' as const,ordinaryHandling:{schema:'ias-study-ordinary-handling-result/1' as const,state:'source-withheld' as const,physicalAcceptance:false as const,
        partCount:parts.length,witnessCount:0,parts:[],diagnostics:[{code:'IAS_STRUCTURAL_RENEWAL_REQUIRES_CURRENT_PART_PLAN',objectIds:ids}]}}
  }
  const source=Object.fromEntries(paths.map(path=>[path,createHash('sha256').update(readFileSync(new URL(path,root))).digest('hex')]))
  const result:Result=JSON.parse(execFileSync('python3',['-B',fileURLToPath(new URL(paths[0],root)),fileURLToPath(root)],{
    input:JSON.stringify({schema:'ias-study-structural-renewal-case/1',context,parts,emitterPlinth,ordinaryHandling,installedServices}),
    encoding:'utf8',maxBuffer:16*1024*1024,timeout:60000,
  }))
  if(result.schema!=='ias-study-structural-renewal-result/1'||result.contextDigest!==context.digest||result.physicalAcceptance!==false
    ||result.sourceSHA256===undefined||paths.some(path=>result.sourceSHA256?.[path]!==source[path]))throw new Error('STUDY_STRUCTURAL_RENEWAL_STALE_METHOD')
  const phasesClear=(phase:Readonly<Record<string,unknown>>)=>Array.isArray(phase.conflictingPhaseIds)&&phase.conflictingPhaseIds.length===0
  if(!phasesClear(result.preparation)||!phasesClear(result.furniture)||!result.ordinaryHandling){
    return{...result,status:'computed-geometry-conflicts' as const,ordinaryHandling:{schema:'ias-study-ordinary-handling-result/1' as const,state:'source-withheld' as const,physicalAcceptance:false as const,
      partCount:parts.length,witnessCount:0,parts:[],diagnostics:[{code:'IAS_STRUCTURAL_FURNITURE_PREPARATION_CONFLICT',objectIds:ids}]},source,loadedHandlingQualified:false as const,ownerAcceptance:false as const}
  }
  if(result.preparation.physicalAcceptance!==false||result.furniture.physicalAcceptance!==false||result.furniture.comparisonClearanceMm!==25
    ||result.preparation.socketIsolatedAndUnplugged!==true||result.preparation.allFloorHandlingBeginsAfterPreparation!==true
    ||result.preparation.restorationUsesReverseSweeps!==true||result.furniture.reverseUsesSameSweeps!==true
    ||result.ordinaryHandling.physicalAcceptance!==false||result.ordinaryHandling.partCount!==parts.length
    ||result.ordinaryHandling.parts.length!==parts.length||new Set(result.ordinaryHandling.parts.map(p=>p.partId)).size!==parts.length
    ||result.ordinaryHandling.parts.some(p=>!ids.includes(p.partId))
    ||result.ordinaryHandling.witnessCount!==result.ordinaryHandling.parts.filter(p=>p.state==='joined-geometry-witness').length){
    throw new Error('STUDY_STRUCTURAL_RENEWAL_RESULT_LOST_ACTUAL_PARTS_OR_PROOF_LIMITS')
  }
  return{...result,status:result.ordinaryHandling.witnessCount===parts.length?'computed-geometry-witnesses' as const:'computed-geometry-conflicts' as const,
    source,loadedHandlingQualified:false as const,ownerAcceptance:false as const}
}
