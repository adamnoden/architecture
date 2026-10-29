/** Source-bound comparison only; not a scaffold, handling or roof-work design. */
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {layoutRevision as d,revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'
import {elevationSource,roofTop} from '../../../compiler/reference-house/georgian/layout-family.js'
const court=d.court,grade=d.facade.externalGround
const doors=revisionOpenings('GROUND').filter(o=>['garden-entry','grand-court-entry-north'].includes(o.id))
const northDoor=elevationSource('COURT-ENTRY').apertures.find(o=>o.kind==='door')!
if(court.x!==4250||court.y!==4250||court.width!==3500||court.depth!==3500||grade!==-150||d.roof.courtEaves!==6800||doors.length!==2||doors.some(o=>o.centre!==6000||o.width!==2400)||northDoor.head!==2850)throw Error('Source changed: reappraise access comparison')
// Manual PN126637-01 Rev B 0725, printed pp9–10. These are deployed footprints.
const tower={model:'BoSS Ladderspan AGR 850 / 1.8m',high:{platform:6200,stabiliser:'SP10',footprint:[4072,4768]},low:{platform:3700,stabiliser:'SP7',footprint:[2930,2930]},nominalFrame:[850,2000],manualRestriction:'work platform; not access to another structure'}
// Authored carrying allowance, NOT the measured packed product or a human-action pass.
const carry={width:950,height:2100,depth:300,centreX:6000,routeY:[12200,6000],sourceNominalDoorWidth:2400,sourceNominalHead:2850}
const scaffold={status:'unselected geometric reservation, no temporary-works design',ringDeckWidth:700,centralRemainder:2100,accessBay:{x:4250,y:5350,width:1000,depth:1800},candidateTiePatch:{wall:'court-south',x:6000,z:3500},assumedWorkingDeckZ:5800}
const metrics={highFootprintExcess:tower.high.footprint.map(n=>n-court.width),lowFootprintMargin:court.width-2930,eaveAboveGrade:d.roof.courtEaves-grade,highPlatformZ:grade+tower.high.platform,highEaveVerticalDifference:d.roof.courtEaves-(grade+tower.high.platform),lowAdvertisedWorkingZ:grade+tower.low.platform+2000,lowAdvertisedWorkingDeficit:d.roof.courtEaves-(grade+tower.low.platform+2000),carryNominalWidthMargin:2400-carry.width,carryNominalHeadMargin:northDoor.head-carry.height,thresholdDifference:0-grade,ridgeZ:roofTop(),ridgeHorizontalFromEave:d.roof.ridgeInset,ridgeRise:roofTop()-d.roof.courtEaves,faceSlopeLength:d.roof.ridgeInset/Math.cos(d.roof.upperPitchDeg*Math.PI/180),valleySlopeLength:Math.hypot(Math.SQRT2*d.roof.ridgeInset,roofTop()-d.roof.courtEaves)}
if(metrics.highFootprintExcess.some(n=>n<=0)||metrics.lowAdvertisedWorkingDeficit!==1250||scaffold.centralRemainder!==court.width-2*scaffold.ringDeckWidth)throw Error('Unexpected arithmetic')
const sources=['../../../compiler/reference-house/georgian/layout-revision.ts','../../../compiler/reference-house/georgian/layout-family.ts'].map(path=>({path,sha256:createHash('sha256').update(readFileSync(new URL(path,import.meta.url))).digest('hex')}))
const output={basis:d.id,sources,tower,carry,scaffold,metrics,limits:['No selected access equipment, structural support, tie, lifting method or safe roof transfer','Nominal door comparison excludes frames/leaves, operators, furniture, hardware and actual product projections','Court grade is represented -150; actual falls/drains/base bearing and thresholds remain unselected','Scaffold ring/bay and tie patch are located design questions, not an installable arrangement']}
const a:string[]=[];const add=(s:string)=>a.push(s),t=(x:number,y:number,s:string,size=2.6)=>add(`<text x="${x}" y="${y}" font-size="${size}">${s}</text>`),rect=(x:number,y:number,w:number,h:number,fill='none',dash=false)=>add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#506a70" stroke-width=".35" ${dash?'stroke-dasharray="1.5 1"':''}/>`)
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="DejaVu Sans,sans-serif" fill="#183c47"><rect width="420" height="297" fill="#fffef9"/>')
t(14,15,'ROF / access: components entering is not equipment fitting',5)
t(14,24,'Current 3500 court · A3 geometry study · dimensions mm · no approved equipment or temporary works',3)
t(14,37,'A  North logistics / 1:50',3.4)
const px=(x:number)=>14+(x-4000)/50,py=(y:number)=>209-(y-4250)/50
rect(px(4250),py(7750),70,70,'#f0eee5');
for(const y of [7750,12000]){const yy=py(y);add(`<path d="M${px(4800)} ${yy} H${px(7200)}" stroke="#fffef9" stroke-width="1.6"/>`);add(`<path d="M${px(4250)} ${yy} H${px(4800)} M${px(7200)} ${yy} H${px(7750)}" stroke="#183c47" stroke-width="1.2"/>`);t(96,yy+1,'2400 nominal',2.4)}
rect(px(6000-carry.width/2),py(12200),carry.width/50,(12200-6000)/50,'#d5e1e5',true)
t(17,61,'garden entry',2.5);t(17,104,'family / dining',2.5);t(17,119,'furniture / handling unproved',2.2)
t(18,152,'court entry',2.5);t(18,199,'court 3500 × 3500',2.7)
t(14,221,'Straight x6000 component route only.',2.6)
t(14,228,'950 × 2100 × 300 carrying allowance;',2.5)
t(14,235,'not measured packed size or operators.',2.5)
t(14,242,'Threshold −150 to 0 is unresolved.',2.5)
t(145,37,'B  Court alternatives / 1:50',3.4)
rect(151,58,70,70,'#f0eee5');rect(151-(4072-3500)/100,58-(4768-3500)/100,4072/50,4768/50,'none',true)
rect(151+(3500-2930)/100,58+(3500-2930)/100,2930/50,2930/50,'none',true)
t(145,148,'SP10: 4072 × 4768 — does not fit.',2.7)
t(145,155,'SP7: 2930 square; insufficient height.',2.7)
rect(151,164,70,70,'#d5e1e5');rect(165,178,42,42,'#fffef9');rect(151,176,20,36,'none',true)
t(224,178,'700 ring',2.3);t(224,185,'2100 centre',2.3);t(224,198,'1000 × 1800',2.3);t(224,205,'access bay',2.3)
t(145,244,'Ring/bay = authored reservations only.',2.5)
t(145,251,'No bases, ties or ladder design earned.',2.5)
t(275,37,'C  Roof/working levels / 1:50',3.4)
const sx=(y:number)=>275+(y-2000)/50,sz=(z:number)=>235-z/50
add(`<path d="M${sx(2125)} ${sz(roofTop())} L${sx(4250)} ${sz(6800)} M${sx(4250)} ${sz(6800)} V${sz(grade)} H${sx(7750)} V${sz(6800)}" fill="none" stroke="#183c47" stroke-width=".7"/>`)
for(const [z,label] of [[6800,'eave +6800'],[6050,'6.2m platform → +6050'],[3550,'3.7m platform → +3550']] as const){add(`<path d="M${sx(4700)} ${sz(z)} H${sx(6800)}" stroke="#a96642" stroke-width=".5" stroke-dasharray="1 1"/>`);t(323,sz(z)-3,label,2.2)}
t(275,72,'ridge +7791',2.5);t(275,76,'2125 horizontal to eave',2.3)
t(323,sz(grade)+6,'grade −150',2.5)
t(275,248,'Level lines do not prove safe reach.',2.5)
t(275,255,'High tower already fails its footprint.',2.5)
t(14,272,'Rejected: ordinary high mobile tower and indoor-only liftshaft workaround. Purpose-designed scaffold remains an unresolved comparator.',2.8)
t(14,282,'Companion roof-access-and-renewal.md owns sequences, source limits and discharge conditions. No safe access or construction approval.',2.8)
add('</svg>')
for(const [name,content] of [['roof-access-study.json',JSON.stringify(output,null,2)+'\n'],['roof-access-study.svg',a.join('\n')+'\n']]){const path=fileURLToPath(new URL(name,import.meta.url));if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==content)throw Error(`${name} stale`)}else writeFileSync(path,content)}
console.log(JSON.stringify(metrics,null,2))
