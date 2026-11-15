import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {deriveCurrentHouse} from './current-house.mjs';
import {deriveFixedStation} from './inlet-fixed-station.mjs';
import {compareInletSite} from './incoming-water-site-applicability.mjs';
import {exactSegmentBoxDistance,finiteBends} from './incoming-water-geometry.mjs';
import {pathSeparation} from './service-interface-geometry.mjs';

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const setting=10;
const target=25;
const reserve=setting+target;
const round=value=>Number(value.toFixed(2));
const up=path=>path.map(([x,y])=>[x,y,0]);
const pathRectGap=(path,r,rect)=>Math.min(...path.slice(1).map((end,i)=>
  exactSegmentBoxDistance(...up([path[i],end]),[...rect.slice(0,2),0,...rect.slice(2),1])))-r-setting;
const pathCircleGap=(path,point,r,obstacleR)=>pathSeparation(up(path),up([point,point]))-r-obstacleR-setting;

function overheadGap(path,r,height,pipe){
  return Math.min(...path.slice(1).flatMap((end,i)=>{
    const start=path[i];
    const min=start.map((v,j)=>Math.min(v,end[j])-r);
    const span=start.map((v,j)=>Math.abs(v-end[j])+2*r);
    const prism=[...min,0,...span,height];
    return pipe.path.slice(1).map((v,j)=>exactSegmentBoxDistance(pipe.path[j],v,prism));
  }))-37-pipe.hausdorffError-setting;
}

