import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import {admitUtilityRouteChoice} from './current-design/inlet-utility-route.js'
import {deriveUtilityCandidateFloorPocket,readUtilityCurrentGeometrySource} from './current-design/inlet-utility-proof-source.js'
const read=(p:string)=>JSON.parse(readFileSync(new URL('../../'+p,import.meta.url),'utf8'))
const source=readUtilityCurrentGeometrySource()
const input={choice:read('project/had/studies/inlet-utility-compact-route.json').candidateFloorPocket,
 roomPlanMm:source.input.roomPlanMm,planExclusionsMm:source.boundary.actualPanExclusionsXYMm,
 grid:read('project/str/studies/current-house-grid.json'),sourceGroundLayers:source.water.northNormalRoute.floorJoin.layers,
 defaults:read('project/str/studies/dry-side-ground-section.json'),mineralSource:read('project/mat/studies/conventional-ground-junction.json')}
test('actual Utility receiver floor uses the same source recipe and SE-notched RC pocket',()=>{
 const r=source.candidateFloorPocket,again=deriveUtilityCandidateFloorPocket(input)
 assert.deepEqual(r,again)
 assert.equal(r.pocket.levels.ffl,530)
 assert.deepEqual(r.pocket.levels.dryRC,[-30,170])
 assert.deepEqual(r.pocket.levels.glass,[170,270])
 assert.deepEqual(r.pocket.levels.accessibleDistribution,[270,515])
 assert.equal(r.currentSavedDocumentAdmitted,false)
 assert.equal(r.nativeFloorOrForceApprovalTransferred,false)
 assert.equal(r.actualRaisedHouseProfileAndReceiverCapacityAccepted,false)
 for(const path of ['project/str/studies/current-house-grid.json','project/str/studies/dry-side-ground-section.json','project/mat/studies/conventional-ground-junction.json'])assert.match(source.sourceObjectDigests[path],/^[a-f0-9]{64}$/)
 assert.ok(input.planExclusionsMm.length>0)
 const rc=r.pocket.local!.levelBoxes.find(q=>q.id==='dryRC')!
 assert.ok(rc.planRectanglesXYMm?.length)
 const contains=(p:readonly number[])=>rc.planRectanglesXYMm!.some(b=>p[0]>=b[0]&&p[0]<=b[2]&&p[1]>=b[1]&&p[1]<=b[3])
 const leg=source.boundary.finishedCoreRectanglesXYMm.find(b=>b[3]-b[1]>b[2]-b[0])!,y=(leg[1]+leg[3])/2
 assert.equal(contains([leg[0]-25,y]),false,'An anchor cannot occupy the declared50mm isolation gap')
 assert.equal(contains([leg[0]-75,y]),true,'The actual inward RC body remains available')
})
test('pocket-depth perturbation changes receiver datum and identity while occupied floor stays530',()=>{
 const base=source.candidateFloorPocket,changed=deriveUtilityCandidateFloorPocket({...input,choice:{...input.choice,depthMm:230}})
 assert.equal(changed.pocket.levels.dryRC[1],185)
 assert.equal(changed.pocket.levels.ffl,530)
 assert.notEqual(changed.bindingDigest,base.bindingDigest)
 assert.equal(changed.nativeFloorOrForceApprovalTransferred,false)
 const tooDeep=deriveUtilityCandidateFloorPocket({...input,choice:{...input.choice,depthMm:250}})
 assert.equal(tooDeep.pocket.local!.necessaryGeometryScreen,false)
 assert.ok(tooDeep.pocket.local!.diagnostics.includes('LOCAL_POCKET_INTRUDES_COLD_GRID'))
})
test('source-level changes invalidate the current occupied receiver frame rather than mixing datums',()=>{
 const defaults=JSON.parse(JSON.stringify(input.defaults));defaults.commonSettings.serviceZoneMm=70
 assert.throws(()=>deriveUtilityCandidateFloorPocket({...input,defaults}),/occupied FFL530/)
 const layers=[...input.sourceGroundLayers];layers[3]-=5
 assert.throws(()=>deriveUtilityCandidateFloorPocket({...input,sourceGroundLayers:layers}),/source floor-layer/)
})
test('restoring the old rectangular floor changes stock and identity and cannot credit the notched receiver',()=>{
 const current=source.candidateFloorPocket,rectangle=deriveUtilityCandidateFloorPocket({...input,planExclusionsMm:[]})
 assert.ok(rectangle.pocket.local!.quantityBounds.dryRcM3>current.pocket.local!.quantityBounds.dryRcM3)
 assert.notEqual(rectangle.bindingDigest,current.bindingDigest)
 assert.equal(rectangle.nativeFloorOrForceApprovalTransferred,false)
})
test('the complete route reader admits only bounded owning floor controls',()=>{
 const choice=read('project/had/studies/inlet-utility-compact-route.json')
 assert.deepEqual(admitUtilityRouteChoice(choice).candidateFloorPocket,choice.candidateFloorPocket)
 assert.throws(()=>admitUtilityRouteChoice({...choice,candidateFloorPocket:{...choice.candidateFloorPocket,unownedOverride:true}}),/complete Utility candidate floor controls/)
 assert.throws(()=>admitUtilityRouteChoice({...choice,candidateFloorPocket:{...choice.candidateFloorPocket,depthMm:351}}),/complete Utility candidate floor controls/)
 assert.throws(()=>admitUtilityRouteChoice({...choice,candidateFloorPocket:null}),/complete Utility candidate floor controls/)
})
