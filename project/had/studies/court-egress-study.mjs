/** HAD-03 source-bound architectural screening renderer; no geometry adoption or engineering sizing. */
import {readFileSync,writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
import {layoutRevision,revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'

export const buildCourtEgressStudy = function build(d,ops){
 const fail=(label)=>{throw Error('HAD court section source changed: '+label)};
 const same=(actual,want,label)=>{if(Math.abs(actual-want)>1e-8)fail(label)};
 if(d.id!=='RH-LAYOUT-REVISION-02')fail('accepted identity');
 same(d.shell,12000,'shell');same(d.envelope,417.5,'wall');same(d.court.x,4250,'court x');same(d.court.y,4250,'court y');same(d.court.width,3500,'court width');same(d.court.depth,3500,'court depth');same(d.levels.ground,0,'FFL');
 const room=(id)=>{const r=d.rooms.GROUND.find(x=>x.id===id);if(!r||r.boxes.length!==1)fail('room '+id);return r.boxes[0]};
 const family=room('G-FAMILY'),pantry=room('G-PANTRY'),plant=room('G-PLANT');
 same(family.y,8167.5,'family start');same(family.depth,3832.5,'family depth');same(family.width,8167.5,'family width');same(pantry.x,9500,'pantry x');same(pantry.y,6650,'pantry y');same(pantry.depth,1455,'pantry depth');same(plant.y,2550,'plant position');
 const spine=d.partitions.GROUND.find(x=>x.id==='service-spine');if(!spine)fail('service spine');same(spine.a[0],9500,'spine');same(spine.b[1],8105,'spine north');
 const match=(wall,centre,kind='window')=>ops.find(o=>o.wall===wall&&o.kind===kind&&o.centre===centre);
 const cn=match('court-north',6000,'door'),gn=match('outer-north',6000,'door'),ce=match('court-east',6850),oe=match('outer-east',7400);
 for(const [id,o,w] of [['north court door',cn,2400],['garden door',gn,2400],['court east window',ce,1000],['outer east window',oe,1000]]){if(!o)fail(id);same(o.width,w,id+' width')}
 const nm=6000,em=7000,grade=-150,raised=1050,floor=300,access=900;
 const courtOuter=d.court.y+d.court.depth;
 same(courtOuter,7750,'court north edge');
 if(!(em>pantry.y&&em<pantry.y+pantry.depth&&em>=ce.centre-ce.width/2&&em<=ce.centre+ce.width/2&&em>=oe.centre-oe.width/2&&em<=oe.centre+oe.width/2))fail('E must cross pantry and both window bays');
 const plan={north:{axis:6000,sourceCourtEdge:7750,outer:12000,length:4250,intermediateThresholdAt:8167.5,sourceDoors:[cn.id,gn.id]},east:{axis:7000,sourceCourtEdge:7750,outer:12000,length:4250,galleryClear:[8167.5,9437.5],spine:[9437.5,9562.5],pantryClear:[9562.5,11582.5],intersectedWindowBays:[ce.id,oe.id]}};
 const data={basis:d.id,scope:'UNADOPTED paired architectural plan and section examination; no hydraulics, site datum, foundation sizing or approved water boundary',plan,referenceGradeZ:grade,referenceGradeKind:'schematic from shared RH interface contract; not surveyed',comparison:{floorT:floor,clearAccessH:access,freeboardF:'unknown',minimumFloorAboveFixedGradeBeforeF:floor+access,drawnFloorAboveSchematicGrade:d.levels.ground-grade,raisedFFLRelativeToExisting:raised,raisedFFLRelativeToFixedSchematicGrade:raised-grade,oldPanPerimeter:-180,oldPanLow:-215,raisedPanPerimeter:raised-180,raisedPanLow:raised-215,reliefTrialCrest:raised-75,reliefTargetWater:raised-50,lowestSusceptibleJoin:'unknown',actualNInvert:'unknown',actualEOperatingHead:'unknown',actualReceivingLevels:'unknown',siteLegalDestinations:'unknown',firstReleaseAndWithdrawal:'unknown'},loggia:{assumedWidth:gn.width,sourceFamilyRun:family.depth,displacedRectangleM2:gn.width*family.depth/1e6,interpretation:'unadopted gross rectangle; not net loss/structure after replan'},sourceWindowHeads:{courtEastSillAboveFFL:750,outerEastSillAboveFFL:750,admission:'nominal family convention, not verified product'},reservations:{supportPortals:'unknown',floorThermalGas:'unknown',surfaceOverflowAndInletProtection:'unknown',treeMovement:'unknown',accessibleApproach:'unknown'}};
 const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const T=(x,y,s,size=3.2,weight='normal',fill='#263138')=>`<text x="${x}" y="${y}" font-family="DejaVu Sans,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
 const R=(x,y,w,h,fill,stroke='#424c50',sw=.35,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
 const L=(x,y,xx,yy,color='#46565a',sw=.5,dash='')=>`<path d="M${x} ${y} L${xx} ${yy}" fill="none" stroke="${color}" stroke-width="${sw}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
 const P=(coords,color,sw=1.3,dash='')=>`<polyline points="${coords.map(q=>q.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
 const page=(title,sub,elements)=>`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" role="img" aria-label="${esc(title)}"><rect width="420" height="297" fill="#fffdf9"/>${T(15,17,title,5.4,'bold')}${T(15,25,sub,2.7)}<path d="M15 32 H405" stroke="#666a68" stroke-width=".35"/>${elements.join('')}<path d="M15 274 H405" stroke="#aeb5b3" stroke-width=".3"/>${T(15,282,'RH-LAYOUT-REVISION-02 · HAD-03 / RWT-06 · 1 November 2026 · exploratory geometry only',2.6)}${T(15,289,'Not a construction drawing. Invert, flood level, first-harm joint, supports, material assembly and lawful outlet remain UNDEFINED.',2.55)}</svg>`;
 const pX=x=>20+x/100,pY=y=>166-y/100;
 const pl=[];
 pl.push(T(20,41,'01 / CURRENT GROUND PLAN · 1:100 at A3',3.6,'bold'));
 pl.push(R(pX(0),pY(12000),120,120,'#d0d4d2'));
 pl.push(R(pX(417.5),pY(11582.5),(12000-2*417.5)/100,(12000-2*417.5)/100,'#f7f1e5','none',0));
 pl.push(R(pX(3832.5),pY(8167.5),4335/100,4335/100,'#d0d4d2','none',0));
 pl.push(R(pX(4250),pY(7750),35,35,'#e3f0eb','#60726f',.55));
 pl.push(R(pX(9500-62.5),pY(8105),1.25,8105/100,'#b5b9b7','none',0));
 pl.push(R(pX(9500),pY(8167.5),25,1.25,'#b5b9b7','none',0));
 const opening=(wall,lo,hi)=>{if(wall==='court-north'||wall==='outer-north'){const y=wall==='court-north'?7750:12000;const depth=417.5;pl.push(R(pX(lo),pY(y+(wall==='court-north'?depth:0)),(hi-lo)/100,depth/100,'#f7f1e5','none',0));pl.push(L(pX(lo),pY(y),pX(hi),pY(y),'#3d768e',1.2));}else{const x=wall==='court-east'?7750:12000;pl.push(R(pX(x),pY(hi),417.5/100,(hi-lo)/100,'#f7f1e5','none',0));pl.push(L(pX(x),pY(lo),pX(x),pY(hi),'#3d768e',1.2));}};
 opening('court-north',cn.centre-cn.width/2,cn.centre+cn.width/2);
 opening('outer-north',gn.centre-gn.width/2,gn.centre+gn.width/2);
 opening('court-east',ce.centre-ce.width/2,ce.centre+ce.width/2);
 opening('outer-east',oe.centre-oe.width/2,oe.centre+oe.width/2);
 pl.push(T(pX(4950),pY(5800),'OPEN COURT',3.5,'bold'),T(pX(1900),pY(9500),'FAMILY / DINING',2.8),T(pX(9760),pY(7440),'PANTRY',2.7),T(pX(9960),pY(4700),'PLANT',2.7),T(pX(8380),pY(5800),'GALLERY',2.5));
 pl.push(P([[pX(6000),pY(7600)],[pX(6000),pY(12600)]],'#146b72',2.1,'3 1.5'));
 pl.push(P([[pX(7700),pY(7000)],[pX(12600),pY(7000)]],'#aa5d38',2.1,'3 1.5'));
 pl.push(R(pX(6000)-1.7,pY(7600)-1.7,3.4,3.4,'#146b72','white',.6),R(pX(7700)-1.7,pY(7000)-1.7,3.4,3.4,'#aa5d38','white',.6));
 pl.push(T(pX(6100),pY(9100),'N',4,'bold','#146b72'),T(pX(8600),pY(7120),'E',4,'bold','#aa5d38'));
 pl.push(L(pX(6000),pY(12000),pX(6000),pY(12600),'#146b72',1.1),L(pX(12000),pY(7000),pX(12600),pY(7000),'#aa5d38',1.1));
 pl.push(T(20,180,'N / x=6000 passes below the north court and garden doors',2.8,'bold','#146b72'));
 pl.push(T(20,187,'E / y=7000 passes beneath the court and outer east window bays',2.8,'bold','#aa5d38'));
 pl.push(T(20,198,'Neither line is an approved structural opening, joint or gravity outfall.',2.65));
 pl.push(T(20,211,'North line cuts the family/dining slab across a 4.25 m gross ring.',2.65));
 pl.push(T(20,219,'East line cuts the east gallery, 125 mm spine and pantry.',2.65));
 pl.push(T(20,229,'Two destinations shown schematically: true independence is unproven.',2.65));
 pl.push(L(pX(9000),pY(0),pX(12000),pY(0),'#263138',.65));pl.push(T(pX(9700),pY(0)+5,'3 m',2.6));
 const notes=[
 'GEOMETRY THAT CAN BE STATED',
 'House 12.0 × 12.0 m; exposed court 3.5 × 3.5 m.',
 'North route: court edge to garden face = 4,250 mm.',
 'East route: court edge to outer face = 4,250 mm.',
 'The east passage crosses the 1,270 mm clear gallery,',
 'a nominal 125 mm partition and the 2,020 mm',
 'clear pantry before reaching the outer weather wall.',
 'Existing door and window bays do not admit a pipe',
 'below the threshold or sill without support design.',
 '',
 'MAJOR ARCHITECTURAL CHOICE',
 'B · raise house/plinth for a genuine dry undercroft.',
 'D · near-floor daylight relief with no crawlable space.',
 'C · open north loggia takes 9.198 m² from the source',
 'family/dining rectangle even before new weather walls.',
 '',
 'B remains conditional. D has no proven normal outfall.',
 'C is a real replan, not a drain detail.',
 'None is a source geometry amendment or selection.'
 ];
 notes.forEach((s,i)=>pl.push(T(166,48+i*8.2,s,i===0||i===10?3.1:2.9,i===0||i===10?'bold':'normal')));
 pl.push(T(20,243,'Plan paths are cross-sections to be designed: N = normal gravity; E = emergency passive escape.',2.7));
 pl.push(T(20,251,'The distinct N and E routes still need first-release, cleaning, renewal and independent receiving-ground proof.',2.7));
 const planSvg=page('COURTYARD EGRESS · SOURCE-BOUND PLAN', 'Unadopted N/E study axes · no architectural form, carrier or exterior water level selected',pl);
 const section=(axis)=>{
  const n=axis==='N',color=n?'#146b72':'#aa5d38',title=n?'02 / NORTH · COURT → FAMILY / DINING → GARDEN':'03 / EAST · COURT → GALLERY → PANTRY → OUTSIDE';
  const pts=[],x=mm=>25+(mm-4250)/25,y=z=>220-(z-grade)/25;
  const a=4250,courtEnd=7750,courtWallEnd=8167.5,outerWallStart=11582.5,outerEnd=12000;
  const dimensions=n?[
   ['court',4250,7750],['court boundary',7750,8167.5],['family / dining',8167.5,11582.5],['external wall',11582.5,12000]
  ]:[
   ['court',4250,7750],['court wall',7750,8167.5],['east gallery',8167.5,9437.5],['partition',9437.5,9562.5],['pantry',9562.5,11582.5],['outer wall',11582.5,12000]
  ];
  pts.push(T(25,41,title,3.7,'bold'));
  pts.push(T(25,48,'Section axis as shown in plan; horizontal and vertical dimensions 1:25 where geometrically grounded.',2.7));
  // show fixed schematic external level and original floor
  pts.push(L(x(a),y(grade),x(12600),y(grade),'#6c7774',.85,'2 1'));
  pts.push(T(x(10900),y(grade)+5,'fixed schematic exterior -150',2.5));
  pts.push(L(x(a),y(0),x(12000),y(0),'#a7b3b0',.7,'2 1'));
  pts.push(T(25,y(0)-2,'unchanged FFL z=0 (rejected dry-crawl drop-in)',2.7));
  // model floor from after court wall to outside, section T300
  pts.push(R(x(courtWallEnd),y(raised), (outerEnd-courtWallEnd)/25,floor/25,'#c7c9c6','#383e3d',.3));
  pts.push(L(x(courtWallEnd),y(raised),x(outerEnd),y(raised),'#263138',.8));
  pts.push(T(x(9250),y(raised)-3,'conditional raised FFL +1050',3,'bold'));
  // court top +1050 and low pan +870 /+835 illustration
  pts.push(L(x(a),y(raised),x(courtEnd),y(raised),'#303a3d',.9));
  for(let mm=4500;mm<7600;mm+=450)pts.push(L(x(mm),y(raised)-1.2,x(mm),y(raised)+1.2,'#60756d',.35));
  pts.push(P([[x(a),y(raised-180)],[x(6000),y(raised-215)],[x(courtEnd),y(raised-180)]],'#638b9c',1.1));
  pts.push(T(x(4930),y(raised-215)+8,'unadopted court pan -180 / -215 from raised FFL',2.6));
  // support/pier band below floor separate from upper closure; no filled portal in floor
  for(const [label,lo,hi] of dimensions){
    if(label.includes('wall')||label==='partition'||label.includes('boundary')){
      if(n){
        // The north cut coincides with both door apertures: never draw a masonry pier across the doorway.
        pts.push(R(x(lo),y(raised+790),(hi-lo)/25,790/25,'#f5f9f8','#3d768e',.45,'stroke-dasharray="2 1"'));
      }else{
        // The east cut is below two window bays; show solid load-bearing material only to nominal +750 sill.
        pts.push(R(x(lo),y(raised+750),(hi-lo)/25,750/25,'#adb3b0','#5d6462',.35));
      }
      // below floor unsized aperture demand, not open portal adopted
      pts.push(R(x(lo),y(raised-floor),(hi-lo)/25,(raised-floor-grade)/25,'none',color,.6,'stroke-dasharray="2 1.5"'));
    }
  }
  // actual window/door bays are above floor; source envelope must bridge below
  if(n){
    pts.push(T(x(7750),y(raised+730)-4,'COURT DOOR',2.6,'bold'));
    pts.push(T(x(11500),y(raised+730)-4,'GARDEN DOOR',2.6,'bold'));
  }else{
    pts.push(T(x(7740),y(raised+730)-4,'COURT WINDOW ABOVE',2.5,'bold'));
    pts.push(T(x(11100),y(raised+730)-4,'SIDE WINDOW ABOVE',2.5,'bold'));
  }
  const voidTop=y(raised-floor),voidBottom=y(grade);
  pts.push(R(x(courtWallEnd),voidTop,(outerWallStart-courtWallEnd)/25,voidBottom-voidTop,'#e6eee9','#aac0b6',.25,'stroke-dasharray="2 1"'));
  pts.push(T(x(9250),voidTop+10,'900 mm theoretical clear zone',2.7,'bold','#49655c'));
  pts.push(T(x(9300),voidTop+16,'bearing, access and gas/water edge unproven',2.45));
  // below floor water paths conceptual, disjoint receiving outlet
  if(n){
    pts.push(P([[x(7450),y(raised-215)],[x(7620),y(raised-430)],[x(8180),y(raised-460)],[x(9500),y(raised-520)],[x(12000),y(raised-600)],[x(12600),y(raised-620)]],color,1.8,'3 1.1'));
    pts.push(T(x(10500),y(raised-620)+8,'N · unselected invert / receiving level',2.7,'bold',color));
  }else{
    pts.push(P([[x(7440),y(raised-75)],[x(7620),y(raised-350)],[x(8168),y(raised-450)],[x(9600),y(raised-520)],[x(12000),y(raised-620)],[x(12600),y(raised-640)]],color,1.8,'3 1.1'));
    pts.push(T(x(10200),y(raised-640)+8,'E · crest and operating head UNTESTED',2.7,'bold',color));
  }
  pts.push(T(x(12600)+4,y(raised-640)-2,'?',4,'bold',color));
  // markers for threshold first harmed boundary, never definite
  pts.push(T(x(7900),y(raised)-6,'? first harmed join',2.7,'bold','#922e2e'));
  pts.push(L(x(8000),y(raised)-4,x(7880),y(raised-20),'#922e2e',.55));
  pts.push(T(25,231,`Surface: raised court top +1050; schematic outside grade -150; floor package 300; nominal clear 900 (F=0 only).`,2.6));
  pts.push(T(25,238,`An actual flood reserve F and site receiving levels are not set. Underfloor route and openings are *not* sized.`,2.6));
  if(n){
    pts.push(T(25,250,'N: crossing passes under BOTH 2400 mm doorway thresholds. Their continuous support and dry closure are unresolved.',2.7));
    pts.push(T(25,257,'Normal inlet at court pan needs separate inspection, water-isolation and replaceable carrier joining.',2.7));
    pts.push(T(25,264,'Carrier cannot borrow the loadbearing doorway width: portal, arch and movement interfaces remain STR/OAS/IAS.',2.7));
  }else{
    pts.push(T(25,250,'E: the y=7000 section passes below court and exterior WINDOWS; no window/sill may be weakened by a slot.',2.7));
    pts.push(T(25,257,'A full-duty emergency path crosses 1270 mm gallery, 125 mm service partition and 2020 mm pantry.',2.7));
    pts.push(T(25,264,'Relief weir crest is not its FLOWING head; common high tailwater and first-harm joint remain unproved.',2.7));
  }
  return page(n?'COURTYARD EGRESS · NORTH SECTION':'COURTYARD EGRESS · EAST SECTION','CONDITIONAL RAISED-HOUSE OPTION B; NOT AN ACCEPTED FLOOR OR EXTERIOR DISCHARGE DESIGN',pts);
 };
 return {data,files:{'court-egress-plan.svg':planSvg,'court-egress-north-section.svg':section('N'),'court-egress-east-section.svg':section('E'),'court-egress-study.json':JSON.stringify(data,null,2)+'\n'}};
};



// Bounded rigid-envelope motion: no selected fastener, gasket or human handling claim.
export function verifyCrossingRenewal(c,{inletInvert=-320,carrierHeight=160,coverDepth=100,boxBottom=-400,removedNeighbor=c.requiredInitialRemovedNeighbor,totalLift=c.totalLift}={}){
 const fail=s=>{throw Error('Crossing renewal rejected: '+s)};
 if(!removedNeighbor||removedNeighbor[0]>c.destination[0]||removedNeighbor[1]<c.destination[1])fail('adjacent segment still occupies withdrawal destination');
 if(c.piece[0]>c.permanent[0]-25||c.piece[1]<c.permanent[1]+25)fail('joint termination beneath permanent support');
 const end=c.piece.map(x=>x+c.translation);
 if(end[0]!==c.destination[0]||end[1]!==c.destination[1])fail('translated piece differs from declared destination');
 if(removedNeighbor[0]>end[0]||removedNeighbor[1]<end[1])fail('actual translated interval remains occupied');
 if(!(end[1]<=c.permanent[0]||end[0]>=c.permanent[1]))fail('piece still below fixed cap before lift');
 if(end[0]<c.clearRoom[0]||end[1]>c.clearRoom[1])fail('withdrawn piece outside clear room');
 const samples=[];
 for(let i=0;i<=50;i++){
  const a=c.piece[0]+c.translation*i/50,b=c.piece[1]+c.translation*i/50;
  const top=inletInvert-(a-7750)*.01+carrierHeight,bottom=inletInvert-(b-7750)*.01;
  if(top>-coverDepth||bottom<boxBottom)fail('translation crosses fixed cover or service-box bottom');
  samples.push({fraction:i/50,start:a,end:b,top,bottom});
 }
 const lowestBottom=inletInvert-(end[1]-7750)*.01;
 if(lowestBottom+totalLift<50)fail('full extraction does not clear FFL by50 mm');
 return {samples: samples.length,bridgeIntact:true,adjacentSegmentAbsent:true,finalLowestBottom:lowestBottom+totalLift};
}

/** An authored architectural allocation, deliberately separate from adopted house geometry. */
export function buildLocalPortalCandidate(d,ops){
 const source=buildCourtEgressStudy(d,ops).data;
 const scanWidth=600,axisE=7125,fflRise=300,relativeHeight=450,cover=100;
 const inletInvert=-320,carrierHeight=160,carrierWidth=200,run=source.plan.north.length;
 const outletInvert=inletInvert-run*.01;
 const band=[axisE-scanWidth/2,axisE+scanWidth/2];
 const slots={north:{axis:6000,band:[5700,6300],run:[7750,12000],coverSegments:[]},east:{axis:axisE,band,run:[7750,12000],coverSegments:[]}};
 // Avoid tiny pieces: the permanent wall/spine crossings have independent bridge caps;
 // occupied-floor covers split each clear run into equal pieces no longer than 500 mm.
 for(const [key,breaks] of Object.entries({north:[7750,8167.5,11582.5,12000],east:[7750,8167.5,9437.5,9562.5,11582.5,12000]})){
  const s=slots[key];s.coverSegments=[];s.coverBreaks=[breaks[0]];
  for(let i=1;i<breaks.length;i++){
   const n=Math.ceil((breaks[i]-breaks[i-1])/500),len=(breaks[i]-breaks[i-1])/n;
   for(let j=1;j<=n;j++){s.coverSegments.push(len);s.coverBreaks.push(breaks[i-1]+j*len)}
  }
 }
 const crossingRenewal=[
  {route:'north',permanent:[7750,8167.5],piece:[7725,8225],destination:[8225,8725],translation:500,clearRoom:[8167.5,11582.5]},
  {route:'north',permanent:[11582.5,12000],piece:[11550,12050],destination:[11050,11550],translation:-500,clearRoom:[8167.5,11582.5]},
  {route:'east',permanent:[7750,8167.5],piece:[7725,8225],destination:[8225,8725],translation:500,clearRoom:[8167.5,9437.5]},
  {route:'east',permanent:[9437.5,9562.5],piece:[9225,9725],destination:[8725,9225],translation:-500,clearRoom:[8167.5,9437.5]},
  {route:'east',permanent:[11582.5,12000],piece:[11550,12050],destination:[11050,11550],translation:-500,clearRoom:[9562.5,11582.5]}
 ].map(c=>({...c,verticalTranslationAtOnePercent:-c.translation*.01,totalLift:450,requiredInitialRemovedNeighbor:c.destination}));
 // Wet-piece joints are distinct from architectural cover breaks. Reserve actual
 // neighbor pieces for both local withdrawal destinations; fill remaining gaps.
 const wetSegments={};
 for(const route of ['north','east']){
  const fixed=crossingRenewal.filter(c=>c.route===route).flatMap(c=>[c.piece,c.destination]).sort((a,b)=>a[0]-b[0]);
  const parts=[];let cursor=7725;
  for(const interval of fixed){
   if(interval[0]<cursor)throw Error('Overlapping wet-piece reservations');
   const gap=interval[0]-cursor,n=Math.ceil(gap/500);
   for(let i=0;i<n;i++)parts.push([cursor+gap*i/n,cursor+gap*(i+1)/n]);
   parts.push(interval);cursor=interval[1];
  }
  wetSegments[route]=parts;
 }
 for(const c of crossingRenewal){
  if(!wetSegments[c.route].some(p=>p[0]===c.destination[0]&&p[1]===c.destination[1]))throw Error('No removable neighbor at crossing destination');
  c.envelopeWitness=verifyCrossingRenewal(c);
 }
 const plantDry=d.services.plantDry,work=d.services.plantWorking;
 const intersect=(a,b)=>Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0]));
 const data={basis:d.id,sourceRole:'Accepted source supplies intersections only; all portal dimensions below are an UNADOPTED reference design.',decision:'Allocate pantry E-W1 and north N as the single joined architectural candidate. Reject E-P as an unchanged-plant installation; do not infer structural or water acceptance.',
  referenceDesign:{relativeFFLAboveSyntheticReceiver:relativeHeight,wholeHouseRiseRelativeToExisting:fflRise,receiverRelativeToFFL:-relativeHeight,receiverRole:'synthetic comparison, not a site high-water datum',grossAccessWidth:scanWidth,carrierOutsideWidth:carrierWidth,carrierOutsideHeight:carrierHeight,inletInvert,outletInvert,terminalInvertAt12050:outletInvert-.5,fall:run*.01,coverDepth:cover,minCrownDepth:-inletInvert-carrierHeight,installationSpaceBelowCover:-inletInvert-carrierHeight-cover,lowestServiceBox:-400,outletInvertClearanceAboveSyntheticReceiver:outletInvert+relativeHeight,normalPanPerimeter:-86,normalPanLow:-121,normalCollectorToCarrierDrop:199,emergencyTrialCrest:-75,emergencyOperatingWater:'unknown',lowestSusceptibleJoint:'unknown',hydraulicCapacity:'unproven',completeMaterialAssembly:'unqualified'},slots,crossingRenewal,wetSegments,
  eastConsequences:{pantryBand:band,courtWindowProjection:[6350,7350],outerWindowProjection:[6900,7900],courtProjectionOverrun:Math.max(0,band[1]-7350),outerProjectionOverrun:Math.max(0,6900-band[0]),remainingPantryStrips:[band[0]-6650,8105-band[1]],fixedStorageInBand:'prohibited in candidate; current pantry has no adopted fitted storage model'},
  rejectedPier:{axis:6000,grossBand:[5700,6300],nominalCourtPierShoulders:[50,50],fixedPlantDryOverlap:intersect([5700,6300],[plantDry.y,plantDry.y+plantDry.depth]),workingFloorOverlap:intersect([5700,6300],[work.y,work.y+work.depth]),interpretation:'Fixed plant obstruction requires reallocation. Working-floor overlap alone is not fixed obstruction: closed load-capable covers may serve working floor, but repair needs plant isolation and a second usable route.'},
  support:'Two permanent longitudinal edge supports lie outside each 600 mm access corridor. Independently supported threshold/window/spine bridge caps span the corridor; the carrier supports neither floor nor masonry. All member sizes, reactions and thermal/gas/water continuity remain unproved.',
  repair:{segmentMaxLength:500,coverMaxLength:500,coverWidth:600,carrierJointEnvelopeWidth:300,clearSideToolSpace:150,totalVerticalLiftInOpenFloor:450,firstRelease:'Lift a dry floor cover; isolate/empty N at exposed court inlet while E stays operative. For E repair provide an independently admitted temporary rain diversion or postpone repair: N alone is not equivalent redundancy.',joint:'Top-access detachable all-metal-joint trial; seal, bolt access and repeated watertight reinstatement must be proved before admission.',removal:'Room segments lift450 mm through removed covers. Fixed bridge crossings first translate500 mm into an emptied adjacent500 mm segment position, following1% slope (5 mm vertical change), then lift450 mm. Both joint terminations are at least25 mm outside the wall/spine; actual bolt/tool approach remains unproved; bridge remains intact. No4.25 m axial withdrawal is assumed.',leakage:'A separate exposed inspection/secondary-containment space is reserved, but passive external declaration and its own water boundary are unresolved; no dry-floor claim.'},
  approach:{extraRise:300,illustrativeGradient:'1:20 arithmetic only, not access approval',horizontalRunBeforeLandings:6000,availableSiteLength:'unknown'},
  acceptance:'NOT ACCEPTED. This closes the room/route allocation choice for the next joined section; HAD-03 and RWT-06 remain incomplete/blocked. Actual support, complete no-plastic wet/thermal/gas floor, first-harm joints, full-duty flow and independent event-bound receivers can reject this candidate.'};
 const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const t=(x,y,s,size=3)=>`<text x="${x}" y="${y}" font-family="DejaVu Sans,Arial,sans-serif" font-size="${size}" fill="#233b42">${esc(s)}</text>`;
 const r=(x,y,w,h,fill,stroke='#506569')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width=".35"/>`;
 const l=(x,y,xx,yy,color='#506569')=>`<path d="M${x} ${y}L${xx} ${yy}" stroke="${color}" stroke-width=".6" fill="none"/>`;
 const page=(title,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" role="img" aria-label="${esc(title)}"><rect width="420" height="297" fill="#fffdf8"/>${t(15,18,title,5)}${t(15,27,'UNADOPTED reference design · accepted source intersections, authored section and room reservations',2.8)}${l(15,33,405,33)}${body.join('')}${l(15,275,405,275)}${t(15,284,'No structural sizing, complete material assembly, site datum, hydraulic capacity or first-harm acceptance.',2.8)}${t(15,291,'HAD-03 remains planned · RWT-06 remains blocked · RH-LAYOUT-REVISION-02 · 1 November 2026',2.8)}</svg>\n`;
 const plan=[],X=x=>20+x/100,Y=y=>169-y/100;
 plan.push(r(X(0),Y(12000),120,120,'#cbd0cb'),r(X(417.5),Y(11582.5),111.65,111.65,'#f1ecdf'),r(X(3832.5),Y(8167.5),43.35,43.35,'#cbd0cb'),r(X(4250),Y(7750),35,35,'#d7ebe7'));
 plan.push(r(X(9437.5),Y(8105),1.25,81.05,'#b9c1bc'));
 for(const [key,s]of Object.entries(slots)){
  const n=key==='north',color=n?'#5a9894':'#b78254';
  plan.push(n?r(X(s.band[0]),Y(12000),6,42.5,color):r(X(7750),Y(s.band[1]),42.5,6,color));
  for(const z of s.coverBreaks)plan.push(n?l(X(5700),Y(z),X(6300),Y(z)):l(X(z),Y(band[0]),X(z),Y(band[1])));
 }
 plan.push(t(25,82,'FAMILY',2.5),t(119,88,'PANTRY',2.3),t(118,116,'PLANT',2.4),t(102,112,'GALLERY',2.2));
 plan.push(t(68,68,'N',4),t(104,94,'E-W1',3),t(165,47,'Plan 1:100 at A3. All covers lift from the occupied side.',3.4));
 const notes=['N: x5700–6300 through both door thresholds and family floor.','E: y6825–7425 via east gallery, service spine and pantry.','No fixed pantry cabinets or appliance bases in the E strip.','Pantry residual y-strips: 175 mm south / 680 mm north.','These are not both usable storage depths: E corridor is floor.','E cover crosses window projection edges by 75 mm.','Therefore a separately engineered window-base bridge is mandatory.','Four bedrooms, 12 m shell and room partitions stay as source.','Candidate raises all building levels 300 mm relative to fixed grade.','Front/rear step-free approach needs a real site: 6 m at 1:20','before landings is arithmetic; no site length is claimed.','','E-P at y6000: 600 mm access strip overlaps fixed plant 600 mm.','Do not substitute a 300 mm wet piece for full repair width.','No plant reallocation has been earned; retain it as rejected drop-in.','','Covers <=500 mm long; walls/spine have independent bridge caps.','Room covers may carry routine traffic only after load proof.','Door/window support must survive every carrier-removal state.'];notes.forEach((s,i)=>plan.push(t(165,58+i*9.8,s,2.85)));
 plan.push(t(20,190,'Room pieces lift 450; crossing pieces shift 500 then lift 450 mm.',3),t(20,200,'Nominal carrier joint width 300 inside 600 access strip.',2.8),t(20,210,'Remove the adjacent piece before withdrawing a fixed-cap crossing.',2.6),t(20,224,'N and E remain distinct until exterior receivers: no shared sump.',2.7),t(20,237,'Opposite destinations do not establish event independence.',2.7),t(20,250,'Furniture and safe temporary rain routing govern repair states.',2.7));
 const sections=[];
 for(const [i,key]of ['north','east'].entries()){
  const s=slots[key],xx=q=>30+(q-7750)/25,yy=z=>73+i*74-z/25;
  sections.push(t(20,45+i*74,key==='north'?'N / NORTH LONGITUDINAL 1:25':'E-W1 / EAST LONGITUDINAL 1:25',3.5));
  const pan=key==='north'?-121:-75;
  sections.push(l(xx(7350),yy(pan),xx(7650),yy(pan),'#267b80'),l(xx(7650),yy(pan),xx(7750),yy(inletInvert),'#267b80'));
  sections.push(t(14,yy(pan)-3,key==='north'?'pan -121':'crest -75',2.4));
  sections.push(r(xx(7750),yy(0),170,cover/25,'#d6ccae'));
  sections.push(r(xx(7750),yy(-100),170,300/25,'#edf0e9'));
  sections.push(l(xx(7750),yy(inletInvert),xx(12000),yy(outletInvert),'#267b80'),l(xx(7750),yy(inletInvert+carrierHeight),xx(12000),yy(outletInvert+carrierHeight),'#267b80'));
  for(const z of s.coverBreaks)sections.push(l(xx(z),yy(0),xx(z),yy(-100)));
  for(const [a,b]of key==='north'?[[7750,8167.5],[11582.5,12000]]:[[7750,8167.5],[9437.5,9562.5],[11582.5,12000]]){
   // Doors have no above-floor masonry upstand. A dashed below-FFL reservation
   // identifies the independent threshold bridge; it does not size that support.
   if(key==='north')sections.push(r(xx(a),yy(0),(b-a)/25,cover/25,'none','#964d39').replace('/>',' stroke-dasharray="1 1"/>'));
   else sections.push(r(xx(a),yy(350),(b-a)/25,350/25,'#b6bdb5'));
  }
  sections.push(t(212,60+i*74,key==='north'?'Dashed: below-FFL bridge reservation':'Grey: truncated wall above floor',2.6),t(212,67+i*74,key==='north'?'No upstand; support sizing unproved.':'Not a selected wall/sill height.',2.6),t(212,75+i*74,'Red: piece-centre shift 500 / lift 450 mm.',2.6));
  sections.push(l(xx(12000),yy(-450),xx(12900),yy(-450),'#9c684b'),t(212,yy(-450)+5,'synthetic receiver -450',2.6));
  const crossing=crossingRenewal.find(c=>c.route===key),centre=(crossing.piece[0]+crossing.piece[1])/2,cz=inletInvert-(centre-7750)*.01+carrierHeight/2,translatedZ=cz+crossing.verticalTranslationAtOnePercent;
  sections.push(l(xx(centre),yy(cz),xx(centre+crossing.translation),yy(translatedZ),'#964d39'),l(xx(centre+crossing.translation),yy(translatedZ),xx(centre+crossing.translation),yy(translatedZ+crossing.totalLift),'#964d39'));
  sections.push(t(30,102+i*74,'Inlet invert -320; outside height 160; 1% fall 42.5; exit invert -362.5 mm.',2.85));
 }
 sections.push(t(20,205,'TRANSVERSE 1:10 / authored space, no member sizing',3.4));
 sections.push(l(43,216,43,256),l(103,216,103,256),l(35,219,43,224),l(35,234,43,239),l(35,249,43,254),l(103,219,111,224),l(103,234,111,239),l(103,249,111,254),r(43,216,60,10,'#d6ccae'),r(43,226,60,30,'#edf0e9'),r(63,232,20,16,'#75a8a1'));
 sections.push(t(124,216,'600 clear access; hatched sides are cropped support territories.',2.8),t(124,225,'100 cover package; 60 space above inlet carrier crown.',2.8),t(124,234,'160 carrier height; installation and joint envelope explicit.',2.8),t(124,243,'Support depths / floor U-value / gas seals are unproved.',2.8),t(124,252,'Secondary containment/declaration route remains unresolved.',2.8),t(124,263,'Keep caps intact: crossing shifts 500, then lifts 450 mm in open floor.',2.8));
 return {data,files:{'court-local-portals.json':JSON.stringify(data,null,2)+'\n','court-local-portals-plan.svg':page('COURT LOCAL PORTALS / ONE JOINED ROOM ALLOCATION',plan),'court-local-portals-sections.svg':page('COURT LOCAL PORTALS / LONGITUDINAL AND TRANSVERSE SECTIONS',sections)}};
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const result=buildCourtEgressStudy(layoutRevision,revisionOpenings('GROUND'));
 Object.assign(result.files,buildLocalPortalCandidate(layoutRevision,revisionOpenings('GROUND')).files);
 const check=process.argv.includes('--check');
 for(const [name,content] of Object.entries(result.files)){
  const path=new URL(name,import.meta.url);
  if(check){if(readFileSync(path,'utf8')!==content)throw Error('Stale court-egress generated file: '+name);}
  else writeFileSync(path,content,'utf8');
 }
 console.log('HAD court-egress sources and generated evidence '+(check?'verified':'written'));
}
