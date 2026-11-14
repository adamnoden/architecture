import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {deriveStandRetirement} from './incoming-water-stand-retirement.mjs';

const source=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const threshold=source('../../mat/studies/plant-threshold.json');
const foundation=source('../../str/studies/current-house-grid.json');
const nativeSite=source('../../rwt/studies/over-roof-site-envelope.json');

const sum=values=>values.reduce((total,value)=>total+value,0);
const gap=(a,b)=>Math.hypot(...[0,1].map(i=>Math.max(0,a[i]-b[i]-b[i+2],b[i]-a[i]-a[i+2])));

export function compareDryDockSupport(stand){
  const {dock,section,cargo,plateComparison}=threshold;
  const [west,east,south,north]=dock.plan;
  const {sideHandoff:side}=stand;
  const cap=foundation.heads.find(head=>head.id==='P17');
  const capPlan=[...cap.xy.map((centre,i)=>centre-cap.capXY[i]/2),...cap.capXY];
  const board=nativeSite.primitives.find(p=>p.id==='board-12335-4715');
  assert.deepEqual([board.x,board.y],dock.scaffoldBoardPlan);
  const scaffold=[board.x[0],board.y[0],board.x[1]-board.x[0],board.y[1]-board.y[0]];
  // Enclosing box of the R100 protected inlet at X12250/Y3150 in MAT plant-inlet-route.md.
  const ductPlan=[12150,3050,200,200];
  const supportXs=[12400,14050],supportYs=[3650,5100],padWidthMM=250;
  const [x0,x1]=supportXs,[y0,y1]=supportYs;
  const padHalf=padWidthMM/2;
  const feet=supportXs.flatMap(x=>supportYs.map(y=>{
    const plan=[x-padHalf,y-padHalf,padWidthMM,padWidthMM];
    return {xy:[x,y],capGapMM:gap(plan,capPlan),ductGapMM:gap(plan,ductPlan),foulGapMM:gap(plan,dock.foulStack),
      scaffoldGapMM:gap(plan,scaffold),collectorGapMM:plan[0]-section.collectorX[1],
      deckEdgeInsetMM:Math.min(x-west,east-x,y-south,north-y)-padHalf};
  }));
  const wheelN=plateComparison.oneWheelIncluding1p5_N;
  const shelfX=sum(section.bearingX[1])/2;
  const cargoCases=cargo.map(({item,requiredCentreX,parkedNoseX,fullY})=>{
    const halfLength=parkedNoseX-requiredCentreX;
    const rectangle=[requiredCentreX-halfLength,fullY[0],2*halfLength,fullY[1]-fullY[0]];
    return {
      item,rectangle,scaffoldIntersects:gap(rectangle,scaffold)===0,
      loads:[shelfX,...[rectangle[0],parkedNoseX].filter(x=>x>shelfX)].flatMap(x=>fullY.map(y=>({
        x,y,verticalN:wheelN,
      }))),
    };
  });
  const operatorMassKG=100,crewRadiusMM=300,guardStripMM=50;
  const operatorY=south+guardStripMM+crewRadiusMM+25;
  const deckEndTransferX=east-25;
  const receivingLiftAtLevelMM=dock.outerEdgeZ;
  const liftInterface=cargoCases.map(({item,rectangle:[,,length,width]})=>({item,length,width,
    minimumOccupiedClearWidthMM:width+2*crewRadiusMM+2*25,
    minimumClearLengthMM:length+2*25}));
  const largestLiftClearWidthMM=Math.max(...liftInterface.map(row=>row.minimumOccupiedClearWidthMM));
  const largestLiftClearLengthMM=Math.max(...liftInterface.map(row=>row.minimumClearLengthMM));
  const crewByCargo=cargoCases.map(({item,rectangle})=>({item,
    wheelToCrewMinimumMM:rectangle[1]-operatorY-crewRadiusMM,
    secondSideCrewAvailableMM:north-guardStripMM-(rectangle[1]+rectangle[3])-2*crewRadiusMM-2*25}));
  const standRest=stand.landing.firstRestFootprint;
  const standRestToScaffoldMM=gap(standRest,scaffold);
  const standRestToCargoMM=cargoCases.map(({item,rectangle})=>({item,gapMM:gap(standRest,rectangle)}));
  const wheelCases=cargoCases.flatMap(({item,loads})=>[
    ...loads.map(load=>({item,phase:'threshold and parked cargo',loads:[load],mxNMM:0,myNMM:0})),
    ...loads.map(load=>({item,phase:'occupied threshold and parked cargo',
      loads:[load,{x:Math.max(x0,load.x),y:operatorY,verticalN:operatorMassKG*9.81}],mxNMM:0,myNMM:0})),
    ...cargo.find(row=>row.item===item).fullY.map(y=>({item,phase:'exit edge wheel challenge',
      loads:[{x:deckEndTransferX,y,verticalN:wheelN},{x:east-guardStripMM-crewRadiusMM-25,y:operatorY,verticalN:operatorMassKG*9.81}],
      mxNMM:0,myNMM:0})),
  ]);
  const [railStart,railEnd]=side.supportXs;
  const standCases=[side.handovers.inboard.xShift,side.handovers.outboard.xShift].flatMap(x=>
    side.reactions.map(({verticalN,horizontalN,forcesN})=>{
      const [hx,hy]=horizontalN;
      const loads=side.railYs.map((y,i)=>({x:railEnd,y,
        verticalN:sum(side.pickupsX.map((pickup,j)=>forcesN[2*j+i]*(pickup+x-railStart)/(railEnd-railStart))),
      }));
      const railHeightOverGrade=side.frameZ-dock.outsideGrade;
      // Challenge the independent dock with all horizontal disturbance at rail height.
      return {item:'captured stand',x,verticalN,horizontalN,loads,mxNMM:hy*railHeightOverGrade,myNMM:hx*railHeightOverGrade};
    }));
  const cases=[...wheelCases,...standCases].map(row=>{
    const verticalN=sum(row.loads.map(load=>load.verticalN));
    const reactionsN=supportXs.flatMap(x=>supportYs.map(y=>{
      const wx=loadX=>(x===x0?x1-loadX:loadX-x0)/(x1-x0);
      const wy=loadY=>(y===y0?y1-loadY:loadY-y0)/(y1-y0);
      return sum(row.loads.map(load=>load.verticalN*wx(load.x)*wy(load.y)))+
        (x===x0?-1:1)*row.myNMM/(2*(x1-x0))+(y===y0?-1:1)*row.mxNMM/(2*(y1-y0));
    }));
    assert(Math.abs(sum(reactionsN)-verticalN)<1e-8);
    const mx=sum(reactionsN.map((force,i)=>force*(feet[i].xy[1]-y0)));
    const my=sum(reactionsN.map((force,i)=>force*(feet[i].xy[0]-x0)));
    assert(Math.abs(mx-sum(row.loads.map(load=>load.verticalN*(load.y-y0)))-row.mxNMM)<1e-7);
    assert(Math.abs(my-sum(row.loads.map(load=>load.verticalN*(load.x-x0)))-row.myNMM)<1e-7);
    return {...row,reactionsN};
  });
  const extrema=rows=>{
    const entries=rows.flatMap(row=>row.reactionsN.map((force,index)=>({force,xy:feet[index].xy,item:row.item,
      phase:row.phase,loads:row.loads,horizontalN:row.horizontalN})));
    return {min:entries.reduce((a,b)=>a.force<=b.force?a:b),max:entries.reduce((a,b)=>a.force>=b.force?a:b)};
  };
  const complete=extrema(cases);
  const equalFootBallastKG=-4*complete.min.force/9.81;
  const preloadedCompressionN=complete.max.force-complete.min.force;
  const gradeHoldN=plateComparison.coarseMassKg*9.81/Math.hypot(80,1);
  const hypothetical15MMStepN=plateComparison.squareStepForceFractionOfWheelReaction*wheelN;
  const [outsideBearingStart,outsideBearingEnd]=section.bearingX[1];
  const receiverInterface={outsideBearingX:[outsideBearingStart,outsideBearingEnd],
    deckEndX:east,minimumClearPlanMM:[largestLiftClearLengthMM,largestLiftClearWidthMM],raisedDeckZ:receivingLiftAtLevelMM,
    loadCasesN:{wheeledOnly:wheelN,occupiedWheel:wheelN+operatorMassKG*9.81},
    hold:'The coarse single-wheel comparison and one 100 kg operator are sizing cases. Select the actual guarded platform, restraints, point and distributed loads, travel and handover interlocks before use.'};
  const cargoControl={gradeHoldN,hypothetical15MMStepN,
    hold:'Gravity along the MAT 1:80 deck alone; positive restraint, transition, stopping and native equipment loads require verification.'};
  const shelfMomentNMM=wheelN*(x0-shelfX);
  const singleRail=[50,100,5];
  const [width,depth,wall]=singleRail;
  const inertia=(width*depth**3-(width-2*wall)*(depth-2*wall)**3)/12;
  const steelE=200000;
  const shelfTipDeflectionMM=wheelN*(x0-shelfX)**3/(3*steelE*inertia);
  const shelfBendingStressMPa=shelfMomentNMM*depth/(2*inertia);
  const midspanWheelDeflectionMM=wheelN*(x1-x0)**3/(48*steelE*inertia);
  const dockPostLoadN=side.maxSupportN;
  const standMidspanDeflectionMM=dockPostLoadN*(x1-x0)**3/(48*steelE*inertia);
  const idealRemainingGateClearanceMM=side.remainingGateRailClearanceMM-standMidspanDeflectionMM;
  const ballastFootDemandN=-complete.min.force;
  const postOffsetsMM=side.feet.slice(2).map(foot=>Math.min(...feet.map(candidate=>Math.abs(candidate.xy[1]-foot.xy[1]))));
  const rigidFloorContrast= {stopLoadN:wheelN,shelfMomentNMM,shelfTipDeflectionMM,shelfBendingStressMPa,
    sectionMM:singleRail,midspanWheelDeflectionMM,standMidspanDeflectionMM,idealRemainingGateClearanceMM,postOffsetsMM};

  const ledgeProjection=[shelfX,section.bearingX[1][1],section.collectorX[1]];
  assert(ledgeProjection.every(x=>x<feet[0].xy[0]-padHalf));
  const edgeSpanMM=x0-shelfX;
  const gradeRiseMM=dock.outerTransferRise;
  return {operatorMassKG,operatorY,deckEndTransferX,receivingLiftAtLevelMM,liftInterface,largestLiftClearWidthMM,
    largestLiftClearLengthMM,receiverInterface,crewByCargo,standRestToScaffoldMM,standRestToCargoMM,cargoControl,
    rigidFloorContrast,ballastFootDemandN,preloadedCompressionN,status:'DEVELOPMENT_NOT_ADOPTED',feet,shelfX,edgeSpanMM,cargoCases,cases,complete,
    wheels:extrema(cases.filter(row=>row.item!=='captured stand')),
    stand:extrema(cases.filter(row=>row.item==='captured stand')),
    equalFootBallastKG,minimumFootPressureKPa:complete.max.force/(padWidthMM/1000)**2/1000,
    preloadedFootPressureKPa:preloadedCompressionN/(padWidthMM/1000)**2/1000,
    gradeRiseMM,remainingKeeperClearanceMM:side.remainingGateRailClearanceMM,
    hold:'Trial point reactions exclude frame weight and unmodelled occupied loads. Prove load distribution, separate supported shelf, net bearing and pull-out or stabilising dead load, site platform stiffness, actual levels, drainage, and loaded gate/rail tolerance before acceptance.'};
}

if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(compareDryDockSupport(deriveStandRetirement()),null,2));
