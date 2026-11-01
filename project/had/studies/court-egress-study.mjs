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

if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const result=buildCourtEgressStudy(layoutRevision,revisionOpenings('GROUND'));
 const check=process.argv.includes('--check');
 for(const [name,content] of Object.entries(result.files)){
  const path=new URL(name,import.meta.url);
  if(check){if(readFileSync(path,'utf8')!==content)throw Error('Stale court-egress generated file: '+name);}
  else writeFileSync(path,content,'utf8');
 }
 console.log('HAD court-egress sources and generated evidence '+(check?'verified':'written'));
}
