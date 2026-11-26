import type {utilityRetainedHotGeometry} from './incoming-water-terminal.mjs'
type P=readonly[number,number,number]
type B=readonly[number,number,number,number,number,number]
export type UtilityHotHeadChoice={schema:'had-utility-hot-head/1';sourceCutId:'P/Utility-H0-hot-cut';virtualSpoolMm:readonly P[];centrelineRadiusMm:number;tubeMaximumODMm:number;tubeMinimumWallMm:number;jacketRadialMm:number;sourceUnionBareDiameterMm:number;sourceUnionHalfLengthMm:number;headUnionAFMm:number;headUnionHalfLengthMm:number;headInitialLiftMm:number;spoolReleaseUpMm:number;spoolNorthToRestMm:number;maximumColdMaintenanceC:number;maximumPartialBatchL:number;receiverOuterMm:B;receiverUsableMinimumL:number;receiverMaximumWallMm:number;frontUpperRailId:string;frontUpperRailRemovedBeforeSpoolNorth:true;headFullyRemovedBeforeFrontRailReleaseRequired:true;minimumRequiredGaugeRatingBar:number;normalWaterDesignTemperatureC:number}
export type UtilityHotHeadResult={
 schema:'had-utility-current-hot-head/1';retained:ReturnType<typeof utilityRetainedHotGeometry>;choice:UtilityHotHeadChoice
 formedSpool:{path:P[];bends:{tangent:number}[];hausdorffError:number}
 normalPermanentEnvelopes:{id:string;boxMm:B}[]
 inventory:{isolatedH0LowerBranchUpperL:number;sourceH0FullExternalBodyL:number;downstreamBackboneFull74mmCoverL:number;lowerTerminalFull50mmCoverL:number;newSpoolMaximumWaterL:number;sourceUnionFullExternalBoxL:number;headUnionFullExternalBoxL:number;drainFullExternalBoxL:number;metalAndInsulationDeliberatelyIncluded:true;domesticStoreOrUpperNetworkIncluded:false;actualH0ClosureAndZeroPressureQualified:false}
 receiver:{outerMm:B;innerGrossCeilingL:number;requiredVerifiedNetL:number;spoutMm:P;maximumPartialBatchL:number;closeDrainBeforeEmptying:true;actualNetCapacityAndHandlingQualified:false}
 headFirstRelease:{headFirstUpMm:number;thenCapturedSpoolUpMm:number;thenSpoolNorthMm:number;fixedSourceUnionBareMm:B;movingSourceHalfBareMm:B;movingHeadHalfBareMm:B;capsFitOnlyAfterSpoolWithdrawn:true;opposedAxialFacesNotReleasedBySpoolTranslationAlone:true}
 renewalGeometry:{checks:{id:string;kind:string;reserveMm:number}[];failures:{id:string;kind:string;reserveMm:number}[];necessaryConditionalSpoolSweeps:boolean;frontUpperRailStillPresentControl:{id:string;kind:string;reserveMm:number}[];headFullRemovalToolAndTemporaryStabilityProofAccepted:false}
 geometry:{checks:{id:string;kind:string;reserveMm:number}[];failures:{id:string;kind:string;reserveMm:number}[];necessarySpecifiedGeometry:boolean}
 sequence:string[];actualPressureMaterialAndThermalProofAccepted:false;actualToolReactionAndHeadPickupAccepted:false;actualRenewalSupportAndCompleteInstallationAccepted:false
}
export function deriveUtilityHotHead(input:{choice:UtilityHotHeadChoice;sourceHotVertices:readonly(readonly number[])[];head:{hotPortMm:P};obstacles:readonly{id:string;boxMm:B}[];settingEachMm:number}):UtilityHotHeadResult
