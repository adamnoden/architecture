import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const threshold=JSON.parse(readFileSync(new URL('../../mat/studies/plant-threshold.json',import.meta.url),'utf8'));
const lodigePlanning={
  url:'https://www.lodige.co.uk/fileadmin/Downloads/doc-lift-e/Sherpa-Escorta/Planning-guide-Sherpa-Escorta-20210329-LUK_01.pdf',
  pages:'4, 7–13, 21',
  throughMinTravelMM:450,frontOnlyExtraTravelMM:300,edgeLoadFraction:.6,
  shaftWidthAllowanceMM:370,throughShaftDepthAllowanceMM:140,rollOffAllowancePerEndMM:175,
  lowerPitOrRampMM:70,stockRampRunMM:1000,
};

function compareSillStrip(wheelN){
  const freeGapMM=40,relativeHorizontalSettingMM=10,retainedBearingEachMM=25;
  const maximumGapMM=freeGapMM+relativeHorizontalSettingMM;
  const effectiveSpanMM=maximumGapMM+retainedBearingEachMM;
  const plateThicknessMM=12,effectiveStripWidthMM=40,steelE=200000;
  const inertia=effectiveStripWidthMM*plateThicknessMM**3/12;
  const momentNMM=wheelN*effectiveSpanMM/4;
  const stressMPa=momentNMM*plateThicknessMM/(2*inertia);
  const deflectionMM=wheelN*effectiveSpanMM**3/(48*steelE*inertia);
  const wheelRadiusMM=100;
  const stepAxleForceN=step=>wheelN*Math.sqrt(2*wheelRadiusMM*step-step**2)/(wheelRadiusMM-step);
  const unbridgedWheelDropMM=wheelRadiusMM-Math.sqrt(wheelRadiusMM**2-(maximumGapMM/2)**2);
  const relativeLevelTrialMM=5,bridgeRunMM=120,transitionStepMM=2;
  const rampHorizontalN=wheelN*relativeLevelTrialMM/bridgeRunMM;
  const supportCases=[0,effectiveSpanMM/2,effectiveSpanMM].map(x=>({
    positionMM:x,dockN:wheelN*(1-x/effectiveSpanMM),carN:wheelN*x/effectiveSpanMM,
  }));
  const retainingForceN=stepAxleForceN(transitionStepMM)+rampHorizontalN;
  return {supportCases,retainingForceN,freeGapMM,relativeHorizontalSettingMM,maximumGapMM,retainedBearingEachMM,effectiveSpanMM,
    plateThicknessMM,effectiveStripWidthMM,minimumPlateLengthMM:Math.max(bridgeRunMM,maximumGapMM+2*retainedBearingEachMM),
    relativeLevelTrialMM,bridgeRunMM,transitionStepMM,stressMPa,deflectionMM,unbridgedWheelDropMM,
    unbridgedGapLipForceN:stepAxleForceN(unbridgedWheelDropMM),unbridged5MMStepForceN:stepAxleForceN(5),
    bridged2MMStepForceN:stepAxleForceN(transitionStepMM),rampHorizontalN,
    hold:'The 40 mm free gap is a sensitivity. It is not a measured manufacturer running gap. The bearing strip, bridge taper, independent anti-lift keepers and landing reactions remain physical design inputs.'};
}

function transferPermissions(state){
  const {direction,levelConfirmed,landingLock,gate,bridge,dockCapture,carCapture,cargoLocation}=state;
  const transferReady=levelConfirmed&&landingLock==='engaged'&&gate==='open'&&bridge==='seated-and-locked';
  const bothCaptures=dockCapture&&carCapture;
  const clearDestination=direction==='outbound'?
    cargoLocation==='car'&&carCapture:cargoLocation==='dock'&&dockCapture;
  return {
    releaseDockCapture:direction==='outbound'&&transferReady&&bothCaptures,
    releaseCarCapture:direction==='return'&&transferReady&&bothCaptures,
    retractBridge:levelConfirmed&&landingLock==='engaged'&&gate==='open'&&bridge==='seated-and-locked'&&clearDestination,
    travel:cargoLocation==='car'&&carCapture&&!dockCapture&&gate==='closed-and-locked'&&bridge==='stowed-and-locked'&&landingLock==='released',
  };
}

