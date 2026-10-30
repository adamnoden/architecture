/** Located successor proposal. Geometric reservations are not a lifting method. */
import {readFileSync,writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {layoutRevision as d,revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'
type Box={id:string,x:number,y:number,w:number,h:number}
type Point=[number,number]
const box=(id:string,x:number,y:number,w:number,h:number):Box=>({id,x,y,w,h})
const old=JSON.parse(readFileSync(new URL('bedroom4-allocation-study.json',import.meta.url),'utf8'))
if(d.id!=='RH-LAYOUT-REVISION-02'||d.envelope!==417.5||d.partition!==125||old.wetClear.join()!=='1920,2532.5'||!revisionOpenings('FIRST').some(o=>o.id==='bed4-door'&&o.centre===3300&&o.width===900))throw Error('Reappraise changed source')
// IAS successor proposal:90 stud+12.5dry+25wet, holding dry faces; west15→25.
const fixed=[box('wet south door return',2335,8295,127.5,152),box('wet north door return',2335,9253,127.5,1569.5),box('wet north wall',0,10822.5,2400,127.5),
 box('stack gross reservation',427.5,8800,300,750),box('basin',1400,8295,400,220),box('NE shower',1335,9822.5,1000,1000),
 box('west waste boxing',427.5,9550,150,1272.5),box('north waste boxing',577.5,10572.5,757.5,250),
 box('wardrobe',2462.5,9450,660,1500),box('base',3847.5,9400,2000,1500),box('headboard',5847.5,9400,90,1500),
 box('held open door reserve',2440.5,9179,889,168)]
//At90 degrees,44leaf plus62 handle projection gives84 normal from centreline;
//102 lever length is bounded each way along the leaf. The continuous-door
//search separately uses a conservative135-radius handle bound.
const pan=box('pan at fixture',727.5,8850,560,355)
const panCentre:Point=[pan.x+280,pan.y+177.5]
const centreBox=(id:string,p:Point,w=660,h=455)=>box(id,p[0]-w/2,p[1]-h/2,w,h)
const stage:Point=[4500,8547.5]
const protectedStage=centreBox('protected pan stage',stage)
const bounds:[number,number,number,number]=[427.5,8295,5937.5,11582.5]
function gap(a:number,b:number,c:number,e:number){return Math.max(a-e,c-b,0)}
function bodyPath(points:Point[],objects:Box[],radius=300){
 for(let i=1;i<points.length;i++){
  const [x,y]=points[i-1],[xx,yy]=points[i]
  if(x!==xx&&y!==yy)throw Error('Only whole axis segments are audited')
  if(Math.min(x,xx)<bounds[0]+radius||Math.max(x,xx)>bounds[2]-radius||Math.min(y,yy)<bounds[1]+radius||Math.max(y,yy)>bounds[3]-radius)return false
  if(objects.some(r=>Math.hypot(gap(Math.min(x,xx),Math.max(x,xx),r.x,r.x+r.w),gap(Math.min(y,yy),Math.max(y,yy),r.y,r.y+r.h))<radius-1e-7))return false
 }
 return true
}
function rectanglePath(points:Point[],w:number,h:number,objects:Box[]){
 for(let i=1;i<points.length;i++){
  const [x,y]=points[i-1],[xx,yy]=points[i]
  if(x!==xx&&y!==yy)throw Error('No untested diagonal rectangle movement')
  const a=Math.min(x,xx)-w/2,b=Math.max(x,xx)+w/2,c=Math.min(y,yy)-h/2,e=Math.max(y,yy)+h/2
  if(a<bounds[0]||b>bounds[2]||c<bounds[1]||e>bounds[3])return false
  if(objects.some(r=>a<r.x+r.w-1e-7&&b>r.x+1e-7&&c<r.y+r.h-1e-7&&e>r.y+1e-7))return false
 }
 return true
}
const withdrawal:Point[]=[panCentre,[1407.5,9027.5]]
const carry:Point[]=[[1407.5,9027.5],[1407.5,8845],[4500,8845],stage]
const frontWithdrawal:Point[]=[[1657.5,9027.5],[2057.5,9027.5]]
const frontCarry:Point[]=[[2057.5,9027.5],[2057.5,8845],[5150,8845]]
const rearRegrip:Point[]=[[1100,9530],[1050,9530],[1050,8845],[1450,8845]]
const rearCarry:Point[]=[[1450,8845],[3850,8845]]
const returnToFace:Point[]=[[5150,8845],[5150,9087.5],[3650,9087.5],[3650,8845],[1200,8845],[1200,9027.5]]
const paths={withdrawal,carry,frontWithdrawal,frontCarry,rearRegrip,rearCarry,returnToFace}
const pause=centreBox('pan at regrip',[2100,8845])
const results={
 panWithdrawal:rectanglePath(withdrawal,560,355,fixed),
 protectedPanCarry:rectanglePath(carry,660,455,fixed),
 frontWithdrawal:bodyPath(frontWithdrawal,fixed),frontCarry:bodyPath(frontCarry,fixed),
 rearRegrip:bodyPath(rearRegrip,[...fixed,pause]),rearCarry:bodyPath(rearCarry,fixed),
 returnToEastFace:bodyPath(returnToFace,[...fixed,protectedStage]),
 northHelper:bodyPath([[1100,9530],[1100,9530]],[...fixed,pan]),
 rejectedNorthStage:rectanglePath([[1407.5,9027.5],[1407.5,9880],[1000,9880]],660,455,fixed)
}
if(!Object.entries(results).filter(([k])=>k!=='rejectedNorthStage').every(([,v])=>v)||results.rejectedNorthStage)throw Error('A retained operation witness or adverse control changed: '+JSON.stringify(results))
const output={basis:d.id,scope:'unadopted plan-reserved pan maintenance sequence; no ergonomic, lifting, connector-release or water-boundary certification',fixed,pan,protectedStage,paths,results,
 panMassKg:22,panHeight:385,panEnvelope:[560,355],protectedEnvelope:[660,455],bodyDiameter:600,
 frontAndRearCentreOffset:650,withdrawalReservation:400,
 stageRearWallGap:protectedStage.y-8295,temporaryReturnWidth:9400-(protectedStage.y+protectedStage.h),
 sequence:['isolate, drain, protect floor and hold room door open','release actual fixings and connectors; reserve400 forward movement','north helper remains in its distinct field; front helper follows forward movement','pause protected pan at2100/8845 for rear-helper regrip','two600body fields follow fore/aft at650 centre offsets','lower pan into protected southern stage without claiming a lifting technique','front helper returns through625 temporary gap; east cabinet face field accessible','reverse and reinstate fixings, connectors, water boundary and door, then leak/function check']}
const svg:string[]=[];const add=(s:string)=>svg.push(s),t=(x:number,y:number,s:string,size=3)=>add(`<text x="${x}" y="${y}" font-size="${size}">${s}</text>`)
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="DejaVu Sans,sans-serif"><rect width="420" height="297" fill="#fffef9"/>')
t(15,17,'Bedroom 4 / door and pan-removal successor',5);t(15,26,'Located architectural proposal; current RH-LAYOUT-REVISION-02 remains unchanged',3.2)
const px=(x:number)=>15+(x-400)/25,py=(y:number)=>43+(11600-y)/25
function draw(r:Box,fill:string,dash=false){add(`<rect x="${px(r.x)}" y="${py(r.y+r.h)}" width="${r.w/25}" height="${r.h/25}" fill="${fill}" stroke="#6c7677" stroke-width=".25" ${dash?'stroke-dasharray="1 1"':''}/>`)}
draw(box('floor',427.5,8295,5510,3287.5),'#f4f0e7');fixed.forEach(r=>draw(r,r.id.includes('door reserve')?'#efd2bd':r.id.includes('wall')||r.id.includes('return')?'#d6cbb7':'#dce5e4'))
draw(pan,'#c9b28c');draw(protectedStage,'none',true);draw(pause,'none',true)
function route(p:Point[],colour:string,dash=false){add(`<polyline points="${p.map(([x,y])=>`${px(x)},${py(y)}`).join(' ')}" fill="none" stroke="${colour}" stroke-width=".65" ${dash?'stroke-dasharray="1 1"':''}/>`)}
route(carry,'#a66035');route(returnToFace,'#237060');route(rearRegrip,'#41648d',true)
for(const [x,y] of [[1100,9530],[2057.5,9027.5],[5150,8845],[1200,9027.5]])add(`<circle cx="${px(x)}" cy="${py(y)}" r="12" fill="none" stroke="#41648d" stroke-width=".3" stroke-dasharray="1 1"/>`)
t(px(1500),py(10380),'1000 tray',2.6);t(px(2500),py(10200),'wardrobe',2.5);t(px(4200),py(10100),'2000 × 1500 base',2.7)
t(px(4240),py(8500),'pan stage',2.4);t(px(760),py(9380),'WC +50 north',2.3)
t(255,50,'Sequence and measurable limits',3.6)
const notes=['1. Isolate, drain and release actual fixings.','2. Reserve400 forward withdrawal.','3. Regrip at2100 /8845, not behind cabinet.','4. Protected660 ×455 pan envelope crosses door.','5. Two600 body fields are shown separately.','6. Stage near south wall; return gap625.','7. East cabinet face remains reachable.','8. Reverse; reconnect and inspect reinstatement.','','Orange: pan. Green: returning worker.','Blue: regrip. Circles: distinct600 body fields.','','22kg ceramic is not a safe-lift assessment.','No whole-house carrying route is established.','The20-high saddle needs a real crossing action.','The proposed400 release is not connector proof.','Glass, cistern, stack and ground renewal differ.','No pan is reached through a750-long tunnel.']
notes.forEach((s,i)=>t(255,59+i*6,s,2.65))
t(15,187,'1:25 at A3 · north ↑ · proposed finished wet faces and250-deep north waste boxing included',3)
t(15,199,'Outward826 ×44 leaf comparison:950 rough;832 jamb clear;806 conservative stopped throat.',3)
t(15,208,'The coupled door witness checks continuous translations and swept five-degree sectors, including a135-radius handle bound.',2.9)
t(15,217,'600 and650 diameter body witnesses enter and close;700 has no witness on the stated grid. This is not ergonomic acceptance.',2.9)
t(15,226,'Door hardware sweep ends52 south of wardrobe. Actual lining section, hinge/stop, strength, latch and undercut remain to bind.',2.9)
t(15,239,'Negative control: a proposed north-west pan stage fails the connected route; it is not rescued by an isolated empty rectangle.',2.9)
t(15,252,'The temporary625 return passage has only25 total spare width for a600 circle. No simultaneous occupation or carrying is claimed there.',2.8)
t(15,265,'IAS owns wet assembly, cistern/connector packing, sill and release faces. HAD owns the located action and visible room consequences.',2.8)
t(15,280,'Conditional spatial development only; no adopted house, full maintenance acceptance, physical evidence or HAD-03 completion.',3)
add('</svg>')
for(const [name,content] of [['bedroom4-maintenance-study.json',JSON.stringify(output,null,2)+'\n'],['bedroom4-maintenance-study.svg',svg.join('\n')+'\n']]){
 const p=fileURLToPath(new URL(name,import.meta.url));if(process.argv.includes('--check')){if(readFileSync(p,'utf8')!==content)throw Error(name+' stale')}else writeFileSync(p,content)
}
console.log(JSON.stringify(results,null,2))
