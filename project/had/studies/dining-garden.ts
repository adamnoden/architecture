/** Product-envelope and authored-action comparison; no furniture/door/material adoption. */
import assert from 'node:assert/strict'
import {readFileSync, writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {layoutRevision as house, revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'

type Box = {id: string; x: number; y: number; w: number; h: number}
type Point = [number, number]
const box = (id: string, x: number, y: number, w: number, h: number): Box => ({id, x, y, w, h})
const garden = revisionOpenings('GROUND').find(o => o.id === 'garden-entry')
const courtDoor = revisionOpenings('GROUND').find(o => o.id === 'grand-court-entry-north')
assert.equal(house.id, 'RH-LAYOUT-REVISION-02')
assert.equal(house.shell, 12000); assert.equal(house.envelope, 417.5)
assert.deepEqual(house.court, {x: 4250, y: 4250, width: 3500, depth: 3500})
assert.deepEqual([house.stair.x, house.stair.y, house.stair.width, house.stair.length], [417.5, 3832.5, 2400, 4335])
assert(garden?.wall === 'outer-north' && garden.centre === 6000 && garden.width === 2400 && garden.leaves === 2)
assert(garden.swing === 'right' && garden.hinge === 'low')
assert(courtDoor?.wall === 'court-north' && courtDoor.centre === 6000 && courtDoor.width === 2400 &&
  courtDoor.leaves === 2 && courtDoor.swing === 'right' && courtDoor.hinge === 'low')
const furnished = readFileSync(new URL('../had-03-furnished-design-study.md', import.meta.url), 'utf8')
for (const guard of ['x3400–4200, y9000–10600', 'x700–2600, y8500–9350',
  'x700–2600, y10750–11500', 'x1100–2300, y9700–10250', 'x5500–6500', 'x4800–7200, y10382.5–11582.5']) {
  assert(furnished.includes(guard), `Reappraise changed furnished source: ${guard}`)
}
const e = house.envelope, north = house.shell - e, courtNorth = house.court.y + house.court.depth
const chair = {manufacturer: 'ercol', model: 'Quaker 1875, unupholstered', width: 490, depth: 600,
  height: 1030, seatHeight: 450, seatDepth: 400,
  source: 'https://www.ercol.com/application/files/8317/6942/2844/ercol_-_Quaker_Dining_Chair_-_1875_-_datasheet.pdf',
  inspectedOn: '2026-10-30', completeMaterialAdmission: null}
const action = {underTableProjection: 100, outwardTranslation: 400,
  bodyPathDiameter: 600, requiredHouseholdSeatCount: null, actualOccupiedEnvelope: null,
  actualApronLegKneeFit: null, actualComfortOrAccessibility: null}
const baseline = box('table A', 3400, 9000, 800, 1600)
const candidate = box('table B', 3600, 8850, 800, 1600)
const furniture = [box('south sofa', 700, 8500, 1900, 850), box('north sofa', 700, 10750, 1900, 750),
  box('low table', 1100, 9700, 1200, 550)]
// Conservative solid envelope at the northwest court corner; the north door is cut out separately.
const fabric = [box('west court wall and corner', house.court.x-e, 7500, e, courtNorth+e-7500),
  box('north court west pier', house.court.x, courtNorth, garden.centre-garden.width/2-house.court.x, e),
  box('north court east pier', garden.centre+garden.width/2, courtNorth,
    house.court.x+house.court.width+e-(garden.centre+garden.width/2), e),
  box('stair footprint in crop', house.stair.x, 7500, house.stair.width, house.stair.y+house.stair.length-7500),
  box('north wall west', e, north, garden.centre-garden.width/2-e, e),
  box('north wall east', garden.centre+garden.width/2, north, house.shell-e-(garden.centre+garden.width/2), e)]
function seats(table: Box, sideOffsets: readonly number[], ends: boolean, travel = 0,
  dimensions: {width:number; depth:number} = chair, insertion = action.underTableProjection): Box[] {
  const out = dimensions.depth - insertion + travel
  const result = sideOffsets.flatMap((offset, i) => [
    box(`W${i+1}`, table.x-out, table.y+offset-dimensions.width/2, dimensions.depth, dimensions.width),
    box(`E${i+1}`, table.x+table.w-insertion+travel,
      table.y+offset-dimensions.width/2, dimensions.depth, dimensions.width)])
  if (ends) result.push(box('S', table.x+table.w/2-dimensions.width/2, table.y-out, dimensions.width, dimensions.depth),
    box('N', table.x+table.w/2-dimensions.width/2,
      table.y+table.h-insertion+travel, dimensions.width, dimensions.depth))
  return result
}
const overlap = (a: Box, b: Box) => ({x: Math.max(0, Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)),
  y: Math.max(0, Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y))})
