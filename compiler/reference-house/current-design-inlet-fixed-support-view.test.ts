import assert from 'node:assert/strict'
import test from 'node:test'
import { readCurrentDesignResolution } from './current-design/resolve.js'
import { readInletSillInsertCase, runInletSillInsertCase } from './current-design/inlet-sill-insert.js'
import { readInletFaultCase, runInletFaultCase } from './current-design/inlet-fault.js'
import { compileFixedInletCandidate, readFixedInletSettings } from './current-design/inlet-fixed-entry.js'
import { compareCurrentFixedInletSupport } from './current-design/inlet-fixed-support-integration.js'
import { renderCompactInletSupportView, renderInletFixedSupportView } from './current-design/inlet-fixed-support-view.js'

const resolved = readCurrentDesignResolution()
const insertCase = readInletSillInsertCase(resolved).insert
const insert = runInletSillInsertCase(resolved, insertCase)
const faultCase = readInletFaultCase(resolved, insertCase).fault
const joined = { insert, faultCase, fault: runInletFaultCase(resolved, faultCase, insertCase) }
const settings = readFixedInletSettings()
const candidate = compileFixedInletCandidate(resolved, settings, joined)
const support = compareCurrentFixedInletSupport(resolved, candidate)

function attribute(svg: string, id: string, name: string) {
  const tag = svg.match(new RegExp('<[^>]+id="' + id + '"[^>]*>'))?.[0]
  assert.ok(tag, 'missing rendered geometry ' + id)
  const value = tag.match(new RegExp('(?:^|\\s)' + name + '="([^"]+)"'))?.[1]
  assert.ok(value, 'missing ' + name + ' on ' + id)
  return value
}

