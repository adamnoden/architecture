import assert from 'node:assert/strict'
import {test} from 'node:test'
import {design,openings,roofTop} from './georgian/source.js'
import {elevationSource,createGeorgianElevation,elevationViews} from './georgian/elevations-01.js'
import {createGeorgianScene} from './georgian/scenes.js'
import {renderDrawingSceneV2SvgWithTokens} from '../publication-drawing-v2/svg.js'
import {PLT_CANDIDATE_TOKENS} from '../publication-drawing-v2/plt-candidate-tokens.js'

test('elevation apertures are the accepted plan apertures with consistent height datums',()=>{
 for(const view of elevationViews){
  const m=elevationSource(view)
  for(const level of ['GROUND','FIRST'] as const){
   const expected=openings(level).filter(o=>o.wall===m.wall),actual=m.apertures.filter(o=>o.level===level)
   assert.equal(actual.length,expected.length)
   for(const a of actual){const o=expected.find(o=>o.id===a.sourceId)!;assert.equal(a.width,o.width);assert.equal(a.u,m.reverse?12000-o.centre:o.centre);assert.equal(a.kind,o.kind);assert.equal(a.head,(level==='GROUND'?0:3450)+2850);assert.equal(a.sill,(level==='GROUND'?0:3450)+(o.kind==='door'?0:750))}
  }
 }
 assert.equal(elevationSource('FRONT').apertures.find(o=>o.sourceId==='front-door')!.u,6000)
 assert.equal(elevationSource('SERVICE').apertures.find(o=>o.sourceId==='plant-replacement')!.width,1400)
})
test('rear view mirrors the asymmetric roof access; side view does not invent dormer cheek extents',()=>{
 const rear=elevationSource('REAR'),access=rear.dormers.find(d=>d.access)!
 assert.equal(access.u,3900);assert.equal(access.sill,design.levels.attic)
 assert.equal(elevationSource('SERVICE').dormers.length,0)
 assert.ok(createGeorgianElevation('SERVICE',100).primitives.some(p=>p.kind==='text'&&p.value.includes('side returns unresolved')))
})
test('courtyard projection retains the tall enclosing wall and distinguishes its grand entry',()=>{
 const entry=elevationSource('COURT-ENTRY'),windows=elevationSource('COURT-WINDOWS')
 assert.equal(entry.apertures.filter(o=>o.level==='GROUND').length,1)
 assert.equal(entry.apertures.find(o=>o.level==='GROUND')!.width,2400)
 assert.equal(windows.apertures.length,4)
 for(const side of ['south','east','west'])for(const level of ['GROUND','FIRST'] as const)assert.deepEqual(openings(level).filter(o=>o.wall==='court-'+side).map(o=>[o.centre,o.width,o.kind]),[[5100,1000,'window'],[6900,1000,'window']])
 const top=createGeorgianElevation('COURT-ENTRY',100).primitives.find(p=>p.id==='court-high-edge')!
 assert.ok(top.kind==='line');assert.equal(top.a.y,18+(12000-roofTop())/100)
})
test('elevation linework omits fictitious storey bands and occludes roof break behind dormers',()=>{
 for(const view of ['FRONT','REAR'] as const){
  const s=createGeorgianElevation(view,100),m=elevationSource(view)
  assert.ok(!s.primitives.some(p=>p.id.startsWith('cornice')))
  const breaks=s.primitives.filter(p=>p.kind==='line'&&p.id.startsWith('roof-break'))
  for(const p of breaks){assert.ok(p.kind==='line');for(const d of m.dormers){const left=12.5+(d.u-d.width/2)/100,right=12.5+(d.u+d.width/2)/100;assert.ok(p.b.x<=left+.00001||p.a.x>=right-.00001)}}
 }
})
test('the five elevation candidates remain vector, deterministic and within BOOK/WALL scene bounds',()=>{
 for(const view of elevationViews)for(const scale of [100,50] as const){
  const s=createGeorgianElevation(view,scale),svg=renderDrawingSceneV2SvgWithTokens(s,PLT_CANDIDATE_TOKENS)
  assert.equal(svg,renderDrawingSceneV2SvgWithTokens(createGeorgianElevation(view,scale),PLT_CANDIDATE_TOKENS));assert.ok(!svg.includes('<image'));assert.equal(s.sourceId,design.id)
  for(const p of s.primitives){if(p.kind==='line')for(const q of [p.a,p.b])assert.ok(q.x>=0&&q.x<=s.widthMm&&q.y>=0&&q.y<=s.heightMm,`${view}/${p.id}`)}
 }
 // Accepted coordination preview remains a separate historical drawing identity.
 assert.equal(createGeorgianScene('FRONT',100).viewId,'GEORGIAN-FRONT-100')
})
