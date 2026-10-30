/** Located, unadopted architectural comparison. No hydraulic/structural acceptance. */
import {writeFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {layoutRevision as d,revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'
const sources=['compiler/reference-house/georgian/layout-revision.ts','compiler/reference-house/georgian/layout-family.ts','project/had/had-03-court-levels.md']
const openings=revisionOpenings('GROUND').filter(o=>['garden-entry','grand-court-entry-north'].includes(o.id))
if(d.shell!==12000||d.court.y+d.court.depth!==7750||d.envelope!==417.5||openings.length!==2||openings.some(o=>o.centre!==6000||o.width!==2400))throw Error('Reassess north crossing against changed house/opening source')
const start=7750,end=d.shell,run=end-start
const trial={centres:[5800,6200],carrierOutside:110,sleeveInside:160,sleeveOutside:180,fall:60,nearSleeveCrown:-325,carrierNearCentre:-420,finish:15,screed:65,insulation:100,bridgeTop:-185,bridgeBottom:-285,bridgeClear:650,bearingEach:150,endProjection:100,handlingAllowance:800,exteriorGrade:-150,requiredReceiverMaximum:-585}
const near={sleeveCrown:trial.nearSleeveCrown,sleeveBottom:trial.nearSleeveCrown-trial.sleeveOutside,carrierCrown:trial.carrierNearCentre+55,carrierBottom:trial.carrierNearCentre-55}
const far=Object.fromEntries(Object.entries(near).map(([k,v])=>[k,v-trial.fall])) as typeof near
// Sleeve centre -415, inner bottom -495; carrier bottom -475 leaves20 for a removable support/skid envelope.
const data={authority:'Unadopted north-axis comparison. Dimensions below are authored envelopes, not selected sleeve/support products or performance.',sourceId:d.id,sources:sources.map(path=>({path,blob:execFileSync('git',['hash-object',path],{encoding:'utf8'}).trim()})),openings:openings.map(o=>({id:o.id,wall:o.wall,from:o.centre-o.width/2,to:o.centre+o.width/2})),run,trial,near,far,gradientDenominator:run/trial.fall,sleeveGroup:{from:5710,to:6290,width:580},bridge:{clearFrom:5675,clearTo:6325,overallFrom:5525,overallTo:6475,width:950,sleeveSideMargin:35,nearVerticalGap:40},carrierRadialBudget:{innerCrown:-335,innerBottom:-495,top:30,bottom:20,lateral:25},floor:{finish:[0,-15],screed:[-15,-80],insulation:[-80,-180],separation:[-180,-185],supportBridge:[-185,-285],nearGap:[-285,-325],farSleeveBottom:far.sleeveBottom,extraBelowNominal300:-300-far.sleeveBottom},renewal:{body:run+200,straightExternalCorridor:run+200+800,requiredPlan:{xFrom:5200,xTo:6800,yFrom:12000,yTo:17250},courtEndAccess:{xFrom:5400,xTo:6600,yFrom:7150,yTo:7750},outsideTerminalAccess:{xFrom:5200,xTo:6800,yFrom:12000,yTo:12800}},receiving:{carrierOutsideBottom:far.carrierBottom,maximumWater:trial.requiredReceiverMaximum,sleeveInnerBottom:-555,sleeveTellTaleMargin:30,separation:far.carrierBottom-trial.requiredReceiverMaximum,depthBelowSchematicGrade:trial.exteriorGrade-trial.requiredReceiverMaximum,authority:'Required site interface comparison, not a surveyed available receiver, air-gap rule or proven safe margin.'},shallowRejection:[0,10,20,30,50].map(insulation=>({additionalInsulation:insulation,retainedGap:10,downwardShift:insulation,outletInvert:-130-insulation,marginAboveGrade:20-insulation})),threshold:{hadTrialBottom:-45,operatingWaterTarget:-50,nominalDifference:5,actualLowestVulnerableJoint:null},unresolved:['actual sleeve/skid alignment and pull force','bridge material/support/reactions and floor loading','continuous pan/end/anchor/door-joint weather boundary','inlet transitions and hydraulic operating level','independent lower exterior receiver at actual site','high court receiver access and temporary discharge']}
writeFileSync(new URL('./north-court-carrier.json',import.meta.url),JSON.stringify(data,null,2)+'\n')
const esc=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;')
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><style>text{font-family:Arial,sans-serif;font-size:3.1px;fill:#23363e}.title{font-size:6px;font-weight:bold}.sub{font-size:4px;font-weight:bold}.wall{fill:#e1e5e6;stroke:#52646d;stroke-width:.3}.pipe{fill:#b8dce8;stroke:#286b87;stroke-width:.4}.sleeve{fill:#eef6f8;stroke:#286b87;stroke-width:.4}.ins{fill:#f6e6ac;stroke:#958150;stroke-width:.3}.bad{fill:none;stroke:#af4b37;stroke-width:.5;stroke-dasharray:2,1}.line{fill:none;stroke:#53676f;stroke-width:.3}</style>'
const t=(x:number,y:number,s:string,c='')=>svg+=`<text x="${x}" y="${y}" class="${c}">${esc(s)}</text>`
const r=(x:number,y:number,w:number,h:number,c:string)=>svg+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${c}"/>`
const l=(x:number,y:number,xx:number,yy:number,c='line')=>svg+=`<path d="M${x},${y}L${xx},${yy}" class="${c}"/>`
t(12,14,'North court crossing: continuous floor, external renewal','title');t(12,23,'30 October 2026 / unadopted comparison / no load, hydraulic, threshold or real-site admission')
t(12,35,'A  Located plan / unequal scales below','sub')
const px=(x:number)=>15+(x-4800)/50,py=(y:number)=>137-(y-7150)/100
for(const [a,b]of [[7750,8167.5],[11582.5,12000]]){r(px(4800),py(b),2400/50,(b-a)/100,'wall');r(px(5525),py(b),950/50,(b-a)/100,'ins')}
for(const x of trial.centres)r(px(x-90),py(12000),180/50,run/100,'sleeve')
r(px(5200),py(17250),1600/50,5250/100,'bad');r(px(5400),py(7750),1200/50,600/100,'bad')
t(74,45,'Required external extraction corridor: 5250 ×1600.');t(74,53,'No actual garden, ownership or clear site is assumed.');t(74,66,'Two separate carriers: x5800 and6200.');t(74,74,'Both existing door apertures: x4800–7200.');t(74,87,'Two independent threshold bridges; no pier drilling.');t(74,95,'Family-room floor remains continuous above route.');t(74,108,'Court terminal access600 deep; actual fittings needed.');t(74,116,'Lifting pavers exposes ends, not the whole carrier.');t(12,145,'Plan longitudinal scale1:100; transverse1:50 (deliberately unequal).')
t(215,35,'B  Threshold crossing / transverse1:10','sub')
const bx=(x:number)=>225+(x-5500)/10,bz=(z:number)=>48-z/6
r(bx(5500),bz(0),100,15/6,'wall');r(bx(5500),bz(-15),100,65/6,'wall');r(bx(5500),bz(-80),100,100/6,'ins');r(bx(5525),bz(-185),950/10,100/6,'wall')
for(const x of trial.centres){svg+=`<ellipse cx="${bx(x)}" cy="${bz(-415)}" rx="9" ry="15" class="sleeve"/><ellipse cx="${bx(x)}" cy="${bz(-420)}" rx="5.5" ry="9.1667" class="pipe"/>`}
l(bx(5675),bz(-285),bx(5675),bz(-570),'bad');l(bx(6325),bz(-285),bx(6325),bz(-570),'bad')
t(329,54,'Finish15');t(329,65,'Screed65');t(329,78,'Insulation100');t(329,94,'Slab envelope100');t(329,108,'650 clear /150 seats');t(329,122,'Sleeves180 outside');t(329,137,'Carriers110 outside');t(215,148,'Vertical1:6; transverse1:10. All supports unselected.')
t(12,163,'C  Longitudinal section / horizontal1:25; vertical1:6','sub')
const sx=(y:number)=>15+(y-start)/25,sz=(z:number)=>176-z/6
r(sx(start),sz(0),run/25,15/6,'wall');r(sx(start),sz(-15),run/25,65/6,'wall');r(sx(start),sz(-80),run/25,100/6,'ins');r(sx(start),sz(-185),run/25,100/6,'wall')

svg+=`<path d="M${sx(start)},${sz(near.sleeveCrown)}L${sx(end)},${sz(far.sleeveCrown)}L${sx(end)},${sz(far.sleeveBottom)}L${sx(start)},${sz(near.sleeveBottom)}Z" class="sleeve"/>`
svg+=`<path d="M${sx(start)},${sz(near.carrierCrown)}L${sx(end)},${sz(far.carrierCrown)}L${sx(end)},${sz(far.carrierBottom)}L${sx(start)},${sz(near.carrierBottom)}Z" class="pipe"/>`
l(sx(start),sz(-300),sx(end),sz(-300),'bad');l(sx(end),sz(-150),sx(end+500),sz(-150),'bad');l(sx(end),sz(-585),sx(end+500),sz(-585),'bad')
t(215,177,'Continuous floor has no removable wet access strip.');t(215,188,'Floor/bridge is an authored envelope, not a load proof.');t(215,199,'Sleeve bottom−505→−565: 265 below old reserve.');t(215,210,'Carrier outer bottom−475→−535; bore not selected.');t(215,221,'Receiver maximum trial−585: 435 below old grade.');t(215,232,'Separate primary/relief receiving identities required.');t(215,243,'Full-length body4450 +handling800 =5250 corridor.');t(215,254,'No unseen coupling through sleeve; withdraw outside.');t(215,265,'Lost free-outfall advantage is explicit, not repaired by label.')
t(12,286,'RWT remains planned. See north-court-carrier.md for product evidence, rejection cases, threshold and access obligations.')
svg+='</svg>\n';writeFileSync(new URL('./north-court-carrier.svg',import.meta.url),svg)
console.log(JSON.stringify({run,near,far,renewal:data.renewal,receiving:data.receiving},null,2))
