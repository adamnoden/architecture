import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {deriveCurrentHouse} from './current-house.mjs';
import {deriveInletRewind} from './inlet-rewind.mjs';
import {finiteBends,exactSegmentBoxDistance} from './incoming-water-geometry.mjs';
import {pathSeparation} from './service-interface-geometry.mjs';
import {coldRiserVertices} from './incoming-water-station.mjs';

const read = key => JSON.parse(readFileSync(new URL(key, import.meta.url)));
const existing = read('./incoming-water.json');
const outsideDrip = read('./incoming-water-elevated-drip.json');
const diameter = existing.station.entry.completePipeOD;
const radius = diameter / 2;
const roomSetting = 10;
const pipeJoint = [11525,2800,600];
const exteriorSpoolEnd = [12165,2800,600];
const pipeIn = [11385,2800,600];
const axisX = pipeIn[0];
const headerZ = 1130;
const valveLength = existing.station.moduleContracts[0].completeFittedModuleMM;
const plantModuleCentreZ = 1392.5;
const plantDropTop = [10170,3950,2260];
const plantDropSplit = [10222.5,3842.9,2260];
const outletEnds = {
  I0:{y:2800,z:875,stanceY:3010,shoulderZ:1050,sector:[120,180]},
  U0:{y:3110,z:plantModuleCentreZ,stanceY:3110,shoulderZ:1450,sector:[150,210]},
  P0:{y:3370,z:plantModuleCentreZ,stanceY:3250,shoulderZ:1450,sector:[180,240]},
};

const segmentGap = (test,box) => Math.min(...test.path.slice(1).map((end,i)=>exactSegmentBoxDistance(test.path[i],end,box))) - radius - test.hausdorffError;
const namedPath = (points,bend=75) => ({points,...finiteBends(points,bend)});
const lineLength = path => path.slice(1).reduce((n,end,i)=>n+Math.hypot(...end.map((coord,j)=>coord-path[i][j])),0);

