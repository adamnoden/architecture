/** The lobby station is a located assembly, with distinct main/branch cuts.
 * Nominal dimensions and strength inputs are a reference design contract. */
import {finiteBends,exactSegmentBoxDistance as segmentBoxDistance} from './incoming-water-geometry.mjs';
import {pathSeparation,segmentBodyDistance} from './service-interface-geometry.mjs';
import {stationSupportGeometry,stationHandlingStudy} from './incoming-water-station-handling.mjs';

export const inletStation={
  entry:[12090,2800,600],tee:[11315,3175,900],pipeR:37,bendR:75,
  cartridges:[
    {id:'I0',x:11450,ends:[3075,3520],bottom:1440,crown:1690,body:[10875,3175],shoulder:1450,hand:[11380,3297.5,1805],sectors:[[115,175],[185,245]]},
    {id:'U0',x:11315,ends:[2732,3057],bottom:1140,crown:1390,body:[10875,3175],shoulder:1450,hand:[11315,2954.5,1505],sectors:[[120,180],[180,240]],toolBodies:[[10775,3025],[10875,3175]]},
    {id:'P0',x:11315,ends:[3175,3500],bottom:1140,crown:1390,body:[10875,3175],shoulder:1450,hand:[11255,3337.5,1505],sectors:[[120,180],[180,240]],toolBodies:[[10875,3175],[10545,3325]]}
  ],
  fixedVertices:{
    entry:[[12090,2800,600],[11450,2800,600],[11450,3075,600],[11450,3075,1440]],
    mainOut:[[11450,3520,1440],[11450,3520,700],[11315,3520,700],[11315,3175,700],[11315,3175,900]],
    utilityIn:[[11315,3175,900],[11315,3057,900],[11315,3057,1140]],
    plantIn:[[11315,3175,900],[11315,3175,1140]],
    utilityOut:[[11315,2732,1140],[11315,2732,900],[11505,2732,900],[11505,2882,900],[11505,2882,1000]],
    plantOut:[[11315,3500,1140],[11315,3500,900],[11075,3500,900],[11075,3970,900],[11075,3970,1040]]
  },
  pans:{south:[11200,2675,0,350,450,75],north:[11200,3125,0,350,450,75]},
  ordinaryBody:[[8800,3200],[10545,3200],[10875,3175]],
  utilityEntry:[[10545,3200],[10775,3000],[10775,2300],[10925,1725]],
  drains:[
    {id:'D0',source:'B0–I0',tee:[11450,2925,600],x:11370,y:2925,pan:'south'},
    {id:'D1',source:'I0–branches',tee:[11315,3300,700],x:11230,y:3300,pan:'north'},
    {id:'DU',source:'U0 downstream',tee:[11315,2732,1050],x:11230,y:2732,pan:'south'},
    {id:'DP',source:'P0 downstream',tee:[11315,3500,1050],x:11230,y:3400,pan:'north'}
  ]
};
export const coldRiserVertices=[[11505,2882,1000],[11505,2882,2725],[11315,2882,2725],[11315,2323,2725],
  [11505,2199.2,2725],[11505,600,2725],[10760,600,2725],[10760,1250,2725],[10760,1250,1000]];
const route=v=>v.length===2?{path:v,hausdorffError:0,bends:[]}:finiteBends(v,75);
const pathBoxGap=(p,box,r)=>Math.min(...p.path.slice(1).map((b,i)=>segmentBoxDistance(p.path[i],b,box)))-r-p.hausdorffError;
const pointBox=(p,b)=>Math.hypot(...p.map((v,i)=>Math.max(b[i]-v,v-b[i]-b[i+3],0)));
const bodyRoute=(p,centres,radius=300)=>Math.min(...centres.slice(1).flatMap((b,i)=>p.path.slice(1).map((d,j)=>
  // The body translates in plan; these station tubes are below the2000 top.
  pathSeparation([[...centres[i],0],[...b,0]],[[...p.path[j].slice(0,2),0],[...d.slice(0,2),0]])-radius-37-p.hausdorffError)));
