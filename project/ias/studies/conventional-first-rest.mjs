import {readFileSync, writeFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'

// Local vertical bounds only. No actual seat, socket or foot plan is invented.
const source='project/had/studies/water-replan.json'
const sourceBlob=execFileSync('git',['hash-object',source],{encoding:'utf8'}).trim()
const sections=JSON.parse(readFileSync(source,'utf8')).model.sections
const v={rim:sections.firstFFL,rcTop:sections.firstFloorRC.top,rcUnderside:sections.firstFloorRC.bottom,bodyDepth:81,fullTail:137,
  comparisonFootHeight:80,receivingClearance:25,catalogueTrayKg:23.3,catalogueFrameKg:3.3}
const serviceSource='project/mat/studies/whole-house-service-baseline.json'
const service=JSON.parse(readFileSync(serviceSource,'utf8')).interfaces.rearShowerDrop
const structuralSource='project/str/studies/open-loggia-support.json'
const structural=JSON.parse(readFileSync(structuralSource,'utf8'))
const field=structural.floor_fields.find(f=>f.id==='NW-W')
const [dx,dy]=service.trayDrainEvidence.drainCentre
const opening={status:'Authored formed accessible-well candidate; no structural, contact, hand/tool or closure admission',
  box:[dx-200,dy-200,400,400],z:[v.rcUnderside,v.rcTop],
  tray:service.trayDrainEvidence.tray,drain:[dx,dy],currentPort:service.port,
  fieldId:field.id,fieldRectangle:field.rectangle,
  eastToBeamFace:structural.wet_wall_beam.axis_x-structural.wet_wall_beam.section.b/2-(dx+200),
  southToSupportAxis:dy-200-structural.wet_wall_beam.support_axes_y[0],
  currentPortRetained:false,noAfterthoughtDrilling:true}
if(opening.box[0]<field.rectangle[0]||opening.box[1]<field.rectangle[1]||opening.box[0]+400>field.rectangle[2]||opening.box[1]+400>field.rectangle[3])throw Error('Proposed well left the source-owned NW-W field; rejoin STR')
const bounds={
  flangeOffset:'d >= 0; actual rim-to-native-flange offset unbound',
  retainedLowerProjection:'L >= 0; actual additional retained projection unbound',
  bodyBase:`${v.rim-v.bodyDepth} - d`,tailEnd:`${v.rim-v.fullTail} - d`,
  footBearingAtComparison:v.rim-v.comparisonFootHeight,
  tailBelowNativeFeetLowerBound:v.fullTail-v.comparisonFootHeight,
  cribHeightLowerBound:v.fullTail-v.comparisonFootHeight+v.receivingClearance,
  componentMassSubtotalKg:v.catalogueTrayKg+v.catalogueFrameKg,
  fullTailClearSameLevelFloor:'137 + d + L, before placement clearance and actual socket stroke'
}
const record={status:'Unadopted first-lift/first-rest bounds; no connected installation or handling pass',
  source,sourceBlob,values:v,bounds,opening,
  relatedSources:Object.fromEntries([serviceSource,structuralSource].map(p=>[p,execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim()])),
  nativeSources:{
    b594:'https://shop.my-bette.com/out/media/B594.pdf',
    b594Sha256:'c057d26962f2623f7aa6ef2e03ded404dbce3da24f3fddd5ef8370b51fdce0a5',
    footSystem:'https://content.my-bette.com/produkt_downloads/Fuss-System-fur-Duschwannen-133586/Fuss-System-fur-Duschwanne-1000-1000-mm-133662/Z0009038_REV15.pdf',
    footSystemSha256:'4a2ec361f14c01c510d270e7a240161e24f7aba1ac9fbcee325e04f5ccbc4b59'},
  holds:['actual native flange seat and d','configured support/contact layers and installed H',
    'permitted socket/pipe identity, engagement and extraction force','fixed-side axial restraint and complete floor closure',
    'complete moving package, protected grips and two-person task','actual four native foot contacts and independent crib strength/stability',
    'first-rest room reservation, entry/exit and restoration','incoming assembly, visible joint test and renewed water boundary']}
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;')
const parts=[]
const add=s=>parts.push(s)
const text=(x,y,s,size=3.3,color='#24343a')=>add(`<text x="${x}" y="${y}" font-size="${size}" fill="${color}">${escape(s)}</text>`)
const line=(x,y,xx,yy,color='#596c75',dash='')=>add(`<path d="M${x} ${y}L${xx} ${yy}" fill="none" stroke="${color}" stroke-width=".5" ${dash?'stroke-dasharray="2 1.5"':''}/>`)
const rect=(x,y,w,h,color,stroke='#596c75',dash='')=>add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" stroke="${stroke}" stroke-width=".5" ${dash?'stroke-dasharray="2 1.5"':''}/>`)
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="Arial,sans-serif"><rect width="420" height="297" fill="white"/>')
text(14,17,'IAS / Whole tray + retained frame + bolted B594: first rest',5.4)
text(14,26,'6 November 2026 | Unadopted comparison. Local vertical bounds; no fitted socket, crib or worker method.',3.4)
text(14,40,'A  Connected datum constraints',4)
text(14,47,'Vertical positions only; horizontal shapes below are schematic.',2.9)
const z=level=>63+(v.rim-level)*.30
rect(19,z(v.rcTop),156,(v.rcTop-v.rcUnderside)*.30,'#e1dfd7')
line(19,z(v.rim),175,z(v.rim),'#23756c')
text(22,z(v.rim)-3,`Conditional flush rim / FFL ${v.rim}`,3)
text(22,z(v.rcTop)+7,`RC top ${v.rcTop}`,3)
text(22,z(v.rcUnderside)-3,`RC underside ${v.rcUnderside}`,3)
// A datum envelope, deliberately not the shape or location of a supplied socket.
rect(119,z(v.rim),38,v.bodyDepth*.30,'#fff','#b36a37','dash')
line(138,z(v.rim-v.bodyDepth),138,z(v.rim-v.fullTail),'#b36a37','dash')
text(19,159,'Dashed native extent at d = 0 is an upper bound,',3)
text(19,165,'not the actual seal seat. Actual body lies d lower.',3)
text(19,174,`Body base: ${bounds.bodyBase}; tail end: ${bounds.tailEnd}.`,3.2)
text(19,183,'Socket / fixed pipe / closure: not yet joined.',3.2,'#994f29')
text(19,191,'A >120 mm core alone provides no hand access.',3)

text(205,40,'B  Ordinary receiving crib: contact duty',4)
text(205,47,'Schematic load path; no foot plan or timber size selected.',2.9)
rect(223,65,163,9,'#dce9ec')
text(228,71,'tray + retained frame / native flange stays bolted',2.8)
line(239,74,239,104);line(370,74,370,104)
line(239,104,253,104);line(356,104,370,104)
line(285,74,285,117,'#b36a37','dash')
rect(230,104,29,28,'#dcc8ab');rect(350,104,29,28,'#dcc8ab')
line(210,132,394,132)
text(264,99,'native feet',2.8)
text(265,114,'tail + L',2.8,'#994f29')
text(265,128,'25 reserve',2.8)
text(205,143,'Support only at all actual native foot contacts.',3)
text(205,152,'Crib -> protected floor; keep body/tail unloaded.',3)
text(205,161,'At H = 80, tail is at least 57 + d + L below feet.',3.1)
text(205,170,'Crib height >= 82 + d + L for 25 mm clearance.',3.1)
text(205,180,'This is a lower bound, not an 82 mm block approval.',2.9,'#994f29')
text(205,189,'Mass / grips / reactions / stability remain unearned.',3)

line(14,203,406,203)
text(14,215,'C  First release must bind the connection before the lift',4)
const notes=[
  'Keep the body bolted to the tray; first release the actual wet junction, wall brackets if fitted, and downstream connection.',
  'Do not pull against an unknown socket force. Independently restrain the fixed branch; the floor closure is not a pipe clamp.',
  'Same-level lateral movement needs at least 137 + d + L rise before clearance; actual joint stroke and handling may need more.',
  'Four native contacts, two real operators, complete mass and actual grips are required. 26.6 kg is only tray + frame catalogue mass.',
  'No room placement, safe first lift, complete closure, material exception or incoming installation is admitted by this sheet.'
]
notes.forEach((s,i)=>text(14,226+i*9,s,3.1))
text(14,281,'Owning result: ias-03-renewal-proportionality-result.md. Dimensions mm. Native H and d remain distinct.',3)
add('</svg>')
const emit=(name,body)=>{const path=new URL(name,import.meta.url);if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==body)throw Error('Stale '+name)}else writeFileSync(path,body)}
emit('./conventional-first-rest.json',JSON.stringify(record,null,2)+'\n')
emit('./conventional-first-rest.svg',parts.join('\n')+'\n')
parts.length=0
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" font-family="Arial,sans-serif"><rect width="420" height="297" fill="white"/>')
text(14,17,'IAS / One deliberately formed service well to test',5.4)
text(14,26,'400 x 400 candidate at the actual B594 drain. No RC opening, support, material or worker admission.',3.4)
text(14,40,'A  Located plan / 1:5; no foot pattern invented',4)
const [tx,ty,tw,th]=opening.tray,px=x=>14+(x-tx)/5,py=y=>55+(ty+th-y)/5
rect(14,55,tw/5,th/5,'#eef3f3')
rect(px(opening.box[0]),py(opening.box[1]+400),80,80,'#fff0dc','#b36a37')
add(`<circle cx="${px(dx)}" cy="${py(dy)}" r="12" fill="none" stroke="#23756c" stroke-width=".7"/>`)
add(`<circle cx="${px(service.port[0])}" cy="${py(service.port[1])}" r="${service.port[2]/10}" fill="none" stroke="#9b5761" stroke-dasharray="2 1.5" stroke-width=".5"/>`)
text(20,64,'1000-square tray',3)
text(20,108,'well 400 square',3)
text(18,159,'120 flange',3,'#23756c')
text(18,167,'at drain axis',3,'#23756c')
text(18,175,'2012.5 / 9452.5',3,'#23756c')
text(77,161,'current 110 port',3,'#9b5761')
text(77,169,'110 east; replaced',3,'#9b5761')
text(20,245,'Actual native feet / extra support: unbound.',3)
text(14,265,'Well x1812.5..2212.5 / y9252.5..9652.5.',3.2)
text(14,273,'10 from west tray edge; 300 from each N/S edge.',3.1)

