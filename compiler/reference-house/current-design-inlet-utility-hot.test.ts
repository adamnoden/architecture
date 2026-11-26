import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {utilityRetainedHotGeometry} from '../../project/had/studies/incoming-water-terminal.mjs'
const read=(p:string)=>JSON.parse(readFileSync(new URL('../../'+p,import.meta.url),'utf8'))
const input=read('project/had/studies/incoming-water.json').utility.vertices.hot,geometry=utilityRetainedHotGeometry(input)
test('retained actual H0 body, lower terminal and drain have one source function',()=>{
 assert.deepEqual(geometry.isolation.axis,[10840,1345,1500])
 assert.deepEqual(geometry.isolation.bodyBox,[10803,1308,1417.5,74,147,165])
 assert.deepEqual(geometry.terminal.at(-1),[11300,1275,595])
 assert.deepEqual(geometry.drainTee,[11300,1275,365])
 assert.deepEqual(geometry.backbone.slice(0,2),input.slice(0,2))
 assert.equal(geometry.actualPressureIsolationDrainSupportAndRenewalAccepted,false)
 const published=read('project/had/studies/utility-wide-capture.json').hot
 assert.deepEqual(geometry.backbone,published.backbone,'Unchanged physical-geometry control only; receipt source identity/positive qualification is not adopted.')
 assert.deepEqual(geometry.terminal,published.terminal)
 assert.deepEqual(geometry.isolation.bodyBox,published.body)
})
test('source hot-prefix perturbation propagates while the existing local H0 arrangement is unchanged',()=>{
 const shifted=structuredClone(input);shifted[0][0]+=50
 const changed=utilityRetainedHotGeometry(shifted)
 assert.equal(changed.backbone[0][0],geometry.backbone[0][0]+50)
 assert.deepEqual(changed.isolation,geometry.isolation)
 assert.deepEqual(changed.terminal,geometry.terminal)
 assert.throws(()=>utilityRetainedHotGeometry(shifted.slice(1)),/Actual five-point/)
 assert.throws(()=>utilityRetainedHotGeometry([[NaN,0,0],...shifted.slice(1)]),/Actual five-point/)
})
