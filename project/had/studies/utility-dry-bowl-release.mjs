import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {deriveCurrentHouse} from './current-house.mjs';
import {deriveUtilityWideCapture} from './utility-wide-capture.mjs';
import {utilityHeadObstacles,utilityHeadSweeps} from './incoming-water-terminal.mjs';
import {exactSegmentBoxDistance,finiteBends} from './incoming-water-geometry.mjs';
import {pathSeparation} from './service-interface-geometry.mjs';

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const clearance=25,setting=10,reserve=clearance+setting;
const round=value=>Number(value.toFixed(2));
const swept=(box,end)=>[...box.slice(0,3).map((v,i)=>v+Math.min(0,end[i])),...box.slice(3).map((v,i)=>v+Math.abs(end[i]))];
const aabb=(a,b)=>Math.hypot(...a.slice(0,3).map((v,i)=>Math.max(v-b[i]-b[i+3],b[i]-v-a[i+3],0)))-setting;
const closedArcGap=(left,right,box)=>exactSegmentBoxDistance(left,right,box);

export function deriveUtilityDryBowlRelease(){
  const {model}=deriveCurrentHouse();
  const earlier=deriveUtilityWideCapture();
  const host=read('../../ias/studies/utility-host-revised-route.json');
  const fixed=utilityHeadObstacles(model);
  fixed.H0=earlier.hot.body;
  fixed.hotCap=earlier.hot.cap;
  fixed.frame[0]-=10;
  const frame=Object.fromEntries(Object.entries(host.geometry.frame).map(([id,b])=>[id,[b[0]-10,...b.slice(1)]]));
  const west=frame['NS rail at x10975 / z850'];
  const east=frame['NS rail at x11525 / z850'];
  const railSlot=[west[0]+west[3],east[0]];
  const stockInternalWidth=500;
  const dryProfile=[11020,815,680,440,450,220];
  const initialLift=385;
  const firstRise=swept(dryProfile,[0,0,initialLift]);
  const oldMaxSideRaw=(railSlot[1]-railSlot[0]-stockInternalWidth)/2;
  const physicalColdAttachments={coldWasherStop:[10775,1225,725,50,50,50],lowerRack:[10875,700,290,20,485,20],
    washer:fixed.washer,wasteCap:host.geometry.retainedPipes['retained accessible waste cap domain']};
  const initialObstacleMargins=Object.fromEntries(Object.entries({...physicalColdAttachments,
    ...Object.fromEntries(Object.entries(frame).filter(([id])=>id!=='temporary carry bar')),H0:fixed.H0,hotCap:fixed.hotCap,coldCap:fixed.coldCap})
    .map(([id,box])=>[id,round(aabb(firstRise,box))]));

  const main=read('./incoming-water.json');
  const cold=finiteBends(main.utility.vertices.cold);
  const hot=finiteBends(earlier.hot.backbone);
  const hotTail=finiteBends(earlier.hot.terminal,25);
  const coldBranches=Object.values(main.utilitySuccessor.vertices).slice(0,2).map(path=>finiteBends(path,25));
  const waste=[[11270,940,610],[10760,940,597.25],[10760,1275,588.875],[10875,1275,586]];
  const pipeGroup=[['cold backbone',cold,37],['hot backbone',hot,37],['hot fixed tail',hotTail,25],
    ...coldBranches.map((path,i)=>[`cold retained branch ${i+1}`,path,25]),['fixed waste', {path:waste,hausdorffError:0},25]];
  const pipeGap=(box,pipe,rad)=>Math.min(...pipe.path.slice(1).map((v,i)=>closedArcGap(pipe.path[i],v,box)))-rad-pipe.hausdorffError-setting;
  const initialPipeMargins=Object.fromEntries(pipeGroup.map(([id,path,r])=>[id,round(pipeGap(firstRise,path,r))]));

  // Positively guided at the template before the load has passed the deck.
  // The rim itself is a bearing contact there, not a 25 mm free-running gap.
  // Later translations use a larger enclosure including the hand-set tilt/yaw.
  const angularControl={yawDegrees:5,pitchAndRollDegrees:2};
  const packageQuietDimensions=[470,480,430];
  const [w,d,h]=packageQuietDimensions;
  // Bound the absolute coefficients of Rz(yaw) · Ry(pitch) · Rx(roll).
  const yErr=Math.sin(angularControl.yawDegrees*Math.PI/180);
  const tilt=Math.sin(angularControl.pitchAndRollDegrees*Math.PI/180);
  const boxFitted=[
    w+(yErr+tilt**2)*d+(tilt+yErr*tilt)*h,
    yErr*w+(1+yErr*tilt**2)*d+(yErr*tilt+tilt)*h,
    h+tilt*(w+d),
  ].map(value=>Math.ceil(value+3));
  const centre=[11240,1040];
  const raisedLow=dryProfile[2]+initialLift+(h-boxFitted[2])/2;
  const lifted=[centre[0]-boxFitted[0]/2,centre[1]-boxFitted[1]/2,raisedLow,...boxFitted];
  const moves=[[0,0,0],[0,720,0],[0,720,-285]];
  const clearSweeps=utilityHeadSweeps(lifted,moves,fixed).map(stage=>({
    stage:stage.stage,box:stage.box,clearanceMM:round(Math.min(...stage.obstacles.map(row=>row.gapMM-setting),
      ...pipeGroup.map(([_,path,r])=>pipeGap(stage.box,path,r)))),
  }));
  const basinComparator={
    maker:'Franke BOX BXX 110 40',article:'127.0369.215',outer:[440,450],inner:[400,410,200],
    source:'https://www.franke.com/gb/en/home-solutions/products/kitchen-sinks/product-detail-page.html/127.0369.215.html',
    adoption:false,
  };
  const contact=[
    {point:[11028,862,897],type:'southwest'}, {point:[11452,862,897],type:'southeast'},
    {point:[11028,1218,897],type:'northwest'}, {point:[11452,1218,897],type:'northeast'},
  ];
  const limitHeadKG=25;
  const designGravityN=limitHeadKG*9.81*1.5;
  const combinedCg={maxHorizontalErrorMM:5,minimumEyeAboveCgMM:240,maximumFreeTiltDegrees:round(Math.atan2(Math.hypot(5,5),240)*180/Math.PI)};
  const restPlan=[10965,1485,550,550],restBase=[10965,1505,0,365,510,735];
  const restCantilever=restPlan[0]+restPlan[2]-restBase[0]-restBase[3];
  const rest={plan:restPlan,base:restBase,rimZ:1000,lowerDryShellZ:780,baseMinimumKG:50,
    baseMaximumHorizontalCgOffsetMM:35,minimumIndependentBaseOverturnMomentNM:round(50*9.81*(restBase[3]/2-35)/1000),
    adversePullN:50,adversePullHeightMM:1000,keeperRequiredLateralAndUpliftN:200,
    baseToActualRadiatorMM:round(aabb(restBase,fixed.radiator)),
    cantilever:{maxProjectionMM:restCantilever,oneSaddleDesignForceN:500,
      squareHollowSectionMM:[40,40,3],nominalStripBendingMPa:round(500*restCantilever/((40**4-34**4)/12/20))},
    dryBowlCgAtLeastInsideBaseXMM:restBase[0]+restBase[3]-centre[0]-35,
    throat:'Slimtop factory-specific cutout supported by an independent rigid ring. Positively lock two opposed keepers before slacking. Keep the loose wet tray and fixed drain off this bearing.'};

  const fan=model.architecturalServices.fanAccess.find(e=>e.id==='utility');
  const pivot=[11350,2380], armLength=1750,armBottom=2150,sectionDepth=152.4,halfFlangeWidth=88.7/2;
  const armAxisZ=armBottom+sectionDepth/2;
  const armRadius=Math.hypot(halfFlangeWidth,sectionDepth/2);
  const pathCentres=moves.slice(0,2).map(d=>centre.map((p,i)=>p+d[i]));
  const rejectedOldRest=[10505,1800];
  const headings=[centre,[11240,1800],rejectedOldRest].map(c=>Math.atan2(c[1]-pivot[1],c[0]-pivot[0]));
  const [angle0,angle1]=[Math.min(...headings),Math.max(...headings)];
  const count=Math.ceil((angle1-angle0)/(Math.PI/720));
  const deviation=armLength*(angle1-angle0)/(2*count);
  const arms=Array.from({length:count+1},(_,i)=>{
    const t=angle0+(angle1-angle0)*i/count;
    return [130,armLength].map(s=>[pivot[0]+s*Math.cos(t),pivot[1]+s*Math.sin(t),armAxisZ]);
  });
  const armObstacles=[['fan insulated duct and supports',fan.path,fan.selectedRoute.maximumCollarOD/2+20],
    ['fan drain',fan.ceilingTrapDrainPort.path,fan.ceilingTrapDrainPort.maximumDrainOD/2],
    ...pipeGroup.slice(0,2).map(([id,pipe,rad])=>[id,pipe.path,rad+pipe.hausdorffError])];
  const armGaps=Object.fromEntries(armObstacles.map(([id,path,r])=>[id,round(Math.min(...arms.map(arm=>
    pathSeparation(arm,path)))-armRadius-r-deviation-setting)]));
  const actualWallZ=model.sections.firstFloorRC.bottom;
  const straightAxis=[[centre[0],model.envelope,armAxisZ],[centre[0],2453,armAxisZ]];
  const straightArmGaps=Object.fromEntries(armObstacles.map(([id,path,r])=>[id,
    round(pathSeparation(straightAxis,path)-armRadius-r-setting)]));
  const additionalFanPanel=model.architecturalServices.utility.PVinverter;
  const pvZ=model.architecturalServices.utility.PVinverterLocalZ;
  const pvBox=[...additionalFanPanel.slice(0,2),pvZ[0],...additionalFanPanel.slice(2),pvZ[1]-pvZ[0]];
  const armAgainstRoom=Math.min(...arms.flat().map(point=>Math.min(point[0]-9397,(model.shell-model.envelope)-point[0],point[1]-model.envelope,2453-point[1])))-armRadius-deviation-setting;
  straightArmGaps.PVinverter=round(closedArcGap(...straightAxis,pvBox)-armRadius-setting);
  armGaps.PVinverter=round(Math.min(...arms.map(([a,b])=>closedArcGap(a,b,pvBox)))-armRadius-deviation-setting);
  armGaps.ordinaryWall=round(armAgainstRoom);
  const trolleyRadius=180;
  const trolleyBand=[1850,armBottom+35];
  const trolleyBoxes=utilityHeadSweeps([centre[0]-trolleyRadius,centre[1]-trolleyRadius,trolleyBand[0],2*trolleyRadius,2*trolleyRadius,trolleyBand[1]-trolleyBand[0]],moves.slice(0,2),fixed);
  const trolleyGaps=trolleyBoxes.map(stage=>round(Math.min(...pipeGroup.map(([_,path,r])=>pipeGap(stage.box,path,r)),
    ...armObstacles.slice(0,2).map(([_,path,r])=>pipeGap(stage.box,{path,hausdorffError:0},r)))));
  const trolleyTopEyeZ=2000,hoistHeadroom=245;
  const conservativeRaisedHookZ=1530;
  const simpleSpan=2453-model.envelope;
  const liveN=(1.5*limitHeadKG+14.5+2.9)*9.81;
  const beamMassKg=16*simpleSpan/1000;
  const bearing={beamWeightKg:round(beamMassKg),minimumEachEndDesignVerticalN:1500,
    grossVerticalComparisonN:round(liveN+beamMassKg*9.81),
    steelSimpleSpanMomentUpperNM:round(liveN*simpleSpan/4000+beamMassKg*9.81*simpleSpan/8000),
    steelSimpleSpanDeflectionMM:round(liveN*simpleSpan**3/(48*210000*8340000)+
      5*beamMassKg*9.81*simpleSpan**3/(384*210000*8340000)),
    northernAnchorTerritory:[11190,11300,2453,2647],southAnchorAtInnerFaceY:model.envelope,
    scope:'Pin the removable straight rail to designed independent north return and south wall supports. Confirm native lining, anchors, bracket geometry, movement and suspension. Preserve utilities and fire/air boundaries.'};
  const manualNorthBodyCentreMaximum=2453-300-reserve;
  const manualNorthBodyRequired=pathCentres.at(-1)[1]+boxFitted[1]/2+300+reserve;

  assert(oldMaxSideRaw<reserve);
  assert(Object.values(initialObstacleMargins).every(v=>v>=clearance));
  assert(Object.values(initialPipeMargins).every(v=>v>=clearance));
  assert(clearSweeps.every(row=>row.clearanceMM>=clearance));
  assert(armGaps['cold backbone']<0&&armGaps['hot backbone']<0);
  assert(Object.values(straightArmGaps).every(v=>v>=clearance),JSON.stringify(straightArmGaps));
  assert(rest.baseToActualRadiatorMM>=clearance);
  assert(manualNorthBodyCentreMaximum<manualNorthBodyRequired);
  assert(trolleyGaps.every(v=>v>=clearance));
  assert(combinedCg.maximumFreeTiltDegrees<angularControl.pitchAndRollDegrees);
  return {disposition:'PREFER_SPLIT_DRY_BOWL_FOR_JOINED_DETAIL',basinComparator,
    rejectStock:{railSlot,stockInternalWidth,maximumOuterWidthForFreeLoadedLiftMM:railSlot[1]-railSlot[0]-2*reserve,
      oldMaximumRawSideGapMM:oldMaxSideRaw,adoptedRawReserveMM:reserve},
    firstLift:{dryProfile,travelMM:initialLift,initialObstacleMargins,initialPipeMargins,
      removedBeforeLift:['Independent tap tails stay on the isolated fixed deck or their dry rack.','Strip the strainer, overflow tail and trap into a second supported wet receiver. Only the dry stainless shell rises.'],
      retained:['Complete Ø74 cold cap and bracket silhouette, not an approved native part.','Fixed washer, capped waste branch and the retained H0 assembly.'],
      cutout:'Actual slimtop template and all release clips must be exposed from above or below; guided from rest through the normal support lip without levering. Four dedicated positive under-rim clamp reliefs go in the dry deck. No holes drilled into the native bowl.'},
    rejectedManual:{manualNorthBodyCentreMaximum,manualNorthBodyRequired,
      shortfallMM:manualNorthBodyRequired-manualNorthBodyCentreMaximum,
      scope:'Following the load on foot on its north side through arrival fails even before choosing a hand-loaded mass. Underframe clips can be guided from protected positions while the independent rail supports the complete shell.'},
    capture:{packageQuietDimensions,boxFitted,angularControl,contact,grossDryLimitKG:limitHeadKG,
      singlePointMinimumDesignVerticalN:round(designGravityN),independentLatchMinimumN:500,combinedCg,
      routeCentres:pathCentres,moves,clearSweeps,rest},
    independentSupport:{straightAxis,clearancesMM:straightArmGaps,trolleyGaps,
      rejectedSwingArm:{pivot,armLength,clearancesMM:armGaps},armBottom,armTop:armBottom+sectionDepth,
      aboveBeamToSlabMM:round(actualWallZ-armBottom-sectionDepth),bearing,
      standardHoist:{name:'YaleMINI 360 250',article:'192084199',capacityKG:250,headroomMM:hoistHeadroom,
        source:'https://www.cmco.com/en-gb/products/hoisting--lifting-equipment/manual-hoists/hand-chain-hoists/yalemini-360-hand-chain-hoist/'},
      standardTrolley:{name:'Yale HTP 500 A locking variant',comparisonArticle:'N05141273',admissibleFlangeWidthMM:[50,220],maximumFlangeThicknessMM:25,
        actualAuthorFlangeMM:[88.7,7.7],source:'https://www.cmco.com/en-gb/products/hoisting--lifting-equipment/trolleys-and-trolley-clamps/manual-trolleys/yale-htp-push-and-gear-trolleys/'},
      trolleyTopEyeZ,conservativeRaisedHookZ,hookHeightReserveMM:trolleyTopEyeZ-hoistHeadroom-conservativeRaisedHookZ-setting,
      westOperatedControls:{maximumGuideLineX:10925,packageClearanceMM:round(lifted[0]-10925-setting),maximumHotCapX:fixed.hotCap[0]+fixed.hotCap[3],
        capToGuideXMM:10925-(fixed.hotCap[0]+fixed.hotCap[3])-setting,
        scope:'Reserve west operation for travel and floor-end points. Prove the loaded operating line, emergency stop, hold, controlled orientation and people in each state.'},
      mountedGuideAndSupportsQualified:false},
    physicalAssemblyAndWaterAccepted:false};
}

