import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
const study = name => JSON.parse(readFileSync(new URL(`./current-house-${name}.json`,import.meta.url)));
test('the actual closed foot loop rejects gross concrete dimensions',()=>{
  const k=study('outward-arch-kernel');
  assert.equal(k.footCell.cellNormal,74);
  assert.equal(k.footAdverseCell.cellNormal,54);
  assert.ok(k.oneKNmFootFlowNPerMM>2*k.rejectedGrossBoxFlowNPerMM);
  for(const row of k.kernel){
    assert.ok(row.strongLimitError<1e-5 && row.weakLimitError<1e-5);
    assert.ok(row.maximumSixComponentEquilibriumResidual<1e-5);
    assert.notEqual(row.actualCGGravity[3],0);
  }
});
test('widening alone is rejected after torsion is charged to the bending steel',()=>{
  const result=study('outward-arches');
  for(const control of result.controls){
    assert.equal(control.coupled.length,4);
    assert.equal(control.geometry.insideConcreteFace,140);
    assert.ok(Math.max(...control.coupled.map(row=>row.maximumSameStateActions.adverseRatio[0]))>1);
    assert.ok(Math.max(...control.coupled.map(row=>row.maximumSameStateActions.adverseLongitudinalRatio[0]))>.08);
    for(const row of control.coupled){
      assert.equal(row.memberWindowRecoveries,96*2*8*2*2*8);
      assert.ok(Object.values(row.governingStates).every(v=>[-1,1].includes(v[4]) && [-1,1].includes(v[5])));
      for (const bound of ['nominal', 'adverse']) {
        for (const [kind, ratio] of row.maximumSameStateActions[bound+'Ratio'].entries()) {
          const witness = row.governingStates[bound+'Ratio/'+kind];
          const [strong, weak, strongResistance, weakResistance] = witness.slice(8, 12);
          const end = witness.at(-1);
          assert.ok(end === 0 || end === 1);
          assert.ok(Math.abs(strong/strongResistance + weak/weakResistance - ratio) < 1e-10);
        }
      }
    }
  }
  assert.equal(result.admitted,false);
});

test('the fixed foot excludes uniform bar upsizing at both arch widths', () => {
  const script = fileURLToPath(new URL('./outward-arch-bar-limit.py', import.meta.url));
  const result = JSON.parse(execFileSync('python3', [script], {encoding: 'utf8'}));
  assert.equal(result.largestDiameterMm, 16.5);
  assert.equal(result.h20ClearMm, 18);
  assert.ok(result.h20FullYieldLengthMm - result.availableTailMm > 135);
  assert.deepEqual(result.bounds.map(row => row.widthMm), [160, 180]);
  for (const row of result.bounds) {
    assert.ok(row.interactionLowerBound > 1);
  }
});

test('only the two near-pier stations require the central bar in the 180 mm model', () => {
  const control = study('outward-arches').controls.find(c => c.geometry.normalWidthNominal === 180);
  const detail = study('central-arch-detail');
  const {cutStation, lastCreditedStation, stationCount} = detail;
  assert.ok(lastCreditedStation < cutStation && cutStation < stationCount - 1);
  const governing = Array(stationCount).fill(0);
  for (const row of control.coupled) {
    const p = row.centralH25Arch;
    assert.equal(p.freeTipStation, cutStation);
    assert.equal(p.lastCreditedStation, lastCreditedStation);
    assert.equal(p.adverseFourBarProfile.length, stationCount);
    assert.equal(p.adverseWithSupplementProfile.length, stationCount);
    assert.equal(Math.max(...p.adverseFourBarProfile), row.maximumSameStateActions.adverseRatio[0]);
    assert.equal(Math.max(...p.adverseWithSupplementProfile), p.governingEnds.adverse.ratio);
    assert.ok(p.governingEnds.adverse.ratio < 1);
    assert.deepEqual(p.adverseWithSupplementProfile.slice(lastCreditedStation + 1),
                     p.adverseFourBarProfile.slice(lastCreditedStation + 1));
    p.adverseFourBarProfile.forEach((ratio, i) => governing[i] = Math.max(governing[i], ratio));
  }
  assert.deepEqual(governing.flatMap((ratio, i) => ratio > 1 ? [i] : []), [0, 1]);
  const worst = Math.max(...control.coupled.map(r => r.centralH25Arch.nominalDatumSensitivity.radialOnly));
  const both = Math.max(...control.coupled.map(r => r.centralH25Arch.nominalDatumSensitivity.bothAxes));
  assert.ok(worst > 1 && both > worst);
  assert.ok(detail.baselineNominalSignedGapMm < 0 && detail.trialH20PlateauGapMm > 0);
  assert.ok(detail.nearBondLengthReserveMm > 0 && detail.nearBondLengthReserveMm < 5);
  assert.ok(detail.curveBondLengthReserveMm > 215);
  assert.ok(detail.nearH12At600GapMm > 0 && detail.nearH12At600GapMm < 5);
  assert.ok(detail.pierRevised.ratio < 1 && detail.historicalActionCount === 3072);
  assert.equal(detail.admitted, false);
});

