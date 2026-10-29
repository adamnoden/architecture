/** Current wet reservations and explicit candidate sensitivities; not product selection or hydraulic design. */
import {readFileSync,writeFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {layoutRevision as d} from '../../../compiler/reference-house/georgian/layout-revision.js'
import {sectionAssemblyChoices as a} from '../../../compiler/reference-house/georgian/section-source.js'
const emit=(name:string,body:string)=>{const p=new URL(name,import.meta.url);if(process.argv.includes('--check')){if(readFileSync(p,'utf8')!==body)throw Error(`Stale artifact ${name}`)}else writeFileSync(p,body)}
const room=d.rooms.FIRST.find(r=>r.id==='U-ENS3')!.boxes[0],f=a.floor,halfPartition=62.5
const clear={x:room.x+halfPartition,y:room.y+halfPartition,width:d.shell-d.envelope-(room.x+halfPartition),depth:room.depth-2*halfPartition}
const floorCases=[7,8,10].map(tile=>({tile,board:4,lowerBed:[4,6],upperBed:3,total:[4+4+3+tile,4+6+3+tile],relativeToDryFFL:[4+4+3+tile-f.finish,4+6+3+tile-f.finish]}))
const wallCases=[{board:10,maxStudSpacing:300},{board:12.5,maxStudSpacing:400},{board:20,maxStudSpacing:600}].map(c=>({...c,tile:8,upperBed:3,total:c.board+11,extraBeyondHypothetical15:c.board+11-15,smallRoomDepthIfTwoFacesReplaced:clear.depth-2*(c.board+11-15)}))
const p=d.services.guestEnsuiteBranch
const branchPlanLength=p.slice(1).reduce((n,v,i)=>n+Math.hypot(v[0]-p[i][0],v[1]-p[i][1]),0)
const cabinet={x:417.5,y:8800,width:300,depth:750,authoredFace:18},entry=[492.5,9500],wcPlanPoint=[717.5,8977.5]
const axes=[{name:'south / WC-aligned trial',x:567.5,y:8977.5},{name:'north / access-side trial',x:567.5,y:9450}].map(s=>({
 ...s,showerAddedPlanLength:Math.abs(s.x-entry[0])+Math.abs(s.y-entry[1]),showerAddedFallAt18:(Math.abs(s.x-entry[0])+Math.abs(s.y-entry[1]))*.018,
 wcAddedPlanLength:Math.abs(s.x-wcPlanPoint[0])+Math.abs(s.y-wcPlanPoint[1]),
 bare110Margins:{west:s.x-55-(cabinet.x+18),east:cabinet.x+cabinet.width-18-(s.x+55),south:s.y-55-(cabinet.y+18),north:cabinet.y+cabinet.depth-18-(s.y+55)}
}))
const record={scope:'Source reservations and authored product-family spatial comparisons; no current-house adoption or installed performance',
 sourceBlobs:Object.fromEntries(['compiler/reference-house/georgian/layout-revision.ts','compiler/reference-house/georgian/section-source.ts','compiler/reference-house/georgian/section-exemplar.ts'].map(p=>[p,execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim()])),
 house:{id:d.id,firstFFL:d.levels.first,deckTop:d.levels.first-f.finish,floor:{finish:f.finish,deck:f.deck,framing:f.joist,service:f.void,ceiling:f.ceiling}},clear,
 floorCases,wallCases,
 wetDutyQualification:'Tiling-layer comparison only: current wedi sealing overview distinguishes10/25board under DIN18534 exposure classes from4board application guidance. No universal UKminimum or qualified4board wet-floor claim. Any added waterproofing must be fully counted.',
 assemblyBasis:'wedi4board and4–6bondingbed from manufacturer UK brochure;7minimumtile from current application guidance;3tilebed and8/10tile are authored sensitivities, not matched installation tolerances. Wall spacing values are manufacturer conditions, not selected source studs.',
 sourceBranch:{points:p,length:branchPlanLength,diameterFallHeightAndDutySelected:false},
 showerOnlySensitivity:{pipeOutside:43,fallPerMetre:18,fall:branchPlanLength*.018,verticalEnvelope:43+branchPlanLength*.018,excessOverServiceVoid:43+branchPlanLength*.018-f.void,basis:'Hypothetical shower line on the source polyline; not WC gradient/capacity or permission to enter framing'},
 unadoptedBedroom4:{cabinet,showerCabinetEntry:entry,wcPlanPoint,axes,comparison110Outside:110,innerWidth:cabinet.width-2*18,innerLength:cabinet.depth-2*18,
 basis:'Evolving HAD candidate on29October2026;18faces/110stack andbothaxes are authored comparisons. WC plan midpoint is not verified product connection datum. Fitting/socket/support/insulation/tool envelopes and vertical positions unknown. Gross cabinet is not a floor hole.'},
 unknowns:['complete selected floor/wall/threshold compatibility and local reinforcement thickness','deck material/support and fixings; no capacity from22depth','matched current tray/waste/legs and all outlet datums','actual basin/WC/cistern and stack branch fittings','vent/base/ground route and discharge','maintenance body/tool/withdrawal and failure drying paths']}
emit('./wet-feasibility.json',JSON.stringify(record,null,2)+'\n')
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><style>text{font-family:Arial,sans-serif;font-size:2.8px;fill:#243740}.title{font-size:5.5px;font-weight:bold}.sub{font-size:3.6px;font-weight:bold}</style>'
const text=(x:number,y:number,t:string,cl='')=>svg+=`<text x="${x}" y="${y}" class="${cl}">${t.replaceAll('&','&amp;').replaceAll('<','&lt;')}</text>`
const line=(x:number,y:number,xx:number,yy:number,col='#3c7485',dash=false)=>svg+=`<path d="M${x},${y}L${xx},${yy}" fill="none" stroke="${col}" stroke-width=".4" ${dash?'stroke-dasharray="2 1"':''}/>`
const rect=(x:number,y:number,w:number,h:number,fill:string)=>svg+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#50616a" stroke-width=".25"/>`
text(12,15,'Wet-room feasibility: layer budgets and connected routes','title')
text(12,23,'Current source plus explicitly unadopted comparison · 29 October 2026 · no sanitary/hydraulic/structural acceptance')
text(12,34,'A  Current small en suite / 1:20','sub')
rect(12,43,clear.width/20,clear.depth/20,'#f4f0e8');rect(12+(9862.5-clear.x)/20,43+(2762.5-clear.y)/20,250/20,(3787.5-2762.5)/20,'#d5b9a3')
text(32,65,'2020 × 1075 before wet changes');text(31,73,'250 lining is occupied space');text(12,108,'HAD rejected two actual component layouts.');text(12,116,'No fixture or doorway fit is earned by area.');
text(12,128,'Two wet faces, hypothetical 15 replaced:');wallCases.forEach((v,i)=>text(12,136+i*8,`${v.board} board +3 bed +8 tile → depth ${v.smallRoomDepthIfTwoFacesReplaced}.`));
text(12,166,'Floor board 4 is NOT a stud-wall lining.');text(12,174,'Source partition 125 has no adopted layer split.');
text(140,34,'B  Tiling-layer comparison / 1:2','sub')
let yy=43,li=0;for(const [name,n,col] of [['tile (authored)',8,'#d3b69a'],['tile bed (authored)',3,'#d9dce0'],['board comparison',4,'#b9dbe1'],['bond bed (trial mean)',5,'#d9dce0'],['existing deck reservation',22,'#cbb79a']] as const){rect(140,yy,38,n/2,col);const ty=44+li*7;line(178,yy+n/4,181,ty-1);text(182,ty,`${name}: ${n}`);yy+=n/2;li++;}
text(140,88,'20 nominal above deck; 4–6 lower bed gives 19–21.');text(140,96,'Levelling, joint build-up and tolerances still cost depth.');text(140,108,'Tile 7 →18–20 / tile 10 →21–23.');text(140,116,'Neither a level-access shower nor a drainage fall.');text(140,128,'Qualified wet-duty system remains unresolved:');text(140,136,'extra membrane or different board adds its full depth.');text(140,148,'Held lower floor: 22 deck +238 frame +55 void +15.');text(140,156,'No borrowing deck/framing to hide waste or finishes.');
text(280,34,'C  Cabinet axes / 1:5','sub')
const cx=(x:number)=>280+(x-417.5)/5,cy=(y:number)=>43+(9550-y)/5
rect(280,43,60,150,'#d7c3aa');rect(283.6,46.6,52.8,142.8,'white')
for(const [i,s] of axes.entries()){svg+=`<circle cx="${cx(s.x)}" cy="${cy(s.y)}" r="11" stroke="${i?'#ad6844':'#367767'}" fill="none" stroke-width=".5"/>`;text(344,cy(s.y)+1,i?'North trial':'South trial');}
line(cx(entry[0]),cy(entry[1]),cx(567.5),cy(entry[1]));line(cx(567.5),cy(entry[1]),cx(567.5),cy(8977.5));text(344,75,'Gross 300 ×750');text(344,83,'18 faces assumed');text(344,91,'Inner 264 ×714');text(344,103,'Circles: bare 110 only');text(344,111,'No sockets/clips');text(344,119,'or tool clearance');text(344,131,'WC y 8977.5 is a');text(344,139,'plan assumption.');
text(12,203,'D  Missing connection is a physical length, not a destination label','sub')
text(12,214,`Source branch polyline: ${branchPlanLength} long; no duty/diameter/level selected. A hypothetical 43 shower pipe at 18/m needs 82.6 vertical envelope.`)
text(12,223,'That exceeds 55 by 27.6 before supports; reaching the void through deck/framing remains an independent crossing problem.')
text(12,234,'Bedroom 4 shower arrives at cabinet (492.5,9500). South axis adds 597.5 and 10.755 fall; north adds 125 and 2.25 at 18/m.')
text(12,243,'WC plan route to south axis 150; to north 622.5. Neither includes real connector take-offs or establishes WC fall, vent or hydraulic capacity.')
text(12,254,'Choose the actual stack/fittings/access together. The cabinet footprint is not an approved floor opening; lower-room and base route remain real work.')
line(12,263,408,263);text(12,274,'Printed scales at 100%. Read bcr-wet-result.md and wet-feasibility.json for declared sources, assumptions, findings and limits.')
text(12,283,'Complete water boundary, isolated release, visible failure, drying and reinstatement must survive the selected assembly. This is an investigation.')
svg+='</svg>\n';emit('./wet-feasibility.svg',svg);console.log(JSON.stringify({clear,floorCases,wallCases,axes},null,2))
