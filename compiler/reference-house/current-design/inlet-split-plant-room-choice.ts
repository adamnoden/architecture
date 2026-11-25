/** Pure authored Plant choice admission shared by saved documents and browser edits. */
type Pair=readonly[number,number]
export type SplitPlantRoomChoice={schema:'had-split-plant-room/1';id:string;localPocketDepthMm:number;isolationGapMm:number;
 outletAxesYMm:Pair;clearWidthMm:number;clearHeightMm:number;insideRunMm:number;outsideRunMm:number;invertAboveDistributionMm:number;panSlopeRatio:number;outfallSlopeRatio:number;
 metalMm:number;insulationMm:number;settingMm:number;receiverWidthMm:number;receiverCrestAboveGradeMm:number;receiverHighAdverseMm:number;
 bridgeThicknessMm:number;centralRailWidthMm:number;bridgePlateCargoInsetsYMm:Pair;referenceWheelActionIncludingDynamicN:number;referenceWheelBandMm:number;referenceElasticModulusMPa:number;referenceSteelDensityKgM3:number;referenceProofComparisonMPa:number;bridgePieceCount:number;bridgeJointGapMm:number;bridgeHardwareBudgetEachKg:number;bridgeCompletePieceMassLimitKg:number;bridgeLiftMm:number;bridgeFirstRestBoxMm:readonly[number,number,number,number,number,number];storedAdverseMinimumDensityKgM3:number}
const tuple=(x:unknown,n:number)=>Array.isArray(x)&&x.length===n&&[...x].every(Number.isFinite)
const splitPlantRoomChoiceKeys=['schema','id','localPocketDepthMm','isolationGapMm','outletAxesYMm','clearWidthMm','clearHeightMm','insideRunMm','outsideRunMm','invertAboveDistributionMm','panSlopeRatio','outfallSlopeRatio','metalMm','insulationMm','settingMm','receiverWidthMm','receiverCrestAboveGradeMm','receiverHighAdverseMm','bridgeThicknessMm','centralRailWidthMm','bridgePlateCargoInsetsYMm','referenceWheelActionIncludingDynamicN','referenceWheelBandMm','referenceElasticModulusMPa','referenceSteelDensityKgM3','referenceProofComparisonMPa','bridgePieceCount','bridgeJointGapMm','bridgeHardwareBudgetEachKg','bridgeCompletePieceMassLimitKg','bridgeLiftMm','bridgeFirstRestBoxMm','storedAdverseMinimumDensityKgM3'].sort()
/** Complete authored choice only: derived pass/identity fields and sparse edits reject. */
export function admitSplitPlantRoomChoice(value:unknown):SplitPlantRoomChoice{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)throw Error('Unsupported complete Plant room choice')
 const c=value as SplitPlantRoomChoice
 if(Object.keys(c).sort().join(',')!==splitPlantRoomChoiceKeys.join(',')||c.schema!=='had-split-plant-room/1'||typeof c.id!=='string'||!c.id
  ||!tuple(c.outletAxesYMm,2)||!tuple(c.bridgePlateCargoInsetsYMm,2)||!tuple(c.bridgeFirstRestBoxMm,6)
  ||Object.entries(c).some(([k,v])=>!['schema','id','outletAxesYMm','bridgePlateCargoInsetsYMm','bridgeFirstRestBoxMm'].includes(k)&&(!Number.isFinite(v)||typeof v!=='number'))
  ||c.localPocketDepthMm<200||c.localPocketDepthMm>350||c.isolationGapMm<25||c.isolationGapMm>100||c.clearWidthMm<=0||c.clearHeightMm<=47||c.settingMm<10||c.insulationMm<20||c.metalMm<2||c.insideRunMm<=0||c.outsideRunMm<=0||c.outfallSlopeRatio<=0||c.panSlopeRatio<50||c.panSlopeRatio>200||c.bridgeThicknessMm<=0||c.centralRailWidthMm<=0||c.receiverWidthMm<=0||c.receiverHighAdverseMm<0
  ||!Number.isInteger(c.bridgePieceCount)||c.bridgePieceCount<1||c.bridgePieceCount>20||c.bridgeJointGapMm<0||c.bridgeJointGapMm>3||c.bridgeHardwareBudgetEachKg<0||c.bridgeCompletePieceMassLimitKg<=0||c.bridgeLiftMm<50||c.bridgeFirstRestBoxMm.slice(3).some(v=>v<=0)
  ||c.storedAdverseMinimumDensityKgM3<900||c.storedAdverseMinimumDensityKgM3>1000||c.referenceWheelActionIncludingDynamicN<=0||c.referenceWheelBandMm<=0||c.referenceElasticModulusMPa<=0||c.referenceSteelDensityKgM3<=0||c.referenceProofComparisonMPa<=0)
  throw Error('Unsupported complete Plant room choice')
 return structuredClone(c)
}
