import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceRoot = process.env.WORKABLE_SOURCE_ROOT
  ? pathToFileURL(resolve(process.env.WORKABLE_SOURCE_ROOT) + '/')
  : new URL('../../../', import.meta.url);
const housePath = 'project/had/studies/current-house.mjs';
const { deriveCurrentHouse } = await import(new URL(housePath, sourceRoot));
const house = deriveCurrentHouse();
const model = house.model;
const bathingPath='project/ias/studies/three-bathing-sections.json';
const stairPath='project/ias/studies/stair-rail-renewal.json';
const nativeBathing=JSON.parse(readFileSync(new URL(bathingPath,sourceRoot)));
const nativeStair=JSON.parse(readFileSync(new URL(stairPath,sourceRoot)));
const wall = id => {
  const result = model.groundWalls.find(item => item.id === id);
  assert(result, 'Missing selected Study wall: ' + id);
  return result;
};
const outer = model.envelope;
const north = wall('study-L-north');
const cloak = wall('cloak-south');
const step = wall('study-cloak-north');
const bands = [
  [outer, outer, wall('study-east').finishedFaces[0], cloak.finishedFaces[0]],
  [outer, cloak.finishedFaces[0], wall('cloak-west').finishedFaces[0], step.finishedFaces[0]],
  [outer, step.finishedFaces[0], wall('study-L-return').finishedFaces[0], north.finishedFaces[0]]
];
const occupied = Object.entries(model.groundFurniture)
  .filter(([id]) => id === 'study-desk' || id === 'study-chair' || id === 'service-emitter-study-W')
  .map(([id, [x, y, w, h]]) => [id, [x, y, x+w, y+h]]);
assert.equal(occupied.length, 3);
const door = model.protectedRoute.doors.find(item => item.id === 'STUDY');
assert.deepEqual(door.rough, north.holes[0]);
const studyWindows = model.archOpeningRegister.GROUND.filter(item =>
  (item.wall === 'outer-south' && item.centre < bands[0][2])
  || (item.wall === 'outer-west' && item.centre < bands[2][3]));
assert.equal(studyWindows.length, 3);
const intersection = ([x0,y0,x1,y1], [a0,b0,a1,b1]) =>
  [Math.max(x0,a0), Math.max(y0,b0), Math.min(x1,a1), Math.min(y1,b1)];
const area = ([x0,y0,x1,y1]) => Math.max(0,x1-x0)*Math.max(0,y1-y0);
const sameGridOrigin = [500,500];

function tileField(pitch, [originX,originY], roomBands=bands, roomItems=occupied) {
  const cells = [];
  const bounds = [
    Math.min(...roomBands.map(b=>b[0])),Math.min(...roomBands.map(b=>b[1])),
    Math.max(...roomBands.map(b=>b[2])),Math.max(...roomBands.map(b=>b[3]))
  ];
  for(let x=originX+Math.floor((bounds[0]-originX)/pitch)*pitch; x<bounds[2]; x+=pitch){
    for(let y=originY+Math.floor((bounds[1]-originY)/pitch)*pitch; y<bounds[3]; y+=pitch){
      const box=[x,y,x+pitch,y+pitch];
      const clipped=roomBands.map(band=>intersection(box,band)).filter(part=>area(part)>0);
      const coverage=clipped.reduce((sum,part)=>sum+area(part),0);
      if(!coverage)continue;
      const full=coverage===pitch**2;
      const fixedObstructions=roomItems.filter(([,item])=>area(intersection(box,item))>0).map(([id])=>id);
      cells.push({box,clipped,full,fixedObstructions});
    }
  }
  return cells;
}

// These authored densities are trial values for mass comparison only.
const materials = [
  {name:'20 mm oak wear surface only', massPerSquareMetre:14},
  {name:'15 mm stone wear surface only', massPerSquareMetre:40.5},
  {name:'12 mm stone + 3 mm steel skin only', massPerSquareMetre:55.95}
];
const options = [300,400,450,600].map(pitch=>{
  const cells=tileField(pitch,sameGridOrigin);
  const whole=cells.filter(cell=>cell.full);
  return { pitch, whole:whole.length, unobstructed:whole.filter(cell=>!cell.fixedObstructions.length).length,
    perimeterCutCells:cells.length-whole.length, massKG:materials.map(item=>Number((item.massPerSquareMetre*pitch**2/1e6).toFixed(2))) };
});
const faces=model.finishRewind.dry;
const firstFFL=model.sections.firstFFL;
const floor=model.sections.firstFloorRC;
const ground=model.sections.groundFloorRC;
const ceilingZ=3100;
assert.equal(firstFFL-floor.top,80);
assert.equal(floor.bottom-ceilingZ,70);
assert.equal(0-ground.top,180);
assert.equal(faces.total,27);
const finishTradeoffs = [
  {name:'Original direct mineral face',depthMM:27,projectionBeyondBaselineMM:0},
  {name:'18 mm timber + 7 mm point capture + 2 mm fit, replacing mineral finish',depthMM:27,projectionBeyondBaselineMM:0},
  {name:'Same timber + 7 mm point capture + 2 mm fit, retaining full plaster behind',depthMM:54,projectionBeyondBaselineMM:27}
];
const firstWall = id => {
  const result = model.upperWalls.find(item => item.id === id);
  assert(result, 'Missing selected bedroom wall: ' + id);
  return result;
};
function boundsOf([x,y,w,h]) {
  return [x,y,x+w,y+h];
}
function itemsIn(bands, items) {
  return Object.entries(items).map(([name,item])=>[name,boundsOf(item)])
    .filter(([,item])=>bands.some(band=>area(intersection(band,item))>0));
}
const bedroomBands=[
  [outer,outer,firstWall('bed2-east').finishedFaces[0],firstWall('bed2-north-main').finishedFaces[0]],
  [outer,firstWall('bed2-north-main').finishedFaces[0],firstWall('bed2-L-return').finishedFaces[0],firstWall('bed2-L-north').finishedFaces[0]]
];
const linkedRooms=[
  {name:'Family room',bands:[boundsOf(model.rooms.living.bounds)],furniture:model.groundFurniture},
  {name:'Kitchen / dining',bands:[boundsOf(model.rooms.kitchenDining.bounds)],furniture:model.groundFurniture},
  {name:'Bedroom 2',bands:bedroomBands,furniture:model.upperFurniture}
].map(room=>{
  const fixed=itemsIn(room.bands,room.furniture);
  const all=tileField(400,sameGridOrigin,room.bands,fixed);
  const moduleSummary={
    areaM2:room.bands.reduce((sum,band)=>sum+area(band),0)/1e6,
    complete:all.filter(tile=>tile.full).length,
    clearInPlan:all.filter(tile=>tile.full&&!tile.fixedObstructions.length).length
  };
  return {name:room.name,bands:room.bands,fixed,all,moduleSummary};
});

