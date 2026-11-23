import assert from'node:assert/strict'
import{readFileSync}from'node:fs'
import{factor,element,rhs}from'./frame-kernel.ts'
import{authored,source}from'./case-reader.mjs'
const read=name=>JSON.parse(readFileSync(new URL(name,import.meta.url),'utf8')),frame=read('frame.results.json'),coupled=read('coupled-seizure.results.json'),geometry=read('geometry.results.json'),thermal=read('thermal-experiment.results.json'),near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`)
// Independent cantilever closed form for the exact reused frame and eigenstrain solve.
for(const c of[{span:100,force:-500,k:1000,growth:.2},{span:250,force:-700,k:2000,growth:-.15}]){
 const s=rhs(60,80,4),nodes=[{id:'root',p:[0,0,0],restrained:[0,1,2,3,4,5]},{id:'tip',p:[c.span,0,0],restrained:[]}],m={id:'control',a:0,b:1,pa:[0,0,0],pb:[c.span,0,0],s,body:[0,-30,-40,c.span,60,80],leg:4,massKg:0},e=element(m,nodes),A=e.global.map(row=>[...row]);A[8][8]+=c.k;const f=[0,0,c.force+c.k*c.growth,0,0,0],u=factor(A.slice(6).map(row=>row.slice(6)))(f),expected=(c.force+c.k*c.growth)/(3*200000*s.iy/c.span**3+c.k)
 near(u[2],expected,1e-12)
}
assert.equal(frame.cases.length,144);assert.equal(coupled.cases.length,512);assert.equal(thermal.cases.length,8)
assert.ok(frame.cases.every(c=>c.residual<1e-6&&c.totalForceMomentResidualN_Nmm.every(v=>Math.abs(v)<1e-5)))
assert.ok(Math.max(...frame.cases.map(c=>c.peak.stressMPa))>200/1.5,'The full imposed9.232kN source-force failure must remain visible')
for(const c of coupled.cases){
 assert.ok(c.residual<1e-6&&Number.isFinite(c.peak.stressMPa)&&c.maxTranslationMm<1)
 for(const s of c.states){
  if(!s.seized)assert.equal(s.compatibleAxialForceN,0)
  else if(s.freeGrowthMm)near(s.compatibleAxialForceN,s.rigidReceiverAxialComparatorN*(1-s.relativeFrameMovementMm/s.freeGrowthMm),1e-7)
 }
}
const rigid=coupled.cases.find(c=>c.pipe==='stock-adverse28.1x1.38'&&c.valveStiffnessNPerMm===null&&c.states[0].seized&&c.states[0].temperatureK===40),span=frame.sourceStatesRetained&&source.joinedDirection.room.bankReceiver.receivers[1].centreMm[2]-source.joinedDirection.room.bankReceiver.receivers[0].centreMm[2],tube=span-160,area=Math.PI/4*(28.1**2-(28.1-2*1.38)**2)
near(rigid.states[0].rigidReceiverAxialComparatorN,117200*area/tube*(tube+160)*.000017*40)
assert.ok(Math.max(...coupled.cases.map(c=>c.peak.stressMPa))<200/1.5)
assert.equal(geometry.conflicts.length,0)
assert.ok(geometry.minimumByKind['joined-wrap-to-uncut-core']>=4)
assert.equal(geometry.actualJointedInsulationAndJacketQualified,false)
assert.equal(geometry.actualClampEndlandsAndFactoryToolCaptureQualified,false)
for(const c of thermal.cases){assert.equal(c.result.fixedPointMm[0],11360);assert.equal(c.result.fixedPointMm[1],2350);assert.equal(c.result.upperSubroute.uniformTemperature.elasticExtremeFibreStressMpa,undefined)}
assert.deepEqual(frame.sourceStatesRetained,source.states,'Stored release, backfeed, full static pressure and blocked/submerged duties remain unchanged')
assert.equal(frame.actualCoreResistanceQualified,false);assert.equal(frame.actualClampResistanceQualified,false)
console.log('PASS:2 independent coupled-beam controls;144 full imposed-source cases;512 explicit valve/guide/pressure/thermal comparisons;8 full3D route sensitivities;static geometry and retained adverse obligations. No actual-force bound or source adoption.')
