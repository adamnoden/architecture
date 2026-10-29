/** Source-bound architectural trial, not hydraulic sizing or structural acceptance. */
import {writeFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {layoutRevision as d,revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'
import {layoutFamilySource} from '../../../compiler/reference-house/georgian/layout-family.js'

const sourceFiles=['compiler/reference-house/georgian/layout-revision.ts','compiler/reference-house/georgian/layout-family.ts','compiler/reference-house/georgian/section-source.ts']
const x0=d.court.x+d.court.width,x1=d.shell,e=d.envelope,p=d.partition
const spine=d.partitions.GROUND.find(w=>w.id==='service-spine')!
const pantry=d.rooms.GROUND.find(r=>r.id==='G-PANTRY')!.boxes[0]
if(d.shell!==12000||d.court.x!==4250||d.court.y!==4250||d.court.width!==3500||d.court.depth!==3500||e!==417.5||p!==125||spine.a[0]!==9500||pantry.y!==6650||pantry.depth!==1455) throw Error('Reassess located crossing trial against changed house geometry')
const boundaries=[{id:'court-wall',from:x0,to:x0+e},{id:'service-spine',from:spine.a[0]-p/2,to:spine.a[0]+p/2},{id:'outer-wall',from:x1-e,to:x1}]
const trial={channelWidth:300,ys:[7000,7450],insideDiameter:100,outsideDiameter:110,wall:5,inletInvert:-205,outletInvert:-265,lidBottom:-50,lowerLimit:-300,reliefActivation:-75,maximumOperatingTarget:-50}
const pipeAt=(x:number)=>{const invert=trial.inletInvert+(trial.outletInvert-trial.inletInvert)*(x-x0)/(x1-x0);return{invert,outerBottom:invert-trial.wall,outerCrown:invert+trial.insideDiameter+trial.wall}}
const highRelief={width:400,outerHeight:50,wall:5,inletInvert:-105,outletInvert:-130,crownNear:-60,crownFar:-85,lowerNear:-110,lowerFar:-135,fall:25,gradientDenominator:(x1-x0)/25,freeHeightAboveSchematicGrade:20,topClearanceBelowLid:10}
const windows=revisionOpenings('GROUND').filter(o=>o.kind==='window'&&(o.wall==='court-east'||o.wall==='outer-east')).map(o=>({id:o.id,wall:o.wall,from:o.centre-o.width/2,to:o.centre+o.width/2,sill:o.sill??750}))
const overlap=(a:number,b:number,c:number,f:number)=>Math.max(0,Math.min(b,f)-Math.max(a,c))
const data={
  sourceId:d.id,sources:sourceFiles.map(path=>({path,blob:execFileSync('git',['hash-object',path],{encoding:'utf8'}).trim()})),
  authority:'Unadopted architectural trial. No hydraulic, structural, thermal, threshold or access acceptance.',
  source:{court:d.court,envelope:e,partition:p,groundReserve:layoutFamilySource.groundReserve,pantryClear:{x:pantry.x+p/2,y:pantry.y+p/2,width:d.shell-e-(pantry.x+p/2),depth:pantry.depth-p}},
  trial,highRelief,run:x1-x0,fall:trial.inletInvert-trial.outletInvert,gradientDenominator:(x1-x0)/(trial.inletInvert-trial.outletInvert),
  boundaries:boundaries.map(b=>({...b,width:b.to-b.from,pipeAtNear:pipeAt(b.from),pipeAtFar:pipeAt(b.to),support:'unresolved; grouped openings need actual support design'})),
  openWorkingLengths:[boundaries[1].from-boundaries[0].to,boundaries[2].from-boundaries[1].to],
  minimumBottomSpace:pipeAt(x1).outerBottom-trial.lowerLimit,minimumTopSpace:trial.lidBottom-pipeAt(x0).outerCrown,
  channelSeparation:trial.ys[1]-trial.ys[0]-trial.channelWidth,
  belowSchematicExteriorGrade: -150-trial.outletInvert,
  windowPlanOverlaps:trial.ys.flatMap(y=>windows.map(w=>({y,window:w.id,wall:w.wall,overlap:overlap(y-trial.channelWidth/2,y+trial.channelWidth/2,w.from,w.to)})).filter(w=>w.overlap>0)),
  higherReliefWindowPlanOverlaps:windows.map(w=>({window:w.id,wall:w.wall,overlap:overlap(7000-highRelief.width/2,7000+highRelief.width/2,w.from,w.to)})).filter(w=>w.overlap>0),
  higherReliefPantrySouthMargin:7000-highRelief.width/2-(pantry.y+p/2),
  planFootprintOverlaps:trial.ys.flatMap(y=>Object.entries({riser:d.services.riser,water:d.services.plantWater,dry:d.services.plantDry}).map(([id,b])=>({y,id,overlap:overlap(y-trial.channelWidth/2,y+trial.channelWidth/2,b.y,b.y+b.depth)})).filter(v=>v.overlap>0)),
  unresolved:['actual floor and insulated/load-bearing lid','three grouped support/boundary crossings','actual first vulnerable court interface','hydraulic operating head and inlet capacity','common-cause obstruction and site backwater','high-level receiver access','actual fittings/tool/withdrawal envelopes']
}
writeFileSync(new URL('./court-crossing-trial.json',import.meta.url),JSON.stringify(data,null,2)+'\n')
const esc=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;')
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><style>text{font-family:Arial,sans-serif;font-size:3.1px;fill:#20343e}.title{font-size:6px;font-weight:bold}.sub{font-size:4px;font-weight:bold}.wall{fill:#e0e4e5;stroke:#52646d;stroke-width:.25}.trial{fill:#d4e9f5;stroke:#1e7199;stroke-width:.4}.relief{fill:#e4ddf4;stroke:#72569a;stroke-width:.4}.line{fill:none;stroke:#344d5b;stroke-width:.3}.bad{fill:none;stroke:#b24b35;stroke-width:.55}.dash{stroke-dasharray:2,1}</style>'
const text=(x:number,y:number,s:string,c='')=>{svg+=`<text x="${x}" y="${y}" class="${c}">${esc(s)}</text>`}
const rect=(x:number,y:number,w:number,h:number,c:string)=>{svg+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${c}"/>`}
const line=(x:number,y:number,xx:number,yy:number,c='line')=>{svg+=`<path d="M${x},${y}L${xx},${yy}" class="${c}"/>`}
text(12,14,'Court crossing: located trial and unresolved boundaries','title')
text(12,23,'RWT-06 / 29 October 2026 / current house geometry plus explicit trial dimensions; NOT an adopted drain or safe-route pass')
text(12,33,'A  Plan crop: court, gallery, pantry and exterior / 1:25','sub')
const px=(x:number)=>15+(x-7200)/25,py=(y:number)=>105-(y-6500)/25
for(const b of boundaries)rect(px(b.from),py(8150), (b.to-b.from)/25,(8150-6500)/25,'wall')
rect(px(spine.a[0]),py(pantry.y+p/2), (x1-spine.a[0])/25,p/25,'wall')
rect(px(spine.a[0]),py(pantry.y+pantry.depth+p/2),(x1-spine.a[0])/25,p/25,'wall')
trial.ys.forEach((y,i)=>{const w=i?300:highRelief.width;rect(px(x0),py(y+w/2),(x1-x0)/25,w/25,i?'trial':'relief');text(15,py(y)+1,`${i?'Primary':'Relief'} y${y}`);line(px(x0),py(y),px(x1),py(y))})
text(42,115,'Court wall');text(68,115,'Gallery 1270');text(125,115,'Pantry 2020');text(188,115,'Outer wall')
for(const w of windows.filter(w=>w.to>6500&&w.from<8150)){const x=w.wall==='court-east'?x0:x1;line(px(x),py(Math.max(6500,w.from)),px(x),py(Math.min(8150,w.to)),'bad')}
text(225,43,'Red lines: window intervals above the crossings.','sub')
text(225,53,'Court window: y6350-7350; relief lies below it.')
text(225,61,'Primary300-wide strip overlaps that interval by50.')
text(225,69,'Both outer exits lie under window y6900-7900.')
text(225,81,'Three support/boundary crossings, not a free corridor.')
text(225,89,'Initial300/300: gap150. Wider400 relief: gap100.')
text(225,97,'No selected shelving, lid support or vertical service route.')
text(225,109,'Plan avoidance of plant footprints is not a 3D clash pass.')
text(12,132,'B  Low pipe and higher relief comparison / horizontal 1:20, vertical 1:5','sub')
const sx=(x:number)=>20+(x-x0)/20,sz=(z:number)=>152-z/5
for(const b of boundaries)rect(sx(b.from),sz(60),(b.to-b.from)/20,390/5,'wall')
rect(sx(x0),sz(0),(x1-x0)/20,50/5,'trial')
line(sx(x0),sz(-300),sx(x1),sz(-300),'bad dash')
line(sx(x1),sz(-150),sx(x1+150),sz(-150),'bad')
const a=pipeAt(x0),b=pipeAt(x1)
svg+=`<path d="M${sx(x0)},${sz(highRelief.crownNear)}L${sx(x1)},${sz(highRelief.crownFar)}L${sx(x1)},${sz(highRelief.lowerFar)}L${sx(x0)},${sz(highRelief.lowerNear)}Z" class="relief"/>`
svg+=`<path d="M${sx(x0)},${sz(a.outerCrown)}L${sx(x1)},${sz(b.outerCrown)}L${sx(x1)},${sz(b.outerBottom)}L${sx(x0)},${sz(a.outerBottom)}Z" class="trial"/>`
line(sx(x0),sz(a.invert),sx(x1),sz(b.invert),'line dash')
text(244,149,'Floor0; lid bottom-50; purple higher relief trial')
text(244,160,'Blue round pipe invert-205 to-265; fall60 / run4250')
text(244,171,'Blue bore100 / outside110; no capacity result')
text(244,182,'Purple invert-105 to-130; fall25; width400/height50')
text(244,193,'30 minimum bottom space is UNALLOCATED,')
text(244,201,'not earned support, insulation or tolerance.')
text(244,213,'Grey support territories remain uncut in authority.')
text(244,221,'Actual grouped sleeves/bridges must be designed.')
text(244,232,'Blue outlet115 BELOW nominalgrade; purple20 ABOVE.')
text(244,240,'Purple has only10 below-lid clearance: no admission yet.')
text(15,227,'Existing 300 ground reserve is not free services space.')
text(15,236,'Renew short wall pieces into exposed strips; do not assume')
text(15,244,'a4250 rigid pipe can be withdrawn into the3500 court.')
line(12,252,408,252)
text(12,262,'Relief trial: activation -75; operating target -50 UNCOMPUTED. Lowest vulnerable court boundary and landings remain unknown.')
text(12,271,'Separate inlets/carriers/receivers must bypass the named primary obstruction; adjacency does not eliminate common debris or backwater.')
text(12,281,'No foundation, floor assembly, hydraulic capacity, material, tower or construction approval. Read rwt-06-access-court-transition.md.')
svg+='</svg>\n';writeFileSync(new URL('./court-crossing-trial.svg',import.meta.url),svg)
console.log(JSON.stringify(data,null,2))
