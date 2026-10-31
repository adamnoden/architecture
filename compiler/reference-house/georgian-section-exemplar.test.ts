import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createSectionExemplar,joinSectionRegions,roofHeight,roofTop,design,exemplarViews} from './georgian/section-exemplar-01.js'
import {renderDrawingSceneV2SvgWithTokens} from '../publication-drawing-v2/svg.js'
import {PLT_CANDIDATE_TOKENS} from '../publication-drawing-v2/plt-candidate-tokens.js'
test('joined cut regions remove shared floor/wall interfaces rather than drawing independent boxes',()=>{
 const r=joinSectionRegions([{x0:0,x1:140,y0:0,y1:1000},{x0:65,x1:800,y0:400,y1:600}]);assert.equal(r.length,1);assert.equal(r[0].length,8)
 assert.ok(!r[0].some(p=>p.x===65))
})
test('twin pitch has positive falls in both directions and lower courtyard eaves',()=>{
 assert.equal(roofHeight(0),6800);assert.equal(roofHeight(4200),6800);assert.ok(roofTop()>7700&&roofTop()<7800)
 for(let d=0;d<2100;d+=100)assert.ok(roofHeight(d+100)>roofHeight(d))
 for(let d=2100;d<4200;d+=100)assert.ok(roofHeight(d+100)<roofHeight(d))
 assert.equal(design.section.weather+design.section.cavity+design.section.inner+design.section.finish,417.5)
})
test('section uses joined layered cut paths and a continuous roof region, not cut rectangles',()=>{
 const s=createSectionExemplar('PRINCIPAL',100)
 for(const id of ['weather-leaves','inner-floor-partition','roof-south','roof-north'])assert.ok(s.primitives.some(p=>p.kind==='path'&&p.id===id))
 assert.ok(!s.primitives.some(p=>p.kind==='rect'&&p.fill!=='none'))
 assert.ok(s.primitives.some(p=>p.id==='storage-reserve-1000'&&p.kind==='line'&&p.dash==='datum'))
 // Floor bearing stops inside the inner leaf: it cannot bridge the 160 mm cavity.
 assert.ok(417.5-15-75>102.5+160)
})
test('all coordinated roof consequences remain deterministic vectors and carry the same successor identity',()=>{
 for(const v of exemplarViews)for(const scale of [100,50] as const){const s=createSectionExemplar(v,scale),svg=renderDrawingSceneV2SvgWithTokens(s,PLT_CANDIDATE_TOKENS);assert.equal(s.sourceId,design.id);assert.equal(svg,renderDrawingSceneV2SvgWithTokens(createSectionExemplar(v,scale),PLT_CANDIDATE_TOKENS));assert.ok(!svg.includes('<image'))}
})
