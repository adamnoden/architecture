import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {plantPotableInventory} from './current-design/inlet-plant-potable-inventory.js'
import {inletSplitPlantRoom} from './current-design/inlet-split-plant-room.js'
const read=(p:string)=>JSON.parse(readFileSync(new URL('../../'+p,import.meta.url),'utf8'))
const receipt=read('project/had/studies/inlet-local-pocket.results.json'),p=receipt.splitPlantRoom?.comparison,choice=read('project/had/studies/inlet-plant-tanked-walk-candidate.json')
test('source Plant pan fixture is explicitly530 geometry, never a new native force result',()=>{
 assert.ok(p&&p.state==='unadopted-threshold-drainage-successor','Actual saved local-pocket Plant comparison required; no fallback fixture')
 assert.equal(p.ground.ffl,530)
 assert.ok(p.resolvedInput&&p.pan&&p.bridge&&p.outfalls)
 const replay=inletSplitPlantRoom(p.resolvedInput)
 assert.deepEqual(JSON.parse(JSON.stringify(replay.pan)),p.pan,'JSON control normalises signed zero; no source or numerical receipt is edited.')
 assert.equal(choice.closedDuctStorageCreditLitres,0)
 assert.equal(choice.legacyFinishUndersideProtectedMm,505)
 assert.equal(choice.walkingRiseAboveHouseFflMm,100)
 const rows={scope:'Exact existing source-geometry fixture only. New grated surface and body translations are not yet active; source-native force/evidence identity is not adopted.',keys:Object.keys(p),inputKeys:Object.keys(p.resolvedInput),ground:p.ground,pocket:p.pocket,pan:p.pan,bridge:p.bridge,room:p.branchRoomMm??p.resolvedInput.branch.roomPlanMm,sourceQ:p.sourceOnlyLmin,threshold:p.resolvedInput.threshold,goods:p.resolvedInput.branch.goods,sourceServiceGeometry:p.resolvedInput.branch.resolvedInput,grid:p.resolvedInput.grid}
 const dir=process.env.HAD_UTILITY_ROUTE_PROOF_DIR
 if(dir){mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'Plant-actual-tanked-geometry-source.json'),JSON.stringify(rows,null,2))}
 console.info('PLANT_ACTUAL_TANKED_GEOMETRY '+JSON.stringify({ground:p.ground,inputKeys:rows.inputKeys,panKeys:Object.keys(p.pan),pocketKeys:Object.keys(p.pocket),bridge:p.bridge.boxMm,room:rows.room,sourceQ:p.sourceOnlyLmin,goods:rows.goods.map((g:any)=>({id:g.id,maximumCompleteHeightMm:g.maximumCompleteHeightMm,completeRadiusMm:g.completeRadiusMm}))}))
})

test('complete source-design potable inventory uses external tubes/full fitting bodies, not minimum IDs or170L history',()=>{
 const mat=read('project/mat/studies/whole-house-service-baseline.json'),r=plantPotableInventory(mat,choice.inventory)
 assert.equal(r.minimumBoresUsedAsMaximum,false)
 assert.equal(r.sourcePipeBodiesAndFittingsDeliberatelyCountedAsWater,true)
 assert.equal(r.retiredUtilityColdDutyIncluded,false)
 assert.ok(r.wholeSelectedTrunkBranchAndDeviceDesignUpperL>240)
 assert.equal(r.actualRiserAndAllTerminalJoinsAccepted,false)
 assert.equal(r.actualAllApparatusReservoirBackfeedExcluded,false)
 const dir=process.env.HAD_UTILITY_ROUTE_PROOF_DIR
 if(dir)writeFileSync(join(dir,'Plant-actual-source-potable-inventory.json'),JSON.stringify(r,null,2))
 console.info('PLANT_SOURCE_POTABLE_UPPER '+JSON.stringify({totals:r.totals,upper:r.wholeSelectedTrunkBranchAndDeviceDesignUpperL,rows:r.rows.length,offset:r.sectionOffsetRadiusUpperMm}))
 const restored=structuredClone(mat);restored.trunks.find((t:any)=>t.id==='ground-utility').duties.push('cold')
 const hazardous=plantPotableInventory(restored,choice.inventory)
 assert.equal(hazardous.retiredUtilityColdDutyIncluded,true)
 assert.ok(hazardous.wholeSelectedTrunkBranchAndDeviceDesignUpperL>r.wholeSelectedTrunkBranchAndDeviceDesignUpperL)
 const stale=structuredClone(mat);stale.trunks[0].selected3DProfile[0][0]+=10
 assert.throws(()=>plantPotableInventory(stale,choice.inventory),/source contradiction/)
 const tooLarge=structuredClone(choice.inventory);tooLarge.maximumCompletePressureDeviceBodyMm=[80,80,600]
 assert.throws(()=>plantPotableInventory(mat,tooLarge),/exceeds source work territory/)
})
