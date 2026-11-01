/** Authored pre-site comparison. Geometry is not provider or construction acceptance. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../../../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const sha=p=>createHash('sha256').update(read(p)).digest('hex');
const source={
  brief:sha('project/had/boundary-service-lodge-and-raceway-brief.md'),
  site:sha('project/dpl/owner-site-brief.md'),
  charter:sha('project/owner-house-charter.md'),
};
const trial={
  status:'Authored unadopted pre-site comparison; no real plot, installed system or material exception.',
  source,
  electricalPrimary:{document:'UKPN EDS 08-2110-13c',version:'09',date:'01/12/2025',sha256:'ccd29a0bebe16422d818447bebedf3fb0fedfa852badfda36d984f49b0633edb',
    threePhase100A:{height:1100,depth:250,dnoOnlyWidth:445,frontWorking:1000,ductBendRadiusMinimum:250,ductSize:50},
    applicability:'Comparative supply only; actual service and current applicable drawing require DNO agreement.'},
  geometryMm:{
    cabinet:{internal:[795,250,1100],wall:215,doorReservation:50,plinth:100,eaves:1500,pitchDegrees:30,customerWidthReservation:350},
    walkIn:{internal:[1800,1800,2100],wall:215,doorClear:900,equipmentDepth:500,workingDepth:1300},
    separate:{electricalInternal:[795,250,1100],communicationsInternal:[400,250,600],wall:215,clearGap:300,waterChamberClear:[600,600],waterChamberSeparation:1000,communicationsEaves:950},
    raceway:{length:12000,clearWidth:600,wall:100,depthAtHouse:650,fallDenominator:100,coverLength:500,coverThickness:8,steelDensityKgM3:7850,houseDryEntryHeight:450,
      assessmentGroundwater:-1200,assumedReceivingWater:-900,blockedStateExternalWater:0,waterPipeCrownDepth:900,waterPipeDiameter:32},
    movement:{verticalSensitivity:50,transitionRun:1000},
  },
};
const g=trial.geometryMm,c=g.cabinet,r=g.raceway;
const cabinetOuter=[c.internal[0]+2*c.wall,c.internal[1]+c.wall+c.doorReservation];
const walkOuter=g.walkIn.internal.slice(0,2).map(x=>x+2*g.walkIn.wall);
const commOuter=[g.separate.communicationsInternal[0]+2*g.separate.wall,cabinetOuter[1]];
const clusterWidth=cabinetOuter[0]+g.separate.clearGap+commOuter[0];
const exitInvert=-r.depthAtHouse-r.length/r.fallDenominator;
const lidMass=(r.clearWidth+2*r.wall)/1000*r.coverLength/1000*r.coverThickness/1000*r.steelDensityKgM3;
trial.results={cabinetOuter,walkInOuter:walkOuter,communicationsOuter:commOuter,clusterOuterWidth:clusterWidth,
  footprintsM2:{cabinet:cabinetOuter[0]*cabinetOuter[1]/1e6,walkIn:walkOuter[0]*walkOuter[1]/1e6,separateBuilt:(cabinetOuter[0]+commOuter[0])*cabinetOuter[1]/1e6,separateEnvelope:clusterWidth*cabinetOuter[1]/1e6},
  cabinetRoofRise:cabinetOuter[0]/2*Math.tan(c.pitchDegrees*Math.PI/180),
  dnoAndCustomerWidth:445+c.customerWidthReservation,
  racewayExitInvert:exitInvert,normalOutfallHead:exitInvert-r.assumedReceivingWater,
  normalWaterBelowInvert: r.assessmentGroundwater-exitInvert,
  blockedWaterAboveHouseInvert:r.blockedStateExternalWater+r.depthAtHouse,
  blockedWaterBelowDryEntry:r.houseDryEntryHeight-r.blockedStateExternalWater,
  bareSteelCoverMassKg:lidMass,coverCount:r.length/r.coverLength,
  excavationPrismM3:(r.clearWidth+2*r.wall)/1000*r.length/1000*(r.depthAtHouse+r.length/r.fallDenominator/2)/1000,
  movementAngleDegrees:Math.atan(g.movement.verticalSensitivity/g.movement.transitionRun)*180/Math.PI,
  waterBelowTroughBase:r.waterPipeCrownDepth-r.depthAtHouse,
  missingSiteAndAssemblyInputs:['Actual groundwater/flood and receiving levels','Cable diameter, rating, bend radius, terminations and pulling force','Water duty, frost/no-demand protection and movement package','Support/cover load class, members, lifting device and joints','Foul invert and backwater','Approved constituents, roof, membranes and operator access'],
};
const out=trial.results;
assert.deepEqual(cabinetOuter,[1225,515]);assert.equal(out.dnoAndCustomerWidth,c.internal[0]);
assert.equal(exitInvert,-770);assert.equal(out.normalOutfallHead,130);
assert.equal(out.blockedWaterAboveHouseInvert,650);assert.equal(out.blockedWaterBelowDryEntry,450);
assert.equal(lidMass,25.12);assert.equal(out.coverCount,24);
assert.equal(out.excavationPrismM3,6.816);
// Adverse controls: these defeat the specific claimed route, not all possible redesigns.
assert(exitInvert-(-700)<0,'Outfall above trench invert cannot drain this trial by gravity');
assert(0>-r.depthAtHouse,'Flooded trench does not remain a dry electrical space');
assert(600<1000,'A 600-deep front strip cannot satisfy the source 1000 front field');
assert(r.depthAtHouse<r.waterPipeCrownDepth,'Water at 900 cover does not fit above this 650 base');
assert.notEqual(out.movementAngleDegrees,0,'Relative endpoint movement is not a rigid straight connection');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
let s='';
const text=(x,y,v,z=3.2)=>s+=`<text x="${x}" y="${y}" font-size="${z}">${esc(v)}</text>`;
const line=(x,y,X,Y,col='#536466',dash=false)=>s+=`<path d="M${x},${y}L${X},${Y}" fill="none" stroke="${col}" stroke-width="0.5" ${dash?'stroke-dasharray="2 1"':''}/>`;
const rect=(x,y,w,h,fill='#ece7de',stroke='#536466')=>s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="0.5"/>`;
const begin=(title,desc)=>{s=`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><title>${esc(title)}</title><desc>${esc(desc)}</desc><rect width="420" height="297" fill="#fffdf8"/><g font-family="Arial,sans-serif" fill="#263c40">`;text(12,14,title,5.3);text(12,22,desc,3);};
const end=()=>s+='</g></svg>\n';
begin('Boundary Service Lodge / proportional form comparison','Authored pre-site study. Dimensions mm. All forms 1:40 at A3 100%. Not a selected or provider-approved installation.');
const cols=[12,150,288];
text(cols[0],34,'A / compact front cabinet',4);text(cols[1],34,'B / walk-in masonry lodge',4);text(cols[2],34,'C / separate small cells',4);
function elevation(x,y,w,d,h,caption,k=.025,doorWidth=null,doorHeight=null){rect(x,y-h*k,w*k,h*k);const dw=doorWidth??(w-430),dh=doorHeight??1100;rect(x+(w-dw)*k/2,y-(dh+100)*k,dw*k,dh*k,'#c9b49c');s+=`<path d="M${x},${y-h*k}L${x+w*k/2},${y-h*k-w/2*Math.tan(Math.PI/6)*k}L${x+w*k},${y-h*k}" fill="#909b9d" stroke="#536466" stroke-width="0.6"/>`;text(x,y+6,caption,2.8);}
elevation(20,130,1225,515,1500,'1225 W / 515 D; 30-degree roof trial');
elevation(154,127,2230,2230,2400,'2230 square; 30-degree roof trial',.025,900,2100);
elevation(292,130,1225,515,1500,'Electrical cell: same as A');
elevation(330.125,130,830,515,950,'',.025,400,600);text(330.125,90,'Data cell',2.7);text(12,144,'Electrical clear 795 W × 250 D × 1100 H');text(12,151,'445 source DNO-only + 350 customer trial');text(12,158,'No water/gas/active data in this cell.');
text(150,171,'1800 square internal; 500 equipment +');text(150,178,'1300 working trial. 900 door must clear.');text(288,144,'Separate data cell: 830 W × 515 D.');text(288,151,'300 gap; 2355 total masonry-row field.');text(288,158,'Water chamber separate, not in roofed cell.');
function plan(x,y,w,d){rect(x,y,w*.025,d*.025);rect(x+5.375,y+5.375,(w-430)*.025,(d-265)*.025,'white');line(x,y+d*.025,x+w*.025,y+d*.025,'#a56a4b');}
plan(20,178,1225,515);rect(20,190.875,30.625,25,'#e9f1ed');text(22,205,'1000 front',2.4);text(12,263,'0.631 m² masonry footprint; no internal room.');
rect(154,185,55.75,55.75);rect(159.375,190.375,45,45,'white');text(160,220,'500 equipment',2.7);text(160,230,'1300 work',2.7);text(154,248,'Plan 1:40; 1800 internal square.',2.7);text(150,273,'4.973 m²; rain/frost control still required.');
plan(290,180,1225,515);plan(328.125,180,830,515);rect(290,192.875,58.875,25,'#e9f1ed');text(292,206,'1000 front clear across both.',2.4);text(288,263,'1.058 m² built; 1.213 m² row envelope.');
text(12,282,'Recommendation: C as a pre-site arrangement; remote water isolation and separate sealed foul access. No common all-service room.',3);
text(12,290,'215 walls / 50 door depth / 350 customer width / roof are authored. Actual equipment, roof structure, openings and material admission remain unselected.',2.65);end();const forms=s;
begin('Boundary service route / connected trial and failures','Separate services, house-side isolation and accessible covers. Authored trial; no surveyed site or accepted engineering.');
text(12,34,'PLAN / 1:100. Lodge s0; controlled house entry s12000.',3.8);
rect(14,43,26,14);text(15,49,'C cells',2.7);text(15,54,'private side',2.5);
rect(42,45,120,8,'#e2eceb');line(42,49,162,49,'#986349');rect(162,41,15,20);text(180,83,'House hub / independent isolators',2.7);text(180,90,'No network master-dead claim',2.7);
for(let i=0;i<24;i++)line(42+i*5,45,42+i*5,53,'#a7b7b6');
rect(24,67,6,6,'#dce9ed');text(12,87,'600-square clear water chamber; separate 1000 trial gap.',2.6);line(42,60,162,60,'#3d7e9a');text(43,67,'Water: separate buried line; no submerged fittings assumed',2.8);
line(42,74,162,74,'#8b897e',true);text(43,81,'Foul: separate sealed route; real invert controls, not trough fall',2.8);
text(223,37,'F1 / rejected open grate',3.2);text(223,44,'air void; not buried-water protection',2.6);
rect(230,62,40,32.5,'white');for(let i=0;i<8;i++)line(230+i*5,62,232.5+i*5,62);
for(const q of [237,250,263]){line(q,51,q,70,'#3d7e9a');line(q,70,q-1.5,67,'#3d7e9a');line(q,70,q+1.5,67,'#3d7e9a');}
rect(247,83,6,3.2,'#dce9ed');text(230,100,'water / unprotected trial',2.4);
text(325,37,'F2 / blocked outlet + flood',3.2);text(325,44,'0 water plane; dry void fails',2.6);
rect(330,62,40,32.5,'#b8d4e0');line(325,62,378,62,'#3d7e9a');line(370,94.5,382,94.5);line(382,94.5,382,39.5);line(382,39.5,400,39.5);
text(374,52,'+450 entry',2.4);text(330,102,'650 depth at house / sections 1:20',2.5);
text(12,94,'SECTION ALONG / horizontal 1:100; vertical 1:20 (explicit distortion)',3.8);
const x0=42,z0=124,x=s0=>x0+s0*.01,z=v=>z0-v*.05;
line(12,z(0),192,z(0));text(196,124,'grade 0 / relative datum',2.8);
line(x(0),z(-770),x(12000),z(-650));line(x(0),z(0),x(12000),z(0),'#536466');
for(let i=0;i<24;i++)line(x(i*500),z(0),x(i*500),z(-50),'#a7b7b6');
line(x(0),z(-1200),x(12000),z(-1200),'#3d7e9a',true);text(196,184,'assumed groundwater -1200',2.8);
line(12,z(-900),x(0),z(-900),'#3d7e9a');text(12,173,'receiving -900',2.6);line(x(0),z(-770),26,z(-770),'#3d7e9a');
line(162,z(-650),168,z(-650));line(168,z(-650),168,z(450));line(168,z(450),187,z(450));
text(175,101,'dry sleeve +450',2.8);text(64,158,'base: house -650 → lodge -770; 120 fall / 12000',2.8);
text(196,138,'Normal: 130 mm outlet head only.',2.8);text(196,145,'No hydraulic capacity or margin earned.',2.8);text(196,155,'Flood 0 overtops this whole trough.',2.8);text(196,162,'450 separation at assumed 0 only.',2.8);text(196,169,'Entry performance unproved; no pump credit.',2.8);
text(12,198,'CROSS SECTION / 1:10',3.8);
rect(15,208,10,65);rect(85,208,10,65);line(25,273,85,273);line(15,283,95,283,'#536466',true);rect(15,208,80,.8,'#909b9d');text(17,218,'600 clear / 100 each wall',2.6);
rect(29,232,14,14,'#e2eceb');rect(58,232,14,14,'#ece7de');text(27,254,'E',3);text(58,254,'Data',3);
line(15,266,95,266,'#3d7e9a',true);text(16,278,'650 clear depth; base build-up unselected.',2.5);
text(108,207,'COVER: 800 × 500 × 8 bare steel sensitivity',3.2);text(108,214,'25.12 kg before stiffeners, keys, finish or water.',2.8);text(108,221,'24 lifts over 12 m. Thickness proves no capacity.',2.8);
text(108,233,'F1 / grate + frost: open air reaches water; reject',3.2);text(108,240,'unproved frost protection even at 900 below grade.',2.8);
text(108,252,'F2 / blocked outfall + flood 0: wet 650 at house;',3.2);text(108,259,'buried dry-cell promise fails. No shared wet/dry sump.',2.8);
text(108,271,'MOVEMENT / 50 over 1000 = 2.862 degrees trial.',3.2);text(108,278,'Not joint capacity. Rigid connection is rejected.',2.8);
text(12,290,'Recommendation: conventional separate burial is benchmark; covered access only where gravity, flood, frost, roots, pulling/lifting and all terminations earn it.',2.7);end();const routes=s;
const files={
 'project/had/studies/boundary-service-lodge.json':JSON.stringify(trial,null,2)+'\n',
 'project/had/studies/boundary-service-lodge-forms.svg':forms,
 'project/had/studies/boundary-service-lodge-routes.svg':routes,
};
for(const [p,v] of Object.entries(files)){if(process.argv.includes('--check'))assert.equal(read(p),v,'Regenerate '+p);else writeFileSync(new URL(p,root),v);}
console.log('Boundary lodge comparison verified: geometry, source identities, adverse controls and exact drawings.');
