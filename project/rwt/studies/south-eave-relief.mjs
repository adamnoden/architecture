/** Wall-side gravity relief for the retained south neighbours during centre renewal. */
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {result as exchange} from './middle-eave-exchange.mjs';

const local = name => JSON.parse(readFileSync(new URL(name, import.meta.url), 'utf8'));
const source = local('./live-receiver-renewal.json');
const house = local('../../had/studies/water-replan.json').model;
const {A, guard} = source.profiles;
const gravity = 9.81;

function section(flow, width, depth) {
  const velocity = 1000 * flow / (width * depth); // L/s and mm to m/s
  return {velocity, velocityHead:1000 * velocity**2 / (2*gravity),
    hydraulicDiameter:4*width*depth / (width+2*depth)};
}

function critical(flow, width) {
  const depth = 1000 * Math.cbrt((flow / width)**2 / gravity);
  return {depth, ...section(flow,width,depth)};
}

export function relief() {
  const flow = source.catchments.branchChallengeLps;
  const wallY = house.court[1], q = [-90,-10], width=q[1]-q[0]-2*A.gauge;
  const outlets=A.outletsP, middle=(outlets[0]+outlets[1])/2;
  const p=A.p, sill=6610, endBed=6355, fall=.01, adverse=5;
  const crown=endBed+(middle-outlets[0])*fall;
  const mouths=[[p[0]+25,p[0]+425],[p[1]-425,p[1]-25]];
  const mouthWidth=mouths[0][1]-mouths[0][0];
  const longest=Math.max(outlets[1]-mouths[0][0],mouths[1][1]-outlets[0]);
  const ceiling=A.front-10, f=.05, localLossK=2;
  const gate=critical(flow,mouthWidth);
  // Full branch once. The upstream clear approach is narrower than the
  // 347 mm trough to reserve room for the projecting scupper shelf.
  const approach=section(flow,300,45);
  const approachLength=middle-outlets[0]+150;
  const approachLoss=(1+f*approachLength/approach.hydraulicDiameter)*approach.velocityHead;
  const donorBound=sill+adverse+gate.depth+2*gate.velocityHead+approachLoss;
  // Subcritical comparison. Critical depth bounds velocity from above and
  // hydraulic diameter from below. Any free internal control is no higher
  // than the crown. Apply all friction/minor losses over the entire far run.
  const control=critical(flow,width);
  const friction=f*longest/control.hydraulicDiameter*control.velocityHead;
  const minor=localLossK*control.velocityHead;
  const maxEnergy=crown+adverse+control.depth+control.velocityHead+friction+minor;
  const outletStageMax=endBed-adverse-10; // actual air gap at the low free lip
  // A sealed 120 × 90 clear lower lateral, independent of the normal inlet.
  // Full-liquid pressure screen only. Charge one outgoing velocity head too.
  const lateral={width:120,depth:90,length:Math.abs(A.permanentPipeQ-(q[0]+q[1])/2),
    inletInvert:6210,fall:1/30,bossHeadMax:6300,lossK:4};
  const lv=1000*flow/(lateral.width*lateral.depth);
  lateral.velocityHead=1000*lv**2/(2*gravity);
  lateral.diameter=2*lateral.width*lateral.depth/(lateral.width+lateral.depth);
  lateral.outletInvert=lateral.inletInvert-lateral.length*lateral.fall;
  lateral.requiredBoxHead=lateral.bossHeadMax+(1+lateral.lossK+f*lateral.length/lateral.diameter)*lateral.velocityHead;
  const head=house.sections.firstFFL+Math.max(...house.openings.FIRST.filter(o=>o.wall==='court-south').map(o=>o.head));
  const dryStand=exchange.stage.restStandXYWH;
  const install=outlets.map(x=>[x-75,x+75]); // 150 wide wet end boxes
  const firstWindows=house.openings.FIRST.filter(o=>o.wall==='court-south').map(o=>[o.centre-o.width/2,o.centre+o.width/2]);
  const windowJambGap=Math.min(firstWindows[0][0]-install[0][1],install[1][0]-firstWindows[1][1]);
  const lid=6690, frame=20, wall=6675;
  const maxWaterMassKgPerM=width*(wall-endBed)/1000;
  return {flow,p,wallY,q,width,outlets,middle,mouths,mouthWidth,sill,crown,endBed,adverse,
    longest,ceiling,f,localLossK,control,gate,approach,approachLength,approachLoss,donorBound,
    donorReserve:ceiling-donorBound,friction,minor,maxEnergy,outletStageMax,
    scupperAirGap:sill-adverse-maxEnergy,wall,lid,frame,head,maxWaterMassKgPerM,lateral,
    sillShelfQ:[-130,-55],guardQ:wallY-guard.platform[1]+guard.tubeDiameter/2,
    movingQ:exchange.stage.cassetteQ,standSouthY:dryStand[1],
    movingDryGap:q[0]-exchange.stage.cassetteQ[1],wallDryGap:-q[1],
    minimumWindowHeadGap:endBed-A.gauge-frame-head,windowJambGap,
    directions:outlets.map((blocked,i)=>({blocked,healthy:outlets[1-i],donorMouth:mouths[i],
      healthyBox:install[1-i],testFlow:flow,maximumEndStage:outletStageMax})),
  };
}

