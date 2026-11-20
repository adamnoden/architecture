import { segmentDistance } from './service-interface-geometry.mjs';

export const southInletWindowId = 'GROUND/south-window-4';
export const southInletSillInsertInputPaths = {
  sill:'project/had/studies/south-inlet-under-sill.json',
  cells:'project/had/studies/south-inlet-wet-box.json',
  rewind:'project/str/studies/house-corner-rewind.json',
  portal:'project/str/studies/floor-portal-interface-review.json',
  grid:'project/str/studies/current-house-grid.json',
  foundations:'project/str/studies/current-house-joined-foundation.json',
};

export function readSouthInletSillInsertInputs(read) {
  const {sill,cells,rewind,portal,grid,foundations} = Object.fromEntries(
    Object.entries(southInletSillInsertInputPaths).map(([key,path])=>[key,read(path)]));
  const window = rewind.changes.find(row => `${row.level}/${row.id}`===southInletWindowId);
  if (!window) throw new Error(`Missing structural source occurrence ${southInletWindowId}`);
  return {sill,cells,window,portal,grid,foundations};
}

export function sourceSouthInletSillInsertCase({sill}) {
  return {eastEdgeMm:10380,headZMm:700,plantPressureAxisXMm:sill.branches[1].bores[0].outer[0],plantVentOuterZMm:660};
}

