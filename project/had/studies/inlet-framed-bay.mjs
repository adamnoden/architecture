import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {deriveCurrentHouse} from './current-house.mjs';
import {deriveFixedStation} from './inlet-fixed-station.mjs';
import {deriveCabinetFault} from './inlet-cabinet-fault.mjs';
import {deriveInletRewind} from './inlet-rewind.mjs';
import {finiteBends} from './incoming-water-geometry.mjs';
import {pathSeparation} from './service-interface-geometry.mjs';

const frame = {y:[3035,3335],z:[45,465],jambWidthMM:150,headDepthMM:150};
const outletY = [3115,3245];
const spillY = [3080,3300];
const fall = 50;
const routedY = [2810,2965];
const doglegX = [12600,12775];
const westFacing = {west:100,east:19,diameter:60};
const fitting = {
  body:{id:'0730G02000',axialMM:78.5,source:'https://www.kemper-group.com/datasheet/en_uk/FG-0730G'},
  union:{id:'4760402000',axialMM:21,gasketMM:2,source:'https://www.kemper-group.com/datasheet/en_en/FG-47604'},
  wheel:westFacing,
};
const serviceBodyX = 10670;
const handwheelControlX = 11145;
const dryControlBodyX = 10790;
const r = value=>Number(value.toFixed(5));
const span = (low,high)=>high-low;
const finiteArcSamples = (range,axis,length)=>{
  const stepDegrees=.25;
  return Array.from({length:1+Math.round(span(...range)/stepDegrees)},(_,index)=>{
    const angle=(range[0]+index*stepDegrees)*Math.PI/180;
    return [axis[0]+length*Math.cos(angle),axis[1]+length*Math.sin(angle),axis[2]];
  });
};

