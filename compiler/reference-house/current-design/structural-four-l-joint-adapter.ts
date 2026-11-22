/** Node-only bounded observer capability; authored floor inputs stay unchanged. */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'

const root=new URL('../../../',import.meta.url)
export const fourLJointMethodPaths=[
  'compiler/reference-house/current-design/structural-four-l-joint-adapter.ts',
  'project/str/studies/four_l_joint_observer.py',
  'project/str/studies/four_l_joint_recovery.py',
] as const
const proofProducer='project/str/studies/four_l_joint_proof.py'
const proofPath='project/str/studies/four-l-joint-proof.json'
export const fourLJointConsumerPaths=[...fourLJointMethodPaths,proofProducer,proofPath] as const
const record=(v:unknown):v is Record<string,any>=>v!==null&&typeof v==='object'&&!Array.isArray(v)
const same=(a:unknown,b:unknown)=>sha256SemanticFingerprint(a)===sha256SemanticFingerprint(b)
const hash=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex')
const six=(v:unknown):v is number[]=>Array.isArray(v)&&v.length===6&&v.every(n=>typeof n==='number'&&Number.isFinite(n))
const digest=(v:unknown)=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v)
type Methods=Readonly<Record<string,string>>

/** Exact-request unchanged control from the genuinely captured observation.
 * A caller may rename the case; that also changes the complete native digest.
 * Every physical/source/method/runtime observation field remains included.
 * Native result bytes do not independently contain the omitted raw L cuts. */
export function fourLJointObservationFingerprint(observation:unknown) {
  if(!record(observation))throw new Error('Actual source-bound joint observation required')
  const {caseId: _caseId,fullNativeResultSHA256: _fullNativeResultSHA256,...physical}=observation
  return sha256SemanticFingerprint(physical)
}

/** Reuse the sole pure recovery. This subprocess imports no builder or solver;
 * matching a final equilibrium sum alone cannot validate individual tractions. */
export function admitFourLJointDerivedDemand(observation:unknown,derived:unknown,trustedObservationFingerprint:string) {
  if(!digest(trustedObservationFingerprint)||fourLJointObservationFingerprint(observation)!==trustedObservationFingerprint)
    throw new Error('Joint observation differs from the source-bound exact-request captured input')
  const recovered=JSON.parse(execFileSync('python3',['-B','-c',
    "import json,sys;sys.path.insert(0,sys.argv[1]);from four_l_joint_recovery import recover;json.dump(recover(json.load(sys.stdin)),sys.stdout,allow_nan=False)",
    fileURLToPath(new URL('project/str/studies/',root))],{
    input:JSON.stringify(observation),encoding:'utf8',maxBuffer:8*1024*1024,
  })) as unknown
  if(!same(recovered,derived))throw new Error('Joint demand differs from complete pure recovery of actual observed inputs')
}

/** A release witness is derived evidence, never a new authored floor setting.
 * Initially only its exact executed request is supported. Other slab/topology/
 * load edits keep the ordinary floor path until independently admitted. */
export function inspectFourLJointCapability(comparison:unknown,witness:unknown,methods:Methods) {
  const unavailable=(reason:string)=>({status:'unsupported' as const,diagnostic:reason,
    finiteJointCapacityAvailable:false as const})
  if(!record(comparison)||!record(witness))return unavailable('FOUR_L_JOINT/strict-passivity-not-demonstrated')
  if(fourLJointMethodPaths.some(path=>!digest(methods[path])))return unavailable('FOUR_L_JOINT/missing-current-method-identity')
  if(witness.schema!=='str-four-L-joint-passivity-witness/1'
    ||witness.exactFullResultEqualityVerified!==true||witness.exactPhysicalHeadAndCutEqualityVerified!==true
    ||witness.physicalHeadCount!==52||witness.finiteJointCapacityAvailable!==false
    ||!digest(witness.ordinaryFullNativeResultSHA256)
    ||witness.ordinaryFullNativeResultSHA256!==witness.observedFullNativeResultSHA256
    ||!same(witness.runtimeThreads,{OPENBLAS_NUM_THREADS:'1',OMP_NUM_THREADS:'1'})
    ||!same(witness.methodSourceSHA256,methods))return unavailable('FOUR_L_JOINT/missing-or-stale-strict-method-witness')
  if(!same(witness.sourceSHA256,comparison.sourceSHA256)||!same(witness.executedRequest,comparison))
    return unavailable('FOUR_L_JOINT/request-not-yet-admitted')
  return {status:'available' as const,finiteJointCapacityAvailable:false as const,
    scope:'Exact previously admitted request only; finite joint laws, resistance and signed envelopes remain unsupported.'}
}

