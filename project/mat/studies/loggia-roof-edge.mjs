import fs from 'node:fs'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
const git=(...a)=>execFileSync('git',a,{encoding:'utf8'}).trim()
const blob=b=>crypto.createHash('sha1').update(`blob ${Buffer.byteLength(b)}\0`).update(b).digest('hex')
const path='project/had/studies/open-north-loggia.json',ri=process.argv.indexOf('--had-ref')
const hadCommit=ri<0?git('log','-1','--format=%H','--',path):process.argv[ri+1]
const hb=ri<0?fs.readFileSync(path):execFileSync('git',['show',`${hadCommit}:${path}`])
assert.equal(blob(hb),git('rev-parse',`${hadCommit}:${path}`),'Canonical HAD bytes must match the declared tracked input')
const h=JSON.parse(hb),controlPath='project/mat/studies/loggia-roof-section.json'
const cb=fs.readFileSync(controlPath),controlCommit='af453c2314e40fd430471ae1004a6624fc1a72ac'
assert.equal(blob(cb),git('rev-parse',`${controlCommit}:${controlPath}`),'Deliberately rebind a changed parent roof control')
const r=JSON.parse(cb),s=Math.sin(25*Math.PI/180),c=Math.cos(25*Math.PI/180),t=Math.tan(25*Math.PI/180)
assert.equal(h.roofDevelopment.pitch,r.pitch);assert.deepEqual(h.roofDevelopment.normalLayers.map(x=>x[1]).reverse(),r.layersWeatherToRoom.map(x=>x[1]));assert.equal(h.roofDevelopment.protectedCeiling.top,6620);assert.equal(h.roofDevelopment.protectedCeiling.bottom,6444);assert.equal(h.roofDevelopment.eavesDatum,r.eave);assert.equal(h.roofDevelopment.totalNormal,r.totalNormal)
assert.equal(h.roofDevelopment.overhang,200);assert.equal(h.envelope,429.5)
const strCommit='6a3c15d6ffb8dac628c42533ba7ea64ac0de2cce',sp='project/str/studies/open-loggia-support.json'
const sb=execFileSync('git',['show',`${strCommit}:${sp}`]),collector=JSON.parse(sb).actual_roof.collector
assert.equal(collector.top,6680);assert.equal(collector.bottom,6540);assert.equal(collector.section.b,260)
const roof=(q,d=0)=>r.eave+q*t-d/c
const endQ=450,topD=420.7,topZ=roof(endQ,topD)
const P=(a,d)=>[endQ+a*c+d*s,topZ+a*s-d*c]
const corners=[P(-30,0),P(30,0),P(30,120),P(-30,120)]
const postBottom=[endQ,topZ],postHead=[endQ-346*s,topZ+346*c]
const coldL=(postHead[0]+200)/c,I=(50**4-44**4)/12,W=I/25
const gutterKgPerM=.2*.15*1000+.5*.0007*7140+20
const gutterN=gutterKgPerM*9.81*(3245/6/1000)
const gutterLever=(postHead[0]+270)/c
const coverQ=2.5*(3245/6/1000),coverM=coverQ*coldL**2/2
const totalM=coverM+1.35*gutterN*c*gutterLever
const v={status:'ONE unadopted ordinary-eave join. Physical allocation and authored load screens, not whole-roof, fire, water, material or site admission.',
 inputs:{had:{path,commit:hadCommit,blob:blob(hb)},roofControl:{path:controlPath,commit:controlCommit,blob:blob(cb)},str:{commit:strCommit,path:sp,blob:blob(sb)},coordination:'STR/MAT 2 November2026: q450 end rows; normal346 posts; RHS120x60x5. This delta awaits owning STR source/readback.'},
 ordinaryWall:{total:429.5,roomToWeather:[27,140,110,50,102.5],core:[262.5,402.5],glass:[152.5,262.5],scope:'Ordinary shell spatial reservation. Not the519.5/200glass loggia sidewall and not full constituent/thermal admission.'},
 collector:{bounds:[202.5,462.5,6540,6680],plate:{planNS:[212.5,452.5],top:6702},remainingGlassAtCollector:50,scope:'Actual260collector replaces60 of110glass. Do not draw glass through RC; complete2D/3D heat path remains unproved.'},
 geometry:{wallLineWeather:7100,edgeQ:-200,edgeWeather:roof(-200),normalStack:500.7,endPurlinQ:endQ,endRows:[8200,11550],purlin:[120,60,5],purlinCorners:corners,purlinLowest:Math.min(...corners.map(p=>p[1])),postBottom,postHead,postNormal:346,postAvclCrossingQ:endQ-25*s,railCantileverPlan:postHead[0]+200,railCantileverNormal:coldL,endTributaryPlan:700,lowerBoardEndQ:262.5,lowerBoardPlanExtension:endQ-262.5,roofGlassEndQ:152.5},
 clearances:{plateVertical:Math.min(...corners.map(p=>p[1]))-6702,airReturnQ:550,bodyMaxQ:Math.max(...corners.map(p=>p[0])),airReturnHorizontal:6640,carrierTopReserve:6628,authoredFabricationAllowance:10},
 air:{roof:'1mm supported stainless control; boundary turns atq550, inside the complete endpurlin body.',return:'Down to6640, then at6640 (12above carrier reserve6628) to actual collector finishq489.5 (462.5RC+27finish). Below6540 step to ordinary wallfinish429.5. Never run the line through the260collector.',joints:'Welded sheet corners; mechanically clamped plaster transition, actual bedding/compression/movement and source constituents unqualified. No gas/airtightness pass from metal by name.'},
 thermal:{roof320:true,wall110:true,collectorNeck:50,roofWallJoint:'Raked wallglass meets roofglass at its lower face; roofglass ends atq152.5, lowerboards atq262.5. No phantom500.7 stack projects into overhang.',retention:'Glass ownweight requires actual toe/support and movement-compatible retainers; cover/gutter loads bypass glass. Roof toe is supported by joined wallglass below, not treated as a structural cantilever.',limit:'No isolatedR or previous optimistic.1553 probe closes this edge. Collector, post/collar, wallhead and ceiling effects require joined thermal/moisture calculation.'},
 ceiling:{finished:6444,top:6620,completeDepth:176,perimeterAtCollectorFinish:489.5,carrierReserve:[6468,6628],requiredClosedReturn:96,scope:'Protected family terminates at actual projecting collector face. Its web may not overlap RC. Close the96 between finished6444 and RCsoffit6540 with the complete applicable classified return, not an unsupported60 board overhang or cut wool; exact classified perimeter and independent end support remain MAT-interiors/STR work. Ordinary ceilings remain separate.'},
 weather:{upperBoard:24,edgeCleat:{material:'Authored1.5 uncoated stainless, not a substituted G3 kit',lengthNormal:150,boardRebate:1.5,remainingBoard:22.5,hem:30,movementGapControl:6},secondary:{material:'Retained1mm breather duty on authored1.5 stainless eave support/drip; exact sheet/collars remain unqualified.',outerDripQ:-220,dripZ:roof(-220,75.7),lapSupport:'Falls outward below clear vent; no reverse lap. Support is cold-side, clipped to NS rails, not an AVCL bypass.'},vent:{grossNormal:30,meshMinimumOpen:.5,equivalentNet:15,continuousChannels:[490.8333333333,50],scope:'30throat within50zone; metal mesh/baffle below moving edge, no EW blockage. Wind-driven-rain and exact corner continuation remain unproved.'},
 gutter:{clearWidth:200,depth:150,planQ:[-370,-170],backCrest:6880,frontSpillCrest:6840,bottom:6730,wetDebrisKgPerM:gutterKgPerM,cradle:{section:[40,5],railSideCleat:[100,50,5],railBolts:'TwoM8 on50NS pitch/25end margins, middle of50rail; localbearing/tearout/welds unqualified.',bottom:6725},support:'Removable gutter in separate cradles attached to cold NSrails; topaccessibleM8 releases gutter without removing roof hem or secondary drip. Actual3mm rail-wall/bolt/cleat capacity remains unqualified.',renewal:'Lower each supported gutter length150, move outward400 into external access platform; do not stand on roof boards. Cradles and roof weathering remain.',failure:'Front spill40below back crest, below both roof exits. Primary and secondary share this receiver: blocked outlet is a common event, not independent redundancy. Wind/capture/capacity/outlet geography remain RWT work.'}},
 screens:{railI:I,railW:W,normalCoverKpa:2.5,coverCantileverMomentNmm:coverM,gutterPerRailN:gutterN,totalAuthoredMomentNmm:totalM,stressMpa:totalM/W,coverDeflectionMm:coverQ*coldL**4/(8*193000*I),postEndNormalArea:(3245/6/1000)*.7/c,postNormal2_25Kn:2.25*(3245/6/1000)*.7/c,limit:'Authored distributed cover plus1.35wet/debris-gutter screen, not normative load combination. Coldrail/endpost/weld/hold-down, point/worker loads and local3mmwall capacity are not admitted. Roof is not walkable.'},
 sources:{manufacturer:'https://www.vmzinc.com/en-gb/standing-seam-on-open-gap-timber-boarding',guide:'https://assets.fedrusinternational.be/gen/VMZINC/Documentation/UK/UK%20-%20general%20docs/VMZINC%20SS%20Install%20Guide%202022.pdf',interpretation:'May2022pp10–12 distinguish moving hem/eavesstrip/support; illustratedPLUS/plywood detail is not copied as approval of this Naturalzinc/openboard/customcleat. All custom dimensions are authored.'}}
