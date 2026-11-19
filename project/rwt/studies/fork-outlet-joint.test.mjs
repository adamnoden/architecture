import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {jointFigure,jointStudy,stubFit} from './fork-outlet-joint.mjs';

const joint=jointStudy();
const geometry=JSON.parse(fs.readFileSync(new URL('./upper-first-release.json',import.meta.url))).geometry;
test('the complete bare stub fits the original rigid swept prism; trimming does not buy east clearance',()=>{
  const original=joint.originalHalfWidthFit;
  assert(Math.abs(original.margins[0][1]-9.06996)<.0001);
  assert(Math.abs(original.margins[2][0]-17.58944)<.001);
  assert(joint.leastPrismMarginAfterAllowance>4 && joint.trialFit.margins[0][1]<10);
  assert.deepEqual(joint.trialFit.margins[1],[15.5,15.5]);
  assert(joint.trialFit.maximumLengthAtLowerFace>71 && stubFit(geometry,joint.port,72).margins[2][0]<0);
});
test('the casing seats on two plain ends and clears the splitter territory, not necessarily the fitting or operator',()=>{
  assert.equal(joint.plainLandCoveredEach,52.5); assert.equal(joint.socketToCasingRoom,7.5);
  assert.equal(joint.casingTop,121.5); assert.equal(joint.minimumPocketToSplitterY,36);
  assert(joint.pocketSideReserveOverHandle>24 && joint.pocketHeightReserveOverHandle===34.5);
  assert(joint.addedWetTorqueBoundNm>6.2 && joint.addedWetTorqueBoundNm<6.21);
  assert.equal(joint.actualOpenAndToolSweep,null); assert.equal(joint.materialExceptionApproved,false);
});
test('the horizontal cartridge earns no static fall; the old gradient reverses the reserve at backup duty',()=>{
  const backup=joint.grades[1];
  assert.equal(backup.flowLps,4.43895);assert(backup.oldGradeMarginMm-joint.levelError<0);
  assert(backup.afterLevelErrorMm>8.1 && backup.limitingCombinedKAfterLevelError<2.72);
  assert(joint.doglegClear>169 && joint.rimClear>187 && joint.parkedBasinClear===90);
  assert.equal(joint.actualLoss,null);assert.equal(joint.supportsQualified,false);
});
test('joint drawing and recorded dimensions reproduce',()=>{
  assert.deepEqual(JSON.parse(fs.readFileSync(new URL('./fork-outlet-joint.json',import.meta.url))),joint);
  assert.equal(fs.readFileSync(new URL('./fork-outlet-joint.svg',import.meta.url),'utf8'),jointFigure(joint));
});