/** Validate exact native JSON bytes before parsing them; JS reserialization
 * would change Python numeric spelling and cannot supply this checksum join. */
export function admitFourLJointEnvelope(envelope:unknown,comparison:unknown,caseId:string,methods:Methods,trustedObservationFingerprint:string) {
  if(!/^[A-Za-z][A-Za-z0-9._:-]*$/.test(caseId)||fourLJointMethodPaths.some(path=>!digest(methods[path])))
    throw new Error('Explicit stable case ID and complete current joint method identities required')
  if(!record(envelope)||typeof envelope.nativeResultJSON!=='string'||!record(envelope.observation)||!record(envelope.freeBodies))
    throw new Error('Complete observed native envelope required')
  const observation=envelope.observation,derived=envelope.freeBodies
  if(hash(envelope.nativeResultJSON)!==observation.fullNativeResultSHA256)
    throw new Error('Observed joint sidecar does not bind the complete actual native bytes')
  const native=JSON.parse(envelope.nativeResultJSON) as unknown
  if(!record(native)||!record(comparison)||!record(native.sourceSHA256)||!record(comparison.sourceSHA256)
    ||!record(native.nativeVertical)||!record(native.nativeVertical.native)
    ||native.schema!=='str-coupled-floor-section-result/1'||!same(native.request,comparison)
    ||!same(native.sourceSHA256,comparison.sourceSHA256)||Object.keys(native.sourceSHA256).length!==58
    ||native.nativeVertical.native.caseId!==caseId||native.candidateAccepted!==false||native.completeHouseProof!==false
    ||observation.schema!=='str-four-L-joint-observation/1'||observation.caseId!==caseId
    ||!same(observation.sourceSHA256,native.sourceSHA256)||!same(observation.request,comparison)
    ||!same(observation.runtimeThreads,{OPENBLAS_NUM_THREADS:'1',OMP_NUM_THREADS:'1'})
    ||!same(observation.methodSourceSHA256,Object.fromEntries(fourLJointMethodPaths.slice(1).map(p=>[p,methods[p]])))
    ||observation.nonlinearSolvesExecuted!==1||observation.finiteJointCapacityAvailable!==false
    ||observation.candidateAccepted!==false||observation.completeHouseProof!==false
    ||!Array.isArray(observation.heads)||observation.heads.length!==52||new Set(observation.heads.map((h:any)=>h.id)).size!==52
    ||observation.heads.some((h:any)=>!record(h)||!six(h.reactionKN_KNm))
    ||!same(observation.heads,native.nativeVertical.native.heads))
    throw new Error('Observed joint result lost exact current source/request,52heads, runtime or proof limits')
  if(derived.schema!=='str-four-L-joint-free-bodies/1'||derived.finiteJointCapacityAvailable!==false
    ||derived.completeHouseProof!==false||derived.candidateAccepted!==false
    ||!Array.isArray(derived.joints)||derived.joints.length!==4
    ||!same(derived.joints.map((r:any)=>r.id).sort(),['NE','NW','SE','SW'])
    ||!Array.isArray(observation.joints)||observation.joints.length!==4)
    throw new Error('Four actual named rigid-joint free bodies and explicit unsupported capacity required')
  admitFourLJointDerivedDemand(observation,derived,trustedObservationFingerprint)
  let maximum=0
  for(const joint of derived.joints) {
    const observed=observation.joints.find((r:any)=>r.id===joint.id)
    if(!record(observed)||observed.jointBodyGravityInsertedByObserverKN!==0
      ||!same(joint.referenceXYZMm,observed.referenceXYZMm)
      ||joint.rigidJointConstitutiveAssumptionRetained!==true||joint.finiteJointCapacityAvailable!==false
      ||joint.reinforcementAccepted!==false||joint.candidateAccepted!==false
      ||!Array.isArray(joint.memberCuts)||joint.memberCuts.length!==2
      ||!same(joint.memberCuts.map((r:any)=>r.role).sort(),['lower','upper'])
      ||!Array.isArray(joint.components)||!Array.isArray(joint.directAppliedLoads)
      ||!Array.isArray(observed.memberEnds)||observed.memberEnds.length!==2
      ||!Array.isArray(observed.componentReactions)||!Array.isArray(observed.directAppliedLoads))
      throw new Error('Actual incident L cuts or no-duplicate-G joint boundary lost')
    const groups=[
      [joint.memberCuts,observed.memberEnds,'memberId','memberOnJointAtReferenceKN_KNm'],
      [joint.components,observed.componentReactions,'id','componentOnJointAtReferenceKN_KNm'],
      [joint.directAppliedLoads,observed.directAppliedLoads,'id','loadAtReferenceKN_KNm'],
    ] as const
    const total=[0,0,0,0,0,0]
    for(const [recovered,original,key,wrench] of groups) {
      if(recovered.length!==original.length)throw new Error('Observed physical load/component omitted in joint recovery')
      for(const row of recovered) {
        const input=original.find((r:any)=>r[key]===row[key])
        if(!record(input)||!Object.entries(input).every(([k,v])=>same(row[k],v))||!six(row[wrench]))
          throw new Error('Recovered joint component differs from its actual observed input')
        row[wrench].forEach((v:number,i:number)=>{total[i]!+=v})
      }
    }
    if(!six(joint.freeBodyResidualKN_KNm)||total.some((v,i)=>Math.abs(v-joint.freeBodyResidualKN_KNm[i])>1e-10)
      ||Math.max(...total.map(Math.abs))>1e-5)
      throw new Error('Actual six-component joint free body fails unchanged closure criterion')
    maximum=Math.max(maximum,...total.map(Math.abs))
  }
  if(typeof derived.maximumAbsoluteResidualKN_KNm!=='number'||Math.abs(derived.maximumAbsoluteResidualKN_KNm-maximum)>1e-10)
    throw new Error('Stored joint closure summary differs from actual components')
  return {nativeResult:native,jointDemands:{status:'computed-rigid-joint-demand' as const,
    ...derived,joints:derived.joints,finiteJointCapacityAvailable:false as const,
    completeHouseProof:false as const,candidateAccepted:false as const,
    methodSourceSHA256:methods,nativeResultSHA256:observation.fullNativeResultSHA256,
    patchOwnGAlreadyIncludedInPlateContribution:true as const,
    diagnostics:['FOUR_L_JOINT/finite-joint-laws-and-resistance-unqualified','FOUR_L_JOINT/complete-signed-demand-envelope-unavailable']}}
}

