// Recheck the complete service holes against the provisional SAP-C1 interface.
// Arch ring distances use the finite annular sector, including both end faces.
function ringGap(along,z,opening,radius){
  const half=opening.width/2, rise=opening.head-opening.spring, R=(half**2+rise**2)/(2*rise);
  const dx=along-opening.centre, dz=z-(opening.head-R), d=Math.hypot(dx,dz);
  const low=Math.acos(half/R), angle=Math.atan2(dz,dx);
  if(angle>=low&&angle<=Math.PI-low) return Math.max(R-d,d-R-opening.radialRingTrial,0)-radius;
  const edge=angle<low?low:Math.PI-low, c=Math.cos(edge), s=Math.sin(edge);
  const projection=Math.max(R,Math.min(R+opening.radialRingTrial,dx*c+dz*s));
  return Math.hypot(dx-projection*c,dz-projection*s)-radius;
}
export function serviceApertures(model,structure,corner){
  const openings=structuredClone(model.archOpeningRegister);
  for(const e of structure.openingEdits){
    const opening=openings[e.level].find(q=>q.id===e.id&&q.wall===e.side);
    if(opening?.centre!==e.old)throw Error('Opening no longer matches SAP-C1 '+e.id);
    opening.centre=e.new;
  }
  const half=structure.jambAndTies.widthNormalAlong[1]/2;
  const bands=[[0,corner.geometry.RCtoe],...structure.jambAndTies.axes.map(a=>[a-half,a+half])];
  const solids=[...bands,...bands.map(([a,b])=>[model.shell-b,model.shell-a])];
  function screen(p,point,r=p.r){
    const [x,y,Z]=point, wall=x===0?'outer-west':x===model.shell?'outer-east':y===0?'outer-south':'outer-north';
    const along=wall.endsWith('east')||wall.endsWith('west')?y:x, z=Z-p.level*model.sections.firstFFL;
    const concrete=Math.min(...solids.map(([lo,hi])=>Math.max(lo-along,along-hi,0)-r));
    const rows=openings[p.level?'FIRST':'GROUND'].filter(q=>q.wall===wall).map(q=>{
      const ring=ringGap(along,z,q,r);
      if(p.cassette&&q.id===(p.windowHead??'east-window-2')){
        const hw=q.width/2,rise=q.head-q.spring,R=(hw**2+rise**2)/(2*rise);
        return {ring,opening:R-Math.hypot(along-q.centre,z-q.head+R)-r-75};
      }
      const opening=Math.hypot(Math.max(Math.abs(along-q.centre)-q.width/2,0),Math.max((q.sill??0)-z,z-q.head,0))-r;
      return {ring,opening};
    });
    const ring=Math.min(...rows.map(row=>row.ring)), aperture=Math.min(...rows.map(row=>row.opening));
    return {wall,point,radius:r,ring,aperture,concrete,minimum:Math.min(ring,aperture,concrete)};
  }
  const replacementPoints={'study-supply':[3045,0,2100],'living-supply':[3090,12000,2100],
    'bed2-supply':[3045,0,5550],'bed3-supply':[8955,0,5550],'principal-supply':[12000,8800,6300]};
  const ports=model.exteriorPortGeometry.map(p=>{
    const proposed=replacementPoints[p.id];
    const axis=screen(p,p.p);
    let replacement=null;
    if(proposed){
      const face=screen(p,proposed,200), hole=screen(p,proposed);
      const along=face.wall.endsWith('east')||face.wall.endsWith('west')?proposed[1]:proposed[0];
      const z=proposed[2]-p.level*model.sections.firstFFL;
      let faceGap=face.concrete;
      for(const q of openings[p.level?'FIRST':'GROUND'].filter(q=>q.wall===face.wall)){
        // Rectangle-to-rectangle separation. Enclose the whole finite ring
        // by its wider bounding rectangle to give a conservative lower bound.
        const dx=Math.abs(along-q.centre)-q.width/2-200;
        const glass=Math.hypot(Math.max(dx,0),Math.max((q.sill??0)-z-200,z-q.head-200,0));
        const t=q.radialRingTrial;
        const ring=Math.hypot(Math.max(dx-t,0),Math.max(q.spring-z-200,z-q.head-t-200,0));
        faceGap=Math.min(faceGap,glass,ring);
      }
      replacement={...hole,face:[400,400],faceClearance:faceGap};
    }
    return {id:p.id,...axis,replacement};
  });
  const headGroups=[
    ['GROUND','east-window-0','utility-exhaust','utility-condensate',220,2500],
    ['FIRST','west-window-3','rear-bath-exhaust','rear-bath-condensate',245,2500],
    ['GROUND','north-window-3','kitchen-exhaust','kitchen-condensate',-120,2490],
    ['GROUND','north-window-4','cooker-exhaust',null,0,2565]
  ];
  const fixedHeads=headGroups.map(([level,id,main,drain,offset,z])=>{
    const q=openings[level].find(o=>o.id===id), h=q.width/2,rise=q.head-q.spring,R=(h*h+rise*rise)/(2*rise);
    const bottom=2200, border=75, base=level==='GROUND'?0:model.sections.firstFFL;
    const mainOffset=main==='kitchen-exhaust'?100:0;
    const holes=[[main,mainOffset],...(drain?[[drain,offset]]:[])].map(([key,local])=>{
      const r=ports.find(p=>p.id===key).radius, along=q.centre+local;
      const gap=Math.min(R-Math.hypot(local,z-q.head+R)-r,h-Math.abs(local)-r,z-bottom-r)-border;
      const point=q.wall==='outer-west'?[0,along,z+base]:q.wall==='outer-east'?[model.shell,along,z+base]:[along,model.shell,z+base];
      // Large local outlets use a square face. The narrow kitchen fan needs a
      // round fascia; the cooker uses its separate round weather terminal.
      const circular=key==='utility-exhaust'||key==='kitchen-exhaust'||key==='cooker-exhaust';
      const halfFace=key===drain?30:key==='kitchen-exhaust'?150:key==='utility-exhaust'?165:180;
      const radial=circular?Math.hypot(local,z-q.head+R)+halfFace:
        Math.hypot(Math.abs(local)+halfFace,Math.abs(z-q.head+R)+halfFace);
      const faceGap=Math.min(R-radial,h-Math.abs(local)-halfFace,z-bottom-halfFace)-border;
      return {id:key,radius:r,point,frameGap:gap,faceShape:circular?'circle':'square',faceWidth:2*halfFace,faceGap};
    });
    const archedArea=R*R*Math.acos((R-rise)/R)-(R-rise)*h;
    return {level,wall:q.wall,id,width:q.width,along:q.centre,bandBottom:bottom,border,holes,
      grossHeadAreaM2:(archedArea+q.width*(q.spring-bottom))/1e6,
      interHoleWebMM:drain?Math.abs(offset-mainOffset)-holes[0].radius-holes[1].radius:null,
      betweenWeatherFacesMM:drain?Math.abs(offset-mainOffset)-(holes[0].faceWidth+holes[1].faceWidth)/2:null};
  });
  return {structuralCandidate:structure.candidate,ports,fixedHeads,
    scope:'Furnished services design against the provisional structural apertures. Centre/ring, daylight rectangle, continuous jamb/toe and new inlet faces only. Existing port approval, wall section and air performance are not implied.'};
}
