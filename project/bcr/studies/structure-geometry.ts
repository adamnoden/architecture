/** Source-bound spatial sensitivity study. No selected member, load or structural capacity. */
import {writeFileSync,readFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {layoutRevision as d,entryVoid,revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'
import {layoutSectionAt,currentRoofZ,layoutFamilySource} from '../../../compiler/reference-house/georgian/layout-family.js'
import {sectionAssemblyChoices as a,sectionAssemblyModels} from '../../../compiler/reference-house/georgian/section-source.js'
const checking=process.argv.includes('--check');
const emit=(name:string,body:string)=>{const path=new URL(name,import.meta.url);if(checking){if(readFileSync(path,'utf8')!==body)throw new Error(`Stale artifact: ${name}`)}else writeFileSync(path,body)};
const sources=['compiler/reference-house/georgian/layout-revision.ts','compiler/reference-house/georgian/layout-family.ts','compiler/reference-house/georgian/section-source.ts','compiler/reference-house/georgian/section-exemplar.ts'];
const s=d.stair, rise=s.floorRise/s.risers, f=a.floor;
const courtDoor=revisionOpenings('GROUND').find(o=>o.wall==='court-south'&&o.kind==='door')!;
const doorInterval=[courtDoor.centre-courtDoor.width/2,courtDoor.centre+courtDoor.width/2];
const layerDepth=f.finish+f.deck+f.joist+f.void+f.ceiling;
const cases=[350,400,450].map(totalDepth=>({totalDepth,framingDepthIfOtherLayersHeld:totalDepth-(layerDepth-f.joist),soffit:d.levels.first-totalDepth,
  lowerFlightLastYAt2000Headroom:s.y+(d.levels.first-totalDepth-2000-rise)*s.going/rise,
  nosing6Headroom:d.levels.first-totalDepth-6*rise,nosing7Headroom:d.levels.first-totalDepth-7*rise}));
const cuts=[5900,10100,1000,2200].map(x=>{const m=layoutSectionAt(x);return {x,court:m.court,voidCut:m.voidCut,floorRuns:m.floorRuns,firstFloorRuns:m.firstFloorRuns,partitions:m.partitions.map(p=>({id:p.id,at:p.at,base:p.base})),floors:sectionAssemblyModels(m,y=>currentRoofZ(x,y)-layoutFamilySource.roofBuildZone,{firstFloorRuns:m.firstFloorRuns,storageDeckRuns:m.storageDeckRuns}).floors.filter(v=>v.id.startsWith('first-floor')).map(v=>({id:v.id,left:v.left,right:v.right,top:v.top,seats:v.seats,layers:v.layers.map(l=>({id:l.id,thickness:l.thickness,endGap:l.endGap}))}))}});
const record={scope:'Current source geometry and expressly hypothetical support/depth sensitivity, not structural design or a selected stair opening',sourceBlobs:Object.fromEntries(sources.map(p=>[p,execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim()])),
  shell:d.shell,envelope:d.envelope,court:d.court,entryVoid,stair:s,ordinaryWingClear:d.court.x-2*d.envelope,
  sectionLineWithoutCourt:d.shell-2*d.envelope,bridgeBand:d.court.y-d.envelope-(entryVoid.y+entryVoid.depth),
  floor:{finish:f.finish,deck:f.deck,framing:f.joist,service:f.void,ceiling:f.ceiling,total:layerDepth,top:d.levels.first,soffit:d.levels.first-layerDepth,joistTop:d.levels.first-f.finish-f.deck,joistBottom:d.levels.first-f.finish-f.deck-f.joist,seatBottom:d.levels.first-f.finish-f.deck-f.joist-f.seatDepth,endGap:f.endGap,seatProjection:f.seatProjection,seatDepth:f.seatDepth},
  entranceFrameOptions:{courtDoorInterval:doorInterval,voidEdgeLines:[entryVoid.x,entryVoid.x+entryVoid.width],voidEdgeLinesInsideCourtDoor:[entryVoid.x,entryVoid.x+entryVoid.width].map(x=>x>doorInterval[0]&&x<doorInterval[1]),offsetTrialLines:[4600,7400],offsetTrialHeaderSpan:2800,offsetFromVoid:262.5,trialBasis:'Authored sensitivity lines in source solid front/court pier strips, not selected beam locations or adequate bearings'},
  stairOpeningOptions:{fullFootprint:[s.x,s.y,s.x+s.width,s.y+s.length],lowerFlightX:[s.x,s.x+s.flight],returnFlightX:[s.x+s.flight+s.well,s.x+s.width],steppedEdgeLimits:cases.map(c=>({totalDepth:c.totalDepth,lowerFlightEdgeY:c.lowerFlightLastYAt2000Headroom})),basis:'Opening envelope alternatives only; no trimmer sizes, reactions, edge tolerances or bearing positions selected'},
  depthCases:cases,depthCaseBasis:'350 is the held source package; 400/450 are +50/+100 total-depth perturbations, not structurally sized or selected products. Nonframing layers held.',
  headroomDiagnostic:2000,headroomBasis:'Approved Document K2013 para1.11/Diagram1.3; diagnostic only, no actual overhead slab/beam asserted',
  lowerFlightNosing:[6,7,10].map(n=>({n,y:s.y+(n-1)*s.going,z:n*rise})),
  halfRoofPlanRun:d.roof.ridgeInset,halfRoofSlopeLength:d.roof.ridgeInset/Math.cos(d.roof.upperPitchDeg*Math.PI/180),cuts};
emit('./structure-geometry.json',JSON.stringify(record,null,2)+'\n');
const esc=(x:string)=>x.replaceAll('&','&amp;').replaceAll('<','&lt;');
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><style>text{font-family:Arial,sans-serif;font-size:3px;fill:#172b36}.title{font-size:6px;font-weight:bold}.sub{font-size:4px;font-weight:bold}.dim{stroke:#3b7185;fill:none;stroke-width:.4}.warn{stroke:#b34932;fill:none;stroke-width:.55;stroke-dasharray:2 1}.edge{stroke:#293b45;fill:none;stroke-width:.35}</style>';
const text=(x:number,y:number,t:string,cl='')=>svg+=`<text x="${x}" y="${y}" class="${cl}">${esc(t)}</text>`;
const line=(x:number,y:number,xx:number,yy:number,cl='dim')=>svg+=`<path d="M${x},${y} L${xx},${yy}" class="${cl}"/>`;
const rect=(x:number,y:number,w:number,h:number,fill:string)=>svg+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#293b45" stroke-width=".3"/>`;
text(10,13,'Structure: support obligations and space consumed','title');
text(10,22,'RH-LAYOUT-REVISION-02 | 29 October 2026 | geometry study, not selected framing or engineering capacity');
text(10,31,'A  Current plan and conditional support directions / 1:100','sub');
const px=12,py=41,S=100;
const planRect=(x:number,y:number,w:number,h:number,fill:string)=>rect(px+x/S,py+(12000-y-h)/S,w/S,h/S,fill);
planRect(0,0,12000,12000,'#d6dde0');planRect(d.envelope,d.envelope,12000-2*d.envelope,12000-2*d.envelope,'#eff2f3');
planRect(d.court.x-d.envelope,d.court.y-d.envelope,d.court.width+2*d.envelope,d.court.depth+2*d.envelope,'#d6dde0');planRect(d.court.x,d.court.y,d.court.width,d.court.depth,'white');
planRect(entryVoid.x,entryVoid.y,entryVoid.width,entryVoid.depth,'#f4ddbd');planRect(s.x,s.y,s.width,s.length,'#f4d4ce');
const pl=(x:number,y:number,xx:number,yy:number,cl='dim')=>line(px+x/S,py+(12000-y)/S,px+xx/S,py+(12000-yy)/S,cl);
for(const x of [3300,8700])pl(x,800,x,3300);for(const x of [3300,8700])pl(x,8700,x,11200);for(const y of [5000,7000])pl(8500,y,11200,y);pl(1000,9000,3300,9000);
for(const x of [4600,7400])pl(x,417.5,x,3832.5);pl(4600,2712.5,7400,2712.5);
pl(5900,0,5900,12000,'warn');text(70,39,'A');text(70,168,'A');
text(57,106,'Open court');text(59,147,'Entry void');text(18,115,'Stair');
text(10,178,'Blue: possible short-way floor strips, not joist design.');
text(10,185,'Ordinary wall-face distance 3415; service section line 11165.');
text(10,192,'The long section line does not select an 11165 member span.');
text(10,199,'Orange void interrupts front strip; red stair needs actual');
text(10,206,'opening/trimmers. No column, beam or bearing is adopted.');
text(160,31,'B  Held intermediate package / 1:5','sub');
let yy=42;for(const [label,t,fill] of [['finish',f.finish,'#e8dbc7'],['deck',f.deck,'#d4c3a4'],['framing reserve',f.joist,'#eff2f3'],['service void',f.void,'white'],['ceiling',f.ceiling,'#d6dde0']] as const){rect(160,yy,40,t/5,fill);text(204,yy+t/10+1,`${label} ${t} mm`);yy+=t/5;}
text(160,123,'Top +3450 / soffit +3100; total 350.');text(160,130,'Framing 238 is a zone, not a sized joist.');text(160,137,'+50/+100 depth removes equal headroom');text(160,144,'if FFL and other layers are held.');
text(292,31,'C  Lower flight and overhead sensitivity / 1:50','sub');
const x0=294,y0=139,sc=50;
for(let n=1;n<=10;n++){const u=(n-1)*s.going,z=n*rise;line(x0+u/sc,y0-z/sc,x0+(u+s.going)/sc,y0-z/sc,'edge');if(n<10)line(x0+(u+s.going)/sc,y0-z/sc,x0+(u+s.going)/sc,y0-(z+rise)/sc,'edge');}
for(const c of cases)line(x0,y0-c.soffit/sc,x0+4300/sc,y0-c.soffit/sc,'warn');
text(294,56,'Dashed levels: 3100 / 3050 / 3000');
line(x0,y0-(rise+2000)/sc,x0+2700/sc,y0-(10*rise+2000)/sc);text(293,155,'Blue: pitch line plus 2000 vertical clearance.');text(293,162,'Red: hypothetical soffits 3100/3050/3000.');text(293,169,'No actual slab is asserted across the stair.');
text(160,181,'D  Entrance void and bearing boundary','sub');text(160,190,'Void x 4862.5–7137.5; y 417.5–2712.5.');text(160,198,'Bridge band y 2712.5–3832.5: 1120 before guards.');text(160,206,'Void-edge side trimmers land over court door 4800–7200.');text(160,214,'Blue trial frame x 4600/7400 instead reaches pier strips:');text(160,222,'header span 2800 and 262.5 side offsets, not sized beams.');text(160,230,'Support, guards and services must fit the same section.');
line(10,240,410,240);text(10,251,'No loads, strengths, member capacities, foundation size or fixing schedule inferred. Source-based dimensions are model millimetres.');
text(10,259,'Depth 350 is held; 400/450 are sensitivity variables only. Read bcr-structure-result.md and structure-geometry.json for exact evidence and limits.');
text(10,267,'Source fingerprints and reproducible calculation: project/bcr/studies/structure-geometry.ts. Selected roof, floor and stair framing remain unresolved.');
text(10,279,'A3 study sheet / printed scales apply at 100% / schematic load directions and warning boundaries are not construction instructions.');svg+='</svg>\n';
emit('./structure-geometry.svg',svg);console.log(JSON.stringify({floor:record.floor,depthCases:cases,cuts:cuts.map(({x,floorRuns,firstFloorRuns})=>({x,floorRuns,firstFloorRuns}))},null,2));
