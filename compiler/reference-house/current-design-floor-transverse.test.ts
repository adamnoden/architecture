import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import { recoverFloorTransverseCuts, recoverFloorTransverseShear } from './current-design/structural-floor-transverse.js'

const law={elasticModulusMPa:30000,poissonRatio:0.2,thicknessMm:200,flexuralFactor:0.4,shearFactor:0.3,unitWeightKNPerM3:25}
const close=(a:number,b:number,tolerance=1e-9)=>assert.ok(Math.abs(a-b)<=tolerance*Math.max(1,Math.abs(a),Math.abs(b)),`${a} differs from ${b}`)
function native(cells:number[][], motion:(x:number,y:number)=>number[], material=law) {
  const points=[...new Map(cells.flatMap(([a,b,c,d])=>[[a!,b!],[c!,b!],[c!,d!],[a!,d!]]).map(xyMm=>[String(xyMm),{xyMm,displacementMmRad:motion(xyMm[0]!,xyMm[1]!)}])).values()]
  const input={request:{plateLaw:material},plate:{cellsXYMm:cells,physicalRecovery:{points,physicalPlateStrainEnergyKNmm:0}}}
  // Independent assembled native element oracle; it does not call the TypeScript recovery.
  const oracle=JSON.parse(execFileSync('python3',['-B','-c',`
import sys,json
sys.path.insert(0,'project/str/studies')
from vertical_floor_plate import mitc4_element
from plate_bending_recovery import recover_plate_bending
v=json.load(sys.stdin);p={tuple(r['xyMm']):r['displacementMmRad'] for r in v['plate']['physicalRecovery']['points']};energy=0
for a,b,c,d in v['plate']['cellsXYMm']:
 u=[x for q in ((a,b),(c,b),(c,d),(a,d)) for x in p[q]]
 k,_=mitc4_element([a,b,c,d],v['request']['plateLaw'])
 energy+=sum(k[i][j]*u[i]*u[j]/2 for i in range(12) for j in range(12))
v['plate']['physicalRecovery']['physicalPlateStrainEnergyKNmm']=energy
print(json.dumps({'total':energy,'bending':recover_plate_bending(v)['bendingStrainEnergyKNmm']}))
`],{input:JSON.stringify(input),encoding:'utf8'})) as {total:number;bending:number}
  input.plate.physicalRecovery.physicalPlateStrainEnergyKNmm=oracle.total
  return {input,oracle}
}

test('MITC4 tied shear and bending close the independent native element energy for nontrivial rotations',()=>{
  const {input,oracle}=native([[1200,400,1800,1100],[1800,400,2700,1100]],(x,y)=>[x*y/1e6+x*x/2e6,0.0003+x*y/5e8,-0.0007+x*y/8e8])
  const result=recoverFloorTransverseShear(input)
  close(result.energy.bendingStrainEnergyKNmm,oracle.bending)
  close(result.energy.shearStrainEnergyKNmm,oracle.total-oracle.bending)
  close(result.energy.reconstructedPhysicalPlateStrainEnergyKNmm,oracle.total)
  assert.equal(result.completeJointWrenchAvailable,false);assert.equal(result.resistanceAccepted,false)
  assert.ok(result.energy.relativeResidual<1e-12)
  // Native assumed gammaX is constant along normalX; gammaY constant along normalY.
  const rows=result.cells[0]!.gaussSamples
  close(rows[0]!.shearKNPerM[0]!,rows[2]!.shearKNPerM[0]!)
  close(rows[0]!.shearKNPerM[1]!,rows[1]!.shearKNPerM[1]!)
  assert.notEqual(rows[0]!.shearKNPerM[0],rows[1]!.shearKNPerM[0])
})

