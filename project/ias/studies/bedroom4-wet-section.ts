/** Conditional section of an unadopted HAD candidate. Not a selected product assembly. */
import {readFileSync,writeFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {layoutRevision as d} from '../../../compiler/reference-house/georgian/layout-revision.js'
import {sectionAssemblyChoices as a} from '../../../compiler/reference-house/georgian/section-source.js'
const f=a.floor, total=f.finish+f.deck+f.joist+f.void+f.ceiling
if(d.id!=='RH-LAYOUT-REVISION-02'||d.levels.first!==3450||total!==350)throw Error('Reappraise candidate against changed house')
const tray={x:1337.5,y:9825,width:1000,depth:1000,profile:40,rimToLowWetFloor:25,comparisonRim:160}
const cabinet={x:417.5,y:8800,width:300,depth:750}
const boxing={width:150,height:170,face:18,westAxis:492.5,northAxis:10750}
const fallPerMetre=18,pipeOutsideComparison=43,fittingOutsideComparison=60
// Delta is an authored sensitivity, NOT a manufacturer tolerance or physical bound.
const flangeOffsets=[0,10,15]
const wetFloor=tray.comparisonRim-tray.rimToLowWetFloor
const waste={housingFlangeComparison:wetFloor,outletBelowFlange:50,bottomBelowFlange:81,seat:wetFloor,bottom:wetFloor-81,outlet:wetFloor-50}
const definitions=[
 {name:'NE central north',outlet:[1837.5,10660],points:[[1837.5,10660],[1837.5,10750],[492.5,10750],[492.5,9500]],lengthAtTrayExit:590},
 {name:'NE central west via north perimeter',outlet:[1502.5,10325],points:[[1502.5,10325],[1502.5,10750],[492.5,10750],[492.5,9500]],lengthAtTrayExit:590},
 {name:'NW tray south outlet alternative',outlet:[917.5,9990],points:[[917.5,9990],[492.5,9990],[492.5,9500]],lengthAtTrayExit:590}
]
const routes=definitions.map(r=>{
 const length=r.points.slice(1).reduce((sum,p,i)=>sum+Math.abs(p[0]-r.points[i][0])+Math.abs(p[1]-r.points[i][1]),0)
 const fall=length*fallPerMetre/1000,axisAtEnd=waste.outlet-fall
 const axisAtTrayExit=waste.outlet-r.lengthAtTrayExit*fallPerMetre/1000
 return {...r,length,fall,axisAtEnd,fittingBottomAtEnd:axisAtEnd-fittingOutsideComparison/2,axisAtTrayExit,
   fittingUnderTrayClearanceAtExit:tray.comparisonRim-tray.profile-(axisAtTrayExit+fittingOutsideComparison/2),
   sensitivity:flangeOffsets.map(delta=>({authoredFlangeOffsetBelowWetFloor:delta,flange:wetFloor-delta,outlet:waste.outlet-delta,axisAtCabinetEntry:axisAtEnd-delta,fittingBottomAtCabinetEntry:axisAtEnd-delta-30,
     axisAfter125CabinetTravel:axisAtEnd-delta-2.25,fittingBottomAfter125CabinetTravel:axisAtEnd-delta-2.25-30}))}
})
const record={scope:'Conditional architectural section; no source adoption, product compatibility, capacity or waterproofing pass',
 sourceBlobs:Object.fromEntries(['compiler/reference-house/georgian/layout-revision.ts','compiler/reference-house/georgian/section-source.ts'].map(p=>[p,execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim()])),
 hadCandidate:{commit:'4c7e1047a4a96537d847356df39ca8907036533f',path:'project/had/studies/bedroom4-allocation-study.ts',blob:'099bd8d74b4db3fa2941d21d32f6de728c2b7a57'},
 house:{firstFFL:d.levels.first,total,finish:f.finish,deck:f.deck,framing:f.joist,service:f.void,ceiling:f.ceiling,deckTop:d.levels.first-f.finish,soffit:d.levels.first-total},
 tray,cabinet,boxing,waste,fallPerMetre,pipeOutsideComparison,fittingOutsideComparison,flangeOffsets,routes,
 rejectedWetTrial:{carrier:12.5,membrane:1,adhesive:3,tile:10,total:26.5,extra:26.5-f.finish,wetFFL:d.levels.first-f.finish+26.5,raisedTrayTop:d.levels.first-f.finish+26.5+tray.comparisonRim},
 flushComparison:{rim:40,upperWetFloor:15,optimisticHousingBottom:15-81,optimisticOutletAxis:15-50},
 boxingComparison:{clearWidth:boxing.width-2*boxing.face,underCap:boxing.height-boxing.face,capMargin:boxing.height-boxing.face-waste.outlet-fittingOutsideComparison/2},
 rejectedDirectWest:{length:1835,fall:33.03,reason:'Crosses770mm of open floor outside existing perimeter reservation'},
 correction:'Withdraws b8745066 corner1000/seat132/outlet101 and2.1/-6.4 clearance claims. Current manual shows edge-centred1000square;50 and81 downward from housing flange. D12 is not local thickness.',
 unknowns:['housing flange relation to upper wet floor and gasket','current matched .040 tray/waste/kit height and leg locations','actual socket/clip/support envelope and withdrawal','supported wet floor/wall/threshold','actual stack fitting/branch connection and structure'],
 provenance:'Mira1493053-W2-D pp3–4/15–18; flange deltas0/10/15 are authored sensitivities, not measured bounds.160rim and60fitting are comparison inputs; historical140–160range does not certify current kit.'}
const out=(name:string,body:string)=>{const p=new URL(name,import.meta.url);if(process.argv.includes('--check')){if(readFileSync(p,'utf8')!==body)throw Error(`Stale ${name}`)}else writeFileSync(p,body)}
out('./bedroom4-wet-section.json',JSON.stringify(record,null,2)+'\n')
const svg:string[]=[];const add=(s:string)=>svg.push(s),esc=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;')
const text=(x:number,y:number,s:string,size=2.7)=>add(`<text x="${x}" y="${y}" font-size="${size}">${esc(s)}</text>`)
const line=(x:number,y:number,xx:number,yy:number,color='#355f71',dash=false)=>add(`<path d="M${x},${y}L${xx},${yy}" stroke="${color}" fill="none" stroke-width=".4" ${dash?'stroke-dasharray="1.4 1"':''}/>`)
const rect=(x:number,y:number,w:number,h:number,fill:string)=>add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#53616b" stroke-width=".25"/>`)
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="Arial,sans-serif" fill="#23343a"><rect width="420" height="297" fill="white"/>')
text(12,15,'IAS / Bedroom 4 wet floor and perimeter waste comparison',5.4)
text(12,23,'Unadopted HAD alternative · no selected product assembly · no current-house geometry change',3)
text(12,34,'A  Located route / 1:25 at A3',3.5)
const px=(x:number)=>12+(x-417.5)/25,py=(y:number)=>43+(10825-y)/25
rect(px(417.5),py(10825),1920/25,2532.5/25,'#f6f2e8')
rect(px(tray.x),py(10825),40,40,'#dce9ec');text(px(1450),py(10300),'1000 tray',2.6)
rect(px(cabinet.x),py(9550),12,30,'#c9b395');text(15,py(9250),'cabinet',2.2)
rect(px(717.5),py(9155),560/25,355/25,'#dde3e2');text(px(760),py(8950),'WC',2.2)
rect(px(1400),py(8512.5),400/25,220/25,'#dde3e2')
rect(px(417.5),py(10825),150/25,1275/25,'#d9d1bd')
rect(px(567.5),py(10825),770/25,150/25,'#d9d1bd')
for(const [i,r] of routes.slice(0,2).entries()){
 const pts=r.points.map(([x,y])=>`${px(x)},${py(y)}`).join(' ')
 add(`<polyline points="${pts}" fill="none" stroke="${i?'#a56544':'#287364'}" stroke-width=".55" ${i?'stroke-dasharray="1.4 1"':''}/>`)
 add(`<circle cx="${px(r.outlet[0])}" cy="${py(r.outlet[1])}" r="1.1" fill="${i?'#a56544':'#287364'}"/>`)
}
text(12,157,'NE north/west routes: 2685 / 48.33 fall.',2.7)
text(12,164,'NW south alternative: 915 / 16.47 fall.',2.7)
text(12,171,'150-wide boxing is real occupied space.',2.7)
text(12,178,'No diagonal pipe across approach.',2.7)
text(12,185,'NW alternative introduces wet window duty.',2.7)
text(116,34,'B  Vertical budget / 1:5',3.5)
// Section datum is proposed wet FFL=0; retained floor lower layers are diagrammed to scale.
const sy=(z:number)=>86-z/5
rect(116,sy(160),40,40/5,'#dce9ec');line(118,sy(120),118,sy(0));line(153,sy(120),153,sy(0))
text(160,sy(160)+2,'+160 rim: comparison input',2.7)
text(160,sy(120)+2,'+120 nominal underside',2.7)
rect(133,sy(waste.seat),9,81/5,'#e7c7b6')
line(142,sy(waste.outlet),157,sy(waste.outlet),'#287364')
text(160,sy(waste.outlet)+3,'+85 axis / +54 bottom ONLY if flange +135',2.7)
line(112,sy(0),244,sy(0),'#23343a');text(160,sy(0)-2,'Wet finish +3456.5 in 26.5 trial',2.7)
let z=0;for(const [name,n,fill] of [['wet trial',26.5,'#e7c7b6'],['deck',22,'#c9b395'],['framing reserve',238,'#edf0f0'],['service void',55,'#ffffff'],['ceiling',15,'#d3dadb']] as const){rect(116,sy(z),40,n/5,fill);text(160,sy(z)+n/10+1,`${name} ${n}`,2.7);z-=n}
text(116,166,'Dry FFL +3450: wet trial adds 6.5.',2.7)
text(116,173,'Tray rim +3616.5: 166.5 above dry FFL.',2.7)
text(116,180,'Extra bedding/levelling is not included.',2.7)
text(116,187,'Deck and lower floor package unchanged.',2.7)
text(280,34,'C  Boxing / 1:5 and route checks',3.5)
rect(280,45,30,34,'#d9d1bd');rect(283.6,48.6,22.8,30.4,'#fff')
add(`<circle cx="295" cy="${79-85/5}" r="6" fill="#dce9ec" stroke="#287364" stroke-width=".4"/>`)
text(316,49,'150 ×170 gross',2.7);text(316,57,'18 face/cap',2.7);text(316,65,'60 fitting envelope',2.7);text(316,73,'37 below cap at idealized flange',2.7)
text(280,90,'Conditional end fitting underside:',2.7)
text(280,97,'NE +6.67; NW +38.53 at delta 0.',2.7)
text(280,109,'DATUM / STACK HOLD',3.4)
text(280,118,'Flange delta 10 lowers every axis by10.',2.7)
text(280,125,'NE end fitting then lies3.33 below floor.',2.7)
text(280,132,'125 in cabinet adds2.25 fall, not zero.',2.7)
text(280,139,'Idealized under-tray clearance15.62.',2.7)
text(280,146,'Real legs, contour, clips still govern.',2.7)
text(280,158,'Flush40 optimistic housing bottom −66;',2.7)
text(280,165,'it is not an above-floor-only solution.',2.7)
text(280,177,'The old2.1/−6.4 clash is WITHDRAWN.',2.7)
text(280,184,'No assumed flange tolerance is certified.',2.7)
line(12,199,408,199)
text(12,210,'D  Complete release and failure tasks',3.5)
const notes=[
 'Hair-trap cleaning from above does not replace the housing. Prove tool access beneath the actual tray and between its legs.',
 'Isolate shower; open independent local cover; support/disconnect pipe; inspect and dry the selected water boundary; reassemble and test.',
 'Whole tray: dismantle enclosure as needed, renew perimeter seals, disconnect waste and supports, two-person lift and verified carrying route.',
 'A 900 nominal door does not prove flat passage of a 1000 tray. A north hatch does not prove reach to the far WC connector.',
 'First-wet surface, leak declaration, wet/dry threshold, stack/vent, supported floor opening and exact water system remain design holds.'
];notes.forEach((s,i)=>text(12,221+i*8,s,2.7))
text(12,274,'Sources: Mira 1493053-W2-D and recorded historical comparison; read the owning result for applicability and all conditional inputs.',2.6)
text(12,283,'IAS-03 remains incomplete. Model millimetres; printed scales at 100%. Neither product compatibility nor construction acceptance is implied.',2.6)
add('</svg>');out('./bedroom4-wet-section.svg',svg.join('\n')+'\n')
console.log(JSON.stringify({routes,levels:record.rejectedWetTrial,boxing:record.boxingComparison},null,2))
