import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {deriveCabinetFault} from './inlet-cabinet-fault.mjs';
import {deriveFramedInletBay} from './inlet-framed-bay.mjs';
import {deriveFixedStation} from './inlet-fixed-station.mjs';

const round=value=>Number(value.toFixed(5));
const waterGravity=9.81;
const weir=(flowLmin,widthMM,cd)=>1000*((flowLmin/60000)/(2/3*cd*Math.sqrt(2*waterGravity)*widthMM/1000))**(2/3);
const flowAtHead=(headMM,widthMM,cd)=>60000*(2/3*cd*Math.sqrt(2*waterGravity)*widthMM/1000)*(headMM/1000)**1.5;
const criticalOpenDepth=(flowLmin,widthMM)=>1000*((flowLmin/60000/(widthMM/1000))**2/waterGravity)**(1/3);
function normalOpenDepth(flowLmin,widthMM){
  const width=widthMM/1000;
  let lo=0,hi=.2;
  for(let i=0;i<50;i++){
    const d=(lo+hi)/2;
    const area=width*d;
    const q=area*(area/(width+2*d))**(2/3)*Math.sqrt(1/50)/.020;
    if(q<flowLmin/60000)lo=d;else hi=d;
  }
  return 1000*hi;
}
const straightHole=(bar,diameter)=>60000*Math.PI*(diameter/2000)**2*Math.sqrt(2*bar*100000/1000);

