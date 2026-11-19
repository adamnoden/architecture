import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {proposal,render} from './collector-access-recomposition.mjs';
test('south ordinary path retains full R300 and real parked gate, covers and weather-post reserves',()=>{
 const o=proposal(),a=o.ordinaryAccess;
 assert.equal(a.bodyRadius,300);assert.deepEqual(a.centreline,[[7050,5900],[7050,6600],[7325,6850]]);
 assert.equal(a.ramp[2]-2*a.bodyRadius,50);
 assert.equal(a.gate.parkedLeafToR300Path,27.5);
 assert.equal(a.finalBodyEastCoverReserve,25);
 assert.equal(a.turnStartsAfterBodySouthEdge,6300);
 assert.equal(a.NCanopyFootReserve,50);assert.equal(a.EWorkRoofPostReserve,200);
 const tip=a.removableTip.plan;assert(tip[1]<a.removableTip.bundPlaneY&&tip[1]+tip[3]>a.removableTip.bundPlaneY);
 assert(a.removableTip.parkedPlan[1]+a.removableTip.parkedPlan[3]<tip[1]);
 assert.equal(o.selectedGeometryChanged,false);assert.equal(o.accepted,false);
});
test('west underlap cannot borrow vertical release; actual neighbour removal and35 motion buy10 court clearance',()=>{
 const o=proposal(),c=o.collector,z=o.renewal.westernPanFirstMotion;
 assert.equal(o.retained.northWet+o.retained.southWet+o.retained.southPlain,10);
 assert(c.southWestGross[0]<c.westUnderlap.courtLipX,'Installedprojection really lies beneath fixedcourt');
 assert.equal(z.afterTranslationBodyX[0]-c.westUnderlap.courtLipX,10);
 assert(z.afterTranslationBodyX[1]>6430,'Neighbour2 really must leave before E35');
 assert.equal(z.neighboursRemoved.length,2);assert.equal(z.bridgeRemoved,true);
 assert(c.bridge.minimumSheetUndersideGap>6);
 assert(o.renewal.parkedLeafReserve>=25&&o.renewal.weatherEntryNorthReserve>=25);
 assert(o.loads.totalBoundingFullWaterKg>185);
 assert.equal(o.renewal.actualHandlerForceAndFullCrewSweepQualified,false);
});
test('guard support uncertainties and conditional failure remain visible in reproducible proposal',()=>{
 const o=proposal();assert.equal(o.hingeTradeoff.raisedLatch.actualParentAnchorage,null);
 assert.equal(o.hingeTradeoff.raisedLatch.parentPostCentreY,null);
 assert(o.hydraulicReference.retainedHinge.find(x=>x.lengthMm===200).passesThisReference===false);
 assert(o.hydraulicReference.hungLatch.find(x=>x.lengthMm===200).passesThisReference===true);
 assert.equal(fs.readFileSync('project/rwt/studies/collector-access-recomposition.json','utf8'),JSON.stringify(o,null,2)+'\n');
 assert.equal(fs.readFileSync('project/rwt/studies/collector-access-recomposition.svg','utf8'),render(o));
});
