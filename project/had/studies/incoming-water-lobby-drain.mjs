import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {deriveCurrentHouse} from './current-house.mjs';
import {traceInletFirstWetting} from './incoming-water-first-wetting.mjs';

const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const inlet=load('./incoming-water.json');
const grid=load('../../str/studies/current-house-grid.json');

const overlap=([a,b],[c,d])=>Math.max(0,Math.min(b,d)-Math.max(a,c));

function gravityCapacity({boreMM,fallRatio,roughness,remainingWidthMM,headMM}){
  const radius=boreMM/2000;
  const area=Math.PI*radius**2/2;
  const hydraulicRadius=radius/2;
  const barrelLmin=area*hydraulicRadius**(2/3)*Math.sqrt(1/fallRatio)/roughness*60000;
  const weirLmin=(remainingWidthMM/1000)*Math.sqrt(9.81)*(headMM/1500)**1.5*60000;
  return {halfFullBarrelLmin:barrelLmin,idealFreeInletLmin:weirLmin,controllingLmin:Math.min(barrelLmin,weirLmin)};
}

export function compareLobbyDrain(){
  const {model,id}=deriveCurrentHouse();
  if(id!==inlet.selection)throw new Error('Rebind the lobby section to its selected house.');
  const wetting=traceInletFirstWetting();
  const {groundFFL:ffl,groundFloorRC:slab}=model.sections;
  const {datum,width,z}=grid.girders['outer-E'];
  const beamX=[datum-width/2,datum+width/2];
  const [entryX,entryY,entryZ]=inlet.station.entry.point;
  const eastFace=wetting.entry.insideFaceProjection[0];
  const protectedX=wetting.protectedThreshold.eastFaceX;
  const outerPipeEndX=beamX[1]+100;
  const outerPipeLengthMM=outerPipeEndX-eastFace;
  const boreMM=80,formedMM=100,adverseDatumMM=5;
  const sectionFallRatio=50;
  const directedBayWestX=11000;
  const thresholdToBayMM=directedBayWestX-protectedX;
  const [southPan,northPan]=Object.values(inlet.station.geometry.pans);
  const panEast=[southPan,northPan].map(([x,,,w])=>x+w);
  const bayY=[southPan[1],northPan[1]+northPan[4]];
  const utilityFace=model.groundWalls.find(wall=>wall.id==='utility-north').finishedFaces[1];
  const plantFace=model.groundWalls.find(wall=>wall.id==='plant-intermediate-arch').finishedFaces[0];
  const bayFallMM=(eastFace-directedBayWestX)/80;
  const crossfall={
    westX:directedBayWestX,eastX:eastFace,westTopZ:ffl,eastTopZ:ffl-bayFallMM,
    ratio:80,remainingEastFallMM:bayFallMM-2,bayY,
    endReturnsToWallFacesMM:[bayY[0]-utilityFace,plantFace-bayY[1]],
    protectedThresholdX:protectedX,thresholdToBayMM,creditedWaterStop:false,
  };

  // Use the ordinary MAT mineral-break section as an explicit negative control.
  // The actual low-level east-wall assembly has not been issued at this position.
  const mineralBaseZ=[slab.top,-30];
  const outletY=entryY;
  const {P17}=inlet.station.entry;
  const capNearY=P17.xy[1]-P17.capXY[1]/2;
  const capPlanReserveMM=capNearY-outletY-formedMM/2-adverseDatumMM;
  const boreAt=(invert,run)=>{
    const endInvert=invert-run/sectionFallRatio;
    return {invertZ:invert,endInvertZ:endInvert,
      formedZAtInside:[invert+(boreMM-formedMM)/2,invert+(boreMM+formedMM)/2],
      formedZAtEnd:[endInvert+(boreMM-formedMM)/2,endInvert+(boreMM+formedMM)/2]};
  };
  const low=boreAt(-100,outerPipeLengthMM);
  const raised=boreAt(35,outerPipeLengthMM);
  const lowSection={...low,sumpEntryZ:-45,trialSumpShellBottomZ:-115,crossfall,capPlanReserveMM,
    originalGlassTopZ:-80,sumpIncursionIntoGlassMM:35,
    insideMineralBaseOverlapMM:overlap(low.formedZAtInside,mineralBaseZ),
    outsideMineralBaseOverlapMM:overlap(low.formedZAtEnd,mineralBaseZ),
    aboveBeamAfterSettingMM:low.formedZAtEnd[0]-z[1]-adverseDatumMM,
    disposition:'REJECT_UNCHANGED_MINERAL_BASE'};
  const raisedSection={...raised,insideTrayFloorZ:40,insideTrayRimZ:105,
    projectedDripFromZ:entryZ-inlet.station.entry.formedBore/2,
    lipProjectionMM:60,capPlanReserveMM,
    trayWestX:eastFace-60,trayY:[entryY-65,entryY+65],
    existingPanRimZ:southPan[2]+southPan[5],raisedTrayRimAbovePanRimMM:105-southPan[2]-southPan[5],
    clearanceAboveFinishedFloorAtEndMM:raised.formedZAtEnd[0]-ffl-adverseDatumMM,
    insideMineralBaseOverlapMM:overlap(raised.formedZAtInside,mineralBaseZ),
    helpsFreeFloorOverflow:false,creditedPressureJetCapture:false,
    disposition:'SEPARATE_RAISED_DRIP_CANDIDATE'};
  const receiver={branchRunMM:3000,branchFallRatio:50,assumedFreeDropMM:25};
  const receivingLevels=[low,raised].map(({endInvertZ})=>{
    const finalInvertZ=endInvertZ-receiver.branchRunMM/receiver.branchFallRatio;
    return {finalInvertZ,maximumTrialReceivingWaterZ:finalInvertZ-receiver.assumedFreeDropMM};
  });
  const comparisonFlowLmin=Math.max(...wetting.receiver.rateComparisons[0].secondsFromFirstCapturedWater.map(x=>x.litresPerMinute));
  const inletCases=[80,40,20,0].map(remainingWidthMM=>({remainingWidthMM,
    ...gravityCapacity({boreMM,fallRatio:sectionFallRatio,roughness:.018,remainingWidthMM,headMM:25})}));
  const receiverCapacityLitres=[1,5,20].map(minutes=>({minutes,volumeWithoutLossLitres:minutes*comparisonFlowLmin}));
  return {status:'DEVELOPMENT_NOT_ADOPTED',selection:id,
    authority:{slab,ffl,beamX,beamZ:z,panEast,eastFace,entryX,entryY,entryZ,protectedX,mineralBaseZ},
    lowSection,raisedSection,receiver:{...receiver,receivingLevels,comparisonFlowLmin,inletCases,receiverCapacityLitres,
      roofOrPlantThresholdReceiverCredited:false,d2Credited:false,siteReceivingWaterZ:null},
    held:['Both proposed wall penetrations require formed and supported load/air/water details, thermal continuity and accessible end returns.',
      'No surveyed outfall, pressure-jet hood, seal/liner product, floor wetting extent or physical collection test.',
      'The raised branch does not protect the lobby floor or the protected threshold after bypass, blockage or release outside the drip witness.']};
}