export function deriveSouthInletSillInsert({sill,cells,window,portal,grid,foundations},trial) {
  const jambs = portal.geometry.occurrences.filter(row => row.face===window.side && row.opening===window.id)
    .map(row=>row.jambPmm).sort((a,b)=>a[0]-b[0]);
  const girder = grid.girders['outer-S'];
  const [west,east] = girder.heads.filter(({id})=>id==='P23'||id==='P05');
  const round = value=>Number(value.toFixed(4));
  const jambAndSill = {clearX:window.clear, rawSillZ:window.sill, jambs};
  const opening = { x:[9950,trial.eastEdgeMm], z:[110,trial.headZMm] };
  const reference = sourceSouthInletSillInsertCase({sill});
  const fullSpanComparison = { x:[9450,reference.eastEdgeMm], z:[110,reference.headZMm] };
  const apertureArea = ({x,z})=>(x[1]-x[0])*(z[1]-z[0])/1e6;
  const frame = {x:window.clear,z:[80,window.sill], innerHeaderZ:[opening.z[1],window.sill],
    westSillSupportX:[window.clear[0],fullSpanComparison.x[0]],
    retainedWestInfillX:[fullSpanComparison.x[0],opening.x[0]], eastSideX:[opening.x[1],window.clear[1]],
    bearingAxesX:[(window.clear[0]+fullSpanComparison.x[0])/2,(trial.eastEdgeMm+window.clear[1])/2]};

  function flatEnvelope(axis,radius,setting, aperture=opening) {
    const [outer,inner]=axis;
    return {
      westMM:round(outer[0]-radius-aperture.x[0]-setting),
      eastMM:round(aperture.x[1]-outer[0]-radius-setting),
      baseMM:round(Math.min(outer[2],inner[2])-radius-aperture.z[0]-setting),
      headerMM:round(aperture.z[1]-Math.max(outer[2],inner[2])-radius-setting),
    };
  }
  const bores = sill.branches.flatMap(branch => branch.bores.map((bore,i)=>{
    const id = branch.id+(i===0?'-pressure':'-relief');
    const axis = id==='plant-pressure'
      ? [bore.outer,bore.inner].map(([,y,z])=>[trial.plantPressureAxisXMm,y,z])
      : [bore.outer,bore.inner];
    return { id, axis, formedReserveODMM:bore.radius*2, apertureAfter10:flatEnvelope(axis,bore.radius,10) };
  }));
  const outsideY = bores[0].axis[0][1];
  const insideY = bores[0].axis[1][1];
  function vent(x,z,od,cell,aperture=opening,adjacentBores=bores){
    const axis=[[x,outsideY,z],[x,insideY,z+(insideY-outsideY)/50]];
    const cellX=cell.case.sideLimitsX;
    return { axis, outerDiameterMM:od, clearMM:26, apertureAfter5:flatEnvelope(axis,od/2,5,aperture),
      mainBoreReserveAfter5MM:round(Math.min(...adjacentBores.map(bore =>
        segmentDistance(...axis,...bore.axis)-(od+bore.formedReserveODMM)/2-5))),
      highEndCapToCellSideGrossMM:Math.min(x-cellX[0],cellX[1]-x)-od/2,
      belowSeparateWeatherHousingCapGrossMM:sill.receivers.maximumFixedWeatherHousingZ-z-od/2,
      freeCoreAboveWetStageGrossMM:round(z-26/2-cell.case.designWetStageZ),
    };
  }
  const vents = [vent(10115,635,32,cells.branches[0]),vent(10348,trial.plantVentOuterZMm,30,cells.branches[1])];
  const weatherHoodX = [[10090,10140],[10320,10370]];
  const handlingAndVentHoodReservations = {
    utilityCellWestFaceToNarrowCutMM:cells.branches[0].case.sideLimitsX[0]-opening.x[0],
    utilityCarrierWestAfter5ToNarrowCutMM:cells.branches[0].access.releasedSpoolOutline.x[0]-opening.x[0]-5,
    utilityReceiverWestToNarrowCutMM:cells.branches[0].case.exteriorReceiver.x[0]-opening.x[0],
    exteriorHoodReservableX:weatherHoodX,
    exteriorHoodSeparationAfter10MM:weatherHoodX[1][0]-weatherHoodX[0][1]-10,
    wholeToolAndVentHoodsQualified:false,
  };
  const sourcePlantBore = sill.branches[1].bores[0];
  const sourcePlantAxis = [sourcePlantBore.outer,sourcePlantBore.inner];
  const oldHighVent = vent(10345,688,32,cells.branches[1],
    {x:[9950,reference.eastEdgeMm],z:[110,reference.headZMm]},
    bores.map(bore=>bore.id==='plant-pressure' ? {...bore,axis:sourcePlantAxis} : bore));
  const oldEastRail = flatEnvelope(sourcePlantAxis,sourcePlantBore.radius,10,{x:[9950,10375],z:[110,700]});
  const oldWideEastRail = flatEnvelope(sourcePlantAxis,sourcePlantBore.radius,10,{x:[9950,10370],z:[110,700]});
  const oldHighSoffitComparison = {headZ:600, plantTopMM:flatEnvelope(sourcePlantAxis,
    sourcePlantBore.radius,10,{x:[9950,10380],z:[110,600]}).headerMM};

  const width=100,depth=window.sill-trial.headZMm,wall=5,span=window.clear[1]-window.clear[0],elastic=200000;
  const verticalInertia=(width*depth**3-(width-2*wall)*(depth-2*wall)**3)/12;
  const horizontalInertia=(depth*width**3-(depth-2*wall)*(width-2*wall)**3)/12;
  const seatPointN=3000, windPa=2250, windPointN=window.area*windPa;
  const pointDeflection = (force,inertia) => force*span**3/(48*elastic*inertia);
  const pointStress = (force,inertia,d) => force*span/4/(inertia/(d/2));
  const axialSeatN=seatPointN/2;
  const toEastKN=frame.bearingAxesX.reduce((sum,x)=>sum+axialSeatN*(x-west.u)/(east.u-west.u)/1000,0);
  const rightStile = {alongWallWidthMM:16, wallNormalDepthMM:100, idealWallMM:3};
  const {alongWallWidthMM:stileWidth,wallNormalDepthMM:stileDepth,idealWallMM:stileWall}=rightStile;
  const stileHeight=opening.z[1]-frame.z[0];
  const stileArea=stileWidth*stileDepth-(stileWidth-2*stileWall)*(stileDepth-2*stileWall);
  const stileNormalI=(stileWidth*stileDepth**3-(stileWidth-2*stileWall)*(stileDepth-2*stileWall)**3)/12;
  const stileWeakI=(stileDepth*stileWidth**3-(stileDepth-2*stileWall)*(stileWidth-2*stileWall)**3)/12;
  const topNormalN=windPointN/2;
  const stileMomentNmm=topNormalN*stileHeight;
  const trialBaseMomentLeverMM=60;
  const eastStile={ ...rightStile, heightMM:stileHeight, afterTwo2MMSettingsFrameWidthReserveMM:frame.eastSideX[1]-frame.eastSideX[0]-stileWidth-4,
    screen:'Ideal sharp-corner normal cantilever under the same point actions; stock, local buckling, plate and connections unqualified.',
    combinedAxialAndNormalStressMPa:round(axialSeatN/stileArea+stileMomentNmm/(stileNormalI/(stileDepth/2))),
    normalTopDisplacementMM:round(topNormalN*stileHeight**3/(3*elastic*stileNormalI)),
    elasticWeakAxisEulerPointKN:round(Math.PI**2*elastic*stileWeakI/(2*stileHeight)**2/1000),
    baseMomentKNm:round(stileMomentNmm/1e6), trialBaseMomentLeverMM,
    idealBaseCoupleKN:round(stileMomentNmm/trialBaseMomentLeverMM/1000),
    admitted:false,
  };
  const loads = {screenOnly:true,
    benchmark:'Apply the total authored vertical allowance and all window pressure as separate coincident centred points on one simple sill member.',
    grossWindowAreaM2:window.area, authoredVerticalPointKN:seatPointN/1000,
    windowWindPa:windPa, windowNormalPointKN:round(windPointN/1000), clearSpanMM:span,
    idealSillRhsMM:[width,depth,wall], steelElasticMPa:elastic,
    secondMomentsMM4:[round(verticalInertia),round(horizontalInertia)],
    combinedElasticCornerStressMPa:round(pointStress(seatPointN,verticalInertia,depth)+
      pointStress(windPointN,horizontalInertia,width)),
    correspondingVerticalAndHorizontalDeflectionsMM:[round(pointDeflection(seatPointN,verticalInertia)),round(pointDeflection(windPointN,horizontalInertia))],
    eachSupportVerticalAndNormalKN:[axialSeatN/1000,round(windPointN/2000)], eastStile,
    outerSUncut:{y:[girder.datum-girder.width/2,girder.datum+girder.width/2],z:girder.z,
      loadBalanceSpan:[west,east].map(head=>({id:head.id,x:head.u,
        historicalMaxGravityKN:foundations.heads.find(other=>other.id===head.id).named_N_Cx_Cy['max factored gravity'][0]})),
      addedSimpleBalanceVerticalKN:[round(seatPointN/1000-toEastKN),round(toEastKN)]},
    anchorJambStilePlinthAndMasonryQualified:false,
  };

  const sixRoundHoleAreaM2=(bores.reduce((area,bore)=>area+Math.PI*(bore.formedReserveODMM/2)**2,0)+2*Math.PI*16**2)/1e6;
  const referencePlantPressureX = reference.plantPressureAxisXMm;
  const plantWetCell = cells.branches[1].case;
  const [cellWest,cellEast] = plantWetCell.sideLimitsX;
  const sourceSideDistance = Math.min(referencePlantPressureX-cellWest,cellEast-referencePlantPressureX);
  const trialSideDistance = Math.min(trial.plantPressureAxisXMm-cellWest,cellEast-trial.plantPressureAxisXMm);
  const plantWetCellPackingAfterSettingMm = plantWetCell.continuousMouthSideFitAfterLinerAndSettingMM
    + trialSideDistance - sourceSideDistance;

  return {
    jambAndSill,opening,frame,bores,vents,loads,handlingAndVentHoodReservations,plantWetCellPackingAfterSettingMm,
    combinedWallOpeningCount:1,
    projectedOpenedAreaM2:{narrowInsert:round(apertureArea(opening)), fullSpanInsert:round(apertureArea(fullSpanComparison)), sixMasonryHoles:round(sixRoundHoleAreaM2)},
    retainedInsideCellBoundaries:cells.branches.map(row=>({id:row.id,wetBoxX:row.case.sideLimitsX,
      retainedTroughLipZ:row.case.permanentLowerTroughLipZ,receiverX:row.case.exteriorReceiver.x})),
    rejected:{unchangedPlantVentWithNewHeader:oldHighVent, earlierEastStile:oldEastRail,
      widerEastStile:oldWideEastRail, deeperUnchangedProfile:oldHighSoffitComparison},
    throughLoadArchRestraintAndWholeBarrierVerified:false,
  };
}