const release = {
  lift:[3700,500,4100,900],firstRest:[4100,500,4500,900],
  assumedVerticalLiftMM:55,workerRadiusMM:300,stanceStart:[3300,765],stanceEnd:[3700,765],
  doorwayReachEvidence:'Prior Study close/reopen reaches 555.20 mm in a different task. This comparison makes no grip, load or reach admission.'
};
const eastBay=bands[0];
const movedBounds=[release.lift[0],release.lift[1],release.firstRest[2],release.lift[3]];
assert.equal(area(intersection(eastBay,movedBounds)),area(movedBounds));
const [startX,startY]=release.stanceStart,[endX,endY]=release.stanceEnd;
assert.equal(startY,endY);
const stanceBounds=[startX-release.workerRadiusMM,startY-release.workerRadiusMM,
  endX+release.workerRadiusMM,endY+release.workerRadiusMM];
assert.equal(area(intersection(eastBay,stanceBounds)),area(stanceBounds));
for(const [,box] of occupied){
  assert.equal(area(intersection(movedBounds,box)),0);
  assert.equal(area(intersection(stanceBounds,box)),0);
}
release.clearanceToFinishedWallsMM=Math.min(stanceBounds[1]-eastBay[1],eastBay[3]-stanceBounds[3]);
release.workerToTrailingTileEdgeMM=release.lift[0]-startX-release.workerRadiusMM;
release.trialReachToNearEdgeMidpointMM=Math.hypot(release.lift[0]-startX,(release.lift[1]+release.lift[3])/2-startY);
release.movingTileBodyGapMM=release.firstRest[0]-endX-release.workerRadiusMM;

const branchProbe={
  wet:{familyBath:model.upperFurniture['family-bath1700'],
    port:nativeBathing.family.fixture.newFloorPort,frontPanel:nativeBathing.family.fixture.upperFirstRelease.frontPanel,
    retainedHatch:nativeBathing.family.hatches.find(hatch=>hatch.clear[2]===450).clear},
  stair:{plan:model.stair,going:nativeStair.stair.going,rise:nativeStair.stair.rise,
    landingYZ:nativeStair.stair.landingYZ,firstUpperNoseYZ:nativeStair.stair.firstUpperNoseYZ,
    upperArrivalYZ:nativeStair.stair.upperArrivalYZ,betweenRails:nativeStair.stair.betweenRails}
};
const receipt = {
  status:'PRE-SITE ILLUSTRATED CONCEPT. No assembly selected or qualified.',
  source:{
    id:house.id, model:house.inputs['project/had/studies/water-replan.json'],
    retainedJunctionSHA256:Object.fromEntries([bathingPath,stairPath].map(path=>[path,createHash('sha256').update(readFileSync(new URL(path,sourceRoot))).digest('hex')])),
    compositorSHA256:createHash('sha256').update(readFileSync(new URL(housePath,sourceRoot))).digest('hex'),
    relevantGeometrySHA256:createHash('sha256').update(JSON.stringify({walls:model.groundWalls, upperWalls:model.upperWalls,
      furniture:model.groundFurniture, upperFurniture:model.upperFurniture, openings:model.archOpeningRegister, sections:model.sections})).digest('hex')
  },
  study:{bands,finishedAreaM2:bands.reduce((total,rectangle)=>total+area(rectangle),0)/1e6, occupied,
    door:{rough:door.rough,hinge:door.hinge,axis:door.axis,frameDepth:door.frameDepth, operatingBodyLowerBoundMM:model.studyDoorOperation.continuousBodyLowerBound}, windows:studyWindows.map(({id,wall,centre,width,sill,spring,head})=>({id,wall,centre,width,sill,spring,head}))},
  assemblies:{groundDepthAboveRC:0-ground.top,upperDepthAboveRC:firstFFL-floor.top,upperRC:floor.top-floor.bottom,
    upperDepthBelowRC:floor.bottom-ceilingZ,upperUndersideServiceMM:55,upperCeilingMM:15,finishTradeoffs,
    skirting:{heightMM:150,existingProjectionMM:18,serviceProjectionMM:45,coverMM:18,grossBehindCoverMM:27,boundary:'Concept only; independently supported cable and accessory assemblies. 27 mm includes supports, tolerances and clearances.'}},
  release,branchProbe,
  additionalFurnishedComparisons:linkedRooms.map(({name,bands,fixed,moduleSummary})=>({name,bands,fixed,moduleSummary})),
  moduleStudy:{origin:sameGridOrigin,materials,options,errorBoundary:'Plan overlap only. The Study door, grip/release, extra working zone, ramps, fasteners and cut-piece geometry are not checked for lifting. Stop modular fields at independent threshold. Mass excludes edge retention, grips, frame and bedding.'}
};

