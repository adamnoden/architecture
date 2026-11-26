/** Proof-only extraction through the exact existing saved compiler case chain. */
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {prepareCurrentDesignCompile} from '../../../compiler/reference-house/current-design/compile.js'
import {readEngineeringDocumentIdentity} from '../../../compiler/reference-house/current-design/engineering-document.js'
import {savedMasonryFrameCase} from '../../../compiler/reference-house/current-design/structural-masonry-frame.js'
import {savedUpperRoofBearingCase} from '../../../compiler/reference-house/current-design/structural-upper-bearing.js'
import {savedFloorSectionCase} from '../../../compiler/reference-house/current-design/structural-floor-section.js'
import {readCurrentFiniteJointSettings} from '../../../compiler/reference-house/current-design/structural-current-finite-joint-settings.js'
import {readRearBearingSettings} from '../../../compiler/reference-house/current-design/structural-rear-bearing.js'

const bytes=readFileSync(process.argv[2]!),document=JSON.parse(bytes.toString('utf8'))
const documentIdentity=readEngineeringDocumentIdentity(document)
const compile=prepareCurrentDesignCompile(document.design),stages=document.stages
const distributed:any=await compile.readDistributedFloorCase()
const {edits,...authored}=stages.distributedFloor
const sharedDistributed={...distributed.floor.comparison,...authored,
 componentCase:{...distributed.floor.comparison.componentCase,edits:edits??distributed.floor.comparison.componentCase.edits}}
const masonry:any=await compile.readMasonryFrameCase()
const sharedMasonry=savedMasonryFrameCase(masonry.masonry,stages.masonryFrame,sharedDistributed)
const upper:any=await compile.readUpperRoofBearingCase()
const sharedUpper=savedUpperRoofBearingCase(upper.bearing,stages.upperRoofBearing,sharedMasonry)
const floor:any=await compile.readFloorSectionCase()
const saved=savedFloorSectionCase(floor.section,stages.floorSection,sharedUpper)
const finite=readCurrentFiniteJointSettings(stages.floorSection.finiteJointComparison)
const choices=stages.floorSection.rearBearingComparison===undefined?null:readRearBearingSettings(stages.floorSection.rearBearingComparison)
console.log(JSON.stringify({schema:'str-rear-saved-case-request-proof/1',documentIdentity,
 documentSHA256:createHash('sha256').update(bytes).digest('hex'),nativeCase:saved.comparison,
 finiteSettings:{enabled:finite.enabled,youngMPa:finite.youngMPa,solidPitchMm:finite.solidPitchMm},choices,
 scope:'Pure shared saved-case extraction; no model solve, force, strength or architectural acceptance.'}))
