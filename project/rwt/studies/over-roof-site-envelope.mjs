/* Bounded, source-owned TEMPORARY over-roof footprint screen. Not an accepted plot or works design. */
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
const root=new URL('../../../',import.meta.url)
const path='project/rwt/studies/over-roof-service.json'
const bytes=readFileSync(new URL(path,root))
const blob=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')
if(blob!=='fe27b9697b5da34213d506f5c1bbd871db51a636')throw Error('RWT over-roof source changed: reassess site reservation')
const source=JSON.parse(bytes)
const calculate=function calculate(m){
  const shell=m.assumptions.houseShellMm, halfBoard=m.scaffoldAxisTrial.soleBoardTrialMm/2;
  const boards=[];
  for(const x of [...m.scaffoldAxisTrial.westernAxesMm,...m.scaffoldAxisTrial.easternAxesMm])
    for(const y of m.scaffoldAxisTrial.bayAxesYMm)
      boards.push({id:'board-'+x+'-'+y,kind:'scaffold-sole-board',x:[x-halfBoard,x+halfBoard],y:[y-halfBoard,y+halfBoard]});
  const roof={id:'roof-cover',kind:'roof-sheet',x:m.assumptions.xMm,y:m.assumptions.yMm};
  const west={id:'west-eave-gutter',kind:'gutter',x:m.gutterTrial.westXMm,y:m.gutterTrial.yMm};
  const east={id:'east-eave-gutter',kind:'gutter',x:m.gutterTrial.eastXMm,y:m.gutterTrial.yMm};
  const gate={id:'conditional-front-gate',kind:'conditional-gate-swing-envelope',x:m.egressReservation.candidateCorridorXmm,y:[m.egressReservation.idealOutwardSweepLimitYmm,m.egressReservation.nominalGatePlaneYmm]};
  const shellRect={id:'house-shell',kind:'house-wall-line',x:[0,shell],y:[0,shell]};
  const primitives=[shellRect,roof,west,east,...boards,gate];
  const union=rs=>({x:[Math.min(...rs.map(q=>q.x[0])),Math.max(...rs.map(q=>q.x[1]))],y:[Math.min(...rs.map(q=>q.y[0])),Math.max(...rs.map(q=>q.y[1]))]});
  const details=(q)=>({x:q.x,y:q.y,sizeMm:[q.x[1]-q.x[0],q.y[1]-q.y[0]],rectangleAreaM2:((q.x[1]-q.x[0])*(q.y[1]-q.y[0]))/1000000,setbacksFromWallLineMm:{west:-q.x[0],east:q.x[1]-shell,front:-q.y[0],garden:q.y[1]-shell}});
  const sheet=details(roof),equipment=details(union([roof,west,east,...boards])),withGate=details(union([roof,west,east,...boards,gate]));
  const contains=(a,b)=>a.x[0]<=b.x[0]&&a.x[1]>=b.x[1]&&a.y[0]<=b.y[0]&&a.y[1]>=b.y[1];
  return {
    status:'PRE-SITE CONDITIONAL spatial envelope only: no plot fit, scaffold, access, lawful rights or water acceptance',
    source:{path:'project/rwt/studies/over-roof-service.json',gitBlob:'fe27b9697b5da34213d506f5c1bbd871db51a636',inheritedHouseBlob:m.hadBlob},
    coordinateSystem:'Original house study x/y millimetres; +y toward garden; site rotation and measured boundaries unknown',
    primitives,
    screening:{
      roofSheetOnly:sheet,
      drawnEquipmentAabb:equipment,
      equipmentPlusConditionalFrontGateAabb:withGate,
      reservationsInModel:{soleBoards:boards.length,roofSheet:1,eaveGutters:2,conditionalGate:1},
      beyondRoofSheetMm:{
        westGutter:roof.x[0]-west.x[0],
        eastGutter:east.x[1]-roof.x[1],
        frontSoleBoards:roof.y[0]-Math.min(...boards.map(b=>b.y[0])),
        gardenSoleBoards:Math.max(...boards.map(b=>b.y[1]))-roof.y[1],
        additionalFrontGateBeyondEquipment:equipment.y[0]-withGate.y[0]
      }
    },
    counterexamples:{
      sheetOnlyCannotContainEquipment:!contains(roof,union([roof,west,east,...boards])),
      equipmentRectangleDoesNotContainConditionalGate:!contains(union([roof,west,east,...boards]),gate),
      modeledEquipmentFitsEquipmentRectangle:contains(union([roof,west,east,...boards]),union([roof,west,east,...boards])),
      modeledEquipmentAndGateFitExpandedRectangle:contains(union([roof,west,east,...boards,gate]),union([roof,west,east,...boards,gate])),
      eastPlantDoorSoleBoardConflictStillUnresolved:m.plantDoorControl.boardProjectionOverlapMm>0,
      idealFirstContactDegrees:m.plantDoorControl.idealFirstContactDegrees
    },
    siteHandoff:{
      status:'This is a Cartesian bounding rectangle of named trial objects, not a measured, buildable or legally available minimum plot. Disconnected objects can occupy a nonrectangular parcel; equipment/access/egress/site relief can demand more.',
      cannotInfer:[
        'Land ownership and scaffold licence beyond the parcel boundary',
        'Neighbouring buildings, trees and roots, buried utilities and legal setbacks',
        'Actual temporary roof OEM support, braces, tie directions, assembly and wind-load footprint',
        'Worker access, crane/hoist, delivery, rescue, front gate and plant-door operating freedom',
        'Independent outdoor spill receiving, surveyed site levels, tailwater and approved disposal',
        'Ground bearing, sole-board sizing, settlement and weather-protected live occupation'
      ],
      decision:'DPL compares rotated source rectangles and verified site evidence; RWT/STR/MAT/OAS/DEL must re-author temporary works if any real contact, access, weather or receiving boundary conflicts.'
    }
  };
}
const renderSvg=function renderSvg(o){
  const bounds=o.screening.equipmentPlusConditionalFrontGateAabb;
  const X=x=>170+(x+2000)*0.032, Y=y=>113+(y+4100)*0.032;
  const rect=(q,fill,stroke,extra='')=>'<rect x="'+X(q.x[0])+'" y="'+Y(q.y[0])+'" width="'+((q.x[1]-q.x[0])*0.032)+'" height="'+((q.y[1]-q.y[0])*0.032)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="2" '+extra+'/>';
  const items=o.primitives, get=id=>items.find(x=>x.id===id);
  const equipment=o.screening.drawnEquipmentAabb,gate=o.screening.equipmentPlusConditionalFrontGateAabb;
  const chunks=[
    '<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 1400 990">',
    '<rect width="1400" height="990" fill="white"/>',
    '<g font-family="Arial,sans-serif" fill="#233b46">',
    '<text x="42" y="50" font-size="28" font-weight="bold">Temporary over-roof: whole-site reservation check</text>',
    '<text x="42" y="82" font-size="18">Source x/y, not a surveyed parcel · axis-aligned hypothetical bounding rectangles only</text>',
    rect(gate,'#f5eee0','#ac7d39','stroke-dasharray="8 6"'),
    rect(equipment,'#e7f1fa','#356b97'),
    rect(get('roof-cover'),'#d2e8f0','#276588'),
    rect(get('house-shell'),'#ffffff','#27353d'),
    rect(get('west-eave-gutter'),'#d6bc84','#976d1e'),
    rect(get('east-eave-gutter'),'#d6bc84','#976d1e'),
    ...items.filter(x=>x.kind==='scaffold-sole-board').map(b=>rect(b,'#d38c70','#8c3f24')),
    rect(get('conditional-front-gate'),'#ead4a3','#ac7d39','stroke-dasharray="4 3"'),
    '<text x="'+X(4000)+'" y="'+Y(5100)+'" font-size="18">12 m house</text>',
    '<text x="'+X(4770)+'" y="'+Y(6000)+'" font-size="16">court</text>',
    '<text x="830" y="160" font-size="22" font-weight="bold">Source reservation</text>',
    '<text x="830" y="206" font-size="19">Roof sheet: 15.40 × 17.99 m</text>',
    '<text x="830" y="244" font-size="19">Roof + gutters + 32 boards:</text>',
    '<text x="830" y="275" font-size="22" font-weight="bold">15.80 × 18.39 m</text>',
    '<text x="830" y="323" font-size="19">Add conditional outward gate:</text>',
    '<text x="830" y="354" font-size="22" font-weight="bold">15.80 × 19.19 m</text>',
    '<text x="830" y="422" font-size="20" font-weight="bold">From the wall line (mm)</text>',
    '<text x="830" y="459" font-size="18">West / east: 1900 / 1900</text>',
    '<text x="830" y="492" font-size="18">Front / garden: 3195 / 3195</text>',
    '<text x="830" y="525" font-size="18">With gate front: 3995 (conditional)</text>',
    '<text x="830" y="602" font-size="19" font-weight="bold">Unresolved conflict</text>',
    '<text x="830" y="638" font-size="18">East plant door meets a sole board</text>',
    '<text x="830" y="668" font-size="18">at 7.58° ideal first motion.</text>',
    '<text x="830" y="746" font-size="18">No plot, scaffold, gate, outfall,</text>',
    '<text x="830" y="778" font-size="18">bearing or occupied-use pass.</text>',
    '<text x="55" y="926" font-size="18">Pale blue: temporary sheet  ·  blue border: equipment AABB  ·  tan dashed: optional gate AABB  ·  orange: sole boards</text>',
    '</g></svg>\n'
  ];
  return chunks.join('');
}
const result=calculate(source)
const westGutter=result.primitives.find(p=>p.id==='west-eave-gutter')
const eastGutter=result.primitives.find(p=>p.id==='east-eave-gutter')
const equipment=result.screening.drawnEquipmentAabb
if(!westGutter||!eastGutter||equipment.x[0]!==westGutter.x[0]||equipment.x[1]!==eastGutter.x[1])throw Error('Outward overflow boundary assumptions changed')
result.conditionalOutwardOverflow={
 conditionalClaim:'A candidate that relies on direct free spill outwards from the authored eave-gutter exterior lips needs an outboard receiving route; no actual lip, water trajectory, plot boundary or site right is verified',
 gutterOutsideLipXmm:{west:westGutter.x[0],east:eastGutter.x[1]},
 equipmentAabbXmm:equipment.x,
 outwardContinuousStripInsideEquipmentAabbMm:{west:equipment.x[0]-westGutter.x[0],east:eastGutter.x[1]-equipment.x[1]},
 anyPositiveOutwardTravelLeavesEquipmentAabb:true,
 equipmentOnlyRectangleCannotProveSafeFreeSpill:true,
 exteriorReception:'NOT IDENTIFIED: may require lawful occupation/rights and separated receiver outside the source equipment rectangle, or an independent internally routed overflow subject to its own real hydraulic, blocked-tailwater and first-harm proof',
 boundary:'Conditional 2-D topological negative control only; actual permitted strip, plinth, height/fall, wind, splash, entrance, downpipe, footing and affected fabric are unknown',
 designDisposition:"Complete temporary over-roof is site-conditional optional major-repair equipment, not the house's assumed default serviceability proof. Repairability must instead be earned from its permanent assemblies and specified local work states."
}
if(result.conditionalOutwardOverflow.outwardContinuousStripInsideEquipmentAabbMm.west!==0||result.conditionalOutwardOverflow.outwardContinuousStripInsideEquipmentAabbMm.east!==0)throw Error('Free-spill negative control changed')
if(result.primitives.filter(x=>x.kind==='scaffold-sole-board').length!==32||result.screening.drawnEquipmentAabb.sizeMm.join(',')!=='15800,18390'||result.screening.equipmentPlusConditionalFrontGateAabb.sizeMm.join(',')!=='15800,19190')throw Error('Site reservation geometric contract changed')
const outputs=[['project/rwt/studies/over-roof-site-envelope.json',JSON.stringify(result,null,2)+'\n'],['project/rwt/studies/over-roof-site-envelope.svg',renderSvg(result)]]
for(const [p,value] of outputs){const url=new URL(p,root);if(process.argv.includes('--check')){if(readFileSync(url,'utf8')!==value)throw Error('Stale generated site reservation: '+p)}else writeFileSync(url,value)}
console.log(JSON.stringify({status:process.argv.includes('--check')?'checked':'generated',equipmentMm:result.screening.drawnEquipmentAabb.sizeMm,gateMm:result.screening.equipmentPlusConditionalFrontGateAabb.sizeMm,siteAcceptance:false}))
