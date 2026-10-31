import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'
import { renderDrawingSceneV2Svg } from '../publication-drawing-v2/svg.js'
import { mm } from '../units.js'

import { contrastPlan, drawContrastPlan as draw } from './contrast-fixture.js'

test('generic ADE composes an asymmetric six-sided non-RH source without source-specific branches', () => {
  const scene = draw(contrastPlan())
  assert.equal(scene.primitives.filter((p) => p.kind === 'path').length, 1)
  assert.equal(scene.primitives.filter((p) => p.metadata?.epistemic === 'opening-uncertainty').length, 5)
  const svg = renderDrawingSceneV2Svg(scene)
  assert.ok(!svg.includes('RH-'))
  assert.equal(svg, renderDrawingSceneV2Svg(draw(contrastPlan())))
  assert.equal(createHash('sha256').update(svg).digest('hex'), 'c2a7e4b0d88988302328d1c135f9032cf6ea6e8750c78a64091ccf04c5edd028')
})

test('unknown aperture never acquires a cut and ranged position still fails closed', () => {
  const plan = contrastPlan()
  plan.openings = plan.openings.map((o) => ({ ...o, width: { kind: 'unknown' } }))
  const scene = draw(plan)
  const wall = scene.primitives.find((p) => p.kind === 'path')!
  assert.equal(wall.kind, 'path')
  if (wall.kind === 'path') assert.equal(wall.rings.length, 2, 'uncut closed wall retains inner hole')
  plan.openings = plan.openings.map((o) => ({ ...o, centreOffset: { kind: 'range', min: mm(1000), max: mm(2000) } }))
  assert.throws(() => draw(plan), /ranged-position/)
})

test('range cut is the guaranteed minimum and wall geometry doubles without marker inflation', () => {
  const at100 = draw(contrastPlan()), at50 = draw(contrastPlan(), 50)
  const span = (s: typeof at100) => s.primitives.find((p) => p.id === 'OPEN-span')!
  const a = span(at100), b = span(at50)
  assert.ok(a.kind === 'line' && b.kind === 'line')
  if (a.kind !== 'line' || b.kind !== 'line') return
  assert.equal(Math.hypot(b.b.x - b.a.x, b.b.y - b.a.y), 2 * Math.hypot(a.b.x - a.a.x, a.b.y - a.a.y))
  const tick = (s: typeof at100) => s.primitives.find((p) => p.id === 'OPEN-span-a')!
  const ta = tick(at100), tb = tick(at50)
  assert.ok(ta.kind === 'line' && tb.kind === 'line')
  if (ta.kind === 'line' && tb.kind === 'line') assert.ok(Math.abs(Math.hypot(ta.b.x - ta.a.x, ta.b.y - ta.a.y) - Math.hypot(tb.b.x - tb.a.x, tb.b.y - tb.a.y)) < 1e-8)
  const path = at100.primitives.find((p) => p.kind === 'path')!
  if (path.kind === 'path') {
    // West/east jambs of 900 mm guaranteed aperture project to x=35.5 and 44.5.
    assert.ok(path.rings.flat().some((p) => p.x === 35.5))
    assert.ok(path.rings.flat().some((p) => p.x === 44.5))
  }
})

test('assembly-qualified successor identities distinguish monolithic families without changing geometry', async () => {
  const {compileArchitecturalPlanScene}=await import('./compile-plan.js')
  const {createPlanPaperProjection}=await import('../publication-drawing/projection.js')
  const plan=contrastPlan();plan.wallAssemblies=[...plan.wallAssemblies,{...plan.wallAssemblies[0],id:'SECOND'}]
  plan.walls=plan.walls.map((w,i)=>i===3?{...w,assemblyId:'SECOND'}:w)
  const options={profile:{id:'CONTRAST',output:'PROOF' as const,scaleDenominator:100},projection:createPlanPaperProjection({scaleDenominator:100,modelBounds:{x:0,y:0,width:6300,height:5300},paperOrigin:{x:20,y:20}}),widthMm:180,heightMm:160,title:'Contrast',resolveAssemblyThicknessMm:()=>mm(300),resolveLayerThicknessMm:()=>mm(300),openingSide:()=> 'right' as const}
  const legacy=compileArchitecturalPlanScene(plan,options),current=compileArchitecturalPlanScene(plan,{...options,wallRegionIds:'assembly-qualified'})
  const ids=current.primitives.map(p=>p.id);assert.equal(new Set(ids).size,ids.length)
  assert.deepEqual(current.primitives.map(({id,...p})=>p),legacy.primitives.map(({id,...p})=>p))
})
