/** Deliberately limited replay of predecessor dimensions; original unpushed CAD is unavailable. */
import{writeFileSync}from'node:fs'
import{source}from'./case-reader.mjs'
const field=source.joinedDirection.room.indoorCuts.candidateMaintenancePlanMm,feet=[2050,2220].map(y=>({postAxisMm:[11275,y],postDiameterMm:30,footBoxMm:[11290-35,y-60,70,120],footThicknessMm:10})),
 checks=feet.map(f=>{const a=f.footBoxMm,b=field,g=[Math.max(a[0]-b[0]-b[2],b[0]-a[0]-a[2]),Math.max(a[1]-b[1]-b[3],b[1]-a[1]-a[3])],raw=g.some(v=>v>0)?Math.hypot(...g.map(v=>Math.max(v,0))):Math.max(...g);return{...f,maintenanceFieldMm:field,nominalFootFieldGapMm:raw,afterTwo10MmSettings:raw-20}}),
 result={schema:'had-floor-post-pointer-replay/1',source:source.source,provenance:'HAD gen59 recovery pointer; unavailable local CAD9dfe3864. This is only a new centred-Y-foot reconstruction of its stated dimensions, not recovered CAD or its result.',checks,centredFootArrangementWithinRetainedFieldSettings:checks.every(v=>v.afterTwo10MmSettings>=0),actualFloorPadPanDpcAndHeadResistanceQualified:false,originalCadAndFullRouteRecovered:false}
writeFileSync(new URL('floor-pointer.results.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2))
