const subtract=(a,b)=>a.map((v,i)=>v-b[i]);
const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
const clamp=v=>Math.max(0,Math.min(1,v));

// Minimum distance between two closed finite segments. Parallel and point
// segments are included because duct routes contain short vertical returns.
export function segmentDistance(a,b,c,d){
  const u=subtract(b,a),v=subtract(d,c),w=subtract(a,c);
  const A=dot(u,u),B=dot(u,v),C=dot(v,v),D=dot(u,w),E=dot(v,w);
  let s=0,t=0;
  if(A<1e-12)t=C?clamp(E/C):0;
  else if(C<1e-12)s=clamp(-D/A);
  else{
    const denominator=A*C-B*B;
    s=denominator>1e-12?clamp((B*E-C*D)/denominator):0;
    t=(B*s+E)/C;
    if(t<0){t=0;s=clamp(-D/A);}
    if(t>1){t=1;s=clamp((B-D)/A);}
  }
  return Math.hypot(...w.map((n,i)=>n+s*u[i]-t*v[i]));
}

export function pathSeparation(a,b){
  let minimum=Infinity;
  for(let i=1;i<a.length;i++)for(let j=1;j<b.length;j++)
    minimum=Math.min(minimum,segmentDistance(a[i-1],a[i],b[j-1],b[j]));
  return minimum;
}

export function pointRectDistance(p,r){
  return Math.hypot(Math.max(r[0]-p[0],p[0]-r[0]-r[2],0),Math.max(r[1]-p[1],p[1]-r[1]-r[3],0));
}

// Distance to a finite upright cylinder is convex along a straight segment.
// Ternary minimisation keeps a bracket and subtracts its Lipschitz error.
export function segmentBodyDistance(a,b,body,z,radius=300){
  const delta=subtract(b,a),length=Math.hypot(...delta);
  const value=t=>{
    const p=a.map((v,i)=>v+t*delta[i]);
    return Math.hypot(Math.max(Math.hypot(p[0]-body[0],p[1]-body[1])-radius,0),Math.max(z[0]-p[2],p[2]-z[1],0));
  };
  let lo=0,hi=1;
  for(let i=0;i<70;i++){
    const left=(2*lo+hi)/3,right=(lo+2*hi)/3;
    if(value(left)<value(right))hi=right;else lo=left;
  }
  return Math.min(value(0),value(1),value((lo+hi)/2))-length*(hi-lo)/2;
}
