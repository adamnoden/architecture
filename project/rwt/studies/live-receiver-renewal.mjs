/** RWT constructive development: one live roof edge, renewable temporary bypass. */
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {dirname,resolve} from 'node:path'
import {roofRingFaces} from '../../../compiler/reference-house/georgian/roof-surfaces.ts'

const dir=dirname(fileURLToPath(import.meta.url)),root=resolve(dir,'../../..')
const sourceBlobs={
 had:['project/had/studies/open-north-loggia.json','25faad2c4d40df2b7da7212f73808843a88d2f52'],
 edge:['project/mat/studies/loggia-roof-edge.json','731c85d24e775259f1cf84d264d4ceaf75d89774'],
 rejected:['project/rwt/studies/high-eave-service.json',null]
}
const inputs=Object.fromEntries(Object.entries(sourceBlobs).map(([key,[path,expected]])=>{
 const b=readFileSync(resolve(root,path)),blob=createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex')
 if(expected&&blob!==expected)throw Error('Reassess changed source '+path)
 sourceBlobs[key][1]=blob;return[key,JSON.parse(b)]
}))
const {had,edge}=inputs,r=had.roofDevelopment
const roofSource={shell:had.shell,courtInset:had.court[0],ridgeInset:r.ridgeInset,overhang:r.overhang,eaves:r.eavesDatum,pitchDeg:r.pitch,buildDepth:r.totalVertical}
const weatherFace=roofRingFaces(roofSource).find(f=>f.id==='roof-inner-0-0')
if(!weatherFace)throw Error('No selected south weather face')
const physicalEdge=weatherFace.vertices.filter(v=>v.y===had.court[1]+r.overhang).sort((a,b)=>a.x-b.x)
if(physicalEdge.length!==2)throw Error('Weather edge topology changed')
const world=(p,q,z)=>[p,had.court[1]-q,z]
const qPrimary=edge.geometry.edgeQ,qSecondary=edge.weather.secondary.outerDripQ
const zPrimary=edge.geometry.edgeWeather,zSecondary=edge.weather.secondary.dripZ
const A={authority:'NEW RWT geometry; replaces unadopted MAT gutter only at this development occurrence',p:[4350,7650],q:[-450,-100],bottom:6590,back:6740,front:6675,gauge:1.5,
 carrierDepth:30,carrierLength:600,moduleCount:7,drop:170,outward:400,extractionCentres:[4762.5,5587.5,6412.5,7237.5],
 support:'Co-moving carrier; front-operated release. Fixed restraint stays q>=-100. Actual member/connection/handling admission open.'}
A.moduleLength=(A.p[1]-A.p[0])/A.moduleCount
A.modules=Array.from({length:A.moduleCount},(_,i)=>({p:[A.p[0]+i*A.moduleLength,A.p[0]+(i+1)*A.moduleLength],extractionCentre:A.extractionCentres[Math.min(3,Math.floor(i*4/7))]}))
const B={authority:'NEW temporary full-edge formed tray, independent scaffold support; no roof-layer cuts',p:[4325,7675],q:[-500,-100],valleyQ:-230,centreInvert:6800,outletsP:[4500,7500],longFall:.01,crossFall:.05,gauge:1.5,wall:80,frameDepthReservation:20,
 branch:{clearWidth:300,tailQ:-1050,fall:.01,hopperTop:6600,pipeOuter:150},
 return:{clearWidth:300,inletQ:-1050,inletInvert:6710,outletQ:-180,outletInvert:6695,wall:50,gauge:1.5,drainStopOutward:240},
 renewal:'Returns attached before B enters either drip; pipes connected/tested before A opens; restore/test A, insert returns while pipes live, drain B at 240 out, then export.'}
const bInvert=p=>B.centreInvert-Math.min(Math.abs(p-6000),1500)*B.longFall+Math.max(0,Math.abs(p-6000)-1500)*B.longFall
const bFloor=(p,q)=>bInvert(p)+Math.abs(q-B.valleyQ)*B.crossFall
const Bmin=Math.min(...B.outletsP.map(bInvert)),BmaxLip=bFloor(6000,B.q[0])+B.wall
const tailInvert=Bmin-Math.abs(B.branch.tailQ-B.valleyQ)*B.branch.fall
const guard={floor:5540,topCentre:6640,midCentre:6190,tubeDiameter:48,posts:[4350,5175,6000,6825,7650],platform:[4350,4780,3300,700],
 pads:[[4500,4780],[7500,4780],[4500,5480],[7500,5480]],padSquare:400,
 authority:'NEW scaffold/guard envelope; complete bracing, access, rescue, ground bearing and supplier design remain unadmitted.'}