test('support review draws the same conditional window, real closed hoods and source receiver without granting approval', () => {
  const snapshot = structuredClone({ candidate, support })
  const svg = renderInletFixedSupportView(candidate, support)
  assert.match(svg, /width="420mm" height="297mm"/)
  assert.match(svg, /Arch head bound 2850 mm · profile omitted/)
  assert.match(svg, /accepted plan position/)
  assert.match(svg, /insideElevation.*facing south; west to screen right/)
  assert.match(svg, /This is not glazing area/)
  assert.match(svg, /remain unqualified/)
  assert.match(svg, /Lower wet-cell chassis and ribs are outside this view/)
  assert.doesNotMatch(svg, /id="(?:elevation|section)-low-chassis/)
  for (const [index, box] of support.receivers.guidedRoute.geometry.railBoxesMm.entries()) {
    assert.equal(attribute(svg, 'elevation-rail-' + index, 'data-body-mm'), box.join(','))
  }
  for (const branch of candidate.branches) {
    assert.equal(attribute(svg, 'elevation-' + branch.branch + '-closed-hood', 'data-body-mm'),
      branch.controlArrangementComparison.wholeOrdinaryValveHood.bodyMm.join(','))
    assert.ok(Number(attribute(svg, 'plan-' + branch.branch + '-pipe', 'r')) > 0)
  }
  assert.ok(Number(attribute(svg, 'elevation-utility-closed-hood', 'x')) > Number(attribute(svg, 'elevation-plant-closed-hood', 'x')))
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map(match => match[1])
  assert.equal(ids.length, new Set(ids).size)
  assert.deepEqual({ candidate, support }, snapshot)
  assert.equal(support.evidence.selectedHouseAdoption, false)
  assert.equal(support.evidence.completeSupportCapacity, false)
})

test('an actual riser edit changes the drawn pipe position and arm length while preserving the window and elevation control', () => {
  const before = renderInletFixedSupportView(candidate, support)
  const editedCandidate = compileFixedInletCandidate(resolved, { ...settings, riserYMm: settings.riserYMm - 5 }, joined)
  const editedSupport = compareCurrentFixedInletSupport(resolved, editedCandidate)
  const after = renderInletFixedSupportView(editedCandidate, editedSupport)
  const expected = -5 * 4 / 15
  const cy = (svg: string) => Number(attribute(svg, 'plan-utility-pipe', 'cy'))
  const arm = (svg: string) => Number(attribute(svg, 'section-fixed-arm', 'width'))
  assert.ok(Math.abs(cy(after) - cy(before) - expected) < .002)
  assert.ok(Math.abs(arm(after) - arm(before) - expected) < .002)
  for (const attributeName of ['x', 'y', 'width', 'height']) {
    assert.equal(attribute(after, 'window-bound-elevation', attributeName), attribute(before, 'window-bound-elevation', attributeName))
  }
  assert.equal(attribute(after, 'elevation-rail-0', 'data-body-mm'), attribute(before, 'elevation-rail-0', 'data-body-mm'))
  assert.equal(editedSupport.source.faultCaseDigest, support.source.faultCaseDigest)
  assert.notEqual(editedSupport.source.candidateCaseDigest, support.source.candidateCaseDigest)
})

test('the rejected full-restraint option draws its actual heavier rails and states its disposition', () => {
  const guided = renderInletFixedSupportView(candidate, support, 'guidedRoute')
  const rejected = renderInletFixedSupportView(candidate, support, 'fullRestraintAdverse')
  assert.match(rejected, /rejected full-restraint comparison/)
  assert.equal(attribute(rejected, 'elevation-rail-0', 'data-body-mm'), support.receivers.fullRestraintAdverse.geometry.railBoxesMm[0].join(','))
  assert.ok(Number(attribute(rejected, 'elevation-rail-0', 'height')) > Number(attribute(guided, 'elevation-rail-0', 'height')))
  assert.match(guided, /Two rails add 160 mm/)
  assert.match(rejected, /Two rails add 240 mm/)
})

test('mixed candidate revisions and missing actual window datums withhold the drawing instead of inventing geometry', () => {
  assert.throws(() => renderInletFixedSupportView({ ...candidate, source: { ...candidate.source, caseDigest: 'wrong' } }, support), /same candidate/)
  assert.throws(() => renderInletFixedSupportView(candidate, { ...support, hostWindow: { ...support.hostWindow, headZMm: NaN } }), /actual source window/)
  assert.throws(() => renderInletFixedSupportView(candidate, { ...support, hostWindow: { ...support.hostWindow, headZMm: support.hostWindow.sillZMm } }), /actual source window/)
})

test('the compact sheet draws the actual short rails, separate endplates and through-port instead of overlaying the bridge', () => {
  const svg = renderCompactInletSupportView(candidate, support), compact = support.compactReceiver
  assert.match(svg, /cantilever 472.5 mm/)
  assert.match(svg, /forward pipe draw nominally clear/)
  assert.match(svg, /Cold draw \+Y 739.5 mm/)
  assert.match(svg, /Draw 3.996 mm after 5 \+ curve; cold keeper\/grip unqualified/)
  assert.doesNotMatch(svg, /welded arm blocks|jaw bounds intercept support/)
  assert.match(svg, /Socket rows 950 \/ 1270 remain reserved/)
  assert.match(svg, /Hood-side reserve 7 mm/)
  assert.match(svg, new RegExp(String(compact.mass.representedSteelUpperBoundKg)))
  assert.equal(attribute(svg, 'elevation-rail-0', 'data-body-mm'), compact.geometry.railBoxesMm[0].join(','))
  assert.equal(attribute(svg, 'elevation-backplate-port-0', 'data-body-mm'), compact.geometry.backplates[0].throughPortMm!.join(','))
  assert.equal(attribute(svg, 'elevation-backplate-1', 'data-body-mm'), compact.geometry.backplates[1].bodyMm.join(','))
  assert.equal(attribute(svg, 'section-guide-post', 'data-body-mm'), compact.geometry.guides[0].postBodyMm.join(','))
  assert.match(svg, /guide Z1800/)
  assert.equal(candidate.branches[0].controlArrangementComparison.wholeOrdinaryValveHood.bodyMm[3], 170)
  assert.doesNotMatch(svg, /id="plan-backplate-1"/)
  assert.ok(Number(attribute(svg, 'elevation-rail-0', 'width')) < Number(attribute(renderInletFixedSupportView(candidate, support), 'elevation-rail-0', 'width')))
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map(match => match[1])
  assert.equal(ids.length, new Set(ids).size)
  assert.equal(compact.selectedHouseAdoption, false)
  assert.equal(compact.operatingReview.lowerRenewalWithCurrentWeldedArmPass, true)
  assert.ok(compact.operatingReview.toolPoses.every(row => row.supportBodiesAfter5Mm > 0))
})

test('a retained narrow hood is drawn at its actual width with the failed clearance, without substituting the wider proposal', () => {
  const narrow = compileFixedInletCandidate(resolved, { ...settings, controlHoodEastAllowanceMm: 40 }, joined)
  const narrowSupport = compareCurrentFixedInletSupport(resolved, narrow)
  const svg = renderCompactInletSupportView(narrow, narrowSupport)
  assert.match(svg, /Hood-side reserve -13 mm/)
  assert.equal(attribute(svg, 'elevation-utility-closed-hood', 'data-body-mm'), narrow.branches[0].controlArrangementComparison.wholeOrdinaryValveHood.bodyMm.join(','))
  assert.equal(narrow.branches[0].controlArrangementComparison.wholeOrdinaryValveHood.bodyMm[3], 150)
  assert.equal(narrowSupport.compactReceiver.geometry.hoodReview[0].proposedBodyMm[3], 165)
})

test('the compact view propagates actual riser geometry, preserves the window control and rejects a different compact case', () => {
  const before = renderCompactInletSupportView(candidate, support)
  const edited = compileFixedInletCandidate(resolved, { ...settings, riserYMm: settings.riserYMm - 5 }, joined)
  const editedSupport = compareCurrentFixedInletSupport(resolved, edited)
  const after = renderCompactInletSupportView(edited, editedSupport)
  const widthDelta = Number(attribute(after, 'section-fixed-arm', 'width')) - Number(attribute(before, 'section-fixed-arm', 'width'))
  assert.ok(Math.abs(widthDelta - -5 * 4 / 15) < .002)
  assert.equal(attribute(after, 'elevation-rail-0', 'data-body-mm'), attribute(before, 'elevation-rail-0', 'data-body-mm'))
  for (const key of ['x', 'y', 'width', 'height']) assert.equal(attribute(after, 'window-bound-elevation', key), attribute(before, 'window-bound-elevation', key))
  assert.throws(() => renderCompactInletSupportView(candidate, { ...support, compactReceiver: editedSupport.compactReceiver }), /same-candidate support/)
})

test('a larger actual temperature case retains its failed authored comparisons in the drawing', () => {
  const hotter = compileFixedInletCandidate(resolved, { ...settings, localPipeTemperatureRangeK: 80 }, joined)
  const hotSupport = compareCurrentFixedInletSupport(resolved, hotter)
  const svg = renderCompactInletSupportView(hotter, hotSupport)
  assert.match(svg, /Authored local checks FAIL/)
  assert.match(svg, /cold keeper\/grip unqualified/)
  assert.doesNotMatch(svg, /welded arm blocks/)
  assert.equal(attribute(svg, 'elevation-rail-0', 'data-body-mm'), support.compactReceiver.geometry.railBoxesMm[0].join(','))
  assert.equal(hotSupport.evidence.selectedHouseAdoption, false)
})

test('the older repair profile retains its real jaw interference without reviving the withdrawn rear-arm obstruction', () => {
  const older = compileFixedInletCandidate(resolved, { ...settings, lowerCutZMm: 975, upperCutZMm: 1425,
    valveCentreZMm: 1200, upperPipeGuideZMm: 1680 }, joined)
  const olderSupport = compareCurrentFixedInletSupport(resolved, older)
  const svg = renderCompactInletSupportView(older, olderSupport)
  assert.match(svg, /Jaw reserve -64.201 mm after 5/)
  assert.match(svg, /forward pipe draw nominally clear/)
  assert.doesNotMatch(svg, /welded arm blocks/)
  assert.equal(olderSupport.compactReceiver.operatingReview.lowerRenewalWithCurrentWeldedArmPass, true)
})
