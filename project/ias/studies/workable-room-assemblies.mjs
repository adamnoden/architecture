import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { deriveCurrentHouse } from '../../had/studies/current-house.mjs';

const source = deriveCurrentHouse();
const model = source.model;
const floor = JSON.parse(readFileSync(new URL('workable-study-floor.json', import.meta.url)));
const release = JSON.parse(readFileSync(new URL('workable-study-release.json', import.meta.url)));
const { wet, stair } = floor.branchProbe;
const groundFirst = model.sections.firstFFL - model.sections.firstFloorRC.top;
assert.equal(groundFirst, 80);
const tile = release.panel;
const finish = model.finishRewind.dry.total;
assert.equal(finish, 27);
const xmin = model.envelope;
const xmax = model.shell-xmin;
const room = (title,level,wall,interval,ids,normal) => {
  const furniture = level === 'GROUND' ? model.groundFurniture : model.upperFurniture;
  const windows = model.archOpeningRegister[level].filter(o=>o.kind==='window'&&o.wall===wall&&o.centre>=interval[0]&&o.centre<=interval[1]);
  assert(windows.length>0,title+' source opening missing');
  const items=ids.map(([id,visualType,height])=>{
    const rec = furniture[id];
    assert(rec,title+': source furniture missing: '+id);
    return {id,type:visualType,height,box:rec};
  });
  return {title,level,wall,interval,normal,windows:windows.map(({id,centre,width,sill,spring,head})=>({id,centre,width,sill,spring,head})),items};
};
const finishCeiling = model.sections.firstFloorRC.bottom - floor.assemblies.upperUndersideServiceMM - floor.assemblies.upperCeilingMM;
assert.equal(finishCeiling,3100);
const normalAxisIndex = (wall) => wall === 'outer-east' ? 0 : 1;
const [familyX,,familyW] = model.rooms.living.bounds;
const [diningX,,diningW] = model.rooms.kitchenDining.bounds;
const [bed2Band] = floor.additionalFurnishedComparisons.find(s=>s.name==='Bedroom 2').bands;
const bed2East = bed2Band[2];
const upperRoomDisplayHeight = 3100; // Authored elevation crop. Upper roof and room ceilings vary.
const plans = [
  room('Family room','GROUND','outer-north',[familyX,familyX+familyW],[['reading-sofa1900x850','sofa',790],['family-sofa1900x750','sofa',790],['service-emitter-living-N2','radiator',600]],xmax),
  room('Kitchen and dining','GROUND','outer-north',[diningX,diningX+diningW],[['dining-table1200x800','table',735],['dining-chair-east-south','chair',865],['dining-chair-west-north','chair',865],['north-sink-station','wet worktop',925],['north-cooking-station','worktop',925]],xmax),
  room('Bedroom 2','FIRST','outer-south',[xmin,bed2East],[['bed2','bed',580],['bed2-wardrobe','wardrobe',2000],['service-emitter-bed2-S','radiator',655]],xmin),
  room('Family bathroom','FIRST','outer-east',[3800,6400],[['family-bath1700','bath',560],['family-basin','basin',840],['family-WC','WC',740],['service-emitter-family-E','radiator',710]],xmax)
];
const families = [
  ['F0 continuous fields',0,'Local damage generally sacrifices and reinstates a finish patch.'],
  ['F1 dry 400 mm',tile.pitch,'Finish and bedding of 18+2 requires no level change.'],
  ['F2 deeper services',20,'An additional 20 mm at a stair landing changes the adjoining 172.5 mm rise.'],
  ['W1 dominant wall',finish,'18 face +7 capture +2 fit replaces the 27 mm face territory only where the complete substrate earns it.'],
  ['W2/S1 accessible strip',45,'150 high, 45 projection. 18 face leaves 27 gross enclosure/build-up.'],
  ['G1 visible cover',0,'Show where a genuine inspection, air or water duty earns metalwork. Keep live contents independently supported.']
];
const westGallery=[1015,1015-2*18,1015-18-45,1015-2*45];
const usefulGate=[
  'Use original nosing datums, protected guards and permanently supported door thresholds.',
  'Select owner palette, seam rhythm, wet perimeter and where maintenance should remain visible.',
  'Confirm complete fittings, repeated load and finish movement in a sample; no product rating or purchase authority.'
];
const grate = { duty: 'Room-side screen for one independent HAD inlet', slotLength: 240, slotWidth: 6,
  slots: 12, referenceInwardEquivalentArea: 15000, referenceOutwardEquivalentArea: 5000 };
