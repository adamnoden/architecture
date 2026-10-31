import assert from 'node:assert/strict'
import {test} from 'node:test'
import {analysisViews,analysisSource,createAnalysisScene,sectionalAnatomySegments} from './georgian/analysis-family.js'
import {createOrthographicScene,currentRoofZ} from './georgian/orthographic-family.js'
import {design} from './georgian/section-exemplar.js'
test('analytical overlays preserve every substrate geometry primitive without using historical technical results',()=>{
 for(const scale of [50,100] as const)for(const v of analysisViews){const s=createAnalysisScene(v,scale);assert.equal(s.sourceId,analysisSource.id);assert.deepEqual(s,createAnalysisScene(v,scale));assert.equal(new Set(s.primitives.map(q=>q.id)).size,s.primitives.length)
 if(v==='SECTIONAL-ANATOMY'){assert.equal(s.scaleDenominator,'NTS');continue}
 const base=createOrthographicScene(v==='ROOF-FAILURE'||v==='EXTERNAL-ACCESS'?'ROOF-WATER':v==='FIRST-SERVICES'?'FIRST':'GROUND',scale)
 for(const q of base.primitives.filter(q=>q.kind!=='text'))assert.deepEqual(s.primitives.find(p=>p.id===q.id),q)
 }
 assert.equal(analysisSource.structureVerified,false);assert.equal(analysisSource.drainageSized,false);assert.equal(analysisSource.maintenanceAccessVerified,false);assert.equal(analysisSource.adaptationApproved,false)
})
test('sectional anatomy is derived from held levels and clipped pitched-roof geography',()=>{
 const edges=sectionalAnatomySegments();for(const e of edges)for(const p of [e.a,e.b])assert.ok(p.y>=design.court.y)
 for(const e of edges.filter(e=>e.meaning==='pitched-roof-edge-or-ridge'||e.meaning==='section-roof-trace'))for(const p of [e.a,e.b])assert.ok(Math.abs(p.z-currentRoofZ(p.x,p.y))<1e-6)
 assert.ok(edges.some(e=>e.meaning==='riser-reservation'&&e.dash==='provisional'))
 assert.ok(!edges.some(e=>e.a.z===6900||e.b.z===6900))
 const s=createAnalysisScene('SECTIONAL-ANATOMY',100);assert.ok(s.primitives.filter(p=>p.kind==='line').every(p=>p.metadata?.solidGeometry===false))
})