const overlaps = (a: Box, b: Box) => {const q=overlap(a,b); return q.x>0 && q.y>0}
const swept = (a: Box, b: Box) => box(a.id,Math.min(a.x,b.x),Math.min(a.y,b.y),
  Math.max(a.x+a.w,b.x+b.w)-Math.min(a.x,b.x),Math.max(a.y+a.h,b.y+b.h)-Math.min(a.y,b.y))
// Prior HAD inward comparison: nominal 1200 leaves hinged at the ROOM face.
// The canonical drawing symbol is outward at wall mid-depth. Neither is an installed door selection.
const inward = {left: garden.centre-garden.width/2, right: garden.centre+garden.width/2,
  hingeY: north, radius: garden.width/2, thickness: null, hardware: null}
function inQuarterSweep(r: Box, left: boolean) {
  const hx=left?inward.left:inward.right, xmin=left?hx:hx-inward.radius, xmax=left?hx+inward.radius:hx
  const x0=Math.max(r.x,xmin), x1=Math.min(r.x+r.w,xmax)
  const y0=Math.max(r.y,north-inward.radius), y1=Math.min(r.y+r.h,north)
  if(x1<=x0 || y1<=y0) return false
  const dx=left?x0-hx:hx-x1, dy=north-y1
  return dx*dx+dy*dy<inward.radius*inward.radius
}
function report(table: Box, offsets: [number,number], ends: boolean) {
  const seated=seats(table,offsets,ends), pulled=seats(table,offsets,ends,action.outwardTranslation)
  const sweeps=seated.map((s,i)=>swept(s,pulled[i]))
  return {table,sideOffsets:offsets,ends,seated,pulled,sweeps,
    obstacleFlags:sweeps.flatMap(s=>[...furniture,...fabric].filter(o=>overlaps(s,o)).map(o=>({chair:s.id,obstacle:o.id,overlap:overlap(s,o)}))),
    inwardLeafFlags:sweeps.filter(s=>inQuarterSweep(s,true)||inQuarterSweep(s,false)).map(s=>s.id)}
}
const a=report(baseline,[400,1200],true), b=report(candidate,[500,1100],false)
assert.deepEqual(a.inwardLeafFlags,['E2'])
assert.equal(b.obstacleFlags.length,0); assert.equal(b.inwardLeafFlags.length,0)
const AEnd=seats(baseline,[400,1200],true,400).find(s=>s.id==='S')!
const BEnd=seats(candidate,[500,1100],true,400).find(s=>s.id==='S')!
const endSensitivity=[0,100,200].map(insertion=>({underTableProjection:insertion,
  requiredLength:baseline.h+2*(chair.depth-insertion+action.outwardTranslation),
  surplusInRearRoom:north-(courtNorth+e)-(baseline.h+2*(chair.depth-insertion+action.outwardTranslation))}))
const tipGap=[0,30,45,60,90].map(angle=>({angle,
  nominalTipGap:Number((garden.width-2*inward.radius*Math.cos(angle*Math.PI/180)).toFixed(3))}))
const path: Point[]=[[3325,7900],[3325,8500],[6000,8500],[6000,north]]
const intervalGap=(a:number,b:number,c:number,d:number)=>Math.max(a-d,c-b,0)
function pathMargin(points: Point[], objects: Box[], radius: number) {
  let margin=Infinity
  for(let i=1;i<points.length;i++) {
    const [x,y]=points[i-1], [xx,yy]=points[i]
    assert(x===xx||y===yy)
    for(const o of objects) margin=Math.min(margin,Math.hypot(
      intervalGap(Math.min(x,xx),Math.max(x,xx),o.x,o.x+o.w),
      intervalGap(Math.min(y,yy),Math.max(y,yy),o.y,o.y+o.h))-radius)
  }
  return margin
}
const doorLines=[box('nominal inward garden left at90',inward.left,north-inward.radius,0,inward.radius),
  box('nominal inward garden right at90',inward.right,north-inward.radius,0,inward.radius),
  box('schematic north court left into court',inward.left,courtNorth+e/2-inward.radius,0,inward.radius),
  box('schematic north court right into court',inward.right,courtNorth+e/2-inward.radius,0,inward.radius)]