const allowance=10,topFull=guard.topCentre+guard.tubeDiameter/2,topUnder=guard.topCentre-guard.tubeDiameter/2,midFull=guard.midCentre+guard.tubeDiameter/2
const bodyLow=A.bottom-A.carrierDepth-A.drop,bodyHigh=A.back-A.drop
const positiveOverlap=(a,b)=>Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0]))
const checks={
 bothDripsInB: qPrimary>B.q[0]&&qPrimary<B.q[1]&&qSecondary>B.q[0]&&qSecondary<B.q[1],
 lowerDripAboveCompleteB:BmaxLip+allowance<zSecondary,
 BFrameAboveInstalledA:Bmin-B.gauge-B.frameDepthReservation-A.back>allowance,
 wholePhysicalStraightEdgeCovered:B.p[0]<physicalEdge[0].x&&B.p[1]>physicalEdge[1].x,
 AUnderNeighbourAfterDrop:A.bottom-(A.back-A.drop)>allowance,
 carrierAboveMidrail:bodyLow-midFull>allowance,
 carrierBelowToprail:topUnder-bodyHigh>allowance,
 extractionBays:A.extractionCentres.every(p=>guard.posts.every(post=>Math.abs(p-post)>A.carrierLength/2+guard.tubeDiameter/2+allowance)),
 verticalPipesOutsideAWithdrawal:Math.abs(B.branch.tailQ)-B.branch.pipeOuter/2-Math.abs(A.q[0]-A.outward)>allowance,
 returnAboveAFront:B.return.outletInvert-B.return.gauge-A.front>allowance,
 returnAboveGuard:B.return.outletInvert-B.return.gauge-topFull>allowance,
 freefallTailToReturn:tailInvert-(B.return.inletInvert+B.return.wall)>allowance,
 returnStillInAAtDrainStop:B.return.outletQ-B.return.drainStopOutward>A.q[0]+allowance,
 noDripInBAtDrainStop:B.q[1]-B.return.drainStopOutward<qSecondary-allowance,
 completePadsOutsideInlet:guard.pads.every(([x,y])=>x-guard.padSquare/2>had.court[0]&&x+guard.padSquare/2<had.court[0]+had.court[2]&&y+guard.padSquare/2<7000),
 windowRawHeadBelowCarrier:had.openings.FIRST.filter(o=>o.wall==='court-south').every(o=>had.sections.firstFFL+o.head<bodyLow)
}
const clearances={secondaryToB:zSecondary-BmaxLip,BFrameToA:Bmin-B.gauge-B.frameDepthReservation-A.back,AtoNeighbourAfterDrop:A.bottom-bodyHigh,
 carrierToMidrail:bodyLow-midFull,carrierToToprail:topUnder-bodyHigh,returnToGuard:B.return.outletInvert-B.return.gauge-topFull,
 returnToAFront:B.return.outletInvert-B.return.gauge-A.front,tailToReturn:tailInvert-(B.return.inletInvert+B.return.wall),
 pipeToWithdrawal:Math.abs(B.branch.tailQ)-B.branch.pipeOuter/2-Math.abs(A.q[0]-A.outward),endCatchBeyondWeather:physicalEdge[0].x-B.p[0],
 returnOverlapAtDrainStop:B.return.outletQ-B.return.drainStopOutward-A.q[0],afterStopDripSeparation:qSecondary-(B.q[1]-B.return.drainStopOutward)}
