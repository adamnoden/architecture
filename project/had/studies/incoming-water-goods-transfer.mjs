import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {compareLiftSill} from './incoming-water-lift-sill.mjs';

const mat=JSON.parse(readFileSync(new URL('../../mat/studies/plant-threshold.json',import.meta.url),'utf8'));
const edmolift={
  article:611320,deckMM:[1500,1000],closedMM:360,strokeMM:1800,distributedRatedMassKG:2000,
  modelURL:'https://www.edmolift.com/en/lift-tables-and-lifting-solutions/lift-tables-vertical-double-o-triple-scissors/tbd-2000',
  drawingURL:'https://www.edmolift.com/custom/images/products/TBD_2000/TBD_2000_2022-05-27_1054.pdf',
  generalLoadsURL:'https://www.edmolift.com/custom/files/17BF7264A0AFFA9A54F843794D3B5B94.pdf',
};
const tug={
  model:'Tractel TU8',nativeWLLKG:800,ropeDiameterMM:8.3,extendedLeverMM:620,
  manualURL:'https://www.tractel.com/PIM/Manuals/LH/Manual%20LH/Group%201/150425.ind-03.03-23.pdf',
};
const poweredDraw={
  model:'Tractel Minifor TR30',nativeWLLKG:300,lineSpeedMPerMinute:5,pendantLengthMM:2500,
  applicationsURL:'https://www.tractel.com/PIM/TBN_products/Price-list-pdf/Prijslijst_TBN_ENG_jul_2021.pdf',
  technicalURL:'https://www.tractel.com/PIM/Technical%20Data%20Sheets/LH/minifor/TR/TR10-30-Radio%20-%20Reeler/FT_T3730_TR10TR30_ENROULEUR_ENFR_IND00.pdf',
};
const rigidChain={
  manufacturer:'Tsubaki',manualURL:'https://tt-net.tsubakimoto.co.jp/lib/manual/M_ZCA_EN/book/data/all_page.pdf',
  dryIndoorOnly:true,catalogueURL:'https://tt-net.tsubakimoto.co.jp/lib/catalog/C_SAD_ZCA_EN/book/data/all_page.pdf',
  models:[
    {model:'ZCA45N150',strokeMM:1500,openThrustN:2000,bellowsThrustN:2000},
    {model:'ZCA45N200',strokeMM:2000,openThrustN:1200,bellowsThrustN:900},
  ],
};
const compactAttended={
  platformMM:[1980,1000],opposedDoorMM:900,
  modelURL:'https://www.aritco.com/wp-content/uploads/2026/02/Datasheet-Aritco-PublicLift-Access-English.pdf',
  drawingURL:'https://www.aritco.com/wp-content/uploads/2023/12/1000x1980-AC.pdf',
  outdoorReferenceMM:[1480,1100],
  outdoorURL:'https://gartec.com/wp-content/uploads/2025/12/Artico-PublicLift-Access-Brochure-2025.pdf',
};
const r600=300,settingMM=25;

