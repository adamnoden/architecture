import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {deriveCurrentHouse} from './current-house.mjs';

const {station,selection}=JSON.parse(readFileSync(new URL('./incoming-water.json',import.meta.url),'utf8'));
const {entry,geometry,drain}=station;
const {spill}=JSON.parse(readFileSync(new URL('../../ias/studies/household-water.json',import.meta.url),'utf8'));
const stressFlowsLmin=spill.flowsLmin;
const contains=([x,y],[a,b,,w,h])=>x>=a&&x<=a+w&&y>=b&&y<=b+h;
const panMargin=([x,y],[a,b,,w,h])=>Math.min(x-a,a+w-x,y-b,b+h-y);
const intervalDistance=(value,[minimum,maximum])=>Math.max(minimum-value,value-maximum,0);

export function traceInletFirstWetting(){
  const {model,id}=deriveCurrentHouse();
  if(id!==selection)throw new Error('Reconcile incoming-water station with changed current house before tracing first wetting.');
  const utilityWall=model.groundWalls.find(wall=>wall.id==='utility-north');
  const plantWall=model.groundWalls.find(wall=>wall.id==='plant-intermediate-arch');
  const protectedDoor=model.plantReferenceDoor;
  const easternFace=model.shell-model.envelope;
  const [southFace,northFace]=[utilityWall.finishedFaces[1],plantWall.finishedFaces[0]];
  const [utilityOpening,plantOpening]=[utilityWall.holes[0],plantWall.holes[0]];
  const passageY=protectedDoor.effectiveOpenClearY;
  const protectedThresholdX=model.groundWalls.find(wall=>wall.id==='service-spine').finishedFaces[1];
  const [,entryY,entryZ]=entry.point;
  const insideEntry=[easternFace,entryY,entryZ];
  const panOnly=([x,y,z])=>{
    const candidates=Object.entries(geometry.pans).map(([side,p])=>({side,marginMM:panMargin([x,y],p)}));
    const firstPan=candidates.find(p=>p.marginMM>0);
    const seam=candidates.some(p=>p.marginMM===0);
    return {point:[x,y,z],projectedFirstLocalSurface:firstPan?.side??(seam?'pan seam':'floor or wall toe'),
      localPlanMarginMM:firstPan?.marginMM??Math.max(...candidates.map(p=>p.marginMM)),
      actualCaptureCredit:false};
  };
  const localPoints=[{source:'Entry sleeve at inner face',...panOnly(insideEntry),positiveUpstreamCut:'B0'},
    ...geometry.cartridges.flatMap(c=>c.ends.map((y,i)=>({source:`${c.id} union ${i+1}`,
      ...panOnly([c.x,y,c.bottom]),positiveUpstreamCut:c.id==='I0'?'B0':'I0',possibleReturnHold:'Isolate and prove the downstream side independently before opening.'}))),
    ...drain.definitions.map(d=>({source:`${d.id} controlled spout`,...panOnly(d.spout),
      expectedPan:d.pan,positiveUpstreamCut:d.id==='D0'?'B0':d.id==='D1'?'I0':d.id==='DU'?'U0':'P0'})),
  ];
  const overflowWitnesses=Object.entries(geometry.pans).map(([side,[x,y,z,w,h,d]])=>{
    const witness=[x,y+h/2,z+d];
    return {side,witness,nearestWallToePlanDistancesMM:{east:easternFace-(x+w),south:y-southFace,north:northFace-(y+h)},
      crossingPlanDistancesMM:{protectedHall:Math.hypot(x-protectedThresholdX,intervalDistance(witness[1],passageY)),
        utility:Math.hypot(intervalDistance(x,utilityOpening),witness[1]-southFace),
        plant:Math.hypot(intervalDistance(x,plantOpening),northFace-witness[1])}};
  });
  const stationPan=drain.requiredNetLitresEach;
  const volumes=[{name:'Empty receiver',occupiedLitres:0},{name:'After one controlled batch',occupiedLitres:drain.maximumBatchLitres}];
  const rateComparisons=volumes.map(({name,occupiedLitres})=>({name,occupiedLitres,headroomLitres:stationPan-occupiedLitres,
    secondsFromFirstCapturedWater:stressFlowsLmin.map(litresPerMinute=>({litresPerMinute,seconds:(stationPan-occupiedLitres)*60/litresPerMinute}))}));
  const power=model.architecturalServices.utility;
  const safety=model.architecturalServices.plant.independentSafety;
  const ordinaryStance=geometry.ordinaryBody.at(-1);
  const [southPanWest,southPanY,,southPanWidth,southPanHeight]=geometry.pans.south;
  const southPanEast=southPanWest+southPanWidth;
  const sleeveToPanMM=easternFace-southPanEast;
  const minimumDripLapMM=25;
  const settingMM=5;
  const sleeveDripNorthReserveMM=southPanY+southPanHeight-entryY-entry.formedBore/2;
  const sleeveDripSouthReserveMM=entryY-southPanY-entry.formedBore/2;
  const entryWitnessProjection=[35,50,60].map(projectionMM=>({projectionMM,
    lipX:easternFace-projectionMM,lapAfterTwoSettingsMM:projectionMM-sleeveToPanMM-2*settingMM,
    geometryPass:projectionMM-sleeveToPanMM-2*settingMM>=minimumDripLapMM}));
  const westWitnessX=southPanWest;
  const westStanceGapMM=westWitnessX-ordinaryStance[0]-protectedDoor.retainedBodyRadius;
  return {status:'LOCAL_PROJECTION_NOT_ADOPTION',selection:id,receiver:{targetNetLitres:stationPan,batchLitres:drain.maximumBatchLitres,
    spoutsConfinedInProjection:drain.definitions.every(d=>contains(d.spout,d.receiver)),rateComparisons,
    blockedWitnessFirstUncapturedVolumeLitres:0,escapingJetCaptureCredit:false},entry:{point:entry.point,insideFaceProjection:insideEntry,
      exceedanceEastOfPanMM:sleeveToPanMM,cut:'B0',boundaryCutForB0:'provider upstream isolation',
      localDripFlashing:{minimumDripLapMM,settingMM,minProjectionMM:sleeveToPanMM+minimumDripLapMM+2*settingMM,
        sleeveDripNorthReserveMM,sleeveDripSouthReserveMM,entryWitnessProjection,jetCaptureCredit:false}},
    localPoints,overflowWitnesses,protectedThreshold:{eastFaceX:protectedThresholdX,passageY,width:protectedDoor.effectiveOpenClearWidth,westStanceGapMM,
      sealsOrFloorUpstandProven:false},utilityElectrical:{body:power.electricalStation,workingField:power.electricalWorkingField},
    plantControls:model.architecturalServices.plant.controlsHydraulics,
    safetyDischarge:{tundish:safety.tundish,outfall:safety.outfall,creditedAsFloorDrain:false},
    holds:['A vertical projection is a first receiving-surface hypothesis, with no allowance for a pressure jet, tracked water or splashing.',
      'Floor level, thresholds, upstand ends, waterproofing, insulation exposure, water spread and drying are unproved in the local lobby.',
      'No automatic shut-off, emergency floor outfall, safe wet electrical work or wet-door outflow bound is modelled.']};
}

if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(traceInletFirstWetting(),null,2));