export function deriveFramedInletBay() {
  const fixed=deriveFixedStation();
  const fault=deriveCabinetFault();
  const {model}=deriveCurrentHouse();
  const {station}=JSON.parse(readFileSync(new URL('./incoming-water.json',import.meta.url),'utf8'));
  const {wetBoundary,service}=fault;
  const {retainedBodyRadius:bodyR,operatorCentrePath}=model.plantReferenceDoor;
  const setting=wetBoundary.settingMM;
  const minimum=25;
  const wallX=fixed.paths.jointFreeSpool.map(row=>row[0]);
  const wallInsideX=fixed.cupboard[1];
  const wallOutsideX=wallInsideX+wetBoundary.wallLength;
  const term=wetBoundary.outside.terminalX;
  const landing=model.architecturalServices.plant.independentSafety.outfall;
  const dock=JSON.parse(readFileSync(new URL('../../mat/studies/plant-threshold.json',import.meta.url),'utf8')).dock.plan;
  const outsideBounds=[landing[1]+150,dock[2]];
  const outsideRoutes=[];
  const pipes=fixed.faultBoundary.wetOutlets.map((outlet,index)=>{
    const outerInvertZ=outlet.crossing[2];
    const insideInvertZ=outerInvertZ+wetBoundary.wallLength/fall;
    const radius=outlet.formedOD/2;
    const verticalRadius=radius*Math.hypot(1,1/fall);
    const centreZ=insideInvertZ+outlet.minimumClearID/2;
    const outerCentreZ=outerInvertZ+outlet.minimumClearID/2;
    const y=outletY[index];
    const shift=y-routedY[index];
    const corner=doglegX[index];
    const developedUpperMM=outlet.outerX-wallOutsideX+shift*(Math.SQRT2-1);
    const terminalInvertZ=outerInvertZ-developedUpperMM/fall;
    const route=finiteBends([
      [wallOutsideX,y,outerCentreZ],
      [corner,y,outerCentreZ-(corner-wallOutsideX)/fall],
      [corner+shift,routedY[index],outerCentreZ-(corner-wallOutsideX+shift*Math.SQRT2)/fall],
      [outlet.outerX,routedY[index],terminalInvertZ+outlet.minimumClearID/2],
    ]);
    outsideRoutes.push(route);
    return {id:outlet.id,y,formedOD:outlet.formedOD,minimumClearID:outlet.minimumClearID,
      insideInvertZ,outerInvertZ,centreZ,terminalX:outlet.outerX,terminalY:routedY[index],terminalInvertZ:r(terminalInvertZ),
      maximumReceivingZ:r(Math.min(terminalInvertZ-25,outlet.receivingMaximumZ)),developedUpperMM:r(developedUpperMM),
      outsideCenterlineEndpoints:route.path.filter((_,index,array)=>index===0||index===array.length-1).map(point=>point.map(r)),
      doglegPlanVertices:[[wallOutsideX,y],[corner,y],[corner+shift,routedY[index]],[outlet.outerX,routedY[index]]],
      receivingLaneY:[routedY[index]-60,routedY[index]+60],
      retiredZ70OuterBaseClearanceAfterSettingMM:r(outerCentreZ-verticalRadius-70-setting),
      bodyY:[y-radius,y+radius],bodyZ:[outerCentreZ-verticalRadius,centreZ+verticalRadius],
      minimumEdgeClearanceAfterSettingMM:r(Math.min(y-radius-frame.y[0],frame.y[1]-y-radius,outerCentreZ-verticalRadius-frame.z[0],frame.z[1]-centreZ-verticalRadius)-setting)};
  });
  const spill={y:spillY,z:wetBoundary.opening.slice(2),outsideZ:wetBoundary.opening.slice(2).map(z=>r(z-wetBoundary.wallLength/fall)),
    terminalX:term,firstExitZ:wetBoundary.outside.firstExitZ,
    maximumReceivingZ:wetBoundary.outside.maximumReceivingZ,
    minimumEdgeClearanceAfterSettingMM:Math.min(spillY[0]-frame.y[0],frame.y[1]-spillY[1],frame.z[1]-wetBoundary.opening[3])-setting};
  const frameExtent=[frame.y[0]-frame.jambWidthMM,frame.y[1]+frame.jambWidthMM];
  const intakeRadius=station.entry.formedBore/2;
  const intake=[fixed.paths.jointFreeSpool[0][1],fixed.paths.jointFreeSpool[0][2]];
  const intakeSideClearanceAfterSettingMM=frameExtent[0]-(intake[0]+intakeRadius)-setting;
  const insidePierEnds=['utility-north','plant-intermediate-arch'].map(id=>model.groundWalls.find(wall=>wall.id===id))
    .map((wall,index)=>wall.finishedFaces[1-index]);
  const bearingToFinishedPierAfterSettingMM=[frameExtent[0]-insidePierEnds[0]-setting,insidePierEnds[1]-frameExtent[1]-setting];
  const eastOpens=model.archOpeningRegister.GROUND.filter(o=>o.wall==='outer-east');
  const southWindow=eastOpens.find(o=>o.id==='east-window-0');
  const northDoor=eastOpens.find(o=>o.id==='plant-replacement');
  const bearingToNeighbourRawMM=[frameExtent[0]-(southWindow.centre+southWindow.width/2),
    northDoor.centre-northDoor.width/2-frameExtent[1]];
  const daylightReceiverY=[spill.y[0]-20,spill.y[1]+20];
  const receivingLanes=[...pipes.map(p=>p.receivingLaneY),daylightReceiverY];
  const receivingSeparationAfterSettingMM=receivingLanes.slice(1).map((lane,index)=>lane[0]-receivingLanes[index][1]-setting);
  const gravityOutfallEnvelopes=[...pipes.map((p,index)=>[routedY[index]-p.formedOD/2,p.bodyY[1]]),...receivingLanes];
  const outsidePipeGapAfterSettingMM=r(pathSeparation(outsideRoutes[0].path,outsideRoutes[1].path)
    -outsideRoutes[0].hausdorffError-outsideRoutes[1].hausdorffError-(pipes[0].formedOD+pipes[1].formedOD)/2-setting);
  const toOutsideObstructionsAfterSettingMM=[Math.min(...gravityOutfallEnvelopes.map(p=>p[0]))-outsideBounds[0]-setting,
    outsideBounds[1]-Math.max(...gravityOutfallEnvelopes.map(p=>p[1]))-setting];
  const lowPipeSeparationAfterSettingMM=pipes[1].bodyY[0]-pipes[0].bodyY[1]-setting;
  const pipeToSpillSeparationAfterSettingMM=spill.z[0]-Math.max(...pipes.map(p=>p.bodyZ[1]))-setting;
  const [lowX,highX,lowY,highY]=wetBoundary.pan;
  const panFloorCorners=[lowX,highX].flatMap(x=>[lowY,highY].map(y=>({
    x,y,z:r(pipes[0].insideInvertZ+(wallInsideX-x+Math.abs(y-pipes[0].y))/fall),
  })));
  const panFloorMaximumZ=Math.max(...panFloorCorners.map(corner=>corner.z));
  const grossBlockedCapacityUpperL=r((wallInsideX-lowX)*(highY-lowY)*(wetBoundary.drySillZ-pipes[0].insideInvertZ)/1e6);
  const sourceRun=fixed.faultBoundary.wetOutlets.map(outlet=>r(outlet.outerX-wallOutsideX));
  assert.deepEqual(pipes.map(p=>r(p.terminalX-wallOutsideX)),sourceRun);
  const moduleAxialUpperMM=fitting.body.axialMM+2*(fitting.union.axialMM+fitting.union.gasketMM);
  const exteriorWheelEdge=service.restX-westFacing.west;
  const oldFrontBoundAfterSettingMM=exteriorWheelEdge-service.workingBodyX-bodyR-setting;
  const newFrontBoundAfterSettingMM=exteriorWheelEdge-serviceBodyX-bodyR-setting;
  const trayNoseBoundAfterSettingMM=service.trayNoseX-serviceBodyX-bodyR-setting;
  const {length,penaltyMM}=station.tool;
  const rows=Object.fromEntries(service.rows.map(operation=>{
    const row=fixed.rows[operation.id];
    const stance=[serviceBodyX,...operation.body.slice(1)];
    const arcs=row.facesZ.map(z=>finiteArcSamples(row.sector,[row.axis[0],row.axis[1],z],length));
    const wrenchReach=Math.max(...arcs.flat().map(point=>Math.hypot(...point.map((v,i)=>v-stance[i]))))+penaltyMM;
    const restGripReach=Math.hypot(...[service.restX,row.axis[1],row.axis[2]].map((v,i)=>v-stance[i]));
    const closedControlReach=Math.hypot(...[handwheelControlX,row.axis[1],row.axis[2]].map((v,i)=>v-[dryControlBodyX,...operation.body.slice(1)][i]));
    return [operation.id,{axis:row.axis,stance,wrenchReachUpperMM:r(wrenchReach),restGripReachMM:r(restGripReach),
      closedControlReachMM:r(closedControlReach),originalSector:row.sector}];
  }));
  const inCabinetWheelLeadX=fixed.rows.I0.axis[0]-westFacing.west;
  const stepBackFromOrdinaryMM=serviceBodyX-operatorCentrePath.at(-1)[0];
  const dockWeb=[frameExtent[1],dock[2]];
  const dockSeparationX=dock[0]-wallOutsideX;
  const p17=JSON.parse(readFileSync(new URL('../../str/studies/current-house-grid.json',import.meta.url),'utf8')).heads.find(head=>head.id==='P17');
  const capY=[p17.xy[1]-p17.capXY[1]/2,p17.xy[1]+p17.capXY[1]/2];
  const spanOverlap=(a,b)=>Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0]));
  const foundation={capY,capTopZ:p17.capZ[1],separationFromSouthJambMM:capY[0]-frame.y[0],
    northJambOverlapMM:spanOverlap([frame.y[1],frameExtent[1]],capY),
    wallToDockPlanXSeparationMM:dockSeparationX};
  const d2=deriveInletRewind().exterior.d2Run;
  const d2a=d2[1],d2b=d2[2];
  const axisAtY=y=>d2a[2]+(d2b[2]-d2a[2])*(y-d2a[1])/(d2b[1]-d2a[1]);
  const crossingX=d2a[0];
  const d2CrossingAxes=pipes.map(pipe=>({y:pipe.y,x:crossingX,rawVerticalGapFromFormedSleeveToD2AxisMM:r(pipe.outerInvertZ-(crossingX-wallOutsideX)/fall+pipe.minimumClearID/2-
    pipe.formedOD/2*Math.hypot(1,1/fall)-axisAtY(pipe.y))}));
  assert(foundation.separationFromSouthJambMM>0&&foundation.northJambOverlapMM===frame.jambWidthMM);
  assert(oldFrontBoundAfterSettingMM<minimum);
  assert(newFrontBoundAfterSettingMM>=minimum&&trayNoseBoundAfterSettingMM>=minimum);
  assert(Object.values(rows).every(row=>row.wrenchReachUpperMM<=650&&row.closedControlReachMM<=650));
  assert(intakeSideClearanceAfterSettingMM>=minimum&&bearingToFinishedPierAfterSettingMM.every(gap=>gap>=minimum));
  assert(pipes.every(p=>p.minimumEdgeClearanceAfterSettingMM>=20)&&spill.minimumEdgeClearanceAfterSettingMM>=25);
  assert(lowPipeSeparationAfterSettingMM>=20&&pipeToSpillSeparationAfterSettingMM>=25);
  assert(panFloorMaximumZ<pipes[1].insideInvertZ);
  assert(toOutsideObstructionsAfterSettingMM.every(gap=>gap>=25));
  assert(receivingSeparationAfterSettingMM.every(gap=>gap>=25)&&outsidePipeGapAfterSettingMM>=10);
  assert(pipes[0].retiredZ70OuterBaseClearanceAfterSettingMM<0);
  return {
    status:'PREFERRED_FRAMED_BAY_PRE_SITE_RESERVATION',
    sourceModel:fixed.selection,
    frame:{...frame,wallX:[wallInsideX,wallOutsideX],nominalHouseEastX:model.shell,headZ:[frame.z[1],frame.z[1]+frame.headDepthMM],
      structuralEnvelopeY:frameExtent,supplyEndsX:wallX,intake,intakeSideClearanceAfterSettingMM,
      bearingToFinishedPierAfterSettingMM,bearingToNeighbourRawMM,frameEndAndDockStartY:dockWeb,foundation,
      intendedLoadPath:'Separate leaf heads deliver into paired side jambs; jambs continue through the base to the outer east ground beam. Obtain STR transfer, support and cavity closure. Hydraulic infill has no bearing duty.'},
    drainage:{pipes,spill,lowPipeSeparationAfterSettingMM,pipeToSpillSeparationAfterSettingMM,
      d2GrateNorthAndDockSouthY:outsideBounds,toOutsideObstructionsAfterSettingMM,d2CrossingAxes,receivingLanes,receivingSeparationAfterSettingMM,outsidePipeGapAfterSettingMM,
      heldSlope:fall,heldTerminalRunsMM:sourceRun,
      panFloor:{datum:[wallInsideX,pipes[0].y,pipes[0].insideInvertZ],panFloorCorners,panFloorMaximumZ,
        longitudinalFall:fall,crossFall:fall,grossBlockedCapacityUpperL,
        allOutletsBlockedSecondsAt60LminUpper:grossBlockedCapacityUpperL},
      gravityControls:wetBoundary.gravityCases.map(row=>({flowLmin:row.flowLmin,thresholdReserveMM:r(row.drySillReserveAfterSettingsAndSplashMM)})),
      sharedPhysicalFailure:'A blocked outer face can obstruct all three exits. No shared cover, grille, sleeve chase, receiving sump or overflow credit. At real site verify independent receiving and a common inundation/face-obstruction rejection state.'},
    closure:{fitting,moduleAxialUpperMM,axialReservationMM:fixed.rows.I0.captiveFlatBreaks.fullMatchedLengthMM,
      moduleAxialReserveMM:fixed.rows.I0.captiveFlatBreaks.fullMatchedLengthMM-moduleAxialUpperMM,
      currentRestX:service.restX,westmostWheelX:exteriorWheelEdge,oldFrontBoundAfterSettingMM,newFrontBoundAfterSettingMM,
      trayNoseBoundAfterSettingMM,stepBackFromOrdinaryMM,rows,
      wheelDrive:{insideLeadX:inCabinetWheelLeadX,dryControlX:handwheelControlX,minimumCouplingLengthMM:inCabinetWheelLeadX-handwheelControlX,
        dryBodyX:dryControlBodyX,frontClearanceAfterSettingMM:handwheelControlX-dryControlBodyX-bodyR-setting,
        sequence:'Independent fixed dry-face rotary support; retained native handwheel; disengage the captive drive before the west draw. Prove torque, thrust restraint, operational stops and sealed wet penetration.'},
      materialStatus:'Manufacturer valve and unions have documented EPDM parts. Hold as a geometry comparator pending owner material disposition and matched installation proof.'},
    serviceHandoff:{inwardSpool:fixed.spoolRenewal,plant:fixed.removal,
      utilityColdPoint:fixed.paths.utility.at(-1),
      release:'Keep the prior independently held high plant split and removable low connector. The valve handling route and closed operation do not certify actual loaded cargo, safe outlet, hot/return links or the utility head.'},
  };
}

