import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import test from 'node:test'

const root=new URL('../project/had/studies/',import.meta.url)
const read=(name:string)=>readFileSync(new URL(name,root),'utf8')

test('east court escape window and pier alternatives remain source-derived and do not claim structural admission',()=>{
 const generator=fileURLToPath(new URL('east-egress-pier-scan.mjs',root))
 assert.match(execFileSync(process.execPath,['--import','tsx',generator,'--check'],{encoding:'utf8',timeout:45000}),/HAD east-egress geometry verified/)
 const data=JSON.parse(read('east-egress-pier-scan.json'))
 assert.equal(data.basis,'RH-LAYOUT-REVISION-02')
 assert.equal(data.source.envelope,417.5)
 assert.deepEqual(data.source.courtPier,[5650,6350])
 assert.deepEqual(data.source.outerPier,[5300,6900])
 assert.deepEqual(data.source.commonPier,[5650,6350])
 assert.deepEqual(data.source.commonWindow,[6900,7350])
 assert.deepEqual(data.source.plantReplacementDoor,[3900,5300])
 assert.equal(data.scenarios.oldPantry.outerBayOverhang,50)
 assert.equal(data.scenarios.oldPantry.courtBayOverhang,0)
 assert.deepEqual(data.scenarios.shiftedPantry.nominalCommonWindowSideMargins,[75,75])
 assert.deepEqual(data.scenarios.pierPlant.nominalCourtPierSideMargins,[200,200])
 assert.deepEqual(data.scenarios.pierPlant.nominalOuterPierSideMargins,[550,750])
 assert.equal(data.scenarios.pierPlant.plantDryOverlapY,300)
 assert.equal(data.scenarios.pierPlant.plantWorkingOverlapY,300)
 assert.equal(data.scenarios.pierPlant.riserOverlapY,0)
 assert.equal(data.scenarios.pierPlant.room,'G-PLANT')
 assert.equal(data.scenarios.oldPantry.room,'G-PANTRY')
 assert.match(data.scope,/UNADOPTED/)
 const svg=read('east-egress-pier-scan.svg')
 assert.match(svg,/viewBox="0 0 420 297"/)
 assert.match(svg,/No roof-water capacity/)
 assert.match(svg,/NOT openings already cut/)
})
