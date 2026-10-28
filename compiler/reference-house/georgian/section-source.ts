import {mm} from '../../units.js'
import type {AdeProvenance} from '../../architectural-drawing/model.js'
import type {SectionLayer,SectionWall,SectionFloor} from '../../architectural-drawing/section-assemblies.js'
import {sectionAt} from './sections-roof-01.js'

/** House-owned provisional representation decisions, never engine defaults. */
export const sectionAssemblyChoices={
 id:'RH-SECTION-ASSEMBLIES-01',
 layers:{weather:102.5,cavity:160,innerIncludingFinish:155},
 headZone:200,substructureDrawingDepth:600,supportEnvelope:{projection:200,height:250},
 floor:{finish:20,deck:22,joist:238,void:55,ceiling:15,endGap:25,seatProjection:100,seatDepth:40},
 roofCeiling:{top:6690,member:125,lining:15,deck:22},minimumBoundarySpacingMm:.25,
 foundationTypeSelected:false,foundationDepthSelected:false,lintelDesignSelected:false
} as const
export const sectionProvenance:AdeProvenance={sourceIds:['docs/publication/architectural-plate-section-assemblies.md'],authority:'provisional',precision:'approximate'}
const layer=(id:string,depth:number,fill:SectionLayer['fill'],stroke:SectionLayer['stroke']='secondary',kind:SectionLayer['kind']='material'):SectionLayer=>({id,thickness:{kind:'approximate',value:mm(depth)},fill,stroke,kind})
export function sectionAssemblyModels(m:ReturnType<typeof sectionAt>,topAt:(x:number)=>number,options:{firstFloorRuns?:number[][];storageDeckRuns?:number[][]}={}):{walls:SectionWall[];floors:SectionFloor[]}{
 const c=sectionAssemblyChoices
 const layers=[layer('weather',c.layers.weather,'context','primary'),layer('cavity',c.layers.cavity,'none','secondary','void'),layer('inner',c.layers.innerIncludingFinish,'faint','primary')]
 const walls:SectionWall[]=m.walls.map((w,i)=>({id:w.id,left:w.lo,exteriorFace:i===0||i===2?'left':'right',layers,base:0,top:[topAt(w.lo),topAt(w.hi)],
  openings:w.holes.map(h=>({id:h.id,bottom:h.lo,top:h.hi,head:{depth:c.headZone,layerIds:['weather','inner'],closeCavity:true}})),
  substructure:{bottom:-c.substructureDrawingDepth,reservationProjection:c.supportEnvelope.projection,reservationHeight:c.supportEnvelope.height},provenance:sectionProvenance}))
 const firstRuns=options.firstFloorRuns??m.floorRuns
 const floors:SectionFloor[]=firstRuns.map(([left,right],i)=>(
  {id:'first-floor-'+i,left,right,top:3450,layers:[
   {...layer('finish',c.floor.finish,'faint'),endGap:0},
   {...layer('deck',c.floor.deck,'faint'),endGap:0},
   {...layer('joist',c.floor.joist,'none','profile'),endGap:c.floor.endGap},
   {...layer('service-void',c.floor.void,'none','secondary','void'),endGap:0},
   {...layer('ceiling',c.floor.ceiling,'faint'),endGap:0}],
   seats:{underLayerId:'joist',projection:c.floor.seatProjection,depth:c.floor.seatDepth},provenance:sectionProvenance}))
 floors.push(...m.floorRuns.map(([left,right],i)=>({id:'roof-ceiling-'+i,left,right,top:c.roofCeiling.top,layers:[
   {...layer('member',c.roofCeiling.member,'none'),endGap:c.floor.endGap},
   {...layer('lining',c.roofCeiling.lining,'faint'),endGap:0}],provenance:sectionProvenance})))
 for(const [i,[left,right]]of (options.storageDeckRuns??[[1000,3200],[8800,11000]]).entries())floors.push({id:'storage-deck-'+i,left,right,top:c.roofCeiling.top+c.roofCeiling.deck,layers:[{...layer('deck',c.roofCeiling.deck,'faint'),endGap:0}],provenance:sectionProvenance})
 const ordered=options.firstFloorRuns?floors:m.floorRuns.flatMap((_,i)=>[floors[i],floors[m.floorRuns.length+i]]).concat(floors.slice(m.floorRuns.length*2))
 return {walls,floors:ordered}
}
