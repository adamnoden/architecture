/** Shared authored goods reservations and pure routing, consumed by the existing
 * Plant release study and the current inlet compiler. These are design limits,
 * not measured or factory-qualified loaded apparatus. */
export const plantReleaseProfileChoices=Object.freeze({schema:'had-plant-release-profile-choices/1',cylinderRadiusMm:415,bufferRadiusMm:375,
 cylinderMaximumHeightMm:1830,settingMm:10,clearanceMm:25,cylinderFirstXMm:10515,cylinderTurnYMm:4560,
 cylinderEastStationsMm:Object.freeze([[11050,4560],[11400,4575],[12590,4575]]),bufferTurnMm:Object.freeze([11100,4575]),eastFirstRestMm:Object.freeze([12590,4575])})
export function derivePlantReleaseProfiles({plant,insideWestMm,insideSouthMm,openingHeightMm}){
 const c=plantReleaseProfileChoices,tuple=(p,n)=>Array.isArray(p)&&p.length===n&&[...p].every(Number.isFinite)
 if(!plant?.primaryBuffer||!tuple(plant.primaryBuffer.station,4)||plant.primaryBuffer.station.slice(2).some(v=>v<=0)||![insideWestMm,insideSouthMm,openingHeightMm].every(Number.isFinite)||openingHeightMm<=c.clearanceMm+c.settingMm)
  throw Error('Unsupported current Plant goods-profile inputs')
 const reserve=c.settingMm+c.clearanceMm,bufferCentre=plant.primaryBuffer.station.slice(0,2).map((v,k)=>v+plant.primaryBuffer.station[k+2]/2),approachY=insideSouthMm+c.cylinderRadiusMm+reserve+1,
  cylinderPath=[[insideWestMm+c.cylinderRadiusMm+reserve+1,approachY],[c.cylinderFirstXMm,approachY],[c.cylinderFirstXMm,c.cylinderTurnYMm],...c.cylinderEastStationsMm.map(p=>[...p])],
  bufferPath=[bufferCentre,[...c.bufferTurnMm],[...c.eastFirstRestMm]]
 return{schema:'had-current-plant-goods-profiles/1',choices:c,bufferCentreMm:bufferCentre,requiredOpeningHeightComparisonMm:openingHeightMm,
  cylinder:{id:'actual-cylinder-full-profile',pathMm:cylinderPath,completeRadiusMm:c.cylinderRadiusMm,maximumCompleteHeightMm:c.cylinderMaximumHeightMm},
  buffer:{id:'actual-buffer-full-profile',pathMm:bufferPath,completeRadiusMm:c.bufferRadiusMm,maximumCompleteHeightMm:openingHeightMm-reserve},
  actualLoadedProfilesMeasuredOrFactoryQualified:false,maximumHeightsAreDesignLimits:true}
}
