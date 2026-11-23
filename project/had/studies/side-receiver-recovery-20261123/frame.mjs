import{readFileSync,writeFileSync}from'node:fs'
import{authored,source}from'./case-reader.mjs'
const candidate=authored.candidate
import{rhs,element,factor,matvec,sub,cross}from'./frame-kernel.ts'
import{segmentBoxDistance}from'../service-interface-geometry.mjs'
const room=source.joinedDirection.room,r=room.indoorRoutes,bank=room.bankReceiver,
 rho=8000/1e9,postX=candidate.postXMm,plateT=candidate.mountPlateThicknessMm,postRear=2480-plateT,postDepth=candidate.postDepthMm,postFront=postRear-postDepth,postY=postRear-postDepth/2,barY=postY,mountZ=candidate.mountZMm,postBottom=candidate.postBottomMm,postTop=candidate.postTopMm,armX=candidate.landAxisXMm,armW=candidate.bladeWidthMm,armH=candidate.bladeHeightMm,postSection=rhs(candidate.postWidthMm,postDepth,candidate.postWallMm),barSection=rhs(postDepth,candidate.barHeightMm,candidate.barWallMm),nodes=[],members=[],stock=[],bodies=[],pointLoads=[],rowNodes=[],settings={postX,postY,mountZ,postBottom,postTop,armX,armW,armH,postWidthMm:candidate.postWidthMm,postDepthMm:postDepth,postWallMm:candidate.postWallMm,barWidthMm:postDepth,barHeightMm:candidate.barHeightMm,barWallMm:candidate.barWallMm,mountPlateMm:[candidate.mountPlateWidthMm,candidate.mountPlateHeightMm,plateT]}