text(232,40,'B  Vertical section / 1:5 datum envelope',4)
text(232,48,'d = 0 upper bound only; actual body lies d lower.',2.9)
const sy=level=>64+(v.rim-level)/5
rect(240,sy(v.rcTop),30,(v.rcTop-v.rcUnderside)/5,'#e1dfd7')
rect(350,sy(v.rcTop),46,(v.rcTop-v.rcUnderside)/5,'#e1dfd7')
line(240,sy(v.rim),396,sy(v.rim),'#23756c')
rect(298,sy(v.rim),24,v.bodyDepth/5,'#fff','#b36a37','dash')
line(310,sy(v.rim-v.bodyDepth),310,sy(v.rim-v.fullTail),'#b36a37','dash')
line(270,sy(v.rcTop),270,sy(v.rcUnderside));line(350,sy(v.rcTop),350,sy(v.rcUnderside))
text(244,60,`rim ${v.rim}`,2.8)
text(353,sy(v.rcTop)+6,`RC ${v.rcTop}`,2.8)
text(353,sy(v.rcUnderside)-3,`RC ${v.rcUnderside}`,2.8)
text(278,124,'formed width 400',3)
text(232,135,'Actual socket / retained pipe / axial restraint',3.1)
text(232,142,'must occupy and release within this joined section.',3.1)
text(232,152,'Classified removable closure and its support:',3.1,'#994f29')
text(232,159,'unselected; do not borrow sleeve or diaphragm proof.',3,'#994f29')
text(232,173,'Lower approach: existing 800 clear ceiling hatch.',3)
text(232,181,'Small platform / hands / tools still need an actual task.',3)
text(232,195,`Well stays in NW-W; east-to-beam face ${opening.eastToBeamFace}.`,3)
text(232,203,`South edge to lower beam support axis ${opening.southToSupportAxis}.`,3)
text(232,215,'STR must own opening-edge, rebar, anchorage and',3)
text(232,223,'load effects; no current floor member is cut here.',3)
text(232,237,'Native frame/feet and additional contact supports',3)
text(232,245,'must remain supported. No contact exemption earned.',3)
text(232,265,'Accessible territory is a design rewind, not a fitting pass.',3)
text(14,285,'Owning result: ias-03-renewal-proportionality-result.md. Plan/vertical scales 1:5 at full size; d, native contacts and closure unbound.',2.9)
add('</svg>')
emit('./conventional-opening.svg',parts.join('\n')+'\n')
console.log(JSON.stringify({status:record.status,bounds},null,2))
