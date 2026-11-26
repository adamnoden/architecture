import assert from 'node:assert/strict'
import test from 'node:test'
import {readFileSync} from 'node:fs'
import {readEngineeringEditDocument} from './current-design/engineering-edit.js'
import {readLightingComponents,compileStudyLighting} from './current-design/assemblies/study-lighting.js'
import {resolveCurrentDesign} from './current-design/resolve.js'
import { execFileSync } from 'node:child_process'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { readStudyRoomKitReferenceCase } from './current-design/assemblies/study-room-kit.js'
import { drawStudyRoomPerspective,studyNorthLightingCamera } from './current-design/assemblies/study-room-perspective.js'

const compiler=prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
const choices={...readStudyRoomKitReferenceCase(),wearingFace:'oak' as const,finishDepthMm:15 as const,
  installedServices:'wall-hung-candidate' as const,frameFootClearanceMm:5 as const}

test('matched eye-level views use actual occupied room and retain appearance-only boundaries',async()=>{
  const room=await compiler.studyRoomKit(choices),{day,evening}=room.eyeLevel
  assert.deepEqual(day.camera,evening.camera)
  assert.equal(day.camera.eyeMm[2],1550)
  assert.equal(day.source.bindingDigest,room.kit.source.bindingDigest)
  assert.equal(day.source.assemblyInputDigest,room.roomAssembly.source.inputDigest)
  assert.equal(day.source.roomKitCaseDigest,room.kit.caseDigest)
  assert.match(day.svg,/south window at X2100 mm/)
  assert.match(day.svg,/99 wall faces · 144 floor pieces/)
  assert.match(day.svg,/data-source-id="GROUND\/south-window-0\/glass"/)
  assert.match(day.svg,/data-source-id="GROUND\/west-window-0\/glass"/)
  assert.match(day.svg,/No daylight, electric-light or material performance is simulated/)
  assert.match(evening.svg,/Evening palette only: no lamp output, circuit, illuminance or glare result/)
  assert.notEqual(day.sceneDigest,evening.sceneDigest)
  assert.ok(!day.svg.includes('NaN')&&!day.svg.includes('Infinity'))
  assert.ok(day.svg.includes('&quot;ownerAcceptance&quot;:false'))
})

test('actual opening and panel edits propagate through the same room while floor and other wall controls stay unchanged',async()=>{
  const base=await compiler.studyRoomKit(choices)
  const moved=await compiler.studyRoomKit({...choices,opening:{id:base.kit.opening.id,hostId:base.kit.opening.hostId,occupiedCentreMm:2120}})
  assert.notEqual(moved.eyeLevel.day.sceneDigest,base.eyeLevel.day.sceneDigest)
  assert.match(moved.eyeLevel.day.svg,/south window at X2120 mm/)
  assert.deepEqual(moved.kit.floor.parts,base.kit.floor.parts)
  assert.deepEqual(moved.roomAssembly.walls.find(w=>w.id==='west'),base.roomAssembly.walls.find(w=>w.id==='west'))
  const wider=await compiler.studyRoomKit({...choices,wallPanelWidthMm:450})
  assert.notEqual(wider.eyeLevel.day.svg,base.eyeLevel.day.svg)
  assert.notEqual(wider.roomAssembly.schedule.movingFaceCount,base.roomAssembly.schedule.movingFaceCount)
  assert.deepEqual(wider.kit.floor.parts,base.kit.floor.parts)
  assert.deepEqual(wider.kit.opening,base.kit.opening)
  assert.deepEqual(wider.eyeLevel.day.camera,base.eyeLevel.day.camera)
  assert.equal(base.eyeLevel.day.source.roomKitCaseDigest,base.kit.caseDigest)
})

test('missing geometry and mixed source identities reject rather than drawing a historical room',async()=>{
  const base=await compiler.studyRoomKit(choices)
  const bad=structuredClone(base.roomAssembly);bad.source.bindingDigest='old room'
  assert.throws(()=>drawStudyRoomPerspective(base.kit,bad,base.wallTransition),/MIXED_ROOM_SOURCE/)
  const missing=structuredClone(base.kit)
  delete (missing.wall.boundRoomOpenings[0] as unknown as Record<string,unknown>).spring
  assert.throws(()=>drawStudyRoomPerspective(missing,base.roomAssembly,base.wallTransition),/MISSING_WINDOW_SPRING/)
  assert.throws(()=>drawStudyRoomPerspective(base.kit,base.roomAssembly,base.wallTransition,'night' as 'day'),/TONE_UNSUPPORTED/)
})

test('ordinary source producer retains the same inspected views',()=>{
  execFileSync(process.execPath,['--import','tsx','project/ias/studies/crafted-study-eye-level.mjs','--check'],{
    cwd:new URL('../../',import.meta.url),stdio:'pipe',timeout:30000,
  })
})

test('north owner view shows the actual plug, clips and fitting and rejects obsolete source cases',async()=>{
 const doc=readEngineeringEditDocument(JSON.parse(readFileSync(new URL('../../project/ccr/studies/working-house-comparison.json',import.meta.url),'utf8')))
 assert.ok(doc.stages.studyRoomKit&&doc.stages.distributedFloor&&doc.stages.studyLighting)
 const current=prepareCurrentDesignCompile(doc.design),room=await current.studyRoomKit({schema:'ias-study-room-kit-case/1',units:'mm',...doc.stages.studyRoomKit},doc.stages.distributedFloor)
 const lighting=await current.studyLighting({schema:'ias-study-lighting-case/1',units:'mm',...doc.stages.studyLighting},room)
 const camera=studyNorthLightingCamera(room.kit,lighting.lighting),options={lighting:lighting.lighting,camera}
 const north=drawStudyRoomPerspective(room.kit,room.roomAssembly,room.wallTransition,'day',options)
 assert.equal(north.source.lightingCaseDigest,lighting.lighting.caseDigest)
 assert.ok(camera.targetMm[1]>camera.eyeMm[1])
 for(const marker of ['Type80W1/90mm-wall-plate','Type80W1/actual-flex/','lighting-outlet-plug-space-witness','lead-guide/0','lead-guide/1','north-junction-detail','upper bay elevation'])assert.ok(north.svg.includes(marker),marker)
 assert.match(north.svg,/fullArticulationQualified&quot;:false/)
 assert.match(north.svg,/doorLeafAndHeadProfileQualified&quot;:false/)
 assert.ok(!north.svg.includes('NaN')&&!north.svg.includes('Infinity'))
 const old=structuredClone(lighting.lighting);old.source.roomKitCaseDigest='obsolete'
 assert.throws(()=>drawStudyRoomPerspective(room.kit,room.roomAssembly,room.wallTransition,'day',{...options,lighting:old}),/MIXED_CASE/)
 const changed=readLightingComponents();changed.circuitDesign={...changed.circuitDesign,appliancePreparation:{...changed.circuitDesign.appliancePreparation,carryOffsetMm:350}}
 const rejected=compileStudyLighting(resolveCurrentDesign(doc.design),{schema:'ias-study-lighting-case/1',units:'mm',...doc.stages.studyLighting},room,changed)
 assert.throws(()=>drawStudyRoomPerspective(room.kit,room.roomAssembly,room.wallTransition,'day',{...options,lighting:rejected}),/REJECTED_INSTALLATION/)
 assert.deepEqual(rejected.commonRoom.floorFaces,lighting.lighting.commonRoom.floorFaces)
})
