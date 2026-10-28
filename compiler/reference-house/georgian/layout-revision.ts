import {design as held} from './section-exemplar.js'
import {openings as heldOpenings,type Room,type Wall,type Opening} from './source.js'
import {createGeorgianPlan} from './plan.js'
import {compileArchitecturalPlanScene} from '../../architectural-drawing/compile-plan.js'
import {returnStairToDrawingPrimitives} from '../../architectural-drawing/stair-drawing.js'
import {createPlanPaperProjection} from '../../publication-drawing/projection.js'
import {mm} from '../../units.js'
import type {DrawingSceneV2} from '../../publication-drawing-v2/model.js'
const room=(id:string,label:string,x:number,y:number,width:number,depth:number,at:[number,number]):Room=>({id,label,boxes:[{x,y,width,depth}],at})
const wall=(id:string,x:number,y:number,xx:number,yy:number):Wall=>({id,a:[x,y],b:[xx,yy]})
export const layoutRevision=structuredClone(held)
const d=layoutRevision
d.id='RH-LAYOUT-REVISION-02'
d.court={x:4250,y:4250,width:3500,depth:3500}
d.roof.ridgeInset=2125
d.stair={...d.stair,x:417.5,y:3832.5,width:2400,length:4335,flight:1100,well:200,landing:1635}
d.rooms.GROUND=[{id:'G-STUDY',label:'Study',boxes:[{x:0,y:0,width:4800,depth:1200},{x:0,y:1200,width:3400,depth:1450}],at:[1800,1850]},room('G-CLOAK','Cloak',3400,1200,1400,1450,[4100,2250]),room('G-WC','Guest WC',7200,0,2300,2650,[8500,1600]),room('G-UTILITY','Utility',9500,0,2500,2550,[10800,1750]),room('G-PLANT','Plant room',9500,2550,2500,4100,[10800,4800]),room('G-PANTRY','Pantry',9500,6650,2500,1455,[10900,7500]),room('G-KITCHEN','Kitchen',8167.5,8167.5,3832.5,3832.5,[10100,10000]),room('G-FAMILY','Family / dining',0,8167.5,8167.5,3832.5,[4500,10200])]
d.rooms.FIRST=[room('U-BED2','Bedroom 2',0,0,4800,2650,[2500,2300]),room('U-BED3','Bedroom 3',7200,0,4800,2650,[10500,2300]),room('U-ENS3','En suite',9500,2650,2500,1200,[8750,3300]),room('U-BATH','Bathroom',9500,3850,2500,2650,[10900,6000]),room('U-ENSP','En suite',9500,6500,2500,1730,[10900,7350]),room('U-BED4','Bedroom 4',0,8230,6000,3770,[3500,10300]),room('U-WIC','Walk-in',6000,8230,2000,2000,[7000,10600]),{id:'U-PRINCIPAL',label:'Principal',boxes:[{x:8000,y:8230,width:4000,depth:2000},{x:6000,y:10230,width:6000,depth:1770}],at:[9500,9000]}]
d.partitions.GROUND=[wall('study-east',4800,0,4800,1200),wall('study-north',0,2650,3400,2650),wall('cloak-west',3400,1200,3400,2650),wall('cloak-south',3400,1200,4800,1200),wall('cloak-east',4800,1200,4800,2650),wall('cloak-north',3400,2650,4800,2650),wall('wc-west',7200,0,7200,2650),wall('wc-north',7200,2650,9500,2650),wall('service-spine',9500,0,9500,8105),wall('utility-north',9500,2550,12000,2550),wall('plant-north',9500,6650,12000,6650),wall('pantry-north',9500,8105,12000,8105)]
d.partitions.FIRST=[wall('bed2-east',4800,0,4800,2650),wall('bed2-north',0,2650,4800,2650),wall('bed3-west',7200,0,7200,2650),wall('bed3-north',7200,2650,12000,2650),wall('wet-spine',9500,2650,9500,8230),wall('small-ensuite-north',9500,3850,12000,3850),wall('bath-north',9500,6500,12000,6500),wall('rear-split-west',0,8230,4250,8230),wall('rear-split-east',7750,8230,12000,8230),wall('bed4-east',6000,8230,6000,12000),wall('wardrobe-east',8000,8230,8000,10230),wall('wardrobe-north',6000,10230,8000,10230)]
d.furniture={...d.furniture,studyDesk:{x:600,y:600,width:1600,depth:700},studyChair:{x:1000,y:1400,width:1000,depth:900},cloakHanging:{x:3537.5,y:1337.5,width:1125,depth:600},bed2:{x:700,y:600,width:2000,depth:1500},bed3:{x:9400,y:600,width:2000,depth:1500},bed4:{x:600,y:9600,width:2000,depth:1500},principal:{x:9000,y:9500,width:1600,depth:2000},wardrobeWest:{x:6062.5,y:8500,width:600,depth:1000},wardrobeEastNorth:{x:6062.5,y:9567.5,width:1875,depth:600},wardrobeEastSouth:{x:6062.5,y:8350,width:600,depth:150}}
d.wetFit={guestPan:{x:9000,y:600,width:400,depth:650},guestBasin:{x:7337.5,y:600,width:400,depth:400}}
d.services={...d.services,riser:{x:9862.5,y:4500,width:550,depth:700},upperLining:{x:9862.5,y:2762.5,width:250,depth:5405},plantDry:{x:9862.5,y:5400,width:500,depth:1000},plantWorking:{x:10662.5,y:2800,width:920,depth:3700},guestEnsuiteBranch:[[10900,3450],[10100,3450],[10100,4850]],panels:[{level:'FIRST',x:9500,y:3450,width:700},{level:'FIRST',x:9500,y:4750,width:700},{level:'FIRST',x:9500,y:7350,width:900}]}
export const entryVoid={x:4862.5,y:417.5,width:2275,depth:2295,guardHeightSelected:false}
const op=(id:string,wall:string,centre:number,width=900,swing:'left'|'right'='left',hinge:'low'|'high'='low',leaves:1|2=1):Opening=>({id,wall,centre,width,kind:'door',swing,hinge,leaves})
export function revisionOpenings(level:'GROUND'|'FIRST'):Opening[]{
 const a=heldOpenings(level).filter(o=>o.wall.startsWith('outer-')&&o.wall!=='outer-north')
 for(const [i,c]of d.frontAxes.entries()){if(level==='FIRST'&&i===2)continue;a.push(level==='GROUND'&&i===2?op('garden-entry','outer-north',6000,2400,'right','low',2):{id:'north-window-'+i,wall:'outer-north',centre:c,width:1000,kind:'window'})}
 for(const side of ['south','north','east','west']){
  if(level==='GROUND'&&(side==='south'||side==='north')){a.push(op('grand-court-entry-'+side,'court-'+side,6000,2400,side==='south'?'left':'right','low',2));continue}
  for(const [i,c]of [5150,6850].entries())a.push({id:`court-${side}-${i}`,wall:'court-'+side,centre:c,width:1000,kind:'window'})
 }
 if(level==='GROUND')a.push(op('study-door','study-north',2850,900,'right'),op('cloak-door','cloak-east',2100,800,'right','high'),op('wc-door','wc-north',8100,900,'left'),op('utility-door','service-spine',1500,900,'right'),op('plant-door','service-spine',3200,900,'right'),op('pantry-door','pantry-north',10900,900,'left','high'))
 else a.push(op('bed2-door','bed2-north',3900,900,'right'),op('bed3-door','bed3-north',8700,900,'right'),op('ensuite3-door','bed3-north',10900),op('family-bath-door','wet-spine',5900,900,'right'),op('principal-ensuite-door','rear-split-east',10900),op('principal-door','rear-split-east',8800,1000),op('bed4-door','rear-split-west',3300,900,'left'),op('wardrobe-door','wardrobe-east',9000))
 return a
}
const provenance={authority:'provisional' as const,precision:'approximate' as const,sourceIds:['docs/reference-house/layout-revision-02.md',d.id]}
export const createRevisionPlan=(level:'GROUND'|'FIRST')=>createGeorgianPlan(level,{design:d,openings:revisionOpenings(level),provenance})
export function createRevisionScene(level:'GROUND'|'FIRST',scale:100|50):DrawingSceneV2{
 const origin=scale===100?{x:22,y:20}:{x:90,y:150},p=createPlanPaperProjection({scaleDenominator:scale,modelBounds:{x:0,y:0,width:12000,height:12000},paperOrigin:origin})
 const scene=compileArchitecturalPlanScene(createRevisionPlan(level),{title:level,profile:{id:'LAYOUT-REVISION',output:scale===100?'BOOK':'WALL',scaleDenominator:scale},projection:p,widthMm:scale===100?145:420,heightMm:scale===100?190:594,resolveAssemblyThicknessMm:a=>mm(a.id==='RH-ADE-ENVELOPE'?417.5:125),resolveLayerThicknessMm:l=>{if('value' in l.thickness)return l.thickness.value;if(l.thickness.kind==='range'&&l.thickness.min<=160&&l.thickness.max>=160)return mm(160);throw Error('Unknown layer')},abutments:{'RH-PART-DRY-01':['RH-ADE-ENVELOPE']},wallRegionIds:'assembly-qualified',openingSide:()=> 'right',layerBoundaryOpacity:.45,dimensionOptions:{annotationSide:'right',offsetPaperMm:18}})
 const line=(id:string,x:number,y:number,xx:number,yy:number,dash?:'provisional'|'overhead')=>scene.primitives.push({kind:'line',id,a:p.point(x,y),b:p.point(xx,yy),role:'secondary',dash,metadata:{sources:provenance.sourceIds.join(','),authority:'provisional'}})
 const text=(id:string,x:number,y:number,value:string,role:'note'|'label'|'marker'='note')=>scene.primitives.push({kind:'text',id,...p.point(x,y),value,role,anchor:'middle'})
 const s=d.stair
 scene.primitives.push(...returnStairToDrawingPrimitives({kind:'return-stair',id:'REVISION-STAIR-'+level,origin:{x:mm(0),y:mm(0)},riserCount:s.risers,floorToFloor:mm(s.floorRise),going:mm(s.going),clearWidth:mm(s.flight),landingDepth:mm(s.landing),wellGap:mm(s.well),cutHeight:mm(1200),level,provenance},{...p,point:(x,y)=>p.point(s.x+y,s.y+s.length-x)}))
 text('west-gallery',3300,6000,'Gallery');const gallery=scene.primitives.at(-1);if(gallery?.kind==='text')gallery.rotateDeg=-90
 text('east-gallery',8750,5500,'Gallery');const east=scene.primitives.at(-1);if(east?.kind==='text')east.rotateDeg=-90
 text('north',10800,12600,'N ↑','marker')
 if(level==='FIRST'){
  line('wardrobe-label-leader',7000,10450,7000,10000);line('ensuite-label-leader',9200,3350,9700,3350);
  const v=entryVoid;line('void-guard',v.x,v.y+v.depth,v.x+v.width,v.y+v.depth);line('void-diagonal',v.x,v.y,v.x+v.width,v.y+v.depth,'overhead')
  text('void-label',6000,1700,'Open to hall','label');text('landing-label',6000,3250,'Bridge','note')
  for(const id of ['bed2','bed3','bed4','principal'] as const){const b=d.furniture[id];const q=p.rect({x:b.x,y:b.y,width:b.width,height:b.depth});scene.primitives.push({kind:'rect',id:id+'-bed',...q,stroke:'secondary',fill:'none'})}
 }else text('hall-label',6200,1400,'Entrance hall','label')
 text('scope',6000,-700,level==='FIRST'?'Entry void and bridge provisional; guarding / fire strategy unresolved':'Courtyard doors at both ends; centred front-to-garden route')
 text('clearances',6000,-1150,'West gallery 1015 mm / stair flights 1100 mm / landing 1635 mm')
 const yy=-1900;line('scale',9000,yy,12000,yy);for(let i=0;i<4;i++)line('tick-'+i,9000+i*1000,yy-100,9000+i*1000,yy+100)
 text('bar',10500,yy-450,'3 m');text('scale-label',700,yy,`1:${scale}`,'marker')
 scene.sourceId=d.id;scene.viewId=`LAYOUT-REVISION-${level}-${scale}`;return scene
}
