import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {deriveProtectedDaylight} from './inlet-protected-daylight.mjs';

test('protected daylight accounts for the liner, bottom blockage shape, tailwater and closed cover',()=>{
  const result=deriveProtectedDaylight();
  const {aperture,hydraulic,receiving,closedCover}=result;
  assert.deepEqual(aperture.coordinates,[3080,3300,290,400]);
  assert.equal(aperture.insideClearWidthMM,216);
  assert.equal(aperture.pipeSeparationAfterLinerAndSettingsMM,26.6);
  assert.equal(aperture.terminalReceivingMax,220.11);
  assert(hydraulic.originalDamOpenAreaPercent>70&&hydraulic.originalFullWidthDamReserveMM<0);
  assert.equal(hydraulic.adverse60Lmin.reserveMM,8.99323);
  assert.equal(hydraulic.preSiteRequiredVerifiedSourceMaximumLmin,60);
  assert.equal(hydraulic.verifiedProviderFlowLmin,null);
  assert.equal(hydraulic.blockageCases.allOutletsBlocked.accepted,false);
  assert(hydraulic.blockageCases.commonFloodAtZ230.receiverLimitsExceeded.every(Boolean));
  assert(hydraulic.cases.find(row=>row.flowLmin===90&&row.cd===.5&&row.bottomClearWidthMM===108&&row.raisedLipMM===32).reserveMM<0);
  assert(hydraulic.channel.normalDepthMM<25&&hydraulic.channel.criticalDepthMM<25);
  assert.deepEqual(receiving.cellSeparationsAfterSettingsMM,[25,25]);
  assert(receiving.cells.every(cell=>cell.freeDropAtMaximumWaterMM>=25&&cell.surchargeReserveMM>0));
  assert(receiving.cells.every(cell=>cell.outsideReceiverAdmitted===false));
  assert.equal(closedCover.roofJackets[0].eastCurbReserveAfterSettingsMM,5.5);
  assert(closedCover.pressureCases.at(-1).oldPlate.stripStressMPa>200/1.1);
  assert(closedCover.pressureCases.at(-1).preferredPlate.stripStressMPa<200/1.1);
  assert.equal(readFileSync(new URL('./inlet-protected-daylight.json',import.meta.url),'utf8'),JSON.stringify(result,null,2)+'\n');
});
