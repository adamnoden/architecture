import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createLayoutSection} from './georgian/layout-family.js'
test('A1 principal section uses exact 1:25 projection without resizing type or widening source authority',()=>{
 const s=createLayoutSection('PRINCIPAL',25);assert.equal(s.widthMm,594);assert.equal(s.heightMm,841);assert.equal(s.scaleDenominator,25)
 const ground=s.primitives.find(p=>p.id==='datum-ground')!,first=s.primitives.find(p=>p.id==='datum-first')!
 assert.ok(ground.kind==='text'&&first.kind==='text');assert.equal(ground.y-first.y,138)
 const bar=s.primitives.find(p=>p.id==='scale')!;assert.ok(bar.kind==='line');assert.equal(bar.b.x-bar.a.x,120)
 assert.ok(s.primitives.some(p=>p.kind==='text'&&p.value==='1:25'))
 assert.ok(s.primitives.some(p=>p.metadata?.constructionDetailSelected===false))
 for(const p of s.primitives){const points=p.kind==='line'?[p.a,p.b]:p.kind==='path'?p.rings.flat():[{x:p.x,y:p.y}];for(const q of points)assert.ok(q.x>15&&q.x<579&&q.y>30&&q.y<811,p.id+' outside A1')}
})
