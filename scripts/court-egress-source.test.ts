import test from 'node:test'
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'

const root=new URL('../project/had/studies/',import.meta.url)
const study=(name:string)=>readFileSync(new URL(name,root),'utf8')

test('HAD-03 architectural court plan and paired sections are fresh to accepted source',()=>{
 const cli=fileURLToPath(new URL('court-egress-study.mjs',root))
 const stdout=execFileSync(process.execPath,['--import','tsx',cli,'--check'],{encoding:'utf8',timeout:45000})
 assert.match(stdout,/generated evidence verified/)
 const j=JSON.parse(study('court-egress-study.json'))
 assert.equal(j.basis,'RH-LAYOUT-REVISION-02')
 assert.equal(j.plan.north.length,4250)
 assert.equal(j.plan.east.length,4250)
 assert.deepEqual(j.plan.east.galleryClear,[8167.5,9437.5])
 assert.deepEqual(j.plan.east.spine,[9437.5,9562.5])
 assert.deepEqual(j.plan.east.pantryClear,[9562.5,11582.5])
 assert.equal(j.comparison.raisedFFLRelativeToFixedSchematicGrade,1200)
 assert.equal(j.comparison.raisedFFLRelativeToExisting,1050)
 assert.equal(j.comparison.lowestSusceptibleJoin,'unknown')
 assert.equal(j.comparison.actualReceivingLevels,'unknown')
 assert.equal(j.loggia.displacedRectangleM2,9.198)
 for(const name of ['court-egress-plan.svg','court-egress-north-section.svg','court-egress-east-section.svg']){
  const svg=study(name)
  assert.match(svg,/viewBox="0 0 420 297"/)
  assert.match(svg,/UNDEFINED/)
  assert.match(svg,/NOT AN ACCEPTED|exploratory geometry only/)
 }
})

test('joined local portals preserve full repair width, segmented release and explicit non-acceptance',()=>{
 const j=JSON.parse(study('court-local-portals.json'))
 const d=j.referenceDesign
 assert.equal(j.basis,'RH-LAYOUT-REVISION-02')
 assert.equal(d.wholeHouseRiseRelativeToExisting,300)
 assert.equal(d.relativeFFLAboveSyntheticReceiver,450)
 assert.equal(d.outletInvert,-362.5)
 assert.equal(d.outletInvertClearanceAboveSyntheticReceiver,87.5)
 assert.equal(d.minCrownDepth-d.coverDepth,d.installationSpaceBelowCover)
 assert.equal(d.normalPanLow-d.inletInvert,d.normalCollectorToCarrierDrop)
 assert.equal(d.emergencyOperatingWater,'unknown')
 assert.equal(d.lowestSusceptibleJoint,'unknown')
 assert.equal(d.completeMaterialAssembly,'unqualified')
 assert.deepEqual(j.slots.north.band,[5700,6300])
 assert.deepEqual(j.slots.east.band,[6825,7425])
 assert.equal(j.eastConsequences.courtProjectionOverrun,75)
 assert.equal(j.eastConsequences.outerProjectionOverrun,75)
 assert.deepEqual(j.eastConsequences.remainingPantryStrips,[175,680])
 assert.equal(j.rejectedPier.fixedPlantDryOverlap,600)
 assert.equal(j.rejectedPier.workingFloorOverlap,600)
 for(const s of Object.values(j.slots) as any[]){
  assert.equal(s.band[1]-s.band[0],d.grossAccessWidth)
  assert.equal(s.coverBreaks[0],7750)
  assert.equal(s.coverBreaks.at(-1),12000)
  assert.ok(s.coverSegments.every((n:number)=>n>0&&n<=500))
  assert.ok(Math.abs(s.coverSegments.reduce((a:number,b:number)=>a+b,0)-4250)<1e-8)
 }
 assert.ok(j.slots.east.coverBreaks.includes(9437.5))
 assert.ok(j.slots.east.coverBreaks.includes(9562.5))
 assert.equal((d.grossAccessWidth-j.repair.carrierJointEnvelopeWidth)/2,j.repair.clearSideToolSpace)
 assert.match(j.repair.firstRelease,/N alone is not equivalent redundancy/)
 assert.match(j.acceptance,/NOT ACCEPTED/)
 for(const name of ['court-local-portals-plan.svg','court-local-portals-sections.svg']){
  const svg=study(name)
  assert.match(svg,/viewBox="0 0 420 297"/)
  assert.match(svg,/UNADOPTED reference design/)
  assert.match(svg,/RWT-06 remains blocked/)
 }
})