export function compareLiftSill(){
  const {dock,cargo,plateComparison}=threshold;
  const wheelN=plateComparison.oneWheelIncluding1p5_N;
  const clearY=[3450,5050],clearWidthMM=clearY[1]-clearY[0];
  const cabinDepthMM=1650,clearDoorHeightMM=2300;
  const minimumCabinWorkingDepthMM=cabinDepthMM-2*lodigePlanning.rollOffAllowancePerEndMM;
  const shaftDepthMM=cabinDepthMM+lodigePlanning.throughShaftDepthAllowanceMM;
  const shaftWidthMM=clearWidthMM+lodigePlanning.shaftWidthAllowanceMM;
  const shaftEastX=dock.plan[1]+shaftDepthMM;
  const operatorLaneY=3775;
  const gateSweepReachMM=clearWidthMM/2;
  const gateSweepWestX=dock.plan[1]-gateSweepReachMM;
  const gateSwingMarginMM=gateSweepWestX-Math.max(...cargo.map(row=>row.parkedNoseX));
  const lowerLevelLandingRunMM=gateSweepReachMM+25;
  const lowerLanding={clearY,clearWidthMM,levelRunMM:lowerLevelLandingRunMM};
  const lowerRampEastX=shaftEastX+lowerLevelLandingRunMM+lodigePlanning.stockRampRunMM;
  const travelByLowerLanding=[
    ['flush pit',dock.outerTransferRise],
    ['raised ramp',dock.outerTransferRise-lodigePlanning.lowerPitOrRampMM],
  ].map(([kind,travelMM])=>({kind,travelMM,
    frontOnlyShortfallMM:clearDoorHeightMM+lodigePlanning.frontOnlyExtraTravelMM-travelMM,
    throughReserveMM:travelMM-lodigePlanning.throughMinTravelMM,
  }));
  const approachGravityN=plateComparison.coarseMassKg*9.81*lodigePlanning.lowerPitOrRampMM/
    Math.hypot(lodigePlanning.stockRampRunMM,lodigePlanning.lowerPitOrRampMM);
  const axleEquivalentMassKG=wheelN/(9.81*lodigePlanning.edgeLoadFraction);
  const strip=compareSillStrip(wheelN);
  const state={direction:'outbound',levelConfirmed:true,landingLock:'engaged',gate:'open',bridge:'seated-and-locked',
    dockCapture:true,carCapture:true,cargoLocation:'spanning'};
  const challenges=[
    ['both captures confirmed outbound',{}],
    ['both captures confirmed return',{direction:'return'}],
    ['car capture absent',{carCapture:false}],
    ['dock capture absent',{dockCapture:false}],
    ['level lost',{levelConfirmed:false}],
    ['bridge keeper fails',{bridge:'unknown'}],
    ['landing restraint state unknown',{landingLock:'unknown'}],
    ['level lost after load clears',{cargoLocation:'car',levelConfirmed:false}],
    ['cargo clear, car capture verified',{cargoLocation:'car'}],
    ['cargo clear, dock capture verified on return',{cargoLocation:'dock',direction:'return'}],
    ['travel after bridge stowed and gate locked',{cargoLocation:'car',gate:'closed-and-locked',
      bridge:'stowed-and-locked',landingLock:'released',dockCapture:false}],
    ['unknown bridge state cannot imply stowed',{cargoLocation:'car',gate:'closed-and-locked',
      bridge:'unknown',landingLock:'released',dockCapture:false}],
    ['sending restraint still attached',{cargoLocation:'car',gate:'closed-and-locked',
      bridge:'stowed-and-locked',landingLock:'released'}],
    ['unknown landing restraint cannot imply released',{cargoLocation:'car',gate:'closed-and-locked',
      bridge:'stowed-and-locked',landingLock:'unknown',dockCapture:false}],
    ['unknown gate cannot imply locked',{cargoLocation:'car',gate:'unknown',
      bridge:'stowed-and-locked',landingLock:'released',dockCapture:false}],
  ].map(([name,change])=>({name,permissions:transferPermissions({...state,...change})}));
  assert(challenges.every(({permissions:p})=>(!p.travel||!p.releaseDockCapture)&&
    !(p.releaseDockCapture&&p.releaseCarCapture)));
  return {status:'DEVELOPMENT_NOT_ADOPTED',lodigePlanning,clearY,operatorLaneY,minimumCabinWorkingDepthMM,
    shaftWidthMM,shaftDepthMM,shaftEastX,gateSweepWestX,gateSwingMarginMM,lowerLanding,lowerRampEastX,
    travelByLowerLanding,
    approachGravityN,axleEquivalentMassKG,strip,challenges};
}

if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(compareLiftSill(),null,2));
