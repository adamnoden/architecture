/** A passive low cross-feed between retained south-eave runs during centre exchange. */
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {result as exchange} from './middle-eave-exchange.mjs';

const prior = JSON.parse(readFileSync(new URL('./live-receiver-renewal.json', import.meta.url)));
const {A, guard} = prior.profiles;
const {stage, bypass, handling} = exchange;
const datum = prior.world.A[0][1] + A.q[0]; // q = south court wall Y minus world Y
const guardFace = datum - guard.platform[1] + guard.tubeDiameter / 2;
const gauge = A.gauge;
const assemblyReserve = 10;
const g = 9.81;

// Uniform velocity in a rectangular control. Minimise y + (1+K)v²/(2g)
// over all positive depths, giving the trial local loss every benefit.
export function minimumHead(flowLps, widthMm, lossK) {
  const unitFlow = flowLps / widthMm; // m²/s
  return 1500 * Math.cbrt((1 + lossK) * unitFlow ** 2 / g);
}

export function requiredWidth(flowLps, headMm, lossK) {
  return flowLps * Math.sqrt((1 + lossK) / (g * (headMm / 1500) ** 3));
}

export function crossfeed() {
  const duty = exchange.water.flowLps;
  const transferQ = [-480, -292], cassetteQ = [-277, A.q[1]];
  const ends = stage.middleP, halfLength = (ends[1] - ends[0]) / 2;
  const transferWidth = transferQ[1] - transferQ[0] - 2 * gauge;
  const endWidth = transferQ[1] - Math.max(transferQ[0], A.q[0]) - 2 * gauge;
  const cassetteWidth = cassetteQ[1] - cassetteQ[0] - 2 * gauge;
  const endInvert = A.centreInvert;
  const crown = endInvert + halfLength * A.longFall;
  const previousHighestBedAtJoin = A.centreInvert - halfLength*A.longFall
    + Math.max(...[A.q[0], transferQ[1]].map(q => Math.abs(q-A.valleyQ))) * A.crossFall;
  const frontFreeboard = 10, adverseLevel = 5, cassetteLip = 6773;
  const quietVelocity = .15, kineticCredit = 1000 * quietVelocity ** 2 / (2*g);
  const blockedStage = A.front - frontFreeboard;
  // Invert the specific-energy limit for an assigned local level or flow.
  const water = (width, staticHead) => ({
    width, staticHead, ideal:minimumHead(duty,width,0),
    adverseMargin:staticHead-adverseLevel+kineticCredit-minimumHead(duty,width,0),
    k1Margin:staticHead+kineticCredit-minimumHead(duty,width,1),
    adverseK1FlowLimit:width / requiredWidth(1,staticHead-adverseLevel+kineticCredit,1),
  });
  const normal = water(cassetteWidth, cassetteLip-stage.centreBedZ);
  const transfer = water(transferWidth, blockedStage-crown);
  const end = water(endWidth, blockedStage-endInvert);
  // Redistribute widths optimally; drop the trial metalwork and grant the
  // cassette its highest lip that still clears the live bypass by 10 mm.
  const maxNormalHead = bypass.undersideZ - assemblyReserve - stage.centreBedZ + kineticCredit;
  const maxTransferHead = blockedStage - crown + kineticCredit;
  const requiredK1 = [maxNormalHead, maxTransferHead].map(h => requiredWidth(duty,h,1));
  const maxGross = A.q[1] - (guardFace + assemblyReserve);
  const trayWidth = cassetteWidth + transferWidth;
  const highestAfterDrop = cassetteLip - handling.drop;
  // A separate sufficient energy budget for a free critical section. Price the
  // narrowest width at the highest bed and do not credit inlet velocity.
  const candidateFlow = 2;
  const criticalDepth = minimumHead(candidateFlow,endWidth,0) / 1.5;
  const candidate = {
    flowLps:candidateFlow, criticalDepth, totalLossBudget:criticalDepth/2,
    headNeeded:2*criticalDepth, available:blockedStage-crown-adverseLevel,
    healthyStageLimit:endInvert-adverseLevel+criticalDepth,
  };
  return {duty, ends, datum, transferQ, cassetteQ, guardFace, assemblyReserve,
    normal, transfer, end, endInvert, crown, previousHighestBedAtJoin, blockedStage,
    frontFreeboard, adverseLevel, kineticCredit, cassetteLip, requiredK1, maxGross,
    maxClear:maxGross-assemblyReserve-4*gauge, trialClear:trayWidth,
    dripMin:Math.min(...stage.qDrips.flatMap(([q])=>[q-cassetteQ[0],cassetteQ[1]-q])),
    guideGap:transferQ[0]-guardFace, separateBodies:cassetteQ[0]-transferQ[1],
    bypassToRaisedLip:bypass.undersideZ-cassetteLip,
    neighbourAfterDrop:(A.bottom-A.carrierDepth)-highestAfterDrop,
    underCrossfeed:endInvert-gauge-20-highestAfterDrop,
    candidate,
    outletsP:A.outletsP, fixedWallTop:A.front,
  };
}

