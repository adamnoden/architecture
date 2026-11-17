import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { prepareCurrentDesignCompile } from '../../../compiler/reference-house/current-design/compile.js';
import { readGeorgianDesignSnapshot } from '../../../compiler/reference-house/current-design/georgian-source.js';

const [mode, ...extra] = process.argv.slice(2);
if (extra.length || (mode !== '--check' && mode !== '--write')) throw new Error('Use --check or --write');

const compiler = prepareCurrentDesignCompile(readGeorgianDesignSnapshot());
const { wallTransition, wallTransitionSvg } = await compiler.studyRoomKit({
  schema: 'ias-study-room-kit-case/1', units: 'mm', pitchMm: 300, wearingFace: 'oak',
});
assert(wallTransitionSvg, 'Expected an admitted native dry-field comparison');
const outputs = { json: JSON.stringify(wallTransition, null, 2) + '\n', svg: wallTransitionSvg };
for (const [extension, data] of Object.entries(outputs)) {
  const path = new URL('crafted-study-wall-transition.' + extension, import.meta.url);
  if (mode === '--check') assert.equal(readFileSync(path, 'utf8'), data, 'Stale ' + extension);
  else writeFileSync(path, data);
}
