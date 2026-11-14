import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {compareLiftSill} from './incoming-water-lift-sill.mjs';

const threshold=JSON.parse(readFileSync(new URL('../../mat/studies/plant-threshold.json',import.meta.url),'utf8'));
const guide={
  pages:'7, 11–12, 18–19',
  accessDepthMM:700,doorFlapAboveDoorMM:150,
  shaftHeadExtraMM:[450,650],assemblyAboveShaftMM:[400,500],
  cabinetMM:{width:760,height:760,depth:210},remoteCabinetMaxMM:10000,
  cabinetIP:{withoutConverter:'IP54',withConverter:'IP44'},
};

export function compareLiftWeather(){
  const {dock,water,cargo}=threshold;
  const lift=compareLiftSill();
  const [dockStartX,upperSillX,dockSouthY,dockNorthY]=dock.plan;
  const [southY,northY]=lift.clearY;
  const clearDoorHeightMM=threshold.opening.height;
  const upperLandingZ=dock.outerEdgeZ;
  const accessStartX=upperSillX-guide.accessDepthMM;
  const noseX=Math.max(...cargo.map(row=>row.parkedNoseX));
  const shaftTopZ=guide.shaftHeadExtraMM.map(extra=>upperLandingZ+clearDoorHeightMM+extra);
  const assemblyCeilingZ=shaftTopZ.map((top,i)=>top+guide.assemblyAboveShaftMM[i]);
  const shaftFlapClearZ=upperLandingZ+clearDoorHeightMM+guide.doorFlapAboveDoorMM;
  const service={
    upperFaceX:[accessStartX,upperSillX],upperFaceClearY:lift.clearY,shaftFlapClearZ,
    shaftTopZ,assemblyCeilingZ,
    nominalParkToAccessMM:accessStartX-noseX,
    gateSweepOverlapMM:upperSillX-Math.max(lift.gateSweepWestX,accessStartX),
    frontFacingCabinetFlanksMM:[southY-dockSouthY,dockNorthY-northY],
    sideFacingCabinetOccupiedWidthMM:guide.cabinetMM.depth+guide.accessDepthMM,
    upperDockDepthMM:upperSillX-dockStartX,
  };

  // Plan catchments only. Centre the trial awnings on the clear opening
  // and use the full shaft width. Their supporting geometry is unselected.
  const awningY=[(southY+northY-lift.shaftWidthMM)/2,(southY+northY+lift.shaftWidthMM)/2];
  const upperAwningRunMM=1000;
  const lowerAwningRunMM=lift.lowerRampEastX-lift.shaftEastX;
  const catchments=[
    {name:'upper awning',x:[upperSillX-upperAwningRunMM,upperSillX],y:awningY},
    {name:'shaft roof',x:[upperSillX,lift.shaftEastX],y:awningY},
    {name:'lower awning to ramp toe',x:[lift.shaftEastX,lift.lowerRampEastX],y:awningY},
  ].map(row=>{
    const areaM2=(row.x[1]-row.x[0])*(row.y[1]-row.y[0])/1e6;
    return {...row,areaM2,runoffLS:areaM2*water.testRainMmH/3600};
  });
  const totalAreaM2=catchments.reduce((sum,row)=>sum+row.areaM2,0);
  const totalRunoffLS=catchments.reduce((sum,row)=>sum+row.runoffLS,0);
  const iceOrDebrisCases=catchments.map(row=>({
    blockedPrimary:row.name,flowToSeparateOverflowLS:row.runoffLS,
  }));
  const {depthMm,hydraulicDiameterMm,darcyF,minorK}=water.returnFlow;
  const reliefWidthM=water.reliefWidth/1000;
  const returnRunM=(water.gutterY[1]-water.gutterY[0])/1000;
  const approachAreaM2=reliefWidthM*depthMm/1000;
  const upperLevelAtFlow=q=>{
    const qM3S=q/1000;
    const idealHeadMM=1500*(qM3S**2/(9.81*reliefWidthM**2))**(1/3);
    const velocityHeadMM=1000*(qM3S/approachAreaM2)**2/(2*9.81);
    const approachLossMM=(1+darcyF*returnRunM/(hydraulicDiameterMm/1000)+minorK)*velocityHeadMM;
    return water.reliefCrest+5+idealHeadMM+approachLossMM;
  };
  const panToeZ=water.returnFlow.upperLevelWithLoss+water.returnFlow.remainingToToe;
  const baselineFlowLS=water.deckAndDoorLitresPerSecond;
  assert(Math.abs(upperLevelAtFlow(baselineFlowLS)-water.returnFlow.upperLevelWithLoss)<1e-9);
  const upperAwningRunoffLS=catchments[0].runoffLS;
  const drainageCases=[
    ['MAT deck and door',0],
    ['upper awning added',upperAwningRunoffLS],
    ['all cover runoff added',totalRunoffLS],
  ].map(([name,addedRunoffLS])=>{
    const flowLS=baselineFlowLS+addedRunoffLS;
    const upperLevelZ=upperLevelAtFlow(flowLS);
    return {name,flowLS,upperLevelZ,remainingToToeMM:panToeZ-upperLevelZ};
  });
  let passingFlowLS=baselineFlowLS;
  let failingFlowLS=baselineFlowLS+upperAwningRunoffLS;
  assert(upperLevelAtFlow(failingFlowLS)>panToeZ);
  for(let i=0;i<40;i++){
    const flowLS=(passingFlowLS+failingFlowLS)/2;
    if(upperLevelAtFlow(flowLS)<panToeZ)passingFlowLS=flowLS;
    else failingFlowLS=flowLS;
  }
  const extraAreaAtToeM2=(passingFlowLS-baselineFlowLS)*3600/water.testRainMmH;
  // Added direct or diverted runoff, with no credit for effective shelter
  // under driven rain or during reconfiguration.
  const upperAwningCollectorFractionAtToe=extraAreaAtToeM2/catchments[0].areaM2;
  return {status:'DEVELOPMENT_NOT_ADOPTED',source:{url:lift.lodigePlanning.url,...guide},service,awningY,
    roofOverhangToDockSouthMM:dockSouthY-awningY[0],roofReserveToDockNorthMM:dockNorthY-awningY[1],
    catchments,totalAreaM2,totalRunoffLS,iceOrDebrisCases,drainageCases,extraAreaAtToeM2,upperAwningCollectorFractionAtToe,
    hold:'Keep the upper hatch and cabinet independently accessible. Grade, outlets, ice, overflow, support and exact shaft/door/controls need matched physical evidence.'};
}

if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(compareLiftWeather(),null,2));
