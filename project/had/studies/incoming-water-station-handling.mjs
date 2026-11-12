/** Located service-only carriers, reaction supports and first rest.
 * The force inputs are design bounds; no catalogue capacity is inferred. */
import {pathSeparation} from './service-interface-geometry.mjs';
import {exactSegmentBoxDistance as segmentBoxDistance} from './incoming-water-geometry.mjs';

const boxGap=(a,b)=>Math.hypot(...[0,1,2].map(i=>Math.max(a[i]-b[i]-b[i+3],b[i]-a[i]-a[i+3],0)));
const swept=(box,a,b)=>[...box.slice(0,3).map((v,i)=>v+Math.min(a[i],b[i])),...box.slice(3).map((v,i)=>v+Math.abs(b[i]-a[i]))];
const moved=(box,d)=>[...box.slice(0,3).map((v,i)=>v+d[i]),...box.slice(3)];
const pointBox=(p,b)=>Math.hypot(...p.map((v,i)=>Math.max(b[i]-v,v-b[i]-b[i+3],0)));
const lineBox=(a,b,r)=>[...a.map((v,i)=>Math.min(v,b[i])-r),...a.map((v,i)=>Math.abs(v-b[i])+2*r)];
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const xy=p=>[p[0],p[1],0];

export function stationRoomBoxes(model){
  const boxes={};
  for(const w of model.groundWalls){
    const vertical=w.a[0]===w.b[0],j=vertical?1:0;
    const [face0,face1]=w.finishedFaces??[w.a[1-j]-w.t/2-27,w.a[1-j]+w.t/2+27];
    const intervals=[[Math.min(w.a[j],w.b[j]),Math.max(w.a[j],w.b[j])]];
    for(const hole of w.holes??[]){
      const cut=[hole[0]+45,hole[1]-45];
      for(let i=intervals.length-1;i>=0;i--){const[a,b]=intervals[i];if(cut[0]>=b||cut[1]<=a)continue;
        intervals.splice(i,1,...[[a,Math.max(a,cut[0])],[Math.min(b,cut[1]),b]].filter(([a,b])=>b>a));}
    }
    for(const [i,[a,b]]of intervals.entries())boxes[w.id+i]=vertical?[face0-18,a,0,face1-face0+36,b-a,2000]:[a,face0-18,0,b-a,face1-face0+36,2000];
  }
  for(const[id,p]of Object.entries(model.groundFurniture))boxes['furniture '+id]=[p[0],p[1],0,p[2],p[3],2000];
  for(const[id,p]of model.fixedObstacles.GROUND)boxes[id]=[p[0],p[1],0,p[2],p[3],2000];
  const l=model.plantReferenceDoor.fullyOpenEastLeaf;boxes.openLeaf=[l[0],l[1],0,l[2],l[3],2300];
  boxes.eastWall=[model.shell-model.envelope,0,0,300,12000,3500];
  const [cx,cy,cw,cd]=model.court,e=model.envelope;
  boxes.courtSouth=[cx-e,cy-e,0,cw+2*e,e,3500];
  boxes.courtEast=[cx+cw,cy-e,0,e,cd+2*e,3500];
  return boxes;
}