test('positive-normal cuts integrate analytical shear without bridging actual gaps; reversal retains the energy control',()=>{
  const cells=[[0,0,1000,400],[0,600,1000,1000]]
  const motion=(x:number,y:number)=>[0.002*x+0.004*y,0,0]
  const original=native(cells,motion),field=recoverFloorTransverseShear(original.input)
  const cuts=[{id:'STR/x',normal:'x',positionMm:250,intervalMm:[0,1000]},{id:'STR/y',normal:'y',positionMm:200,intervalMm:[0,1000]}]
  const result=recoverFloorTransverseCuts(field,cuts)
  const rigidity=30/(2*1.2)*0.3*200
  close(result.cuts[0]!.signedNormalShearKN,rigidity*0.002*800)
  close(result.cuts[1]!.signedNormalShearKN,rigidity*0.004*1000)
  assert.deepEqual(result.cuts[0]!.gapsMm,[[400,600]])
  assert.equal(result.cuts[0]!.materialWidthMm,800)
  const reversed=recoverFloorTransverseShear(native(cells,(x,y)=>motion(x,y).map(v=>-v)).input)
  close(reversed.energy.shearStrainEnergyKNmm,field.energy.shearStrainEnergyKNmm)
  close(recoverFloorTransverseCuts(reversed,cuts).cuts[0]!.signedNormalShearKN,-result.cuts[0]!.signedNormalShearKN)
  const changed=recoverFloorTransverseShear(native(cells,motion,{...law,shearFactor:0.15}).input)
  close(changed.energy.shearStrainEnergyKNmm,field.energy.shearStrainEnergyKNmm/2)
  close(recoverFloorTransverseCuts(changed,cuts).cuts[0]!.signedNormalShearKN,result.cuts[0]!.signedNormalShearKN/2)
  close(changed.energy.bendingStrainEnergyKNmm,field.energy.bendingStrainEnergyKNmm)
})

test('rigid motion has zero shear and the same physical constant-shear field survives mesh subdivision',()=>{
  const rigid=recoverFloorTransverseShear(native([[0,0,1000,1000]],(x,y)=>[3+0.001*y-0.002*x,0.001,0.002]).input)
  close(rigid.energy.shearStrainEnergyKNmm,0)
  const motion=(x:number,y:number)=>[x*y/1e6,0,0]
  const a=recoverFloorTransverseShear(native([[0,0,1000,1000]],motion).input)
  const b=recoverFloorTransverseShear(native([[0,0,500,1000],[500,0,1000,1000]],motion).input)
  const cuts=[{id:'STR/subdivision',normal:'x',positionMm:250,intervalMm:[0,1000]}]
  close(a.energy.shearStrainEnergyKNmm,b.energy.shearStrainEnergyKNmm)
  const aq=recoverFloorTransverseCuts(a,cuts).cuts[0]!.signedNormalShearKN
  close(aq,recoverFloorTransverseCuts(b,cuts).cuts[0]!.signedNormalShearKN)
  close(aq,a.shearRigidityKNPerMm/2)
})

test('stale physical energy, missing/duplicate points, invalid laws and unsupported cuts fail explicitly',()=>{
  const {input}=native([[0,0,1000,1000]],(x,y)=>[x/1000,y/1e6,x/2e6])
  const field=recoverFloorTransverseShear(input)
  const stale=structuredClone(input);stale.plate.physicalRecovery.physicalPlateStrainEnergyKNmm*=1.1
  assert.throws(()=>recoverFloorTransverseShear(stale),/does not close/)
  const missing=structuredClone(input);missing.plate.physicalRecovery.points.pop()
  assert.throws(()=>recoverFloorTransverseShear(missing),/Missing actual/)
  const duplicate=structuredClone(input);duplicate.plate.physicalRecovery.points.push(duplicate.plate.physicalRecovery.points[0]!)
  assert.throws(()=>recoverFloorTransverseShear(duplicate),/Unique finite/)
  assert.throws(()=>recoverFloorTransverseShear({...input,request:{plateLaw:{...law,shearFactor:1.1}}}),/Finite actual/)
  assert.throws(()=>recoverFloorTransverseShear({...input,request:{plateLaw:{...law,poissonRatio:0.5}}}),/Finite actual/)
  const cut={id:'STR/x',normal:'x',positionMm:0,intervalMm:[0,1000]}
  assert.throws(()=>recoverFloorTransverseCuts(field,[cut]),/Ambiguous/)
  assert.throws(()=>recoverFloorTransverseCuts(field,[{...cut,positionMm:1100}]),/no physical material/)
  assert.throws(()=>recoverFloorTransverseCuts({...field,cells:[...field.cells,...field.cells]},[{...cut,positionMm:100}]),/Overlapping/)
  const malformed=structuredClone(field);malformed.cells[0]!.tiedShearStrains.gammaXAtEtaMinusPlus[0]=NaN
  assert.throws(()=>recoverFloorTransverseCuts(malformed,[{...cut,positionMm:100}]),/Finite tied/)
})