/** Read the verified release capability without executing a native builder. */
export function readFourLJointExecution(comparison:unknown) {
  const methods=Object.fromEntries(fourLJointMethodPaths.map(path=>[path,hash(readFileSync(new URL(path,root)))]))
  const proof=JSON.parse(readFileSync(new URL(proofPath,root),'utf8')) as unknown
  if(!record(proof)||proof.schema!=='str-four-L-actual-joint-demand-proof/1'
    ||!same(proof.processingSourceSHA256,{...methods,[proofProducer]:hash(readFileSync(new URL(proofProducer,root)))}))
    return {status:'unsupported' as const,diagnostic:'FOUR_L_JOINT/missing-or-stale-strict-method-witness',witness:undefined,observedInputFingerprint:undefined}
  if(!record(proof.exactObservedInput)||!record(proof.exactObservedInput.observation)
    ||!same(proof.exactObservedInput.observation.sourceSHA256,proof.witness?.sourceSHA256)
    ||!same(proof.exactObservedInput.observation.request,proof.witness?.executedRequest)
    ||!same(proof.exactObservedInput.observation.methodSourceSHA256,Object.fromEntries(fourLJointMethodPaths.slice(1).map(p=>[p,methods[p]])))
    ||!same(proof.exactObservedInput.observation.runtimeThreads,proof.witness?.runtimeThreads))
    return {status:'unsupported' as const,diagnostic:'FOUR_L_JOINT/missing-or-stale-observed-input',witness:undefined,observedInputFingerprint:undefined}
  const capability=inspectFourLJointCapability(comparison,proof.witness,methods)
  if(capability.status!=='available')return {...capability,witness:undefined,observedInputFingerprint:undefined}
  return {...capability,witness:proof.witness,
    observedInputFingerprint:fourLJointObservationFingerprint(proof.exactObservedInput.observation)}
}