export function stationSupportGeometry(station){
  return station.cartridges.map(c=>{
    const anchors=[c.ends[0]+65,c.ends[1]-65],mid=(c.ends[0]+c.ends[1])/2;
    const catchDX=c.id==='I0'?75:85;
    const reactionArms=c.ends.map((y,i)=>({id:c.id+' reaction'+i,
      path:[[11550,c.id==='I0'&&i===1?y-40:anchors[i],c.bottom-(c.id==='I0'?10:25)],[c.x,c.id==='I0'&&i===1?y-40:anchors[i],c.bottom-(c.id==='I0'?10:25)],[c.x,y,c.bottom-(c.id==='I0'?10:25)],[c.x,y,c.bottom]],radius:15,
      key:[c.x-37,y-37,c.bottom,74,74,15]}));
    const catches=anchors.map((y,i)=>({id:c.id+' catch'+i,
      arm:[[11550,y,c.bottom+155],[c.x+catchDX,y,c.bottom+155]],radius:15,
      cage:[c.x+catchDX-15,y-20,c.bottom+145,37,40,45],
      bearing:c.bottom+165,keeperTop:c.bottom+190}));
    const frontX=c.x-105,z=c.bottom+175;
    const members=[{id:'grip bar',a:[frontX,Math.min(...anchors,mid-75),z],b:[frontX,Math.max(...anchors,mid+75),z],radius:Math.SQRT2*10},
      ...anchors.map((y,i)=>({id:'crossmember'+i,a:[frontX,y,z],b:[c.x+catchDX,y,z],radius:Math.SQRT2*10}))];
    const rearX=c.x+(c.id==='I0'?15:25),rearZ=c.bottom+(c.id==='I0'?145:100);
    members.push({id:'rear handoff bar',a:[rearX,mid-75,rearZ],b:[rearX,mid+75,rearZ],radius:Math.SQRT2*10},
      ...[mid-75,mid+75].map((y,i)=>({id:'rear link'+i,a:[rearX,y,rearZ],b:[rearX,y,z],radius:Math.SQRT2*10})));
    members.push(...[mid-75,mid+75].map((y,i)=>({id:'rear crossmember'+i,a:[frontX,y,z],b:[rearX,y,z],radius:Math.SQRT2*10})),
      ...anchors.map((y,i)=>({id:'shoe strut'+i,a:[c.x+21,y,z],b:[c.x+21,y,c.crown-15],radius:Math.hypot(10,6)})));
    members.push(...[-40,40].map((dy,i)=>({id:'handoff socket'+i,a:[rearX-100,mid+dy,rearZ],b:[rearX,mid+dy,rearZ],radius:Math.SQRT2*11})));
    const yokeMembers=[{id:'handoff yoke grip bar',a:[c.x+180,mid-75,rearZ],b:[c.x+180,mid+75,rearZ],radius:Math.SQRT2*10},
      ...[-40,40].map((dy,i)=>({id:'handoff yoke arm'+i,a:[rearX-65,mid+dy,rearZ],b:[c.x+180,mid+dy,rearZ],radius:Math.SQRT2*8}))];
    const tabs=anchors.map(y=>[c.x+catchDX-10,y-10,c.bottom+165,20,20,20]);
    const installBody=c.id==='U0'?[10775,3025]:[10875,3175];
    const installShoulder=[...installBody,1450];
    const shoeHands=c.ends.map((y,i)=>[c.x+30,y+(i?-75:75),c.crown+1]);
    const keyHands=anchors.map(y=>[frontX-85,y,c.bottom+175]);
    const native={
      normalInsulationRemoved:true,pressureTubeOD:22,shoeInnerR:12,shoeOuterR:20,maximumShoeAndFastenerR:35,
      halfShoeOpeningStrokeX:30,shoeLoadedOffsetZ:1,carrierInstallOffsetZ:-1,catchTakeUpMM:1,availableJackTravelMM:3,
      tangentEndGapMM:(c.ends[1]-c.ends[0]-150-165)/2,
      shoeMethod:'Place the captive rear and front half-shells from their opposite normal sides with30mm opening. TheirR12 cavity approaches the bareR11 tube monotonically without crossing it. Join at the tangent-trimmed seam; then jack the already caught carrier1mm upward so the curved metal saddle bears. The two perpendicular elbow directions prevent escape without friction credit.',
      installBody,installShoulder,rejectedDirectHighHands:shoeHands,rejectedDirectHighReachMM:Math.max(...shoeHands.map(h=>Math.hypot(...h.map((v,i)=>v-installShoulder[i])))),
      setup:'Close, pressure-prove and drain first; cap the drains, seat the carrier on both catches, fit the captive half-shells with the low removable control tools and take up the metal contact before any union nut moves. The pans remain in place. Branch cartridges leave before I0 capture installation.',
      catch:{throat:[24,24],carrierCrossmember:[20,20,2],nativeSideGapMM:2,maximumPlacementErrorMM:.5,
        keyDiameter:8,keyEngagement:8,keyStroke:20,openKeyToFixedSocketGapMM:12,
        internalRodDiameter:8,hollowWidth:16,rodRadialGapMM:4,
        geometry:'Open-west/open-top C cheeks flank the20mm carrier crossmember, with2mm native side and back fits. A bearing plate carries its lower face; an8mm captive axial key enters the10mm backplate8mm to retain it. Withdraw20mm wholly inside the hollow crossmember before lift. The rear handoff bar sits≥30mm forward of the cage and cannot rise into the bearing plate.',
        control:'A recessed front M8 screw draws the captive key through a10mm control bore at the carrier-bar/crossmember junction; a75mm shaft/60mm T-head driver works from the front. The rod stays inside the16mm hollow and the tool leaves before movement. Open/closed hard stops expose a positive witness, not an assumed spring latch.'},
      keyHands,keyDriverLength:75,keyDriverRadius:30,keyHandRadius:40,
      maximumKeyReachMM:Math.max(...keyHands.map(h=>Math.hypot(h[0]-c.body[0],h[1]-c.body[1],h[2]-1450))),
      oneGripDuringActuation:'Each qualified front grip alone carries the full156.96N comparison while the other hand draws one key; the other catch remains bearing until the second key is clear. Re-engage both grips before the85mm lift.',
      actualFitDuty:'Execute the matched half-shell, key, jack and native2/5mm fits with±0.5mm component placement. These bounded native fits are distinct from the25mm architectural body/tool comparison.'};
    return {...c,anchors,catchDX,reactionArms,catches,carrier:{members,tabs,yokeMembers,
      grips:[-50,50].map(d=>[frontX,(c.ends[0]+c.ends[1])/2+d,z]),
      rearGrips:[-50,50].map(d=>[c.x+180,(c.ends[0]+c.ends[1])/2+d,rearZ]),native,
      handoffYoke:{insertStroke:65,embedment:65,outerReceiver:[22,22,2],innerArm:[16,16,2],radialFitMM:1,
        pinDiameter:8,armYOffsets:[-40,40],gripXOffset:180,maximumOverhangMM:165,
        method:'The primary holds both front grips at the doorway. FromXaxis+600 the helper inserts the separate yoke65mm into two100mm sockets, closes two captive8mm pins and verifies both witnesses before taking the load. The yoke is absent during station release. Its farther-east grips and central arms clear the receiving columns; an unextended rear bar would trap the hands behind those columns.'},
      description:'Isolated stripped handling state. Two splitR75 elbow shoes (innerR12/outerR20, fasteners≤R35) are trimmed exactly at both tangent planes. Their curved shape positively captures the bare22mm pressure tube without friction or a pressure-body lifting shoulder.20×12 short struts and20×20×2 hollow carrier rails connect the shoes to rear bearing tabs and both grip bars. The branch valve+adaptor165mm bound leaves5mm native clearance at each trimmed shoe end.'}};
  });
}