v.clearances.plateAfterAllowance=v.clearances.plateVertical-10
v.clearances.airAfterAllowance=550-v.clearances.bodyMaxQ-10
v.weather.secondary.clearOverBackCrest=v.weather.secondary.dripZ-v.weather.gutter.backCrest
assert(v.clearances.plateAfterAllowance>0&&v.clearances.airAfterAllowance>0)
assert(v.weather.secondary.clearOverBackCrest>20)
const X=q=>30+(q+400)/10,Y=z=>50+(7400-z)/10
const pts=a=>a.map(([q,z])=>`${X(q)},${Y(z)}`).join(' ')
const poly=(a,col)=>`<polygon points="${pts(a)}" fill="${col}" stroke="#34495a" stroke-width=".2"/>`
const rect=(q0,q1,z0,z1,col)=>poly([[q0,z0],[q1,z0],[q1,z1],[q0,z1]],col)
const band=(q0,q1,d0,d1,col)=>poly([[q0,roof(q0,d0)],[q1,roof(q1,d0)],[q1,roof(q1,d1)],[q0,roof(q0,d1)]],col)
const line=(a,col='#ae4741')=>`<polyline points="${pts(a)}" fill="none" stroke="${col}" stroke-width=".6"/>`
const text=(x,y,a,n=3)=>`<text x="${x}" y="${y}" font-size="${n}">${a}</text>`
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="Arial,sans-serif" fill="#203746">'
svg+=text(15,15,'ONE ACTUAL ORDINARY EAVE · retained200 overhang / warm boundary / 1:10',5)+text(15,24,'Unadopted: current roof authority retained; complete contacts, edge depths and later admission distinguished.',3.3)
svg+=rect(262.5,402.5,6400,6540,'#cabaa5')+rect(202.5,462.5,6540,6680,'#aebfcd')
svg+=poly([[152.5,6400],[262.5,6400],[262.5,6540],[202.5,6540],[202.5,6680],[262.5,6680],[262.5,roof(262.5,395.7)],[152.5,roof(152.5,395.7)]],'#e8d17c')
svg+=rect(0,102.5,6400,6900,'#ba7e69')+text(15,166,'Weather-leaf head/cavity closure shown as a located remaining joint, not a qualified cap.',2.8)
svg+=band(-200,1000,0,.7,'#919ca5')+band(-200,-200+150*c,2.2,24.7,'#bda077')+band(-200+150*c,1000,.7,24.7,'#bda077')+band(-200,-200+150*c,.7,2.2,'#8e9dab')+band(-220,1000,74.7,75.7,'#9481a4')+band(152.5,1000,75.7,395.7,'#e8d17c')+band(262.5,1000,395.7,396.7,'#526d86')+band(262.5,1000,396.7,420.7,'#bda077')+`<g stroke-dasharray="1 1">${band(332.5,1000,420.7,500.7,'none')}</g>`
svg+=band(-220,152.5,75.7,77.2,'#8e9dab')+poly(corners,'#8e9dab')+line([postBottom,postHead],'#526d86')
svg+=band(-200,1000,24.7,74.7,'#d7e1e7')+line([[550,roof(550,396.7)],[550,6640],[489.5,6640],[489.5,6525],[429.5,6525],[429.5,6400]])
svg+=`<g stroke-dasharray="1 1">${line([[489.5,6444],[489.5,6540]],'#9c5646')}</g>`+rect(489.5,1000,6444,6620,'#eee1cf')+rect(212.5,452.5,6680,6702,'#748592')
svg+=line([[-130,roof(-130,49.7)],[-150,roof(-150,74.7)],[-150,6725],[-390,6725],[-390,6840]],'#536b7e')
svg+=poly([[-370,6840],[-370,6730],[-170,6730],[-170,6880],[-177,6880],[-177,6737],[-363,6737],[-363,6840]],'#a4b2bc')
svg+=text(190,45,'ACTUAL GEOMETRY / CONTACTS',4)
for(const [i,a]of [
 'Weather edge7006.738 atq−200; wall datum7100.',
 '500.7normal remains the ordinary-face parent.',
 'Endpurlin centre450; rows8200/11550;120×60×5.',
 `Lowest${v.geometry.purlinLowest.toFixed(3)}; complete seat TOP6702.`,
 `Gap${v.clearances.plateVertical.toFixed(3)} minus10 allowance.`,
 `Normal346post: headq${postHead[0].toFixed(3)}.`,
 `Railcantilever${coldL.toFixed(3)}NORMAL, not200.`,
 'End post tributary700PLAN, not the old550.',
 'Collector260 cuts110glass to50locally.',
 'AIR return550 clears fullpurlin incl room projection.',
 'Air at6640 clears carrier6628; joins finish489.5.',
 'Protected176 ends here; classified96return held.',
 'Breather/drip belowvent, separate movingzinc hem.',
 'Custom150cleat/1.5rebate; no G3 kit approval.',
 '30vent throat×50%mesh=15net; channels50clear.',
 '200gutter on40×5cradles; front spill40belowback.',
 `Rail authored stress${v.screens.stressMpa.toFixed(1)}MPa incl wetgutter.`,
 'Point/worker/weld/hold-down capacity NOT earned.'
 ].entries())svg+=text(190,55+i*7,a,3.2)
