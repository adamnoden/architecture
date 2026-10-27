import { compileArchitecturalPlanScene } from '../architectural-drawing/compile-plan.js'
import { createPlanPaperProjection } from '../publication-drawing/projection.js'
import { mm } from '../units.js'
import { createResolvedReferenceHouseAdePlan } from './resolved-ade-plan.js'
import type { LevelId, ReferenceHouseCompileResult, ReferenceHouseSource } from './model.js'

export const createResolvedReferenceHouseAdePlanScene = (result: ReferenceHouseCompileResult, source: ReferenceHouseSource, scale: 100 | 50, level: LevelId = 'GROUND') => {
  const plan=createResolvedReferenceHouseAdePlan(result,source,level)
  const origin=scale===100?{x:16,y:20}:{x:90,y:155}
  const projection=createPlanPaperProjection({scaleDenominator:scale,modelBounds:{x:0,y:0,width:12000,height:10800},paperOrigin:origin})
  const northDoorLeafPaperMm=Math.max(0,...plan.openings.filter(o=>o.hostWallId==='G-OUTER-NORTH'&&o.symbol?.kind==='door').map(o=>
    o.width.kind==='approximate'&&o.symbol?.kind==='door'?o.width.value/o.symbol.leaves/scale:0))
  const scene=compileArchitecturalPlanScene(plan,{
    title:`Reference House ${level.toLowerCase()}-floor resolution — 1:${scale}`,
    profile:{id:`RESOLVED-${scale}`,output:scale===100?'BOOK':'WALL',scaleDenominator:scale},projection,
    widthMm:scale===100?140:420,heightMm:scale===100?155:594,
    resolveAssemblyThicknessMm:(a)=>mm(a.id==='RH-ADE-ENVELOPE'?417.5:125),
    resolveLayerThicknessMm:(l)=>{
      if(l.thickness.kind==='approximate'||l.thickness.kind==='exact')return l.thickness.value
      if(l.id==='RH-ADE-CAVITY')return mm(160)
      throw new Error(`Unresolved layer ${l.id}`)
    },
    abutments:{'RH-PART-DRY-01':['RH-ADE-ENVELOPE']},openingSide:()=> 'right',layerBoundaryOpacity:0.45,
    dimensionOptions:{annotationSide:'right',offsetPaperMm:Math.max(10,northDoorLeafPaperMm+4)},
    labelLayout:(l)=>l.id.endsWith('court-size')?{dyPaperMm:4}:l.id.endsWith('court-label')?{dyPaperMm:-1.5}:['G-GAL-01-label','U-GAL-02-label'].includes(l.id)?{rotateDeg:-90}:{}
  })
  // Retain the proven paper notation, independently of newly selected openings.
  const y=origin.y+10800/scale+19,x=origin.x+12000/scale-3000/scale
  result.derived.frontAxes.forEach((axis,i)=>{
    const px=origin.x+axis/scale,py=origin.y+10800/scale
    scene.primitives.push({kind:'line',id:`front-axis-${i+1}`,a:{x:px,y:py+6},b:{x:px,y:py+8},role:'secondary'})
    scene.primitives.push({kind:'text',id:`front-axis-label-${i+1}`,x:px,y:py+11,value:`B${i+1}`,role:'note',anchor:'middle'})
  })
  scene.primitives.push({kind:'line',id:'scale-bar',a:{x,y},b:{x:x+3000/scale,y},role:'primary'})
  for(const i of [0,1,2,3])scene.primitives.push({kind:'line',id:`scale-tick-${i}`,a:{x:x+i*1000/scale,y:y-1},b:{x:x+i*1000/scale,y:y+1},role:'secondary'})
  scene.primitives.push({kind:'text',id:'scale-label',x:x+1500/scale,y:y+4,value:'3 m',role:'note',anchor:'middle'})
  scene.primitives.push({kind:'text',id:'north',x:origin.x+6,y:y+2,value:'N ↑',role:'marker',anchor:'middle'})
  return scene
}
