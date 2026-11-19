import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {deriveUtilityDryBowlRelease} from './utility-dry-bowl-release.mjs';

test('separate dry bowl solves the exposed rail throat and keeps the transfer off the live tube field',()=>{
  const result=deriveUtilityDryBowlRelease();
  const {firstLift,capture,independentSupport}=result;
  assert.equal(result.rejectStock.maximumOuterWidthForFreeLoadedLiftMM,450);
  assert.equal(result.rejectStock.oldMaximumRawSideGapMM,10);
  assert.equal(firstLift.travelMM,385);
  assert.equal(firstLift.initialObstacleMargins['NS rail at x10975 / z850'],30);
  assert.equal(firstLift.initialPipeMargins['fixed waste'],35);
  assert.deepEqual(capture.boxFitted,[532,541,467]);
  assert.deepEqual(capture.clearSweeps.map(stage=>stage.clearanceMM),[54.5,51.5]);
  assert.equal(capture.rest.baseToActualRadiatorMM,30.5);
  assert.equal(capture.rest.rimZ,1000);
  assert(capture.rest.minimumIndependentBaseOverturnMomentNM>50);
  assert(independentSupport.rejectedSwingArm.clearancesMM['hot backbone']<0);
  assert(independentSupport.rejectedSwingArm.clearancesMM['cold backbone']<0);
  assert(independentSupport.clearancesMM['fan insulated duct and supports']>=25);
  assert.equal(result.rejectedManual.shortfallMM,247.5);
  assert.equal(result.physicalAssemblyAndWaterAccepted,false);
  assert.equal(readFileSync(new URL('./utility-dry-bowl-release.json',import.meta.url),'utf8'),JSON.stringify(result,null,2)+'\n');
});
