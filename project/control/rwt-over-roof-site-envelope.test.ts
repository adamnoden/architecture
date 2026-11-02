import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
import {test} from 'node:test'

test('RWT-06 site reservation includes every board/gutter and keeps access claims conditional',()=>{
 const src=JSON.parse(readFileSync('project/rwt/studies/over-roof-service.json','utf8'))
 const out=JSON.parse(readFileSync('project/rwt/studies/over-roof-site-envelope.json','utf8'))
 const boards=out.primitives.filter(p=>p.kind==='scaffold-sole-board')
 assert.equal(boards.length,32)
 const half=src.scaffoldAxisTrial.soleBoardTrialMm/2
 for(const x of [...src.scaffoldAxisTrial.westernAxesMm,...src.scaffoldAxisTrial.easternAxesMm])
  for(const y of src.scaffoldAxisTrial.bayAxesYMm)
   assert.ok(boards.some(b=>b.x[0]===x-half&&b.x[1]===x+half&&b.y[0]===y-half&&b.y[1]===y+half),'missing one physical sole-board reservation')
 const rects=out.primitives.filter(p=>p.kind!=='conditional-gate-swing-envelope')
 const ext={x:[Math.min(...rects.map(p=>p.x[0])),Math.max(...rects.map(p=>p.x[1]))],y:[Math.min(...rects.map(p=>p.y[0])),Math.max(...rects.map(p=>p.y[1]))]}
 assert.deepEqual(out.screening.drawnEquipmentAabb.x,ext.x)
 assert.deepEqual(out.screening.drawnEquipmentAabb.y,ext.y)
 assert.deepEqual(out.screening.drawnEquipmentAabb.sizeMm,[15800,18390])
 assert.deepEqual(out.screening.equipmentPlusConditionalFrontGateAabb.sizeMm,[15800,19190])
 assert.equal(out.screening.beyondRoofSheetMm.westGutter,200)
 assert.equal(out.screening.beyondRoofSheetMm.eastGutter,200)
 assert.equal(out.screening.beyondRoofSheetMm.frontSoleBoards,200)
 assert.equal(out.screening.beyondRoofSheetMm.gardenSoleBoards,200)
 assert.equal(out.screening.beyondRoofSheetMm.additionalFrontGateBeyondEquipment,800)
 assert.equal(out.counterexamples.sheetOnlyCannotContainEquipment,true)
 assert.equal(out.counterexamples.equipmentRectangleDoesNotContainConditionalGate,true)
 assert.equal(out.counterexamples.eastPlantDoorSoleBoardConflictStillUnresolved,true)
 assert.equal(out.counterexamples.idealFirstContactDegrees,src.plantDoorControl.idealFirstContactDegrees)
 assert.match(out.siteHandoff.status,/not a measured/)
 const checked=spawnSync(process.execPath,['project/rwt/studies/over-roof-site-envelope.mjs','--check'],{cwd:process.cwd(),encoding:'utf8',timeout:30000})
 assert.equal(checked.status,0,checked.stderr||checked.stdout)
})
