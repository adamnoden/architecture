import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { admitFourLJointDerivedDemand, admitFourLJointEnvelope, dispatchFourLJointNative, fourLJointMethodPaths, fourLJointObservationFingerprint, inspectFourLJointCapability, readFourLJointExecution, runObservedFourLJointCase } from './current-design/structural-four-l-joint-adapter.js'

const hash=(s:string)=>createHash('sha256').update(s).digest('hex')
function fixture() {
  const sourceSHA256=Object.fromEntries(Array.from({length:58},(_,i)=>[`project/native-${i}.py`,hash('source'+i)]))
  const comparison={sourceSHA256,thicknessMm:200,wetSupport:{bearingQuadratureOrder:8}}
  const methods=Object.fromEntries(fourLJointMethodPaths.map(p=>[p,hash(p)]))
  const heads=Array.from({length:52},(_,i)=>({id:'P'+i,reactionKN_KNm:[0,0,0,0,0,0]}))
  const originals=['SW','SE','NW','NE'].map(id=>({id,referenceXYZMm:[0,0,3170],jointBodyGravityInsertedByObserverKN:0,
    memberEnds:[{memberId:id+'/lower',role:'lower',masterXYZMm:[0,0,3170],physicalCutXYZMm:[0,0,3170],
      rawMasterWrenchKN_KNmm:[0,0,-22,0,0,0],equivalentBodyLoadMasterKN_KNmm:[0,0,-2,0,0,0]},
      {memberId:id+'/upper',role:'upper',masterXYZMm:[0,0,3170],physicalCutXYZMm:[0,0,3370],
        rawMasterWrenchKN_KNmm:[0,0,2,0,0,0],equivalentBodyLoadMasterKN_KNmm:[0,0,-1,0,0,0]}],
    componentReactions:[{id:'plate',originXYZMm:[0,0,3170],forceOnComponentKN_KNm:[0,0,10,0,0,0]}],
    directAppliedLoads:[{id:'direct',originXYZMm:[0,0,3170],wrenchKN_KNm:[0,0,-7,0,0,0]}]}))
  const joints=originals.map(r=>({id:r.id,referenceXYZMm:r.referenceXYZMm,
    rigidJointConstitutiveAssumptionRetained:true,finiteJointCapacityAvailable:false,reinforcementAccepted:false,candidateAccepted:false,
    memberCuts:r.memberEnds.map((m,i)=>({...m,rawMasterWrenchKN_KNmm:[...m.rawMasterWrenchKN_KNmm],
      forceOnMemberAtPhysicalCutKN_KNm:[0,0,i===0?-20:3,0,0,0],memberOnJointAtReferenceKN_KNm:[0,0,i===0?20:-3,0,0,0]})),
    components:r.componentReactions.map(c=>({...c,componentOnJointAtReferenceKN_KNm:[0,0,-10,0,0,0]})),
    directAppliedLoads:r.directAppliedLoads.map(d=>({...d,loadAtReferenceKN_KNm:[0,0,-7,0,0,0]})),
    freeBodyResidualKN_KNm:[0,0,0,0,0,0],maximumAbsoluteResidualKN_KNm:0}))
  const native={schema:'str-coupled-floor-section-result/1',sourceSHA256,request:comparison,candidateAccepted:false,completeHouseProof:false,
    numericControl:1,nativeVertical:{native:{caseId:'actual-case',heads}}}
  // A real Python JSON spelling that JS parse/stringify does not retain.
  const nativeResultJSON=JSON.stringify(native).replace('"numericControl":1,','"numericControl":1.0,')
  const observation={schema:'str-four-L-joint-observation/1',sourceSHA256,request:comparison,caseId:'actual-case',
    fullNativeResultSHA256:hash(nativeResultJSON),runtimeThreads:{OPENBLAS_NUM_THREADS:'1',OMP_NUM_THREADS:'1'},
    methodSourceSHA256:Object.fromEntries(fourLJointMethodPaths.slice(1).map(p=>[p,methods[p]])),
    nonlinearSolvesExecuted:1,finiteJointCapacityAvailable:false,candidateAccepted:false,completeHouseProof:false,heads,joints:originals}
  const freeBodies={schema:'str-four-L-joint-free-bodies/1',joints,maximumAbsoluteResidualKN_KNm:0,
    finiteJointCapacityAvailable:false,completeHouseProof:false,candidateAccepted:false}
  const envelope={nativeResultJSON,observation,freeBodies}
  const witness={schema:'str-four-L-joint-passivity-witness/1',sourceSHA256,executedRequest:comparison,
    methodSourceSHA256:methods,runtimeThreads:{OPENBLAS_NUM_THREADS:'1',OMP_NUM_THREADS:'1'},
    ordinaryFullNativeResultSHA256:hash(nativeResultJSON),observedFullNativeResultSHA256:hash(nativeResultJSON),
    exactFullResultEqualityVerified:true,exactPhysicalHeadAndCutEqualityVerified:true,physicalHeadCount:52,finiteJointCapacityAvailable:false}
  return {comparison,methods,envelope,witness,trustedObservationFingerprint:fourLJointObservationFingerprint(observation)}
}