function plate(r) {
  const out=['<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="620" viewBox="0 0 1080 620">',
    '<title>South eave gravity relief with a blocked west leader</title><desc>Two scuppers feed a fixed wall-side channel. With the west leader blocked, water crosses behind the removable middle cassette to the east leader.</desc>',
    '<rect width="1080" height="620" fill="#faf9f5"/><g font-family="Arial,sans-serif" fill="#243d43">'];
  const text=(x,y,s,h=15)=>out.push('<text x="'+x+'" y="'+y+'" font-size="'+h+'">'+s+'</text>');
  const poly=(xy,c,w=2,dash='')=>out.push('<polyline points="'+xy.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" '+dash+'/>');
  const rect=(x,y,w,h,fill)=>out.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'"/>');
  const xp=p=>44+(p-r.p[0])*.29, yq=q=>125+(-q)*.18, zz=z=>486-(z-r.endBed)*.38;
  const blue='#276780',metal='#b7b8ae',rust='#b65f3f',green='#326e60';
  text(35,36,'Gravity relief behind the south courtyard gutter',25);
  text(35,63,'West leader blocked in this view. Repeat the test with the east leader blocked.');
  text(42,100,'PLAN · wall above, court below',16);
  rect(xp(r.p[0]),yq(0),xp(r.p[1])-xp(r.p[0]),3,metal);
  rect(xp(r.p[0]),yq(r.q[1]),xp(r.p[1])-xp(r.p[0]),(r.q[1]-r.q[0])*.18,blue);
  rect(xp(r.p[0]),yq(A.q[1]),xp(r.p[1])-xp(r.p[0]),(A.q[1]-A.q[0])*.18,'#d5d5c9');
  const [lm,rm]=exchange.stage.middleP;
  rect(xp(lm),yq(A.q[1]),xp(rm)-xp(lm),(A.q[1]-A.q[0])*.18,'#d2aa92');
  for(const m of r.mouths)rect(xp(m[0]),yq(-55),xp(m[1])-xp(m[0]),(130-55)*.18,green);
  for(const x of r.outlets) out.push('<circle cx="'+xp(x)+'" cy="'+yq(-250)+'" r="7" fill="'+rust+'"/>');
  poly([[xp(5430),yq(-50)],[xp(6610),yq(-50)]],'#ffffff',2);
  poly([[xp(6578),yq(-50)-3],[xp(6610),yq(-50)],[xp(6578),yq(-50)+3]],'#ffffff',2);
  const blocked=xp(r.outlets[0]), yy=yq(-250);
  poly([[blocked-5,yy-5],[blocked+5,yy+5]],'#ffffff',2);
  poly([[blocked-5,yy+5],[blocked+5,yy-5]],'#ffffff',2);
  text(42,237,'Green = 400 mm relief sills');text(362,237,'Ochre = centre cassette');text(655,237,'Blue = fixed 77 mm clear channel');
  text(42,290,'LONGITUDINAL SECTION · elevations exaggerated',16);
  poly([[xp(r.p[0]),zz(r.ceiling)],[xp(r.p[1]),zz(r.ceiling)]],rust,2,'stroke-dasharray="7 5"');
  poly([[xp(r.p[0]),zz(r.maxEnergy)],[xp(r.p[1]),zz(r.maxEnergy)]],green,2,'stroke-dasharray="5 4"');
  poly([[xp(r.p[0]),zz(r.endBed+1.5)],[xp(r.outlets[0]),zz(r.endBed)],[xp(r.middle),zz(r.crown)],[xp(r.outlets[1]),zz(r.endBed)],[xp(r.p[1]),zz(r.endBed+1.5)]],blue,5);
  for(const m of r.mouths)poly([[xp(m[0]),zz(r.sill)],[xp(m[1]),zz(r.sill)]],green,5);
  text(292,zz(r.ceiling)-9,'Donor limit +6665, 10 below the old front spill');
  text(313,zz(r.maxEnergy)+22,'Conservative collector energy bound +'+r.maxEnergy.toFixed(1));
  text(382,zz(r.crown)-12,'Crown +6370');
  text(44,520,'West outlet X4500');text(846,520,'East outlet X7500');
  text(35,561,'Water enters behind the outer retained modules. The middle cassette and its carrier can still drop towards the court.');
  text(35,589,'Required tests include an obstructed downpipe, healthy tailwater, reversing the fault, concentrated inflow and wet-joint leakage.');
  return [...out,'</g></svg>',''].join('\n');
}

if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const r=relief(), svg=plate(r), target=new URL('./south-eave-relief.svg',import.meta.url);
  if(process.argv.includes('--check')) {
    if(readFileSync(target,'utf8')!==svg) throw Error('Regenerate south-eave-relief.svg');
  } else writeFileSync(target,svg);
}
