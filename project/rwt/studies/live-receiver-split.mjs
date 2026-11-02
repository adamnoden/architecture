/** RWT three-piece trial. Nominal envelopes; no hydraulic or structural admission. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
const dir=dirname(fileURLToPath(import.meta.url)),root=resolve(dir,'../../..')
const projection='project/had/studies/open-north-facade-projection.json',expected='eb70d77ee57571088c4a73caa076681dc00590cd',p=resolve(root,projection)
const local=existsSync(p)?readFileSync(p):null
const digest=b=>createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex')
const bytes=local&&digest(local)===expected?local:execFileSync('git',['cat-file','blob',expected],{cwd:root})
const sha=digest(bytes);if(sha!==expected)throw Error('Court projection drift: reconcile HAD before use')
const had=JSON.parse(bytes).courtSouth;if(!had||had.first.openings.length!==2||had.southCourtWeatherDoor.openLeafNorthTip!==5100)throw Error('Selected court projection changed')
const rect=(x,y,z)=>({x,y,z}),shift=(b,dx,dy)=>rect(b.x.map(v=>v+dx),b.y.map(v=>v+dy),b.z)
const west=rect([4325,4498.5],[4350,4750],[6783.5,6878]),middle=rect([4501.5,7498.5],[4350,4750],[6783.5,6890.5]),east=rect([7501.5,7675],[4350,4750],[6783.5,6878])
const shieldW=rect([4400,4550],[4350,4750],[6901,6903.5]),shieldE=rect([7450,7600],[4350,4750],[6901,6903.5])
const drip={south:[4450,4470],west:[4450,4470],east:[7550,7530],extent:[4450,7550]}
const hasSide=(b,x)=>b.x[0]<x&&x<b.x[1]&&b.y[0]<drip.extent[1]&&b.y[1]>drip.extent[0]
const hasSouth=(b,y)=>b.y[0]<y&&y<b.y[1]&&b.x[0]<drip.extent[1]&&b.x[1]>drip.extent[0]
const movement={middle:[0,120,240,270,400].map(d=>({out:d,body:shift(middle,0,d),south:drip.south.map(y=>hasSouth(shift(middle,0,d),y)),sides:[...drip.west,...drip.east].map(x=>hasSide(shift(middle,0,d),x)),returnOverlap:Math.max(0,270-d)})),corner:[0,130,145].map(d=>{const dx=d===130?155:d===145?170:0,w=shift(west,dx,d),e=shift(east,-dx,d);return {out:d,inward:dx,west:w,east:e,westShield:shift(shieldW,dx,d),eastShield:shift(shieldE,-dx,d),south:[...drip.south.map(y=>hasSouth(w,y)),...drip.south.map(y=>hasSouth(e,y))],sides:[...drip.west.map(x=>hasSide(w,x)),...drip.east.map(x=>hasSide(e,x))],returnOverlap:Math.max(0,270-d)}})}
const rate=3.60375/1000,energy=w=>1.5*Math.cbrt((rate/(w/1000))**2/9.81)*1000
const guard={floor:5540,innerY:4780,outerY:6150,top:[6616,6664],mid:[6166,6214],posts:[4350,5175,6000,6825,7650],tube:48,toeTop:5690,deckX:[4300,7700],deckY:[4780,6150],padCentres:[[4500,5900],[6000,5900],[7500,5900]],padSide:400}
const permanent={x:[4350,7650],y:[4350,4700],bottom:6590,back:6740,front:6640,drop:170,moduleLength:3300/7,carrierLength:450,carrierDepth:30}
const branch={corner:{p:[4412.5,7587.5],clearWidth:150,boxWidth:175,boxY:[5100,5500],returnApertureY:[5350,5500],pipeOpeningY:[5175,5325]},middle:{p:[4650,7350],clearWidth:300},pipeOD:150,pipeY:5250,returnY:[4430,5500],returnInlet:6685,returnOutlet:6680,returnWall:65,tailInvert:6778.8,sheet:1.5,gate:2,skirt:5,gateTravel:{pipe:[5175,5325,5025,5175],return:[5350,5500,5500,5650]}}
const cornerGate={box:rect([4325,4498.5],[5100,5500],[6777.3,6858.8]),pipeClosed:rect([4337.5,4487.5],[5175,5325],[6765.2,6767.2]),pipeOpen:rect([4337.5,4487.5],[5025,5175],[6765.2,6767.2]),returnClosed:rect([4337.5,4487.5],[5350,5500],[6765.2,6767.2]),returnOpen:rect([4337.5,4487.5],[5500,5650],[6765.2,6767.2]),worker:rect([4590,4990],[5520,5920],[5540,7340]),collarBottom:6767.2,skirtBottom:6760.2}
const clash=(a,b)=>['x','y','z'].every(k=>a[k][0]<b[k][1]&&b[k][0]<a[k][1])
const checks={
 middleMissesAllSideLines:movement.middle.every(s=>s.sides.every(v=>!v)),
 middleStopSouthClear:movement.middle.find(s=>s.out===240).south.every(v=>!v),
 middleStopReturnOverlap:movement.middle.find(s=>s.out===240).returnOverlap===30,
 cornerNominalStopClear:movement.corner.find(s=>s.out===145).south.every(v=>!v)&&movement.corner.find(s=>s.out===145).sides.every(v=>!v),
 cornerNominalStopReturnOverlap:movement.corner.find(s=>s.out===145).returnOverlap===125,
 cornerClearanceAfter145:Math.min(4480+15-4470,7530-(7520-15),4480+15-4470)>10,
 shieldAboveMiddle:shieldW.z[0]-middle.z[1]>10,
 shieldBelowSecondary:6913.88660674044-shieldW.z[1]>10,
 shieldCoversWestSeam:shieldW.x[0]<west.x[1]&&shieldW.x[1]>middle.x[0],
 cornerBoxFits150:branch.corner.boxWidth>=branch.corner.clearWidth+2*branch.sheet,
 openingsSeparated:branch.corner.pipeOpeningY[1]<branch.corner.returnApertureY[0],
 openGateSweepsDisjoint:!clash(cornerGate.pipeOpen,cornerGate.returnOpen),
 gateWorkerClear:![cornerGate.box,cornerGate.pipeClosed,cornerGate.pipeOpen,cornerGate.returnClosed,cornerGate.returnOpen].some(b=>clash(b,cornerGate.worker)),
 gateUnderThroat:6777.3-cornerGate.pipeOpen.z[1]>10,
 gateSkirtOverReturn:cornerGate.skirtBottom-(branch.returnInlet+branch.returnWall)>10,
 returnClearOfTopRail:branch.returnOutlet-branch.sheet-guard.top[1]>10,
 returnClearOfAFront:branch.returnOutlet-branch.sheet-permanent.front>10,
 skirtAboveReturn:branch.tailInvert-branch.sheet-branch.gate-branch.skirt-(branch.returnInlet+branch.returnWall)>10,
 idealReturnHead150:branch.returnWall>energy(150),
 pipeOutsideAWithdrawal:5250-branch.pipeOD/2-(4250+450+400)>10,
 workerStrip:guard.outerY-5350-guard.tube/2>700,
 padsBeyondDoor:guard.padCentres.every(([,y])=>y-guard.padSide/2>had.southCourtWeatherDoor.openLeafNorthTip),
 padsBeforeInlet:guard.padCentres.every(([,y])=>y+guard.padSide/2<7000),
 carrierBelowTop:guard.top[0]-(permanent.back-permanent.drop)>10,
 carrierAboveMid:(permanent.bottom-permanent.carrierDepth-permanent.drop)-guard.mid[1]>10,
 carrierIntervalsSeparate:permanent.moduleLength-permanent.carrierLength>10,
 oldOnePieceFails:JSON.parse(readFileSync(resolve(dir,'live-receiver-corner-failure.json'))).states.find(s=>s.shift===400).adjacent.every(a=>a.overlapY>0)
}
if(!Object.values(checks).every(Boolean))throw Error(JSON.stringify(checks,null,2))
const limits=['The listed boxes are conservative component extents, not an exhaustive collision engine.','A and all four temporary routes must operate at full assigned stress and actual backwater before branch isolation.','Gate collar, plate and skirt envelopes are authored; seal and tail flow need design. Corner flange, return-to-A containment, full tray/corner fall, end support, running gear, bracing and complete access remain unproved.','No product, structural capacity, hydraulic capacity or physical operation has been admitted.']
const result={status:'THREE-PIECE DEVELOPMENT: staged nominal clearance and necessary energy screens only',projection:{path:projection,blob:sha,source:'HAD courtSouth projection PR #1267; exact blob required'},courtSouth:had,west,middle,east,shieldW,shieldE,drip,movement,permanent,branch,guard,cornerGate,energyMm:{width150:energy(150),width300:energy(300)},checks,limits}
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 1680 1188"><rect width="1680" height="1188" fill="white"/><g font-family="Arial,sans-serif" fill="#20343e"><text x="40" y="48" font-size="28" font-weight="bold">Split receiver / nominal staged plan</text><text x="40" y="80" font-size="18">Corner capture stays live while middle moves; no hydraulic, structural or operation admission</text>'
const panels=[{title:'1  All three in capture',w:west,m:middle,e:east},{title:'2  Middle out 400',w:west,m:shift(middle,0,400),e:east},{title:'3  Corners diagonal',w:shift(west,170,145),m:null,e:shift(east,-170,145)}]
panels.forEach((s,i)=>{const ox=45+i*550,oy=145,sc=.145,X=x=>ox+(x-4200)*sc,Y=y=>oy+(y-4200)*sc
 const box=(b,fill)=>`<rect x="${X(b.x[0])}" y="${Y(b.y[0])}" width="${(b.x[1]-b.x[0])*sc}" height="${(b.y[1]-b.y[0])*sc}" fill="${fill}" stroke="#805d30" stroke-width="2"/>`
 svg+=`<text x="${ox}" y="120" font-size="21" font-weight="bold">${s.title}</text><rect x="${X(4250)}" y="${Y(4250)}" width="${3500*sc}" height="${3500*sc}" fill="#f2f6f7" stroke="#aab7bb" stroke-width="2"/>`
 svg+=box(s.w,'#e6c59d')+box(s.e,'#e6c59d')+(s.m?box(s.m,'#eac9a5'):'')
 svg+=`<path d="M${X(4450)} ${Y(7550)}V${Y(4450)}H${X(7550)}V${Y(7550)}" fill="none" stroke="#b43e32" stroke-width="4"/><path d="M${X(4470)} ${Y(7550)}V${Y(4470)}H${X(7530)}V${Y(7550)}" fill="none" stroke="#d87960" stroke-width="2" stroke-dasharray="7 5"/>`
})
svg+=`<text x="45" y="730" font-size="20">Red solid: primary drip. Dashed: transferred secondary drip. Ochre: complete tray envelopes.</text><text x="45" y="770" font-size="20">At 240 middle return overlap = 30; the middle misses both side drip lines throughout.</text><text x="45" y="810" font-size="20">Corner trial at +170 toward centre / +145 outward clears both drip lines by 25; return overlap = 125.</text><text x="45" y="850" font-size="20">Corner boxes 175 wide accommodate a 150 outlet; longitudinal return and pipe apertures have 25 gap.</text><text x="45" y="890" font-size="20">Return 150 wide / 65 wall: ideal minimum ${energy(150).toFixed(2)} mm at full 3.60375 L/s, not a capacity proof.</text><text x="45" y="940" font-size="20" font-weight="bold">Incomplete: actual gates, seal, drainage, support, rig and live installation must be proven.</text><text x="45" y="980" font-size="19">Parallel faces and moving tools are not all checked by the envelope tests; see result and JSON.</text><text x="45" y="1030" font-size="18">HAD courtSouth projection pinned to ${sha}; supplied through the coordinated source.</text></g></svg>\n`
for(const [name,data] of Object.entries({'live-receiver-split.json':JSON.stringify(result,null,2)+'\n','live-receiver-split.svg':svg})){const path=resolve(dir,name);if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==data)throw Error('Stale '+name)}else writeFileSync(path,data)}
console.log(JSON.stringify({checks,energy:result.energyMm,movement},null,2))