test('the fully developed vertical H25 has a nominal pocket but no tolerance-safe lane', () => {
  const route = study('central-arch-detail').verticalReturn;
  const sleeves = study('window-receivers').guard.proposedContact.centreGlobalZ;
  for (const z of sleeves) {
    assert.ok(route.maximumTipZ < z && z < route.minimumVerticalStartZ);
  }
  assert.ok(route.h20RightLimitNominalMm > route.h16LeftLimitNominalMm);
  const [left, right] = route.nominalPocketX;
  const [adverseLeft, adverseRight] = route.requiredPocketXAtTolerance;
  assert.ok(left < route.witness.verticalX && route.witness.verticalX < right);
  assert.ok(adverseLeft > adverseRight);
  assert.ok(route.perItemXToleranceCeilingMm > 1.41 && route.perItemXToleranceCeilingMm < 1.42);
  assert.ok(route.witness.h16ClearNominalMm > route.parallelPlacingMm);
  assert.ok(route.witness.h16ClearAtAdverseXMm < route.parallelPlacingMm);
  assert.ok(route.witness.sleeveClearNominalMm > 0 && route.witness.sleeveClearAtAdverseXMm < 0);
});

test('one permitted setout intercepts the PSB 25 head everywhere before its shank crosses the H20', () => {
  const h = study('central-arch-detail').psbSingle25;
  const [first16, last16] = h.h16CollisionStationsMm;
  const [first20, last20] = h.h20CollisionStationsMm;
  assert.equal(h.firstPermittedStationMm, 50);
  assert.ok(first16 < h.firstPermittedStationMm);
  assert.ok(first20 < last16 && last16 < h.firstH20CrossingMm);
  assert.ok(last20 > h.lastStationIncludingHeadThicknessMm);
  assert.equal(h.lastStationIncludingHeadThicknessMm - h.firstH20CrossingMm, h.headThicknessMm);
});

test('moving the pier end bars retains both barrier fixings and separates only the straight leg', () => {
  const d = study('central-arch-detail');
  const c = d.inPlaneCage;
  assert.ok(c.verticalLaneIntervalX[0] < c.legX && c.legX < c.verticalLaneIntervalX[1]);
  assert.ok(Math.min(c.clearToH16LegMm, c.clearToH20LegMm) >= d.verticalReturn.parallelPlacingMm);
  assert.ok(c.minGuardSleeveGapMm > 0 && c.cranks.every(k => k.pinGapLowerBoundMm > 0));
  assert.ok(d.nearTailMinMm > d.requiredBondLengthMm);
  assert.ok(c.lowestTipZ > c.crankZ[1] && c.tipToCranksMm > 70);
  assert.ok(c.bendToH16At20DegOnSteelErrorCardMm < d.verticalReturn.parallelPlacingMm);
  assert.ok(c.bothThroatsOnOneSteelErrorCardMm.every(gap => gap > 0 && gap < 16));
  assert.ok(c.pier.ratio > d.pierOriginal.ratio && c.pier.ratio < 1);
  const [[x, , z], [, y, zz]] = c.pairedArmBendForcesLocalXYZkN;
  assert.equal(x, y);
  assert.equal(z, zz);
  assert.ok(Math.abs(Math.hypot(x, z + c.tailBondUpwardKNPerArm) - d.requiredBarForceKN) < 1e-9);
});

