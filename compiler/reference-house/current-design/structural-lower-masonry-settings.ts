/** Browser-safe authored controls for one explicit, unselected lower replacement. */
export type LowerMasonrySettings={
 schema:'str-lower-masonry-settings/1';id:'STR/WET/lower-masonry-comparison';execution:'deferred'|'compute'
 archRiseMm:450|600;masonryElasticModulusMPa:number;bearingCellsY:number;floorNormalComplianceMmPerMPa:number
 normalBed:{enabled:boolean;cellsPerAxis:number;normalComplianceMmPerMPa:number;tangentialKeyHypothesis:'ideal-work-dual-centroid-ux-uy-rz'}
}
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)
const numeric=(v:unknown,lo:number,hi:number):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi
export function readLowerMasonrySettings(v:unknown):LowerMasonrySettings{
 if(!record(v)||Object.keys(v).sort().join()!==['schema','id','execution','archRiseMm','masonryElasticModulusMPa','bearingCellsY','floorNormalComplianceMmPerMPa','normalBed'].sort().join()
 ||v.schema!=='str-lower-masonry-settings/1'||v.id!=='STR/WET/lower-masonry-comparison'||(v.execution!=='deferred'&&v.execution!=='compute')
 ||![450,600].includes(v.archRiseMm as number)||!numeric(v.masonryElasticModulusMPa,500,10000)||!Number.isInteger(v.bearingCellsY)||!numeric(v.bearingCellsY,2,11)
 ||!numeric(v.floorNormalComplianceMmPerMPa,.001,10)||!record(v.normalBed))throw Error('Explicit supported lower-masonry comparison controls required')
 const b=v.normalBed
 if(Object.keys(b).sort().join()!==['enabled','cellsPerAxis','normalComplianceMmPerMPa','tangentialKeyHypothesis'].sort().join()
 ||typeof b.enabled!=='boolean'||![2,4,8,16].includes(b.cellsPerAxis as number)||!numeric(b.normalComplianceMmPerMPa,.001,10)
 ||b.tangentialKeyHypothesis!=='ideal-work-dual-centroid-ux-uy-rz')throw Error('Explicit finite normal bed and ideal positive tangential/yaw key required')
 return structuredClone(v) as LowerMasonrySettings
}
