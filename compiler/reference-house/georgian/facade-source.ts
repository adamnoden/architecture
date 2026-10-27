import {design as previous,openings} from './source.js'
export {openings}
/** Owner-approved exterior successor. Ground/first plan geography is held. */
export const design={...previous,id:'RH-GEORGIAN-SIMPLE-ROOF-02',roof:{...previous.roof,kind:'single-pitch-outward-ring',upperPitchDeg:25,minimumPitchDeg:25,dormerAxes:[] as number[],roofAccess:'No roof openings; external maintenance access unresolved'},facade:{sash:'six-over-six',frameFace:60,sillProjection:80,headHeight:120,corniceDepth:180,plinthHeight:150,externalGround:-150,entranceLanding:0,doorSurround:150,fanlightHeight:550},atticUse:'Low storage only; full-height attic stair withdrawn; hatch access unresolved'}
export const roofHeight=(distance:number)=>design.roof.eaves+distance*Math.tan(design.roof.upperPitchDeg*Math.PI/180)
export const roofTop=()=>roofHeight(design.court.x)
