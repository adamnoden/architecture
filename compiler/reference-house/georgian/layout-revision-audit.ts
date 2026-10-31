import {layoutRevision as d,revisionOpenings,entryVoid} from './layout-revision.js'
export function auditRevisionAccess(level:'GROUND'|'FIRST'){
 const radius=300,step=50,s=d.stair,solid=(x:number,y:number)=>{
  if(x<417.5+radius||x>11582.5-radius||y<417.5+radius||y>11582.5-radius)return true
  if(x>3832.5-radius&&x<8167.5+radius&&y>3832.5-radius&&y<8167.5+radius)return true
  if(x>s.x-radius&&x<s.x+s.width+radius&&y>s.y-radius&&y<s.y+s.length+radius)return true
  if(level==='FIRST'&&x>entryVoid.x-radius&&x<entryVoid.x+entryVoid.width+radius&&y<entryVoid.y+entryVoid.depth+radius)return true
  for(const w of d.partitions[level]){const h=w.a[1]===w.b[1],along=h?x:y,cross=h?y:x,lo=h?w.a[0]:w.a[1],hi=h?w.b[0]:w.b[1],at=h?w.a[1]:w.a[0]
   if(Math.abs(cross-at)>62.5+radius||along<lo-radius||along>hi+radius)continue
   if(!revisionOpenings(level).filter(o=>o.wall===w.id&&o.kind==='door').some(o=>along>=o.centre-o.width/2+radius&&along<=o.centre+o.width/2-radius))return true
  }
  return false
 }
 const start=level==='GROUND'?[6000,1500]:[2300,3500],seen=new Set<string>(),queued=new Set<string>(),queue=[start],key=(x:number,y:number)=>x+','+y
 queued.add(key(...start as [number,number]))
 for(let i=0;i<queue.length;i++){const [x,y]=queue[i],k=key(x,y);if(solid(x,y))continue;seen.add(k);for(const [dx,dy]of [[step,0],[-step,0],[0,step],[0,-step]]){const xx=x+dx,yy=y+dy,kk=key(xx,yy);if(!queued.has(kk)&&!solid(xx,yy)){queued.add(kk);queue.push([xx,yy])}}}
 const points=[...seen].map(k=>k.split(',').map(Number)),rooms=d.rooms[level].map(r=>({id:r.id,reachable:r.boxes.some(b=>points.some(([x,y])=>x>b.x+radius&&x<b.x+b.width-radius&&y>b.y+radius&&y<b.y+b.depth-radius))}))
 return {pass:rooms.every(r=>r.reachable),rooms,personDiameterMm:600,gridMm:step,courtyardShortcut:false,furnitureCarryingVerified:false}
}
export const revisionMetrics=()=>({westGalleryMm:3832.5-(d.stair.x+d.stair.width),stairNorth:d.stair.y+d.stair.length,courtNorthOuterFace:8167.5,stairSouthLandingMm:d.stair.y-(2650+62.5),pantryNorthRoomFace:8105+62.5,courtNorthRoomFace:8167.5,studyClearAreaM2:((3400-417.5-62.5)*(2650-417.5-62.5)+(4800-3400)*(1200-417.5-62.5))/1e6,formerStudyClearAreaM2:(2600-417.5-62.5)*(3537.5-417.5-62.5)/1e6,serviceAreasGrossM2:{utility:2500*2550/1e6,plant:2500*4100/1e6,pantry:2500*1455/1e6},atriumAreaM2:entryVoid.width*entryVoid.depth/1e6,upperBridgeClearMm:3832.5-(2650+62.5),guardingVerified:false,headroomVerified:false})