function renderStudy() {
  const scale=.145, offsetX=52, offsetY=557;
  const sx=x=>offsetX+(x-outer)*scale;
  const sy=y=>offsetY-(y-outer)*scale;
  const rectangle=([x0,y0,x1,y1],fill,stroke='none',width=1)=>'<rect x="'+sx(x0)+'" y="'+sy(y1)+'" width="'+(x1-x0)*scale+'" height="'+(y1-y0)*scale+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+width+'"/>';
  const line=(x1,y1,x2,y2,style='edge')=>'<line class="'+style+'" x1="'+sx(x1)+'" y1="'+sy(y1)+'" x2="'+sx(x2)+'" y2="'+sy(y2)+'"/>';
  const studyLabels=[
    ['Desk',655,565],['Chair',910,2375],['Radiator',665,1700]
  ];
  const optionRows=options.map(({pitch,whole,unobstructed,massKG},i)=>'<text class="chart" x="827" y="'+(240+i*40)+'">'+pitch+' mm</text><text class="chart" x="937" y="'+(240+i*40)+'">'+whole+'</text><text class="chart" x="1012" y="'+(240+i*40)+'">'+unobstructed+'</text><text class="chart" x="1110" y="'+(240+i*40)+'">'+massKG.join(' / ')+' kg</text>').join('');
  const cells = tileField(400,sameGridOrigin).flatMap(cell=>cell.clipped.map(part=>rectangle(part,
    !cell.full?'#e1daca':cell.fixedObstructions.length?'#d7c7ae':'#afbfad','#716353',0.65))).join('');
  const scene = occupied.map(([,box])=>rectangle(box,'#857058','#4c3b2d',1.3)).join('');
  const sequence=rectangle(release.lift,'none','#60412b',3)+rectangle(release.firstRest,'none','#60412b',3)
    +'<path d="M'+sx(3900)+' '+sy(700)+'H'+sx(4295)+'m-8 -5 8 5 -8 5" class="sweep"/>';
  const windowSegments=receipt.study.windows.map(({wall,centre,width})=>wall==='outer-west'
    ? line(outer,centre-width/2,outer,centre+width/2,'window')
    : line(centre-width/2,outer,centre+width/2,outer,'window')).join('');
  const doorOpening=line(door.rough[0],north.finishedFaces[0],door.rough[1],north.finishedFaces[0],'opening');
  const swingRadius=door.leaf[0]*scale;
  const [hx,hy]=door.hinge;
  const swing='<path d="M '+sx(hx+door.leaf[0])+' '+sy(hy)+' A '+swingRadius+' '+swingRadius+' 0 0 1 '+sx(hx)+' '+sy(hy-door.leaf[0])+'" class="sweep"/>';
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1460" height="640" viewBox="0 0 1460 640" role="img" aria-labelledby="title desc">',
    '<title id="title">Furnished Study floor grid and liftability comparison</title><desc id="desc">Plan with 400 millimetre floor modules and a table of other pitches. Green tiles clear furniture in plan only. The door swing and built furnishings remain shown.</desc>',
    '<style>.title{font:36px Georgia;fill:#332c27}.sub{font:17px Arial;fill:#59483a}.legend,.chart{font:18px Arial;fill:#322c25}.room{font:14px Arial;fill:#33291b}.window{stroke:#476d73;stroke-width:5}.opening{stroke:#dfab45;stroke-width:6}.sweep{stroke:#652d2f;stroke-width:1.6;stroke-dasharray:5 3;fill:none}.edge{stroke:#372b20;stroke-width:2}</style>',
    '<rect width="1460" height="640" fill="#f6f1e7"/><text class="title" x="52" y="56">Study · the workable floor</text><text class="sub" x="52" y="85">Furnished current-house plan · 400 mm grid · walls and furniture are source geometry</text>',
    cells,scene,sequence,windowSegments,doorOpening,swing,
    ...studyLabels.map(([label,x,y])=>'<text class="room" x="'+sx(x)+'" y="'+sy(y)+'">'+label+'</text>'),
    '<rect x="52" y="587" width="13" height="13" fill="#afbfad"/><text class="legend" x="73" y="600">Complete module clear of furniture in plan</text>',
    '<text class="legend" x="827" y="150">Change the pitch</text><text class="sub" x="827" y="178">Same origin at X500 / Y500, in all four trials.</text>',
    '<text class="sub" x="827" y="211">Pitch</text><text class="sub" x="927" y="211">Whole</text><text class="sub" x="997" y="211">Clear</text><text class="sub" x="1101" y="211">Oak / stone / stone + steel mass</text>',
    optionRows,
    '<text class="sub" x="827" y="438">These are wearing-piece masses. Retainers and frames add weight.</text>',
    '<text class="sub" x="827" y="466">Highlighted pair shows the straight Study lift/first-rest comparison.</text>',
    '<text class="sub" x="827" y="494">The permanent deck remains continuous under the lifted tile.</text>',
    '</svg>\n'
  ].join('');
}

function renderSections() {
  const q=(x,y,w,h,fill,stroke='#776351')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" stroke="'+stroke+'"/>';
  const text=(x,y,value,cls='body')=>'<text x="'+x+'" y="'+y+'" class="'+cls+'">'+value+'</text>';
  const firstFloor = [
    ['Existing above-RC family',80,'#d4bd90'],
    ['Structural deck',200,'#a2aaa2'],
    ['Under-slab services',55,'#b4c2b1'],
    ['Independent ceiling',15,'#dfd8c9']
  ];
  let y=196;
  const layerDraw=firstFloor.map(([name,depth,fill])=>{
    const part=q(60,y,183,depth*.76,fill)+text(261,y+depth*.38+5,name+' · '+depth+' mm');
    y+=depth*.76;
    return part;
  }).join('');
  const f0='<g>'+q(525,196,53,253,'#8c8e86')+q(578,196,21,253,'#ebd9b8')+q(599,394,157,55,'#b8a889')+q(599,378,157,16,'#a5774c')+q(599,346,14,32,'#8f5c39')+'</g>';
  const w1='<g>'+q(825,196,53,253,'#8c8e86')+q(878,196,6,253,'#c1ac8e')+q(884,196,15,253,'#af865c')+q(899,394,157,55,'#b8a889')+q(899,378,157,16,'#a5774c')+q(899,346,14,32,'#8f5c39')+'<path d="M884 236H906m-22 52h22m-22 53h22" fill="none" stroke="#6c493b"/></g>';
  const w2='<g>'+q(1125,196,53,253,'#8c8e86')+q(1178,196,6,150,'#c1ac8e')+q(1184,196,15,150,'#af865c')+q(1199,394,157,55,'#b8a889')+q(1199,378,157,16,'#a5774c')+q(1199,346,22,32,'#c2c8b8')+q(1221,346,14,32,'#8f5c39')+'<circle cx="1210" cy="360" r="4" fill="#8b4b2a"/><circle cx="1210" cy="370" r="3" fill="#8b4b2a"/><path d="M1237 360h38l-8-5m8 5-8 5" fill="none" stroke="#6c493b"/></g>';
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1460" height="635" viewBox="0 0 1460 635" role="img" aria-labelledby="title desc">',
    '<title id="title">Workable interiors · fit distinct layers</title><desc id="desc">First floor buildup and three alternative Study edges keep the floor and wall backgrounds independent of removable finishes.</desc>',
    '<style>.title{font:36px Georgia;fill:#332c27}.sub{font:17px Arial;fill:#59483a}.head{font:23px Georgia;fill:#30281e}.body{font:17px Arial;fill:#322c25}.small{font:14px Arial;fill:#55443a}</style>',
    '<rect width="1460" height="635" fill="#f6f1e7"/>',
    text(52,52,'Workable interiors · fit distinct layers','title'),text(52,82,'Pre-site concept sections. Dimensions in mm. Diagrams emphasise interfaces.','sub'),
    text(60,137,'Intermediate floor envelope','head'),text(60,170,'Z3450 finished floor to Z3100 ceiling','sub'),layerDraw,
    text(60,522,'350 mm gross · 0 mm unallocated','head'),text(60,551,'A liftable wearing piece replaces finish', 'small'),text(60,574,'over a continuous, independent deck.','small'),
    text(525,137,'W0 · quiet mineral wall','head'),text(525,170,'Conventional control','sub'),f0,
    text(825,137,'W1 · flush panel field','head'),text(825,170,'Capture carried by substrate','sub'),w1,
    text(1125,137,'W2 · local service spine','head'),text(1125,170,'Independently supported cable','sub'),w2,
    text(525,489,'27 mm complete retained face.','small'),text(525,514,'18 mm skirting with end-first release.','small'),
    text(825,489,'Trial 18 face + 7 capture + 2 fit.','small'),text(825,514,'Check that the substituted wall still','small'),text(825,539,'earns all required boundary duties.','small'),
    text(1125,489,'150-high, 45-projecting skirting.','small'),text(1125,514,'18 removable face; 27 gross behind.','small'),text(1125,539,'Separate accessory and cable supports.','small'),
    text(525,585,'Keep the protected Study reveal flush. The existing inside door sequence has 1.94 mm body reserve in the model.','sub'),
    '</svg>\n'
  ].join('');
}

