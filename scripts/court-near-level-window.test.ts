import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import test from 'node:test'

const root = new URL('../project/had/studies/',import.meta.url)
const read=(name:string)=>readFileSync(new URL(name,root),'utf8')

test('HAD near-level court pan and gravity comparison is reproducible and remains only a geometric screen',()=>{
 const cmd=fileURLToPath(new URL('court-near-level-window.mjs',root))
 const out=execFileSync(process.execPath,['--import','tsx',cmd,'--check'],{encoding:'utf8',timeout:45000})
 assert.match(out,/near-level gravity window verified/)
 const data=JSON.parse(read('court-near-level-window.json'))
 assert.equal(data.basis,'RH-LAYOUT-REVISION-02')
 assert.equal(data.source.courtFall,35)
 assert.equal(data.source.crossingLength,4250)
 assert.equal(data.source.relativeFloorToSyntheticGrade,150)
 assert.equal(data.comparisons.length,5)
 const scenarios=Object.fromEntries(data.comparisons.map((c:any)=>[c.key,c]))
 assert.equal(scenarios.inherited.minimumRelativeFloorAboveReceiver,292.5)
 assert.equal(scenarios.inherited.additionalRelativeRiseNeeded,142.5)
 assert.equal(scenarios['min-pedestal'].minimumRelativeFloorAboveReceiver,198.5)
 assert.equal(scenarios['min-pedestal'].additionalRelativeRiseNeeded,48.5)
 assert.equal(scenarios['half-fall'].additionalRelativeRiseNeeded,27.25)
 assert.equal(scenarios.slim.additionalRelativeRiseNeeded,8.5)
 assert.equal(scenarios['no-reserve'].additionalRelativeRiseNeeded,0)
 assert.equal(scenarios['no-reserve'].nominalSurplus,7.75)
 for(const c of data.comparisons){
  assert.equal(c.panLowDepth,c.perimeterDepth+data.source.courtFall)
  assert.equal(c.crossingFall,c.crossingSlope*data.source.crossingLength)
  assert.equal(c.minimumRelativeFloorAboveReceiver,c.panLowDepth+c.inletDrop+c.crossingFall+c.receiverClearance)
  assert.equal(c.additionalRelativeRiseNeeded,Math.max(0,c.minimumRelativeFloorAboveReceiver-150))
 }
 assert.equal(data.emergency.geometricExit,-117.5)
 assert.equal(data.emergency.geometricSurplusAboveIllustrativeClearance,7.5)
 assert.equal(data.emergency.operatingLevel,'unknown')
 assert.equal(data.emergency.firstSusceptibleInterface,'unknown')
 assert.equal(data.emergency.independentReceiver,'unproven')

 const pinch=data.portalPinch
 assert.equal(pinch.maxAllowedInletInvertDepthAtSchematicGrade,82.5)
 assert.equal(pinch.compactCollectorInvertDepth,131)
 assert.equal(pinch.carrierCoverTrials.length,3)
 assert.deepEqual(pinch.carrierCoverTrials.map((c:any)=>c.additionalRelativeRiseNeeded),[48.5,77.5,137.5])
 for(const c of pinch.carrierCoverTrials){
  assert.equal(c.controllingInvertDepth,Math.max(pinch.compactCollectorInvertDepth,c.carrierHeight+c.retainedCover))
  assert.equal(c.requiredRelativeHeight,c.controllingInvertDepth+pinch.crossingFall+pinch.receiverClearance)
  assert.equal(c.additionalRelativeRiseNeeded,Math.max(0,c.requiredRelativeHeight-pinch.availableRelativeHeight))
 }
 assert.equal(pinch.carrierCoverTrials[1].controls,'physical envelope')
 const svg=read('court-near-level-window.svg')
 assert.match(svg,/viewBox="0 0 420 297"/)
 assert.match(svg,/NOT a drain or section acceptance/)
 assert.match(svg,/D = 150/)
 assert.match(svg,/48\.5 mm beyond/)
 assert.match(svg,/48\.5 mm is NOT a buildable passage/)
 assert.doesNotMatch(svg,/-7\.8 spare/)
})
