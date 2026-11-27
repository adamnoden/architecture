import {sha256SemanticFingerprint} from '../../core/identity.js'
import {subtractPlan,expandPlan,planArea,validPlanRectangle,type PlanRectangle} from './inlet-orthogonal-plan.js'
type Pair = readonly [number, number]
type Rectangle = readonly [number, number, number, number]
type Grid = {
  girders: Record<string, { axis: string; datum: number; extent: Pair; width: number; z: Pair }>
  crossBeams: Record<string, { a: Pair; b: Pair; width: number; z: Pair }>
  heads: { id: string; xy: Pair; capXY: Pair; capZ: Pair }[]
}
type Levels = { mineralCourse: Pair; dryRC: Pair; glass: Pair; accessibleDistribution: Pair; finish: Pair; ffl: number; coldGridTop: number }
const area = (r: Rectangle) => (r[2] - r[0]) * (r[3] - r[1])
const intersect = (a: Rectangle, b: Rectangle): Rectangle | null => {
  const r = [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.min(a[2], b[2]), Math.min(a[3], b[3])] as const
  return r[2] > r[0] && r[3] > r[1] ? r : null
}

/** Local topology below ONE clear room, not a second uniform ground section.
 * Boxes use min/max XY and absolute source ground datum Z. Existing floor and
 * wall DPC remain separate. Contact union is partitioned once, including caps.
 * No plate, masonry, soil, thermal or waterproof resistance is inferred.
 */
export type PlantSoffitRetentionChoice={stud:{diameterMm:number;embedMm:number;heelMm:number;bendRadiusMm:number;threadTailMm:number};buttonDTMm:Pair;collarDTMm:Pair;sleeveODIDMm:Pair;washerDTMm:Pair;nutAFHeightCount:readonly[number,number,number];pocketWDmm:Pair;throughSquareMm:number;minimumMetalAboveBaseMm:number;maximumFactoryRelativeErrorMm:number;maximumPreloadN:number;maximumTileKg:number;handlingFactor:number;steel:{densityUpperKgM3:number;conductivityUpperWmK:number;elasticModulusMPa:number;allowableMPa:number}}
export type PlantRcOverUniformFStack={kind:'rc-over-uniform-F';lowerMineralMm:number;insulationMm:number;rcMm:number;bedding:{densityKNm3:number;minimumCompressiveMPa:number};retentionMassUpperKg:number;soffitRetention:PlantSoffitRetentionChoice}
export const plantUnfacedF2025={source:'https://www.foamglas.com/-/media/project/foamglas/public/shared/files/foamglas-b/foamglas-f/pds/pds-foamglas-f-uk.pdf',version:'2025-04-02',densityUpperKgM3:181.5,conductivityUpperWmK:.050,characteristicCompressionKPa:1558,creepTestKPa:600,stockLWMm:[600,450]as const,maximumThicknessMm:180,unfacedOnly:true,installedAcceptance:false}
/** One prefabricated panel on its actual cold-grid contacts. The unsupported
 * central F is captured insulation, not concrete formwork or a structural span. */
