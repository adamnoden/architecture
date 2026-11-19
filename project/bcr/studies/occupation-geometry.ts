/** Reproducible, source-bound occupation diagnostics; not a human simulation or compliance test. */
import {writeFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {layoutRevision as d,revisionOpenings,entryVoid} from '../../../compiler/reference-house/georgian/layout-revision.js'
import {revisionMetrics} from '../../../compiler/reference-house/georgian/layout-revision-audit.js'

const source='compiler/reference-house/georgian/layout-revision.ts'
const b=d.furniture.bed3, half=d.partition/2, e=d.envelope
const wc=revisionOpenings('GROUND').find(o=>o.id==='wc-door')!
const ens=revisionOpenings('FIRST').find(o=>o.id==='ensuite3-door')!
const wall=d.partitions.GROUND.find(w=>w.id===wc.wall)!
if(wall.a[1]!==wall.b[1]||wc.swing!=='left'||wc.hinge!=='low') throw Error('Reassess WC handing before using this diagnostic')
const hinge=[wc.centre-wc.width/2,wall.a[1]],tip=[hinge[0],hinge[1]+wc.width]
const data={
  source,sourceBlob:execFileSync('git',['hash-object',source],{encoding:'utf8'}).trim(),
  scope:'Nominal finished faces, source furniture and zero-thickness schematic leaf; no product, force, mobility or carrying certification',
  proxyDiameterMm:600,proxyBasis:'Same diagnostic diameter as existing revision access audit; not a population or regulatory requirement',
  guestWc:{clearWidthMm:9500-half-(7200+half),clearDepthMm:2650-half-e,hinge,open90Tip:tip,directApproachTipGapMm:d.court.y-e-tip[1]},
  bedroom3:{bed:b,northStripMm:2650-half-(b.y+b.depth),southStripMm:b.y-e,eastStripMm:d.shell-e-(b.x+b.width),ensuiteOpening:[ens.centre-ens.width/2,ens.centre+ens.width/2],
    separatorX:10000,centreYMinimumAboveBed:b.y+b.depth+300,centreYMaximumBelowSolidNorthWall:2650-half-300},
  stair:{...revisionMetrics(),riseMm:d.stair.floorRise/d.stair.risers,pitchDeg:Math.atan((d.stair.floorRise/d.stair.risers)/d.stair.going)*180/Math.PI,
    ordinaryCeilingNosingHeadroomMm:[6,7].map(n=>({riser:n,y:d.stair.y+(n-1)*d.stair.going,z:n*d.stair.floorRise/d.stair.risers,headroom:d.levels.ceilingGround-n*d.stair.floorRise/d.stair.risers})),
    handrailSensitivityMm:[0,50,75].map(each=>({eachSideProjection:each,residualFlight:d.stair.flight-2*each})),guardSelected:entryVoid.guardHeightSelected},
  renewal:{plantWaterFootprint:d.services.plantWater,externalDoorNominal:revisionOpenings('GROUND').find(o=>o.id==='plant-replacement')!.width,internalDoorNominal:revisionOpenings('GROUND').find(o=>o.id==='plant-door')!.width,internalOasTrialBetweenFrames:820,trial700SquareResidual:120}
}
writeFileSync(new URL('./occupation-geometry.json',import.meta.url),JSON.stringify(data,null,2)+'\n')
const esc=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;')
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><style>text{font-family:Arial,sans-serif;font-size:3px;fill:#182b35}.title{font-size:6px;font-weight:bold}.sub{font-size:4px;font-weight:bold}.wall{fill:#d4d9db;stroke:#34444a;stroke-width:.25}.object{fill:#e9dcc7;stroke:#795c32;stroke-width:.35}.bad{stroke:#b33430;fill:none;stroke-width:.65}.dim{stroke:#416d85;fill:none;stroke-width:.35}</style>'
const text=(x:number,y:number,s:string,cl='')=>{svg+=`<text x="${x}" y="${y}" class="${cl}">${esc(s)}</text>`}
const line=(x:number,y:number,xx:number,yy:number,cl='dim')=>{svg+=`<path d="M${x},${y} L${xx},${yy}" class="${cl}"/>`}
const panel=(px:number,py:number,x0:number,yTop:number,scale:number)=>({
  rect:(x:number,y:number,w:number,h:number,cl='wall')=>{svg+=`<rect x="${px+(x-x0)/scale}" y="${py+(yTop-y-h)/scale}" width="${w/scale}" height="${h/scale}" class="${cl}"/>`},
  line:(x:number,y:number,xx:number,yy:number,cl='dim')=>line(px+(x-x0)/scale,py+(yTop-y)/scale,px+(xx-x0)/scale,py+(yTop-yy)/scale,cl),
  point:(x:number,y:number,r:number)=>{svg+=`<circle cx="${px+(x-x0)/scale}" cy="${py+(yTop-y)/scale}" r="${r/scale}" class="dim"/>`}
})
text(10,13,'Occupation: actual routes and unresolved boundaries','title')
text(10,21,'RH-LAYOUT-REVISION-02 | 29 October 2026 | nominal geometry study; adverse findings are not an adopted redesign')
text(10,29,`Source blob ${data.sourceBlob}`)
text(10,40,'A  Guest WC: direct approach / 1:25','sub')
const a=panel(10,47,6500,4100,25)
a.rect(7200-half,e,125,2650-e);a.rect(9500-half,e,125,2650-e)
a.rect(7200,2650-half,450,125);a.rect(8550,2650-half,950,125)
a.rect(7200,0,2300,e);a.rect(6500,3832.5,1667.5,267.5)
a.rect(d.wetFit.guestPan.x,d.wetFit.guestPan.y,400,650,'object');a.rect(d.wetFit.guestBasin.x,d.wetFit.guestBasin.y,400,400,'object')
a.line(hinge[0],hinge[1],tip[0],tip[1],'bad');a.line(7650,3550,7650,3832.5)
a.point(7000,3200,300);a.line(7000,3200,7350,3200)
text(13,63,'Court / wall boundary');text(83,74,'282.5 tip gap');text(63,131,'Source WC');text(13,220,'Red: nominal leaf fully open toward hall.')
text(13,227,'600 proxy cannot pass its tip on the direct west approach.')
text(13,234,'Partial-angle action or long court-loop detour is unproved;')
text(13,241,'this is not proof that every possible WC sequence fails.')
text(155,40,'B  Bedroom 3 to en suite / 1:40','sub')
const q=panel(155,47,7000,4100,40)
q.rect(7200-half,e,125,2650-e);q.rect(12000-e,0,e,4100);q.rect(7200,0,4800,e)
q.rect(7200,2650-half,1050,125);q.rect(9150,2650-half,1300,125);q.rect(11350,2650-half,650,125)
q.rect(9500-half,2650,125,1200);q.rect(9500,3850-half,2500,125)
q.rect(b.x,b.y,b.width,b.depth,'object');q.line(10000,417.5,10000,2650,'bad')
q.point(8700,2100,300);q.line(10900,2650,10900,3500)
text(158,159,'At x10000: north strip 487.5; south strip 182.5.')
text(158,166,'No 600-diameter route crosses this separator.')
text(158,173,'The en-suite doorway is on the far side of the bed.')
text(158,185,'Approach is blocked even with door leaves removed.')
text(158,192,'Move furniture / revise layout through HAD authority.')
text(300,40,'C  Lower flight diagnostic / 1:50','sub')
const c=panel(300,47,0,4500,50)
c.line(0,3100,4335,3100,'bad');c.line(0,3450,4335,3450)
for(let n=1;n<=10;n++){const y=(n-1)*300,z=n*172.5;c.line(y,z,y+300,z);if(n<10)c.line(y+300,z,y+300,z+172.5)}
c.line(1500,1035,1500,3100);c.line(1800,1207.5,1800,3100)
text(300,145,'Ordinary ceiling 3100 above nosing 6: 2065.')
text(300,152,'Above nosing 7: 1892.5 (below 2 m diagnostic).')
text(300,159,'Actual opening/trimmer and finished soffit needed;')
text(300,166,'this line is a hostile ceiling, not an existing slab.')
text(300,180,'Flight 1100; landing 1635; gallery 1015;')
text(300,187,'bridge 1120 before unselected guard projections.')
text(300,201,'Roof void is not a usable loft or replacement route.')
line(10,244,410,244)
text(10,254,'Brown: source fixture / bed footprint. Blue: geometric diagnostic. Red: limiting section or open leaf. Dimensions in model mm.')
text(10,262,'A/B: nominal finished wall faces; no actual frame/handles/forces. C: rise/going source, no selected opening or load-bearing detail.')
text(10,270,'600 mm circle is a falsification probe reused from the source access audit, not an accessible-use standard or validated human body.')
text(10,278,'Read bcr-occupation-result.md for full entry, sanitary, stair, window, escape and renewal sequences, owners and discharge conditions.')
svg+='</svg>\n';writeFileSync(new URL('./occupation-geometry.svg',import.meta.url),svg)
console.log(JSON.stringify(data,null,2))
