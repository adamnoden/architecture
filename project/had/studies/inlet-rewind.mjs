import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {deriveCurrentHouse} from './current-house.mjs';
import {inletEnvelopeWitness} from './selected-water-duties.mjs';

const root = new URL('../../../', import.meta.url);
const paths = {
  station:'project/had/studies/incoming-water.json',
  highCut:'project/had/studies/incoming-water-cut-cabinet.json',
  gradeCut:'project/had/studies/incoming-water-grade-cabinet.json',
  wetting:'project/had/studies/incoming-water-first-wetting.mjs',
  d2:'project/mat/cylinder-safety-route.md',
  dock:'project/mat/studies/plant-threshold.json',
};
const load = path => readFileSync(new URL(path, root));
const json = key => JSON.parse(load(paths[key]));
const blob = bytes => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
const rangeOverlap = ([a, b], [c, d]) => Math.max(0, Math.min(b, d) - Math.max(a, c));
const within = ([x, y], [left, right, bottom, top]) => x >= left && x <= right && y >= bottom && y <= top;

export function deriveInletRewind() {
  const {id, model} = deriveCurrentHouse();
  const inherited = inletEnvelopeWitness(model);
  const {station,bridge} = json('station');
  const high = json('highCut');
  const grade = json('gradeCut');
  const {dock,opening} = json('dock');
  const d2 = model.architecturalServices.plant.independentSafety;
  const [d2x,d2y,d2z] = d2.outfall;
  const weatherFace = model.shell - model.envelope;
  const south = model.groundWalls.find(wall => wall.id === 'utility-north').finishedFaces[1];
  const north = model.groundWalls.find(wall => wall.id === 'plant-intermediate-arch').finishedFaces[0];
  const dia = station.entry.completePipeOD;
  const radius = dia / 2;
  const cupboard = [11185, weatherFace, south + 50, north - 50];
  const carton = high.cabinet.plan;
  const grateRadius = 150; // The MAT D2 benchmark uses a 300-square fixed grate.
  const grate = [d2x - grateRadius, d2x + grateRadius, d2y - grateRadius, d2y + grateRadius];
  const overlap = [rangeOverlap(carton.slice(0, 2), grate.slice(0, 2)), rangeOverlap(carton.slice(2), grate.slice(2))];
  const [dockX,dockEast,dockSouth,dockNorth] = dock.plan;
  const [firstPickup, firstTurn] = model.storeExchange.path;
  const [seatX,seatY] = model.architecturalServices.plant.cylinder.westSeat;
  const [,,approach] = model.plantReferenceDoor.operatorCentrePath;
  const panel = bridge.motion.finishedPanelUndersideZ;
  const goodsTop = opening.height;
  const d2SouthRunStartX = 12450;
  const d2SouthRunStartY = 4800;
  const d2SouthRunEndY = 2600;
  const d2FallRatio = 80;
  const [,,openLeafDepthX] = model.plantReferenceDoor.fullyOpenEastLeaf;
  const openLeafRight = model.plantReferenceDoor.fullyOpenEastLeaf[0] + openLeafDepthX;
  const d2Start = [10035,d2SouthRunStartY,-900];
  const d2AfterEastRunZ = d2Start[2] - (d2SouthRunStartX - d2Start[0]) / d2FallRatio;
  // This centreline is the under-dock MAT benchmark through the retained outfall.
  const d2Run = [d2Start,[d2SouthRunStartX,d2SouthRunStartY,d2AfterEastRunZ],
    [d2SouthRunStartX,d2SouthRunEndY,d2AfterEastRunZ - (d2SouthRunStartY - d2SouthRunEndY) / d2FallRatio],d2.outfall];
  const crossing = [d2SouthRunStartX,station.entry.point[1],d2AfterEastRunZ - (d2SouthRunStartY - station.entry.point[1]) / d2FallRatio];
  assert(within(crossing, carton), 'Reassess the grade enclosure conflict after moving D2 or its inlet comparator');
  assert(seatX >= firstPickup[0] && seatX <= firstTurn[0], 'Recheck the cold drop against the current swept load');
  return {
    status:'REWIND_NOT_ADOPTED', selection:id,
    sources:Object.fromEntries(Object.values(paths).map(path=>[path,blob(load(path))])),
    inherited:{radiator:inherited.box, centrelineInsideMM:inherited.totalLengthInsideRequiredEnvelopeMM,
      eastGapMM:weatherFace - inherited.box.high[0], pipeOD:dia},
    exterior:{cabinet:carton, dock:[dockX,dockEast,dockSouth,dockNorth], trialGrade:dock.outsideGrade,
      highWorkRise:high.cabinet.workerPlatformRiseAtTrialGradeMM, gradeTrayZ:grade.fault.trayBottomZ,
      gradeHeadZ:grade.access.firstRest.assumedClearHeadMM, d2Outfall:d2.outfall, grate, overlap,
      overlapMM2:overlap[0] * overlap[1], supportCentresOverGrate:high.cabinet.padCorners.filter(point=>within(point,grate)),
      d2Run, crossing, gradeToD2OutfallMM:dock.outsideGrade - d2z},
    trialInterior:{cupboard, wall:[weatherFace,station.entry.point[0]], y:station.entry.point[1], z:station.entry.point[2],
      grossMM:[weatherFace - cupboard[0],cupboard[3] - cupboard[2]],
      nearestBodyCentreX:approach[0], frontToBodyMM:cupboard[0] - approach[0] - model.plantReferenceDoor.retainedBodyRadius,
      pipeOD:dia, boreID:station.entry.formedBore,
      boreRadialAfterSettingMM:(station.entry.formedBore - dia) / 2 - station.entry.settingBudget,
      previousBendCrosswiseMM:high.supply.nominal90BendCrosswiseEnvelopeMM},
    plant:{path:model.storeExchange.path, cartR:model.storeExchange.radius, seat:[seatX,seatY],
      seatToFirstAxisMM:firstPickup[1] - seatY,
      fixedLowDropOverlapMM:model.storeExchange.radius + radius - (firstPickup[1] - seatY),
      southGapMM:model.storeExchange.fixed.southWall, goodsTop, earlierPanelZ:panel,
      topOfFixedCrossingRequiredMM:goodsTop + 25 + dia,
      alternativeFixedRoute:{x:10245,pipeAxisZ:2260,finishPanelClearanceMM:panel - 2260 - radius,
        clearanceTo2125CarrierMM:2260 - radius - 2125,
        clearanceToStandingPersonMM:2260 - radius - 2000,
        openLeafSideGapAfterSettingsMM:10245 - openLeafRight - radius - 10}},
  };
}

