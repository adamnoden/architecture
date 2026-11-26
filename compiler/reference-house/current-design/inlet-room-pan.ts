import {intersectPlan,validPlanRectangle,type PlanRectangle} from './inlet-orthogonal-plan.js'
export const inletStaticGravityMps2 = 9.81
type Point = readonly number[]
type Wrench = { Fx: number; Fy: number; Fz: number; Mx: number; My: number; Mz: number }
const cross = (a: Point, b: Point) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]
const subtract = (a: Point, b: Point) => a.map((v,i)=>v-b[i])
const zero = (): Wrench => ({Fx:0,Fy:0,Fz:0,Mx:0,My:0,Mz:0})
const sumWrenches = (loads: readonly { wrenchKN_KNm: Wrench }[]) => loads.reduce((sum, row) => {
  for (const key of Object.keys(sum) as (keyof Wrench)[]) sum[key]+=row.wrenchKN_KNm[key]
  return sum
},zero())
function triangles(points: readonly Point[]) { return points.slice(1,-1).map((p,i)=>[points[0],p,points[i+2]]) }
function triangleArea(points: readonly Point[]) { return Math.hypot(...cross(subtract(points[1],points[0]),subtract(points[2],points[0])))/2e6 }
function clipUnderWater(points: readonly Point[], level: number) {
  const out: Point[]=[]
  for(let i=0;i<points.length;i++) {
    const a=points[i],b=points[(i+1)%points.length],inside=a[2]<=level,next=b[2]<=level
    if(inside)out.push(a)
    if(inside!==next){const t=(level-a[2])/(b[2]-a[2]);out.push(a.map((v,j)=>v+t*(b[j]-v)))}
  }
  return out
}
function faceWaterLoad(face:{id:string;cornersMm:readonly Point[];normal:Point},level:number,origin:Point) {
  let force=0;const weighted=[0,0,0]
  for(const t of triangles(clipUnderWater(face.cornersMm,level))) {
    const area=triangleArea(t),p=t.map(v=>inletStaticGravityMps2*(level-v[2])/1000),sum=p.reduce((a,b)=>a+b,0)
    force+=area*sum/3
    for(let k=0;k<3;k++)weighted[k]+=area/12*(sum*t.reduce((s,v)=>s+v[k],0)+t.reduce((s,v,i)=>s+p[i]*v[k],0))
  }
  const f=face.normal.map(n=>n*force),m=cross(weighted.map((v,i)=>(v-origin[i]*force)/1000),face.normal)
  return {id:face.id+'/water',originMm:origin,wrenchKN_KNm:{Fx:f[0],Fy:f[1],Fz:f[2],Mx:m[0],My:m[1],Mz:m[2]},
    maximumHydrostaticKPa:Math.max(0,...face.cornersMm.map(p=>inletStaticGravityMps2*(level-p[2])/1000))}
}

/** Authored piecewise-planar floor-pan reservation. Each cell has exact slope;
 * no point sits below either actual outfall invert. Gravity descent and gross
 * below-floor water are geometry only, not a measured hydraulic/jet rating.
 */