test('a transverse H10 can enclose the bend only by spending wall width on its straight legs', () => {
  const t = study('central-arch-detail').bendTie;
  assert.ok(t.existingLinkLevelsMm[0] < t.trialZmm && t.trialZmm < t.existingLinkLevelsMm[1]);
  assert.ok(t.twoH8AtPierCapKN < t.horizontalForceKN && 2*t.oneH10AtPierCapKN > t.horizontalForceKN);
  assert.ok(t.shortestLegLengthMm > t.heavyLegAt55PercentLengthMm);
  assert.ok(375 - 10 < t.straightBondLengthMm);
  assert.ok(t.enclosingLegMinimumYmm > t.middleMaximumYmm && t.unchangedRoomFaceCoverAfterFullLossMm < 0);
  assert.ok(t.trialFacesYmm[1] > t.minimumRoomFaceYForMatchedCoverMm);
  assert.equal(t.remainingGlassMm, 42);
  assert.ok(t.straightH20GapLowerMm > 0 && t.noseToH16GapLowerMm > 0 && t.noseToH25GapLowerMm > 0);
  assert.ok(t.noseToH16OnSteelOnlyCardUpperMm < 16);
});

test('normal contact on the perpendicular face cannot reproduce the continuous spring witness', () => {
  const b = study('central-arch-detail').perpendicularBearing;
  assert.deepEqual([b.case.element, b.case.end], [0, 0]);
  assert.ok(b.compressionKN > 0);
  for (const [i, size] of b.radialAndNormalFaceMm.entries()) {
    assert.equal(b.strongAndWeakEdgeBoundKNm[i], b.compressionKN * size / 2000);
    assert.ok(b.requiredRadialAndNormalEccentricityMm[i] > size / 2);
    assert.ok(b.strongAndWeakDemandKNm[i] > b.strongAndWeakEdgeBoundKNm[i]);
  }
});

test('the released spring reduces bending but a single signed case rules out a compression-only seat', () => {
  const trial = study('arch-bearing');
  const width = trial.controls[0].geometry.normalWidthNominal / 1000;
  const fixed = study('outward-arches').controls.find(c => c.geometry.normalWidthNominal === width*1000);
  const pairNormals = [8/17, 15/17]; // Actual 1000 mm span, 300 mm rise, at the spring.
  for (const [index, row] of trial.controls[0].coupled.entries()) {
    assert.equal(row.memberWindowRecoveries, fixed.coupled[index].memberWindowRecoveries);
    assert.ok(row.maximumSameStateActions.adverseRatio[0] < 1 && fixed.coupled[index].maximumSameStateActions.adverseRatio[0] > row.maximumSameStateActions.adverseRatio[0]);
    const witness = row.nearBearing.edge;
    assert.notEqual(witness.window, witness.otherWindow);
    const {forceXYZkN:[fx, ,fz], centroidMomentsXYZkNm:[mx,my,mz], normalCompressionKN, edgeEquivalentKN} = witness.seat;
    const [cosine,sine] = pairNormals;
    assert.equal(my, 0);
    assert.ok(Math.abs(normalCompressionKN - (cosine*fx+sine*fz)) < 1e-9);
    const leftX = fx/2-mz/width, leftZ = fz/2+mx/width;
    assert.ok(leftX < 0 && leftZ < 0);
    assert.ok(Math.abs(leftX*cosine + leftZ*sine - edgeEquivalentKN[0]) < 1e-9);
    assert.ok(Math.abs(edgeEquivalentKN[0]+edgeEquivalentKN[1]-normalCompressionKN) < 1e-9);
  }
  // Both windows meet the north-east pier on this particular signed case.
  const worst = trial.controls[0].coupled.map(row => row.nearBearing.edge)
    .reduce((a, b) => a.minimumKN < b.minimumKN ? a : b);
  assert.deepEqual([worst.wind, worst.pressureSign, worst.pointSign, worst.pointX], [31, -1, -1, 2240]);
  assert.deepEqual([worst.loadedWindow, worst.window, worst.otherWindow], [7, 7, 3]);
  for (const seat of [worst.seat, worst.otherSeat]) {
    assert.ok(seat.normalCompressionKN > 0 && seat.edgeEquivalentKN[0] < 0);
    assert.ok(Math.abs(seat.edgeEquivalentKN[0] + seat.edgeEquivalentKN[1] - seat.normalCompressionKN) < 1e-9);
  }
  assert.ok(trial.controls[0].coupled.some(row => row.nearBearing.compression.minimumKN < 0));
  assert.equal(trial.admitted, false);
});

