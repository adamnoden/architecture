// Attached to the actual selected court. Positive dimensions are feasibility
// assumptions and the two receiver failures are different boundary conditions.
import {readFileSync} from 'node:fs';
import {capacity} from './short-inlet-review.mjs';
import {channelAtFlow,readSelected} from './selected-water-event.mjs';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const g=9.81;
const floor=y=>-30-.04*(y-5750);
function bisect(fn,a,b){
  for(let i=0;i<42;i++){const m=(a+b)/2;if(fn(m)<0)a=m;else b=m;}
  return (a+b)/2;
}
export function groundService(had,cornerRoof){
  const {inlet,basket,frame,incoming,limits}=had;
  const house=readSelected().model.model, {normal}=house.northNormalRoute;
  const skirt=house.maintenanceRainReference.eastMaintenance.weatherEnclosure;
  const {east,eastThroat,aisle}=frame.chambers, {spout}=inlet;
  const [start,end]=eastThroat.y, [, ,approach]=inlet.continuousApron;
  const selected=inlet.asBuilt[0], duty=incoming.duty, quiet=limits.quiet, actualStage=quiet-5;
  const q=(span,length,z)=>capacity([span],z,0,'deepestTotalQuarter',length,256);
  const broad=z=>q(selected,approach,z), broadQ=broad(actualStage);
  const blocked=(selected[1]-selected[0])/4;
  // capacity() removes the last quarter. Present an equivalent original span
  // whose retained strip is exactly the part outside the full-mouth obstruction.
  const cutEnd=end-blocked, equivalentEnd=start+(cutEnd-start)/.75;
  const localLength=inlet.continuousApron[0]+approach-eastThroat.endX;
  const nozzle=[6135,6890,7080,-160], upper=-100, sheet=1.5;
  const westEdge=frame.chambers.east[0]+east[2], fixed=6080,retracted=6070;
  const underlap=inlet.newWesternRelease.initialLeftX, [q0,q1]=nozzle.slice(1,3);
  const panFloor=(x,y)=>inlet.northWestZ-inlet.grade*(x-inlet.wetEdgeX)+.025*Math.max(6935-y,0,y-7165);
  const maximumPanFloor=Math.max(panFloor(nozzle[0],q0),panFloor(nozzle[0],q1));
  const n=normal.crossIntake, lowSide=spout.z+spout.grossSideRise;
  // Local north trough: its east bottom at the north edge, plus 1% longitudinal Y fall.
  const northEastSouth=n.eastBottomAtNorth+n.flowSlope*(normal.inletRegions[1][1]+normal.inletRegions[1][3]-normal.inletRegions[1][1]);
  const cases=[.02,.03].flatMap(rough=>[1,.75].map(fraction=>{
    const r=channelAtFlow(duty,normal.channelClear*fraction/1000,rough,normal.flowSlope);
    const nTail=northEastSouth+r.depthMm,deepestTrunk=n.trunkBottomAtNorth+r.depthMm;
    return {rough,fraction,depth:r.depthMm,velocityHead:r.velocityHeadMm,nTail,
      minClearToCover:normal.inletVoid-r.depthMm,sourceAboveNearestN:lowSide-nTail,
      sourceAboveTrunkNorth:lowSide-deepestTrunk};
  }));
  const channelCases=[cornerRoof,duty].map(load=>{
    const clear=(q1-q0-2*sheet)*.75, depth=1000*Math.cbrt((load/clear)**2/g);
    const v=load/(clear*depth)*1000, dh=4*clear*depth/(clear+2*depth);
    // Conservative full upper stream of straight-duct critical depth. There is a
    // separate impact/entry upstream: only the quiet-side +50 feed sill is used.
    const length=nozzle[0]-westEdge, loss=(3+.08*length/dh)*1000*v*v/(2*g);
    return {load,clear,depth,loss,freeboard:upper-nozzle[3]-depth-10,
      reserveFromOldSill:50-nozzle[3]-10-depth-1000*v*v/(2*g)-loss};
  });
  // New emergency-spill option reaches above the actual northern grating without a
  // penetration in its full-height wet liner. All three sill pieces leave with E isolated.
  const spillX=[6200,7100],spillY=[7360,7425],crest=-80,returnTop=-15;
  const spillClear=(spillX[1]-spillX[0]-2*5-2*3)*.75; // end setout and two 3 mm seam stops
  const yCritical=1000*Math.cbrt((duty/spillClear)**2/g),head=2*yCritical;
  const receiverY=7425,receivingSurface=floor(receiverY),perforation=normal.intakeCover.openAreaFraction;
  const [sx,sy,sw,st]=skirt.northPlate;
  const overlap=(a,b,c,d)=>Math.max(0,Math.min(b,d)-Math.max(a,c));
  const hitX=overlap(...spillX,sx,sx+sw), hitY=overlap(...spillY,sy,sy+st);
  const receptorWidth=spillX[1]-spillX[0]; // Show both short projection and bought, unobstructed full grating area.
  const gratingCases=[25,150,250].map(run=>{
    const area=receptorWidth*run*perforation*.75/1e6;
    const v=duty/1000/area,orificeHead=1000*(v/.6)**2/(2*g);
    return {run,remainingOpenAreaM2:area,orificeHead};
  });
  const highPipe=read('./temporary-two-path-control.json').actualCourtPassage;
  const aperture=incoming.keptCoverOpening[2], maxOD=108.27, tilt=Math.atan(1/30);
  const xAtZ=z=>incoming.directRoofTerminal[0]+(z-incoming.directRoofTerminal[2])*Math.tan(tilt);
  const highEdge=aperture/2-maxOD/2/Math.cos(tilt)-Math.max(...[-60,0].map(z=>Math.abs(xAtZ(z)-incoming.directRoofTerminal[0])))-10;
  return {sourceStage:quiet,asBuiltStage:actualStage,aisle,oldChamber: east,concentrated:{spout:eastThroat.y,
      localLength,approach,nominal:q([start,end],approach,quiet),uniformHigh:q([start,end],approach,actualStage),
      localError:q([start+5,end-5],approach,actualStage),fromToe:q([start,end],localLength,actualStage),
      allEdgeQuarter:blocked,isolatedClear:cutEnd-start,localWithAllEdgeBlock:q([start,equivalentEnd],approach,actualStage)},
    broad:{asBuilt:selected,capacity:broadQ,headReserve:actualStage-bisect(z=>broad(z)-duty,actualStage-2,actualStage),
      withAdditionalQuarterMm:broad(actualStage-.25),withOneMm:broad(actualStage-1),onePercentMeterSetpoint:duty/.99,
      derivative:(broad(actualStage+.05)-broad(actualStage-.05))/.1},
    underApron:{nozzle,upper,gauge:sheet,westEdge,fixed,retracted,stroke:nozzle[0]-retracted,bodyInitial:underlap,
      afterTwo5GapWhenParked:underlap-Math.max(fixed,retracted)-10,
      nominalSurfaceToRoof:Math.min(floor(q0),floor(q1))-upper-sheet,
      pairedSurfaceToRoof:Math.min(floor(q0),floor(q1))-upper-sheet-10,
      pairedUndersideToPan:nozzle[3]-sheet-maximumPanFloor-10,
      toSeamBridge:q0-6870,toGuardFootY:frame.apronLatch.foot[1]-q1,channelCases,
      firstRelease:'Drain and isolate the feed. Withdraw the free nose west through its wet sleeve before the selected 50 mm east pan motion. Requires an opening in its west return and independent traffic support.'},
    failedBasket:{firstSideOvertopping:lowSide,belowQuiet:quiet-lowSide,basketTop:basket.topBasket,
      normalBedAtEastSouth:northEastSouth,northCases:cases,
      cornerOnlyCleanTail:northEastSouth+channelAtFlow(cornerRoof,normal.channelClear/1000,normal.roughnessStress,normal.flowSlope).depthMm,
      scope:'A low open delivery can spill before the upstream break registers a blocked basket. The adjacent full-height N liner has no below-return opening. A new local gravity leg must also defeat its actual tail.'},
    highReturn:{spillX,spillY,crest,returnTop,spillClear,yCritical,head,
      pairedFreeboard:quiet-(crest+5+head),nominalLandingAboveGrate:crest-receivingSurface,
      receiverAtZ:receivingSurface,gratingCases,receiverPocket:[6200,7400,900,150],
      pairedMinimumSillToHighestGrate:crest-floor(7400)-10,
      minimumTopRiseOverFifthSide:returnTop-lowSide,returnClosureHeadKPa:(quiet-spout.z)*.00981,
      terraceWaterKgPer305x550:(quiet-spout.z)*305*550/1e6,panelDrawNorth:55,
      parkedY:spillY.map(y=>y+55),parkedPastWellAfterTwo5:spillY[0]+55-7400-10,
      weatherPlate:{plan:skirt.northPlate,z:[skirt.plateBottom,skirt.plateCrest],overlapX:hitX,overlapY:hitY,
        throughCrest:skirt.plateBottom<crest&&skirt.plateCrest>crest,northTravelUntilReleased:sy+st-spillY[0],
        fixedSkirtBeforeDraw:false},
      ordered:'The 55 north park clears the eventual well lift, but the intact weather plate crosses this entire first motion. Prove N and the supported weather roof, then develop a separately sealed or isolated changeover before closing the last north skirt or lifting a wet body. Before N work remove and blank the grate projection while E and its direct nozzle remain operable.'},
    normal:{inletRegions:normal.inletRegions,perforationFraction:normal.intakeCover.openAreaFraction,trunk:normal.channelClear,
      nominalClean40:normal.preliminaryManningScreen.dischargeLps},
    directHigh:{nominalPipeOD:108,maximumOD:maxOD,axisInclinationDeg:tilt*180/Math.PI,protectedAperture:aperture,pairedLateralReserve:highEdge,
      priorN:highPipe.axis,spoutToOriginalNozzleVertical:incoming.directRoofTerminal[2]-spout.z,
      nozzleSpoutPlanOverlap:spout.endX-(incoming.directRoofTerminal[0]-incoming.nozzleOD/2)},
    northSourceLimits:read('./north-canopy-correction.json').remaining};
}
