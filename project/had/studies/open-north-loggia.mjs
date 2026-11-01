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
 'principal-wardrobe':[7737.5,9300,660,1500],'principal':[9462.5,9175,2000,1600],'principal-head':[11462.5,9175,90,1600],'bed4':[5417.5,9350,2000,1500],'bed4-head':[7417.5,9350,90,1500],
 'principal-shower900':[9400,6600,900,900],'principal-basin':[9400,7600,340,450],
 'principal-WC':[10972.5,7412.5,355,560],
 'principal-local-soil-column':[11342.5,7950,180,180],'bed4-island-wardrobe':[3030,9800,1500,660]
});
Object.assign(ground,{
 'reading-sofa1900x850':[800,8975,850,1900],
 'family-sofa1900x750':[3415,9650,750,1900],
 'reading-side-table300':[1800,10600,300,300],'family-side-table300':[3000,9700,300,300],
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
 {level:'GROUND',wall:'outer-west',centre:4600,sill:750,head:2750,spring:2450,reason:'STR actual stairheader bearing requires both inner/weather arches100 lower; frame must follow.'},
 {level:'GROUND',wall:'court-north',id:'grand-court-entry-north',kind:'open-loggia',width:2400,reason:'Outdoor through-route, no door leaves'},
 {level:'GROUND',wall:'outer-north',id:'garden-entry',kind:'open-loggia',width:2400,reason:'Outdoor through-route, no door leaves'},
 {level:'GROUND',wall:'study-L-north',interval:[1350,2250],hinge:[1385,3247.5],operation:'INWARD SOUTH into Study, not protected landing',reason:'Selected protected-boundary door role; keeps landing clear throughout swing. Actual installed assembly unqualified.'},
 {level:'GROUND',wall:'rear-east',interval:[8250,9150],operation:'OPEN ARCH preferred',reason:'Shared kitchen has no necessary privacy leaf; avoid chair/leaf collision. Protected cross-door at4250 isolates fire area.'},
 {level:'FIRST',wall:'court-north',id:'court-north-1',centre:6700,width:1000,reason:'Retain compact B explicit150westward opening rewind'},
 {level:'GROUND',wall:'rear-west',interval:[3100,4000],hinge:[3100,8852.5],operation:'OPEN ARCH preferred; no leaf',reason:'Omit shared-living acoustic/privacy closure; BCR005/ERFIRE01 must admit actual escape/compartment strategy. Not a private-door exemption.'}
];
const openings={};for(const level of ['GROUND','FIRST'])openings[level]=revisionOpenings(level).filter(o=>/^(outer|court)-/.test(o.wall)).map(o=>({...o,centre:o.wall==='outer-north'&&o.centre===3900?3550:o.wall==='outer-north'&&o.centre===8100?8450:level==='FIRST'&&o.id==='court-north-1'?6700:o.centre,...(level==='GROUND'&&['grand-court-entry-north','garden-entry'].includes(o.id)?{kind:'open-loggia',width:2960,finishedWidth:2400}:{}),...(level==='GROUND'&&o.id==='grand-court-entry-south'?{width:1800}:{}),...(level==='GROUND'&&o.wall==='outer-west'&&o.centre===4600?{head:2750,spring:2450}:{}),...(level==='GROUND'&&o.wall==='outer-west'&&o.centre===7400?{sill:1750}:{}),...(level==='FIRST'&&o.wall==='outer-east'&&o.centre===7400?{fixedTransomTopBand:100,openingLeafHeadMaximum:2750}:{})}));
const rawArchRadius=(2960**2/(8*600))+600/2,rawArchCentre=2250+600-rawArchRadius,finishedArchRadius=rawArchRadius-280;
const insulatedPortal={rawSpan:2960,rawSpring:2250,rawRise:600,rawCrown:2850,rawRadius:rawArchRadius,centreZ:rawArchCentre,ring:215,radialWrap:280,finishedRadius:finishedArchRadius,finishedWidthAtVerticalJambs:2400,finishedJambSpring:rawArchCentre+Math.sqrt(finishedArchRadius**2-1200**2),finishedCrown:2570,finishedWidthAt2250:2*Math.sqrt(finishedArchRadius**2-(2250-rawArchCentre)**2),coreAxial:140,faceWrapEach:280,finishedAxial:700,courtFaces:[7732.5,8432.5],gardenFaces:[11317.5,12017.5],localExternalProjectionBeyond12000:17.5,scope:'Single development candidate; 2400 is vertical-jamb width to2126.54, not a2400rectangle to2850. Locally replaces weatherbrick arch/cavity with rendered wrapped140core. Structural thrust/tie/pier/bearing and actual thermal/fire/weather junction unearned.'};
const candidate={
 status:'FIRST WHOLE-HOUSE CANDIDATE, NOT ADOPTED. Known failures/interfaces are explicit; no support/water/material/site acceptance.',startingMain:'6a953ef6d3131364aca740eaff2a06f301adbc2e',base:{path:basePath,sha256:sha},
 shell:12000,insulatedPortal,court:[4250,4250,3500,3500],envelope:417.5,loggia,weather,groundWalls,upperWalls,openingRewinds,openings,groundFurniture:ground,upperFurniture:upper,stair:b.stair,void:b.void,
 fixedObstacles:{GROUND:[['wetBeamSouthReceiver',[2817.5,8687.5,170,330]],['wetBeamNorthReceiver',[2817.5,11502.5,170,330]],['stairMidPostFinished',[2817.5,7117.5,265,280]]],FIRST:[['principalEastExtraWetLining',[11567.5,6600,15,1552.5]]]},structuralChanges:{stairMidPost:{concrete:[2817.5,7132.5,250,250],eastRoomFinish:15,eastFinishedFace:3082.5,courtWestFace:3832.5,grossGalleryClear:750,scope:'ActualSTRnewpostoutside1100flight; body/window/guard/escape testrequired.'},upperFloor:'Continuous RC200 trial, not adopted. Ordinary short spans/support schedule owned by STR.',upperRearDivider:{from:7400,to:7622.5,finished:170,core:140},upperRearWestReturn:{from:4450,to:4377.5,finished:170,core:140},newWetWallBeam:{axisX:2902.5,supportAxesY:[8852.5,11667.5],span:2815,reason:'Ground reading partition removed; actualupperwetwall needs a finite separate beam/support, no unproved slab line-load spreading.',southDoorEdge:3100,northWindowStart:3050,beamTop:3370,beamBottom:3020,finishedGroundSoffit:3005,southReceiverFinished:[2817.5,8687.5,170,330],northReceiverFinished:[2817.5,11502.5,170,330]},exposedSoffit:'Actual thermal/fire/weather package below upper floor over loggia unqualified.'},
 rooms:{living:{bounds:[417.5,8937.5,3875,2645],twoSofas:true,groundReadingWallRemoved:true,sofaFaces:['EAST','SOUTH'],scope:'Open arch loses acoustic/privacy closure; full body/window/stack/receiver/fire tests required before selection.'},kitchenDining:{bounds:[7707.5,8412.5,3875,3170],fourPlaces:true,northWorkingGap:732.5,southEntryGap:637.5,fridgeToEastWindowProjectionGap:25,trade:'Separate dryprep table deleted; dining table has separate meal/prep states.'},principalBath:{northFinishedFace:8152.5,westFinishedFace:9400,southFinishedFace:6600,door:[9900,10800],WC:'SOUTH-facing355x560 with north180serviceband/cistern; actual product and operation owned by MATINTERIORS',soilColumnCentre:[11432.5,8040],eastFinishedFace:11567.5,scope:'Live MATINTERIORS constructivegeometry; exactselectedproduct/frame/servicebranch still tojoin.'}},
 water:{normal:'Outdoor west-edge copper channel; exact width/fall/inlet/receiver awaitingjoinedMATspatialselection.',relief:'Independent E or separately visible passive overland route must be drawn with blockedN/high-tailwater/common-obstruction states. No independentpair acceptance from two loggia strips.',oldD1300:'Retained cost benchmark only; deleting waterboxes does not adopt grade150 or prove a shallower ground-support section.'},
 furnitureRequirements:{principalBed:{whole:[9462.5,9175,2090,1600],body:upper.principal,head:upper['principal-head'],maxHeadHeight:700,maxBedMattressTop:600,minCill:750,verticalReserve:50,windowOperation:'Compatible leaf/frame lower envelope staysat/above750; actualOASfamily/3Doperation not yet matched.',southPassageFromActualLeaf8474:701,declaredCombinedPositionLoss:50,bodyDiameter:600,remainingPassageAfterLoss:651,maintenance:{translation:[0,500],whole:[9462.5,9675,2090,1600],swept:[9462.5,9175,2090,2100],trayStage:[10275,8540,250,900],handlingPad:100,nominalStageGap:235,after100Pad:135,windowTasks:'Unavailable during bedroom maintenance; restore ordinary state.'}},bed4:{whole:[5417.5,9350,2090,1500],maxHeadHeight:700,westFootGap:887.5,northBedPassage:732.5,rearR01PanStageWithPad:[3700,10522.5,760,555],noR01Conflict:true}},sections:{groundFFL:0,firstFFL:3450,atticDatum:6900,groundFloorRC:{top:-180,bottom:-380},firstFloorRC:{top:3370,bottom:3170},loggiaSoffit:{insulation:240,railLathTerritory:15,mineralProtection:25,underside:2890,scope:'MAT provisional exact recipe; arch/head thermal interface notyet admitted.'},groundSupport:{grid:[600,450],top:-180,bottom:-630,integralNode:[600,600,570],lowTies:[600,200],lowTieTop:-550,lowestNodeTie:-750,heaveStress:300,constructionLoss:50,ventilationReserve:150,Drequired:1250,Dtrial:1300,Dsurplus:50,scope:'STR reference capacity/actualventilation/site condition unqualified. D1300 is solum/grade trial, not sitefact.'},waterLevels:{southLandingStart:0,landingRun:1500,landingDrop:30,courtNorth:-110,courtRun:3500,loggiaNorth:-152.5,loggiaRun:4250,scope:'MAT constructiveONEproposal; structure/slopes/receivers/firstharm need joined check.'},fireHeight:{firstAboveAuthoredExterior:4750,lowRiseComparison:4500,scope:'D1300 crossesADBupperfloor4.5m groundheight boundary; actualadjacentground/storey interpretation/strategy required. Solum andexternalground notinterchangeable.'}},knownInterfaces:['Ground NSbeam under upper rearwetwall must earn bearings/arch interaction.','Protected-route topology is authored; classified walls/doors/glazing/joints and real site/fire admission remain unearned. Living open arch is outside protected volume.','Principal low-bed/window compatibility is an explicit procurement requirement; leaf/frame lower envelope and actual installed operation remain unproved.','Principalbath cistern, door handling and whole soil/hot/cold inventory remain explicit joined work.','No outdoor N/independentE topology or new moisture/DPC/soffit detail yet admitted.']
};
candidate.southCourtWeatherDoor={rough:[5100,6900],frameDepth:[4110,4250],jambEach:50,hinges:[[5150,4250],[6850,4250]],leafEach:[845.5,44,2100],leafBottom:19,leafTop:2119,gaps:{left:3,meeting:3,right:3},transom:[2119,2189],fanlightFrom:2189,arch:{span:1800,spring:2550,crown:2850,scope:'Explicit authored reference, actual OAS profile/product junction must qualify.'},grossSweepReservation:850,openLeafNorthTip:5100,landingNorthEnd:5750,clearBeyondOpenTip:650,scope:'Outward NORTH;1500full exterior landing. Actual timber/hinge/bracket/weather/leak/firstharm remains with joined MAT/OAS.'};
candidate.protectedRoute={
 basis:'One conventional reference topology under currentADB2.5a; no regulatory approval or classified assembly claimed.',official:'https://assets.publishing.service.gov.uk/media/6aa3bb335f6e942efe37f150/AD_B1_2026.pdf',edition:'2019+2020/2022/2025/2026;2029futureprovisionsnotclaimedcurrent',measurement:'D6 lowest SIDE outsideground, notsolum;4750onlyifactualoutside−1300.',
 geometry:{groundStairEastWall:{finished:[2817.5,4185,130,4752.5],core:[2832.5,4185,100,4752.5],scope:'Nonloadbearing100core+15each; whollyoutside1100flight. Bonds to4250return/rearwall, noSouthlandingcutoff.'},groundProtected:'Stair+Southlanding/gallery+frontentrance/void→FRONTfinalexit; living/kitchen north of crossdoors excluded.',upperProtected:'Whole gallery/landing and stair are one protected volume; no added fullheight stairEwall or room-to-room shortcut.',roof:'Actualcontinuousroof/ceilingclosureandcavitybarriersrequired;15skin alone notEI30.',courtyardGlazing:'Actualcourtexposure/protectedboundaryglazingmustpreserveapplicablefirestrategy; ordinaryglassnotassumedadequate; no flats-onlyruleapplied.'},
 rectangularAssemblyHeightMaximum:2250,upperClosure:'Independent classified closure between rectangular assembly and actual masonry arch/ceiling.2850openinghead is notleafheight.',
 doors:[
  {id:'FD-WEST-CROSS',level:'GROUND',host:'protected-west-cross',rough:[2947.5,3832.5],axis:4250,frameEach:25,leaf:[830,44],hinge:[3805,4250],opening:'NORTHintoexcludedgallery',closed:[2975,4228,830,44],open:[3783,4250,44,830],edgeGapsEach:2.5,minimumClearBudget:791,performance:'E20minimumreference;classifiedfullassembly/actualgaprequired'},
  {id:'FD-EAST-CROSS',level:'GROUND',host:'protected-east-cross',rough:[8241.25,9141.25],axis:4250,frameEach:25,leaf:[845,44],hinge:[9113.75,4250],opening:'NORTHintoexcludedgallery',closed:[8268.75,4228,845,44],open:[9091.75,4250,44,845],edgeGapsEach:2.5,minimumClearBudget:806,performance:'E20minimumreference;classifiedfullassemblyrequired'},
  {id:'STUDY',level:'GROUND',host:'study-L-north',rough:[1350,2250],axis:3247.5,frameEach:25,leaf:[830,44],hinge:[1385,3247.5],opening:'SOUTHINTOSTUDY',performance:'ProtectedhallboundaryE20reference, notordinaryratedclaim'},
  {id:'GUEST-WC',level:'GROUND',host:'wc-north',rough:[7650,8550],axis:2650,performance:'Protectedhallboundarydoor;actualbathroom/firestrategyexceptionnotassumed'},
  {id:'PLANT',level:'GROUND',host:'service-spine',rough:[2750,3650],axis:9300,performance:'Protectedhallboundarydoor;plantactualhazard/requiredratingtoconfirm'},
  ...[['BED2','bed2-north-main',[3450,4350],2650],['BED3','bed3-north-main',[8250,9150],2650],['BED4','rear-west',[3100,4000],8852.5],['PRINCIPAL','rear-east',[8250,9150],8290]].map(([id,host,rough,axis])=>({id,level:'FIRST',host,rough,axis,performance:'E20minimumreference;privateclosurepreserved, actualclassifieddoorset/operationrequired'})),
  {id:'FAMILY-BATH',level:'FIRST',host:'wet-spine',rough:[5450,6350],axis:9300,performance:'Actualprotectedboundarybathroomroletoqualify; inside-slideroperationisnotfirerating'},
 ],internalClosers:'Notautomaticallyrequiredsolelywithindwellinghouse(currentAppendixC5). Noarbitrarycloserremovedfromactuallyclassifiedassembly.',smokeVentTransfer:'Sa/smokegapand7600mm2venttransfermustmatchactualclassifieddoorset; no10mmundercutassumedapproved.',livingArch:{rough:[3100,4000],axis:8852.5,scope:'Outsideprotectedstair/hall; losesacoustic/privacyclosure. Truearch/beamreceiverloadpathwithSTR.'},kitchenArch:{rough:[8250,9150],axis:8290,scope:'OutsideprotectedSouthhall; no shared-room leaf, actualstructuralarchwithSTR.'}
};

// ONE complete mineral-finish development rewind. Prior passing15 control is49a44045.
candidate.finishRewind={status:'EXPLICIT INCOMPLETE27DRY/30WET TRIAL; failed witnesses retained, no adoption.',passingControl:'49a44045a305ce2ceda397097f7572cd812e10b6',dry:{total:27,scratch:10,float:10,finish:4,silicatePreparationTerritory:1,fitAllowance:2,owner:'MAT-INTERIORS Conserv/BEECK source-backed comparison; no thin invented plaster.'},wet:30,deltaDry:12,scope:'Core axes held except nonloadbearing protected wall moved12E to retain1100flight. Whole furniture/frame/door fit must be rerun, not inherited.'};
weather.total=519.5;weather.layersRoomToWeather[0][1]=27;
for(const walls of [groundWalls,upperWalls])for(const w of walls){
 if(w.id.startsWith('loggia-')){w.t=519.5;w.finishedFaces=w.id.includes('west')?[4280.5,4800]:[7200,7719.5];continue}
 const h=w.a[1]===w.b[1],axis=h?w.a[1]:w.a[0],core=w.structuralCore??[axis-(w.t-30)/2,axis+(w.t-30)/2];w.structuralCore=[...core];
 let low=27,high=27;
 if(w.id==='wet-spine-principal')high=30;
 if(w.id==='bath-north')low=high=30;
 if(w.id==='rear-east-principal')low=30;
 if(w.id==='rear-wet-east')low=30;
 if(w.id==='bed3-L-north')high=30;
 if(w.id==='wc-west')high=30;
 if(w.id==='wc-north')low=30;
 w.finishedFaces=[core[0]-low,core[1]+high];w.t=w.finishedFaces[1]-w.finishedFaces[0];w.faceFinish=[low,high];
 if(w.id==='protected-stair-east'){w.a[0]+=12;w.b[0]+=12;w.a[1]=4173;w.b[1]=8949.5;w.structuralCore=w.structuralCore.map(v=>v+12);w.finishedFaces=[2817.5,2971.5]}
}
const westCross=groundWalls.find(w=>w.id==='protected-west-cross');westCross.holes=[[2971.5,3820.5]];westCross.b[0]=3820.5;
const westFD=candidate.protectedRoute.doors.find(d=>d.id==='FD-WEST-CROSS');Object.assign(westFD,{rough:[2971.5,3820.5],leaf:[794,44],hinge:[3793,4250],closed:[2999,4228,794,44],open:[3771,4250,44,794],minimumClearBudget:755});
candidate.protectedRoute.geometry.groundStairEastWall.finished=[2817.5,4173,154,4776.5];candidate.protectedRoute.geometry.groundStairEastWall.core=[2844.5,4173,100,4776.5];
candidate.protectedRoute.doors.find(d=>d.id==='STUDY').frameDepth=194;
// Ordinary baseboard gap offsets; sizes and500N maintenance travel stay held.
for(const id of ['principal','principal-head','bed4','bed4-head'])upper[id][0]-=12;
upper['principal-wardrobe'][0]+=12;upper['bed4-island-wardrobe'][0]+=12;
upper['family-service-cabinet'][0]+=12;
ground['reading-sofa1900x850'][1]+=25;ground['family-sofa1900x750'][0]-=12;
ground['cold-storage'][0]-=12;
for(const id of ['dining-table1200x800','dining-chair-west-south','dining-chair-west-north','dining-chair-east-south','dining-chair-east-north'])ground[id][1]+=50;
// Current joined wet-room proposal; IAS retains actual family-door arm/regrip failures.
ground['study-chair'][0]=900;
Object.assign(upper,{'family-bath1700':[9460,3800,1700,700],'family-WC':[10777.5,5800,560,355],'family-basin':[11227.5,5300,340,450],'family-local-soil-column':[11342.5,6180,180,180],'rear-shower1000':[1802.5,8952.5,1000,1000],'rear-basin':[1000,8952.5,400,220]});
const familyDoor={rough:[5450,6350],completeFrame:825,leaf:[762,44],hinge:[9397,6281],clear:[5516.5,6283.5],net:767,status:'IAS finite proposal; arm/regrip not yet passed, E20 assembly not qualified'};
candidate.protectedRoute.doors.find(d=>d.id==='FAMILY-BATH').trial=familyDoor;
candidate.familyWetTrial={westDryFace:9397,localBathEndWetFace:9400,southWetFace:3800,northWetFace:6400,eastWetFace:11567.5,door:familyDoor,serviceBand:[11337.5,5800,230,560],port:[11432.5,6270],column:upper['family-local-soil-column'],scope:'One coordinated fixture proposal;230band/200turn support envelope still unresolved. No hole/product/cistern adoption.'};
// Final STR260×450 receiver proposal; room/arch fit has not been passed.
candidate.fixedObstacles.GROUND[0]=['wetBeamSouthReceiver',[2745.5,8600.5,314,504]];
candidate.fixedObstacles.GROUND[1]=['wetBeamNorthReceiver',[2745.5,11260.5,314,477]];
candidate.fixedObstacles.GROUND[2]=['stairMidPostFinished',[2817.5,7105.5,277,304]];
candidate.stairFinishRewind={raw:b.stair,finished:[429.5,4432.5,2388,4335],retainedWell:200,provisionalEqualFlightWidth:1094,reference1100NotClaimed:true,scope:'Outerwest27finish costs12total despite protectedEastwallshift;1094each BEFORE actualrail. STR/IAS actualstair/landing/guard recheck pending.'};
candidate.fixedObstacles.FIRST=[['principalEastExtraWetLining',[11567.5,6600,3,1552.5]]];
Object.assign(candidate.structuralChanges.newWetWallBeam,{beamWidth:200,southReceiverCore:[2772.5,8627.5,260,450],northReceiverCore:[2772.5,11287.5,260,450],southReceiverFinished:[2745.5,8600.5,314,504],northReceiverFinished:[2745.5,11260.5,314,477],northSupportAxis:11512.5,northLoadedCantilever:155,scope:'LatestSTR260proposal; actual spatial/arch/weather junction NOT passed. No finish applied into north cavity.'});
// Paired700 north windows retain470 raw loggia pier territory and clear larger receiver.
for(const level of ['GROUND','FIRST'])for(const o of openings[level]){
 if(o.wall==='outer-north'&&o.centre===3550){o.centre=3700;o.width=700;if(level==='GROUND')o.operation='FIXED; ordinary operation not credited'}
 if(o.wall==='outer-north'&&o.centre===8450){o.centre=8300;o.width=700}
 if(level==='FIRST'&&o.wall==='outer-east'&&o.centre===7400){o.fixedTransomTopBand=480;o.openingLeafHeadMaximum=2370}
}
for(const r of openingRewinds){if(r.fromCentre===3900){r.toCentre=3700;r.width=700}if(r.fromCentre===8100){r.toCentre=8300;r.width=700}if(r.centres)r.centres=[8300,10200]}
candidate.principalExtractCassette={band:[2370,2850],openingLeafHeadMaximum:2370,port:[7400,2610,280],maximumActualHeadMullionIntrusion:75,rawRadialReserve:100,finalReserveAfter75:25,podUnderside:2430,scope:'Selected finite480fixed insulated head cassette. Actual matched OAS frame/usable port/thermal/material/fire assembly unqualified.'};
candidate.envelope=429.5;candidate.retainedOuterCoreWeatherBudget=417.5;
Object.assign(candidate.furnitureRequirements.principalBed,{whole:[9450.5,9175,2090,1600],southPassageFromActualLeaf8486:689,remainingPassageAfterLoss:639});
Object.assign(candidate.furnitureRequirements.principalBed.maintenance,{whole:[9450.5,9675,2090,1600],swept:[9450.5,9175,2090,2100]});
candidate.furnitureRequirements.bed4.whole=[5405.5,9350,2090,1500];candidate.furnitureRequirements.bed4.westFootGap=863.5;
candidate.rooms.living.bounds=[429.5,8949.5,3851,2621];candidate.rooms.kitchenDining.bounds=[7719.5,8424.5,3851,3146];
candidate.status='ONE INCOMPLETE27DRY/30WET WHOLE-HOUSE TRIAL; explicit failures retained. Prior15control49a44045 preserved. Not adopted.';
delete candidate.furnitureRequirements.principalBed.southPassageFromActualLeaf8474;
candidate.structuralChanges.stairMidPost.eastRoomFinish=27;candidate.structuralChanges.stairMidPost.eastFinishedFace=3094.5;candidate.structuralChanges.stairMidPost.courtWestFace=3820.5;candidate.structuralChanges.stairMidPost.grossGalleryClear=726;candidate.structuralChanges.upperRearDivider.finished=194;candidate.structuralChanges.upperRearWestReturn.finished=194;
candidate.rooms.kitchenDining.northWorkingGap=670.5;candidate.rooms.kitchenDining.southEntryGap=675.5;
candidate.stairGuard={
 basis:'Authored spatial selection against England ADK2013§1.34,1.39/Diagram3.1. No guard/anchor capacity or final regulatory admission.',official:'https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/996860/Approved_Document_K.pdf',
 finishedAperture:[429.5,4432.5,2388,4323],lowerFlightX:[429.5,1523.5],wellX:[1523.5,1723.5],upperFlightX:[1723.5,2817.5],bodyTerritoryEach:1094,midlandingDepth:1623,
 handrail:{diameter:40,wallClear:50,wallsideProjection:90,wellsideRailWhollyInWell:true,betweenRails:1004,declaredCombinedPositionLoss:20,after20Loss:984,topAbovePitchAndLanding:1000,scope:'1004nominal, not1100clear and not a statutory private-stair minimum. Actual brackets/continuity/load/support/whole operator still qualify.'},
 infill:{verticalDiameter:12,centrePitch:100,nominalClear:88,bottomGapMaximum:80,scope:'No climbable horizontal infill;100sphere exclusion includes sloping triangles/returns, not just88straight gap. Actual assembledtest unearned.'},
 stairRailSouthExtension:300,midlandingUTurnRadius:80,
 firstFloorGuards:[['stair-east-edge',[2817.5,4432.5,50,4323]],['entry-void-west',[4835,429.5,50,2305.5]],['entry-void-east',[7115,429.5,50,2305.5]],['entry-void-north',[4885,2735,2230,50]],['stair-top-return',[2747.5,4112.5,120,40]]],
 entranceBridgeClear:[2785,3802.5],entranceBridgeWidth:1017.5,
 treadGeometry:{risers:20,rise:172.5,goingsEachFlight:9,going:300,lowerFirstNose:[4432.5,172.5],midlandingNose:[7132.5,1725],upperArrivalNose:[4432.5,3450],pitchDegrees:Math.atan2(172.5,300)*180/Math.PI,bearingAxesY:[4332.5,7257.5],bearingSpan:2925,scope:'Actual finishednose levels held0/1725/3450; no extra80atfinalriser. Earlier2700scalar structural flightspan is superseded; STR actual waist/support check pending.'},
 minimumDeclaredHeadrooms:{firstNoseUnderSouthHeader:3055-172.5,upperArrivalBelowRoofControl:2994,scope:'Limited reference zones only. Full continuous actual soffit, beam/rail/wall transition, qualified roof closure and service intrusions still require joined3D section.'}
};
// Checked IAS deltas against20ff: ordinary standard-hinge rehand, not a new mechanism.
ground['family-sofa1900x750']=[2337.5,9800,1900,750];ground['reading-side-table300']=[800,10925,300,300];ground['family-side-table300']=[3900,9450,300,300];
candidate.livingTableMaintenance={ordinary:[800,10925,300,300],westIntermediate:[480,10925,300,300],parked:[480,10600,300,300],sequence:'MoveTableAwestfirstthenSouth;R01body/serviceONLYafterparking;restoreafterwork.',minimumSweptSofaGap:20,minimumWestWallSkirtGap:32.5,scope:'Finite table-envelope and body-route states; completeoperator/grip/handling and actualproductheight remain unqualified.'};
candidate.livingFurnitureRequirements={maximumSofaBackArmHeight:700,maximumTableHeight:700,minCill:750,requiredLeafLowerEnvelope:750,verticalReserve:50,scope:'Actualproduct/3Dleaf/force notadmitted; low furniture is a procurement requirement, not inferred fromplan boxes.'};
candidate.pantrystandardDoor={rough:[10450,11350],frameEach:25,gapEach:10,hinge:[11315,8290],leaf:[830,44],operation:'SOUTH intoPantry/highEhinge',closed:[10485,8268,830,44],open:[11293,7460,44,830],clearBudget:806,scope:'IAS continuous geometric witness; actual frame/hinge/hardware/force not product-qualified.'};
candidate.fridgeDoor={hinge:[10920.5,9025],panel:[650,70],operation:'WEST fromLOW/southhinge; pantrydoor CLOSED for task',scope:'Whole moving-panel allowance, not actual appliance part admission.'};

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
function obstacles(level,{closedCross=false,omit=[],extra=[],includeTrim=true}={}){
 const walls=level==='GROUND'?groundWalls:upperWalls;
 const enclosure=outerDefs.map(([id,a,b])=>({id,a,b,t:429.5,finishedFaces:id==='outer-south'||id==='outer-west'?[0,429.5]:id==='outer-north'||id==='outer-east'?[11570.5,12000]:id==='court-south'||id==='court-west'?[3820.5,4250]:[7750,8179.5],holes:openings[level].filter(o=>o.wall===id&&['door','open-loggia'].includes(o.kind)).map(o=>[o.centre-o.width/2,o.centre+o.width/2])}));
 const trim=r=>[r[0]-18,r[1]-18,r[2]+36,r[3]+36];
 const r=[...wallRects([...walls,...enclosure]).map(([id,r])=>[id+(includeTrim?'+18trim':''),includeTrim?trim(r):r]),...candidate.fixedObstacles[level].map(([id,r])=>[id,!includeTrim?r:id==='stairMidPostFinished'?[r[0],r[1]-18,r[2]+18,r[3]+36]:trim(r)]),...Object.entries(level==='GROUND'?ground:upper),['stair-plan-void',b.stair],['court-outdoor-not-indoor-shortcut',[4250,4250,3500,3500]]];
 if(level==='FIRST')r.push(...candidate.stairGuard.firstFloorGuards,['entrance-floor-void',b.void],...bedroomLeaves,['principal-bath-slider-closed',[9875,8442,950,44]]);
 else r.push(['pantry-open-leaf',candidate.pantrystandardDoor.open],...candidate.protectedRoute.doors.filter(d=>d.id.startsWith('FD-')).map(d=>[d.id,closedCross?d.closed:d.open]));
 return [...r.filter(([id])=>!omit.includes(id)),...extra];
}
const witnesses=[];
function route(id,level,points,opts={}){const obs=obstacles(level,opts);let min=Infinity,at=null;for(let i=0;i<points.length;i++)for(const [name,r]of obs){const gap=sr(points[i],points[Math.min(i+1,points.length-1)],r)-300;if(gap<min){min=gap;at={obstacle:name,segment:i}}}const result={id,level,bodyRadius:300,points,state:opts.state??(opts.closedCross?'cross fire doors CLOSED':'cross fire doors OPEN; private entry leaves OPEN; principal bath slider CLOSED'),minimumReserve:min,controlling:at,pass:min>=-1e-7};witnesses.push(result);return result}
route('protected-stair-bottom-to-front','GROUND',[[967.5,4100],[967.5,3782.5],[3200,3782.5],[3200,3485],[6000,3485],[6000,417.5]],{closedCross:true});
route('daily-living-to-kitchen','GROUND',[[1993.75,9455],[3450,9455],[3450,3782.5],[3450,3470],[8700,3470],[8700,8771.25]]);
route('courtwest-window6850','GROUND',[[3450,6500],[3470,6850]]);
route('living-entry','GROUND',[[3450,8500],[3450,9455],[1993.75,9455]]);
route('living-seating-rear-stack','GROUND',[[1993.75,9455],[1993.75,11226.25],[1100,11226.25]],{omit:['reading-side-table300'],extra:[['TableA-PARKED',[480,10600,300,300]]],state:'R01SERVICEONLY:TableAPARKED480/10600;restoreordinary800/10925afterwork'});
route('living-north-window1800','GROUND',[[1993.75,9455],[1993.75,10900],[2363.75,11075]]);
route('living-fixed3700-inspection-only','GROUND',[[1993.75,10900],[3420,10900],[3420,11150]]);
route('kitchen-entry-to-working-aisle','GROUND',[[8700,8771.25],[10200,8771.25],[10200,10641.25],[8250,10641.25],[8250,11235]]);
route('kitchen-north-window10200','GROUND',[[10200,8771.25],[10200,11235]]);
route('kitchen-pantry-open-door-approach','GROUND',[[10200,8771.25],[10600,8771.25],[10750,8700],[10925,8635]],{omit:[]});
route('principal-to-protected-stair','FIRST',[[8700,8771.25],[8700,3485],[3450,3485],[3450,3782.5],[2270.5,3782.5],[2270.5,4100]]);
route('bed4-to-protected-stair','FIRST',[[3550,9300],[3550,8500],[3450,8500],[3450,3782.5],[2270.5,3782.5],[2270.5,4100]]);
route('principal-ordinary-entry-bath','FIRST',[[8700,8771.25],[8700,8824.5],[10400,8824.5],[10400,8850]]);
route('principal-wardrobe-foot-north-windows','FIRST',[[8730,8824.5],[8730,10000],[9000,10000],[9000,11235],[10200,11235],[11235,11100]]);
route('bed4-entry-foot-north','FIRST',[[3550,8500],[3550,9300],[4875,9300],[4875,10100],[5100,10100],[5100,11235],[3550,11235],[6000,11235]]);
route('bed4-wardrobe-operation','FIRST',[[3550,9300],[3750,9480]]);
route('bed4-rear-ensuite-door-approach','FIRST',[[5100,11235],[5100,10800],[3350,10800]]);
route('study-closed-door-window-tasks','GROUND',[[1800,2800],[2400,2800],[2400,2210],[2950,2210],[2950,765],[3900,765],[2525,765]]);
route('study-west-window-closed-door','GROUND',[[1800,2800],[770,2800],[770,2650]]);
// Check the complete bed translation and handling pad, rather than just end positions.
const maintenance=candidate.furnitureRequirements.principalBed.maintenance;
const maintObs=obstacles('FIRST',{omit:['principal','principal-head']});
const rectGap=(a,b)=>Math.hypot(Math.max(a[0]-b[0]-b[2],b[0]-a[0]-a[2],0),Math.max(a[1]-b[1]-b[3],b[1]-a[1]-a[3],0));
const overlap=(a,b)=>a[0]<b[0]+b[2]&&a[0]+a[2]>b[0]&&a[1]<b[1]+b[3]&&a[1]+a[3]>b[1];
candidate.fullHouseFootprint={method:'Positive rectangle overlap of each represented whole furniture/fixture with actual nominal finished walls/receivers, before decorative18skirt. Wall-mounted contact at zero is not counted. No vertical exception silently invented.',conflicts:[]};
for(const[level,furniture,walls]of [['GROUND',ground,groundWalls],['FIRST',upper,upperWalls]]){
 const names=new Set([...walls.map(w=>w.id),...outerDefs.map(d=>d[0]),...candidate.fixedObstacles[level].map(([id])=>id)]);
 for(const[id,r]of Object.entries(furniture))for(const[name,o]of obstacles(level,{includeTrim:false}).filter(([name])=>names.has(name)))if(overlap(r,o))candidate.fullHouseFootprint.conflicts.push({level,object:id,wall:name,overlap:[Math.max(r[0],o[0]),Math.max(r[1],o[1]),Math.min(r[0]+r[2],o[0]+o[2])-Math.max(r[0],o[0]),Math.min(r[1]+r[3],o[1]+o[3])-Math.max(r[1],o[1])]});
}
candidate.fullHouseFootprint.pass=candidate.fullHouseFootprint.conflicts.length===0;
maintenance.sweptConflicts=maintObs.filter(([,r])=>overlap(maintenance.swept,r)).map(([id])=>id);
maintenance.pass=maintenance.sweptConflicts.length===0;
maintenance.paddedStage=maintenance.trayStage.map((v,i)=>i<2?v-100:v+200);
maintenance.stageToTemporaryBedGap=rectGap(maintenance.paddedStage,maintenance.whole);
// Source-derived dimensions govern the selection, not an all-purpose body acceptance claim.
candidate.actions={method:'Exact Euclidean segment-to-closed-rectangle clearance with a300radius horizontal body proxy. Furniture and finished wall/receiver/post rectangles are obstacles. Ordinary18mm trim is conservatively added to walls/receivers; post trim is excluded from stair-facing side to retain1100flight and reserved18 on roomside. Every segment tested analytically; no sampling gaps. Not an actual-human, door-force, accessible-route or 3D/headroom admission.',witnesses,pass:witnesses.every(w=>w.pass)&&maintenance.pass,notTransferred:['Front-single detailed coupled door/window proofs retain their dated B source identities; actual fire doorset still unselected.','Pantry shelf working state needs door CLOSED; not simultaneous with open-leaf transport.','Principal and rear wetroom internal tasks use separately merged MAT witnesses; this plan only binds entries, staging and furniture sweep.','Study inside rehand has its separate bounded coupled witness. New cross-door operation still needs finite coupled test; proxy routes alone are insufficient.']};
const studyKnots=[[0,2275,2800],[15,2400,2600],[30,2400,2400],[45,2350,2350],[60,2150,2625],[90,1780,2625]];
function studyBody(a){const k=studyKnots.findIndex((p,i)=>i<studyKnots.length-1&&a>=p[0]&&a<=studyKnots[i+1][0]);const p=studyKnots[Math.max(0,k)],q=studyKnots[Math.max(0,k)+1],t=(a-p[0])/(q[0]-p[0]);return[p[1]+t*(q[1]-p[1]),p[2]+t*(q[2]-p[2])]}
const studyStatic=[...obstacles('GROUND'),['study-frame-low',[1350,3132.5,25,230]],['study-frame-high',[2225,3132.5,25,230]]];let bodyMin=Infinity,armMin=Infinity,reachMax=0,bodyAt,armAt;
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
candidate.crossDoorOperations=candidate.protectedRoute.doors.filter(d=>d.id.startsWith('FD-')).map(d=>{
 const stat=[...obstacles('GROUND',{omit:[d.id]}),['low-frame',[d.rough[0],4155,25,190]],['high-frame',[d.rough[1]-25,4155,25,190]]];const bodyAlong=d.id==='FD-WEST-CROSS'?360:390,bodyNormal=d.id==='FD-WEST-CROSS'?330:345;
 let bodyMin=Infinity,armMin=Infinity,reachMax=0;
 for(let k=0;k<=900;k++){const t=k*Math.PI/1800,u=[-Math.cos(t),Math.sin(t)],n=[-Math.sin(t),-Math.cos(t)],H=d.hinge,tip=[H[0]+d.leaf[0]*u[0],H[1]+d.leaf[0]*u[1]],body=[H[0]+bodyAlong*u[0]+bodyNormal*n[0],H[1]+bodyAlong*u[1]+bodyNormal*n[1]],grip=[H[0]+(d.leaf[0]-50)*u[0]+84*n[0],H[1]+(d.leaf[0]-50)*u[1]+84*n[1]];
  for(const[,r]of stat){bodyMin=Math.min(bodyMin,pd(body,r)-300);armMin=Math.min(armMin,sr(body,grip,r)-40)}
  bodyMin=Math.min(bodyMin,ps(body,H,tip)-322);armMin=Math.min(armMin,sd(body,grip,H,tip)-62);reachMax=Math.max(reachMax,Math.hypot(body[0]-grip[0],body[1]-grip[1]));
 }
 const bodyBound=(9.2+14.8)*.05,armBound=(9.2+14.8+14.8)*.05,reachBound=(9.2+14.8)*.05;
 return{id:d.id,bodyPath:`H+${bodyAlong}u+${bodyNormal}n;u=(-cosθ,sinθ),n=(-sinθ,-cosθ),0≤θ≤90deg`,gripPath:'H+(leafwidth−50)u+84n',sampleStep:.1,continuousBodyLowerBound:bodyMin-bodyBound,continuousArmLowerBound:armMin-armBound,continuousReachUpperBound:reachMax+reachBound,pass:bodyMin>=bodyBound&&armMin>=armBound&&reachMax+reachBound<=600,scope:'Finite push-open/reverse-close geometry including25jambs and2.5leaf gaps. Operator R300/forearmR40/600reach proxy only; qualified installed frame/handles/forces/fire assembly not admitted.'};
});
candidate.actions.pass&&=candidate.crossDoorOperations.every(d=>d.pass);
function taskMotion(id,H,width,thickness,axes,bodyAt,gripAt,staticExtra=[],omit=[]){
 const stat=[...obstacles('GROUND',{omit}),...staticExtra];let bm=Infinity,am=Infinity,rm=0;
 for(let k=0;k<=900;k++){const t=k*Math.PI/1800,[u,n]=axes(t),tip=H.map((v,i)=>v+width*u[i]),body=bodyAt(H,u,n),grip=gripAt(H,u,n);
  for(const[,r]of stat){bm=Math.min(bm,pd(body,r)-300);am=Math.min(am,sr(body,grip,r)-40)}
  bm=Math.min(bm,ps(body,H,tip)-300-thickness/2);am=Math.min(am,sd(body,grip,H,tip)-40-thickness/2);rm=Math.max(rm,Math.hypot(body[0]-grip[0],body[1]-grip[1]));
 }
 const bb=(9.2+14.8)*.05,ab=(9.2+14.8+14.8)*.05,rb=(9.2+14.8)*.05;
 return{id,continuousBodyLowerBound:bm-bb,continuousArmLowerBound:am-ab,continuousReachUpperBound:rm+rb,pass:bm>=bb&&am>=ab&&rm+rb<=600,scope:'Full300body/40forearm/600reach geometric sequence with actual static walls/trim/furniture/frame and moving panel. Not actual hardware/force/physical admission.'};
}
candidate.pantrystandardDoor.operationWitness=taskMotion('PANTRY-HIGH-HINGE',[11315,8290],830,44,t=>[[-Math.cos(t),-Math.sin(t)],[Math.sin(t),-Math.cos(t)]],(H,u,n)=>H.map((v,i)=>v+390*u[i]-345*n[i]),(H,u,n)=>H.map((v,i)=>v+780*u[i]-84*n[i]),[['low-frame',[10450,8137.5,25,305]],['high-frame',[11325,8137.5,25,305]]],['pantry-open-leaf']);
candidate.fridgeDoor.operationWitness=taskMotion('FRIDGE-LOW-HINGE',[10920.5,9025],650,70,t=>[[-Math.sin(t),Math.cos(t)],[-Math.cos(t),-Math.sin(t)]],(H,u,n)=>H.map((v,i)=>v+250*u[i]+345*n[i]),(H,u,n)=>H.map((v,i)=>v+600*u[i]+95*n[i]),[['pantry-CLOSED',candidate.pantrystandardDoor.closed]],['pantry-open-leaf']);
candidate.actions.pass&&=candidate.pantrystandardDoor.operationWitness.pass&&candidate.fridgeDoor.operationWitness.pass;
candidate.stairPostFinishRequirement='Post ends below FIRST RC/trimmer, no first-floor obstacle. No applied baseboard on stair-facing post edge;1100flight retained. Roomside18baseboard counted, reducing nominal750 to714 between roomside projections.';
candidate.windowRequirements=[
 ['GROUND','living1800',[2363.75,11075],[2220,11582.5],'Northwindow HIGHhand; existing table/sofas retained'],
 ['GROUND','kitchen8450',[8250,11235],[8030,11582.5],'Raised1050cill; station sink starts8700'],
 ['GROUND','kitchen10200',[10200,11235],[10620,11582.5],'Raised1050cill; separate sink/cook piers'],
 ['GROUND','courtwest6850',[3470,6850],[3832.5,7270],'Actual750gallery beside post; not universal accessibility'],
 ['GROUND','studySouth1800',[2525,765],[2220,417.5],'Desk/chair retained; inside door CLOSED'],
 ['GROUND','studySouth3900',[3900,765],[4320,417.5],'Inside door CLOSED'],
 ['GROUND','studyWest1800',[770,2650],[417.5,2220],'Inside door CLOSED'],
 ['FIRST','principalEast10200',[11250,11100],[11582.5,10620],'Lowhead≤700/bed≤600; actual lower leaf/frame envelope≥750; no3D leaf pass'],
 ['FIRST','principalNorth8450',[8700,11250],[8870,11582.5],'Unavailable during+500bed maintenance'],
 ['FIRST','principalNorth10200',[10200,11235],[10620,11582.5],'Unavailable during+500bed maintenance'],
].map(([level,id,body,handle,requirement])=>({level,id,body,handle,planReach:Math.hypot(body[0]-handle[0],body[1]-handle[1]),maximumPlanReach:600,requirement,scope:'Required hinge/handle geometry only; actual supplier leaf sweep, vertical reach, grip, force and cleaning not physically admitted.'}));
for(const w of candidate.windowRequirements)w.handle=w.handle.map(v=>v===11582.5?11570.5:v===417.5?429.5:v);
for(const w of candidate.windowRequirements)w.planReach=Math.hypot(w.body[0]-w.handle[0],w.body[1]-w.handle[1]);
candidate.actions.windowPlanReachPass=candidate.windowRequirements.every(w=>w.planReach<=600);
candidate.actions.pass&&=candidate.actions.windowPlanReachPass;
candidate.approaches={authoredExteriorGrade:-1300,front:{rise:1300,slope:20,slopingRun:26000,flights:[9000,9000,8000],landingLength:1200,landings:4,totalStraightReservation:30800},garden:{terrace:-152.5,rise:1147.5,slope:20,slopingRun:22950,flights:[8000,8000,6950],landingLength:1200,landings:4,totalStraightReservation:27750},clearWidthReservation:1200,scope:'Finite authored plot reservation, not a compliant access design or available site. Guards, edge protection, turning/door/approach geometry and actual access category remain to qualify. Court/loggia not credited as protected final exit.'};
candidate.exterior={eaves:6800,ridge:6800+2125*Math.tan(25*Math.PI/180),eavesAboveAuthoredGrade:8100,ridgeAboveAuthoredGrade:8100+2125*Math.tan(25*Math.PI/180),source:'Retains HAD furnished-design visual roof geometry:2125inset/25degree inward-outward ring, not actual roof/support/collection proof.',palette:'Warm mineral masonry, quiet pale opening family, dark pitched ring roof; locally rendered insulated loggia arches are a visible material/shape rewind.'};
candidate.qualityCosts={dailyLivingKitchenCentreline:witnesses.find(w=>w.id==='daily-living-to-kitchen').points.reduce((sum,p,i,a)=>i?sum+Math.hypot(p[0]-a[i-1][0],p[1]-a[i-1][1]):0,0),living:'Two original-size sofas retained; separate reading enclosure removed, shared arch loses acoustic privacy.',dining:'Four places, no end seats; separate prep table removed. Actual chair/support/table leg fit is not earned from500plan boxes.',private:'Four bedrooms retained, two compact singles, two rear doubles rotatedEW; principal lowbed/window compatibility and660wardrobe are explicit choices.',loggia:'Deletes occupied-floor renewable watercaps/gas lids. Costs new weatherwalls, displaced room territory, long daily indoor connection and exposed floor/arch insulation.',height:'Current support trial stillD1300: no approach/eaves reduction credited against prior buried-box comparator.'};
function unionArea(rects){const xs=[...new Set(rects.flatMap(r=>[Math.max(0,r[0]),Math.min(12000,r[0]+r[2])]))].sort((a,b)=>a-b);let area=0;for(let i=1;i<xs.length;i++){const lo=xs[i-1],hi=xs[i],mid=(lo+hi)/2,ys=rects.filter(r=>r[0]<=mid&&r[0]+r[2]>=mid).map(r=>[Math.max(0,r[1]),Math.min(12000,r[1]+r[3])]).sort((a,b)=>a[0]-b[0]);let length=0,end=-Infinity;for(const[a,b]of ys)if(b>end){length+=b-Math.max(a,end);end=b}area+=(hi-lo)*length}return area}
const areaBase=[[0,0,12000,417.5],[0,11582.5,12000,417.5],[0,417.5,417.5,11165],[11582.5,417.5,417.5,11165],[3832.5,3832.5,4335,4335],b.stair];
const newAreaBase=[[0,0,12000,429.5],[0,11570.5,12000,429.5],[0,429.5,429.5,11141],[11570.5,429.5,429.5,11141],[3820.5,3820.5,4359,4359],b.stair];
const oldArea=(144e6-unionArea([...areaBase,...wallRects(b.ground_walls).map(([,r])=>r)]))/1e6,newArea=(144e6-unionArea([...newAreaBase,loggia.clear,...wallRects(groundWalls).map(([,r])=>r),...candidate.fixedObstacles.GROUND.map(([,r])=>r)]))/1e6;
candidate.qualityCosts.groundClearFloor={baseB:oldArea,loggia:newArea,loss:oldArea-newArea,unit:'m2',method:'Exact clipped rectangle union inside12×12shell; excludes outer417.5 walls, full court+wall rectangle, stair footprint, internal wall rectangles/holes, new outside loggia and fixed receivers/post. Furniture not subtracted. Ground entrance doubleheight has a floor; not a void. Comparison includes new protected walls/support footprints, so loss is not solely loggia.'};
const T=(x,y,s,size=3.1,w='normal')=>`<text x="${x}" y="${y}" font-family="DejaVu Sans,Arial,sans-serif" font-size="${size}" font-weight="${w}" fill="#293a40">${esc(s)}</text>`;
const R=(x,y,w,h,c,stroke='#617069')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="${stroke}" stroke-width=".25"/>`;
const L=(x,y,xx,yy,c='#687777',sw=.5)=>`<path d="M${x} ${y}L${xx} ${yy}" stroke="${c}" stroke-width="${sw}" fill="none"/>`;
const sheet=[];
for(const [column,lev,walls,furniture]of [[0,'GROUND',groundWalls,ground],[1,'FIRST',upperWalls,upper]]){
 const X=x=>20+195*column+x/100,Y=y=>174-y/100;
 sheet.push(T(20+195*column,44,lev+' / ONE CONNECTED CANDIDATE',3.7,'bold'));
 sheet.push(R(X(0),Y(12000),120,120,'#bac2bd'),R(X(429.5),Y(11570.5),111.41,111.41,'#f0eadc'),R(X(3820.5),Y(8179.5),43.59,43.59,'#bac2bd'),R(X(4250),Y(7750),35,35,'#d8eee8'));
 const wallDefs=[['outer-south',true,0,429.5,0,12000],['outer-north',true,11570.5,429.5,0,12000],['outer-west',false,0,429.5,429.5,11570.5],['outer-east',false,11570.5,429.5,429.5,11570.5],['court-south',true,3820.5,429.5,3820.5,8179.5],['court-north',true,7750,429.5,3820.5,8179.5],['court-west',false,3820.5,429.5,4250,7750],['court-east',false,7750,429.5,4250,7750]];
 for(const [name,h,at,t,lo,hi]of wallDefs)for(const o of openings[lev].filter(o=>o.wall===name)){const a=o.centre-o.width/2;sheet.push(h?R(X(a),Y(at+t),o.width/100,t/100,'#f0eadc','none'):R(X(at),Y(a+o.width),t/100,o.width/100,'#f0eadc','none'))}
 if(lev==='GROUND'){sheet.push(R(X(4800),Y(12000),24,42.5,'#d8eee8'));for(const y of [7732.5,11317.5])for(const x of [4520,7200])sheet.push(R(X(x),Y(y+700),2.8,7,'#b9c99e'));}
 for(const [,r]of wallRects(walls))sheet.push(R(X(r[0]),Y(r[1]+r[3]),r[2]/100,r[3]/100,'#bac2bd','none'));
 sheet.push(R(X(b.stair[0]),Y(b.stair[1]+b.stair[3]),b.stair[2]/100,b.stair[3]/100,'#cccabb'),R(X(b.void[0]),Y(b.void[1]+b.void[3]),b.void[2]/100,b.void[3]/100,lev==='GROUND'?'#eadfc8':'#fffdf7'));
 for(const [,r]of candidate.fixedObstacles[lev])sheet.push(R(X(r[0]),Y(r[1]+r[3]),r[2]/100,r[3]/100,'#a65f4d'));
 for(const [id,r]of Object.entries(furniture))sheet.push(R(X(r[0]),Y(r[1]+r[3]),r[2]/100,r[3]/100,id.includes('chair')?'#dfb466':id.includes('soil')?'#a4c4c4':'#ded6c4'));
 for(const d of candidate.protectedRoute.doors.filter(d=>d.level===lev&&d.open)){const r=d.open;sheet.push(R(X(r[0]),Y(r[1]+r[3]),r[2]/100,r[3]/100,'#b86b56'))}
 if(lev==='FIRST')for(const[,r]of candidate.stairGuard.firstFloorGuards)sheet.push(R(X(r[0]),Y(r[1]+r[3]),r[2]/100,r[3]/100,'#65888b'));
 if(lev==='FIRST')for(const[,r]of bedroomLeaves)sheet.push(R(X(r[0]),Y(r[1]+r[3]),r[2]/100,r[3]/100,'#b86b56'));
 const protectedWitness=lev==='GROUND'?witnesses.find(w=>w.id==='protected-stair-bottom-to-front'):witnesses.find(w=>w.id==='principal-to-protected-stair');
 sheet.push(`<path d="${protectedWitness.points.map((p,i)=>`${i?'L':'M'}${X(p[0])} ${Y(p[1])}`).join('')}" fill="none" stroke="#226e9a" stroke-width=".7"/>`);
 if(lev==='GROUND')sheet.push(L(X(2902.5),Y(8852.5),X(2902.5),Y(11667.5),'#a95945',.8),T(X(5100),Y(10400),'OPEN',2.6),T(X(5050),Y(9800),'LOGGIA',2.6),T(X(550),Y(8750),'LIVING',2.4),T(X(8950),Y(8800),'KITCHEN / DINING',2));
 else sheet.push(T(X(1200),Y(2100),'SINGLE',2),T(X(10200),Y(2300),'SINGLE',2),T(X(5300),Y(9300),'BED4',2),T(X(9200),Y(9150),'PRINCIPAL',2));
}
const notes=[
 ['27DRY/30WET FAILED TRIAL:519.5loggiawalls,140axes held.','Principal divider194finished after27each;140core held.'],
 ['Two full1900sofas retained in Lshape;27finish and260receivers held.','Rear westreturn4450→4377.5; actualsupport/bearing notadopted.'],
 ['Dining moves east; dryprep table deleted; refrigerator moves to eastwall.','Front singles and reduced wardrobe follow compact B.'],
 ['Living3100–4000 OPENARCH preferred; fire strategy stillcontrols.','Principal bath rotatedWC and relocateddoor follow liveMAT work.'],
 ['Paired northwindows3550/8450; kitchen northsills1050.','Both rear beds rotateEW; lowheads and windowoperation required.'],
 ['No underground waterboxes credited as automatic normal/relief route.','No physical task/certified assembly pass;27trial has explicit failures.'],
 ['Provisionalgeometry for STR/MAT/body/door/window tests.','EXPLICIT FAILED27/30TRIAL;15control49a44045 preserved.']
];notes.forEach((p,i)=>{sheet.push(T(20,191+i*10,p[0],2.85),T(215,191+i*10,p[1],2.85))});
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" role="img" aria-label="First whole-house open north loggia candidate"><rect width="420" height="297" fill="#fffdf7"/>${T(15,17,'OPEN NORTH LOGGIA / ONE WHOLE-HOUSE CANDIDATE',5,'bold')}${T(15,26,'INCOMPLETE27dry/30wet mineral trial /1:100 / failed witnesses retained;15control49a44045 preserved',2.9)}${L(15,32,405,32)}${sheet.join('')}${L(15,273,405,273)}${T(15,284,'FAILED27/30 development draft. Actual route/door failures retained; NOTADOPTED or released for construction.',2.8)}${T(15,291,'HAD03 convergence / startingmain6a953ef6 / explicit assumptions / 1 November2026',2.8)}</svg>\n`;
const wrapSheet=(title,subtitle,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" role="img" aria-label="${esc(title)}"><rect width="420" height="297" fill="#fffdf7"/>${T(15,17,title,5,'bold')}${T(15,26,subtitle,2.9)}${L(15,32,405,32)}${body}${L(15,277,405,277)}${T(15,288,'Authored unadopted design. Site, structural, thermal, fire, material and hydraulic admission remains bounded by named interfaces.',2.7)}</svg>\n`;
const a=[];
// Arch elevation at1:40. The face insulation is also real axial volume, below.
const AX=x=>78+x/40,AZ=z=>139-z/40;
const archCurve=(radius,startX,endX)=>{const z=x=>rawArchCentre+Math.sqrt(radius**2-x*x);return`M${AX(startX)} ${AZ(z(startX))} A${radius/40} ${radius/40} 0 0 1 ${AX(endX)} ${AZ(z(endX))}`};
a.push(T(18,43,'01 / ACTUAL WRAPPED PORTAL / 1:40',3.4,'bold'));
a.push(R(AX(-1950),AZ(3450),97.5,86.25,'#ded5c4'));
const openingPath=(radius,jamb)=>`${archCurve(radius,-jamb,jamb)}L${AX(jamb)} ${AZ(-110)}L${AX(-jamb)} ${AZ(-110)}Z`;
a.push(`<path d="${openingPath(rawArchRadius,1480)}" fill="#b9c99e"/>`,`<path d="${openingPath(finishedArchRadius,1200)}" fill="#fffdf7"/>`);
a.push(`<path d="${archCurve(rawArchRadius,-1480,1480)}" fill="none" stroke="#926d51" stroke-width=".7"/>`);
a.push(`<path d="${archCurve(finishedArchRadius,-1200,1200)}" fill="none" stroke="#a6bc8d" stroke-width=".8"/>`,L(AX(-1200),AZ(0),AX(-1200),AZ(insulatedPortal.finishedJambSpring),'#6b8a56',2),L(AX(1200),AZ(0),AX(1200),AZ(insulatedPortal.finishedJambSpring),'#6b8a56',2));
a.push(L(AX(-1480),AZ(0),AX(-1480),AZ(2250),'#6b8a56',.5),L(AX(1480),AZ(0),AX(1480),AZ(2250),'#6b8a56',.5),L(AX(-1800),AZ(-110),AX(1800),AZ(-110),'#628a8a',.7));
a.push(T(20,151,'Raw2960 / spring2250 / crown2850 / radius2125.333',2.65),T(20,158,'280 radial wrap → crown2570; jamb/arc2126.54.',2.65),T(20,165,'Finished2400 to2126.54; width2077.13 at2250.',2.65),T(20,172,'Walk−110 gives2680 crown /2236.54 jamb headroom.',2.65),T(20,179,'470 gross pier to adjacent window; thrust/tie not admitted.',2.65));
// Actual axial head section, independent mineral cap/soffit boundary.
a.push(T(155,43,'02 / LONGITUDINAL COURT–LOGGIA / 1:60',3.4,'bold'));
const SX=y=>163+y/60,SZ=z=>125-z/60;
a.push(R(SX(0),SZ(3370),200,200/60,'#aab3ae'),R(SX(7750),SZ(3170),4250/60,280/60,'#b9c99e'));
for(const [l,r]of [[7732.5,8432.5],[11317.5,12017.5]])a.push(R(SX(l),SZ(3170), (r-l)/60,600/60,'#b9c99e'),R(SX(l+280),SZ(3170),140/60,320/60,'#9a8b78'));
a.push(L(SX(4250),SZ(0),SX(5750),SZ(-30),'#547e83',1),L(SX(5750),SZ(-30),SX(7750),SZ(-110),'#547e83',1),L(SX(7750),SZ(-110),SX(12000),SZ(-152.5),'#547e83',1),L(SX(0),SZ(-1300),SX(12000),SZ(-1300),'#91684d',.6));
for(const centre of [8050,11700])a.push(R(SX(centre-125),SZ(-550),250/60,200/60,'#b35e4f'));
a.push(`<path d="M${SX(7750)} ${SZ(-180)}L${SX(12000)} ${SZ(-222.5)}L${SX(12000)} ${SZ(-422.5)}L${SX(7750)} ${SZ(-380)}Z" fill="#aab3ae"/>`,T(165,151,'RC200:3370–3170; soffit240glass+15+25→2890.',2.7),T(165,158,'Two700-deep wrapped cores replace cold outer arches locally.',2.7),T(165,165,'Court1500/30fall +2000/80fall; loggia4250/42.5fall.',2.7),T(165,172,'Deepest conditional tie/node−750. Ground−1300 is authored.',2.7),T(165,179,'750+H300+loss50+vent150=1250 → D1300;50surplus.',2.7));
a.push(T(18,194,'03 / PROTECTED ROUTE AND ACTUAL CEILING PRICES',3.4,'bold'));
const secNotes=[
 'FirstFFL3450 − exterior(−1300)=4750: conventional protected stair/ring→southhall→frontexit selected for development.',
 '27trial stairwall x2817.5–2971.5/y4173–8949.5; finishedstair2388, provisional1094flights/200well BEFORErails.',
 '27trial West849rough→755referenceclear; existing coupled witness FAILS. East900→806.2250completeassembly max.',
 'Wetwallbeam3370–3020/15finish→3005 groundreading ceiling; no70upstand across rearensuite doorway.',
 'South stairheader3370–3070/15→3055; groundwest4600 window arch100lower. Raised west7400 sill1750 is a visible price.',
 'Protected roof-route176ceiling is a material comparison, not adopted15skin: at localtop3170 gives2994,−106 vs3100.',
 'Actual REI/EI boundaries, court exposure/glazing, classified doorsets/gaps and penetration closures remain qualification duties.'
];secNotes.forEach((s,i)=>a.push(T(18,204+i*9,s,2.65)));
const sectionSvg=wrapSheet('OPEN NORTH LOGGIA / SECTIONS AND PROTECTED ROUTE','One physical section; all dimensions mm. Local shell finish projects17.5 at garden portal; no hidden weatherleaf overlap.',a.join(''));
const e=[];
const roofRidge=candidate.exterior.ridge;
function elevation(left,top,side){const X=x=>left+x/100,Z=z=>top+(8000-z)/100;
 e.push(R(X(0),Z(6800),120,68,'#c7aa89'),R(X(0),Z(0),120,13,'#aa9175'),`<path d="M${X(0)} ${Z(6800)}L${X(2125)} ${Z(roofRidge)}L${X(9875)} ${Z(roofRidge)}L${X(12000)} ${Z(6800)}Z" fill="#3d4b4a" stroke="#273c3d" stroke-width=".4"/>`,L(X(-500),Z(-1300),X(12500),Z(-1300),'#91684d',.6));
 for(const level of ['GROUND','FIRST'])for(const o of openings[level].filter(o=>o.wall===side&&o.kind==='window')){const sill=level==='GROUND'&&side==='outer-north'&&[8450,10200].includes(o.centre)?1050:750,base=level==='FIRST'?3450:0;e.push(R(X(o.centre-o.width/2),Z(base+(o.head??2850)),o.width/100,((o.head??2850)-sill)/100,'#dce5df','#f4eadb'))}
 if(side==='outer-south')e.push(R(X(5100),Z(2850),18,28.5,'#e6ded0','#eee8db'),R(X(5300),Z(2200),14,22,'#48534c','#eee8db'));
 else{const c=6000;for(const [jamb,radius,spring,fill]of [[1480,rawArchRadius,2250,'#e8e2d4'],[1200,finishedArchRadius,insulatedPortal.finishedJambSpring,'#445f5d']])e.push(`<path d="M${X(c-jamb)} ${Z(0)}L${X(c-jamb)} ${Z(spring)} A${radius/100} ${radius/100} 0 0 1 ${X(c+jamb)} ${Z(spring)}L${X(c+jamb)} ${Z(0)}Z" fill="${fill}"/>`)}
 e.push(T(left,top+101,side==='outer-south'?'SOUTH / retained five-axis principal front':'NORTH / lowered wide insulated loggia arch',2.8));
}
elevation(22,45,'outer-south');elevation(220,45,'outer-north');
e.push(T(18,159,'Roof geometry:6800eaves/7790.9ridge. With authoredground−1300:8100/9090.9 abovegrade.',2.85),T(18,167,'Warm masonry +pale openings +dark ring roof retained; north material/arch and pairedwindow order are actual rewinds.',2.85));
e.push(T(18,183,'FINITE PLOT / APPROACH RESERVATIONS / 1:200',3.5,'bold'));
const run=(y,label,flights,rise)=>{let x=20;e.push(T(20,y-4,label,2.8));for(let i=0;i<flights.length;i++){e.push(R(x,y,6,7,'#e4d4b2'));x+=6;e.push(R(x,y,flights[i]/200,7,'#c2d5cd'));x+=flights[i]/200;}e.push(R(x,y,6,7,'#e4d4b2'),T(210,y+5,`Rise${rise}; sloping${flights.reduce((a,b)=>a+b,0)/1000}m +4×1.2m landings.`,2.8));};
run(200,'FRONT:26m sloping +4.8m landings =30.8m straight reservation',[9000,9000,8000],1300);
run(224,'GARDEN:22.95m sloping +4.8m landings =27.75m',[8000,8000,6950],1147.5);
e.push(T(18,249,'1200 clearwidth authored; actual approachcategory, turning/handrails/guards/site availability NOT established.',2.8),T(18,258,'No height saving versus D1300 indoor-box benchmark. Benefit is removal of heavy indoor caps/gas lids; room/circulation price remains.',2.8),T(18,267,'The elevated garden terrace requires real support/guarded spill edges. It is not ground level and does not evade fire-height measurement.',2.8));
const exteriorSvg=wrapSheet('OPEN NORTH LOGGIA / WHOLE-HOUSE EXPRESSION AND PLOT PRICE','Orthographic1:100 front/garden elevation references; roof remains a schematic inward/outward ring, not a structural or rain-capacity claim.',e.join(''));
const st=[],PX=x=>20+(x-200)/50,PY=y=>166-(y-4000)/50;
st.push(T(15,44,'01 / STAIR, LANDING AND GUARD PLAN /1:50',3.2,'bold'),R(PX(429.5),PY(8755.5),2388/50,4323/50,'#e5dfcf'),R(PX(1523.5),PY(7132.5),4,54,'#fffdf7'));
for(let i=0;i<10;i++)for(const[l,r]of [[429.5,1523.5],[1723.5,2817.5]])st.push(L(PX(l),PY(4432.5+i*300),PX(r),PY(4432.5+i*300),'#7f8d88',.3));
for(const x of [499.5,1543.5,1703.5,2747.5])st.push(L(PX(x),PY(4132.5),PX(x),PY(7132.5),'#355960',.8));
st.push(L(PX(1543.5),PY(7132.5),PX(1703.5),PY(7132.5),'#355960',.8));
for(const[,r]of candidate.stairGuard.firstFloorGuards.filter(([id])=>id.startsWith('stair')))st.push(R(PX(r[0]),PY(r[1]+r[3]),r[2]/50,r[3]/50,'#b4c1bc'));
st.push(T(15,181,'2388 finished =1094+200well+1094.',2.75),T(15,188,'Landing1623; railturn80 projectsinto landing.',2.75),T(15,195,'300South returns: approachviaY3782.5.',2.75));
const Q=y=>125+(y-4132.5)/50,Z=z=>185-z/50;
st.push(T(120,44,'02 / ACTUAL FINISHED NOSES /1:50',3.2,'bold'));
const lower=[[4432.5,0]],upp=[[7132.5,1725]];
for(let i=0;i<10;i++){lower.push([4432.5+i*300,(i+1)*172.5]);if(i<9)lower.push([4732.5+i*300,(i+1)*172.5]);upp.push([7132.5-i*300,1725+(i+1)*172.5]);if(i<9)upp.push([6832.5-i*300,1725+(i+1)*172.5])}
for(const[p,c]of [[lower,'#9b7656'],[upp,'#496e75']])st.push(`<path d="${p.map(([y,z],i)=>`${i?'L':'M'}${Q(y)} ${Z(z)}`).join('')}" fill="none" stroke="${c}" stroke-width=".7"/>`);
st.push(R(Q(7132.5),Z(1725),1623/50,4,'#aab3ae'),R(Q(7132.5),Z(1725),5,370/50,'#9d8171'),L(Q(4132.5),Z(6444),Q(8755.5),Z(6444),'#a7b791',1),L(Q(4132.5),Z(0),Q(4432.5),Z(0)),L(Q(4132.5),Z(3450),Q(4432.5),Z(3450)));
st.push(T(120,198,'20×172.5;2×9goings300; pitch29.898deg.',2.75),T(120,205,'Bearing4332.5→7257.5 =2925, not2700.',2.75),T(120,212,'Midbeam top1725/bottom1355;250travel.',2.75),T(120,219,'STR actualwaist/seat/anchor check pending.',2.75));
const TX=x=>264+(x-429.5)/20,TZ=z=>111-z/20;
st.push(T(258,44,'03 / REAL HANDRAIL WIDTH /1:20',3.2,'bold'),L(TX(429.5),TZ(0),TX(2817.5),TZ(0),'#7f8d88',.8));
for(const x of [499.5,1543.5,1703.5,2747.5])st.push(`<circle cx="${TX(x)}" cy="${TZ(980)}" r="1" fill="#355960"/>`);
for(const x of [429.5,2817.5])st.push(L(TX(x),TZ(0),TX(x),TZ(1200),'#aab3ae',1));
st.push(L(TX(519.5),TZ(-100),TX(1523.5),TZ(-100),'#355960',.4),L(TX(1723.5),TZ(-100),TX(2727.5),TZ(-100),'#355960',.4),T(TX(650),TZ(-240),'1004',3),T(TX(1900),TZ(-240),'1004',3));
st.push(T(258,136,'D40 +50wallclear→90projection.',2.75),T(258,143,'Wellrail whollywithin200well.',2.75),T(258,150,'Top1000; verticalD12@100→88gap.',2.75),T(258,157,'Bottom/triangle/return gaps≤80required.',2.75),T(258,164,'1004nominal;20combinedloss→984.',2.75),T(258,171,'No private-stair1000minimum invented.',2.75),T(258,178,'Guardload/anchors/handgrip not admitted.',2.75));
st.push(T(15,237,'FIRST entrance-void guard consumes50floor strip: northy2735–2785; Southbridgeclear1017.5 after27finish+18trim.',2.8),T(15,246,'ProtectedstairEastwall isGROUNDonly; uppergalleryguard is not a new fullheight wall cutting off the top landing.',2.8),T(15,255,'Noses remain0/1725/3450 with integralRCwearing: actual RC-floor80overlay joint must not add80 to finalriser.',2.8),T(15,264,'Geometry is one authored reservation. ADK§1.34/Diagram3.1 references do not certify the assembly or a real occupant.',2.8));
const stairSvg=wrapSheet('OPEN NORTH LOGGIA / STAIR AND GUARD GEOGRAPHY','One27dry/30wet trial. Rail and guard projections are real occupied space; body territory is not a clear-width label.',st.join(''));
candidate.wholeHouseFit={listedProxyPass:candidate.actions.pass,footprintPass:candidate.fullHouseFootprint.pass,pass:false,remaining:['Resolve all recorded whole furniture/wall overlaps, including frontheads.','Rebind actual front-single door/closed-room paths after complete finish/frame correction.','Join IAS familydoor arm/regrip and all wet30 boundary patches.'],scope:'No actual product/force/material/fire/physical certification is made a substitute for these internal geometry corrections.'};
for(const [name,body]of Object.entries({'open-north-loggia.json':JSON.stringify(candidate,null,2)+'\n','open-north-loggia.svg':svg,'open-north-loggia-sections.svg':sectionSvg,'open-north-loggia-exterior.svg':exteriorSvg,'open-north-loggia-stair.svg':stairSvg})){const p=new URL(name,OUT);if(process.argv.includes('--check')){if(readFileSync(p,'utf8')!==body)throw Error('Stale '+name)}else writeFileSync(p,body)}
if(process.argv.includes('--require-whole-house-fit')&&!candidate.wholeHouseFit.pass)throw Error('Explicit whole-house fit debts remain');
if(process.argv.includes('--require-spatial-pass')&&!candidate.actions.pass)throw Error('Finite spatial witness failed');
console.log(JSON.stringify({wholeHouseFootprintPass:candidate.fullHouseFootprint.pass,wholeHouseFitPass:candidate.wholeHouseFit.pass,spatialPass:candidate.actions.pass,failedRoutes:candidate.actions.witnesses.filter(w=>!w.pass).map(w=>w.id),files:['open-north-loggia.json','open-north-loggia.svg','open-north-loggia-sections.svg','open-north-loggia-exterior.svg','open-north-loggia-stair.svg'],status:'first candidate, not adopted',weatherAxes:[4377.5,7622.5],knownInterfaces:candidate.knownInterfaces.length}));
