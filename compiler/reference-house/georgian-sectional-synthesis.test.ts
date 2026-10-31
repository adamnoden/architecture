import assert from 'node:assert/strict'
import {test} from 'node:test'
import {currentSynthesisFaces,synthesisMeshEdges,createCurrentSynthesisScene,synthesisSource} from './georgian/sectional-synthesis.js'
import {layoutRevision as d,revisionOpenings} from './georgian/layout-revision.js'
import {currentRoofZ} from './georgian/layout-family.js'

test('current synthesis clips at the actual south court edge and uses current aperture voids',()=>{
 const faces=currentSynthesisFaces();assert.ok(faces.length>0)
 for(const f of faces)for(const p of f.vertices)assert.ok(p.y>=d.court.y-1e-6,`${f.id}: removed south wing returned`)
 for(const level of ['GROUND','FIRST'] as const)for(const op of revisionOpenings(level).filter(o=>['outer-east','outer-west','outer-north','court-east','court-west','court-north'].includes(o.wall))){
  const alongY=op.wall.endsWith('east')||op.wall.endsWith('west');if(alongY&&op.centre+op.width/2<=d.court.y)continue
  assert.ok(faces.some(f=>f.id.includes(level+'-'+op.id+'-head')),`${level}/${op.id}: aperture omitted`)
 }
 for(const f of faces.filter(f=>f.id.startsWith('roof-')))for(const p of f.vertices){const z=currentRoofZ(p.x,p.y);assert.ok(Math.abs(p.z-z)<.001||Math.abs(p.z-(z-300))<.001,`${f.id}: unsupported roof vertex`)}
})
test('first-floor zone does not bridge the source stair void or the courtyard',()=>{
 const s=d.stair,c=d.court
 for(const f of currentSynthesisFaces().filter(f=>f.id.startsWith('floor-')&&f.vertices.every(p=>p.z===d.levels.first))){
  const x=f.vertices.reduce((s,p)=>s+p.x,0)/f.vertices.length,y=f.vertices.reduce((s,p)=>s+p.y,0)/f.vertices.length
  assert.ok(!(x>s.x&&x<s.x+s.width&&y>s.y&&y<s.y+s.length),'False slab through stair')
  assert.ok(!(x>c.x&&x<c.x+c.width&&y>c.y&&y<c.y+c.depth),'False slab through court')
 }
})
test('opaque candidate suppresses hidden edges and preserves geometry between B5/A4 compositions',()=>{
 const edges=synthesisMeshEdges(currentSynthesisFaces()),b=createCurrentSynthesisScene('BOOK'),a=createCurrentSynthesisScene('BOOK','a4')
 const lines=b.primitives.filter(p=>p.kind==='line'),other=a.primitives.filter(p=>p.kind==='line');assert.ok(lines.length>0&&lines.length<edges.length);assert.equal(lines.length,other.length)
 for(let i=0;i<lines.length;i++){const l=lines[i],r=other[i];assert.equal(l.role,r.role);assert.equal(l.metadata?.modelA,r.metadata?.modelA);assert.equal(l.metadata?.modelB,r.metadata?.modelB);for(const p of ['a','b'] as const){assert.ok(Math.abs(r[p].x-l[p].x-34)<1e-8);assert.ok(Math.abs(r[p].y-l[p].y-23.5)<1e-8)}}
 for(const scene of [b,a,createCurrentSynthesisScene('WALL')]){
  assert.equal(scene.scaleDenominator,'NTS')
  for(const l of scene.primitives.filter(p=>p.kind==='line'))for(const p of [l.a,l.b])assert.ok(p.x>12&&p.x<scene.widthMm-12&&p.y>28&&p.y<scene.heightMm-28,`${scene.viewId}: geometry clipped`)
 }
 assert.equal(synthesisSource.constructionAdequacy,false);assert.equal(synthesisSource.physicalAcceptance,false)
 assert.deepEqual(createCurrentSynthesisScene('BOOK'),b)
})