export function inletRoomPan(input: { roomPlanMm: readonly number[];planExclusionsMm?:readonly PlanRectangle[]; outletXmm: readonly number[]; inletYmm: number;
  invertMm: number; slopeRatio: number; floorMm: number; floorUndersideMm: number; distributionBottomMm: number;
  datumMm: number; roomId?: 'utility' | 'plant'; settingMm: number; metalMm: number; insulationMm: number;
  chuteWidthMm:number; chuteHeightMm:number; chuteSlopeRatio:number; waterStageComparisonsMm: Readonly<Record<string,number>> }) {
  const { roomPlanMm: r, outletXmm: axes, inletYmm: sy, slopeRatio: ratio, invertMm: iz } = input, roomId=input.roomId??'utility'
  if(!['utility','plant'].includes(roomId))throw new Error('Unsupported room-pan identity')
  if (r.length !== 4 || axes.length !== 2 || ![...r, ...axes, sy, ratio, iz, input.floorMm, input.floorUndersideMm,
    input.distributionBottomMm, input.datumMm, input.settingMm, input.metalMm, input.insulationMm].every(Number.isFinite)
    || ratio < 50 || ratio > 200 || r[2] <= 0 || r[3] <= 0 || axes[0] <= r[0] || axes[1] <= axes[0]
    || axes[1] >= r[0] + r[2] || sy <= r[1] || sy >= r[1] + r[3]
    || !Number.isFinite(input.chuteWidthMm) || !Number.isFinite(input.chuteSlopeRatio) || input.chuteSlopeRatio <= 0
    || !Number.isFinite(input.chuteHeightMm) || input.chuteHeightMm <= 0
    || input.chuteWidthMm <= 0 || input.chuteWidthMm >= axes[1]-axes[0]
    || axes[0]-input.chuteWidthMm/2<=r[0] || axes[1]+input.chuteWidthMm/2>=r[0]+r[2]
    || input.settingMm < 0 || input.metalMm <= 0 || input.insulationMm < 0
    || Object.entries(input.waterStageComparisonsMm).some(([id,z])=>!id||!Number.isFinite(z))) throw new Error('Unsupported actual floor-pan surface')
  const half=input.chuteWidthMm/2,outer=[r[0],r[1],r[0]+r[2],r[1]+r[3]] as const,rawExclusions=input.planExclusionsMm??[]
  if(!Array.isArray(rawExclusions)||rawExclusions.some(e=>!validPlanRectangle(e)))throw Error('Actual corner pan exclusions required')
  const excluded=rawExclusions.flatMap(e=>{const c=intersectPlan(outer,e);return c?[c]:[]})
  if(excluded.some(e=>e[0]<axes[1]+half))throw Error('This Utility corner join cannot cut its existing two outlet/chute corridors')
  const
    xs = [...new Set([r[0], ...axes.flatMap(a=>[a-half,a,a+half]), (axes[0]+axes[1])/2,r[0]+r[2],...excluded.flatMap(e=>[e[0],e[2]])])].sort((a,b)=>a-b), ys = [...new Set([r[1],sy,r[1]+r[3],...excluded.flatMap(e=>[e[1],e[3]])])].sort((a,b)=>a-b),
    elevation = (x: number, y: number) => iz + (Math.abs(y - sy) + Math.min(...axes.map(a => Math.abs(x - a)))) / ratio,
    chuteBed=(y:number)=>iz-(sy-y)/input.chuteSlopeRatio,
    cells = [] as { id: string; cornersMm: number[][]; actualAreaM2: number; projectedAreaM2: number; meanSurfaceMm: number; nominalUndisplacedWaterLitres: number | null }[]
  for (let j = 1; j < ys.length; j++) for (let i = 1; i < xs.length; i++) {
    const mx=(xs[i-1]+xs[i])/2,my=(ys[j-1]+ys[j])/2
    if(excluded.some(e=>mx>e[0]&&mx<e[2]&&my>e[1]&&my<e[3]))continue
    const channel = my<sy&&axes.some(a=>Math.abs((xs[i-1]+xs[i])/2-a)<half),
      surface=channel?(_x:number,y:number)=>chuteBed(y):elevation,
      points = [[xs[i - 1], ys[j - 1]], [xs[i], ys[j - 1]], [xs[i], ys[j]], [xs[i - 1], ys[j]]].map(([x, y]) => [x, y, surface(x, y)]),
      projected = (xs[i] - xs[i - 1]) * (ys[j] - ys[j - 1]) / 1e6,
      mean = points.reduce((sum, p) => sum + p[2], 0) / 4
    cells.push({ id: `HAD/${roomId}-floor-pan/${i}-${j}`, cornersMm: points, actualAreaM2: projected * Math.sqrt(1 + (channel?1/input.chuteSlopeRatio**2:2/ratio**2)),
      projectedAreaM2: projected, meanSurfaceMm: mean, nominalUndisplacedWaterLitres: points.every(p => p[2] < input.floorMm) ? projected * (input.floorMm - mean) : null })
  }
  const vertices=cells.flatMap(c=>c.cornersMm.map(pointMm=>({pointMm})))
  const highest = Math.max(...vertices.map(v => v.pointMm[2])), lowest = Math.min(...vertices.map(v => v.pointMm[2])),
    projectedArea = excluded.length?cells.reduce((n,c)=>n+c.projectedAreaM2,0):r[2]*r[3]/1e6, trueArea = cells.reduce((sum, c) => sum + c.actualAreaM2, 0),
    waterDomain = highest < input.floorMm && chuteBed(ys[0])+input.chuteHeightMm < input.floorMm,
    nominalWater = waterDomain ? cells.reduce((sum, c) => sum + (c.nominalUndisplacedWaterLitres ?? 0), 0) : null,
    // Worst uniform -setting surface shift. Only valid while the entire pan is
    // below the overflow plane; reject a pan/floor intersection separately.
    upperWater = nominalWater === null ? null : nominalWater + projectedArea * input.settingMm,
    centroid = [r[0] + r[2] / 2, r[1] + r[3] / 2, input.datumMm],
    metalMass = trueArea * input.metalMm / 1000 * 8960,
    lower = lowest - input.metalMm - input.insulationMm - input.distributionBottomMm - input.settingMm,
    upper = input.floorUndersideMm - highest - input.settingMm,
    // Each water column acts at its plan-cell centroid. These exact first
    // moments are integrated below, without guessing support reactions.
    water = waterDomain ? cells.map(c => {
      const [a, b, , d] = c.cornersMm, dx = b[0] - a[0], dy = d[1] - a[1],
        h00 = input.floorMm - a[2] + input.settingMm, sx = (b[2] - a[2]) / dx, sy = (d[2] - a[2]) / dy,
        meanH = h00 - sx * dx / 2 - sy * dy / 2, litres = c.projectedAreaM2 * meanH,
        cx = a[0] + (h00 * dx / 2 - sx * dx ** 2 / 3 - sy * dx * dy / 4) / meanH,
        cy = a[1] + (h00 * dy / 2 - sy * dy ** 2 / 3 - sx * dx * dy / 4) / meanH,
        fz = -litres * inletStaticGravityMps2 / 1000
      return { id: c.id + '/water-to-floor-upper', massKg: litres,
        massCentroidXYZMm:[cx,cy,input.floorMm-meanH/2-(sx*sx*dx*dx+sy*sy*dy*dy)/(24*meanH)],originMm: centroid,
        wrenchKN_KNm: { Fx: 0, Fy: 0, Fz: fz, Mx: (cy - centroid[1]) / 1000 * fz, My: -(cx - centroid[0]) / 1000 * fz, Mz: 0 } }
    }) : []
  const floorFaces=cells.map(c=>{const normal=cross(subtract(c.cornersMm[1],c.cornersMm[0]),subtract(c.cornersMm[3],c.cornersMm[0])),length=Math.hypot(...normal)
    return{id:c.id+'/floor-face',cornersMm:c.cornersMm,normal:normal.map(v=>-v/length)}}),
    upstandFaces:{id:string;cornersMm:number[][];normal:number[]}[]=[],
    internalStepFaces:typeof upstandFaces=[],flowInterfaceFaces:typeof upstandFaces=[]
  const side=(id:string,points:number[][],normal:number[])=>{for(let i=1;i<points.length;i++) {
    const a=points[i-1],b=points[i]
    upstandFaces.push({id:`HAD/${roomId}-pan-return/${id}-${i}`,cornersMm:[a,b,[b[0],b[1],input.floorMm],[a[0],a[1],input.floorMm]],normal})
  }}
  if(waterDomain&&excluded.length){
    const boundary=new Map<string,{a:number[];b:number[];normal:number[];count:number}>()
    for(const c of cells)for(let k=0;k<4;k++){const a=c.cornersMm[k],b=c.cornersMm[(k+1)%4],key=[a.slice(0,2).join(','),b.slice(0,2).join(',')].sort().join('/'),prior=boundary.get(key);if(prior)prior.count++;else boundary.set(key,{a,b,normal:[[0,-1,0],[1,0,0],[0,1,0],[-1,0,0]][k],count:1})}
    let index=0
    for(const {a,b,normal,count} of boundary.values())if(count===1){
      const channel=a[1]===r[1]&&b[1]===r[1]&&axes.some(x=>Math.abs((a[0]+b[0])/2-x)<half)
      if(channel){const top=chuteBed(r[1])+input.chuteHeightMm,i=xs.indexOf(Math.max(a[0],b[0]));flowInterfaceFaces.push({id:`HAD/${roomId}-pan/wall-open-port-${i}`,normal,cornersMm:[a,b,[b[0],b[1],top],[a[0],a[1],top]]});side('notched-'+index++,[[a[0],a[1],top],[b[0],b[1],top]],normal)}
      else side('notched-'+index++,[a,b],normal)
    }
  }
  if(waterDomain&&!excluded.length){
    for(let i=1;i<xs.length;i++) {
      const a=xs[i-1],b=xs[i],channel=axes.some(x=>Math.abs((a+b)/2-x)<half),bottom=channel?chuteBed(ys[0])+input.chuteHeightMm:0,
        az=channel?bottom:elevation(a,ys[0]),bz=channel?bottom:elevation(b,ys[0])
      side('south-'+i,[[a,ys[0],az],[b,ys[0],bz]],[0,-1,0])
      if(channel)flowInterfaceFaces.push({id:`HAD/${roomId}-pan/wall-open-port-${i}`,normal:[0,-1,0],
        cornersMm:[[a,ys[0],chuteBed(ys[0])],[b,ys[0],chuteBed(ys[0])],[b,ys[0],bottom],[a,ys[0],bottom]]})
    }
    side('north',xs.map(x=>[x,ys[2],elevation(x,ys[2])]),[0,1,0])
    side('west',ys.map(y=>[xs[0],y,elevation(xs[0],y)]),[-1,0,0]);side('east',ys.map(y=>[xs[xs.length-1],y,elevation(xs[xs.length-1],y)]),[1,0,0])
  }
  for(const [i,axis] of axes.entries()) {
    for(const [label,edge,normal] of [['west',axis-half,[-1,0,0]],['east',axis+half,[1,0,0]]] as const)
      internalStepFaces.push({id:`HAD/${roomId}-pan/chute-${i+1}-${label}`,normal:[...normal],
        cornersMm:[[edge,ys[0],chuteBed(ys[0])],[edge,sy,chuteBed(sy)],[edge,sy,elevation(edge,sy)],[edge,ys[0],elevation(edge,ys[0])]]})
    for(const [label,a,b] of [['west',axis-half,axis],['east',axis,axis+half]] as const)
      internalStepFaces.push({id:`HAD/${roomId}-pan/chute-${i+1}-north-${label}`,normal:[0,1,0],
        cornersMm:[[a,sy,iz],[b,sy,iz],[b,sy,elevation(b,sy)],[a,sy,elevation(a,sy)]]})
  }
  const faces=[...floorFaces,...upstandFaces,...internalStepFaces],
    lowerSettingFaces=faces.map(f=>({...f,cornersMm:f.cornersMm.map(p=>[p[0],p[1],f.id.includes('pan-return')&&p[2]===input.floorMm?p[2]:p[2]-input.settingMm])})),
    stockLoads=(rows:typeof faces)=>rows.map(face=>{
      const pieces=triangles(face.cornersMm),area=pieces.reduce((sum,t)=>sum+triangleArea(t),0),
        centre=[0,1,2].map(k=>pieces.reduce((sum,t)=>sum+triangleArea(t)*t.reduce((s,p)=>s+p[k],0)/3,0)/area),
        mass=area*input.metalMm/1000*8960,fz=-mass*inletStaticGravityMps2/1000
      const massCentre=centre.map((v,i)=>v+face.normal[i]*input.metalMm/2)
      return {id:face.id+'/sheet-G',massKg:mass,massCentroidXYZMm:massCentre,developedAreaM2:area,originMm:centroid,
        wrenchKN_KNm:{Fx:0,Fy:0,Fz:fz,Mx:(massCentre[1]-centroid[1])/1000*fz,My:-(massCentre[0]-centroid[0])/1000*fz,Mz:0}}
    }),
    sheetLoads=stockLoads(faces),upperStockLoads=stockLoads(lowerSettingFaces),
    lowerPorts=flowInterfaceFaces.map(f=>({...f,cornersMm:f.cornersMm.map(p=>[p[0],p[1],p[2]-input.settingMm])})),
    hydrostaticCases=waterDomain?Object.entries(input.waterStageComparisonsMm).map(([id,stage])=>{
      // Bed10 low; the return crest stays at the retained flush-floor datum.
      // Reserve the extra developed metal; no joint movement is qualified.
      const loads=lowerSettingFaces.map(f=>faceWaterLoad(f,stage,centroid)),ports=lowerPorts.map(f=>faceWaterLoad(f,stage,centroid))
      return {id,declaredStageMm:stage,uniformHydrostaticOnly:true,panLowerSettingMm:input.settingMm,metalFaceLoads:loads,openPortInterfaceLoads:ports,
        summedMetalWrenchKN_KNm:sumWrenches(loads),summedOpenPortInterfaceWrenchKN_KNm:sumWrenches(ports),
        openPortAccount:'Hydraulic control-plane action, not a metal endcap or extra structural support. Join exactly once to the real closed wall/outside channel.',
        summedSurfaceWrenchKN_KNm:sumWrenches([...loads,...ports]),stageAboveFlushFloorMm:Math.max(0,stage-input.floorMm),
        actualSourceTransientJetAirPressureAndOverflowDistributionQualified:false,
        interpretation:stage>input.floorMm?'Declared submerged/backwater pressure comparator on finite pan faces; NOT containment, actual maximum flood level or whole-house water mass.':'Finite below-floor hydrostatic face actions; not support reactions or a guaranteed hydraulic stage.'}
    }):[]
  return { id: `HAD/${roomId}-graded-room-pan`,...(excluded.length?{planExclusionsMm:excluded,orthogonalBoundaryApplied:true,unnotchedEnvelopeAreaM2:r[2]*r[3]/1e6,removedPlanAreaM2:r[2]*r[3]/1e6-projectedArea}:{}),geometryOnly: true, selected: false, slopeRatio: ratio,
    metalComparison: '2mm copper reference; exact constituents, support, seams, corrosion and loaded renewal unqualified',
    openChutes:{clearWidthMm:input.chuteWidthMm,runYMm:[ys[0],sy],bedSlopeRatio:input.chuteSlopeRatio,bedEndsMm:[chuteBed(ys[0]),iz],
      closure:`Open integrated indoor copper pan/chutes. Closed${input.chuteWidthMm}×${input.chuteHeightMm} wall passage starts at actual inner wall; no indoor roof box intersects the floor pan.`},
    internalStepFaces,flowInterfaceFaces,
    outletMouthsMm: axes.map(x => [x, sy, iz]), vertices, cells,
    surfaceMm: [lowest, highest], metalUndersideMinimumMm: lowest - input.metalMm,
    bottomAfterInsulationAndSettingMm: lower, topAfterSettingMm: upper,
    necessaryGeometryScreen: lower >= 0 && upper >= 0 && waterDomain,
    twoOpenOutlets: { unimpededSurfaceDescent: true, trappedHeelBelowOutletsMm: 0, actualFixtureFeetDebrisAndSeamsQualified: false },
    oneBlockedOutlet: { saddleAboveInvertMm: (axes[1] - axes[0]) / 2 / ratio,
      convergingPanFrictionEntranceAndOutletCoexistenceQualified: false },
    rejectedFlatAtDistributionBase:{selected:false,flowFaceMm:input.distributionBottomMm,outfallMouthInvertMm:iz,
      trappedHeelMm:Math.max(0,iz-input.distributionBottomMm),
      bottomAfterInsulationAndSettingMm:-input.metalMm-input.insulationMm-input.settingMm,
      nominalUndisplacedWaterToFloorKg:projectedArea*Math.max(0,input.floorMm-input.distributionBottomMm),
      verdict:'Reject flat flow face at distribution base: trapped water and pan/insulation below its actual zone.'},
    projectedAreaM2: projectedArea, actualSlopingSheetAreaM2: trueArea, slopingSheetOnlyKg: metalMass,
    upstandFaces, lowerSettingFaces,
    settingModel:'Pan bed at−setting; fixed flush-floor return crest. Reserve the increased developed metal; no elastic stretching, joint displacement or physical closure credit.',
    perimeterReturnSheetOnlyKg:sheetLoads.filter(l=>l.id.includes('pan-return')).reduce((s,l)=>s+l.massKg,0),
    completeDevelopedSheetOnlyKg:waterDomain?sheetLoads.reduce((s,l)=>s+l.massKg,0):null,
    afterLowerSettingDevelopedSheetUpperKg:waterDomain?upperStockLoads.reduce((s,l)=>s+l.massKg,0):null,
    nominalGrossWaterToFloorLitres: nominalWater, afterLowerSettingGrossWaterToFloorUpperKg: upperWater,
    waterBoundary: 'Gross undisplaced water BELOW flush floor only, worst−setting pan shift. Fixtures/floor displacement reduces storage. Actual hot/store/source release, water above floor, lateral pressure, dynamic jets and flooded dry route remain separate and unbounded.',
    assuredAvailableStorageLitres: null,
    loadOrigins:sheetLoads,
    upperMetalStockCase:{id:'pan-bed-low-fixed-crest',faces:lowerSettingFaces,loadOrigins:upperStockLoads,
      summedWrenchKN_KNm:sumWrenches(upperStockLoads),concurrentWithNominalStock:false},hydrostaticCases,
    sheetStockModel:'Uniform2mm developed prisms outside their flow faces; actual bends, seam/corner intersections, tolerances and fabricated centroids remain unqualified.',
    staticGravityMps2:inletStaticGravityMps2,nominalPanMetalAndReturnsAdmitted:false,metalBendsSeamsSeatsFrameInsulationAndFloorStockKg:null,
    waterLoadOrigins: water, independentWaterWeightControlNotAdditionalToHydrostaticMetalLoads:true,
    wholeFaultMaximumLoadKg: null, supportAnd52HeadTransferQualified: false,
    diagnostics: [...(!waterDomain ? ['INLET_ROOM_PAN_CROSSES_OVERFLOW_PLANE_WATER_INTEGRAL_UNSUPPORTED'] : []), ...(lower < 0 || upper < 0 ? ['INLET_ROOM_GRADED_PAN_EXCEEDS_ACTUAL_ZONE'] : []),
      'INLET_ROOM_GRADED_PAN_SEATS_SEAMS_INSULATION_AND_LOADED_REMOVAL_UNQUALIFIED',
      'INLET_ROOM_GRADED_PAN_HYDRAULIC_JET_AND_BLOCKAGE_QUALIFICATION_MISSING'] }
}

