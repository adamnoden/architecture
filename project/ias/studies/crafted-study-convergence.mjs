import { readFileSync, writeFileSync } from 'node:fs';
import { prepareCurrentDesignCompile } from '../../../compiler/reference-house/current-design/compile.js';
import { readGeorgianDesignSnapshot } from '../../../compiler/reference-house/current-design/georgian-source.js';
import { renderDrawingSceneV2Svg } from '../../../compiler/publication-drawing-v2/svg.js';

const check = process.argv.includes('--check');
const current = prepareCurrentDesignCompile(readGeorgianDesignSnapshot());
const request = { schema: 'ias-study-room-kit-case/1', units: 'mm', pitchMm: 300, wearingFace: 'oak',
  finishDepthMm: 15, firstRestBoardSizeMm: [300, 300], installedServices: 'wall-hung-candidate' };
const timber = await current.studyRoomKit(request);
const tile = await current.studyRoomKit({ ...request, wearingFace: 'stone-steel', wallFace: 'porcelain-steel' });
const widerBorders = await current.studyRoomKit({ ...request, floorBorderMinimumMm: 150 });
const standing = await current.studyRoomKit({ ...request, floorWorkerTopMm: 2000 });
const kneeling = await current.studyRoomKit({ ...request, floorPosture: 'kneeling-candidate' });
const catalogue = result => result.kit.floor.firstRestBoardTrial.boardCatalogue;
const summary = result => ({
  request: result.kit.request, source: result.kit.source, caseDigest: result.kit.caseDigest,
  floorParts: result.kit.floor.parts.length, directRestWitnesses: result.kit.floor.furnitureMotion.firstRest.witnessCount,
  boardPlacements: catalogue(result).localWallTrimReleased.placementCount,
  closedApproachCuts: result.kit.floor.firstRestBoardTrial.closedApproachCuts,
  groundSupport: result.kit.floor.groundSupport,
  maximumFloorFaceKg: Math.max(...result.kit.floor.parts.map(piece => piece.wearFaceKg)),
});
const outputs = [
  ['crafted-study-whole-timber.svg', timber.roomAssemblySvg],
  ['crafted-study-whole-tile.svg', tile.roomAssemblySvg],
  ['crafted-study-coordinated-floor.svg', renderDrawingSceneV2Svg(timber.plan)],
  ['crafted-study-convergence.json', JSON.stringify({
    schema: 'ias-crafted-study-convergence/1', state: 'candidate-with-unresolved-whole-room-handling',
    preferredDevelopmentDirection: 'Retain 300 mm floor set-out; develop a wall-hung inlet carrier and independent local wall release. Do not adopt the broader border rule or the heavy complete tiled wall as the dry Study default.',
    comparisons: { timber: summary(timber), tile: summary(tile), widerBorders: summary(widerBorders), standing: summary(standing), kneeling: summary(kneeling) },
    floor: { parts: timber.kit.floor.parts, installedInlet: timber.kit.floor.installedInlet,
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