svg+=text(15,185,'Rail/post plane shown; warm rafter is projected/dashed.50air channels lie alongside NSrails, not through them.',3.1)+text(15,196,'Red: proposed joined air line. It does not cut through collector or purlin. Actual clamped plaster/movement joint remains unqualified.',3.1)
svg+=text(15,205,'Yellow: real glass profile.50neck and roof toe/retaining detail remain thermal/mechanical work; no isolatedR or wholeU pass.',3.1)
svg+=text(15,214,'Gutter150lowering +400outward renewal uses external platform. Roofedge, vents and secondary drip remain fixed.',3.1)
svg+=text(15,223,'Primary and secondary drain to SAME receiver: common blockage remains. Capture, outlets, ridge/hip/valley and wallhead fire joins are open.',3.1)
svg+=text(15,232,'Breather chemistry/collars and metalAVCL/plaster closure are actual duty holds; no synthetic exception or stripped manufacturer system.',3.1)
svg+=text(15,245,'This is a source-bound edge development, not a second roof model or approval of the protected ceiling/perimeter/material package.',3.3)+'</g></svg>\n'
for(const[p,b]of Object.entries({'project/mat/studies/loggia-roof-edge.json':JSON.stringify(v,null,2)+'\n','project/mat/studies/loggia-roof-edge.svg':svg}))if(process.argv.includes('--check'))assert.equal(fs.readFileSync(p,'utf8'),b,p+' stale');else fs.writeFileSync(p,b)
console.log(JSON.stringify({endRow:endQ,edge:v.geometry.edgeWeather,postHead,cantilever:coldL,clear:v.clearances,stress:v.screens.stressMpa}))
