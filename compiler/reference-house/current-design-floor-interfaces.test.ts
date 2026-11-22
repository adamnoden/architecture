import assert from 'node:assert/strict'
import test from 'node:test'
import { recoverNamedFloorCornerInterfaces, transportFloorInterfaceWrench } from './current-design/structural-floor-interfaces.js'

const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-9,`${a} differs from ${b}`)
function pair() {
  const request={schema:'source-case/1',sourceSHA256:{'native-method.py':'abc'},thicknessMm:200}
  const native={schema:'str-coupled-floor-section-result/1',sourceSHA256:request.sourceSHA256,request,
    nativeVertical:{native:{caseId:'CONTROL',floorInterfacePorts:[{id:'SW',physicalPointMm:[70,220,350],displacementMmMrad:[0.34,-0.54,3],forceOnFloorKN_KNm:[4,-5,0,0,0,6]}]},
      plate:{physicalRecovery:{portGeneralizedReactions:[99,2,88,77,10,-3],points:[
        {xyMm:[70,220],displacementMmRad:[0.16,0.001,-0.002]},
        {xyMm:[120,260],displacementMmRad:[0.30,0.001,-0.002]}]}}}}
  const manifest={schema:'str-named-floor-corner-port-manifest/1',sourceSHA256:request.sourceSHA256,request,caseId:'CONTROL',nonlinearSolvesExecuted:0,wholeJointDemandAvailable:false,verticalPortCount:6,
    methodSourceSHA256:{'manifest-method.py':'def'},corners:[{id:'SW',collectorNodeId:'SW/collector',collectorNodeXYZMm:[100,200,300],ports:[
      {id:'CORNER/SW/2',coordinate:2,index:5,nodeDisplacementCoefficients:[0,0,0,0,1000,0]},
      {id:'CORNER/SW/0',coordinate:0,index:4,nodeDisplacementCoefficients:[0,0,1,20,30,0]},
      {id:'CORNER/SW/1',coordinate:1,index:1,nodeDisplacementCoefficients:[0,0,0,1000,0,0]}],physicalPlatePointTraces:[
        {xyMm:[70,220],plateCoordinateCoefficients:[[[4,1]],[[1,0.001]],[[5,0.001]]]},
        {xyMm:[120,260],plateCoordinateCoefficients:[[[4,1],[1,0.04],[5,-0.05]],[[1,0.001]],[[5,0.001]]]}]}]}
  return {native,manifest}
}

test('actual named mixed-coordinate ports produce simultaneous six-wrench at the real collector origin',()=>{
  const {native,manifest}=pair(),r=recoverNamedFloorCornerInterfaces(native,manifest),joint=r.corners[0]!
  const expected=[4,-5,10,2.45,-2.5,6.07]
  joint.forceOnFloorKN_KNm.forEach((v,i)=>close(v,expected[i]!))
  joint.floorForceOnCollectorKN_KNm.forEach((v,i)=>close(v,-expected[i]!))
  ;[0.5,-0.4,0.2,0.001,-0.002,0.003].forEach((v,i)=>close(joint.collectorDisplacementMmRad[i]!,v))
  assert.deepEqual(joint.verticalPortIndices,[4,1,5])
  assert.ok(joint.work.relativeResidual<1e-12)
  assert.equal(r.nonlinearSolvesExecuted,0);assert.equal(r.wholeJointDemandAvailable,false);assert.equal(r.closedControlVolumeEquilibriumProven,false)
})

test('independent cross-product oracle, origin change and permutation retain the physical result',()=>{
  const w=[13,-7,11,2,-3,5],from=[-500,800,1100],to=[100,200,300]
  const r=from.map((v,i)=>(v-to[i]!)/1000)
  const expected=[...w.slice(0,3),w[3]!+r[1]!*w[2]!-r[2]!*w[1]!,w[4]!+r[2]!*w[0]!-r[0]!*w[2]!,w[5]!+r[0]!*w[1]!-r[1]!*w[0]!]
  transportFloorInterfaceWrench(w,from,to).forEach((v,i)=>close(v,expected[i]!))
  transportFloorInterfaceWrench(transportFloorInterfaceWrench(w,from,to),to,from).forEach((v,i)=>close(v,w[i]!))
  const a=pair(),b=pair();b.manifest.corners[0]!.ports.reverse();b.manifest.corners[0]!.physicalPlatePointTraces.reverse();b.native.nativeVertical.plate.physicalRecovery.points.reverse()
  assert.deepEqual(recoverNamedFloorCornerInterfaces(a.native,a.manifest),recoverNamedFloorCornerInterfaces(b.native,b.manifest))
})

test('same-case reaction perturbation recomputes only the physical plate contribution with correct action/reaction',()=>{
  const {native,manifest}=pair(),before=recoverNamedFloorCornerInterfaces(native,manifest)
  native.nativeVertical.plate.physicalRecovery.portGeneralizedReactions[4]!+=5
  const after=recoverNamedFloorCornerInterfaces(native,manifest)
  assert.deepEqual(after.corners[0]!.membraneForceOnFloorKN_KNm,before.corners[0]!.membraneForceOnFloorKN_KNm)
  const change=after.corners[0]!.floorForceOnCollectorKN_KNm.map((v,i)=>v-before.corners[0]!.floorForceOnCollectorKN_KNm[i]!)
  change.forEach((v,i)=>close(v,[0,0,-5,-0.1,-0.15,0][i]!))
  assert.ok(after.corners[0]!.work.relativeResidual<1e-12)
})

test('stale source/request, missing named metadata, incompatible displacement fields and absent ports fail explicitly',()=>{
  let p=pair();p.manifest.sourceSHA256={'native-method.py':'stale'}
  assert.throws(()=>recoverNamedFloorCornerInterfaces(p.native,p.manifest),/Exact source/)
  p=pair();p.manifest.request={...p.manifest.request,thicknessMm:250}
  assert.throws(()=>recoverNamedFloorCornerInterfaces(p.native,p.manifest),/Exact source/)
  p=pair();p.manifest.corners[0]!.ports[0]!.index=100
  assert.throws(()=>recoverNamedFloorCornerInterfaces(p.native,p.manifest),/Unique stable/)
  p=pair();p.native.nativeVertical.plate.physicalRecovery.points[1]!.displacementMmRad[0]!+=0.01
  assert.throws(()=>recoverNamedFloorCornerInterfaces(p.native,p.manifest),/contradicts/)
  p=pair();p.native.nativeVertical.native.floorInterfacePorts=[]
  assert.throws(()=>recoverNamedFloorCornerInterfaces(p.native,p.manifest),/Named planar/)
  p=pair();p.manifest.corners[0]!.physicalPlatePointTraces[0]!.plateCoordinateCoefficients[0]![0]![0]=0
  assert.throws(()=>recoverNamedFloorCornerInterfaces(p.native,p.manifest),/absent\/different/)
  assert.throws(()=>transportFloorInterfaceWrench([1,2],[0,0,0],[0,0,0]),/Finite six/)
})

// The adapter's actual builder boundary must remain metadata-only, including source rejection.
import { execFileSync } from 'node:child_process'
test('current native builder emits named work maps before the nonlinear solve boundary',()=>{
  execFileSync('python3',['-B','project/str/studies/floor_interface_manifest_test.py'],{
    stdio:'pipe',env:{...process.env,OPENBLAS_NUM_THREADS:'1',OMP_NUM_THREADS:'1'},maxBuffer:1024*1024})
})