function nativeToolStudy(c,route,room,supportBoxes,fixedPaths,modules){
  const own=c.carrier.native,shoulder=own.installShoulder,results=[];
  const fixed=Object.entries(fixedPaths).flatMap(([id,p])=>p.path.slice(1).map((b,i)=>{
    const box=lineBox(p.path[i],b,37+p.hausdorffError);
    const top=Math.max(...p.path.map(v=>v[2]));box[5]=Math.min(box[2]+box[5],top)-box[2];return box;
  }));
  const valves=modules.filter(m=>c.id!=='I0'||m.id==='I0').map(m=>[m.x-37,(m.ends[0]+m.ends[1])/2-82.5,m.crown-37,74,165,132]);
  const boxes=[...Object.values(room),...Object.values(supportBoxes),...fixed,...valves,
    ...c.carrier.members.map(m=>lineBox(m.a,m.b,m.radius))];
  for(const[end,y]of c.ends.entries())for(const side of[-1,1]){
    const atY=y+(end?-20:20),atZ=c.crown-75+Math.sqrt(75**2-55**2);
    const handle=[c.x-115,atY,c.bottom-25],hand=[c.x-135,atY,c.bottom-25];
    let ownPipe=Infinity,remote=Infinity,handGap=Infinity,armGap=Infinity;
    // Fixed low handle; a captured half-shell head translates30mm normally.
    // Sample bound: every shaft point travels at most30mm/100 per interval.
    for(let step=0;step<=100;step++){
      const head=[c.x+side*(30+30*step/100),atY,atZ];
      ownPipe=Math.min(ownPipe,pathSeparation([handle,head],route.path)-11-5-route.hausdorffError);
      for(const b of boxes){remote=Math.min(remote,segmentBoxDistance(handle,head,b)-5);
        handGap=Math.min(handGap,pointBox(hand,b)-40);armGap=Math.min(armGap,segmentBoxDistance(shoulder,hand,b)-40);}
    }
    results.push({end,side,handle,hand,headY:atY,headZ:atZ,openingStrokeX:30,toolRadius:5,
      bareTubeGapLowerMM:ownPipe-.15,loadedBareTubeGapLowerMM:ownPipe-.15-6*310**3/(3*190000*(Math.PI*10**4/64))-.5,otherObjectGapLowerMM:remote-.15,
      handGapMM:handGap,armGapMM:armGap,maximumReachMM:Math.hypot(...hand.map((v,i)=>v-shoulder[i]))});
  }
  const keys=own.keyHands.map(hand=>({hand,minimumHandMM:Math.min(...boxes.map(b=>pointBox(hand,b)-40)),minimumArmMM:Math.min(...boxes.map(b=>segmentBoxDistance(shoulder,hand,b)-40)),reachMM:Math.hypot(...hand.map((v,i)=>v-shoulder[i]))}));
  return {lowControls:true,body:own.installBody,shoulder,results,keys,placementTool:{shaftDiameter:10,maximumUnsupportedLength:310,maximumCapturedHalfShoeForceN:6,minimumModulusNmm2:190000,tipDeflectionMM:6*310**3/(3*190000*(Math.PI*10**4/64)),settingErrorMM:.5,minimumRequiredLoadedTubeGapMM:2,head:'A positive closed clevis engages the shoe normal lug atX±30. All fitted lug/fastener metal stayswithinR35; the temporary open-state tool extends beyond that envelope and is checked separately.'},
    scope:'The thin captured placement tool works beside the stripped native22mm pressure tube; its native gap is separately reported. Other components retain the25mm tool/body comparison. Direct high-hand placement is not the adopted method. Both half-shells and fasteners remain captive; withdraw these tools before transport.'};
}