export function deriveFixedStation() {
  const {model,id} = deriveCurrentHouse();
  const rewind = deriveInletRewind();
  const cupboard = [...rewind.trialInterior.cupboard];
  cupboard[2] -= 15;
  const {operatorCentrePath,retainedBodyRadius,fullyOpenEastLeaf} = model.plantReferenceDoor;
  const {independentSafety,cylinder} = model.architecturalServices.plant;
  const face = {westX:cupboard[0],clearY:[cupboard[2]+25,cupboard[3]-25],clearZ:[120,1910]};
  const rows = Object.fromEntries(Object.entries(outletEnds).map(([id,row])=>{
    const facesZ = [row.z-valveLength/2,row.z+valveLength/2];
    const {length,handR,headR,penaltyMM} = existing.station.tool;
    const stance = [10860,row.stanceY,row.shoulderZ];
    const zones = facesZ.map(z=>{
      let maximumReach = 0;
      let sideGap = Infinity;
      for(let a=row.sector[0];a<=row.sector[1];a+=.25){
        const theta=a*Math.PI/180;
        const tip=[axisX+length*Math.cos(theta),row.y+length*Math.sin(theta),z];
        maximumReach=Math.max(maximumReach,Math.hypot(...tip.map((coord,i)=>coord-stance[i])));
        sideGap=Math.min(sideGap,tip[1]-face.clearY[0]-handR,face.clearY[1]-tip[1]-handR,
          row.y-face.clearY[0]-headR,face.clearY[1]-row.y-headR);
      }
      return {unionZ:z,reachUpperMM:maximumReach+penaltyMM,planGapLowerMM:sideGap-penaltyMM,planGapAfterSettingsMM:sideGap-penaltyMM-roomSetting,
        scope:'Front-opening strip only. Actual opposite reaction, lid stays, guards, fasteners and matched valve seat still require physical detail.'};
    });
    return [id,{axis:[axisX,row.y,row.z],facesZ,stance,sector:row.sector,zones,
      captiveFlatBreaks:{fullMatchedLengthMM:valveLength,projectingPilotAllowanceMM:0,withdraw:'Straight west on separately retained horizontal tray after both end nuts are loose and positively clear.'},
      wallSupport:{anchorRailX:11545,counterholdArmDepthMM:11545-axisX,retainedEnds:'Both pipe ends have a shaped keyed reaction and axial restraint back to the fixed cabinet rail. The removable valve and drain pan carry neither end.'}}];
  }));
  const mainIn=namedPath([pipeJoint,pipeIn,[axisX,2800,rows.I0.facesZ[0]]],60);
  const header=namedPath([[axisX,2800,rows.I0.facesZ[1]],[axisX,2800,headerZ],[axisX,3370,headerZ],[axisX,3370,rows.P0.facesZ[0]]]);
  const utilityIn=[[axisX,3110,headerZ],[axisX,3110,rows.U0.facesZ[0]]];
  const utility=namedPath([[axisX,3110,rows.U0.facesZ[1]],[axisX,3110,1700],[11505,2882,1700],...coldRiserVertices.slice(1)]);
  const plant=namedPath([[axisX,3370,rows.P0.facesZ[1]],[axisX,3370,2260],[10245,3370,2260],[10245,3797,2260],plantDropSplit]);
  const drop=namedPath([plantDropSplit,plantDropTop,[10170,3950,520]]);
  const plantBodyGap=operatorCentrePath.at(-1)[0]-10170-radius-retainedBodyRadius;
  const dropToCaseGap=Math.hypot(10170-cylinder.centre[0],3950-cylinder.centre[1])-380-radius;
  const dropToCartGap=Math.abs(3950-model.storeExchange.path[0][1])-model.storeExchange.radius-radius;
  const [coldX,coldY,coldZ]=independentSafety.mainsPortTrial;
  const coldAxis=[coldX-cylinder.centre[0],coldY-cylinder.centre[1]];
  const coldPlanLength=Math.hypot(...coldAxis);
  const exposedColdConnector=namedPath([[10170,3950,520],[10170,3950,475],
    [coldX+65*coldAxis[0]/coldPlanLength,coldY+65*coldAxis[1]/coldPlanLength,coldZ],independentSafety.mainsPortTrial],25);
  const finalDropPlan=[10170,3950];
  const firstRemovalTranslation=[125,150,0];
  const dropApproach=plantDropTop.map((value,axis)=>value-plantDropSplit[axis]);
  const dropApproachLength=Math.hypot(...dropApproach);
  const splitOpeningMM=firstRemovalTranslation.reduce((sum,value,axis)=>sum+value*dropApproach[axis],0)/dropApproachLength;
  const highUnionShoulder=[10575,4152,1850];
  const highUnionTool=existing.station.tool;
  const lateral=[dropApproach[1]/dropApproachLength,-dropApproach[0]/dropApproachLength,0];
  const highWrenchPoints=Array.from({length:241},(_,i)=>{
    const angle=(-60+i/4)*Math.PI/180;
    return plantDropSplit.map((value,axis)=>value+highUnionTool.length*(lateral[axis]*Math.cos(angle)+(axis===2?Math.sin(angle):0)));
  });
  const highToolMaxReach=Math.max(...highWrenchPoints.map(point=>Math.hypot(...point.map((value,axis)=>value-highUnionShoulder[axis]))))+highUnionTool.penaltyMM;
  const dropMotionToCaseMM=exactSegmentBoxDistance([...finalDropPlan,0],
    [finalDropPlan[0]+firstRemovalTranslation[0],finalDropPlan[1]+firstRemovalTranslation[1],0],
    [...cylinder.centre,0,0,0,1])-380-radius;
  const spoolStroke=exteriorSpoolEnd[0]-cupboard[1]+25;
  const fixedOpeningLower=2260-radius;
  const leaf=[...fullyOpenEastLeaf.slice(0,2),0,...fullyOpenEastLeaf.slice(2),2300];
  const base=read('../../mat/studies/whole-house-service-baseline.json');
  const heat=base.heat.emitterSchedule.find(e=>e.id==='plant-N');
  const heatPath=[...heat.pressurePairBranchPlan.map(point=>[...point,heat.upperBranchAxisLocal]),[...heat.pressurePairBranchPlan.at(-1),0]];
  const cupboardHeight=2000;
  const drainSpouts=[
    {id:'D0',tee:[11482,2800,600],spout:[11482,2800,350],cut:'B0',purpose:'Wet-side upstream spool, external protected rise needs a separate true low drain.'},
    {id:'D1',tee:[axisX,2960,headerZ],spout:[11470,2960,350],cut:'I0',purpose:'Vent common header and prove both fixed branch seats isolated. The sealed I0 outlet leg below this takeoff remains a measured local residual.'},
    {id:'DU',tee:[axisX,3110,1555],spout:[11470,3110,350],cut:'U0',purpose:'Utility tail remains locally drainable where its own low points require it.'},
    {id:'DP',tee:[axisX,3370,1555],spout:[11470,3370,350],cut:'P0',purpose:'Plant tail and vessel drain stay distinct. Charge the outlet pocket below the tee as residual.'},
  ];
  const pan=[11200,11555,2750,3450,145,250];
  const wetOutlets=[
    {id:'ordinary',crossing:[12090,2975,outsideDrip.independentOutlet.invertZ],outerX:outsideDrip.independentOutlet.terminalX,existingComparison:true,
      receivingMaximumZ:outsideDrip.independentOutlet.receivingMaximumZ},
    {id:'blocked-primary relief',crossing:[12090,3200,150],outerX:13450,existingComparison:false,receivingMaximumZ:150-(13450-12090)/50-25},
  ].map(outlet=>({...outlet,formedOD:100,minimumClearID:80,pressureJetOrBlockedAcceptance:false}));
  const temporaryBody=operatorCentrePath.at(-1)[0]+retainedBodyRadius;
  const nominalTubeInsideMM=22; // The nominal pressure tube OD is an upper bound on water ID.
  const oneMMVolumeLitres=Math.PI*(nominalTubeInsideMM/2)**2/1e6;
  const headerResidualLength=headerZ-rows.I0.facesZ[1]-75+Math.PI/2*75+2960-2800-75;
  return {status:'CONDITIONAL_PRE_SITE_FIXED_STATION',selection:id,face,cupboard,cupboardHeight,rows,
    paths:{jointFreeSpool:[pipeJoint,exteriorSpoolEnd],mainIn:mainIn.points,header:header.points,utilityIn,utility:utility.points,plant:plant.points,removablePlantDrop:drop.points,exposedColdConnector:exposedColdConnector.points},
    separations:{ordinaryToClosedFaceMM:rewind.trialInterior.frontToBodyMM,
      utilityAndPlantMM:pathSeparation(utility.path,plant.path)-diameter-utility.hausdorffError-plant.hausdorffError,
      fixedPlantToOpenLeafMM:segmentGap(plant,leaf),fixedPlantToHeatMM:pathSeparation(plant.path,heatPath)-radius-84-plant.hausdorffError,
      dropToBodyAfterSettingsMM:plantBodyGap-roomSetting,dropToPlainCylinderAfterSettingsMM:dropToCaseGap-roomSetting,
      fixedDropWouldOverlapCartMM:-dropToCartGap,
      fixedPlantUndersideZ:fixedOpeningLower,capturedCarrierRiseAllowanceBeforeSettingsMM:fixedOpeningLower-25-2125},
    removal:{plantSplit:plantDropSplit,factoryColdPort:independentSafety.mainsPortTrial,dropDevelopedMM:lineLength(drop.path),
      highUnionPodium:[10245,10905,3822,4482,400],highUnionShoulder,highUnionTool:{sector:[-60,0],maxReachUpperMM:highToolMaxReach,servicePanelMinGapMM:2350-plantDropSplit[2]-highUnionTool.headR-highUnionTool.penaltyMM},
      oldStandRemoved:true,splitOpeningMM,dropMotionToPlainCaseAfterSettingsMM:dropMotionToCaseMM-roomSetting,
      firstRemovalTranslation,lowerOnto400PodiumMM:120,exposedColdConnectorDevelopedMM:lineLength(exposedColdConnector.path),
      exposedColdConnectorEnvelopeOD:50,coldConnectorFirstRelease:[25,-20,-35],
      support:'Suspend and laterally retain the long narrow drop from the permanent high rail until a captured receiver takes its load. Use no fixed low rail or stand in the cradle field. A maker-matched short final connector must reach this port and leave it with the cradle restrained.',
      completeDryLoadAndMotionProved:false},
    spoolRenewal:{strokeInwardMM:spoolStroke,firstRest:[pipeJoint[0]-spoolStroke,exteriorSpoolEnd[0]-spoolStroke,2800,600],
      closedRouteAvailableOnlyOutsideMaintenance:true,temporaryCapturedSupportsX:[11025,11325],providerSideCut:'B0',
      sideStance:[10920,3175],sideStancePlanClearanceMM:3175-2800-retainedBodyRadius-radius,
      nominalBodyAxisClearanceMM:pipeJoint[0]-spoolStroke-temporaryBody,
      prerequisite:'With B0 and I0 independently proved, drain both exposed ends, remove the single local inlet elbow with D0 and its release key, clear the eye and fit temporary supports. Keep the fixed I0, U0 and P0 in place. Verify wall seals release before drawing the capped bare spool inward.'},
    controlledDrain:{drainSpouts,pan,externalUpperBoundLitres:(pan[1]-pan[0])*(pan[3]-pan[2])*(pan[5]-pan[4])/1e6,
      trialNetL:18,maximumBatchL:5,minimumSpoutToRimMM:100,
      headerResidualMM:headerResidualLength,headerResidualTubeOnlyUpperL:headerResidualLength*oneMMVolumeLitres,
      branchResidualTubeOnlyUpperLEach:(1555-rows.U0.facesZ[1])*oneMMVolumeLitres,
      residualHandling:'Positive zero-pressure proof and a captured local pan before either I0 face opens. Add actual fitting/valve voids, verify retained pockets, and use a separately accessible outdoor low cut for the rise.',passiveFaultCredit:false},
    faultBoundary:{wetOutlets,ordinaryChuteFallRatio:50,permanentPitchedPanBelowControlledTray:true,
      wallCrossingPlanBetweenOutletsMM:225,d2CrossingKeptIndependent:true,
      normalHalfClearIdealBoundLmin:outsideDrip.independentOutlet.clearClogCases[1].idealControllingLmin,
      closedControlPenetrationsUnqualified:true,blockedAndSaturatedDestinationsStillRequireProof:true},
  };
}

