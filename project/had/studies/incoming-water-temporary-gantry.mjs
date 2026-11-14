import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {compareLiftSill} from './incoming-water-lift-sill.mjs';

const source=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const threshold=source('../../mat/studies/plant-threshold.json');
const roofSite=source('../../rwt/studies/over-roof-site-envelope.json');
const receiving=source('../../rwt/studies/selected-receiving-interface.json');

const gantry={
  manual:'https://uk.reidlifting.com/s/PORTA-GANTRY-500-3000-OM-EN-Global-V8-Lo-Res.pdf',
  frame:'PGAS01000TC1',frameMassKG:102,frameWidthMM:2733,eyeMaxMM:5829,beamTopMaxMM:6149,
  beamLengthMM:4570,operatingSpanMM:3650,beamMassKG:34,fullRatingDeflectionUpperMM:30,
  goodsWLLKG:1000,manualTraverseLimitKG:500,
};
const hoist={
  catalogue:'https://www.cmco.com/globalassets/catalogs--documents/emea/en/chapters-no5/02_cmco_no5_2024_04_wup_en-hoisting-equipment.pdf',
  article:'N04200124',wllKG:500,minHeadMM:350,standardLiftMM:3000,standardMassKG:9,
};

export function compareTemporaryGantry(){
  const {dock,opening,cargo,plateComparison,carrierHeight}=threshold;
  const comparisonLift=compareLiftSill();
  const [,dockEnd,south,north]=dock.plan;
  const padSideMM=250,padRadiusMM=padSideMM/2;
  const liftX=15750,lowerY=2800;
  const gantryFrameY=[1950,5600];
  const beamOperatingY=[1725,1725+gantry.operatingSpanMM];
  const beamOverhangMM=(gantry.beamLengthMM-gantry.operatingSpanMM)/2;
  const grossBeamY=[beamOperatingY[0]-beamOverhangMM,beamOperatingY[1]+beamOverhangMM];
  const grossFrameX=[liftX-gantry.frameWidthMM/2,liftX+gantry.frameWidthMM/2];
  const conservativelyPaddedFrameX=[grossFrameX[0]-padRadiusMM,grossFrameX[1]+padRadiusMM];
  const frameAndPadSetbackMM=conservativelyPaddedFrameX[0]-dockEnd;
  const directDockCase={
    maximumLiftXForFullCargoAndSettingMM:dockEnd-625-50,
    frameAndPadWestXAtThatLiftMM:dockEnd-625-50-gantry.frameWidthMM/2-padRadiusMM,
  };
  const extensionEndX=liftX+Math.max(...cargo.map(row=>row.parkedNoseX-row.requiredCentreX))+50;
  const extensionPlan=[dockEnd,extensionEndX,south,north];
  const gradeRestHalves=[Math.max(...cargo.map(row=>row.parkedNoseX-row.requiredCentreX)),
    Math.max(...cargo.map(({fullY})=>(fullY[1]-fullY[0])/2))];
  const approachSettingMM=50;
  const coveredCargoSweep=cargo.map(({item,centreY,fullY,parkedNoseX,requiredCentreX})=>{
    const halfX=parkedNoseX-requiredCentreX;
    const halfY=(fullY[1]-fullY[0])/2;
    const clearLowerDockEdgeMM=south-(lowerY+halfY+approachSettingMM);
    const clearLowerFrameAxisMM=lowerY-halfY-approachSettingMM-gantryFrameY[0];
    const clearUpperFrameAxisMM=gantryFrameY[1]-centreY-halfY-approachSettingMM;
    return {item,centreY,halfX,halfY,clearLowerDockEdgeMM,clearLowerFrameAxisMM,clearUpperFrameAxisMM,
      protectedSweep:[liftX-halfX-approachSettingMM,liftX+halfX+approachSettingMM,
        lowerY-halfY-approachSettingMM,centreY+halfY+approachSettingMM]};
  });
  const gradeRest=[liftX-gradeRestHalves[0]-approachSettingMM,liftX+gradeRestHalves[0]+approachSettingMM,
    lowerY-gradeRestHalves[1]-approachSettingMM,lowerY+gradeRestHalves[1]+approachSettingMM];
  const gradeRetreat=[17250,17900,2225,3375];
  const grossBeamAndPadToWetMM=receiving.east.receiverBounds[1]-(grossBeamY[1]+padRadiusMM);
  const eave=roofSite.primitives.find(row=>row.id==='east-eave-gutter');
  const eastReceiverSouthY=receiving.east.receiverBounds[1];
  const eastSpillSouthY=receiving.east.blockedOutletSpill.requiredContinuation[1];
  const knownWetTerritorySouthY=Math.min(eastReceiverSouthY,eastSpillSouthY);
  const padOuterSouthY=gantryFrameY[0]-padRadiusMM;
  const padOuterNorthY=gantryFrameY[1]+padRadiusMM;
  const obstructingSitePrimitives=roofSite.primitives.filter(({x,y})=>
    x[1]>conservativelyPaddedFrameX[0]&&x[0]<conservativelyPaddedFrameX[1]&&y[1]>padOuterSouthY&&y[0]<padOuterNorthY).map(row=>row.id);
  assert.deepEqual(obstructingSitePrimitives,[]);


  const solidGuardHeightMM=1100;
  const requiredOverGuardMarginMM=50;
  const aboveCarrierRigMM=350;
  const settingMM=50;
  const maximumGrossCarrierHeightMM=gantry.eyeMaxMM-(dock.outerTransferRise+solidGuardHeightMM+requiredOverGuardMarginMM+
    aboveCarrierRigMM+hoist.minHeadMM+gantry.fullRatingDeflectionUpperMM+settingMM);
  const heightCases=[['full door envelope',opening.height],['W9 and cart bound',carrierHeight.W9OnCart],
    ['historical cylinder bare comparison',carrierHeight.cylinderBody]].map(([item,heightMM])=>({item,heightMM,
      requiredEyeAboveOutsideGradeMM:gantry.eyeMaxMM-maximumGrossCarrierHeightMM+heightMM,
      maximumEyeReserveMM:maximumGrossCarrierHeightMM-heightMM,
    }));
  const minimumVerticalHookTravelMM=dock.outerTransferRise+solidGuardHeightMM+requiredOverGuardMarginMM;
  const standardHookTravelReserveMM=hoist.standardLiftMM-minimumVerticalHookTravelMM;
  const conservativeCarryKG=350,studyAmplification=1.25,upperWheelAmplification=1.5;
  const factoredHookEquivalentKG=conservativeCarryKG*studyAmplification;
  const overheadHardwareKG=25;
  assert(overheadHardwareKG>hoist.standardMassKG);
  const [southAxis,northAxis]=gantryFrameY;
  const farthestPickupY=Math.max(...cargo.map(row=>row.centreY));
  const loadedShare=(farthestPickupY-southAxis)/(northAxis-southAxis);
  const northFrameGravityN=(gantry.frameMassKG+gantry.beamMassKG/2+
    loadedShare*(factoredHookEquivalentKG+overheadHardwareKG))*9.81;
  const upperWheelN=conservativeCarryKG*upperWheelAmplification*9.81;
  const supportXs=[14400,16250],supportYs=[3650,5100];
  const xCases=[dockEnd,extensionEndX];
  const wheelPathY=[Math.min(...cargo.map(row=>row.fullY[0])),Math.max(...cargo.map(row=>row.fullY[1]))];
  const operatorLoadN=100*9.81,operatorY=3775;
  const reactions=(x,y,n)=>{
    const rx=(x-supportXs[0])/(supportXs[1]-supportXs[0]);
    const ry=(y-supportYs[0])/(supportYs[1]-supportYs[0]);
    return [1-rx,rx].flatMap(a=>[1-ry,ry].map(b=>n*a*b));
  };
  const wheelCases=xCases.flatMap(x=>wheelPathY.map(y=>reactions(x,y,upperWheelN)));
  const operatorCases=xCases.map(x=>reactions(x,operatorY,operatorLoadN));
  const wheelAndCrew=wheelCases.flatMap(w=>operatorCases.map(c=>w.map((n,i)=>n+c[i]))).flat();
  const wheelReactions=wheelCases.flat();
  const eastWallX=12000;
  const fieldFromWallMM={
    temporaryThroughGradeRetreat:gradeRetreat[1]-eastWallX,
    throughCarToRampToe:comparisonLift.lowerRampEastX-eastWallX,
    sameLevelToEndOfExistingDock:dockEnd-eastWallX,
  };
  const gradeRaisedToDeckMM=dock.outerTransferRise;
  return {status:'DEVELOPMENT_NOT_ADOPTED',gantry,hoist,directDockCase,extensionPlan,liftX,gantryFrameY,beamOperatingY,grossBeamY,lowerY,
    coveredCargoSweep,gradeRest,gradeRetreat,conservativelyPaddedFrameX,frameAndPadSetbackMM,fieldFromWallMM,gradeRaisedToDeckMM,
    envelope:{knownWetTerritorySouthY,padOuterSouthY,padOuterNorthY,framePadToWetMM:knownWetTerritorySouthY-padOuterNorthY,grossBeamAndPadToWetMM,
      extensionToWetMM:knownWetTerritorySouthY-extensionPlan[3],framePadToEaveMM:conservativelyPaddedFrameX[0]-eave.x[1],
      northPadToExtensionMM:gantryFrameY[1]-padRadiusMM-north,highestAssemblyZ:dock.outsideGrade+gantry.beamTopMaxMM,
      obstructingSitePrimitives},
    vertical:{solidGuardHeightMM,requiredOverGuardMarginMM,aboveCarrierRigMM,settingMM,maximumGrossCarrierHeightMM,heightCases,
      minimumVerticalHookTravelMM,standardHookTravelReserveMM},
    loading:{conservativeCarryKG,studyAmplification,factoredHookEquivalentKG,overheadHardwareKG,
      candidateScopeReserveKG:conservativeCarryKG-plateComparison.coarseMassKg,
      northFrameGravityN,singleFramePadPressureKPa:northFrameGravityN/(padSideMM/1000)**2/1000,
      upperWheelN,sourceUpperWheelN:plateComparison.oneWheelIncluding1p5_N,supportXs,supportYs,
      wheelOnlySupportMaxN:Math.max(...wheelReactions),wheelOnlySupportMinN:Math.min(...wheelReactions),
      wheelAndCrewSupportMaxN:Math.max(...wheelAndCrew),wheelAndCrewSupportMinN:Math.min(...wheelAndCrew)},
  };
}

if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(compareTemporaryGantry(),null,2));
