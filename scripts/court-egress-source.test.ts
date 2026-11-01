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