test('prepared optional capability preserves exact native bytes and all joint components without starting a house builder',()=>{
  const f=fixture(),before=JSON.stringify(f)
  assert.equal(inspectFourLJointCapability(f.comparison,f.witness,f.methods).status,'available')
  const result=admitFourLJointEnvelope(f.envelope,f.comparison,'actual-case',f.methods,f.trustedObservationFingerprint)
  assert.equal(result.nativeResult.numericControl,1)
  assert.notEqual(hash(JSON.stringify(JSON.parse(f.envelope.nativeResultJSON))),f.envelope.observation.fullNativeResultSHA256)
  assert.equal(result.jointDemands.joints.length,4)
  assert.equal(result.jointDemands.patchOwnGAlreadyIncludedInPlateContribution,true)
  assert.equal(result.jointDemands.finiteJointCapacityAvailable,false)
  assert.equal(JSON.stringify(f),before)
})

test('missing passivity and untested nonwet/default200/250 requests retain explicit unavailable capability',()=>{
  const f=fixture()
  assert.equal(inspectFourLJointCapability(f.comparison,undefined,f.methods).status,'unsupported')
  for(const change of [{wetSupport:null},{thicknessMm:250},{wetSupport:{bearingQuadratureOrder:4}}])
    assert.equal(inspectFourLJointCapability({...f.comparison,...change},f.witness,f.methods).status,'unsupported')
  assert.equal(inspectFourLJointCapability(f.comparison,{...f.witness,exactFullResultEqualityVerified:false},f.methods).status,'unsupported')
  assert.equal(inspectFourLJointCapability(f.comparison,{...f.witness,observedFullNativeResultSHA256:hash('changed')},f.methods).status,'unsupported')
  assert.equal(inspectFourLJointCapability(f.comparison,f.witness,{...f.methods,[fourLJointMethodPaths[1]]:hash('changed')} ).status,'unsupported')
})

test('full native edits, stale replies, runtime drift, invented acceptance and missing or modified physical actions reject',()=>{
  const mutations:((f:ReturnType<typeof fixture>)=>void)[]=[
    f=>{f.envelope.nativeResultJSON+=' '},
    f=>{f.envelope.observation.runtimeThreads.OPENBLAS_NUM_THREADS='2'},
    f=>{f.envelope.observation.caseId='stale-case'},
    f=>{f.envelope.observation.methodSourceSHA256[fourLJointMethodPaths[1]]=hash('changed')},
    f=>{f.envelope.observation.heads[0]!.reactionKN_KNm[2]=1},
    f=>{f.envelope.freeBodies.joints[0]!.candidateAccepted=true},
    f=>{f.envelope.freeBodies.joints[0]!.memberCuts[0]!.memberOnJointAtReferenceKN_KNm[2]!+=1},
    f=>{f.envelope.freeBodies.joints[0]!.components=[]},
    f=>{f.envelope.observation.joints[0]!.jointBodyGravityInsertedByObserverKN=6.204},
    f=>{f.envelope.freeBodies.joints[0]!.memberCuts[0]!.rawMasterWrenchKN_KNmm[2]!-=1},
  ]
  for(const mutation of mutations) {
    const f=fixture();mutation(f)
    assert.throws(()=>admitFourLJointEnvelope(f.envelope,f.comparison,'actual-case',f.methods,f.trustedObservationFingerprint))
  }
})

test('available and unsupported capabilities each execute exactly one native route; errors never execute a fallback solve',()=>{
  const native={unchanged:'native-result'},counts={ordinary:0,observed:0}
  const ordinary=()=>{counts.ordinary++;return native},observed=()=>{counts.observed++;return {nativeResult:native,jointDemands:{diagnostics:[]}}}
  const unavailable=dispatchFourLJointNative({status:'unsupported',diagnostic:'FOUR_L_JOINT/request-not-yet-admitted'},ordinary,observed)
  assert.equal(unavailable.nativeResult,native)
  assert.deepEqual(counts,{ordinary:1,observed:0})
  assert.deepEqual(unavailable.jointDemands.diagnostics,['FOUR_L_JOINT/request-not-yet-admitted'])
  assert.equal(dispatchFourLJointNative({status:'available'},ordinary,observed).nativeResult,native)
  assert.deepEqual(counts,{ordinary:1,observed:1})
  assert.throws(()=>dispatchFourLJointNative({status:'available'},ordinary,()=>{counts.observed++;throw Error('actual observer failure')}),/actual observer failure/)
  assert.deepEqual(counts,{ordinary:1,observed:2})
})

