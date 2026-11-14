import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {compareTemporaryGantry} from './incoming-water-temporary-gantry.mjs';
import {compareLobbyDrain} from './incoming-water-lobby-drain.mjs';

const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const {station}=load('./incoming-water.json');
const receiving=load('../../rwt/studies/selected-receiving-interface.json');

const intervalGap=([a,b],[c,d])=>Math.max(a-d,c-b,0);

export function compareElevatedDrip(){
  const current=compareLobbyDrain();
  const {entry,geometry,drain}=station;
  const {eastFace,entryY,entryZ,ffl,beamX}=current.authority;
  const [panX,panY,panZ,panWidth,panDepth,panHeight]=geometry.pans.south;
  const panEndX=panX+panWidth;
  const panRim=panZ+panHeight;
  const box={
    x:[eastFace-85.5,eastFace],
    y:[entryY-95,entryY+95],
    bottomZ:100,rimZ:145,hoodUpperZ:550,
    clearInletWidthMM:160,
  };
  const ventedPlenum={x:box.x,y:[2895,3055],undersideZ:90};
  const openingSettingMM=5;
  const relativeSettingMM=2*openingSettingMM;
  const lipProjectionMM=50;
  const dripEdgeX=eastFace-lipProjectionMM;
  const dripLapMM=dripEdgeX-box.x[0]-relativeSettingMM;
  const dripSideMM=(box.y[1]-box.y[0]-entry.formedBore)/2-relativeSettingMM;
  const bodyX=geometry.ordinaryBody.at(-1)[0];
  const ordinaryPanClearanceMM=panX-bodyX-300;
  const shortPanDrawMM=Math.max(0,panEndX-box.x[0]+relativeSettingMM);
  const stagingStanceX=bodyX-shortPanDrawMM;
  const spouts=drain.definitions.map(({id,spout,completePipeR})=>{
    const [x,y,z]=spout;
    const horizontalBoxGapMM=intervalGap([x-completePipeR,x+completePipeR],box.x);
    const otherBoxGapMM=intervalGap([y-completePipeR,y+completePipeR],[box.y[0],ventedPlenum.y[1]]);
    return {id,xyz:spout,nearestBoxPlanGapMM:Math.hypot(horizontalBoxGapMM,otherBoxGapMM),
      rimToSpoutVerticalMM:z-box.rimZ,panRimClearanceUnchangedMM:z-panRim};
  });
  const throatHeadMM=25;
  const clearReference=current.receiver.inletCases[0];
  const clearClogCases=[1,.5,.25,0].map(remainingFraction=>{
    const throatWidthMM=box.clearInletWidthMM*remainingFraction;
    const idealInletLmin=clearReference.idealFreeInletLmin*throatWidthMM/clearReference.remainingWidthMM;
    return {remainingFraction,throatWidthMM,idealInletLmin,idealControllingLmin:Math.min(idealInletLmin,clearReference.halfFullBarrelLmin)};
  });
  const formedDiameterMM=100,clearBoreMM=80,invertZ=90,fallRatio=50;
  const receiverRunMM=1500;
  const lateralDiversionMM=175;
  const drainY=entryY+lateralDiversionMM;
  const lowerTrimSettingMM=5;
  const sleeveSeparationAfterSettingMM=lateralDiversionMM-entry.protectedRiserRadius-formedDiameterMM/2-2*lowerTrimSettingMM;
  const outletX=beamX[1]+100;
  const runMM=outletX-eastFace;
  const endInvertZ=invertZ-runMM/fallRatio;
  const formedBottomAtEndZ=endInvertZ-(formedDiameterMM-clearBoreMM)/2;
  const receivingMaximumZ=endInvertZ-receiverRunMM/fallRatio-current.receiver.assumedFreeDropMM;
  const terminalX=outletX+receiverRunMM;
  const originalTerminalX=outletX+current.receiver.branchRunMM;
  const gantryDown=compareTemporaryGantry().gradeRest;
  const oldTerminalInsideGantry=originalTerminalX>=gantryDown[0]&&originalTerminalX<=gantryDown[1]&&drainY>=gantryDown[2]&&drainY<=gantryDown[3];
  const selectedWetCorridorSouthY=Math.min(receiving.east.receiverBounds[1],receiving.east.blockedOutletSpill.requiredContinuation[1]);
  const fixedAxisSleeveRunMM=entry.point[0]-eastFace;
  const radialCorridorMM=entry.radialBudget-entry.settingBudget;
  const radiusM=entry.formedBore/2000;
  const angle=2*Math.acos(1-radialCorridorMM/1000/radiusM);
  const areaM2=radiusM**2*(angle-Math.sin(angle))/2;
  const perimeterM=radiusM*angle;
  const idealBareCorridorLmin=areaM2*(areaM2/perimeterM)**(2/3)*Math.sqrt(1/fallRatio)/.018*60000;
  return {status:'SEPARATE_DRIP_DEVELOPMENT_ONLY',selection:current.selection,box,ventedPlenum,entryZ,ffl,
    reception:{lipProjectionMM,dripEdgeX,dripLapMM,dripSideMM,
      lowerHoodToPipeAfterSettingMM:entryZ-entry.completePipeOD/2-box.hoodUpperZ-relativeSettingMM,
      connectionToSupplyCarriesLoad:false,pressureJetCaptureCredited:false},
    pan:{panZ,panRim,panY,panDepth,panEndX,planOverlapMM:panEndX-box.x[0],
      verticalReserveAfterSettingMM:box.bottomZ-panRim-relativeSettingMM,
      plenumVerticalReserveAfterSettingMM:ventedPlenum.undersideZ-panRim-relativeSettingMM,
      shortPanDrawMM,ordinaryPanClearanceMM,stagingStanceX,spouts,
      actualRemovalClearanceProved:false},
    independentOutlet:{outletX,drainY,lateralDiversionMM,lateralDiversionFallMM:lateralDiversionMM/fallRatio,
      sleeveSeparationAfterSettingMM,formedDiameterMM,clearBoreMM,invertZ,endInvertZ,fallRatio,receiverRunMM,receivingMaximumZ,terminalX,gantryDown,oldTerminalInsideGantry,
      selectedWetCorridorSouthY,gantryWestClearMM:gantryDown[0]-terminalX,
      formedBottomAtEndZ,clearAboveFFLAfterSettingMM:formedBottomAtEndZ-ffl-openingSettingMM,
      throatHeadMM,lipFreeboardAfterHeadMM:box.rimZ-box.bottomZ-throatHeadMM,clearClogCases,
      siteReceivingWaterZ:null,roofPlantThresholdD2Credit:false},
    fixedAxisAnnulus:{fixedAxisSleeveRunMM,radialCorridorMM,requiredFallMM:fixedAxisSleeveRunMM/fallRatio,
      linerAndSettingAllowanceAtWallExitMM:radialCorridorMM-fixedAxisSleeveRunMM/fallRatio,
      linerAndSettingAllowanceAtSupportExitMM:radialCorridorMM-runMM/fallRatio,
      idealBareCorridorLmin}};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const result=JSON.stringify(compareElevatedDrip(),null,2)+'\n';
  const path=new URL('./incoming-water-elevated-drip.json',import.meta.url);
  if(process.argv.includes('--write'))writeFileSync(path,result);
  else if(process.argv.includes('--check')){
    if(readFileSync(path,'utf8')!==result)throw new Error('Elevated drip receipt has changed.');
  }else console.log(result);
}