const pathObjects=[...furniture,...fabric,candidate,...b.sweeps,...doorLines]
const minPathMargin=pathMargin(path,pathObjects,action.bodyPathDiameter/2)
assert(minPathMargin>0)
const shiftedRoute=(offset:number):Point[]=>[[3325,7900],[3325,8500+offset],[6000,8500+offset],[6000,north]]
assert.equal(pathMargin(shiftedRoute(-33),pathObjects,300),-.5)
assert.equal(pathMargin(shiftedRoute(51),pathObjects,300),-1)
const courtIntoFamily=box('adverse north court leaf into family',inward.left,courtNorth+e/2,0,inward.radius)
assert(pathMargin(path,[courtIntoFamily],300)<0)
const result={basis:house.id,sourceFurnished:'project/had/had-03-furnished-design-study.md',
  scope:'Unadopted product-envelope comparison. No household capacity, real occupied posture, door operation, material, access or whole-house selection.',
  chair,action,inwardDoorComparison:inward,canonicalDoorSymbol:'Schematic outward, at wall mid-depth; actual operation not selected',
  furniture,fabric,baseline:a,fourSidePlaceCandidate:b,
  quantities:{bSeatedProjection:chair.depth-action.underTableProjection,
    bPulledProjection:chair.depth-action.underTableProjection+action.outwardTranslation,
    old600FieldShortfall:chair.depth-action.underTableProjection+action.outwardTranslation-600,
    aSouthEnvelopeOverCourtCorner:overlap(AEnd,fabric[0]).y,
    bAddedSouthEndEnvelopeOverCourtCorner:overlap(BEnd,fabric[0]).y,
    bWestEnvelopeToSofa:2700-2600,bWestEnvelopeToBedroom4MovedSofa:2700-2650,
    bEastEnvelopeTo1000Route:5500-5300,bNorthEnvelopeToInwardSweep:(north-inward.radius)-10195,
    rearRoomClearDepth:north-(courtNorth+e),endSensitivity,tipGap},
  route:{points:path,diameter:action.bodyPathDiameter,minModelObstacleMargin:minPathMargin,
    endsAtRoomFace:true,conditions:'No end chairs; all side-chair translation sweeps included; nominal inward garden leaves at90; north court leaves remain into court as schematically drawn. Threshold/frame/handles, people, tolerances and exterior continuation absent.',
    falsification:{routeLowered33Margin:-.5,routeRaised51Margin:-1,northCourtLeafIntoFamilyCutsRoute:true}},
  acceptance:{geometricEnvelopeCandidateOnly:true,occupiedComfort:null,actualChairTableFit:null,
    requiredSeatCount:null,installedDoorAndThreshold:null,materialAdmission:null,maintenanceRoute:null}}

// A different, manufacturer-matched pair. Keep the earlier Quaker studies unchanged.
// The PDF's placement dimension is not a complete three-dimensional leg/occupant model.
const fairmile={manufacturer:'ercol',tableModel:'4291G',chairModel:'4102G',
  table:{closedLength:1800,extendedLength:2200,width:950,height:750,massKg:41,
    longitudinalChairPlacementClosed:1140,longitudinalChairPlacementExtended:1540,
    transverseChairPlacement:660,underframeHeight:660},
  chair:{width:450,depth:520,height:920,seatHeight:470,seatDepth:400,massKg:5},
  source:{table:'https://www.ercol.com/application/files/1617/6942/1776/ercol_-_Fairmile_Large_Extending_Dining_Table_-_4291G_-_datasheet.pdf',
    tableSha256:'a823c4225c1ba02e51a61149e175dd205a3ba47cc1e8b5e935d66847c1820b89',
    chair:'https://www.ercol.com/download_file/35861/9568',
    assembly:'https://www.ercol.com/download_file/30063/9566',inspectedOn:'2026-10-31'}}
const sixTable=box('extended Fairmile comparison',3600,8950,fairmile.table.width,fairmile.table.extendedLength)
const placement={start:sixTable.y+(sixTable.h-fairmile.table.longitudinalChairPlacementExtended)/2,
  length:fairmile.table.longitudinalChairPlacementExtended,centredInTable:'authored assumption, not separately dimensioned offsets'}