const node=(id,p,restrained=[])=>{nodes.push({id,p,restrained});return nodes.length-1}
const addMember=(id,a,b,pa,pb,s,body,solid=false)=>{const massKg=s.a*Math.hypot(...sub(pb,pa))*rho;members.push({id,a,b,pa,pb,s,body,massKg,solid});bodies.push({id,box:body});return members.length-1}
const rowZ=bank.receivers.map(v=>v.centreMm[2]-12.5-armH/2),postNodes=new Map()
for(const z of [...new Set([postBottom,postTop,...mountZ,...rowZ])].sort((a,b)=>a-b))postNodes.set(z,node('post/'+z,mountZ.includes(z)?[postX,2550,z]:[postX,postY,z],mountZ.includes(z)?[0,1,2,3,5]:[]))
const zs=[...postNodes.keys()]
for(let k=1;k<zs.length;k++)addMember('post/'+k,postNodes.get(zs[k-1]),postNodes.get(zs[k]),[postX,postY,zs[k-1]],[postX,postY,zs[k]],postSection,[postX-candidate.postWidthMm/2,postY-postDepth/2,zs[k-1],candidate.postWidthMm,postDepth,zs[k]-zs[k-1]])
for(let k=0;k<bank.receivers.length;k++){
 const rec=bank.receivers[k],[x,y,z]=rec.centreMm,barZ=rowZ[k],actualArmX=[rec.branch==='utility'&&rec.side==='below'?candidate.utilityBelowLeftLandXMm:armX[0],armX[1]],leftRoot=node(rec.id+'/left-root',[actualArmX[0],barY,barZ]),bearings=[]
 addMember(rec.id+'/bar',leftRoot,postNodes.get(barZ),[actualArmX[0]-armW/2,barY,barZ],[postX-candidate.postWidthMm/2,barY,barZ],barSection,[actualArmX[0]-armW/2,postFront,barZ-candidate.barHeightMm/2,postX-candidate.postWidthMm/2-(actualArmX[0]-armW/2),postDepth,candidate.barHeightMm])
 for(let side=0;side<2;side++){
  const ax=actualArmX[side],loadNode=node(rec.id+'/bearing/'+side,[ax,y,z-12.5]);bearings.push(loadNode)
  const root=side===0?leftRoot:postNodes.get(barZ),s={a:armW*armH,iy:armH*armW**3/12,iz:armW*armH**3/12,j:armH*armW**3/3*(1-.63*armW/armH),y:armH,z:armW,t:armW}
  addMember(rec.id+'/blade/'+side,loadNode,root,[ax,rec.metalComparisonBoxMm[1],barZ],[ax,postFront,barZ],s,[ax-armW/2,rec.metalComparisonBoxMm[1],barZ-armH/2,armW,postFront-rec.metalComparisonBoxMm[1],armH],true)
 }
 rowNodes.push({receiver:rec,bearings,weights:[(actualArmX[1]-x)/(actualArmX[1]-actualArmX[0]),(x-actualArmX[0])/(actualArmX[1]-actualArmX[0])]})
}
for(const z of mountZ){const box=[postX-candidate.mountPlateWidthMm/2,postRear,z-candidate.mountPlateHeightMm/2,candidate.mountPlateWidthMm,plateT,candidate.mountPlateHeightMm],massKg=candidate.mountPlateWidthMm*plateT*candidate.mountPlateHeightMm*rho;stock.push({id:'mount-plate/'+z,box,massKg,point:[postX,postRear+plateT/2,z],node:postNodes.get(z)});bodies.push({id:'mount-plate/'+z,box})}
const N=nodes.length*6,K=Array.from({length:N},()=>Array(N).fill(0)),own=Array(N).fill(0),es=members.map(m=>element(m,nodes)),dofs=members.map(m=>[...Array.from({length:6},(_,j)=>m.a*6+j),...Array.from({length:6},(_,j)=>m.b*6+j)])
for(let e=0;e<es.length;e++)for(let a=0;a<12;a++){own[dofs[e][a]]+=es[e].globalF[a];for(let b=0;b<12;b++)K[dofs[e][a]][dofs[e][b]]+=es[e].global[a][b]}
for(const s of stock){const f=[0,0,-s.massKg*9.81],m=cross(sub(s.point,nodes[s.node].p),f);for(let j=0;j<3;j++){own[s.node*6+j]+=f[j];own[s.node*6+3+j]+=m[j]}}
const free=Array.from({length:N},(_,i)=>i).filter(i=>!nodes[Math.floor(i/6)].restrained.includes(i%6)),solve=factor(free.map(i=>free.map(j=>K[i][j])))
function stress(m,e,end){const L=e.length,q=e.axes.map(axis=>-m.massKg*9.81/L*axis[2]),places=[0,L];for(const c of [1,2])if(q[c]){const x=-end[c]/q[c];if(x>0&&x<L)places.push(x)}const axial=Math.max(...places.map(x=>Math.abs(-end[0]-q[0]*x)))/m.s.a,My=Math.max(...places.map(x=>Math.abs(-end[4]-end[2]*x-q[2]*x*x/2))),Mz=Math.max(...places.map(x=>Math.abs(-end[5]+end[1]*x+q[1]*x*x/2))),normal=axial+My*m.s.z/2/m.s.iy+Mz*m.s.y/2/m.s.iz,
 torque=m.solid?3*Math.abs(end[3])/(m.s.y*m.s.z**2)*(1+.6*m.s.z/m.s.y):Math.abs(end[3])/(2*(m.s.y-m.s.t)*(m.s.z-m.s.t)*m.s.t),shear=1.5*Math.max(...places.map(x=>Math.hypot(-end[1]-q[1]*x,-end[2]-q[2]*x)))/m.s.a;return Math.hypot(normal,Math.sqrt(3)*(torque+shear))}
