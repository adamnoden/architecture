import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {deriveCurrentHouse} from './current-house.mjs';
import {deriveFixedStation} from './inlet-fixed-station.mjs';

const round = value => Number(value.toFixed(5));
const insideX = 11570.5;
const outsideX = 12090;
const pan=[11210,11545,2710,3525];
const opening=[3040,3260,315,425];
const floorZ=105;
const drySillZ=395;
const standardFallRatio=50;
const settingMM=10;
const splashMM=20;
const bodyRadiusMM=300;
const rimFreeDropMM=25;
const flowTrials=[6,15,30,60];
const cd=.62;
const g=9.81;
const rectangularWeirHead=(flow,width)=>Math.pow((flow/60000)/(2/3*cd*Math.sqrt(2*g)*width/1000),2/3)*1000;

export function deriveCabinetFault() {
  const fixed = deriveFixedStation();
  const {model}=deriveCurrentHouse();
  const {plantReferenceDoor:door}=model;
  const {operatorCentrePath}=door;
  assert.equal(door.retainedBodyRadius,bodyRadiusMM);
  const wallLength = outsideX - insideX;
  const formedSleeveR=50;
  const usableOpeningMM=220;
  const throatRun = 1725;
  const openTerminalX=outsideX+throatRun;
  const downstreamCrest=opening[2]-(openTerminalX-insideX)/standardFallRatio;
  const crestClearances = fixed.faultBoundary.wetOutlets.map(outlet=>{
    const [,y,z]=outlet.crossing;
    const insideInvert=z+wallLength/standardFallRatio;
    const centreZ=insideInvert+outlet.minimumClearID/2;
    const gapY=Math.max(opening[0]-y,y-opening[1],0);
    const gapZ=Math.max(opening[2]-centreZ,centreZ-opening[3],0);
    return {id:outlet.id,insideInvert,axis:[y,centreZ],nominalGeometricLigamentMM:Math.hypot(gapY,gapZ)-formedSleeveR,
      geometricLigamentAfterSettingMM:Math.hypot(gapY,gapZ)-formedSleeveR-settingMM};
  });
  const panAreaMM2=(pan[1]-pan[0])*(pan[3]-pan[2]);
  const upperGrossLitres=panAreaMM2*(drySillZ-floorZ)/1e6;
  const gravityCases=flowTrials.map(flow=>{
    const wholeHeadMM=rectangularWeirHead(flow,usableOpeningMM);
    const halfClearHeadMM=rectangularWeirHead(flow,usableOpeningMM/2);
    return {flowLmin:flow,wholeHeadMM,halfClearHeadMM,maximumModeledWaterZ:opening[2]+halfClearHeadMM,
      drySillReserveAfterSettingsAndSplashMM:drySillZ-opening[2]-halfClearHeadMM-settingMM-splashMM,
      allRoutesBlockedTimeToSillUpperSeconds:60*upperGrossLitres/flow};
  });
  const outside = {terminalX:openTerminalX,firstExitZ:downstreamCrest,maximumReceivingZ:downstreamCrest-rimFreeDropMM,
    toDockBeforeSettingsMM:3400-opening[1],toD2GrateBeforeSettingsMM:opening[0]-2650,
    separatePassiveContinuationRequired:true,ratingKnown:false};
  const dryRoute = {restX:11113,trayNoseX:11040,sourceX:11385,workingBodyX:10705,maxModuleR:37};
  const southPier=model.groundWalls.find(wall=>wall.id==='utility-north').finishedFaces[1];
  const northPier=model.groundWalls.find(wall=>wall.id==='plant-intermediate-arch').finishedFaces[0];
  const serviceRows=Object.entries(fixed.rows).map(([id,row])=>({id,y:row.axis[1],z:row.axis[2],
    body:[dryRoute.workingBodyX,row.axis[1]===2800?2985:row.axis[1]===3370?3250:3110,row.stance[2]],
    maxReachToWithdrawnAxisMM:round(Math.hypot(dryRoute.restX-dryRoute.workingBodyX,row.axis[1]-(row.axis[1]===2800?2985:row.axis[1]===3370?3250:3110),row.axis[2]-row.stance[2])),
    controlledRemoval:'Fulfil the matched flat face contract. Fit and pin loaded runner to independent retained rail. Isolate, prove zero pressure on both ends and physically support before loosening. Lock the first rest before transferring the valve to a carried cradle.'}));
  const arrivalY=[operatorCentrePath.at(-2)[1],...serviceRows.map(row=>row.body[1])];
  const routeBetweenPierFinishedFacesAfterSettingsMM=Math.min(Math.min(...arrivalY)-southPier,northPier-Math.max(...arrivalY))-bodyRadiusMM-settingMM;
  const reserveAxes={maintenanceSpoutY:[2900,2960,3110,3370],spoutZ:565,receiverZ:[420,500],
    receiverBounds:[11200,11555,2750,3450],netLitres:12,maximumBatchLitres:5,airGapMM:65,
    dischargeSupportIndependent:true,receiverHasFaultCredit:false};
  const fullBoreAreaM2=Math.PI*(22/2000)**2;
  const pressureSensitivityPa=600000;
  const idealNormalJetStoppingForceN=2*fullBoreAreaM2*pressureSensitivityPa;
  const trialPanel={gridMM:100,steelThicknessMM:6,bandWidthMM:22,elasticModulusMPa:200000,forceMultiplier:1.5};
  const bandSectionModulus=trialPanel.bandWidthMM*trialPanel.steelThicknessMM**2/6;
  const bandSecondMoment=trialPanel.bandWidthMM*trialPanel.steelThicknessMM**3/12;
  const panelForceN=trialPanel.forceMultiplier*idealNormalJetStoppingForceN;
  return {status:'RETAIN_FIXED_CABINET_FOR_JOINED_DETAIL',selection:fixed.selection,
    wetBoundary:{pan,floorZ,drySillZ,opening,wallLength,settingMM,splashMM,crestClearances,
      permanentTrayGrossCapacityUpperLitres:upperGrossLitres,gravityCases,outside,
      wetFace:'Continuous sealed metal upstand and mechanically retained front splash leaf. Raised drawer above flood level is a removable maintenance piece with no fault credit. Independently wet all leaf joints, controls and upper support penetrations under the actual source-fed pressure case.',
      bothPipeOutletsBlocked:'The independent broad open daylight route is available only with free reception. Keep its cleaned throat/outside outlet physically separate from both small pipes. Walkway and outside approach are never permitted receiving areas.',
      allOutletsBlocked:'No configuration here contains a source-fed failure indefinitely. When the direct spill edge or receiving land is also blocked or saturated, reject the plot or redraw a truly external wet bay with a broad safe exterior spill. No response time, pump, safety-discharge or roof-water path is credited.'},
    pressureScreen:{ ...trialPanel,pressureSensitivityPa,idealNormalJetStoppingForceN,panelForceN,
      centreStripBendingMPa:panelForceN*trialPanel.gridMM/4/bandSectionModulus,
      centreStripDeflectionMM:panelForceN*trialPanel.gridMM**3/(48*trialPanel.elasticModulusMPa*bandSecondMoment),
      scope:'Simple strip bending comparator for a normally stopped ideal jet, not a measured flow, adopted supply pressure or whole-panel, latch, seam or spray rating.'},
    service:{...dryRoute,withdrawalStrokeMM:dryRoute.sourceX-dryRoute.restX,
      moduleGapPastFaceMM:fixed.face.westX-dryRoute.restX-dryRoute.maxModuleR,
      bodyGapToTrayMM:dryRoute.trayNoseX-dryRoute.workingBodyX-door.retainedBodyRadius,
      trayGapToOrdinaryBodyMM:dryRoute.trayNoseX-operatorCentrePath.at(-1)[0]-door.retainedBodyRadius,
      rows:serviceRows,maintenanceReceiver:reserveAxes,routeBetweenPierFinishedFacesAfterSettingsMM,
      routeStatus:'The west return follows the existing body route. The added stance branches clear both finished transverse pier faces and retreat is separate from rack work after lockout. Treat the feed-side opening and goods handling as scheduled work, never simultaneously rack parts across dry retreat. Actual cover guides, runner bearings, contact tolerances and loads remain qualification.'},
  };
}