const pitches=[600,500].map(pitch=>({pitch,threeChairSpan:2*pitch+fairmile.chair.width,
  remainder:placement.length-(2*pitch+fairmile.chair.width),
  endMarginIfCentred:(placement.length-(2*pitch+fairmile.chair.width))/2,
  adjacentEnvelopeGap:pitch-fairmile.chair.width}))
assert.equal(pitches[0].remainder,-110)
assert.equal(pitches[1].endMarginIfCentred,45)
// 500 is a sensitivity only. Do not label a narrowed station pitch an occupied-use pass.
const sixOffsets=[600,1100,1600]
const sixInitial=seats(sixTable,sixOffsets,false,0,fairmile.chair,0)
const sixPulled=seats(sixTable,sixOffsets,false,400,fairmile.chair,0)
const sixSweeps=sixInitial.map((s,i)=>swept(s,sixPulled[i]))
const sixFlags=sixSweeps.flatMap(s=>[...furniture,...fabric].filter(o=>overlaps(s,o)).map(o=>({chair:s.id,obstacle:o.id})))
assert.equal(sixFlags.length,0)
const sixInwardFlags=sixSweeps.filter(s=>inQuarterSweep(s,true)||inQuarterSweep(s,false)).map(s=>s.id)
assert.deepEqual(sixInwardFlags,['E3'])
const sixRouteY=(courtNorth+e+sixTable.y)/2
const sixPath:Point[]=[[3325,7900],[3325,sixRouteY],[6000,sixRouteY],[6000,north]]
// The positive path uses the outward garden symbol, not the old inward comparison.
// Actual frame/threshold/exterior travel is absent; court leaves stay into the court.
const sixObjects=[...furniture,...fabric,sixTable,...sixSweeps,...doorLines.slice(2)]
const sixMargin=pathMargin(sixPath,sixObjects,300)
assert.equal(sixMargin,91.25)
const sixShift=(dy:number):Point[]=>[[3325,7900],[3325,sixRouteY+dy],[6000,sixRouteY+dy],[6000,north]]
assert.equal(pathMargin(sixShift(-92),sixObjects,300),-.75)
assert.equal(pathMargin(sixShift(92),sixObjects,300),-.75)
assert(pathMargin(sixPath,[courtIntoFamily],300)<0)
const sixResult={basis:house.id,scope:'Unadopted six-side-chair envelope sensitivity, not a selected six-person dining arrangement.',
  fairmile,table:sixTable,placement,pitches,
  action:{underTableProjection:0,outwardTranslation:400,centres:sixOffsets.map(v=>sixTable.y+v),
    noEndChairs:true,occupiedUse:null,extensionOperation:null},
  edgeAdjacent:sixInitial,pulled:sixPulled,sweeps:sixSweeps,obstacleFlags:sixFlags,inwardGardenFlags:sixInwardFlags,
  quantities:{outwardProjection:fairmile.chair.depth+400,
    westSofaMargin:sixTable.x-fairmile.chair.depth-400-2600,
    westMarginWithSeparateBedroom4SofaShift:sixTable.x-fairmile.chair.depth-400-2650,
    eastMarginToOld1000Strip:5500-(sixTable.x+sixTable.w+fairmile.chair.depth+400),
    northTableToWall:north-sixTable.y-sixTable.h,southCorridor:sixTable.y-(courtNorth+e),
    seatToUnderframeGross:fairmile.table.underframeHeight-fairmile.chair.seatHeight,
    closedTableThreeChair500PitchRemainder:fairmile.table.longitudinalChairPlacementClosed-(2*500+fairmile.chair.width)},
  route:{points:sixPath,diameter:600,minModelObstacleMargin:sixMargin,endsAtRoomFace:true,
    conditions:'Outward garden symbol; court leaves into court; zero chair insertion; all six straight withdrawal sweeps. No occupied chair access, actual opening or exterior continuation.',
    falsification:{lowered92Margin:-.75,raised92Margin:-.75,courtLeafIntoFamilyCutsRoute:true}},
  acceptance:{sixHundredPitchEnvelopeAdmission:false,fiveHundredPitchOccupiedAdmission:null,
    actualLegApronKneeFit:null,conversionInRoom:null,householdCapacity:null,materialAdmission:null}}