function renderHousePlans() {
  const sheetScale=.043, y0=670;
  const levels=[
    {name:'Ground floor', key:'GROUND', walls:model.groundWalls, items:model.groundFurniture,
      cuts:[model.court,model.loggia.clear],
      trials:[
        ['Study',bands.map(([x0,y0,x1,y1])=>[x0,y0,x1-x0,y1-y0]),'#acb9a0'],
        ['Family room',[model.rooms.living.bounds],'#acb9a0'],
        ['Dining field',[model.rooms.kitchenDining.bounds],'#e5cb9d'],
        ['Utility service edge',[[9388,720,2160,1600]],'#c5b5a3'],
      ]},
    {name:'First floor', key:'FIRST', walls:model.upperWalls, items:model.upperFurniture,
      cuts:[model.court,model.void,model.stair],
      trials:[
        ['Bedroom 2',[[560,580,3890,1870]],'#acb9a0'],
        ['Bedroom 3',[[7430,580,4040,1870]],'#acb9a0'],
        ['Bedroom 4',[[3040,9080,4230,2340]],'#acb9a0'],
        ['Principal bedroom',[[7890,8630,3510,2780]],'#acb9a0'],
        ['Family bathroom',[[9400,3800,2150,2600]],'#adbdc2'],
        ['Principal bathroom',[[9400,6600,2160,1552.5]],'#adbdc2'],
        ['Rear wet room',[[429.5,8952.5,2376,2618]],'#adbdc2'],
      ]}
  ];
  function plan(level, originX){
    const sx=x=>originX+x*sheetScale,sy=y=>y0-y*sheetScale;
    const rect=([x,y,w,h],fill,stroke='none')=>'<rect x="'+sx(x)+'" y="'+sy(y+h)+'" width="'+w*sheetScale+'" height="'+h*sheetScale+'" fill="'+fill+'" stroke="'+stroke+'"/>';
    const line=(x1,y1,x2,y2,stroke,width)=>'<line x1="'+sx(x1)+'" x2="'+sx(x2)+'" y1="'+sy(y1)+'" y2="'+sy(y2)+'" stroke="'+stroke+'" stroke-width="'+width+'"/>';
    const sourceWalls=level.walls.flatMap(w=>{
      const vertical=w.a[0]===w.b[0];
      const axis=vertical?1:0;
      const start=Math.min(w.a[axis],w.b[axis]),end=Math.max(w.a[axis],w.b[axis]);
      const near=w.finishedFaces[0],far=w.finishedFaces[1];
      const holes=(w.holes??[]).map(([a,b])=>[Math.max(start,a),Math.min(end,b)]).filter(([a,b])=>a<b).sort((a,b)=>a[0]-b[0]);
      let cursor=start; const pieces=[];
      for(const [a,b] of [...holes,[end,end]]){
        if(a>cursor)pieces.push(vertical?[near,cursor,far-near,a-cursor]:[cursor,near,a-cursor,far-near]);
        cursor=Math.max(cursor,b);
      }
      return pieces.map(piece=>rect(piece,'#675d54'));
    }).join('');
    const openings=model.archOpeningRegister[level.key].filter(o=>o.wall.startsWith('outer')).map(o=>{
      const a=o.centre-o.width/2,b=o.centre+o.width/2;
      const color=o.kind==='door'?'#a76938':'#47808a';
      const high=model.shell-model.envelope/2,low=model.envelope/2;
      if(o.wall.endsWith('-south'))return line(a,low,b,low,color,4);
      if(o.wall.endsWith('-north'))return line(a,high,b,high,color,4);
      if(o.wall.endsWith('-west'))return line(low,a,low,b,color,4);
      return line(high,a,high,b,color,4);
    }).join('');
    const trials=level.trials.flatMap(([,rectangles,fill])=>rectangles.map(r=>rect(r,fill))).join('');
    return '<text class="head" x="'+originX+'" y="125">'+level.name+'</text>'
      +rect([0,0,model.shell,model.shell],'#776b5a')
      +rect([outer,outer,model.shell-2*outer,model.shell-2*outer],'#ebe1cf')
      +trials+level.cuts.map(cut=>rect(cut,'#f6f1e7','#978573')).join('')
      +sourceWalls+openings+Object.values(level.items).map(item=>rect(item,'#927c63')).join('')
      +level.trials.map(([name,rectangles])=>{
        const a=rectangles[0];
        return '<text class="label" x="'+sx(a[0]+a[2]/2)+'" y="'+sy(a[1]+a[3]*.82)+'">'+name+'</text>';
      }).join('');
  }
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" role="img" aria-labelledby="title desc">',
    '<title id="title">Where to test workable interior finishes</title><desc id="desc">Two plans show source walls, openings and furniture with highlighted trial areas.</desc>',
    '<style>.title{font:36px Georgia;fill:#332c27}.head{font:26px Georgia;fill:#332c27}.sub{font:16px Arial;fill:#59483a}.label{font:13px Arial;fill:#2a2119;text-anchor:middle;paint-order:stroke;stroke:#f6f1e7;stroke-width:3;stroke-linejoin:round}</style>',
    '<rect width="1200" height="800" fill="#f6f1e7"/><text class="title" x="47" y="53">Where to try the workable interior</text><text class="sub" x="47" y="82">Furnished current-house plans · local trial fields inside existing boundaries</text>',
    plan(levels[0],47),plan(levels[1],637),
    '<rect x="47" y="705" width="17" height="17" fill="#acb9a0"/><text class="sub" x="73" y="719">Dry finish-panel study</text>',
    '<rect x="320" y="705" width="17" height="17" fill="#e5cb9d"/><text class="sub" x="346" y="719">Kitchen/dining transition</text>',
    '<rect x="637" y="705" width="17" height="17" fill="#adbdc2"/><text class="sub" x="663" y="719">Wet boundary retained</text>',
    '<text class="sub" x="47" y="756">Study grid is dimensioned separately. Shaded families elsewhere are locations for detail, without geometric approval.</text>',
    '</svg>\n'
  ].join('');
}

