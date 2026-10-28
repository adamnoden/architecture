import assert from 'node:assert/strict'
import {test} from 'node:test'
import {design,createSectionExemplar} from './georgian/section-exemplar.js'
test('floor separates timber, deck, service void and ceiling within the held 350 mm zone',()=>{
 const f=design.floor;assert.equal(f.finish+f.deck+f.joist+f.serviceVoid+f.ceiling,350)
 const s=createSectionExemplar('PRINCIPAL',100)
 for(const id of ['floor-finish-0','floor-deck-0','timber-joist-0','service-void-0','ceiling-0','front-door-leaf','front-threshold'])assert.ok(s.primitives.some(p=>p.id===id),id)
 const wall=s.primitives.find(p=>p.id==='inner-floor-partition')!,floor=s.primitives.find(p=>p.id==='timber-joist-0')!
 assert.equal(wall.kind,'path');assert.equal(floor.kind,'path');assert.notEqual(wall.fill,floor.fill)
 assert.equal(s.primitives.find(p=>p.id==='weather-leaves')!.kind,'path')
})
test('facade replaces detached head/sill strokes and gives paired leaves independent panels/fanlight',()=>{
 const s=createSectionExemplar('FRONT',100)
 assert.ok(!s.primitives.some(p=>p.id.endsWith('-sill')||p.id.endsWith('-head')))
 assert.equal(s.primitives.filter(p=>p.id.startsWith('panel-')).length,12)
 for(const id of ['fanlight-frame','door-frame','meeting-stile'])assert.ok(s.primitives.some(p=>p.id===id))
 assert.ok(s.primitives.filter(p=>p.id.includes('-head-profile')||p.id.includes('-sill-profile')).length===18)
})
