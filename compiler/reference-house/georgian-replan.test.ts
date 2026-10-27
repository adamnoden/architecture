import assert from 'node:assert/strict'
import {test} from 'node:test'
import {design,openings,roofHeight,roofTop} from './georgian/source.js'
import {createGeorgianPlan} from './georgian/plan.js'
import {createGeorgianScene} from './georgian/scenes.js'
import {auditGeorgianReplan} from './georgian/audit.js'
import {PROJECT_DESIGN_CONSTRAINTS} from '../../project/design-constraints.js'
import {renderDrawingSceneV2SvgWithTokens} from '../publication-drawing-v2/svg.js'
import {PLT_CANDIDATE_TOKENS} from '../publication-drawing-v2/plt-candidate-tokens.js'

test('coordinated proposal fits room/furniture/plant reservations and keeps its proof limits explicit',()=>{
 const a=auditGeorgianReplan();assert.equal(a.pass,true,JSON.stringify(a.failures));assert.ok(a.plantClearAreaM2>9);assert.ok(a.studyClearAreaM2>6.07)
 assert.equal(a.fullHistoricalSystemRevalidation,false);assert.equal(a.furnitureCarryingVerified,false);assert.equal(a.technicalHeadroomVerified,false)
 assert.equal(design.rooms.FIRST.filter(r=>/^U-(BED|PRINCIPAL)/.test(r.id)).length,4)
 assert.equal(design.rooms.FIRST.filter(r=>r.id.startsWith('U-ENS')).length,2)
})
test('all external aperture axes stack; front entrance is central; actual aperture symbols and wall nodes compile',()=>{
 const g=openings('GROUND'),u=openings('FIRST');assert.equal(g.find(o=>o.id==='front-door')!.centre,6000)
 for(const side of ['south','north','east','west'])assert.deepEqual(g.filter(o=>o.wall==='outer-'+side).map(o=>o.centre),u.filter(o=>o.wall==='outer-'+side).map(o=>o.centre))
 for(const level of ['GROUND','FIRST','ATTIC'] as const){const p=createGeorgianPlan(level);assert.ok(p.openings.every(o=>o.symbol));for(const scale of [100,50] as const)assert.ok(createGeorgianScene(level,scale).primitives.length>40)}
 for(const level of ['GROUND','FIRST'] as const)for(const side of ['south','east','west'])assert.deepEqual(openings(level).filter(o=>o.wall==='court-'+side).map(o=>[o.centre,o.width]),[[5100,1000],[6900,1000]])
 assert.equal(g.find(o=>o.id==='grand-court-entry')!.width,2400)
})
test('new roofs obey the project ban and all primary planes drain outward at substantial pitch',()=>{
 assert.equal(PROJECT_DESIGN_CONSTRAINTS.roofs.flatRoofsAllowed,false)
 assert.equal(PROJECT_DESIGN_CONSTRAINTS.roofs.lowSlopeSubstitutesAllowed,false)
 assert.ok(Math.atan((design.roof.breakZ-design.roof.eaves)/design.roof.breakInset)*180/Math.PI>=30)
 assert.ok(design.roof.upperPitchDeg>=30)
 assert.ok(Math.atan((design.roof.dormerApex-design.roof.dormerHead)/(design.roof.dormerWidth/2+100))*180/Math.PI>=30)
 for(let distance=0;distance<4200;distance+=25)assert.ok(roofHeight(distance+25)>roofHeight(distance),'gravity route must keep falling toward exterior, with no flat shelf')
 assert.ok(roofTop()>10000,'real height cost stays visible')
 assert.ok(auditGeorgianReplan().nominalAtticHeadroom>=2100)
})
test('service panels do not overlap the bathroom door and riser fits its accessible panel',()=>{
 const door=openings('FIRST').find(o=>o.id==='family-bath-door')!,panel=design.services.panels[1],riser=design.services.riser
 assert.ok(panel.y+panel.width/2+50<=door.centre-door.width/2)
 assert.ok(riser.y>=panel.y-panel.width/2&&riser.y+riser.depth<=panel.y+panel.width/2)
 assert.equal(design.services.replacementDoor,1400)
})
test('all eight views at both physical scales render deterministically without hidden raster or unsupported geometry',()=>{
 for(const view of ['GROUND','FIRST','ATTIC','FRONT','REAR','SECTION','STAIR','SERVICES'] as const)for(const scale of [100,50] as const){
  const a=renderDrawingSceneV2SvgWithTokens(createGeorgianScene(view,scale),PLT_CANDIDATE_TOKENS),b=renderDrawingSceneV2SvgWithTokens(createGeorgianScene(view,scale),PLT_CANDIDATE_TOKENS)
  assert.equal(a,b);assert.ok(!a.includes('<image'))
 }
})

test('internal door sweeps stay in their room and clear selected furniture and equipment',()=>{
 const target:Record<string,string>={'study-door':'G-STUDY','cloak-door':'G-CLOAK','utility-door':'G-UTILITY','wc-door':'G-WC','plant-door':'G-PLANT','pantry-door':'G-PANTRY','bed2-door':'U-BED2','bed3-door':'U-BED3','ensuite3-door':'U-BED3','family-bath-door':'U-BATH','principal-ensuite-door':'U-ENSP','principal-door':'U-PRINCIPAL','bed4-door':'U-BED4','wardrobe-door':'U-PRINCIPAL'}
 for(const level of ['GROUND','FIRST'] as const){
  const plan=createGeorgianPlan(level)
  const occupied=[...plan.fittings!.map(f=>({id:f.id,x:f.origin.x,y:f.origin.y,width:f.width,depth:f.depth})),...Object.entries(design.furniture).filter(([id])=>level==='FIRST'?['bed2','bed3','bed4','principal'].includes(id):id==='studyChair').map(([id,b])=>({id,...b})),...(level==='GROUND'?[{id:'riser',...design.services.riser}]:[])]
  for(const o of plan.openings.filter(o=>target[o.id])){
   const wall=plan.walls.find(w=>w.id===o.hostWallId)!,a=plan.nodes.find(n=>n.id===wall.fromNodeId)!.point,b=plan.nodes.find(n=>n.id===wall.toNodeId)!.point
   assert.ok(o.symbol?.kind==='door'&&o.width.kind==='approximate'&&o.centreOffset.kind==='approximate')
   const len=Math.hypot(b.x-a.x,b.y-a.y),ux=(b.x-a.x)/len,uy=(b.y-a.y)/len,high=o.symbol.hingeEnd==='high',hinge=o.centreOffset.value+(high?1:-1)*o.width.value/2,side=o.symbol.swingSide==='left'?1:-1
   const boxes=design.rooms[level].find(r=>r.id===target[o.id])!.boxes
   for(let step=0;step<=24;step++)for(let rad=1;rad<=8;rad++){
    const angle=step*Math.PI/48,radius=o.width.value*rad/8,along=hinge+(high?-1:1)*radius*Math.cos(angle),normal=side*radius*Math.sin(angle),x=a.x+ux*along-uy*normal,y=a.y+uy*along+ux*normal
    assert.ok(boxes.some(b=>x>=b.x-1&&x<=b.x+b.width+1&&y>=b.y-1&&y<=b.y+b.depth+1),`${o.id} leaves destination`)
    for(const f of occupied)assert.ok(!(x>f.x+1&&x<f.x+f.width-1&&y>f.y+1&&y<f.y+f.depth-1),`${o.id} hits ${f.id}`)
   }
  }
 }
})
