import { readFileSync, writeFileSync } from 'node:fs';
import { drawStudyOrdinaryHandling } from '../../../compiler/reference-house/current-design/assemblies/study-room-kit.js';
import { prepareCurrentDesignCompile } from '../../../compiler/reference-house/current-design/compile.js';
import { readGeorgianDesignSnapshot } from '../../../compiler/reference-house/current-design/georgian-source.js';
import { renderDrawingSceneV2Svg } from '../../../compiler/publication-drawing-v2/svg.js';

const check = process.argv.includes('--check');
const current = prepareCurrentDesignCompile(readGeorgianDesignSnapshot());
const handlingPlan = JSON.parse(readFileSync(new URL('crafted-study-handling-plan.json', import.meta.url), 'utf8'));
const request = { schema: 'ias-study-room-kit-case/1', units: 'mm', pitchMm: 300, wearingFace: 'oak',
  finishDepthMm: 15, firstRestBoardSizeMm: [300, 300], installedServices: 'wall-hung-candidate' };
const unnotched = await current.studyRoomKit(request);
const joinedRequest = { ...request, frameFootClearanceMm: 5, ordinaryHandling: handlingPlan };
const timber = await current.studyRoomKit(joinedRequest);
const tile = await current.studyRoomKit({ ...joinedRequest, wearingFace: 'stone-steel', wallFace: 'porcelain-steel' });
const widerBorders = await current.studyRoomKit({ ...request, floorBorderMinimumMm: 150 });
const standing = await current.studyRoomKit({ ...request, floorWorkerTopMm: 2000 });
const kneeling = await current.studyRoomKit({ ...request, floorPosture: 'kneeling-candidate' });
const catalogue = result => result.kit.floor.firstRestBoardTrial.boardCatalogue;
const summary = result => ({
  request: result.kit.request, source: result.kit.source, caseDigest: result.kit.caseDigest,
  floorParts: result.kit.floor.parts.length, ordinaryHandlingWitnesses: result.kit.floor.ordinaryHandling?.witnessCount ?? null, directRestWitnesses: result.kit.floor.furnitureMotion.firstRest.witnessCount,
  boardPlacements: catalogue(result).localWallTrimReleased.placementCount,
  closedApproachCuts: result.kit.floor.firstRestBoardTrial.closedApproachCuts,
  groundSupport: result.kit.floor.groundSupport,
  maximumFloorFaceKg: Math.max(...result.kit.floor.parts.map(piece => piece.wearFaceKg)),
});
const outputs = [
  ['crafted-study-whole-timber.svg', timber.roomAssemblySvg],
  ['crafted-study-whole-tile.svg', tile.roomAssemblySvg],
  ['crafted-study-coordinated-floor.svg', renderDrawingSceneV2Svg(timber.plan)],
  ...[['east', '4100/500'], ['north', '429.5/2900'], ['corner', '429.5/429.5']].map(([name, id]) => [
    'crafted-study-handling-' + name + '.svg', renderDrawingSceneV2Svg(drawStudyOrdinaryHandling(timber.kit, 'GROUND/G-STUDY/room-kit/floor/' + id)),
  ]),
  ['crafted-study-convergence.json', JSON.stringify({
    schema: 'ias-crafted-study-convergence/1', state: 'candidate-with-144-joined-geometric-floor-witnesses',
    preferredDevelopmentDirection: 'Use the 300 mm floor candidate, source-frame notches, a wall-hung inlet carrier and independent local wall release for owner concept review. Do not adopt the broader border rule or the heavy complete tiled wall as the dry Study default.',
    comparisons: { unnotched: summary(unnotched), timber: summary(timber), tile: summary(tile), widerBorders: summary(widerBorders), standing: summary(standing), kneeling: summary(kneeling) },
    floor: { parts: timber.kit.floor.parts, ordinaryHandling: timber.kit.floor.ordinaryHandling, installedInlet: timber.kit.floor.installedInlet,
      firstRest: timber.kit.floor.furnitureMotion.firstRest.parts.map(({ partId, state, witness, encounteredPlanProjectionIds }) => ({ partId, state, witness, encounteredPlanProjectionIds })),
      boardCatalogue: { boards: catalogue(timber).boards, padWidthMm: catalogue(timber).padWidthMm, padPatternSizeMm: catalogue(timber).padPatternSizeMm,
        placements: catalogue(timber).localWallTrimReleased.placements.map(({ partId, restPartId, boardId, boardXYXYMm, padCentresXYMm, stage, shiftXYMm, trimReleases }) => ({ partId, restPartId, boardId, boardXYXYMm, padCentresXYMm, stage, shiftXYMm, trimReleases })),
        outsidePartIds: catalogue(timber).localWallTrimReleased.outsidePartIds },
      materialFaceMassKg: { timber: Object.fromEntries(timber.kit.floor.parts.map(piece => [piece.id, piece.wearFaceKg])),
        tile: Object.fromEntries(tile.kit.floor.parts.map(piece => [piece.id, piece.wearFaceKg])) } },
    walls: { timber: timber.roomAssembly, tile: tile.roomAssembly },
    ownerAestheticApproval: false, physicalAcceptance: false,
  }, null, 2) + '\n'],
];
for (const [name, content] of outputs) {
  const path = new URL(name, import.meta.url);
  if (check) {
    if (readFileSync(path, 'utf8') !== content) throw new Error('Stale joined Study output: ' + name);
  } else writeFileSync(path, content);
}
