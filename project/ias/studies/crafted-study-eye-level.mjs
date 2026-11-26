import { readFileSync, writeFileSync } from 'node:fs'
import { prepareCurrentDesignCompile } from '../../../compiler/reference-house/current-design/compile.js'
import { readGeorgianDesignSnapshot } from '../../../compiler/reference-house/current-design/georgian-source.js'
import { readStudyRoomKitReferenceCase } from '../../../compiler/reference-house/current-design/assemblies/study-room-kit.js'

const check=process.argv.includes('--check')
const compiler=prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
// These are the existing furnished room choices, not a second room/furniture model.
const room=await compiler.studyRoomKit({...readStudyRoomKitReferenceCase(),wearingFace:'oak',finishDepthMm:15,
  installedServices:'wall-hung-candidate',frameFootClearanceMm:5})
for(const tone of ['day','evening']){
  const path=new URL(`crafted-study-eye-level-${tone}.svg`,import.meta.url),content=room.eyeLevel[tone].svg
  if(check){if(readFileSync(path,'utf8')!==content)throw new Error(`Stale eye-level Study ${tone}`)}else writeFileSync(path,content)
}
console.log(`${check?'Verified':'Wrote'} matched current-source eye-level Study views; no photometric/owner acceptance claim`)
