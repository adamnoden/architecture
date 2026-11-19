/** Source-bound HAD diagnostic, not an adopted sanitary layout or compliance test. */
import {readFileSync,writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {layoutRevision as d,revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'
const room=d.rooms.FIRST.find(r=>r.id==='U-ENS3')!.boxes[0]
const west=d.partitions.FIRST.find(w=>w.id==='wet-spine')!
const south=d.partitions.FIRST.find(w=>w.id==='bed3-north')!
const north=d.partitions.FIRST.find(w=>w.id==='small-ensuite-north')!
const door=revisionOpenings('FIRST').find(o=>o.id==='ensuite3-door')!
const sideWindows=revisionOpenings('FIRST').filter(o=>o.wall==='outer-east'&&o.kind==='window')
// Current source's explicit 125 partition / 417.5 envelope budgets, not new build-ups.
const partition=d.partition,envelope=d.envelope
if(room.x!==west.a[0]||room.y!==south.a[1]||room.y+room.depth!==north.a[1]||d.id!=='RH-LAYOUT-REVISION-02')throw Error('Source topology changed; reappraise diagnostic before regenerating')
const clear={x:west.a[0]+partition/2,y:south.a[1]+partition/2,width:d.shell-envelope-(west.a[0]+partition/2),depth:north.a[1]-south.a[1]-partition}
const nextWindow=sideWindows.filter(w=>w.centre-w.width/2>north.a[1]).sort((a,b)=>a.centre-b.centre)[0]
const windowStart=nextWindow.centre-nextWindow.width/2
const windowStop=windowStart-partition/2-north.a[1]
const carrier=155,pan=480,showerWidth=800
const remainingApproach=clear.width-showerWidth-pan-carrier
const lining=d.services.upperLining
if(partition!==125||envelope!==417.5||clear.x!==9562.5||clear.y!==2712.5||clear.width!==2020||clear.depth!==1075||lining.x!==9862.5||lining.y!==2762.5||lining.width!==250||lining.depth<clear.y+clear.depth-lining.y||door.centre!==10900||door.width!==900||windowStart!==4100)throw Error('Controlled fit inputs changed; reappraise trial coordinates and conclusions')
const svg:string[]=[]
const add=(s:string)=>svg.push(s)
const text=(x:number,y:number,s:string,size=2.7)=>add(`<text x="${x}" y="${y}" font-size="${size}">${s}</text>`)
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="DejaVu Sans, sans-serif" fill="#202b32">')
add('<rect width="420" height="297" fill="#fffef9"/>')
text(15,16,'HAD / small en-suite fit: two arrangements rejected',5)
text(15,23,'RH-LAYOUT-REVISION-02 · source-bound diagnostic · no geometry or fixture selection adopted',2.8)
add('<path d="M15 29H405" stroke="#34434b" stroke-width=".3"/>')
const fixturesA=[{x:clear.x,y:clear.y+37.5,w:800,h:1000,label:'Shower 800 × 1000'}, {x:clear.x+clear.width-480-carrier,y:3000,w:480,h:370,label:'WC 480 × 370'}, {x:10400,y:clear.y+clear.depth-270,w:360,h:270,label:'Basin 360 × 270'}]
const fixturesB=[{x:clear.x+clear.width-800,y:clear.y+clear.depth-1000,w:800,h:1000,label:'Shower 800 × 1000'}, {x:lining.x+lining.width,y:2780,w:480,h:370,label:'WC 480 × 370'}, {x:10200,y:clear.y+clear.depth-270,w:360,h:270,label:'Basin 360 × 270'}]
function plan(x:number,title:string,fixtures:typeof fixturesA){
 const scale=20,baseX=9300,baseY=4400,y=43
 const px=(v:number)=>x+(v-baseX)/scale,py=(v:number)=>y+(baseY-v)/scale
 const rect=(a:number,b:number,w:number,h:number,fill:string,stroke='#34434b',dash='')=>add(`<rect x="${px(a)}" y="${py(b+h)}" width="${w/scale}" height="${h/scale}" fill="${fill}" stroke="${stroke}" stroke-width=".25" ${dash?'stroke-dasharray="'+dash+'"':''}/>`)
 text(x,y-6,title,3.2)
 rect(clear.x,clear.y,clear.width,clear.depth,'#fffef9')
 rect(west.a[0]-62.5,clear.y,125,clear.depth,'#d8d4c9')
 rect(west.a[0]-62.5,north.a[1]-62.5,clear.width+125,125,'#d8d4c9')
 rect(clear.x, south.a[1]-62.5,door.centre-door.width/2-clear.x,125,'#d8d4c9')
 rect(door.centre+door.width/2,south.a[1]-62.5,clear.x+clear.width-(door.centre+door.width/2),125,'#d8d4c9')
 rect(clear.x+clear.width,clear.y,envelope,windowStart-clear.y,'#d8d4c9')
 add(`<path d="M${px(clear.x+clear.width)} ${py(windowStart)}V${py(4400)}" stroke="#5d7d8c" stroke-width=".8"/>`)
 rect(lining.x,lining.y,lining.width,Math.min(lining.depth,clear.y+clear.depth-lining.y),'#dce4e7','#4b6673')
 for(const f of fixtures){rect(f.x,f.y,f.w,f.h,'#eee9dd');text(px(f.x)+1,py(f.y+f.h/2),f.label,2.1)}
 if(fixtures===fixturesA){
  rect(clear.x+clear.width-carrier,2935,carrier,500,'#dce4e7')
  rect(lining.x,2750+12.5,lining.width,987.5,'none','#a35a45','1 1')
  text(px(lining.x)-2,py(3700),'Lining clash',2.1)
  text(px(clear.x+800)+1,py(3200),`${remainingApproach} gap`,2.2)
 }else text(px(lining.x+lining.width+pan)+1,py(3220),`${clear.x+clear.width-showerWidth-(lining.x+lining.width+pan)} gap`,2.2)
 // Explicit conservative operation square, not a claim about actual handing or swept collision.
 rect(door.centre-door.width/2,south.a[1],door.width,door.width,'none','#a35a45','1.2 1')
 text(px(door.centre-door.width/2)+1,py(south.a[1]+60),'Door operation box',2.1)
 text(x,137,`${clear.width} × ${clear.depth} clear before local services`,2.5)
 text(px(clear.x+clear.width)-4,py(windowStart)+4,`Window starts ${windowStart}`,2.2)
 text(px(clear.x+clear.width)-4,py(4400)-3,'Adjacent window cropped',2.1)
 text(x,145,'1:20 at A3 · north ↑',2.5)
 add(`<path d="M${x} 151h50m-50 -2v4m50 -4v4" fill="none" stroke="#34434b" stroke-width=".25"/>`)
 text(x+16,157,'1000 mm',2.5)
}
plan(23,'A / west shower, east WC',fixturesA)
plan(227,'B / east shower, west WC',fixturesB)
text(15,171,'A: shower intersects the held service lining. WC comparison includes the 155 mm carrier, not its finish.',2.9)
text(15,179,`At 155 mm carrier depth, the cross-room remainder is ${remainingApproach} mm before added finishes/tolerances.`,2.9)
text(15,190,'B: front of WC to shower is 190 mm. Door operation and basin approach remain unresolved.',2.9)
text(15,198,'The dashed box identifies an operation reservation to investigate; it is not an exact leaf sweep.',2.9)
text(15,212,`North-wall translation reaches the next window after only ${windowStop} mm; useful pier margin reduces that.`,2.9)
text(15,220,'Room enlargement must coordinate the bedroom, gallery, adjacent bathroom, windows and service access.',2.9)
text(15,234,'DECISION / neither arrangement is adopted. Retain the current source as an unfitted reservation.',3.1)
text(15,243,'Actual wet-floor section, carrier/support, door, tap/trap and replacement routes remain required.',2.8)
text(15,251,'600 mm front task field used in the accompanying comparison is a project test, not a statutory minimum.',2.8)
text(15,263,'Manufacturer envelopes: Duravit D-Code 251509, 070536, 720106; 155 mm carrier comparison WD1019.',2.6)
text(15,271,'Source register, calculations, interpretation and next design decisions: ../had-03-ensuite-fit-review.md',2.6)
text(15,284,'Not a general impossibility proof, installed product design, accessibility assessment or construction issue.',2.8)
add('</svg>')
const output=svg.join('\n')+'\n',path=fileURLToPath(new URL('./ensuite-fit-study.svg',import.meta.url))
if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==output)throw Error('HAD fit study SVG differs; regenerate and inspect')}else writeFileSync(path,output)
console.log(JSON.stringify({clear,windowStart,windowStop,remainingApproach,westPanToEastShower:clear.x+clear.width-showerWidth-(lining.x+lining.width+pan),scope:'two trial arrangements, not general infeasibility'},null,2))
