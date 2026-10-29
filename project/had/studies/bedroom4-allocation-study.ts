/** Proposed room reallocation. No canonical mutation or technical acceptance. */
import {readFileSync,writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {layoutRevision as d,revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'
type Box={id:string,x:number,y:number,w:number,h:number}
const box=(id:string,x:number,y:number,w:number,h:number):Box=>({id,x,y,w,h})
const room=d.rooms.FIRST.find(r=>r.id==='U-BED4')!.boxes[0]
if(d.id!=='RH-LAYOUT-REVISION-02'||d.shell!==12000||d.envelope!==417.5||d.partition!==125||room.x!==0||room.y!==8230||room.width!==6000||room.depth!==3770||!revisionOpenings('FIRST').some(o=>o.wall==='outer-west'&&o.centre===10200&&o.width===1000))throw Error('Reappraise current source before updating allocation')
const walls=[box('wet east south return',2337.5,8230,125,170),box('wet east north return',2337.5,9300,125,1587.5),box('wet north',0,10825,2400,125)]
const bed=box('actual base 2000 × 1500',3847.5,9400,2000,1500),head=box('headboard 90',5847.5,9400,90,1500)
const wardrobe=box('sliding wardrobe 1500 × 660',2462.5,9450,660,1500)
const stack=box('gross stack reservation',417.5,8800,300,750)
const wc=box('WC 560 × 355',717.5,8800,560,355),basin=box('basin 400 × 220',1400,8292.5,400,220),tray=box('shower 1000 × 1000',1337.5,9825,1000,1000)
const wasteBoxes=[box('west low waste reservation',417.5,9550,150,1275),box('north low waste reservation',567.5,10675,770,150)]
const upper=[...walls,bed,head,wardrobe,stack,wc,basin,tray,...wasteBoxes]
// Route layer uses doors/enclosure in the state required by the task; no simultaneous claim.
const paths:Record<string,number[][]>={
 southBed:[[3300,8800],[4800,8800],[4800,9000]],
 footWardrobe:[[3300,8800],[3475,8800],[3475,10100]],
 northBed:[[3300,8800],[3475,8800],[3475,11265],[4800,11265]],
 rearWindow:[[3300,8800],[3475,8800],[3475,11265],[1800,11265]],
 wc:[[3300,8800],[1900,8800],[1900,8950],[1600,8950]],
 basin:[[3300,8800],[2100,8800],[2100,8825],[1600,8825]],
 showerApproach:[[3300,8800],[1900,8800],[1900,9525],[1975,9525]],
 northStackFace:[[3300,8800],[1900,8800],[1900,9500],[1020,9500],[1020,9880],[900,9880]]
}
function gap(a:number,b:number,c:number,e:number){return Math.max(a-e,c-b,0)}
function clearPath(points:number[][],objects:Box[],bounds:[number,number,number,number],radius=300){
 for(let i=1;i<points.length;i++){
  const [x,y]=points[i-1],[xx,yy]=points[i]
  if(x!==xx&&y!==yy)throw Error('Only exact axis segments are audited')
  if(Math.min(x,xx)<bounds[0]+radius||Math.max(x,xx)>bounds[2]-radius||Math.min(y,yy)<bounds[1]+radius||Math.max(y,yy)>bounds[3]-radius)return false
  if(objects.some(r=>Math.hypot(gap(Math.min(x,xx),Math.max(x,xx),r.x,r.x+r.w),gap(Math.min(y,yy),Math.max(y,yy),r.y,r.y+r.h))<radius-1e-7))return false
 }
 return true
}
const routeResults=Object.fromEntries(Object.entries(paths).map(([name,p])=>[name,clearPath(p,upper,[417.5,8292.5,5937.5,11582.5])]))
// A route to the north cabinet face must go around the WC; a failed witness is not hidden.
const groundObjects=[stack,box('south sofa moved 50 east',750,8500,1900,850),box('north sofa',700,10750,1900,750),box('low table',1100,9700,1200,550),box('dining table',3400,9000,800,1600)]
const cabinetTask=box('north access task',442.5,9580,600,600)
const lowerPath=[[5000,8500],[3000,8500],[3000,9675],[1050,9675],[1050,9880],[742.5,9880]]
const maintenanceObjects=groundObjects.map(r=>r.id==='low table'?{...r,x:r.x+300,y:r.y+300}:r)
const lowerRoute=clearPath(lowerPath,maintenanceObjects,[417.5,8167.5,8167.5,11582.5])
if(!Object.values(routeResults).every(Boolean)||!lowerRoute)throw Error('A retained positive route failed: revise the candidate before claiming fit')
const result={basis:d.id,scope:'unadopted Bedroom4 association and plan comparison; no floor, stack, door or current-house acceptance',wetClear:[1920,2532.5],westWindowPier:10825-10700,bedFields:{north:682.5,south:1107.5,footAtWardrobe:725},upper,paths,routeResults,groundObjects,maintenanceObjects,cabinetTask,lowerPath,lowerRoute}
const svg:string[]=[];const add=(s:string)=>svg.push(s),text=(x:number,y:number,s:string,size=2.7)=>add(`<text x="${x}" y="${y}" font-size="${size}">${s}</text>`)
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="DejaVu Sans,sans-serif" fill="#23343a"><rect width="420" height="297" fill="#fffef9"/>')
text(15,16,'HAD / a more generous second en suite in Bedroom 4',5)
text(15,24,'Proposed allocation · retained shell, court, apertures and 4-bedroom / 2-en-suite count · no source adoption',2.9)
function plan(ox:number,oy:number,ground:boolean){
 const px=(x:number)=>ox+x/50,py=(y:number)=>oy+(12000-y)/50
 const rect=(r:Box,fill:string,dash=false)=>add(`<rect x="${px(r.x)}" y="${py(r.y+r.h)}" width="${r.w/50}" height="${r.h/50}" fill="${fill}" stroke="#697576" stroke-width=".25" ${dash?'stroke-dasharray="1 1"':''}/>`)
 rect(box('floor',417.5,ground?8167.5:8292.5,ground?7750:5520,ground?3415:3290),'#f6f1e7')
 for(const r of ground?groundObjects:upper)rect(r,r.id.startsWith('wet')?'#d2ccbf':r===stack?'#bd9c76':r===bed?'#e7d7bc':'#dce6e7')
 if(ground){rect(cabinetTask,'none',true);rect(maintenanceObjects.find(r=>r.id==='low table')!,'none',true)}
 const routes=ground?{northAccess:lowerPath}:paths
 for(const [name,p] of Object.entries(routes)){
  const pass=ground?lowerRoute:routeResults[name]
  add(`<polyline points="${p.map(([x,y])=>`${px(x)},${py(y)}`).join(' ')}" fill="none" stroke="${pass?'#347866':'#a5513d'}" stroke-width=".3" ${pass?'':'stroke-dasharray="1 1"'}/>`)
 }
 add(`<path d="M${px(417.5)} ${py(9700)}V${py(10700)}" stroke="#527e97" stroke-width=".8"/>`)
 for(const centre of [1800,3900])add(`<path d="M${px(centre-500)} ${py(11582.5)}H${px(centre+500)}" stroke="#527e97" stroke-width=".8"/>`)
 text(ox,oy-7,ground?'GROUND / visible stack and sitting-room impact':'FIRST / Bedroom 4 and new en suite',3.2)
 if(ground){text(px(800),py(8900),'sofa +50 east',2.1);text(px(1200),py(10000),'low table',2.1);text(px(3500),py(10000),'dining',2.1);text(px(450),py(9600),'N access',2)}
 else{text(px(4200),py(10100),'2000 × 1500',2.4);text(px(1337),py(10400),'1000 shower',2);text(px(2520),py(10200),'sliding',2);text(px(2520),py(10050),'wardrobe',2);text(px(750),py(9350),'WC',2);text(px(1450),py(8430),'basin',2)}
 text(ox,oy+89,'1:50 at A3 · north ↑',2.5)
}
plan(15,43,false);plan(215,43,true)
text(15,146,'Spatial comparison and explicit operating states',3.5)
const lines=[
 'A 1500 × 2000 actual-size base and 90 headboard replace the smaller-bed workaround. The headboard is on the solid east partition.',
 'A real 1500 × 660 sliding wardrobe provides hanging and shelf storage. Its doors slide inside the selected product depth; no drawers assumed.',
 'Room-side 600 mm body paths are checked as whole segments. Entry/ensuite doors must be in the state required for each action.',
 'Wet clear is 1920 × 2532.5 before extra lining; a 150-wide north/west waste-box reservation is included in the plan paths. Height awaits IAS.',
 'A 1000 square tray and inward bifold enclosure give a 750 manufacturer access comparison; screen/step/lining/floor section still govern.',
 'North cabinet access is for northern routine points. The far WC connector needs pan removal and a separate east release face; no 750 reach assumed.',
 'For maintenance, move the empty low table 300 east / 300 north to the dashed stage, then restore it. The clear access route depends on this action.',
 'The cabinet is now a gross 300 × 750 reservation. North access and long-component renewal require fitting/structural validation, not a centreline.'
]
lines.forEach((s,i)=>text(15,155+i*8,s,2.65))
text(15,227,`Upper route checks: ${Object.entries(routeResults).map(([k,v])=>`${k} ${v?'PASS':'FAIL'}`).join(' · ')}`,2.35)
text(15,236,`Ground access path: ${lowerRoute?'PASS':'FAIL'} · plan-only result; neither water, support nor complete maintenance is certified.`,2.7)
text(15,250,'Owning dependencies / IAS: actual wet floor, trap, waste fall and face access. BCR: bearing/penetration, cabinet fittings, vent/drain and renewal.',2.7)
text(15,260,'The former Bedroom 3 en-suite branch/lining and current-house applicability must be reconciled in any eventual source rewind.',2.7)
text(15,273,'No whole-house fit, owner household preference, technical performance, maturity increase or HAD-03 completion is claimed.',2.9)
add('</svg>')
for(const [name,content] of [['bedroom4-allocation-study.svg',svg.join('\n')+'\n'],['bedroom4-allocation-study.json',JSON.stringify(result,null,2)+'\n']]){
 const path=fileURLToPath(new URL(name,import.meta.url));if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==content)throw Error(`${name} stale`)}else writeFileSync(path,content)
}
console.log(JSON.stringify({routeResults,lowerRoute},null,2))