export function lobbyDrainSectionSVG(study){
  const {authority:a,lowSection:low,raisedSection:raised}=study;
  const x=station=>82+(station-11000)*.66;
  const y=level=>314-level*.36;
  const rect=(x1,x2,z1,z2,fill)=>`<rect x="${x(x1)}" y="${y(z2)}" width="${x(x2)-x(x1)}" height="${y(z1)-y(z2)}" fill="${fill}"/>`;
  const label=(px,py,words,style='')=>`<text x="${px}" y="${py}" ${style}>${words}</text>`;
  const line=(x1,y1,x2,y2,color,width=1)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
  const water='#196e78',failure='#a74732';
  const endX=a.beamX[1]+100;
  const route=(section,color)=>line(x(a.eastFace),y(section.invertZ),x(endX),y(section.endInvertZ),color,3);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1110 545" role="img" aria-labelledby="title desc">
<title id="title">East inlet gravity section at Y2800</title>
<desc id="desc">Comparison of an east-draining recessed floor sump and a raised sleeve drip tray with independent outlets. The low outlet crosses the wall-base break comparison. Neither route is adopted.</desc>
<rect width="1110" height="545" fill="#f7f4ed"/>
<g font-family="sans-serif" font-size="15" fill="#202821">
${label(32,40,'East inlet gravity section at Y2800','font-size="27" font-weight="bold"')}
${label(32,65,'Dimensions in mm. Horizontal and vertical graphics use different scales.')}
${rect(11000,a.beamX[0],a.slab.bottom,a.slab.top,'#a9aca4')}
${rect(a.beamX[0],a.beamX[1],a.beamZ[0],a.beamZ[1],'#a9aca4')}
${rect(11000,a.eastFace,-180,-80,'#d9ded0')}
${rect(11000,a.eastFace,-80,-15,'#e8e2d1')}
${rect(a.eastFace,a.entryX,a.mineralBaseZ[0],a.mineralBaseZ[1],'#debfa7')}
${rect(a.eastFace,a.entryX,a.mineralBaseZ[1],640,'#e4d9c9')}
${line(x(a.eastFace),y(a.entryZ),x(a.entryX),y(a.entryZ),water,7)}
${line(x(a.eastFace),y(a.entryZ-50),x(a.eastFace-60),y(a.entryZ-60),water,3)}
${line(x(a.eastFace-60),y(a.entryZ-60),x(a.eastFace-60),y(raised.insideTrayFloorZ),water,1)}
${rect(a.eastFace-60,a.eastFace,raised.insideTrayFloorZ,raised.insideTrayRimZ,'#9fcac5')}
${line(x(11000),y(a.ffl),x(a.eastFace-75),y(low.crossfall.eastTopZ),'#5a6658',3)}
${rect(a.eastFace-75,a.eastFace,low.trialSumpShellBottomZ,low.sumpEntryZ,'#d9b3a6')}
${route(raised,water)}
${route(low,failure)}
${line(x(a.eastFace),y(640),x(a.eastFace),y(a.slab.top),'#847a6c')}
${line(x(a.entryX),y(640),x(a.entryX),y(a.slab.top),'#847a6c')}
${label(92,155,'Protected threshold X9397 lies 1603 west of the bay crest.')}
${label(92,178,'The flush crossing has no water-stop credit.')}
${label(484,90,'Service sleeve Z600',`fill="${water}"`)}
${label(510,114,'East wall and base comparison')}
${label(92,277,'1:80 inlet bay fall')}
${label(92,348,'Finish and distribution')}
${label(92,369,'100 mm glass zone')}
${label(92,402,'Concrete slab')}
${label(425,467,'Outer-E beam')}
${label(811,241,'Raised tray and weep',`fill="${water}" font-weight="bold"`)}
${label(811,263,'Z35 → Z22.06 invert at support exit')}
${label(811,285,'Above wall-base comparison')}
${label(811,348,'Low floor scupper',`fill="${failure}" font-weight="bold"`)}
${label(811,370,'Z−100 → Z−112.94 invert')}
${label(811,392,'Crosses mineral-base comparison')}
${label(765,465,'Both need separate surveyed receiving routes.')}
${label(765,488,'No credit to roof, plant threshold or D2.')}
</g>
</svg>
`;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const study=compareLobbyDrain();
  const drawing=new URL('./incoming-water-lobby-drain.svg',import.meta.url);
  const svg=lobbyDrainSectionSVG(study);
  if(process.argv.includes('--write'))writeFileSync(drawing,svg);
  else if(process.argv.includes('--check')){
    if(readFileSync(drawing,'utf8')!==svg) throw new Error('Lobby drain drawing is out of date.');
  }else console.log(JSON.stringify(study,null,2));
}
