import {groundPlanResolution as selected,createResolvedReferenceHouseSource} from './plan-resolution.js'

/** Bounded comparison at the selected location, with 300 mm goings and no
 * under-flight circulation. Rejection is not a claim of global impossibility. */
export const auditSquareStairOptions=()=>{
 const source=createResolvedReferenceHouseSource(),s=selected.stair
 const clearBand=4200-2*417.5,hallWidth=9350-62.5-(3200+62.5)
 const entrance=selected.openings.find(o=>o.id==='G-FRONT-D01')!
 const twentyRiseArrivalEnd=s.x+1100+9*300+50+1000
 return {
  assumptions:{floorToFloorMm:3450,goingMm:300,flightClearWidthMm:1000,routeWidthMm:1000,frameAllowanceMm:50,underFlightRoute:false},
  clearFrontBandMm:clearBand,
  options:[
   {id:'straight-20',status:'REJECT_AT_THIS_LOCATION',flightRunMm:19*300,totalWithFloorLandingsMm:19*300+2000,clearHallLengthMm:hallWidth,reason:'Does not fit the front band north-south or the clear hall length with both floor landings.'},
   {id:'ordinary-three-sided-u-20',status:'REJECT_AT_THIS_LOCATION',rises:[7,6,7],footprintWidthMm:5*300+2*1100,footprintDepthMm:6*300+1100,requiredBandWithFrameAndPassageMm:6*300+1100+100+1000,reason:'Consumes the independent passage behind the stair; no under-flight headroom rescue is admitted.'},
   {id:'balanced-return-20',status:'REJECT_AT_THIS_LOCATION',rises:[10,10],riseMm:3450/20,arrivalEndMm:twentyRiseArrivalEnd,entranceOpenLeafXmm:entrance.centre+entrance.width/2,arrivalConflictMm:twentyRiseArrivalEnd-(entrance.centre+entrance.width/2),reason:'Lower rises add 300 mm run and put the full floor-arrival field through the open entrance leaf at this study/door set-out.'},
   {id:'open-well-return-18',status:'SELECT_PROVISIONAL',rises:[9,9],riseMm:3450/18,goingMm:300,wellMm:s.wellGap,landingDepthMm:s.landingDepth,footprintWidthMm:s.footprintWidth,footprintDepthMm:s.footprintDepth,headroomVerified:false,reason:'Balanced flights, larger landing and open well retain the study, front arrival and independent cross passage.'}
  ]
 }
}
