import assert from 'node:assert/strict'
import test from 'node:test'
import {validateWorkflowSource} from './validate-workflows.mjs'
const valid='on: push\njobs:\n  report:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Upload\n        if: always()\n        uses: actions/upload-artifact@v6\n'
test('workflow guard catches the observed indentation regression before merge',()=>{
 assert.doesNotThrow(()=>validateWorkflowSource(valid))
 assert.throws(()=>validateWorkflowSource(valid.replace('        uses:','            uses:')))
})
test('workflow guard rejects duplicate keys and missing execution while permitting reusable calls',()=>{
 assert.throws(()=>validateWorkflowSource('on: push\non: pull_request\njobs: {}'))
 assert.throws(()=>validateWorkflowSource('on: push\njobs:\n  empty:\n    runs-on: ubuntu-latest'))
 assert.doesNotThrow(()=>validateWorkflowSource('on:\n  workflow_call:\njobs:\n  report:\n    uses: ./.github/workflows/operations-report.yml'))
})
