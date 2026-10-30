/** Source-bound geometry and declared statics sensitivities; no member sizing or capacity. */
import {readFileSync, writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {layoutRevision as house} from '../../../compiler/reference-house/georgian/layout-revision.js'
import {layoutFamilySource, currentRoofZ} from '../../../compiler/reference-house/georgian/layout-family.js'
import {sectionAssemblyChoices as assembly} from '../../../compiler/reference-house/georgian/section-source.js'
import {design as exemplar} from '../../../compiler/reference-house/georgian/section-exemplar.js'

const checking = process.argv.includes('--check')
const emit = (name:string, body:string) => {
  const path = new URL(name, import.meta.url)
  if (checking) {
    if (readFileSync(path, 'utf8') !== body) throw new Error(`Stale artifact: ${name}`)
  } else writeFileSync(path, body)
}
const sourcePaths = [
  'compiler/reference-house/georgian/layout-revision.ts',
  'compiler/reference-house/georgian/layout-family.ts',
  'compiler/reference-house/georgian/section-source.ts',
  'compiler/reference-house/georgian/section-exemplar.ts',
]
const sourceBlob = (path:string) => {
  const bytes = readFileSync(path)
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
}
const f = assembly.floor
const wall = exemplar.section
const outerLeafStart = wall.weather + wall.cavity
const outerLeafEnd = outerLeafStart + wall.inner
const courtLeafEnd = house.court.y - outerLeafStart
const courtLeafStart = courtLeafEnd - wall.inner
const spanGeometry = {
  finishedFaceGapMm: house.court.y - 2 * house.envelope,
  structuralFaceGapMm: courtLeafStart - outerLeafEnd,
  representedLeafCentreGapMm: (courtLeafStart + courtLeafEnd - outerLeafStart - outerLeafEnd) / 2,
  outerLeafIntervalMm: [outerLeafStart, outerLeafEnd],
  courtLeafIntervalMm: [courtLeafStart, courtLeafEnd],
  basis: 'Source section layers, not selected bearing centres, effective span or capacity',
}
const heldFloorMm = f.finish + f.deck + f.joist + f.void + f.ceiling
const fixedFunctionsMm = f.finish + f.void + f.ceiling
const floorBudgetMm = heldFloorMm - fixedFunctionsMm
const floorCases = [
  {id:'HC150', label:'Hollowcore 150', primaryMm:150, toppingMm:0},
  {id:'HC150-T50', label:'Hollowcore 150 + authored 50 topping', primaryMm:150, toppingMm:50},
  {id:'HC150-T75', label:'Hollowcore 150 + published 75 topping comparator', primaryMm:150, toppingMm:75},
  {id:'HC200', label:'Hollowcore 200', primaryMm:200, toppingMm:0},
  {id:'HC200-T50', label:'Hollowcore 200 + authored 50 topping', primaryMm:200, toppingMm:50},
  {id:'HC200-T75', label:'Hollowcore 200 + published 75 topping comparator', primaryMm:200, toppingMm:75},
  {id:'RC200', label:'Hypothetical reinforced-concrete 200', primaryMm:200, toppingMm:0},
  {id:'STEEL200-P25', label:'Hypothetical steel joists 200 + actual panel family 25', primaryMm:225, toppingMm:0},
  {id:'STEEL225-P25', label:'Hypothetical steel joists 225 + actual panel family 25', primaryMm:250, toppingMm:0},
  {id:'TIMBER-CONTROL', label:'Represented framing 238 + deck 22', primaryMm:f.joist+f.deck, toppingMm:0},
].map(c => ({...c,
  upperInterfaceBalanceMm: floorBudgetMm-c.primaryMm-c.toppingMm,
  minimumTotalBeforeUpperInterfacesMm: fixedFunctionsMm+c.primaryMm+c.toppingMm,
  totalWithNonnegativeBalanceMm: fixedFunctionsMm+c.primaryMm+c.toppingMm+Math.max(0,floorBudgetMm-c.primaryMm-c.toppingMm),
}))
const concreteUnitWeightKNm3 = 25 // Explicit screening assumption, not a project design value.
const unitLoads = [
  {id:'HC150', selfWeightKNm2:2.4, basis:'F1 ordinary product selfweight; not table capacity'},
  {id:'HC200', selfWeightKNm2:3.1, basis:'F1 product selfweight; not table capacity'},
  {id:'RC200', selfWeightKNm2:0.2*concreteUnitWeightKNm3, basis:'Hypothetical 200 mm slab at assumed 25 kN/m³'},
]
const stripLengthsM = [spanGeometry.finishedFaceGapMm,spanGeometry.representedLeafCentreGapMm].map(n=>n/1000)
const stripReactions = unitLoads.map(load=>({...load,
  endReactions:stripLengthsM.map(lengthM=>({lengthM,reactionKNperM:load.selfWeightKNm2*lengthM/2})),
}))
const angle = house.roof.upperPitchDeg*Math.PI/180
const roofBandNormalMm = layoutFamilySource.roofBuildZone*Math.cos(angle)
const roofMassCases = [150,200].map(panelMm=>({panelMm,
  remainingNormalBandMm:roofBandNormalMm-panelMm,
  selfWeightPerSlopeAreaKNm2:panelMm/1000*concreteUnitWeightKNm3,
  verticalLoadPerHorizontalPlanKNm2:panelMm/1000*concreteUnitWeightKNm3/Math.cos(angle),
}))
const vaultThicknessMm = 102.5 // Hypothetical geometric variable, not an adequate vault thickness.
const vaultCases = [100,200,350,500].map(riseMm=>({riseMm,
  horizontalReactionOverTotalVerticalLoad:spanGeometry.finishedFaceGapMm/(8*riseMm),
  minimumDepthWithHeldFinishServicesCeilingMm:riseMm+vaultThicknessMm+fixedFunctionsMm,
  balanceAgainstHeldFloorMm:heldFloorMm-riseMm-vaultThicknessMm-fixedFunctionsMm,
}))
const crownFillMm = 27.5
const fillUnitWeightKNm3 = 20 // Explicit fill-mass sensitivity; no selected material or load.
const exposedCrownIntradosMm = house.levels.first-f.finish-crownFillMm-vaultThicknessMm
const exposedVaultCases = [200,500].map(riseMm=>({riseMm,
  crownIntradosMm:exposedCrownIntradosMm,springingIntradosMm:exposedCrownIntradosMm-riseMm,
  floorFFLToSpringingMm:house.levels.first-exposedCrownIntradosMm+riseMm,
  averageFillThicknessMm:crownFillMm+riseMm/3,fillThicknessAtSpringingMm:crownFillMm+riseMm,
  hypotheticalFillWeightKNm2:(crownFillMm+riseMm/3)/1000*fillUnitWeightKNm3,
}))
const record = {
  scope:'Original source-bound section/load/thrust sensitivities. No selected assembly, member, design action, capacity, site or engineering acceptance.',
  sourceBlobs:Object.fromEntries(sourcePaths.map(path=>[path,sourceBlob(path)])),
  sourceAuthority:{house:house.id,roof:layoutFamilySource.id,section:assembly.id},
  spanGeometry,
  floor:{heldTotalMm:heldFloorMm,fixedFunctions:{finishMm:f.finish,servicesMm:f.void,ceilingMm:f.ceiling},primaryAndUpperInterfaceBudgetMm:floorBudgetMm,
    balanceMeaning:'All required levelling/camber, acoustic isolation, distribution and tolerance functions; not an evidenced layer specification or spare depth',cases:floorCases},
  concreteUnitWeightKNm3,concreteUnitWeightBasis:'Explicit mass screening assumption, not prescribed density or project design input',
  stripModel:'Simply supported 1 m wide strip under uniform vertical load q: each end reaction qL/2. Source lengths are diagnostics; actual effective spans/bearings, walls, imposed loads, finishes and equipment excluded.',
  stripReactions,
  toppings:[50,75].map(thicknessMm=>({thicknessMm,addedWeightKNm2:thicknessMm/1000*concreteUnitWeightKNm3})),
  roof:{pitchDeg:house.roof.upperPitchDeg,verticalBandMm:layoutFamilySource.roofBuildZone,normalBandMm:roofBandNormalMm,
    halfPlanRunMm:house.roof.ridgeInset,halfSlopeLengthMm:house.roof.ridgeInset/Math.cos(angle),
    ridgeMm:currentRoofZ(5900,house.roof.ridgeInset),
    ceilingUndersideMm:assembly.roofCeiling.top-assembly.roofCeiling.member-assembly.roofCeiling.lining,
    ceilingTopMm:assembly.roofCeiling.top,ceilingMemberZoneMm:assembly.roofCeiling.member,ceilingLiningMm:assembly.roofCeiling.lining,
    storageDeckTopMm:assembly.roofCeiling.top+assembly.roofCeiling.deck,
    primaryNormalDepthSensitivityMm:150,remainingNormalBandAfter150Mm:roofBandNormalMm-150,
    massBasis:'Hypothetical reinforced-concrete panels at declared density; vertical gravity load per plan area = slope-area weight / cos(pitch). Not selected panels or support reactions.',massCases:roofMassCases},
  vault:{model:'Ideal three-hinged parabolic arch under uniformly distributed vertical load per horizontal length. H/W=L/(8f), W is total vertical load. Not a real vault, nonuniform load, line-of-thrust, settlement or lateral stability calculation.',
    spanMm:spanGeometry.finishedFaceGapMm,hypotheticalCrownThicknessMm:vaultThicknessMm,cases:vaultCases,
    exposedComparator:{floorFFLMm:house.levels.first,finishMm:f.finish,hypotheticalCrownFillMm:crownFillMm,fillUnitWeightKNm3,
      relocatedFunctionsMm:{services:f.void,ceiling:f.ceiling},cases:exposedVaultCases,
      fillModel:'Flat upper surface over parabolic intrados with constant VERTICAL masonry offset, not a constant radial ring or a masonry design. Mean fill = crown fill + rise/3. Fill weight excludes ring, finish and imposed loads. Nonuniform fill loading is NOT analysed by the separate UDL thrust diagnostic.'}},
  sources:{
    F1:'https://www.forterra.co.uk/wp-content/uploads/2020/12/Bison-Hollowcore-Brochure-2019.pdf',
    F3:'https://www.mpaprecast.org/MPAPrecast/media/root/Publications/Flooring/Hollowcore-Composite-Floor-Systems_1.pdf',
    F5:'https://knauf.com/en-GB/p/product/gifa-fhb-18mm-and-25mm-floor-panel-11021_0306',
  },
}
if (Math.abs(wall.weather+wall.cavity+wall.inner+wall.finish-house.envelope)>1e-9) throw new Error('Source wall-layer mismatch')
if (floorCases.some(c=>c.totalWithNonnegativeBalanceMm<heldFloorMm)) throw new Error('Unaccounted floor budget')
if (stripReactions.some(c=>c.endReactions.some(r=>Math.abs(2*r.reactionKNperM-c.selfWeightKNm2*r.lengthM)>1e-9))) throw new Error('Strip equilibrium mismatch')
emit('./span-envelopes.json',JSON.stringify(record,null,2)+'\n')

const esc=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;')
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><style>text{font-family:Arial,sans-serif;fill:#233440;font-size:3.1px}.title{font-size:6px;font-weight:700}.heading{font-size:4px;font-weight:700}.small{font-size:2.7px}.warning{fill:#9b3e27}.line{stroke:#405b68;stroke-width:.4;fill:none}.datum{stroke:#8b6b56;stroke-width:.35;stroke-dasharray:2 1;fill:none}</style>'
const text=(x:number,y:number,value:string,cl='')=>svg+=`<text x="${x}" y="${y}" class="${cl}">${esc(value)}</text>`
const line=(x:number,y:number,xx:number,yy:number,cl='line')=>svg+=`<path d="M${x},${y} L${xx},${yy}" class="${cl}"/>`
const rect=(x:number,y:number,w:number,h:number,fill:string)=>svg+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#405b68" stroke-width=".3"/>`
text(10,13,'Primary floors and roof: the space each family must earn','title')
text(10,22,'30 October 2026 | source-bound comparison | no member sizing, capacity or selected construction')
text(10,34,'A  Complete 350 mm floor budgets / vertical scale 1:3','heading')
const colours={finish:'#dfc7a7',balance:'#fae9aa',topping:'#bac6cb',primary:'#b9d6e4',services:'#ffffff',ceiling:'#e0e4e6'}
const drawnCases=[['HC150-T75','HC150 + 75'],['HC200','HC200'],['RC200','RC200 trial'],['STEEL225-P25','Steel225 + panel25']] as const
for (const [index,[id,label]] of drawnCases.entries()) {
  const c=floorCases.find(v=>v.id===id)!
  const x=13+index*47
  text(x-3,45,label,'small')
  let y=51
  for(const [depth,fill] of [[f.finish,colours.finish],[c.upperInterfaceBalanceMm,colours.balance],[c.toppingMm,colours.topping],[c.primaryMm,colours.primary],[f.void,colours.services],[f.ceiling,colours.ceiling]] as [number,string][]) {
    if(depth<=0)continue
    rect(x,y,26,depth/3,fill)
    text(x+2,y+depth/6+1,String(depth),'small')
    y+=depth/3
  }
  text(x-2,177,`Balance ${c.upperInterfaceBalanceMm} mm`,'small')
}
text(10,186,'Gold is an unselected functional budget, not spare depth.','small')
const legend=[['finish',colours.finish],['upper functions',colours.balance],['topping',colours.topping],['primary',colours.primary],['services',colours.services],['ceiling',colours.ceiling]]
for(const [i,[label,fill]] of legend.entries()){
  const x=10+(i%3)*63,y=192+Math.floor(i/3)*9
  rect(x,y,5,4,fill);text(x+8,y+3.5,label,'small')
}
text(10,219,'HC200 + 75 topping = 365 mm before upper functions.','warning')
text(10,227,'The 50/75 toppings and steel/RC depths are comparisons.','small')
text(10,234,'No acoustic, fire, camber or deflection performance proved.','small')
text(10,242,'Exposed vault trial / section 1:25 / services relocated','small')
const vx=15,vy=260,vs=25,vw=spanGeometry.finishedFaceGapMm/vs,vRise=200/vs,vt=vaultThicknessMm/vs
const finishBottomY=vy-(house.levels.first-f.finish-exposedVaultCases[0].springingIntradosMm)/vs
const finishTopY=finishBottomY-f.finish/vs
svg+=`<path d="M${vx},${finishBottomY} L${vx+vw},${finishBottomY} L${vx+vw},${vy-vt} Q${vx+vw/2},${vy-2*vRise-vt} ${vx},${vy-vt} Z" fill="${colours.balance}" stroke="#405b68" stroke-width=".3"/>`
svg+=`<path d="M${vx},${vy} Q${vx+vw/2},${vy-2*vRise} ${vx+vw},${vy} L${vx+vw},${vy-vt} Q${vx+vw/2},${vy-2*vRise-vt} ${vx},${vy-vt} Z" fill="${colours.primary}" stroke="#405b68" stroke-width=".3"/>`
rect(vx,finishTopY,vw,f.finish/vs,colours.finish)
text(155,249,'FFL +3450','small');text(155,261,'Spring +3100','small')
text(58,265,'Crown intrados +3300','small')

text(215,34,'B  Current roof envelope / geometry at 1:30','heading')
text(215,43,'The 300 mm vertical band is 271.9 mm normal to the face.','small')
const rx=225,ry=127,scale=30,zBase=6400
const rp=(u:number,z:number)=>[rx+u/scale,ry-(z-zBase)/scale]
const pitchPoints=[0,house.roof.ridgeInset,house.court.y].map(u=>[u,currentRoofZ(5900,u)])
const roofPoints=[...pitchPoints,...[...pitchPoints].reverse().map(([u,z])=>[u,z-layoutFamilySource.roofBuildZone])].map(([u,z])=>rp(u,z).join(',')).join(' ')
svg+=`<polygon points="${roofPoints}" fill="#dce6eb" stroke="#405b68" stroke-width=".4"/>`
const ceilingLeft=rp(house.envelope,assembly.roofCeiling.top)
rect(ceilingLeft[0],ceilingLeft[1],spanGeometry.finishedFaceGapMm/scale,(assembly.roofCeiling.member+assembly.roofCeiling.lining)/scale,'#e5d7c7')
for(const u of [(outerLeafStart+outerLeafEnd)/2,(courtLeafStart+courtLeafEnd)/2]){
  const [xx]=rp(u,0);line(xx,76,xx,134,'datum')
}
text(265,64,`Ridge +${record.roof.ridgeMm.toFixed(1)}`)
text(215,71,'Dashed: represented inner-leaf centres; bearings unresolved.','small')
text(240,145,'3415 finished faces / 3445 structural faces / 3585 centres','small')
text(215,154,'Ceiling: +6550 to +6690, including 15 mm lining.','small')
text(215,162,'Tie, web, heel, storage and insulation need actual positions.','small')
text(215,170,'150 mm normal primary trial leaves 121.9 for ALL other','small')
text(215,176,'slope-band functions. No complete roof fit is asserted.','small')

text(215,193,'C  Vault: retained flat layers versus exposed intrados','heading')
text(215,201,'UDL thrust ratio is ideal; the fill load is nonuniform.','small')
text(219,210,'Rise mm','small');text(250,210,'H / W','small');text(279,210,'Flat depth mm','small');text(332,210,'Exposed spring mm','small')
for(const [i,c] of exposedVaultCases.entries()){
  const flat=vaultCases.find(v=>v.riseMm===c.riseMm)!,y=219+i*9
  text(219,y,String(c.riseMm));text(250,y,flat.horizontalReactionOverTotalVerticalLoad.toFixed(3));text(279,y,flat.minimumDepthWithHeldFinishServicesCeilingMm.toFixed(1));text(332,y,`+${c.springingIntradosMm}`)
}
text(215,239,'Exposed: 20 finish + 27.5 crown fill + 102.5 crown thickness.','small')
text(215,247,'Crown intrados +3300; 55 services + 15 ceiling relocated.','small')
text(215,255,'Geometry only: actual fill, abutments/ties and vault stability','small')
text(215,261,'remain unresolved. Flat-layer depths exclude extra fill.','small')
line(10,269,410,269)
text(10,279,'Model millimetres; source fingerprints and exact arithmetic: project/str/studies/span-envelopes.ts / .json','small')
text(10,287,'Read structural-floor-roof-options.md for sources, conditions and rejected cases. A3 at 100%; comparison only.','small')
svg+='</svg>\n'
emit('./span-envelopes.svg',svg)
console.log(JSON.stringify({checked:checking,spanGeometry,floorBudgetMm,roofBandNormalMm,vault200:vaultCases[1]},null,2))