export function plantSoffitRetention(i:{stack:PlantRcOverUniformFStack;planMm:Rectangle;bodyPlans:readonly Rectangle[];contactCells:readonly{id:string;rectangleMm:Rectangle;possibleReceivers:string[]}[];FlevelsMm:Pair;rcLevelsMm:Pair}){
 const c=i.stack.soffitRetention,t=i.stack.insulationMm,[x,y,xx,yy]=i.planMm,
  numbers=[c?.stud?.diameterMm,c?.stud?.embedMm,c?.stud?.heelMm,c?.stud?.bendRadiusMm,c?.stud?.threadTailMm,...(c?.buttonDTMm??[]),...(c?.collarDTMm??[]),...(c?.sleeveODIDMm??[]),...(c?.washerDTMm??[]),...(c?.nutAFHeightCount??[]),...(c?.pocketWDmm??[]),c?.throughSquareMm,c?.minimumMetalAboveBaseMm,c?.maximumFactoryRelativeErrorMm,c?.maximumPreloadN,c?.maximumTileKg,c?.handlingFactor,c?.steel?.densityUpperKgM3,c?.steel?.conductivityUpperWmK,c?.steel?.elasticModulusMPa,c?.steel?.allowableMPa]
 if(!c||numbers.some(v=>!Number.isFinite(v))||i.bodyPlans.length!==1||JSON.stringify(i.bodyPlans[0])!==JSON.stringify(i.planMm)||c.stud.diameterMm<6||c.stud.embedMm<60||c.stud.heelMm<40||c.stud.bendRadiusMm<2*c.stud.diameterMm||c.buttonDTMm[0]<80||c.buttonDTMm[1]<5||c.sleeveODIDMm[0]<=c.sleeveODIDMm[1]||c.sleeveODIDMm[1]<=c.stud.diameterMm||c.nutAFHeightCount[2]!==2||c.minimumMetalAboveBaseMm<15||c.maximumFactoryRelativeErrorMm<2||c.maximumPreloadN<0||c.handlingFactor<3||c.maximumTileKg>10||c.maximumTileKg<=0||c.pocketWDmm[1]>=t||c.throughSquareMm<=c.sleeveODIDMm[0]||c.pocketWDmm[0]<=c.buttonDTMm[0])throw Error('Concrete source-bound two-stud soffit capture and one actual unnotched RC plan required')
 const cols=Math.ceil((xx-x)/600),rows=Math.ceil((yy-y)/450),w=(xx-x)/cols,d=(yy-y)/rows,Fbottom=i.FlevelsMm[0],Ftop=i.FlevelsMm[1],roof=Fbottom+c.pocketWDmm[1],buttonBottom=roof-c.buttonDTMm[1],washerBottom=buttonBottom-c.washerDTMm[1],nutsBottom=washerBottom-c.nutAFHeightCount[1]*c.nutAFHeightCount[2],studBottom=nutsBottom-c.stud.threadTailMm,
  sleeveLength=Ftop-roof,bendTop=Ftop+c.stud.embedMm,verticalEnd=bendTop-c.stud.bendRadiusMm,verticalLength=verticalEnd-studBottom,rodLength=verticalLength+Math.PI/2*c.stud.bendRadiusMm+c.stud.heelMm,
  circle=(D:number)=>Math.PI*D*D/4,rodV=circle(c.stud.diameterMm)*rodLength,buttonV=circle(c.buttonDTMm[0])*c.buttonDTMm[1],collarV=circle(c.collarDTMm[0])*c.collarDTMm[1],sleeveA=circle(c.sleeveODIDMm[0])-circle(c.sleeveODIDMm[1]),sleeveV=sleeveA*sleeveLength,washerV=circle(c.washerDTMm[0])*c.washerDTMm[1],nutV=c.nutAFHeightCount[0]**2*c.nutAFHeightCount[1]*c.nutAFHeightCount[2],
  kitV=rodV+buttonV+collarV+sleeveV+washerV+nutV,kitKg=kitV/1e9*c.steel.densityUpperKgM3,removedEachV=c.pocketWDmm[0]**2*c.pocketWDmm[1]+c.throughSquareMm**2*sleeveLength,
  maxTileKg=600*450*t/1e9*plantUnfacedF2025.densityUpperKgM3,designEachN=maxTileKg*9.81*c.handlingFactor/2,sleeveI=Math.PI/64*(c.sleeveODIDMm[0]**4-c.sleeveODIDMm[1]**4),
  tiles: {id:string;planMinMaxMm:Rectangle;stockBlankMm:number[];maximumStockMassKg:number;netFVolumeM3:number;netFMassUpperKg:number;captureMassUpperKg:number;originXYMm:number[];captureIds:string[];actualRetainersAccepted:false}[]=[],captures:{id:string;xyMm:number[];hookSign:number;rod:{verticalStartMm:number[];verticalEndMm:number[];bendRadiusMm:number;horizontalHeelMm:number[][];developedLengthMm:number};pocket:{planMm:Rectangle;zMm:Pair};through:{planMm:Rectangle;zMm:Pair};steelBottomMm:number;buttonBoxMm:number[];sleeveBoxMm:number[];collarBoxMm:number[];washerBoxMm:number[];nutEnvelopeBoxesMm:number[][];stockMetalVolumeMm3:number;stockMassUpperKg:number;designTileLoadN:number;actualCastAnchorageCageAndMaterialAccepted:false}[]=[]
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
  const p=[x+col*w,y+row*d,x+(col+1)*w,y+(row+1)*d]as const,id='Plant/uniform-soffit-F/'+row+'/'+col,ids=[]
  for(let k=0;k<2;k++){
   const X=p[0]+w*(k===0?.25:.75),Y=(p[1]+p[3])/2,sign=k===0?1:-1,qid=id+'/capture/'+k,half=c.pocketWDmm[0]/2,hole=c.throughSquareMm/2
   ids.push(qid);captures.push({id:qid,xyMm:[X,Y],hookSign:sign,rod:{verticalStartMm:[X,Y,studBottom],verticalEndMm:[X,Y,verticalEnd],bendRadiusMm:c.stud.bendRadiusMm,horizontalHeelMm:[[X+sign*c.stud.bendRadiusMm,Y,bendTop],[X+sign*(c.stud.bendRadiusMm+c.stud.heelMm),Y,bendTop]],developedLengthMm:rodLength},pocket:{planMm:[X-half,Y-half,X+half,Y+half],zMm:[Fbottom,roof]},through:{planMm:[X-hole,Y-hole,X+hole,Y+hole],zMm:[roof,Ftop]},steelBottomMm:studBottom,buttonBoxMm:[X-c.buttonDTMm[0]/2,Y-c.buttonDTMm[0]/2,buttonBottom,c.buttonDTMm[0],c.buttonDTMm[0],c.buttonDTMm[1]],sleeveBoxMm:[X-c.sleeveODIDMm[0]/2,Y-c.sleeveODIDMm[0]/2,roof,c.sleeveODIDMm[0],c.sleeveODIDMm[0],sleeveLength],collarBoxMm:[X-c.collarDTMm[0]/2,Y-c.collarDTMm[0]/2,Ftop,c.collarDTMm[0],c.collarDTMm[0],c.collarDTMm[1]],washerBoxMm:[X-c.washerDTMm[0]/2,Y-c.washerDTMm[0]/2,washerBottom,c.washerDTMm[0],c.washerDTMm[0],c.washerDTMm[1]],nutEnvelopeBoxesMm:Array.from({length:c.nutAFHeightCount[2]},(_,n)=>[X-c.nutAFHeightCount[0]/2,Y-c.nutAFHeightCount[0]/2,nutsBottom+n*c.nutAFHeightCount[1],c.nutAFHeightCount[0],c.nutAFHeightCount[0],c.nutAFHeightCount[1]]),stockMetalVolumeMm3:kitV,stockMassUpperKg:kitKg,designTileLoadN:designEachN,actualCastAnchorageCageAndMaterialAccepted:false})
  }
  const net=area(p)*t/1e9-2*removedEachV/1e9
  tiles.push({id,planMinMaxMm:p,stockBlankMm:[600,450,t],maximumStockMassKg:maxTileKg,netFVolumeM3:net,netFMassUpperKg:net*plantUnfacedF2025.densityUpperKgM3,captureMassUpperKg:2*kitKg,originXYMm:[(p[0]+p[2])/2,(p[1]+p[3])/2],captureIds:ids,actualRetainersAccepted:false})
 }
 const pockets=captures.map(c=>c.pocket.planMm),netContact=i.contactCells.flatMap(c=>subtractPlan(c.rectangleMm,pockets).map((r,k)=>({id:c.id+'/outside-retention-pocket/'+k,planMinMaxMm:r,receivers:c.possibleReceivers}))),
  grossContact=i.contactCells.reduce((n,c)=>n+area(c.rectangleMm),0)/1e6,netContactArea=netContact.reduce((n,c)=>n+area(c.planMinMaxMm),0)/1e6,
  checks=[{id:'counterpocket-within-own-tile-after-fit',value:c.pocketWDmm[0]/2+c.maximumFactoryRelativeErrorMm,limit:Math.min(w/4,d/2)},{id:'opposed-hook-heel-within-own-half-tile-after-fit',value:c.stud.bendRadiusMm+c.stud.heelMm+c.maximumFactoryRelativeErrorMm,limit:w/4},{id:'cast-collar-covering-through-slot',value:2,limit:c.collarDTMm[0]/2-Math.SQRT2*c.throughSquareMm/2-c.maximumFactoryRelativeErrorMm},{id:'minimum-steel-clear-of-bearing-face',value:c.minimumMetalAboveBaseMm,limit:studBottom-Fbottom-c.maximumFactoryRelativeErrorMm},{id:'button-in-pocket-after-relative-fit',value:c.maximumFactoryRelativeErrorMm,limit:(c.pocketWDmm[0]-c.buttonDTMm[0])/2},{id:'sleeve-in-through-hole-after-relative-fit',value:c.maximumFactoryRelativeErrorMm,limit:(c.throughSquareMm-c.sleeveODIDMm[0])/2},{id:'panel-top-anchor-cover',value:35,limit:i.rcLevelsMm[1]-bendTop},{id:'whole-stock-tile-captured-mass',value:maxTileKg,limit:c.maximumTileKg},{id:'capture-kit-total-G',value:captures.length*kitKg,limit:i.stack.retentionMassUpperKg},{id:'sleeve-axial-comparison',value:(c.maximumPreloadN+designEachN)/sleeveA,limit:c.steel.allowableMPa},{id:'sleeve-Euler',value:c.maximumPreloadN+designEachN,limit:Math.PI**2*c.steel.elasticModulusMPa*sleeveI/sleeveLength**2},{id:'button-conservative-strip',value:6*designEachN*(c.buttonDTMm[0]-c.sleeveODIDMm[0])/2/(25*c.buttonDTMm[1]**2),limit:c.steel.allowableMPa}].map(c=>({...c,necessary:Number.isFinite(c.value)&&c.value<=c.limit})),
  metalConductance=captures.length*c.steel.conductivityUpperWmK*(circle(c.stud.diameterMm)+sleeveA)/1e6/(sleeveLength/1000)
 return{schema:'had-prefabricated-soffit-F-capture/1',choice:c,tiles,captures,netContactPlans:netContact,grossColdContactM2:grossContact,netFContactM2:netContactArea,contactVoidDeductionM2:grossContact-netContactArea,removedFVolumeM3:captures.length*removedEachV/1e9,netFMassUpperKg:tiles.reduce((n,t)=>n+t.netFMassUpperKg,0),netFVolumeM3:tiles.reduce((n,t)=>n+t.netFVolumeM3,0),captureStockMassUpperKg:captures.length*kitKg,stockGIncludesEmbeddedMetalWithoutConcreteCredit:true,checks,necessaryGeometryAndMemberScreens:checks.every(c=>c.necessary),thermal:{steelOnlyConductanceUpperWperK:metalConductance,uncutFFieldConductanceWperK:area(i.planMm)/1e6*plantUnfacedF2025.conductivityUpperWmK/(t/1000),voidAirRadiationJointsAndWholeBridgeAccepted:false},factoryCG:{xyMm:[(x+xx)/2,(y+yy)/2],alternateHookDirectionsBalanceEachTile:true,actualAsBuiltCGAndCraneAccepted:false},matingStudAndSleeveAssembledConcentrically:true,freeStudSleeveRadialMm:(c.sleeveODIDMm[1]-c.stud.diameterMm)/2,assemblyPreloadIsDesignCeilingNotTorqueProof:true,soffitFieldNeverWetConcreteFormwork:true,factoryAssemblySequence:'Cast and cure the RC panel separately on its mould; fit bare F and the sleeves/buttons on accessible factory trestles before the initial-build crane lift. Inspect every recess before landing on the real contacts.',actualFactoryConcretePasteExclusionAndPocketInspectionAccepted:false,actualCastAnchorageTileFractureMoistureCageAndConstructionAccepted:false}
}