function section({wetBoundary:w,service:s}) {
  const x=v=>75+(v-10450)/4.4;
  const y=v=>365-v/2.6;
  const label=(x,y,value,kind='')=>`<text x="${x}" y="${y}" class="${kind}">${value}</text>`;
  const box=(a,b,c,d,fill)=>`<rect x="${x(a)}" y="${y(d)}" width="${x(b)-x(a)}" height="${y(c)-y(d)}" fill="${fill}" stroke="#627473"/>`;
  const line=(a,b,c,d,stroke)=>`<line x1="${x(a)}" y1="${y(b)}" x2="${x(c)}" y2="${y(d)}" stroke="${stroke}" stroke-width="3"/>`;
  const critical=w.gravityCases.find(c=>c.flowLmin===30);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1060" height="570" viewBox="0 0 1060 570" role="img" aria-labelledby="title desc">
<title id="title">Cabinet wet boundary and independent daylight spill</title>
<desc id="desc">East-west projection of retained dry sill, raised maintenance drawer, independent daylight water path and planned captured first rest.</desc>
<style>text{fill:#223d39;font-family:sans-serif;font-size:16px}.title{font-size:28px;font-weight:bold}.water{fill:#2a5172}.small{font-size:13px}</style>
<rect width="1060" height="570" fill="#f5f2e8"/>
${label(30,45,'A permanent wet enclosure with a separate daylight spill','title')}
${label(30,73,'Independent lower pipe outlets are shown dashed. House coordinates in millimetres.')}
${box(insideX,outsideX,-95,w.opening[2],'#e1dccc')}
${box(insideX,outsideX,w.opening[3],615,'#e1dccc')}
${box(11185,insideX,w.floorZ,critical.maximumModeledWaterZ,'#d5e5e9')}
${line(11185,w.floorZ,11185,w.drySillZ,'#384943')}
${box(s.maintenanceReceiver.receiverBounds[0],s.maintenanceReceiver.receiverBounds[1],...s.maintenanceReceiver.receiverZ,'#9ec6be')}
${line(insideX,w.opening[2],w.outside.terminalX,w.outside.firstExitZ,'#245c78')}
${line(s.trayNoseX,490,s.sourceX,490,'#a45d3f')}
<line x1="${x(11185)}" y1="${y(100)}" x2="${x(outsideX+250)}" y2="${y(90)}" stroke="#658a9c" stroke-dasharray="6 5" stroke-width="2"/>
<line x1="${x(11185)}" y1="${y(160)}" x2="${x(outsideX+250)}" y2="${y(150)}" stroke="#658a9c" stroke-dasharray="6 5" stroke-width="2"/>
${label(30,405,'Z395 continuous dry sill')}
${label(30,430,'Z420–500 removable service drawer')}
${label(30,455,`X${s.restX} captured first rest after ${s.withdrawalStrokeMM} mm draw`)}
${label(590,405,`Z${w.opening[2]} daylight crest at Y${w.opening[0]}–${w.opening[1]}`,'water')}
${label(590,430,`Z${round(w.outside.firstExitZ)} open lip above independent receiver`,'water')}
${label(590,455,`Z${critical.maximumModeledWaterZ.toFixed(2)} at 30 L/min, half-clear ideal throat`,'water')}
<path d="M30 487 H1030" stroke="#bfb9a7"/>
${label(30,523,'Pre-site section. Actual pressure capture, support, outlet independence and installation details remain open.','small')}
</svg>\n`;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const result=deriveCabinetFault();
  const outputs={json:JSON.stringify(result,null,2)+'\n',svg:section(result)};
  for(const [extension,text] of Object.entries(outputs)){
    const out=new URL(`inlet-cabinet-fault.${extension}`,import.meta.url);
    if(process.argv.includes('--write')) writeFileSync(out,text);
    else if(process.argv.includes('--check')) assert.equal(readFileSync(out,'utf8'),text);
  }
  if(process.argv.length===2) process.stdout.write(outputs.json);
}
