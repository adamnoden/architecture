import assert from 'node:assert/strict'
import {test} from 'node:test'
import {comparePanelReservation,auditIasBaseline} from './georgian/ias-baseline-audit.js'
import {layoutRevision} from './georgian/layout-revision.js'

test('reservation comparison catches a return overlap that a centreline-only check misses',()=>{
 const r=comparePanelReservation({centreMm:3450,reservationWidthMm:700,lowerReturnDatumMm:2650,upperReturnDatumMm:3850,partitionThicknessMm:125})
 assert.equal(r.status,'INTERSECTS-NOMINAL-RETURN');assert.deepEqual(r.reservationIntervalMm,[3100,3800]);assert.deepEqual(r.nominalClearIntervalMm,[2712.5,3787.5]);assert.deepEqual(r.signedEndMarginsMm,[387.5,-12.5])
 const moved=comparePanelReservation({centreMm:3300,reservationWidthMm:700,lowerReturnDatumMm:2650,upperReturnDatumMm:3850,partitionThicknessMm:125})
 assert.equal(moved.status,'WITHIN-NOMINAL-INTERVAL');assert.deepEqual(moved.signedEndMarginsMm,[237.5,137.5]);assert.match(moved.qualification,/withdrawal allowances unselected/)
})
test('unknown return/thickness or invalid geometry cannot become a fit verdict',()=>{
 for(const r of [comparePanelReservation({centreMm:50,reservationWidthMm:20}),comparePanelReservation({centreMm:50,reservationWidthMm:20,lowerReturnDatumMm:0,upperReturnDatumMm:100,partitionThicknessMm:NaN}),comparePanelReservation({centreMm:50,reservationWidthMm:20,lowerReturnDatumMm:0,upperReturnDatumMm:10,partitionThicknessMm:125})])assert.equal(r.status,'UNKNOWN')
})
test('baseline is a read-only inventory of represented depth, not spare space or performance acceptance',()=>{
 const before=JSON.stringify(layoutRevision),r=auditIasBaseline();assert.equal(JSON.stringify(layoutRevision),before)
 assert.equal(r.sourceId,layoutRevision.id);assert.equal(r.geometryChanged,false);assert.equal(r.performanceAcceptance,false)
 assert.equal(r.floor.nominalZoneMm,350);assert.equal(r.floor.allocatedMm,350);assert.equal(r.floor.unallocatedDepthMm,0)
 assert.equal(r.envelope.nominalFinishDepthMm,15);assert.equal(r.envelope.additionalLiningDepthSelected,false)
 assert.equal(r.serviceReservations.completeAssemblyDepthSelected,false);assert.equal(r.serviceReservations.panels.length,layoutRevision.services.panels.length)
 assert.equal(r.floor.structuralOrAcousticAdequacyVerified,false);assert.match(r.qualification,/no installed assembly/)
})
