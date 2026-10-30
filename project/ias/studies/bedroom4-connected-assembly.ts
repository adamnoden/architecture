/** Located successor comparison. No product-fit, hydraulic or house-adoption assertion. */
import {readFileSync,writeFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {layoutRevision as d} from '../../../compiler/reference-house/georgian/layout-revision.js'
import {sectionAssemblyChoices as a} from '../../../compiler/reference-house/georgian/section-source.js'
const round=(n:number)=>Math.round(n*1000)/1000
if(d.id!=='RH-LAYOUT-REVISION-02'||d.envelope!==417.5||d.partition!==125||d.levels.first!==3450||a.floor.finish!==20||a.floor.deck!==22)throw Error('Reappraise current house before regenerating this candidate')
const floorLayers=[['bedding allowance',3],['Hardie floor board',6],['membrane bond allowance',2],['KERDI-200',.2],['tile bed allowance',3.8],['porcelain envelope',10]] as const
const floorDepth=floorLayers.reduce((sum,[,n])=>sum+n,0),wetFFL=d.levels.first-a.floor.finish+floorDepth
const wall={stud:90,dryBoard:12.5,wetBoard:12.5,adhesive:4.5,tile:8},wetWall=wall.wetBoard+wall.adhesive+wall.tile,partition=wall.stud+wall.dryBoard+wetWall
const clear={west:417.5+(wetWall-15),east:2337.5-(partition-125),south:8292.5+(partition-125),north:10825-(partition-125)}
const trays={NE:{x:clear.east-1000,y:clear.north-1000,w:1000,h:1000},NW:{x:clear.west,y:clear.north-1000,w:1000,h:1000}}
const boxing={westWidth:150,northDepth:250,face:18,axisX:clear.west+75}
const cabinet={west:clear.west,east:clear.west+300,south:8650,north:9550,panel:18,panCentreY:8977.5,
 internalDepth:264,internalLength:864,cisternApplicationWidth:500,cisternApplicationDepth:200,cisternApplicationHeight:800,
 applicationSouth:8727.5,applicationNorth:9227.5,sideReserves:[59.5,304.5],
 scope:'Authored 900 gross cabinet comparison; application and side reserves do not prove actual isolation, flush, soil, support or removal fit; connection levels unresolved'}
const cabinetEntry=[boxing.axisX,9500],stackReference=[boxing.axisX,9375]
const cornerOffset=135,profile=45,legMaximum=140,comparisonRim=profile+legMaximum
const routes=[
 {name:'NE west-facing corner, enlarged north boxing',points:[[trays.NE.x+cornerOffset,trays.NE.y+1000-cornerOffset],[boxing.axisX,trays.NE.y+1000-cornerOffset],cabinetEntry,stackReference]},
 {name:'NW south-west corner, wet-window alternative',points:[[trays.NW.x+cornerOffset,trays.NW.y+cornerOffset],[boxing.axisX,trays.NW.y+cornerOffset],cabinetEntry,stackReference]}
].map(r=>{const length=r.points.slice(1).reduce((sum,p,i)=>sum+Math.abs(p[0]-r.points[i][0])+Math.abs(p[1]-r.points[i][1]),0);return {...r,length:round(length),fallAt18PerMetre:round(length*.018),status:'centreline topology only; actual fittings/legs not admitted'}})
const mcAlpine={bodyHeight:70,bodyAxisBelowTop:35,centreToUnion:82,largestNamedWasher:12.5,comparisonFittingOutside:60,
 lowerBoundAxisIfWholeTrayAndSupportAssumptionsHold:comparisonRim-profile-12.5-35,
 scope:'Dimensions from named manufacturer range drawings; 60 fitting and entire 45 tray/pad inclusion are comparison assumptions, not measured compatibility or tolerance bounds'}
const conditionalRoutes=routes.map(r=>({...r,conditionalEndAxis:round(mcAlpine.lowerBoundAxisIfWholeTrayAndSupportAssumptionsHold-r.fallAt18PerMetre),conditionalEnvelopeBottom:round(mcAlpine.lowerBoundAxisIfWholeTrayAndSupportAssumptionsHold-r.fallAt18PerMetre-30)}))
const withdrawal={northBoxDepth:250,northBoxHeight:180,wallFace:18,internalWidth:214,axisFromNorth:135,handlingWidthReservation:160,sideMargins:[17,37],firstReleaseLength:300,pullWestComparison:235,scope:'Authored handling reservation only: actual McAlpine body/connector diameter and leg pattern must fit, with top-flange removal, body holding, gasket release and tool clearance still unproved'}
const rejectedNorthLead={available:cornerOffset-75,bodyToUnion:mcAlpine.centreToUnion,shortfallBeforeAdapter:mcAlpine.centreToUnion-(cornerOffset-75)}
const threshold={wetFFL,dryFFL:d.levels.first,crest:wetFFL+15,wetRise:15,dryRise:wetFFL+15-d.levels.first,wetBevelRun:30,dryBevelRun:40,flatCrest:30,
 scope:'authored 1:2 bevels and stepped saddle comparison; HAD action review and support/sealed jamb returns required, not level access'}
const record={scope:'Unadopted architectural comparison; no complete room/product/hydraulic or waterproofing pass',
 sourceBlobs:Object.fromEntries(['compiler/reference-house/georgian/layout-revision.ts','compiler/reference-house/georgian/section-source.ts'].map(p=>[p,execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim()])),
 floorLayers,floorDepth,wetFFL,deckTop:d.levels.first-a.floor.finish,wall,wetWall,partition,clear,trays,boxing,cabinet,cornerOffset,profile,legMaximum,comparisonRim,
 routes:conditionalRoutes,mcAlpine,withdrawal,rejectedNorthLead,threshold,
 holds:['actual delivered tray local underside and support/pad datums','all moulded leg positions and unobstructed housing withdrawal','compatible waste flange/washer and actual connector/pipe/support geometry','actual stack/cistern/pan connections and cabinet faces','deck/load/support and complete membrane penetration set','full-bed and taped-corner sample within 25 floor/25 wall','stepped doorway action and seal review','NW needs deliberate wet-window redesign'],
 firstFailure:'Threshold crest is only a proposed visible spill boundary after all lower penetrations and perimeter joints are earned; damaged joints can fail earlier',
 geometryBoundary:'Original Mira/HAD artifacts remain unchanged; no compiler house source or lifecycle mutation'}
if(floorDepth!==25||partition!==127.5||rejectedNorthLead.shortfallBeforeAdapter<=0)throw Error('Internal comparison arithmetic changed: review the owning result')
const out=(name:string,body:string)=>{const p=new URL(name,import.meta.url);if(process.argv.includes('--check')){if(readFileSync(p,'utf8')!==body)throw Error('Stale '+name)}else writeFileSync(p,body)}
out('./bedroom4-connected-assembly.json',JSON.stringify(record,null,2)+'\n')
const s:string[]=[];const add=(v:string)=>s.push(v),esc=(v:string)=>v.replaceAll('&','&amp;').replaceAll('<','&lt;')
const text=(x:number,y:number,v:string,size=2.7)=>add(`<text x="${x}" y="${y}" font-size="${size}">${esc(v)}</text>`)
const line=(x:number,y:number,xx:number,yy:number,color='#376b78',dash=false)=>add(`<path d="M${x},${y}L${xx},${yy}" fill="none" stroke="${color}" stroke-width=".45"${dash?' stroke-dasharray="1.3 1"':''}/>`)
const rect=(x:number,y:number,w:number,h:number,fill='#eee9df')=>add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#51616a" stroke-width=".25"/>`)
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="Arial,sans-serif" fill="#23343a"><rect width="420" height="297" fill="white"/>')
text(12,14,'IAS / Connected Bedroom 4 wet-assembly comparison',5.2)
text(12,22,'Unadopted successor: full floor/wall budget, real first-junction challenge and stepped water boundary',3)
text(12,34,'A  Located NE route / 1:25',3.5)
const px=(x:number)=>12+(x-clear.west)/25,py=(y:number)=>42+(clear.north-y)/25
rect(px(clear.west),py(clear.north),(clear.east-clear.west)/25,(clear.north-clear.south)/25)
rect(px(trays.NE.x),py(clear.north),40,40,'#dce9ec')
rect(px(clear.west),py(clear.north),6,(clear.north-9550)/25,'#d7c7aa')
rect(px(clear.west+150),py(clear.north),(trays.NE.x-clear.west-150)/25,10,'#d7c7aa')
rect(px(clear.west),py(cabinet.north),12,(cabinet.north-cabinet.south)/25,'#c2a77e')
const r=routes[0];add(`<polyline points="${r.points.map(([x,y])=>`${px(x)},${py(y)}`).join(' ')}" fill="none" stroke="#2d7a67" stroke-width=".6" stroke-dasharray="1.5 1"/>`)
add(`<circle cx="${px(r.points[0][0])}" cy="${py(r.points[0][1])}" r="1.1" fill="#2d7a67"/>`)
line(px(clear.west),py(9700),px(clear.west),py(10700),'#547da1')
text(14,151,'NE topology to stack reference: '+routes[0].length,2.7)
text(14,158,'North box 250; west box 150 are occupied.',2.7)
text(14,165,'Actual elbow/socket/legs still govern.',2.7)
text(14,172,'NW topology '+routes[1].length+' introduces wet window.',2.7)
text(115,34,'B  Floor + wall / 1:2',3.5)
let yy=44;for(const [i,[name,n]]of [...floorLayers].reverse().entries()){rect(115,yy,36,n/2,name==='porcelain envelope'?'#dce9ec':name==='Hardie floor board'?'#c8bda8':'#eee9df');const labelY=45+i*5;line(151,yy+n/4,157,labelY);text(160,labelY+1,name+' '+n,2.45);yy+=n/2}
rect(115,yy,36,11,'#c9b395');line(151,yy+5.5,157,75);text(160,76,'Retained 22 structural deck',2.7)
text(115,80,'25 finish: wet FFL 3455 / dry 3450',3)
text(115,88,'25 wall = 12.5 board + 4.5 bed + 8 tile',2.7)
text(115,96,'90 stud + 12.5 dry + 25 wet = 127.5',2.7)
text(115,104,'Finished faces move 2.5 inward; west 10.',2.7)
text(115,116,'Full bedding + seals consume real depth.',2.7)
text(115,124,'Taped corners require sample verification.',2.7)
text(115,132,'No deck/framing/ceiling reduction.',2.7)
text(115,144,'Support and actual loads remain unearned.',2.7)
text(285,34,'C  Threshold section / 1:2',3.5)
const tx=287,ty=73,sz=(z:number)=>ty-z/2
line(tx-5,sz(5),tx,sz(5));line(tx,sz(5),tx+15,sz(20));line(tx+15,sz(20),tx+30,sz(20));line(tx+30,sz(20),tx+50,sz(0));line(tx+50,sz(0),tx+62,sz(0))
line(tx,sz(5)+2,tx+15,sz(20)+2,'#b05e38');line(tx+15,sz(20)+2,tx+30,sz(20)+2,'#b05e38');line(tx+30,sz(20)+2,tx+50,sz(0)+2,'#b05e38')
text(285,85,'Wet +5 → crest +20 → dry 0',3)
text(285,93,'30 wet bevel / 30 crest / 40 dry bevel',2.6)
text(285,101,'Membrane turns over supported substrate.',2.6)
text(285,109,'Jamb returns / door undercut must close.',2.6)
text(285,117,'Visible finite spill boundary; no flood pass.',2.6)
text(285,129,'FIRST-JUNCTION REJECTION',3.1)
text(285,138,'North-facing corner: 60 before ideal turn.',2.6)
text(285,146,'Body union alone 82; deficit 22 before adapter.',2.6)
text(285,154,'West orientation removes this immediate clash.',2.6)
text(285,162,'It does not prove the replacement joint fits.',2.6)
line(12,183,408,183)
text(12,195,'D  Product datum / failure / complete replacement',3.5)
const notes=[
 'JT 45 profile + documented maximum 140 leg adjustment gives 185 rim comparison; pads and local moulding still need reconciliation.',
 'McAlpine 35 axis is below BODY TOP, not the tray wet face. The named 9.5/12.5 washers are alternatives, not a stack.',
 'Conditional 92.5 starting axis requires stated whole-tray and support assumptions; it is not an installed measured level.',
 'NE conditional 60-envelope bottom '+conditionalRoutes[0].conditionalEnvelopeBottom+'; NW '+conditionalRoutes[1].conditionalEnvelopeBottom+' at 18/m. Socket/clip/tolerance and real bends remain unadmitted.',
 'Keep membrane under tray, boxing and cabinet. Ordinary inspection needs first-release covers; housing renewal is not top cleaning.',
 'Whole tray replacement can disturb its bonded wall seal: remove local tile/band, reinstate required overlaps and test before use.',
 'A blocked trap can spill over the enclosure; a supply leak persists until isolated. Lower damaged joints may fail before the saddle.'
];notes.forEach((n,i)=>text(12,206+i*8,n,2.55))
text(12,273,'Sources and exact caveats: project/ias/ias-03-bedroom4-assembly-successor.md. House source and old candidate artifacts unchanged.',2.6)
text(12,283,'Model dimensions millimetres. Printed scales at 100%. Comparison only; no product compatibility, safe installation or IAS-03 completion.',2.6)
add('</svg>');out('./bedroom4-connected-assembly.svg',s.join('\n')+'\n')
console.log(JSON.stringify({floorDepth,wetFFL,partition,clear,routes:conditionalRoutes,rejectedNorthLead},null,2))
