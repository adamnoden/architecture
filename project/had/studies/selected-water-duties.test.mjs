import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deriveCurrentHouse,scheduleText} from './current-house.mjs';
import {inletEnvelopeWitness,selectedKitchenTail,segmentLengthInsideBox} from './selected-water-duties.mjs';
import {deriveInternalLeakStudy,pathIsOpen,retainedVolume,verifyPreFixBoundary} from '../../mra/studies/internal-leak-study.mjs';

const root=new URL('../../../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root)));
const house=deriveCurrentHouse();
const base=read('project/mat/studies/whole-house-service-baseline.json');
const water=read('project/ias/studies/household-water.json');
const study=deriveInternalLeakStudy();

test('both current kitchen duty surfaces meet the authored raised branch, without reviving the rejected +300 internal route',()=>{
  const expected=[[9275,12000,273.7625],[9275,12450,-2480]];
  assert.deepEqual(selectedKitchenTail(water,base),expected);
  for(const s of [house.model.architecturalServices,house.model.servicesInterface]){
    const d=s.otherServiceDuties.find(d=>d.id==='foul-kitchen');
    assert.deepEqual(d.path,expected);
    assert.match(d.pathScope,/Downstream wall crossing/);
    assert.equal(d.upstreamSource,'project/ias/studies/household-water.json#/kitchen');
  }
  const stale=structuredClone(base);
  stale.interfaces.kitchenSinkStation.wasteRequiredRoute[2]=[9150,12000,382.0625];
  assert.throws(()=>selectedKitchenTail(water,stale),/share X/);
  const low=structuredClone(water);low.kitchen.regrade[4]-=1;
  assert.throws(()=>selectedKitchenTail(low,base),/reach the existing downstream wall level/);
  assert(water.kitchen.crossings.every(c=>c.old<0&&c.clearance>13));
});

test('the current rejected inlet remains geometrically unchanged and cannot appear as a resolved adoption',()=>{
  const original=base.interfaces.architecturalServices.otherServiceDuties.find(d=>d.id==='incoming-water').path;
  const witness=inletEnvelopeWitness(house.model);
  assert.deepEqual(witness.box,{low:[10980,3797,100],high:[11530,3997,700]});
  assert.equal(witness.totalLengthInsideRequiredEnvelopeMM,200);
  for(const s of [house.model.architecturalServices,house.model.servicesInterface]){
    const d=s.otherServiceDuties.find(d=>d.id==='incoming-water');
    assert.deepEqual(d.path,original);
    assert.equal(d.status,'REJECTED_RETAINED_ROUTE');
    assert.equal(d.currentWitness.totalLengthInsideRequiredEnvelopeMM,200);
    assert.match(d.adoptionRequirement,/lobby alternative remains unadopted/);
  }
  assert.equal(house.model.currentAdoptionBlockers.length,1);
  assert.match(house.model.currentAdoptionBlockers[0],/200 mm.*plant-N/);
  assert.equal(house.architecturalServiceSelected,true);
  // Independent positive/negative controls for the box intersection, not an
  // assumed solid radiator or a licence for a different inlet route.
  assert(Math.abs(segmentLengthInsideBox([0,0,0],[0,10,0],[-1,3,-1],[1,7,1])-4)<1e-12);
  assert.equal(segmentLengthInsideBox([2,0,0],[2,10,0],[-1,3,-1],[1,7,1]),0);
});

test('pre-fix main bytes and captured house identities constrain the correction to the declared metadata',()=>{
  assert.equal(scheduleText(house),readFileSync(new URL('project/had/studies/current-house-services.json',root),'utf8'));
  assert.equal(verifyPreFixBoundary(house).unchanged,true);
  const port=structuredClone(house);port.model.exteriorPortGeometry[0].p[0]+=1;
  assert.throws(()=>verifyPreFixBoundary(port),/exteriorPortsSHA256/);
  const unrelated=structuredClone(house);unrelated.model.groundFurniture['service-utility-washer'][0]+=1;
  assert.throws(()=>verifyPreFixBoundary(unrelated),/houseExceptDeclaredChangesSHA256/);
});

test('finite witnesses cannot contain the explicit unattended slow-leak sensitivity',()=>{
  assert.deepEqual(study.witnesses.map(w=>w.netL),[1.25,.4,2]);
  assert.deepEqual(study.witnesses.map(w=>w.slowLeakSensitivity.fullHours),[12.5,4,20]);
  assert(study.witnesses.every(w=>w.slowLeakSensitivity.excessAfter24hL>0));
  assert.deepEqual(study.witnesses.map(w=>Number(w.maximum24hLeakLhWithoutOutflow.toFixed(8))),[.05208333,.01666667,.08333333]);
  assert(Math.abs(retainedVolume({initialL:.05,flowLmin:30,seconds:5})-2.55)<1e-12);
  assert.equal(retainedVolume({flowLmin:0,seconds:3600,residualL:1}),1);
  assert.throws(()=>retainedVolume({flowLmin:-1,seconds:5}),/non-negative/);
  assert(study.witnesses.every(w=>w.fiveSecondsAfterVisibilityAt30Lmin.excessL>0));
});

test('an upstream fault survives fixture closure; stored circuits and a common blocked waste remain separate challenges',()=>{
  assert.deepEqual(study.cutCases.map(c=>c.sourcePathRemains),[false,true,false,true,true]);
  assert.equal(pathIsOpen(study.commonWaste.paths.overflow,['bowl-waste']),true);
  assert.equal(study.commonWaste.bowlPasses,false);
  assert.equal(study.commonWaste.overflowPasses,false);
  assert.equal(study.inventory.dhw.orderedMinimumUsableL,300);
  assert.equal(study.inventory.dhw.stockAcceptedAt3point5Bar,false);
  assert.equal(study.inventory.dhw.drainableL,null);
  assert.equal(study.inventory.heatingBuffer.nominalL,300);
  assert.equal(study.inventory.heatingBuffer.usefulLayerRequiredL,260);
  assert.equal(study.inventory.heatingBuffer.drainableL,null);
});

test('the selected occurrence inventory includes process water and preserves already-earned limited geometry',()=>{
  assert.equal(study.inventory.cold,14);assert.equal(study.inventory.hot,9);
  assert.equal(study.inventory.waterCorridors.length,8);
  assert.equal(study.inventory.waterCorridorTotalMM,68250);
  assert.equal(study.inventory.hotReturns.length,4);
  assert.equal(study.inventory.heatingEmitters.length,16);
  assert.equal(study.inventory.electricHeaters.length,4);
  assert.equal(study.inventory.condensatePorts.length,6);
  assert.deepEqual(study.inventory.highLevelHydronicCoil.z,[2150,2755]);
  assert.equal(study.inventory.highLevelHydronicCoil.hydraulicRoute,null);
  assert(study.inventory.basins.every(b=>b.stopProjectionsInsidePan));
  assert.equal(study.washerMaintenance.frontDrainTrayUsableL,null);
  assert.equal(study.washerMaintenance.simultaneousTapWorkerClearanceMM,-106);
  assert.equal(study.washerMaintenance.dryRestElectricalOverlapMM2,209300);
  assert(study.cases.every(c=>['OBLIGATION','REWIND'].includes(c.status)));
  assert(study.cases.some(c=>c.status==='REWIND'&&c.occurrence.includes('Incoming')));
});
