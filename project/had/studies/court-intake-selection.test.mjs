import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {courtIntakeSelection} from './court-intake-selection.mjs';
import {intakeFigure,detailFigure} from './court-intake-figure.mjs';

const d=courtIntakeSelection(), {inlet,basket,frame}=d;
const close=(a,b,eps=.005)=>assert(Math.abs(a-b)<eps,`${a} != ${b}`);

test('buy the continuous unlowered approach and return both wet edges',()=>{
  assert.deepEqual(inlet.continuousApron,[5925,6625,200,773.5]);
  assert.equal(d.access.chamberTo200Approach,25);
  const w=inlet.cases.at(-1);
  close(w.pairedEdgeHighAndShort,3.630); assert(w.oldSix5High<d.incoming.duty && w.pairedEdgeHighAndShort>d.incoming.duty);
  assert.equal(inlet.pairedStepClear,6.5);
  assert(Math.min(...inlet.northSouthBridgeGaps)-10>7.5);
  assert(Math.min(...inlet.treadMinimum)>66);
  assert.equal(inlet.originalSaddlePastSpout,20);assert.equal(inlet.saddleToHood,10);
  assert(inlet.spout.undersideToBottomAfterTwo5>18);
  assert.equal(inlet.historicalWesternPanRelease.translationE,35);
  assert.equal(inlet.newWesternRelease.captureThenEast,50);
  assert.equal(inlet.historicalWesternPanRelease.clearOfCourtFace,10);assert.equal(inlet.newWesternRelease.pairedGap,5);
  assert.deepEqual(inlet.asBuilt,[[6630,7393.5]]);assert.equal(inlet.fixedNorthernGable.outerSheetY,7400);
});

test('the port receives two different feeds; backup, fouling and reinstallation remain falsifiable',()=>{
  const [a,b]=basket.cases;
  close(a.requiredHead,13.903);close(b.requiredHead,21.094);
  close(b.allowedNominalTail,-743.741);assert(b.reserveAgainst20>13 && b.halfObstructedReserve<0);
  assert.deepEqual(d.incoming.directRoofTerminal,[7450,7000,-80]);assert.deepEqual(basket.fullNozzleWestEastClear,[21,18]);
  assert(basket.minimumWidthAfterSkew>1.6 && basket.minimumWidthAfterSkew<2);
  assert.equal(basket.shoe.parkedGapToBeam,40);assert.equal(basket.shoe.parkedGapToBasket,15);
  close(basket.removal.eachGateMargin,176.25);assert(Math.min(...basket.removal.yawMargin)>200);
  assert.equal(basket.removal.overhead,1105);
  assert.equal(d.limits.firstSusceptible,null);
});

test('one connected, signed corner at a time; all four rests, two water paths and the clear ramp rack remain',()=>{
  assert.equal(frame.chambers.aisle,frame.chambers.east[0]-(frame.chambers.normal[0]+frame.chambers.normal[2]));
  assert.equal(frame.chambers.aisle,700);assert.match(frame.chambers.stageOnly,/700 mm ground aisle/);assert.deepEqual(frame.ramp.originalPadConflict,[400,400]);
  assert.deepEqual(frame.ramp.removedTipOnly,[400,50]);assert.equal(frame.ramp.gateToPad,20);
  assert.equal(frame.apronLatch.rimFeedClearX,55);assert.equal(frame.apronLatch.asBuiltModuleToFoot,40);
  close(frame.capture.dryToSecondary,45);assert.equal(frame.capture.oldDryToNew,-10);
  assert.deepEqual(frame.cases[2].restOverWell,[600,500]);
  for(const c of frame.cases){
    assert(c.containsRest && Math.min(...c.cornerPad)<0 && Math.min(...c.restPad)<0);
    close(c.cornerPad.reduce((a,b)=>a+b),5);
    assert(Math.min(...Object.values(c.clearPipeToTower))>=100);
    for(const a of c.tieCases)for(let i=0;i<2;i++)close(a.westTie[i]+a.eastTie[i]+a.ground[i],a.force[i]);
  }
  close(frame.cases[1].combinedPad[2],-20.507);
  assert(frame.ramp.rackOverFirstRest.every(([x,y])=>x*y===0));
});

test('publish the selected architectural record unchanged and retain the independent alternatives',()=>{
  assert.equal(d.id,'HAD-COURT-INTAKE-01');
  assert.equal(d.structuralCandidate,'SAP-C1');
  assert.equal(d.alternatives.closed.stageExtra,2200);
  assert.equal(d.alternatives.closed.walkingCoverCount,10);assert.equal(d.alternatives.closed.wetCoverCount,6);
  assert.deepEqual(d.alternatives.openAirCut.furnitureHits,[]);
  assert.deepEqual(d.eastExport.siteStates.map(v=>v.farMax),[-1000,-1600]);
  assert.deepEqual(d.limits.hydraulicAcceptance,false);
  const name='project/had/studies/court-intake-selection';
  assert.equal(fs.readFileSync(name+'.json','utf8'),JSON.stringify(d,null,2)+'\n');
  assert.equal(fs.readFileSync(name+'.svg','utf8'),intakeFigure(d));
  assert.equal(fs.readFileSync(name+'-detail.svg','utf8'),detailFigure(d));
});