function drawing(r) {
  const x = p => (32+(p-5480)*.61).toFixed(2);
  const y = q => (100+(-100-q)*.44).toFixed(2);
  const box = (ps,qs,fill,stroke) => '<rect x="'+x(ps[0])+'" y="'+y(qs[1])+'" width="'+((ps[1]-ps[0])*.61)+'" height="'+((qs[1]-qs[0])*.44)+'" fill="'+fill+'" stroke="'+stroke+'"/>';
  const line = (x1,y1,x2,y2,col,extra='') => '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+col+'" '+extra+'/>';
  const label = (x,y,t,size=15) => '<text x="'+x+'" y="'+y+'" font-size="'+size+'">'+t+'</text>';
  const [left,right] = r.ends;
  const pRange = [5480,6520], healthy = '#1e6d69';
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1040" height="500" viewBox="0 0 1040 500" role="img">',
    '<title>South courtyard gutter, low crossover during centre removal</title>',
    '<rect width="1040" height="500" fill="#faf9f5"/><g font-family="sans-serif" fill="#203b40">',
    label(30,37,'Could one retained outlet take over?',26),
    label(30,66,'South courtyard, X along gutter. Plan cuts the fixed crossover at its open ends. All dimensions in mm.'),
    box([pRange[0],left],A.q,'#dfdcd0','#7c796e'),box([right,pRange[1]],A.q,'#dfdcd0','#7c796e'),
    box(r.ends,r.cassetteQ,'#d7e0e5','#527383'),box(r.ends,r.transferQ,'#b3d9ce',healthy),
    ...stage.qDrips.map(([q])=>line(x(pRange[0]),y(q),x(pRange[1]),y(q),'#50616a','stroke-dasharray="4 3"')),
    ...r.ends.map(end=>line(x(end),y(r.transferQ[1]),x(end),y(A.q[0]),'#fcf9e8','stroke-width="4"')),
    line(x(pRange[0]),y(r.guardFace),x(pRange[1]),y(r.guardFace),'#564c47','stroke-width="3"'),
    label(44,128,'West retained'),label(252,119,'Removable drip tray'), label(514,128,'East retained'),
    label(254,210,'Fixed low crossover'),label(43,267,'Guard face q−506',13),
    line(x(5630),231,x(6390),231,healthy,'stroke-width="2"'),
    '<path d="M '+x(6390)+' 231 l -12 -5 v 10 z" fill="'+healthy+'"/>',
    label(30,309,'West downstream outlet blocked'),label(306,309,'East outlet open',15),
    label(30,336,'Reverse the flow when east is blocked. The middle drip tray and aprons can be out.',14),
    label(699,108,'Widths at the control sections',18),
    label(699,146,'Drip tray     '+r.normal.width+' clear'),
    label(699,177,'Crossover  '+r.transfer.width+' clear'),
    label(699,208,'End mouth  '+r.end.width+' clear'),
    label(699,246,'Only the end inside the existing'),
    label(699,267,'350-wide receiver communicates.'),
    line(30,359,1006,359,'#a7a492'),
    label(30,389,'The retained mouth governs',20),
    label(30,418,'At 3.604 L/s it needs '+r.end.ideal.toFixed(2)+' mm even without a local loss. The adverse trial grants only '+(r.end.ideal+r.end.adverseMargin).toFixed(2)+' mm.'),
    label(30,447,'With one velocity head lost, ideal width redistribution needs '+r.requiredK1.reduce((a,b)=>a+b).toFixed(2)+' mm clear. The guarded section offers '+r.maxClear+' mm.'),
    label(30,474,'Amber-grey = adjacent gutters. Blue = removable rear tray location. Green = bidirectional low connection.',13),
    '</g></svg>',''
  ];
  return svg.join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = crossfeed();
  for (const [ext, body] of [['json', JSON.stringify(r,null,2)+'\n'], ['svg', drawing(r)]]) {
    const path = new URL('./middle-eave-crossfeed.'+ext,import.meta.url);
    if (process.argv.includes('--check')) {
      if (readFileSync(path,'utf8') !== body) throw Error('Stale '+ext);
    } else writeFileSync(path,body);
  }
}
