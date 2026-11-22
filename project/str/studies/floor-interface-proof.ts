/** Existing native captures -> named floor/L interface actions. No native solve. */
import { createHash } from 'node:crypto'
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../../compiler/core/identity.js'
import { recoverNamedFloorCornerInterfaces } from '../../../compiler/reference-house/current-design/structural-floor-interfaces.js'
import { floorInterfaceConsumerPaths, readFloorCornerInterfaceManifest } from '../../../compiler/reference-house/current-design/structural-floor-interface-adapter.js'

const root=new URL('../../../',import.meta.url),directory=new URL('./',import.meta.url)
const path=new URL('floor-interface-proof.json',directory)
const cutsPath='project/str/studies/floor-section-cuts-proof.json'
const cuts=JSON.parse(readFileSync(new URL(cutsPath,root),'utf8'))
const sha=(bytes:string|Buffer)=>createHash('sha256').update(bytes).digest('hex')
const equal=(a:unknown,b:unknown)=>sha256SemanticFingerprint(a)===sha256SemanticFingerprint(b)
const sources=()=>Object.fromEntries([cutsPath,'project/str/studies/floor-interface-proof.ts',...floorInterfaceConsumerPaths].map(p=>[p,sha(readFileSync(new URL(p,root)))]))
if(cuts.schema!=='str-fixed-floor-cut-comparison/2'||!Array.isArray(cuts.controls))throw new Error('Current complete physical-cut capture receipt required')
const names=cuts.controls.map((c:any)=>c.caseId) as string[]
const expectedPairs=[['wet-floor-mesh-700','wet-floor-mesh-500'],['wet-floor-mesh-500','wet-floor-mesh-250'],
  ['wet-floor-mesh-500','wet-floor-mixed-m250-v500'],['wet-floor-mixed-m250-v500','wet-floor-mesh-250'],
  ['wet-floor-mesh-500','wet-floor-mixed-m500-v250'],['wet-floor-mixed-m500-v250','wet-floor-mesh-250']]

function comparisons(rows:any[]) {
  return expectedPairs.map(([coarse,fine])=>{
    const a=rows.find(r=>r.caseId===coarse),b=rows.find(r=>r.caseId===fine)
    if(!a||!b)throw new Error('Missing actual mesh interface case')
    const old=new Map(a.assessment.corners.map((r:any)=>[r.id,r]))
    if(old.size!==b.assessment.corners.length)throw new Error('Different corner identities in mesh comparison')
    return {coarseCaseId:coarse,fineCaseId:fine,corners:b.assessment.corners.map((r:any)=>{
      const previous=old.get(r.id) as any
      if(!previous||!equal(r.originXYZMm,previous.originXYZMm))throw new Error('Changed actual collector origin requires explicit wrench transport before comparison')
      const delta=r.floorForceOnCollectorKN_KNm.map((v:number,i:number)=>v-previous.floorForceOnCollectorKN_KNm[i])
      return {id:r.id,originXYZMm:r.originXYZMm,coarseFloorForceOnCollectorKN_KNm:previous.floorForceOnCollectorKN_KNm,
        fineFloorForceOnCollectorKN_KNm:r.floorForceOnCollectorKN_KNm,signedDifferenceKN_KNm:delta,
        maximumAbsoluteForceDifferenceKN:Math.max(...delta.slice(0,3).map(Math.abs)),maximumAbsoluteMomentDifferenceKNm:Math.max(...delta.slice(3).map(Math.abs))}
    }),stabilityAcceptanceClaimed:false}
  })
}

function check(proof:any) {
  if(proof.schema!=='str-named-floor-interface-proof/1'||!equal(proof.processingSourceSHA256,sources())||!Array.isArray(proof.controls)
    ||!equal(proof.controls.map((r:any)=>r.caseId),names)||proof.nonlinearSolvesExecuted!==0||proof.wholeJointDemandAvailable!==false)throw new Error('Stale or unsupported named floor interface proof')
  proof.controls.forEach((r:any,i:number)=>{
    const c=cuts.controls[i]
    if(r.fullNativeResponseSHA256!==c.fullResultSHA256||!equal(r.exactNativeInterfaceInput.request,c.executedRequest)
      ||!equal(r.exactNativeInterfaceInput.sourceSHA256,c.executedRequest.sourceSHA256)
      ||r.exactNativeInterfaceInput.nativeVertical.native.caseId!==r.caseId
      ||!equal(r.assessment,recoverNamedFloorCornerInterfaces(r.exactNativeInterfaceInput,r.exactNamedManifest)))throw new Error('Named interfaces lost exact same-case native/capture/replay identity')
    for(const [p,h] of Object.entries(r.exactNativeInterfaceInput.sourceSHA256))if(sha(readFileSync(new URL(p,root)))!==h)throw new Error('Stale native interface source: '+p)
    for(const [p,h] of Object.entries(r.exactNamedManifest.methodSourceSHA256))if(sha(readFileSync(new URL(p,root)))!==h)throw new Error('Stale metadata reconstruction source: '+p)
  })
  if(!equal(proof.meshComparisons,comparisons(proof.controls)))throw new Error('Stale or mispaired actual six-action comparison')
  const a=proof.controls.find((r:any)=>r.caseId==='current200'),b=proof.controls.find((r:any)=>r.caseId==='restored200')
  if(!a||!b)throw new Error('Missing unchanged reversal control')
  const max=Math.max(...a.assessment.corners.flatMap((c:any)=>{
    const q=b.assessment.corners.find((d:any)=>d.id===c.id)
    if(!q||!equal(c.originXYZMm,q.originXYZMm))throw new Error('Reversal corner identity changed')
    return c.floorForceOnCollectorKN_KNm.map((v:number,i:number)=>Math.abs(v-q.floorForceOnCollectorKN_KNm[i]))
  }))
  if(max>1e-6||proof.maximumReversalSixComponentDifferenceKN_KNm!==max)throw new Error('Actual unchanged floor interface reversal failed')
}

