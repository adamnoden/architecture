import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {inletSplitPlantRoom} from './current-design/inlet-split-plant-room.js'
const read=(p:string)=>JSON.parse(readFileSync(new URL('../../'+p,import.meta.url),'utf8'))
const receipt=read('project/had/studies/inlet-local-pocket.results.json'),p=receipt.splitPlantRoom?.comparison,choice=read('project/had/studies/inlet-plant-tanked-walk-candidate.json')
test('source Plant pan fixture is explicitly530 geometry, never a new native force result',()=>{
 assert.ok(p&&p.state==='unadopted-threshold-drainage-successor','Actual saved local-pocket Plant comparison required; no fallback fixture')
 assert.equal(p.ground.ffl,530)
 assert.ok(p.resolvedInput&&p.pan&&p.bridge&&p.outfalls)
 const replay=inletSplitPlantRoom(p.resolvedInput)
 assert.deepEqual(replay.pan,p.pan)
 assert.equal(choice.closedDuctStorageCreditLitres,0)
 assert.equal(choice.legacyFinishUndersideProtectedMm,505)
 assert.equal(choice.walkingRiseAboveHouseFflMm,75)
 const rows={scope:'Exact existing source-geometry fixture only. New grated surface and body translations are not yet active; source-native force/evidence identity is not adopted.',keys:Object.keys(p),inputKeys:Object.keys(p.resolvedInput),ground:p.ground,pocket:p.pocket,pan:p.pan,bridge:p.bridge,room:p.branchRoomMm??p.resolvedInput.branch.roomPlanMm,sourceQ:p.sourceOnlyLmin,threshold:p.resolvedInput.threshold,goods:p.resolvedInput.branch.goods,sourceServiceGeometry:p.resolvedInput.branch.resolvedInput}
 const dir=process.env.HAD_UTILITY_ROUTE_PROOF_DIR
 if(dir){mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'Plant-actual-tanked-geometry-source.json'),JSON.stringify(rows,null,2))}
 console.info('PLANT_ACTUAL_TANKED_GEOMETRY '+JSON.stringify({ground:p.ground,inputKeys:rows.inputKeys,panKeys:Object.keys(p.pan),pocketKeys:Object.keys(p.pocket),bridge:p.bridge.boxMm,room:rows.room,sourceQ:p.sourceOnlyLmin,goods:rows.goods.map((g:any)=>({id:g.id,maximumCompleteHeightMm:g.maximumCompleteHeightMm,completeRadiusMm:g.completeRadiusMm}))}))
})