export function derivePlantReleaseRoute(){
  const {model}=deriveCurrentHouse();
  const plant=model.architecturalServices.plant;
  const {cylinder,primaryBuffer:buffer,independentSafety:safety}=plant;
  const {dock,opening,section,plateComparison}=read('../../mat/studies/plant-threshold.json');
  const left=model.groundWalls.find(w=>w.id==='service-spine').finishedFaces[1];
  const bottom=model.groundWalls.find(w=>w.id==='plant-intermediate-arch').finishedFaces[1];
  const top=model.groundWalls.find(w=>w.id==='plant-north').finishedFaces[0];
  const east=model.shell-model.envelope;
  const emitter=model.architecturalServices.emitters.find(e=>e.id==='plant-N').completePlanWithValvesAndBrackets;
  const [southJamb,northJamb]=opening.clearY;
  const eastDepth=12090-east;
  const rooms={
    westWall:[left-97,bottom,97,top-bottom],
    southWall:[left,bottom-194,east-left,194],
    northWall:[left,top,east-left,519.5],
    eastSouth:[east,bottom,eastDepth,southJamb-bottom],
    eastNorth:[east,northJamb,eastDepth,top-northJamb],
    riser:plant.riserGross,hydraulicControls:plant.controlsHydraulics,emitter,
  };
  const bufferCentre=buffer.station.slice(0,2).map((v,i)=>v+buffer.station[i+2]/2);
  const d2=safety.tundish.slice(0,2);
  const expansion=safety.expansion.slice(0,2);
  const lowThroat=plant.riserGross[1]-bottom;
  const cylinderR=415,bufferR=375;
  const approachY=bottom+cylinderR+reserve+1;
  const a=[[left+cylinderR+reserve+1,approachY],[10515,approachY],[10515,4560],[11050,4560],[11400,4575],[12590,4575]];
  const b=[bufferCentre,[11100,4575],[12590,4575]];
  const p0=finiteBends(deriveFixedStation().paths.plant);
  const heightLimit=opening.height-reserve;
  const cylinderReserveHeight=1830;
  const oldBufferHeight=buffer.maxRetainedHeight+buffer.maxDeck;
  const roomGaps=(path,r)=>Object.fromEntries(Object.entries(rooms).map(([id,rect])=>[id,round(pathRectGap(path,r,rect))]));
  const cylinderPlan={...roomGaps(a,cylinderR),
    retainedBuffer:round(pathCircleGap(a,bufferCentre,cylinderR,buffer.completeDiameter/2)),
    liveD2Drop:round(pathCircleGap(a,d2,cylinderR,60)),
    fixedP0:round(overheadGap(a,cylinderR,cylinderReserveHeight,p0)),
  };
  const bufferPlan={...roomGaps(b,bufferR),
    retainedCylinder:round(pathCircleGap(b,cylinder.centre,bufferR,cylinder.body[2]/2)),
    liveD2Drop:round(pathCircleGap(b,d2,bufferR,60)),
    liveExpansionEnvelope:round(pathCircleGap(b,expansion,bufferR,205)),
    retainedD1:round(pathSeparation(up(b),up([safety.directTopTP,safety.manifold,safety.tundish].map(p=>p.slice(0,2))))-bufferR-60-setting),
    fixedP0:round(overheadGap(b,bufferR,heightLimit,p0)),
  };
  const captureOffset=a[0].map((value,i)=>value-cylinder.centre[i]);
  const topValveRadius=37; // complete retained assembly limit around the named relief port
  const topValveGaugeMargin=cylinderR-Math.hypot(...a[0].map((value,i)=>value-safety.directTopTP[i]))-topValveRadius;
  const dockMoves=[{id:'cylinder',r:cylinderR},{id:'buffer',r:bufferR}].map(({id,r})=>{
    const [_,y]=a.at(-1);
    const [plateMin,plateMax]=section.servicePlateWidthY;
    return {id,centredY:y,sillPlanMarginMM:Math.min(y-r-plateMin,plateMax-(y+r))-setting,
      toCollectorAtFirstRestMM:a.at(-1)[0]-r-section.collectorX[1]-setting,
      dockSouthGuardWorkWidthMM:y-r-(dock.plan[2]+50)-setting};
  });
  const gradeCases=[['dock-level',dock.outerEdgeZ],['reference low grade',dock.outsideGrade]].map(([id,grade])=>{
    const evaluate=height=>compareInletSite({landingGradeMM:grade,carrierHeightMM:height});
    const heightCases=[['cylinder complete reservation',cylinderReserveHeight],['buffer maximum doorway package',heightLimit],
      ['buffer former full retained height plus deck',oldBufferHeight],['buffer manufacturer body plus 100 deck',buffer.height+buffer.maxDeck]].map(([load,height])=>{
      const c=evaluate(height);
      const gap=(modeSnippet,checkSnippet)=>c.modes.find(m=>m.id===modeSnippet).checks.find(k=>k.name.includes(checkSnippet)).marginMM;
      return {load,height,doorAfterSettingMM:opening.height-height-setting,doorReserveSurplusMM:heightLimit-height,
        gantryHeightSurplusMM:gap('temporary-gantry','over-guard'),gantryHookTravelSurplusMM:gap('temporary-gantry','hook travel'),
        levelBridgeAdjustmentSurplusMM:gap('level-bridge','adjusted landing')};
    });
    return {id,grade,heightCases};
  });
  assert.equal(cylinder.cartRadius,425);
  assert.equal(buffer.height,1975);
  assert.equal(a[1][1],a[0][1]);
  assert(Object.values(cylinderPlan).every(gap=>gap>=target));
  assert(Object.values(bufferPlan).every(gap=>gap>=target));
  assert(topValveGaugeMargin>=setting);
  assert(dockMoves.every(row=>row.sillPlanMarginMM>=target&&row.toCollectorAtFirstRestMM>=target&&row.dockSouthGuardWorkWidthMM>=650));
  return {
    disposition:'PREFERRED_EAST_ONLY_RELEASE_AND_NEAR_LEVEL_RECEIVING_RESERVATION',
    offsets:{settingMM:setting,requiredAfterSettingMM:target,requiredRawMM:reserve},
    planGeometry:{plant:[left,bottom,east,top],door:[east,southJamb,section.collectorX[1],northJamb],
      plate:[section.collectorX[0],section.servicePlateWidthY[0],section.collectorX[1],section.servicePlateWidthY[1]],
      dock:[dock.plan[0],dock.plan[2],dock.plan[1],dock.plan[3]],riser:rooms.riser,controls:rooms.hydraulicControls,emitter:rooms.emitter},
    oldCase:{fixedThroatMM:lowThroat,maximumCompleteWidthMM:lowThroat-2*reserve,oldDiameterMM:2*cylinder.cartRadius,
      oldCorridorDeficitMM:2*cylinder.cartRadius+2*reserve-lowThroat,
      oldOffsetGapsMM:roomGaps(model.storeExchange.path,cylinder.cartRadius),
      oldBufferDirectTurnExpansionMM:round(pathCircleGap([bufferCentre,[10700,4575],[12590,4575]],expansion,bufferR,179))},
    cylinder:{centrePath:a,completeRadiusMM:cylinderR,maximumTransportHeightMM:cylinderReserveHeight,plan:cylinderPlan,
      offsetFromVesselCentreMM:captureOffset,bodyToCarrierLineMM:round(cylinderR-cylinder.body[2]/2-Math.hypot(...captureOffset)),
      maximumRetainedReliefBodyRadiusMM:topValveRadius,reliefToCarrierLineMM:round(topValveGaugeMargin),
      catalogueComparator:{pressureBar:cylinder.stockMS103.workingBar,dryKG:cylinder.stockMS103.emptyKg,installedSelected:false}},
    buffer:{centrePath:b,completeRadiusMM:bufferR,article:buffer.article,manufacturerBodyMM:[buffer.body[2],buffer.height],listedDryAndFullKG:buffer.dryFullKg,
      maximumTransportHeightMM:heightLimit,maximumAdditionalHeightWith100DeckMM:heightLimit-buffer.height-buffer.maxDeck,
      maximumAdditionalHeightWith100DeckAtReferenceGantryMM:gradeCases[1].heightCases[3].gantryHeightSurplusMM,
      plan:bufferPlan,retainedExpansionCentre:expansion,retainedExpansionMaximumRadiusMM:205},
    docking:{firstRest:a.at(-1),dockMoves,gradeCases,
      declaredThresholdWheelComparisonN:round(plateComparison.oneWheelIncluding1p5_N),
      conservativeTotalDryLoadedMassComparisonKG:round(plateComparison.coarseMassKg),
      loadedHandoffQualified:false},
    requires:[
      'Whole dry fitted carrier, retained hardware and load restraints must meet each radius/height. Actual hold-down, door leaf parking, dry operator path and relative-level bearing remain required.',
      'Keep cylinder protection live during buffer replacement. Drain each independent circuit to zero pressure before working its cold, hot, primary and return connections.',
      'The cylinder may cross only after draining cold and removing the independently captured cold drop, short terminal, D1 connections and expansion stand. Keep fixed D2 and its open gravity relief route clear.',
      'Close actual product and support geometry, components and receiving-site evidence before adopting either arrangement.',
    ],
  };
}