const svg:string[]=[], add=(s:string)=>svg.push(s)
const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;')
const text=(x:number,y:number,s:string,size=2.65,color='#263c40')=>add(`<text x="${x}" y="${y}" font-size="${size}" fill="${color}">${esc(s)}</text>`)
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="DejaVu Sans,sans-serif"><rect width="420" height="297" fill="#fffdf7"/>')
text(15,16,'HAD / dining chairs, movement and the garden opening',5)
text(15,24,'Product dimensions + authored actions, all in mm · two 1:50 plans at A3 · no source adoption or occupied-use acceptance',2.8)
function plan(ox:number,label:string,r:typeof a,drawRoute:boolean) {
  const oy=48, px=(x:number)=>ox+(x-400)/50, py=(y:number)=>oy+(12000-y)/50
  const id=drawRoute?'b':'a'
  add(`<defs><clipPath id="clip-${id}"><rect x="${ox}" y="${oy}" width="145" height="91"/></clipPath></defs>`)
  text(ox,39,label,3.2)
  text(ox+131,44,'N ↑',2.4)
  add(`<g clip-path="url(#clip-${id})">`)
  const rect=(q:Box,fill:string,stroke='#596f73',dash=false)=>add(`<rect x="${px(q.x)}" y="${py(q.y+q.h)}" width="${q.w/50}" height="${q.h/50}" fill="${fill}" stroke="${stroke}" stroke-width=".25" ${dash?'stroke-dasharray="1.2 .8"':''}/>`)
  rect(box('floor',e,7500,house.shell-2*e,north-7500),'#f3f0e7')
  rect(box('route',5500,courtNorth+e,1000,north-courtNorth-e),'#e1eee7','#a4c6b4',true)
  for(const q of fabric)rect(q,'#d1ccc0')
  for(const q of furniture)rect(q,'#dfd7c4')
  rect(r.table,'#c8b38a','#725c3f')
  text(px(r.table.x+r.table.w/2)-6.5,py(r.table.y+r.table.h/2),'800×1600',2.2)
  for(const q of r.seated)rect(q,'#d6e8ec','#527e88')
  for(const q of r.pulled)rect(q,'none',drawRoute?'#53816e':'#b65f41',true)
  for(const q of r.pulled)text(px(q.x+q.w/2)-1.5,py(q.y+q.h/2)+1,q.id,2.2)
  const l=inward.radius/50, hy=py(north), lx=px(inward.left), rx=px(inward.right)
  add(`<path d="M${lx+l} ${hy}A${l} ${l} 0 0 1 ${lx} ${hy+l}M${rx-l} ${hy}A${l} ${l} 0 0 0 ${rx} ${hy+l}" fill="none" stroke="#447b99" stroke-width=".3" stroke-dasharray="1 1"/>`)
  add(`<path d="M${lx} ${hy}V${hy+l}M${rx} ${hy}V${hy+l}" stroke="#447b99" stroke-width=".7"/>`)
  for(const centre of [1800,3900])add(`<path d="M${px(centre-500)} ${py(north)}H${px(centre+500)}" stroke="#71a7b4" stroke-width=".7"/>`)
  if(drawRoute)add(`<polyline points="${path.map(([x,y])=>`${px(x)},${py(y)}`).join(' ')}" fill="none" stroke="#34735c" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity=".15"/><polyline points="${path.map(([x,y])=>`${px(x)},${py(y)}`).join(' ')}" fill="none" stroke="#34735c" stroke-width=".35"/>`)
  text(px(900),py(10000),'low table',2.2); text(px(850),py(8900),'sofa',2.2)
  text(px(4200),py(7600),'court corner',2.2)
  add('</g>')
  text(ox,146,drawRoute?'4 side places; table +200 east / −150 south':'6-chair trial; original table location',2.6)
  text(ox,153,'Blue: seated envelope. Dashed: +400 mm translation.',2.45)
  text(ox,160,'Door arcs: prior inward comparison, not selected operation.',2.4)
}
plan(18,'A / existing table, six authored stations',a,false)
plan(218,'B / four-side-place alternative',b,true)
text(15,174,'What the comparison changes',3.6)
const left=[
  'Chair: ercol 1875, 490 wide × 600 deep; overall rectangle only.',
  '100 under-table projection is an unproved positioning trial.',
  '500 seated projection + 400 travel = 900; old 600 field is short 300.',
  'A: west/south envelope flags remain with either door direction.',
  'A: E2 also enters the hypothetical inward leaf sweep.',
  'B: west sofa gap 100; a separate +50 sofa trial leaves 50.',
  'B: east to 1000 route 200; north to inward sweep 187.5.'
]
left.forEach((s,i)=>text(15,184+i*7,s,2.55))
const right=[
  'Six end/side places are not retained by the four-place result.',
  'Adding a pulled south end chair to B enters the corner 217.5.',
  'Six-place axial envelope with 100 insertion consumes 3400 of 3415.',
  'The 15 remainder proves no usable human clearance.',
  'Nominal paired-leaf tip gaps: 30° 322 / 45° 703 / 60° 1200.',
  'The source door symbol opens outward; exterior use is unresolved.',
  'B green path: authored 600 disc; smallest model margin 32.5.'
]
right.forEach((s,i)=>text(218,184+i*7,s,2.45))
text(15,244,'Next: confirm required seats; compare actual chair/table/apron, occupied use, access and selected opening in one room.',2.8)
text(15,253,'No material admission: ash/wedges do not disclose lacquer, paint, glue, glides or pads. No furniture or door purchase is implied.',2.65)
text(15,262,'North court leaves must remain into court. Occupied use, open RWT floor panels and maintenance staging are different, unproved states.',2.6)
text(15,273,'Envelope overlap flags prevent admission from this model; they are not measured solid collisions or a regulatory/ergonomic verdict.',2.65)
text(15,284,'Source: RH-LAYOUT-REVISION-02 + HAD furnished study; manufacturer fact sheet inspected 30 Oct 2026. HAD-03 remains planned.',2.6)
add('</svg>')
const sixSvg:string[]=[]
const sa=(s:string)=>sixSvg.push(s)
const st=(x:number,y:number,s:string,size=2.7,color='#263c40')=>sa(`<text x="${x}" y="${y}" font-size="${size}" fill="${color}">${esc(s)}</text>`)
sa('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="DejaVu Sans,sans-serif"><rect width="420" height="297" fill="#fffdf7"/>')
st(15,16,'HAD / six side chairs: table construction changes the answer',5)
st(15,25,'31 October 2026 · dimensions in mm · unadopted comparison; six chairs drawn does not prove occupied use',2.9)
st(15,39,'A / room-envelope sensitivity, 1:40 at A3',3.3)
const sx=(x:number)=>15+(x-400)/40,sy=(y:number)=>49+(12000-y)/40
const sr=(r:Box,fill:string,stroke='#657873',dash=false)=>sa(`<rect x="${sx(r.x)}" y="${sy(r.y+r.h)}" width="${r.w/40}" height="${r.h/40}" fill="${fill}" stroke="${stroke}" stroke-width=".25" ${dash?'stroke-dasharray="1.2 .8"':''}/>`)
sa('<defs><clipPath id="six-plan"><rect x="15" y="49" width="183" height="116"/></clipPath></defs><g clip-path="url(#six-plan)">')
sr(box('floor',e,7500,7200-e,north-7500),'#f3f0e7')
sr(box('old route strip',5500,courtNorth+e,1000,north-courtNorth-e),'#e1eee7','#a4c6b4',true)
for(const q of fabric)sr(q,'#d1ccc0')
for(const q of furniture)sr(q,'#dfd7c4')
sr(sixTable,'#c8b38a','#725c3f')
for(const q of sixInitial)sr(q,'#d6e8ec','#527e88')
for(const q of sixPulled){sr(q,'none','#53816e',true);st(sx(q.x+q.w/2)-2,sy(q.y+q.h/2)+1,q.id,2.3)}
sa(`<polyline points="${sixPath.map(([x,y])=>`${sx(x)},${sy(y)}`).join(' ')}" fill="none" stroke="#34735c" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" opacity=".14"/><polyline points="${sixPath.map(([x,y])=>`${sx(x)},${sy(y)}`).join(' ')}" fill="none" stroke="#34735c" stroke-width=".35"/>`)
const il=sx(inward.left),ir=sx(inward.right),iy=sy(north),rad=inward.radius/40
sa(`<path d="M${il+rad} ${iy}A${rad} ${rad} 0 0 1 ${il} ${iy+rad}M${ir-rad} ${iy}A${rad} ${rad} 0 0 0 ${ir} ${iy+rad}" fill="none" stroke="#b65f41" stroke-width=".35" stroke-dasharray="1 1"/>`)
st(sx(3735),sy(10200),'2200',2.4);st(sx(3735),sy(10050),'×950',2.4)
st(sx(850),sy(8900),'sofa',2.4);st(sx(850),sy(11100),'sofa',2.4)
sa('</g>')
st(15,174,'500 mm station pitch; chairs 450 wide × 520 deep.',2.7)
st(15,182,'Zero insertion + 400 pull: no assumed tuck under the top.',2.7)
st(15,190,'Green: 600 disc through-route, not approach to each seat.',2.7)
st(15,198,'Red dashed arc: unselected inward door hits E3.',2.7,'#9b4b33')
st(222,39,'B / the manufacturer placement dimension',3.3)
const gapX=233,gapScale=.075,gapEnd=gapX+1540*gapScale
for(const [row,pitch,color] of [[65,600,'#b65f41'],[100,500,'#53816e']] as const){
  const span=2*pitch+450,start=gapX+(1540-span)/2*gapScale
  sa(`<path d="M${gapX} ${row-9}V${row+16}M${gapEnd} ${row-9}V${row+16}" stroke="#6b6d67" stroke-width=".35"/>`)
  sa(`<path d="M${gapX} ${row-6}H${gapEnd}" stroke="#6b6d67" stroke-width=".25"/>`)
  for(let n=0;n<3;n++)sa(`<rect x="${start+n*pitch*gapScale}" y="${row}" width="${450*gapScale}" height="11" fill="none" stroke="${color}" stroke-width=".5"/>`)
  st(222,row+23,pitch===600?'600 pitch → 1650 span; 110 beyond available 1540.':'500 pitch → 1450 span; 45 each end if centred.',2.7,color)
}
st(222,135,'Top is 2200 long; published placement space is 1540.',2.7)
st(222,143,'50 between adjacent envelopes is not elbow clearance.',2.7)
st(222,151,'660 underframe − 470 seat = 190 gross; knees unknown.',2.7)
st(222,164,'C / limits that the plan cannot close',3.3)
const sn=[
  'Zero-tuck withdrawal: 80 to sofa / 30 to old central strip.',
  'Separate + 50 sofa trial leaves only 30 on the west.',
  'South corridor 782.5; centred disc margin 91.25 each side.',
  'Table north end 432.5 from wall: no proved operator space.',
  'Extension needs catches, lifting and temporary separation.',
  'No actual chair-entry, occupied comfort or knee-space proof.'
]
sn.forEach((s,i)=>st(222,175+i*8,s,2.6))
st(15,231,'Decision: reject the 600-pitch fit claim. Retain 500-pitch as an unresolved sensitivity, with both sofas and six chairs visible.',2.8)
st(15,241,'Do not adopt a seat count, crowded arrangement, door direction or plastic-containing finish merely to obtain a geometric pass.',2.7)
st(15,254,'Source: RH-LAYOUT-REVISION-02; ercol 4291G + 4102G drawings, inspected 31 Oct 2026. Controlled PDF identity is recorded in the note.',2.6)
st(15,264,'Plan shows the finished extended table; conversion, moving 41 kg, window access, RWT maintenance and exterior landing remain open.',2.6)
st(15,278,'Envelope screen only · household brief, actual assembly/material admission and HAD-03 completion remain unresolved.',2.9)
sa('</svg>')
const outputs=new Map([['dining-garden.json',JSON.stringify(result,null,2)+'\n'],['dining-garden.svg',svg.join('\n')+'\n'],
  ['dining-six-side.json',JSON.stringify(sixResult,null,2)+'\n'],['dining-six-side.svg',sixSvg.join('\n')+'\n']])
for(const [name,content] of outputs){const path=fileURLToPath(new URL(name,import.meta.url));if(process.argv.includes('--check'))assert.equal(readFileSync(path,'utf8'),content,`Regenerate ${name}`);else writeFileSync(path,content)}
console.log(JSON.stringify({baselineFlags:a.obstacleFlags,inwardFlags:a.inwardLeafFlags,candidateFlags:b.obstacleFlags,quantities:result.quantities,route:result.route},null,2))
console.log(JSON.stringify({sixSide:pitches,quantities:sixResult.quantities,route:sixResult.route,inwardFlags:sixInwardFlags},null,2))
