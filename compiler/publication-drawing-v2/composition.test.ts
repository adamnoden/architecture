import assert from 'node:assert/strict'
import {test} from 'node:test'
import {translateDrawingPrimitive,renderDrawingViewportSvg} from './composition.js'
import {PLT_CANDIDATE_TOKENS as tokens} from './plt-candidate-tokens.js'
import {renderDrawingSceneV2SvgWithTokens} from './svg.js'
import type {DrawingSceneV2} from './model.js'
const scene:DrawingSceneV2={widthMm:200,heightMm:120,viewId:'ASYMMETRIC-SPREAD',sourceId:'INDEPENDENT',title:'Contrast',description:'No house geometry',scaleDenominator:50,primitives:[{kind:'line',id:'line',a:{x:13,y:17},b:{x:167,y:83},role:'primary'},{kind:'path',id:'path',rings:[[{x:30,y:50},{x:72,y:30},{x:52,y:94}]],fill:'paper',stroke:'profile'},{kind:'rect',id:'rect',x:115,y:25,width:9,height:43,stroke:'secondary'},{kind:'text',id:'text',x:133,y:64,value:'Example',role:'note',anchor:'middle'}]}
test('composition translates every primitive without resizing geometry or changing roles and source metadata',()=>{
 const before=structuredClone(scene)
 for(const n of scene.primitives)assert.deepEqual(translateDrawingPrimitive(translateDrawingPrimitive(n,19,-7),-19,7),n)
 const rect=translateDrawingPrimitive(scene.primitives[2],12,9);assert.ok(rect.kind==='rect');assert.equal(rect.width,9);assert.equal(rect.height,43)
 assert.deepEqual(scene,before);assert.throws(()=>translateDrawingPrimitive(scene.primitives[0],NaN,0))
})
test('facing crops share exact canonical vectors, styles and physical scale, rejecting impossible viewports',()=>{
 const full=renderDrawingSceneV2SvgWithTokens(scene,tokens),left=renderDrawingViewportSvg(scene,tokens,{x:0,y:0,width:100,height:120}),right=renderDrawingViewportSvg(scene,tokens,{x:100,y:0,width:100,height:120})
 assert.match(left,/width="100mm" height="120mm" viewBox="0 0 100 120"/)
 assert.match(right,/width="100mm" height="120mm" viewBox="100 0 100 120"/)
 const body=(s:string)=>s.slice(s.indexOf('\n'));assert.equal(body(full),body(left));assert.equal(body(full),body(right))
 assert.throws(()=>renderDrawingViewportSvg(scene,tokens,{x:101,y:0,width:100,height:120}));assert.throws(()=>renderDrawingViewportSvg(scene,tokens,{x:0,y:0,width:0,height:120}))
})