async function fileSha(path:string) {
  const h=createHash('sha256');for await(const bytes of createReadStream(path))h.update(bytes);return h.digest('hex')
}
function fullPaths(path:string):string[] {
  return readdirSync(path,{withFileTypes:true}).flatMap(e=>e.isDirectory()?fullPaths(join(path,e.name)):e.name==='result.full.json'||e.name.endsWith('.full.json')?[join(path,e.name)]:[])
}

if(process.argv[2]==='--check') {check(JSON.parse(readFileSync(path,'utf8')));process.stdout.write('Named floor/L interface proof checked against current captures/source and retained exact inputs\n')}
else if(process.argv[2]==='--write') {
  const files=[...fullPaths('/tmp/ovid-seated-wet-controls'),...fullPaths('/tmp/ovid-floor-mesh')],byHash=new Map<string,string>()
  for(const path of files)byHash.set(await fileSha(path),path)
  const controls=[]
  const cache='/tmp/ovid-floor-interface-manifests';mkdirSync(cache,{recursive:true})
  for(const c of cuts.controls) {
    const p=byHash.get(c.fullResultSHA256);if(!p)throw new Error('Missing source/checksum-bound full native capture: '+c.caseId)
    const native=JSON.parse(readFileSync(p,'utf8'))
    if(!equal(native.request,c.executedRequest)||native.nativeVertical.native.caseId!==c.caseId)throw new Error('Full native capture request/case differs from current cut control')
    const cacheKey=sha256SemanticFingerprint({request:native.request,caseId:c.caseId,metadataMethodSHA256:sha(readFileSync(new URL('project/str/studies/floor_interface_manifest.py',root)))})
    const cached=join(cache,cacheKey+'.json')
    const manifest=(existsSync(cached)?JSON.parse(readFileSync(cached,'utf8')):readFloorCornerInterfaceManifest(native).manifest) as any
    // Reuse only an actually reconstructed manifest for the identical source/request/method/case.
    recoverNamedFloorCornerInterfaces(native,manifest)
    if(!existsSync(cached))writeFileSync(cached,JSON.stringify(manifest))
    const wanted=new Set(manifest.corners.flatMap((r:any)=>r.physicalPlatePointTraces.map((p:any)=>JSON.stringify(p.xyMm))))
    const ids=new Set(manifest.corners.map((r:any)=>r.id))
    const exactNativeInterfaceInput={schema:native.schema,sourceSHA256:native.sourceSHA256,request:native.request,nativeVertical:{
      native:{caseId:native.nativeVertical.native.caseId,floorInterfacePorts:native.nativeVertical.native.floorInterfacePorts.filter((r:any)=>ids.has(r.id))},
      plate:{physicalRecovery:{points:native.nativeVertical.plate.physicalRecovery.points.filter((r:any)=>wanted.has(JSON.stringify(r.xyMm))),
        portGeneralizedReactions:native.nativeVertical.plate.physicalRecovery.portGeneralizedReactions}}}}
    const assessment=recoverNamedFloorCornerInterfaces(exactNativeInterfaceInput,manifest)
    controls.push({caseId:c.caseId,fullNativeResponseSHA256:c.fullResultSHA256,exactNativeInterfaceInput,exactNamedManifest:manifest,assessment})
    process.stdout.write(c.caseId+' named interfaces recovered; no nonlinear solve\n')
  }
  const a=controls.find(r=>r.caseId==='current200')!,b=controls.find(r=>r.caseId==='restored200')!
  const max=Math.max(...a.assessment.corners.flatMap(c=>c.floorForceOnCollectorKN_KNm.map((v,i)=>Math.abs(v-b.assessment.corners.find(q=>q.id===c.id)!.floorForceOnCollectorKN_KNm[i]!))))
  const proof={schema:'str-named-floor-interface-proof/1',processingSourceSHA256:sources(),controls,meshComparisons:comparisons(controls),
    maximumReversalSixComponentDifferenceKN_KNm:max,nonlinearSolvesExecuted:0,wholeJointDemandAvailable:false,
    scope:'Each actual full native response is checksum/source/request-verified before exact builder metadata reconstruction. Retained cropped inputs reproduce named simultaneous six-component floor-to-collector actions, not full native bytes. No whole-joint free body, design strip, resistance or convergence acceptance is claimed.'}
  check(proof);writeFileSync(path,JSON.stringify(proof,null,2)+'\n')
  process.stdout.write(JSON.stringify({controls:controls.length,meshComparisons:proof.meshComparisons,reversal:max})+'\n')
}
else throw new Error('Use --write or --check')