/** Actual closed wall/outside passage; both open hydraulic cuts stay distinct
 * from its four metal faces. Source jets, dynamic transitions and resistance
 * are not supplied by this static pressure/free-body calculation. */
export function inletClosedOutfall(input:{id:string;axisXMm:number;wallInnerYMm:number;terminalYMm:number;
  wallInvertMm:number;terminalInvertMm:number;widthMm:number;heightMm:number;metalMm:number;
  originMm:Point;settingMm:number;waterStageComparisonsMm:Readonly<Record<string,number>>}) {
  const s=input,w=s.widthMm/2,y=s.wallInnerYMm,yy=s.terminalYMm,z=s.wallInvertMm,zz=s.terminalInvertMm,h=s.heightMm
  if(![s.axisXMm,y,yy,z,zz,w,h,s.metalMm,s.settingMm,...s.originMm,...Object.values(s.waterStageComparisonsMm)].every(Number.isFinite)
    ||y<=yy||w<=0||h<=0||s.metalMm<=0||s.settingMm<0)throw new Error('Unsupported actual closed outfall prism')
  const a=[s.axisXMm-w,y,z],b=[s.axisXMm+w,y,z],c=[s.axisXMm+w,yy,zz],d=[s.axisXMm-w,yy,zz],
    up=(p:Point)=>[p[0],p[1],p[2]+h],slope=(z-zz)/(y-yy),norm=Math.sqrt(1+slope*slope),
    metalFaces=[{id:s.id+'/floor',cornersMm:[a,b,c,d],normal:[0,slope/norm,-1/norm]},
      {id:s.id+'/roof',cornersMm:[up(a),up(b),up(c),up(d)],normal:[0,-slope/norm,1/norm]},
      {id:s.id+'/west',cornersMm:[a,d,up(d),up(a)],normal:[-1,0,0]},
      {id:s.id+'/east',cornersMm:[b,c,up(c),up(b)],normal:[1,0,0]}],
    interfaces=[{id:s.id+'/inside-open-cut',cornersMm:[a,b,up(b),up(a)],normal:[0,1,0]},
      {id:s.id+'/outside-open-cut',cornersMm:[d,c,up(c),up(d)],normal:[0,-1,0]}],
    lower=(f:typeof metalFaces[number])=>({...f,cornersMm:f.cornersMm.map(p=>[p[0],p[1],p[2]-s.settingMm])}),
    volume=s.widthMm*h*(y-yy)/1e9,waterKg=volume*1000,
    stockKg=((s.widthMm+2*s.metalMm)*(h+2*s.metalMm)-s.widthMm*h)*(y-yy)/1e9*8960,
    centre=[s.axisXMm,(y+yy)/2,(z+zz)/2+h/2],
    gravity=(id:string,mass:number,deltaZ=0)=>{const fz=-mass*inletStaticGravityMps2/1000
      return{id,massKg:mass,massCentroidXYZMm:[centre[0],centre[1],centre[2]+deltaZ],originMm:s.originMm,wrenchKN_KNm:{Fx:0,Fy:0,Fz:fz,Mx:(centre[1]-s.originMm[1])/1000*fz,My:-(centre[0]-s.originMm[0])/1000*fz,Mz:0}}},
    cases=Object.entries(s.waterStageComparisonsMm).map(([id,stage])=>{
      const metal=metalFaces.map(f=>faceWaterLoad(lower(f),stage,s.originMm)),ports=interfaces.map(f=>faceWaterLoad(lower(f),stage,s.originMm))
      return{id,declaredStageMm:stage,metalFaceLoads:metal,openInterfaceLoads:ports,
        summedMetalWrenchKN_KNm:sumWrenches(metal),summedOpenInterfaceWrenchKN_KNm:sumWrenches(ports),
        summedClosureWrenchKN_KNm:sumWrenches([...metal,...ports]),fullWaterPrism:stage>=Math.max(z,zz)+h-s.settingMm,
        maximumInnerPressureKPa:Math.max(0,inletStaticGravityMps2*(stage-Math.min(z,zz)+s.settingMm)/1000),
        physicalPressureTransitionSealAndSupportQualified:false}
    })
  return{id:s.id,clearCornersMm:[a,b,c,d,...[a,b,c,d].map(up)],metalFaces,hydraulicInterfaces:interfaces,
    material:'2mm copper closed-body reference; complete weather jacket/insulation, corrosion, seams, bends and support stock unqualified',
    bodyStockGravity:gravity(s.id+'/copper-body-G',stockKg),lowerSettingClearCornersMm:[a,b,c,d,...[a,b,c,d].map(up)].map(p=>[p[0],p[1],p[2]-s.settingMm]),
    fullWaterInventoryControl:gravity(s.id+'/full-water-control',waterKg,-s.settingMm),
    staticGravityMps2:inletStaticGravityMps2,fullWaterGravityIsNotAdditionalToHydrostaticMetalLoads:true,hydrostaticCases:cases,
    installedResistanceOr52HeadTransferQualified:false}
}