export type PlantPanCompressionContext={stack?:PlantRcOverUniformFStack;schema:'had-plant-pan-compression/1';settingEachMm:number;sourceCorePlans:readonly{id:string;rectangleMm:PlanRectangle}[]}
function deriveRoomPocket(input: { plantCompression?:PlantPanCompressionContext;
  levels: Levels; roomPlanMm: readonly number[];planExclusionsMm?:readonly PlanRectangle[]; depthMm: number; isolationGapMm: number; grid: Grid
  rcDensityKNm3: number; mineralDensityKNm3: number; roomId?: 'utility' | 'plant'
}) {
  const { levels: g, depthMm, isolationGapMm: gap, grid } = input,roomId=input.roomId??'utility',compression=input.plantCompression
  if(!['utility','plant'].includes(roomId))throw new Error('Unsupported local pocket identity')
  if (![depthMm, gap, input.rcDensityKNm3, input.mineralDensityKNm3, ...input.roomPlanMm,
    ...Object.values(g).flat()].every(Number.isFinite) || depthMm < 0 || depthMm > 350 || gap < 25 || gap > 100
    || input.roomPlanMm.length !== 4 || Math.min(...input.roomPlanMm.slice(2)) <= 2 * gap
    || input.rcDensityKNm3 <= 0 || input.mineralDensityKNm3 <= 0) throw new Error('Unsupported local service pocket geometry')
  if(compression&&(roomId!=='plant'||compression.schema!=='had-plant-pan-compression/1'||!Number.isFinite(compression.settingEachMm)||compression.settingEachMm<10||!compression.sourceCorePlans.length||compression.sourceCorePlans.some(c=>!c.id||!validPlanRectangle(c.rectangleMm))))throw Error('Actual Plant compression footprint and source wall/core plans required')
  const stack=compression?.stack
  if(stack&&(stack.kind!=='rc-over-uniform-F'||![stack.lowerMineralMm,stack.insulationMm,stack.rcMm,stack.bedding?.densityKNm3,stack.bedding?.minimumCompressiveMPa,stack.retentionMassUpperKg].every(Number.isFinite)||stack.lowerMineralMm<50||stack.lowerMineralMm>150||stack.insulationMm<40||stack.insulationMm>180||stack.insulationMm%10!==0||stack.rcMm<200||stack.rcMm>300||stack.bedding.densityKNm3<=0||stack.bedding.minimumCompressiveMPa<30||stack.retentionMassUpperKg<0))throw Error('Actual optional RC-over-F layer and unprocured mineral/retention bounds required')
  const [x, y, w, d] = input.roomPlanMm, room = [x, y, x + w, y + d] as const,
    inner = (compression?room:[x + gap, y + gap, x + w - gap, y + d - gap]) as Rectangle,
    drop = depthMm - (g.accessibleDistribution[1] - g.accessibleDistribution[0]),
    shift = (p: Pair): Pair => [p[0] - drop, p[1] - drop],
    local = { mineralCourse: shift(g.mineralCourse), dryRC: shift(g.dryRC), glass: shift(g.glass),
      accessibleDistribution: [g.accessibleDistribution[1] - depthMm, g.accessibleDistribution[1]] as Pair,
      finish: g.finish, ffl: g.ffl, coldGridTop: g.coldGridTop }
  if(stack){const a=g.coldGridTop,b=a+stack.lowerMineralMm,c=b+stack.insulationMm;local.mineralCourse=[a,b];local.glass=[b,c];local.dryRC=[c,c+stack.rcMm]}
  const bodyPlans=subtractPlan(inner,(input.planExclusionsMm??[]).map(r=>expandPlan(r,gap))),bodyArea=bodyPlans.reduce((n,r)=>n+planArea(r),0),notched=bodyArea<area(inner)-1e-8
  if (depthMm === 0) return { state: 'uniform-ground-stack' as const, levels: g, local: null }
  if (drop <= 0) throw new Error('A local service pocket must be deeper than the actual global distribution zone')
  const supports: { id: string; rect: Rectangle; z: Pair }[] = []
  for (const [id, s] of Object.entries(grid.girders)) {
    if (!['x', 'y'].includes(s.axis)) throw new Error('Unsupported cold-grid girder axis')
    const [lo, hi] = s.extent, half = s.width / 2
    supports.push({ id, rect: s.axis === 'x' ? [lo, s.datum - half, hi, s.datum + half] : [s.datum - half, lo, s.datum + half, hi], z: s.z })
  }
  for (const [id, s] of Object.entries(grid.crossBeams)) {
    const half = s.width / 2
    if (s.a[0] !== s.b[0] && s.a[1] !== s.b[1]) throw new Error('Unsupported diagonal local cold-grid support')
    supports.push({ id, rect: s.a[1] === s.b[1]
      ? [Math.min(s.a[0], s.b[0]), s.a[1] - half, Math.max(s.a[0], s.b[0]), s.a[1] + half]
      : [s.a[0] - half, Math.min(s.a[1], s.b[1]), s.a[0] + half, Math.max(s.a[1], s.b[1])], z: s.z })
  }
  for (const s of grid.heads) supports.push({ id: s.id, rect: [s.xy[0] - s.capXY[0] / 2, s.xy[1] - s.capXY[1] / 2,
    s.xy[0] + s.capXY[0] / 2, s.xy[1] + s.capXY[1] / 2], z: s.capZ })
  const contact = supports.flatMap(s => {
    return s.z[1]===g.coldGridTop?bodyPlans.flatMap(p=>{const r=intersect(p,s.rect);return r?[{id:s.id,rectangleMm:r,coldTopMm:s.z[1]}]:[]}):[]
  })
  const xs = [...new Set(contact.flatMap(s => [s.rectangleMm[0], s.rectangleMm[2]]))].sort((a, b) => a - b),
    ys = [...new Set(contact.flatMap(s => [s.rectangleMm[1], s.rectangleMm[3]]))].sort((a, b) => a - b)
  const cells: { id: string; rectangleMm: Rectangle; possibleReceivers: string[] }[] = []
  for (let i = 1; i < xs.length; i++) for (let j = 1; j < ys.length; j++) {
    const r = [xs[i - 1], ys[j - 1], xs[i], ys[j]] as const,
      receivers = contact.filter(s => intersect(s.rectangleMm, r)).map(s => s.id)
    if (receivers.length) cells.push({ id: `HAD/local-${roomId}-contact/${i}-${j}`, rectangleMm: r, possibleReceivers: receivers })
  }
  const retention=stack?plantSoffitRetention({stack,planMm:inner,bodyPlans,contactCells:cells,FlevelsMm:local.glass,rcLevelsMm:local.dryRC}):null
  const contactM2 = cells.reduce((sum, s) => sum + area(s.rectangleMm), 0) / 1e6,
    sides = { west: contact.some(s => s.rectangleMm[0] === inner[0]), east: contact.some(s => s.rectangleMm[2] === inner[2]),
      south: contact.some(s => s.rectangleMm[1] === inner[1]), north: contact.some(s => s.rectangleMm[3] === inner[3]) },
    slabVolume = bodyArea / 1e6 * (local.dryRC[1] - local.dryRC[0]) / 1000,
    mineralVolume = contactM2 * (local.mineralCourse[1] - local.mineralCourse[0]) / 1000,
    plinth = local.mineralCourse[0] - g.coldGridTop,
    origin = [(inner[0] + inner[2]) / 2, (inner[1] + inner[3]) / 2, g.coldGridTop],
    diagnostics = [
      ...(plinth < 0 ? ['LOCAL_POCKET_INTRUDES_COLD_GRID'] : []),
      ...(!Object.values(sides).every(Boolean) ? ['LOCAL_POCKET_MISSING_PERIMETER_COLD_SUPPORT'] : []),
      'LOCAL_POCKET_SLAB_SPAN_EDGE_AND_CONTACT_RESISTANCE_UNQUALIFIED',
      'LOCAL_POCKET_MINERAL_DRY_BEARING_AND_RETENTION_UNQUALIFIED',
      'LOCAL_POCKET_STEP_THERMAL_AND_WATERPROOFING_UNQUALIFIED',
      'LOCAL_POCKET_PERIMETER_FLOOR_BRIDGE_AND_LOADED_RENEWAL_UNQUALIFIED',
      'LOCAL_POCKET_REPLACEMENT_ACTIONS_NOT_IN_52_HEAD_MODEL',...(retention&&!retention.necessaryGeometryAndMemberScreens?['PLANT_RC_OVER_F/soffit-capture-geometry-or-member-screen-fails']:[])]
  const load = (id: string, forceKN: number, plan: Rectangle, z: Pair) => ({ id, piece: { planMinMaxMm: plan, zMm: z },
    originMm: [(plan[0] + plan[2]) / 2, (plan[1] + plan[3]) / 2, g.coldGridTop],
    wrenchKN_KNm: { Fx: 0, Fy: 0, Fz: -forceKN, Mx: 0, My: 0, Mz: 0 },
    action: 'unfactored-gravity-only', transferToReceivers: 'unresolved-plate/contact-distribution' })
  return { state: 'local-room-pocket-reservation' as const, levels: local, local: {
    id: `HAD/local-${roomId}-service-pocket`, selected: false as const, groundDatum: 'Same absolute datum as saved groundSection; no translation of house, roof or retained walls',
    roomMinMaxMm:room,bodyMinMaxMm:inner,...(notched?{bodyPlanRectanglesXYMm:bodyPlans,bodyMinMaxIsEnvelopeOnly:true,actualBodyPlanAreaMm2:bodyArea,cornerReturnSeparationApplied:true}:{}),depthMm, loweringMm: drop, isolationGapMm: compression?0:gap,...(compression?{legacyIsolationGapParameterMm:gap,isolationGapParameterApplies:false,physicalUniformGlassAndServiceAndFinishRetired:true,retainedLevelsAreHydraulicReferenceOnly:true,...(stack?{rcOverUniformFStack:stack,oldUpperFPhysicallyRetired:true,uniformFNowBelowRc:true}: {})}:{}),
    levelBoxes: Object.entries(local).filter((row): row is [string, Pair] => Array.isArray(row[1])&&(!compression||row[0]==='mineralCourse'||row[0]==='dryRC'||!!stack&&row[0]==='glass')).map(([id, z]) => ({id,planMinMaxMm:inner,...(notched?{planRectanglesXYMm:bodyPlans,planMinMaxIsEnvelopeOnly:true}:{}),zMm:z,...(retention&&id==='glass'?{subtractBoxesXYZMm:retention.captures.flatMap(c=>[c.pocket,c.through].map(q=>[q.planMm[0],q.planMm[1],q.zMm[0],q.planMm[2]-q.planMm[0],q.planMm[3]-q.planMm[1],q.zMm[1]-q.zMm[0]])),voidsAreActualSubtractiveGeometry:true}: {})})),
    retainedGlobal: g, wallAndExteriorDpcMm: g.mineralCourse,
    floorStep: { northEdgeYmm: room[3], thresholdOpeningSupport: `Independent flush bridge over${gap}mm perimeter separation; exact metal, fixings, removal and foot loads unqualified`,
      clearanceClaim: compression?'Full pan-room RC compression footprint replaces the old inset. Source core XY separation is checked separately; exact Z/junction, lateral retention and seals remain unqualified.':'No RC or mineral bridges the declared perimeter gap. Upstand and gap infill cannot be credited as structural or waterproof support.' },
    thermalReservation: { horizontalGlassMm: stack?local.glass:compression?null:local.glass, verticalSeparationGapMm: compression?null:gap,
      minimumJunctionTemperatureOrPsi: null, requirement: 'Continuous load-compatible insulation across slab edge and lower mineral/cold-grid contact; complete2D/3D thermal and moisture path not established.' },
    lowerPlinthRequiredMm: plinth, coldGridContact: contact, disjointContactCells: cells,
    contactUnionM2: contactM2, supportPresentAtSides: sides,
    unsupportedCentralSlabAreaM2: bodyArea / 1e6 - contactM2,
    loadOrigins: [...(notched?bodyPlans.map((r,k)=>load(`HAD/local-${roomId}-dry-rc/part-${k}-G`,area(r)/1e6*(local.dryRC[1]-local.dryRC[0])/1000*input.rcDensityKNm3,r,local.dryRC)):[load(`HAD/local-${roomId}-dry-rc-G`,slabVolume*input.rcDensityKNm3,inner,local.dryRC)]),
      ...cells.map(c => load(c.id + '/mineral-G', area(c.rectangleMm) / 1e6 * (local.mineralCourse[1] - local.mineralCourse[0]) / 1000 * input.mineralDensityKNm3, c.rectangleMm, local.mineralCourse)),
      ...(retention?retention.tiles.flatMap(t=>[load(t.id+'/uniform-under-RC-F/-G',t.netFMassUpperKg*9.81/1000,t.planMinMaxMm,local.glass),load(t.id+'/unprocured-soffit-retention/-G-upper',t.captureMassUpperKg*9.81/1000,t.planMinMaxMm,local.glass)]):[])],
    quantityBounds: { dryRcM3: slabVolume, mineralOnContactOnlyM3: mineralVolume, glassM3: retention?retention.netFVolumeM3:compression?0:bodyArea / 1e6 * (local.glass[1] - local.glass[0]) / 1000,
      slabAndMineralWeightKN: slabVolume * input.rcDensityKNm3 + mineralVolume * input.mineralDensityKNm3,
      ...(retention?{uniformFVolumeM3:retention.netFVolumeM3,uniformFMassUpperKg:retention.netFMassUpperKg,retentionMassUpperKg:retention.captureStockMassUpperKg,retentionBudgetKg:stack!.retentionMassUpperKg,completeStackWeightUpperKN:slabVolume*input.rcDensityKNm3+mineralVolume*input.mineralDensityKNm3+(retention.netFMassUpperKg+retention.captureStockMassUpperKg)*9.81/1000,retentionIsUnprocuredDesignCeilingNotInstalledEvidence:true}:{}),
      glassLinerCoversFramesFixturesAndUnknownPlinthWeightKN: null, floorCoverAndEquipmentTemporaryReactionsKN: null },
    ...(retention?{soffitRetention:retention}:{}),
    structuralJoin: { originMm: origin, reactionsAtColdGridAnd52Heads: null,
      replacingExistingFloorNotAutomaticallyAdded: true, requirement: 'Remove original floor/mineral stock over the exact replaced polygon before adding this candidate. Preserve wall and exterior DPC/plinth. Solve actual local plate/contact and signed full wrenches on current grid; no centroid lump or head mapping invented.' },
    necessaryGeometryScreen: plinth >= 0 && Object.values(sides).every(Boolean)&&(!retention||retention.necessaryGeometryAndMemberScreens),
    constructionAdmitted: false as const, diagnostics,
  } }
}

