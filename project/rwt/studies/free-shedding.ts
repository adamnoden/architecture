/** Located options comparison only: no hydraulic capacity, splash width or site acceptance. */
import assert from 'node:assert/strict'
import {readFileSync, writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {layoutRevision as d, revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'
import {currentRoofZ} from '../../../compiler/reference-house/georgian/layout-family.js'

const expected = {id:'RH-LAYOUT-REVISION-02', shell:12000, court:3500, ridgeInset:2125, eaves:6800, pitch:25, overhang:200}
assert.deepEqual({id:d.id,shell:d.shell,court:d.court.width,ridgeInset:d.roof.ridgeInset,eaves:d.roof.eaves,pitch:d.roof.upperPitchDeg,overhang:d.roof.overhang}, expected, 'House changed: reappraise the edge dispositions and receiver study')
assert.equal(d.roof.kind,'inward-outward-pitched-ring','Roof topology changed: reappraise inward/outward catchments')
assert.equal(d.roof.courtEaves,6800,'Court eaves changed: reappraise the free-shedding comparison')
assert.equal(d.court.depth, d.court.width)
assert.equal(d.court.x, (d.shell-d.court.width)/2)
assert.equal(d.court.y, d.court.x)
const S=d.shell/1000, C=d.court.width/1000, R=(d.shell-2*d.roof.ridgeInset)/1000
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-9, `${a} != ${b}`)
near(currentRoofZ(d.shell/2,d.court.y),d.roof.courtEaves)
const partition=(e:number)=>{
  assert.ok(e>=0&&2*e<C, 'Overhang must leave an open court')
  const total=(S+2*e)**2, openCourt=(C-2*e)**2
  return {outerRoof:total-R**2,innerRoof:R**2-openCourt,openCourt,total,innerSpillPlusDirect:R**2}
}
const nominal=partition(0), offset=partition(d.roof.overhang/1000)
const prior=JSON.parse(readFileSync(new URL('../../bcr/studies/water-path-study.json',import.meta.url),'utf8'))
const comparisons:Array<[ReturnType<typeof partition>,ReturnType<typeof partition>]> = [[nominal,prior.nominal],[offset,prior.overhangSensitivity]]
for(const [now,previous] of comparisons){
  for(const key of Object.keys(now) as Array<keyof typeof now>)near(now[key],previous[key])
  near(now.outerRoof+now.innerRoof+now.openCourt,now.total)
  near(now.innerRoof+now.openCourt,R**2)
}
// Independent failure examples: the full court cannot be counted again beneath an overhang.
near(offset.innerRoof+nominal.openCourt-offset.innerSpillPlusDirect,2.64)
assert.ok(nominal.innerSpillPlusDirect/nominal.openCourt>4.9)
const doors=revisionOpenings('GROUND').filter(q=>q.kind==='door'&&/^(outer|court)-/.test(q.wall)).map(q=>({id:q.id,edge:q.wall,fromMm:q.centre-q.width/2,toMm:q.centre+q.width/2}))
assert.deepEqual(doors,[
  {id:'front-door',edge:'outer-south',fromMm:5100,toMm:6900},
  {id:'plant-replacement',edge:'outer-east',fromMm:3900,toMm:5300},
  {id:'garden-entry',edge:'outer-north',fromMm:4800,toMm:7200},
  {id:'grand-court-entry-south',edge:'court-south',fromMm:4800,toMm:7200},
  {id:'grand-court-entry-north',edge:'court-north',fromMm:4800,toMm:7200}
], 'Opening/route changed: reappraise edge exclusions')
const edges=['outer-north','outer-east','outer-south','outer-west','court-north','court-east','court-south','court-west'].map(id=>({id,
  disposition:id.startsWith('court')?'Reject free shedding as present-house default; develop controlled copper':id==='outer-west'?'Conditional garden test candidate; no site territory established':'Copper at openings and occupied/renewal routes; flanks conditional only',
  doorIntervals:doors.filter(q=>q.edge===id),
  routeBufferMm:null, safeReceiverWidthMm:null,
  qualification:'Door intervals are nominal source apertures, not complete pedestrian/handling or wetting exclusion envelopes'
}))
const loads=[.02,.04,.06].map(rate=>({rateLpsM2:rate,equivalentMmPerHour:rate*3600,
  outerRoofLps:rate*nominal.outerRoof,outerFaceSymmetryLps:rate*nominal.outerRoof/4,
  outerPerimeterAverageLpsM:rate*nominal.outerRoof/(4*S),
  idealOuterMidSideLpsM:rate*(d.roof.ridgeInset/1000),
  innerRoofLps:rate*nominal.innerRoof,directCourtLps:rate*nominal.openCourt,
  combinedCourtLps:rate*nominal.innerSpillPlusDirect,
  blockedTenMinuteCombinedLitres:rate*nominal.innerSpillPlusDirect*600,
  blockedTenMinuteDirectLitres:rate*nominal.openCourt*600,
  offsetOuterRoofLps:rate*offset.outerRoof,offsetDirectCourtLps:rate*offset.openCourt
}))
near(loads[1].combinedCourtLps,2.4025)
near(loads[1].blockedTenMinuteCombinedLitres,1441.5)
assert.ok(loads[1].idealOuterMidSideLpsM>loads[1].outerPerimeterAverageLpsM,'A perimeter average hides local loading even on the ideal outer trapezoid')
const courtBands=[.3,.45,.6,.75,1].map(w=>{
  assert.ok(w>=0&&2*w<C)
  const remainingWidth=C-2*w, remainingArea=remainingWidth**2
  return {bandWidthM:w,remainingWidthM:remainingWidth,remainingAreaM2:remainingArea,occupiedAreaM2:C*C-remainingArea,occupiedPercent:100*(C*C-remainingArea)/(C*C)}
})
const exteriorBands=[.5,.75,1,1.25,1.5].map(w=>({bandWidthM:w,oneEdgeAreaM2:S*w,fullRingAreaM2:(S+2*w)**2-S*S}))
near(courtBands[2].remainingAreaM2,5.29)
near(exteriorBands[2].fullRingAreaM2,52)
const report={basis:d.id,scope:'Vertical-rain and land-take sensitivities; options comparison, not construction',
  sourcePaths:['compiler/reference-house/georgian/layout-revision.ts','compiler/reference-house/georgian/layout-family.ts','compiler/reference-house/georgian/section-exemplar.ts','project/bcr/studies/water-path-study.json'],
  nominal,overhangSensitivity:offset,overhangQualification:'Consistent square-offset sensitivity, not a selected overhang plan',
  nominalEavesMm:d.roof.eaves,sectionTipMm:currentRoofZ(d.shell/2,-d.roof.overhang),
  actualDropHeightMm:null,effectiveAreaM2:null,designRainfall:null,
  edges,loads,courtBands,exteriorBands,
  limits:['No facade/wind loading or actual local flow allocation','No safe splash distance or hydraulic sizing','No admissible storage or response-time allowance','No physical hedge benefit credited','Band widths are authored space sensitivities, not recommendations','Four inner valleys require separate concentrated-discharge cases']}
const colour={ink:'#243c45',muted:'#566c72',copper:'#a45f3e',teal:'#297f7c',amber:'#ae8639',paper:'#fffdf7'}
const svg:string[]=[]
const add=(v:string)=>svg.push(v)
const text=(x:number,y:number,t:string,size=2.7,fill=colour.ink)=>add(`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}">${t}</text>`)
const line=(x:number,y:number,xx:number,yy:number,col=colour.muted,width=.35,dash=false)=>add(`<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" stroke="${col}" stroke-width="${width}"${dash?' stroke-dasharray="1.5 1"':''}/>`)
add(`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="DejaVu Sans,sans-serif"><rect width="420" height="297" fill="${colour.paper}"/>`)
text(12,16,'Roof shedding / where the water can go',5.6)
text(12,25,'Source-bound options study • no selected receiver width, hydraulic capacity, safe ponding level or plot',3)
text(12,37,'01 / Edge map • wall-line plan 1:100 at A3 • north up',3.2)
const px=(x:number)=>25+x/100,py=(y:number)=>169-y/100
const box=(x:number,y:number,w:number,h:number,fill:string)=>add(`<rect x="${px(x)}" y="${py(y+h)}" width="${w/100}" height="${h/100}" fill="${fill}" stroke="${colour.muted}" stroke-width=".25"/>`)
box(0,0,d.shell,d.shell,'#e2e8e2');box(d.roof.ridgeInset,d.roof.ridgeInset,d.shell-2*d.roof.ridgeInset,d.shell-2*d.roof.ridgeInset,'#d2dfdc');box(d.court.x,d.court.y,d.court.width,d.court.depth,colour.paper)
for(const [x,y,xx,yy]of [[0,0,2125,2125],[12000,0,9875,2125],[12000,12000,9875,9875],[0,12000,2125,9875],[2125,2125,4250,4250],[9875,2125,7750,4250],[9875,9875,7750,7750],[2125,9875,4250,7750]])line(px(x),py(y),px(xx),py(yy))
line(px(0),py(0),px(0),py(12000),colour.teal,1.3,true)
for(const [x,y,xx,yy]of [[0,0,12000,0],[12000,0,12000,12000],[0,12000,12000,12000]])line(px(x),py(y),px(xx),py(yy),colour.amber,1.3,true)
for(const [x,y,xx,yy]of [[4250,4250,7750,4250],[7750,4250,7750,7750],[4250,7750,7750,7750],[4250,4250,4250,7750]])line(px(x),py(y),px(xx),py(yy),colour.copper,1.3)
for(const q of doors){const north=q.edge.endsWith('north'),south=q.edge.endsWith('south'),inner=q.edge.startsWith('court');if(north||south){const y=inner?(north?7750:4250):(north?12000:0);line(px(q.fromMm),py(y),px(q.toMm),py(y),colour.ink,2)}else line(px(12000),py(q.fromMm),px(12000),py(q.toMm),colour.ink,2)}
for(const x of [4250,7750])for(const y of [4250,7750])add(`<circle cx="${px(x)}" cy="${py(y)}" r="1.2" fill="${colour.copper}"/>`)
text(69,105,'COURT',3);text(69,111,'3.5 × 3.5 m',2.6)
text(67,44,'N / garden door',2.8);text(70,177,'S / entrance',2.8)
text(149,120,'E / plant',2.6);text(149,125,'route',2.6)
text(10,104,'W',3.4,colour.teal)
line(12,187,22,187,colour.teal,1.1,true);text(26,188,'Best conditional garden test edge',2.7)
line(12,194,22,194,colour.amber,1.1,true);text(26,195,'Flanks conditional; protect occupied routes',2.7)
line(12,201,22,201,colour.copper,1.1);text(26,202,'Copper comparator; no court free-shed default',2.7)
line(12,208,22,208,colour.ink,1.4);text(26,209,'Door spans; route / splash exclusion unresolved',2.7)
text(12,217,'Corner dots: inner valley concentration, not equal outlet loads.',2.5)
text(182,37,'02 / Receiver sections • diagrammatic, not dimensioned',3.2)
text(182,48,'A / open garden edge: shallow and able to spill outwards',3,colour.teal)
add('<path d="M190 54 L190 88 L208 90 L229 92 L254 93 L276 96 L318 98 L399 101" fill="none" stroke="#566c72" stroke-width=".5"/>')
line(182,55,218,66,colour.ink,.7);line(218,66,218,86,colour.teal,.45,true)
add('<path d="M211 91 L211 96 L247 97 L247 93" fill="none" stroke="#a45f3e" stroke-width="1"/>')
for(let x=216;x<=241;x+=5)add(`<ellipse cx="${x}" cy="92" rx="2" ry="1.1" fill="#aeb9af"/>`)
line(248,93,274,96,colour.teal,.6);line(274,96,270,93,colour.teal,.6)
for(const x of [324,332,340])add(`<circle cx="${x}" cy="84" r="6" fill="#b5c5a4"/>`)
line(332,88,332,99,colour.muted,.5)
text(194,105,'wall-base',2.5);text(218,105,'impact',2.5);text(260,105,'open spill',2.5);text(318,109,'hedge beyond essential route',2.5)
text(182,116,'Collector invert / spill crest / susceptible fabric: actual levels unresolved.',2.5)
text(182,126,'Normal conveyance leaves section; actual outlet and destination unresolved.',2.5)
text(182,138,'B / copper comparator: protect doors and service routes',3,colour.copper)
line(190,144,190,173,colour.ink,.5);line(182,144,214,153,colour.ink,.7)
add('<path d="M210 153 Q216 160 222 153 M216 157 L216 178 L245 184" fill="none" stroke="#a45f3e" stroke-width="1"/>')
line(190,180,399,187,colour.muted,.5)
text(248,157,'Accessible gutter, joint and downpipe',2.6);text(248,165,'Separate safe overflow still required',2.6);text(248,173,'Ground receptor and site handoff still unproved',2.6)
text(182,199,'REJECT / a drain-dependent moat or a hedge as a flood barrier',3,colour.copper)
text(182,207,'A blocked outlet must not raise water against vulnerable fabric.',2.6)
text(182,215,'No pump, buried tanking or existing deep carrier bay earns a shortcut.',2.6)
line(12,226,408,226,colour.muted,.3)
text(12,237,'03 / The court cost',3.3)
text(12,246,'60.0625 m² inside the ridge: 4.90 × nominal direct court area.',2.8)
text(12,254,'At the illustrative 144 mm/h: 2.403 L/s; 1,441.5 L in 10 minutes.',2.8)
text(12,262,'No escape / no losses: volume only, never safe storage or flood level.',2.6)
text(224,237,'04 / Space is a real design cost',3.3)
text(224,246,'600 mm all-round court band leaves 2.3 × 2.3 m (5.29 m²).',2.8)
text(224,254,'1 m full outside ring occupies 52 m², including corners.',2.8)
text(224,262,'Authored sensitivities only: neither width is specified or proved safe.',2.6)
text(12,282,'Evidence: Approved Document H H3 §1.13; Historic England; current house and BCR catchment ledger. See linked research/result.',2.5)
add('</svg>')
const outputs=new Map([['free-shedding.json',JSON.stringify(report,null,2)+'\n'],['free-shedding.svg',svg.join('\n')+'\n']])
for(const [name,contents]of outputs){const path=fileURLToPath(new URL(name,import.meta.url));if(process.argv.includes('--check'))assert.equal(readFileSync(path,'utf8'),contents,`Stale ${name}`);else writeFileSync(path,contents)}
console.log('RWT-SHED: source/door guards, catchment conservation, overhang double-count counterexample, local-load and land-take checks passed; no physical pass claimed')
