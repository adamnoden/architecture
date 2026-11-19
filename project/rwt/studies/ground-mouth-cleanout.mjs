// House coordinates in mm. A captured 50 mm straight cleaning shaft is a design envelope.
import { readFileSync } from 'node:fs';
import { eastGround } from './east-ground-outfall.mjs';
const read = p => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const { renewal: house } = read('../../had/studies/water-replan.json');
const { wet, crew } = eastGround();
const rail = house.joint.railReference;
const fall = (house.pieces[1].bedEnds[1][1] - house.pieces[1].bedEnds[0][1]) / house.pieces[1].length;
const railBottom = x => house.activeOutlet.bodyOutlet[2] + (x-12250)*fall + rail.topRelativeBed - rail.sectionVertical;
const radius = 25, allowance = 5;
const grow = ([x0,x1,y0,y1,z0,z1], d) => [x0-d,x1+d,y0-d,y1+d,z0-d,z1+d];

function crosses(a,b,box) {
  let lo=0, hi=1;
  for(let i=0;i<3;i++) {
    const d=b[i]-a[i], min=box[2*i], max=box[2*i+1];
    if (!d) { if(a[i]<min || a[i]>max) return false; continue; }
    const t0=(min-a[i])/d, t1=(max-a[i])/d;
    lo=Math.max(lo, Math.min(t0,t1)); hi=Math.min(hi, Math.max(t0,t1));
  }
  return lo<=hi;
}

export function cleanout(sillGuides = true) {
  const [near,far] = [14200,16000];
  const station = rail.supportX.at(-1);
  const boxes = rail.axesY.map(y => [near,station+50,y-rail.sectionNS/2,y+rail.sectionNS/2,
    railBottom(station+50),railBottom(near)+rail.sectionVertical]);
  // Two independent cantilever heads run outside each rail, wholly above -1175.
  const postY = [5950,7850];
  rail.axesY.forEach((y,i)=>boxes.push([station-50,station+50,
    Math.min(y,postY[i])-25,Math.max(y,postY[i])+25,-1175,railBottom(station)+25]));
  boxes.push([wet.start,far,wet.high[0]-25,wet.high[0],wet.endBed,wet.rim],
    [wet.start,far,wet.high[1],wet.low[0],wet.endBed,wet.rim],
    [wet.start,far,wet.low[1],wet.low[1]+25,wet.endBed,wet.rim]);
  // Let the cleaning shoe touch a lining. Keep 5 mm from steel. Numerical epsilon
  // distinguishes tangency to a wall from entering its solid.
  const obstacles = boxes.map((b,i)=>grow(b,i<4 ? radius+allowance : radius-1e-7));
  const ports = [14350,14750,15550].flatMap(x=>{
    const rows = x>15000 ? [6250,6850,7380] : [6250,6850,7530];
    if(sillGuides && x<15000) rows.push(6100,7175);
    return rows.map(y=>[x,y,-90]);
  });
  // The two closely spaced south guides share a single physical trimmed aperture.
  const frames=[];
  for(const [x,y] of [...ports].sort((a,b)=>a[0]-b[0] || a[1]-b[1])){
    const previous=frames.at(-1);
    if(previous && previous.x===x && previous.yMax>=y-90) previous.yMax=Math.max(previous.yMax,y+90);
    else frames.push({x,yMin:y-90,yMax:y+90});
  }
  const sill = grow([wet.start-25,wet.start+25,...wet.high,wet.bed,wet.crest],radius);
  // Smaller tool targets are centres, allowing the 25 mm head to touch each boundary.
  function reachable(t) {
    return ports.filter(p=>{
      const length=Math.hypot(...t.map((v,i)=>v-p[i])) * t[2]/(t[2]-p[2]);
      const dx=Math.abs(t[0]-p[0]),dy=Math.abs(t[1]-p[1]),depth=p[2]-t[2];
      const apertureX=180*dx/depth+2*radius*Math.sqrt(1+(dx/depth)**2);
      const apertureY=180*dy/depth+2*radius*Math.sqrt(1+(dy/depth)**2);
      const otherLane = (p[1] > wet.high[1]) !== (t[1] > wet.high[1]);
      return !otherLane && length<=2050 && apertureX<=200 && apertureY<=180
        && !obstacles.some(b=>crosses(p,t,b)) && !crosses(p,t,sill);
    }).map(p=>Math.hypot(...t.map((v,i)=>v-p[i])) * t[2]/(t[2]-p[2]));
  }
  const ranges=(a,b)=>[...Array.from({length:Math.ceil((b-a)/25)},(_,i)=>a+i*25),b];
  let targetCount=0, missed=0, longest=0; const missedExamples=[];
  for(const [y0,y1] of [wet.high,wet.low]){
    const xRange=y0===wet.high[0] ? [...ranges(near,wet.start-55),...ranges(wet.start+55,far)] : ranges(near,far);
    for(const x of xRange) {
      const localBed=wet.bed-Math.max(0,x-wet.start)/20;
      for(const y of ranges(y0+radius,y1-radius)){
        const options=reachable([x,y,localBed+radius]);
        targetCount++;
        if(options.length) longest=Math.max(longest,Math.min(...options));
        else {missed++;if(missedExamples.length<8)missedExamples.push([x,y]);}
      }
    }
  }
  let sillTargets=0,sillMisses=0;
  for(const y of ranges(wet.high[0]+radius,wet.high[1]-radius)){
    for(const x of [wet.start-55,wet.start+55]){
      for(const z of ranges(wet.bed+radius,wet.crest+radius+5)){
        sillTargets++; if(!reachable([x,y,z]).length){sillMisses++;if(missedExamples.length<4)missedExamples.push([x,y,z]);}
      }
    }
    sillTargets++; if(!reachable([wet.start,y,wet.crest+radius+5]).length){sillMisses++;if(missedExamples.length<4)missedExamples.push([wet.start,y,wet.crest+radius+5]);}
  }
  const n=house.joint.handling.referenceVerticalLoadN;
  return {ports, frames, testPitch:25,sillTargets,sillMisses,targetCount,missed,missedExamples,longest,
    railAxes:rail.axesY,railBottomAtCrest:railBottom(wet.start),station,
    existingPostY:rail.sidePostY,postY,footingWidthBudget:150,
    wetFootingGap:Math.min(wet.basin[1]-postY[0],postY[1]-(wet.basin[1]+wet.basin[3]))-75,
    armLength:rail.axesY[0]-postY[0],momentKNm:n*(rail.axesY[0]-postY[0])/1e6,
    crewY:crew.centreY, committed:false};
}
