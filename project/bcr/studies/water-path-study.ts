/** Bounded source/candidate geometry and failure-connectivity study, not hydraulics. */
import {readFileSync,writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {layoutRevision as d,revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'
import {layoutFamilySource,currentRoofZ} from '../../../compiler/reference-house/georgian/layout-family.js'
const c=d.court,n=d.shell,r=d.roof.ridgeInset
if(d.id!=='RH-LAYOUT-REVISION-02'||n!==12000||c.x!==4250||c.y!==4250||c.width!==3500||c.depth!==3500||r!==2125||d.envelope!==417.5||d.partition!==125||d.roof.overhang!==200||layoutFamilySource.groundReserve!==300)throw Error('Source changed: reappraise water study')
const doors=revisionOpenings('GROUND').filter(q=>q.wall==='court-south'||q.wall==='court-north')
if(doors.length!==2||doors.some(q=>q.kind!=='door'||q.centre!==6000||q.width!==2400))throw Error('Court opening basis changed')
const area=(overhang:number)=>{const outer=(n+2*overhang)**2/1e6,ridge=(n-2*r)**2/1e6,open=(c.width-2*overhang)**2/1e6;return {outerRoof:outer-ridge,innerRoof:ridge-open,openCourt:open,total:outer,innerSpillPlusDirect:ridge}}
const nominal=area(0),overhangSensitivity=area(d.roof.overhang)
for(const a of [nominal,overhangSensitivity])if(Math.abs(a.outerRoof+a.innerRoof+a.openCourt-a.total)>1e-9)throw Error('Double-counted catchment')
const intensities=[.02,.04,.06]
const loads=intensities.map(rate=>({rate,mmPerHour:rate*3600,nominalCourtLps:rate*nominal.openCourt,nominalInnerSpillAndCourtLps:rate*nominal.innerSpillPlusDirect,tenMinuteCombinedLitres:rate*nominal.innerSpillPlusDirect*600}))
const valley={planLength:Math.hypot(c.x-r,c.y-r),fall:currentRoofZ(r,r)-currentRoofZ(c.x,c.y),inclinationDeg:Math.atan((currentRoofZ(r,r)-currentRoofZ(c.x,c.y))/Math.hypot(c.x-r,c.y-r))*180/Math.PI}
// RWT-06 draft PR1044 aa5740b8ff351a3689462d28758a7abc0de37a2c, explicit trial only.
const trial={source:'RWT-06 draft PR1044 aa5740b8ff351a3689462d28758a7abc0de37a2c',x0:7750,x1:12000,ys:[7000,7450],width:300,internalDiameter:100,outerDiameter:110,invert0:-205,invert1:-265,lidBottom:-50,channelBottom:-300,reliefActivation:-75,operatingTarget:-50,schematicGround:-150}
const boundaries=[{id:'court wall',lo:7750,hi:8167.5},{id:'service partition',lo:9437.5,hi:9562.5},{id:'outer wall',lo:11582.5,hi:12000}]
const pantry=d.rooms.GROUND.find(q=>q.id==='G-PANTRY')!.boxes[0]
const pantryClear=[pantry.y+d.partition/2,pantry.y+pantry.depth-d.partition/2]
if(trial.ys.some(y=>y-trial.width/2<pantryClear[0]||y+trial.width/2>pantryClear[1]))throw Error('Trial channel misses pantry')
const vertical=([trial.invert0,trial.invert1]).map(invert=>{const outerCrown=invert+trial.internalDiameter+(trial.outerDiameter-trial.internalDiameter)/2,outerBottom=invert-(trial.outerDiameter-trial.internalDiameter)/2;return {invert,outerCrown,outerBottom,topGap:trial.lidBottom-outerCrown,bottomGap:outerBottom-trial.channelBottom}})
const budgets={crossingLength:trial.x1-trial.x0,fall:trial.invert0-trial.invert1,fallRatio:(trial.x1-trial.x0)/(trial.invert0-trial.invert1),betweenStrips:trial.ys[1]-trial.ys[0]-trial.width,galleryWidth:9437.5-8167.5,pantryWidth:11582.5-9562.5,minimumBottomGap:Math.min(...vertical.map(q=>q.bottomGap)),outsideInvertBelowDrawnGround:trial.schematicGround-trial.invert1,vertical}
// Connectivity says only whether a drawn edge sequence survives the named cut.
const edges=[['court','primary-inlet'],['primary-inlet','primary-crossing'],['primary-crossing','primary-handoff'],['court','relief-inlet'],['relief-inlet','relief-crossing'],['relief-crossing','relief-handoff']]
const reaches=(blocked:string[])=>{const seen=new Set(['court']);let changed=true;while(changed){changed=false;for(const [a,b]of edges)if(!blocked.includes(a)&&!blocked.includes(b)&&seen.has(a)&&!seen.has(b)){seen.add(b);changed=true}}return [...seen].filter(q=>q.endsWith('handoff'))}
const cuts={allPotentialEdgesAvailable:reaches([]),primaryInletBlocked:reaches(['primary-inlet']),primaryCrossingBlocked:reaches(['primary-crossing']),bothInletsObstructed:reaches(['primary-inlet','relief-inlet']),bothReceivingConditionsUnavailable:reaches(['primary-handoff','relief-handoff'])}
if(cuts.primaryCrossingBlocked.join()!=='relief-handoff'||cuts.bothReceivingConditionsUnavailable.length||budgets.minimumBottomGap!==30||budgets.betweenStrips!==150)throw Error('Unexpected bounded result')
const output={basis:d.id,scope:'Reference projection and unadopted RWT candidate; no effective area, capacity, ponding safety, structural or threshold acceptance',nominal,overhangSensitivity,overhangQualification:'Square-offset sensitivity inferred from 200 mm section extensions, not a selected roof plan; do not add full court area to roof overlapping that court',perNominalFace:{outer:nominal.outerRoof/4,inner:nominal.innerRoof/4,qualification:'symmetry partitions, not four outlet allocations'},loads,valley,trial,boundaries,pantryClear,budgets,cuts,cutBoundary:'graph reachability only; relief activation/head/inlet/receiver capacity unproved',threshold:{internalFloor:0,schematicCourt:-150,lowestVulnerableBoundary:null,approvedStorage:null}}
const s:string[]=[];const add=(v:string)=>s.push(v),text=(x:number,y:number,t:string,size=2.6)=>add(`<text x="${x}" y="${y}" font-size="${size}">${t}</text>`)
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="DejaVu Sans,sans-serif" fill="#203c45"><rect width="420" height="297" fill="#fffef9"/>')
text(12,16,'BCR / water: catchments, crossings and named failures',5)
text(12,25,'Current source plus unadopted RWT-06 trial · no hydraulic, threshold, structural or site acceptance',2.9)
text(12,37,'Nominal roof / 1:100 at A3 / north up',3.1)
const px=(x:number)=>14+x/100,py=(y:number)=>167-y/100
const rect=(x:number,y:number,w:number,h:number,fill:string,dash=false)=>add(`<rect x="${px(x)}" y="${py(y+h)}" width="${w/100}" height="${h/100}" fill="${fill}" stroke="#607b80" stroke-width=".3" ${dash?'stroke-dasharray="1 1"':''}/>`)
rect(0,0,n,n,'#d8e5ed');rect(r,r,n-2*r,n-2*r,'#b7d0da');rect(c.x,c.y,c.width,c.depth,'#f0e8d5')
for(const [x,y,xx,yy]of [[0,0,r,r],[n,0,n-r,r],[n,n,n-r,n-r],[0,n,r,n-r],[r,r,c.x,c.y],[n-r,r,c.x+c.width,c.y],[n-r,n-r,c.x+c.width,c.y+c.depth],[r,n-r,c.x,c.y+c.depth]])add(`<line x1="${px(x)}" y1="${py(y)}" x2="${px(xx)}" y2="${py(yy)}" stroke="#607b80" stroke-width=".25"/>`)
for(const y of [c.y,c.y+c.depth])add(`<line x1="${px(4800)}" y1="${py(y)}" x2="${px(7200)}" y2="${py(y)}" stroke="#af6848" stroke-width="1"/>`)
for(const y of trial.ys){rect(trial.x0,y-150,trial.x1-trial.x0,300,'none',true);add(`<line x1="${px(trial.x0)}" y1="${py(y)}" x2="${px(12300)}" y2="${py(y)}" stroke="#3c8081" stroke-width=".4"/>`)}
text(16,174,'Roof 131.75 m² = outer 83.9375 + inner 47.8125',2.4)
text(16,181,'Court 12.25 m². Red: two nominal court doors.',2.4)
text(16,188,'Dashed east strips: RWT trial at y7000 / y7450.',2.4)
text(157,37,'Court-to-outside crossing / section 1:20',3.1)
const sx=(x:number)=>157+(x-7750)/20,sz=(z:number)=>70-z/20
add(`<rect x="157" y="70" width="212.5" height="15" fill="#eee6d5" stroke="#75888a" stroke-width=".3"/>`)
for(const b of boundaries)add(`<rect x="${sx(b.lo)}" y="48" width="${(b.hi-b.lo)/20}" height="37" fill="#c9c6ba" stroke="#75888a" stroke-width=".2"/>`)
add(`<path d="M${sx(7750)} ${sz(-100)}L${sx(12000)} ${sz(-160)}L${sx(12000)} ${sz(-270)}L${sx(7750)} ${sz(-210)}Z" fill="#92bdc7" stroke="#367b87" stroke-width=".25"/>`)
add(`<path d="M157 ${sz(-50)}H369.5 M151 ${sz(-150)}H157 M369.5 ${sz(-150)}H397" fill="none" stroke="#a66b48" stroke-width=".4" stroke-dasharray="1 1"/>`)
text(157,44,'court wall',2.2);text(239,44,'service partition',2.2);text(345,44,'outer wall',2.2)
text(180,62,'gallery 1270',2.4);text(267,62,'pantry 2020',2.4)
text(157,94,'4250 run / 60 fall; invert −205 → −265; outer diameter 110 trial.',2.5)
text(157,102,'50 lid + gap + pipe + bottom space is not a complete floor.',2.5)
text(157,110,'Minimum bottom space 30; outside invert 115 below drawn grade.',2.5)
text(157,118,'Three support/boundary crossings. No sleeve or bearing design.',2.5)
text(157,133,'Level hierarchy / values are trial targets, not proven performance',3)
for(const [i,t]of ['Internal floor 0; lowest vulnerable court interface UNKNOWN.','Relief activates −75; assessed operating target −50 is uncomputed.','Schematic court −150: no selected falls, landing or storage basin.','Separate pipe bypasses one primary block; shared backwater may defeat both.'].entries())text(157,143+i*8,t,2.55)
text(12,207,'Water accounting / illustrative intensity 0.040 L/(s·m²), not a design event',3.3)
text(12,218,'Direct nominal court: 0.490 L/s. Inner roof spill + court: 2.4025 L/s (4.903 × direct court).',2.9)
text(12,228,'Both consistently partitioned area bases give 60.0625 m² inner spill + direct rain; neither is wind-adjusted effective area.',2.65)
text(12,239,'200 mm square-offset sensitivity: outer roof 93.6975, inner roof 50.4525, open court 9.61 m². Total 153.76 m².',2.65)
text(12,249,'Adding the full 12.25 court to that overhanging roof double-counts 2.64 m². Actual edge/corner geometry must be reconciled.',2.65)
text(12,263,'Maintenance: expose inlet and actual obstruction, control retained water, support/disconnect/remove, inspect and reinstate boundaries.',2.6)
text(12,278,'No safe court escape is established by this drawing. Read bcr-water-result.md for adverse findings, owners and discharge conditions.',2.7)
add('</svg>')
for(const [name,content] of [['water-path-study.json',JSON.stringify(output,null,2)+'\n'],['water-path-study.svg',s.join('\n')+'\n']]){const path=fileURLToPath(new URL(name,import.meta.url));if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==content)throw Error(`${name} stale`)}else writeFileSync(path,content)}
console.log(JSON.stringify({nominal,overhangSensitivity,budgets,cuts},null,2))
