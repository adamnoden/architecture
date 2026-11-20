import type {compileFixedInletCandidate} from './inlet-fixed-entry.js'
import type {compareCurrentFixedInletSupport} from './inlet-fixed-support-integration.js'
import type {compareFixedInletWetSupport} from './inlet-fixed-wet-support.js'
import {fixedInletReceiverFacts} from './inlet-fixed-receiver.js'
import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {exactSegmentBoxDistance,finiteBends} from '../../../project/had/studies/incoming-water-geometry.mjs'

type Candidate=ReturnType<typeof compileFixedInletCandidate>
type Support=ReturnType<typeof compareCurrentFixedInletSupport>
type Wet=ReturnType<typeof compareFixedInletWetSupport>
type P=readonly [number,number,number]
type B=readonly [number,number,number,number,number,number]
type Section={a:number;iy:number;iz:number;j:number;y:number;z:number;t:number}
type Node={id:string;p:P;restrained:number[]}
type Member={id:string;a:number;b:number;pa:P;pb:P;s:Section;body:B;leg:number;massKg:number}
type Load={id:string;node:number;force:P;moment:P;bound:boolean;correlatedGroup?:string}
type SpatialSources={hot:string;bowl:string;services:string;cells:string}
const spatialPaths={hot:'project/had/studies/utility-wide-capture.json',bowl:'project/had/studies/utility-dry-bowl-release.json',services:'project/had/studies/current-house-services.json',cells:'project/had/studies/south-inlet-wet-box.json'} as const
const r=(n:number)=>Number(n.toFixed(6))||0
const sub=(a:readonly number[],b:readonly number[])=>a.map((n,i)=>n-b[i])
const cross=(a:readonly number[],b:readonly number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const dot=(a:readonly number[],b:readonly number[])=>a.reduce((n,v,i)=>n+v*b[i],0)
const zero=(n:number)=>Array.from({length:n},()=>Array<number>(n).fill(0))
const gap=(a:readonly number[],b:readonly number[])=>Math.max(...[0,1,2].map(i=>Math.max(b[i]-a[i]-a[i+3],a[i]-b[i]-b[i+3])))
const rhs=(y:number,z:number,t:number):Section=>({a:y*z-(y-2*t)*(z-2*t),iy:(y*z**3-(y-2*t)*(z-2*t)**3)/12,
  iz:(z*y**3-(z-2*t)*(y-2*t)**3)/12,j:4*((y-t)*(z-t))**2/(2*(y+z-2*t)/t),y,z,t})
const matvec=(a:readonly (readonly number[])[],b:readonly number[])=>a.map(row=>dot(row,b))
const polygon=(points:readonly (readonly number[])[])=>{
  const terms=points.map((p,i)=>p[0]*points[(i+1)%points.length][1]-points[(i+1)%points.length][0]*p[1]),twice=terms.reduce((n,v)=>n+v,0)
  return {area:twice/2,centre:[0,1].map(k=>points.reduce((n,p,i)=>n+(p[k]+points[(i+1)%points.length][k])*terms[i],0)/(3*twice))}
}
function factor(k:readonly (readonly number[])[]){
  const size=k.length,scale=k.map((row,i)=>Math.sqrt(row[i])),L=zero(size)
  if(scale.some(v=>!(v>0)))throw new Error('Shared frame has an unrestrained mode')
  for(let i=0;i<size;i++)for(let j=0;j<=i;j++){
    const value=k[i][j]/(scale[i]*scale[j])-L[i].slice(0,j).reduce((n,v,a)=>n+v*L[j][a],0)
    if(i===j){if(!(value>1e-13))throw new Error('Shared frame stiffness is not positive definite');L[i][j]=Math.sqrt(value)}else L[i][j]=value/L[j][j]
  }
  const triangular=(rhs:readonly number[])=>{
    const v=Array<number>(size).fill(0),out=Array<number>(size).fill(0)
    for(let i=0;i<size;i++)v[i]=(rhs[i]/scale[i]-L[i].slice(0,i).reduce((n,x,j)=>n+x*v[j],0))/L[i][i]
    for(let i=size-1;i>=0;i--)out[i]=(v[i]-L.slice(i+1).reduce((n,row,j)=>n+row[i]*out[i+j+1],0))/L[i][i]
    return out.map((n,i)=>n/scale[i])
  }
  return (f:readonly number[])=>{
    const u=triangular(f)
    for(let step=0;step<2;step++){const correction=triangular(sub(f,matvec(k,u)));for(let i=0;i<u.length;i++)u[i]+=correction[i]}
    const error=Math.max(...sub(matvec(k,u),f).map(Math.abs))
    if(error>1e-6*Math.max(1,...f.map(Math.abs)))throw new Error('Shared frame elastic solve residual')
    return u
  }
}
const solve=(k:readonly (readonly number[])[],f:readonly number[])=>factor(k)(f)
function element(member:Member,nodes:readonly Node[]){
  const delta=sub(member.pb,member.pa),length=Math.hypot(...delta),ex=delta.map(v=>v/length)
  const ey=Math.abs(ex[1])>.9?[0,0,1]:[0,1,0],ez=cross(ex,ey),axes=[ex,ey,ez],s=member.s,E=200000,G=E/2.6,k=zero(12),T=zero(12)
  const add=(indices:number[],values:number[][])=>indices.forEach((i,a)=>indices.forEach((j,b)=>k[i][j]+=values[a][b]))
  const pair=(indices:number[],v:number)=>add(indices,[[v,-v],[-v,v]])
  pair([0,6],E*s.a/length);pair([3,9],G*s.j/length)
  for(const [indices,EI,sign] of [[[1,5,7,11],E*s.iz,1],[[2,4,8,10],E*s.iy,-1]] as const){
    const A=12*EI/length**3,B=sign*6*EI/length**2,C=4*EI/length,D=2*EI/length
    add([...indices],[[A,B,-A,B],[B,C,-B,D],[-A,-B,A,-B],[B,D,-B,C]])
  }
  for(const [end,point,node] of [[0,member.pa,nodes[member.a]],[1,member.pb,nodes[member.b]]] as const){
    const d=sub(point,node.p),offset=[[0,d[2],-d[1]],[-d[2],0,d[0]],[d[1],-d[0],0]]
    for(let i=0;i<3;i++)for(let j=0;j<3;j++){
      T[end*6+i][end*6+j]=axes[i][j];T[end*6+3+i][end*6+3+j]=axes[i][j]
      T[end*6+i][end*6+3+j]=dot(axes[i],offset.map(row=>row[j]))
    }
  }
  const q=axes.map(axis=>-member.massKg*9.81/length*axis[2]),f=[q[0]*length/2,q[1]*length/2,q[2]*length/2,0,-q[2]*length**2/12,q[1]*length**2/12,
    q[0]*length/2,q[1]*length/2,q[2]*length/2,0,q[2]*length**2/12,-q[1]*length**2/12]
  const global=zero(12),kt=zero(12)
  for(let i=0;i<12;i++)for(let j=0;j<12;j++)for(let n=0;n<12;n++)kt[i][j]+=k[i][n]*T[n][j]
  for(let i=0;i<12;i++)for(let j=0;j<12;j++)for(let n=0;n<12;n++)global[i][j]+=T[n][i]*kt[n][j]
  return {k,T,global,f,globalF:Array.from({length:12},(_,i)=>f.reduce((n,v,j)=>n+T[j][i]*v,0)),length,axes}
}

export function sharedServiceFrameBeamReference(input:{spanMm:number;tipDownwardN:number;selfWeight:boolean;rootOffsetMm:P}){
  if(!(input.spanMm>0)||!Number.isFinite(input.tipDownwardN)||input.tipDownwardN<0)throw new Error('Positive finite beam reference span and nonnegative tip action required')
  const s=rhs(60,80,4),mass=input.selfWeight?s.a*input.spanMm*8000/1e9:0,nodes:Node[]=[{id:'root',p:input.rootOffsetMm,restrained:[0,1,2,3,4,5]},{id:'tip',p:[input.spanMm,0,0],restrained:[]}]
  const member:Member={id:'reference',a:0,b:1,pa:[0,0,0],pb:[input.spanMm,0,0],s,body:[0,-30,-40,input.spanMm,60,80],leg:4,massKg:mass},e=element(member,nodes)
  const f=[...e.globalF];f[8]-=input.tipDownwardN
  const u=[0,0,0,0,0,0,...solve(e.global.slice(6).map(row=>row.slice(6)),f.slice(6))],reaction=sub(matvec(e.global,u),f)
  return {massKg:mass,tipTranslationMm:u.slice(6,9),rootWrench:reaction.slice(0,6),section:s}
}

export function compareCurrentSharedFixedInletServiceFrame(candidate:Candidate,support:Support,wet:Wet,representedSubsystem:'both'|'pipe-only'|'wet-only'='both',anchorGaugeMm:160|200=200){
  const sources=Object.fromEntries(Object.entries(spatialPaths).map(([key,path])=>[key,readFileSync(new URL('../../../'+path,import.meta.url),'utf8')])) as SpatialSources
  return compareSharedFixedInletServiceFrame(candidate,support,wet,representedSubsystem,anchorGaugeMm,sources)
}

export function compareSharedFixedInletServiceFrame(candidate:Candidate,support:Support,wet:Wet,representedSubsystem:'both'|'pipe-only'|'wet-only'='both',anchorGaugeMm:160|200=200,spatialSources?:SpatialSources){
  if(candidate.source.caseDigest!==support.source.candidateCaseDigest||candidate.source.caseDigest!==wet.source.candidateCaseDigest)throw new Error('Shared service frame requires one actual candidate revision')
  const input=support.receivers.guidedRoute.sourceContext,axes=[...input.jambAxesXMm].sort((a,b)=>a-b),face=Math.max(...input.jambNormalFacesYMm)
  const guideZ=candidate.settings.upperPipeGuideZMm
  if(axes.length!==2||axes[1]-axes[0]!==1205||guideZ<1760||guideZ>2000)throw new Error('Reprove the shared frame outside its declared paired jamb and1760..2000guide domain')
  const steel=fixedInletReceiverFacts.steel,density=steel.densityKgM3/1e9,allowable=steel.comparisonProofStressMpa/1.5
  if(anchorGaugeMm!==160&&anchorGaugeMm!==200)throw new Error('Shared frame pad pitch requires its160 or200mm comparison')
  const padHeight=anchorGaugeMm+80,anchorRows=[730,1650].flatMap(z=>[z-anchorGaugeMm/2,z+anchorGaugeMm/2])
  const nodes:Node[]=[],members:Member[]=[],stock:{id:string;massKg:number;point:P;node:number;basis:string}[]=[],removableInterfaces:{id:string;memberId:string;node:number;point:P;axis:'Y'|'Z';body:B;reinforcement:B;bolts:P[];halfA:number;halfB:number}[]=[]
  const addNode=(id:string,p:P,restrained:number[]=[])=>{const i=nodes.length;nodes.push({id,p,restrained});return i}
  const addMember=(id:string,a:number,b:number,pa:P,pb:P,s:Section,body:B,leg=4)=>{
    const massKg=s.a*Math.hypot(...sub(pb,pa))*density
    members.push({id,a,b,pa,pb,s,body,leg,massKg});return members.at(-1)!
  }
  const transfer=(id:string,node:number,point:readonly number[],force:P,moment:P=[0,0,0],bound=false):Load=>{
    const moved=cross(sub(point,nodes[node].p),force)
    return {id,node,force,moment:moment.map((n,i)=>n+moved[i]) as unknown as P,bound}
  }
  const addStock=(id:string,massKg:number,point:P,node:number,basis='authored net geometry')=>stock.push({id,massKg,point,node,basis})
  const posts=axes.map((x,index)=>{
    const postX=x+(index===0?-65:65),byZ=new Map<number,number>()
    for(const z of [590,730,850,1450,1650,1790])byZ.set(z,addNode('jamb-'+index+'-'+z,z===730||z===1650?[x,face,z]:[postX,470,z],z===730||z===1650?[0,1,2,3,5]:[]))
    const levels=[...byZ.keys()]
    for(let i=1;i<levels.length;i++)addMember('jamb-post-'+index+'-'+levels[i],byZ.get(levels[i-1])!,byZ.get(levels[i])!,[postX,470,levels[i-1]],[postX,470,levels[i]],rhs(80,40,4),[postX-20,430,levels[i-1],40,80,levels[i]-levels[i-1]])
    const pads=[730,1650].map(z=>{
      const body:B=[x-95,face+11.5,z-padHeight/2,190,16,padHeight]
      addStock('wall-pad-'+index+'-'+z,190*16*padHeight*density,[x,face+19.5,z],byZ.get(z)!)
      addStock('toe-packing-'+index+'-'+z,2*20*padHeight*11.5*density,[x,face+5.75,z],byZ.get(z)!)
      return {bodyMm:body,toePackingBodiesMm:[[-95,20],[75,20]].map(([dx,w])=>[x+dx,face,z-padHeight/2,w,11.5,padHeight]),anchorPointsMm:[z-anchorGaugeMm/2,z+anchorGaugeMm/2].map(a=>[x,face,a]),fixtureMm:27.5,
        weldedPostRearContactMm:[postX-20,430,z-padHeight/2,40,0,padHeight],wallRotationYReleased:true}
    })
    return {axisXMm:postX,sourceJambAxisXMm:x,bodyMm:[postX-20,430,590,40,80,1200] as B,byZ,pads}
  })
  const stayXs=[9890,10460],loadXs=[...new Set([...stayXs,...input.branches.map(b=>b.pipeAxisXMm)])].sort((a,b)=>a-b)
  const rails=[850,1450].map(z=>{
    const map=new Map<number,number>(),start=posts[0].axisXMm+20,end=posts[1].axisXMm-20
    const stations=[start,...loadXs,end]
    for(const x of stations)map.set(x,x===start?posts[0].byZ.get(z)!:x===end?posts[1].byZ.get(z)!:addNode('rail-'+z+'-'+x,[x,460,z]))
    for(let i=1;i<stations.length;i++)addMember('backbone-rail-'+z+'-'+i,map.get(stations[i-1])!,map.get(stations[i])!,[stations[i-1],460,z],[stations[i],460,z],rhs(60,80,4),[stations[i-1],430,z-40,stations[i]-stations[i-1],60,80],6)
    return {z,map,bodyMm:[start,430,z-40,end-start,60,80] as B}
  })
  const pipeNodes=input.branches.map(b=>{
    const fixed=addNode(b.id+'-fixed',[b.pipeAxisXMm,b.riserYMm,850])
    addMember(b.id+'-fixed-removable-arm',rails[0].map.get(b.pipeAxisXMm)!,fixed,[b.pipeAxisXMm,526,850],[b.pipeAxisXMm,b.riserYMm-35,850],rhs(60,40,4),[b.pipeAxisXMm-20,526,820,40,b.riserYMm-561,60])
    const top=addNode(b.id+'-guide-post-top',[b.pipeAxisXMm,460,guideZ]),guide=addNode(b.id+'-guide',[b.pipeAxisXMm,b.riserYMm,guideZ])
    addMember(b.id+'-guide-post',rails[1].map.get(b.pipeAxisXMm)!,top,[b.pipeAxisXMm,460,1526],[b.pipeAxisXMm,460,guideZ],rhs(40,40,3),[b.pipeAxisXMm-20,440,1526,40,40,guideZ-1526])
    addMember(b.id+'-guide-removable-arm',top,guide,[b.pipeAxisXMm,480,guideZ],[b.pipeAxisXMm,b.riserYMm-35,guideZ],rhs(60,40,4),[b.pipeAxisXMm-20,480,guideZ-30,40,b.riserYMm-515,60])
    addStock(b.id+'-guide-post-cap',rhs(40,40,3).a*30*density,[b.pipeAxisXMm,460,guideZ+15],top)
    const fixedPlate:B=[b.pipeAxisXMm-50,510,810,100,16,80],fixedPad:B=[b.pipeAxisXMm-50,490,810,100,20,80]
    const guidePlate:B=[b.pipeAxisXMm-50,430,1510,100,80,16],guidePad:B=[b.pipeAxisXMm-50,430,1490,100,60,20]
    const joints=[{id:b.id+'-fixed-removable-joint',memberId:b.id+'-fixed-removable-arm',node:rails[0].map.get(b.pipeAxisXMm)!,point:[b.pipeAxisXMm,510,850] as P,axis:'Y' as const,body:fixedPlate,reinforcement:fixedPad,
      bolts:[-34,34].flatMap(dx=>[-25,25].map(dz=>[b.pipeAxisXMm+dx,510,850+dz] as P)),halfA:34,halfB:25},
      {id:b.id+'-guide-removable-joint',memberId:b.id+'-guide-post',node:rails[1].map.get(b.pipeAxisXMm)!,point:[b.pipeAxisXMm,460,1510] as P,axis:'Z' as const,body:guidePlate,reinforcement:guidePad,
        bolts:[-34,34].flatMap(dx=>[-17,17].map(dy=>[b.pipeAxisXMm+dx,460+dy,1510] as P)),halfA:34,halfB:17}]
    for(const j of joints){removableInterfaces.push(j);for(const [suffix,box] of [['plate',j.body],['reinforcement',j.reinforcement]] as const)addStock(j.id+'-'+suffix,box[3]*box[4]*box[5]*density,[box[0]+box[3]/2,box[1]+box[4]/2,box[2]+box[5]/2],j.node)}
    for(const m of support.compactReceiver.mass.ledger.filter(m=>m.id.startsWith(b.id+'-')&&!m.id.includes('-fixed-arm')&&!m.id.includes('-guide-arm')&&!m.id.includes('-guide-post'))){
      addStock(m.id,m.massUpperKg,m.pointMm as P,m.level===850?fixed:guide,m.basis)
    }
    return {branch:b.id,fixed,guide}
  })
  const lowWetZ=wet.branches[0].sourceFloorLowerFaceZMm-60,wetStayBottom=lowWetZ-30
  const stays=stayXs.map((x,index)=>{
    const map=new Map<number,number>(),zs=[wetStayBottom,lowWetZ,850,1450,1740,1760]
    for(const z of zs)map.set(z,addNode('wet-stay-'+index+'-'+z,[x,540,z]))
    for(let i=1;i<zs.length;i++)addMember('wet-stay-'+index+'-'+zs[i],map.get(zs[i-1])!,map.get(zs[i])!,[x,540,zs[i-1]],[x,540,zs[i]],rhs(40,40,4),[x-20,520,zs[i-1],40,40,zs[i]-zs[i-1]])
    for(const z of [850,1450]){
      const id='wet-separate-bracket-'+index+'-'+z,node=rails.find(r=>r.z===z)!.map.get(x)!,body:B=[x-50,500,z-40,100,10,80],reinforcement:B=[x-50,490,z-40,100,10,80]
      addMember(id,node,map.get(z)!,[x,510,z],[x,520,z],rhs(40,40,4),[x-20,510,z-20,40,10,40])
      removableInterfaces.push({id:id+'-joint',memberId:id,node,point:[x,500,z],axis:'Y',body,reinforcement,bolts:[-34,34].flatMap(dx=>[-25,25].map(dz=>[x+dx,500,z+dz] as P)),halfA:34,halfB:25})
      for(const [suffix,box] of [['plate',body],['reinforcement',reinforcement]] as const)addStock(id+'-'+suffix,box[3]*box[4]*box[5]*density,[box[0]+box[3]/2,box[1]+box[4]/2,box[2]+box[5]/2],node)
    }
    return {x,map,bodyMm:[x-20,520,wetStayBottom,40,40,1760-wetStayBottom] as B}
  })
  const wetBeams=[{id:'upper-wet-beam',z:1740,y:515,s:rhs(30,20,3),bottom:1730,normal:30,vertical:20},
    {id:'lower-wet-crossbar',z:lowWetZ,y:580,s:rhs(40,40,4),bottom:lowWetZ-20,normal:40,vertical:40}].map(spec=>{
    const upper=spec.id==='upper-wet-beam',inset=upper?32:0
    const xs=[stays[0].x+inset,...input.branches.map(b=>b.pipeAxisXMm),stays[1].x-inset],map=new Map<number,number>()
    for(const x of xs)map.set(x,x===xs[0]?stays[0].map.get(spec.z)!:x===xs.at(-1)?stays[1].map.get(spec.z)!:addNode(spec.id+'-'+x,[x,spec.y,spec.z]))
    for(let i=1;i<xs.length;i++)addMember(spec.id+'-'+i,map.get(xs[i-1])!,map.get(xs[i])!,[xs[i-1],spec.y,spec.z],[xs[i],spec.y,spec.z],spec.s,[xs[i-1],spec.y-spec.normal/2,spec.bottom,xs[i]-xs[i-1],spec.normal,spec.vertical])
    if(upper)for(const [i,stay] of stays.entries())addStock('wet-upper-beam-endplate-'+i,12*60*40*density,[stay.x+(i===0?26:-26),530,1740],stay.map.get(1740)!)
    else for(const [i,stay] of stays.entries())addStock('wet-lower-crossbar-overhang-'+i,spec.s.a*20*density,[stay.x+(i===0?-10:10),580,lowWetZ],stay.map.get(lowWetZ)!)
    return {...spec,map,bodyMm:[xs[0]-(upper?0:20),spec.y-spec.normal/2,spec.bottom,xs.at(-1)!-xs[0]+(upper?0:40),spec.normal,spec.vertical] as B}
  })
  const wetUpper=wetBeams[0],wetLower=wetBeams[1]
  const lowerIds=new Set(['floor','cell-walls','roof','roof-ribs','floor-ribs','roof-blind-bosses-and-pads'])
  for(const m of wet.quantities.steelLedger.filter(m=>m.branch!==null&&!m.id.startsWith('solid-'))){
    const branch=input.branches.find(b=>b.id===m.branch)!,upper=!lowerIds.has(m.id),node=(upper?wetUpper:wetLower).map.get(branch.pipeAxisXMm)!
    addStock('wet-'+m.branch+'-'+m.id,m.massKg,[m.pointMm[0],685,m.pointMm[2]],node,m.basis+'; fore685 force-point bound for uncertain formed-sheet centroid')
  }
  const plant=input.branches[1],plantFloor=wet.branches[1].sourceFloorLowerFaceZMm
  addStock('plant-solid-carrier',170*40*40*density,[plant.pipeAxisXMm,620,plantFloor-60],wetLower.map.get(plant.pipeAxisXMm)!)
  const plantStanchionStart=lowWetZ+20,plantStanchionHeight=plantFloor-40-plantStanchionStart
  for(const dx of [-75,75])addStock('plant-short-stanchion-'+dx,20*40*plantStanchionHeight*density,[plant.pipeAxisXMm+dx,580,plantStanchionStart+plantStanchionHeight/2],wetLower.map.get(plant.pipeAxisXMm)!)
  const endcaps:{id:string;bodyMm:B;node:number}[]=[]
  for(const [i,post] of posts.entries())for(const z of [590,1790])endcaps.push({id:'jamb-endcap-'+i+'-'+z,bodyMm:[post.axisXMm-20,430,z===590?586:1790,40,80,4],node:post.byZ.get(z)!})
  for(const [i,stay] of stays.entries())for(const z of [wetStayBottom,1760])endcaps.push({id:'wet-stay-endcap-'+i+'-'+z,bodyMm:[stay.x-20,520,z===wetStayBottom?wetStayBottom-4:1760,40,40,4],node:stay.map.get(z)!})
  for(const b of input.branches)endcaps.push({id:b.id+'-guide-endcap',bodyMm:[b.pipeAxisXMm-20,440,guideZ+30,40,40,4],node:nodes.findIndex(n=>n.id===b.id+'-guide-post-top')})
  for(const [i,stay] of stays.entries())endcaps.push({id:'wet-crossbar-endcap-'+i,bodyMm:[stay.x+(i===0?-24:20),560,lowWetZ-20,4,40,40],node:stay.map.get(lowWetZ)!})
  for(const cap of endcaps){const b=cap.bodyMm;addStock(cap.id,b[3]*b[4]*b[5]*density,[b[0]+b[3]/2,b[1]+b[4]/2,b[2]+b[5]/2],cap.node,'closed4mm endcap gross stock')}
  if(!['both','pipe-only','wet-only'].includes(representedSubsystem))throw new Error('Unknown represented service-frame subsystem')
  const isWet=(id:string)=>id.startsWith('wet-')||id.startsWith('upper-wet-')||id.startsWith('lower-wet-')||id.startsWith('plant-solid-')||id.startsWith('plant-short-')
  const isPipe=(id:string)=>input.branches.some(b=>id.startsWith(b.id+'-'))&&!isWet(id)
  for(const entries of [members,stock,removableInterfaces])for(let i=entries.length-1;i>=0;i--)if(representedSubsystem==='pipe-only'&&isWet(entries[i].id)||representedSubsystem==='wet-only'&&isPipe(entries[i].id))entries.splice(i,1)
  const assembled=members.map(m=>element(m,nodes)),ndof=nodes.length*6,K=zero(ndof),gravity=Array<number>(ndof).fill(0)
  const memberDofs=members.map(m=>[...Array.from({length:6},(_,i)=>m.a*6+i),...Array.from({length:6},(_,i)=>m.b*6+i)])
  for(let e=0;e<members.length;e++)for(let i=0;i<12;i++){
    const a=memberDofs[e][i];gravity[a]+=assembled[e].globalF[i]
    for(let j=0;j<12;j++)K[a][memberDofs[e][j]]+=assembled[e].global[i][j]
  }
  const apply=(v:number[],load:Load,scale=1)=>{for(let i=0;i<3;i++){v[load.node*6+i]+=load.force[i]*scale;v[load.node*6+3+i]+=load.moment[i]*scale}}
  const stockLoads=stock.map(m=>transfer(m.id,m.node,m.point,[0,0,-m.massKg*9.81],[0,0,0],true))
  const activeNodes=new Set(members.flatMap(m=>[m.a,m.b])),restrained=new Set(nodes.flatMap((n,i)=>n.restrained.map(d=>i*6+d))),free=Array.from({length:ndof},(_,i)=>i).filter(i=>activeNodes.has(Math.floor(i/6))&&!restrained.has(i))
  const responseFor=(stiffness:readonly (readonly number[])[])=>{
  const solveReduced=factor(free.map(i=>free.map(j=>stiffness[i][j])))
  return (f:readonly number[],selfWeight:boolean)=>{
    const u=Array<number>(ndof).fill(0),active=solveReduced(free.map(i=>f[i]));free.forEach((d,i)=>u[d]=active[i])
    const reaction=sub(matvec(stiffness,u),f),ends=members.map((m,e)=>sub(matvec(assembled[e].k,matvec(assembled[e].T,memberDofs[e].map(d=>u[d]))),selfWeight?assembled[e].f:Array<number>(12).fill(0)))
    return {u,reaction,ends}
  }}
  const ordinaryResponse=responseFor(K)
  const baseMass=members.reduce((n,m)=>n+m.massKg,0)+stock.reduce((n,m)=>n+m.massKg,0)
  const baselineLoads:Load[]=[]
  for(const b of representedSubsystem==='wet-only'?[]:input.branches){
    const n=pipeNodes.find(n=>n.branch===b.id)!,water=support.receivers.guidedRoute.actions.pipeWaterMassKg.find(row=>row.id===b.id)!.massKg
    baselineLoads.push(transfer(b.id+'-pipe-stock-water',n.fixed,nodes[n.fixed].p,[0,0,-(b.knownStockMassKg+water)*9.81]))
    const path=candidate.branches.find(branch=>branch.branch===b.id)!.pressurePathMm,totalWeight=(b.knownStockMassKg+water)*9.81
    for(const [k,coordinate] of [[0,1],[1,0]] as const){
      const m=[0,0,0];m[k]=totalWeight*Math.max(...path.map(p=>Math.abs(p[coordinate]-nodes[n.fixed].p[coordinate])))
      if(m[k]>0)baselineLoads.push(transfer(b.id+'-deadweight-route-moment-'+k,n.fixed,nodes[n.fixed].p,[0,0,0],m as unknown as P,true))
    }
    for(const [which,index] of [['fixedPointWrench',n.fixed],['guideWrench',n.guide]] as const){
      const w=b.guidedThermalActions![which]
      for(let k=0;k<6;k++)if((k<3?w.forceComponentBoundsN[k]:w.momentComponentBoundsNmm[k-3])>0){
        const force=[0,0,0],moment=[0,0,0];(k<3?force:moment)[k%3]=k<3?w.forceComponentBoundsN[k]:w.momentComponentBoundsNmm[k-3]
        baselineLoads.push(transfer(b.id+'-'+which+'-'+k,index,w.pointMm,force as unknown as P,moment as unknown as P,true))
      }
    }
    for(const k of [1,2]){const f=[0,0,0];f[k]=b.pressureEndForceN;baselineLoads.push(transfer(b.id+'-pressure-'+k,n.fixed,nodes[n.fixed].p,f as unknown as P,[0,0,0],true))}
  }
  const coldAxial=500+candidate.productFacts.pressurePipe.elasticModulusMpa*Math.PI*(candidate.productFacts.pressurePipe.outerDiameterMm**2-(candidate.productFacts.pressurePipe.outerDiameterMm-2*candidate.productFacts.pressurePipe.minimumWallMm)**2)/4*candidate.productFacts.pressurePipe.expansionMmMK/1000*5
  const structuralWaterInventory=wet.branches.map(b=>{
    const source=candidate.branches.find(o=>o.branch===b.branch)!,hood=source.controlArrangementComparison.wholeOrdinaryValveHood.bodyMm
    const lower=polygon(b.sourcePlanMm),upper=polygon(b.collar.flaredRoofPlanMm),F=b.floor.waterSideFloorZMm,S=b.collar.flareBeginsZMm,R=b.sourceRoofZMm
    const bounds=(plan:readonly (readonly number[])[])=>[0,1].map(k=>[Math.min(...plan.map(p=>p[k])),Math.max(...plan.map(p=>p[k]))])
    const prisms=[{horizontalBoundsMm:bounds(b.sourcePlanMm),volume:lower.area*(S-F),centre:[...lower.centre,(F+S)/2]},
      {horizontalBoundsMm:bounds(b.collar.flaredRoofPlanMm),volume:upper.area*(R-S),centre:[...upper.centre,(S+R)/2]},
      {horizontalBoundsMm:[[hood[0],hood[0]+hood[3]],[hood[1],hood[1]+hood[4]]],volume:hood[3]*hood[4]*80,centre:[hood[0]+hood[3]/2,hood[1]+hood[4]/2,R+40]}]
    const total=prisms.reduce((n,p)=>n+p.volume,0),centre=[0,1,2].map(k=>prisms.reduce((n,p)=>n+p.volume*p.centre[k],0)/total)
    return {branch:b.branch,massKg:total/1e6,centreMm:centre,prisms,scope:'Exact centroid of the declared adverse two-prism/full-funnel structural inventory; not a measured operational water level'}
  })
  const passiveExitBranches=input.branches.map(b=>{
    const hood=candidate.branches.find(o=>o.branch===b.id)!.controlArrangementComparison.wholeOrdinaryValveHood.bodyMm,roof=hood[2]+hood[5],protectedRadius=candidate.settings.protectedLowerDiameterMm/2
    const upstand={innerDiameterMm:64,outerDiameterMm:70,heightMm:60,bottomZMm:roof},cap={innerDiameterMm:84,outerDiameterMm:90,returnHeightMm:45,roofThicknessMm:3,roofZMm:roof+72}
    const upstandMassKg=Math.PI*(70**2-64**2)/4*60*density,capMassKg=(Math.PI*(90**2-84**2)/4*45+Math.PI*(90**2-candidate.settings.protectedLowerDiameterMm**2)/4*3)*density
    const waterMassKg=Math.PI*(90**2-candidate.settings.protectedLowerDiameterMm**2)/4*72/1e6
    const requiredGuideZMm=cap.roofZMm+30+5+20,guideReserve=candidate.settings.upperPipeGuideZMm-30-cap.roofZMm-5
    const radialPipe=32-protectedRadius-5,radialCap=42-35-5,side=Math.min(b.pipeAxisXMm-hood[0],hood[0]+hood[3]-b.pipeAxisXMm)-45-3-5
    return {branch:b.id,axisMm:[b.pipeAxisXMm,b.riserYMm] as const,upstand,cap,upstandMassKg,capMassKg,extraStructuralWaterMassKg:waterMassKg,
      nominalVerticalOverlapMm:roof+60-(cap.roofZMm-45),overlapAfterTwo5Mm:roof+60-(cap.roofZMm-45)-10,
      upstandToProtectedPipeAfter5Mm:radialPipe,capToUpstandAfter5Mm:radialCap,capToHoodSideAfterMetalAnd5Mm:side,capToHoodNormalAfterMetalAnd5Mm:Math.min(b.riserYMm-hood[1],hood[1]+hood[4]-b.riserYMm)-45-3-5,
      capToGuideAfter5Mm:guideReserve,requiredGuideCentreFor20MmReserve:requiredGuideZMm,sourceGeometryPass:Math.min(radialPipe,radialCap,side,guideReserve,Math.min(b.riserYMm-hood[1],hood[1]+hood[4]-b.riserYMm)-45-3-5)>=0,
      fullPressureSprayAndPlainPipeCapClosureQualified:false,actualRelativePipeShellMovementQualified:false,upperCapGravityCarriedByPipe:true,fullSplitCapRemovalSweepQualified:false,
      coldRemoval:'Isolate both Lodge branches, exclude electricity, drain and prove zero pressure. Remove both front covers; establish the actual upper keeper. Split and remove the cap sideways rather than assuming a vertical lift under the guide. Remove split backs and funnels before admitting press-tool poses. Actual split seams, dry retainers, tool and hand sweeps remain unqualified.'}
  })
  const caseSpecs:{id:string;faults:string[];cold:boolean;pull:string|null;topExit?:'drag'|'seized'|'passive-shed';seizedBranches?:string[]}[]=[{id:'sealed-normal',faults:[],cold:false,pull:null},
    {id:'both-closed-faults-full-water',faults:representedSubsystem==='pipe-only'?[]:input.branches.map(b=>b.id),cold:false,pull:null},
    ...input.branches.map(b=>({id:b.id+'-isolated-cold-removal',faults:[] as string[],cold:true,pull:representedSubsystem==='pipe-only'?null:b.id})),
    ...(representedSubsystem==='both'?[{id:'both-top-exits-150N-drag',faults:[],cold:false,pull:null,topExit:'drag' as const},
      {id:'passive-shed-top-exit-closed-faults',faults:input.branches.map(b=>b.id),cold:false,pull:null,topExit:'passive-shed' as const},
      {id:'closed-faults-with-top-exit-drag',faults:input.branches.map(b=>b.id),cold:false,pull:null,topExit:'drag' as const},
      ...input.branches.map(b=>({id:b.id+'-top-exit-seized-with-closed-faults',faults:input.branches.map(b=>b.id),cold:false,pull:null,topExit:'seized' as const,seizedBranches:[b.id]})),
      {id:'closed-faults-with-both-top-exits-seized',faults:input.branches.map(b=>b.id),cold:false,pull:null,topExit:'seized' as const,seizedBranches:input.branches.map(b=>b.id)},
      ...[...input.branches.map(b=>[b.id]),input.branches.map(b=>b.id)].map(branches=>({id:branches.join('-')+'-top-exit-seized',faults:[],cold:false,pull:null,topExit:'seized' as const,seizedBranches:branches}))]:[])]
  const allCases=caseSpecs.map(spec=>{
    const couplingMatrix=K.map(row=>[...row])
    const couplings=(spec.topExit==='seized'?input.branches.filter(b=>spec.seizedBranches!.includes(b.id)):[]).map(b=>{
      const pipe=pipeNodes.find(n=>n.branch===b.id)!,wetNode=wetUpper.map.get(b.pipeAxisXMm)!,hood=candidate.branches.find(o=>o.branch===b.id)!.controlArrangementComparison.wholeOrdinaryValveHood.bodyMm
      const point:P=[b.pipeAxisXMm,b.riserYMm,hood[2]+hood[5]],length=point[2]-nodes[pipe.fixed].p[2],facts=candidate.productFacts.pressurePipe
      if(!(length>0))throw new Error('Seized enclosure comparison needs the top exit above the actual fixed clamp')
      const area=Math.PI*(facts.outerDiameterMm**2-(facts.outerDiameterMm-2*facts.minimumWallMm)**2)/4,k=facts.elasticModulusMpa*area/length
      const c=Array<number>(ndof).fill(0),offset=sub(point,nodes[wetNode].p)
      c[wetNode*6+2]=1;c[wetNode*6+3]=offset[1];c[wetNode*6+4]=-offset[0];c[pipe.fixed*6+2]=-1
      const active=c.flatMap((value,index)=>value!==0?[index]:[])
      for(const i of active)for(const j of active)couplingMatrix[i][j]+=k*c[i]*c[j]
      return {branch:b.id,pipeNode:pipe.fixed,wetNode,point,lengthMm:length,pipeAreaMm2:area,stiffnessNPerMm:k,c,freeExpansionMm: facts.expansionMmMK/1000*candidate.settings.localPipeTemperatureRangeK*length,group:b.id+'-seized-top-exit'}
    })
    const response=couplings.length?responseFor(couplingMatrix):ordinaryResponse,dead=response(gravity,true)
    const loads:Load[]=spec.topExit==='seized'?baselineLoads.filter(l=>l.id.includes('pipe-stock-water')||l.id.includes('deadweight-route-moment')||l.id.includes('-pressure-')):spec.cold?(representedSubsystem==='wet-only'?[]:pipeNodes).flatMap(n=>{
      const additional=support.compactReceiver.mass.ledger.filter(m=>m.id.startsWith(n.branch+'-')&&['ring','lug','ear'].some(part=>m.id.startsWith(n.branch+'-'+part+'-'+guideZ))).reduce((sum,m)=>sum+m.massUpperKg*(m.id.includes('-ear-')?1.5:1),0)
      return [transfer(n.branch+'-cold-upper-keeper',n.guide,nodes[n.guide].p,[0,0,coldAxial],[0,0,0],true),transfer(n.branch+'-additional40mm-keeper-stock',n.guide,nodes[n.guide].p,[0,0,-additional*9.81])]
    }):[...baselineLoads]
    for(const id of spec.faults){
      const b=wet.branches.find(b=>b.branch===id)!,x=input.branches.find(b=>b.id===id)!.pipeAxisXMm,node=wetLower.map.get(x)!
      const water=structuralWaterInventory.find(w=>w.branch===id)!
      if(spec.topExit){
        // Any subset of each declared prism is enclosed by independent force and first-moment bounds.
        // This avoids favourable cancellation between differently filled branch cells or migrating horizontal centroids.
        for(const [i,prism] of water.prisms.entries()){
          const weight=prism.volume/1e6*9.81,point:P=[prism.centre[0],prism.centre[1],prism.centre[2]],dx=Math.max(...prism.horizontalBoundsMm[0].map(x=>Math.abs(x-point[0]))),dy=Math.max(...prism.horizontalBoundsMm[1].map(y=>Math.abs(y-point[1])))
          loads.push(transfer(id+'-partial-water-prism-'+i,node,point,[0,0,-weight],[0,0,0],true),transfer(id+'-partial-water-first-moment-X-'+i,node,point,[0,0,0],[weight*dy,0,0],true),transfer(id+'-partial-water-first-moment-Y-'+i,node,point,[0,0,0],[0,weight*dx,0],true))
        }
      }else loads.push(transfer(id+'-full-structural-water',node,water.centreMm,[0,0,-water.massKg*9.81]))
      for(let k=0;k<3;k++){const f=[0,0,0];f[k]=b.jetForceNormN;loads.push(transfer(id+'-closed-jet-'+k,wetUpper.map.get(x)!,b.jetPointMm,f as unknown as P,[0,0,0],true))}
    }
    for(const b of spec.topExit==='passive-shed'?passiveExitBranches:[]){
      const pipe=pipeNodes.find(n=>n.branch===b.branch)!,wetNode=wetUpper.map.get(b.axisMm[0])!,point:P=[b.axisMm[0],b.axisMm[1],b.cap.roofZMm-20]
      loads.push(transfer(b.branch+'-passive-upstand-stock',wetNode,point,[0,0,-b.upstandMassKg*9.81],[0,0,0],true),transfer(b.branch+'-passive-cap-stock',pipe.fixed,point,[0,0,-b.capMassKg*9.81],[0,0,0],true),transfer(b.branch+'-passive-upper-water',wetNode,point,[0,0,-b.extraStructuralWaterMassKg*9.81],[0,0,0],true),transfer(b.branch+'-passive-upper-water-moment-X',wetNode,point,[0,0,0],[b.extraStructuralWaterMassKg*9.81*45,0,0],true),transfer(b.branch+'-passive-upper-water-moment-Y',wetNode,point,[0,0,0],[0,b.extraStructuralWaterMassKg*9.81*45,0],true))
    }
    for(const b of spec.topExit==='drag'?input.branches:[]){
      const pipe=pipeNodes.find(n=>n.branch===b.id)!,wetNode=wetUpper.map.get(b.pipeAxisXMm)!,hood=candidate.branches.find(o=>o.branch===b.id)!.controlArrangementComparison.wholeOrdinaryValveHood.bodyMm,point:P=[b.pipeAxisXMm,b.riserYMm,hood[2]+hood[5]],group=b.id+'-top-exit-drag'
      loads.push({...transfer(group+'-wet',wetNode,point,[0,0,150],[0,0,0],true),correlatedGroup:group}, {...transfer(group+'-pipe',pipe.fixed,point,[0,0,-150],[0,0,0],true),correlatedGroup:group})
    }
    for(const c of couplings){const force=c.stiffnessNPerMm*c.freeExpansionMm
      loads.push({...transfer(c.group+'-wet',c.wetNode,c.point,[0,0,force],[0,0,0],true),correlatedGroup:c.group}, {...transfer(c.group+'-pipe',c.pipeNode,c.point,[0,0,-force],[0,0,0],true),correlatedGroup:c.group})
    }
    if(spec.pull){const x=input.branches.find(b=>b.id===spec.pull)!.pipeAxisXMm;for(let k=0;k<3;k++){const f=[0,0,0];f[k]=150;loads.push(transfer(spec.pull+'-cold-manual-pull-'+k,wetUpper.map.get(x)!,[x,685,candidate.settings.valveCentreZMm],f as unknown as P,[0,0,0],true))}}
    const groups=new Map<string,Load[]>()
    for(const l of [...stockLoads,...loads.filter(l=>l.bound)]){const key=l.correlatedGroup??l.id;groups.set(key,[...groups.get(key)??[],l])}
    const groupKeys=[...groups.keys()],fixed=Array<number>(ndof).fill(0),variables=[...groups.values()].map(group=>{const v=Array<number>(ndof).fill(0);for(const l of group)apply(v,l);return response(v,false)})
    for(const l of loads.filter(l=>!l.bound))apply(fixed,l)
    const specific=response(fixed,false),bound=(base:number,value:(result:ReturnType<typeof response>)=>number)=>Math.abs(base)+variables.reduce((n,v)=>n+Math.abs(value(v)),0)
    const endBounds=members.map((m,e)=>Array.from({length:12},(_,i)=>bound(dead.ends[e][i]+specific.ends[e][i],v=>v.ends[e][i])))
    const memberResults=members.map((m,e)=>{
      const s=m.s,ends=[0,6].map(start=>{
        const f=endBounds[e].slice(start,start+3),mmt=endBounds[e].slice(start+3,start+6),normal=f[0]/s.a+mmt[1]/(s.iy/(s.z/2))+mmt[2]/(s.iz/(s.y/2)),shear=Math.hypot(f[1]/(2*s.t*s.y),f[2]/(2*s.t*s.z))+mmt[0]/(2*(s.y-s.t)*(s.z-s.t)*s.t)
        const throat=m.leg/Math.SQRT2,L=2*(s.y+s.z),Iy=throat*(2*s.y*(s.z/2)**2+2*s.z**3/12),Iz=throat*(2*s.z*(s.y/2)**2+2*s.y**3/12)
        const wn=f[0]/(throat*L)+mmt[1]/(Iy/(s.z/2))+mmt[2]/(Iz/(s.y/2)),ws=Math.hypot(f[1],f[2])/(throat*L)+mmt[0]*Math.hypot(s.y/2,s.z/2)/(Iy+Iz)
        return {localForceBoundsN:f.map(r),localMomentBoundsNmm:mmt.map(r),steelStressMpa:r(Math.hypot(normal,Math.sqrt(3)*shear)),returnedWeldStressMpa:r(Math.hypot(wn,Math.sqrt(3)*ws))}
      })
      const L=assembled[e].length,q=assembled[e].axes.map(axis=>-m.massKg*9.81/L*axis[2])
      const internal=(end:readonly number[],x:number,gravity:boolean)=>{
        const g=gravity?q:[0,0,0]
        return [-end[0]-g[0]*x,-end[1]-g[1]*x,-end[2]-g[2]*x,-end[3],-end[4]-end[2]*x-g[2]*x*x/2,-end[5]+end[1]*x+g[1]*x*x/2]
      }
      const stations=[0,.25,.5,.75,1].map(fraction=>{
        const x=L*fraction,base=internal(dead.ends[e].map((v,i)=>v+specific.ends[e][i]),x,true),v=base.map((n,i)=>bound(n,result=>internal(result.ends[e],x,false)[i]))
        const euler=Math.PI**2*steel.elasticModulusMpa*Math.min(s.iy,s.iz)/(2*L)**2,magnification=v[0]<euler?1/(1-v[0]/euler):Infinity
        const curvatureAllowance=(Math.abs(q[2])/(s.iy/(s.z/2))+Math.abs(q[1])/(s.iz/(s.y/2)))*L**2/128
        const normal=v[0]/s.a+magnification*(v[4]/(s.iy/(s.z/2))+v[5]/(s.iz/(s.y/2))+curvatureAllowance),shear=Math.hypot(v[1]/(2*s.t*s.y),v[2]/(2*s.t*s.z))+v[3]/(2*(s.y-s.t)*(s.z-s.t)*s.t)
        return {fraction,localBounds:v.map(r),stressMpa:r(Math.hypot(normal,Math.sqrt(3)*shear)),eulerCantileverBoundN:r(euler),magnification:r(magnification),uniformLoadInterpolationStressAllowanceMpa:r(curvatureAllowance)}
      })
      return {id:m.id,ends,stations,maximumStressMpa:Math.max(...stations.map(e=>e.stressMpa)),maximumWeldMpa:Math.max(...ends.map(e=>e.returnedWeldStressMpa))}
    })
    const jointResults=removableInterfaces.map(j=>{
      const e=members.findIndex(m=>m.id===j.memberId),basis=assembled[e].axes,end=endBounds[e],f=[0,1,2].map(i=>basis.reduce((sum,a,k)=>sum+Math.abs(a[i])*end[k],0)),m=[0,1,2].map(i=>basis.reduce((sum,a,k)=>sum+Math.abs(a[i])*end[k+3],0))
      const d=sub(members[e].pa,j.point)
      const moved=[Math.abs(d[1])*f[2]+Math.abs(d[2])*f[1],Math.abs(d[2])*f[0]+Math.abs(d[0])*f[2],Math.abs(d[0])*f[1]+Math.abs(d[1])*f[0]]
      for(let i=0;i<3;i++)m[i]+=moved[i]
      const normal=j.axis==='Y'?f[1]:f[2],bendingA=m[0],bendingB=j.axis==='Y'?m[2]:m[1],torque=j.axis==='Y'?m[1]:m[2],inPlane=j.axis==='Y'?[f[0],f[2]]:[f[0],f[1]]
      const tensile=1000+normal/4+bendingA/(4*j.halfB)+bendingB/(4*j.halfA),shear=Math.hypot(inPlane[0]/4+torque/(4*j.halfB),inPlane[1]/4+torque/(4*j.halfA))
      const thickness=j.axis==='Y'?j.body[4]:j.body[5],threadLength=j.axis==='Y'?j.reinforcement[4]:j.reinforcement[5]
      const plateStress=normal/(100*thickness)+6*bendingA/(100*thickness**2)+6*bendingB/(80*thickness**2),boltStress=Math.hypot(tensile/58,Math.sqrt(3)*shear/58),threadShear=tensile/(.5*Math.PI*8.5*threadLength)
      const padDepth=j.axis==='Y'?80:60,throat=4/Math.SQRT2,weldLength=2*(100+padDepth),wI=throat*(2*100*(padDepth/2)**2+2*padDepth**3/12),wJ=throat*(2*padDepth*50**2+2*100**3/12)
      const weldNormal=normal/(throat*weldLength)+bendingA/(wI/(padDepth/2))+bendingB/(wJ/50),weldShear=Math.hypot(...inPlane)/(throat*weldLength)+torque*Math.hypot(50,padDepth/2)/(wI+wJ)
      const webArea=2*100*4,webStress=normal/webArea+bendingA/(webArea*padDepth/2)+bendingB/(2*4*100**2/6)+Math.sqrt(3)*Math.hypot(...inPlane)/webArea
      return {id:j.id,forceBoundsN:f.map(r),momentBoundsNmm:m.map(r),authoredBolt:'four M10,58mm2 tensile area,1000N installation preload each',
        boltTensionEachN:r(tensile),boltShearEachN:r(shear),boltCombinedStressMpa:r(boltStress),plateBendingMpa:r(plateStress),threadEngagementMm:threadLength,
        padReturned4MmWeldStressMpa:r(Math.hypot(weldNormal,Math.sqrt(3)*weldShear)),adjacentRhsWebMembraneStressMpa:r(webStress),
        localWallLaw:'Reinforcement spans the full RHS face and transfers through both longitudinal corner welds to adjacent4mm webs; nominal membrane and weld calculation. Exact rounded corner contact, unsupported face distortion, fatigue and weld procedure are not represented.',
        nominalInternalThreadShearMpa:r(threadShear),threadProofBoundary:'Nominal shear-cylinder comparison only; actual thread/stock/fastener grades, torque and retained preload unqualified',
        reinforcedRhsCornerWeldAndLocalWallResistanceQualified:false}
    })
    const wetJointResults=representedSubsystem==='pipe-only'?[]:wetBeams.flatMap((beam,index)=>[0,1].map(side=>{
      const indices=members.flatMap((m,e)=>m.id.startsWith(beam.id+'-')?[e]:[]),e=side===0?indices[0]:indices.at(-1)!,end=side===0?0:6,basis=assembled[e].axes
      const f=[0,1,2].map(i=>basis.reduce((n,a,k)=>n+Math.abs(a[i])*endBounds[e][end+k],0)),m=[0,1,2].map(i=>basis.reduce((n,a,k)=>n+Math.abs(a[i])*endBounds[e][end+3+k],0))
      const point=(side===0?members[e].pa:members[e].pb),weldPoint:P=index===0?[stays[side].x+(side===0?20:-20),540,1740]:[stays[side].x,560,lowWetZ],d=sub(point,weldPoint)
      m[0]+=Math.abs(d[1])*f[2]+Math.abs(d[2])*f[1];m[1]+=Math.abs(d[2])*f[0]+Math.abs(d[0])*f[2];m[2]+=Math.abs(d[0])*f[1]+Math.abs(d[1])*f[0]
      const throat=4/Math.SQRT2,A=throat*160,I=throat*(2*40*20**2+2*40**3/12),normal=index===0?f[0]:f[1],bend=index===0?m[1]+m[2]:m[0]+m[2],torque=index===0?m[0]:m[1],shear=index===0?Math.hypot(f[1],f[2]):Math.hypot(f[0],f[2])
      const weldStress=Math.hypot(normal/A+bend/(I/20),Math.sqrt(3)*(shear/A+torque*Math.hypot(20,20)/(2*I)))
      const plateStress=index===0?Math.hypot(f[0]/(60*12)+6*m[1]/(40*12**2)+6*m[2]/(60*12**2),Math.sqrt(3)*(Math.hypot(f[1],f[2])/(40*12)+3*m[0]/(12*60*40))):0
      return {id:beam.id+'-stay-'+side,actualWeldPointMm:weldPoint,actualReturnedWeldContactFaceMm:[40,40],contactAreaMm2:1600,returned4MmWeldStressMpa:r(weldStress),upperEndplate12MmStressMpa:r(plateStress),actualLocalWallAndWeldQualification:false}
    }))
    const anchors=nodes.flatMap((n,i)=>n.restrained.length?(()=>{
      const f=Array.from({length:3},(_,k)=>bound(dead.reaction[i*6+k]+specific.reaction[i*6+k],v=>v.reaction[i*6+k])),m=Array.from({length:3},(_,k)=>bound(dead.reaction[i*6+3+k]+specific.reaction[i*6+3+k],v=>v.reaction[i*6+3+k]))
      const tension=1.25*(f[1]/2+m[0]/anchorGaugeMm+m[2]/160),shear=Math.hypot(f[0],f[2])/2,plate= f[1]/(190*16)+6*m[0]/(190*16**2)+6*m[2]/(padHeight*16**2)
      const wm=[m[0]+27.5*f[2],m[1]+65*f[2],m[2]+65*f[1]+27.5*f[0]],throat=4/Math.SQRT2,L=2*(40+padHeight),Ix=throat*(2*40*(padHeight/2)**2+2*padHeight**3/12),Iz=throat*(2*padHeight*20**2+2*40**3/12)
      const weldNormal=f[1]/(throat*L)+wm[0]/(Ix/(padHeight/2))+wm[2]/(Iz/20),weldShear=Math.hypot(f[0],f[2])/(throat*L)+wm[1]*Math.hypot(20,padHeight/2)/(Ix+Iz)
      return [{node:n.id,pointMm:n.p,actualAnchorPointsMm:[n.p[2]-anchorGaugeMm/2,n.p[2]+anchorGaugeMm/2].map(z=>[n.p[0],face,z]),forceBoundsN:f.map(r),momentBoundsNmm:m.map(r),anchorTensionN:r(tension),anchorShearN:r(shear),plateBendingMpa:r(plate),
        compressionToeLeverAfter5Mm:80,anchorGaugeMm,pryingSensitivity:1.25,requiredToeBearingMpa:r(3*(2*tension+f[1])/(2*20*padHeight)),
        postToPadReturned4MmWeldMpa:r(Math.hypot(weldNormal,Math.sqrt(3)*weldShear)),isolatedCatalogueInteraction:r(tension/5800+shear/18000),completeGroupCapacity:false}]
    })():[])
    const applied=gravity.map((v,i)=>v+fixed[i]),reaction=dead.reaction.map((v,i)=>v+specific.reaction[i]),sumForce=[0,0,0],sumMoment=[0,0,0]
    for(let i=0;i<nodes.length;i++){const f=Array.from({length:3},(_,k)=>applied[i*6+k]+reaction[i*6+k]),m=Array.from({length:3},(_,k)=>applied[i*6+3+k]+reaction[i*6+3+k]),c=cross(nodes[i].p,f);for(let k=0;k<3;k++){sumForce[k]+=f[k];sumMoment[k]+=m[k]+c[k]}}
    const topExitCouplings=couplings.map(c=>{
      const unit=Array<number>(ndof).fill(0);for(let i=0;i<ndof;i++)unit[i]=c.c[i]
      const uncoupledCompliance=dot(c.c,ordinaryResponse(unit,false).u)
      const uncoupledFrameCrossCompliance=couplings.map(other=>({branch:other.branch,complianceMmPerN:dot(c.c,ordinaryResponse(other.c,false).u)}))
      const thermalInfluences=couplings.map(other=>({branch:other.branch,forceN:c.stiffnessNPerMm*((other.branch===c.branch?c.freeExpansionMm:0)-dot(c.c,variables[groupKeys.indexOf(other.group)].u))}))
      const thermalIndex=groupKeys.indexOf(c.group),thermal=variables[thermalIndex],actualThermalForce=c.stiffnessNPerMm*(c.freeExpansionMm-dot(c.c,thermal.u)),rigidForce=c.stiffnessNPerMm*c.freeExpansionMm
      const base=-c.stiffnessNPerMm*dot(c.c,dead.u.map((v,i)=>v+specific.u[i])),forceBound=Math.abs(base)+variables.reduce((n,v,i)=>n+Math.abs(c.stiffnessNPerMm*((groupKeys[i]===c.group?c.freeExpansionMm:0)-dot(c.c,v.u))),0)
      return {branch:c.branch,pointMm:c.point,lengthMm:c.lengthMm,pipeAreaMm2:c.pipeAreaMm2,tubeOnlyStiffnessNPerMm:c.stiffnessNPerMm,freeExpansionMm:c.freeExpansionMm,rigidFrameThrustN:rigidForce,ownThermalCompatibleForceN:actualThermalForce,ownThermalFrameOpeningMm:dot(c.c,thermal.u),allBoundLoadForceN:forceBound,uncoupledFrameComplianceMmPerN:uncoupledCompliance,uncoupledFrameCrossCompliance,thermalInfluences,sameSignThermalForceN:thermalInfluences.reduce((n,row)=>n+row.forceN,0),actualValveAndSealStiffnessQualified:false}
    })
    return {id:spec.id,topExitState:spec.topExit??'uncoupled',topExitCouplings,operatingState:spec.cold?'both-branches-isolated-drained-zero-pressure':'closed-occupied-normal-or-fault',loads,
      pressureIncluded:!spec.cold&&representedSubsystem!=='wet-only',sourceRouteThermalIncluded:!spec.cold&&spec.topExit!=='seized'&&representedSubsystem!=='wet-only',
      pressureAndSourceRouteThermalIncluded:!spec.cold&&spec.topExit!=='seized'&&representedSubsystem!=='wet-only',sourcePipeTemperatureRangeK:candidate.settings.localPipeTemperatureRangeK,independentPartialWaterInventoryEnveloped:!!spec.topExit&&spec.faults.length>0,fullStructuralWetInventoryIncluded:spec.faults.length>0,jetIncluded:spec.faults.length>0,manualPullIncluded:spec.pull!==null,
      coldAxialEachN:spec.cold&&representedSubsystem!=='wet-only'?r(coldAxial):null,steelDeadloadRetainedAfterRemovalAsAdverse:true,memberResults,jointResults,wetJointResults,anchors,
      deadAndFixedLoadEquilibrium:{forceResidualN:sumForce.map(r),momentResidualNmm:sumMoment.map(r)},
      maximumMemberStressMpa:Math.max(...memberResults.map(m=>m.maximumStressMpa)),maximumWeldStressMpa:Math.max(...memberResults.map(m=>m.maximumWeldMpa)),
      maximumPlateStressMpa:Math.max(...anchors.map(a=>a.plateBendingMpa)),maximumRemovableJointStressMpa:Math.max(0,...anchors.map(a=>a.postToPadReturned4MmWeldMpa),...wetJointResults.flatMap(j=>[j.returned4MmWeldStressMpa,j.upperEndplate12MmStressMpa]),...jointResults.flatMap(j=>[j.boltCombinedStressMpa,j.plateBendingMpa,Math.sqrt(3)*j.nominalInternalThreadShearMpa,j.padReturned4MmWeldStressMpa,j.adjacentRhsWebMembraneStressMpa])),maximumIsolatedAnchorInteraction:Math.max(...anchors.map(a=>a.isolatedCatalogueInteraction))}
  })
  const cases=allCases.filter(c=>c.topExitState==='uncoupled'),enclosureInteractionCases=allCases.filter(c=>c.topExitState!=='uncoupled')
  const display=(value:number)=>Number(value.toFixed(2))
  const xml=(value:string|number)=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\"','&quot;')
  const governingEnclosure=enclosureInteractionCases.find(c=>c.topExitCouplings.length===2&&!c.fullStructuralWetInventoryIncluded)
  const normalPoint=governingEnclosure?.topExitCouplings[0]?.pointMm
  const reviewRows=enclosureInteractionCases.filter(c=>!c.id.endsWith('seized-with-closed-faults')).map((c,i)=>`<text x="500" y="${170+i*56}" font-size="15">${xml(c.id)}</text><text x="500" y="${194+i*56}" font-size="14">Member ${display(c.maximumMemberStressMpa)} MPa · joint ${display(c.maximumRemovableJointStressMpa)} MPa · anchor ${display(c.maximumIsolatedAnchorInteraction)}</text>`).join('')
  const enclosureReviewSvg=`<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="760" viewBox="0 0 1120 760"><title>Fixed inlet: coupled top-exit load path</title><desc>Source-bound frame comparison. A diagram of the thermal pipe and wet-frame interaction, not a fabricated enclosure or seal detail.</desc><rect width="1120" height="760" fill="white"/><g fill="#202020" stroke="none" font-family="Arial,sans-serif"><text x="40" y="48" font-size="26">Fixed inlet · top-exit interaction</text><text x="40" y="78" font-size="15">Same assembled frame; dimensions in mm. Load-path diagram, not to scale.</text><text x="500" y="130" font-size="18">${candidate.settings.localPipeTemperatureRangeK} K local pipe range · comparison limit ${display(allowable)} MPa</text>${reviewRows}<text x="40" y="555" font-size="17">A rigid-frame calculation is not the assembled force.</text><text x="40" y="583" font-size="15">${governingEnclosure?.topExitCouplings.map(c=>xml(c.branch)+': own thermal '+display(c.ownThermalCompatibleForceN)+' N; full bound '+display(c.allBoundLoadForceN)+' N').join(' · ')??'Both pipe and wet assemblies are required for the interaction comparison.'}</text><text x="40" y="611" font-size="15">Independent branch heating/cooling signs and stock bounds retained; ordinary route thermal omitted in seizure.</text><text x="40" y="645" font-size="15">No actual gland, valve stiffness, local shell, wet seam, material or installed acceptance is supplied.</text><text x="40" y="673" font-size="15">The existing fixed-arm/back-shell opening remains unresolved. This drawing does not close it.</text><text x="40" y="719" font-size="11">Candidate ${xml(candidate.source.caseDigest)}</text></g>${normalPoint?`<g stroke="#202020" fill="none" stroke-width="2"><path d="M80 126V475M80 450H290M80 120H190"/><path d="M290 450V127" stroke-width="5"/><rect x="178" y="110" width="24" height="20"/><path d="M202 120H290" stroke-dasharray="5 4"/><circle cx="290" cy="127" r="12"/><rect x="278" y="438" width="24" height="24"/></g><g font-family="Arial,sans-serif" fill="#202020" font-size="14"><text x="42" y="102">Wet upper beam Y515 / Z1740</text><text x="311" y="132">Top exit Z${normalPoint[2]}</text><text x="311" y="155">Pipe Y${normalPoint[1]}</text><text x="302" y="290">EA/L + thermal strain</text><text x="105" y="150">85 normal lever</text><text x="111" y="498">Fixed clamp Z850</text><text x="110" y="522">Equal/opposite internal force pair</text></g>`:''}</svg>`
  const enclosureSteelFails=enclosureInteractionCases.some(c=>c.maximumMemberStressMpa>allowable||c.maximumWeldStressMpa>allowable||c.maximumPlateStressMpa>allowable||c.maximumRemovableJointStressMpa>allowable)
  const enclosureAnchorFails=enclosureInteractionCases.some(c=>c.maximumIsolatedAnchorInteraction>1)
  const guidePostCaps=representedSubsystem==='wet-only'?[]:input.branches.map(b=>[b.pipeAxisXMm-20,440,guideZ,40,40,30] as B)
  const wetEndplates=representedSubsystem==='pipe-only'?[]:stays.map((stay,i)=>[stay.x+(i===0?20:-32),500,1720,12,60,40] as B)
  const retainedCaps=endcaps.filter(c=>representedSubsystem==='both'||representedSubsystem==='pipe-only'&&!isWet(c.id)||representedSubsystem==='wet-only'&&!isPipe(c.id))
  const retainedPipeMounts=representedSubsystem==='wet-only'?[]:support.compactReceiver.geometry.pipeMounts
  const mountPlates=retainedPipeMounts.map(m=>m.mountingPlateBodyMm)
  const mountToolBodies=retainedPipeMounts.flatMap(m=>[...m.rearLugBlanksMm,...m.earBlanksMm,
    [m.centreMm[0]-m.outerDiameterMm/2,m.centreMm[1]-m.outerDiameterMm/2,m.centreMm[2]-m.axialHeightMm/2,m.outerDiameterMm,m.outerDiameterMm,m.axialHeightMm]])
  const permanentBodies=[...members.map(m=>m.body),...posts.flatMap(p=>p.pads.map(p=>p.bodyMm)),...removableInterfaces.flatMap(j=>[j.body,j.reinforcement]),...guidePostCaps,...wetEndplates,...retainedCaps.map(c=>c.bodyMm),...(representedSubsystem==='pipe-only'?[]:[wetLower.bodyMm]),...mountPlates]
  const tools=candidate.operatingProof.toolPoses.map(p=>({...p,frameAfter5Mm:r(Math.min(...[...permanentBodies,...mountToolBodies].map(b=>gap(b,p.jawOpeningClosedAnd100mmApproachBoundMm)))-5)}))
  const renewals=support.compactReceiver.sourceContext.operating.renewals.map(n=>({...n,frameAfterBareRadius5AndCurveMm:r(Math.min(...n.sweptCentrelineBoxesMm.flatMap(s=>permanentBodies.map(b=>gap(s,b))))-n.bareRadiusMm-5-n.curveHausdorffMm)}))
  const saws=wet.sawPoses.map(p=>({...p,frameAfter5Mm:r(Math.min(...permanentBodies.map(b=>gap(b,p.sweptToolBoundMm)))-5)}))
  const panels=wet.branches.flatMap(b=>b.panels.map(p=>({branch:b.branch,side:p.side,finalParkAfter5Mm:r(Math.min(...permanentBodies.map(body=>gap(body,p.parkedBodyBoundMm)))-5),fullSweepQualified:false})))
  let roomReview:{inputs:Record<string,string>;hotPathAfter5Mm:number[];ventAfter5Mm:number[];bowlTransportAfter5Mm:number[];washerInstalledAndFirstRestAfter5Mm:number[];inverterAfter5Mm:number;allRepresentedFrameClear:boolean}|null=null
  if(spatialSources){
    const identities:Record<string,string>={}
    for(const key of Object.keys(spatialPaths) as (keyof SpatialSources)[]){
      const text=spatialSources[key],actual=createHash('sha1').update('blob '+Buffer.byteLength(text)+'\0').update(text).digest('hex'),path=spatialPaths[key]
      if(candidate.source.inputs[path]!==actual)throw new Error('Shared frame spatial context differs from the actual candidate: '+path)
      identities[path]=actual
    }
    const hot=JSON.parse(spatialSources.hot) as {hot:{backbone:P[];terminal:P[]}},bowl=JSON.parse(spatialSources.bowl) as {capture:{clearSweeps:{stage:number;box:B}[]}}
    const services=JSON.parse(spatialSources.services) as {utility:{washer:number[];washerFirstRest:number[];PVinverter:number[];PVinverterLocalZ:number[]}},cells=JSON.parse(spatialSources.cells) as {branches:{vent:{outer:P;inner:P;formedDiameterMM:number}}[]}
    const paths=[finiteBends(hot.hot.backbone,75),finiteBends(hot.hot.terminal,25)]
    const hotPathAfter5Mm=paths.map((path,i)=>r(Math.min(...path.path.slice(1).flatMap((b,j)=>permanentBodies.map(box=>exactSegmentBoxDistance(path.path[j],b,box))))-(i===0?37:25)-path.hausdorffError-5))
    const ventAfter5Mm=cells.branches.map(c=>r(Math.min(...permanentBodies.map(box=>exactSegmentBoxDistance(c.vent.outer,c.vent.inner,box)))-c.vent.formedDiameterMM/2-5))
    const bowlTransportAfter5Mm=bowl.capture.clearSweeps.map(row=>r(Math.min(...permanentBodies.map(box=>gap(box,row.box)))-5))
    const {utility:u}=services,inverter:B=[u.PVinverter[0],u.PVinverter[1],u.PVinverterLocalZ[0],u.PVinverter[2],u.PVinverter[3],u.PVinverterLocalZ[1]-u.PVinverterLocalZ[0]]
    const washerInstalledAndFirstRestAfter5Mm=[u.washer,u.washerFirstRest].map(w=>r(Math.min(...permanentBodies.map(box=>gap(box,[w[0],w[1],0,w[2],w[3],848])))-5)),inverterAfter5Mm=r(Math.min(...permanentBodies.map(box=>gap(box,inverter)))-5)
    roomReview={inputs:identities,hotPathAfter5Mm,ventAfter5Mm,bowlTransportAfter5Mm,washerInstalledAndFirstRestAfter5Mm,inverterAfter5Mm,
      allRepresentedFrameClear:[...hotPathAfter5Mm,...ventAfter5Mm,...bowlTransportAfter5Mm,...washerInstalledAndFirstRestAfter5Mm,inverterAfter5Mm].every(v=>v>=0)}
  }
  const backboneMass=members.filter(m=>m.id.startsWith('jamb-post')||m.id.startsWith('backbone-rail')).reduce((n,m)=>n+m.massKg,0)+stock.filter(m=>m.id.startsWith('wall-pad')||m.id.startsWith('toe-packing')||m.id.startsWith('jamb-endcap')).reduce((n,m)=>n+m.massKg,0)
  const geometryPass=tools.every(p=>p.frameAfter5Mm>=0)&&renewals.every(n=>n.frameAfterBareRadius5AndCurveMm>=0)&&saws.every(p=>p.frameAfter5Mm>=0)
  const railWindowArea=rails.reduce((total,rail)=>total+Math.max(0,Math.min(rail.bodyMm[0]+rail.bodyMm[3],support.hostWindow.candidateClearXMm[1])-Math.max(rail.bodyMm[0],support.hostWindow.candidateClearXMm[0]))*
    Math.max(0,Math.min(rail.bodyMm[2]+rail.bodyMm[5],support.hostWindow.headZMm)-Math.max(rail.bodyMm[2],support.hostWindow.sillZMm)),0)
  return {schema:'had-fixed-inlet-shared-service-frame/1' as const,status:'unselected-whole-arrangement-comparison' as const,
    source:{candidateCaseDigest:candidate.source.caseDigest,supportCaseDigest:support.caseDigest,wetSource:wet.source,hostWindow:support.hostWindow},
    recommendation:'One permanent two-jamb wall frame replaces both the low chassis and one-jamb pipe cantilever. Pipe clamps/guides and wet cells/hoods remain independently removable on separate brackets; neither assembly carries the other.',
    mechanics:{representedSubsystem,method:'Linear3D Euler–Bernoulli RHS beam stiffness, exact consistent uniform member selfweight, physical rigid end offsets, all six applied wrench components. Wall pad translations and rotationsX/Z restrained; rotationY released with no in-plane pad friction credited. Every additional stock mass is independently bounded0..its maximum and receives no counterweight credit. Load-box component responses are absolute-summed about signed member gravity and fixed external gravity. Pipe stock/water also receives a whole-route maximum-lever moment challenge at850; actual terminal gravity sharing is not established.',
      allowableComparisonMpa:allowable,anchorGaugeMm,constitutiveAssumptions:{elasticModulusMpa:200000,poissonRatio:.3,sharpCornerSectionIdealization:true,comparisonSteel:steel},
      wallPadRotationalStiffnessQualified:false,rhsWallLocalResistanceQualified:false,coldGripQualified:false,actualPressToolActionN:null,
      coldLoadChallenge:{upperPayloadEachN:500,independentUpperTemperatureK:5,requiredMatchedGripHeightMm:40,clampBoltPreloadEachN:1800,
        minimumGripCoefficient:coldAxial/(2*Math.PI*1800),actualUpperPayloadAndContactQualified:false},
      enclosureInteraction:{sourcePipeTemperatureRangeK:candidate.settings.localPipeTemperatureRangeK,normalDragEachN:150,
        method:'Same assembled frame with equal-and-opposite correlated seal forces; closed-fault water and jet are also replayed with both drag and paired seizure. A seized top exit adds the actual straight tube EA/L spring and thermal eigenstrain between the fixed pipe clamp and wet upper beam, with physical gland lever moments; frame compliance is solved, not ignored. Each single-branch and paired seizure retains independent source pressure actions but omits inherited route thermal actions; a complete compatible upper pipe network remains unresolved. Valves, unions, local shell and gland compliance are unqualified; this is a tube-only sensitivity, not measured installed thrust.',
        passiveExitReplacement:{strategy:'noncontact-gravity-shed-upstand-and-returned-cap' as const,branches:passiveExitBranches,
          recommendation:'Develop the gravity-shed noncontact exit before enlarging hardware for an unqualified packed seal. The raised guide requirement, actual cap retention/plain-pipe closure and pressure-spray qualification remain mandatory; no force-free seal is inferred.',
          diagnostics:[...passiveExitBranches.filter(b=>!b.sourceGeometryPass).map(b=>b.branch+':PASSIVE_TOP_EXIT_INTERCEPTS_SOURCE_GUIDE_OR_ENVELOPE'),'PLAIN_PIPE_TO_CAP_CLOSURE_AND_PRESSURE_SPRAY_UNQUALIFIED','FULL_SPLIT_CAP_AND_BACK_ARM_CLOSURES_UNRESOLVED'],actualEnclosureOrSealAdopted:false,completeBackArmClosureSupplied:false},reviewSvg:enclosureReviewSvg,status:enclosureInteractionCases.length?'evaluated-comparison' as const:'not-applicable-subsystem' as const,evaluatedCaseCount:enclosureInteractionCases.length,
        cases:enclosureInteractionCases,conditionalSteelPass:enclosureInteractionCases.length?!enclosureSteelFails:null,isolatedAnchorScreenPass:enclosureInteractionCases.length?!enclosureAnchorFails:null,
        diagnostics:[...(enclosureSteelFails?['TOP_EXIT_COUPLING_CONDITIONAL_STEEL_COMPARISON_FAILS']:[]),...(enclosureAnchorFails?['TOP_EXIT_COUPLING_ISOLATED_ANCHOR_SCREEN_FAILS']:[]),'ACTUAL_TOP_EXIT_SEAL_VALVE_STIFFNESS_SHELL_LOAD_PATH_AND_MATERIALS_UNQUALIFIED'],completeEnclosureQualified:false},structuralWaterInventory,thermalTerminalScope:support.thermal.map(t=>({branch:t.branch,outerTerminal:t.result.outerTerminalWrench,upperTerminal:t.result.upperTerminalWrench,fullLodgeNetworkEstablished:false})),cases},
    geometry:{members:members.map(m=>({id:m.id,bodyMm:m.body,massKg:r(m.massKg),returnedWeldLegMm:m.leg})),wallPosts:posts.map(({byZ,...p})=>p),backboneRails:rails.map(r=>r.bodyMm),wetStays:stays.map(s=>s.bodyMm),wetBeams:wetBeams.map(b=>({id:b.id,bodyMm:b.bodyMm})),
      retainedPipeMounts,closedRhsEndcapsMm:retainedCaps.map(c=>({id:c.id,bodyMm:c.bodyMm})),wetUpperBeamEndplatesMm:wetEndplates,pipeGuidePostCapsMm:guidePostCaps,plantCarrierBodyMm:[plant.pipeAxisXMm-85,600,plantFloor-80,170,40,40],plantShortStanchionsMm:[-75,75].map(dx=>[plant.pipeAxisXMm+dx-10,560,plantStanchionStart,20,40,plantStanchionHeight]),
      wetFloorRibs:wet.branches.map((b,i)=>({branch:b.branch,ribs:b.floor.ribs.map(rib=>({...rib,carrierSeatNotchBodyMm:[rib.carrierSeatNotchBodyMm[0],i===0?560:600,...rib.carrierSeatNotchBodyMm.slice(2)]}))})),
      removableBracketInterfaces:removableInterfaces.map(({node,memberId,...j})=>({...j,boltHeadMaximumAcrossCornersMm:20,boltHeadReservationQualified:false,
        fabrication:'Blind tapped all-metal reinforcement pad continuously corner-welded to RHS. Separate bolted plate carries its own pipe or wet bracket; no bolt relies on an inaccessible rear nut or bare4mm RHS thread. Exact corner profile, weld continuity, local wall transfer and fastener material remain qualification duties.'})),
      noOldLowChassis:true,noOldSingleJambCantilever:true,pipeAndWetBracketsSeparate:true,requiredDpcTopAtOrBelowZMm:Math.min(...anchorRows)-80,actualDpcLevelKnown:false,
      localFinishReservation:{sourceFinishedWallYMm:input.finishedWallYMm,structuralCoreFaceYMm:face,
        finishLimitBehindPostsAndWallEndsYMm:425,clearToFrameAfterReliefMm:5,
        requiredFinishReliefMm:input.finishedWallYMm-425,postProjectionsXMm:posts.map(p=>[p.bodyMm[0],p.bodyMm[0]+p.bodyMm[3]]),
        padsRequireFinishOmissionToCore:true,coreNotchBeyondAnchorDrills:false,adoptedFinishDetail:false},
      socketAxisBare30RadiusToOutboardPostAfter5Mm:10,knownLocalSocketHoopToNewAnchorAfterTwo5Mm:Math.min(...anchorRows.flatMap(z=>[950,1270,1980,2120].flatMap(row=>[-45,45].map(d=>Math.abs(z-row-d)-3-6-10)))),sourceGeneralTransverseSchedule:null,sourceSocketToolGuardEnvelope:null,
      hoodArmInterface:{backWetFaceYMm:543,proposedBackOuterYMm:538,actualFixedArmSectionMm:[40,60],actualFixedArmZMm:[820,880],dimensionedPassiveClosure:null,wetBodyLoadTransferToPipeAdmitted:false},
      splitBackRelease:{upperBeamFrontYMm:530,backSheetAfter5Mm:3,proposedDryReturnTopZMm:1713,dryReturnAfter8LiftToBeamAfter5Mm:4,hookTopZMm:1755,hookLiftMm:8,afterLiftToGuideArmAfter5Mm:guideZ-30-1755-8-5,completeSplitBossAndM6KeySweepQualified:false},
      windowObstruction:{host:support.hostWindow,railsWithinConditionalOpeningZMm:rails.map(r=>[r.bodyMm[2],r.bodyMm[2]+r.bodyMm[5]]),projectedRailAreaMm2:railWindowArea,
        scope:'Backbone rails only within the source bounding aperture; additional pipe/wet steel and existing hoods excluded. Arched head and sash operation are not a rectangular clear-window acceptance.',notAnOwnerVisualAcceptance:true}},
    quantities:{backboneSteelKg:r(backboneMass),representedWholeSteelKg:r(baseMass),memberSteelKg:r(members.reduce((n,m)=>n+m.massKg,0)),stockLedger:stock,excluded:'fasteners, weld metal, actual insulation and undisclosed fittings; wet sheet stock is an upper bound'},
    operating:{tools,renewals,saws,panels,roomReview,rearClampCapReleaseEvidence:support.compactReceiver.operatingReview.lowerRenewalReview,
      retainedMountProfileLaw:'Actual solid mounting plates are present in every permanent-body sweep. Fitted curved rear ring/lug release follows the source matched-profile proof; gross lug/ring boxes are used for tools, not as solid obstructions through their subtracted bore.',
      representedPermanentGeometryPass:geometryPass,completePanelSweepAndOperatorSpaceQualified:false},
    diagnostics:[...(enclosureSteelFails?['TOP_EXIT_COUPLING_CONDITIONAL_STEEL_COMPARISON_FAILS']:[]),...(enclosureAnchorFails?['TOP_EXIT_COUPLING_ISOLATED_ANCHOR_SCREEN_FAILS']:[]),...(geometryPass?[]:['REPRESENTED_SHARED_FRAME_INTERCEPTS_TOOL_OR_LOWER_DRAW']),
      ...(roomReview===null?['CURRENT_SPATIAL_CONTEXT_NOT_SUPPLIED']:roomReview.allRepresentedFrameClear?[]:['SHARED_FRAME_INTERCEPTS_BOUND_ROOM_SERVICE_GEOMETRY']),
      ...(cases.some(c=>c.maximumMemberStressMpa>allowable||c.maximumWeldStressMpa>allowable||c.maximumPlateStressMpa>allowable||c.maximumRemovableJointStressMpa>allowable)?['SHARED_FRAME_CONDITIONAL_STEEL_COMPARISON_FAILS']:[]),
      ...(cases.some(c=>c.maximumIsolatedAnchorInteraction>1)?['SHARED_FRAME_ISOLATED_ANCHOR_SCREEN_FAILS']:[]),
      'ACTUAL_WALL_PAD_ROTATIONAL_STIFFNESS_LOCAL_RHS_FACE_AND_GROUP_RESISTANCE_UNQUALIFIED','WET_FLARE_SPLIT_SEAMS_UPPER_PIPE_EXIT_AND_FULL_REMOVAL_SWEEPS_UNADOPTED',
      'FIXED850_ARM_CROSSES_BACK_SHELL_WITHOUT_DIMENSIONED_PASSIVE_CLOSURE',
      'COLD_GRIP_AND_FULL_UPPER_PAYLOAD_UNQUALIFIED','SUPPLIER_MATERIAL_FROST_AND_LODGE_BOUNDARIES_REMAIN'],
    selected:false,installedAcceptance:false,completeSupportCapacity:false}
}
