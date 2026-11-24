type Point=readonly[number,number,number]
type Box=readonly[number,number,number,number,number,number]
export type UtilityWideCapture={
 disposition:string;experimentalAuthoredChoices?:{hotRiserXMm:number;selected:false;completeOccupiedArrangementQualified:false};
 hot:{body:Box;backbone:Point[];terminal:Point[];[key:string]:unknown};
 stages:{stage:number;box:Box;clearanceMM:number;[key:string]:unknown}[];
 [key:string]:unknown
}
export function deriveUtilityWideCapture(options?:{hotRiserXMm?:number}):UtilityWideCapture