const rainfall=216,rate=a=>a*rainfall/3600
const wallRoof=4*(.5*(had.court[2]+(had.shell-2*r.ridgeInset))*(had.court[0]-r.ridgeInset)/1e6)
const wallCourt=had.court[2]**2/1e6,physicalCourt=(had.court[2]-2*r.overhang)**2/1e6,physicalRoof=wallRoof+wallCourt-physicalCourt
const catchments={rainfallMmH:rainfall,wallLine:{roofM2:wallRoof,courtM2:wallCourt,roofLps:rate(wallRoof),courtLps:rate(wallCourt)},physical:{roofM2:physicalRoof,exposedCourtM2:physicalCourt,roofLps:rate(physicalRoof),courtLps:rate(physicalCourt)},combinedLps:rate(wallRoof+wallCourt),branchChallengeLps:rate(wallRoof+wallCourt),scope:'Each branch challenged with whole roof-plus-court total; conservative boundary, no invented equal-edge or valley allocation.'}
const qFlow=catchments.branchChallengeLps/1000,energy=width=>1.5*Math.cbrt((qFlow/(width/1000))**2/9.81)*1000
const hydraulicScreen={specificEnergyMm:{width100:energy(100),width300:energy(300),width400:energy(400)},BWall:B.wall,returnWall:B.return.wall,
 verdict:'50 mm return wall exceeds ideal 300 mm critical specific energy by 13.247 mm. Necessary head screen only: actual inlet/turn/roughness/splash/backwater/freeboard and full event test remain unproved.'}
const negativeControls={oldGutterInB:A.back< Bmin&&inputs.rejected.roofEdge.gutter.back>Bmin,
 drop150HasZeroNeighbourClearance:A.bottom-(A.back-150)===0,
 highPlatform5800BlocksReturn:5800+1100+24>B.return.outletInvert,
 wallLineAndPhysicalCatchmentsConserve:Math.abs(rate(physicalRoof+physicalCourt)-catchments.combinedLps)<1e-10,
 doubleCountOverhangRejected:rate(physicalRoof+wallCourt)>catchments.combinedLps,
 full400ReturnMoveLosesAOverlap:B.return.outletQ-400<A.q[0],
 narrowReturnHydraulicFailure:20<energy(B.return.clearWidth),
 correctedReturnNecessaryHead:B.return.wall>energy(B.return.clearWidth)}
const result={status:'CONSTRUCTIVE LOCAL REVERSAL REFERENCE; nominal geometry and necessary head screen only; no selected receiver/site/product/operation admission',sourceBlobs,
 occurrence:{p:'world x',q:'4250-world y',z:'world absolute millimetres',selectedHAD:had.selection.identity,roofSource,weatherFace,physicalEdge,
  sceneProjection:'Await coordinated HAD builder export; selected openings below are direct selected JSON, never inferred from upperWalls.',
  firstOpenings:had.openings.FIRST.filter(o=>o.wall==='court-south'),firstFFL:had.sections.firstFFL,groundDoor:had.southCourtWeatherDoor},
 profiles:{A,B,guard},world:{primary:world(6000,qPrimary,zPrimary),secondary:world(6000,qSecondary,zSecondary),A:[world(6000,A.q[0],A.bottom),world(6000,A.q[1],A.back)],B:[world(6000,B.q[0],bFloor(6000,B.q[0])),world(6000,B.q[1],bFloor(6000,B.q[1]))]},
 clearances,checks,negativeControls,catchments,hydraulicScreen,
 limits:['Straight weather edge is not a physical corner/valley capture joint.','B frame and scaffold are reserved complete envelopes, not qualified structural members.','Window raw head screen is not actual sash/guard operation.','20 mm return rejected; 50 mm correction passes necessary head screen, not actual hydraulic capacity.','Independent ground outlets, first weak join, receiving head, pad support and access remain with RWT/site owners.']}
