import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const {guard} = JSON.parse(readFileSync(new URL('./current-house-window-receivers.json', import.meta.url)));

test('suction below the bolt-row midpoint increases tension from a point above it', () => {
  const cases = guard.existingTwoSupportReactions.filter(row => row.pointX === 1360 && row.pointSign === 1);
  const nearTop = windSign => cases.find(row => row.windSign === windSign).members.find(row => row.side === 'near').topBottom[0];
  assert.ok(nearTop(-1) > nearTop(1) + 0.8);
  assert.ok(Math.abs(nearTop(-1) - guard.maximumOneThroughboltAxialKN) < 1e-9);
  assert.equal(guard.oneJambLoss.filter(row => row.pointX === 1360 && row.side === 'near').length, 4);
});
