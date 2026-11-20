type Point = readonly [number, number, number]
type Box = readonly [number, number, number, number, number, number]
type Branch = {
  readonly branch: string
  readonly pressurePathMm: readonly Point[]
  readonly lowerTurn: { readonly virtualCornerMm: Point }
  readonly support: { readonly blockedEndThrustN: number; readonly centrelineStockMassKg: number }
  readonly repairZones: readonly { readonly cutZMm: number; readonly secondPlainPipeCutZMm: number }[]
  readonly externalRepairZone: { readonly cutYMm: number; readonly secondPlainPipeCutYMm: number }
  readonly components?: readonly { readonly id: string; readonly boxMm: Box }[]
}
const r = (value: number) => Number(value.toFixed(6)) || 0
const cross = (a: Point, b: Point): Point => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]
const add = (a: Point, b: Point): Point => a.map((value, i) => value+b[i]) as unknown as Point
const subtract = (a: Point, b: Point): Point => a.map((value, i) => value-b[i]) as unknown as Point
const boxGap = (a: Box, b: Box) => Math.max(...[0,1,2].map(i => Math.max(b[i]-a[i]-a[i+3], a[i]-b[i]-b[i+3])))

export const fixedInletOperatingFacts = {
  jaw: {
    model: '2484.9', article: '485542', tubeDiameterMm: 28,
    source: 'https://www.viega.co.uk/en/products/Catalogue/Piping-technology/System-press-tools/Picco-system-press-jaws/Metallic-press-connector-systems/Press-jaw-2484-9.html',
    nativeCadUrl: 'https://web-catalog.viega.com/CadData/4015211485542_STP3D.zip',
    stepSha256: 'd2b018e01a97b9738914f77c615c1ccf241dc883d0f51147b3fccd7aad586672',
    closedPressAxisMm: [-58.3,0,-12.95],
    closedBoundsMm: [[-82.804,44.581],[-52.902,52.902],[-29.151,3.251]],
    openBoundsMm: [[-88.206,44.058],[-48.221,48.221],[-179.151,-146.749]],
    openStateDisplayTranslationMm: [0,0,150],
    openingAndClosingUnionAboutPressAxisMm: [[-29.906,102.881],[-52.902,52.902],[-16.201,16.201]],
    hingeAxesNativeXYMm: [[-27.5,-25.5],[-27.5,25.5]],
    continuousMotionBoundary: 'Full-circle corner-radius bounds around both recovered hinge axes contain every intermediate rigid jaw rotation, including stationary parts. This deliberately overbounds the actual opening angle. Attachment pin registration and machine/hand motion remain unqualified.',
  },
  coupling: {
    article: '436407', nativeCadUrl: 'https://web-catalog.viega.com/CadData/4015211436407_STP3D.zip',
    stepSha256: '963bad1c9ab3897f0458e0eb19b9fd02d56bc9de62c56d125c5be9c14e30b0a6',
    nativeAxialLengthMm: 95.5, reservedAxialLengthMm: 96,
    pressPlaneBoundary: 'Both pressing planes lie within the full96mm coupling bound; no unmeasured ring centre is substituted.',
  },
  frost: {
    source: 'https://www.waterregsuk.co.uk/topics/all-faqs/how-should-pipework-access-a-building/',
    calculator: 'https://www.waterregsuk.co.uk/information/tools/pipe_insulation_tool/',
    mineralInsulatedHeatRouteSource:'https://content.thermon.com/pdf/us_pdf_files/TEP0020a-MIQ-Laser-Spec.pdf',
    claim: 'Finite insulation delays freezing; it cannot establish indefinite frost protection of stagnant water exposed to a subzero environment.',
    sensitivityOnly: { initialWaterC: 10, outsideAirC: -5, conductivityWmK: .04, surfaceCoefficientWm2K: 25,
      waterDensityKgM3: 1000, waterHeatCapacityJKgK: 4180, steelHeatCapacityJKgK: 500 },
  },
} as const

