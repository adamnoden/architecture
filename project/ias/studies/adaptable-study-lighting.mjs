import {readEngineeringDocument} from '../../../compiler/reference-house/current-design/engineering-document.js';
import {readEngineeringEditDocument} from '../../../compiler/reference-house/current-design/engineering-edit.js';
import {stableJsonStringify} from '../../../compiler/core/identity.js';
import {readStudyStructuralGeometry} from '../../../compiler/reference-house/current-design/assemblies/study-structural-context.js';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { prepareCurrentDesignCompile } from '../../../compiler/reference-house/current-design/compile.js';
import { readGeorgianDesignSnapshot, requireGeorgianDesignBasis } from '../../../compiler/reference-house/current-design/georgian-source.js';
import { compileStudyLighting, readStudyLightingReferenceCase } from '../../../compiler/reference-house/current-design/assemblies/study-lighting.js';
import { readStudyRoomKitReferenceCase } from '../../../compiler/reference-house/current-design/assemblies/study-room-kit.js';
import { compileStudyRoomKitProjection } from '../../../compiler/reference-house/current-design/assemblies/study-room-kit-projection.js';
import { drawStudyLightingComparison, drawStudyLightingServiceCorner, drawKitchenLightingCheck, drawStudyLightingRoutes, drawStudyLightingConstruction, drawCommonDepthCornerComparison,drawStudyLightingCircuit } from '../../../compiler/reference-house/current-design/assemblies/study-lighting-views.js';
import { auditSourceCoverage } from '../../ccr/studies/source-coverage.js';
import { sha256SemanticFingerprint } from '../../../compiler/core/identity.js';

const check = process.argv.includes('--check');
const root = new URL('../../../', import.meta.url);
const accountPath = new URL('project/ccr/studies/source-coverage.json', root);
const accountBefore = readFileSync(accountPath);
const resultName = 'adaptable-study-lighting.results.json';
const figures = {
  'adaptable-study-lighting-comparison.svg': 'comparisonSvg',
  'adaptable-study-lighting-corner.svg': 'serviceCornerSvg',
  'adaptable-kitchen-lighting.svg': 'kitchenSvg',
  'adaptable-study-lighting-routes.svg': 'routesSvg',
  'adaptable-study-lighting-construction.svg': 'constructionSvg',
  'adaptable-study-lighting-common-depth.svg': 'commonDepthCornerSvg',
};
const currentNames=['working-study-lighting-circuit.svg','working-study-lighting.results.json'];
const ownedOutputs = new Set([...Object.keys(figures), resultName,...currentNames].map(name => 'project/ias/studies/' + name));
function requireProducerSourceAudit() {
  const audit = auditSourceCoverage();
  const family = audit.families.find(family => family.id === 'ias-study-lighting');
  if (!family || [...ownedOutputs].some(path => !family.receipts.includes(path))) {
    throw new Error('Lighting producer output is outside its registered receipt ownership');
  }
  const blockers = audit.findings.filter(finding => {
    const fileFinding = finding.kind === 'changed-file' || finding.kind === 'unknown-file';
    const receiptFinding = ['source-contradiction', 'source-path-contradiction', 'unknown-source-edge', 'unknown-receipt-identity'].includes(finding.kind);
    return !(fileFinding && ownedOutputs.has(finding.path) || receiptFinding && ownedOutputs.has(finding.receipt));
  });
  if (blockers.length) throw new Error('Lighting producer refuses non-owned stale source: ' + JSON.stringify(blockers));
  return audit;
}
function prepareWriteCompiler(designInput=readGeorgianDesignSnapshot()) {
  // The producer may replace only its own derived files. Authoring and every
  // other family still pass the ordinary audit; no stale receipt is an input.
  const audit = requireProducerSourceAudit();
  const design = requireGeorgianDesignBasis(designInput);
  const planDigest = sha256SemanticFingerprint(design);
  const applicability = { sourceId: design.source.id, planDigest,
    shellMm: [design.envelope.widthMm, design.envelope.depthMm], scope: 'exact accepted Georgian plan basis only' };
  const resolved = { schema: 'current-design-resolution/1', design,
    disciplineBindings: audit.bindings.map(binding => ({ ...binding, applicability })) };
  return {
    studyRoomKit: async (input,distributedFloor) => ({ source: { id: design.source.id, planDigest }, ...compileStudyRoomKitProjection(resolved, input,readStudyStructuralGeometry(resolved,distributedFloor)) }),
    studyLighting: async (input, kit) => {
      const lighting = compileStudyLighting(resolved, input, kit);
      return { lighting, comparisonSvg: drawStudyLightingComparison(lighting), serviceCornerSvg: drawStudyLightingServiceCorner(lighting),
        kitchenSvg: drawKitchenLightingCheck(lighting), routesSvg: drawStudyLightingRoutes(lighting),
        constructionSvg: drawStudyLightingConstruction(lighting), commonDepthCornerSvg: drawCommonDepthCornerComparison(lighting) };
    },
  };
}
const methods = ['compiler/reference-house/current-design/assemblies/study-structural-renewal.ts','compiler/reference-house/current-design/assemblies/study-room-kit.ts','project/ias/studies/study-structural-renewal.py','project/ias/studies/study-floor-handling.py','compiler/reference-house/current-design/assemblies/study-lighting-circuit.ts','project/had/studies/service-interface-geometry.mjs', 'compiler/reference-house/current-design/assemblies/study-lighting-common-depth.ts', 'compiler/reference-house/current-design/assemblies/study-lighting-case.ts', 'compiler/reference-house/current-design/assemblies/study-lighting-corner.ts', 'compiler/reference-house/current-design/assemblies/study-lighting.ts', 'compiler/reference-house/current-design/assemblies/study-lighting-views.ts',
  'project/ias/studies/adaptable-study-lighting.mjs'];
