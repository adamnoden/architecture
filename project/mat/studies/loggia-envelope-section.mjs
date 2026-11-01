import fs from 'node:fs'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
const canonical='project/had/studies/open-north-loggia.json'
const at=process.argv.indexOf('--had-source'), input=at<0?canonical:process.argv[at+1]
const source=fs.readFileSync(input,'utf8'), h=JSON.parse(source)
assert.deepEqual(h.loggia.clear,[4800,7750,2400,4250]); assert.equal(h.weather.total,507.5)
const v={authority:'Conditional joined wall/soffit development; no house, material, support, water or site acceptance.',startingMain:'6a953ef6d3131364aca740eaff2a06f301adbc2e',hadSource:{path:canonical,sha256:crypto.createHash('sha256').update(source).digest('hex')},wallLayers:h.weather.layersRoomToWeather,wallTotal:h.weather.total,wallAxes:[4377.5,7622.5],loggiaClear:h.loggia.clear,upper:{rcTop:3370,rcSoffit:3170,glass:200,railLathTerritory:15,render:25,underside:2930},dpc:{inner:[-180,-30],outer:[120,270],status:'Different-height bonded bands; actual returns/cavity tray and floor moisture route require qualification.'},supportHypothesis:{beamWidth:600,beamAxes:[4500,7500],beamTop:-180,beamBottom:-630,cap:[900,900,500],lowestCap:-722.5,soil:-1300,heave:300,constructionLoss:50,ventClearance:150,status:'STR calculation hypothesis only, not frozen support or selected D1300.'},wetDeadKgM2:22+50+8,windStressKpa:1.5,grid:[600,450]}
v.cavityTray={innerBase:-20,outerWeep:-35,innerReturn:190,backLeg:210,outerDpc:[120,270],spoutProjection:60,spoutClearToHighestWalk:75,status:'Custom formed metal tray/embedded return requires qualification; no225mm clear cavity claimed.'}
v.outdoor={southLanding:{run:600,drop:15},remainingCourt:{run:2900,drop:95},courtWalking:[0,-15,-110],loggiaRun:4250,loggiaFall:42.5,gardenTerrace:-152.5,stone:40,mineralBed:30,rc:200,deckTop:[-70,-85,-180,-222.5],deckSoffit:[-270,-285,-380,-422.5],weatherFaceGap:25,soilHypothesis:-1300,terraceHeightAboveSoil:1147.5,gardenRamp:{width:1200,slope:0.05,slopingRun:22950,flightRuns:[10000,10000,2950],landingLengths:[1200,1200,1200,1200],totalRouteRun:27750,headLanding:[7200,12000,1200,1200],rampScope:'East-turn then north, no surveyed plot',scope:'Required external territory plus landings/support/guards; no surveyed plot or access acceptance'},frontApproachSlopingRun:26000,normal:'Accessible edge copper collector; exact cross-section and receiver to qualify',relief:'Broad walking-surface gravity route to guarded exterior spill/cascade; independent receiver not yet accepted'}
v.wetDeadKpa=v.wetDeadKgM2*9.81/1000;v.gridWetDeadKn=v.wetDeadKpa*.6*.45;v.gridUlsStressKn=(1.35*v.wetDeadKpa+1.5*v.windStressKpa)*.6*.45;v.supportHypothesis.requiredD=722.5+300+50+150;v.supportHypothesis.residualAtD1300=1300-722.5-300-50;v.coreR=.2/.041
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
for(const [x,w,c] of [[-507.5,15,'#ece4d5'],[-492.5,140,'#c9bbb0'],[-352.5,200,'#f5d57d'],[-152.5,50,'#eef7fa'],[-102.5,102.5,'#b87861'],[2400,102.5,'#b87861'],[2502.5,50,'#eef7fa'],[2552.5,200,'#f5d57d'],[2752.5,140,'#c9bbb0'],[2892.5,15,'#ece4d5']])s+=r(X(x),B(195),w/10,37.5,c)
// Mineral DPC bands interrupt each masonry leaf; concrete underframe is a distinct wet-tolerant hypothesis.
for(const x of [-492.5,2752.5])s+=r(X(x),B(-30),14,15,'#867c9a')
for(const x of [-102.5,2400])s+=r(X(x),B(270),10.25,15,'#867c9a')
for(const x of [-600,2400])s+=r(X(x),B(-180),60,45,'#b9c4ce')
for(const a of [[-750,0,150],[3150,2400,2250]])s+=`<polygon points="${X(a[0])},${B(-180)} ${X(a[1])},${B(-180)} ${X(a[1])},${B(-222.5)} ${X(a[2])},${B(-222.5)} ${X(a[2])},${B(-722.5)} ${X(a[0])},${B(-722.5)}" fill="none" stroke="#925449" stroke-width=".4" stroke-dasharray="2 1"/>`
s+=r(X(175),B(-222.5),205,20,'#c7d0d7')+t(X(275),B(-422.5)+5,'Independent deck notches around cap islands;25 perimeter joints',2.7)
for(const a of [[-382.5,-352.5,0,60],[2782.5,2752.5,2400,2340]])s+=`<polyline points="${X(a[0])},${B(190)} ${X(a[1])},${B(190)} ${X(a[1])},${B(-20)} ${X(a[2])},${B(-35)} ${X(a[3])},${B(-40)}" fill="none" stroke="#0d8390" stroke-width=".5"/>`
s+=l(X(25),B(-110),X(2375),B(-110),'#0d8390','2 1')+t(X(250),B(-110)-3,'Walking−110;25 deck gaps; actual edge/cap seats still being joined',3,'#0d8390')
// Ground is outside this vertical crop; retain only its explicitly conditional datum in the ledger.
s+=t(370,154,'Outer DPC',2.6)+t(370,159,'+120..+270',2.6)+t(370,171,'Inner DPC',2.6)+t(370,176,'−180..−30',2.6)+t(370,203,'RC underframe',2.6)+t(370,208,'may be wet;',2.6)+t(370,213,'floor duty',2.6)+t(370,218,'is separate.',2.6)
s+=t(22,246,'Tray base−20→weep−35; return+190 in actual inner block bed;60 spout clears25 gap. Qualification remains required.',3)+t(22,253,'Deepest cap722.5 +heave300 +loss50 +vent150 =1222.5→D1300; residual227.5, surplus77.5.',3)+t(22,260,'No side doors in the current loggia source. South court1800 doors remain: exact profile/jamb first harm is unqualified.',3)+t(22,267,'Normal N edge carrier and independently available relief need finite levels/intakes/receivers; two strips are not automatic independence.',3)+t(22,274,'900 cap projects150 into deck; actual notch/island follows slope, with6 metal slip cover over25 joint (qualification pending).',3)
s+=l(16,279,66,279,'#172033')+t(16,286,'500 model mm =50 paper mm · only at original A3',2.8)+t(220,286,'Reproduce: node project/mat/studies/loggia-envelope-section.mjs --check',2.6)
s+='</g></svg>\n'
let q=`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="Arial,sans-serif">`
q+=t(16,16,'Outdoor walking surface / retained material boundary',6)+t(16,24,'ONE sloped-deck proposal · local ground FFL0 · D1300 remains a support/site hypothesis',3.5)+t(16,32,'No buried relief mouth or indoor gas lid. First harm, supports, receiver and access acceptance remain unearned.',3)
const LX=x=>20+x/25,LY=z=>91-z/25
q+=t(16,44,'A  SOUTH DOOR → OPEN COURT → LOGGIA → RAISED EDGE · 1:25 at A3',3.5)
const pts=[[0,0],[600,-15],[3500,-110],[7750,-152.5],[8950,-152.5]]
for(let k=0;k<pts.length-1;k++){const [x,z]=pts[k],[xx,zz]=pts[k+1];for(const [off,th,col] of [[0,40,'#c7b18b'],[40,30,'#e5dccb'],[70,200,'#b9c4ce']])q+=`<polygon points="${LX(x)},${LY(z-off)} ${LX(xx)},${LY(zz-off)} ${LX(xx)},${LY(zz-off-th)} ${LX(x)},${LY(z-off-th)}" fill="${col}" stroke="#475569" stroke-width=".3"/>`}
q+=l(LX(3500),LY(300),LX(3500),LY(-500),'#64748b','2 1')+t(LX(3500)+2,LY(350),'North court / loggia',2.7)
q+=l(20,LY(-1300),390,LY(-1300),'#69834a')+t(22,LY(-1300)+5,'Authored soil−1300; terrace−152.5 is1147.5 ABOVE it, not garden grade.',3)
// The guard stops the pedestrian route before the free drop; water passes a deliberately open lower edge.
q+=l(LX(8950),LY(-152.5),LX(8950),LY(947.5),'#263647')+l(LX(8950)-8,LY(947.5),LX(8950),LY(947.5),'#263647')+t(270,55,'1100 guard territory; no climbable rails',2.8)+t(270,62,'50 lower water gap,90 max clear bars',2.8)
q+=l(LX(8950),LY(-152.5),LX(9100),LY(-1300),'#0d8390')+t(270,126,'E protected spill/cascade to separate receiver',2.8,'#0d8390')
q+=t(20,153,'600 landing:15 fall (1:40); remaining2900 court:95 fall (~1:30.5); loggia4250:42.5 fall (1%).',3)+t(20,160,'RC200 top follows−70/−85/−180/−222.5 with30 mineral bed +40 stone; no variable fill is hidden.',3)+t(20,167,'25 independent-deck/weather-face gap, side cavity tray/outlets and real edge seats must be connected in the wall-base section.',3)
q+=t(16,181,'B  REQUIRED EXTERNAL ACCESS / WATER TERRITORY · dimensions, not a surveyed site',3.5)
q+=r(22,190,120,18,'#ece5d9')+t(25,201,'Raised terrace / turning landing−152.5',3)
q+=r(142,190,209.5,12,'#dae5d5')+t(149,198,'East-turn garden ramp:22.95 m sloping run at1:20',2.8)
q+=t(22,219,'Three flights≤10 m +four1200 landings =27.75 m total garden path; independent support/guards are additional duties.',3)+t(22,226,'Terrace1200 long×2400 wide; garden ramp1200 wide. Front still26 m sloping run +landings. No plot/access pass.',3)+t(22,233,'N edge copper route discharges separately outside the guard; E broad surface has its own visible spill/receiver.',3)+t(22,240,'Named failures: N blocked, E debris dam, both local receivers flooded, and deck/house movement closing the25 gap.',3)+t(22,247,'The remaining south-door profile/jamb/pan fixes the first-harm elevation;−45 is not accepted by repetition.',3)
q+=t(16,264,'This drawing is a conditional joined development. Actual deck/cascade/ramp supports and material transitions are still being designed.',3)+l(16,279,56,279,'#172033')+t(16,286,'1000 model mm =40 paper mm · panel A only',2.8)
q+='</g></svg>\n'
for(const [ext,data] of [['json',JSON.stringify(v,null,2)+'\n'],['svg',s],['water.svg',q]]){const p=`project/mat/studies/loggia-envelope-section.${ext}`;if(process.argv.includes('--check'))assert.equal(fs.readFileSync(p,'utf8'),data,p+' stale');else fs.writeFileSync(p,data)}
console.log('Loggia envelope checkpoint: wall507.5; soffit2930; ground/DPC/first-harm admission not earned.')
