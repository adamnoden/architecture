/** 
 * FIRST north-window-0 — bounded stay-length counterexample.
 *
 * This tests only an AUTHORED pair of pivot centres against the dimensions
 * recorded from AXA 20 IN; it does NOT prove the manufacturer offers those
 * centres, a matched frame plate, tolerances, forces, control or safe release.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const basis=Object.freeze({
  hadPath:'project/had/studies/open-north-loggia.json',
  hadGitBlob:'25faad2c4d40df2b7da7212f73808843a88d2f52',
  occurrence:'FIRST / outer-north / north-window-0',
  manufacturerReference:'AXA telescopic casement stay 20 IN installation drawing F0005729 (2026)',
  documentedTravelMm:[222,286],
  documentedFrameHolePitchMm:25,
  documentedLeafHolePitchMm:20,
  // These are NOT OEM pivot-centre locations. They are the predecessor study's
  // explicit, falsifiable installed-geometry hypothesis.
  leafPivotOffsetMm:77,
  horizontalPivotOffsetMm:145,
  normalPivotOffsetMm:-10,
  productLengthOffsetMm:79
});

const root=new URL('../../../',import.meta.url);
function gitBlob(raw) {
  return createHash('sha1')
    .update(`blob ${Buffer.byteLength(raw)}\0`)
    .update(raw)
    .digest('hex');
}
export function readSelectedOccurrence() {
  const raw=readFileSync(new URL(basis.hadPath,root),'utf8');
  assert.equal(gitBlob(raw),basis.hadGitBlob,
    'HAD source changed: reconsider the opening and the bounded stay trial');
  const house=JSON.parse(raw);
  const occurrence=house.openings.FIRST.find(
    o=>o.wall==='outer-north'&&o.id==='north-window-0'
  );
  assert(occurrence,'selected FIRST north window missing');
  assert.equal(occurrence.width,1000);
  assert.equal(occurrence.sill,850);
  assert.equal(occurrence.head,2850);
  assert.equal(occurrence.centre,1800);
  return occurrence;
}
export function authoredLengthMm(angleDeg,side=1) {
  assert(Number.isFinite(angleDeg)&&angleDeg>=0&&angleDeg<=90,
    'angle must be 0–90 degrees');
  assert(side===1||side===-1,'side must be mirrored +1 or -1');
  const a=angleDeg*Math.PI/180;
  const [m,d,n]=[
    basis.leafPivotOffsetMm,
    basis.horizontalPivotOffsetMm,
    basis.normalPivotOffsetMm
  ];
  const hinge=[1800+side*400,11540];
  const tangent=[-side*Math.cos(a),-Math.sin(a)];
  const normal=[side*Math.sin(a),-Math.cos(a)];
  const leafPivot=[
    hinge[0]+m*tangent[0]+n*normal[0],
    hinge[1]+m*tangent[1]+n*normal[1]
  ];
  const framePivot=[hinge[0]-side*(m+d),hinge[1]-n];
  return Math.hypot(
    leafPivot[0]-framePivot[0],leafPivot[1]-framePivot[1]
  )+basis.productLengthOffsetMm;
}
export function authoredAngleAtMaximumMm(maxLengthMm=basis.documentedTravelMm[1]) {
  assert(Number.isFinite(maxLengthMm));
  const from=authoredLengthMm(0),to=authoredLengthMm(90);
  assert(maxLengthMm>from&&maxLengthMm<to,
    'requested bound outside this 0–90 degree root interval');
  let lo=0,hi=90;
  for(let k=0;k<70;k++) {
    const mid=(lo+hi)/2;
    if(authoredLengthMm(mid)>maxLengthMm) hi=mid;
    else lo=mid;
  }
  return (lo+hi)/2;
}
export function boundedDecision() {
  readSelectedOccurrence();
  const within70=authoredLengthMm(70);
  const old80=authoredLengthMm(80);
  const limit=authoredAngleAtMaximumMm();
  return {
    basis,
    trial70LengthMm:within70,
    trial70NominalExtensionRemainingMm:basis.documentedTravelMm[1]-within70,
    old80LengthMm:old80,
    old80OverMaximumMm:old80-basis.documentedTravelMm[1],
    theoreticalZeroToleranceAngleLimitDeg:limit,
    earlierFrameHolePitch40DisagreesWithDocumented25:true,
    disposition:'Reject the 80-degree pivot trial as a match to this 20 IN travel envelope. 70 degrees is a conditional hypothesis only: OEM pivot centres, mechanical stops, clearances, product mounting, weather boundary, load, capture and complete first release remain unproved.'
  };
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]) {
  const d=boundedDecision();
  console.log(JSON.stringify(d,null,2));
}
