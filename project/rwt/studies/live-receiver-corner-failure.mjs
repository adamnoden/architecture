/** Source-bound counterexample to the south-only live receiver reversal. */
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {dirname,resolve} from 'node:path'
import {roofRingFaces} from '../../../compiler/reference-house/georgian/roof-surfaces.ts'
const dir=dirname(fileURLToPath(import.meta.url)),root=resolve(dir,'../../..')
const path=resolve(root,'project/had/studies/open-north-loggia.json'),bytes=readFileSync(path)
const blob=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')
if(blob!=='25faad2c4d40df2b7da7212f73808843a88d2f52')throw Error('Selected house source changed; reassess corner failure')
const h=JSON.parse(bytes),r=h.roofDevelopment
const faces=roofRingFaces({shell:h.shell,courtInset:h.court[0],ridgeInset:r.ridgeInset,overhang:r.overhang,eaves:r.eavesDatum,pitchDeg:r.pitch,buildDepth:r.totalVertical})
const edge=n=>{const f=faces.find(f=>f.id===`roof-inner-${n}-0`);return f.vertices.filter(v=>v.z===Math.min(...f.vertices.map(w=>w.z))).sort((a,b)=>a.y-b.y||a.x-b.x)}
const south=edge(0),east=edge(1),west=edge(3)
if(south.length!==2||east.length!==2||west.length!==2)throw Error('Roof edge topology changed')
const study=JSON.parse(readFileSync(resolve(dir,'live-receiver-renewal.json'))),{A,B}=study.profiles
const positive=(a,b)=>Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0]))
const states=[0,240,270,400].map(shift=>{
 const trayY=[h.court[1]-B.q[1]+shift,h.court[1]-B.q[0]+shift]
 const adjacent=[west,east].map(e=>({x:e[0].x,inTrayX:e[0].x>B.p[0]&&e[0].x<B.p[1],edgeY:[e[0].y,e[1].y],overlapY:positive(trayY,[e[0].y,e[1].y])}))
 const outletQ=B.return.outletQ-shift,returnOverlap=Math.max(0,outletQ-A.q[0])
 const southQ=h.court[1]-study.world.primary[1]
 return {shift,trayY,adjacent,returnOutletQ:outletQ,returnOverlap,southPrimaryIn:B.q[0]-shift<southQ&&southQ<B.q[1]-shift}
})
const release=states.find(s=>s.shift===400),stop=states.find(s=>s.shift===240)
if(!stop.adjacent.every(x=>x.inTrayX&&x.overlapY>0)||!release.adjacent.every(x=>x.inTrayX&&x.overlapY===400)||release.returnOverlap!==0||release.southPrimaryIn)throw Error('Expected counterexample changed; reassess')
const loss=B.return.outletQ-A.q[0],clear=Math.max(...[west,east].map(e=>e[1].y))-(h.court[1]-B.q[1])
const result={status:'REJECTED full-edge reversal: source-bound adjacent primary drip counterexample; no hydraulic or physical test',sourceBlob:blob,source:'project/had/studies/open-north-loggia.json',roofFaceIds:['roof-inner-0-0','roof-inner-1-0','roof-inner-3-0'],south,east,west,states,returnOverlapCeasesAt:loss,adjacentDripsClearAt:clear,uncontainedMovementInterval:[loss,clear],scope:'Vertical primary drip loci only, no wind or concentrated jets. The independent end capture, transfer and its own removal must be constructed and tested before receiver renewal; temporary water or a dry forecast is not credited.'}
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 1680 1188"><rect width="1680" height="1188" fill="white"/><g font-family="Arial,sans-serif" fill="#20343e"><text x="45" y="52" font-size="29" font-weight="bold">Corner counterexample: south tray still catches the side roofs</text><text x="45" y="84" font-size="18">Source-bound plan, vertical primary drip loci · millimetres · no hydraulic or physical test</text>'
const sx=.145,sy=.145
states.slice(1).forEach((s,i)=>{const ox=65+i*540,oy=150,X=x=>ox+(x-4200)*sx,Y=y=>oy+(y-4200)*sy
 svg+=`<text x="${ox}" y="128" font-size="21" font-weight="bold">Outward ${s.shift} mm</text><rect x="${X(4250)}" y="${Y(4250)}" width="${3500*sx}" height="${3500*sy}" fill="#f4f7f7" stroke="#aab7bb" stroke-width="2"/>`
 svg+=`<rect x="${X(B.p[0])}" y="${Y(s.trayY[0])}" width="${(B.p[1]-B.p[0])*sx}" height="${(s.trayY[1]-s.trayY[0])*sy}" fill="#ead2b8" stroke="#a25819" stroke-width="3"/>`
 for(const e of [west,east,south])svg+=`<line x1="${X(e[0].x)}" y1="${Y(e[0].y)}" x2="${X(e[1].x)}" y2="${Y(e[1].y)}" stroke="#b23f34" stroke-width="5"/>`
 svg+=`<text x="${ox}" y="${oy+560}" font-size="18">Side edge intercepted: ${s.adjacent[0].overlapY} mm each</text><text x="${ox}" y="${oy+590}" font-size="18">Return overlap in A: ${s.returnOverlap} mm</text>`
})
svg+=`<text x="45" y="825" font-size="22" font-weight="bold">270 mm: return overlap reaches zero; side edges remain over the tray.</text><text x="45" y="866" font-size="20">400 mm: both side edges still cross its entire 400 mm depth. The south drip alone is outside.</text><text x="45" y="907" font-size="20">With this unchanged tray, the side edges cease crossing only at 3200 mm outward.</text><text x="45" y="960" font-size="19">No credited disposal exists between loss of A overlap and clear side edges; the method is rejected.</text><text x="45" y="1000" font-size="19">A corner bypass must itself be installed, supported, drained, tested and removed while all edges remain live.</text><text x="45" y="1040" font-size="19">Rectangles are plan envelopes, not an assertion of actual capture efficiency or safe flow.</text><text x="45" y="1100" font-size="17">Generated from selected HAD weather-face geometry and the candidate B / return parameters.</text></g></svg>\n`
for(const [name,data] of Object.entries({'live-receiver-corner-failure.json':JSON.stringify(result,null,2)+'\n','live-receiver-corner-failure.svg':svg})){const p=resolve(dir,name);if(process.argv.includes('--check')){if(readFileSync(p,'utf8')!==data)throw Error('Stale '+name)}else writeFileSync(p,data)}
console.log(JSON.stringify({states,returnOverlapCeasesAt:loss,adjacentDripsClearAt:clear},null,2))
