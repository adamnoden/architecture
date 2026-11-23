import assert from 'node:assert/strict'
import test from 'node:test'
import {readFileSync} from 'node:fs'
import {compareInletBankShelfCarrier,drawInletBankShelfCarrier,type InletBankShelfCandidate} from './current-design/inlet-bank-carrier.js'
const room=JSON.parse(readFileSync(new URL('../../project/had/studies/inlet-source-envelope.results.json',import.meta.url),'utf8')).joinedDirection.room,
 candidate=JSON.parse(readFileSync(new URL('../../project/had/studies/inlet-bank-shelf-candidate.json',import.meta.url),'utf8')) as InletBankShelfCandidate,
 input={bank:room.bankReceiver,routes:room.indoorRoutes,cuts:room.indoorCuts,candidate}
const close=(a:number,b:number,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`)
test('actual finite shelf rejects the full locked source without borrowing the pressure-only pass',()=>{
 const before=JSON.stringify(input),r=compareInletBankShelfCarrier(input)
 assert.equal(r.necessaryCarrierComparison,false)
 assert.equal(r.actualIndependentCarrierSelected,false)
 assert.equal(r.nativeStructuralActionsAdopted,false)
 assert.equal(r.wholeOccupiedArrangementComplete,false)
 assert.equal(r.rows.length,4)
 close(r.referenceCarrierSteelKg,17.555328)
 for(const row of r.rows){
  close(row.loadArmMm,120)
  close(row.maximumShelfThicknessInAxialSlotMm,8.483339501604604)
  close(row.minimumShelfThicknessForSourceStressComparisonMm,15.895802409738549)
  assert.equal(row.sourceStressThicknessFitsEvenOptimallyRecenteredSlot,false)
  assert.ok(row.cases.filter(c=>c.thermalSign===0).every(c=>c.necessaryShelfStressAndAxialSlotComparison))
  assert.ok(row.cases.filter(c=>c.thermalSign!==0).every(c=>!c.necessaryShelfStressAndAxialSlotComparison))
  assert.ok(row.cases.some(c=>c.stressComparisonMPa>525))
  assert.ok(row.cases.some(c=>c.clampDeflectionMm>3))
  assert.ok(row.cases.some(c=>c.clampDeflectionMm< -3))
 }
 assert.equal(JSON.stringify(input),before,'Comparison never edits source routes, duties or reactions')
})
test('the actual shelf cover collides with the retained lower shield interface and its wall wrap is incomplete',()=>{
 const r=compareInletBankShelfCarrier(input),lower=r.rows[0]
 assert.deepEqual(lower.obstacleConflicts,[{part:'joined-insulated-carrier',obstacle:'HAD/utility-north/shield-connection-1',reserveMm:-43}])
 assert.ok(r.rows.every(v=>v.minimumOtherBranchPipeReserveMm>0&&v.minimumOrdinaryArmReserveMm>0))
 assert.ok(r.rows.every(v=>v.fullWallWrapPenetrationMm===16&&!v.wallPocketAndThermalBridgeQualified))
})
test('a stronger shelf fails the actual axial territory, while ideal zero-thermal demand is only an unchanged pressure control',()=>{
 const thick=compareInletBankShelfCarrier({...input,candidate:{...candidate,shelfThicknessMm:16,clampShiftUpMm:8}})
 assert.ok(thick.rows.every(v=>v.cases.every(c=>c.stressComparisonMPa<thick.steelComparisonAllowableMPa)))
 assert.ok(thick.rows.every(v=>v.lowerReserveAfterSettingMm<0&&v.upperReserveAfterSettingMm<0))
 assert.equal(thick.necessaryCarrierComparison,false)
 const bank={...input.bank,reactions:input.bank.reactions.map((v:any)=>({...v,cases:v.cases.filter((c:any)=>c.thermalSign===0)}))},control=compareInletBankShelfCarrier({...input,bank})
 assert.ok(control.rows.every(v=>v.sourceStressThicknessFitsEvenOptimallyRecenteredSlot&&v.allSourceChallengesWithinShelfAndSlotComparison))
 assert.equal(control.necessaryCarrierComparison,false,'The fixed shield collision remains even when a thermal control is unloaded')
 assert.equal(control.actualIndependentCarrierSelected,false)
 assert.match(drawInletBankShelfCarrier(control),/Stress thickness fits the slot/)
})
test('signed six-axis core action adds exact new steel weight once and retains upward and downward cases',()=>{
 const r=compareInletBankShelfCarrier(input)
 for(const row of r.rows)for(const c of row.cases){
  const shelfN=row.shelfKg*9.81,plateN=row.backplateKg*9.81,y=row.proposedClampCentreMm[1],coreY=c.coreOriginMm[1]
  close(c.coreWrenchN_Nm[2],c.sourceForceN-shelfN-plateN)
  close(c.coreWrenchN_Nm[3],(y-coreY)/1000*c.sourceForceN-(row.exactShelfCentroidMm[1]-coreY)/1000*shelfN-(row.exactBackplateCentroidMm[1]-coreY)/1000*plateN)
  assert.ok(c.coreWrenchN_Nm.every(Number.isFinite))
 }
 assert.ok(r.rows[0].cases.some(c=>c.coreWrenchN_Nm[2]>0))
 assert.ok(r.rows[0].cases.some(c=>c.coreWrenchN_Nm[2]<0))
})
test('ground datum translates physical origins without changing local geometry, source load or relative core wrench',()=>{
 const local=compareInletBankShelfCarrier(input),raised=compareInletBankShelfCarrier({...input,bank:{...input.bank,datum:{...input.bank.datum,groundFflMm:530}},cuts:{...input.cuts,groundStage:{...input.cuts.groundStage,fflMm:530}}})
 for(let k=0;k<local.rows.length;k++){
  const a=local.rows[k],b=raised.rows[k]
  assert.deepEqual(b.shelfBoxMm,a.shelfBoxMm)
  close(b.exactShelfCentroidMm[2]-a.exactShelfCentroidMm[2],530)
  for(let j=0;j<a.cases.length;j++){
   close(b.cases[j].coreOriginMm[2]-a.cases[j].coreOriginMm[2],530)
   assert.deepEqual(b.cases[j].coreWrenchN_Nm,a.cases[j].coreWrenchN_Nm)
  }
 }
 assert.throws(()=>compareInletBankShelfCarrier({...input,bank:{...input.bank,datum:{...input.bank.datum,groundFflMm:530}}}),/datum mismatch/)
})
test('unsupported shelf laws and missing branch action identities reject explicitly',()=>{
 for(const changed of [{shelfThicknessMm:0},{steelElasticModulusMPa:NaN},{proofDivisor:.5}])assert.throws(()=>compareInletBankShelfCarrier({...input,candidate:{...candidate,...changed}}),/Unsupported/)
 assert.throws(()=>compareInletBankShelfCarrier({...input,bank:{...input.bank,reactions:input.bank.reactions.map((v:any)=>({...v,branch:'absent'}))}}),/missing branch/)
 const missing={...candidate,unknownFinite:8} as any;delete missing.shelfThicknessMm
 assert.throws(()=>compareInletBankShelfCarrier({...input,candidate:missing}),/Unsupported/)
 const horizontal=structuredClone(input.bank);horizontal.reactions[0]!.cases[0]!.pipeComparisonForceN[0]=1
 assert.throws(()=>compareInletBankShelfCarrier({...input,bank:horizontal}),/Horizontal source force/)
 assert.throws(()=>compareInletBankShelfCarrier({...input,bank:{...input.bank,reactions:input.bank.reactions.map((v:any)=>({...v,cases:[]}))}}),/source action/)
})
