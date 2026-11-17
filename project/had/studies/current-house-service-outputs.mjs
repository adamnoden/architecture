import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { deriveCurrentHouse, scheduleText } from './current-house.mjs';
import { servicePlate, storePlate } from './occupied-service-plate.mjs';
import { selectedServicePlate } from './selected-service-plate.mjs';

const root = new URL('../../../', import.meta.url);
const coveragePath = 'project/ccr/studies/source-coverage.json';
export const occupiedServiceCompositorPath = 'project/had/studies/current-house.mjs';
const rendererPaths = [
  'project/had/studies/occupied-service-plate.mjs',
  'project/had/studies/selected-service-plate.mjs',
];
const file = path => new URL(path, root);
const gitBlob = bytes => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');

function requireIdentity(path, identities) {
  const expected = identities[path];
  if (!expected || gitBlob(readFileSync(file(path))) !== expected) {
    throw new Error(`The occupied-service method is unbound or stale at ${path}`);
  }
  return { path, gitBlob: expected };
}

export function deriveBoundOccupiedServiceHouse(binding) {
  requireIdentity(occupiedServiceCompositorPath, binding.identities);
  const house = deriveCurrentHouse();
  const actual = Object.entries(house.inputs);
  const expected = binding.inputReceiptIdentities;
  if (actual.length !== Object.keys(expected).length || actual.some(([path, blob]) => expected[path] !== blob)) {
    throw new Error('The occupied-service compositor used inputs outside the resolved HAD source binding');
  }
  return house;
}

export function drawBoundOccupiedServiceHouse(house, binding) {
  const renderers = rendererPaths.map(path => requireIdentity(path, binding.identities));
  return {
    renderers,
    drawings: {
      'current-house-services.svg': servicePlate(house),
      'store-exchange.svg': storePlate(house),
      'selected-service-interfaces.svg': selectedServicePlate(house),
    },
  };
}

export function readNativeOccupiedServiceBinding() {
  const { families, gitBlobs } = JSON.parse(readFileSync(file(coveragePath), 'utf8'));
  const family = families.find(item => item.id === 'had-occupied-services' && item.state === 'selected-reference');
  if (!family || !family.inputReceipts.length || !family.authorRoots.includes(occupiedServiceCompositorPath)) {
    throw new Error('Missing the selected HAD occupied-service source account');
  }
  const identities = Object.fromEntries(family.authorRoots.map(path => [path, requireIdentity(path, gitBlobs).gitBlob]));
  const inputReceiptIdentities = Object.fromEntries(family.inputReceipts.map(path => [path, gitBlobs[path]]));
  return { identities, inputReceiptIdentities };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [mode, ...extra] = process.argv.slice(2);
  if (extra.length || (mode !== '--check' && mode !== '--write')) throw new Error('Use --check or --write for the occupied-service outputs');
  const binding = readNativeOccupiedServiceBinding();
  const house = deriveBoundOccupiedServiceHouse(binding);
  const { drawings } = drawBoundOccupiedServiceHouse(house, binding);
  const outputs = { 'current-house-services.json': scheduleText(house), ...drawings };
  for (const [name, bytes] of Object.entries(outputs)) {
    const path = new URL(name, import.meta.url);
    if (mode === '--check' && readFileSync(path, 'utf8') !== bytes) throw new Error(`Stale occupied-service output ${name}`);
    if (mode === '--write') writeFileSync(path, bytes);
  }
}
