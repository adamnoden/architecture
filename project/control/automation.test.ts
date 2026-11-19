import assert from 'node:assert/strict'
import {execFileSync, spawnSync} from 'node:child_process'
import {mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {dirname, join, resolve} from 'node:path'
import {createRequire} from 'node:module'
import test from 'node:test'

const launcher = resolve('scripts/fresh-operations-report.mjs')
const freshnessError = 'Briefing requires clean canonical main sources; only generated projection advances are tolerated'
const git = (cwd: string, ...args: string[]) => execFileSync('git', args, {cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim()

// Real local Git histories and separate Node processes reproduce the race.
// Only npm is a recording stub: these tests must not reinstall the shared tree.
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'swe-report-'))
  const upstream = join(root, 'upstream'), checkout = join(root, 'checkout'), state = join(root, 'state'), bin = join(root, 'bin')
  for (const path of [upstream, state, bin]) mkdirSync(path)
  git(upstream, 'init', '--initial-branch=main')
  git(upstream, 'config', 'user.name', 'Fixture')
  git(upstream, 'config', 'user.email', 'fixture@example.invalid')
  const write = (path: string, body: string) => {mkdirSync(dirname(join(upstream, path)), {recursive: true}); writeFileSync(join(upstream, path), body)}
  write('.gitignore', 'node_modules\n')
  write('.nvmrc', '24\n')
  write('package.json', '{"name":"report-fixture","version":"1.0.0","type":"module"}\n')
  write('package-lock.json', '{"name":"report-fixture","lockfileVersion":3,"packages":{}}\n')
  write('source.ts', 'export const value = "initial"\n')
  write('scripts/control-operations.ts', `import {value} from '../source.js'
import {appendFileSync, existsSync, readFileSync, writeFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {join} from 'node:path'
const state = process.env.FIXTURE_STATE
const upstream = process.env.FIXTURE_UPSTREAM
const log = join(state, 'attempts')
const attempt = existsSync(log) ? readFileSync(log, 'utf8').trim().split('\\n').length + 1 : 1
appendFileSync(log, value + '\\n')
const git = (...args) => execFileSync('git', args, {cwd: upstream, stdio: 'pipe'})
if (attempt <= Number(process.env.MOVE_COUNT ?? 0)) {
  writeFileSync(join(upstream, 'source.ts'), 'export const value = "advance-' + attempt + '"\\n')
  if (process.env.MOVE_DEPENDENCIES === 'true') writeFileSync(join(upstream, 'package-lock.json'), '{"name":"changed","lockfileVersion":3,"packages":{}}\\n')
  if (process.env.MOVE_NODE === 'true') writeFileSync(join(upstream, '.nvmrc'), '25\\n')
  git('add', '.')
  git('commit', '-m', 'Concurrent main advance ' + attempt)
  console.error(${JSON.stringify(freshnessError)})
  process.exitCode = 1
} else if (process.env.CHILD_FAILURE) {
  console.error(process.env.CHILD_FAILURE)
  process.exitCode = Number(process.env.CHILD_STATUS ?? 1)
} else {
  if (process.env.SUCCESS_WARNING) console.error(process.env.SUCCESS_WARNING)
  console.log('LOADED:' + value)
}
`)
  git(upstream, 'add', '.')
  git(upstream, 'commit', '-m', 'Initial report source')
  git(root, 'clone', '--quiet', upstream, checkout)
  symlinkSync(resolve('node_modules'), join(checkout, 'node_modules'), 'dir')
  writeFileSync(join(bin, 'npm'), '#!/bin/sh\nprintf "%s\\n" "$*" >> "$FIXTURE_STATE/npm.log"\n', {mode: 0o755})
  const run = (extra: Record<string, string> = {}) => spawnSync(process.execPath, [launcher], {
    cwd: checkout, encoding: 'utf8', timeout: 20000,
    env: {...process.env, GITHUB_ACTIONS: 'true', GITHUB_WORKSPACE: checkout,
      FIXTURE_STATE: state, FIXTURE_UPSTREAM: upstream, PATH: `${bin}:${process.env.PATH}`, ...extra}
  })
  const contents = (path: string) => {try {return readFileSync(join(state, path), 'utf8')} catch {return ''}}
  return {root, upstream, checkout, run, contents, clean: () => rmSync(root, {recursive: true, force: true})}
}