export function compareGoodsTransfer(){
  const {dock,cargo,plateComparison}=mat;
  const {strip}=compareLiftSill();
  const [depth,width]=edmolift.deckMM;
  const upperEntryX=dock.plan[1],farDeckX=upperEntryX+depth,deckCentreX=(upperEntryX+farDeckX)/2;
  const requiredY=[Math.min(...cargo.map(row=>row.fullY[0]))-settingMM,Math.max(...cargo.map(row=>row.fullY[1]))+settingMM];
  const deckCentreY=(requiredY[0]+requiredY[1])/2;
  const maximumSymmetricGuardIntrusionMM=(width-requiredY[1]+requiredY[0])/2;
  const guardSweeps=[30,37.5,40].map(guardMM=>({guardMM,clearWidthMM:width-2*guardMM,
    totalLateralReserveMM:width-2*guardMM-(requiredY[1]-requiredY[0])}));
  const occupied=cargo.map(({item,fullY,centreY,parkedNoseX,requiredCentreX})=>{
    const halfLength=parkedNoseX-requiredCentreX,lengthMM=2*halfLength,widthMM=fullY[1]-fullY[0];
    const deckParkX=[deckCentreX-halfLength,deckCentreX+halfLength];
    const [attendedLength,attendedWidth]=compactAttended.platformMM;
    return {item,centreY,lengthMM,widthMM,deckParkX,
      endReserveMM:deckParkX[0]-upperEntryX,
      addedTravelToParkMM:deckCentreX-requiredCentreX,
      compactSideBySideReserveMM:attendedWidth-widthMM-2*r600-2*settingMM,
      compactTandemReserveMM:attendedLength-lengthMM-2*r600-3*settingMM,
      outdoorTandemReserveMM:compactAttended.outdoorReferenceMM[0]-lengthMM-2*r600-3*settingMM,
      compactDoorReserveMM:compactAttended.opposedDoorMM-widthMM-2*settingMM,
    };
  });
  const lowerLandingMM=2*r600+2*settingMM;
  const gradeCases=[0,180,360].map(pitMM=>{
    const lowerDeckAboveGradeMM=edmolift.closedMM-pitMM;
    const strokeMM=dock.outerTransferRise-lowerDeckAboveGradeMM;
    const rampRunMM=20*lowerDeckAboveGradeMM;
    const rampGravityN=lowerDeckAboveGradeMM?
      plateComparison.coarseMassKg*9.81*lowerDeckAboveGradeMM/Math.hypot(rampRunMM,lowerDeckAboveGradeMM):0;
    return {pitMM,lowerDeckAboveGradeMM,strokeMM,strokeReserveMM:edmolift.strokeMM-strokeMM,
      rampRunMM,rampGravityN,minimumRampEndX:farDeckX+lowerLandingMM+rampRunMM};
  });
  const gravityDriveN=plateComparison.coarseMassKg*9.81/Math.hypot(80,1);
  const drawForceN=strip.retainingForceN+gravityDriveN;
  const lowerRampRecoveryForceN=Math.max(...gradeCases.map(row=>row.rampGravityN))+strip.retainingForceN;
  const tugAnchorN=tug.nativeWLLKG*9.81;
  const longLineOffsetMM=deckCentreY-cargo[0].centreY;
  const alignedLineY=cargo.map(({item,centreY})=>({item,lineY:centreY,offsetFromSingleCentreMM:centreY-deckCentreY}));
  const sharedLineYawNm=drawForceN*longLineOffsetMM/1000;
  const dockUpperCrewY=dock.plan[2]+50+r600+settingMM;
  const upperCrewFixedX=upperEntryX-750;
  const lowerCrewFixedX=farDeckX+lowerLandingMM/2;
  const nearGateToStationMM=upperEntryX-upperCrewFixedX;
  const crossReachToLineMM=deckCentreY-dockUpperCrewY;
  const trialHandleReserveMM=tug.extendedLeverMM-crossReachToLineMM;
  const lineSlotsAtY=[...new Set(cargo.map(({centreY})=>centreY))];
  const compactDoorFit=cargo.map(({item,fullY})=>{
    const doorHalf=compactAttended.opposedDoorMM/2;
    const admissibleCentreY=[fullY[1]+settingMM-doorHalf,fullY[0]-settingMM+doorHalf];
    return {item,admissibleCentreY};
  });
  const commonCompactDoorCentres=[
    Math.max(...compactDoorFit.map(({admissibleCentreY})=>admissibleCentreY[0])),
    Math.min(...compactDoorFit.map(({admissibleCentreY})=>admissibleCentreY[1])),
  ];
  const poweredAnchorN=poweredDraw.nativeWLLKG*9.81;
  const upperDriveX=upperEntryX-350,lowerDriveX=farDeckX+1000;
  const upperLeadMM=Math.hypot(upperCrewFixedX-upperDriveX,crossReachToLineMM);
  const lowerLeadMM=Math.hypot(lowerCrewFixedX-lowerDriveX,crossReachToLineMM);
  const straightLeadMaximumMM=Math.max(upperLeadMM,lowerLeadMM);
  const crewReference={nearGateToStationMM,trialHandleReserveMM,crossReachToLineMM,upperLeadMM,lowerLeadMM,
    remainingStraightPendantMM:poweredDraw.pendantLengthMM-straightLeadMaximumMM,
    upperDriveReference:[upperDriveX,deckCentreY],lowerDriveReference:[lowerDriveX,deckCentreY],upper:[upperCrewFixedX,dockUpperCrewY],lower:[lowerCrewFixedX,dockUpperCrewY],
    nearestUpperCargoGapMM:Math.min(...cargo.map(row=>row.fullY[0]))-dockUpperCrewY-r600,
    compactControlEvidence:'Only fixed stance plans. Prove reach, clear handle stroke or remote control, independent anchors, run-away retention and crew return routes.'};
  const lineClearanceMM=Math.min(...occupied.map(row=>row.endReserveMM))-settingMM;
  const carEndHardwareMM=80;
  const farSheaveX=farDeckX-carEndHardwareMM;
  const foreEyeX=Math.max(...occupied.map(row=>row.deckParkX[1]));
  const lineAndConnectorBudgetMM=farSheaveX-foreEyeX-settingMM;
  const leadSeparationMM=700, eyeHeightMM=150, parkedGateHeightMM=1100;
  const outsideSheaveX=farDeckX+leadSeparationMM;
  const minLineHeightAtGateMM=eyeHeightMM+(parkedGateHeightMM+settingMM-eyeHeightMM);
  const minimumOutsideRedirectHeightMM=eyeHeightMM+(minLineHeightAtGateMM-eyeHeightMM)*
    (outsideSheaveX-foreEyeX)/(farDeckX-foreEyeX);
  const aboveGateVerticalToHorizontalRatio=(minimumOutsideRedirectHeightMM-eyeHeightMM)/(outsideSheaveX-foreEyeX);
  const aboveGateLineN=drawForceN*Math.hypot(1,aboveGateVerticalToHorizontalRatio);
  const aboveGateLiftN=drawForceN*aboveGateVerticalToHorizontalRatio;
  const outboundRedirect={carEndHardwareMM,foreEyeX,farSheaveX,lineAndConnectorBudgetMM,eyeHeightMM,
    parkedGateHeightMM,outsideSheaveX,minimumOutsideRedirectHeightMM,aboveGateLiftN,aboveGateLineN};
  const movingStates=[
    {name:'parked approach',direction:'enter',sourceCapture:true,carCapture:false,drawEngaged:true,bridge:'seated-and-locked',landed:true,gate:'open',cargo:'landing'},
    {name:'locked overlap',direction:'enter',sourceCapture:true,carCapture:true,drawEngaged:true,bridge:'seated-and-locked',landed:true,gate:'open',cargo:'overlap'},
    {name:'parked and captured',direction:'enter',sourceCapture:false,carCapture:true,drawEngaged:true,bridge:'seated-and-locked',landed:true,gate:'open',cargo:'car'},
    {name:'mobile',direction:'enter',sourceCapture:false,carCapture:true,drawEngaged:false,bridge:'stowed-and-locked',landed:false,gate:'closed-and-locked',cargo:'car'},
    {name:'lower receiving overlap',direction:'exit',sourceCapture:true,carCapture:true,drawEngaged:true,bridge:'seated-and-locked',landed:true,gate:'open',cargo:'overlap'},
    {name:'failed lower catch',direction:'exit',sourceCapture:false,carCapture:true,drawEngaged:true,bridge:'seated-and-locked',landed:true,gate:'open',cargo:'overlap'},
    {name:'lost in-car capture',direction:'enter',sourceCapture:false,carCapture:false,drawEngaged:true,bridge:'seated-and-locked',landed:true,gate:'open',cargo:'car'},
    {name:'line crosses a closed gate',direction:'enter',sourceCapture:false,carCapture:true,drawEngaged:true,bridge:'stowed-and-locked',landed:false,gate:'closed-and-locked',cargo:'car'},
  ].map(row=>{
    const overlap=row.landed&&row.gate==='open'&&row.bridge==='seated-and-locked'&&row.drawEngaged&&row.sourceCapture&&row.carCapture;
    return {...row,canReleaseLanding:row.direction==='enter'&&overlap,canReleaseCar:row.direction==='exit'&&overlap,
      canDisconnectDraw:row.landed&&row.cargo==='car'&&row.carCapture&&!row.sourceCapture,
      canMoveCar:!row.landed&&row.gate==='closed-and-locked'&&row.bridge==='stowed-and-locked'&&
        row.cargo==='car'&&row.carCapture&&!row.drawEngaged&&!row.sourceCapture};
  });
  const parkedSetbackMM=100;
  const minimumExtensionMM=parkedSetbackMM+settingMM;
  const maxRearEyeParkX=Math.max(...occupied.map(row=>row.deckParkX[0]));
  const maxRearEyeAcrossUpperSillMM=maxRearEyeParkX-upperEntryX;
  const necessaryUpperStrokeMM=maxRearEyeAcrossUpperSillMM+minimumExtensionMM;
  const anticipatedDockCentreStartX=upperEntryX-Math.max(...occupied.map(row=>row.lengthMM))/2-settingMM;
  const minimumStartRearEyeX=anticipatedDockCentreStartX-Math.max(...occupied.map(row=>row.lengthMM))/2;
  const normalDockDriveX=minimumStartRearEyeX-parkedSetbackMM;
  const fullUpperStrokeMM=maxRearEyeParkX-normalDockDriveX+settingMM;
  const reversiblePushPull=rigidChain.models.map(model=>({...model,
    fullUpperStrokeReserveMM:model.strokeMM-fullUpperStrokeMM,
    openUpperForceReserveN:model.openThrustN-drawForceN,
    bellowsUpperForceReserveN:model.bellowsThrustN-drawForceN,
    bellowsLowerForceReserveN:model.bellowsThrustN-lowerRampRecoveryForceN,
  }));
  const upperPusher={parkedSetbackMM,maxRearEyeAcrossUpperSillMM,necessaryUpperStrokeMM,normalDockDriveX,
    fullUpperStrokeMM,reversiblePushPull,
    hold:'The native chain requires a dry non-condensing indoor environment and a linear guide in its direction of motion. The fixed guide and driven head must clear the transfer bridge and park clear of the lift while preserving a separately supported positive capture. The proposed dimensions do not qualify a combined guarded system.'};
  const loadDuty={lineSlotsAtY,lineClearanceMM,lowerRampRecoveryForceN,wheelN:plateComparison.oneWheelIncluding1p5_N,
    wheelToDistributedRatingFraction:plateComparison.oneWheelIncluding1p5_N/(edmolift.distributedRatedMassKG*9.81),
    poweredAnchorN,poweredFullReversalAnchorN:2*poweredAnchorN,
    idealGravityDriveN:gravityDriveN,drawForceN,tugAnchorN,maximumReversalAnchorN:2*tugAnchorN,sharedLineYawNm,alignedLineY};
  assert(gradeCases.every(row=>row.strokeMM+row.lowerDeckAboveGradeMM===dock.outerTransferRise));
  return {status:'DEVELOPMENT_NOT_ADOPTED',edmolift,tug,poweredDraw,rigidChain,compactAttended,requiredY,deckCentreY,occupied,compactDoorFit,commonCompactDoorCentres,guardSweeps,
    maximumSymmetricGuardIntrusionMM,upperEntryX,farDeckX,lowerLandingMM,gradeCases,crewReference,loadDuty,outboundRedirect,upperPusher,movingStates,
    hold:'Candidate unoccupied moving platform. Landed positive draw and return require a fixed handler at each landing, opposed retained capture or independently qualified fail-capture, aligned load eyes, and positively confirmed loaded car capture before any line disconnects. Actual gates, distinct upper drive interface, lower ramp/landing, carrier geometry, wheel/edge load, wind, passive drainage and ground remain open.'};
}

if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(compareGoodsTransfer(),null,2));
