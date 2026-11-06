/** One current utility occurrence: bounded first-release geometry, not handling admission. */
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {isDeepStrictEqual as equal} from 'node:util'
const root=new URL('../../../',import.meta.url)
const sources={}
function source(id,path){const b=readFileSync(new URL(path,root));sources[id]={path,blob:createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${b.length}\0`),b])).digest('hex')};return JSON.parse(b)}
const H=source('had','project/had/studies/water-replan.json').model
const S=source('services','project/mat/studies/whole-house-service-baseline.json')
const U=S.interfaces.architecturalServices.utility
assert(equal(S.rewinds.utility,U),'Services utility duplicate projections disagree')
assert(equal(H.architecturalServices.utility,U),'HAD architectural-services utility projection disagrees')
for(const key of ['washer','sink','rearServiceChase','valveBay','electricalStation','PVinverter']){
  assert(equal(H.groundFurniture[`service-utility-${key}`],U[key]),`Current HAD/Services utility mismatch: ${key}`)
}
assert(equal(H.servicesInterface.utility.washer,U.washer),'Current HAD service-interface washer mismatch')
assert(H.utilityDisposition.operation.startsWith('OPENARCH'),'Current utility entrance is no longer the claimed open arch')
const boundary=S.air.transfer.utilityNorthBoundaryRequirement
assert(boundary.role.startsWith('OPENARCH')&&equal(boundary.rough,H.utilityDisposition.opening)&&boundary.axisY===H.utilityDisposition.axis,'Current utility opening and owning Services air-boundary requirement disagree')
assert(!('Q350-body' in H.groundFurniture),'Retired Q350 comparison has returned to current occurrence map')
const valve=S.fixtures.find(f=>f.id==='washer-PROPOSED')
assert(valve&&equal(valve.sourceOrProposedXY,U.washer.slice(0,2)),'Washer fixture and utility occurrence no longer agree')
assert(equal(valve.waterBranchPlan.at(-1),[10800,1250])&&valve.valveAxisZ===750&&equal(valve.requiredValveWorkTerritory,[200,200,300]),'Reconcile the actual washer valve/working territory before regenerating this task')
const native={model:'Bosch WAN282X2GB',document:'9001906867_B, 5 February 2024',
  url:'https://media3.bosch-home.com/Documents/9001906867_B.pdf',
  sha256:'cb9df5dba938f70c225d7090f7f3ffed0da286ef5910e9f7f0b7026e136c0e97',
  role:'Retired product used as one native first-release comparator; not a procurement or material selection.',
  width:598,bodyDepth:550,closedDepth:600,height:848,doorOpenDepth:1017,massKg:68.9,
  inletHose:1500,outletHose:1500,cord:2100,inletThread:'3/4 inch; native minimum clear bore 17 mm and tap threaded-outlet length 10 mm',
  drainHeight:[600,1000],siphonClampDiameter:[24,40],
  sources:{connection:'pp. 14–16',drain:'pp. 33–34',removalAndTransit:'p. 45',dimensions:'pp. 47–48'},
  limits:['No lifting alone or gripping protruding parts; upright transport; four feet on an even solid surface.',
    'Native transport sequence drains and detaches hoses and reinstalls rear transit bolts. The short in-room extraction and rear bolt-refit order must join the actual handling method; absence of a separate short-extraction statement is not a universal prohibition.',
    'Do not combine masses or depths from a different model edition. Actual purchased E-Nr./FD and manual must match.']}
const fixedTapComparator={model:'Pegler 809B / 524009',url:'https://aalberts-ips.co.uk/products/item/524009/',
  pageSnapshotSHA256:'96d769785ec92265f7072b404ec9582dbbdddb303b0376c4e43e6bd0dfdab1b5',
  drawingURL:'https://aalberts.compano.com/Data/Environments/000001/Attachment/Bijlage/Images/PRD/ProductGroupDrawing/PY/809B_d.jpg',
  drawingSHA256:'16be2f20f46988e2aae3425907ed3a2378ca62cdc2882231691747a052c72a98',
  connection:'15 mm copper compression × G3/4 BSPP (ISO 228-1)',reportedOverall:[60,25,40],massKg:.09,
  material:'CW617N brass, chromium plating, NBR spindle/sealing constituents; complete product/material admission unearned',
  nativeDrawing:{L2:20,Z2:12,grossDifference:8},
  status:'One actual fixed-end component checked because this method requires that connection. Not a fitted or selected tap.',
  hold:'Nominal threaded interface corresponds, but actual 17 mm outlet clear bore, 10 mm threaded-outlet length, washer seat and nut/hand/lever sweep are not established. L2 minus Z2 is 8 mm gross drawing difference, not proof of 10 mm usable thread or assembled engagement; do not treat total L2 as available thread. No universal cross-brand or washing-machine-tap prohibition follows.'}
const R=U.washer
assert(native.width<=600&&native.width<=R[2]&&native.closedDepth<=R[3],'Native comparator no longer fits the claimed reservation')
const body=[R[0]+(R[2]-native.width)/2,R[1]+R[3]-native.closedDepth,native.width,native.closedDepth]
const pull=700,rest=[body[0],body[1]+pull,body[2],body[3]]
const sweep=[body[0],body[1],body[2],body[3]+pull]
const overlap=(a,b)=>Math.max(0,Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]))
const distance=(a,b)=>Math.hypot(Math.max(a[0]-b[0]-b[2],b[0]-a[0]-a[2],0),Math.max(a[1]-b[1]-b[3],b[1]-a[1]-a[3],0))
const retained=Object.entries(H.groundFurniture).filter(([id])=>id!=='service-utility-washer')
const collisions=retained.filter(([,box])=>overlap(sweep,box)>0).map(([id])=>id)
assert.equal(collisions.length,0,'Trial washer-body pull meets a retained current fixture')
const nearest=retained.map(([id,box])=>({id,distance:distance(sweep,box)})).sort((a,b)=>a.distance-b.distance)
const northWall=H.groundWalls.find(w=>w.id==='utility-north')
assert(northWall&&equal(northWall.holes,[H.utilityDisposition.opening]),'Utility north wall and current open arch no longer agree')
assert(northWall.a[1]===northWall.b[1]&&northWall.a[1]===H.utilityDisposition.axis,'Utility north wall and open-arch axis no longer agree')
const archRaw=H.utilityDisposition.opening,archAxis=H.utilityDisposition.axis
const northFace=Math.min(...northWall.finishedFaces)
assert(rest[1]+rest[3]<northFace,'Trial first rest reaches the utility north wall')
const frontWorker=[10800,1725,300],rearWorker=[10375,1175,300]
function circleClearance(c,box){return Math.hypot(Math.max(box[0]-c[0],c[0]-box[0]-box[2],0),Math.max(box[1]-c[1],c[1]-box[1]-box[3],0))-c[2]}
const frontClear=Math.min(...Object.values(H.groundFurniture).map(b=>circleClearance(frontWorker,b)))
const rearClear=Math.min(circleClearance(rearWorker,rest),...retained.map(([,b])=>circleClearance(rearWorker,b)))
assert(frontClear>=25&&rearClear>=25,'Authored static worker proxy lost its stated clearance')
const tasks={tap:{point:[...valve.waterBranchPlan.at(-1),valve.valveAxisZ],shoulder:[10800,1725,1050]},drain:{point:[10800,1250,800],shoulder:[10800,1725,1100]}}
const standingTapReach=Math.hypot(475,1450-valve.valveAxisZ)
for(const t of Object.values(tasks))t.straightReach=Math.hypot(...t.point.map((v,i)=>v-t.shoulder[i]))
const armPlan=[10800,1250,0,475],armRadius=40
const armPlanClearances=Object.entries(H.groundFurniture).filter(([id])=>id!=='service-utility-valveBay').map(([id,b])=>({id,clearance:distance(armPlan,b)-armRadius})).sort((a,b)=>a.clearance-b.clearance)
assert(armPlanClearances[0].clearance>=25,'Straight valve-task arm plan now meets a retained fixture')
const electricalWorkOverlap=overlap(rest,U.electricalWorkingField)
assert(electricalWorkOverlap>0,'Review changed electrical-task coexistence before removing the documented temporary occupation')
const result={status:'Conditional utility first-release comparator; no connected, worker, support, handling or installation pass',units:'mm unless named otherwise',sources,native,fixedTapComparator,
  sourceDisposition:{legacyX9500:'Historical I00-C1 upper small-en-suite front remains unadopted. Current utility washer is a different owning occurrence; this task neither relocates nor discharges the accepted-source reservation.',
    Q350:'Explicitly retired uninstalled plant comparison in current Services; absent from current HAD. Ventilation function now has its separate W9 source/method; no installed device is silently removed.',
    entrance:H.utilityDisposition,baselineWorking:U.working,washerFixture:valve},
  geometry:{reservation:R,body,rest,pull,sweep,retainedFixtureCount:retained.length,collisions,nearestFixtureClearances:nearest.slice(0,5),
    northWallFace:northFace,northRestReserve:northFace-rest[1]-rest[3],rearBodyClearToOldReservation:rest[1]-(R[1]+R[3]),
    frontWorker,rearWorker,frontWorkerClearance:frontClear,rearWorkerClearance:rearClear,tasks,standingTapReach,
    armPlan:{centrelineBounds:armPlan,radius:armRadius,nearest:armPlanClearances.slice(0,3),scope:'Straight plan projection to the intentionally open task bay only; actual tap, supports, hand/nut/lever/tool and lower worker posture are not qualified.'},
    electricalWorkingField:U.electricalWorkingField,temporaryElectricalWorkingOverlapMM2:electricalWorkOverlap},
  sequence:['Keep washer upright on its native feet; do not attach its mass, retained pipe support or electrical protection to a decorative face.',
    'Before any movement: turn off actual local tap; empty inlet, switch off and unplug at accessible fixed socket; drain cooled residual water through native front service hose into a supported sufficiently large container.',
    'Detach the actual tap-side inlet, supported fixed waste terminal and accessible electrical plug in the independently supported service front. Retain all fixed pipes/supports; cap and make safe. Keep appliance-side captive hoses/cord with the machine.',
    'Only after the complete fixed ends are disconnected and actual handling is qualified, test the 700 mm north in-room drawout. This body-only sweep does not supply hands, sliders, wheels, grips or safe pulling force.',
    'Use newly available rear territory for actual transit-bolt access; qualify the initial supported extraction and bolt-refit order before whole-body transport. Body clearance alone establishes no safe handling method.',
    'Electrical-station work is unavailable during the first rest; carry out independent isolation beforehand and preserve required emergency isolation/access. Restore the utility and all electrical work space after reconnection, leak/electrical checks and native levelling.'],
  open:['Actual tap/standpipe or siphon/socket, independent supports/anchors and water/electrical segregation remain to be joined with Services; no product fit or height adoption follows from the authored points.',
    'Native hose lengths are not routed usable lengths: actual rear outlets, bends, connectors, clamps and slack/coiling must fit the reserved 100 mm gross depth and 26 mm side allowances; no fitted hose route is proved.',
    'Static 300 mm plan circles and two straight reach values are authored screening proxies, not qualified posture, hand/tool trajectories, sight line or full rear bolt reach.',
    'Native front drain container, flap, hose and pump-cap task need their complete actual receiving geometry. No tilted machine or top/door lifting is credited.',
    'Actual full moving package/mass, feet/floor contact, initial force and tilt, grips/crew or ordinary appliance handling aid, rear bolt order and supported first rest remain unearned.',
    'The 700 mm pull is an in-room first rest only; no export through the open arch, neighbouring W9 bay or protected Plant door is claimed.',
    'Polymer hoses, seals, drum/door/electrical and other functional residues remain explicit and unapproved; no certified innards are replaced and no material optimum is claimed.']}
const target=new URL('./utility-first-release.json',import.meta.url),text=JSON.stringify(result,null,2)+'\n'
if(process.argv.includes('--check'))assert.equal(readFileSync(target,'utf8'),text,'Utility first-release source/result drift')
else writeFileSync(target,text)
const draw=[]
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;')
const label=(x,y,s,size=3.2)=>draw.push(`<text x="${x}" y="${y}" font-size="${size}">${esc(s)}</text>`)
const scale=.075,py=y=>215-(y-400)*scale
function plan(offset,moving,worker,color){
  const px=x=>offset+(x-9300)*scale
  const box=(r,fill,stroke='#52616b',dash='')=>draw.push(`<rect x="${px(r[0])}" y="${py(r[1]+r[3])}" width="${r[2]*scale}" height="${r[3]*scale}" fill="${fill}" stroke="${stroke}" stroke-width=".45" ${dash?'stroke-dasharray="2 1"':''}/>`)
  box([9397,429.5,11570.5-9397,northFace-429.5],'#fafafa')
  box(U.electricalWorkingField,'#fff2d5','#c78e20','dash')
  box(U.PVworkingField,'none','#829488','dash')
  for(const [id,b] of retained.filter(([id])=>id.startsWith('service-utility-')||id==='service-emitter-utility-E'))box(b,'#dce2e5')
  box(moving,color)
  draw.push(`<circle cx="${px(worker[0])}" cy="${py(worker[1])}" r="${worker[2]*scale}" fill="none" stroke="#287890" stroke-width=".6" stroke-dasharray="2 1"/>`)
  label(px(10125),py(moving[1]+moving[3]/2),'WASHER',2.7)
  label(px(11020),py(1000),'SINK',2.7);label(px(10695),py(900),'BAY',2.7)
  label(px(9420),py(2000),'ELEC.',2.5);label(px(9420),py(550),'PV',2.5)
  draw.push(`<path d="M${px(archRaw[0])} ${py(archAxis)}H${px(archRaw[1])}" stroke="#2c7885" stroke-width="1.4"/>`)
  label(px(archRaw[0]),py(archAxis)-3,`RAW OPEN ARCH ${archRaw[1]-archRaw[0]}`,2.8)
}
draw.push('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="Arial,sans-serif"><rect width="420" height="297" fill="white"/>')
label(14,17,'IAS / Utility first release: fixed ends before body movement',5.1)
label(14,26,'6 November 2026 | Conditional native method comparator; no connected, worker or handling pass.',3.5)
label(14,35,'WAN282X2GB / 9001906867_B: 598 W × 600 closed D × 848 H; 68.9 kg. Retired source; no purchase selection.',3.3)
label(20,45,'A / Stationary fixed-end release',4)
label(220,45,'B / Conditional 700 mm north first rest',4)
plan(20,body,frontWorker,'#cfedf1')
plan(220,rest,rearWorker,'#f3d9c7')
label(14,228,'A: Accessible tap/drain/plug, independent supports; detach fixed ends before pull. Keep captive hoses and cord with body.',3.3)
label(14,237,'B: Valve-bay reserve 26 mm; north-wall reserve 353 mm. Static worker proxies are separate states, each with 25 mm minimum.',3.3)
label(14,246,'B occupies 209300 mm² of electrical working field: no concurrent electrical task; isolate first and restore afterwards.',3.3)
label(14,255,'All 37 other ground fixtures checked against native body sweep. Native hoses, tools, drain container, grip/force/aid remain open.',3.3)
label(14,264,'Rear transit-bolt access/order and actual initial supported handling remain open. No export through arch/W9/Plant door.',3.3)
label(14,273,'Polymer/functional residues explicit and unapproved. No installation or IAS completion. Source blobs in companion JSON.',3.3)
label(14,285,'Native manual pp. 14–16, 33–34, 45, 47–48. Shaded fields: electrical/PV working territory, retained fixed bodies, actual washer body.',2.8)
draw.push('</svg>')
const sheet=new URL('./utility-first-release.svg',import.meta.url),svg=draw.join('\n')+'\n'
if(process.argv.includes('--check'))assert.equal(readFileSync(sheet,'utf8'),svg,'Utility first-release sheet drift')
else writeFileSync(sheet,svg)
console.log(JSON.stringify({status:result.status,body,rest,nearest:nearest[0],northRestReserve:result.geometry.northRestReserve,frontClear,rearClear,tasks,electricalWorkOverlap},null,2))