test('deepening the near spring does not rescue the retained four bars on the archived adverse state', () => {
  const path = fileURLToPath(new URL('./corner-arch-haunch.py', import.meta.url));
  execFileSync('python3', ['-B', path, '--check']);
  const { geometry, loadComparison, admitted } = JSON.parse(readFileSync(new URL('./corner-arch-haunch.json', import.meta.url)));
  const [baseline, ...haunched] = loadComparison.cases;
  assert.equal(admitted, false);
  assert.deepEqual(haunched.map(row => row.archElements), [18, 36, 72]);
  assert.ok(Math.abs(baseline.retained.binnedInteraction - 1.18870696945) < 1e-8);
  for (const row of haunched) {
    assert.deepEqual(row.retained.adverseRadialBarAxesMm, baseline.retained.adverseRadialBarAxesMm);
    assert.deepEqual(row.retained.torsionCellMm, baseline.retained.torsionCellMm);
    assert.ok(row.signedEnd.minusNormalKNm > baseline.signedEnd.minusNormalKNm);
    assert.ok(row.retained.withoutPercentRoundingInteraction > 1.29);
    assert.ok(row.relaid.torsionCellMm[0] > row.retained.torsionCellMm[0]);
    assert.ok(row.window1.relaid.binnedInteraction > 1 && row.window1.relaid.binnedInteraction < 1.02);
  }
  const v = geometry.perWindow_m3;
  assert.ok(Math.abs(v.union + v.outsideTheseDomains - geometry.grossWedgePerWindow_m3) < 1e-12);
  assert.ok(geometry.fractionWithinPier > 0.82 && geometry.fractionWithinPier < 0.83);
});

test('the short spring pin hits the end link before releasing an eye, with reversed reactions on both arms', () => {
  const script = fileURLToPath(new URL('./corner-pivot-pin.py', import.meta.url));
  const result = JSON.parse(execFileSync('python3', [script], {encoding: 'utf8'}));
  assert.deepEqual(result.endLinkY, [-2, 102]);
  assert.equal(result.firstLinkContactOnAxialDrawMm, 13);
  assert.equal(result.firstEyeReleaseMm, 14);
  assert.ok(result.pinAxisToClearOpeningXmm > 125 && result.pinAxisToClearOpeningXmm < 126);
  assert.ok(result.gapAfter15MmRelativeSetout < 0);
  assert.ok(result.firstLinkTangentGapAfterTwoFiveMm > 1.8 && result.firstLinkTangentGapAfterTwoFiveMm < 2);
  for (const arm of ['east', 'north']) {
    const reverse = arm === 'east' ? result.reverseEast : result.reverseNorth;
    assert.ok(result[arm].centre.normalKN[1] < 0 && reverse.normalKN[0] < 0);
    assert.ok(result[arm].centre.resultantsKN.every(force => force > 50));
  }
  assert.ok(result.east.maxWithinEachStripKN[0] > 71 && result.east.maxWithinEachStripKN[0] < 72);
  const svg = readFileSync(new URL('./corner-pivot-pin.svg', import.meta.url), 'utf8');
  assert.equal(execFileSync('python3', [script, '--svg'], {encoding: 'utf8'}), svg);
  assert.equal(result.admitted, false);
});

test('a moment-free support and an unsupported arch end have different movements', () => {
  const script = fileURLToPath(new URL('./corner-arch-end.py', import.meta.url));
  execFileSync('python3', ['-B', script, '--check']);
  const {cards, occupation, admitted} = JSON.parse(readFileSync(new URL('./corner-arch-end.json', import.meta.url)));
  const east = cards.pin36[7], north = cards.separated36[3];
  assert.deepEqual(east.near.M, [0, 0, 0]);
  assert.ok(east.near.frictionRatioIfUnrestrained > 6);
  assert.ok(east.faceNormalCornerRangeMM[1] > 1.85 && east.faceNormalCornerRangeMM[1] < 1.87);
  assert.ok(cards.separated18[7].nearGapXYZmm[1] < -124 && cards.separated36[7].nearGapXYZmm[1] < -124);
  assert.ok(north.faceNormalCornerRangeMM[1] < -15);
  assert.ok(occupation.pin.nominalCabinetPlanOverlap > 6 && occupation.pin.nominalCabinetPlanOverlap < 7);
  assert.equal(admitted, false);
});
