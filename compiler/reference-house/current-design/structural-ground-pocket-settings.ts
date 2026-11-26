/** Browser-safe controls; material stiffness is an authored comparison, not a qualification. */
export type GroundPocketSettings={schema:'str-ground-pocket-settings/1';id:'STR/HAD/known-ground-stock';execution:'deferred'|'compute';settings:{enabled:boolean;platePitchMm:number;contactPitchMm:number;plateLaw:{elasticModulusMPa:number;poissonRatio:number;flexuralFactor:number;shearFactor:number};mineralModulusMPa:number;jointComplianceMmPerMPa:number}}
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)
const exact=(v:Record<string,unknown>,keys:string[])=>Object.keys(v).sort().join()===keys.sort().join()
const n=(v:unknown,a:number,b:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=a&&v<=b
export function readGroundPocketSettings(v:unknown):GroundPocketSettings{
 if(!object(v)||!exact(v,['schema','id','execution','settings'])||v.schema!=='str-ground-pocket-settings/1'||v.id!=='STR/HAD/known-ground-stock'||(v.execution!=='deferred'&&v.execution!=='compute')||!object(v.settings))throw Error('Explicit versioned ground-pocket controls required')
 const s=v.settings
 if(!exact(s,['enabled','platePitchMm','contactPitchMm','plateLaw','mineralModulusMPa','jointComplianceMmPerMPa'])||typeof s.enabled!=='boolean'||!n(s.platePitchMm,100,500)||!n(s.contactPitchMm,50,500)||!n(s.mineralModulusMPa,10,100000)||!n(s.jointComplianceMmPerMPa,.001,10)||!object(s.plateLaw))throw Error('Explicit bounded ground plate/contact comparison required')
 const p=s.plateLaw
 if(!exact(p,['elasticModulusMPa','poissonRatio','flexuralFactor','shearFactor'])||!n(p.elasticModulusMPa,1000,100000)||!n(p.poissonRatio,0,.49)||!n(p.flexuralFactor,.05,1)||!n(p.shearFactor,.05,1))throw Error('Explicit unqualified ground plate law required')
 return structuredClone(v) as GroundPocketSettings
}
