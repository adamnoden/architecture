import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {choice} from './court-bypass-choice.mjs';
import {bypassPlate} from './court-bypass-plate.mjs';
const m=choice(), {feed:f,buried:b,handling:h,relief:r}=m;
test('the regrade reaches both existing limits and still rejects an unspread chamber jet',()=>{
  assert.deepEqual(f.floor,[[5750,-30],[6625,-72.75],[7400,-96]]);
  assert.equal(f.northWestLip,-92);assert.equal(f.unchangedSouthRamp,-52);
  assert.ok(f.capacity>4.45&&f.withTwoMore>4.10&&f.stageReserve>4.99);
  assert.ok(f.concentratedAfterSetout<1.25&&f.coveredFeedAssignedReserve>70);
  assert.ok(f.fittedFeed.pairedSurfaceReserve-f.fittedFeed.deflection>1.9);
  assert.ok(f.fittedFeed.pairedUndersideToPan>8&&f.fittedFeed.bendingMPa<200/1.1);
  assert.equal(f.gateAdapterAtEnds[1],10);
});
test('actual stage switches matter for a blocked spout, blocked basket or unavailable northern receiver',()=>{
  assert.ok(Math.min(...r.aboveBeds)>8);
  assert.deepEqual(r.cases[1].both.remaining,[560,280,0]);
  assert.ok(r.cases[0].both.marginToLowSide>16&&r.cases[1].both.marginToLowSide>12);
  assert.ok(r.cases[0].one.marginToLowSide<2&&r.cases[1].one.marginToLowSide<0);
  for(const c of r.cases){
    assert.ok(c.impactCell.stage<c.quietCell.stage&&c.quietCell.stage<-400);
    assert.ok(c.hoodPool>c.impactCell.crest&&c.reverseCell.tail<c.reverseCell.crest);
    assert.ok(c.slotToHighestGallery>11&&c.bottomExitReserve>60&&c.reverseCupMargin>43);
  }
  assert.equal(r.basket.bottomCoupling.axis[2],-915);assert.equal(m.qualifiedFirstHarm,null);
});
test('gully route crosses beneath actual ties and enters a real deeper forebay, with no independent north site credit',()=>{
  assert.deepEqual(b.crosses.map(v=>v.id),['low-tie-8050','low-tie-11667']);
  assert.ok(b.crosses.every(v=>v.pairedClear>100));assert.equal(b.nearestCap.clear,100);
  assert.ok(b.route.every((v,i)=>!i||v[2]<b.route[i-1][2]));
  for(const {axis} of b.branches)assert.ok(axis.every((v,i)=>!i||v[2]<axis[i-1][2]));
  assert.ok(b.receiver[0]>=b.siteBasin[0]&&b.receiver[1]>=b.siteBasin[1]);
  assert.ok(b.receiver[0]+b.receiver[2]<=b.siteBasin[0]+b.siteBasin[2]&&b.receiver[1]+b.receiver[3]<=b.siteBasin[1]+b.siteBasin[3]);
  assert.ok(b.forebayFloor<b.outerPipeBottom&&b.outerPipeBottom<b.basinBed);
  assert.ok(b.tails.every(c=>c.faultHead>-650&&c.belowGalleryRim>110));
});
test('the east carrier leaves vertically, the independent dry strip takes the pipe, and the hood pays its extra wet joint',()=>{
  assert.equal(h.firstLift.south30Interference,10);assert.equal(h.firstLift.westStroke,50);
  assert.equal(h.firstLift.dryCupToClosedSpoolPlatformAfterTwo5,15);
  assert.ok(h.packs.every(p=>p.clearAtGateEach>=31.25&&p.clearBetweenFlapsEach>=70&&p.belowRoofWith150Foot250Rig>600));
  assert.equal(h.hood.jointLength,2200);assert.equal(h.hood.belowAddedWindow,30);
  assert.ok(h.hood.aboveRetainedOutlet>47&&h.hood.rejectedWestSpoutWholeUprightOversize>139);
  assert.deepEqual(h.fifth.port,[7370,6920,160,160]);assert.equal(h.fifth.pairedPipeToEdge,6);
  assert.equal(h.packs[0].waterUpperKg,75.24);assert.equal(h.packs[1].waterUpperKg,146.88);
});
test('decision drawing and owned numerical record reproduce together',()=>{
  assert.deepEqual(JSON.parse(readFileSync(new URL('./court-bypass-choice.json',import.meta.url))),m);
  assert.equal(readFileSync(new URL('./court-bypass-choice.svg',import.meta.url),'utf8'),bypassPlate(m));
});
test('the actual cart parks entirely inside either flap and clears the west weather-post foot',()=>{
  assert.equal(h.cart.flapReserveEach,32.5);assert.equal(h.cart.gateReserveEach,26.25);
  assert.equal(h.cart.parkedWheelToBridge,25);assert.equal(h.cart.pairedWestPost,27.5);
  assert.ok(h.wholeHoodBought.every(p=>p.clearBetweenFlapsEach>=45&&p.clearAtGateEach>=170));
  assert.ok(h.cart.liftedAt4kN.east[0]<-6.8&&h.cart.liftedAt4kN.east[2]>7.1);
});

test('the selected open platform is different and fixed cups veto every 600 body station',()=>{
  const z=h.selectedOpenPlatform;
  assert.deepEqual(z.plan,[6725,6450,600,900]);assert.equal(z.z,-800);
  assert.deepEqual(z.fixedCupOverlaps,[[240,135],[240,105]]);assert.equal(z.cupRimAboveFeet,380);
  assert.equal(z.centreX,7025);assert.deepEqual(z.centreY,[6750,7050]);
  assert.equal(z.maxDistanceToSouthCup,95);assert.equal(z.remainingStandingStation,false);
  assert.deepEqual(z.remainingPipeCrownAboveFloor,[15,10]);
});
