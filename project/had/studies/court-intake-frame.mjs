// Reactions are signed actions on the supporting house, in kN or kNm.
export const overlap=(p,q)=>[0,1].map(i=>Math.max(0,Math.min(p[i]+p[i+2],q[i]+q[i+2])-Math.max(p[i],q[i])));
const inside=(small,big)=>[0,1].every(i=>small[i]>=big[i]&&small[i]+small[i+2]<=big[i]+big[i+2]);

export function cornerFrame(c,six,grid,roof,selected) {
  const pads=c.compare.feet, [a,b,k]=pads, [swx,swy,restW,restD]=c.moving.rest;
  const shell=12000;
  const heads=['P33','P36'].map(id=>grid.heads.find(h=>h.id===id));
  const plus=(one,two)=>one.map((v,i)=>v+two[i]);
  const reactions=(load,[x,y],H=[0,0],height=5540)=>{
    const rb=(load*(x-a[0])+height*H[0])/(b[0]-a[0]);
    const rc=(load*(y-a[1])+height*H[1]-rb*(b[1]-a[1]))/(k[1]-a[1]);
    return [load-rb-rc,rb,rc];
  };
  const root=(r,indices,[x,y])=>indices.reduce(([n,mx,my],i)=>
    [n+r[i],mx-(pads[i][1]-y)*r[i]/1000,my+(pads[i][0]-x)*r[i]/1000],[0,0,0]);
  const named=[['SW',4350,4350,swx,swy],['SE',7650,4350,shell-swx-restW,swy],
    ['NE',7650,7650,shell-swx-restW,shell-swy-restD],['NW',4350,7650,swx,shell-swy-restD]];
  const chambers={normal:[4300,6775,450,450],east:[5450,6650,450,450],aisle:700};
  const landing=[5650,5500,1000,1000];
  const cases=named.map(([corner,x,y,rx,ry])=>{
    const rest=[rx,ry,restW,restD], point=reactions(5,[x,y]), deck=[x===4350?4350:5850,y===4350?4350:5850,1800,1800];
    // One occupied corner deck at a time. Example gravity is an explicit project action, not a design combination.
    const deckWeight=1.5*deck[2]*deck[3]/1e6;
    const [ow,oh]=overlap(deck,landing),overlapCentre=[Math.max(deck[0],landing[0])+ow/2,Math.max(deck[1],landing[1])+oh/2];
    const combined=[point,reactions(deckWeight,[deck[0]+900,deck[1]+900]),reactions(1.5,[6150,6000]),
      reactions(-1.5*ow*oh/1e6,overlapCentre)].reduce(plus);
    const yr=v=>v===4350?4500:7500,sign=x===4350?1:-1;
    const highNormal=[x===4350?5400:6600,yr(y)], highEast=[x===4350?4500:7500,y===4350?5400:6600];
    const eastDrop=[highEast[0]+sign*250,highEast[1]],eastLeg=x===4350?5175:6650;
    const routes={normal:[highNormal,[5325,highNormal[1]],[5325,7000],[4525,7000]],
      east:[eastDrop,[eastLeg,eastDrop[1]],[eastLeg,6875],[5675,6875]],highEast,eastDrop};
    const centreDistances=Object.fromEntries(['normal','east'].map(name=>{
      const pts=routes[name],ds=[];
      for(let i=1;i<pts.length;i++)for(const [cx,cy] of pads){
        const lo=[0,1].map(j=>Math.min(pts[i-1][j],pts[i][j])),hi=[0,1].map(j=>Math.max(pts[i-1][j],pts[i][j]));
        // Treat the tower as its full 140 mm square plus a 160 mm square water envelope.
        const dx=Math.max(lo[0]-cx,cx-hi[0],0),dy=Math.max(lo[1]-cy,cy-hi[1],0);
        ds.push(Math.max(dx,dy)-150);
      }
      return [name,Math.min(...ds)];
    }));
    const tieCases=[[1,0],[-1,0],[0,1],[0,-1]].map(([fx,fy])=>{
      const top=5540/3270,yaw=((x-6000)*fy-(y-6000)*fx)/1000,diff=yaw/4.165;
      return {force:[fx,fy],westTie:[fx*top/2,fy*top/2-diff],eastTie:[fx*top/2,fy*top/2+diff],
        ground:[fx*(1-top),fy*(1-top)],yawKNm:yaw};
    });
    const rRest=reactions(5,[rx+restW/2,ry+restD/2]);
    return {corner,point:[x,y],rest,deck,containsRest:inside(rest,deck),cornerPad:point,restPad:rRest,combinedPad:combined,pipeRoutes:routes,clearPipeToTower:centreDistances,tieCases,
      westRootPoint:root(point,[0,2],heads[0].xy),eastRootPoint:root(point,[1],heads[1].xy),
      westRootCombined:root(combined,[0,2],heads[0].xy),eastRootCombined:root(combined,[1],heads[1].xy),
      restOverWell:overlap(rest,selected.renewal.courtIntakeWell),restOverEastChamber:overlap(rest,chambers.east)};
  });
  const [ax,,len,width]=six.ordinaryAccess.ramp, pad=[b[0]-200,b[1]-200,400,400];
  const gate=six.ordinaryAccess.gate,half=gate.leaf[1]/2;
  const newGateY=6290,layout=[...six.ordinaryAccess.ramp],rack=[5900,5840,600,350],stow=[5925,5852.5,550,325];
  const turnRadius=Math.hypot(len/2,width)/2; // a 325 by 550 half panel on the turning cradle
  const toeThickness=3, wedgeDepth=52;
  const panelSteelSolidUpperKg=(len/2)*width*wedgeDepth*.00000785; // full block, not a quoted fabricated mass
  const centreQ=4250+roof.catchment.revisedCourt.overhang, chosen=roof.families.at(-1);
  const slope=Math.tan(25*Math.PI/180), dz=(275-200)*slope;
  const primaryZ=chosen.outerReceiver.newPrimarySecondaryZ[0]-dz,secondaryZ=chosen.outerReceiver.newPrimarySecondaryZ[1]-dz;
  const newWet=c.tray.start+75,newDry=newWet+c.tray.travel,secondaryQ=centreQ+20;
  return {pads,padSize:400,heads,cases,serviceDeck:{floorZ:5540,topRestZ:5750,oneActive:1,
      landing,ladderPlan:[6300,5200,600,600],coreBeamY:[5900,6500],centreLinesX:[4500,7100],deckGravityComparisonKPa:1.5,
      unitHorizontalAtDeck:{x:reactions(0,a,[1,0]),y:reactions(0,a,[0,1])},
      positiveTies:{z:3270,x:[3917.5,8082.5],y:6000,topForcePerAppliedKN:5540/3270,
        groundForcePerAppliedKN:1-5540/3270,groundWindowFreeY:[5650,6350]}},
    apronLatch:{mast:[5800,7285],foot:[5730,7215,140,140],postTop:1100,catch:[6075,7222.5,1000],
      planLever:Math.hypot(6075-5800,7285-7222.5),rimFeedClearX:5925-5870,footToNorthGrate:7400-7355,
      asBuiltModuleToFoot:7215-7175,subRibFromWestFace:[4250,6200,-465],subRibLength:Math.hypot(5800-4250,7285-6200)},
    westAndEastBrackets:{rootXY:heads.map(h=>h.xy),westCantileverToPadsMm:4500-(3950+300),
      eastFaceToBMm:7950-300-7100,eastFaceToRampWestMm:7950-300-ax,courtGirderTop:-180,
      blindPlateHeightZ:[-675,-465],anchorRowZ:[-630,-510]},
    ramp:{layout,pad,removedTipOnly:overlap(six.ordinaryAccess.removableTip.plan,pad),
      originalPadConflict:overlap(layout,pad),oldGate:gate.planeY,newGateY,closedLeafSouth:newGateY-half,
      gateToPad:newGateY-half-(pad[1]+400),pair:[len/2,width],turnCentre:[6900,5360],turnRadius,
      rack,stow,fullBlockUpperPerHalfKg:panelSteelSolidUpperKg,toeThicknessMm:toeThickness,wedgeMaximumMm:wedgeDepth,
      fullSolidWedgePerHalfKg:(len/2)*width*(toeThickness+wedgeDepth)/2*.00000785,
      westStairGuardCatch:{post:[5800,7285],seatedGateX:6075},
      rackToChamberAisle:rack[0]-(chambers.normal[0]+chambers.normal[2]+chambers.aisle),
      rackOverFirstRest:cases.map(i=>overlap(stow,i.rest)),roofWorkVehiclesExcluded:true},
    capture:{oldPrimary:4450,oldSecondary:4470,primaryQ:centreQ,secondaryQ,primaryZ,secondaryZ,
      oldDryToNew:c.tray.end-centreQ,wetNear:newWet,wetFar:newWet+230,dryNear:newDry,
      dryToPrimary:newDry-centreQ,dryToSecondary:newDry-secondaryQ,
      wetPrimaryEach:[centreQ-newWet,newWet+230-centreQ],wetSecondaryEach:[secondaryQ-newWet,newWet+230-secondaryQ],
      upperJet:150,head:350,stroke:c.tray.travel,nominalJetMargins:(350-150-c.tray.travel)/2,
      firstRestStroke:c.moving.stroke,restReserve:c.moving.restReserve,carrierMovementZ:[c.moving.lower,c.moving.top],
      existingGutterFront:4700,primaryFallToOriginalBottom:primaryZ-6590},
    chambers:{...chambers,normalThroat:{x:[4400,4650],startY:7225,toY:7325,overlapOnNorthIntake:25},
      eastThroat:{y:[6750,7000],startX:5900,endX:5945,overhangAbove200Approach:20,
        undersideZ:40,clearAboveQuiet:75},old:[c.chamber.normal,c.chamber.east],crewR300Each:(chambers.aisle-600)/2,
      lidUplift:c.chamber.coverLiftKN,blockedPressure:c.chamber.blockedStaticKPa,
      pipeBandsZ:[3650,4050],stageOnly:'Both chambers and the 750 ground aisle stay clear in the same corner-service state.'}};
}
