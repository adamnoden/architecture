import assert from 'node:assert/strict';
import { constants, cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('only owning regeneration repairs a stale lighting receipt; ordinary consumers and unrelated authored sources stay strict', { timeout: 120000 }, () => {
  const source = fileURLToPath(new URL('../../', import.meta.url));
  const temporary = mkdtempSync(join(tmpdir(), 'ovid-lighting-producer-'));
  const fixture = join(temporary, 'repository');
  const producer = 'project/ias/studies/adaptable-study-lighting.mjs';
  const receipt = 'project/ias/studies/adaptable-study-lighting.results.json';
  const accountPath = 'project/ccr/studies/source-coverage.json';
  const originalReceipt = readFileSync(join(source, receipt));
  const originalAccount = readFileSync(join(source, accountPath));
  try {
    // Actual current sources, never a historical house fixture. Reflink where
    // available; a normal independent copy is safe on other filesystems.
    cpSync(source, fixture, { recursive: true, mode: constants.COPYFILE_FICLONE,
      filter: path => !['.git', 'node_modules'].some(excluded => relative(source, path) === excluded) });
    symlinkSync(join(source, 'node_modules'), join(fixture, 'node_modules'), 'dir');
    const run = (args: string[]) => spawnSync(process.execPath, ['--import', 'tsx', ...args], {
      cwd: fixture, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
    });
    const dirty = JSON.parse(readFileSync(join(fixture, receipt), 'utf8'));
    dirty.methodSHA256[Object.keys(dirty.methodSHA256)[0]] = '0'.repeat(64);
    dirty.reference.commonDepthCornerComparison.commonAxisCoreDepthMm = -500;
    dirty.acceptance = 'FORGED DERIVED OUTPUT';
    writeFileSync(join(fixture, receipt), JSON.stringify(dirty, null, 2) + '\n');
    const rejected = run([producer, '--check']);
    assert.notEqual(rejected.status, 0);
    assert.match(rejected.stderr, /Current discipline source binding failed/);
    const before = JSON.parse(readFileSync(join(fixture, accountPath), 'utf8'));
    const written = run([producer, '--write']);
    assert.equal(written.status, 0, written.stderr);
    const fresh = JSON.parse(readFileSync(join(fixture, receipt), 'utf8'));
    assert.notEqual(fresh.acceptance, dirty.acceptance);
    assert.notEqual(fresh.reference.commonDepthCornerComparison.commonAxisCoreDepthMm, -500);
    assert.equal(fresh.reference.commonDepthCornerComparison.accessoryUse.actualRecessOpeningAndBodyGripQualified, false);
    assert.notEqual(fresh.methodSHA256[Object.keys(dirty.methodSHA256)[0]], '0'.repeat(64));
    const after = JSON.parse(readFileSync(join(fixture, accountPath), 'utf8'));
    const owned = before.families.find((family: { id: string; receipts: string[] }) => family.id === 'ias-study-lighting').receipts;
    for (const [path, blob] of Object.entries(before.gitBlobs)) {
      if (!owned.includes(path)) assert.equal(after.gitBlobs[path], blob, 'Producer changed non-owned identity: ' + path);
    }
    const checked = run([producer, '--check']);
    assert.equal(checked.status, 0, checked.stderr);
    // A changed source outside this producer cannot be hidden by its narrow
    // receipt allowance, and failure must not overwrite freshly earned output.
    const other = join(fixture, 'project/mat/studies/whole-house-service-baseline.json');
    writeFileSync(other, readFileSync(other, 'utf8') + '\n');
    const freshBytes = readFileSync(join(fixture, receipt));
    const blocked = run([producer, '--write']);
    assert.notEqual(blocked.status, 0);
    assert.match(blocked.stderr, /Lighting producer refuses non-owned stale source/);
    assert.match(blocked.stderr, /whole-house-service-baseline/);
    assert.ok(readFileSync(join(fixture, receipt)).equals(freshBytes));
  } finally {
    rmSync(temporary, { recursive: true, force: true });
    assert.ok(readFileSync(join(source, receipt)).equals(originalReceipt));
    assert.ok(readFileSync(join(source, accountPath)).equals(originalAccount));
  }
});
