import type { DrawingPrimitiveV2 } from '../publication-drawing-v2/model.js'
import type { PlanPaperProjection } from '../publication-drawing/projection.js'
import type { AdeReturnStair } from './model.js'

export const returnStairToDrawingPrimitives = (s: AdeReturnStair, p: PlanPaperProjection): DrawingPrimitiveV2[] => {
  const half=s.riserCount/2, run=(half-1)*s.going,rise=s.floorToFloor/s.riserCount
  const x=s.origin.x,y=s.origin.y,w=s.clearWidth,gap=s.wellGap,end=x+s.landingDepth+run
  const metadata={sources:s.provenance.sourceIds.join(','),authority:s.provenance.authority,precision:s.provenance.precision,
    stair:s.id,representation:'coordination-clear-flight-plan',structuralDetailSelected:false,headroomVerified:false}
  const out:DrawingPrimitiveV2[]=[]
  const line=(id:string,x0:number,y0:number,x1:number,y1:number,overhead=false)=>out.push({kind:'line',id:`${s.id}-${id}`,a:p.point(x0,y0),b:p.point(x1,y1),role:'secondary',dash:overhead?'overhead':undefined,metadata})
  // Intermediate landing spans the two parallel flights, with full clear depth.
  line('landing-west',x,y,x,y+2*w+gap)
  line('landing-south',x,y,x+s.landingDepth,y)
  line('landing-north',x,y+2*w+gap,x+s.landingDepth,y+2*w+gap)
  for(const [flight,fy] of [[0,y],[1,y+w+gap]] as const){
    const overhead=s.level==='GROUND'&&flight===1
    line(`flight-${flight}-south`,x+s.landingDepth,fy,end,fy,overhead)
    line(`flight-${flight}-north`,x+s.landingDepth,fy+w,end,fy+w,overhead)
    for(let i=0;i<half;i++){
      const px=flight===0?end-i*s.going:x+s.landingDepth+i*s.going
      const riser=flight===0?i+1:half+i+1
      line(`riser-${riser}`,px,fy,px,fy+w,s.level==='GROUND'&&riser*rise>s.cutHeight)
    }
  }
  const ay=s.level==='GROUND'?y+w/2:y+w+gap+w/2
  const ax0=end-200,ax1=x+s.landingDepth+200
  line('direction',ax0,ay,ax1,ay)
  line('arrow-a',ax1,ay,ax1+150,ay+90)
  line('arrow-b',ax1,ay,ax1+150,ay-90)
  const t=p.point((ax0+ax1)/2,ay+200)
  out.push({kind:'text',id:`${s.id}-direction-label`,x:t.x,y:t.y,value:s.level==='GROUND'?'UP':'DN',role:'marker',anchor:'middle',metadata})
  // A short oblique break distinguishes the plan cut from missing treads.
  if(s.level==='GROUND'){
    const bx=end-5.5*s.going
    line('cut-a',bx-90,y-40,bx+90,y+w/2)
    line('cut-b',bx+90,y+w/2,bx-90,y+w+40)
  }
  return out
}