function renderOccupiedWall() {
  const scale=.178;
  const rect=(x,y,w,h,fill,stroke='none')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" stroke="'+stroke+'"/>';
  const text=(x,y,value,cls='body')=>'<text x="'+x+'" y="'+y+'" class="'+cls+'">'+value+'</text>';
  const windows=studyWindows.filter(o=>o.wall==='outer-south');
  const southSpan=bands[0][2]-outer;
  const ceiling=3100;
  function elevation(x0,panels) {
    const bottom=694,px=x=>x0+(x-outer)*scale,pz=z=>bottom-z*scale;
    const face=panels?'#b89269':'#dfd4bb';
    const lines=[];
    if(panels){
      for(let x=outer+420;x<bands[0][2];x+=420)lines.push('<path d="M'+px(x)+' '+pz(160)+'V'+pz(3000)+'" class="panel"/>');
      for(const z of [150,700,2260,3000])lines.push('<path d="M'+x0+' '+pz(z)+'H'+px(bands[0][2])+'" class="panel"/>');
    }
    const arch=({centre,width,sill,spring,head})=>{
      const left=centre-width/2,right=centre+width/2,r=width**2/(8*(head-spring))+(head-spring)/2;
      return '<path d="M'+px(left)+' '+pz(sill)+' V'+pz(spring)+' A'+r*scale+' '+r*scale+' 0 0 1 '+px(right)+' '+pz(spring)+' V'+pz(sill)+' Z" fill="#b9cecc" stroke="#555347" stroke-width="3"/><path d="M'+px(centre)+' '+pz(sill)+' V'+pz(head-13)+' M'+px(left)+' '+pz(1500)+' H'+px(right)+'" stroke="#6b7569" stroke-width="2"/>';
    };
    const desk=occupied.find(([name])=>name==='study-desk')[1];
    const deskHeight=730;
    const deskTop=rect(px(desk[0]),pz(deskHeight),(desk[2]-desk[0])*scale,10,'#695039');
    const deskLegs=[desk[0]+105,desk[2]-140].map(x=>rect(px(x),pz(deskHeight)+10,8,deskHeight*scale-10,'#695039')).join('');
    return rect(x0,pz(ceiling),southSpan*scale,ceiling*scale,face,'#7e6b53')
      +lines.join('')+windows.map(arch).join('')
      +rect(x0,pz(150),southSpan*scale,150*scale,panels?'#806147':'#ad8b66')
      +deskTop+deskLegs
      +'<path d="M'+px(1490)+' '+pz(850)+'h64l20-30h48" stroke="#765238" stroke-width="5" fill="none"/>'
      +'<path d="M'+px(1520)+' '+pz(640)+'q-25-13-36 12m15 24q-22 49 6 79l42 10q20-20 12-39l-13-28m-20 61v-117" fill="none" stroke="#5f5d4e" stroke-width="3"/>';
  }
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1640" height="775" viewBox="0 0 1640 775" role="img" aria-labelledby="title desc">',
    '<title id="title">The Study south elevation, quiet and panelled</title><desc id="desc">Two south elevations of the real furnished Study. The paired examples use the same windows and furnishings to show the resulting composition.</desc>',
    '<style>.title{font:37px Georgia;fill:#332c27}.head{font:24px Georgia;fill:#332c27}.body{font:18px Arial;fill:#584636}.panel{stroke:#76563e;stroke-width:1.3}</style>',
    '<rect width="1640" height="775" fill="#f6f1e7"/>',
    text(39,54,'The Study south wall · quiet and panelled','title'),
    text(39,86,'Same finished wall, desk and current window positions. Joinery divisions, furniture heights and light are illustrative.'),
    text(39,125,'W0 · mineral field, restrained frame and trim','head'),
    text(846,125,'W1 · predominantly panelled, independently removable faces','head'),
    elevation(39,false),elevation(846,true),
    text(39,736,'Both compositions keep the X'+windows.map(w=>w.centre).join(' and X')+' openings and the same permanent structural/air boundary.'),
    '</svg>\n'
  ].join('');
}

