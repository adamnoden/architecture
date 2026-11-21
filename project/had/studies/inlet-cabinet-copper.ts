import {readFileSync,writeFileSync} from 'node:fs'
import {sha256SemanticFingerprint} from '../../../compiler/core/identity.js'
import {readCurrentDesignResolution} from '../../../compiler/reference-house/current-design/resolve.js'
import {readInletCabinetCase,runInletCabinetCase} from '../../../compiler/reference-house/current-design/inlet-cabinet-copper.js'
const resolution=readCurrentDesignResolution(),request=readInletCabinetCase(resolution),result=runInletCabinetCase(resolution,request.cabinet)
const {reviewSvg,branches,...rest}=result
const summary={...rest,branches:branches.map(({pathMm,thermal,...branch})=>({...branch,formedRoute:{vertices:pathMm.length,digest:sha256SemanticFingerprint(pathMm)},thermal:{schema:thermal.schema,sourceContext:{input:{...thermal.sourceContext.input,pathMm:{vertices:pathMm.length,digest:sha256SemanticFingerprint(pathMm)}},receiver:thermal.sourceContext.receiver},method:thermal.method,
 fixedPointWrench:thermal.fixedPointWrench,guideWrench:thermal.guideWrench,upperTerminalWrench:thermal.upperTerminalWrench,outerTerminalWrench:thermal.outerTerminalWrench,
 fixedPointReceiverMotion:thermal.fixedPointReceiverMotion,guideReceiverMotion:thermal.guideReceiverMotion,compatibilityResidual:thermal.compatibilityResidual,postComplianceSymmetryError:thermal.postComplianceSymmetryError,
 actualTerminalClampFittingAndFloorStiffnessQualified:thermal.actualTerminalClampFittingAndFloorStiffnessQualified,completeInstalledThermalAcceptance:thermal.completeInstalledThermalAcceptance}}))}
const outputs=[['inlet-cabinet-copper.results.json',JSON.stringify(summary,null,2)+'\n'],['inlet-cabinet-copper.svg',reviewSvg+'\n']] as const
for(const [file,text] of outputs){const path=new URL(file,import.meta.url);if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==text)throw new Error('Stale whole-cabinet output: '+file)}else writeFileSync(path,text)}
process.stdout.write(`Copper cabinet: ${result.status}; steel ${result.quantities.knownSteelGrossKg}kg; owner/material and actual receiving/wet proofs remain open.\n`)
