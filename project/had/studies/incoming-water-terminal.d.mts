type P=readonly[number,number,number]
type B=readonly[number,number,number,number,number,number]
export function utilityRetainedHotGeometry(sourceHotVertices:readonly (readonly number[])[]):{
 id:'H0'
 isolation:{id:string;axis:P;wheel:P;bodyBox:B;valveFaceLength:number;maxAdaptorsEach:number;wheelDiameter:number;orientation:string}
 backbone:P[]
 terminal:P[]
 drainTee:P
 datum:'occupied-ground-FFL'
 sourceGeometryOnly:true
 actualPressureIsolationDrainSupportAndRenewalAccepted:false
}