export function fixedInletOperatingProof(input: {
  readonly branches: readonly Branch[]
  readonly frame: { readonly normalAxisYMm: number; readonly railAxesZMm: readonly number[]; readonly jambAxesXMm: readonly number[] }
  readonly finishedWallYMm: number
  readonly outsideWallYMm: number
  readonly washerFirstRestMm: Box
  readonly inverterMm: Box
  readonly protectedDiameterMm: number
  readonly pipe: { readonly outerDiameterMm: number; readonly minimumWallMm: number; readonly massKgM: number }
}) {
  const facts=fixedInletOperatingFacts.jaw
  const radius=Math.max(...facts.hingeAxesNativeXYMm.flatMap(pivot=>[-88.206,44.581].flatMap(x=>[-52.902,52.902].map(y=>Math.hypot(x-pivot[0],y-pivot[1])))))
  const jaw: readonly (readonly [number,number])[] = [[-27.5-radius+58.3,-27.5+radius+58.3],[-25.5-radius,25.5+radius],[-16.201,16.201]]
  const siblingGap=(bound:Box,branch:string)=>{
    const gaps=input.branches.filter(other=>other.branch!==branch).flatMap(other=>(other.components??[]).filter(part=>part.id!=='fixed-upper-wet-guard').map(part=>boxGap(bound,part.boxMm)))
    return gaps.length?r(Math.min(...gaps)-5):null
  }
  const toolPoses = input.branches.flatMap(branch => {
    const [x,y,z] = branch.lowerTurn.virtualCornerMm
    return [1,2].flatMap(cycle => {
      const vertical = branch.repairZones.map((zone,index) => {
        const cut = cycle === 1 ? zone.cutZMm : zone.secondPlainPipeCutZMm
        const bound: Box = [x-jaw[1][1],y+jaw[0][0],cut-48+jaw[2][0],
          2*jaw[1][1],jaw[0][1]-jaw[0][0]+100,96+jaw[2][1]-jaw[2][0]]
        return { branch: branch.branch, cycle, joint: index ? 'upper-riser' : 'lower-riser', cutCentreMm: [x,y,cut],
          jawOpeningClosedAnd100mmApproachBoundMm: bound,
          after5Mm: { wall: r(bound[1]-input.finishedWallYMm-5),
            washerAtRestrainedRest: r(boxGap(bound,input.washerFirstRestMm)-5),
            actualInverter: r(boxGap(bound,input.inverterMm)-5),
            siblingFixedBodies: siblingGap(bound,branch.branch) },
          temporaryElectricalExclusion: true, bothOwnGuardAndJacketOpen: true,bothLodgeBranchesIsolatedAndSiblingFrontHoodRemoved:true,
          allMachineAndHandMotionQualified: false }
      })
      const cut = cycle === 1 ? branch.externalRepairZone.cutYMm : branch.externalRepairZone.secondPlainPipeCutYMm
      const slope=(z-branch.pressurePathMm[0][2])/(y-branch.pressurePathMm[0][1]),angle=Math.atan(slope)
      const cutZ=branch.pressurePathMm[0][2]+(cut-branch.pressurePathMm[0][1])*slope
      const corners=[-48+jaw[2][0],48+jaw[2][1]].flatMap(axial=>[jaw[0][0],jaw[0][1]+100].map(radial=>[
        cut+axial*Math.cos(angle)-radial*Math.sin(angle),cutZ+axial*Math.sin(angle)+radial*Math.cos(angle)]))
      const minY=Math.min(...corners.map(p=>p[0])),maxY=Math.max(...corners.map(p=>p[0]))
      const minZ=Math.min(...corners.map(p=>p[1])),maxZ=Math.max(...corners.map(p=>p[1]))
      const bound: Box = [x-jaw[1][1],minY,minZ,2*jaw[1][1],maxY-minY,maxZ-minZ]
      return [...vertical, { branch: branch.branch, cycle, joint: 'exterior-tail', cutCentreMm: [x,cut,cutZ],
        jawOpeningClosedAnd100mmApproachBoundMm: bound,
        after5Mm: { wall: r(input.outsideWallYMm-bound[1]-bound[4]-5),
          washerAtRestrainedRest: r(boxGap(bound,input.washerFirstRestMm)-5),
          actualInverter: r(boxGap(bound,input.inverterMm)-5),
          siblingFixedBodies: siblingGap(bound,branch.branch) },
        temporaryElectricalExclusion: true, bothOwnGuardAndJacketOpen: true,bothLodgeBranchesIsolatedAndSiblingFrontHoodRemoved:true,
        allMachineAndHandMotionQualified: false }]
    })
  })
  const [west,east] = [...input.frame.jambAxesXMm].sort((a,b)=>a-b)
  const [low,high] = input.frame.railAxesZMm
  const origin: Point = [(west+east)/2,input.frame.normalAxisYMm,(low+high)/2]
  const halfSpan=(east-west)/2,halfGauge=(high-low)/2
  const equilibriumCases = [-1,1].flatMap(normalSign => [-1,1].map(verticalSign => {
    const actions = input.branches.flatMap(branch => {
      const totalLength = branch.pressurePathMm.slice(1).reduce((sum,end,i)=>sum+Math.hypot(...subtract(end,branch.pressurePathMm[i])),0)
      const stockCentroid = [0,1,2].map(axis => branch.pressurePathMm.slice(1).reduce((sum,end,i)=>{
        const start=branch.pressurePathMm[i]
        return sum+(start[axis]+end[axis])/2*Math.hypot(...subtract(end,start))
      },0)/totalLength) as unknown as Point
      return [{ branch:branch.branch, kind:'unbalanced-end-envelope',pointMm:branch.lowerTurn.virtualCornerMm,
        forceN:[0,normalSign*branch.support.blockedEndThrustN,verticalSign*branch.support.blockedEndThrustN] as Point },
      {branch:branch.branch,kind:'known-centreline-stock-weight',pointMm:stockCentroid,
        forceN:[0,0,-branch.support.centrelineStockMassKg*9.81] as Point}]
    })
    const force=actions.reduce((sum,a)=>add(sum,a.forceN),[0,0,0] as Point)
    const moment=actions.reduce((sum,a)=>add(sum,cross(subtract(a.pointMm,origin),a.forceN)),[0,0,0] as Point)
    const reactions = [-1,1].flatMap(sx=>[-1,1].map(sz=>({
      id:(sx<0?'west':'east')+'-'+(sz<0?'low':'high')+'-normal',
      pointMm:[origin[0]+sx*halfSpan,origin[1],origin[2]+sz*halfGauge] as Point,
      forceN:[0,-force[1]/4-sx*moment[2]/(4*halfSpan)+sz*moment[0]/(4*halfGauge),0] as Point,
    })))
    reactions.push(...[-1,1].map(sx=>({id:(sx<0?'west':'east')+'-vertical',
      pointMm:[origin[0]+sx*halfSpan,origin[1],origin[2]] as Point,
      forceN:[0,0,-force[2]/2+sx*moment[1]/(2*halfSpan)] as Point})))
    const remainingForce=reactions.reduce((sum,a)=>add(sum,a.forceN),force)
    const remainingMoment=reactions.reduce((sum,a)=>add(sum,cross(subtract(a.pointMm,origin),a.forceN)),moment)
    return {normalSign,verticalSign,originMm:origin,actions,reactions,
      forceResidualN:remainingForce.map(r),momentResidualNmm:remainingMoment.map(r),
      completeEquilibrium:remainingForce.every(n=>Math.abs(n)<1e-6)&&remainingMoment.every(n=>Math.abs(n)<1e-6)}
  }))
  const frost=fixedInletOperatingFacts.frost.sensitivityOnly
  const outer=input.protectedDiameterMm/2000,pipeOuter=input.pipe.outerDiameterMm/2000
  const bore=(input.pipe.outerDiameterMm-2*input.pipe.minimumWallMm)/2000
  const resistance=Math.log(outer/pipeOuter)/(2*Math.PI*frost.conductivityWmK)+1/(2*Math.PI*outer*frost.surfaceCoefficientWm2K)
  const capacity=Math.PI*bore*bore*frost.waterDensityKgM3*frost.waterHeatCapacityJKgK+input.pipe.massKgM*frost.steelHeatCapacityJKgK
  return {
    schema:'had-fixed-inlet-operating-proof/1' as const,facts:fixedInletOperatingFacts,toolPoses,
    continuousJawBound:{hingeRadiusMm:r(radius),relativePressAxisBoundsMm:jaw.map(pair=>pair.map(r)),
      openClosedAndEveryIntermediateHingeAngleCovered:true,approachTranslationMm:100,settingMm:5},
    nativeJawPoseBoundsClear:toolPoses.every(p=>Object.values(p.after5Mm).every(n=>n!==null&&n>=0)),
    toolQualification:'native-open-and-closed-jaw-reservations-only' as const,
    supportFreebody:{originMm:origin,equilibriumCases,
      maximumAbsoluteKnownNormalReactionN:r(Math.max(...equilibriumCases.flatMap(c=>c.reactions.map(a=>Math.abs(a.forceN[1]))))),
      normalReactionLaw:'Symmetric four-bearing normal-force distribution, with separate paired vertical bearings. This declared bearing law balances all six force/moment components; it is not a solved stiffness, anchor or contact model.',
      stockTributaryLaw:'All represented centreline stock weight is conservatively assigned to the low frame at its actual line-length centroid. The real upper/outer support distribution is not established; fitting and hardware weights are additional.',
      independentReceivingSubstrate:'actual paired RC jambs; no window, sibling wet shell, finish floor or moisture-barrier fixing is credited',
      missingLoadPath:['actual pipe fixed-point and sliding-guide hardware','post-to-floor weld and local liner/ribs','rib-to-low-rail transfer members and welds','rail/backplate joints','real jamb anchor groups and cage clearance'],
      excludedActions:['fitting, valve, jacket, wet-liner and support self-weight','actual tool/counterhold reactions','guide friction and thermal restraint','water hammer and measured transient source actions'],
      completeSupportCapacity:false},
    noFlowFrost:{status:'unqualified-no-flow-frost' as const,scenario:frost,
      radialInsulationAllowanceMm:r((input.protectedDiameterMm-input.pipe.outerDiameterMm)/2),
      resistanceKMetrePerW:r(resistance),heatCapacityJPerMetreK:r(capacity),
      firstZeroCelsiusHours:r(resistance*capacity*Math.log((frost.initialWaterC-frost.outsideAirC)/-frost.outsideAirC)/3600),
      steadyHeatRequiredToHoldZeroWPerMetre:r(-frost.outsideAirC/resistance),
      exteriorTailExposureComparison:input.branches.map(branch=>({branch:branch.branch,
        lengthMm:r(Math.max(0,input.outsideWallYMm-branch.externalRepairZone.cutYMm)),
        steadyHeatToHoldZeroW:r(-frost.outsideAirC/resistance*Math.max(0,input.outsideWallYMm-branch.externalRepairZone.cutYMm)/1000)})),
      interpretation:'Dry uniform-cylinder lumped sensitivity only; no named insulation, moisture, jacket, contact bridge, axial heat, local wind or latent-ice model. First zero is not a predicted burst time. Any finite insulation reaches a negative no-heat steady temperature in this declared exposure.',
      missingDecision:'Bind the real thermal assembly and allowed weather/duration, or provide an evidenced warm-boundary, drain or heat strategy while preserving both atmospheric fault paths. Do not approve indefinite no-flow frost protection from diameter alone.'},
    thermalStrategyRecommendation:{status:'development-route-not-installed-frost-protection' as const,
      firstPreference:'Keep the primary entry and upstream transition within a verified frost-protected service envelope; retain atmospheric fault outlets outside the warm boundary without importing outdoor air into the house.',
      exposedTailFallback:'Investigate a separately protected mineral-insulated surface heat route and complete metal/mineral jacket. Thermon MIQ laser-welded cable is a named conductor/MgO/Alloy825 research candidate; terminations, control, supply and exact whole-assembly constituents are not selected or approved.',
      authoredMinimumMaintainedWaterC:5,
      idealDrySensitivityHeatToHoldFiveWPerMetre:r((5-frost.outsideAirC)/resistance),
      powerLossDuty:'Calculate holdover from the actual named assembly, bridges, minimum initial water and declared weather/outage duration. Beyond that envelope isolate and drain through a proved Lodge drain/air-admission route before freezing; no unattended automatic action, battery, endless flow or manual response is credited here.',
      stopIfUnavailable:'If the envelope, heat/material or drain/outage duties cannot be met, change the entry/relief geometry or use a frost-protected accessible bay. Do not call50mm a qualified thermal stack.',
      heatSupplyPresent:false,automaticDrainPresent:false,completeMaterialAssemblyAdmitted:false},
    wetNeck:{requiredByRecommendedClosedHood:false,stationaryLandingIdentified:false,factoryPressureGlandIsSecondaryWetSeal:false,
      replacedDuty:'Whole ordinary valve within a normally closed access hood. Passive fault containment is claimed only with the hood closed; independent Lodge isolation precedes known-fault opening. No live-contained-rupture inside-access claim.'},
    installedAcceptance:false,
  }
}