function renderAccessDetail() {
  const rect=(x,y,w,h,fill,stroke='#776351')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" stroke="'+stroke+'"/>';
  const text=(x,y,value,cls='body')=>'<text x="'+x+'" y="'+y+'" class="'+cls+'">'+value+'</text>';
  const arrow=(x,y,d)=>'<path d="M'+x+' '+y+'v'+d+'m-7 8 7-8 7 8" stroke="#665348" stroke-width="1.8" fill="none"/>';
  const frame=(x)=>rect(x,310,318,28,'#a8aa9c')+rect(x,299,318,11,'#c4af8c');
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1450" height="565" viewBox="0 0 1450 565" role="img" aria-labelledby="title desc">',
    '<title id="title">Replace a surface or open a nominated service cover</title><desc id="desc">Three plates show independent support, dry service grille caution, and a retained mineral wet floor.</desc>',
    '<style>.title{font:36px Georgia;fill:#332c27}.head{font:24px Georgia;fill:#332c27}.body{font:17px Arial;fill:#584636}.small{font:14px Arial;fill:#584636}</style>',
    '<rect width="1450" height="565" fill="#f6f1e7"/>',
    text(52,54,'Opening one piece at a time','title'),
    text(52,85,'Concept details, with continuous permanent support shown across the intervention.'),
    text(52,139,'F1 · lift one sacrificial finish panel','head'),
    text(518,139,'G1 · unscrew a retained dry cover','head'),
    text(982,139,'Wet edge · keep the water plane','head'),
    frame(52),frame(518),frame(982),
    rect(52,282,113,17,'#8d6040'),rect(277,282,93,17,'#8d6040'),
    rect(166,222,110,17,'#8d6040'),rect(172,239,17,5,'#675341'),rect(252,239,17,5,'#675341'),
    arrow(220,277,-25),
    rect(518,282,83,17,'#8d6040'),rect(751,282,85,17,'#8d6040'),
    rect(590,255,8,44,'#8f8774'),rect(751,255,8,44,'#8f8774'),
    rect(599,232,150,16,'#a5aaa1'),rect(601,249,12,8,'#747b70'),rect(737,249,12,8,'#747b70'),
    arrow(671,286,-25),
    '<path d="M633 234v12m17-12v12m17-12v12m17-12v12m17-12v12m17-12v12" stroke="#4d574f" stroke-width="3"/>',
    rect(982,282,152,17,'#8d6040'),rect(1136,282,164,17,'#bbbdad'),
    '<path d="M1136 302h164v-75" fill="none" stroke="#427380" stroke-width="4"/>'+rect(1303,213,20,120,'#888f84'),
    text(52,376,'Releasable retainer at exposed joint.'),
    text(52,405,'Lift onto a cleared neighbouring surface.'),
    text(52,434,'No routine entry into a floor void.'),
    text(518,376,'Put an independent frame beneath the lid.'),
    text(518,405,'Locate it only where a service earns access.'),
    text(518,434,'Any ventilating grille needs whole-device proof.'),
    text(982,376,'End the dry panels at a visible threshold.'),
    text(982,405,'Keep the mineral wet floor with its own seals.'),
    text(982,434,'Use purpose-made local access from the dry side.'),
    text(52,507,'Isolate and close off the work area, remove the one piece, then refit and confirm retention and any disturbed boundaries.','small'),
    '</svg>\n'
  ].join('');
}

function renderLinkedRooms() {
  const palette={clear:'#afbfad',blocked:'#d7c7ae',cut:'#e1daca'};
  function place(room,left) {
    const scale=.098;
    const minX=Math.min(...room.bands.map(b=>b[0])), minY=Math.min(...room.bands.map(b=>b[1]));
    const sx=x=>left+(x-minX)*scale,sy=y=>526-(y-minY)*scale;
    const box=([x0,y0,x1,y1],fill,stroke='none')=>'<rect x="'+sx(x0)+'" y="'+sy(y1)+'" width="'+((x1-x0)*scale)+'" height="'+((y1-y0)*scale)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width=".65"/>';
    const label=(x,y,value,cls)=>'<text x="'+x+'" y="'+y+'" class="'+cls+'">'+value+'</text>';
    return label(left,143,room.name,'head')
      +label(left,172,room.moduleSummary.complete+' complete / '+room.moduleSummary.clearInPlan+' clear in plan','body')
      +room.all.flatMap(tile=>tile.clipped.map(piece=>box(piece,tile.full?tile.fixedObstructions.length?palette.blocked:palette.clear:palette.cut,'#756a59'))).join('')
      +room.fixed.flatMap(([,item])=>room.bands.map(band=>intersection(band,item)).filter(piece=>area(piece)>0).map(piece=>box(piece,'#8c735b'))).join('')
      +label(left,550,room.moduleSummary.areaM2.toFixed(2)+' m² study area','body');
  }
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1480" height="670" viewBox="0 0 1480 670" role="img" aria-labelledby="title desc">',
    '<title id="title">Repeat the dry floor grid with ordinary furniture in place</title><desc id="desc">Each room uses the same 400 millimetre trial grid. Green areas contain full modules clear of fixture/furniture footprints.</desc>',
    '<style>.title{font:36px Georgia;fill:#332c27}.head{font:24px Georgia;fill:#332c27}.body{font:17px Arial;fill:#584636}.small{font:14px Arial;fill:#584636}</style>',
    '<rect width="1480" height="670" fill="#f6f1e7"/>',
    '<text x="52" y="55" class="title">Beyond the Study</text><text x="52" y="85" class="body">400 mm modules at the same grid origin, with current furniture and emitters retained</text>',
    ...linkedRooms.map((room,i)=>place(room,52+473*i)),
    '<rect x="52" y="583" width="14" height="14" fill="#afbfad"/><text x="75" y="596" class="body">Clear in plan only. The door, handler and first-rest route still need proof.</text>',
    '<text x="52" y="624" class="small">The dining rectangle is the selected whole kitchen/dining field. Preserve a distinct mineral edge and independent carrier at wet worktops.</text>',
    '</svg>\n'
  ].join('');
}