if(!Object.values(checks).every(Boolean)||!Object.values(negativeControls).every(Boolean))throw Error(JSON.stringify({checks,negativeControls},null,2))
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;')
const sections=[{name:'1  A installed / B captures both layers',drop:0,out:0,bShift:0},{name:'2  A lowered 170 and out 400',drop:170,out:400,bShift:0},{name:'3  A restored / B drain stop 240',drop:0,out:0,bShift:240}]
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 1680 1188"><rect width="1680" height="1188" fill="white"/><style>text{font-family:Arial,sans-serif;fill:#14212c}.title{font-size:28px;font-weight:bold}.sub{font-size:18px}.small{font-size:15px}.a{fill:none;stroke:#24578c;stroke-width:4}.b{fill:none;stroke:#a25819;stroke-width:4}.water{stroke:#159cba;stroke-width:3;fill:none}.fixed{stroke:#555;stroke-width:4;fill:none}</style>'
svg+='<text x="45" y="44" class="title">RWT / South-court live receiver reversal</text><text x="45" y="76" class="sub">Development section — corrected 50 mm return; bounded geometry and necessary head screen only</text>'
sections.forEach((s,i)=>{const ox=45+i*550,oy=130,scale=.42,X=q=>ox+470+q*scale,Z=z=>oy+(7100-z)*scale,poly=(pts,cls)=>'<polyline class="'+cls+'" points="'+pts.map(([q,z])=>X(q)+','+Z(z)).join(' ')+'"/>'
 svg+='<text x="'+ox+'" y="110" class="sub">'+esc(s.name)+'</text>'
 svg+=poly([[0,7100],[-200,zPrimary]],'fixed')+poly([[0,7100-75.7/Math.cos(25*Math.PI/180)],[-220,zSecondary]],'fixed')
 svg+=poly([[A.q[0]-s.out,A.front-s.drop],[A.q[0]-s.out,A.bottom-s.drop],[A.q[1]-s.out,A.bottom-s.drop],[A.q[1]-s.out,A.back-s.drop]],'a')
 svg+=poly([[B.q[0]-s.bShift,bFloor(6000,B.q[0])+B.wall],[B.q[0]-s.bShift,bFloor(6000,B.q[0])],[B.valleyQ-s.bShift,6800],[B.q[1]-s.bShift,bFloor(6000,B.q[1])],[B.q[1]-s.bShift,bFloor(6000,B.q[1])+B.wall]],'b')
 if(i!==1)svg+=poly([[-1050-s.bShift,6710],[-180-s.bShift,6695]],'water')
 svg+=poly([[-1050,tailInvert],[-1050,6600]],'water')
 for(const z of [guard.topCentre,guard.midCentre])svg+='<circle cx="'+X(-530)+'" cy="'+Z(z)+'" r="'+24*scale+'" fill="#444"/>'
 svg+='<text x="'+ox+'" y="540" class="small">q = 4250 − y; p = x; dimensions in mm</text>'
 svg+='<text x="'+ox+'" y="567" class="small">A blue / temporary B ochre / return cyan</text>'
})
const rows=[['Both fixed drips',`q ${qPrimary} / ${qSecondary}; z ${zPrimary.toFixed(3)} / ${zSecondary.toFixed(3)}`],['B / fixed lower drip',`${clearances.secondaryToB.toFixed(3)} vertical; 10 declared allowance`],['B frame / A back',`${clearances.BFrameToA.toFixed(1)} vertical; 20 frame reservation`],['A / neighbouring A',`${clearances.AtoNeighbourAfterDrop} after 170 drop; 150 gives ZERO`],['A complete carrier / guards',`${clearances.carrierToMidrail} above midrail; ${clearances.carrierToToprail} below toprail`],['B return / guard',`${clearances.returnToGuard.toFixed(1)} including 1.5 sheet`],['Return head screen',`20 wall rejected; 50 > ${energy(300).toFixed(2)} ideal specific energy at 3.60375 L/s`],['Catchment conservation',`${physicalRoof.toFixed(4)} roof + ${physicalCourt.toFixed(4)} exposed court = ${(wallRoof+wallCourt).toFixed(4)} m²`]]
rows.forEach(([a,b],i)=>{const y=620+i*37;svg+='<text x="45" y="'+y+'" class="sub">'+esc(a)+'</text><text x="440" y="'+y+'" class="sub">'+esc(b)+'</text>'})
svg+='<text x="45" y="970" class="sub">No physical admission: source corners / sash operation / permanent support / scaffold / live ground joins remain open.</text><text x="45" y="1005" class="sub">Whole 3100 weather edge is covered by B p4325–7675; end valley jets are not proved by the weather mesh.</text><text x="45" y="1040" class="sub">A module carriers move with A. Retained cradles across the drop path are prohibited by this design.</text><text x="45" y="1075" class="sub">Return enlarged to 50 mm; front lip and platform lowered to keep live reversal geometrically possible.</text><text x="45" y="1120" class="small">Generated from live-receiver-renewal.mjs. Read the owning RWT result for sequence, source authority and required correction.</text></svg>\n'
for(const [name,data]of Object.entries({'live-receiver-renewal.json':JSON.stringify(result,null,2)+'\n','live-receiver-renewal.svg':svg})){const path=resolve(dir,name);if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==data)throw Error('Stale '+name)}else writeFileSync(path,data)}
console.log(JSON.stringify({geometricChecks:checks,clearances,hydraulicScreen,physicalEdge,catchments},null,2))
