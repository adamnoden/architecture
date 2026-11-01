/** One whole-house open-loggia candidate. Authored reference design; explicit failures are retained. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js';
const OUT=new URL('./',import.meta.url),ROOT=new URL('../../../',import.meta.url);
const basePath='project/str/studies/house-plan.json',bytes=readFileSync(new URL(basePath,ROOT));
const sha=createHash('sha256').update(bytes).digest('hex');
if(sha!=='193805456e26533026814bebe8c6be862e26a7d944c360dbb6047a1bde2d2282')throw Error('Reassess B source before loggia generation');
const b=JSON.parse(bytes),groundWalls=structuredClone(b.ground_walls),upperWalls=structuredClone(b.first_walls),ground=structuredClone(b.ground_objects),upper=structuredClone(b.first_objects);
const weather={total:507.5,layersRoomToWeather:[['mineralFinish',15],['structuralMasonry',140],['bareCellularGlass',200],['drainedGap',50],['weatherBrick',102.5]],scope:'ONE provisional material/structure recipe;140 core adequacy, exact material admission and whole-wall thermal bridge remain with STR/MAT.'};
const loggia={clear:[4800,7750,2400,4250],axis:6000,wholeRingClearStripM2:10.2,formerFamilyGrossStripM2:9.198,warning:'New weatherwalls cost additional room area. Neither10.2 nor9.198 is final net conditioned-floor loss.'};
const newWeatherWalls=[
 {id:'loggia-west-weather',a:[4377.5,7750],b:[4377.5,12000],t:507.5,holes:[],finishedFaces:[4292.5,4800],structuralCore:[4307.5,4447.5],roomSide:'west'},
 {id:'loggia-east-weather',a:[7622.5,7750],b:[7622.5,12000],t:507.5,holes:[],finishedFaces:[7200,7707.5],structuralCore:[7552.5,7692.5],roomSide:'east'}
];
for(const id of ['rear-west-return','rear-divider','rear-reading-east'])groundWalls.splice(groundWalls.findIndex(w=>w.id===id),1);
groundWalls.find(w=>w.id==='rear-west').b[0]=4377.5;
groundWalls.push(...newWeatherWalls);
const divider=upperWalls.find(w=>w.id==='rear-divider');divider.a[0]=divider.b[0]=7622.5;divider.t=170;
const westReturn=upperWalls.find(w=>w.id==='rear-west-return');westReturn.a[0]=westReturn.b[0]=4377.5;westReturn.t=170;
upperWalls.find(w=>w.id==='rear-west').b[0]=4377.5;
const wetSpine=upperWalls.find(w=>w.id==='wet-spine');wetSpine.t=185;wetSpine.finishedFaces=[9215,9400];wetSpine.structuralCore=[9230,9370];
const bathNorth=upperWalls.find(w=>w.id==='bath-north');bathNorth.t=185;bathNorth.finishedFaces=[6415,6600];bathNorth.structuralCore=[6430,6570];
const rearEast=upperWalls.find(w=>w.id==='rear-east');rearEast.t=260;rearEast.a[0]=7552.5;groundWalls.find(w=>w.id==='rear-east').a[0]=7552.5;rearEast.holes=[[8250,9150],[9900,10800]];rearEast.finishedFaces=[8152.5,8412.5];rearEast.structuralCore=[8182.5,8397.5];
Object.assign(upper,{
 'bed2':[1125,1062.5,900,2000],'bed2-head':[1125,3062.5,900,100],'bed2-wardrobe':[4055,1017.5,660,900],
 'bed3':[10033.75,1525,900,2000],'bed3-head':[10033.75,3525,900,90],'bed3-wardrobe':[7285,1017.5,660,1500],
 'principal-wardrobe':[7707.5,9300,660,1500],'principal':[9492.5,9175,2000,1600],'principal-head':[11492.5,9175,90,1600],'bed4':[5447.5,9350,2000,1500],'bed4-head':[7447.5,9350,90,1500],
 'principal-shower900':[9400,6600,900,900],'principal-basin':[9400,7600,340,450],
 'principal-WC':[10972.5,7412.5,355,560],
 'principal-local-soil-column':[11342.5,7950,180,180]
});
Object.assign(ground,{
 'reading-sofa1900x850':[800,8950,850,1900],
 'family-sofa1900x750':[3400,9650,750,1900],
 'reading-side-table300':[1800,10650,300,300],'family-side-table300':[3000,9600,300,300],
 'dining-table1200x800':[8500,9050,800,1200],
 'dining-chair-west-south':[8000,9100,500,500],'dining-chair-west-north':[8000,9700,500,500],
 'dining-chair-east-south':[9300,9100,500,500],'dining-chair-east-north':[9300,9700,500,500],
 'cold-storage':[10932.5,9025,650,650]
});
delete ground['dry-prep-table'];
const openingRewinds=[
 {level:'GROUND/FIRST',wall:'outer-north',fromCentre:3900,toCentre:3550,width:1000,reason:'Actual room/weatherwall and north pier width'},
 {level:'GROUND/FIRST',wall:'outer-north',fromCentre:8100,toCentre:8450,width:1000,reason:'Paired north facade re-composition'},
 {level:'GROUND',wall:'outer-north',centres:[8450,10200],sill:1050,head:2850,reason:'900high solid-pier kitchen stations may now overlap the adjustedwindow projection without crossing750sill'},
 {level:'GROUND',wall:'court-north',id:'grand-court-entry-north',kind:'open-loggia',width:2400,reason:'Outdoor through-route, no door leaves'},
 {level:'GROUND',wall:'outer-north',id:'garden-entry',kind:'open-loggia',width:2400,reason:'Outdoor through-route, no door leaves'},
 {level:'GROUND',wall:'rear-west',interval:[3100,4000],hinge:[3100,8852.5],operation:'OPEN ARCH preferred; no leaf',reason:'Omit shared-living acoustic/privacy closure; BCR005/ERFIRE01 must admit actual escape/compartment strategy. Not a private-door exemption.'}
];
const openings={};for(const level of ['GROUND','FIRST'])openings[level]=revisionOpenings(level).map(o=>({...o,centre:o.wall==='outer-north'&&o.centre===3900?3550:o.wall==='outer-north'&&o.centre===8100?8450:o.centre,...(level==='GROUND'&&['grand-court-entry-north','garden-entry'].includes(o.id)?{kind:'open-loggia'}:{}),...(level==='GROUND'&&o.id==='grand-court-entry-south'?{width:1800}:{})}));
const candidate={
 status:'FIRST WHOLE-HOUSE CANDIDATE, NOT ADOPTED. Known failures/interfaces are explicit; no support/water/material/site acceptance.',startingMain:'6a953ef6d3131364aca740eaff2a06f301adbc2e',base:{path:basePath,sha256:sha},
 shell:12000,court:[4250,4250,3500,3500],envelope:417.5,loggia,weather,groundWalls,upperWalls,openingRewinds,openings,groundFurniture:ground,upperFurniture:upper,stair:b.stair,void:b.void,
 fixedObstacles:{GROUND:[['wetBeamSouthReceiver',[2817.5,8687.5,170,330]],['wetBeamNorthReceiver',[2817.5,11502.5,170,330]],['stairMidPostFinished',[2817.5,6992.5,265,280]]],FIRST:[['stairMidPostFinished',[2817.5,6992.5,265,280]]]},structuralChanges:{stairMidPost:{concrete:[2817.5,7007.5,250,250],eastRoomFinish:15,eastFinishedFace:3082.5,courtWestFace:3832.5,grossGalleryClear:750,scope:'ActualSTRnewpostoutside1100flight; body/window/guard/escape testrequired.'},upperFloor:'Continuous RC200 trial, not adopted. Ordinary short spans/support schedule owned by STR.',upperRearDivider:{from:7400,to:7622.5,finished:170,core:140},upperRearWestReturn:{from:4450,to:4377.5,finished:170,core:140},newWetWallBeam:{axisX:2902.5,supportAxesY:[8852.5,11667.5],span:2815,reason:'Ground reading partition removed; actualupperwetwall needs a finite separate beam/support, no unproved slab line-load spreading.',southDoorEdge:3100,northWindowStart:3050,beamTop:3370,beamBottom:3020,finishedGroundSoffit:3005,southReceiverFinished:[2817.5,8687.5,170,330],northReceiverFinished:[2817.5,11502.5,170,330]},exposedSoffit:'Actual thermal/fire/weather package below upper floor over loggia unqualified.'},
 rooms:{living:{bounds:[417.5,8937.5,3875,2645],twoSofas:true,groundReadingWallRemoved:true,sofaFaces:['EAST','WEST'],scope:'Open arch loses acoustic/privacy closure; full body/window/stack/receiver/fire tests required before selection.'},kitchenDining:{bounds:[7707.5,8412.5,3875,3170],fourPlaces:true,northWorkingGap:732.5,southEntryGap:637.5,fridgeToEastWindowProjectionGap:25,trade:'Separate dryprep table deleted; dining table has separate meal/prep states.'},principalBath:{northFinishedFace:8152.5,westFinishedFace:9400,southFinishedFace:6600,door:[9900,10800],WC:'SOUTH-facing355x560 with north180serviceband/cistern; actual product and operation owned by MATINTERIORS',soilColumnCentre:[11432.5,8040],scope:'Live MATINTERIORS constructivegeometry; exactselectedproduct/frame/servicebranch still tojoin.'}},
 water:{normal:'Outdoor west-edge copper channel; exact width/fall/inlet/receiver awaitingjoinedMATspatialselection.',relief:'Independent E or separately visible passive overland route must be drawn with blockedN/high-tailwater/common-obstruction states. No independentpair acceptance from two loggia strips.',oldD1300:'Retained cost benchmark only; deleting waterboxes does not adopt grade150 or prove a shallower ground-support section.'},
 furnitureRequirements:{principalBed:{whole:[9492.5,9175,2090,1600],body:upper.principal,head:upper['principal-head'],maxHeadHeight:700,maxBedMattressTop:600,minCill:750,verticalReserve:50,windowOperation:'Compatible leaf/frame lower envelope staysat/above750; actualOASfamily/3Doperation not yet matched.',southPassageFromActualLeaf8474:701,declaredCombinedPositionLoss:50,bodyDiameter:600,remainingPassageAfterLoss:651,maintenance:{translation:[0,500],whole:[9492.5,9675,2090,1600],swept:[9492.5,9175,2090,2100],trayStage:[10275,8540,250,900],handlingPad:100,nominalStageGap:235,after100Pad:135,windowTasks:'Unavailable during bedroom maintenance; restore ordinary state.'}},bed4:{whole:[5447.5,9350,2090,1500],maxHeadHeight:700,westFootGap:947.5,northWindowClear:732.5,rearR01PanStageWithPad:[3700,10522.5,760,555],noR01Conflict:true}},sections:{groundFFL:0,firstFFL:3450,atticDatum:6900,groundFloorRC:{top:-180,bottom:-380},firstFloorRC:{top:3370,bottom:3170},loggiaSoffit:{insulation:200,railLathTerritory:15,mineralProtection:25,underside:2930,scope:'MAT provisional exact recipe; arch/head thermal interface notyet admitted.'},groundSupport:{grid:[250,450],top:-180,bottom:-630,capEnvelope:[650,650,500],capBottom:-722.5,heaveStress:300,constructionLoss:50,ventilationReserve:150,Drequired:1222.5,Dtrial:1300,Dsurplus:77.5,scope:'STR reference capacity/actualventilation/site condition unqualified. D1300 is solum/grade trial, not sitefact.'},waterLevels:{southLandingStart:0,landingRun:600,landingDrop:12,courtNorth:-110,courtRun:3500,loggiaNorth:-152.5,loggiaRun:4250,scope:'MAT constructiveONEproposal; structure/slopes/receivers/firstharm need joined check.'},fireHeight:{firstAboveAuthoredExterior:4750,lowRiseComparison:4500,scope:'D1300 crossesADBupperfloor4.5m groundheight boundary; actualadjacentground/storey interpretation/strategy required. Solum andexternalground notinterchangeable.'}},knownInterfaces:['Ground NSbeam under upper rearwetwall must earn bearings/arch interaction.','Living OPENARCH requires actual fire-strategy admission; body/window/stack paths must include finite southreceiver.','Principal existing north-head bed still blocks direct northwindow approach: actual private-room replan required.','Principalbath cistern, door handling and whole soil/hot/cold inventory remain explicit joined work.','No outdoor N/independentE topology or new moisture/DPC/soffit detail yet admitted.']
};
function wallRects(walls){const out=[];for(const w of walls){const [x,y]=w.a,[xx,yy]=w.b,h=y===yy,lo=h?x:y,hi=h?xx:yy;const faces=w.finishedFaces??[(h?y:x)-w.t/2,(h?y:x)+w.t/2];const cuts=[...new Set([lo,hi,...w.holes.flat().filter(q=>q>lo&&q<hi)])].sort((a,b)=>a-b);for(let i=1;i<cuts.length;i++){const a=cuts[i-1],b=cuts[i];if(w.holes.some(([l,r])=>a>=l&&b<=r))continue;out.push([w.id,h?[a,faces[0],b-a,faces[1]-faces[0]]:[faces[0],a,faces[1]-faces[0],b-a]])}}return out}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const T=(x,y,s,size=3.1,w='normal')=>`<text x="${x}" y="${y}" font-family="DejaVu Sans,Arial,sans-serif" font-size="${size}" font-weight="${w}" fill="#293a40">${esc(s)}</text>`;
const R=(x,y,w,h,c,stroke='#617069')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="${stroke}" stroke-width=".25"/>`;
const L=(x,y,xx,yy,c='#687777',sw=.5)=>`<path d="M${x} ${y}L${xx} ${yy}" stroke="${c}" stroke-width="${sw}" fill="none"/>`;
const sheet=[];
for(const [column,lev,walls,furniture]of [[0,'GROUND',groundWalls,ground],[1,'FIRST',upperWalls,upper]]){
 const X=x=>20+195*column+x/100,Y=y=>174-y/100;
 sheet.push(T(20+195*column,44,lev+' / ONE CONNECTED CANDIDATE',3.7,'bold'));
 sheet.push(R(X(0),Y(12000),120,120,'#bac2bd'),R(X(417.5),Y(11582.5),111.65,111.65,'#f0eadc'),R(X(3832.5),Y(8167.5),43.35,43.35,'#bac2bd'),R(X(4250),Y(7750),35,35,'#d8eee8'));
 const wallDefs=[['outer-south',true,0,417.5,0,12000],['outer-north',true,11582.5,417.5,0,12000],['outer-west',false,0,417.5,417.5,11582.5],['outer-east',false,11582.5,417.5,417.5,11582.5],['court-south',true,3832.5,417.5,3832.5,8167.5],['court-north',true,7750,417.5,3832.5,8167.5],['court-west',false,3832.5,417.5,4250,7750],['court-east',false,7750,417.5,4250,7750]];
 for(const [name,h,at,t,lo,hi]of wallDefs)for(const o of openings[lev].filter(o=>o.wall===name)){const a=o.centre-o.width/2;sheet.push(h?R(X(a),Y(at+t),o.width/100,t/100,'#f0eadc','none'):R(X(at),Y(a+o.width),t/100,o.width/100,'#f0eadc','none'))}
 if(lev==='GROUND')sheet.push(R(X(4800),Y(12000),24,42.5,'#d8eee8'));
 for(const [,r]of wallRects(walls))sheet.push(R(X(r[0]),Y(r[1]+r[3]),r[2]/100,r[3]/100,'#bac2bd','none'));
 sheet.push(R(X(b.stair[0]),Y(b.stair[1]+b.stair[3]),b.stair[2]/100,b.stair[3]/100,'#cccabb'),R(X(b.void[0]),Y(b.void[1]+b.void[3]),b.void[2]/100,b.void[3]/100,'#fffdf7'));
 for(const [,r]of candidate.fixedObstacles[lev])sheet.push(R(X(r[0]),Y(r[1]+r[3]),r[2]/100,r[3]/100,'#a65f4d'));
 for(const [id,r]of Object.entries(furniture))sheet.push(R(X(r[0]),Y(r[1]+r[3]),r[2]/100,r[3]/100,id.includes('chair')?'#dfb466':id.includes('soil')?'#a4c4c4':'#ded6c4'));
 if(lev==='GROUND')sheet.push(L(X(2902.5),Y(8852.5),X(2902.5),Y(11667.5),'#a95945',.8),T(X(5100),Y(10400),'OPEN',2.6),T(X(5050),Y(9800),'LOGGIA',2.6),T(X(550),Y(8750),'LIVING',2.4),T(X(8950),Y(8800),'KITCHEN / DINING',2));
 else sheet.push(T(X(1200),Y(2100),'SINGLE',2),T(X(10200),Y(2300),'SINGLE',2),T(X(5300),Y(9300),'BED4',2),T(X(9200),Y(9150),'PRINCIPAL',2));
}
const notes=[
 ['507.5 fullweatherwalls, actual140inner axes4377.5 /7622.5.','Principal divider +222.5;170finished reservation replaces245.'],
 ['Two sofas retained; ground readingwall removed → REALbeam needed.','Rear westreturn4450→4377.5; actualsupport/bearing notadopted.'],
 ['Dining moves east; dryprep table deleted; refrigerator moves to eastwall.','Front singles and reduced wardrobe follow compact B.'],
 ['Living3100–4000 OPENARCH preferred; fire strategy stillcontrols.','Principal bath rotatedWC and relocateddoor follow liveMAT work.'],
 ['Paired northwindows3550/8450; kitchen northsills1050.','Both rear beds rotateEW; lowheads and windowoperation required.'],
 ['No underground waterboxes credited as automatic normal/relief route.','No actual service inventory, physical task or certified assembly pass.'],
 ['Provisionalgeometry for STR/MAT/body/door/window tests.','Known failures retained; whole-house selection NOTyet earned.']
];notes.forEach((p,i)=>{sheet.push(T(20,191+i*10,p[0],2.85),T(215,191+i*10,p[1],2.85))});
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" role="img" aria-label="First whole-house open north loggia candidate"><rect width="420" height="297" fill="#fffdf7"/>${T(15,17,'OPEN NORTH LOGGIA / ONE WHOLE-HOUSE CANDIDATE',5,'bold')}${T(15,26,'Source B + explicit room/weather/opening rewinds / 1:100 plans / first joined testing checkpoint',2.9)}${L(15,32,405,32)}${sheet.join('')}${L(15,273,405,273)}${T(15,284,'UNADOPTED reference design. Known room/support/route/weather/water failures remain, not released for construction.',2.8)}${T(15,291,'HAD03 convergence / startingmain6a953ef6 / explicit assumptions / 1 November2026',2.8)}</svg>\n`;
for(const [name,body]of Object.entries({'open-north-loggia.json':JSON.stringify(candidate,null,2)+'\n','open-north-loggia.svg':svg})){const p=new URL(name,OUT);if(process.argv.includes('--check')){if(readFileSync(p,'utf8')!==body)throw Error('Stale '+name)}else writeFileSync(p,body)}
console.log(JSON.stringify({files:['open-north-loggia.json','open-north-loggia.svg'],status:'first candidate, not adopted',weatherAxes:[4377.5,7622.5],knownInterfaces:candidate.knownInterfaces.length}));
