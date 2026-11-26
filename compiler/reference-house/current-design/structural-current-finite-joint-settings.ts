/** Same explicit conventional joint comparison controls in saved CLI/API edits. */
export type CurrentFiniteJointSettings={execution:'deferred'|'compute';enabled:boolean;youngMPa:number;solidPitchMm:number}
export const currentFiniteJointDefaults:CurrentFiniteJointSettings={execution:'deferred',enabled:true,youngMPa:8250,solidPitchMm:250}
export function readCurrentFiniteJointSettings(value:unknown):CurrentFiniteJointSettings{
 const x=value as Record<string,unknown>|null
 if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).length!==4||!['execution','enabled','youngMPa','solidPitchMm'].every(k=>Object.hasOwn(x,k))
  ||!['deferred','compute'].includes(x.execution as string)||typeof x.enabled!=='boolean'||![8250,16500,33000].includes(x.youngMPa as number)||![250,140,100,70].includes(x.solidPitchMm as number))throw new TypeError('Explicit conventional finite-joint comparison controls required; no injected matrices, sources or acceptance')
 return {...x} as CurrentFiniteJointSettings
}