export function deriveProtectedDaylight(){
  const bay=deriveFramedInletBay();
  const {wetBoundary:wet,pressureScreen}=deriveCabinetFault();
  const fixed=deriveFixedStation();
  const {spill,pipes}=bay.drainage;
  const setting=wet.settingMM;
  const controlZ=wet.drySillZ-setting-wet.splashMM;
  const metalSide=2,metalFloor=3,drop=25;
  const opening=[...spill.y,spill.z[0]-drop,spill.z[1]-drop];
  const width=opening[1]-opening[0]-2*metalSide;
  const terminalZ=round(opening[2]-(spill.terminalX-bay.frame.wallX[0])/bay.drainage.heldSlope);
  const terminalReceivingMax=round(terminalZ-25);
  const actualSeparation=round(opening[2]-metalFloor-Math.max(...pipes.map(p=>p.bodyZ[1]))-setting);
  const sideReserves=[opening[0]-bay.frame.y[0]-setting,bay.frame.y[1]-opening[1]-setting];
  const faults=[
    {id:'clear',width,dam:0},
    {id:'side blockage leaves half of bottom continuous',width:width/2,dam:0},
    {id:'full-width raised 32 mm lip',width,dam:32},
    {id:'half-width and raised 32 mm lip',width:width/2,dam:32},
  ];
  const cases=[30,60,90,120].flatMap(flow=>[.62,.5].flatMap(cd=>faults.map(({id,width,dam})=>{
    const head=weir(flow,width,cd);
    return {id,flowLmin:flow,cd,bottomClearWidthMM:width,raisedLipMM:dam,headMM:round(head),
      waterZ:round(opening[2]+dam+head),reserveMM:round(controlZ-(opening[2]+dam+head))};
  })));
  const adverse=cases.find(row=>row.flowLmin===60&&row.cd===.5&&row.raisedLipMM===32&&row.bottomClearWidthMM===width/2);
  const channel={slopeDenominator:50,roughnessSensitivity:.020,flowLmin:60,channelWidthMM:width/2,
    normalDepthMM:round(normalOpenDepth(60,width/2)),criticalDepthMM:round(criticalOpenDepth(60,width/2))};
  const oldArea=round((spill.z[1]-spill.z[0]-32)/(spill.z[1]-spill.z[0])*100);
  const oldFullWidthDamReserve=round(controlZ-(spill.z[0]+32+weir(60,spill.y[1]-spill.y[0],.62)));
  const maximumCapableCd05=round(flowAtHead(controlZ-opening[2]-32,width/2,.5));

  // Separate outlet cells. Each uses its own outgoing overflow, so a full
  // receiver gets no credit from any neighbour or the dock.
  const arrivals=[...pipes.map(p=>({
    id:p.id,x:p.terminalX,mouthZ:p.terminalInvertZ,maxZ:p.maximumReceivingZ,lane:p.receivingLaneY,outgoingClearWidthMM:80,
  })),{id:'daylight',x:spill.terminalX,mouthZ:terminalZ,maxZ:terminalReceivingMax,lane:bay.drainage.receivingLanes[2],outgoingClearWidthMM:160}];
  const cells=arrivals.map(inlet=>{
    const cellCrestZ=inlet.maxZ-60;
    const head=weir(60,inlet.outgoingClearWidthMM,.5);
    return {...inlet,insidePlan:[inlet.x-100,inlet.x+400,...inlet.lane],lowestFloorZ:round(inlet.maxZ-180),
      eastOverflowX:inlet.x+400,eastOverflowCrestZ:round(cellCrestZ),modeledWaterZ:round(cellCrestZ+head+setting),
      surchargeReserveMM:round(inlet.maxZ-(cellCrestZ+head+setting)),
      freeDropAtMaximumWaterMM:round(inlet.mouthZ-inlet.maxZ),
      outsideReceiverAdmitted:false};
  });
  const cellSeparationsAfterSettingsMM=cells.slice(1).map((row,i)=>row.lane[0]-cells[i].lane[1]-setting);

  const blockageCases={
    allOutletsBlocked:{accepted:false,grossTrayVolumeUpperL:bay.drainage.panFloor.grossBlockedCapacityUpperL,
      secondsToDrySillAt60LminUpper:bay.drainage.panFloor.allOutletsBlockedSecondsAt60LminUpper},
    commonFloodAtZ230:{floodZ:230,receiverLimitsExceeded:cells.map(cell=>230>cell.maxZ),accepted:false},
  };
  const plate=({bar,thickness})=>{
    const force=pressureScreen.idealNormalJetStoppingForceN*bar/6*pressureScreen.forceMultiplier;
    const section=pressureScreen.bandWidthMM*thickness**2/6;
    return {bar,thicknessMM:thickness,forceN:round(force),stripStressMPa:round(force*pressureScreen.gridMM/4/section)};
  };
  const pressureCases=[3,6,9].map(bar=>({bar,idealHoleFlowsLmin:[3,6,8,22].map(diameterMM=>({diameterMM,flowLmin:round(straightHole(bar,diameterMM))})),
    oldPlate:plate({bar,thickness:6}),preferredPlate:plate({bar,thickness:8})}));
  const closedCover={
    pressureFrontX:[fixed.face.westX,11210],permanentDrySillZ:wet.drySillZ,
    continuousWetUpstandsY:[wet.pan[2],wet.pan[3]],wetLidZ:fixed.cupboardHeight,
    pressurePlateTrialThicknessMM:8,maximumUnsupportedRibSpacingMM:pressureScreen.gridMM,
    declaredMinimumProofStressMPa:200,declaredMaterialFactor:1.1,pressureCases,
    operatingGlands:Object.values(fixed.rows).map(row=>({throughX:fixed.face.westX,axisY:row.axis[1],axisZ:row.axis[2],fixedDryGripX:11145})),
    roofJackets:[{id:'U0',centre:[11505,2882,fixed.cupboardHeight]},{id:'P0',centre:[11385,3370,fixed.cupboardHeight]}]
      .map(({id,centre})=>({id,centre,maximumFixedCurbRadiusMM:50,completeJacketRadiusMM:37,
        eastCurbReserveAfterSettingsMM:fixed.cupboard[1]-centre[0]-50-setting})),
    sideJacket:{id:'spool',centre:[fixed.cupboard[1],2800,600]},
    closure:'Weld lower pan turns continuously into a retained backing frame. Keep panel overlaps, paired drained drive glands and two fixed roof flashings inside the wet-side return. Keep all hinges, ribs and fasteners out of the removable valve, controlled drawer and service handoff. Isolate the shared cabinet at B0 and isolate and verify all downstream faces before opening any pressure splash cover.',
    noProof:'Wet liquid/solid transport, seam reflection, spray at fasteners, panel loads and actual supports require exact pieces and tested jets. The strip is a local impact sensitivity, not static pressure-boundary rating.',
  };
  assert(closedCover.roofJackets.every(row=>row.eastCurbReserveAfterSettingsMM>=0));
  assert(oldFullWidthDamReserve<0);
  assert(actualSeparation>=25&&sideReserves.every(v=>v>=25));
  assert(adverse.reserveMM>0);
  assert(maximumCapableCd05>60&&maximumCapableCd05<90);
  assert(cells.every(c=>c.surchargeReserveMM>0&&c.freeDropAtMaximumWaterMM>=25));
  assert(blockageCases.commonFloodAtZ230.receiverLimitsExceeded.every(Boolean));
  assert(cellSeparationsAfterSettingsMM.every(gap=>gap>=25));
  assert(pressureCases.at(-1).oldPlate.stripStressMPa>200/1.1&&pressureCases.at(-1).preferredPlate.stripStressMPa<200/1.1);
  return {
    disposition:'PREFER_PROTECTED_LOWER_DAYLIGHT_WITHIN_DECLARED_GRAVITY_ENVELOPE',
    aperture:{coordinates:opening,insideClearWidthMM:width,metalSide,metalFloor,settingMM:setting,
      protectedTerminalCapLowestZ:terminalZ+90,underCapClearHeightMM:90,terminalX:spill.terminalX,terminalZ,terminalReceivingMax,
      pipeSeparationAfterLinerAndSettingsMM:actualSeparation,sideReservesAfterSettingMM:sideReserves,
      topology:'Independent high removable hood, continuous vented lower path and three separate exposed air gaps. No shared crossbar, grille or moulding in the lower 90 mm of the daylight channel.'},
    hydraulic:{sillZ:wet.drySillZ,splashMM:wet.splashMM,waterLimitZ:controlZ,cases,adverse60Lmin:adverse,channel,
      originalDamOpenAreaPercent:oldArea,originalFullWidthDamReserveMM:oldFullWidthDamReserve,
      trialLimitingFlowLmin:maximumCapableCd05,preSiteRequiredVerifiedSourceMaximumLmin:60,verifiedProviderFlowLmin:null,blockageCases,
      gravitySensitivityOnly:'Neither coefficient is a verified coefficient for this short slot and long chute. Allow separately for transitions and tailwater. All confined channels, throat fouling and common backing remain tested physical cases.',
      sharedObstruction:'Reject the location or replan a safely exterior wet bay when a surveyed independent free outfall cannot be sustained. No finite tray storage, D2, roof routes, alarms or intervention credited for continuing supply.'},
    receiving:{cells,cellSeparationsAfterSettingsMM,siteAdmitted:false},closedCover,
  };
}