/** Selected context produces actual full-footprint RC/mineral and explicitly
 * retires the uniform upper stack. The matching tapered insulation is supplied
 * by the pan/walking producer; these old level datums do not add another glass. */
export function inletRoomPocket(input:Parameters<typeof deriveRoomPocket>[0]){
 const actual=deriveRoomPocket(input),context=input.plantCompression
 if(!context)return actual
 if(actual.state!=='local-room-pocket-reservation'||!actual.local)throw Error('A real lowered Plant RC body is required for full compression')
 const {plantCompression:_context,...referenceInput}=input,reference=deriveRoomPocket(referenceInput)
 if(reference.state!=='local-room-pocket-reservation'||!reference.local)throw Error('Actual legacy floor replacement reference required')
 const r=actual.local.bodyMinMaxMm,planGap=(a:Rectangle,b:Rectangle)=>{const dx=Math.max(a[0]-b[2],b[0]-a[2]),dy=Math.max(a[1]-b[3],b[1]-a[3]);return dx>0||dy>0?Math.hypot(Math.max(0,dx),Math.max(0,dy)):Math.max(dx,dy)},
  coreChecks=context.sourceCorePlans.map(c=>({id:c.id,rectangleMm:c.rectangleMm,nominalGapMm:planGap(r,c.rectangleMm),afterTwoSettingsMm:planGap(expandPlan(r,context.settingEachMm),expandPlan(c.rectangleMm,context.settingEachMm))})),
  resultant=(rows:typeof actual.local.loadOrigins)=>rows.reduce((sum,row)=>{const f=row.wrenchKN_KNm,o=row.originMm,local=[f.Fx,f.Fy,f.Fz,f.Mx+o[1]/1000*f.Fz-o[2]/1000*f.Fy,f.My+o[2]/1000*f.Fx-o[0]/1000*f.Fz,f.Mz+o[0]/1000*f.Fy-o[1]/1000*f.Fx];return sum.map((v,k)=>v+local[k])},[0,0,0,0,0,0]),
  oldW=resultant(reference.local.loadOrigins),newW=resultant(actual.local.loadOrigins.filter(r=>!r.id.includes('/uniform-under-RC-F/')&&!r.id.includes('/unprocured-soffit-retention/'))),stack=context.stack,
  bodyPlans=actual.local.bodyPlanRectanglesXYMm??[r],unsupported=stack?bodyPlans.flatMap(p=>{const cuts=actual.local.disjointContactCells.map(c=>c.rectangleMm),covered=cuts.reduce((n,c)=>{const q=intersect(p,c);return n+(q?area(q):0)},0);if(Math.abs(covered-area(p))<1e-5)return[];return subtractPlan(p,cuts)}):[],uniformF=actual.local.levelBoxes.find(b=>b.id==='glass'),retention='soffitRetention'in actual.local?actual.local.soffitRetention:null

 return{...actual,plantCompression:{schema:'had-plant-pan-compression-result/1',resolvedInput:input,caseDigest:sha256SemanticFingerprint(input),sourceCoreChecks:coreChecks,necessaryCoreXYSeparation:coreChecks.every(c=>c.afterTwoSettingsMm>=0),actualSourceProfileZAndCoreInterfaceAccepted:false,
  fullRcPlanMm:r,rcLevelMm:actual.local.levelBoxes.find(b=>b.id==='dryRC')!.zMm,
  removedPhysicalUniformLayers:reference.local.levelBoxes.filter(b=>['glass','accessibleDistribution','finish'].includes(b.id)),
  removedUniformGlassM3:reference.local.quantityBounds.glassM3,
  referenceRcMineralOrigins:reference.local.loadOrigins,replacementRcMineralOrigins:actual.local.loadOrigins.filter(r=>!r.id.includes('/uniform-under-RC-F/')&&!r.id.includes('/unprocured-soffit-retention/')),
  ...(stack?{rcOverUniformF:{schema:'had-Plant-rc-over-uniform-F/1',choice:stack,uniformFLevelMm:uniformF!.zMm,material:plantUnfacedF2025,tiles:retention!.tiles,retention:retention!,loadBearingContactPlans:retention!.netContactPlans,grossColdGridContactPlans:actual.local.disjointContactCells,contactUnionM2:actual.local.contactUnionM2,netInsulationContactM2:retention!.netFContactM2,nonLoadBearingSuspendedSoffitPlans:unsupported,unsupportedSoffitM2:unsupported.reduce((n,p)=>n+area(p),0)/1e6,fullAreaSoilOrInsulationSupportAssumed:false,slabSpansActualContactMask:true,uniformFAndRetentionGAlreadyInFloorOrigins:true,minimumRestoringRetentionMassCreditedKg:0,retentionCGEnvelopeMm:r,precastInitialBuildPanelMassUpperKg:actual.local.quantityBounds.dryRcM3*input.rcDensityKNm3/9.81*1000+actual.local.quantityBounds.uniformFMassUpperKg!+retention!.captureStockMassUpperKg,initialBuildCraneBeforeHouseClosureRequired:true,renewal500kgRouteApplies:false,actualCraneInsertsSoffitRetainersContactCageThermalAndRenewalAccepted:false,actualFPressureDistributionAccepted:false,scalarFootStressIsNotFStress:true,structuralAndMoistureProfileZStillUnjoined:true}}:{}),
  rcMineralDeltaWrenchAboutGlobalZeroKN_KNm:newW.map((v,k)=>v-oldW[k]),
  referenceRcM3:reference.local.quantityBounds.dryRcM3,replacementRcM3:actual.local.quantityBounds.dryRcM3,
  actualMatchedPanBedAndFootContactAccepted:false}}
}

