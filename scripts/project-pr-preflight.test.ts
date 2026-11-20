import assert from 'node:assert/strict'
import test from 'node:test'
import { publicationPreflightRequest } from './project-pr-preflight.js'

const repository = 'adamnoden/architecture'
const event = () => ({ repository: { full_name: repository }, pull_request: {
  number: 1597, state: 'open', merged: false, body: 'Work: STR-FLOOR-PORTAL',
  head: { ref: 'work/example', sha: 'a'.repeat(40), repo: { full_name: repository } },
  base: { ref: 'main', repo: { full_name: repository } },
} })

test('publication preflight retains the exact submitted identity and declaration', () => {
  assert.deepEqual(publicationPreflightRequest(event(), repository), {
    number: 1597, branch: 'work/example', head: 'a'.repeat(40), body: 'Work: STR-FLOOR-PORTAL',
  })
})

test('forks, other repositories, wrong bases and missing immutable heads cannot run canonical preflight', () => {
  for (const change of [
    (value: ReturnType<typeof event>) => { value.pull_request.head.repo.full_name = 'someone/fork' },
    (value: ReturnType<typeof event>) => { value.pull_request.base.ref = 'other' },
    (value: ReturnType<typeof event>) => { value.pull_request.head.sha = 'main' },
    (value: ReturnType<typeof event>) => { value.pull_request.state = 'closed' },
    (value: ReturnType<typeof event>) => { value.pull_request.merged = true },
  ]) {
    const value = event()
    change(value)
    assert.throws(() => publicationPreflightRequest(value, repository), /Publication preflight rejects/)
  }
  assert.throws(() => publicationPreflightRequest(event(), 'someone/fork'), /expected repository/)
  assert.throws(() => publicationPreflightRequest(null, repository), /expected repository/)
})
