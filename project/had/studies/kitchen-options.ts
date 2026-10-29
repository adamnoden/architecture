/** Product-sized kitchen comparison; never mutates the selected house. */
import {readFileSync,writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {layoutRevision as d,revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'
type Box={id:string,x:number,y:number,w:number,h:number}
const b=(id:string,x:number,y:number,w:number,h:number):Box=>({id,x,y,w,h})
const source=revisionOpenings('GROUND')
for(const x of [8100,10200])if(!source.some(o=>o.wall==='outer-north'&&o.kind==='window'&&o.centre===x&&o.width===1000&&(o.sill??750)===750&&(o.head??2850)===2850))throw Error('Reappraise changed north windows')
if(d.envelope!==417.5||d.shell!==12000||!source.some(o=>o.id==='pantry-door'&&o.centre===10900&&o.width===900))throw Error('Reappraise source')
const counter=b('continuous counter',8100,10982.5,3482.5,600)
const fridge=b('fridge installation body',9650,8217.5,550,582)
const bay=b('ventilation bay',9550,8167.5,750,632)
const fridgeOpen=b('135 degree open bounding envelope',9260,8217.5,940,1088)
const pantry=b('pantry inward leaf reserve',10450,8167.5,900,837.5)
const dwOpen=b('dishwasher 90 degree envelope',8100,10382.5,600,1150)
const drawerOpen=b('authored 600 drawer extension',9500,10382.5,1300,600)
const ovenOpen=b('authored 650 oven projection',10800,10332.5,600,650)
const fixed=[counter,fridgeOpen,pantry]
const paths:Record<string,{points:number[][],extra:Box[]}>= {
 fridge:{points:[[7800,9800],[9700,9800]],extra:[]},
 dishwasher:{points:[[7800,9800],[8400,9800],[8400,9950]],extra:[dwOpen]},
 sink:{points:[[7800,9800],[9100,9800],[9100,10650]],extra:[]},
 preparation:{points:[[7800,9800],[10150,9800],[10150,9950]],extra:[drawerOpen]},
 oven:{points:[[7800,9800],[11100,9800],[11100,9900]],extra:[ovenOpen]}
}
const gap=(a:number,z:number,c:number,e:number)=>Math.max(a-e,c-z,0)
function clear(p:number[][],boxes:Box[]){for(let i=1;i<p.length;i++){const[a,z]=p[i-1],[c,e]=p[i];if(a!==c&&z!==e)throw Error('Axis path required');if(Math.min(a,c)<717.5||Math.max(a,c)>11282.5||Math.min(z,e)<8467.5||Math.max(z,e)>11282.5)return false;for(const r of boxes)if(Math.hypot(gap(Math.min(a,c),Math.max(a,c),r.x,r.x+r.w),gap(Math.min(z,e),Math.max(z,e),r.y,r.y+r.h))<300-1e-7)return false}return true}
const results=Object.fromEntries(Object.entries(paths).map(([id,v])=>[id,clear(v.points,[...fixed,...v.extra])]))
if(!Object.values(results).every(Boolean))throw Error('Retained positive working-state path failed')
const result={basis:d.id,adopted:false,windowChange:{centres:[8100,10200],level:'GROUND',wall:'outer-north',oldSill:750,proposedSill:1050,head:2850,width:1000,nominalAreaLossM2:.6},counter,fridge,bay,fridgeOpen,pantry,dwOpen,drawerOpen,ovenOpen,paths,results,scope:'600 circular body, complete axis segments, separate working states; no installed assembly, human handling or window operation acceptance'}
const s:string[]=[];const add=(v:string)=>s.push(v),text=(x:number,y:number,t:string,size=3)=>add(`<text x="${x}" y="${y}" font-size="${size}">${t}</text>`)
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="DejaVu Sans,sans-serif" fill="#23343a"><rect width="420" height="297" fill="#fffef9"/>')
text(15,15,'HAD / Kitchen options: working floor and the cost of two higher sills',5)
text(15,24,'Unadopted comparison · real product envelopes, authored work states · no whole-house fit or installation acceptance',3.1)
const px=(x:number)=>20+(x-7400)/50,py=(y:number)=>122-(y-8000)/50
function rect(r:Box,fill:string,dash=false){add(`<rect x="${px(r.x)}" y="${py(r.y+r.h)}" width="${r.w/50}" height="${r.h/50}" fill="${fill}" stroke="#586d72" stroke-width=".25" ${dash?'stroke-dasharray="1 1"':''}/>`)}
rect(b('floor',7400,8167.5,4182.5,3415),'#f4efe4');rect(counter,'#d5dfdf');rect(bay,'none',true);rect(fridge,'#d5dfdf');rect(fridgeOpen,'none',true);rect(pantry,'#eee0d3',true)
rect(b('temporary staging strip',8100,9782.5,3300,1200),'none',true)
for(const r of [dwOpen,drawerOpen,ovenOpen])rect(r,'none',true)
rect(b('sink',8820,11062.5,560,440),'#bcd4de');rect(b('hob',10804,11021.5,592,522),'#888f91')
for(const x of [8700,9500,10800,11400])add(`<path d="M${px(x)} ${py(10982.5)}V${py(11582.5)}" stroke="#586d72" stroke-width=".25"/>`)
for(const x of [8100,10200])add(`<path d="M${px(x-500)} ${py(11582.5)}H${px(x+500)}" stroke="#527e97" stroke-width="1"/>`)
for(const {points} of Object.values(paths))add(`<polyline points="${points.map(([x,y])=>`${px(x)},${py(y)}`).join(' ')}" fill="none" stroke="#347866" stroke-width=".35"/>`)
text(px(8200),py(11250),'DW',2.5);text(px(9600),py(11250),'PREP',2.5);text(px(9680),py(8500),'COLD',2.4);text(px(10500),py(8500),'PANTRY',2.1)
text(20,135,'Plan 1:50 · north ↑ · dashed states are separate',2.8)
text(20,143,'No loose prep table: common working floor is restored.',2.8)
text(20,151,'Green lines: five whole-segment 600-body paths pass.',2.8)
const notes=[
 'B / Continuous 900-high counter: 600 DW + 800 sink + 1300 prep + 600 cook + 182.5 filler.',
 'Raise only the two ground kitchen sills from 750 to 1050; retain 1000 widths and 2850 heads.',
 'Fridge: actual 100 side / top and 50 rear allowances require a 750-wide ventilated bay.',
 'Reflected left-hinge 135° envelope is 940 × 1088; the pantry leaf reserve remains separate.',
 'Dishwasher: 1150 actual open depth. Drawers: 600 authored extension, not selected hardware.',
 'Oven: 650 authored door / handle projection; actual under-hob ventilation section remains open.',
 'Accessible sink-module connections are proposed; no hidden socket, trap or hose fit is claimed.',
 'A 1200-deep temporary appliance staging strip replaces working space during maintenance.',
 'Actual carrying / sack truck, helpers, pantry and garden door transitions still need testing.',
 'Two higher sills cost 0.60 m² nominal aperture area; this is not a daylight calculation.',
 'Seated outlook and rear composition change. Standing views and frame / shade operation remain.',
 'A 600-deep counter obstructs direct window reach; front approach does not prove sash control.',
 'Retained 750-sill option A keeps low outlook but has interrupted stations and a loose table.',
 'HAD remains incomplete. Source adoption requires OAS and current-house / BCR reconciliation.'
]
notes.forEach((v,i)=>text(137,40+i*8.2,v,2.65))
function facade(ox:number,sill:number,label:string){
 const sx=(x:number)=>ox+(12000-x)/100,sy=(z:number)=>274-z/100
 add(`<rect x="${ox}" y="${sy(6800)}" width="120" height="68" fill="#e7ddd0" stroke="#586d72" stroke-width=".35"/>`)
 for(const level of ['GROUND','FIRST'] as const)for(const o of revisionOpenings(level).filter(o=>o.wall==='outer-north')){
  const base=level==='GROUND'?0:3450,lo=base+(o.kind==='door'?0:(level==='GROUND'&&[8100,10200].includes(o.centre)?sill:o.sill??750)),hi=base+(o.head??2850)
  add(`<rect x="${sx(o.centre+o.width/2)}" y="${sy(hi)}" width="${o.width/100}" height="${(hi-lo)/100}" fill="#c2d8df" stroke="#607c88" stroke-width=".25"/>`)
 }
 text(ox,196,label,3.1);text(ox,282,'Rear aperture comparison 1:100 · no frame / glazing-bar selection',2.3)
}
facade(15,750,'A / current source: all north window sills 750')
facade(160,1050,'B / only ground kitchen sills 1050')
text(295,213,'Two affected apertures:',3);text(295,222,'1000 × 2100 → 1000 × 1800',3);text(295,231,'−0.30 m² each / −0.60 m² total',3);text(295,240,'14.3% of those nominal rectangles',2.8);text(295,253,'No net-glass / daylight equivalence.',2.8);text(295,262,'All other apertures remain unchanged.',2.8)
add('</svg>')
for(const [name,content] of [['kitchen-options.svg',s.join('\n')+'\n'],['kitchen-options.json',JSON.stringify(result,null,2)+'\n']]){const path=fileURLToPath(new URL(name,import.meta.url));if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==content)throw Error(`${name} stale`)}else writeFileSync(path,content)}
console.log(JSON.stringify(results,null,2))
