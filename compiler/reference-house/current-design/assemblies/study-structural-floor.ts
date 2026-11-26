import type { StudyStructuralContext } from './study-structural-context.js'

type Box=readonly[number,number,number,number]
type Part={readonly id:string;readonly band:number;readonly box:Box;readonly face:Box;readonly sizeMm:readonly[number,number];readonly role:'border'|'field';readonly wearFaceKg:number;readonly occupied:readonly string[];readonly grip:{readonly centres:readonly (readonly[number,number])[];readonly endMarginMm:number}|null}
type Layout<P extends Part>={readonly parts:readonly P[];readonly emitterPlinth:{readonly state:string;readonly box?:Box;readonly[other:string]:unknown}}
export type StructuralPart<P extends Part>=P&{readonly structuralFacePieces?:readonly Box[];readonly structuralStockPieces?:readonly Box[];readonly structuralSourcePartIds?:readonly string[]}
const area=([a,b,c,d]:Box)=>(c-a)*(d-b)
const overlap=(a:Box,b:Box)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1]
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b)
const intersect=(a:Box,b:Box):Box|undefined=>{const r:Box=[Math.max(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.min(a[3],b[3])];return area(r)>0&&r[2]>r[0]&&r[3]>r[1]?r:undefined}
const inset=(b:Box,s:number):Box=>[b[0]+s,b[1]+s,b[2]-s,b[3]-s]
const expand=(b:Box,s:number):Box=>inset(b,-s)
function subtract(box:Box,reserve:Box):Box[]{
  if(!overlap(box,reserve))return[box]
  const[a,b,c,d]=box,[x,y,z,w]=reserve,l=Math.max(a,x),r=Math.min(c,z),bottom=Math.max(b,y),top=Math.min(d,w)
  return([[a,b,l,d],[r,b,c,d],[l,b,r,bottom],[l,top,r,d]]as Box[]).filter(([a,b,c,d])=>a<c&&b<d)
}
function coalesce(input:readonly Box[]):Box[]{
  const out=[...input];let change=true
  while(change){change=false;outer:for(let i=0;i<out.length;i++)for(let j=i+1;j<out.length;j++){
    const a=out[i]!,b=out[j]!,vertical=a[0]===b[0]&&a[2]===b[2]&&(a[3]===b[1]||b[3]===a[1]),horizontal=a[1]===b[1]&&a[3]===b[3]&&(a[2]===b[0]||b[2]===a[0])
    if(vertical||horizontal){out.splice(j,1);out.splice(i,1,[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[2],b[2]),Math.max(a[3],b[3])]);change=true;break outer}
  }}return out
}
function connected(boxes:readonly Box[]){
  const seen=new Set<number>([0]);let change=true
  while(change){change=false;for(let i=0;i<boxes.length;i++)if(!seen.has(i))for(const j of seen){const a=boxes[i]!,b=boxes[j]!,vertical=(a[2]===b[0]||b[2]===a[0])&&Math.min(a[3],b[3])>Math.max(a[1],b[1]),horizontal=(a[3]===b[1]||b[3]===a[1])&&Math.min(a[2],b[2])>Math.max(a[0],b[0]);if(vertical||horizontal){seen.add(i);change=true;break}}}
  return seen.size===boxes.length
}
const contains=(boxes:readonly Box[],x:number,y:number)=>boxes.some(b=>x>=b[0]&&x<=b[2]&&y>=b[1]&&y<=b[3])
function keys(boxes:readonly Box[]){
  const candidates=[...boxes].sort((a,b)=>area(b)-area(a))
  for(const[a,b,c,d]of candidates){const w=c-a,h=d-b;if(Math.max(w,h)<140||Math.min(w,h)<40)continue
    const x=(a+c)/2,y=(b+d)/2,centres=w>h?[[x-50,y],[x+50,y]]as const:[[x,y-50],[x,y+50]]as const
    return{centres,endMarginMm:(Math.max(w,h)-100)/2}
  }return null
}

