import assert from 'node:assert/strict'
import test from 'node:test'
import { defaultGitTimeoutMs, maximumGitTimeoutMs, resolveGitTimeoutMs, runGit } from './git-command.js'

test('Git deadline defaults and strict bounded explicit configuration', () => {
  const previous = process.env.ACO_GIT_TIMEOUT_MS
  try {
    delete process.env.ACO_GIT_TIMEOUT_MS
    assert.equal(resolveGitTimeoutMs(), defaultGitTimeoutMs)
    for (const value of ['1', '30000', '90000', '120000']) assert.equal(resolveGitTimeoutMs(value), Number(value))
    for (const value of ['', '0', '-1', '1.5', 'NaN', 'Infinity', ' 90000', '90000 ', '9e4', '0x15f90', '090000', '120001', '999999999999999999999999']) {
      assert.throws(() => resolveGitTimeoutMs(value), /ACO_GIT_TIMEOUT_MS/)
    }
    process.env.ACO_GIT_TIMEOUT_MS = String(maximumGitTimeoutMs)
    assert.equal(resolveGitTimeoutMs(), maximumGitTimeoutMs)
    process.env.ACO_GIT_TIMEOUT_MS = 'invalid'
    assert.throws(() => runGit(['--version']), /ACO_GIT_TIMEOUT_MS/)
  } finally {
    if (previous === undefined) delete process.env.ACO_GIT_TIMEOUT_MS
    else process.env.ACO_GIT_TIMEOUT_MS = previous
  }
})

test('actual spawned Git enforces the configured deadline and allows a bounded delay with more runway', () => {
  const previous = process.env.ACO_GIT_TIMEOUT_MS
  // Git itself executes this controlled alias; no replacement executable or child-process mock.
  const command = ['-c', 'alias.aco-deadline-test=!sleep 0.3', 'aco-deadline-test']
  try {
    process.env.ACO_GIT_TIMEOUT_MS = '30'
    const started = Date.now()
    assert.throws(() => runGit(command), (error: NodeJS.ErrnoException) => error.code === 'ETIMEDOUT')
    assert.ok(Date.now() - started < 2000, 'short deadline must terminate the waiting Git process')
    process.env.ACO_GIT_TIMEOUT_MS = '2000'
    assert.equal(runGit(command), '')
  } finally {
    if (previous === undefined) delete process.env.ACO_GIT_TIMEOUT_MS
    else process.env.ACO_GIT_TIMEOUT_MS = previous
  }
})
