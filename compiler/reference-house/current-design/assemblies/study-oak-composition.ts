import { sha256SemanticFingerprint } from '../../../core/identity.js'

type Box=readonly[number,number,number,number]
type Axis='x'|'y'
export interface StudyOakComposition {
  readonly schema:'ias-study-oak-composition/1'
  readonly pattern:'straight-grain'|'basket-weave'
  readonly fieldGrainAxis:Axis
  readonly fieldColour:string
  readonly borderColour:string
  readonly grainColour:string
  readonly borderWidthMm:60|75|90
  readonly grainSpacingMm:number
  readonly grainOpacity:number
}

export function admitStudyOakComposition(value:unknown):StudyOakComposition{
  const v=value as Record<string,unknown>
  const fields=['schema','pattern','fieldGrainAxis','fieldColour','borderColour','grainColour','borderWidthMm','grainSpacingMm','grainOpacity']
  if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==fields.length||Object.keys(v).some(k=>!fields.includes(k))
    ||v.schema!=='ias-study-oak-composition/1'||!['straight-grain','basket-weave'].includes(String(v.pattern))
    ||!['x','y'].includes(String(v.fieldGrainAxis))||!['fieldColour','borderColour','grainColour'].every(k=>typeof v[k]==='string'&&/^#[0-9a-f]{6}$/.test(v[k] as string))
    ||![60,75,90].includes(Number(v.borderWidthMm))||typeof v.borderWidthMm!=='number'
    ||typeof v.grainSpacingMm!=='number'||!Number.isFinite(v.grainSpacingMm)||v.grainSpacingMm<12||v.grainSpacingMm>60
    ||typeof v.grainOpacity!=='number'||!Number.isFinite(v.grainOpacity)||v.grainOpacity<0||v.grainOpacity>.25)throw new TypeError('INVALID_STUDY_OAK_COMPOSITION')
  return v as unknown as StudyOakComposition
}
const area=(b:Box)=>(b[2]-b[0])*(b[3]-b[1])
const intersect=(a:Box,b:Box):Box|undefined=>{const c:Box=[Math.max(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.min(a[3],b[3])];return c[0]<c[2]&&c[1]<c[3]?c:undefined}
function subtract(a:Box,b:Box):Box[]{
  const c=intersect(a,b);if(!c)return[a]
  const pieces:Box[]=[[a[0],a[1],c[0],a[3]],[c[2],a[1],a[2],a[3]],[c[0],a[1],c[2],c[1]],[c[0],c[3],c[2],a[3]]]
  return pieces.filter(b=>b[0]<b[2]&&b[1]<b[3])
}

/** Actual room perimeter, with shared internal band edges cancelled. No second room. */
function boundary(bands:readonly Box[]){
  return bands.flatMap((b,i)=>[
    {axis:'x' as const,at:b[1],from:b[0],to:b[2],normal:1},
    {axis:'x' as const,at:b[3],from:b[0],to:b[2],normal:-1},
    {axis:'y' as const,at:b[0],from:b[1],to:b[3],normal:1},
    {axis:'y' as const,at:b[2],from:b[1],to:b[3],normal:-1},
  ].flatMap(edge=>{
    const neighbours=bands.filter((_,j)=>j!==i).filter(n=>edge.axis==='x'?n[edge.normal===1?3:1]===edge.at:n[edge.normal===1?2:0]===edge.at)
    const intervalAxis=edge.axis==='x'?0:1
    const ranges=neighbours.reduce<number[][]>((ranges,n)=>ranges.flatMap(([a,z])=>{
      const l=Math.max(a!,n[intervalAxis]),r=Math.min(z!,n[intervalAxis+2]);return l<r?[[a!,l],[r,z!]].filter(([l,r])=>l!<r!):[[a!,z!]]
    }),[[edge.from,edge.to]])
    return ranges.map(([from,to])=>({...edge,from:from!,to:to!}))
  }))
}

type Part={readonly id:string;readonly facePieces:readonly Box[]}
export function compileStudyOakComposition(input:StudyOakComposition,parts:readonly Part[],bands:readonly Box[],origin:readonly[number,number],pitchMm:number){
  const edges=boundary(bands),borderStrips=edges.map(edge=>{
    const end=edge.at+input.borderWidthMm*edge.normal
    const box:Box=edge.axis==='x'?[edge.from,Math.min(edge.at,end),edge.to,Math.max(edge.at,end)]
      :[Math.min(edge.at,end),edge.from,Math.max(edge.at,end),edge.to]
    return{box,axis:edge.axis}
  })
  const components=parts.map(part=>{
    const zones=part.facePieces.flatMap((face,faceIndex)=>{
      let field:Box[]=[face]
      const border=borderStrips.flatMap((strip,index)=>{
        const hits=field.flatMap(piece=>{const box=intersect(piece,strip.box);return box?[{id:`${part.id}/finish/${faceIndex}/border/${index}`,box,role:'perimeter' as const,grainAxis:strip.axis,colour:input.borderColour}]:[]})
        field=field.flatMap(piece=>subtract(piece,strip.box));return hits
      })
      const blocks=field.flatMap(piece=>{
        const columns=[Math.floor((piece[0]-origin[0])/pitchMm),Math.ceil((piece[2]-origin[0])/pitchMm)]
        const rows=[Math.floor((piece[1]-origin[1])/pitchMm),Math.ceil((piece[3]-origin[1])/pitchMm)]
        const out:{id:string;box:Box;role:'field';grainAxis:Axis;colour:string}[]=[]
        for(let x=columns[0]!;x<columns[1]!;x++)for(let y=rows[0]!;y<rows[1]!;y++){
          const box=intersect(piece,[origin[0]+x*pitchMm,origin[1]+y*pitchMm,origin[0]+(x+1)*pitchMm,origin[1]+(y+1)*pitchMm]);if(!box)continue
          const flip=input.pattern==='basket-weave'&&Math.abs(x+y)%2===1
          out.push({id:`${part.id}/finish/${faceIndex}/field/${x}/${y}/${out.length}`,box,role:'field',
            grainAxis:flip?(input.fieldGrainAxis==='x'?'y':'x'):input.fieldGrainAxis,colour:input.fieldColour})
        }return out
      })
      return[...border,...blocks]
    })
    if(Math.abs(zones.reduce((s,z)=>s+area(z.box),0)-part.facePieces.reduce((s,b)=>s+area(b),0))>1e-6)throw new Error('STUDY_OAK_COMPOSITION_LOST_ACTUAL_FACE_AREA')
    return{partId:part.id,facePieces:part.facePieces,zones}
  })
  return{schema:'ias-study-oak-finish-schedule/1' as const,input,digest:sha256SemanticFingerprint({input,components,origin,pitchMm}),
    compositionDatum:{originXYMm:origin,blockPitchMm:pitchMm,borderFollowsActualRoomPerimeter:true},components,
    actualPartCount:parts.length,physicalCutsAdded:0,claims:{materialSelected:false,workshopFabricationQualified:false,installedAcceptance:false,ownerAcceptance:false}}
}
