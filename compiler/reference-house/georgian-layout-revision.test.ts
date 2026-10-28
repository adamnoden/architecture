import assert from 'node:assert/strict'
import {test} from 'node:test'
import {layoutRevision as d,entryVoid,revisionOpenings,createRevisionPlan,createRevisionScene} from './georgian/layout-revision.js'
import {revisionMetrics,auditRevisionAccess} from './georgian/layout-revision-audit.js'
const overlap=(a:{x:number;y:number;width:number;depth:number},b:typeof a)=>Math.min(a.x+a.width,b.x+b.width)>Math.max(a.x,b.x)&&Math.min(a.y+a.depth,b.y+b.depth)>Math.max(a.y,b.y)
test('revision earns both stair alignments and a continuous west-gallery / arrival route',()=>{
 const m=revisionMetrics();assert.equal(m.westGalleryMm,1015);assert.equal(m.stairNorth,m.courtNorthOuterFace);assert.equal(d.stair.y,3832.5);assert.ok(m.stairSouthLandingMm>=d.stair.flight);assert.ok(m.upperBridgeClearMm>=1000);assert.equal(m.pantryNorthRoomFace,m.courtNorthRoomFace);assert.ok(m.studyClearAreaM2>m.formerStudyClearAreaM2)
 for(const level of ['GROUND','FIRST'] as const){const a=auditRevisionAccess(level);assert.equal(a.pass,true,JSON.stringify(a));assert.equal(a.courtyardShortcut,false);assert.equal(a.furnitureCarryingVerified,false);createRevisionPlan(level);for(const scale of [50,100] as const){const s=createRevisionScene(level,scale);assert.equal(new Set(s.primitives.map(p=>p.id)).size,s.primitives.length)}}
})
test('rooms and upper void do not overlap, while plant reserves and furniture remain inside their rooms',()=>{
 for(const level of ['GROUND','FIRST'] as const){const boxes=d.rooms[level].flatMap(r=>r.boxes.map(b=>({id:r.id,...b})));for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)assert.equal(overlap(boxes[i],boxes[j]),false,boxes[i].id+' / '+boxes[j].id);if(level==='FIRST')for(const b of boxes)assert.equal(overlap(b,entryVoid),false,b.id)}
 for(const [id,room]of [['studyDesk','G-STUDY'],['cloakHanging','G-CLOAK'],['bed2','U-BED2'],['bed3','U-BED3'],['bed4','U-BED4'],['principal','U-PRINCIPAL']] as const){const f=d.furniture[id],r=[...d.rooms.GROUND,...d.rooms.FIRST].find(r=>r.id===room)!;assert.ok(Math.abs(r.boxes.reduce((a,b)=>a+Math.max(0,Math.min(f.x+f.width,b.x+b.width)-Math.max(f.x,b.x))*Math.max(0,Math.min(f.y+f.depth,b.y+b.depth)-Math.max(f.y,b.y)),0)-f.width*f.depth)<1e-6,id)}
 const plant=d.rooms.GROUND.find(r=>r.id==='G-PLANT')!.boxes[0],reserves=[d.services.plantWater,d.services.plantDry,d.services.riser,d.services.plantWorking]
 for(const b of reserves){assert.ok(b.x>=plant.x+62.5&&b.x+b.width<=11582.5&&b.y>plant.y+62.5&&b.y+b.depth<plant.y+plant.depth-62.5)}
 for(let i=0;i<reserves.length;i++)for(let j=i+1;j<reserves.length;j++)assert.equal(overlap(reserves[i],reserves[j]),false)
})
test('centred doors, matching north axes and independently accessed north bedroom retain four bedrooms',()=>{
 const g=revisionOpenings('GROUND'),f=revisionOpenings('FIRST');const court=g.find(o=>o.id==='grand-court-entry-south')!,garden=g.find(o=>o.id==='garden-entry')!;assert.equal(court.wall,'court-south');assert.equal(court.centre,garden.centre);assert.equal(court.width,garden.width);assert.equal(court.width,2400);assert.equal(g.filter(o=>o.wall==='court-north'&&o.kind==='door').length,1)
 assert.deepEqual(g.filter(o=>o.wall==='outer-north'&&o.kind==='window').map(o=>o.centre),[1800,3900,8100,10200]);assert.deepEqual(f.filter(o=>o.wall==='outer-north').map(o=>o.centre),[1800,3900,8100,10200])
 assert.equal(f.find(o=>o.id==='bed4-door')?.centre,3300);assert.equal(d.rooms.FIRST.filter(r=>['U-BED2','U-BED3','U-BED4','U-PRINCIPAL'].includes(r.id)).length,4);assert.ok(entryVoid.guardHeightSelected===false)
})

test('partition ends clear facade and courtyard apertures by an authored 125 mm margin',()=>{
 const margin=125,half=d.partition/2,t=d.envelope,c=d.court
 const hosts:Record<string,{horizontal:boolean;lo:number;hi:number}>= {'outer-south':{horizontal:true,lo:0,hi:t},'outer-north':{horizontal:true,lo:12000-t,hi:12000},'outer-west':{horizontal:false,lo:0,hi:t},'outer-east':{horizontal:false,lo:12000-t,hi:12000},'court-south':{horizontal:true,lo:c.y-t,hi:c.y},'court-north':{horizontal:true,lo:c.y+c.depth,hi:c.y+c.depth+t},'court-west':{horizontal:false,lo:c.x-t,hi:c.x},'court-east':{horizontal:false,lo:c.x+c.width,hi:c.x+c.width+t}}
 for(const level of ['GROUND','FIRST'] as const)for(const w of d.partitions[level])for(const o of revisionOpenings(level).filter(o=>hosts[o.wall])){
  const h=hosts[o.wall],x0=Math.min(w.a[0],w.b[0])-half,x1=Math.max(w.a[0],w.b[0])+half,y0=Math.min(w.a[1],w.b[1])-half,y1=Math.max(w.a[1],w.b[1])+half,cross0=h.horizontal?y0:x0,cross1=h.horizontal?y1:x1,along0=h.horizontal?x0:y0,along1=h.horizontal?x1:y1
  if(cross1<h.lo-1e-6||cross0>h.hi+1e-6)continue
  // Court host face is finite; its corner continuation still contains no opening outside these extents.
  assert.ok(along1<=o.centre-o.width/2-margin||along0>=o.centre+o.width/2+margin,`${level} ${w.id} at ${o.wall}/${o.id}`)
 }
 assert.equal(entryVoid.x,4800+d.partition/2);assert.equal(entryVoid.x+entryVoid.width,7200-d.partition/2);assert.equal(entryVoid.y+entryVoid.depth,2650+d.partition/2)
})