/** Preserve the existing world-coordinate300mm set-out. Only actual cuts and fragile border pieces change. */
export function clipStudyStructuralFloor<P extends Part,E extends Layout<P>['emitterPlinth']>(layout:{readonly parts:readonly P[];readonly emitterPlinth:E},context:StudyStructuralContext,jointMm:number){
  const density=layout.parts[0]!.wearFaceKg/area(layout.parts[0]!.face),gap=jointMm/2,emitter=layout.emitterPlinth.box
  const stock=(box:Box)=>coalesce(context.bands.flatMap(b=>{const p=intersect(box,b);return p?[p]:[]}).flatMap(p=>emitter?subtract(p,emitter):[p]))
  const faces=(box:Box)=>coalesce(context.finishReservations.reduce<Box[]>((parts,b)=>parts.flatMap(p=>subtract(p,expand(b,gap))),[inset(box,gap)]).flatMap(p=>emitter?subtract(p,expand(emitter,gap)):[p]))
  const build=(original:P,box:Box,sourceIds:readonly string[],merged=false):StructuralPart<P>=>{
    const s=stock(box),tight:Box=[Math.min(...s.map(b=>b[0])),Math.min(...s.map(b=>b[1])),Math.max(...s.map(b=>b[2])),Math.max(...s.map(b=>b[3]))],f=faces(tight),grip=!merged&&original.grip&&original.grip.centres.every(([x,y])=>contains(f,x,y))?original.grip:keys(f)
    return{...original,id:merged?`GROUND/G-STUDY/room-kit/floor/structural-SW/${tight[0]}/${tight[1]}`:original.id,box:tight,face:inset(tight,gap),sizeMm:[tight[2]-tight[0]-jointMm,tight[3]-tight[1]-jointMm],role:'border',
      wearFaceKg:f.reduce((sum,b)=>sum+area(b),0)*density,grip,structuralFacePieces:f,structuralStockPieces:s,structuralSourcePartIds:sourceIds}
  }
  const parts:StructuralPart<P>[]=layout.parts.flatMap(p=>{
    const s=stock(p.box);if(!s.length)return[]
    const f=faces(p.box),unchanged= s.length===1&&same(s[0],p.box)&&f.length===1&&same(f[0],p.face)
    return[unchanged?p:build(p,p.box,[p.id])]
  })
  const fragile=(part:StructuralPart<P>)=>!part.grip||(part.structuralFacePieces??[part.face]).some(b=>Math.min(b[2]-b[0],b[3]-b[1])<40)
  const mergedGroups:{readonly id:string;readonly sourceIds:readonly string[]}[]=[]
  for(let attempt=0;attempt<layout.parts.length;attempt++){
    const bad=parts.find(fragile);if(!bad)break
    const candidates=parts.filter(p=>p!==bad).flatMap(p=>{
      let group=[bad,p],box:Box=[Math.min(p.box[0],bad.box[0]),Math.min(p.box[1],bad.box[1]),Math.max(p.box[2],bad.box[2]),Math.max(p.box[3],bad.box[3])]
      // A border may absorb all stock inside one bounded cut piece; do not
      // leave a10mm tongue solely because the computational cells were split.
      for(let iteration=0;iteration<parts.length;iteration++){
        const next=parts.filter(v=>(v.structuralStockPieces??[v.box]).some(b=>overlap(b,box)))
        const grown:Box=[Math.min(...next.map(v=>v.box[0])),Math.min(...next.map(v=>v.box[1])),Math.max(...next.map(v=>v.box[2])),Math.max(...next.map(v=>v.box[3]))]
        group=next;if(same(grown,box))break;box=grown
      }
      if(Math.max(box[2]-box[0],box[3]-box[1])>600)return[]
      const oldArea=group.reduce((sum,v)=>sum+(v.structuralStockPieces??[v.box]).reduce((s,b)=>s+area(b),0),0),newArea=stock(box).reduce((sum,b)=>sum+area(b),0)
      if(Math.abs(oldArea-newArea)>1e-6)return[]
      if(!connected(stock(box)))return[]
      const combined=build(p,box,[...new Set(group.flatMap(v=>v.structuralSourcePartIds??[v.id]))].sort(),true)
      return[{group,combined,score:(fragile(combined)?1e9:0)+area(box)}]
    }).sort((a,b)=>a.score-b.score)
    const chosen=candidates[0];if(!chosen)break
    for(const part of chosen.group)parts.splice(parts.indexOf(part),1)
    parts.push(chosen.combined)
    mergedGroups.push({id:chosen.combined.id,sourceIds:chosen.combined.structuralSourcePartIds!})
  }
  const remainingFragile=parts.filter(fragile).map(p=>p.id)
  const stockAreaMm2=parts.reduce((sum,p)=>sum+(p.structuralStockPieces??[p.box]).reduce((s,b)=>s+area(b),0),0)
  const floorAreaMm2=context.bands.reduce((sum,b)=>sum+area(b),0),emitterAreaMm2=emitter?area(emitter):0
  if(Math.abs(stockAreaMm2+emitterAreaMm2-floorAreaMm2)>1e-6)throw new Error('STUDY_STRUCTURAL_FLOOR_STOCK_COVERAGE_FAILED')
  return{...layout,parts,structuralFloor:{contextDigest:context.digest,stockAreaMm2,finishedRoomAreaMm2:floorAreaMm2,emitterAreaMm2,mergedGroups,remainingFragile,
    proofState:remainingFragile.length?'GEOMETRY_REJECTED':'CUT_STOCK_RECOMPUTED',ordinaryRenewalRevalidated:false,physicalAcceptance:false}}
}
