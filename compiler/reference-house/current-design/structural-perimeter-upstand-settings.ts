/** Optional ordinary perimeter comparison; core widths stay in distributedFloor. */
export type PerimeterUpstandSettings = Readonly<{
  schema:'str-perimeter-upstand-settings/1';widthMm:number;depthMm:number;
  wind:'saved'|'zero';execution:'deferred'|'compute'
}>
export function readPerimeterUpstandSettings(input:unknown):PerimeterUpstandSettings{
  if(input===null||typeof input!=='object'||Array.isArray(input))throw Error('Exact perimeter upstand settings required')
  const v=input as Record<string,unknown>
  if(Object.keys(v).sort().join(',')!=='depthMm,execution,schema,widthMm,wind'
    ||v.schema!=='str-perimeter-upstand-settings/1'
    ||typeof v.widthMm!=='number'||!Number.isFinite(v.widthMm)||v.widthMm<200||v.widthMm>300
    ||typeof v.depthMm!=='number'||!Number.isFinite(v.depthMm)||v.depthMm<300||v.depthMm>450
    ||(v.wind!=='saved'&&v.wind!=='zero')||(v.execution!=='deferred'&&v.execution!=='compute'))
    throw Error('Finite bounded actual perimeter section, wind programme and execution required')
  return {...v} as PerimeterUpstandSettings
}