/** Exactly one chosen native execution. An admitted observer failure is an
 * error, never an excuse to execute and silently substitute an ordinary case. */
export function dispatchFourLJointNative<T>(capability:{status:'available'|'unsupported';diagnostic?:string},
  ordinary:()=>T,observed:()=>{nativeResult:T;jointDemands:{diagnostics:string[];[key:string]:unknown}}) {
  if(capability.status==='available')return observed()
  return {nativeResult:ordinary(),jointDemands:{status:'unsupported' as const,
    diagnostics:[capability.diagnostic??'FOUR_L_JOINT/request-not-yet-admitted'],
    finiteJointCapacityAvailable:false as const,completeHouseProof:false as const,candidateAccepted:false as const}}
}

/** Same normal stage input; the derived witness is not an authored toggle. */
export function runFloorNativeWithFourLJointCapability(comparison:unknown,caseId:string,ordinary:()=>unknown) {
  const capability=readFourLJointExecution(comparison)
  return dispatchFourLJointNative(capability,ordinary,()=>runObservedFourLJointCase(comparison,caseId,capability.witness,capability.observedInputFingerprint))
}

export function runObservedFourLJointCase(comparison:unknown,caseId:string,witness:unknown,trustedObservationFingerprint?:string) {
  const methods=Object.fromEntries(fourLJointMethodPaths.map(path=>[path,hash(readFileSync(new URL(path,root)))]))
  const capability=inspectFourLJointCapability(comparison,witness,methods)
  if(capability.status!=='available')throw new Error(capability.diagnostic)
  if(!digest(trustedObservationFingerprint))throw new Error('Source-bound exact-request observed-input fingerprint required')
  const envelope=JSON.parse(execFileSync('python3',['-B',fileURLToPath(new URL(fourLJointMethodPaths[1],root)),'--return-native'],{
    input:JSON.stringify({case:comparison,caseId}),encoding:'utf8',maxBuffer:128*1024*1024,
    env:{...process.env,OPENBLAS_NUM_THREADS:'1',OMP_NUM_THREADS:'1'},
  })) as unknown
  if(fourLJointMethodPaths.some(path=>hash(readFileSync(new URL(path,root)))!==methods[path]))
    throw new Error('Joint observer/consumer source changed during native execution')
  const admitted=admitFourLJointEnvelope(envelope,comparison,caseId,methods,trustedObservationFingerprint!)
  if(fourLJointMethodPaths.some(path=>hash(readFileSync(new URL(path,root)))!==methods[path]))
    throw new Error('Joint observer/consumer source changed during pure demand admission')
  return admitted
}
