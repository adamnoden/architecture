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

export {rhs,element,factor,matvec,sub,cross}