const methodSHA256 = Object.fromEntries(methods.map(path => [path, createHash('sha256').update(readFileSync(new URL(path, root))).digest('hex')]));
const compile = check ? prepareCurrentDesignCompile(readGeorgianDesignSnapshot()) : prepareWriteCompiler();
const kit = await compile.studyRoomKit({ ...readStudyRoomKitReferenceCase(), finishDepthMm: 15, installedServices: 'wall-hung-candidate', frameFootClearanceMm: 5 });
const defaults = readStudyLightingReferenceCase();
const baseline = await compile.studyLighting(defaults, kit);
const probes = {};
const minimumWitness = rows => rows?.length ? rows.reduce((a,b) => a.reserveMm < b.reserveMm ? a : b) : null;
function compactProbeConstruction(construction) {
  const h = construction.localHomeRunComparison;
  // The full baseline retains all check rows. Perturbations retain every issue
  // and their governing witnesses; the same recorded request recompiles full detail.
  return { ...construction, localHomeRunComparison: { ...h, probeTrace: 'Governing minimum witnesses; full detail is reproducible through the recorded shared compiler inputs.',
    obstacleChecks: [minimumWitness(h.obstacleChecks)].filter(Boolean),
    saddle: h.saddle && { ...h.saddle, bodyChecks: [minimumWitness(h.saddle.bodyChecks)], receiverChecks: [minimumWitness(h.saddle.receiverChecks)],
      toolChecks: [minimumWitness(h.saddle.toolChecks)], otherRouteChecks: [minimumWitness(h.saddle.otherRouteChecks)] },
    caseRenewal: h.caseRenewal.map(c => ({ id:c.id, completeSizeMm:c.completeSizeMm, normalDrawMm:c.normalDrawMm,
      withdrawnPlanMm:c.withdrawnPlanMm, restReservesMm:c.restReservesMm, occupying:c.occupying,
      worstSweptBody:minimumWitness(c.sweptBodyChecks), worstPipe:minimumWitness(c.pipeChecks),
      ownConnectionRelease:c.ownConnectionRelease, sourceConnectionsQualified:c.sourceConnectionsQualified,
      completeMassAndRestCapacityQualified:c.completeMassAndRestCapacityQualified })),
  } };
}
for (const [id, change] of Object.entries({ shallow: { serviceTotalDepthMm: 27 }, deeper: { serviceTotalDepthMm: 85 },
  rightHand: { lampHand: 'right' }, removedFloorLamp: { failedSourceId: 'floor-fill' }, lostArrival: { failedSourceId: 'wall-arrival' },
  automationConnected: { automationConnected: true }, darkerFinish: { finishTrial: 'darker-oak' }, missingCarrier: { localWallModule: false } })) {
  const { lighting } = await compile.studyLighting({ ...defaults, ...change }, kit);
  probes[id] = { request: lighting.request, caseDigest: lighting.caseDigest, status: lighting.status, corner: lighting.corner,
    serviceStations: lighting.serviceStations, construction: compactProbeConstruction(lighting.construction), commonDepthCornerComparison: lighting.commonDepthCornerComparison, leads: lighting.leads, controls: lighting.controls, diagnostics: lighting.diagnostics,
    unchangedRoomGeometry: JSON.stringify(lighting.commonRoom) === JSON.stringify(baseline.lighting.commonRoom),
    unchangedKitchen: JSON.stringify(lighting.kitchen) === JSON.stringify(baseline.lighting.kitchen), evidence: lighting.evidence };
}
const working=readEngineeringEditDocument(JSON.parse(readFileSync(new URL('project/ccr/studies/working-house-comparison.json',root),'utf8')));
if(!working.stages.studyRoomKit||!working.stages.distributedFloor||!working.stages.studyLighting)throw new Error('Canonical lighting requires saved room, structural floor and lighting controls');
const workingCompile=check?prepareCurrentDesignCompile(working.design):prepareWriteCompiler(working.design);
const workingKit=await workingCompile.studyRoomKit({schema:'ias-study-room-kit-case/1',units:'mm',...working.stages.studyRoomKit},working.stages.distributedFloor);
const current=await workingCompile.studyLighting({schema:'ias-study-lighting-case/1',units:'mm',...working.stages.studyLighting},workingKit);
// Family bindings include derived receipts. Never embed this receipt's own
// family digest or a document SHA containing that digest: it creates a cycle.
const controlling={design:working.design,stages:working.stages};
const outputs = [
 [currentNames[0],drawStudyLightingCircuit(current.lighting)],
 [currentNames[1],JSON.stringify({schema:'ias-working-study-lighting/1',documentPath:'project/ccr/studies/working-house-comparison.json',controllingInputsSHA256:createHash('sha256').update(stableJsonStringify(controlling)).digest('hex'),controlling,methodSHA256,lighting:current.lighting,acceptance:'Actual saved Study/corner development; no installed, material, physical or owner acceptance.'},null,2)+'\n'],
  ...Object.entries(figures).map(([name, field]) => [name, baseline[field]]),
  [resultName, JSON.stringify({ schema: 'ias-study-lighting-review/1', methodSHA256,
    reference: baseline.lighting, probes, acceptance: 'Unselected geometry and operational comparison; no photometry, product/material admission, installed capacity, physical trial or owner acceptance.' }, null, 2) + '\n'],
];
if (!check) {
  requireProducerSourceAudit();
  if (!readFileSync(accountPath).equals(accountBefore)) throw new Error('Source account changed during lighting regeneration');
}
for (const [name, content] of outputs) {
  const file = new URL(name, import.meta.url);
  if (check) { if (readFileSync(file, 'utf8') !== content) throw new Error('Stale current lighting output: ' + name); }
  else writeFileSync(file, content);
}
if (!check) {
  // Authenticate newly computed bytes, never rebind the old receipt. Authored
  // identities remain the coordinator's responsibility and are not changed.
  const account = JSON.parse(accountBefore.toString('utf8'));
  for (const path of ownedOutputs) {
    if (!Object.hasOwn(account.gitBlobs, path)) throw new Error('Unregistered lighting output: ' + path);
    const bytes = readFileSync(new URL(path, root));
    account.gitBlobs[path] = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  }
  writeFileSync(accountPath, JSON.stringify(account, null, 2) + '\n');
  const audit = auditSourceCoverage();
  if (audit.findings.length) throw new Error('New lighting evidence left a source contradiction: ' + JSON.stringify(audit.findings));
}

const observed=await readEngineeringDocument(working.design);
if(stableJsonStringify(observed.bindings)!==stableJsonStringify(working.bindings))throw new Error('Stale canonical working-house bindings; explicitly review/refresh after owning regeneration before accepting current lighting evidence');