function firstRestStudy(c,route,states){
  const final=states.at(-1),before=states.at(-2),mid=(c.ends[0]+c.ends[1])/2,axis=8200;
  const d=final.d,steel={frame:[8000,2875,0,400,650,850]};
  const columns=c.anchors.map((y,i)=>{
    const x=axis+c.catchDX,Y=3200+y-mid;
    const pieces={
      spine:[x+12,Y-20,850,10,40,265],
      southCheek:[x-15,Y-20,1055,27,8,60],
      northCheek:[x-15,Y+12,1055,27,8,60],
      bearing:[x-15,Y-20,1055,27,40,10]};
    for(const[id,b]of Object.entries(pieces))steel[i+' '+id]=b;
    return {x,y:Y,pieces,keyHand:[x+97,Y,1080],nativeThroat:[24,24],keyDiameter:8,keyStroke:20};
  });
  const remote=[];
  // Actual flat union mouths stay at or above900. Full radial R37 remains.
  const tube=route.path.slice(1).map((p,i)=>{
    const b=lineBox(route.path[i],p,37+route.hausdorffError),top=b[2]+b[5];
    b[2]=Math.max(b[2],c.bottom);b[5]=top-b[2];return b;
  });
  for(const[id,b]of Object.entries(steel)){
    if(id==='frame')for(const p of tube)remote.push({id,component:'pipe',gapMM:boxGap(swept(p,before.d,d),b)});
    else {
      const obstacle=swept(b,before.d.map(x=>-x),d.map(x=>-x));
      remote.push({id,component:'pipe',gapMM:Math.min(...route.path.slice(1).map((p,i)=>segmentBoxDistance(route.path[i],p,obstacle)))-37-route.hausdorffError});
    }
    for(const m of [...c.carrier.members,...c.carrier.yokeMembers]){
      // Only the matching crossmember/tab enters this native24mm throat.
      // The complete20mm section and its2mm side fit are checked separately.
      const index=Number(id.split(' ')[0]);
      if(m.id==='crossmember'+index)continue;
      remote.push({id,component:m.id,gapMM:boxGap(swept(lineBox(m.a,m.b,m.radius),before.d,d),b)});
    }
  }
  const shoulder=[8725,3200,1000],gripHands=c.carrier.rearGrips.map(g=>g.map((v,i)=>v+d[i]));
  const armChecks=gripHands.map(hand=>({hand,minimumMM:Math.min(...Object.values(steel).map(b=>segmentBoxDistance(shoulder,hand,b)-40)),reachMM:Math.hypot(...hand.map((v,i)=>v-shoulder[i]))}));
  const keyChecks=columns.map(col=>{
    const hand=col.keyHand,keyShoulder=[8725,3200,c.id==='I0'?1250:1100];
    const boxes=[...Object.values(steel),...c.carrier.members.map(m=>moved(lineBox(m.a,m.b,m.radius),d)),...c.carrier.yokeMembers.map(m=>moved(lineBox(m.a,m.b,m.radius),d))];
    return {hand,shoulder:keyShoulder,minimumHandMM:Math.min(...boxes.map(b=>pointBox(hand,b)-40)),minimumArmMM:Math.min(...boxes.map(b=>segmentBoxDistance(keyShoulder,hand,b)-40)),reachMM:Math.hypot(...hand.map((v,i)=>v-keyShoulder[i]))};
  });
  return {columns,steel,remoteMinimum:remote.sort((a,b)=>a.gapMM-b.gapMM).slice(0,6),armChecks,keyChecks,
    native:{sideFitMM:2,settingErrorMM:.5,closedHardSeatPlayMM:.1,maximumElasticContactMovementMM:.1,
      effectiveMomentLeverMM:16,eachMomentNm:25,eachPositiveContactN:1600,keyDiameter:8,
      keyDoubleShearNmm2:1600/(2*Math.PI*8**2/4),twoTubeWallBearingNmm2:1600/(2*8*2),
      effectiveCheekSection:[40,8],cheekCantilever:25,cheekBendingNmm2:1600*25/(40*8**2/6),
      backplateSection:[40,10],backplateBendingNmm2:1600*25/(40*10**2/6),
      cheekDeflectionMM:1600*25**3/(3*190000*(40*8**3/12)),
      maximumFrameConnectionMovementMM:1,
      method:'Lower onto both metal bearing lands, then use the75mm driver from the east to close both8mm pins and draw the opposed metal hard seats tight. The open2mm fit is not a pitch restraint. Closed play≤0.1mm and elastic contact movement≤0.1mm act over16mm; each receiver independently carries25Nm moment,156.96N vertical and100N horizontal. A positive witness is required before the second hand releases. One rear grip remains bearing during each closure.'},
    floor:{maximumOverturningNm:100*1.25+156.96*.095,anchorRowsMM:300,anchorCount:4,eachTensionN:1000,eachShearN:500,
      scope:'This is an anchored receiver, never a freestanding table. Locate every anchor inside the registered400×650 footprint and qualify the actual floor/core. No filled-frame relocation is authorised.'}};
}