function drawing({aperture:a,hydraulic:h,receiving:r}){
  const x=v=>120+(v-11185)*.295;
  const z=v=>407-(v+180)*.48;
  const line=(points,color,width)=>`<polyline points="${points.map(([px,pz])=>[x(px),z(pz)].join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
  const text=(a,b,label)=>`<text x="${a}" y="${b}">${label}</text>`;
  const basins=[
    {x:42,bay:r.cells[0],fill:'#d8e8e1'},
    {x:380,bay:r.cells[1],fill:'#cedde6'},
    {x:718,bay:r.cells[2],fill:'#d4e1ef'},
  ].map(({x,bay,fill})=>`<rect x="${x}" y="490" width="321" height="112" fill="${fill}" stroke="#59706a"/>
    ${text(x+12,518,bay.id==='blocked-primary relief'?'Raised pipe relief':bay.id[0].toUpperCase()+bay.id.slice(1))}
    ${text(x+12,547,`Y${bay.lane.join('–')} · max receiving Z${bay.maxZ.toFixed(2)}`)}
    ${text(x+12,575,`Independent overflow Z${bay.eastOverflowCrestZ.toFixed(2)}`)}`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 710" role="img" aria-labelledby="title description">
<title id="title">A lower protected daylight spill and independent receiving cells</title>
<desc id="description">Section through the wet cabinet shows the dry sill, lower outlet, new daylight crest, weather hood and water level for the adverse 60 litres per minute sensitivity.</desc>
<style>text{font:16px sans-serif;fill:#2b433d}.title{font:bold 29px sans-serif}.head{font:bold 19px sans-serif}</style>
<rect width="1080" height="710" fill="#fbf7eb"/>
<text x="35" y="48" class="title">Lower and protect the last passive spill</text>
${text(35,77,'Section in house coordinates · Bodies shown at separate draining levels')}
<rect x="${x(11570.5)}" y="${z(485)}" width="${x(12090)-x(11570.5)}" height="${z(0)-z(485)}" fill="#dfd1b7"/>
<rect x="${x(11570.5)}" y="${z(a.coordinates[3])}" width="${x(12090)-x(11570.5)}" height="${z(a.coordinates[2])-z(a.coordinates[3])}" fill="#f4f3e7"/>
${line([[11185,100],[11185,h.sillZ],[11210,h.sillZ]],'#334b45',5)}
${line([[11190,h.adverse60Lmin.waterZ],[11549,h.adverse60Lmin.waterZ]],'#578394',3)}
${line([[11570.5,a.coordinates[2]],[12090,a.coordinates[2]-10.39],[a.terminalX,a.terminalZ]],'#376b77',5)}
${line([[13570,a.protectedTerminalCapLowestZ+32],[13925,a.protectedTerminalCapLowestZ+32],[13925,a.protectedTerminalCapLowestZ]],'#65796c',4)}
${line([[a.terminalX+5,a.terminalZ],[a.terminalX+22,a.terminalReceivingMax]],'#64969f',2)}
${line([[13715,40.11],[13715,220.11],[14215,220.11],[14215,160.11]],'#334b45',2)}
${text(43,112,'Dry sill Z395')}
${text(18,155,`Z${h.adverse60Lmin.waterZ.toFixed(2)}`)}
${text(292,179,'Z290 protected entrance')}
${text(566,143,'Vented 1:50 chute')}
${text(832,110,'High weather hood')}
${text(845,182,`Mouth Z${a.terminalZ}`)}
${text(845,252,`Free reception to Z${a.terminalReceivingMax}`)}
${text(35,392,'216 mm clear inside the liner. In the adverse case only 108 mm remains and the full crest rises 32 mm.')}
${text(35,423,`Both lower pipes blocked · 60 L/min · 8.99 mm indoor reserve at the lower coefficient.`)}
<line x1="35" y1="447" x2="1040" y2="447" stroke="#9caa9e"/>
<text x="41" y="477" class="head">Keep three unshared landing and overflow cells</text>
${basins}
${text(42,649,'A common flood or solid obstruction is adverse. Actual supply, attachments and lawful outfalls still need verification.')}
</svg>
`;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const result=deriveProtectedDaylight();
  for(const [extension,content] of Object.entries({json:JSON.stringify(result,null,2)+'\n',svg:drawing(result)})){
    const file=new URL(`./inlet-protected-daylight.${extension}`,import.meta.url);
    if(process.argv.includes('--write'))writeFileSync(file,content);
    else if(process.argv.includes('--check'))assert.equal(readFileSync(file,'utf8'),content);
    else if(extension==='json')process.stdout.write(content);
  }
}