function drawing({cylinder,buffer,docking,planGeometry}){
  const scale=5.15;
  const x=v=>55+(v-9300)/scale;
  const y=v=>590-(v-3400)/scale;
  const rect=(x1,y1,x2,y2,fill)=>`<rect x="${x(x1)}" y="${y(y2)}" width="${x(x2)-x(x1)}" height="${y(y1)-y(y2)}" fill="${fill}" stroke="#3d5250"/>`;
  const sizedRect=([x1,y1,width,depth],fill)=>rect(x1,y1,x1+width,y1+depth,fill);
  const path=(pts,color)=>`<polyline points="${pts.map(([px,py])=>[x(px),y(py)].join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="4"/>`;
  const label=(xs,ys,text)=>`<text x="${xs}" y="${ys}">${text}</text>`;
  const circle=(point,radius,style)=>`<circle cx="${x(point[0])}" cy="${y(point[1])}" r="${radius/scale}" ${style}/>`;
  const volume=(route,color)=>circle(route.centrePath[0],route.completeRadiusMM,`fill="none" stroke="${color}" stroke-dasharray="7 5" stroke-width="2"`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 740" role="img" aria-labelledby="title details">
<title id="title">Separate cylinder and buffer routes to the east dock</title>
<desc id="details">Plan of the 830 mm cylinder carrier and 750 mm buffer carrier, sharing the east crossing and clear of the retained southern D2 system.</desc>
<style>text{font:16px sans-serif;fill:#273e3a}.title{font:bold 30px sans-serif}.note{font:14px sans-serif}</style>
<rect width="1080" height="740" fill="#fbf7ed"/>
<text x="35" y="45" class="title">Turn the plant loads towards the east</text>
${label(35,74,'Plan in house coordinates · Separate service states and complete carrier profiles')}
${rect(...planGeometry.plant,'#eadfcb')}
${rect(...planGeometry.door,'#e8dec4')}
${rect(...planGeometry.dock,'#dce9df')}
${sizedRect(planGeometry.riser,'#c5cfda')}
${sizedRect(planGeometry.controls,'#abbcc3')}
${sizedRect(planGeometry.emitter,'#aac1c2')}
${rect(...planGeometry.plate,'#dbb8a0')}
${circle(buffer.retainedExpansionCentre,buffer.retainedExpansionMaximumRadiusMM,'fill="#cbdad6" stroke="#47655e"')}
${volume(cylinder,'#a34c3d')}
${volume(buffer,'#2a6c61')}
${path(cylinder.centrePath,'#a34c3d')}
${path(buffer.centrePath,'#2a6c61')}
<circle cx="${x(docking.firstRest[0])}" cy="${y(docking.firstRest[1])}" r="7" fill="#345a4a"/>
${label(87,245,'Riser')}
${label(179,330,'Expansion')}
${label(119,465,'Ø830 cylinder')}
${label(232,196,'Ø750 buffer')}
${label(369,150,'Hydraulic controls')}
${label(389,543,'Retained emitter')}
${label(564,320,'East threshold')}
${label(637,345,'Common first rest')}
${label(784,538,'Protected dock')}
${label(672,620,'D2 below and south')}
<path d="M55 605v10m0-5H${55+1000/scale}m0-5v10" fill="none" stroke="#3d5250"/>
${label(256,615,'1 m')}
<line x1="35" x2="1040" y1="648" y2="648" stroke="#86928c"/>
${label(35,675,'The 903 mm throat caps complete width at 833 mm after both 35 mm reserves.')}
${label(35,705,'The 2265 mm doorway package fits a near-level handoff but exceeds the reference low gantry by 140 mm.')}
</svg>
`;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const route=derivePlantReleaseRoute();
  for(const [extension,content] of Object.entries({json:JSON.stringify(route,null,2)+'\n',svg:drawing(route)})){
    const file=new URL(`./plant-release-route.${extension}`,import.meta.url);
    if(process.argv.includes('--write'))writeFileSync(file,content);
    else if(process.argv.includes('--check'))assert.equal(readFileSync(file,'utf8'),content);
    else if(extension==='json')process.stdout.write(content);
  }
}
