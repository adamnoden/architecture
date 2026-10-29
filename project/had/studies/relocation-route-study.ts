/** Local, unadopted HAD trial. Circular-body comparison is not an access standard. */
import {readFileSync,writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {layoutRevision as d,revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'
type Rect={id:string,x:number,y:number,w:number,h:number}
const R=(id:string,x:number,y:number,w:number,h:number):Rect=>({id,x,y,w,h})
const room=d.rooms.FIRST.find(r=>r.id==='U-ENS3')!.boxes[0]
if(d.id!=='RH-LAYOUT-REVISION-02'||d.shell!==12000||d.envelope!==417.5||d.partition!==125||room.x!==9500||room.y!==2650||room.depth!==1200||d.services.upperLining.x!==9862.5||!revisionOpenings('FIRST').some(o=>o.id==='ensuite3-door'&&o.centre===10900))throw Error('Source basis changed: reappraise relocation trial')
const walls=[R('new wet partition',8837.5,417.5,125,532.5),R('new wet partition',8837.5,1750,125,900),R('retained wall',7200,2587.5,2300,125),R('entry south return',9437.5,2650,125,275),R('entry north return',9437.5,3675,125,112.5),R('void: not floor',7262.5,2712.5,905,1075)]
const fixtures=[R('service cabinet',7262.5,1250,250,400),R('WC 560 × 355',7512.5,1250,560,355),R('shower 900 × 800',7262.5,1787.5,900,800),R('basin 220 × 360',8617.5,500,220,360)]
const bed=R('base 1350 × 1900',9615,1042.5,1350,1900),head=R('headboard 90',9615,2942.5,1350,90)
const objects=[...walls,...fixtures,bed,head]
const radius=300,step=5,x0=7562.5,y0=717.5,nx=745,ny=555
const targets={westBed:[9272.5,2002.5],eastBed:[11272.5,2002.5],foot:[10202.5,742.5],frontWindow:[10202.5,742.5],wc:[8372.5,1427.5],basin:[8317.5,752.5],showerEast:[8502.5,2187.5]} as const
function gap(a:number,b:number,c:number,e:number){return Math.max(a-e,c-b,0)}
// Minimum rectangle-to-axis-segment distance; checks the whole step, not endpoints alone.
function segmentFree(x:number,y:number,xx:number,yy:number,obs:Rect[]){
 if(Math.min(x,xx)<x0||Math.max(x,xx)>11582.5-radius||Math.min(y,yy)<y0||Math.max(y,yy)>3787.5-radius)return false
 return obs.every(r=>Math.hypot(gap(Math.min(x,xx),Math.max(x,xx),r.x,r.x+r.w),gap(Math.min(y,yy),Math.max(y,yy),r.y,r.y+r.h))>=radius-1e-7)
}
function solve(obs:Rect[]){
 const pos=(i:number)=>[x0+(i%nx)*step,y0+Math.floor(i/nx)*step]
 const index=(x:number,y:number)=>Math.round((y-y0)/step)*nx+Math.round((x-x0)/step)
 const start=index(9002.5,3302.5),parents=new Int32Array(nx*ny).fill(-2),queue=new Int32Array(nx*ny)
 if(!segmentFree(...pos(start) as [number,number],...pos(start) as [number,number],obs))throw Error('BFS start collides')
 parents[start]=-1;queue[0]=start;let n=1
 for(let q=0;q<n;q++){
  const i=queue[q],[x,y]=pos(i)
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const ix=i%nx+dx,iy=Math.floor(i/nx)+dy;if(ix<0||ix>=nx||iy<0||iy>=ny)continue
   const j=iy*nx+ix;if(parents[j]!==-2||!segmentFree(x,y,x+dx*step,y+dy*step,obs))continue
   parents[j]=i;queue[n++]=j
  }
 }
 const reached=Object.fromEntries(Object.entries(targets).map(([name,[x,y]])=>[name,parents[index(x,y)]!==-2]))
 const paths=Object.fromEntries(Object.entries(targets).map(([name,[x,y]])=>{
  let j=index(x,y);const points:number[][]=[];if(parents[j]!==-2)while(j!==-1){points.push(pos(j));j=parents[j]}
  return[name,points.reverse()]
 }))
 return{reached,paths,visited:n}
}
const result=solve(objects)
if(Object.values(result.reached).some(v=>!v))throw Error('Retained positive witness failed; reappraise, do not silently relabel')
const output={basis:d.id,scope:'unadopted 600 mm circular-body local comparison, not human/carrying/fire/access acceptance',step,radius,objects,targets,reached:result.reached,visited:result.visited,door:{bedroomClear:[2925,3675],wetRough:[950,1750],wetHinge:[8837.5,1693],wetLeaf:686,wetSweepReservation:750}}
const svg:string[]=[];const add=(s:string)=>svg.push(s),label=(x:number,y:number,s:string,size=2.7)=>add(`<text x="${x}" y="${y}" font-size="${size}">${s}</text>`)
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="DejaVu Sans,sans-serif" fill="#22333a"><rect width="420" height="297" fill="#fffef9"/>')
label(15,16,'HAD / relocated en suite and bedroom: connected-route trial',5)
label(15,24,'Unadopted source rewind · 1:25 at A3 · north ↑ · dimensions in mm',3)
const px=(x:number)=>15+(x-7000)/25,py=(y:number)=>190-(y-200)/25
const rect=(r:Rect,fill:string)=>add(`<rect x="${px(r.x)}" y="${py(r.y+r.h)}" width="${r.w/25}" height="${r.h/25}" fill="${fill}" stroke="#64716f" stroke-width=".25"/>`)
rect(R('local bounds',7262.5,417.5,4320,3370),'#f5f2e9')
for(const r of walls)rect(r,r.id.startsWith('void')?'#b6bbba':'#d3cec1')
for(const r of fixtures)rect(r,'#dbe5e9')
rect(bed,'#e9dbc6');rect(head,'#bc9c78')
for(const [name,points] of Object.entries(result.paths))if(points.length)add(`<polyline points="${points.filter((p,i,a)=>i===0||i===a.length-1||(p[0]-a[i-1][0])*(a[i+1][1]-p[1])!==(p[1]-a[i-1][1])*(a[i+1][0]-p[0])).map(([x,y])=>`${px(x)},${py(y)}`).join(' ')}" fill="none" stroke="${name==='eastBed'?'#aa6754':'#528477'}" stroke-width=".35"/>`)
for(const [name,[x,y]] of Object.entries(targets)){
 add(`<circle cx="${px(x)}" cy="${py(y)}" r="1" fill="${result.reached[name]?'#226957':'#a4463b'}"/>`)
 if(name!=='frontWindow')label(px(x)+2,py(y)-1,name==='foot'?'foot / window approach':name,2.2)
}
label(px(bed.x)+4,py(2100),'1350 × 1900 base',2.7)
label(px(7700),py(2300),'900 × 800',2.5)
label(px(7550),py(1420),'WC',2.2)
label(px(9400),py(3530),'750 clear',2.2)
label(px(7300),py(3300),'Entrance void',2.2)
label(px(7300),py(3180),'not floor',2.2)
// Actual leaf and conservative larger swept quarter disk, hinge shifted for provisional jamb.
const hx=8837.5,hy=1693,sweep=750
add(`<path d="M${px(hx)} ${py(hy-sweep)} A${sweep/25} ${sweep/25} 0 0 1 ${px(hx-sweep)} ${py(hy)} L${px(hx)} ${py(hy)} Z" fill="#b0714b" fill-opacity=".1" stroke="#a66c48" stroke-width=".25" stroke-dasharray="1 1"/>`)
add(`<path d="M${px(hx)} ${py(hy)}L${px(hx-686)} ${py(hy)}" stroke="#9c593b" stroke-width=".6"/>`)
label(210,47,'What this sheet tests',3.6)
const notes=[
 'ROUTE LAYER: door leaf omitted, final state varies.',
 'Separate coupled entry/closing model accompanies it.',
 'A 600 mm circular body traverses 5 mm axis steps.',
 'Each whole step is checked against every rectangle.',
 'The start must be free; targets lie on the same lattice.',
 'This does not test people, carrying or required access.',
 '',
 'Bed: 1350 × 1900 actual base + 90 north headboard.',
 'Both lower sides connect via east side and south foot.',
 'The west side above the retained wall is not a route.',
 'Smallest raw side reserve: 617.5 before tolerances.',
 '',
 'WC moved north; shower reduced to actual 900 × 800.',
 'Basin moved south; service cabinet moves with WC.',
 'The shower target is outside its east edge: no step,',
 'screen/door, waterproofing or tray access is accepted.',
 '',
 'Bedroom slider: 750 final clear, 826 stock-leaf trial.',
 'Wet door: 800 rough, 686 leaf, hinge y 1693 trial.',
 'Dashed 750 swing is conservative, not a doorset.',
 'Frame, stop, handle and final clear passage still govern.',
 '',
 'Storage, window use and second-stack installation',
 'remain part of continued design, not implied by paths.',
 'No canonical room, fixture or authority is changed.'
]
notes.forEach((s,i)=>label(210,56+i*5.3,s,2.65))
label(15,205,'Reached targets / green = connected in this exact trial',3.2)
Object.entries(result.reached).forEach(([k,v],i)=>label(15+(i%3)*63,215+Math.floor(i/3)*7,`${k}: ${v?'connected':'not reached'}`,2.7))
label(15,244,'Products and design limits: ../had-03-relocation-trial.md. The authoring script is the exact geometry record.',2.8)
label(15,253,'The front external apertures, shell and courtyard are retained. All new dimensions are local study assumptions.',2.8)
label(15,262,'Circles are a geometric comparison only; a positive path is not proof of installation, comfort or regulatory acceptance.',2.8)
label(15,276,'No fitted-house completion, maturity increase or current-source adoption is claimed.',3.2)
add('</svg>')
for(const [name,content] of [['relocation-route-study.svg',svg.join('\n')+'\n'],['relocation-route-study.json',JSON.stringify(output,null,2)+'\n']]){
 const path=fileURLToPath(new URL(name,import.meta.url));if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==content)throw Error(`${name} stale`)}else writeFileSync(path,content)
}
console.log(JSON.stringify({reached:result.reached,visited:result.visited},null,2))
