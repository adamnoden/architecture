/** One-sided double-bed comparison after proposed suite relocation; not source adoption. */
import {readFileSync,writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {layoutRevision as d,revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'
type Box={id:string,x:number,y:number,w:number,h:number}
const box=(id:string,x:number,y:number,w:number,h:number):Box=>({id,x,y,w,h})
if(d.id!=='RH-LAYOUT-REVISION-02'||d.envelope!==417.5||d.partition!==125||!revisionOpenings('FIRST').some(o=>o.id==='bed3-door'&&o.centre===8700&&o.width===900))throw Error('Reappraise changed source')
const walls=[box('north wall west',7200,2587.5,1050,125),box('north wall east return',9150,2587.5,150,125),box('revised former wet spine',9237.5,2650,125,1200),box('gallery is not bedroom floor',7262.5,2712.5,1975,1075)]
const bed=box('1500 × 2000 actual base',9387.5,1697.5,1500,2000),head=box('90 headboard',9387.5,3697.5,1500,90)
const wardrobe=box('PAX GRIMO 1000 × 600',7262.5,1300,600,1000)
const fixed=[...walls,bed,head,wardrobe]
const paths:Record<string,number[][]>={
 foot:[[8700,3000],[8700,2300],[8700,1350],[10100,1350]],
 eastBedside:[[8700,3000],[8700,2300],[8700,1350],[11235,1350],[11235,3350]],
 frontWestWindow:[[8700,3000],[8700,2300],[8700,850],[8100,850]],
 frontEastWindow:[[8700,3000],[8700,2300],[8700,850],[10200,850]],
 eastWindow:[[8700,3000],[8700,2300],[8700,1350],[11235,1350]],
 wardrobe:[[8700,2300],[8700,1800],[8225,1800]]
}
function gap(a:number,b:number,c:number,e:number){return Math.max(a-e,c-b,0)}
function clear(points:number[][],objects:Box[]){for(let i=1;i<points.length;i++){const[a,b]=points[i-1],[c,e]=points[i];if(a!==c&&b!==e)throw Error('Axis paths only');if(Math.min(a,c)<7562.5||Math.max(a,c)>11282.5||Math.min(b,e)<717.5||Math.max(b,e)>3487.5)return false;if(objects.some(r=>Math.hypot(gap(Math.min(a,c),Math.max(a,c),r.x,r.x+r.w),gap(Math.min(b,e),Math.max(b,e),r.y,r.y+r.h))<300-1e-7))return false}return true}
// Gallery is real approach floor, not a furniture obstacle; the partition openings still govern passage.
const results=Object.fromEntries(Object.entries(paths).map(([name,p])=>[name,clear(p,fixed.filter(r=>r.id!=='gallery is not bedroom floor'))]))
// Wardrobe leaf comparison: two 500 leaves at 90 degrees, with authored 25 thickness/handle envelope.
const wardrobeOpen=[box('wardrobe south leaf envelope',7862.5,1287.5,500,25),box('wardrobe north leaf envelope',7862.5,2287.5,500,25)]
const wardrobeOpenState=clear([[8700,1800],[8225,1800]], [...fixed,...wardrobeOpen])
if(!Object.values(results).every(Boolean)||!wardrobeOpenState)throw Error('Retained positive comparison failed')
const result={basis:d.id,adopted:false,scope:'one-sided double-bed and storage comparison; door/window hardware and handling remain separate',spineCentre:9300,galleryClear:9237.5-8167.5,bedAccess:{east:11582.5-10887.5,west:25,south:1280},fixed,paths,results,wardrobeOpen,wardrobeOpenState}
const s:string[]=[];const add=(v:string)=>s.push(v),text=(x:number,y:number,t:string,size=3)=>add(`<text x="${x}" y="${y}" font-size="${size}">${t}</text>`)
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="DejaVu Sans,sans-serif" fill="#23343a"><rect width="420" height="297" fill="#fffef9"/>')
text(15,16,'HAD / Bedroom 3 after proposed suite relocation',5)
text(15,25,'One-sided double-bed access is an explicit tradeoff · no current-house adoption',3.2)
const px=(x:number)=>20+(x-7000)/50,py=(y:number)=>125-y/50
function rect(r:Box,fill:string,dash=false){add(`<rect x="${px(r.x)}" y="${py(r.y+r.h)}" width="${r.w/50}" height="${r.h/50}" fill="${fill}" stroke="#596b70" stroke-width=".25" ${dash?'stroke-dasharray="1 1"':''}/>`)}
rect(box('floor',7262.5,417.5,4320,3370),'#f4efe4');for(const r of fixed)rect(r,r===bed?'#e9d7bc':r.id.includes('gallery')?'#ddddda':'#d6e1e1');for(const r of wardrobeOpen)rect(r,'none',true)
for(const p of Object.values(paths))add(`<polyline points="${p.map(([x,y])=>`${px(x)},${py(y)}`).join(' ')}" fill="none" stroke="#347866" stroke-width=".3"/>`)
for(const centre of [8100,10200])add(`<path d="M${px(centre-500)} ${py(417.5)}H${px(centre+500)}" stroke="#527e97" stroke-width=".9"/>`)
add(`<path d="M${px(11582.5)} ${py(900)}V${py(1900)}" stroke="#527e97" stroke-width=".9"/>`)
text(25,47,'Gallery / not bedroom',2.4);text(px(9500),py(2700),'1500 × 2000',2.6);text(px(11000),py(2900),'695',2.3);text(25,135,'1:50 at A3 · north ↑ · leaf states are separate comparisons',2.6)
const notes=[
 'Move only the former en-suite west partition 200 west, from x9500 to x9300.',
 'The local east gallery becomes1070 clear; source west gallery is1015.',
 'Remove the former en-suite south partition east of x9300; retain bath north boundary.',
 'Retain the900 bedroom entrance aperture. Its installed frame/leaf and closure need binding.',
 'A real1500 ×2000 base plus90 headboard uses the former en-suite headspace.',
 'East access is695; west is25 and is deliberately NOT a usable bedside route.',
 'The south foot field is1280. Both front windows and the east window have approach points.',
 'Window movement, controls, cleaning and curtains remain actual product/operation duties.',
 'PAX/GRIMO1000 ×600 ×2012 provides a rail and shelves; no extending drawers are assumed.',
 'Two500 wardrobe leaves at90° leave a600 body comparison between them with the entry closed.',
 'The nominal leaf envelopes include25 thickness/handle allowance; actual hinge projection differs.',
 'The former lining, branch and gallery panel require explicit IAS removal/reuse dispositions.',
 'Mattress making, two occupants, emergency access, furniture assembly and carrying are not certified.'
]
notes.forEach((v,i)=>text(150,43+i*9,v.replace(/([a-zA-Z])(?=\d)/g,'$1 ').replace(/(\d)(?=[a-zA-Z])/g,'$1 '),2.7))
text(15,190,'Connected route comparison',3.7)
text(15,201,'600 mm circular body along every complete axis segment; no diagonal shortcut or human-performance claim.',3)
text(15,212,`Six paths ${Object.values(results).every(Boolean)?'PASS':'FAIL'} · wardrobe open-state comparison ${wardrobeOpenState?'PASS':'FAIL'} · source furniture is not silently replaced.`,3)
text(15,231,'Why this matters: relocating the en suite must leave a coherent third bedroom; an empty former bathroom is not a furnished-room result.',3)
text(15,245,'This candidate chooses ordinary one-sided double-bed access. It does not invent a household preference or claim two usable bedside routes.',3)
text(15,259,'Before adoption: coordinate gallery, former wet services, real doors/window actions, current-house identities and all affected downstream studies.',3)
add('</svg>')
for(const [name,content] of [['bedroom3-reuse-study.svg',s.join('\n')+'\n'],['bedroom3-reuse-study.json',JSON.stringify(result,null,2)+'\n']]){const path=fileURLToPath(new URL(name,import.meta.url));if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==content)throw Error(`${name} stale`)}else writeFileSync(path,content)}
console.log(JSON.stringify({results,wardrobeOpenState},null,2))