function renderStudyRoom() {
  const projection=([x,y,z])=>[210+(x-outer)*.15+(y-outer)*.108,820-(y-outer)*.094-z*.152];
  const coordinates=points=>points.map(point=>projection(point).join(',')).join(' ');
  const polygon=(points,fill,stroke='#736353',width=1)=>
    '<polygon points="'+coordinates(points)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+width+'"/>';
  const line=(a,b,stroke,width=1)=>'<polyline points="'+coordinates([a,b])+'" fill="none" stroke="'+stroke+'" stroke-width="'+width+'"/>';
  const horizontal=([x0,y0,x1,y1],z,fill,stroke)=>polygon([[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]],fill,stroke);
  const wallWest=polygon([[outer,outer,0],[outer,bands[2][3],0],[outer,bands[2][3],3100],[outer,outer,3100]],'#ddcbb0');
  const farFaceY=bands[2][3];
  const northWall=polygon([[outer,farFaceY,0],[bands[2][2],farFaceY,0],[bands[2][2],farFaceY,3100],[outer,farFaceY,3100]],'#c7a784');
  const end = bands[2][2];
  const wallCells=[];
  for(let x=outer+420;x<end;x+=420) wallCells.push(line([x,farFaceY,150],[x,farFaceY,3000],'#836244'));
  for(const z of [150,720,2260,3000]){
    wallCells.push(line([outer,farFaceY,z],[end,farFaceY,z],'#836244'));
    wallCells.push(line([outer,outer,z],[outer,farFaceY,z],'#a18669'));
  }
  const blockerDoor=polygon([[door.rough[0],farFaceY,0],[door.rough[1],farFaceY,0],[door.rough[1],farFaceY,2250],[door.rough[0],farFaceY,2250]],'#74523d','#654835',3);
  const win=studyWindows.find(item=>item.wall==='outer-west');
  const wy0=win.centre-win.width/2,wy1=win.centre+win.width/2;
  const rise=win.head-win.spring,radius=win.width**2/(8*rise)+rise/2;
  const points=Array.from({length:21},(_,index)=>{
    const y=wy0+index*(wy1-wy0)/20;
    return [outer+.01,y,win.head-radius+Math.sqrt(radius**2-(y-win.centre)**2)];
  });
  const westWindow=polygon([[outer+.01,wy0,win.sill],...points,[outer+.01,wy1,win.sill]],'#bbcfc6','#5d6d60',3);
  const floorPanels=tileField(400,sameGridOrigin).flatMap(tile=>tile.clipped.map(piece=>horizontal(piece,0,tile.full?'#b4936c':'#a78561','#806346'))).join('');
  const piece=(box,baseZ,topZ,fill)=>{
    const [x,y,x1,y1]=box;
    return horizontal(box,topZ,fill)
      +polygon([[x,y,baseZ],[x1,y,baseZ],[x1,y,topZ],[x,y,topZ]],'#937252')
      +polygon([[x1,y,baseZ],[x1,y1,baseZ],[x1,y1,topZ],[x1,y,topZ]],'#71553c');
  };
  const desk=occupied.find(([name])=>name==='study-desk')[1];
  const chair=occupied.find(([name])=>name==='study-chair')[1];
  const emitter=occupied.find(([name])=>name==='service-emitter-study-W')[1];
  const leg=(x,y)=>piece([x,y,x+50,y+50],0,702,'#704f38');
  const vest=[chair[0]+160,chair[1]+125,chair[0]+610,chair[1]+600];
  const [px,py]=projection([2720,1360,0]);
  const height=1700*.152;
  const mark=(x,y)=>[px+x*height,py-y*height].join(' ');
  const figure=[
    'M',mark(-.035,.52),'L',mark(-.062,.24),mark(-.07,.015),mark(-.12,.015),
    'M',mark(.028,.52),'L',mark(.042,.25),mark(.11,.015),mark(.157,.008),
    'M',mark(0,.5),'Q',mark(.019,.65),mark(0,.8),
    'M',mark(-.02,.78),'Q',mark(-.07,.68),mark(-.112,.48),
    'M',mark(.02,.79),'Q',mark(.091,.68),mark(.116,.49)
  ].join(' ');
  const silhouette='<path d="'+figure+'" stroke="#493f38" stroke-width="10" fill="none" stroke-linecap="round"/><ellipse cx="'+px+'" cy="'+(py-.9*height)+'" rx="12" ry="19" fill="#493f38"/>';

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="875" viewBox="0 0 1400 875" role="img" aria-labelledby="title desc">',
    '<title id="title">Panelled Study with a visible floor seam and real furniture</title><desc id="desc">Cutaway line illustration of the current room with trial seams and finishes. The windows, door, desk and radiator keep the source positions. A silhouette indicates scale.</desc>',
    '<style>.title{font:36px Georgia;fill:#332c27}.sub{font:17px Arial;fill:#59483a}.head{font:24px Georgia;fill:#332c27}</style>',
    '<rect width="1400" height="875" fill="#f6f1e7"/><text class="title" x="52" y="57">The panelled Study</text><text class="sub" x="52" y="86">Inhabited cutaway · north and west walls shown · working surfaces remain independently supported</text>',
    floorPanels,wallWest,northWall,wallCells.join(''),westWindow,blockerDoor,
    piece(emitter,110,690,'#bbb9a7'),
    piece(vest,370,450,'#9f7c53'),piece([vest[0],vest[3]-60,vest[2],vest[3]],450,830,'#967048'),
    ...[[desk[0]+65,desk[1]+65],[desk[2]-125,desk[1]+65],[desk[0]+65,desk[3]-125],[desk[2]-125,desk[3]-125]].map(([x,y])=>leg(x,y)),
    piece(desk,702,730,'#947354'),silhouette,
    '<text class="head" x="990" y="250">Visible joints, quiet finish</text><text class="sub" x="990" y="285">400 mm finish modules across the room.</text><text class="sub" x="990" y="314">Satin metal only at useful access points.</text><text class="sub" x="990" y="343">Keep the Study door reveal flush.</text><text class="sub" x="990" y="402">Heights and silhouette are illustrative.</text>',
    '</svg>\n'
  ].join('');
}

function renderRetentionDetail() {
  const q=(x,y,w,h,fill,weight=1)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" stroke="#6b5b4a" stroke-width="'+weight+'"/>';
  const t=(x,y,value,cls='body')=>'<text x="'+x+'" y="'+y+'" class="'+cls+'">'+value+'</text>';
  const dim=(a,b,y,value)=>'<path d="M'+a+' '+(y-6)+'v12 M'+a+' '+y+'H'+b+' M'+b+' '+(y-6)+'v12" stroke="#554f49"/>'
    +t((a+b)/2,y-8,value,'dim');
  const scale=5,tileThickness=20,baseY=368,bed=2;
  const panelY=baseY-(tileThickness+bed)*scale;
  const edgeL=523,edgeR=edgeL+3*scale;
  const captureX=edgeR+10;
  const shelfY=baseY-16*scale;
  const benchX=918,skirtX=benchX+135,skirtHeight=150,skirtBase=baseY;
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1450" height="535" viewBox="0 0 1450 535" role="img" aria-labelledby="title desc">',
    '<title id="title">Provisional captured edges and mechanical service skirting</title><desc id="desc">Dimensioned dry floor retention and skirting sections. Trials require measured retention, clearances and service protections.</desc>',
    '<style>.title{font:36px Georgia;fill:#332c27}.head{font:24px Georgia;fill:#332c27}.body{font:16px Arial;fill:#584636}.dim{font:15px Arial;fill:#584636;text-anchor:middle}.small{font:14px Arial;fill:#584636}</style>',
    '<rect width="1450" height="535" fill="#f6f1e7"/>',
    t(52,54,'Captured edges, accessible fixings','title'),
    t(52,85,'Provisional millimetres. Enlarged schematic with separate horizontal and vertical graphic scales.'),
    t(52,139,'Floor retention · local section at a dry seam','head'),
    t(833,139,'Service skirting · independent cover','head'),
    q(52,baseY,689,36,'#aaa99f'),
    q(52,baseY-bed*scale,689,bed*scale,'#c7b08f'),
    q(52,panelY,edgeL-52,tileThickness*scale,'#9d724f'),
    q(edgeR,panelY,741-edgeR,tileThickness*scale,'#9d724f'),
    q(edgeR,shelfY,25,12,'#aaaaa2'),
    q(captureX,shelfY-41,14,41,'#807e73'),
    '<path d="M'+(captureX+7)+' '+(shelfY-78)+'v57" stroke="#3f3e36" stroke-width="2" stroke-dasharray="5 4"/>',
    dim(edgeL,edgeR,panelY-15,'3 trial seam'),
    t(52,469,'20 finish allocation · 2 mm bedding must replace, not add to, the support layer.','small'),
    t(52,495,'Choose a short captive lock with independent support. Verify actual capture and tool envelopes.','small'),
    q(benchX-65,180,65,210,'#9d9f94'),q(benchX,180,46,210,'#d7c4a9'),
    q(benchX+46,skirtBase-skirtHeight,89,skirtHeight,'#c2c8b8'),q(skirtX,skirtBase-skirtHeight,60,skirtHeight,'#a07653'),
    q(benchX+46,skirtBase-59,30,9,'#7c7568'),
    '<circle cx="'+(benchX+72)+'" cy="'+(skirtBase-115)+'" r="10" fill="#9f6854"/><circle cx="'+(benchX+99)+'" cy="'+(skirtBase-79)+'" r="10" fill="#9f6854"/>',
    '<path d="M'+(skirtX+69)+' '+(skirtBase-99)+'h42l-9-7m9 7-9 7" stroke="#443b32" stroke-width="2" fill="none"/>',
    dim(benchX+46,skirtX,skirtBase+61,'27 gross'),
    dim(skirtX,skirtX+60,skirtBase+61,'18 face'),
    t(833,469,'150 height · ends release first. Cable brackets and electrical enclosure stay in place.','small'),
    t(833,495,'Check support and bend before adding a terminal or data branch.','small'),
    '</svg>\n'
  ].join('');
}