function toolBox(a,b,box){
  const plan=segmentBoxDistance([a[0],a[1],0],[b[0],b[1],0],[box[0],box[1],0,box[3],box[4],1])-35.75;
  const z=Math.max(box[2]-a[2]-6.4,a[2]-6.4-box[2]-box[5],0);
  return Math.hypot(Math.max(plan,0),z);
}
function wallBoxes(model){
  const boxes={east:[model.shell-model.envelope,0,0,300,12000,3500]};
  for(const id of ['utility-north','plant-intermediate-arch']){
    const w=model.groundWalls.find(x=>x.id===id),[lo,hi]=w.finishedFaces,[a,b]=w.holes[0];
    boxes[id+' west']=[w.a[0],lo-18,0,a+45-w.a[0],hi-lo+36,2000];
    boxes[id+' east']=[b-45,lo-18,0,w.b[0]-(b-45),hi-lo+36,2000];
  }
  const l=model.plantReferenceDoor.fullyOpenEastLeaf;
  boxes.openLeaf=[...l.slice(0,2),0,...l.slice(2),2300];
  return boxes;
}

export function stationStudy(model,base,grid){
  const r=37,s=inletStation,walls=wallBoxes(model);
  const paths=Object.fromEntries(Object.entries(s.fixedVertices).map(([id,v])=>[id,id==='mainOut'?finiteBends(v,50):route(v)]));
  const modules=s.cartridges.map(c=>({...c,route:finiteBends([[c.x,c.ends[0],c.bottom],[c.x,c.ends[0],c.crown],
    [c.x,c.ends[1],c.crown],[c.x,c.ends[1],c.bottom]],75)}));
  const all={...paths,...Object.fromEntries(modules.map(c=>[c.id,c.route]))};
  const heat=base.heat.emitterSchedule.filter(e=>['utility-E','plant-N'].includes(e.id)).map(e=>({id:e.id,
    path:[...e.pressurePairBranchPlan.map(p=>[...p,e.upperBranchAxisLocal]),[...e.pressurePairBranchPlan.at(-1),0]]}));
  const heatClearances=Object.entries(all).flatMap(([id,p])=>heat.map(h=>({id,heat:h.id,gapMM:pathSeparation(p.path,h.path)-r-84-p.hausdorffError}))).sort((a,b)=>a.gapMM-b.gapMM);
  const valves=modules.map(c=>({id:c.id,box:[c.x-37,(c.ends[0]+c.ends[1])/2-82.5,c.crown-37,74,165,132],
    axis:[c.x,(c.ends[0]+c.ends[1])/2,c.crown]}));
  const unionBoxes=modules.flatMap(c=>c.ends.map((y,end)=>({id:c.id,end,box:[c.x-37,y-37,c.bottom,74,74,60]})));
  const supports=stationSupportGeometry(s),lineBox=(a,b,r)=>[...a.map((v,i)=>Math.min(v,b[i])-r),...a.map((v,i)=>Math.abs(v-b[i])+2*r)];
  const supportBoxes=supports.flatMap(c=>[...c.reactionArms.flatMap(a=>[a.key,...a.path.slice(1).map((b,i)=>lineBox(a.path[i],b,15))]),
    ...c.catches.flatMap(a=>[a.cage,lineBox(...a.arm,15)])]);
  const fixedPipeBoxes=Object.entries(paths).flatMap(([id,p])=>p.path.slice(1).map((b,i)=>{
    const box=lineBox(p.path[i],b,37+p.hausdorffError),top=Math.max(...s.fixedVertices[id].map(v=>v[2]));
    // The six fixed union ends have flat axial bounds. R37 remains radial;
    // a spherical cap beyond a known mating face would invent solid metal.
    box[5]=Math.min(box[2]+box[5],top)-box[2];return box;
  }));
  const drains=s.drains.map(d=>{
    const valveZ=d.id==='D0'?350:d.id==='D1'?450:700;
    const path=finiteBends([d.tee,[d.x,d.y,d.tee[2]],[d.x,d.y,200]],25);
    const body=d.id==='DU'?[10775,3025]:d.id==='DP'?[10545,3325]:[10875,3175];
    const shoulder=[...body,d.id==='D0'||d.id==='D1'?500:800],hand=[d.x-85,d.y,valveZ];
    const box=[d.x-25,d.y-25,valveZ-40,50,50,80];
    const obstacles=[...Object.values(walls),...supportBoxes,...valves.map(v=>v.box),...fixedPipeBoxes];
    return {...d,vertices:[d.tee,[d.x,d.y,d.tee[2]],[d.x,d.y,200]],completePipeR:15,bendRadius:25,
      bodyBox:box,wheelCentre:[d.x-50,d.y,valveZ],hand,shoulder,body,
      reachMM:Math.hypot(...hand.map((v,i)=>v-shoulder[i])),
      minimumHandMM:Math.min(...obstacles.map(b=>pointBox(hand,b)-40)),
      minimumArmMM:Math.min(...obstacles.map(b=>segmentBoxDistance(shoulder,hand,b)-40)),
      spout:[d.x,d.y,200],receiver:s.pans[d.pan],airGapMM:200-s.pans[d.pan][5],
      pathLengthMM:path.path.slice(1).reduce((n,b,i)=>n+Math.hypot(...b.map((v,j)=>v-path.path[i][j])),0),
      controlledFlowLitresMinute:2,maximumBatchLitres:5};
  });
  const toolPenalty=297*.25*Math.PI/360,toolChecks=[];
  for(const c of modules)for(const[end,y]of c.ends.entries()){
    const body=c.toolBodies?.[end]??c.body,shoulder=[...body,c.id==='I0'?1450:1050],z=c.bottom+50;
    let object=Infinity,hand=Infinity,arm=Infinity,reach=0;
    const allowed=c.id==='I0'?['I0']:modules.map(m=>m.id);
    // U0 and P0 are removed before I0. Their fixed union seats remain.
    const obstacles={...walls,...Object.fromEntries(unionBoxes.filter(b=>!(b.id===c.id&&b.end===end)).map((b,i)=>['union'+i,b.box])),
      ...Object.fromEntries(valves.filter(v=>allowed.includes(v.id)).map(v=>[v.id+' valve',v.box])),
      ...Object.fromEntries(supportBoxes.map((b,i)=>['support'+i,b])),
      ...Object.fromEntries(fixedPipeBoxes.filter(b=>b[2]+b[5]>=z-150&&b[2]<=z+150).map((b,i)=>['fixed pipe'+i,b])),
      ...Object.fromEntries(supports.find(x=>x.id===c.id).carrier.members.map((m,i)=>['carrier'+i,lineBox(m.a,m.b,m.radius)]))};
    for(let angle=c.sectors[end][0];angle<=c.sectors[end][1]+1e-8;angle+=.25){
      const a=angle*Math.PI/180,p=[c.x,y,z],tip=[c.x+297*Math.cos(a),y+297*Math.sin(a),z];
      reach=Math.max(reach,Math.hypot(...tip.map((v,i)=>v-shoulder[i])));
      for(const b of Object.values(obstacles)){
        object=Math.min(object,toolBox(p,tip,b));
        hand=Math.min(hand,pointBox(tip,b)-50);
        arm=Math.min(arm,segmentBoxDistance(shoulder,tip,b)-40);
      }
      // The corrected cold riser is a full-height independent obstacle.
      object=Math.min(object,segmentBodyDistance(p,tip,[11505,2882],[900,2725],37)-35.75);
      hand=Math.min(hand,segmentBodyDistance(tip,tip,[11505,2882],[900,2725],37)-50);
      arm=Math.min(arm,segmentBodyDistance(shoulder,tip,[11505,2882],[900,2725],37)-40);
    }
    toolChecks.push({id:c.id,end,body,shoulder,sector:c.sectors[end],toolGapLowerMM:object-toolPenalty,
      handGapLowerMM:hand-toolPenalty,armGapLowerMM:arm-toolPenalty,maxReachUpperMM:reach+toolPenalty});
  }
  const controls=modules.map(c=>{
    const shoulder=[...c.body,c.shoulder],others=modules.filter(x=>x.id!==c.id);
    return {id:c.id,body:c.body,shoulder,hand:c.hand,reachMM:Math.hypot(...c.hand.map((v,i)=>v-shoulder[i])),
      otherPipeGapMM:Math.min(...others.map(x=>pathSeparation([shoulder,c.hand],x.route.path)-40-r-x.route.hausdorffError)),
      otherValveGapMM:Math.min(...valves.filter(v=>v.id!==c.id).map(v=>segmentBoxDistance(shoulder,c.hand,v.box)-40)),
      riserGapMM:segmentBodyDistance(shoulder,c.hand,[11505,2882],[900,2725],37)-40};
  });
  const bodies=[...modules.map(c=>c.body),...toolChecks.map(c=>c.body)];
  const bodyChecks=bodies.map((p,i)=>({i,p,gapMM:Math.min(...Object.values(walls).map(b=>pointBox([...p,1000],b)-300),
    ...Object.values(s.pans).map(b=>pointBox([...p,Math.min(37.5,b[5]/2)],b)-300))}));
  const P17=grid.heads.find(h=>h.id==='P17');
  return {status:'REFERENCE_ASSEMBLY',geometry:s,
    finiteRoutes:Object.fromEntries(Object.entries(all).map(([id,p])=>[id,{bends:p.bends,hausdorffErrorMM:p.hausdorffError}])),
    moduleContracts:modules.map(c=>({id:c.id,unionMadeZ:[c.bottom,c.bottom+60],crown:c.crown,
      straightAxisMM:c.ends[1]-c.ends[0]-150,valveFaceLength:55,maxAdaptorsEach:55,completeFittedModuleMM:165,
      moduleSpareMM:c.ends[1]-c.ends[0]-150-165,nutBackoffMM:60,backoffToBendMM:c.crown-75-(c.bottom+120),liftMM:85,
      fullSeatSeparationAfterLiftMM:25,maximumDryHandledKg:8,
      release:'Both upward-facing captive nuts back completely clear while two independent catches carry the cartridge. Lift85, translate west with the worker keeping a declared body gap, and lower into a separate restrained receiving cradle. I0 replacement follows removal of U0 and P0, with B0 closed and proved.'})),
    controls,handling:stationHandlingStudy(model,s,modules,paths),tool:{length:297,width:71.5,thickness:12.8,headR:35.75,handR:50,armR:40,stepDeg:.25,penaltyMM:toolPenalty,checks:toolChecks},
    heatClearances:heatClearances.slice(0,6),ordinaryBodyMinimumMM:Math.min(...Object.values(all).map(p=>bodyRoute(p,s.ordinaryBody))),
    bodyChecks,mainPanToBodyMM:11200-(10875+300),
    drain:{definitions:drains,requiredNetLitresEach:8,externalCuboidUpperLitresEach:.35*.45*.075*1000,
      emptyPanTiltHeightMM:Math.hypot(450,75),pipeUndersideMM:600-37,
      maximumBatchLitres:5,fillFreeboardLitres:3,
      retainedLowPockets:'DU/DP cut above their retained900mm low routing. That lower pocket is kept sealed/capped during cartridge work; the controlled drain is not a claim that every low tube is empty. Full removal requires the low-point spool released directly over a receiver after pressure proof. D0 reaches the600mm source low leg; D1 reaches the700mm common-return low leg.',
      method:'Each capped small branch has its own manually controlled drain and downward metallic spout atZ200 above its named receiver. Close/verify the upstream cut, vent and drain in≤5L batches, closing before emptying; an unknown site-pipe inventory is not assumed to fit one pan. Do not open a union under pressure.',
      plantCondition:'Empty and prove the domestic vessel/connected inventory through its dedicated admitted drain before cold-bridge or plant-stop intervention. B0/P0 closure alone is not a300L drain result; relief remains connected whenever charged.',
      scope:'Pans are removable controlled-maintenance receivers and visible drip witnesses. No unattended30L/min burst, automatic shutoff, floor waterproofing or safe electrical wetting is credited.'},
    entry:{point:s.entry,formedBore:100,completePipeOD:74,radialBudget:13,settingBudget:2,
      rawUtilityWindowLigamentMM:2800-2300-50,rawPlantDoorLigamentMM:3900-2800-50,
      protectedRiserRadius:100,P17:structuredClone(P17),riserToCapPlanMM:Math.abs(s.entry[1]-P17.xy[1])-P17.capXY[1]/2-100,
      boundary:'B0 is independent owner-side isolation in the Boundary Service Lodge; provider location, frost, flood level, movement and lawful site route remain DPL/MAT conditions. This relocates the physical water entry, not a ventilation inlet.'},
    support:'All six fixed union ends use independent keyed collar/reaction supports from the solid east pier, not the radiator, sleeves, removable pans or pipe below another union. Nominal30×20×3 comparison arms join shaped keys continuously to the retained wall rail; the main arm is raised15mm and its north approach shifted25mm to clear P0 transport; complete anchors and rail sections must satisfy the bounded force case and changed STR interface.',
    functionalCuts:[
      {work:'Utility head cold branch',cuts:['U0'],residual:'Cold backbone and lower branch; drain in the utility10L receiver, never the2L witness alone.'},
      {work:'Utility head hot branch',cuts:['H0'],residual:'Lower hot drop and captured head tails; store remains separated upstream.'},
      {work:'Plant/cold bridge',cuts:['P0'],residual:'Connected vessel and safety system must first be made cold, empty and unpressurised through the dedicated store method.'},
      {work:'U0 or P0 cartridge',cuts:['I0'],residual:'Close downstream terminal cuts, discharge local inventory and positively verify both faces. A failed I0 requiresB0.'},
      {work:'I0 or any joint before I0',cuts:['B0'],residual:'Verify boundary closure, drain both sides in controlled batches and remove branch cartridges before I0 tools/capture.'},
      {work:'Boundary B0 itself',cuts:['provider upstream isolation'],residual:'Undertaker/site-specific service method; the house I0 cannot isolate the boundary stop upstream.'}
    ]};
}
