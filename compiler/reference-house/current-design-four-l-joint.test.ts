import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import test from 'node:test'
import { admitFourLJointEnvelope, fourLJointMethodPaths, inspectFourLJointCapability } from './current-design/structural-four-l-joint-adapter.js'

const hash=(s:string)=>createHash('sha256').update(s).digest('hex')
function fixture() {
  const sourceSHA256=Object.fromEntries(Array.from({length:58},(_,i)=>[`project/native-${i}.py`,hash('source'+i)]))
  const comparison={sourceSHA256,thicknessMm:200,wetSupport:{bearingQuadratureOrder:8}}
  const methods=Object.fromEntries(fourLJointMethodPaths.map(p=>[p,hash(p)]))
  const heads=Array.from({length:52},(_,i)=>({id:'P'+i,reactionKN_KNm:[0,0,0,0,0,0]}))
  const originals=['SW','SE','NW','NE'].map(id=>({id,referenceXYZMm:[0,0,3170],jointBodyGravityInsertedByObserverKN:0,
    memberEnds:[{memberId:id+'/lower',role:'lower',rawMasterWrenchKN_KNmm:[0,0,-22,0,0,0]},
      {memberId:id+'/upper',role:'upper',rawMasterWrenchKN_KNmm:[0,0,2,0,0,0]}],
    componentReactions:[{id:'plate',forceOnComponentKN_KNm:[0,0,10,0,0,0]}],
    directAppliedLoads:[{id:'direct',wrenchKN_KNm:[0,0,-7,0,0,0]}]}))
  const joints=originals.map(r=>({id:r.id,referenceXYZMm:r.referenceXYZMm,
    rigidJointConstitutiveAssumptionRetained:true,finiteJointCapacityAvailable:false,reinforcementAccepted:false,candidateAccepted:false,
    memberCuts:r.memberEnds.map((m,i)=>({...m,rawMasterWrenchKN_KNmm:[...m.rawMasterWrenchKN_KNmm],memberOnJointAtReferenceKN_KNm:[0,0,i===0?20:-3,0,0,0]})),
    components:r.componentReactions.map(c=>({...c,componentOnJointAtReferenceKN_KNm:[0,0,-10,0,0,0]})),
    directAppliedLoads:r.directAppliedLoads.map(d=>({...d,loadAtReferenceKN_KNm:[0,0,-7,0,0,0]})),
    freeBodyResidualKN_KNm:[0,0,0,0,0,0]}))
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
  return {comparison,methods,envelope,witness}
}

test('prepared optional capability preserves exact native bytes and all joint components without starting a native process',()=>{
  const f=fixture(),before=JSON.stringify(f)
  assert.equal(inspectFourLJointCapability(f.comparison,f.witness,f.methods).status,'available')
  const result=admitFourLJointEnvelope(f.envelope,f.comparison,'actual-case',f.methods)
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
    assert.throws(()=>admitFourLJointEnvelope(f.envelope,f.comparison,'actual-case',f.methods))
  }
})
