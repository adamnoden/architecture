/** Finite centreline bends with a rigorous chord-to-arc distance allowance. */
const plus=(a,b)=>a.map((v,i)=>v+b[i]);
const minus=(a,b)=>a.map((v,i)=>v-b[i]);
const times=(a,s)=>a.map(v=>v*s);
const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
const unit=a=>times(a,1/Math.hypot(...a));

export function finiteBends(vertices,radius=75,maxStepDeg=1){
  if(!Number.isFinite(radius)||radius<=0||!Number.isFinite(maxStepDeg)||maxStepDeg<=0||maxStepDeg>90)
    throw new Error('Bend radius and angular step must be positive finite bounds');
  if(vertices.length<3||vertices.some(p=>p.length!==3||p.some(v=>!Number.isFinite(v))))
    throw new Error('Finite three-dimensional vertices are required');
  if(vertices.slice(1).some((p,i)=>Math.hypot(...minus(p,vertices[i]))===0))
    throw new Error('Remove duplicate vertices');
  const bends=[];
  for(let i=1;i<vertices.length-1;i++){
    const incoming=unit(minus(vertices[i],vertices[i-1]));
    const outgoing=unit(minus(vertices[i+1],vertices[i]));
    const theta=Math.acos(Math.max(-1,Math.min(1,dot(incoming,outgoing))));
    if(theta<1e-10)throw new Error('Remove collinear interior vertices');
    if(Math.PI-theta<1e-10)throw new Error('A reversal needs a separate bend design');
    const tangent=radius*Math.tan(theta/2);
    const start=minus(vertices[i],times(incoming,tangent));
    const end=plus(vertices[i],times(outgoing,tangent));
    const normal=unit(minus(outgoing,times(incoming,dot(incoming,outgoing))));
    const centre=plus(start,times(normal,radius));
    const a=times(minus(start,centre),1/radius);
    const b=times(minus(end,centre),1/radius);
    const axis=unit(minus(b,times(a,Math.cos(theta))));
    const count=Math.ceil(theta/(maxStepDeg*Math.PI/180));
    const arc=Array.from({length:count+1},(_,j)=>{
      const angle=theta*j/count;
      return plus(centre,times(plus(times(a,Math.cos(angle)),times(axis,Math.sin(angle))),radius));
    });
    bends.push({vertex:vertices[i],theta,tangent,start,end,arc});
  }
  for(let i=0;i<vertices.length-1;i++){
    const used=(i===0?0:bends[i-1].tangent)+(i===vertices.length-2?0:bends[i].tangent);
    if(used>Math.hypot(...minus(vertices[i+1],vertices[i]))+1e-8)throw new Error(`Bends consume leg ${i}`);
  }
  return {
    path:[vertices[0],...bends.flatMap(b=>b.arc),vertices.at(-1)],
    hausdorffError:radius*(1-Math.cos(maxStepDeg*Math.PI/360)),
    bends:bends.map(({vertex,theta,tangent})=>({vertex,angleDeg:theta*180/Math.PI,tangent})),
  };
}

