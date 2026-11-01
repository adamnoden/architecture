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
const wetSpine=upperWalls.find(w=>w.id==='wet-spine');wetSpine.b[1]=6500;wetSpine.t=170;wetSpine.finishedFaces=[9215,9385];wetSpine.structuralCore=[9230,9370];upperWalls.push({id:'wet-spine-principal',a:[9300,6500],b:[9300,8290],t:185,holes:[],finishedFaces:[9215,9400],structuralCore:[9230,9370]});
const bathNorth=upperWalls.find(w=>w.id==='bath-north');bathNorth.t=185;bathNorth.finishedFaces=[6415,6600];bathNorth.structuralCore=[6430,6570];
const rearEast=upperWalls.find(w=>w.id==='rear-east');rearEast.t=245;rearEast.a[0]=7552.5;rearEast.b[0]=9300;groundWalls.find(w=>w.id==='rear-east').a[0]=7552.5;rearEast.holes=[[8250,9150]];rearEast.finishedFaces=[8167.5,8412.5];rearEast.structuralCore=[8182.5,8397.5];upperWalls.push({id:'rear-east-principal',a:[9300,8290],b:[12000,8290],t:260,holes:[[9900,10800]],finishedFaces:[8152.5,8412.5],structuralCore:[8182.5,8397.5]});
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
 'family-sofa1900x750':[3425,9650,750,1900],
 'reading-side-table300':[1800,10650,300,300],'family-side-table300':[3000,9700,300,300],
 'dining-table1200x800':[8500,9050,800,1200],
 'dining-chair-west-south':[8000,9100,500,500],'dining-chair-west-north':[8000,9700,500,500],
 'dining-chair-east-south':[9300,9100,500,500],'dining-chair-east-north':[9300,9700,500,500],
 'cold-storage':[10932.5,9025,650,650]
});
delete ground['dry-prep-table'];
groundWalls.push({id:'protected-stair-east',a:[2882.5,4185],b:[2882.5,8937.5],t:130,holes:[],finishedFaces:[2817.5,2947.5],structuralCore:[2832.5,2932.5]},{id:'protected-west-cross',a:[2817.5,4250],b:[3832.5,4250],t:130,holes:[[2947.5,3832.5]]},{id:'protected-east-cross',a:[8012.5,4250],b:[9370,4250],t:130,holes:[[8241.25,9141.25]]});
const openingRewinds=[
 {level:'GROUND/FIRST',wall:'outer-north',fromCentre:3900,toCentre:3550,width:1000,reason:'Actual room/weatherwall and north pier width'},
 {level:'GROUND/FIRST',wall:'outer-north',fromCentre:8100,toCentre:8450,width:1000,reason:'Paired north facade re-composition'},
 {level:'GROUND',wall:'outer-north',centres:[8450,10200],sill:1050,head:2850,reason:'900high solid-pier kitchen stations may now overlap the adjustedwindow projection without crossing750sill'},
 {level:'GROUND',wall:'outer-west',centre:7400,sill:1750,head:2850,reason:'STR finite midlanding beam sits below raised sill; actual daylight/privacy price.'},
 {level:'FIRST',wall:'outer-east',centre:7400,head:2850,fixedTransomTopBand:100,openingLeafHeadMaximum:2750,reason:'Principal bath extract pod underside2800; retain50 vertical operation separation.'},
 {level:'GROUND',wall:'court-west',centre:4600,sill:750,head:2750,spring:2450,reason:'STR actual stairheader bearing requires both inner/weather arches100 lower; frame must follow.'},
 {level:'GROUND',wall:'court-north',id:'grand-court-entry-north',kind:'open-loggia',width:2400,reason:'Outdoor through-route, no door leaves'},
 {level:'GROUND',wall:'outer-north',id:'garden-entry',kind:'open-loggia',width:2400,reason:'Outdoor through-route, no door leaves'},
 {level:'GROUND',wall:'study-L-north',interval:[1350,2250],hinge:[1385,3247.5],operation:'INWARD SOUTH into Study, not protected landing',reason:'Selected protected-boundary door role; keeps landing clear throughout swing. Actual installed assembly unqualified.'},
 {level:'GROUND',wall:'rear-east',interval:[8250,9150],operation:'OPEN ARCH preferred',reason:'Shared kitchen has no necessary privacy leaf; avoid chair/leaf collision. Protected cross-door at4250 isolates fire area.'},
 {level:'FIRST',wall:'court-north',id:'court-north-1',centre:6700,width:1000,reason:'Retain compact B explicit150westward opening rewind'},
 {level:'GROUND',wall:'rear-west',interval:[3100,4000],hinge:[3100,8852.5],operation:'OPEN ARCH preferred; no leaf',reason:'Omit shared-living acoustic/privacy closure; BCR005/ERFIRE01 must admit actual escape/compartment strategy. Not a private-door exemption.'}
];
const openings={};for(const level of ['GROUND','FIRST'])openings[level]=revisionOpenings(level).filter(o=>/^(outer|court)-/.test(o.wall)).map(o=>({...o,centre:o.wall==='outer-north'&&o.centre===3900?3550:o.wall==='outer-north'&&o.centre===8100?8450:level==='FIRST'&&o.id==='court-north-1'?6700:o.centre,...(level==='GROUND'&&['grand-court-entry-north','garden-entry'].includes(o.id)?{kind:'open-loggia',width:2960,finishedWidth:2400}:{}),...(level==='GROUND'&&o.id==='grand-court-entry-south'?{width:1800}:{}),...(level==='GROUND'&&o.wall==='court-west'&&o.centre===4600?{head:2750,spring:2450}:{}),...(level==='GROUND'&&o.wall==='outer-west'&&o.centre===7400?{sill:1750}:{}),...(level==='FIRST'&&o.wall==='outer-east'&&o.centre===7400?{fixedTransomTopBand:100,openingLeafHeadMaximum:2750}:{})}));
const rawArchRadius=(2960**2/(8*600))+600/2,rawArchCentre=2250+600-rawArchRadius,finishedArchRadius=rawArchRadius-280;
const insulatedPortal={rawSpan:2960,rawSpring:2250,rawRise:600,rawCrown:2850,rawRadius:rawArchRadius,centreZ:rawArchCentre,ring:215,radialWrap:280,finishedRadius:finishedArchRadius,finishedWidthAtVerticalJambs:2400,finishedJambSpring:rawArchCentre+Math.sqrt(finishedArchRadius**2-1200**2),finishedCrown:2570,finishedWidthAt2250:2*Math.sqrt(finishedArchRadius**2-(2250-rawArchCentre)**2),coreAxial:140,faceWrapEach:280,finishedAxial:700,courtFaces:[7732.5,8432.5],gardenFaces:[11317.5,12017.5],localExternalProjectionBeyond12000:17.5,scope:'Single development candidate; 2400 is vertical-jamb width to2126.54, not a2400rectangle to2850. Locally replaces weatherbrick arch/cavity with rendered wrapped140core. Structural thrust/tie/pier/bearing and actual thermal/fire/weather junction unearned.'};
const candidate={
 status:'FIRST WHOLE-HOUSE CANDIDATE, NOT ADOPTED. Known failures/interfaces are explicit; no support/water/material/site acceptance.',startingMain:'6a953ef6d3131364aca740eaff2a06f301adbc2e',base:{path:basePath,sha256:sha},
 shell:12000,insulatedPortal,court:[4250,4250,3500,3500],envelope:417.5,loggia,weather,groundWalls,upperWalls,openingRewinds,openings,groundFurniture:ground,upperFurniture:upper,stair:b.stair,void:b.void,
 fixedObstacles:{GROUND:[['wetBeamSouthReceiver',[2817.5,8687.5,170,330]],['wetBeamNorthReceiver',[2817.5,11502.5,170,330]],['stairMidPostFinished',[2817.5,7117.5,265,280]]],FIRST:[['principalEastExtraWetLining',[11567.5,6600,15,1552.5]],['stairMidPostFinished',[2817.5,7117.5,265,280]]]},structuralChanges:{stairMidPost:{concrete:[2817.5,7132.5,250,250],eastRoomFinish:15,eastFinishedFace:3082.5,courtWestFace:3832.5,grossGalleryClear:750,scope:'ActualSTRnewpostoutside1100flight; body/window/guard/escape testrequired.'},upperFloor:'Continuous RC200 trial, not adopted. Ordinary short spans/support schedule owned by STR.',upperRearDivider:{from:7400,to:7622.5,finished:170,core:140},upperRearWestReturn:{from:4450,to:4377.5,finished:170,core:140},newWetWallBeam:{axisX:2902.5,supportAxesY:[8852.5,11667.5],span:2815,reason:'Ground reading partition removed; actualupperwetwall needs a finite separate beam/support, no unproved slab line-load spreading.',southDoorEdge:3100,northWindowStart:3050,beamTop:3370,beamBottom:3020,finishedGroundSoffit:3005,southReceiverFinished:[2817.5,8687.5,170,330],northReceiverFinished:[2817.5,11502.5,170,330]},exposedSoffit:'Actual thermal/fire/weather package below upper floor over loggia unqualified.'},
 rooms:{living:{bounds:[417.5,8937.5,3875,2645],twoSofas:true,groundReadingWallRemoved:true,sofaFaces:['EAST','WEST'],scope:'Open arch loses acoustic/privacy closure; full body/window/stack/receiver/fire tests required before selection.'},kitchenDining:{bounds:[7707.5,8412.5,3875,3170],fourPlaces:true,northWorkingGap:732.5,southEntryGap:637.5,fridgeToEastWindowProjectionGap:25,trade:'Separate dryprep table deleted; dining table has separate meal/prep states.'},principalBath:{northFinishedFace:8152.5,westFinishedFace:9400,southFinishedFace:6600,door:[9900,10800],WC:'SOUTH-facing355x560 with north180serviceband/cistern; actual product and operation owned by MATINTERIORS',soilColumnCentre:[11432.5,8040],eastFinishedFace:11567.5,scope:'Live MATINTERIORS constructivegeometry; exactselectedproduct/frame/servicebranch still tojoin.'}},
 water:{normal:'Outdoor west-edge copper channel; exact width/fall/inlet/receiver awaitingjoinedMATspatialselection.',relief:'Independent E or separately visible passive overland route must be drawn with blockedN/high-tailwater/common-obstruction states. No independentpair acceptance from two loggia strips.',oldD1300:'Retained cost benchmark only; deleting waterboxes does not adopt grade150 or prove a shallower ground-support section.'},
 furnitureRequirements:{principalBed:{whole:[9492.5,9175,2090,1600],body:upper.principal,head:upper['principal-head'],maxHeadHeight:700,maxBedMattressTop:600,minCill:750,verticalReserve:50,windowOperation:'Compatible leaf/frame lower envelope staysat/above750; actualOASfamily/3Doperation not yet matched.',southPassageFromActualLeaf8474:701,declaredCombinedPositionLoss:50,bodyDiameter:600,remainingPassageAfterLoss:651,maintenance:{translation:[0,500],whole:[9492.5,9675,2090,1600],swept:[9492.5,9175,2090,2100],trayStage:[10275,8540,250,900],handlingPad:100,nominalStageGap:235,after100Pad:135,windowTasks:'Unavailable during bedroom maintenance; restore ordinary state.'}},bed4:{whole:[5447.5,9350,2090,1500],maxHeadHeight:700,westFootGap:947.5,northWindowClear:732.5,rearR01PanStageWithPad:[3700,10522.5,760,555],noR01Conflict:true}},sections:{groundFFL:0,firstFFL:3450,atticDatum:6900,groundFloorRC:{top:-180,bottom:-380},firstFloorRC:{top:3370,bottom:3170},loggiaSoffit:{insulation:240,railLathTerritory:15,mineralProtection:25,underside:2890,scope:'MAT provisional exact recipe; arch/head thermal interface notyet admitted.'},groundSupport:{grid:[600,450],top:-180,bottom:-630,integralNode:[600,600,450],lowTies:[250,200],lowTieTop:-550,lowestNodeTie:-750,heaveStress:300,constructionLoss:50,ventilationReserve:150,Drequired:1250,Dtrial:1300,Dsurplus:50,scope:'STR reference capacity/actualventilation/site condition unqualified. D1300 is solum/grade trial, not sitefact.'},waterLevels:{southLandingStart:0,landingRun:1500,landingDrop:30,courtNorth:-110,courtRun:3500,loggiaNorth:-152.5,loggiaRun:4250,scope:'MAT constructiveONEproposal; structure/slopes/receivers/firstharm need joined check.'},fireHeight:{firstAboveAuthoredExterior:4750,lowRiseComparison:4500,scope:'D1300 crossesADBupperfloor4.5m groundheight boundary; actualadjacentground/storey interpretation/strategy required. Solum andexternalground notinterchangeable.'}},knownInterfaces:['Ground NSbeam under upper rearwetwall must earn bearings/arch interaction.','Protected-route topology is authored; classified walls/doors/glazing/joints and real site/fire admission remain unearned. Living open arch is outside protected volume.','Principal low-bed/window compatibility is an explicit procurement requirement; leaf/frame lower envelope and actual installed operation remain unproved.','Principalbath cistern, door handling and whole soil/hot/cold inventory remain explicit joined work.','No outdoor N/independentE topology or new moisture/DPC/soffit detail yet admitted.']
};
candidate.southCourtWeatherDoor={rough:[5100,6900],frameDepth:[4110,4250],jambEach:50,hinges:[[5150,4250],[6850,4250]],leafEach:[845.5,44,2100],leafBottom:19,leafTop:2119,gaps:{left:3,meeting:3,right:3},transom:[2119,2189],fanlightFrom:2189,arch:{span:1800,spring:2550,crown:2850,scope:'Explicit authored reference, actual OAS profile/product junction must qualify.'},grossSweepReservation:850,openLeafNorthTip:5100,landingNorthEnd:5750,clearBeyondOpenTip:650,scope:'Outward NORTH;1500full exterior landing. Actual timber/hinge/bracket/weather/leak/firstharm remains with joined MAT/OAS.'};
candidate.protectedRoute={
 basis:'One conventional reference topology under currentADB2.5a; no regulatory approval or classified assembly claimed.',official:'https://assets.publishing.service.gov.uk/media/6aa3bb335f6e942efe37f150/AD_B1_2026.pdf',edition:'2019+2020/2022/2025/2026;2029futureprovisionsnotclaimedcurrent',measurement:'D6 lowest SIDE outsideground, notsolum;4750onlyifactualoutside−1300.',
 geometry:{groundStairEastWall:{finished:[2817.5,4185,130,4752.5],core:[2832.5,4185,100,4752.5],scope:'Nonloadbearing100core+15each; whollyoutside1100flight. Bonds to4250return/rearwall, noSouthlandingcutoff.'},groundProtected:'Stair+Southlanding/gallery+frontentrance/void→FRONTfinalexit; living/kitchen north of crossdoors excluded.',upperProtected:'Whole gallery/landing and stair are one protected volume; no added fullheight stairEwall or room-to-room shortcut.',roof:'Actualcontinuousroof/ceilingclosureandcavitybarriersrequired;15skin alone notEI30.',courtyardGlazing:'Actualcourtexposure/protectedboundaryglazingmustpreserveapplicablefirestrategy; ordinaryglassnotassumedadequate; no flats-onlyruleapplied.'},
 rectangularAssemblyHeightMaximum:2250,upperClosure:'Independent classified closure between rectangular assembly and actual masonry arch/ceiling.2850openinghead is notleafheight.',
 doors:[
  {id:'FD-WEST-CROSS',level:'GROUND',host:'protected-west-cross',rough:[2947.5,3832.5],axis:4250,frameEach:25,leaf:[830,44],hinge:[3802.5,4250],opening:'NORTHintoexcludedgallery',closed:[2972.5,4228,830,44],open:[3780.5,4250,44,830],minimumClearBudget:791,performance:'E20minimumreference;classifiedfullassembly/actualgaprequired'},
  {id:'FD-EAST-CROSS',level:'GROUND',host:'protected-east-cross',rough:[8241.25,9141.25],axis:4250,frameEach:25,leaf:[845,44],hinge:[9111.25,4250],opening:'NORTHintoexcludedgallery',closed:[8266.25,4228,845,44],open:[9089.25,4250,44,845],minimumClearBudget:806,performance:'E20minimumreference;classifiedfullassemblyrequired'},
  {id:'STUDY',level:'GROUND',host:'study-L-north',rough:[1350,2250],axis:3247.5,frameEach:25,leaf:[830,44],hinge:[1385,3247.5],opening:'SOUTHINTOSTUDY',performance:'ProtectedhallboundaryE20reference, notordinaryratedclaim'},
  {id:'GUEST-WC',level:'GROUND',host:'wc-north',rough:[7650,8550],axis:2650,performance:'Protectedhallboundarydoor;actualbathroom/firestrategyexceptionnotassumed'},
  {id:'PLANT',level:'GROUND',host:'service-spine',rough:[2750,3650],axis:9300,performance:'Protectedhallboundarydoor;plantactualhazard/requiredratingtoconfirm'},
  ...[['BED2','bed2-north-main',[3450,4350],2650],['BED3','bed3-north-main',[8250,9150],2650],['BED4','rear-west',[3100,4000],8852.5],['PRINCIPAL','rear-east',[8250,9150],8290]].map(([id,host,rough,axis])=>({id,level:'FIRST',host,rough,axis,performance:'E20minimumreference;privateclosurepreserved, actualclassifieddoorset/operationrequired'})),
  {id:'FAMILY-BATH',level:'FIRST',host:'wet-spine',rough:[5450,6350],axis:9300,performance:'Actualprotectedboundarybathroomroletoqualify; inside-slideroperationisnotfirerating'},
 ],internalClosers:'Notautomaticallyrequiredsolelywithindwellinghouse(currentAppendixC5). Noarbitrarycloserremovedfromactuallyclassifiedassembly.',smokeVentTransfer:'Sa/smokegapand7600mm2venttransfermustmatchactualclassifieddoorset; no10mmundercutassumedapproved.',livingArch:{rough:[3100,4000],axis:8852.5,scope:'Outsideprotectedstair/hall; losesacoustic/privacyclosure. Truearch/beamreceiverloadpathwithSTR.'},kitchenArch:{rough:[8250,9150],axis:8290,scope:'OutsideprotectedSouthhall; no shared-room leaf, actualstructuralarchwithSTR.'}
};
function wallRects(walls){const out=[];for(const w of walls){const [x,y]=w.a,[xx,yy]=w.b,h=y===yy,lo=h?x:y,hi=h?xx:yy;const faces=w.finishedFaces??[(h?y:x)-w.t/2,(h?y:x)+w.t/2];const cuts=[...new Set([lo,hi,...w.holes.flat().filter(q=>q>lo&&q<hi)])].sort((a,b)=>a-b);for(let i=1;i<cuts.length;i++){const a=cuts[i-1],b=cuts[i];if(w.holes.some(([l,r])=>a>=l&&b<=r))continue;out.push([w.id,h?[a,faces[0],b-a,faces[1]-faces[0]]:[faces[0],a,faces[1]-faces[0],b-a]])}}return out}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
// Finite plan witnesses. Exact segment/AABB distances; these do not certify human use.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const pd=(p,r)=>Math.hypot(p[0]-clamp(p[0],r[0],r[0]+r[2]),p[1]-clamp(p[1],r[1],r[1]+r[3]));
function ps(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)}
function cross(a,b,c){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])}
function sd(a,b,c,d){const ca=cross(a,b,c),cb=cross(a,b,d),cc=cross(c,d,a),cd=cross(c,d,b);if(ca*cb<0&&cc*cd<0)return 0;return Math.min(ps(a,c,d),ps(b,c,d),ps(c,a,b),ps(d,a,b))}
function sr(a,b,r){if(pd(a,r)===0||pd(b,r)===0)return 0;const [x,y,w,h]=r,cs=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];return Math.min(...cs.map((p,i)=>sd(a,b,p,cs[(i+1)%4])))}
const outerDefs=[['outer-south',[0,208.75],[12000,208.75]],['outer-north',[0,11791.25],[12000,11791.25]],['outer-west',[208.75,417.5],[208.75,11582.5]],['outer-east',[11791.25,417.5],[11791.25,11582.5]],['court-south',[3832.5,4041.25],[8167.5,4041.25]],['court-north',[3832.5,7958.75],[8167.5,7958.75]],['court-west',[4041.25,4250],[4041.25,7750]],['court-east',[7958.75,4250],[7958.75,7750]]];
const bedroomLeaves=[['bed4-entry-open',[3078,8852.5,44,900]],['principal-entry-open',[8228,8290,44,900]]];
function obstacles(level,{closedCross=false,omit=[]}={}){
 const walls=level==='GROUND'?groundWalls:upperWalls;
 const enclosure=outerDefs.map(([id,a,b])=>({id,a,b,t:417.5,holes:openings[level].filter(o=>o.wall===id&&['door','open-loggia'].includes(o.kind)).map(o=>[o.centre-o.width/2,o.centre+o.width/2])}));
 const r=[...wallRects([...walls,...enclosure]),...candidate.fixedObstacles[level],...Object.entries(level==='GROUND'?ground:upper),['stair-plan-void',b.stair],['court-outdoor-not-indoor-shortcut',[4250,4250,3500,3500]]];
 if(level==='FIRST')r.push(['entrance-floor-void',b.void],...bedroomLeaves,['principal-bath-slider-closed',[9875,8430,950,44]]);
 else r.push(['pantry-open-leaf',[10428,7390,44,900]],...candidate.protectedRoute.doors.filter(d=>d.id.startsWith('FD-')).map(d=>[d.id,closedCross?d.closed:d.open]));
 return r.filter(([id])=>!omit.includes(id));
}
const witnesses=[];
function route(id,level,points,opts={}){const obs=obstacles(level,opts);let min=Infinity,at=null;for(let i=0;i<points.length;i++)for(const [name,r]of obs){const gap=sr(points[i],points[Math.min(i+1,points.length-1)],r)-300;if(gap<min){min=gap;at={obstacle:name,segment:i}}}const result={id,level,bodyRadius:300,points,state:opts.closedCross?'cross fire doors CLOSED':'cross fire doors OPEN; private entry leaves OPEN; principal bath slider CLOSED',minimumReserve:min,controlling:at,pass:min>=-1e-7};witnesses.push(result);return result}
route('protected-stair-bottom-to-front','GROUND',[[967.5,4100],[967.5,3782.5],[3200,3782.5],[3200,3500],[6000,3500],[6000,417.5]],{closedCross:true});
route('daily-living-to-kitchen','GROUND',[[2500,9350],[3150,9350],[3150,9325],[3450,9325],[3450,3782.5],[3450,3500],[8700,3500],[8700,8725]]);
route('living-seating-rear-stack','GROUND',[[3450,8500],[3450,9325],[3150,9325],[3150,9350],[2500,9350],[2500,11266.25],[1100,11266.25],[1100,11200]]);
route('living-north-window1800','GROUND',[[2500,9350],[2500,11250],[2525,11250]]);
route('living-north-window3550','GROUND',[[2500,11266.25],[2500,11190],[3100,11190]]);
route('kitchen-entry-to-working-aisle','GROUND',[[8700,8725],[10200,8725],[10200,10616.25],[8350,10616.25],[8350,11250]]);
route('kitchen-north-window10200','GROUND',[[10200,8725],[10200,11250]]);
route('kitchen-pantry-open-door-approach','GROUND',[[10200,8725],[10800,8725],[10800,7900]],{omit:[]});
route('principal-to-protected-stair','FIRST',[[8700,8725],[8700,3500],[3450,3500],[3450,4100],[2267.5,4100]]);
route('bed4-to-protected-stair','FIRST',[[3550,9300],[3550,8500],[3450,8500],[3450,4100],[2267.5,4100]]);
route('principal-ordinary-entry-bath','FIRST',[[8700,8725],[8700,8824.5],[10400,8824.5],[10400,8850]]);
route('principal-wardrobe-foot-north-windows','FIRST',[[8700,8824.5],[8700,10000],[9000,10000],[9000,11250],[10200,11250],[11262.5,11100]]);
route('bed4-entry-foot-north','FIRST',[[3550,8500],[3550,9300],[4875,9300],[4875,10100],[5100,10100],[5100,11250],[3550,11250],[6000,11250]]);
route('bed4-wardrobe-operation','FIRST',[[3550,9300],[3750,9480]]);
route('bed4-rear-ensuite-door-approach','FIRST',[[5100,11250],[5100,10800],[3350,10800]]);
route('study-closed-door-window-tasks','GROUND',[[1800,2800],[2400,2800],[2400,2250],[3000,2250],[3000,740],[3900,740],[2525,740]]);
route('study-west-window-closed-door','GROUND',[[1800,2800],[740,2800],[740,2650]]);
// Check the complete bed translation and handling pad, rather than just end positions.
const maintenance=candidate.furnitureRequirements.principalBed.maintenance;
const maintObs=obstacles('FIRST',{omit:['principal','principal-head']});
const rectGap=(a,b)=>Math.hypot(Math.max(a[0]-b[0]-b[2],b[0]-a[0]-a[2],0),Math.max(a[1]-b[1]-b[3],b[1]-a[1]-a[3],0));
const overlap=(a,b)=>a[0]<b[0]+b[2]&&a[0]+a[2]>b[0]&&a[1]<b[1]+b[3]&&a[1]+a[3]>b[1];
maintenance.sweptConflicts=maintObs.filter(([,r])=>overlap(maintenance.swept,r)).map(([id])=>id);
maintenance.pass=maintenance.sweptConflicts.length===0;
maintenance.paddedStage=maintenance.trayStage.map((v,i)=>i<2?v-100:v+200);
maintenance.stageToTemporaryBedGap=rectGap(maintenance.paddedStage,maintenance.whole);
// Source-derived dimensions govern the selection, not an all-purpose body acceptance claim.
candidate.actions={method:'Exact Euclidean segment-to-closed-rectangle clearance with a300radius horizontal body proxy. Furniture and finished wall/receiver/post rectangles are obstacles. Every segment tested analytically; no sampling gaps. Not an actual-human, door-force, accessible-route or 3D/headroom admission.',witnesses,pass:witnesses.every(w=>w.pass)&&maintenance.pass,notTransferred:['Front-single detailed coupled door/window proofs retain their dated B source identities; actual fire doorset still unselected.','Pantry shelf working state needs door CLOSED; not simultaneous with open-leaf transport.','Principal and rear wetroom internal tasks use separately merged MAT witnesses; this plan only binds entries, staging and furniture sweep.','Study inside rehand has its separate bounded coupled witness. New cross-door operation still needs finite coupled test; proxy routes alone are insufficient.']};
const studyKnots=[[0,2400,2800],[15,2400,2600],[30,2400,2400],[45,2350,2350],[60,2150,2625],[90,1780,2625]];
function studyBody(a){const k=studyKnots.findIndex((p,i)=>i<studyKnots.length-1&&a>=p[0]&&a<=studyKnots[i+1][0]);const p=studyKnots[Math.max(0,k)],q=studyKnots[Math.max(0,k)+1],t=(a-p[0])/(q[0]-p[0]);return[p[1]+t*(q[1]-p[1]),p[2]+t*(q[2]-p[2])]}
const studyStatic=[...obstacles('GROUND'),['study-frame-low',[1350,3162.5,25,170]],['study-frame-high',[2225,3162.5,25,170]]];let bodyMin=Infinity,armMin=Infinity,reachMax=0,bodyAt,armAt;
for(let k=0;k<=900;k++){
 const a=k/10,t=a*Math.PI/180,u=[Math.cos(t),-Math.sin(t)],n=[-Math.sin(t),-Math.cos(t)],hinge=[1385,3247.5],tip=[1385+830*u[0],3247.5+830*u[1]],body=studyBody(a);
 for(const [id,r]of studyStatic){const d=pd(body,r)-300;if(d<bodyMin){bodyMin=d;bodyAt={angle:a,obstacle:id}}}
 const ownBody=ps(body,hinge,tip)-322;if(ownBody<bodyMin){bodyMin=ownBody;bodyAt={angle:a,obstacle:'moving-study-leaf'}}
 for(const sign of a===45?[1,-1]:[a<45?1:-1]){
  const grip=[hinge[0]+780*u[0]+84*sign*n[0],hinge[1]+780*u[1]+84*sign*n[1]];reachMax=Math.max(reachMax,Math.hypot(body[0]-grip[0],body[1]-grip[1]));
  for(const[id,r]of studyStatic){const d=sr(body,grip,r)-40;if(d<armMin){armMin=d;armAt={angle:a,obstacle:id}}}
  const ownArm=sd(body,grip,hinge,tip)-62;if(ownArm<armMin){armMin=ownArm;armAt={angle:a,obstacle:'moving-study-leaf'}}
 }
}
// Bounds per degree: body <=29.35; leaf/grip <=16.40; half the0.1deg step.
const bodySamplingBound=(29.35+15.71)*.05,armSamplingBound=(29.35+16.40+15.71)*.05,reachSamplingBound=(29.35+16.40)*.05;
candidate.studyDoorOperation={rough:[1350,2250],frameEach:25,leafEdgeGapEach:10,hinge:[1385,3247.5],leaf:[830,44],minimumClearBudget:786,bodyRadius:300,forearmRadius:40,handleAlong:780,handleFaceOffset:84,bodyKnots:studyKnots,handleState:'Southface0–45deg; explicit two-hand handover at45; oppositeface45–90.',stepDegrees:.1,sampledBodyReserve:bodyMin,sampledArmReserve:armMin,sampledReach:reachMax,continuousBodyLowerBound:bodyMin-bodySamplingBound,continuousArmLowerBound:armMin-armSamplingBound,continuousReachUpperBound:reachMax+reachSamplingBound,bodyAt,armAt,pass:bodyMin>bodySamplingBound&&armMin>armSamplingBound&&reachMax+reachSamplingBound<=600,scope:'One geometric inside close/reopen sequence from leaf-open entry, not actual operator strength, hardware, classified frame or outside first-opening admission. Both hands have reachable collision-free paths at45; no teleporting hand throughleaf.'};
candidate.actions.pass&&=candidate.studyDoorOperation.pass;
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
 sheet.push(R(X(b.stair[0]),Y(b.stair[1]+b.stair[3]),b.stair[2]/100,b.stair[3]/100,'#cccabb'),R(X(b.void[0]),Y(b.void[1]+b.void[3]),b.void[2]/100,b.void[3]/100,lev==='GROUND'?'#eadfc8':'#fffdf7'));
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
if(process.argv.includes('--require-spatial-pass')&&!candidate.actions.pass)throw Error('Finite spatial witness failed');
console.log(JSON.stringify({files:['open-north-loggia.json','open-north-loggia.svg'],status:'first candidate, not adopted',weatherAxes:[4377.5,7622.5],knownInterfaces:candidate.knownInterfaces.length}));
