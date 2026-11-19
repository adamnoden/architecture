import {load} from 'js-yaml'
import {readFileSync,readdirSync} from 'node:fs'
import {pathToFileURL} from 'node:url'

/** Syntax and basic execution shape only; GitHub validates its full workflow schema. */
export function validateWorkflowSource(source,name='workflow') {
 const value=load(source,{filename:name})
 if(!value||typeof value!=='object'||!value.on||!value.jobs||typeof value.jobs!=='object')throw Error(`${name}: workflow needs on and jobs`)
 for(const [id,job] of Object.entries(value.jobs)) {
  if(!job||typeof job!=='object')throw Error(`${name}: invalid job ${id}`)
  if(typeof job.uses==='string') {
   if(job.steps)throw Error(`${name}: reusable job ${id} cannot also contain steps`)
  } else {
   if(!Array.isArray(job.steps)||!job.steps.length)throw Error(`${name}: job ${id} needs steps or reusable workflow`)
   for(const step of job.steps) {
    if(!step||typeof step!=='object'||Number(typeof step.run==='string')+Number(typeof step.uses==='string')!==1)throw Error(`${name}: each step needs exactly one run or uses`)
   }
  }
 }
 return value
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
 const files=readdirSync('.github/workflows').filter(p=>/\.ya?ml$/.test(p)).map(p=>'.github/workflows/'+p)
 files.push('project/control/runtime-operations-workflow.yml')
 for(const file of files)validateWorkflowSource(readFileSync(file,'utf8'),file)
 console.log(`Workflow syntax and execution shape valid: ${files.length} definitions. Full GitHub schema and native event checks remain necessary.`)
}