function moves(c){
  const mid=(c.ends[0]+c.ends[1])/2,initial=c.id==='U0'?[10775,3025]:[10875,3175];
  const state=(axis,body,z=c.bottom+85,shoulder=1450,grip='front')=>({d:[axis[0]-c.x,axis[1]-mid,z-c.bottom],body,shoulder,grip});
  const s=[state([c.x,mid],initial,c.bottom),state([c.x,mid],initial),
    state([10700,mid],[initial[0]+10700-c.x,initial[1]]),
    state([10700,3200],[10160,3200]),
    state([10700,3200],[10160,3200],1225),
    state([9400,3200],[8860,3200],1225),
    state([9400,3200],[10000,3200],1225,1450,'rear'),
    state([8200,3200],[8725,3200],1225,1450,'rear'),
    state([8200,3200],[8725,3200],900,1000,'rear')];
  return s;
}

export function stationHandlingStudy(model,station,modules,fixedPaths){
  const room=stationRoomBoxes(model),support=stationSupportGeometry(station);
  const receiver=[8000,2875,0,400,650,1200],results=[];
  const withdrawal=[[8860,3200],[8830,3830]],primaryPark=withdrawal.at(-1);
  const withdrawalGaps=Object.entries({...room,receiver}).map(([id,b])=>({id,gapMM:
    segmentBoxDistance(xy(withdrawal[0]),xy(withdrawal[1]),[b[0],b[1],0,b[3],b[4],1])-300}));
  const helperCarry=[[10000,3200],[8725,3200]];
  const crewGap=pathSeparation(helperCarry.map(xy),[xy(primaryPark),xy(primaryPark)])-600;
  const allFixed=Object.fromEntries(support.flatMap(c=>[...c.reactionArms.flatMap(a=>[[a.id+' key',a.key],...a.path.slice(1).map((b,i)=>[a.id+i,lineBox(a.path[i],b,a.radius)])]),
    ...c.catches.flatMap(a=>[[a.id+' arm',lineBox(...a.arm,a.radius)],[a.id+' cage',a.cage]])]));
  for(const c of support){
    const p=modules.find(m=>m.id===c.id).route;
    const valve=[c.x-37,(c.ends[0]+c.ends[1])/2-82.5,c.crown-37,74,165,132];
    const baseBoxes=[...c.carrier.tabs,...c.carrier.members.map(m=>lineBox(m.a,m.b,m.radius)),valve];
    const yokeBoxes=c.carrier.yokeMembers.map(m=>lineBox(m.a,m.b,m.radius));
    const states=moves(c);let body=Infinity,object=Infinity,ownBody=Infinity,reach=0,handToValve=Infinity;
    let bodyWorst,objectWorst,ownWorst;
    for(let k=1;k<states.length;k++){
      const a=states[k-1],b=states[k],B=[xy(a.body),xy(b.body)];
      // Stage6 is a simultaneous handoff to the already positioned second
      // worker. It is not one body walking through the held cartridge.
      const handoff=a.grip!==b.grip;
      const members=[...c.carrier.members,...(b.grip==='rear'?c.carrier.yokeMembers:[])];
      for(const[id,box]of Object.entries({...room,receiver})){
        const flat=[box[0],box[1],0,box[3],box[4],1];
        const gap=(handoff?Math.min(...B.map(p=>segmentBoxDistance(p,p,flat))):segmentBoxDistance(B[0],B[1],flat))-300;
        if(gap<body){body=gap;bodyWorst={stage:k,id};}
      }
      const rel=[a.body.map((v,i)=>v-a.d[i]),b.body.map((v,i)=>v-b.d[i])].map(xy);
      const separation=path=>handoff?Math.min(...rel.map(v=>pathSeparation([v,v],path))):pathSeparation(rel,path);
      const tube=separation(p.path.map(xy))-300-37-p.hausdorffError;
      if(tube<ownBody){ownBody=tube;ownWorst={stage:k,id:'tube'};}
      for(const m of members){const gap=separation([xy(m.a),xy(m.b)])-300-m.radius;
        if(gap<ownBody){ownBody=gap;ownWorst={stage:k,id:m.id};}}
      for(const box of [valve,...c.carrier.tabs]){const flat=[box[0],box[1],0,box[3],box[4],1];const gap=(handoff?Math.min(...rel.map(v=>segmentBoxDistance(v,v,flat))):segmentBoxDistance(rel[0],rel[1],flat))-300;
        if(gap<ownBody){ownBody=gap;ownWorst={stage:k,id:'valve/tab'};}}
      for(const state of[a,b])for(const g of state.grip==='rear'?c.carrier.rearGrips:c.carrier.grips){const hand=g.map((v,i)=>v+state.d[i]),shoulder=[...state.body,state.shoulder];
        reach=Math.max(reach,Math.hypot(...hand.map((v,i)=>v-shoulder[i])));
        handToValve=Math.min(handToValve,pointBox(g,valve)-50);
      }
      for(const[id,box]of Object.entries(room)){
        const movedObstacle=swept(box,a.d.map(v=>-v),b.d.map(v=>-v));
        const gap=Math.min(...p.path.slice(1).map((v,i)=>segmentBoxDistance(p.path[i],v,movedObstacle)))-37-p.hausdorffError;
        if(gap<object){object=gap;objectWorst={stage:k,id,component:'tube'};}
        for(const [j,own]of baseBoxes.entries()){const g=boxGap(swept(own,a.d,b.d),box);if(g<object){object=g;objectWorst={stage:k,id,component:j};}}
        if(b.grip==='rear')for(const own of yokeBoxes){const start=handoff?[a.d[0]+65,a.d[1],a.d[2]]:a.d;
          const g=boxGap(swept(own,start,b.d),box);if(g<object){object=g;objectWorst={stage:k,id,component:'handoff yoke'};}}
      }
    }
    // The full receiver steel is below1200 during approach; lowest finite
    // union face stays1225 until the final lowering. Capsule round end caps
    // are not substituted for the actual flat union axial face.
    const noncontact=[];
    const allOwn=[...baseBoxes,...p.path.slice(1).map((v,i)=>lineBox(p.path[i],v,37+p.hausdorffError))];
    const lo=[0,1,2].map(i=>Math.min(...allOwn.map(b=>b[i]))),hi=[0,1,2].map(i=>Math.max(...allOwn.map(b=>b[i]+b[i+3])));
    const bundle=[...lo,...hi.map((v,i)=>v-lo[i])];
    const retained={...allFixed};
    for(const[id,r]of Object.entries(fixedPaths))for(let i=1;i<r.path.length;i++){
      const box=lineBox(r.path[i-1],r.path[i],37+r.hausdorffError);
      const top=Math.max(...r.path.map(p=>p[2]));box[5]=Math.min(box[2]+box[5],top)-box[2];
      retained['fixed '+id+i]=box;
    }
    // Other cartridges stay fitted for a branch removal. Both have already
    // left before I0. Their carriers are service tools and are not installed.
    for(const other of modules)if(other.id!==c.id&&c.id!=='I0'){
      retained[other.id+' valve']=[other.x-37,(other.ends[0]+other.ends[1])/2-82.5,other.crown-37,74,165,132];
      for(let i=1;i<other.route.path.length;i++)retained[other.id+' tube'+i]=lineBox(other.route.path[i-1],other.route.path[i],37+other.route.hausdorffError);
    }
    for(let k=2;k<states.length;k++){
      const a=states[k-1],b=states[k];
      for(const[id,box]of Object.entries(retained)){
        if(boxGap(swept(bundle,a.d,b.d),box)>50)continue;
        const sweptObstacle=swept(box,a.d.map(x=>-x),b.d.map(x=>-x));
        let gap=Math.min(...p.path.slice(1).map((v,i)=>segmentBoxDistance(p.path[i],v,sweptObstacle)))-37-p.hausdorffError;
        for(const own of baseBoxes)gap=Math.min(gap,boxGap(swept(own,a.d,b.d),box));
        noncontact.push({stage:k,id,gapMM:gap});
      }
    }
    const fixedSweep=noncontact.sort((a,b)=>a.gapMM-b.gapMM).slice(0,6);
    const fixedPostGaps=c.catches.map(a=>({id:a.id,tubeGap:Math.min(...p.path.slice(1).map((v,i)=>segmentBoxDistance(p.path[i],v,a.cage)))-37-p.hausdorffError}));
    results.push({id:c.id,states,firstRest:firstRestStudy(c,p,states),nativeControls:nativeToolStudy(c,p,room,allFixed,fixedPaths,modules),bodyGapLowerMM:body,bodyWorst,objectRoomGapLowerMM:object,objectWorst,
      movingBodyGapLowerMM:ownBody,ownWorst,maximumGripReachMM:reach,handToOwnValveMM:handToValve,
      receiverPrelandingVerticalGapMM:25,stationCatchSeparationAfterLiftMM:85-25,
      fixedSweep,farFixedScreen:'Complete moving bundle AABB gaps above50mm are safely screened before exact finite component comparisons.',fixedPostGaps,firstRestLowestUnionFace:900,firstRestCarrierBearing:1065,
      movingCore:'FullR37 remote obstacle bound; exact flat union axial face is used only at its own mating seat and receiver. The matched union stroke is an explicit interface contract.'});
  }
  const section=[30,20,3],I=(30*20**3-24*14**3)/12,W=I/10,E=190000,proof=150;
  const load=8*9.81*2,arm=300,moment=load*arm,tau=50000/(2*27*17*3),combined=(moment+50000)/W;
  return {status:'REFERENCE_CAPTURE_AND_TRANSFER',support,roomSources:['groundWalls','groundFurniture','fixedObstacles.GROUND','plantReferenceDoor.fullyOpenEastLeaf','court plus envelope'],results,
    handoff:{moduleAxis:[9400,3200],primary:[8860,3200],secondary:[10000,3200],withdrawal,primaryPark,
      minimumWithdrawalBodyMM:Math.min(...withdrawalGaps.map(x=>x.gapMM)),withdrawalGaps:withdrawalGaps.sort((a,b)=>a.gapMM-b.gapMM).slice(0,6),
      minimumSubsequentCrewSeparationMM:crewGap,
      secondaryApproach:[[10545,4250],[10570,3970],[10545,3850],[10545,3200],[10000,3200]],
      method:'The helper waits in the already checked plant work position during release. Once the primary holds the cartridge at the finished doorway, the helper follows the corrected ordinary plant path to the rear grips. Both bear before the primary releases; primary then withdraws to8830/3830 before the helper moves west. The protected cross door remains closed; no worker passes it.'},
    receiver:{box:receiver,bodyStaging:[8725,3200],frameTop:850,bearing:1065,highestKeeper:1115,architecturalReservationTop:1200,
      loadPath:'Carrier rear tabs enter two indexed open-front guide columns, bear at1065 and receive two independent positive keepers before either hand releases. Legs/unions remain above the850 frame; the pressure mouths are not supports. Main/branch tab locations use separate keyed index positions within the400×650 footprint.',
      staging:'One cartridge occupies this anchored first-rest field at a time. Onward restrained bench transfer must be completed and the empty receiver verified before another cartridge follows; this packet does not authorise unbolting or carrying an occupied frame. I0 work therefore requires both branch cartridges transferred onward first. No frame is parked in the plant lobby or its ordinary route.'},
    forceCase:{maximumCompleteDryKg:8,verticalDynamicFactor:2,eachIndependentCatchN:load,maximumCantileverMM:arm,sectionMM:section,
      secondMomentMM4:I,sectionModulusMM3:W,minimumModulusNmm2:E,minimumProofStressNmm2:proof,
      bendingStressNmm2:moment/W,combinedReactionBendingNmm2:combined,torsionalShearNmm2:tau,vonMisesNmm2:Math.hypot(combined,Math.sqrt(3)*tau),comparisonAllowableNmm2:proof/1.5,tipDeflectionMM:load*arm**3/(3*E*I),
      eachGripRequirementN:load,eachKeeperHorizontalN:100,eachStationReactionTorqueNm:50,
      anchorMomentNm:moment/1000+50,
      carrier:{section:[20,20,2],controlBore:10,netSecondMomentMM4:(20**4-16**4)/12-2*10*2*9**2,
        maximumCantileverMM:200,netBendingStressNmm2:load*200/(((20**4-16**4)/12-2*10*2*9**2)/10),
        strut:[12,20],strutCentreXOffset:21,bareTubeGapMM:4,maximumStrutMomentNm:load*.2,
        strutBendingNmm2:load*200/(20*12**2/6),
        contact:'The strut end enters a positive welded shoe lug withinR35 and overlaps its lower outer shell; no detached tangent weld or pressure-tube clamp friction is credited. Actual matched copper contact and joint execution remain qualification duties.'},
      yoke:{section:[16,16,2],maximumOverhangMM:165,eachArmLoadN:load,horizontalLoadN:100,
        resultantBendingNmm2:Math.hypot(load,100)*165/(((16**4-12**4)/12)/8),pinDiameter:8,embedment:65},
      scope:'Both catches, the complete carrier, both grips and each guide/keeper must independently sustain the bounded load case. Actual welds, torsion, saddle contact, native mass/CG, anchor/core and returned leak/pressure performance remain component/installation qualification; the calculation supplies a force demand, not a catalogue rating.'},
    sequence:['Prove the appropriate upstream cut and local zero pressure; drain controlled inventory. Close dependent terminal cuts and keep the charged-vessel safety connection intact.',
      'Remove the locally declared insulation, fit the closed metal carrier and positively engage both independent wall catches. Lower-body reaction keys remain connected to the wall rails.',
      'Back off both captive nuts completely with the checked sectors while the two catches bear. Account for the full60mm backoff; do not load an unsupported pressure tube.',
      'Take both qualified front grips. Withdraw the catch keepers only after a witnessed load transfer; lift85 to25mm complete flat-seat separation and60mm tab/cage separation.',
      'Carry west to the doorway handoff. The second worker approaches from the plant after the first has cleared the lobby, takes both rear grips and positively bears the module before the first lets go. The first withdraws to8830/3830 clear of the WC, court and closed protected-cross door; only then does the second carry west and lower onto the receiver.',
      'Close both independent receiver keepers before releasing hands. Reverse the controlled sequence for return, restore insulation and test before normal water service.'],
    unclosed:['Selected union full mating shape, nut backoff and lower-flat reaction fit must meet the authored envelope;60mm catalogue body length alone does not prove60mm disengagement.',
      'Native carrier saddles/keeper fit, maximum mass/CG, hand rating, wall-core anchors, pipe-support contacts and first-rest steel/retention need the specified matched-component qualification; the authored native sections, strokes, hard seats and control paths are already explicit.']};
}
