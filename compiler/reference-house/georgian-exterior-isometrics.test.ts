import assert from 'node:assert/strict'
import {test} from 'node:test'
import {readFileSync} from 'node:fs'
import {exteriorBasis,exteriorViews,exteriorFaces,exteriorApertures,createExteriorIsometricScene,exteriorSource,exteriorFingerprint,exteriorProfiles} from './georgian/exterior-isometrics.js'
import {layoutRevision as d,revisionOpenings} from './georgian/layout-revision.js'
import {currentRoofZ} from './georgian/layout-family.js'
import {createParallelProjection3D,type ModelFace3D} from '../publication-drawing/projection-3d.js'
import {visibleSpatialSegments} from '../architectural-drawing/spatial-visibility.js'
import {boundaryMeshEdges} from '../architectural-drawing/boundary-mesh-edges.js'
import type {SpatialSegment} from '../architectural-drawing/spatial-line-drawing.js'
import {renderDrawingSceneV2SvgWithTokens} from '../publication-drawing-v2/svg.js'
import {PLT_CANDIDATE_TOKENS} from '../publication-drawing-v2/plt-candidate-tokens.js'

const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`)
test('four upright true-isometric cameras preserve equal axes and actual compass handedness',()=>{
 const expected={'south-west':[-1,-1],'south-east':[1,-1],'north-east':[1,1],'north-west':[-1,1]} as const
 for(const v of exteriorViews){
  const basis=exteriorBasis(v),p=createParallelProjection3D({basis}),axes=[{x:1,y:0,z:0},{x:0,y:1,z:0},{x:0,y:0,z:1}].map(p.project)
  for(const a of axes)close(Math.hypot(a.horizontal,a.vertical),Math.sqrt(2/3))
  close(axes[2].horizontal,0);assert.ok(axes[2].vertical>0)
  for(const a of axes.slice(0,2))close(Math.abs(Math.atan(a.vertical/a.horizontal)),Math.PI/6)
  const [sx,sy]=expected[v]
  for(const [i,j,cosine]of [[0,1,-sx*sy/2],[1,2,-sy/2],[2,0,-sx/2]])close((axes[i].horizontal*axes[j].horizontal+axes[i].vertical*axes[j].vertical)/(2/3),cosine)
  assert.deepEqual(basis.viewDirection.map(Math.sign),[...expected[v],1])
  // Independent non-square 3 × 5 × 7 fixture: camera rotation cannot mirror its axes.
  const q=p.project({x:3,y:5,z:7})
  close(q.horizontal,(-sy*3+sx*5)/Math.sqrt(2));close(q.vertical,(-sx*3-sy*5+14)/Math.sqrt(6))
 }
})

test('each corner hides far facade marks on an independent asymmetric closed box',()=>{
 const p=(x:number,y:number,z:number)=>({x,y,z}),x=3,y=5,z=7
 const faces:ModelFace3D[]=[
  {id:'S',vertices:[p(0,0,0),p(x,0,0),p(x,0,z),p(0,0,z)]},
  {id:'N',vertices:[p(0,y,0),p(x,y,0),p(x,y,z),p(0,y,z)]},
  {id:'W',vertices:[p(0,0,0),p(0,y,0),p(0,y,z),p(0,0,z)]},
  {id:'E',vertices:[p(x,0,0),p(x,y,0),p(x,y,z),p(x,0,z)]},
  {id:'top',vertices:[p(0,0,z),p(x,0,z),p(x,y,z),p(0,y,z)]}
 ]
 const marks:SpatialSegment[]=[['S',p(1,0,1),p(1,0,2)],['N',p(2,y,2),p(2,y,3)],['W',p(0,1,3),p(0,1,4)],['E',p(x,2,4),p(x,2,5)]].map(([id,a,b])=>({id,a,b,meaning:id,role:'secondary'} as SpatialSegment))
 const expected={'south-west':['S','W'],'south-east':['E','S'],'north-east':['E','N'],'north-west':['N','W']}
 for(const view of exteriorViews)assert.deepEqual(visibleSpatialSegments(marks,faces,exteriorBasis(view)).map(e=>e.meaning).sort(),expected[view])
})

test('generic mesh boundary removes triangulation seams without removing real outside edges',()=>{
 const a={x:0,y:0,z:0},b={x:3,y:0,z:0},c={x:3,y:5,z:0},dd={x:0,y:5,z:0}
 const edges=boundaryMeshEdges([{id:'one',vertices:[a,b,c]},{id:'two',vertices:[a,c,dd]}])
 assert.equal(edges.length,4)
 assert.ok(edges.every(e=>e.a.x===e.b.x||e.a.y===e.b.y))
})

test('complete roof/enclosure and all 49 exterior apertures derive from current source without a cut',()=>{
 const faces=exteriorFaces(),ops=exteriorApertures()
 for(const side of ['south','east','north','west'])for(const type of ['outer','court'])assert.ok(faces.some(f=>f.id===type+'-'+side))
 assert.ok(faces.some(f=>f.vertices.some(p=>p.y===0)),'front wing missing')
 assert.equal(ops.length,49);assert.equal(ops.filter(o=>o.kind==='window').length,44)
 for(const level of ['GROUND','FIRST'] as const)for(const o of revisionOpenings(level).filter(o=>/^(outer|court)-/.test(o.wall))){
  const q=ops.find(a=>a.id===level+'-'+o.id&&a.host===o.wall)!
  assert.ok(q);assert.equal(q.u,o.centre);assert.equal(q.width,o.width)
  assert.equal(q.sill,(level==='FIRST'?3450:0)+(o.kind==='door'?0:o.sill??750));assert.equal(q.head,(level==='FIRST'?3450:0)+(o.head??2850))
 }
 for(const f of faces.filter(f=>f.id.startsWith('roof-')))for(const p of f.vertices)assert.ok(Math.abs(p.z-currentRoofZ(p.x,p.y))<1e-8||Math.abs(p.z-currentRoofZ(p.x,p.y)+300)<1e-8)
 assert.ok(faces.filter(f=>f.id.startsWith('roof-')).some(f=>f.vertices.some(p=>p.y<0)))
 assert.equal(exteriorSource.roofSelectionFinal,false);assert.equal(exteriorSource.physicalAcceptance,false)
 assert.equal(exteriorSource.constructionAdequacy,false);assert.equal(d.roof.dormerAxes.length,0)
})

test('four deterministic scenes share model/factor/tokens and fit BOOK and WALL without cut strokes',()=>{
 for(const format of ['b5','a4','a2','svg'] as const)for(const view of exteriorViews){
  const scene=createExteriorIsometricScene(view,format),k=exteriorProfiles[format].factor
  assert.equal(scene.scaleDenominator,'NTS');assert.deepEqual(createExteriorIsometricScene(view,format),scene)
  assert.equal(new Set(scene.primitives.map(p=>p.id)).size,scene.primitives.length)
  for(const q of scene.primitives){
   assert.equal(q.kind,'line');if(q.kind!=='line')continue
   assert.notEqual(q.role,'cut');assert.equal(q.metadata?.modelFingerprint,exteriorFingerprint)
   const a=JSON.parse(String(q.metadata?.modelA)),b=JSON.parse(String(q.metadata?.modelB)),p=createParallelProjection3D({basis:exteriorBasis(view)}),aa=p.project(a),bb=p.project(b)
   close(q.b.x-q.a.x,(bb.horizontal-aa.horizontal)*k);close(q.b.y-q.a.y,-(bb.vertical-aa.vertical)*k)
   for(const at of [q.a,q.b])assert.ok(at.x>10&&at.x<scene.widthMm-10&&at.y>10&&at.y<scene.heightMm-10)
  }
  const svg=renderDrawingSceneV2SvgWithTokens(scene,PLT_CANDIDATE_TOKENS)
  assert.ok(!svg.includes('NaN'));assert.ok(!svg.includes('<text'))
 }
})

test('committed direct SVGs are deterministic generated projections',()=>{
 for(const view of exteriorViews){
  const expected=renderDrawingSceneV2SvgWithTokens(createExteriorIsometricScene(view,'svg'),PLT_CANDIDATE_TOKENS)+'\n'
  assert.equal(readFileSync(new URL('../../public/drawings/exterior-isometrics/'+view+'.svg',import.meta.url),'utf8'),expected)
 }
})