grate.grossOpenArea = grate.slotLength * grate.slotWidth * grate.slots;
grate.areaScreenRatio = grate.grossOpenArea / grate.referenceInwardEquivalentArea;
assert.equal(grate.grossOpenArea,17280);
// Screen plan obstruction and wall clearance before assessing hand loads and temporary supports.
function roomHandling(record) {
  const pitch=400, margin=300;
  const [ox,oy]=floor.moduleStudy.origin;
  const bands=record.name==='Kitchen / dining'
    ? record.bands.map(([a,b,c,d])=>[a,b,c,Math.min(d,10500)])
    : record.bands;
  const fixed=record.fixed.map(([,box])=>box);
  const width=box=>Math.max(0,box[2]-box[0]);
  const height=box=>Math.max(0,box[3]-box[1]);
  const area=box=>width(box)*height(box);
  const overlap=(a,b)=>area([Math.max(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.min(a[3],b[3])]);
  const fits=box=>bands.reduce((sum,band)=>sum+overlap(box,band),0)===area(box) && fixed.every(item=>overlap(box,item)===0);
  const bounds=bands.reduce(([a,b,c,d],[e,f,g,h])=>[Math.min(a,e),Math.min(b,f),Math.max(c,g),Math.max(d,h)]);
  const tested=[];
  for(let x=ox+Math.ceil((bounds[0]-ox)/pitch)*pitch;x+pitch<=bounds[2];x+=pitch){
    for(let y=oy+Math.ceil((bounds[1]-oy)/pitch)*pitch;y+pitch<=bounds[3];y+=pitch){
      const lift=[x,y,x+pitch,y+pitch];
      if(!fits(lift))continue;
      for(const [dx,dy] of [[pitch,0],[-pitch,0],[0,pitch],[0,-pitch]]){
        const rest=lift.map((v,i)=>v+(i%2?dy:dx));
        const sweep=[Math.min(lift[0],rest[0]),Math.min(lift[1],rest[1]),Math.max(lift[2],rest[2]),Math.max(lift[3],rest[3])];
        if(!fits(sweep))continue;
        for(const side of [-1,1]){
          const travelInX=dx!==0, mx=x+pitch/2, my=y+pitch/2;
          const footStart=travelInX?[mx,(side<0?y:y+pitch)+side*(margin+35)]:[(side<0?x:x+pitch)+side*(margin+35),my];
          const footEnd=[footStart[0]+dx,footStart[1]+dy];
          const handler=[Math.min(footStart[0],footEnd[0])-margin,Math.min(footStart[1],footEnd[1])-margin,
            Math.max(footStart[0],footEnd[0])+margin,Math.max(footStart[1],footEnd[1])+margin];
          if(fits(handler) && overlap(handler,sweep)===0)tested.push({lift,rest,footStart,footEnd,handler});
        }
      }
    }
  }
  return {name:record.name, allowedBands:bands, handlerRadius:margin, movingStripGap:35, passingPlanComparisons:tested.length,
    example:tested[0] ?? null, exclusions:['approach and exit','hands and reach','loaded motion','retainers and temporary rests','door swing']};
}

const handling = floor.additionalFurnishedComparisons.map(roomHandling);
const bathTransition = {comparison:'Keep mineral flooring and actual tray / seal. No dry panel exchange across the wet transition.',
  reason:'No source-defined service demand earns a removable wet field or disturbance to its waterproof perimeter.'};

const captureSequence = [
  'Isolate and clear a closed work bay','Confirm substrate stays supported','Release independent capture',
  'Lift, control load and place on protected first rest','Replace piece and remove all equipment','Recheck closure and return room to use'
];
const receipt={scope:'Source-bound pre-site concept alternatives for owner review.', source:{id:source.id,geometry:floor.source.relevantGeometrySHA256,
  floorSHA256:createHash('sha256').update(readFileSync(new URL('workable-study-floor.json', import.meta.url))).digest('hex'),
  releaseSHA256:createHash('sha256').update(readFileSync(new URL('workable-study-release.json', import.meta.url))).digest('hex')},
  places:plans, groundedInterfaces:{wet,stair,wallFinishMM:finish,tile,seamCases:release.seamCases,westGallery,
    studyDoorBodyMargin:floor.study.door.operatingBodyLowerBoundMM},
  families,grate,finishCeiling,handling,bathTransition,workSequence:captureSequence,ownerDecisionLimits:usefulGate};

const colors={ink:'#302a25',paper:'#f7f2e7',mineral:'#ded2be',timber:'#b89068',steel:'#838b83',glass:'#bed0c6',oak:'#8c6951',wet:'#89a6a5'};
const e=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;');
const rect=(x,y,w,h,fill=colors.paper,stroke=colors.ink,sw=.28)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
const line=(x,y,a,b,stroke=colors.ink,w=.32)=>'<path d="M'+x+' '+y+'L'+a+' '+b+'" stroke="'+stroke+'" stroke-width="'+w+'" fill="none"/>';
const text=(x,y,value,cls='body')=>'<text x="'+x+'" y="'+y+'" class="'+cls+'">'+e(value)+'</text>';
const sheet=(title,desc,parts)=>[
  '<svg xmlns="http://www.w3.org/2000/svg" width="297mm" height="210mm" viewBox="0 0 297 210" role="img" aria-labelledby="title desc">',
  '<title id="title">'+e(title)+'</title><desc id="desc">'+e(desc)+'</desc>',
  '<style>.title{font:7px Georgia;fill:#302a25}.head{font:4px Georgia;fill:#302a25}.body{font:3.25px Arial;fill:#504136}.small{font:2.75px Arial;fill:#504136}</style>',
  rect(0,0,297,210,colors.paper,'none'),text(12,15,title,'title'),...parts,'</svg>\n'].join('');
const axisIndex=wall=>wall==='outer-east'?1:0;
function silhouette(x,y,h){
  const arm=h*.16, leg=h*.44, neck=y-h*.82;
  return '<circle cx="'+x+'" cy="'+(y-h*.9)+'" r="'+h*.08+'" fill="#69584b"/>'
    +line(x,neck,x,y-leg,'#69584b',1.6)+line(x,neck+2,x-arm,y-h*.47,'#69584b',1)
    +line(x,neck+2,x+arm,y-h*.53,'#69584b',1)+line(x,y-leg,x-arm*.6,y,'#69584b',1.2)+line(x,y-leg,x+arm*.7,y,'#69584b',1.2);
}
function roomPair(room){
  const y0=137,s=.026,span=room.interval[1]-room.interval[0], axis=axisIndex(room.wall);
  const intro=room.title==='Family bathroom'?'Washable mineral control with a separate supported removable bath-front.':'The same windows, furniture footprints and room geometry in both choices.';
  const panelPitch=420,panelDatum=room.interval[0];
  const elevation=(left,clad)=>{
    const dx=x=>left+(x-room.interval[0])*s, z=h=>y0-h*s;
    const wetRoom=room.title==='Family bathroom', floorPaint=wetRoom?colors.wet:colors.oak;
    const panelTop=wetRoom?1200:3000;
    const wallHeight=room.level==='GROUND'?finishCeiling:upperRoomDisplayHeight;
    const row=[rect(left,z(wallHeight),span*s,wallHeight*s,colors.mineral)];
    if (clad) {
      row.push(rect(left,z(panelTop),span*s,(panelTop-150)*s,wetRoom?'#c2b5a1':colors.timber));
      for(let a=panelDatum+panelPitch;a<room.interval[1];a+=panelPitch)row.push(line(dx(a),z(150),dx(a),z(panelTop),'#84674d',.26));
      if(!wetRoom)for(const h of [720,2260])row.push(line(left,z(h),dx(room.interval[1]),z(h),'#84674d',.27));
    }
    row.push(rect(left,z(150),span*s,150*s,wetRoom?colors.mineral:clad?colors.oak:'#a88564'));
    row.push(rect(left,y0,span*s,3,floorPaint));
    for (const w of room.windows) {
      const lo=w.centre-w.width/2, hi=w.centre+w.width/2, rise=w.head-w.spring, r=(w.width*w.width/(8*rise)+rise/2)*s;
      row.push('<path d="M'+dx(lo)+' '+z(w.sill)+'V'+z(w.spring)+'A'+r+' '+r+' 0 0 1 '+dx(hi)+' '+z(w.spring)+'V'+z(w.sill)+'Z" stroke="#53685c" stroke-width=".55" fill="'+colors.glass+'"/>');
      row.push(line(dx(w.centre),z(w.sill),dx(w.centre),z(w.head)-.2,'#6b7569',.45));
    }
    const fitWidth=(start,w)=>[Math.max(room.interval[0],start),Math.min(room.interval[1],start+w)];
    for(const item of room.items){
      const [lo,hi]=fitWidth(item.box[axis],item.box[axis+2]);
      if(hi<=lo)continue;
      const width=(hi-lo)*s,x=dx(lo),h=item.height;
      if(item.type==='table'){
        row.push(rect(x,z(h),width,1.8,colors.oak),line(x+1,z(h)+1.8,x+1,y0),line(x+width-1,z(h)+1.8,x+width-1,y0));
      }else if(item.type==='sofa'){
        row.push(rect(x,z(h),width,h*s*.49,'#a09276'),rect(x,z(h*.53),width,h*s*.33,'#7e755f'));
      }else if(item.type==='bath'){
        row.push(rect(x,z(h),width,h*s,'#ebe8db'),line(x,z(h)+2,x+width,z(h)+2,colors.steel));
        if(clad)row.push(rect(x+2,z(h)-.2,width-4,h*s*.75,'#9d8264'));
      }else if(item.type==='radiator'){
        row.push(rect(x,z(h),width,h*s*.54,'#a6a098'));
        for(let i=1;i<Math.floor(width/1.4);i++)row.push(line(x+i*1.4,z(h)+1,x+i*1.4,z(h)+h*s*.48,'#79766d',.16));
      }else{
        const backdrop=['wet worktop','worktop','basin','WC'].includes(item.type)?'#c7c4b2':'#97795d';
        const bedHeight=item.type==='bed'?h*s*.55:h*s;
        row.push(rect(x,z(h),width,bedHeight,backdrop));
      }
    }
    row.push(silhouette(dx(room.interval[0]+span*.51),y0,1670*s));
    return row.join('');
  };
  return sheet(room.title+' · restrained and worked surfaces',intro,[
    text(12,24,intro),text(12,45,'Quiet mineral and selective treatment','head'),
    text(153,45,room.title==='Family bathroom'?'Wet-compatible access and panel rhythm':'Panel-dominant and locally accessible','head'),
    elevation(12,false),elevation(153,true),
    text(12,153,'Windows and furnishing plans come from the current house. Shown furniture heights/light and the figure are concept references.','small'),
    text(12,160,room.title==='Family bathroom'?'Retain wet enclosure and separate seals. Make only the front service cover independently removable.':'Show seams and clips on an independently supported finish, with local service pieces where they earn access.','small'),
    text(12,180,room.windows.map(w=>w.centre+' axis · '+w.width+' opening · '+w.sill+' sill').join(' / ')),
    text(12,198,'Owner preference review · verify installed materials, load, furniture clearances, wet/fire and noise at the next design stage.','small')
  ]);
}

function measuredSections(){
  const d=(x,y,to,value)=>line(x,y,to,y)+line(x,y-1,x,y+1)+line(to,y-1,to,y+1)+text(x,y-2,value,'small');
  const scaleBar=(x,y,len,actual)=>rect(x,y,len/2,1,colors.ink)+rect(x+len/2,y,len/2,1)+text(x,y+4,actual,'small');
  const left=12, right=154, fz=72, cut=205;
  return sheet('Fixed interfaces at actual size','Representative enlarged 1:2 and 1:5 dimensions identify the boundaries to preserve.',[
    text(left,24,'Print actual size. Check each graphic bar. Heights stay on current source datums.'),
    text(left,42,'A · 1:2 Study room-side reveal','head'),
    rect(12,82,62,24,colors.steel),rect(74,82,13.5,24,colors.mineral),
    rect(43,72,44.5,10,colors.oak),rect(61,54,5,18,colors.glass),rect(87.5,87,9,19,colors.timber),
    line(98,92,121,92),line(117,89,121,92),line(121,92,117,95),
    d(74,55,87.5,'27 complete existing face'),
    d(87.5,115,96.5,'18 refused as additive at protected reveal'),
    scaleBar(left,130,50,'100 mm at 1:2'),
    text(left,150,'Room-side release may expose only independent trim.'),
    text(left,156,'Keep frame bearing, air, weather and movement planes.'),
    text(left,163,'Current Study door body reserve: '+floor.study.door.operatingBodyLowerBoundMM.toFixed(3)+' mm.'),
    text(left,170,'An added face must rerun door and extraction geometry.'),
    text(right,42,'B · 1:5 wet entry and protected floor','head'),
    rect(right,fz+16,124,40,colors.steel),
    rect(right,fz+4,cut-right,12,'#c9b288'),rect(right,fz,cut-right,3.6,colors.timber),rect(right,fz+3.6,cut-right,.4,colors.mineral),
    rect(cut,fz,73,16,'#c4bfad'),rect(cut+3,fz+3,70,.6,colors.wet),
    rect(cut-1.2,fz,2.4,16,colors.steel),
    line(cut-3,fz-11,cut-3,fz),line(cut+3,fz-13,cut+3,fz+3),
    text(right,63,'dry 18 + 2'),text(cut+5,63,'separate wet control and end stop'),
    scaleBar(right,130,40,'200 mm at 1:5'),
    text(right,150,'Retain 80 mm to RC and the permanent 200 mm slab.'),
    text(right,156,'Terminate the modular finish at an independent support.'),
    text(right,163,'Wet build-up graphic allocates its depth, not a specific seal.'),
    text(right,170,'Actual threshold and sealed perimeter require coordination.'),
    text(left,193,'Concept dimensions. This sheet combines separately scaled sections without selecting a cassette, doorset or membrane.','small')
  ]);
}
function extendedSections(){
  const sections = [];
  const note=(x,y,...lines)=>lines.map((label,i)=>text(x,y+i*5,label,'small'));
  const bar=(x,y,width,label)=>[rect(x,y,width/2,1,colors.ink),rect(x+width/2,y,width/2,1),text(x,y+5,label,'small')];
  sections.push(text(12,24,'Print actual size. Bars support the feature dimensions. Local fixings and weak points remain sample targets.'));
  sections.push(text(12,41,'C · 1:5 upper arrival', 'head'), text(111,41,'D · 1:2 dry wall to ceiling', 'head'),text(213,41,'E · 1:2 grille edge','head'));
  const top=68, riser=stair.rise/5, going=stair.going/5;
  sections.push(
    rect(18,top,29.5,16,colors.mineral),rect(18,top,27,4,colors.timber),rect(18,top+16,29.5,22,colors.steel),
    rect(45,top,2.5,10,colors.steel),line(47.5,top,47.5,top+riser,colors.ink,.65),
    line(47.5,top+riser,47.5+going,top+riser,colors.ink,.65),line(47.5+going,top+riser,47.5+going,top+riser+10,colors.ink,.65),
    line(50,top+3,50,top+riser-3),line(48,top+3,52,top+3),line(48,top+riser-3,52,top+riser-3),
    text(52,top+18,'172.5 rise','small'),text(56,top+riser+7,'300 going','small'),
    ...bar(12,127,34.5,'172.5 mm at 1:5'),
    ...note(12,152,'Solid edge stays independent of finish removal.','Continuous guard and floor support stay.','Arrival Y'+stair.upperArrivalYZ[0]+' / Z'+stair.upperArrivalYZ[1]+'.','A higher uncompensated landing changes rise.')
  );
  const wallX=140, faceX=wallX+13.5, z=91;
  sections.push(
    rect(111,51,29,75,colors.steel),rect(wallX,56,56,27.5,colors.mineral),rect(wallX,83.5,56,7.5,colors.mineral),
    rect(wallX,z+2.5,3.5,33,colors.steel),rect(wallX+4.5,z+2.5,9,33,colors.timber),
    line(faceX+2,z,196,z),line(faceX+1,z+2.5,faceX+8,z+2.5),
    text(155,66,'55 services','small'),text(155,88,'15 ceiling','small'),text(153,101,'5 trial stop','small'),
    text(155,115,'18 finish / 9 back','small'),
    ...bar(111,134,30,'60 mm at 1:2'),
    ...note(111,152,'Ground finished ceiling Z'+finishCeiling+'.','Sealing and lining stay independently fixed.','The panel stops below the ceiling datum.','A pierced or required full backing changes depth.')
  );
  const edgeX=236, topZ=76;
  sections.push(
    rect(214,topZ,22,40,colors.mineral),rect(edgeX,topZ,4,10,colors.steel),rect(edgeX,topZ+10,21,2,colors.steel),
    rect(edgeX+4,topZ,14,2,colors.steel),rect(edgeX+21,topZ,21,2,colors.steel),
    rect(edgeX+4,topZ+8,38,2,colors.oak),line(edgeX+30,topZ-3,edgeX+30,topZ-16),
    line(edgeX+27,topZ-13,edgeX+30,topZ-16),line(edgeX+33,topZ-13,edgeX+30,topZ-16),
    text(216,63,'Captured cover lifts clear','small'),text(271,70,'4 plate','small'),line(269,71,267,76),
    text(242,103,'Independent flange','small'),text(242,109,'and trial bedding','small'),
    ...bar(213,134,30,'60 mm at 1:2'),
    ...note(213,152,'A face, flange and support are separable.','Face geometry does not rate the terminal.','Fixing, fingers, clogging, sound and flow remain.','No walking duty at an offset wall terminal.')
  );
  sections.push(text(12,190,'F1 finish and retained edge · W1 removable face / permanent lining · G1 room-side air terminal and retained support.','small'));
  return sheet('Landing, ceiling and air-terminal interfaces','Three dimensioned sections show independent edges, stop and capture.',sections);
}

function exploded(){
  const parts=[
    ['Permanent support', 'RC and allocated screed / lining. No routine opening.', '#a19b8b'],
    ['Independent base and capture', 'Fasteners and pressings accessible from the maintenance side.', colors.steel],
    ['Replaceable bedding and shim', 'Prove suitable particles, fire behaviour, compression and creep.', colors.mineral],
    ['Finish module or service face', 'Trial natural timber, selected mineral or formed metal.', colors.timber],
    ['Closure and label', 'Recessed mechanical stop; test closure after each intervention.', colors.oak]
  ];
  const panels=parts.flatMap(([name,desc,shade],i)=>{
    const y=52+i*24;
    return ['<polygon points="15,'+y+' 58,'+(y-8)+' 90,'+y+' 47,'+(y+8)+'" fill="'+shade+'" stroke="#302a25" stroke-width=".3"/>',
      line(91,y,111,y),text(116,y-1,name,'head'),text(116,y+5,desc)];
  });
  return sheet('How the pieces come apart','An exploded representative dry kit shows what stays and what can be exchanged.',[
    text(12,25,'Repeated pitches share a simple face library. Backing, edges and capture stay specific to the duty.'),
    ...panels,text(12,177,'Replacement starts with the smallest damaged piece. Keep compatible fixing records and one matching spare.'),
    text(12,186,'Match separable backing, pads, clips, finishes and seals to the actual material policy before purchase.'),
    text(12,195,'Timing and price require chosen size, quantities, components and mock-up. Labour-sensitive comparisons appear in the owner sheet.')
  ]);
}

function axonometric(room){
  const alongAxis=axisIndex(room.wall), normalAxis=normalAxisIndex(room.wall);
  const [lo,hi]=room.interval, depth=2600, scale=.023;
  const viewSign=room.wall==='outer-north' || room.wall==='outer-east' ? -1 : 1;
  const position=(a,d,z)=>[a*scale+d*.011, -z*.029+d*.013+a*.003];
  const image=(left,clad)=>{
    const originY=132;
    const pt=(a,d,z)=>position(a,d,z).map((p,i)=>p+(i===0?left:originY));
    const quad=(positions,shade)=>'<polygon points="'+positions.map(v=>pt(...v).join(',')).join(' ')+'" fill="'+shade+'" stroke="#665747" stroke-width=".3"/>';
    const path=(a,b,shade,w)=>line(...pt(...a),...pt(...b),shade,w);
    const ww=hi-lo, height=room.level==='GROUND'?finishCeiling:upperRoomDisplayHeight;
    const marks=[quad([[0,0,0],[ww,0,0],[ww,depth,0],[0,depth,0]],'#b69a79'),
      quad([[0,0,0],[ww,0,0],[ww,0,height],[0,0,height]],clad?colors.timber:colors.mineral),
      quad([[0,0,0],[ww,0,0],[ww,0,150],[0,0,150]],clad?colors.oak:'#aa987e')];
    if(clad){
      for(let a=420;a<ww;a+=420)marks.push(path([a,0,150],[a,0,height-100],'#8a674c',.22));
      for(let d=400;d<depth;d+=400)marks.push(path([0,d,0],[ww,d,0],'#9a7d61',.2));
      for(let a=400;a<ww;a+=400)marks.push(path([a,0,0],[a,depth,0],'#9a7d61',.2));
    }
    for(const window of room.windows){
      const [l,r]=[window.centre-lo-window.width/2,window.centre-lo+window.width/2];
      const shade='#dcc69a';
      marks.push(quad([[l,0,0],[r,0,0],[Math.min(ww,r+740),depth,0],[Math.min(ww,l+630),depth,0]],shade));
      marks.push(quad([[l,0,window.sill],[r,0,window.sill],[r,0,window.spring],[l,0,window.spring]],colors.glass));
      marks.push('<path d="M'+pt(l,0,window.spring).join(' ')+' Q'+pt((l+r)/2,0,window.head+(window.head-window.spring)).join(' ')+' '+pt(r,0,window.spring).join(' ')+'" fill="'+colors.glass+'" stroke="#665747" stroke-width=".3"/>');
      marks.push(path([(l+r)/2,0,window.sill],[(l+r)/2,0,window.head],'#748477',.35));
    }
    const sorted = [...room.items].sort((a,b)=>(a.box[normalAxis]-b.box[normalAxis])*viewSign);
    for(const item of sorted){
      const h=item.height, box=item.box, a=Math.max(box[alongAxis]-lo,0), b=Math.min(ww,box[alongAxis]+box[alongAxis+2]-lo);
      const nearNormal=box[normalAxis]+(viewSign<0?box[normalAxis+2]:0);
      const c=Math.max(0,(nearNormal-room.normal)*viewSign), d=Math.min((nearNormal-room.normal)*viewSign+box[normalAxis+2],depth);
      if (a>=b || c>=d) continue;
      const cuboid=(x0,x1,y0,y1,z0,z1,top,front,side) => [
        quad([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],top),
        quad([[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],front),
        quad([[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]],side)
      ];
      if(item.type==='sofa' || item.type==='bed'){
        const soft = ['#aea38c','#8d8067','#7d715b'];
        const seat = h*.58;
        marks.push(...cuboid(a,b,c,d,0,seat,...soft),
          ...cuboid(a,b,c,Math.min(d,c+175),seat,h,...soft));
      }else{
        marks.push(...cuboid(a,b,c,d,0,h,'#a29272','#87755b','#75644e'));
      }
    }
    const [px,py]=pt(ww*.54,depth*.72,0);
    marks.push(silhouette(px,py,1670*.029));
    return marks;
  };
  return sheet(room.title+' · living with the finishes','Partial furnished cutaways comparing light, panelling and walking fields.', [
    text(12,26,'Daylight direction is illustrative. Window locations and shown plan furniture come from the same selected house.'),
    text(12,40,'Quiet mineral finish and conventional field','head'),text(154,40,room.title==='Family room'?'Full-height panelling and trial module rhythm':'Full-height panelling and visible module field','head'),
    ...image(12,false),...image(154,true),
    text(12,188,'Cutaway is cropped to a 2.6 m depth at the façade. Furniture is deliberately represented by simple scaled volumes.','small'),
    text(12,197,room.title==='Family room'?'Retain the conventional floor in this room with the shown furniture. The trial grid illustrates appearance.':'A selected proposal must preserve daylight, furniture use and existing wet, structural and service boundaries.','small')
  ]);
}

function kit(){
  return sheet('The workable interior kit','System families and disassembly sequence with owner-visible tradeoffs.',[
    text(12,26,'Reference palette: warm timber, pale washable mineral surfaces and local satin metal at named duties.'),
    text(12,45,'Assembly families and depth consequences','head'),
    ...families.flatMap(([name,,explanation],i)=>[text(12,56+i*11,name,'head'),text(62,56+i*11,explanation)]),
    text(12,133,'Controlled first release','head'),
    ...captureSequence.map((label,i)=>text(12+(i%2)*137,147+Math.floor(i/2)*11,(i+1)+' · '+label)),
    text(12,190,'Check clip/anchor, pad, backing, weather/fire seals, resulting loads, cleaning and replaceable constituents as complete assemblies.','small'),
    text(12,199,'The target is a practical, quiet room with fewer distinct parts. Deeper access and every added visible seam must earn their upkeep.','small')
  ]);
}
const files=[
  ['workable-room-assemblies.json',JSON.stringify(receipt,null,2)+'\n'],
  ['workable-family-elevation.svg',roomPair(plans[0])],
  ['workable-dining-elevation.svg',roomPair(plans[1])],
  ['workable-bedroom-elevation.svg',roomPair(plans[2])],
  ['workable-wet-elevation.svg',roomPair(plans[3])],
  ['workable-measured-sections.svg',measuredSections()],
  ['workable-assembly-kit.svg',kit()],
  ['workable-extra-junctions.svg',extendedSections()],
  ['workable-exploded-kit.svg',exploded()],
  ['workable-family-axon.svg',axonometric(plans[0])],
  ['workable-bedroom-axon.svg',axonometric(plans[2])]
];
for(const [name,content] of files){
  const target=new URL(name,import.meta.url);
  if(process.argv.includes('--check')) assert.equal(readFileSync(target,'utf8'),content,name+' source drift');
  else writeFileSync(target,content);
}