function drawing({capture,independentSupport:support}){
  const y=v=>118+(v-430)*.385;
  const z=v=>561-v*.2;
  const text=(a,b,value)=>`<text x="${a}" y="${b}">${value}</text>`;
  const box=(a,b,c,d,fill)=>`<rect x="${y(a)}" y="${z(d)}" width="${y(b)-y(a)}" height="${z(c)-z(d)}" fill="${fill}" stroke="#516660"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 725" role="img" aria-labelledby="title desc">
<title id="title">Lift the dry bowl onto an independently supported first rest</title>
<desc id="desc">Section looking east with a straight lift beam, dry bowl in three transfer states, and an elevated rim stand over a retained radiator.</desc>
<style>text{font:16px sans-serif;fill:#273f38}.title{font:bold 28px sans-serif}.heading{font:bold 19px sans-serif}</style>
<rect width="1100" height="725" fill="#fbf8ed"/>
<text x="35" y="45" class="title">Renew the bowl without moving the deck</text>
${text(35,73,'North–south projection · Dimensions in millimetres to house datum')}
${box(429.5,2453,support.armBottom,support.armTop,'#98aea8')}
${box(750,1335,840,900,'#ddd1b8')}
${box(815,1265,680,900,'#abcbcc')}
${box(815,1265,1065,1285,'#c3ddde')}
${box(1535,1985,1065,1285,'#b3d4d3')}
${box(1535,1985,780,1000,'#a7c7bd')}
${box(1485,2035,977,1000,'#bdb493')}
${box(1505,2015,0,80,'#cfc1a8')}
${box(1778,2428,100,700,'#dedad0')}
<path d="M${y(1040)} ${z(1320)}V${z(1420)}H${y(1760)}V${z(1315)}" fill="none" stroke="#41665b" stroke-width="3"/>
<circle cx="${y(1040)}" cy="${z(1990)}" r="8" fill="#314c40"/>
<line x1="${y(1040)}" x2="${y(1040)}" y1="${z(1990)}" y2="${z(1490)}" stroke="#314c40" stroke-width="3"/>
${text(260,93,'One straight rail · Z2150 underside')}
${text(137,323,'385 vertical')}
${text(455,268,'720 north')}
${text(749,311,'285 down')}
${text(131,407,'Fixed deck')}
${text(733,390,'First rest Z1000')}
${text(747,486,'Existing radiator')}
${text(758,563,'Ballast before landing')}
<line x1="35" x2="1065" y1="590" y2="590" stroke="#a6aaa1"/>
${text(35,622,'440 mm dry shell clears the frame. The stock 500 mm internal bowl exceeds the 450 mm loaded-lift width.')}
${text(35,654,`Full fixture: ${capture.boxFitted.join(' × ')}. Transfer and lowering clear by ${capture.clearSweeps.map(s=>s.clearanceMM).join(' / ')} mm.`)}
${text(35,684,'Actual attachments, independent supports, wet parts and loaded tests remain required.')}
</svg>
`;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const result=deriveUtilityDryBowlRelease();
  const outputs={json:JSON.stringify(result,null,2)+'\n',svg:drawing(result)};
  for(const [extension,content] of Object.entries(outputs)){
    const file=new URL(`./utility-dry-bowl-release.${extension}`,import.meta.url);
    if(process.argv.includes('--write'))writeFileSync(file,content);
    else if(process.argv.includes('--check'))assert.equal(readFileSync(file,'utf8'),content);
    else if(extension==='json')process.stdout.write(content);
  }
}
