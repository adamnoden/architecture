import { readFileSync, writeFileSync } from 'node:fs'
import { prepareCurrentDesignCompile } from '../../../compiler/reference-house/current-design/compile.js'
import { readEngineeringDocument } from '../../../compiler/reference-house/current-design/engineering-document.js'
import { readEngineeringEditDocument } from '../../../compiler/reference-house/current-design/engineering-edit.js'
import { stableJsonStringify } from '../../../compiler/core/identity.js'
import {drawStudyRoomPerspective,studyNorthLightingCamera} from '../../../compiler/reference-house/current-design/assemblies/study-room-perspective.js'
import { renderDrawingSceneV2Svg } from '../../../compiler/publication-drawing-v2/svg.js'

const check=process.argv.includes('--check')
const sourcePath=new URL('../../ccr/studies/working-house-comparison.json',import.meta.url)
const document=readEngineeringEditDocument(JSON.parse(readFileSync(sourcePath,'utf8')))
// Drawing the current room does not require another full52-head solve. It does
// require the same saved inputs and exact reviewed source/method bindings.
const current=await readEngineeringDocument(document.design)
if(stableJsonStringify(current.bindings)!==stableJsonStringify(document.bindings))throw new Error('Stale working-house document bindings; explicitly review and refresh before regenerating views')
if(!document.stages.studyRoomKit||!document.stages.distributedFloor||!document.stages.studyLighting)throw new Error('Working-house comparison must contain the shared Study and distributed-floor choices')
const compiler=prepareCurrentDesignCompile(document.design)
const room=await compiler.studyRoomKit({schema:'ias-study-room-kit-case/1',units:'mm',...document.stages.studyRoomKit},document.stages.distributedFloor)
const tile=await compiler.studyRoomKit({schema:'ias-study-room-kit-case/1',units:'mm',...document.stages.studyRoomKit,
  wearingFace:'stone-steel',wallFace:'porcelain-steel'},document.stages.distributedFloor)
if(tile.roomAssembly.state==='geometry-rejected')throw new Error('The same working-house mineral finish comparison is unsupported')
const lighting=await compiler.studyLighting({schema:'ias-study-lighting-case/1',units:'mm',...document.stages.studyLighting},room)
const north=drawStudyRoomPerspective(room.kit,room.roomAssembly,room.wallTransition,'day',{lighting:lighting.lighting,camera:studyNorthLightingCamera(room.kit,lighting.lighting)})
const outputs=[['working-study-north-lighting.svg',north.svg],...['day','evening'].map(tone=>[`crafted-study-eye-level-${tone}.svg`,room.eyeLevel[tone].svg]),
  ['working-study-floor.svg',renderDrawingSceneV2Svg(room.plan)],['working-study-wall-kit.svg',room.roomAssemblySvg],
  ['working-study-tile-eye-level.svg',tile.eyeLevel.day.svg]]
for(const[name,content]of outputs){
  if(typeof content!=='string')throw new Error(`Working Study ${name} is unsupported; no historical drawing substituted`)
  const path=new URL(name,import.meta.url)
  if(check){if(readFileSync(path,'utf8')!==content)throw new Error(`Stale working Study ${name}`)}else writeFileSync(path,content)
}
console.log(`${check?'Verified':'Wrote'} matched Study views from working-house-comparison.json; no photometric/owner acceptance claim`)
