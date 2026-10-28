import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createSectionExemplar,design,roofHeight} from './georgian/section-exemplar.js'
test('section distinguishes doorway, roof-space structure and foundation unknowns',()=>{
 const s=createSectionExemplar('PRINCIPAL',100)
 for(const id of ['courtyard-door-leaf','courtyard-threshold','roof-ceiling-member-417.5','limited-storage-deck-1000','ground-build-up-0','foundation-axis-outer-south','foundation-key'])assert.ok(s.primitives.some(p=>p.id===id),id)
 assert.equal(design.floor.foundationDepthSelected,false)
 assert.ok(!s.primitives.some(p=>p.id.startsWith('storage-reserve-')||p.id.startsWith('timber-end-')))
 const key=s.primitives.find(p=>p.id==='foundation-key');assert.ok(key?.kind==='text'&&key.value.includes('unresolved'))
})
test('longitudinal timber ends remain in room with separated indicative seats',()=>{
 const s=createSectionExemplar('PRINCIPAL',100),j=s.primitives.find(p=>p.id==='timber-joist-0')!
 assert.ok(j.kind==='path');assert.equal(Math.min(...j.rings.flat().map(p=>p.x)),12.5+(417.5+25)/100)
 assert.ok(s.primitives.some(p=>p.id==='seat-left-0'))
 assert.ok(roofHeight(442.5)-300>=6690,'roof-space member must clear nominal underside')
})
test('internal leaf strokes are lighter and beyond-cut windows retain full nominal articulation',()=>{
 const s=createSectionExemplar('PRINCIPAL',100)
 for(const id of ['weather-leaves','inner-floor-partition']){const p=s.primitives.find(p=>p.id===id)!;assert.ok(p.kind==='path'&&p.stroke==='primary')}
 assert.equal(s.primitives.filter(p=>p.id.startsWith('beyond-detail-')).length,12)
 assert.ok(s.primitives.filter(p=>p.id.startsWith('beyond-detail-')).every(p=>p.kind==='path'&&p.stroke==='secondary'))
})
