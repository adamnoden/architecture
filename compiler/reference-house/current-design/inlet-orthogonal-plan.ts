/** Exact occupied-plan subtraction for the Utility's local corner returns.
 * Rectangles are min/max XY. Cells are one continuous domain, not extra stock. */
export type PlanRectangle=readonly[number,number,number,number]
export const planArea=(r:PlanRectangle)=>(r[2]-r[0])*(r[3]-r[1])
export const validPlanRectangle=(r:unknown):r is PlanRectangle=>Array.isArray(r)&&r.length===4&&r.every(Number.isFinite)&&r[2]>r[0]&&r[3]>r[1]
export function intersectPlan(a:PlanRectangle,b:PlanRectangle):PlanRectangle|null{
 const r=[Math.max(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.min(a[3],b[3])] as const
 return validPlanRectangle(r)?r:null
}
export function subtractPlan(outer:PlanRectangle,excluded:readonly PlanRectangle[]):PlanRectangle[]{
 if(!validPlanRectangle(outer)||!Array.isArray(excluded)||excluded.some(r=>!validPlanRectangle(r)))throw Error('Actual finite orthogonal floor boundary required')
 const clips=excluded.flatMap(r=>{const c=intersectPlan(outer,r);return c?[c]:[]}),axes=([0,1] as const).map(k=>[...new Set([outer[k],outer[k+2],...clips.flatMap(r=>[r[k],r[k+2]])])].sort((a,b)=>a-b)),result:PlanRectangle[]=[]
 for(let i=1;i<axes[0].length;i++)for(let j=1;j<axes[1].length;j++){
  const r=[axes[0][i-1],axes[1][j-1],axes[0][i],axes[1][j]] as const,x=(r[0]+r[2])/2,y=(r[1]+r[3])/2
  if(!clips.some(c=>x>c[0]&&x<c[2]&&y>c[1]&&y<c[3]))result.push(r)
 }
 if(!result.length)throw Error('Corner return consumes the complete floor domain')
 return result
}
export const expandPlan=(r:PlanRectangle,gap:number):PlanRectangle=>{
 if(!validPlanRectangle(r)||!Number.isFinite(gap)||gap<0)throw Error('Actual nonnegative boundary separation required')
 return[r[0]-gap,r[1]-gap,r[2]+gap,r[3]+gap]
}
