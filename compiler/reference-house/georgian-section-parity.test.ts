import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createLayoutSection,layoutFamilySource,roofTop} from './georgian/layout-family.js'
import {compileCurrentSectionContext} from './georgian/section-context.js'
const eq=(a:number,b:number)=>Math.abs(a-b)<1e-6
test('accepted principal section projects the real far courtyard roof and host wall',()=>{
 const scene=createLayoutSection('PRINCIPAL',100)
 const lines=scene.primitives.filter(p=>p.kind==='line'&&p.id.startsWith('mesh-'))
 assert.ok(lines.length>5,'projected background required')
 assert.ok(!scene.primitives.some(p=>p.id.startsWith('beyond-')),'old floating aperture glyphs removed')
 assert.ok(lines.some(p=>String(p.metadata?.meaning??'').includes('court-west')),'hosted courtyard geometry')
 assert.ok(lines.some(p=>String(p.metadata?.meaning??'').includes('roof-')),'source-owned roof behind cut')
 assert.ok(lines.some(p=>eq(JSON.parse(String(p.metadata?.modelA)).z,roofTop())||
  eq(JSON.parse(String(p.metadata?.modelB)).z,roofTop())),'a source-derived ridge must be visible')
 assert.ok(scene.primitives.some(p=>p.id==='section-roof-0'),'true section roof cut retained')
})
test('service and principal differ through retained geometry, not hard-coded window selection',()=>{
 const p=createLayoutSection('PRINCIPAL',100),s=createLayoutSection('SERVICE-SECTION',100)
 const context=scene=>scene.primitives.filter(p=>p.kind==='line'&&p.id.startsWith('mesh-'))
 const a=context(p),b=context(s)
 assert.ok(a.length>0&&b.length>0)
 assert.notDeepEqual(a.map(q=>q.id),b.map(q=>q.id))
 for(const scene of [p,s]){
  assert.ok(scene.primitives.every(q=>q.kind!=='line'||[q.a.x,q.a.y,q.b.x,q.b.y].every(Number.isFinite)))
  assert.ok(!scene.primitives.some(q=>q.id.startsWith('beyond-')))
 }
})
test('model geometry doubles at WALL 1:50 while physical cut and context roles remain stable',()=>{
 const b=createLayoutSection('PRINCIPAL',100),w=createLayoutSection('PRINCIPAL',50)
 const s=b.primitives.find(p=>p.kind==='line'&&p.id.startsWith('mesh-')&&Math.hypot(p.b.x-p.a.x,p.b.y-p.a.y)>1)
 assert.ok(s&&s.kind==='line')
 const other=w.primitives.find(p=>p.id===s.id)
 assert.ok(other&&other.kind==='line')
 const len=q=>Math.hypot(q.b.x-q.a.x,q.b.y-q.a.y)
 assert.ok(eq(len(other),2*len(s)))
 assert.equal(s.role,'secondary');assert.equal(other.role,'secondary')
 assert.ok(b.primitives.some(p=>p.id==='section-roof-0'&&p.kind==='path'))
})
test('current cut and beyond data remain source-referenced across roof shapes',()=>{
 for(const station of [layoutFamilySource.cuts.A,layoutFamilySource.cuts.B]){
  const v=compileCurrentSectionContext({station,roofBuildDepth:layoutFamilySource.roofBuildZone})
  assert.equal(v.retainedFaces.some(f=>f.id.startsWith('roof-')),true)
  assert.ok(v.background.length>0)
 }
})
