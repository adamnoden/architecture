import assert from 'node:assert/strict'
import {test} from 'node:test'
import {design,roofHeight,roofTop} from './georgian/facade-source.js'
import {design as old} from './georgian/source.js'
import {createGeorgianElevation,elevationSource,elevationViews} from './georgian/elevations.js'
test('exterior successor holds the floor plan while explicitly withdrawing standing attic use',()=>{
 assert.deepEqual(design.rooms,old.rooms);assert.deepEqual(design.partitions,old.partitions);assert.deepEqual(design.stair,old.stair)
 assert.match(design.atticUse,/full-height attic stair withdrawn/);assert.ok(roofTop()-300-design.levels.attic<2100)
})
test('roof uses one positive 25 degree fall with no dormers or roof openings',()=>{
 assert.equal(design.roof.upperPitchDeg,25);assert.equal(design.roof.flatRoofsAllowed,false);assert.deepEqual(design.roof.dormerAxes,[])
 for(let x=0;x<4200;x+=100)assert.ok(roofHeight(x+100)>roofHeight(x))
 assert.ok(roofTop()<8800)
 for(const v of elevationViews){assert.equal(elevationSource(v).dormers.length,0);assert.ok(!createGeorgianElevation(v,100).primitives.some(p=>p.id.includes('roof-break')))}
})
test('windows have six panes per sash and door threshold/entrance detail are explicit',()=>{
 const s=createGeorgianElevation('FRONT',100),m=elevationSource('FRONT')
 for(const w of m.apertures.filter(a=>a.kind==='window')){assert.equal(s.primitives.filter(p=>p.id.startsWith(w.id+'-bar-')).length,2);assert.equal(s.primitives.filter(p=>p.id.startsWith(w.id+'-row-')).length,2);assert.ok(s.primitives.some(p=>p.id===w.id+'-meeting'))}
 for(const id of ['entrance-surround','fanlight-rail','external-ground','GROUND-front-door-threshold'])assert.ok(s.primitives.some(p=>p.id===id),id)
 assert.equal(s.primitives.filter(p=>p.id.startsWith('door-panel-')).length,4)
})