function stationDrawing(result) {
  const {rows,face,cupboard,paths,controlledDrain,removal,spoolRenewal,faultBoundary}=result;
  const yy=v=>70+(v-cupboard[2])/1.7;
  const zz=v=>450-v/6;
  const py=v=>675+(v-3275)/3.35;
  const pz=v=>450-v/7;
  const label=(x,y,value,kind='')=>`<text x="${x}" y="${y}" class="${kind}">${value}</text>`;
  const pipe=(points,hor,ver,color='#305f58',width=5)=>`<polyline points="${points.map(([x,y,z])=>`${hor(y)},${ver(z)}`).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round"/>`;
  const axisRect=(a,b,c,d,hor,ver,fill)=>`<rect x="${hor(a)}" y="${ver(d)}" width="${hor(b)-hor(a)}" height="${ver(c)-ver(d)}" fill="${fill}" stroke="#54706c"/>`;
  const [,,ymin,ymax,bottom,top]=controlledDrain.pan;
  const [,,podiumSouth,podiumNorth,podiumTop]=removal.highUnionPodium;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1130" height="645" viewBox="0 0 1130 645" role="img" aria-labelledby="title description">
<title id="title">Fixed indoor stop station and separate removable plant feed</title>
<desc id="description">West elevation of the proposed lobby cabinet trial and projection of its plant feed and vessel connection in the house north-south axis.</desc>
<style>text{fill:#243c37;font-family:sans-serif;font-size:15px}.title{font-size:30px;font-weight:bold}.head{font-size:21px;font-weight:bold}.small{font-size:13px}.wet{fill:#324f79}.release{fill:#a74e36}</style>
<rect width="1130" height="645" fill="#f5f2e9"/>
${label(35,46,'Fixed stop station and removable plant feed','title')}
${label(35,74,'Independent isolation, restraint and D2. Dimensioned pre-site comparison in millimetres.')}
${label(65,107,'West elevation of cabinet at X11185','head')}
${label(675,107,'Plant projection on the north-south axis','head')}
${axisRect(cupboard[2],cupboard[3],0,1950,yy,zz,'#e4e0d2')}
${axisRect(face.clearY[0],face.clearY[1],face.clearZ[0],face.clearZ[1],yy,zz,'#ecede4')}
${pipe(paths.mainIn,yy,zz)}
${pipe(paths.header,yy,zz)}
${pipe(paths.utilityIn,yy,zz)}
${pipe([...paths.utility.slice(0,3),[11505,2882,1900]],yy,zz,'#305f58',3)}
${label(yy(2882)+8,zz(1800),'To utility','small')}
${pipe([paths.plant[0],[paths.plant[1][0],paths.plant[1][1],1900]],yy,zz,'#305f58',3)}
${label(yy(3370)+8,zz(1800),'To plant','small')}
${Object.entries(rows).map(([name,row])=>axisRect(row.axis[1]-37,row.axis[1]+37,...row.facesZ,yy,zz,'#95c0aa')+label(yy(row.axis[1])+30,zz(row.axis[2]),name)).join('')}
${controlledDrain.drainSpouts.map(drain=>pipe([drain.tee,drain.spout],yy,zz,'#5373a0',2)+label(yy(drain.spout[1])+5,zz(drain.spout[2])-4,drain.id,'small wet')).join('')}
${axisRect(ymin,ymax,bottom,top,yy,zz,'#deecf1')}
${faultBoundary.wetOutlets.map(outlet=>label(yy(outlet.crossing[1])-13,zz(outlet.crossing[2])+34,outlet.existingComparison?'Ø100 normal':'Ø100 relief','small wet')).join('')}
${axisRect(podiumSouth,podiumNorth,0,podiumTop,py,pz,'#e4e0d2')}
${pipe(paths.plant,py,pz)}
${pipe(paths.removablePlantDrop,py,pz,'#a74e36')}
${pipe(paths.exposedColdConnector,py,pz,'#a74e36',3)}
${label(py(3370)+12,pz(2200)+14,'Fixed over arch')}
${label(py(3950)+20,pz(1600),'Removable drop','release')}
${label(py(3950)+20,pz(270),'Trial podium')}
${label(65,504,`${Math.round(spoolRenewal.strokeInwardMM*10)/10} inward stroke for the one joint-free wall spool.`)}
${label(65,531,'Blue  Controlled drain spouts above a removable receiver.')}
${label(65,558,'Each behind-cover stop has separate fixed end restraints.')}
${label(675,504,'Z2260 fixed spine. Z2223 underside.')}
${label(675,531,'Disconnect cold port before moving the drop.')}
${label(675,558,'No low permanent support in vessel cart path.')}
<path d="M35 581 H1094" stroke="#bfb8a4"/>
${label(35,610,'HAD · Geometry comparison only. Verify complete pressure supports, loaded release, fabrication and receiving water.','small')}
</svg>\n`;
}

if (process.argv[1]===fileURLToPath(import.meta.url)) {
  const result = deriveFixedStation();
  const outputs={json:JSON.stringify(result,null,2)+'\n',svg:stationDrawing(result)};
  for(const [extension,text] of Object.entries(outputs)){
    const out=new URL(`inlet-fixed-station.${extension}`,import.meta.url);
    if(process.argv.includes('--write')) writeFileSync(out,text);
    else if(process.argv.includes('--check')) assert.equal(readFileSync(out,'utf8'),text);
  }
  if(process.argv.length===2) process.stdout.write(outputs.json);
}
