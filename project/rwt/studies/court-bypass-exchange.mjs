
export function exchange(h,water,ground){
  const well=water.renewal.courtIntakeWell, gate=h.basket.removal.gate;
  const e=water.model.maintenanceRainReference.eastMaintenance, entry=e.weatherEnclosure.entry;
  const pocket=entry.innerPlaneX-entry.outerPlaneX, gateWidth=gate[1]-gate[0], roomZ=e.roof.underside;
  const {inlet}=h, split=inlet.wetSeams[0], newNorth=7360, shutterY=7425;
  const hood=water.renewal.shield, [bx,by,bw,bl]=hood.plan, cutZ=-650;
  // Three-attitude crane comparisons: wet floor shells pitch the long dimension
  // upright and then yaw; each segment of the split hood pitches its long Y upright.
  function pack(id,installed,upright,waterUpperKg=null,sheetUpperKg=null){
    const [x,y,z]=upright;
    return {id,installed,upright,waterUpperKg,sheetUpperKg,
      clearAtGateEach:(gateWidth-y)/2,clearBetweenFlapsEach:(pocket-x)/2,
      belowRoofWith150Foot250Rig:roomZ-150-z-250,planYawDiagonal:Math.hypot(x,y)};
  }
  function shell(id,x,y,longAxis,steps){
    const z=300,short=Math.min(x,y),long=Math.max(x,y),sheet=inlet.sheet;
    return {...pack(id,[x,y,z],[short,z,long],x*y*z/1e6,
      (x*y+2*(x+y)*z+steps*inlet.step*y)*sheet*8960/1e9),longAxis,pitchDiagonal:Math.hypot(long,z)};
  }
  const west=shell('west wet pan',split-inlet.newWesternRelease.initialLeftX,newNorth-6600,'Y',0);
  const east=shell('east wet pan and galleries',inlet.spout.endX-split,newNorth-6850,'X',3);
  // A simple square packing at exactly 900 upright is impossible for the whole
  // hood at ANY yaw: one 790 side forces theta into an empty interval once the
  // min 340 end is included. Sample with the derivative bound for the best max loss.
  const upperW=bw+140, fullH=hood.z[1]-hood.z[0];
  const yaw=(a,w,d)=>[w*Math.cos(a)+d*Math.sin(a),w*Math.sin(a)+d*Math.cos(a)];
  let least=1e6;for(let i=0;i<=900;i++){
    const [X,Y]=yaw(i*Math.PI/1800,upperW,fullH);least=Math.min(least,Math.max(X-pocket,Y-gateWidth));
  }
  const hoodUpper=pack('upper hood',[bw,bl,hood.z[1]-cutZ],[bw,hood.z[1]-cutZ,bl]);
  const boughtUpper=pack('upper hood with external collar, rig allowance',[260,960,560],[560,260,960]);
  const boughtLower=pack('lower hood with external collar, rig allowance',[260,960,285],[285,260,960]);
  const hoodLower=pack('lower hood',[bw,bl,cutZ-hood.z[0]+15],[bw,cutZ-hood.z[0]+15,bl]);
  const sep=ground.basket, dryStrip=[7345,6875,305,250], railSpan=dryStrip[2], P=5000;
  const singleStrip=span=>({span,railBend:1.5*P*span/(25*45**2),railDeflection:P*span**3/(4*200000*25*45**3)});
  const casing=ground.gallery.dryCatchMouths.map(([x,y,w,d])=>({plan:[x,y,w,d],north:y+d,west:x,east:x+w,south:y}));
  const cart=[585,550],railZ=90,railSeat=100,cartCentreY=(gate[0]+gate[1])/2;
  const route=[[6910,cartCentreY],[entry.innerPlaneX,cartCentreY],[(entry.innerPlaneX+entry.outerPlaneX)/2,cartCentreY],
    [entry.outerPlaneX,cartCentreY],[5070,cartCentreY],[5070,5510]];
  const [A,B,C]=h.frame.pads;
  function reactions(x,y,P){const Bz=(x-A[0])/(B[0]-A[0])*P,Cz=((y-A[1])*P-(B[1]-A[1])*Bz)/(C[1]-A[1]);
    return [P-Bz-Cz,Bz,Cz];}
  return {cart:{gross:cart,railZ,wheelbase:400,track:400,upperDeckZ:210,gateReserveEach:(gateWidth-cart[1])/2,
    flapReserveEach:(pocket-cart[0])/2,parkedWheelToBridge:(pocket-400)/2-railSeat,bridgeGap:150,bridgeLength:200,
    pairedCrestReserve:railZ-entry.crest-10,route,stage:[4730,5135,750,750],stageInside:h.basket.removal.stage,shape:'Keep body orientation on the secured transverse transfer table; a rotating loaded cart would invade the normal-grate reserve.',
    posts:e.roof.temporaryPosts,postPlan:e.roof.feetPlan,pairedWestPost:5450-e.roof.feetPlan/2-(5070+cart[0]/2)-10,
    normalGrateReserve:7300-(cartCentreY+cart[1]/2),sourceFootAReserve:4730-(A[0]+h.frame.padSize/2),
    liftedAt4kN:{east:reactions(6910,7105,4),west:reactions(6265,6980,4)},sourcePads:h.frame.pads,
    maxGrossKg:250,verticalDesignKN:4,dualControl:'Retractable bridge rails and separately captured pulls at each flap. No person shares the occupied airlock. Prove stopping, positive hold, full weather closure and mounting strength.'},
    wholeHoodBought:[boughtUpper,boughtLower],collar:{faceWidth:20,nominalFootprint:[240,940],reservedOverallXY:[260,960],
      steelKgEach:(240*940-bw*bl)*6*8000/1e9,minimumBasketSideSkew:h.basket.minimumWidthAfterSkew},
    well,gate,forecast:'E well stays unoccupied with any unisolated projection or suspended carrier.',gateWidth,pocket,roomZ,
    newNorth,wetSplit:split,weldedSteps:inlet.wetSeams.slice(1),packs:[west,east,hoodUpper,hoodLower],
    highAlternative:{box:[6170,7385,960,55],shutterY,slots:3,travel:115,
      remainingWidth:(3*300-6*5)*.75,centralFloor:ground.centralFloorWidth,
      independentTipsStart:7445,caseToPanAfterTwo5:7385-newNorth-10,
      nominalGableEnd:7340,gableInsideAfterTwo5:newNorth-7340-10,
      reason:'Three movable seals and every return up to -15 are required to cross the temporary north skirt. The buried option keeps that skirt solid.'},
    firstLift:{firstEastVertical:true,spoutInOpenNotch:inlet.spout.notch,spout:inlet.spout.y,
      south30Interference:inlet.spout.notch[0]-(inlet.spout.y[0]-30),westStroke:inlet.newWesternRelease.captureThenEast,
      dryCupToPlatformAfterTwo5:casing[0].south-(6220+600)-10,
      howToClose:'Isolate/vent/drain both branches from protected dry controls. An independently restrained plug and drain/witness upstream of each isolation must confirm no residual pressure before lowering water barriers.'},
    hood:{origin:[bx,by],sourcePlan:hood.plan,sourceZ:hood.z,cutZ,jointLength:2*(bw+bl),
      aboveRetainedOutlet:cutZ-hood.clearOutlet.z[1],belowAddedWindow:sep.crest-cutZ,
      staticKPaAtJointWhenSideFlooded:(ground.formerFirstSide-cutZ)*.00981,
      rejectedWestSpoutWholeUprightOversize:least-Math.hypot(upperW,fullH)*Math.PI/3600,
      minPairedOpeningAfterTools:hoodUpper.clearAtGateEach-10,
      scope:'Reject the whole outer-hood package at this upright attitude. The split hood needs a continuously backed, positively clamped wet joint; neither the thin MAT E-joint seal nor the basket is credited for this different perimeter.'},
    fifth:{dryStrip,mass:dryStrip[2]*dryStrip[3]*16*7850/1e9,port:h.incoming.keptCoverOpening,
      pipe:h.incoming.directRoofTerminal,pipeOD:h.incoming.nozzleOD,rail:singleStrip(railSpan),
      railY:[6895,7105],plateStress:1.5*P*210/(100*16**2),pairedPipeToEdge:(h.incoming.keptCoverOpening[2]-h.incoming.nozzleOD)/2-10,
      scope:'The walking insert and rails stay separate from the two wet carriers. Blank or install the direct N pipe on the standing fifth frame before opening N.'}};
}