function drawing({exterior:e,trialInterior:i,plant:p}) {
  const x = v => 56 + (v - 9350) / 11;
  const y = v => 397 - (v - 2175) / 11;
  const sx = v => 705 + (v - 11050) / 5;
  const z = v => 400 - (v + 2050) / 13.5;
  const poly = (points, xx, yy) => points.map(([a,b])=>`${xx(a)},${yy(b)}`).join(' ');
  const box = ([a,b,c,d],xx,yy,fill,stroke) => `<rect x="${xx(a)}" y="${yy(d)}" width="${xx(b)-xx(a)}" height="${yy(c)-yy(d)}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  const line = (points,xx,yy,colour,width=2,extra='') => `<polyline points="${poly(points,xx,yy)}" fill="none" stroke="${colour}" stroke-width="${width}" ${extra}/>`;
  const text = (x,y,value,kind='') => `<text x="${x}" y="${y}" class="${kind}">${value}</text>`;
  const [cl,cr,cs,cn] = e.cabinet;
  const [gl,gr,gs,gn] = e.grate;
  const cart = p.path.slice(0,-1).concat([[e.dock[1],p.path.at(-1)[1]]]);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="610" viewBox="0 0 1100 610" role="img" aria-labelledby="title desc">
<title id="title">East service edge: rejected inlet cabinets and fixed indoor redraw</title>
<desc id="desc">Source-bound plan and east section. The old external cabinets cover the independent cylinder discharge grate. The indoor cabinet is a design allocation.</desc>
<style>text{font-family:sans-serif;font-size:15px;fill:#273633}.title{font-size:29px;font-weight:700}.head{font-size:19px;font-weight:700}.small{font-size:13px}.warm{fill:#224f43}.red{fill:#9d3f2d}</style>
<rect width="1100" height="610" fill="#f6f3ea"/>
${text(35,43,'Move isolation and repair into a fixed wet pocket','title')}
${text(35,72,'House coordinates in mm. Rejection and redraw allocation only.')}
${text(55,110,'East service-edge plan','head')}
${text(704,110,'Section through Y2800','head')}
${box([i.wall[0],i.wall[1],2450,5100],x,y,'#d9d3c4','#aba28f')}
${box(e.dock,x,y,'#e3e7e6','#657773')}
${line(cart,x,y,'#5b7972',2*p.cartR/11,'stroke-linecap="round" stroke-linejoin="round" opacity=".20"')}
${line(cart,x,y,'#375750',2,'stroke-dasharray="5 5"')}
${box(i.cupboard,x,y,'#c4dfd4','#397463')}
${box(e.cabinet,x,y,'#f0d5c9','#aa4b38')}
${box(e.grate,x,y,'none','#ae4031')}
${box([Math.max(cl,gl),Math.min(cr,gr),Math.max(cs,gs),Math.min(cn,gn)],x,y,'#ae4031','#ae4031')}
${line([[i.cupboard[0],i.y],[i.wall[1],i.y]],x,y,'#397463',4)}
${line(e.d2Run,x,y,'#ae4031',3,'stroke-dasharray="6 4"')}
<circle cx="${x(p.seat[0])}" cy="${y(p.seat[1])}" r="6" fill="#ae4031"/>
${text(75,144,'Ø850 goods corridor and guarded dock')}
${text(70,430,`Green  Fixed wet cabinet reservation ${i.grossMM.join(' × ')} mm`,'warm')}
${text(70,455,'Red  Both rejected external cabinet footprints and D2 overlap','red')}
${text(70,480,`Grate overlap ${e.overlap[0]} × ${e.overlap[1]} mm. Red dot: rejected low plant seat.`)}
${text(70,505,'Dashed red  Independent D2 run, MAT benchmark.')}
${box([i.wall[0],i.wall[1],-180,1250],sx,z,'#d9d3c4','#aba28f')}
${box([i.cupboard[0],i.cupboard[1],0,1250],sx,z,'#c4dfd4','#397463')}
${box([cl,cr,e.gradeTrayZ,e.gradeHeadZ],sx,z,'#f0d5c9','#aa4b38')}
${line([[11050,0],[i.wall[0],0]],sx,z,'#657773',2)}
${line([[i.wall[1],e.trialGrade],[12700,e.trialGrade]],sx,z,'#657773',2)}
${line([[i.cupboard[0],i.z],[i.wall[1],i.z]],sx,z,'#397463',4)}
<circle cx="${sx(e.crossing[0])}" cy="${z(e.crossing[2])}" r="7" fill="#ae4031"/>
${text(704,430,`Y${i.y} / Z+${i.z}  straight spool trial  ·  Ø${i.boreID} bore`)}
${text(704,455,`Z${Math.round(e.crossing[2])}  independent D2 crosses the grade cabinet`,'red')}
${text(704,480,`Z${e.trialGrade}  trial grade and fixed grate level`)}
${text(704,505,`Z${e.d2Outfall[2]}  D2 terminal at Y${e.d2Outfall[1]} (out of section)`)}
<line x1="35" x2="1065" y1="541" y2="541" stroke="#b8b3a7"/>
${text(35,571,'HAD · 15 November 2026  |  Read with the D2 route, independent outfalls and plant-cargo section.','small')}
</svg>\n`;
}

if(process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = deriveInletRewind();
  const outputs = {json:JSON.stringify(result, null, 2) + '\n', svg:drawing(result)};
  for(const [extension, content] of Object.entries(outputs)) {
    const target = new URL(`inlet-rewind.${extension}`, import.meta.url);
    if(process.argv.includes('--check')) assert.equal(readFileSync(target, 'utf8'),content,`Reproduce inlet-rewind.${extension}`);
    else if(process.argv.includes('--write')) writeFileSync(target,content);
  }
}
