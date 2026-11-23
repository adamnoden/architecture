/** Distinguish actual metal conflicts from the deliberately replaced own-branch wrap. */
import{writeFileSync}from'node:fs'
import{segmentBoxDistance}from'../service-interface-geometry.mjs'
process.env.OVID_SIDE_SILENT='1'
const {source,room,r,bodies}=await import('./frame.mjs'),wrapping=r.pipe.radialInsulationMm+r.pipe.jacketEachSideMm,
 gap=(a,b)=>{const d=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return d.some(v=>v>0)?Math.hypot(...d.map(v=>Math.max(v,0))):Math.max(...d)},
 expand=(b,t)=>[...b.slice(0,3).map(v=>v-t),...b.slice(3).map(v=>v+2*t)],shrink=(b,t)=>expand(b,-t),
 blades=bodies.filter(b=>b.id.includes('/blade/')),checks=[]
for(const b of blades){
 const branch=b.id.split('/')[2],cover=expand(b.box,wrapping),ownValve=room.indoorCuts.valves.find(v=>v.branch===branch),valveMetal=shrink(ownValve.insulatedValveBodyEnvelopeMm,wrapping)
 for(const p of r.paths)for(let k=1;k<p.pointsMm.length;k++)checks.push({blade:b.id,kind:p.id.startsWith(branch+'/')?'own-pipe-metal':'independent-branch-pipe-and-wrap',source:p.id+'/'+(k-1),reserveMm:segmentBoxDistance(p.pointsMm[k-1],p.pointsMm[k],p.id.startsWith(branch+'/')?b.box:cover)-r.pipe.maximumOuterDiameterMm/2-(p.id.startsWith(branch+'/')?0:wrapping)-20})
 for(const p of r.paths)for(const c of p.corners)checks.push({blade:b.id,kind:p.id.startsWith(branch+'/')?'own-fitting-metal-territory':'independent-branch-fitting-and-wrap',source:c.id,reserveMm:gap(p.id.startsWith(branch+'/')?b.box:cover,p.id.startsWith(branch+'/')?shrink(c.territoryBoxMm,wrapping):c.territoryBoxMm)-20})
 checks.push({blade:b.id,kind:'own-valve-metal',source:ownValve.id,reserveMm:gap(b.box,valveMetal)-20})
 for(const o of r.checkedObstacles)checks.push({blade:b.id,kind:'joined-wrap-to-occupied-obstacle',source:o.id,reserveMm:gap(cover,o.boxMm)-10})
 for(const v of room.indoorCuts.valves)for(const g of v.grips)checks.push({blade:b.id,kind:'joined-wrap-to-ordinary-arm',source:v.id,reserveMm:segmentBoxDistance(room.indoorCuts.ordinaryOperator.shoulderMm,g.pointMm,cover)-room.indoorCuts.ordinaryOperator.armRadiusMm-10})
 checks.push({blade:b.id,kind:'joined-wrap-to-uncut-core',source:'utility-north/bare-core-face',reserveMm:2480-cover[1]-cover[4]-20})
 // The body is stripped before source-specified west withdrawal. Actual capture/tools remain unqualified.
 const bareValveSweep=[valveMetal[0]-275,valveMetal[1],valveMetal[2],valveMetal[3]+275,valveMetal[4],valveMetal[5]]
 checks.push({blade:b.id,kind:'bare-valve-first-west-draw',source:ownValve.id,reserveMm:gap(b.box,bareValveSweep)-10})
}
const result={schema:'had-side-receiver-prototype-geometry/1',source:source.source,checks,conflicts:checks.filter(v=>v.reserveMm<0),minimumByKind:Object.fromEntries([...new Set(checks.map(v=>v.kind))].map(k=>[k,Math.min(...checks.filter(v=>v.kind===k).map(v=>v.reserveMm))])),
 actualJointedInsulationAndJacketQualified:false,actualMetalFittingAndValveExteriorQualified:false,actualClampEndlandsAndFactoryToolCaptureQualified:false,actualColdBridgeAndFinishClosureQualified:false,
 scope:'Own-branch metal territory is distinguished from insulation which must be replaced by one demountable joined26mm envelope. The support exit at the ambient frame remains a real unqualified thermal/jacket interface; no complete warm boundary is claimed. Both10mm relative settings remain. No interference is waived for another branch or occupied apparatus.'}
writeFileSync(new URL('geometry.results.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({conflicts:result.conflicts,minima:result.minimumByKind},null,2))
