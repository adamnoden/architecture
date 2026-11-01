import fs from 'node:fs'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
const canonical='project/had/studies/open-north-loggia.json'
const at=process.argv.indexOf('--had-source'), input=at<0?canonical:process.argv[at+1]
const source=fs.readFileSync(input,'utf8'), h=JSON.parse(source)
assert.deepEqual(h.loggia.clear,[4800,7750,2400,4250]); assert.equal(h.weather.total,507.5)
const v={authority:'Conditional joined wall/soffit development; no house, material, support, water or site acceptance.',startingMain:'6a953ef6d3131364aca740eaff2a06f301adbc2e',hadSource:{path:canonical,sha256:crypto.createHash('sha256').update(source).digest('hex')},wallLayers:h.weather.layersRoomToWeather,wallTotal:h.weather.total,wallAxes:[4377.5,7622.5],loggiaClear:h.loggia.clear,upper:{rcTop:3370,rcSoffit:3170,glass:200,railLathTerritory:15,render:25,underside:2930},dpc:{inner:[-180,-30],outer:[150,300],status:'Different-height bonded bands; actual returns/cavity tray and floor moisture route require qualification.'},supportHypothesis:{beamTop:-180,beamBottom:-630,lowestCap:-680,soil:-1200,heave:300,constructionLoss:50,ventClearance:150,status:'STR calculation hypothesis only, not frozen support or selected D1200.'},wetDeadKgM2:22+50+8,windStressKpa:1.5,grid:[600,450]}
v.wetDeadKpa=v.wetDeadKgM2*9.81/1000;v.gridWetDeadKn=v.wetDeadKpa*.6*.45;v.gridUlsStressKn=(1.35*v.wetDeadKpa+1.5*v.windStressKpa)*.6*.45;v.supportHypothesis.requiredD=680+300+50+150;v.supportHypothesis.residualAtD1200=1200-680-300-50;v.coreR=.2/.041
const t=(x,y,a,n=3,c='#1e293b')=>`<text x="${x}" y="${y}" font-size="${n}" fill="${c}">${a}</text>`
const r=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="#475569" stroke-width=".3"/>`
const l=(x1,y1,x2,y2,c='#475569',d='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width=".35" ${d?`stroke-dasharray="${d}"`:''}/>`
const X=x=>70.75+x/10,H=z=>67+(3170-z)/10,B=z=>170-z/10
let s=`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="Arial,sans-serif">`
s+=t(16,16,'Actual open-loggia wall / soffit / mineral DPC',6)+t(16,24,'ONE B replan source · conditional development checkpoint · sections 1:10 at original A3',3.5)+t(16,31,'No adopted wall, ground level, seal, structural anchor or first-harm admission. Dimensions in mm.',3)
s+=t(16,41,'A  EXPOSED UPPER FLOOR / WALL HEAD · vertical crop, 1:10',3.5)
// RC bears on the two actual inner cores. The horizontal insulation joins vertical cavity insulation.
s+=r(X(-492.5),H(3370),338.5,20,'#b9c4ce')
for(const [x,w,c] of [[-507.5,15,'#ece4d5'],[-492.5,140,'#c9bbb0'],[-352.5,200,'#f5d57d'],[-152.5,50,'#eef7fa'],[-102.5,102.5,'#b87861'],[2400,102.5,'#b87861'],[2502.5,50,'#eef7fa'],[2552.5,200,'#f5d57d'],[2752.5,140,'#c9bbb0'],[2892.5,15,'#ece4d5']]){const top=(x===-102.5||x===2400)?2930:3170;s+=r(X(x),H(top),w/10,(top-2800)/10,c)}
s+=r(X(-352.5),H(3170),310.5,20,'#f5d57d')+r(X(-152.5),H(2970),270.5,1.5,'#8b9aa7')+r(X(-102.5),H(2955),250.25,2.5,'#e4dccb')
for(let x=0;x<=2400;x+=600)s+=l(X(x),H(3170),X(x),H(2955),'#334155')
s+=t(22,111,'507.5 wall =15 finish +140 core +200 bare glass +50 drained gap +102.5 brick.',3)+t(22,118,'RC soffit3170 −200 glass −15 rail/lath −25 render =2930. Anchors/rails bridge insulation.',3)+t(22,125,'Wet dead80 kg/m²;600×450 grid≈0.212 kN/node; authored±1.5 kPa wind gives ULS≈0.894 kN/node.',3)
s+=t(16,135,'B  WALL BASE / SEPARATED DPC PATHS · vertical crop, 1:10',3.5)
for(const [x,w,c] of [[-507.5,15,'#ece4d5'],[-492.5,140,'#c9bbb0'],[-352.5,200,'#f5d57d'],[-152.5,50,'#eef7fa'],[-102.5,102.5,'#b87861'],[2400,102.5,'#b87861'],[2502.5,50,'#eef7fa'],[2552.5,200,'#f5d57d'],[2752.5,140,'#c9bbb0'],[2892.5,15,'#ece4d5']])s+=r(X(x),B(150),w/10,33,c)
// Mineral DPC bands interrupt each masonry leaf; concrete underframe is a distinct wet-tolerant hypothesis.
for(const x of [-492.5,2752.5])s+=r(X(x),B(-30),14,15,'#867c9a')
for(const x of [-102.5,2400])s+=r(X(x),B(300),10.25,15,'#867c9a')
for(const x of [-547.5,2697.5])s+=r(X(x),B(-180),25,45,'#b9c4ce')+r(X(x-75),B(-630),40,5,'#c7d0d7')
s+=l(X(0),B(0),X(2400),B(0),'#0d8390','2 1')+t(X(250),B(0)-3,'Outdoor walking/deck and separate N/E routes NOT YET STRUCTURALLY FIXED',3,'#0d8390')
// Ground is outside this vertical crop; retain only its explicitly conditional datum in the ledger.
s+=t(370,154,'Outer DPC',2.6)+t(370,159,'+150..+300',2.6)+t(370,171,'Inner DPC',2.6)+t(370,176,'−180..−30',2.6)+t(370,203,'RC underframe',2.6)+t(370,208,'may be wet;',2.6)+t(370,213,'floor duty',2.6)+t(370,218,'is separate.',2.6)
s+=t(22,246,'Cavity tray/weep route and actual floor-to-DPC transitions remain to draw: no concrete, paving or mortar bypass is credited.',3)+t(22,253,'D hypothesis uses lowest cap680+heave300+loss50+vent150=1180→1200; support/DPC/vent case must earn those inputs.',3)+t(22,260,'No side doors in the current loggia source. South court1800 doors remain: exact profile/jamb first harm is unqualified.',3)+t(22,267,'Normal N edge carrier and independently available relief need finite levels/intakes/receivers; two strips are not automatic independence.',3)+t(22,274,'This checkpoint exposes unfinished deck/tray/door duties; it does not redraw them as a completed water boundary.',3)
s+=l(16,279,66,279,'#172033')+t(16,286,'500 model mm =50 paper mm · only at original A3',2.8)+t(220,286,'Reproduce: node project/mat/studies/loggia-envelope-section.mjs --check',2.6)
s+='</g></svg>\n'
for(const [ext,data] of [['json',JSON.stringify(v,null,2)+'\n'],['svg',s]]){const p=`project/mat/studies/loggia-envelope-section.${ext}`;if(process.argv.includes('--check'))assert.equal(fs.readFileSync(p,'utf8'),data,p+' stale');else fs.writeFileSync(p,data)}
console.log('Loggia envelope checkpoint: wall507.5; soffit2930; ground/DPC/first-harm admission not earned.')