function renderFixedJunctions() {
  const q=(x,y,w,h,fill)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" stroke="#6b5b4a"/>';
  const t=(x,y,value,cls='body')=>'<text x="'+x+'" y="'+y+'" class="'+cls+'">'+value+'</text>';
  const wet=branchProbe.wet,stair=branchProbe.stair;
  const heights=[0,stair.rise,stair.rise*2,stair.rise*3];
  const z0=397; const px=58,pz=z=>z0-z*.32;
  const steps=heights.map((z,i)=>q(px+64*i,pz(z),64,z0-pz(z)+27,'#a4a59a')).join('');
  const trim=(x,y,w,h)=>q(x,y,w,h,'#9b795b');
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="580" viewBox="0 0 1500 580" role="img" aria-labelledby="title desc">',
    '<title id="title">Three places to stop the removable finish</title><desc id="desc">A stair arrival, a family-bath front and a Study window reveal keep independently supported permanent duties.</desc>',
    '<style>.title{font:36px Georgia;fill:#332c27}.head{font:24px Georgia;fill:#332c27}.body{font:17px Arial;fill:#584636}.small{font:14px Arial;fill:#584636}</style>',
    '<rect width="1500" height="580" fill="#f6f1e7"/>',
    t(52,55,'Stop the removable finish at the working boundary','title'),
    t(52,86,'Representative sections · exact retained dimensions are named; relative graphic scales differ.'),
    t(52,146,'Upper stair arrival','head'),
    t(539,146,'Family bath front','head'),
    t(1014,146,'Study window reveal','head'),
    steps,
    q(314,pz(heights.at(-1))+8,142,z0-pz(heights.at(-1))+19,'#a4a59a'),
    q(314,pz(heights.at(-1)),54,8,'#a4a59a'),
    trim(373,pz(heights.at(-1)),83,8),
    q(368,pz(heights.at(-1)),5,8,'#7e7061'),
    t(52,461,stair.rise+' rise, '+stair.going+' going, '+stair.betweenRails+' between rails.','small'),
    t(52,493,'Keep the original finished nosing and slab.','small'),
    t(52,522,'Make the transition piece captive and flush.','small'),
    q(539,359,360,53,'#a4a59a'),
    q(539,353,360,6,'#b69772'),
    '<path d="M553 353h348v-42" stroke="#4c7682" stroke-width="4" fill="none"/>',
    '<path d="M555 220h271l-26 73h-220Z" stroke="#665d53" stroke-width="3" fill="#d8d7bd"/>',
    trim(817,224,17,122), q(605,291,14,62,'#817c70'),q(748,291,14,62,'#817c70'),
    q(761,358,26,54,'#dde0c8'),q(742,406,64,6,'#65796d'),
    t(539,461,'Ø'+wet.port[2]+' formed port at '+wet.port[0]+' / '+wet.port[1]+'.','small'),
    t(539,493,(wet.frontPanel.clearX[1]-wet.frontPanel.clearX[0])+'-wide front panel, '+wet.retainedHatch[2]+' lower hatch.','small'),
    t(539,522,'Keep the floor seal and independent bath feet.','small'),
    q(1014,251,145,171,'#a4a59a'),q(1159,254,36,168,'#dac4a4'),
    q(1014,227,190,24,'#797c72'),q(1037,192,53,35,'#aa8763'),
    q(1060,165,7,28,'#87a8ab'),q(1073,165,7,28,'#87a8ab'),
    q(1159,251,45,5,'#445e5c'), q(1195,297,18,125,'#8e7356'),
    '<path d="M1215 312h47l-7-7m7 7-7 7" stroke="#5d5145" stroke-width="2" fill="none"/>',
    t(1014,461,'Demount the room-side cover from its own anchors.','small'),
    t(1014,493,'Keep the window support and sealing planes fixed.','small'),
    t(1014,522,'Rehearse cassette and conventional frame courses.','small'),
    '</svg>\n'
  ].join('');
}

const outputs = [
  ['workable-study-floor.json',JSON.stringify(receipt,null,2)+'\n'],
  ['workable-study-floor.svg',renderStudy()],
  ['workable-study-sections.svg',renderSections()],
  ['workable-house-plans.svg',renderHousePlans()],
  ['workable-study-elevation.svg',renderOccupiedWall()],
  ['workable-access-detail.svg',renderAccessDetail()],
  ['workable-furnished-fields.svg',renderLinkedRooms()],
  ['workable-study-room.svg',renderStudyRoom()],
  ['workable-retention-detail.svg',renderRetentionDetail()],
  ['workable-fixed-junctions.svg',renderFixedJunctions()]
];
for (const [name,content] of outputs) {
  const target=new URL('./'+name,import.meta.url);
  if (process.argv.includes('--check')) assert.equal(readFileSync(target,'utf8'),content,name+' source drift');
  else writeFileSync(target,content);
}