export function drawInletRoomPocket(p: NonNullable<ReturnType<typeof inletRoomPocket>['local']>) {
  const [x, y, xx, yy] = p.roomMinMaxMm, scale = .18,
    X = (v: number) => 40 + (v - x) * scale, Y = (v: number) => 520 - (v - y) * scale,
    Z = (v: number) => 590 - v * .5,
    rect = (r: Rectangle, colour: string) => `<rect x="${X(r[0])}" y="${Y(r[3])}" width="${(r[2] - r[0]) * scale}" height="${(r[3] - r[1]) * scale}" fill="${colour}" stroke="#46564f"/>`,
    layer = (xa: number, w: number, z: Pair, colour: string) => `<rect x="${xa}" y="${Z(z[1])}" width="${w}" height="${(z[1] - z[0]) * .5}" fill="${colour}" stroke="#665e4c"/>`,
    text = (a: number, b: number, t: string, size = 15) => `<text x="${a}" y="${b}" font-size="${size}">${t}</text>`,
    colours = ['#c5b08a', '#afbfb7', '#e5cc8a', '#d9e7ea', '#c09a77']
  if('physicalUniformGlassAndServiceAndFinishRetired'in p&&p.physicalUniformGlassAndServiceAndFinishRetired){
    const rc=p.levelBoxes.find(b=>b.id==='dryRC')!,mineral=p.levelBoxes.find(b=>b.id==='mineralCourse')!
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="780" viewBox="0 0 1280 780"><rect width="1280" height="780" fill="#f5f1e6"/><g font-family="Arial,sans-serif" fill="#29271f">
${text(40,42,'Plant · full pan-plan compression floor replacement',25)}
${text(40,78,'rcOverUniformFStack'in p?'Flat RC above uniform soffit F; upper graded mineral bed comes from the same pan.':'Actual local RC/mineral bodies. The uniform glass, service layer and continuous finish are retired.')}
${rect(p.roomMinMaxMm,'#dce6df')}${p.disjointContactCells.map(c=>rect(c.rectangleMm,'#c5b08a')).join('')}
${p.levelBoxes.map((b,k)=>layer(760,300,b.zMm,colours[k])).join('')}
${text(600,190,'Physical mineral '+mineral.zMm.join('..')+'mm; RC '+rc.zMm.join('..')+'mm.')}
${text(600,235,'rcOverUniformFStack'in p?'Uniform F BELOW RC; only actual cold-grid/mineral contact regions bear load.':'Tapered unfaced F bed: generated from the SAME pan/walk case, not an overlapping uniform layer.')}
${text(600,280,'RC '+p.quantityBounds.dryRcM3.toFixed(4)+'m3; contact-only mineral '+p.quantityBounds.mineralOnContactOnlyM3.toFixed(4)+'m3.')}
${text(600,325,'Uniform glass stock in this producer: '+p.quantityBounds.glassM3+'m3.')}
${text(40,650,'Core/profile Z, local slab/contact resistance, matched bearing, waterproofing and thermal bridges remain unqualified.')}
${text(40,700,'rcOverUniformFStack'in p?'Central soffit tiles need real mechanical capture; no floating F formwork or500kg panel renewal claim.':'Actual F bed thickness, tile mass and per-foot matching are produced by the walking-surface method.')}
${text(40,745,'Source geometry '+sha256SemanticFingerprint({plan:p.bodyMinMaxMm,levels:p.levelBoxes,contacts:p.disjointContactCells}),12)}
</g></svg>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="950" viewBox="0 0 1280 950"><rect width="1280" height="950" fill="#f5f1e6"/><g font-family="Arial,sans-serif" fill="#29271f">
${text(40,42,`Local Utility${p.depthMm} · retained global${p.retainedGlobal.ffl}/${p.retainedGlobal.accessibleDistribution[1]-p.retainedGlobal.accessibleDistribution[0]} · geometry reservation`,26)}
${text(40,76,'Same saved ground datum. No wall/roof/frame rise; no structural, thermal or waterproof admission.')}
${rect(p.roomMinMaxMm,'#e8ddc7')}${(p.bodyPlanRectanglesXYMm??[p.bodyMinMaxMm]).map(r=>rect(r,'#e7efeb')).join('')}
${p.disjointContactCells.map(c => rect(c.rectangleMm, '#b1c0b5')).join('')}
${text(40,560,`Room${(xx - x).toFixed(1)} ×${(yy - y).toFixed(1)}; perimeter separation${p.isolationGapMm}mm.`)}
${text(40,590,`Cold contact union${p.contactUnionM2.toFixed(6)}m²; central slab span${p.unsupportedCentralSlabAreaM2.toFixed(6)}m².`)}
${text(40,620,'Green polygons are actual girders/caps, partitioned without overlap.')}
${text(40,650,`Mineral only above those contacts; the${p.levelBoxes[1].zMm[1]-p.levelBoxes[1].zMm[0]}mm RC body spans between them.`)}
${text(40,680,'Perimeter gap is not a support: flush cover, tool and renewal reactions remain open.')}
${text(600,150,'Retained global section',19)}${text(920,150,'Local Utility section',19)}
${[p.retainedGlobal.mineralCourse,p.retainedGlobal.dryRC,p.retainedGlobal.glass,p.retainedGlobal.accessibleDistribution,p.retainedGlobal.finish].map((z,i)=>layer(600,215,z,colours[i])).join('')}
${p.levelBoxes.map((b,i)=>layer(920,215,b.zMm,colours[i])).join('')}
${layer(600,215,[p.retainedGlobal.coldGridTop,p.retainedGlobal.mineralCourse[0]],'#949c95')}
${layer(600,535,[p.retainedGlobal.coldGridTop-60,p.retainedGlobal.coldGridTop],'#718c7e')}
<line x1="580" y1="${Z(p.retainedGlobal.ffl)}" x2="1155" y2="${Z(p.retainedGlobal.ffl)}" stroke="#332b20" stroke-width="3"/>
<path d="M855 ${Z(p.retainedGlobal.coldGridTop)} V${Z(p.retainedGlobal.glass[1])}" fill="none" stroke="#bb8335" stroke-width="12" stroke-dasharray="7 5"/>
${text(600,205,`FFL${p.retainedGlobal.ffl}; finish${p.retainedGlobal.finish.join('–')}.`,17)}
${text(600,245,'Brown mineral; gray RC; gold glass; blue service.')}
${text(600,725,`Local mineral${p.levelBoxes[0].zMm.join('–')}; RC${p.levelBoxes[1].zMm.join('–')}; glass${p.levelBoxes[2].zMm.join('–')}.`)}
${text(600,755,`Local service${p.levelBoxes[3].zMm.join('–')}; cold-grid top${p.retainedGlobal.coldGridTop}.`)}
${text(600,790,'Diagram separates sections; horizontal gap is schematic.')}
${text(40,835,`Retain wall/exterior DPC${p.wallAndExteriorDpcMm.join('..')} and plinth. Local mineral${p.levelBoxes[0].zMm.join('..')} stays separate.`,17)}
${text(40,870,'No thermal bridge coefficient, local plate/contact capacity, waterproof junction or installed outlet qualification is inferred.')}
${text(40,910,'Source-only drain route, retained furniture and actual wall ports are shown in the accompanying room catchment receipt.')}
</g></svg>`
}
