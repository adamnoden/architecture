import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {deriveCurrentHouse} from './current-house.mjs';
import {assertBridgeNativeHouse,bridgeRetirementGeometry} from './incoming-water-bridge-native.mjs';
import {exactSegmentBoxDistance} from './incoming-water-geometry.mjs';
import {segmentBodyDistance,segmentDistance} from './service-interface-geometry.mjs';

const threshold=JSON.parse(readFileSync(new URL('../../mat/studies/plant-threshold.json',import.meta.url),'utf8'));
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const scale=(a,k)=>a.map(v=>v*k);
const norm=a=>Math.hypot(...a);
const min=xs=>xs.reduce((a,b)=>a.gap<=b.gap?a:b);
const edge=([x,y],[a,b],[px,py])=>((a-x)*(py-y)-(b-y)*(px-x))/Math.hypot(a-x,b-y);

function stabilityComparison(axes){
  const braceLength=id=>{
    const [,a,b]=axes.find(row=>row[0]===id);
    return norm(sub(b,a));
  };
  const segments=[
    ['main tube',80**2-72**2,2024,[10140,3840,1032]],
    ['base plate',140*140,20,[10140,3840,10]],
    ['west brace',40**2-34**2,braceLength('westBrace'),[9995,3770,1032]],
    ['south brace',40**2-34**2,braceLength('southBrace'),[10145,3742.5,1032]],
    ['feet pair',100**2+120*80,20,[9960,3675,10]],
    ['top arm bounding solid',305*190,40,[10262.5,3905,2064]],
    ['fork bounding solid',100*140,99,[10385,3970,2113.5]],
    ['drive hardware allowance',1000,600,[10010,3750,1825]],
  ].map(([id,area,length,centre])=>({id,centre,massKG:area*length*7850/1e9}));
  const massKG=segments.reduce((s,p)=>s+p.massKG,0);
  const centreOfMass=scale(segments.map(p=>scale(p.centre,p.massKG)).reduce(add,[0,0,0]),1/massKG);
  const centres=[[10140,3840],[9850,3700],[10150,3645]];
  const pointReactionsN=centres.map((p,i)=>{
    const a=centres[(i+1)%3],b=centres[(i+2)%3];
    return massKG*9.81*edge(a,b,centreOfMass)/edge(a,b,p);
  });
  assert(Math.abs(pointReactionsN.reduce((s,v)=>s+v,0)-massKG*9.81)<1e-7);
  const expandedSupportPoints=[[9870,3640],[10240,3640],[10240,3925],[10080,3925],[9870,3760]];
  const expandedNominalMarginMM=Math.min(...expandedSupportPoints.map((p,i)=>edge(p,expandedSupportPoints[(i+1)%expandedSupportPoints.length],centreOfMass)));
  const designMassKG=90,lateralChallengeN=100,verticalChallengeN=designMassKG*9.81*2;
  const pinDiameterMM=8,steelG=77000,keyFitMM=.2,workingWidthMM=10;
  const pinDoubleShearAreaMM2=Math.PI*pinDiameterMM**2/2;
  const firstTakeoverCG=[10150,3850,1270], dryLiftingForce=verticalChallengeN;
  const liftingKeyXY=[[10090,3800],[10210,3800],[10210,3900],[10090,3900]];
  const liftingKeySupports=liftingKeyXY.map(([x,y])=>{
    const [cx,cy]=firstTakeoverCG;
    return {xy:[x,y],verticalForceN:dryLiftingForce*((x===10090?10210-cx:cx-10090)/120)*((y===3800?3900-cy:cy-3800)/100)};
  });
  assert(Math.abs(liftingKeySupports.reduce((sum,row)=>sum+row.verticalForceN,0)-dryLiftingForce)<1e-8);
  const liftingKeyWorstN=Math.max(...liftingKeySupports.map(row=>row.verticalForceN));
  const structuralOffsetMM=30,keySpacingMM=80,deckFallRatio=1/80,handleHeightMM=1240+140;
  const liftingCG=centreOfMass[2]+140;
  const totalOverturningNm=(lateralChallengeN*handleHeightMM+verticalChallengeN*liftingCG*deckFallRatio)/1000;
  return {segments,massKG,centreOfMass,
    firstTakeoverTrial:{liftingKeySupports,centredVerticalNominalN:dryLiftingForce,liftingKeyWorstN,pinDiameterMM,
      simpleDoubleShearMPa:liftingKeyWorstN/pinDoubleShearAreaMM2,
      simpleLugBearingMPa:liftingKeyWorstN/(pinDiameterMM*workingWidthMM),
      idealShearSlipMM:liftingKeyWorstN*workingWidthMM/(steelG*pinDoubleShearAreaMM2),
      nativeInsertionClearanceMM:keyFitMM,
      requiredInterlock:'All four positive heads and their redundant holding structure engage before original anchors release. The pin stresses check ideal contact only. Fit, weld, lug edge/tear-out, vertical source and actual retainer actuation remain open.'},
    pointSupport:{centres,pointReactionsN,mostAdverseN:Math.min(...pointReactionsN)},
    expandedSupportPoints,expandedNominalMarginMM,expandedSettingMarginMM:expandedNominalMarginMM-structuralOffsetMM,
    expandedGravityRestoreNm:designMassKG*9.81*(expandedNominalMarginMM-structuralOffsetMM)/1000,
    restrainedCarrierTrial:{designMassKG,lateralChallengeN,verticalChallengeN,keySpacingMM,deckFallRatio,handleHeightMM,
      overturningNm:totalOverturningNm,minimumOpposedTieForceN:totalOverturningNm*1000/keySpacingMM}};
}

