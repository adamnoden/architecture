import {readFileSync,writeFileSync} from 'node:fs'
import{createHash}from'node:crypto'
import{compareFixedInletThermalRoute}from'./thermal-experiment.ts'
const {source}=await import('./case-reader.mjs')
const room=source.joinedDirection.room, bank=room.bankReceiver,routes=room.indoorRoutes
const cases=[]
for(const branch of ['utility','plant']){
 const upstream=routes.paths.find(p=>p.id===branch+'/upstream'),downstream=routes.paths.find(p=>p.id===branch+'/downstream'),path=[...upstream.pointsMm,...downstream.pointsMm]
 const lower=bank.receivers.find(v=>v.branch===branch&&v.side==='below').centreMm[2],upper=bank.receivers.find(v=>v.branch===branch&&v.side==='above').centreMm[2]
 for(const model of [{id:'rigid-valve',kT:null,kR:null},{id:'joint-1e6-1e8',kT:1e6,kR:1e8},{id:'joint-1e4-1e6',kT:1e4,kR:1e6},{id:'joint-1e3-1e5',kT:1e3,kR:1e5}]){
  const input={supportAxisXYMm:[room.indoorCuts.authoredChoices.bankXMm,room.indoorCuts.authoredChoices.bankYMm],pathMm:path,fixedPointZMm:lower,guideZMm:upper,temperatureExcursionK:40,pipe:{outerDiameterMm:28,wallMm:1.2,elasticModulusMpa:117200,poissonRatio:.34,expansionMmMK:.017},valve:{facesMm:[upstream.pointsMm.at(-1),downstream.pointsMm[0]],expansionMmMK:.017,translationalNPerMm:model.kT,rotationalNmmPerRad:model.kR}}
  const result=compareFixedInletThermalRoute(input)
  delete result.upperSubroute.uniformTemperature.elasticExtremeFibreStressMpa
  delete result.upperSubroute.uniformTemperature.guideFreeAxialThermalTravelMm
  delete result.upperSubroute.uniformTemperature.guideAxialTravelIncludingElasticMm
  result.upperSubroute.validity.valveAndFactoryFittingStressIncluded=false
  result.experimentalScope='Explicit valve rigidity/joint compliance sensitivities, not an actual-force bound. No copper tube stiffness represents the valve; stress qualification is withheld.'
  if(result.fixedPointMm[0]!==input.supportAxisXYMm[0]||result.fixedPointMm[1]!==input.supportAxisXYMm[1])throw Error('Wrong actual support identity')
  cases.push({branch,model,input,result})
  console.log(JSON.stringify({branch,model:model.id,wrench:result.combinedFixedPointWrench,guide:result.guideWrench}))
 }
}
writeFileSync(new URL('thermal-experiment.results.json',import.meta.url),JSON.stringify({source:source.source,methodSHA256:createHash('sha256').update(readFileSync(new URL('thermal-experiment.ts',import.meta.url))).digest('hex'),nativeMethodSHA256:createHash('sha256').update(readFileSync('compiler/reference-house/current-design/inlet-fixed-thermal.ts')).digest('hex'),cases},null,2)+'\n')