test('actual retained strict witness admits only its exact current request; untested edits reject before any observer process',()=>{
  const proof=JSON.parse(readFileSync(new URL('../../project/str/studies/four-l-joint-proof.json',import.meta.url),'utf8'))
  assert.equal(readFourLJointExecution(proof.witness.executedRequest).status,'available')
  const changed={...proof.witness.executedRequest,thicknessMm:250}
  assert.equal(readFourLJointExecution(changed).status,'unsupported')
  assert.throws(()=>runObservedFourLJointCase(changed,'UNTESTED-250',proof.witness),/request-not-yet-admitted/)
})

test('synthetic complete-cut edits and balanced joint-action redistribution fail full pure replay',()=>{
  for(const mutation of ['physical-cut','balanced-joint-actions']) {
    const f=fixture(),cuts=f.envelope.freeBodies.joints[0]!.memberCuts
    if(mutation==='physical-cut')cuts[0]!.forceOnMemberAtPhysicalCutKN_KNm[0]!+=1000
    else {cuts[0]!.memberOnJointAtReferenceKN_KNm[2]!+=1;cuts[1]!.memberOnJointAtReferenceKN_KNm[2]!-=1}
    assert.throws(()=>admitFourLJointEnvelope(f.envelope,f.comparison,'actual-case',f.methods,f.trustedObservationFingerprint),/complete pure recovery/)
  }
})

test('actual retained complete cuts and all observation channels are bound, including internally consistent raw redistribution',()=>{
  const input=JSON.parse(readFileSync(new URL('../../project/str/studies/four-l-joint-proof.json',import.meta.url),'utf8')).exactObservedInput
  const trusted=fourLJointObservationFingerprint(input.observation)
  assert.doesNotThrow(()=>admitFourLJointDerivedDemand(input.observation,input.freeBodies,trusted))
  for(const mutation of ['physical-cut','balanced-joint-actions','balanced-raw-actions','component','work-map']) {
    const changed=structuredClone(input),cuts=changed.freeBodies.joints[0].memberCuts,observed=changed.observation.joints[0]
    if(mutation==='physical-cut')cuts[0].forceOnMemberAtPhysicalCutKN_KNm[0]+=1000
    else if(mutation==='balanced-joint-actions') {cuts[0].memberOnJointAtReferenceKN_KNm[2]+=1;cuts[1].memberOnJointAtReferenceKN_KNm[2]-=1}
    else if(mutation==='balanced-raw-actions') {
      for(const [i,delta] of [[0,1],[1,-1]]) {
        observed.memberEnds[i].rawMasterWrenchKN_KNmm[2]+=delta
        cuts[i].rawMasterWrenchKN_KNmm[2]+=delta
        cuts[i].forceOnMemberAtPhysicalCutKN_KNm[2]+=delta
        cuts[i].memberOnJointAtReferenceKN_KNm[2]-=delta
      }
      changed.freeBodies=JSON.parse(execFileSync('python3',['-B','-c',
        "import json,sys;sys.path.insert(0,sys.argv[1]);from four_l_joint_recovery import recover;json.dump(recover(json.load(sys.stdin)),sys.stdout,allow_nan=False)",
        fileURLToPath(new URL('../../project/str/studies/',import.meta.url))],{input:JSON.stringify(changed.observation),encoding:'utf8'}))
      assert.doesNotThrow(()=>admitFourLJointDerivedDemand(changed.observation,changed.freeBodies,fourLJointObservationFingerprint(changed.observation)),
        'Balanced altered raw inputs can still be internally consistent; they are not the trusted actual capture')
    } else if(mutation==='component')observed.componentReactions[0].forceOnComponentKN_KNm[2]+=1
    else observed.verticalPortMaps[0].nodeDisplacementCoefficients[2]+=1
    assert.throws(()=>admitFourLJointDerivedDemand(changed.observation,changed.freeBodies,trusted),
      mutation==='physical-cut'||mutation==='balanced-joint-actions'?/complete pure recovery/:/source-bound exact-request captured input/)
  }
  const relabelled={...input.observation,caseId:'OTHER-VALID-CASE',fullNativeResultSHA256:hash('renamed-native-bytes')}
  assert.equal(fourLJointObservationFingerprint(relabelled),trusted,'Only explicit case-label metadata is excluded')
})