const cases=[]
for(const up of [-1,1])for(const ut of [-1,0,1])for(const pp of [-1,1])for(const pt of [-1,0,1])for(const uPick of ['below','above'])for(const pPick of ['below','above']){
 const f=[...own],labels=[]
 for(const [branch,pSign,tSign,pick]of[['utility',up,ut,uPick],['plant',pp,pt,pPick]]){
  const action=bank.reactions.find(a=>a.branch===branch).cases.find(v=>v.pressureSign===pSign&&v.thermalSign===tSign),row=rowNodes.find(v=>v.receiver.branch===branch&&v.receiver.side===pick);labels.push({branch,pSign,tSign,pick,sourceForceN:action.pipeComparisonForceN[2]})
  for(let k=0;k<2;k++)f[row.bearings[k]*6+2]+=action.pipeComparisonForceN[2]*row.weights[k]
 }
 const u=Array(N).fill(0),answer=solve(free.map(d=>f[d]));free.forEach((d,k)=>u[d]=answer[k]);const reaction=sub(matvec(K,u),f),residual=Math.max(...free.map(d=>Math.abs(reaction[d]))),memberStress=members.map((m,k)=>{const end=sub(matvec(es[k].k,matvec(es[k].T,dofs[k].map(d=>u[d]))),es[k].f);return{id:m.id,stressMPa:stress(m,es[k],end)}}),peak=memberStress.reduce((a,b)=>a.stressMPa>b.stressMPa?a:b),receivers=mountZ.map(z=>{const n=postNodes.get(z);return{id:'north-core/'+z,originMm:nodes[n].p,wrenchN_Nmm:reaction.slice(n*6,n*6+6)}})
 const total=Array(6).fill(0);for(let n=0;n<nodes.length;n++){const fr=f.slice(n*6,n*6+3).map((x,j)=>x+reaction[n*6+j]),mr=cross(nodes[n].p,fr);for(let j=0;j<3;j++){total[j]+=fr[j];total[j+3]+=f[n*6+3+j]+reaction[n*6+3+j]+mr[j]}}
 cases.push({labels,peak,maxTranslationMm:Math.max(...Array.from({length:nodes.length},(_,n)=>Math.hypot(...u.slice(n*6,n*6+3)))),residual,totalForceMomentResidualN_Nmm:total,receivers})
}
const boxGap=(a,b)=>{const g=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return g.some(v=>v>0)?Math.hypot(...g.map(v=>Math.max(v,0))):Math.max(...g)}
const obstacles=bodies.flatMap(b=>r.checkedObstacles.map(o=>({member:b.id,obstacle:o.id,reserveMm:boxGap(b.box,o.boxMm)-10}))),pipeChecks=bodies.flatMap(b=>r.paths.flatMap(p=>p.pointsMm.slice(1).map((end,k)=>({member:b.id,path:p.id,segment:k,reserveMm:segmentBoxDistance(p.pointsMm[k],end,b.box)-r.pipe.maximumOuterDiameterMm/2-r.pipe.radialInsulationMm-r.pipe.jacketEachSideMm-20})))),
 cornerChecks=bodies.flatMap(b=>r.paths.flatMap(p=>p.corners.map(c=>({member:b.id,path:p.id,corner:c.id,reserveMm:boxGap(b.box,c.territoryBoxMm)-20}))))
const result={source:source.source,experimentalOnly:true,settings,nodes,members,stock,bodies,sourceStatesRetained:source.states,cases,frameStockKg:members.reduce((n,m)=>n+m.massKg,0)+stock.reduce((n,m)=>n+m.massKg,0),geometry:{obstacleConflicts:obstacles.filter(v=>v.reserveMm<0),pipeConflicts:pipeChecks.filter(v=>v.reserveMm<0),cornerConflicts:cornerChecks.filter(v=>v.reserveMm<0)},thermalBridgeAndOwnInsulationInterfaceQualified:false,actualClampResistanceQualified:false,actualCoreResistanceQualified:false}
writeFileSync(new URL('frame.results.json',import.meta.url),JSON.stringify(result,null,2)+'\n')
if(!process.env.OVID_SIDE_SILENT)console.log(JSON.stringify({cases:cases.length,massKg:result.frameStockKg,peak:cases.reduce((a,b)=>a.peak.stressMPa>b.peak.stressMPa?a:b),geometry:result.geometry},null,2))

export {source,room,r,bank,K,own,free,es,dofs,nodes,members,stock,bodies,rowNodes,stress,result}
