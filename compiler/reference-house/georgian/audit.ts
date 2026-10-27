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
 check(s.y-1200>=3537.5+62.5,'Full bottom landing overlaps study')
 const studyClearArea=(2600-417.5-62.5)*(3537.5-417.5-62.5)/1e6
 return {pass:failures.length===0,failures,nominalAtticHeadroom,roofHighEdgeMm:roofTop(),plantClearAreaM2:(12000-417.5-9600-62.5)*(8155-3000-125)/1e6,studyClearAreaM2:studyClearArea,stair:s,technicalHeadroomVerified:false,furnitureCarryingVerified:false,fullHistoricalSystemRevalidation:false}
}