function elevation(result) {
  const {frame:f,drainage:d,closure:c}=result;
  const y=v=>140+(v-2647)*.8;
  const z=v=>395-v*.43;
  const box=(ys,zs,colour)=>`<rect x="${y(ys[0])}" y="${z(zs[1])}" width="${span(...ys)*.8}" height="${span(...zs)*.43}" fill="${colour}" stroke="#344945"/>`;
  const circle=(v,w,r,colour)=>`<ellipse cx="${y(v)}" cy="${z(w)}" rx="${r*.8}" ry="${r*.43}" fill="${colour}" stroke="#344945"/>`;
  const planX=v=>270+(v-f.wallX[1])*.34;
  const planY=v=>790-(v-2650)*.20;
  const planBox=(xs,ys,fill)=>`<rect x="${planX(xs[0])}" y="${planY(ys[1])}" width="${span(...xs)*.34}" height="${span(...ys)*.20}" fill="${fill}" stroke="#344945"/>`;
  const receivingPlan=d.pipes.map((pipe,index)=>{
    const points=pipe.doglegPlanVertices.map(([px,py])=>`${planX(px)},${planY(py)}`).join(' ');
    return `<polyline points="${points}" stroke="${index===0?'#397e94':'#486996'}" stroke-width="8" fill="none"/>${planBox([pipe.terminalX,pipe.terminalX+125],pipe.receivingLaneY,'#8ebac9')}`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 848" role="img" aria-labelledby="title desc">
<title id="title">Framed inlet drainage bay and retained valve draw</title>
<desc id="desc">East facade elevation with separate pressure bore, separated drainage passages, paired jambs and a deep head. Plan comparison of wheel and worker spacing beneath.</desc>
<style>text{font:16px sans-serif;fill:#243833}.title{font:bold 28px sans-serif}.minor{font:14px sans-serif}</style>
<rect width="1120" height="848" fill="#f8f5ec"/>
<text x="37" y="48" class="title">One bearing frame around three independent drains</text>
<text x="37" y="77">East elevation using house coordinates in millimetres</text>
${box([f.structuralEnvelopeY[0],f.y[0]],[0,f.z[1]],'#c9bca0')}
${box([f.y[1],f.structuralEnvelopeY[1]],[0,f.z[1]],'#c9bca0')}
${box(f.structuralEnvelopeY,f.headZ,'#c9bca0')}
${box(f.y,f.z,'#edf1e8')}
${d.pipes.map(p=>circle(p.y,p.centreZ,p.formedOD/2,'#8ebac9')).join('')}
${box(d.spill.y,d.spill.z,'#8ebac9')}
${circle(...f.intake,50,'#c28869')}
<line x1="110" y1="${z(0)}" x2="835" y2="${z(0)}" stroke="#344945"/>
<text x="850" y="140">Z600 pressure inlet</text>
<text x="850" y="175">Z465–615 head reservation</text>
<text x="850" y="240">Y3080–3300 daylight opening</text>
<text x="850" y="323">Y3115 / Y3245 lower sleeves</text>
<text x="37" y="425">Raw frame Y3035–3335 / Z45–465. Both 150 mm jambs continue to the ground beam.</text>
<line x1="37" x2="1080" y1="449" y2="449" stroke="#a1a89c"/>
<text x="37" y="482" class="title">Draw the fitted wheel from the west</text>
<text x="37" y="515">X${c.westmostWheelX} wheel edge at locked first rest · X${serviceBodyX} operator axis · ${c.newFrontBoundAfterSettingMM} mm after setting</text>
<line x1="37" x2="1080" y1="548" y2="548" stroke="#a1a89c"/>
<text x="37" y="585" class="title">Separate paths across the exterior approach</text>
<text x="37" y="620">Dock south edge</text>
<line x1="270" x2="975" y1="${planY(d.d2GrateNorthAndDockSouthY[1])}" y2="${planY(d.d2GrateNorthAndDockSouthY[1])}" stroke="#938362" stroke-dasharray="5 4"/>
<text x="37" y="790">D2 grate north edge</text>
<line x1="270" x2="975" y1="${planY(d.d2GrateNorthAndDockSouthY[0])}" y2="${planY(d.d2GrateNorthAndDockSouthY[0])}" stroke="#938362" stroke-dasharray="5 4"/>
${planBox([f.wallX[1],d.spill.terminalX],d.spill.y,'#e0eee9')}
${planBox([d.spill.terminalX,d.spill.terminalX+125],d.receivingLanes[2],'#afcdc3')}
${receivingPlan}
<text x="920" y="680">Daylight spill</text>
<text x="920" y="733">Pipe relief</text>
<text x="920" y="760">Ordinary drain</text>
<text x="37" y="824" class="minor">Pre-site reservations. Provide separate protected receptors, supports and receiving routes.</text>
</svg>
`;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const result=deriveFramedInletBay();
  for(const [extension,content] of Object.entries({json:JSON.stringify(result,null,2)+'\n',svg:elevation(result)})){
    const path=new URL(`inlet-framed-bay.${extension}`,import.meta.url);
    if(process.argv.includes('--write')) writeFileSync(path,content);
    else if(process.argv.includes('--check')) assert.equal(readFileSync(path,'utf8'),content);
    else if(extension==='json') process.stdout.write(content);
  }
}
