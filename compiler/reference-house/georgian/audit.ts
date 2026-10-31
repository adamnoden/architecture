import {design,openings,roofHeight,roofTop,type Level,type Box} from './source.js'
const overlap=(a:Box,b:Box)=>Math.min(a.x+a.width,b.x+b.width)>Math.max(a.x,b.x)&&Math.min(a.y+a.depth,b.y+b.depth)>Math.max(a.y,b.y)
const inside=(b:Box,a:Box)=>b.x>=a.x&&b.y>=a.y&&b.x+b.width<=a.x+a.width&&b.y+b.depth<=a.y+a.depth
export const auditGeorgianReplan=()=>{
 const failures:string[]=[]
 const check=(pass:boolean,message:string)=>{if(!pass)failures.push(message)}
 const d=design,s=d.stair
 for(const level of ['GROUND','FIRST'] as const){
  const rooms=d.rooms[level]
  for(let i=0;i<rooms.length;i++)for(let j=i+1;j<rooms.length;j++)for(const a of rooms[i].boxes)for(const b of rooms[j].boxes)check(!overlap(a,b),`${level}: ${rooms[i].id} overlaps ${rooms[j].id}`)
  const stair={x:s.x,y:s.y,width:s.width,depth:s.length}
  for(const r of rooms)for(const b of r.boxes)check(!overlap(stair,b),`${level}: ${r.id} overlaps the full stair`)
  for(const side of ['north','south','east','west']){
   const a=openings(level).filter(o=>o.wall==='outer-'+side)
   for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)check(Math.abs(a[i].centre-a[j].centre)>(a[i].width+a[j].width)/2,`${level} ${side}: overlapping facade apertures`)
  }
 }
 const g=d.rooms.GROUND.find(r=>r.id==='G-PLANT')!.boxes[0]
 for(const [id,b] of Object.entries({riser:d.services.riser,water:d.services.plantWater,dry:d.services.plantDry,working:d.services.plantWorking}))check(inside(b,{x:g.x+62.5,y:g.y+62.5,width:12000-417.5-g.x-62.5,depth:g.depth-125}),`Plant ${id} does not fit inside wall faces`)
 check(!overlap(d.services.plantWorking,d.services.plantWater)&&!overlap(d.services.plantWorking,d.services.plantDry)&&!overlap(d.services.plantWorking,d.services.riser),'Plant working/replacement aisle occupied')
 for(const [id,room]of [['studyDesk','G-STUDY'],['studyChair','G-STUDY'],['cloakHanging','G-CLOAK'],['bed2','U-BED2'],['bed3','U-BED3'],['bed4','U-BED4'],['principal','U-PRINCIPAL'],['wardrobeWest','U-WIC'],['wardrobeEastNorth','U-WIC'],['wardrobeEastSouth','U-WIC']] as const){
  const r=[...d.rooms.GROUND,...d.rooms.FIRST].find(r=>r.id===room)!
  check(r.boxes.some(b=>inside(d.furniture[id],{x:b.x+(b.x===0?417.5:62.5),y:b.y+(b.y===0?417.5:62.5),width:b.width-(b.x===0?417.5:62.5)-(b.x+b.width===12000?417.5:62.5),depth:b.depth-(b.y===0?417.5:62.5)-(b.y+b.depth===12000?417.5:62.5)})),`${id} outside finished room reservation`)
 }
 const upperArrivalMinX=s.x+s.flight+s.well
 const nominalAtticHeadroom=roofHeight(upperArrivalMinX)-d.roof.buildZone-d.levels.attic
 check(nominalAtticHeadroom>=2100,'Attic arrival has less than 2100 mm nominal clear headroom')
 check(s.flight>=1200&&s.landing>=s.flight&&s.rise===d.levels.first/s.risers,'Stair dimensions inconsistent')
 check(!d.roof.flatRoofsAllowed&&d.roof.upperPitchDeg>=30,'Flat/low-slope roof candidate rejected')
 check(2500+62.5+1200<=4200-417.5,'Ground turn into east gallery constricted')
 check(9400-62.5-(7800+417.5)>=1100,'Upper gallery less than 1100 mm clear')
 check(9400-62.5-(7800+417.5)>=1100,'North cross-landing less than 1100 mm clear')
 check(s.y-1200>=3537.5+62.5,'Full bottom landing overlaps study')
 const studyClearArea=(2600-417.5-62.5)*(3537.5-417.5-62.5)/1e6
 return {pass:failures.length===0,failures,nominalAtticHeadroom,roofHighEdgeMm:roofTop(),plantClearAreaM2:(12000-417.5-9600-62.5)*(8155-3000-125)/1e6,studyClearAreaM2:studyClearArea,stair:s,technicalHeadroomVerified:false,furnitureCarryingVerified:false,fullHistoricalSystemRevalidation:false}
}

/** Conservative 100 mm raster, 600 mm person envelope, doors treated open.
 * This verifies connected routes, not escape compliance or furniture carrying. */
export const auditRoomAccess=(level:'GROUND'|'FIRST')=>{
 const radius=300,step=100,s=design.stair
 const solid=(x:number,y:number)=>{
  if(x<417.5+radius||x>11582.5-radius||y<417.5+radius||y>11582.5-radius)return true
  // Do not use open courtyard as a shortcut between rooms.
  if(x>3782.5-radius&&x<8217.5+radius&&y>3782.5-radius&&y<8217.5+radius)return true
  if(x>s.x-radius&&x<s.x+s.width+radius&&y>s.y&&y<s.y+s.length+radius)return true
  for(const w of design.partitions[level]){
   const h=w.a[1]===w.b[1],along=h?x:y,cross=h?y:x,lo=h?w.a[0]:w.a[1],hi=h?w.b[0]:w.b[1],at=h?w.a[1]:w.a[0]
   if(Math.abs(cross-at)>62.5+radius||along<lo-radius||along>hi+radius)continue
   const holes=openings(level).filter(o=>o.wall===w.id&&o.kind==='door')
   if(!holes.some(o=>along>=o.centre-o.width/2+radius&&along<=o.centre+o.width/2-radius))return true
  }
  return false
 }
 const start=level==='GROUND'?[6000,1000]:[2600,4200],key=(x:number,y:number)=>`${x},${y}`
 const seen=new Set<string>(),queue:[number,number][]=[[start[0],start[1]]]
 for(let i=0;i<queue.length;i++){
  const [x,y]=queue[i],k=key(x,y);if(seen.has(k)||solid(x,y))continue;seen.add(k)
  for(const [dx,dy]of [[step,0],[-step,0],[0,step],[0,-step]]){const xx=x+dx,yy=y+dy;if(!seen.has(key(xx,yy))&&!solid(xx,yy))queue.push([xx,yy])}
 }
 const rooms=design.rooms[level].map(r=>({id:r.id,reachable:r.boxes.some(b=>[...seen].some(k=>{const [x,y]=k.split(',').map(Number);return x>b.x+417.5&&x<b.x+b.width-417.5&&y>b.y+417.5&&y<b.y+b.depth-417.5}))}))
 return {pass:rooms.every(r=>r.reachable),rooms,gridMm:step,personDiameterMm:radius*2,courtyardShortcut:false}
}
