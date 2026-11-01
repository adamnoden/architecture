import fs from 'node:fs'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
const canonical='project/had/studies/open-north-loggia.json'
const at=process.argv.indexOf('--had-source'), input=at<0?canonical:process.argv[at+1]
const source=fs.readFileSync(input,'utf8'), h=JSON.parse(source)
assert.deepEqual(h.loggia.clear,[4800,7750,2400,4250]); assert.equal(h.weather.total,507.5)
const v={authority:'Conditional joined wall/soffit development; no house, material, support, water or site acceptance.',startingMain:'6a953ef6d3131364aca740eaff2a06f301adbc2e',hadSource:{path:canonical,sha256:crypto.createHash('sha256').update(source).digest('hex')},wallLayers:h.weather.layersRoomToWeather,wallTotal:h.weather.total,wallAxes:[4377.5,7622.5],loggiaClear:h.loggia.clear,upper:{rcTop:3370,rcSoffit:3170,glass:240,railLathTerritory:15,render:25,glassUnderside:2930,underside:2890},dpc:{inner:[-180,-30],outer:[120,270],status:'Different-height bonded bands; actual returns/cavity tray and floor moisture route require qualification.'},supportHypothesis:{beamWidth:600,beamAxes:[4500,7500],beamTop:-180,beamBottom:-630,node:[600,600,450],ordinaryBeamBottom:-630,lowTie:{size:[250,200],stations:[8050,11700],top:-550,bottom:-750,localReceivingNodeBottom:-750},lowestOutside:-750,soil:-1300,heave:300,constructionLoss:50,ventClearance:150,status:'STR lowtie/node calculation hypothesis only; no support/site admission. No900cap islands selected.'},wetDeadKgM2:26.4+50+8,windStressKpa:1.5,grid:[600,450]}
v.floorJoin={layers:[15,65,100,200],z:[0,-15,-80,-180,-380],innerDpc:[-180,-30],plasterStops:0,airLine:'Wallmineralplaster meets floorfinish at0; movement/airtightness unqualified',moisture:'40cover suspendedRC is a deliberate moisture hypothesis. NoDPM or site-required gas barrier is waived; exact floor/end/DPC transition not qualified.'}
v.cavityTray={innerBase:-20,outerWeep:-35,innerReturn:190,backLeg:210,outerDpc:[120,270],spoutProjection:60,spoutClearToHighestWalk:75,status:'Custom formed metal tray/embedded return requires qualification; no225mm clear cavity claimed.'}
v.outdoor={southLanding:{run:1500,drop:30,doorOperation:"Outward north;850 leaf projection leaves650 beyond tip"},remainingCourt:{run:2000,drop:80},courtWalking:[0,-30,-110],loggiaRun:4250,loggiaFall:42.5,gardenTerrace:-152.5,stone:40,mineralBed:30,rc:200,deckTop:[-70,-100,-180,-222.5],deckSoffit:[-270,-300,-380,-422.5],weatherFaceGap:25,soilHypothesis:-1300,terraceHeightAboveSoil:1147.5,gardenRamp:{width:1200,slope:0.05,slopingRun:22950,flightRuns:[10000,10000,2950],landingLengths:[1200,1200,1200,1200],totalRouteRun:27750,headLanding:[7200,12000,1200,1200],rampScope:'East-turn then north, no surveyed plot',scope:'Required external territory plus landings/support/guards; no surveyed plot or access acceptance'},frontApproachSlopingRun:26000,normal:'Accessible edge copper collector; exact cross-section and receiver to qualify',relief:'Broad walking-surface gravity route to guarded exterior spill/cascade; independent receiver not yet accepted'}
v.threshold={wallReservation:417.5,wallScope:'Existing southcourt shell reservation, not507.5loggia wall qualification',roughOpening:[5100,6900],weatherHingeY:4250,frameDepth:140,frameY:[4110,4250],jambFace:50,nominalLeaves:[845.5,845.5],thresholdGap:4,leafThickness:45,leafSweepEnvelope:850,landingEndY:5750,clearBeyondOpenTip:650,saddle:{depth:250,top:15,chamferRun:60,flat:130,bottom:-75},pan:{material:'Authored1.5uncoated316L, welded corners/ends; exact grade/filler/process unknown',insideBottom:-75,rearCrest:15,jambEnds:75,frontDrip:-80},anchorLowest:150,bracket:{material:'Authored6SS verticalweb, no material/capacity pass',height:60,arm:350,levels:[200,1000,2000],leafMassStressKg:70,weightKn:.6867,sagMomentKnM:.2918475,outwardOffsetMm:262.5,outwardMomentKnM:.18025875},springMetal:{component:'PEMKO73B bronze V strip research comparator',thicknessInch:.008,widthInch:.625,nailPitchInch:3,gapInch:[.125,.1875],certifications:'Manufacturer page states none; no weather/flood/fire claim'},lowestJunction:{position:'Pan end return to masonry/DPC at−30; timber/stone/metal seam and meetingstile at+15',status:'Actual leakage/firstharm remains unqualified. +15 is only open-door geometricoverflow crest, not accepted firstharm.'},renewal:'Support leaves, remove local dry-side trim/above-pan fixings, lift frame outward into1500landing; welded pan retained for ordinary frame renewal. Pan renewal requires fullframe+saddle removal and temporary weather cover, not routine strip replacement.'}
const normalDepth=(q,b,n,slope)=>{let lo=0,hi=.4;for(let k=0;k<90;k++){const y=(lo+hi)/2,a=b*y,r=a/(b+2*y);if(a*r**(2/3)*Math.sqrt(slope)/n<q)lo=y;else hi=y}return(lo+hi)/2}
v.protectedWater={scope:'New finite candidate; actual lowtie crossing geometry. No full hydraulic/site/material pass.',normal:{inlet:[4250,7000,3500,350],channelGross:350,channelClear:250,inletVoid:80,flowSlope:.01,roughnessStress:.02,cover:{downstream:'Solid10SS,500pitch/50overlap, no hole except upstreaminlet',module:[350,550,10],massKg:15.4},intakeCover:{thickness:14,holeDiameter:9,pitch:12,openAreaFraction:Math.PI*9**2/(4*12**2),stress:'2kN/100gross strip;25net width and250span gives153.1MPa simple bending, before stressconcentration/support qualification'},westLoggia:[4825,7750,350,5450],carrierBottom:[[7000,-206.25],[7750,-213.75],[12000,-256.25],[13200,-268.25]],crossCourtBottom:[-171.5,-206.25],material:'1.5uncoatedcopper liner; seams/filler/flux/supports/retained treatments unqualified'},relief:{plan:[5300,7750,1800,5450],minimumClearWidth:1800,roughnessStress:.025,slope:.01,terminal:'Broad guarded E spill physically separate from primary downroute; exact receivers/site backwater remain unaccepted'},deckRecess:{depth:100,rcRetained:200,lowestLocalSoffit:-522.5,stepHaunch:'Depressedtop−322.5/bottom−522.5; adjacenttop−222.5 with300localdepth, underside tapers200run to−422.5. No variableupperfill.',status:'Actual lowties−550..−750 below localsoffit−522.5.27.5nominalclear; fourreceivingnodes−750. Capacity/constructability unqualified.'},probes:[1,3,6].map(q=>({litresPerSecond:q,normalDepthMm:1000*normalDepth(q/1000,.25,.02,.01),surfaceDepthMm:1000*normalDepth(q/1000,1.8,.025,.01)})),failures:[{event:'Fullwidthsurface dam at loggiamouthy7750',path:'Upstreaminlet y7000 remains open; continuous covered copper bypassesdam only if realbeam crossings/terminal remain free.'},{event:'Normalinlet orconduit blocked',path:'Flushinlet can be overrun onto broadsurface; no raised kerb/closedrelief mouth.'},{event:'Raisedterraceflooded',path:'Primary requires closed/qualified downroute to externalreceiver; covers not admitted pressureseals. Broadsurface may backwater.'},{event:'Separateprimaryreceiverbackwater',path:'Broadreceiver must remain free; no sharedterminal credited.'},{event:'Blanketdebris spanninginletANDloggia orbothreceiversflooded',path:'Consequentialcommonfailure remains; no unconditionalindependenceclaim.'}],commonDamAtCourtMouth:{damToFfl:110,damToGeometric15Crest:125,scope:'Staticlevelonly; actualfirstharm unqualified atpan/DPC anddoor seals.'}}
v.wetDeadKpa=v.wetDeadKgM2*9.81/1000;v.gridWetDeadKn=v.wetDeadKpa*.6*.45;v.gridUlsStressKn=(1.35*v.wetDeadKpa+1.5*v.windStressKpa)*.6*.45;v.supportHypothesis.requiredD=750+300+50+150;v.supportHypothesis.residualAtD1300=1300-750-300-50;v.coreR=.2/.041
v.thermalProbe={glassLambda:.041,otherR:.4,steelLambda:15,steelShaftDiameter:.008,shaftGrid:[.6,.45],scope:'Synthetic parallel-path sensitivity, not certified whole-floor U or3D thermal bridge.'}
v.thermalProbe.u=(1/(.24/.041+.4))+(15*Math.PI*.008**2/4)/(.24*.6*.45)
v.thermalProbe.baseBridge='600wide concrete beam blocks below-floor vertical insulation. Floor/inner DPC/thermal route not qualified.'
v.thermalProbe.archBridge='Real masonry arch/spandrel crosses240glass soffit plane; no invisible taper or unchanged finished2400 opening claimed.'
const t=(x,y,a,n=3,c='#1e293b')=>`<text x="${x}" y="${y}" font-size="${n}" fill="${c}">${a}</text>`
const r=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="#475569" stroke-width=".3"/>`
const l=(x1,y1,x2,y2,c='#475569',d='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width=".35" ${d?`stroke-dasharray="${d}"`:''}/>`
const X=x=>70.75+x/10,H=z=>67+(3170-z)/10,B=z=>170-z/10
let s=`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="Arial,sans-serif">`
s+=t(16,16,'Actual open-loggia wall / soffit / mineral DPC',6)+t(16,24,'ONE B replan source · conditional development checkpoint · sections 1:10 at original A3',3.5)+t(16,31,'No adopted wall, ground level, seal, structural anchor or first-harm admission. Dimensions in mm.',3)
s+=t(16,41,'A  EXPOSED UPPER FLOOR / WALL HEAD · vertical crop, 1:10',3.5)
// RC bears on the two actual inner cores. The horizontal insulation joins vertical cavity insulation.
s+=r(X(-492.5),H(3370),338.5,20,'#b9c4ce')
for(const [x,w,c] of [[-507.5,15,'#ece4d5'],[-492.5,140,'#c9bbb0'],[-352.5,200,'#f5d57d'],[-152.5,50,'#eef7fa'],[-102.5,102.5,'#b87861'],[2400,102.5,'#b87861'],[2502.5,50,'#eef7fa'],[2552.5,200,'#f5d57d'],[2752.5,140,'#c9bbb0'],[2892.5,15,'#ece4d5']]){const top=(x===-102.5||x===2400)?2890:3170;s+=r(X(x),H(top),w/10,(top-2800)/10,c)}
s+=r(X(-352.5),H(3170),310.5,24,'#f5d57d')+r(X(-152.5),H(2930),270.5,1.5,'#8b9aa7')+r(X(-102.5),H(2915),250.25,2.5,'#e4dccb')
for(let x=0;x<=2400;x+=600)s+=l(X(x),H(3170),X(x),H(2915),'#334155')
s+=t(22,111,'507.5 wall =15 finish +140 core +200 bare glass +50 drained gap +102.5 brick.',3)+t(22,118,'RC3170 −240 glass(two120) −15 rail/lath −25 render =2890. Actual arch/spandrel bridge unresolved.',3)+t(22,125,'Wet dead84.4 kg/m²;600×450 grid≈0.224 kN/node; authored±1.5 kPa wind gives ULS≈0.909 kN/node.',3)
s+=t(16,135,'B  WALL BASE / SEPARATED DPC PATHS · vertical crop, 1:10',3.5)
for(const [x,w,c] of [[-507.5,15,'#ece4d5'],[-492.5,140,'#c9bbb0'],[-352.5,200,'#f5d57d'],[-152.5,50,'#eef7fa'],[-102.5,102.5,'#b87861'],[2400,102.5,'#b87861'],[2502.5,50,'#eef7fa'],[2552.5,200,'#f5d57d'],[2752.5,140,'#c9bbb0'],[2892.5,15,'#ece4d5']])s+=r(X(x),B(195),w/10,(x===-507.5||x===2892.5)?19.5:37.5,c)
// Cropped actual heatedfield:15stone+65distribution+100glass+RC200. Plaster stops atFFL, not belowDPC.
for(const [off,th,col] of [[0,15,'#c7b18b'],[15,65,'#e5dccb'],[80,100,'#f5d57d'],[180,200,'#bcc8d0']]){
 s+=r(X(-650),B(-off),14.25,th/10,col)+r(X(2907.5),B(-off),14.25,th/10,col)
}
// Mineral DPC bands interrupt each masonry leaf; concrete underframe is a distinct wet-tolerant hypothesis.
for(const x of [-492.5,2752.5])s+=r(X(x),B(-30),14,15,'#867c9a')
for(const x of [-102.5,2400])s+=r(X(x),B(270),10.25,15,'#867c9a')
for(const x of [-600,2400])s+=r(X(x),B(-180),60,57,'#b9c4ce')
// Actual section through lowties; node is within600sidebeam footprint, no900cap island.
s+=r(X(0),B(-550),240,20,'#aebdc9')
s+=`<polygon points="${X(25)},${B(-322.5)} ${X(375)},${B(-322.5)} ${X(375)},${B(-222.5)} ${X(2375)},${B(-222.5)} ${X(2375)},${B(-422.5)} ${X(575)},${B(-422.5)} ${X(375)},${B(-522.5)} ${X(25)},${B(-522.5)}" fill="#c7d0d7" stroke="#475569" stroke-width=".3"/>`
// Independent metal frame carries covers toRC, copper liner carries only water.
for(const x of [25,350])s+=r(X(x),B(-162.5),2.5,16,'#718594')
s+=r(X(25),B(-152.5),35,1,'#647a88')
s+=`<polyline points="${X(50)},${B(-162.5)} ${X(75)},${B(-162.5)} ${X(75)},${B(-256.25)} ${X(325)},${B(-256.25)} ${X(325)},${B(-162.5)} ${X(350)},${B(-162.5)}" fill="none" stroke="#a96635" stroke-width=".35"/>`
s+=t(X(400),B(-300),'Cu250clear, covered outdoor channel; frame legs carry cover toRC.',2.7)
s+=t(X(400),B(-750)+5,'Lowtie−550..−750; fourreceivingnodes locally−750.27.5nominal deck/tieclear.',2.7)
for(const a of [[-382.5,-352.5,0,60],[2782.5,2752.5,2400,2340]])s+=`<polyline points="${X(a[0])},${B(190)} ${X(a[1])},${B(190)} ${X(a[1])},${B(-20)} ${X(a[2])},${B(-35)} ${X(a[3])},${B(-40)}" fill="none" stroke="#0d8390" stroke-width=".5"/>`
s+=l(X(25),B(-152.5),X(2375),B(-152.5),'#0d8390','2 1')+t(X(250),B(-152.5)-3,'North walking−152.5;25 deck gaps; lowtie/node support candidate conditional',3,'#0d8390')
// Ground is outside this vertical crop; retain only its explicitly conditional datum in the ledger.
s+=t(370,154,'Outer DPC',2.6)+t(370,159,'+120..+270',2.6)+t(370,171,'Inner DPC',2.6)+t(370,176,'−180..−30',2.6)+t(370,203,'RC underframe',2.6)+t(370,208,'may be wet;',2.6)+t(370,213,'floor duty',2.6)+t(370,218,'is separate.',2.6)
s+=t(22,256,'Deepest node/tie750 +heave300 +loss50 +vent150 =1250→D1300; residual200, surplus50.',3)+t(22,263,'Tray−20→weep−35/+190 return;60 spout. No side doors; remaining south1800 door firstharm unqualified.',3)+t(22,270,'Protected normal conduit crosses above lowties; broad surface relief and independentreceivers still need capacity/firstharm evidence.',3)
s+=l(16,279,66,279,'#172033')+t(16,286,'500 model mm =50 paper mm · only at original A3',2.8)+t(220,286,'Reproduce: node project/mat/studies/loggia-envelope-section.mjs --check',2.6)
s+='</g></svg>\n'
let q=`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="Arial,sans-serif">`
q+=t(16,16,'Outdoor walking surface / retained material boundary',6)+t(16,24,'ONE sloped-deck proposal · local ground FFL0 · D1300 remains a support/site hypothesis',3.5)+t(16,32,'No buried relief mouth or indoor gas lid. First harm, supports, receiver and access acceptance remain unearned.',3)
const LX=x=>20+x/25,LY=z=>91-z/25
q+=t(16,44,'A  SOUTH DOOR → OPEN COURT → LOGGIA → RAISED EDGE · 1:25 at A3',3.5)
const pts=[[0,0],[1500,-30],[3500,-110],[7750,-152.5],[8950,-152.5]]
for(let k=0;k<pts.length-1;k++){const [x,z]=pts[k],[xx,zz]=pts[k+1];for(const [off,th,col] of [[0,40,'#c7b18b'],[40,30,'#e5dccb'],[70,200,'#b9c4ce']])q+=`<polygon points="${LX(x)},${LY(z-off)} ${LX(xx)},${LY(zz-off)} ${LX(xx)},${LY(zz-off-th)} ${LX(x)},${LY(z-off-th)}" fill="${col}" stroke="#475569" stroke-width=".3"/>`}
q+=l(LX(3500),LY(300),LX(3500),LY(-500),'#64748b','2 1')+t(LX(3500)+2,LY(350),'North court / loggia',2.7)
q+=l(20,LY(-1300),390,LY(-1300),'#69834a')+t(22,LY(-1300)+5,'Authored soil−1300; terrace−152.5 is1147.5 ABOVE it, not garden grade.',3)
// The guard stops the pedestrian route before the free drop; water passes a deliberately open lower edge.
q+=l(LX(8950),LY(-152.5),LX(8950),LY(947.5),'#263647')+l(LX(8950)-8,LY(947.5),LX(8950),LY(947.5),'#263647')+t(270,55,'1100 guard territory; no climbable rails',2.8)+t(270,62,'50 lower water gap,90 max clear bars',2.8)
q+=l(LX(8950),LY(-152.5),LX(9100),LY(-1300),'#0d8390')+t(270,126,'E protected spill/cascade to separate receiver',2.8,'#0d8390')
q+=t(20,153,'1500 landing:30 fall (1:50); outward850 leaf leaves650 clear beyond tip. Remaining2000:80 fall (1:25).',3)+t(20,160,'RC200 top follows−70/−100/−180/−222.5 with30 mineral bed +40 stone; no variable fill is hidden.',3)+t(20,167,'25 independent-deck/weather-face gap, side cavity tray/outlets and real edge seats must be connected in the wall-base section.',3)
q+=t(16,181,'B  REQUIRED EXTERNAL ACCESS / WATER TERRITORY · dimensions, not a surveyed site',3.5)
q+=r(22,190,120,18,'#ece5d9')+t(25,201,'Raised terrace / turning landing−152.5',3)
q+=r(142,190,209.5,12,'#dae5d5')+t(149,198,'East-turn garden ramp:22.95 m sloping run at1:20',2.8)
q+=t(22,219,'Three flights≤10 m +four1200 landings =27.75 m total garden path; independent support/guards are additional duties.',3)+t(22,226,'Terrace1200 long×2400 wide; garden ramp1200 wide. Front still26 m sloping run +landings. No plot/access pass.',3)+t(22,233,'N edge copper route discharges separately outside the guard; E broad surface has its own visible spill/receiver.',3)+t(22,240,'Named failures: N blocked, E debris dam, both local receivers flooded, and deck/house movement closing the25 gap.',3)+t(22,247,'The remaining south-door profile/jamb/pan fixes the first-harm elevation;−45 is not accepted by repetition.',3)
q+=t(16,264,'This drawing is a conditional joined development. Actual deck/cascade/ramp supports and material transitions are still being designed.',3)+l(16,279,56,279,'#172033')+t(16,286,'1000 model mm =40 paper mm · panel A only',2.8)
q+='</g></svg>\n'
let j=`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="Arial,sans-serif">`
j+=t(16,16,'Remaining south court door / actual first-harm junction',6)+t(16,24,'Authored outward timber/metal research detail · conditional geometry, NOT a matched or certified doorset',3.5)
j+=t(16,32,'All z relative proposed groundFFL0. Existing417.5shell remains unqualified;507.5 applies only to new loggia sides.',3)
const JX=y=>35+(y-3800)/10,JY=z=>105-z/10
j+=t(16,44,'A  CENTRE SECTION · 1:10 at A3 · room left / court right',3.5)
j+=r(JX(3800),JY(0),20,18,'#e6ddcd')+r(JX(3800),JY(-180),45,20,'#bcc8d0')+r(JX(4000),JY(-75),25,10.5,'#b8aa96')
// A solid saddle has60mm chamfers each side and a130mm flat. It bears independently of the frame pan.
j+=`<polygon points="${JX(4000)},${JY(0)} ${JX(4060)},${JY(15)} ${JX(4190)},${JY(15)} ${JX(4250)},${JY(0)} ${JX(4250)},${JY(-75)} ${JX(4000)},${JY(-75)}" fill="#c8b793" stroke="#475569" stroke-width=".3"/>`
j+=`<polyline points="${JX(3998.5)},${JY(15)} ${JX(3998.5)},${JY(-75)} ${JX(4260)},${JY(-75)} ${JX(4260)},${JY(-80)}" fill="none" stroke="#0d8390" stroke-width=".5"/>`
j+=r(JX(4205),JY(219),4.5,20,'#997c55')+t(110,70,'45solid leaf;4gap over+15crest; hingeplane4250',3)+t(110,78,'Lowest bronze/meeting seam+15 is NOT watertight by name.',3)
j+=l(JX(4250),JY(0),JX(5750),JY(-30),'#795b39')+l(JX(4250),JY(-70),JX(5750),JY(-100),'#475569')+l(JX(4250),JY(-270),JX(5750),JY(-300),'#475569')
j+=l(JX(4250),JY(15),JX(5750),JY(15),'#bb4141','2 1')+t(110,99,'+15 geometric spill into room when door open; actual leakage can occur earlier.',3,'#a03535')
j+=t(20,147,'Saddle250 deep:60chamfer +130flat +60chamfer;15rise /60run≈14°. Pan−75 bears on105mineral seat overRC−180; actual thermal bridge.',3)+t(20,154,'No bolt below+150 pierces pan; rearcrest+15 and welded enddams+75. No adhesive/seal is silently supplied.',3)
j+=t(16,169,'B  PLAN / JAMB / MEETING CONTINUITY · dimensioned topology, NOT plan scale',3.5)
j+=r(30,180,180,10,'#c7b18d')+r(30,190,5,20,'#997c55')+r(205,190,5,20,'#997c55')
j+=l(35,200,119.55,200,'#654a2d')+l(120.45,200,205,200,'#654a2d')+l(120,193,120,207,'#bb4141','1 1')
j+=`<polyline points="30,187 30,215 210,215 210,187" fill="none" stroke="#0d8390" stroke-width=".7"/>`
j+=t(228,184,'Rough1800;50jamb faces;3mm side/meeting gaps;',3)+t(228,191,'two845.5nominal leaves,850gross swing each.',3)+t(228,202,'Outer frame depth140; jamb brackets bridge to',3)+t(228,209,'innercore, not weatherbrick. Capacity unfinished.',3)+t(228,220,'Pan end/DPC transition at−30 is an actual',3,'#a03535')+t(228,227,'unqualified weak join; no numerical firstharm pass.',3,'#a03535')
j+=t(20,242,'PEMKO73B is a real bronze spring-strip mechanism(.008in×5/8in;3in nails). Manufacturer states no certifications.',3)+t(20,249,'No immersion/weather/fire rating transfers to this custom timberframe, meeting stile, pan, hinge or jamb assembly.',3)+t(20,256,'Ordinary frame renewal retains pan; pan renewal removes frame+saddle under temporary exterior weather protection.',3)+t(20,263,'70kg/leaf stress:0.687kN weight,0.292kNm sag,0.180kNm outwardoffset. Wind/abuse/anchors remain structural work.',3)
j+=l(16,279,66,279,'#172033')+t(16,286,'500 model mm =50 paper mm · panel A only',2.8)
j+='</g></svg>\n'
let w=`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="Arial,sans-serif">`
w+=t(16,16,'Protected normal channel / separate outdoor surface relief',6)+t(16,24,'ONE finite candidate to challenge the shared-loggia dam · no buried occupied-room carrier / no gas lid',3.5)
w+=t(16,32,'Actual lowties below depresseddeck: research geometry, no capacity/hydraulic/material pass.',3,'#a03535')
const WX=x=>30+(x-4250)/60,WY=y=>204-(y-4250)/60
w+=t(16,43,'A  LOCATED OUTDOOR PLAN · 1:60 at original A3',3.5)
w+=r(WX(4250),WY(7750),3500/60,3500/60,'#f1eadc')+r(WX(4800),WY(13200),2400/60,5450/60,'#f1eadc')
w+=r(WX(4250),WY(7350),3500/60,350/60,'#ad7650')+t(112,145,'Upstreamflush intake y7000–7350',3)
w+=`<polyline points="${WX(4425)},${WY(7175)} ${WX(5000)},${WY(7600)} ${WX(5000)},${WY(13200)}" fill="none" stroke="#9d6235" stroke-width="5.8333"/>`
w+=r(WX(5300),WY(13200),1800/60,5450/60,'#b8dfe6')
w+=l(WX(4800),WY(7750),WX(7200),WY(7750),'#b23e38','2 1')+t(112,131,'Dam atmouth7750: coveredroute bypasses',3,'#a03535')+t(112,138,'only if conduit/beam/terminal remain real.',3,'#a03535')
for(const y of [8050,11700])w+=l(WX(4800),WY(y),WX(7200),WY(y),'#67578f','1 1')
w+=t(112,62,'Normal350gross; broadrelief1800clear.',3)+t(112,69,'Inlet before dam, no downstream cover holes.',3)+t(112,76,'Solid10SS covers500pitch/50overlap;',3)+t(112,83,'550×350 module≈15.4kg before handles.',3)+t(112,94,'Actual tiesTOP−550/BOTTOM−750.',3,'#a03535')+t(112,101,'27.5 below deepestlocaldecksoffit.',3,'#a03535')
w+=t(230,48,'B  REPRODUCIBLE UNIFORM-FLOW STRESS',3.5)+t(230,57,'Input L/s     Cu250 depth     Surface1800 depth',3)
for(let k=0;k<3;k++){const p=v.protectedWater.probes[k];w+=t(230,66+8*k,`${p.litresPerSecond}                   ${p.normalDepthMm.toFixed(2)} mm              ${p.surfaceDepthMm.toFixed(2)} mm`,3)}
w+=t(230,94,'Manning SI: Q=A·R^(2/3)·sqrt(S)/n;',3)+t(230,101,'R=by/(b+2y), S=.01; n=.020/.025 authored.',3)+t(230,108,'No inletcapture, bends, surcharge or tailwater',3)+t(230,115,'acceptance follows from normaldepth.',3)
w+=t(230,130,'C  DEPTH / FAILURE BOUNDARIES',3.5)+t(230,139,'100localRCdepression retains200RC;',3)+t(230,146,'northlocalsoffit−522.5; no heaveD fromfieldalone.',3)+t(230,153,'Cu bottoms−206.25 at7000,−213.75 at7750,',3)+t(230,160,'−256.25 at12000,−268.25 at13200.',3)+t(230,171,'Mouthdam110 reachesFFL0;125 reaches+15.',3,'#a03535')+t(230,178,'Actualdoor/panfirstharm may be lower.',3,'#a03535')
w+=t(20,219,'Separateprimary exterior downroute and broadE spill need independentreceivers; raisedterrace flood/backwater remains explicit.',3)+t(20,226,'Normalblockage leavesoverlandroute; loggiamouthdam leaves upstreamintake. A blanket spanningBOTH remains a commonfailure.',3)+t(20,233,'Whole copperrenewal: remove outdoor covers, expose supports/seams, isolate rain and lift released lengths; actual joints/temporaryrouting to earn.',3)+t(20,240,'Plainmetal cover is debris protection, not a pressure/gas seal. Copperseams, filler/flux, boltresidues and corrosion remain disclosed unknowns.',3)
w+=t(20,255,'Primary and relief are physically separate hydraulic routes at one loggia. No fullsystem independence is claimed while capacity/receiver acceptance remains unearned.',3)+l(16,279,49.333,279,'#172033')+t(16,286,'2000 model mm =33.33 paper mm · panel A only',2.8)
w+='</g></svg>\n'
for(const [ext,data] of [['json',JSON.stringify(v,null,2)+'\n'],['svg',s],['water.svg',q],['threshold.svg',j],['routes.svg',w]]){const p=`project/mat/studies/loggia-envelope-section.${ext}`;if(process.argv.includes('--check'))assert.equal(fs.readFileSync(p,'utf8'),data,p+' stale');else fs.writeFileSync(p,data)}
console.log('Loggia envelope checkpoint: wall507.5; soffit2890; ground/DPC/first-harm admission not earned.')
