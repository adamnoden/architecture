import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { prepareCurrentDesignCompile } from '../../../compiler/reference-house/current-design/compile.js';
import { readGeorgianDesignSnapshot } from '../../../compiler/reference-house/current-design/georgian-source.js';
import { readStudyLightingReferenceCase } from '../../../compiler/reference-house/current-design/assemblies/study-lighting.js';
import { readStudyRoomKitReferenceCase } from '../../../compiler/reference-house/current-design/assemblies/study-room-kit.js';

const check = process.argv.includes('--check');
const root = new URL('../../../', import.meta.url);
const methods = ['compiler/reference-house/current-design/assemblies/study-lighting-corner.ts', 'compiler/reference-house/current-design/assemblies/study-lighting.ts', 'compiler/reference-house/current-design/assemblies/study-lighting-views.ts',
  'project/ias/studies/adaptable-study-lighting.mjs'];
const methodSHA256 = Object.fromEntries(methods.map(path => [path, createHash('sha256').update(readFileSync(new URL(path, root))).digest('hex')]));
const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot());
const kit = await compile.studyRoomKit({ ...readStudyRoomKitReferenceCase(), finishDepthMm: 15, installedServices: 'wall-hung-candidate', frameFootClearanceMm: 5 });
const defaults = readStudyLightingReferenceCase();
const baseline = await compile.studyLighting(defaults, kit);
const probes = {};
for (const [id, change] of Object.entries({ shallow: { serviceTotalDepthMm: 27 }, deeper: { serviceTotalDepthMm: 85 },
  rightHand: { lampHand: 'right' }, removedFloorLamp: { failedSourceId: 'floor-fill' }, lostArrival: { failedSourceId: 'wall-arrival' },
  automationConnected: { automationConnected: true }, darkerFinish: { finishTrial: 'darker-oak' }, missingCarrier: { localWallModule: false } })) {
  const { lighting } = await compile.studyLighting({ ...defaults, ...change }, kit);
  probes[id] = { request: lighting.request, caseDigest: lighting.caseDigest, status: lighting.status, corner: lighting.corner,
    serviceStations: lighting.serviceStations, construction: lighting.construction, leads: lighting.leads, controls: lighting.controls, diagnostics: lighting.diagnostics,
    unchangedRoomGeometry: JSON.stringify(lighting.commonRoom) === JSON.stringify(baseline.lighting.commonRoom),
    unchangedKitchen: JSON.stringify(lighting.kitchen) === JSON.stringify(baseline.lighting.kitchen), evidence: lighting.evidence };
}
const outputs = [
  ['adaptable-study-lighting-comparison.svg', baseline.comparisonSvg],
  ['adaptable-study-lighting-corner.svg', baseline.serviceCornerSvg],
  ['adaptable-kitchen-lighting.svg', baseline.kitchenSvg],
  ['adaptable-study-lighting-routes.svg', baseline.routesSvg],
  ['adaptable-study-lighting-construction.svg', baseline.constructionSvg],
  ['adaptable-study-lighting.results.json', JSON.stringify({ schema: 'ias-study-lighting-review/1', methodSHA256,
    reference: baseline.lighting, probes, acceptance: 'Unselected geometry and operational comparison; no photometry, product/material admission, installed capacity, physical trial or owner acceptance.' }, null, 2) + '\n'],
];
for (const [name, content] of outputs) {
  const file = new URL(name, import.meta.url);
  if (check) { if (readFileSync(file, 'utf8') !== content) throw new Error('Stale current lighting output: ' + name); }
  else writeFileSync(file, content);
}
