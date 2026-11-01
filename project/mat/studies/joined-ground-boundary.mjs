import fs from 'node:fs'
import cp from 'node:child_process'
import assert from 'node:assert/strict'
const root='project/mat/studies/joined-ground-boundary'
const sourcePaths=['compiler/reference-house/georgian/section-source.ts','compiler/reference-house/georgian/layout-revision.ts','project/had/had-03-local-portal-design.md']
const sourceBlobs=Object.fromEntries(sourcePaths.map(p=>[p,cp.execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim()]))
const coverLayers={stone:15,distribution:65,glass:100,rcCap:100,permanentBridgeExtra:20,clearanceBelowBridge:10,airLid:6,copperSealEnvelope:2}
const mineralCap=280, bridgeBottom=-300, lidTop=bridgeBottom-10, lidBottom=lidTop-6, sealBottom=lidBottom-2
const cover=-sealBottom, crown=sealBottom-60, invert=crown-160, exit=invert-42.5, trayBottom=invert-100
const outerUnderside=trayBottom-1.5-100-100, heaveStress=300, constructionLoss=50, residualReserve=50, requiredD=-outerUnderside+heaveStress+constructionLoss+residualReserve, recommendedD=Math.ceil(requiredD/100)*100
const values={authority:'Unadopted joined reference design; dimensions are design hypotheses, not product/site/ground-gas acceptance.',baseline:'1e7b2cbce408834ca3cbb91c286af37eda066829',sourceBlobs,coverLayers,mineralCap,bridgeBottom,lidTop,lidBottom,sealBottom,cover,fieldDepth:380,corridorClear:600,tray:1.5,sideInsulation:100,rcSides:100,outerWidth:1003,rcClearSpan:803,crown,invert,exit,trayBottom,outerUnderside,heaveStress,constructionLoss,residualReserve,requiredD,recommendedD,rawClearance:recommendedD+outerUnderside,afterStress:recommendedD+outerUnderside-heaveStress-constructionLoss,reserveSurplus:recommendedD+outerUnderside-heaveStress-constructionLoss-residualReserve,failedD1200:1200+outerUnderside-heaveStress-constructionLoss-residualReserve,capModuleLength:400,airLidGross:[660,840],airLidClear:[600,780],carrierBodyWidth:200,carrierJointWidth:300,carrierCrossingPieceLength:750,liftTravel:650,ordinaryDpc:{courses:2,units:65,beds:10,band:150,fieldTop:-380,fieldBottom:-530,bridgeTop:-300,bridgeBottom:-450},sensitivities:[0,150,300,350,400].map(h=>({heave:h,residualClearance:recommendedD+outerUnderside-h-constructionLoss,surplusOver50:recommendedD+outerUnderside-h-constructionLoss-50})),coreThermalResistance:100/1000/0.041}
assert.equal(cover,318); assert.equal(outerUnderside,-839.5); assert.equal(recommendedD,1300); assert.equal(values.reserveSurplus,60.5)
const rect=(x,y,w,h,fill,stroke='#334155')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width=".35"/>`
const txt=(x,y,t,size=3,fill='#172033')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}">${t}</text>`
const line=(x1,y1,x2,y2,col='#64748b',dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width=".35" ${dash?`stroke-dasharray="${dash}"`:''}/>`
// A3 landscape; drawing coordinates are millimetres. 1 mm model = 0.1 mm paper.
const X=x=>112+x/10,Y=z=>55-z/10
let s=`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="#fff"/><g font-family="Arial, sans-serif">`
s+=txt(16,17,'Joined ground floor / independent court passage',6)+txt(16,24,'MAT · one D1300 reference candidate; inherited cover and D1200 stress rejected · 1 November 2026',3.5)+txt(16,31,'Unadopted design. No construction, material, hydraulic, gas or site acceptance. Dimensions in mm.',3)
s+=txt(16,43,'A  TRANSVERSE SECTION · 1:10 at A3 · 600 clear retained; cap bears RC sides',3.5)
// Adjacent field and insulated service U-box.
s+=rect(X(-900),Y(0),39.85,1.5,'#c7b18b')+rect(X(501.5),Y(0),39.85,1.5,'#c7b18b')
s+=rect(X(-900),Y(-15),39.85,6.5,'#e5dfd5')+rect(X(501.5),Y(-15),39.85,6.5,'#e5dfd5')
s+=rect(X(-900),Y(-80),39.85,10,'#f6d67d')+rect(X(501.5),Y(-80),39.85,10,'#f6d67d')
s+=rect(X(-900),Y(-180),39.85,20,'#b9c2cc')+rect(X(501.5),Y(-180),39.85,20,'#b9c2cc')
s+=rect(X(-501.5),Y(-280),10,55.95,'#b9c2cc')+rect(X(401.5),Y(-280),10,55.95,'#b9c2cc')+rect(X(-501.5),Y(-739.5),100.3,10,'#b9c2cc')
s+=rect(X(-401.5),Y(-318),10,32.15,'#f6d67d')+rect(X(301.5),Y(-318),10,32.15,'#f6d67d')+rect(X(-401.5),Y(-639.5),80.3,10,'#f6d67d')
s+=rect(X(-301.5),Y(-318),.15,32.15,'#617a8c')+rect(X(300),Y(-318),.15,32.15,'#617a8c')+rect(X(-301.5),Y(-638),60.3,.15,'#617a8c')
let z=0;for(const [n,d,c] of [['stone',15,'#c7b18b'],['distribution',65,'#e5dfd5'],['glass',100,'#f6d67d'],['RC cap',100,'#b9c2cc']]){s+=rect(X(-501.5),Y(z),100.3,d/10,c);z-=d}
// Separate lid on outward 30mm lands; mineral cap bears RC sides, bypassing seal.
s+=rect(X(-330),Y(lidTop),66,.6,'#617a8c')+rect(X(-330),Y(lidBottom),3,.2,'#be4a48')+rect(X(300),Y(lidBottom),3,.2,'#be4a48')
s+=line(X(-330),Y(sealBottom),X(-300),Y(sealBottom),'#617a8c')+line(X(300),Y(sealBottom),X(330),Y(sealBottom),'#617a8c')
s+=line(X(-315),Y(-300),X(-315),Y(-330),'#172033')+line(X(315),Y(-300),X(315),Y(-330),'#172033')
s+=rect(X(-100),Y(crown),20,16,'none','#087e8b')+rect(X(-150),Y(crown),30,16,'none','#a7b6bd')+txt(X(-100),Y(crown)-2,'W1 body 200; joint 300',2.7,'#087e8b')
s+=line(22,Y(-1300),205,Y(-1300),'#6a7a44')+txt(23,Y(-1300)+5,'Authored soil / grade −1300; not an assessed water surface',2.8,'#526039')
s+=line(22,Y(-950),205,Y(-950),'#b65a42','2 1')+txt(23,Y(-950)-2,'H=300 stress: soil −950 (H300 + 50 loss)',2.8,'#b65a42')
s+=line(X(550),Y(outerUnderside),X(550),Y(-950),'#b65a42')+txt(X(565),Y(-900),'110.5 residual',2.7,'#b65a42')
s+=txt(22,194,'Field: 15 stone + 65 distribution + 100 bare T4+ + RC200 = 380.',3)+txt(22,201,'Cover: upper180 + RC100 = 280; independent lid top −310 / seal −318.',3)+txt(22,208,'Fixed U-box: 600 + 2(1.5 SS + 100 glass + 100 RC) = 1003 wide.',3)+txt(22,215,'W1 and lifted cover support no wall. W2 containment remains fixed.',3)
s+=txt(227,43,'B  CONNECTED DATUM / FAILURE LEDGER',3.5)
const rows=[['FFL / walking line','0'],['Independent lid / seal underside','−318'],['Carrier crown / inlet invert','−378 / −538'],['Outlet invert after 4250 at 1%','−580.5'],['Retained tray bottom','−638'],['Tray +100 glass + RC100 underside','−839.5'],['D1300 raw soil clearance','460.5'],['After H300 +50 loss / final surplus','110.5 / 60.5'],['D1200 surplus over final50','−39.5 FAIL']]
rows.forEach((r,i)=>{let y=54+i*8;s+=txt(227,y,r[0],3)+txt(388,y,r[1],3)})
s+=txt(227,136,'D = 839.5 + 300 + 50 loss + 50 final = 1239.5 → 1300.',3.3)+txt(227,144,'300 heave, 50 construction loss and 50 final reserve are authored.',2.8)+txt(227,151,'Not a soil forecast, heave requirement or vent clearance.',2.8)
s+=txt(227,165,'C  MINERAL WALL / DPC JOIN',3.5)+txt(227,174,'Ketley WCBL65: two bonded 65 units + nominal beds',3)+txt(227,181,'reserve 150. Field band −380..−530; bridge −300..−450.',3)+txt(227,188,'Stepped return must interrupt every support path.',3)+txt(227,195,'Lowest field edge is 770 above authored grade.',3)+txt(227,202,'M12 chemistry, bond / shear and stepped joints unaccepted.',3)+txt(227,209,'Four courses not fixed: added interfaces earn no reliability.',3)
s+=txt(16,232,'BOUNDARIES AND RENEWAL',3.5)+txt(16,241,'Dry mineral cap lifts with rated mechanical handling. A separate bolted SS lid exposes W1 only after temporary wet/gas isolation.',3)+txt(16,248,'W2 = retained welded stainless tray; separately led exterior declaration. A telltale is not an unsealed gas bypass.',3)+txt(16,255,'All-metal lid / copper seal is a custom development hypothesis. Circular CF seal evidence does not qualify this rectangular closure.',3)+txt(16,262,'Thermal resistance 100 / 1000 / 0.041 = 2.439 m²K/W for core only; corners, walls, supports and edge seals require calculation.',3)+txt(16,269,'FIRST HARM: actual doorset drains / jamb joints remain unlocated; −45 sill underside is not a proved lowest failure boundary.',3)
s+=line(16,279,66,279,'#172033')+line(16,277,16,281,'#172033')+line(66,277,66,281,'#172033')+txt(16,286,'500 model mm = 50 paper mm · no scale if resized',2.8)+txt(227,286,'Reproduce: node project/mat/studies/joined-ground-boundary.mjs --check',2.7)
s+='</g></svg>\n'
let j=`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="Arial, sans-serif">`
j+=txt(16,17,'Connected court / wall / internal support junctions',6)+txt(16,25,'D1300 reference candidate · 1:10 at A3 · no adopted threshold or gas-boundary performance',3.5)
const Q=x=>80+x/10,R=z=>76-z/10
j+=txt(16,43,'A  COURT-WALL CROSSING · longitudinal crop',3.5)
// 700-long permanent spreader, centred on actual inner-leaf axis; crop local wall allocation.
j+=rect(Q(-400),R(0),40,2,'#c7b18b')+line(Q(-400),R(-86),Q(-150),R(-121),'#087e8b')
j+=rect(Q(417.5),R(0),65,1.5,'#c7b18b')+rect(Q(417.5),R(-15),65,6.5,'#e5dfd5')+rect(Q(417.5),R(-80),65,10,'#f6d67d')+rect(Q(682.5),R(-180),38.5,10,'#b9c2cc')
j+=rect(Q(-17.5),R(-180),70,12,'#b9c2cc')+rect(Q(0),R(-15),41.75,16.5,'#e5dfd5')
j+=rect(Q(100),R(100),20,14.5,'none','#be4a48')+txt(Q(-400),R(140),'Door/frame/jamb first-harm NOT QUALIFIED',2.8,'#be4a48')+line(Q(-100),R(125),Q(200),R(10),'#be4a48')
j+=line(Q(-150),R(-121),Q(-150),R(-638),'#087e8b')+line(Q(-150),R(-638),Q(1067.5),R(-638),'#087e8b')
j+=line(Q(-100),R(-310),Q(1067.5),R(-310),'#617a8c')+line(Q(-100),R(-318),Q(1067.5),R(-318),'#be4a48')
j+=rect(Q(-100),R(-378),116.75,16,'none','#087e8b')
j+=line(Q(-150),R(-839.5),Q(1067.5),R(-839.5),'#64748b')+line(22,R(-1300),205,R(-1300),'#6a7a44')
j+=txt(22,215,'Pan −86/−121 → inspectable collector to carrier invert −538.',2.9)+txt(22,222,'W2 vertical/corner/collar continuously welded; fixed lid under bridge.',2.9)+txt(22,229,'A/G wall-pan/frame connection is the marked unresolved junction.',2.9)+txt(22,236,'DPC is in side piers OUT OF this void section; see B route.',2.9)
j+=txt(227,43,'B  SUPPORT / DPC CONTINUITY ROUTE',3.5)
j+=rect(240,61,16,12,'#b9c2cc')+rect(240,73,16,15,'#a8a0b0')+rect(240,88,16,20,'#ddd6cc')+txt(263,69,'Permanent bridge bearing bottom −300',3)+txt(263,81,'Two bonded courses: −300..−450',3)+txt(263,102,'Aligned side pier → house ground support',3)
j+=rect(240,116,16,20,'#b9c2cc')+rect(240,136,16,15,'#a8a0b0')+rect(240,151,16,20,'#ddd6cc')+txt(263,126,'Field RC200 bearing bottom −380',3)+txt(263,144,'Two bonded courses: −380..−530',3)+txt(263,165,'No wet RC bypass around mineral band',3)
j+=line(234,73,234,151,'#7d4973','2 1')+txt(227,183,'Bonded stepped DPC connects side piers, inner/outer leaves',3)+txt(227,190,'and internal spine supports; no unsupported DPC over void.',3)+txt(227,197,'Actual bonded corner/step schedule and mortar shear unqualified.',3)
j+=txt(227,210,'C  LOCAL LID SUPPORT BELOW PERMANENT BRIDGE',3.5)+txt(227,219,'U wall locally recessed to −330; bridge underside −300.',3)+txt(227,226,'SS12 seat at −330..−318 crosses insulation to outward land.',3)+txt(227,233,'Cu seal −318..−316; SS6 lid −316..−310; 10 clear to bridge.',3)+txt(227,240,'Seat carries lid / clamp only. Floor load bypasses seal.',3)
j+=txt(16,254,'Renewal: open ≥780 mm length above a750 wet piece; remove enough400 dry caps. Fixed bridge / inner lid stays.',3)+txt(16,261,'Translate the750 piece into its clear neighboring position, then lift650. E-court withdrawal is WEST; N-court is NORTH.',3)+txt(16,268,'840-long air lids with30 end lands are a spatial reservation; bolt release / temporary gas isolation / seal qualification remain unearned.',3)+line(16,279,66,279,'#172033')+txt(16,286,'500 model mm = 50 paper mm · only at original A3',2.8)+txt(227,286,'Diagram B is a connected load-path schedule, not a drawn masonry bond.',2.8)
j+='</g></svg>\n'
for(const [ext,content] of [['json',JSON.stringify(values,null,2)+'\n'],['svg',s],['junctions.svg',j]]){const p=`${root}.${ext}`;if(process.argv.includes('--check'))assert.equal(fs.readFileSync(p,'utf8'),content,`${p} stale`);else fs.writeFileSync(p,content)}
console.log(`Joined ground boundary: lowest closure ${cover}; outer ${outerUnderside}; D${recommendedD}; residual ${values.afterStress}; ${process.argv.includes('--check')?'verified':'written'}`)
