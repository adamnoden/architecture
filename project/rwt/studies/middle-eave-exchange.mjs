/** One removable centre cassette of the south courtyard receiver. All coordinates in mm. */
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const local = name => JSON.parse(readFileSync(new URL(name, import.meta.url), 'utf8'));
const prior = local('./live-receiver-renewal.json');
const corner = local('./live-receiver-corner-failure.json');
const house = local('../../had/studies/water-replan.json').model;
const {A, guard} = prior.profiles;
const middle = A.modules[3];
const centre = (middle.p[0]+middle.p[1])/2;
const half = (middle.p[1]-middle.p[0])/2;
const q = y => house.court[1]-y;
const drips = [prior.world.primary,prior.world.secondary].map(([,y,z])=>[q(y),z]);
const allowance=10;

export function compare({stroke=90, drop=225, outward=500, apronPark=80}={}) {
  const trayP=[middle.p[0]-150,middle.p[1]+150];
  const parkedQ=[-420,-240], liveQ=parkedQ.map(x=>x+stroke);
  const trayCrown=6810, traySide=70;
  const trayEnd=trayCrown-(half+150)*A.longFall;
  const trayUnder=trayEnd-prior.profiles.B.gauge-prior.profiles.B.frameDepthReservation;
  const centreEnd=6710, top=6765;
  const centreBed=centreEnd+(half-20)*A.longFall;
  // Independent blind ends on the inner edges of the two retained neighbours.
  // j=0 is the seam, j positive toward the removable centre on either side.
  const dam=6680, link=[-35,35], linkInvert=j=>6696+(j-35)/20;
  const parkedApron=link.map(j=>j-apronPark);
  const railR=guard.tubeDiameter/2, guardQ=q(guard.platform[1]);
  const bottom=A.bottom-A.carrierDepth;
  const movedTop=top-drop, movedLow=bottom-drop;
  const shaft=middle.extractionCentre, guardPosts=guard.posts.filter(p=>p<shaft);
  const leftPost=Math.max(...guardPosts),rightPost=Math.min(...guard.posts.filter(p=>p>shaft));
  const outerQ=A.q.map(y=>y-outward);
  const restX=[shaft-260,shaft+260];
  const restY=outerQ.map(v=>house.court[1]-v).reverse();
  const restDeck=[restX[0],restY[0]-25,520,restY[1]-restY[0]+50];
  const fullFlow=prior.catchments.branchChallengeLps;
  // Critical specific energy above the local control bed, zero losses.
  const energy=width=>1500*Math.cbrt((fullFlow/1000)**2/(9.81*(width/1000)**2));
  const endMinMargin=Math.min(parkedQ[0]-A.q[0],A.q[1]-liveQ[1]);
  const cornerGap=Math.min(trayP[0]-corner.west[0].x,corner.east[0].x-trayP[1]);
  return {
    stage:{middleP:middle.p, positionP:centre, cassetteQ:A.q, highLipZ:top,
      centreBedZ:centreBed, endBedZ:centreEnd, neighbourFrontSpill:A.front,
      blindEndTopZ:dam, qDrips:drips, movedTopZ:movedTop, movedUndersideZ:movedLow,
      extractionCentreP:shaft, finalQ:outerQ, restStandXYWH:restDeck,
      standTopZ:guard.floor+210, loadedLoweringToStand:movedLow-guard.floor-210},
    bypass:{p:trayP, dryQ:parkedQ, liveQ, crownZ:trayCrown, invertAtEnds:trayEnd,
      undersideZ:trayUnder, highestLipZ:trayCrown+traySide,
      firstSecondaryThenPrimaryStroke:drips.map(([d])=>d-parkedQ[1]).reverse(),
      dryParkDripGap:Math.min(...drips.map(([d])=>d-parkedQ[1])),
      leastLiveDripToEdge:Math.min(...drips.flatMap(([d])=>[d-liveQ[0],liveQ[1]-d])),
      leastTailToNeighbourQ:endMinMargin, sideEdgePlanGap:cornerGap,
      lowerDripAboveLip:Math.min(...drips.map(([,z])=>z))-trayCrown-traySide,
      upperTrayFrameOverCassette:trayUnder-top, tailBeyondParkedApron:150+parkedApron[0]},
    apron:{wetExtentJ:link,parkedJ:parkedApron,apronPark,
      overlapUnderCentre:link[1]-20, clearanceUnderCentre:centreEnd-A.gauge-linkInvert(20),
      minimumSweptFloorClearance:centreEnd-A.gauge-linkInvert(link[1]),
      undersideOverBlindEnd:linkInvert(0)-A.gauge-dam,
      parkedEndClearOfSeam:-parkedApron[1], backSpillFreeDrop:trayEnd-A.front},
    handling:{drop,outward, nominalToNeighbourUnderside:bottom-movedTop,
      former200DropToNeighbour:bottom-(top-200),
      aboveMidrail:movedLow-(guard.midCentre+railR),belowToprail:guard.topCentre-railR-movedTop,
      pToGuardPost:Math.min(shaft-half-leftPost-railR,rightPost-railR-shaft-half),
      minOutwardForTenAllowance:A.q[1]-(guardQ-railR-allowance),
      after400ToOutboardGuardFace:guardQ-railR-(A.q[1]-400),
      restBodyToOutboardGuardFace:guardQ-railR-outerQ[1],
      standToInnerGuard:restDeck[1]-(guard.platform[1]+railR),
      standToOuterGuard:guard.outerGuardY-railR-(restDeck[1]+restDeck[3]),
      frontPickupProjectionBudget:A.q[0]-(guardQ+railR)-allowance},
    water:{flowLps:fullFlow, bypassOpeningWidth:160, normalEndClearWidth:300,
      criticalEnergyBypass:energy(160),criticalEnergyNormal:energy(300),
      grossReserveBypassAtOppositeEnd:trayEnd+traySide-trayCrown-energy(160),
      grossReserveNormal:top-centreBed-energy(300),
      blockedNeighbourSpillsBeforeApronReturn:linkInvert(link[0])-A.front,
      blockedNeighbourSpillsBeforeBypassReturn:trayEnd-A.front},
    scope:'Unadopted central-bay operation with two live adjacent receivers. Support and wet-performance tests, the fixed end boxes and major repair remain separate. A blocked neighbour can spill before its elevated return backs up.'
  };
}