export function drawInletRoomPan(p:ReturnType<typeof inletRoomPan>) {
  const all=p.cells.flatMap(c=>c.cornersMm),x0=Math.min(...all.map(v=>v[0])),y0=Math.min(...all.map(v=>v[1])),
    ymax=Math.max(...all.map(v=>v[1])),scale=.19,X=(x:number)=>40+(x-x0)*scale,Y=(y:number)=>540-(y-y0)*scale,
    text=(x:number,y:number,t:string,size=15)=>`<text x="${x}" y="${y}" font-size="${size}">${t}</text>`,
    z=(v:number)=>715-v*.6,ffl=Math.max(...p.upstandFaces.flatMap(f=>f.cornersMm.map(v=>v[2]))),
    origin=p.loadOrigins[0].originMm,blocked=p.hydrostaticCases.find(c=>c.id==='both-blocked-below-floor-upper'),
    north=p.cells.filter(c=>c.cornersMm[2][1]===ymax).flatMap(c=>[c.cornersMm[3],c.cornersMm[2]]).sort((a,b)=>a[0]-b[0]),
    xSection=(x:number)=>610+(x-x0)*.22
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="950" viewBox="0 0 1280 950"><rect width="1280" height="950" fill="#f5f1e6"/><g font-family="Arial,sans-serif" fill="#28251e">
${text(40,42,'Utility graded copper pan · actual open chutes and wall cuts',25)}
${text(40,78,'Development geometry and static face actions. Seats, seams, plate resistance, warmth and complete handling remain unqualified.')}
${p.cells.map(c=>`<polygon points="${c.cornersMm.map(v=>`${X(v[0])},${Y(v[1])}`).join(' ')}" fill="${c.meanSurfaceMm<325?'#88bbc1':'#d9b486'}" stroke="#6f675a"/>`).join('')}
${p.outletMouthsMm.map((v,i)=>`<circle cx="${X(v[0])}" cy="${Y(v[1])}" r="5" fill="#254f5a"/>${text(X(v[0])+8,Y(v[1])-10,`mouth${i+1} Z${v[2]}`,12)}`).join('')}
${text(40,580,`Pan1:${p.slopeRatio}; indoor chutes1:${p.openChutes.bedSlopeRatio}; exact clear width${p.openChutes.clearWidthMm}mm.`)}
${text(40,610,`Surface${p.surfaceMm.map(v=>v.toFixed(2)).join('–')}mm; no trapped heel.`)}
${text(40,640,'Blue: open chutes. Closed boxes start at the south wall.')}
${text(40,670,'Fold lines show pieces; seams/strength/renewal unqualified.')}
${text(610,160,'Actual north-edge section · vertical scale exaggerated',18)}
<line x1="590" y1="${z(ffl)}" x2="1130" y2="${z(ffl)}" stroke="#373126" stroke-width="3"/>
<polyline points="${north.map(v=>`${xSection(v[0])},${z(v[2])}`).join(' ')}" fill="none" stroke="#9b582c" stroke-width="4"/>
${text(610,230,`Retained flush FFL${ffl}mm. Same absolute source-ground datum.`)}
${text(610,270,`Pan/chute bottom/top after setting:${p.bottomAfterInsulationAndSettingMm.toFixed(2)}/${p.topAfterSettingMm.toFixed(2)}mm.`)}
${text(610,310,`Metal sheets+returns${p.completeDevelopedSheetOnlyKg?.toFixed(3)??'unsupported'}kg nominal.`)}
${text(610,350,`Lower-bed stock envelope${p.afterLowerSettingDevelopedSheetUpperKg?.toFixed(3)??'unsupported'}kg +unknown ancillary stock.`)}
${text(610,590,`Gross water tofloor${p.nominalGrossWaterToFloorLitres?.toFixed(3)??'unsupported'}L; low-bed upper${p.afterLowerSettingGrossWaterToFloorUpperKg?.toFixed(3)??'unsupported'}kg.`)}
${text(610,630,`Blocked metal Fz${blocked?.summedMetalWrenchKN_KNm.Fz.toFixed(6)??'unsupported'}kN at source origin.`)}
${text(610,670,`Origin${origin.map(v=>v.toFixed(2)).join(',')}mm. Full six-component wrenches in receipt.`)}
${text(40,750,'Hydraulic open-cut actions are NOT metal endcaps or extra structural loads. Join once to the actual wall/outside channels.',17)}
${text(40,790,'Independent water-weight/first-moment integration balances all pressure faces and cuts. Do not add the same water twice.')}
${text(40,830,'Both blocked rejects unattended operation. Declared submerged pressure is a comparison, not an actual maximum flood level.')}
${text(40,870,'Actual cylinder/upper-network release, water above floor, dry escape and complete support/foundation response remain unbounded.')}
${text(40,915,'HAD OPEN · no house, material, physical, professional or owner acceptance',18)}
</g></svg>`
}