export function deriveStandRetirement(){
  const house=deriveCurrentHouse().model;
  assertBridgeNativeHouse(house);
  const {boxes:nativeBoxes,cylinders:nativeCylinders,braceAxes}=bridgeRetirementGeometry();
  const door=house.plantReferenceDoor;
  assert.equal(threshold.opening.height,house.architecturalServices.plant.cylinder.minDoor[1]);
  const movingNames=['westBase','westPost','westBraceFoot','southBraceFoot','westDriveInputs','westDriveShaft','westDriveHead','westDriveTop','westTopArm','westFork'];
  const movingBoxes=movingNames.map(id=>({id,box:nativeBoxes[id]}));
  const staticBoxes=Object.entries(nativeBoxes).filter(([id])=>!movingNames.includes(id)&&!['westBrace','southBrace','openPlantLeaf'].includes(id))
    .map(([id,box])=>({id,box}));
  const dock=threshold;
  const [ys,yn]=dock.opening.clearY;
  const portal=[
    {id:'south door reveal',box:[11570.5,ys-600,0,429.5,600,3100]},
    {id:'north door reveal',box:[11570.5,yn,0,429.5,600,3100]},
    {id:'door head',box:[11570.5,ys,dock.opening.height,429.5,yn-ys,800]},
  ];
  staticBoxes.push(...portal,{id:'plant leaf closed during stand exchange',box:[door.northHingeReference[0]-door.leafReference[1]/2,door.northHingeReference[1]-door.leafReference[0],0,door.leafReference[1],door.leafReference[0],3100]},
   {id:'parked detached lower-tail receiver',box:[12260,3755,0,275,190,1150]},
   {id:'parked emptied whole-U receiver',box:[12960,3675,0,1000,400,1427]});
  const overlap=(q,b)=>Math.hypot(...[0,1,2].map(i=>Math.max(q[i]-b[i]-b[i+3],b[i]-q[i]-q[i+3],0)));
  const moved=(q,s)=>[...add(q.slice(0,3),s),...q.slice(3)];
  const zGap=(b,z)=>Math.max(z[0]-b[2]-b[5],b[2]-z[1],0);
  const xyBoxGap=(p,b)=>Math.hypot(...[0,1].map(i=>Math.max(p[i]-b[i]-b[i+3],b[i]-p[i],0)));
  const boxToCylinder=(b,c)=>Math.hypot(Math.max(xyBoxGap(c.centre,b)-c.r,0),zGap(b,c.z));
  const braceR=Math.hypot(20,20);
  const feet=['westBase','westBraceFoot','southBraceFoot'].map(id=>nativeBoxes[id]);
  const outward=465,lift=140;
  const cradleBoxes=feet.map(([x,y,,w,d],i)=>({id:'shaped handling shoe '+i,box:i===0?[x+12,y-8,-60,w-24,d-4,60]:[x-10,y-10,-60,w+20,d+20,60]}));
  const cradleLinks=feet.slice(1).map((q,i)=>{
    const centre=b=>[b[0]+b[3]/2,b[1]+b[4]/2,-30];
    return ['cradle connecting tube '+i,centre(feet[0]),centre(q),8];
  });
  const movingSegments=braceAxes.map(([id,a,b])=>[id,a,b,braceR]).concat(cradleLinks);
  movingBoxes.push(...cradleBoxes);
  const handleGrip=[10345,4120,1240];
  const captureHandle=['captured operator handle',[10180,3840,1240],handleGrip,10];
  movingSegments.push(captureHandle);

  const phases=[
   ['raise captured stand over east fork',[0,0,0],[0,0,lift]],
   ['east under lifted fork',[0,0,lift],[390,0,lift]],
   ['north past east-fork band',[390,0,lift],[390,260,lift]],
   ['gain cylinder-side clearance',[390,260,lift],[outward,260,lift]],
   ['north to aperture lane',[outward,260,lift],[outward,660,lift]],
   ['lower the captured stand to transport datum',[outward,660,lift],[outward,660,60]],
   ['east to exterior dock',[outward,660,60],[2600,660,60]],
  ];
  const carriedBox=(p,shift)=>p.id.startsWith('shaped handling shoe')?
    moved([p.box[0],p.box[1],0,p.box[3],p.box[4],shift[2]],[shift[0],shift[1],0]):moved(p.box,shift);
  const carriedSegment=([id,a,b,r],shift)=>{
    const offset=id.startsWith('cradle')?[shift[0],shift[1],60]:shift;
    return [id,add(a,offset),add(b,offset),r];
  };
  const motion=(path,extraStatic=[],extraMoving=[])=>path.map(([phase,a,b])=>{
    const delta=sub(b,a),span=Math.hypot(...delta),samples=Math.ceil(span/10);
    return {phase,...min(Array.from({length:samples+1},(_,i)=>{
      const s=add(a,scale(delta,i/samples));
      const options=[];
      for(const p of [...movingBoxes,...extraMoving]){
        const box=carriedBox(p,s);
        for(const q of [...staticBoxes,...extraStatic])options.push({id:p.id,to:q.id,gap:overlap(box,q.box)-span/(2*samples)});
        for(const [id,c] of Object.entries(nativeCylinders))options.push({id:p.id,to:id,gap:boxToCylinder(box,c)-span/(2*samples)});
      }
      for(const [part,start,end,r] of movingSegments.map(row=>carriedSegment(row,s))){
        for(const f of [...staticBoxes,...extraStatic])options.push({id:part,to:f.id,gap:exactSegmentBoxDistance(start,end,f.box)-r-span/(2*samples)});
        for(const [id,c] of Object.entries(nativeCylinders))options.push({id:part,to:id,gap:segmentBodyDistance(start,end,c.centre,c.z,c.r)-r-span/(2*samples)});
      }
      return {i,...min(options)};
    }))};
  });
  const cartBodyPath=[[10650,4310,0],[10650,4310,0],[10650,4310,0],[10900,4355,0],[11000,4335,0],[11070,4450,0],[11070,4450,0],[11070+2600-outward,4450,0]];
  const bodyResults=phases.map(([phase,a,b],index)=>{
    const displacement=sub(b,a),bodyA=cartBodyPath[index],bodyB=cartBodyPath[index+1],bodyDisplacement=sub(bodyB,bodyA);
    const samples=Math.ceil(Math.max(Math.hypot(...displacement),Math.hypot(...bodyDisplacement))/10);
    const rows=Array.from({length:samples+1},(_,i)=>{
      const f=i/samples,shift=add(a,scale(displacement,f)),body=add(bodyA,scale(bodyDisplacement,f));
      const xyBodyToBox=box=>{const xy=xyBoxGap(body,box)-300,z=zGap(box,[0,2000]);return z?Math.hypot(Math.max(0,xy),z):xy;};
      const fixed=staticBoxes.map(p=>({to:p.id,gap:xyBodyToBox(p.box)-norm(bodyDisplacement)/(2*samples)}));
      for(const [id,c] of Object.entries(nativeCylinders))fixed.push({to:id,gap:Math.hypot(body[0]-c.centre[0],body[1]-c.centre[1])-c.r-300-norm(bodyDisplacement)/(2*samples)});
      const relativeStep=norm(sub(displacement,bodyDisplacement))/(2*samples);
      const moving=movingBoxes.map(p=>({to:p.id,gap:xyBodyToBox(carriedBox(p,shift))-relativeStep}));
      moving.push(...movingSegments.filter(([id])=>id!=='captured operator handle').map(row=>carriedSegment(row,shift)).map(([id,a,b,r])=>({to:id,gap:segmentDistance(body,[body[0],body[1],2000],a,b)-300-r-relativeStep})));
      const shoulder=add(body,[0,0,1380]),grip=add(handleGrip,shift);
        const fixedPenalty=Math.max(norm(displacement),norm(bodyDisplacement))/(2*samples);
      const arm=staticBoxes.map(p=>({to:p.id,gap:Math.min(exactSegmentBoxDistance(shoulder,grip,p.box)-40,
        exactSegmentBoxDistance(grip,grip,p.box)-50)-fixedPenalty}));
      for(const [id,c] of Object.entries(nativeCylinders))arm.push({to:id,gap:Math.min(segmentBodyDistance(shoulder,grip,c.centre,c.z,c.r)-40,segmentBodyDistance(grip,grip,c.centre,c.z,c.r)-50)-fixedPenalty});
      for(const p of movingBoxes){const q=carriedBox(p,shift);arm.push({to:p.id,gap:Math.min(exactSegmentBoxDistance(shoulder,grip,q)-40,exactSegmentBoxDistance(grip,grip,q)-50)-relativeStep});}
      for(const [id,a,b,r] of movingSegments.filter(([id])=>id!==captureHandle[0]).map(row=>carriedSegment(row,shift))){
        arm.push({to:id,gap:Math.min(segmentDistance(shoulder,grip,a,b)-40,segmentDistance(grip,grip,a,b)-50)-r-relativeStep});
      }
      const reach=norm(sub(shoulder,grip))+relativeStep;
      return {...min([...fixed,...moving]),body,i,arm:min(arm),reach};

    });
    return {phase,...min(rows),handOrArm:min(rows.map(o=>o.arm)),maximumReachMM:Math.max(...rows.map(o=>o.reach))};
  });
  const minY=Math.min(...movingBoxes.map(p=>p.box[1]))+660;
  const maxY=Math.max(...movingBoxes.map(p=>p.box[1]+p.box[4]))+660;
  const mainMotion=motion(phases);
  const failedShortLift=motion(phases.map(([name,a,b])=>[name,a.map((v,i)=>i===2&&v===lift?60:v),b.map((v,i)=>i===2&&v===lift?60:v)]).filter(([name,a,b])=>norm(sub(a,b))>0));
  const stability=stabilityComparison(braceAxes);
  const expandedSupports=stability.expandedSupportPoints.map(([x,y],i)=>({id:'expanded rolling pad '+i,box:[x-7,y-7,0,14,14,60]}));
  const failedExpandedCradle=motion(phases.slice(0,2),[],expandedSupports);
  const failedOpenLeaf=motion(phases.slice(0,1),[{id:'parked internal leaf',box:[...door.fullyOpenEastLeaf.slice(0,2),0,...door.fullyOpenEastLeaf.slice(2),3100]}]);
  const thresholdSlice={
    y:[minY,maxY],highestZ:2163+60,openingY:[ys,yn],openingHeight:dock.opening.height,
    servicePlateY:dock.section.servicePlateWidthY,
    minimumServicePlateLateralMarginMM:Math.min(minY-dock.section.servicePlateWidthY[0],dock.section.servicePlateWidthY[1]-maxY),
  };
  const firstRestFootprint=[12490,4240,590,570];
  const footprintSupports=[
    [12530,4270],[13040,4270],[13040,4765],[12530,4765],
  ];
  const landedCG=add(stability.centreOfMass,[2600,660,60]);
  const firstRestMarginMM=Math.min(...footprintSupports.map((p,i)=>edge(p,footprintSupports[(i+1)%footprintSupports.length],landedCG)));
  const firstRestMomentReserveNm=stability.restrainedCarrierTrial.designMassKG*9.81*(firstRestMarginMM-30)/1000;
  const firstRestKeysStillRequired=firstRestMomentReserveNm<stability.restrainedCarrierTrial.overturningNm;
  const terminalPlan=[nativeBoxes.westBase[0]+2600, nativeBoxes.westBase[1]+660];
  const cartTarget=dock.cargo.find(c=>c.item==='Cylinder');
  const cartConflict=Math.hypot(Math.max(firstRestFootprint[0]-cartTarget.requiredCentreX,cartTarget.requiredCentreX-firstRestFootprint[0]-firstRestFootprint[2],0),
   Math.max(firstRestFootprint[1]-cartTarget.centreY,cartTarget.centreY-firstRestFootprint[1]-firstRestFootprint[3],0))-house.architecturalServices.plant.cylinder.cartRadius;
  return {status:'DEVELOPMENT_NOT_ADOPTED',motion:mainMotion,body:bodyResults,stability,thresholdSlice,
    adverse:{shortLift:failedShortLift,expandedCradle:failedExpandedCradle,openLeaf:failedOpenLeaf},
    landing:{firstRestFootprint,terminalPlan,footprintSupports,landedCG,firstRestMarginMM,firstRestMomentReserveNm,firstRestKeysStillRequired,cartConflictMM:cartConflict,requiresStandRemovedBeforeCylinder:true},
    holding:['Independent positive first lift, anchor-key release, guide/drive capture, mounting and full bearing are unqualified.',
      'Hold the protected internal leaf closed during stand exchange and prove replacement ventilation/egress through the externally supported east portal.',
      'The physically restrained carrier and its actual low positive track connection must fit the sweep. A nominal object route cannot qualify an unloaded or free-rolling cradle.',
      'Retire the lower-tail frame first. The dock requires its supported crossing plate, scaffold clearance and a separate loaded stand handover/export before cylinder docking.']};
}

if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(deriveStandRetirement(),null,2));