export const result=compare();

function figure(r) {
  const {stage:s,bypass:b,handling:h}=r;
  const o=['<svg xmlns="http://www.w3.org/2000/svg" width="1040" height="580" viewBox="0 0 1040 580" role="img">',
    '<title>South courtyard receiver: centre cassette and short bypass</title>',
    '<rect width="1040" height="580" fill="#faf9f5"/><g font-family="sans-serif" fill="#253839">'];
  const label=(x,y,v,n=14)=>o.push(`<text x="${x}" y="${y}" font-size="${n}">${v}</text>`);
  const box=(x,y,w,h,fill,stroke='none',dash='')=>o.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-dasharray="${dash}"/>`);
  const line=(x1,y1,x2,y2,col,w=2)=>o.push(`<path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${col}" stroke-width="${w}" fill="none"/>`);
  label(28,36,'Replace one straight cassette below both courtyard drips',25);
  label(28,65,'South courtyard. Plan at the central high point. Millimetres; vertical positions are given in the section notes.');
  const X=p=>36+(p-5100)*.40,Y=q=>125+(-q-100)*.36;
  const qb=(pr,qr,fill,stroke,dash)=>box(X(pr[0]),Y(qr[1]),(pr[1]-pr[0])*.40,(qr[1]-qr[0])*.36,fill,stroke,dash);
  const neighbours=[A.modules[2].p,A.modules[4].p];
  for(const plan of neighbours)qb(plan,A.q,'#e4e1d4','#958e77');
  qb(s.middleP,A.q,'#d2dbdc','#60777d');
  qb(b.p,b.dryQ,'none','#8d6558','5 4');
  qb(b.p,b.liveQ,'#c0ddd4','#24695d');
  for(const [d] of drips)line(X(A.modules[2].p[0]),Y(d),X(A.modules[4].p[1]),Y(d),'#405869',1);
  for(const end of s.middleP)line(X(end),Y(A.q[0]),X(end),Y(A.q[1]),'#8a544b',3);
  for(const p of guard.posts.filter(v=>v>5100&&v<6900))box(X(p)-5,Y(q(guard.platform[1]))-5,10,10,'#34454a');
  qb([s.extractionCentreP-half,s.extractionCentreP+half],s.finalQ,'none','#24695d','5 4');
  label(116,104,'W retained',15);label(310,104,'Centre removed',15);label(524,104,'E retained',15);
  label(42,298,'Inner guard posts',13);label(104,448,'First rest on the guarded deck',14);
  label(719,112,'Bypass stays above the cassette',18);
  label(719,146,`Crown +${b.crownZ}; side height 70`);
  label(719,175,`End invert +${b.invertAtEnds.toFixed(1)}`);
  label(719,204,`Frame clears new lip by ${b.upperTrayFrameOverCassette.toFixed(1)}`);
  label(719,245,'Brown outline: dry position.');label(719,269,'Green: live; both drips intercepted.');
  label(719,310,'Move the centre cassette',18);
  label(719,339,`Lower ${h.drop}, shift west ${(centre-s.extractionCentreP).toFixed(1)}.`);
  label(719,366,`Draw ${h.outward} out, clear the guard.`);
  label(719,393,`Lower ${s.loadedLoweringToStand.toFixed(0)} onto the stand.`);
  label(28,503,'The two end drips stay over the adjacent troughs throughout the 90 mm slide. The perpendicular roof edges remain on their own receivers.');
  label(28,531,'If a neighbouring outlet blocks downstream, its existing front lip spills first. This detail requires both receiving paths to remain available.');
  return [...o,'</g></svg>',''].join('\n');
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  for(const [ext,body] of [['json',JSON.stringify(result,null,2)+'\n'],['svg',figure(result)]]) {
    const path=new URL('./middle-eave-exchange.'+ext,import.meta.url);
    if(process.argv.includes('--check')) { if(readFileSync(path,'utf8')!==body) throw Error('Stale '+ext); }
    else writeFileSync(path,body);
  }
}
