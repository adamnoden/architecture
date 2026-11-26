import assert from 'node:assert/strict'
import test from 'node:test'
import {readFileSync} from 'node:fs'
import {pathToFileURL} from 'node:url'
import {inletServiceRoomPlans,inletRoomPocket} from '../../../compiler/reference-house/current-design/inlet-room-pocket.js'
import {inletKnownFloorBody,inletKnownGravityInventory} from '../../../compiler/reference-house/current-design/inlet-known-gravity.js'
const beforePath=process.env.CURRENT_GROUND_BEFORE_METHOD
if(!beforePath)throw Error('Exact authenticated pre-extraction method fixture required')
const before=await import(pathToFileURL(beforePath).href)
const read=p=>JSON.parse(readFileSync(new URL('../../../'+p,import.meta.url),'utf8'))
const model=read('project/had/studies/water-replan.json').model,grid=read('project/str/studies/current-house-grid.json')
const plans=inletServiceRoomPlans(model),levels={mineralCourse:[0,150],dryRC:[150,350],glass:[350,450],accessibleDistribution:[450,515],finish:[515,530],ffl:530,coldGridTop:-180}
const pocket=(roomId,roomPlanMm=plans[roomId])=>inletRoomPocket({levels,roomPlanMm,depthMm:245,isolationGapMm:50,grid,rcDensityKNm3:25,mineralDensityKNm3:20,roomId}).local
const base={source:{inletBindingDigest:'synthetic-unit-fixture-only',inletCaseDigest:'synthetic-unit-fixture-only',planDigest:'synthetic-unit-fixture-only',groundCaseDigest:null},groundFflMm:530,coldGridTopMm:-180,forceDensitiesKNm3:{rc:25,mineral:20}}
const room=p=>({pan:{upperMetalStockCase:{loadOrigins:[]},waterLoadOrigins:[]},outfalls:[],pocket:p})
const inventory=p=>({...base,utility:room(p),plant:null,frame:{massKg:0,attachmentPointsMm:[]},mainboard:{emptyReferenceKg:0,proposedBoxMm:[0,0,0,1,1,1]},plantDoorLeafBudgetKg:0,plantBranch:null,utilityValve:null,suite:null})
test('pure extraction retains complete previous inventory bytes for both actual source room pockets',()=>{
 for(const id of ['utility','plant']){
  const p=pocket(id),input=inventory(p)
  assert.deepEqual(inletKnownGravityInventory(input),before.inletKnownGravityInventory(input))
  assert.deepEqual(inletKnownFloorBody(p,base).body,inletKnownGravityInventory(input).structuralFloorBodies[0])
 }
})
test('same source walls own both Utility and Plant plans, including an actual opening-boundary edit',()=>{
 const m=structuredClone(model),wall=m.groundWalls.find(w=>w.id==='utility-north')
 wall.finishedFaces[0]-=25
 const changed=inletServiceRoomPlans(m)
 assert.equal(changed.utility[3],plans.utility[3]-25)
 assert.deepEqual(changed.plant,plans.plant)
 assert.notDeepEqual(inletKnownFloorBody(pocket('utility',changed.utility),base).body.rcRectangleXYMm,inletKnownFloorBody(pocket('utility'),base).body.rcRectangleXYMm)
})
test('pure stock builder rejects inconsistent force density and changed gravity rows',()=>{
 const p=pocket('utility')
 assert.throws(()=>inletKnownFloorBody(p,{...base,forceDensitiesKNm3:{rc:26,mineral:20}}),/force density/)
 const changed=structuredClone(p);changed.loadOrigins[0].wrenchKN_KNm.Fz-=.01
 assert.throws(()=>inletKnownFloorBody(changed,base),/force density/)
 const a=inletKnownFloorBody(p,base),b=inletKnownFloorBody(p,{...base,source:{currentSavedDocumentAdmitted:false,proposedInputDigest:'explicit-test-fixture'}})
 assert.deepEqual({...a.body,source:null},{...b.body,source:null})
 assert.equal(b.body.source.currentSavedDocumentAdmitted,false)
 assert.equal(b.body.receiverReactions,null);assert.equal(b.body.materialElasticModulusMPa,null)
})