test('a source advance is retried by a new process loading the new canonical module', () => {
  const f = fixture()
  try {
    const result = f.run({MOVE_COUNT: '1', SUCCESS_WARNING: 'Successful report diagnostic'})
    assert.equal(result.status, 0, result.stderr)
    assert.equal(f.contents('attempts'), 'initial\nadvance-1\n')
    assert.match(result.stdout, /LOADED:advance-1/)
    assert.match(result.stderr, /Successful report diagnostic/)
    assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), git(f.upstream, 'rev-parse', 'HEAD'))
    assert.equal(f.contents('npm.log'), '')
  } finally {f.clean()}
})

test('changed dependency inputs reinstall before the fresh source process', () => {
  const f = fixture()
  try {
    const result = f.run({MOVE_COUNT: '1', MOVE_DEPENDENCIES: 'true'})
    assert.equal(result.status, 0, result.stderr)
    assert.equal(f.contents('npm.log'), 'ci --no-audit --no-fund\n')
    assert.match(result.stdout, /LOADED:advance-1/)
  } finally {f.clean()}
})

test('continued source movement is bounded to three fresh attempts', () => {
  const f = fixture()
  try {
    const result = f.run({MOVE_COUNT: '4'})
    assert.equal(result.status, 1)
    assert.equal(f.contents('attempts'), 'initial\nadvance-1\nadvance-2\n')
    assert.match(result.stderr, /Briefing requires clean canonical main sources/)
  } finally {f.clean()}
})

test('unknown claims, generic failures and a guard error without source movement are not retried', () => {
  for (const [message, status] of [['Claims unavailable', '2'], ['Transport failed', '1'], [freshnessError, '1']]) {
    const f = fixture()
    try {
      const result = f.run({CHILD_FAILURE: message, CHILD_STATUS: status})
      assert.equal(result.status, Number(status))
      assert.equal(f.contents('attempts'), 'initial\n')
    } finally {f.clean()}
  }
})

test('a changed Node requirement requires a new toolchain setup, not a stale retry', () => {
  const f = fixture()
  try {
    const result = f.run({MOVE_COUNT: '1', MOVE_NODE: 'true'})
    assert.equal(result.status, 1)
    assert.match(result.stderr, /Node requirement changed/)
    assert.equal(f.contents('attempts'), 'initial\n')
  } finally {f.clean()}
})

test('fresh reporting refuses dirty sources and non-disposable checkouts without rewriting them', () => {
  const f = fixture()
  try {
    const original = git(f.checkout, 'rev-parse', 'HEAD')
    assert.equal(f.run({GITHUB_ACTIONS: 'false'}).status, 1)
    writeFileSync(join(f.checkout, 'source.ts'), 'uncommitted source\n')
    const dirty = f.run()
    assert.equal(dirty.status, 1)
    assert.match(dirty.stderr, /dirty source checkout/)
    assert.equal(readFileSync(join(f.checkout, 'source.ts'), 'utf8'), 'uncommitted source\n')
    assert.equal(git(f.checkout, 'rev-parse', 'HEAD'), original)
    assert.equal(f.contents('attempts'), '')
  } finally {f.clean()}
})

test('the installed cache has exact toolchain/dependency identity and saves before source refresh', () => {
  const require = createRequire(import.meta.url)
  const {load} = require('js-yaml')
  const action = load(readFileSync('.github/actions/control-runtime/action.yml', 'utf8'))
  const steps = action.runs.steps
  const restore = steps.find((step: any) => step.id === 'dependencies')
  assert.equal(restore.uses, 'actions/cache/restore@v6')
  assert.equal(restore.with.path, 'node_modules')
  assert.equal(restore.with['restore-keys'], undefined)
  for (const input of ['runner.os', 'runner.arch', 'node-version', 'package.json', 'package-lock.json', '.npmrc', 'control-runtime/action.yml']) assert.ok(restore.with.key.includes(input), input)
  const install = steps.findIndex((step: any) => step.run === 'npm ci --no-audit --no-fund')
  const save = steps.findIndex((step: any) => step.uses === 'actions/cache/save@v6')
  assert.ok(install >= 0 && save > install)
  assert.equal(steps[install].if, "steps.dependencies.outputs.cache-hit != 'true'")
  assert.equal(steps[save].with.key, '${{ steps.dependencies.outputs.cache-primary-key }}')
  assert.ok(!steps.some((step: any) => step.uses === 'actions/cache@v6'), 'No post-job save after a possible dependency refresh')
  for (const file of ['operations-report.yml', 'control-operations.yml', 'mvb-command-gateway.yml', 'project-control-projections.yml']) {
    const workflow = readFileSync('.github/workflows/' + file, 'utf8')
    assert.match(workflow, /ref: main/)
    assert.match(workflow, /uses: \.\/.github\/actions\/control-runtime/)
    assert.doesNotMatch(workflow, /cache-mode:\s*(write|write-only)/)
  }
})
