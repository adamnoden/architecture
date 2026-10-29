/** Source-bound early feasibility comparison; no equipment or assembly adoption. */
import {readFileSync,writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {layoutRevision as d,revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'
type Rect={id:string,x:number,y:number,w:number,h:number}
const r=(id:string,x:number,y:number,w:number,h:number):Rect=>({id,x,y,w,h})
const plant=d.rooms.GROUND.find(q=>q.id==='G-PLANT')!.boxes[0]
const opening=revisionOpenings('GROUND').find(q=>q.id==='plant-replacement')!
if(d.id!=='RH-LAYOUT-REVISION-02'||plant.x!==9500||plant.y!==2550||plant.width!==2500||plant.depth!==4100||d.envelope!==417.5||d.partition!==125||d.floor.serviceVoid!==55||opening.centre!==4600||opening.width!==1400)throw Error('Current basis changed; reappraise study')
const clear=r('plant clear',plant.x+d.partition/2,plant.y+d.partition/2,plant.width-d.partition/2-d.envelope,plant.depth-d.partition)
const box=(id:string,b:{x:number,y:number,width:number,depth:number})=>r(id,b.x,b.y,b.width,b.depth)
const water=box('source water reservation',d.services.plantWater),dry=box('source dry reservation',d.services.plantDry),riser=box('source riser',d.services.riser),working=box('source working strip',d.services.plantWorking)
if(water.x!==9862.5||water.y!==3600||water.w!==700||water.h!==700||dry.x!==9862.5||dry.y!==5400||dry.w!==500||dry.h!==1000||riser.w!==550||riser.h!==700)throw Error('Service reservations changed')
const q=r('Q350 body trial',dry.x,dry.y,570,725),front=r('Q350 1000 front service',q.x+q.w,q.y,1000,q.h)
const cylinder=r('580 cylinder bounding square',water.x+60,water.y+60,580,580)
const inside=(a:Rect,b:Rect)=>a.x>=b.x&&a.y>=b.y&&a.x+a.w<=b.x+b.w&&a.y+a.h<=b.y+b.h
const overlap=(a:Rect,b:Rect)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y
if(!inside(q,clear)||!inside(front,clear)||!inside(cylinder,water)||overlap(front,riser)||overlap(q,riser))throw Error('Plant comparison no longer fits')
// 700 square is an authored trolley/handling comparison, not a product package.
const centres=[[10212.5,3950],[11112.5,3950],[11112.5,4600],[12350,4600]]
const swept=centres.slice(1).map(([x,y],i)=>{const [xx,yy]=centres[i];return r('transport sweep '+i,Math.min(x,xx)-350,Math.min(y,yy)-350,Math.abs(x-xx)+700,Math.abs(y-yy)+700)})
for(const a of swept)if([riser,q].some(b=>overlap(a,b)))throw Error('Transport conflicts with represented fixed object')
if(!inside(swept[0],clear)||!inside(swept[1],clear)||swept[2].y<opening.centre-opening.width/2||swept[2].y+swept[2].h>opening.centre+opening.width/2)throw Error('Transport misses room/aperture')
// Q350 is wider than the water-plant 700 square: test its own envelope.
const qCentres=[[10147.5,5762.5],[11112.5,5762.5],[11112.5,4600],[12350,4600]]
const qSwept=qCentres.slice(1).map(([x,y],i)=>{const [xx,yy]=qCentres[i];return r('Q transport sweep '+i,Math.min(x,xx)-335,Math.min(y,yy)-412.5,Math.abs(x-xx)+670,Math.abs(y-yy)+825)})
for(const a of qSwept)if([riser,water].some(b=>overlap(a,b)))throw Error('Q transport conflicts with represented fixed object')
if(!inside(qSwept[0],clear)||!inside(qSwept[1],clear)||qSwept[2].y<opening.centre-opening.width/2||qSwept[2].y+qSwept[2].h>opening.centre+opening.width/2)throw Error('Q transport misses room/aperture')
// Illustrative section only: 25 per side is an authored shell reservation.
const core=r('assumed inner riser',25,25,riser.w-50,riser.h-50)
const pack=[r('duct A 250 envelope',50,50,250,250),r('duct B 250 envelope',50,325,250,250),r('soil body 110',350,50,110,110),r('water A 72 envelope',350,210,72,72),r('water B 72 envelope',350,305,72,72),r('water C 72 envelope',350,400,72,72),r('dry containment 100 x 50',350,575,100,50)]
if(pack.some(a=>!inside(a,core))||pack.some((a,i)=>pack.slice(i+1).some(b=>overlap(a,b))))throw Error('Illustrative packing overlap')
const checks={plantClear:[clear.w,clear.h],plantAreaM2:clear.w*clear.h/1e6,dryBodyDepthDeficit:q.w-dry.w,frontFieldEastMargin:clear.x+clear.w-front.x-front.w,transportPlan:'conditional clear for represented objects only',riserGross:[riser.w,riser.h],assumedRiserInner:[core.w,core.h],branch75Deficit:75-d.floor.serviceVoid,trunk190Deficit:190-d.floor.serviceVoid,trial250Deficit:250-d.floor.serviceVoid,lining250MinusTrial250:d.services.upperLining.width-250,panelToLiningGap:d.services.upperLining.x-(9500+d.partition/2)}
if(checks.dryBodyDepthDeficit!==70||checks.branch75Deficit!==20||checks.panelToLiningGap!==300)throw Error('Unexpected study arithmetic')
const output={basis:d.id,scope:'unadopted physical envelopes; no duty, performance, support, boundary or installed-route acceptance',clear,water,dry,riser,working,q,front,cylinder,transport:{waterSquare:700,centres,swept,qRectangle:[670,825],qCentres,qSwept,externalNominalOpening:opening.width,verticalAndOutsideRoute:'unproved'},packing:{core,pack,assumptions:'250 duct envelopes, 72 insulated-water envelopes, 110 soil body, 100x50 dry containment; no joints/bends/maintenance or segregation proof'},checks}
const svg:string[]=[];const add=(s:string)=>svg.push(s),text=(x:number,y:number,s:string,size=2.5)=>add(`<text x="${x}" y="${y}" font-size="${size}">${s}</text>`)
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="DejaVu Sans,sans-serif" fill="#213c46"><rect width="420" height="297" fill="#fffef9"/>')
text(14,15,'BCR / services: physical budgets before system selection',5)
text(14,23,'RH-LAYOUT-REVISION-02 · A3 study · dimensions mm · all equipment and packing remain comparisons',3)
text(14,35,'Plant plan / 1:25 / north up',3.3)
const px=(x:number)=>15+(x-clear.x)/25,py=(y:number)=>205-(y-clear.y)/25
const rect=(a:Rect,fill:string,dash=false)=>add(`<rect x="${px(a.x)}" y="${py(a.y+a.h)}" width="${a.w/25}" height="${a.h/25}" fill="${fill}" fill-opacity=".6" stroke="#60777a" stroke-width=".3" ${dash?'stroke-dasharray="1 1"':''}/>`)
rect(clear,'#f0eee6');rect(water,'#d2dce4',true);rect(dry,'none',true);rect(riser,'#bfc8bd');rect(front,'#e7d8b3');rect(q,'#b0d1dc');rect(cylinder,'#aac6d5')
add(`<line x1="${px(clear.x+clear.w)}" x2="${px(clear.x+clear.w)}" y1="${py(3900)}" y2="${py(5300)}" stroke="#fffef9" stroke-width="1"/>`)
text(98,94,'1400 nominal aperture',2.2)
for(const a of swept)rect(a,'none',true)
add(`<polyline points="${centres.map(([x,y])=>`${px(x)},${py(y)}`).join(' ')}" fill="none" stroke="#b36c45" stroke-width=".7"/>`)
add(`<polyline points="${qCentres.map(([x,y])=>`${px(x)},${py(y)}`).join(' ')}" fill="none" stroke="#33697e" stroke-width=".7" stroke-dasharray="1 1"/>`)
text(px(q.x)+1,py(q.y+380),'Q350 body',2.2);text(px(riser.x)+1,py(riser.y+350),'riser',2.3);text(px(water.x)+1,py(water.y+360),'580 cylinder',2.1)
text(15,214,'2020 × 3975 clear; 8.0295 m²',2.7)
text(15,221,'Dashed: source reserve / 700 transport sweep.',2.3)
text(15,240,'Blue route: separate Q envelope 670 × 825.',2.3)
text(15,228,'Front service field extends 230 beyond',2.3);text(15,233,'the source working strip toward equipment.',2.3)
text(146,35,'Riser section / 1:5',3.3)
add(`<rect x="145" y="45" width="${riser.w/5}" height="${riser.h/5}" fill="#dfded8" stroke="#60777a" stroke-width=".4"/><rect x="150" y="50" width="100" height="130" fill="#fffef9"/>`)
for(const a of pack){add(`<rect x="${145+a.x/5}" y="${45+a.y/5}" width="${a.w/5}" height="${a.h/5}" fill="${a.id.startsWith('duct')?'#c5dbe4':a.id.startsWith('dry')?'#e6c79b':'#c5d4bc'}" stroke="#60777a" stroke-width=".3"/>`);text(146+a.x/5,48+a.y/5,a.id.startsWith('duct')?'250':a.id.startsWith('water')?'72':a.id.startsWith('soil')?'110':'100×50',2.2)}
text(145,196,'Gross 550 × 700; assumed inner 500 × 650.',2.3)
text(145,203,'Bodies fit this illustrative packing only.',2.3)
text(145,210,'No fittings, bends, support design,',2.3)
text(145,217,'service reach or segregation acceptance.',2.3)
text(285,35,'Intermediate floor / 1:2',3.3)
let depth=0
for(const [name,n] of [['finish',d.floor.finish],['deck',d.floor.deck],['framing',d.floor.joist],['service',d.floor.serviceVoid],['ceiling',d.floor.ceiling]] as const){add(`<rect x="285" y="${45+depth/2}" width="52" height="${n/2}" fill="${name==='service'?'#c5dbe4':'#e5dfd1'}" stroke="#60777a" stroke-width=".3"/>`);text(340,47+(depth+n/2)/2,`${name} ${n}`,2.5);depth+=n}
add('<circle cx="311" cy="198.75" r="18.75" fill="none" stroke="#b45d43" stroke-width=".7"/>')
text(285,230,'75 duct in 55 void: fails by 20',2.5)
text(285,237,'before brackets, joints or tolerance.',2.5)
text(14,254,'The external 1400 aperture is nominal. Frame, leaf, height, threshold, outside handling and isolation remain unresolved.',2.8)
text(14,263,'No historical service-zone pass is transferred. A plausible plan does not establish a connected installed service system.',2.8)
text(14,278,'Companion: bcr-services-result.md · source script and JSON retain exact assumptions and adverse results.',3)
add('</svg>')
for(const [name,content] of [['services-feasibility.json',JSON.stringify(output,null,2)+'\n'],['services-feasibility.svg',svg.join('\n')+'\n']]){const path=fileURLToPath(new URL(name,import.meta.url));if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==content)throw Error(`${name} stale`)}else writeFileSync(path,content)}
console.log(JSON.stringify(checks,null,2))
