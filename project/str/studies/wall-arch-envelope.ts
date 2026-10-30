/** Source-bound geometric sensitivities only. No load, strength or capacity design. */
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {layoutRevision as d,entryVoid,revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'
import {layoutSectionAt} from '../../../compiler/reference-house/georgian/layout-family.js'
import {sectionAssemblyChoices as a} from '../../../compiler/reference-house/georgian/section-source.js'

const checking=process.argv.includes('--check')
const emit=(name:string,body:string)=>{const p=new URL(name,import.meta.url);if(checking){if(readFileSync(p,'utf8')!==body)throw Error(`Stale artifact: ${name}`)}else writeFileSync(p,body)}
const round=(n:number)=>Math.round(n*1000)/1000
const files=['compiler/reference-house/georgian/layout-revision.ts','compiler/reference-house/georgian/layout-family.ts','compiler/reference-house/georgian/section-source.ts','compiler/reference-house/georgian/section-exemplar.ts','compiler/reference-house/georgian/source.ts']
const blob=(path:string)=>{const data=readFileSync(path);return createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex')}
const courtDoor=revisionOpenings('GROUND').find(o=>o.id==='grand-court-entry-south')!
const internalDoor=revisionOpenings('FIRST').find(o=>o.id==='bed2-door')!
const internalWall=d.partitions.FIRST.find(w=>w.id===internalDoor.wall)!
const actualHead=layoutSectionAt(courtDoor.centre).walls.find(w=>w.id==='court-south')!.holes.find(h=>h.id===courtDoor.id)!.hi
const f=a.floor,framingBottom=d.levels.first-f.finish-f.deck-f.joist,seatBottom=framingBottom-f.seatDepth
const arch=(span:number,springing:number,rise:number,ring:number)=>{
 const radius=span*span/(8*rise)+rise/2,centreZ=springing+rise-radius,outerRadius=radius+ring
 const halfAngle=Math.asin(span/(2*radius)),outerHalfSpan=outerRadius*Math.sin(halfAngle)
 return {span,springing,rise,radialRing:ring,radius,outerRadius,centreZ,crownIntrados:springing+rise,crownExtrados:springing+rise+ring,outerHalfSpan:round(outerHalfSpan),outerEndZ:round(centreZ+outerRadius*Math.cos(halfAngle)),outerBeyondOpeningEachSide:round(outerHalfSpan-span/2),halfAngle}
}
const court=arch(courtDoor.width,2250,600,215),interior=arch(internalDoor.width,2250,225,215)
const cores=[140,190,215,440]
const coreCases=cores.map(core=>({core,finishedPartition:core+30,extraAreaForTenMetres:round(10*(core+30-d.partition)/1000),bareLineWeight:round(core/1000*d.levels.ceilingGround/1000*20)}))
const envelopeCases=cores.slice(0,3).map(inner=>{const overall=d.envelope-d.section.inner+inner,wing=d.court.x-2*overall;return {inner,overall,wingClear:wing,westGalleryIfStairWidthHeld:wing-d.stair.width}})
const record={
 scope:'Source geometry and authored wall/arch envelopes; not selected construction, whole-house fit or structural capacity.',
 source:{layout:d.id,sourceBlobs:Object.fromEntries(files.map(p=>[p,blob(p)]))},
 assumptions:{partitionFinishEachFace:15,comparisonWallLength:10000,commonScreeningUnitWeightKNm3:20,weightHeight:d.levels.ceilingGround,weightExclusions:'No openings, finishes, supported floor/roof loads or load factors; common assumed unit weight isolates thickness, not product density.',archGeometry:'Circular intrados and concentric radial ring. Rise, springing and ring are authored studies, not engineered masonry sizes.',wingConvention:'Shell and court faces held; both boundary walls grow into the wing; stair width held and reanchored to shifted outer inner face; no services/handrail tolerance.',thrustModel:'Ideal three-hinged parabolic arch under vertical load uniform per horizontal metre; H=wL²/(8f), V=wL/2. Not the illustrated circular masonry arches or flat arches.'},
 sourceGeometry:{shell:d.shell,court:d.court,envelope:d.envelope,innerLeaf:d.section.inner,weatherLeaf:d.section.weather,cavity:d.section.cavity,innerFinish:d.section.finish,partition:d.partition,ceiling:d.levels.ceilingGround,firstFFL:d.levels.first,framingBottom,seatBottom,nominalCourtHead:actualHead,representedHeadDepth:a.headZone,headToCeiling:d.levels.ceilingGround-actualHead},
 coreCases,envelopeCases,
 court:{...court,centreX:courtDoor.centre,doorInterval:[courtDoor.centre-courtDoor.width/2,courtDoor.centre+courtDoor.width/2],nominalSideStrips:[courtDoor.centre-courtDoor.width/2-d.court.x,d.court.x+d.court.width-courtDoor.centre-courtDoor.width/2],voidEdgeReactionLines:[entryVoid.x,entryVoid.x+entryVoid.width],reactionInsetFromDoorEachSide:round((courtDoor.width-entryVoid.width)/2),ceilingGap:d.levels.ceilingGround-court.crownExtrados,seatGap:seatBottom-court.crownExtrados,framingGap:framingBottom-court.crownExtrados,originalHeadAsSpringingCrown:actualHead+court.rise+court.radialRing,originalHeadAsSpringingExcessOverFraming:actualHead+court.rise+court.radialRing-framingBottom,capacity:'Unknown. No bearing spread, pier adequacy or permissible floor reaction inferred.'},
 interior:{...interior,id:internalDoor.id,wall:internalWall.id,wallY:internalWall.a[1],centreX:internalDoor.centre,doorInterval:[internalDoor.centre-internalDoor.width/2,internalDoor.centre+internalDoor.width/2],nominalWallEnds:[internalWall.a[0],internalWall.b[0]],rightStrip:internalWall.b[0]-internalDoor.centre-internalDoor.width/2,relativeCeiling:d.levels.ceilingFirst-d.levels.first,ceilingGap:d.levels.ceilingFirst-d.levels.first-interior.crownExtrados,supportedLoad:'Own arch and overlying wall only unless this wall is explicitly assigned a bearing role; no floor/roof load assumed.'},
 thrustSensitivity:[600,300,150].map(rise=>({span:courtDoor.width,rise,HtoV:courtDoor.width/(4*rise)}))
}
emit('./wall-arch-envelope.json',JSON.stringify(record,null,2)+'\n')
const esc=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;')
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="#fff"/><style>text{font-family:Arial,sans-serif;font-size:3.1px;fill:#192e3a}.title{font-size:6px;font-weight:700}.sub{font-size:4px;font-weight:700}.dim{fill:none;stroke:#36758a;stroke-width:.35}.edge{fill:none;stroke:#263d47;stroke-width:.4}.warn{fill:none;stroke:#b14932;stroke-width:.45;stroke-dasharray:2 1}.small{font-size:2.8px}</style>'
const text=(x:number,y:number,s:string,c='')=>svg+=`<text x="${x}" y="${y}" class="${c}">${esc(s)}</text>`
const line=(x:number,y:number,xx:number,yy:number,c='dim')=>svg+=`<path d="M${x},${y} L${xx},${yy}" class="${c}"/>`
const box=(x:number,y:number,w:number,h:number,fill:string)=>svg+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#5b7078" stroke-width=".25"/>`
const curve=(cx:number,base:number,scale:number,v:ReturnType<typeof arch>)=>{
 const points=(radius:number)=>Array.from({length:81},(_,i)=>{const q=-v.halfAngle+2*v.halfAngle*i/80;return [cx+radius*Math.sin(q)/scale,base-(v.centreZ+radius*Math.cos(q))/scale]})
 const p=[...points(v.outerRadius),...points(v.radius).reverse()]
 svg+=`<path d="${p.map(([x,y],i)=>`${i?'L':'M'}${round(x)},${round(y)}`).join(' ')}Z" fill="#e2b496" stroke="#704d39" stroke-width=".4"/>`
}
text(10,13,'Solid walls and genuine arches: space before capacity','title')
text(10,22,'RH-LAYOUT-REVISION-02 | 30 October 2026 | authored candidate geometry, no structural adequacy or adopted house change')
text(10,33,`A  Court-south head: ${court.span} span / elevation 1:20`,'sub')
const cx=100,base=211.5,scale=20,px=(x:number)=>cx+(x-courtDoor.centre)/scale,pz=(z:number)=>base-z/scale
box(px(d.court.x),pz(d.levels.first),d.court.width/scale,(d.levels.first-framingBottom)/scale,'#e3edf0')
for(const side of [-1,1]){
 const outer=courtDoor.centre+side*d.court.width/2,inner=courtDoor.centre+side*court.span/2,skew=courtDoor.centre+side*court.outerHalfSpan
 const p=[[outer,1800],[inner,1800],[inner,court.springing],[skew,court.outerEndZ],[outer,court.outerEndZ]]
 svg+=`<path d="${p.map(([x,z],i)=>`${i?'L':'M'}${px(x)},${pz(z)}`).join(' ')}Z" fill="#e8e0d6" stroke="#5b7078" stroke-width=".25"/>`
}
curve(cx,base,scale,court)
line(px(record.court.doorInterval[0]),pz(court.springing),px(record.court.doorInterval[1]),pz(court.springing),'warn')
for(const z of [d.levels.ceilingGround,seatBottom,framingBottom])line(px(d.court.x),pz(z),px(d.court.x+d.court.width),pz(z),z===d.levels.ceilingGround?'warn':'dim')
for(const x of record.court.voidEdgeReactionLines){line(px(x),pz(d.levels.first),px(x),pz(court.crownIntrados-50),'warn');text(px(x)-7,pz(d.levels.first)-3,String(x),'small')}
text(191,45,`Floor framing starts ${framingBottom}`)
line(187,pz(framingBottom),189,44)
text(191,52,`Represented seat bottom ${seatBottom}`)
line(187,pz(seatBottom),189,51)
text(191,59,`Ceiling ${d.levels.ceilingGround}`)
line(187,pz(d.levels.ceilingGround),189,58)
text(191,68,`Ring crown ${court.crownExtrados}: ${record.court.ceilingGap} below ceiling`)
text(191,76,`Intrados crown ${court.crownIntrados}`)
text(191,84,`Springing / rectangular head ${court.springing}`)
text(191,92,`${court.rise} rise; hypothetical ${court.radialRing} radial ring`)
text(191,103,'Red lines: possible reaction positions;')
text(191,110,'load magnitudes and spread unknown.')
text(191,119,'Blue band: floor elevation reserve,')
text(191,126,'not a selected spanning member.')
text(10,134,`${record.court.nominalSideStrips[0]} side strip`, 'small');text(155,134,`${record.court.nominalSideStrips[1]} side strip`,'small')
line(px(record.court.doorInterval[0]),132,px(record.court.doorInterval[1]),132);text(87,138,`${court.span} opening`)
text(10,147,`Ring outer ends x ${courtDoor.centre-court.outerHalfSpan} / ${courtDoor.centre+court.outerHalfSpan}, z ${court.outerEndZ}; not bearing-width evidence.`)
text(10,154,'The side strips are not proved abutments. The return walls and foundations must participate explicitly.')
text(10,161,'Only an elevation envelope is shown: inner / outer leaf arches, trays, restraint and door mounts still need sections.')
text(10,176,'B  Wall thickness and the west gallery','sub')
text(10,184,`Held layers: ${d.section.weather} weather + ${d.section.cavity} cavity + inner core + ${d.section.finish} finish; both walls grow into the wing.`)
for(const [i,c]of envelopeCases.entries()){
 const y=193+i*15
 text(10,y,`Inner ${c.inner}`)
 let x=38;for(const [t,fill]of [[d.section.weather,'#e2b496'],[d.section.cavity,'#fff'],[c.inner,'#c7d2d6'],[d.section.finish,'#e8e0d6']]as const){box(x,y-4,t/10,6,fill);x+=t/10}
 text(95,y,`Wall ${c.overall}`);text(124,y,`wing ${c.wingClear}`);text(154,y,`gallery ${c.westGalleryIfStairWidthHeld}`)
}
text(10,240,`The ${d.stair.width}-wide stair is held. Actual room fit, services and circulation duties need the paired house study.`)
text(235,176,`C  Interior bedroom door: ${interior.span} span / 1:20`,'sub')
const ix=264,iy=344
curve(ix,iy,20,interior)
line(ix-interior.span/40,iy-interior.springing/20,ix+interior.span/40,iy-interior.springing/20,'warn')
line(ix-31,iy-record.interior.relativeCeiling/20,ix+31,iy-record.interior.relativeCeiling/20,'dim')
text(303,193,`Ceiling ${record.interior.relativeCeiling} relative to first FFL`)
text(303,201,`Ring crown ${interior.crownExtrados}; gap ${record.interior.ceilingGap}`)
text(303,209,`Crown ${interior.crownIntrados} / springing ${interior.springing}`)
text(303,217,`${interior.rise} rise / ${interior.radialRing} radial ring`)
text(235,242,`${internalDoor.id}: x ${record.interior.doorInterval.join('–')}, y ${record.interior.wallY}; right strip ${record.interior.rightStrip}.`)
text(235,249,'Wall thickness, bonding, abutments and supported loads remain design inputs.')
line(10,258,410,258)
text(10,267,'Ring depth in elevation is independent of wall thickness through the page. Full-size unit setting-out and structural review remain required.')
text(10,275,'Source fingerprints, assumptions and arithmetic: wall-arch-envelope.json. Regenerate: node --import tsx project/str/studies/wall-arch-envelope.ts')
text(10,284,'A3 / print at 100% for stated scales. No loads, strengths, reinforcement, bearings, construction sequence or foundations are designed by this sheet.')
svg+='</svg>\n'
emit('./wall-arch-envelope.svg',svg)
console.log(JSON.stringify({source:record.source.layout,coreCases,envelopeCases,court:{crown:court.crownExtrados,ceilingGap:record.court.ceilingGap,seatGap:record.court.seatGap},interior:{crown:interior.crownExtrados,ceilingGap:record.interior.ceilingGap},checking},null,2))
