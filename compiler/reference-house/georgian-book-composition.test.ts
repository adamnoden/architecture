import assert from 'node:assert/strict'
import {test} from 'node:test'
import {compositionSource,dispositions,pageSpecs,bookProfiles,createBookPageScene,createBookSectionSpread} from './georgian/book-composition.js'
import {layoutFamilyViews,createLayoutFamilyScene,elevationSource} from './georgian/layout-family.js'
import {layoutAnalysisViews,createLayoutAnalysisScene} from './georgian/layout-analysis.js'
import {translateDrawingPrimitive,renderDrawingViewportSvg} from '../publication-drawing-v2/composition.js'
import {PLT_CANDIDATE_TOKENS as tokens} from '../publication-drawing-v2/plt-candidate-tokens.js'
const points=(q:ReturnType<typeof createBookSectionSpread>['primitives'][number])=>q.kind==='line'?[q.a,q.b]:q.kind==='path'?q.rings.flat():q.kind==='rect'?[{x:q.x,y:q.y},{x:q.x+q.width,y:q.y+q.height}]:[{x:q.x,y:q.y}]
test('subtraction accounts for every current view once; scoped omissions do not change the frozen register',()=>{
 const views=dispositions.flatMap(d=>[...d.views]);for(const view of [...layoutFamilyViews,...layoutAnalysisViews])assert.equal(views.filter(v=>v===view).length,1,view)
 assert.equal(compositionSource.architectureChanged,false);assert.equal(compositionSource.finalManuscriptSequence,false);assert.equal(compositionSource.synthesis3dAccepted,false)
 const signature=(view:'COURT-ENTRY'|'COURT-WINDOWS')=>elevationSource(view).apertures.map(({kind,u,width,sill,head,leaves})=>({kind,u,width,sill,head,leaves})).sort((a,b)=>a.sill-b.sill||a.u-b.u)
 assert.deepEqual(signature('COURT-ENTRY'),signature('COURT-WINDOWS'))
})
test('book pairs start on verso; all complete-plan and roof geometry is translated with no rescaling',()=>{
 assert.equal(pageSpecs.length,14)
 for(const p of [2,4,6,8])assert.equal(p%2,0)
 for(const format of ['b5','a4'] as const)for(const spec of pageSpecs){const s=createBookPageScene(spec.page,format);if(!s)continue
  const base='view' in spec&&(spec.view==='GROUND-SERVICES'||spec.view==='FIRST-SERVICES')?createLayoutAnalysisScene(spec.view,100):'view' in spec&&spec.view==='ROOF-OBLIGATIONS'?createLayoutAnalysisScene('ROOF-FAILURE',100):createLayoutFamilyScene(('view' in spec?spec.view:'GROUND') as typeof layoutFamilyViews[number],100)
  const dx=spec.page%2===0?bookProfiles[format].width-23.5-145:23.5
  for(const q of s.primitives)assert.deepEqual(q,translateDrawingPrimitive(base.primitives.find(b=>b.id===q.id)!,dx,28),`${format}/${spec.page}/${q.id}`)
  for(const q of s.primitives.filter(q=>q.kind!=='text'))for(const p of points(q)){assert.ok(p.x>=8-1e-6&&p.x<=bookProfiles[format].width-8+1e-6,`${spec.page}/${q.id}`);if(spec.page%2===0)assert.ok(p.x<=bookProfiles[format].width-12,`${spec.page}/${q.id}: binding`)}
 }
})
test('larger section preserves every retained source vector at 1:50; one canonical spread supplies both crops',()=>{
 const base=createLayoutFamilyScene('PRINCIPAL',50)
 for(const format of ['b5','a4'] as const){const p=bookProfiles[format],s=createBookSectionSpread(format);assert.equal(s.scaleDenominator,50);assert.equal(s.widthMm,2*p.width)
  for(const q of s.primitives){const old=base.primitives.find(b=>b.id===q.id);if(old)assert.deepEqual(q,translateDrawingPrimitive(old,p.width-212,p.height-438))}
  const text=s.primitives.filter(q=>q.kind==='text');for(const q of text){assert.ok(q.kind==='text');const conservativeWidth=q.value.length*tokens.textMm[q.role]*.57;const lo=q.anchor==='middle'?q.x-conservativeWidth/2:q.x,hi=lo+conservativeWidth;assert.ok(hi<=p.width-12||lo>=p.width+12,q.id+' crosses fold')}
  const left=renderDrawingViewportSvg(s,tokens,{x:0,y:0,width:p.width,height:p.height}),right=renderDrawingViewportSvg(s,tokens,{x:p.width,y:0,width:p.width,height:p.height});assert.equal(left.slice(left.indexOf('\n')),right.slice(right.indexOf('\n')))
  const locator=s.primitives.find(q=>q.id==='locator-shell')!;assert.ok(locator.kind==='rect');assert.equal(locator.width,24);assert.equal(locator.height,24)
 }
})
test('withheld technical readings remain explicit in replacement captions and source is not promoted',()=>{
 const captions=pageSpecs.flatMap(p=>'caption' in p?[p.caption]:[]).join(' ')
 for(const term of ['one-level conversion remains unproved','fire strategy','overflow','maintenance access','Bearing roles','foundations','framing'])assert.ok(captions.includes(term),term)
 assert.equal(compositionSource.printAcceptance,false)
})
