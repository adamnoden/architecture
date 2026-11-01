import {execFileSync} from 'node:child_process'
import {appendFileSync} from 'node:fs'
import {pathToFileURL} from 'node:url'

// Deliberately narrow: unknown paths, renamed inputs and shared dependency changes run proofs.
const metaPath=p=>p==='AGENTS.md'||p.startsWith('project/control/')||p.startsWith('project/pco/')||['scripts/project-claims.ts','scripts/control-operations.ts','scripts/swarm-run.ts'].includes(p)
const controlScript=name=>/^control:/.test(name)||name==='swarm:run'
const compilerReviewOnly=p=>/^compiler\/(?:architectural-drawing|reference-house|publication-drawing-v2)\/(?:.*\/)?(?:[^/]+\.test\.ts|README\.md)$/.test(p)
export function selectProofScope(paths,before,after,{compilerReview=false}={}){
 if(!paths.length)return {run:true,reason:'No reliable changed-file set; run proofs'}
 for(const path of paths){
  if(path==='package.json'){
   try{
    const a=JSON.parse(before),b=JSON.parse(after),as=a.scripts??{},bs=b.scripts??{}
    delete a.scripts;delete b.scripts
    if(JSON.stringify(a)!==JSON.stringify(b))return {run:true,reason:'Package configuration or dependencies changed'}
    const changed=[...new Set([...Object.keys(as),...Object.keys(bs)])].filter(k=>as[k]!==bs[k])
    if(changed.some(k=>!controlScript(k)))return {run:true,reason:'A non-control npm command changed'}
   }catch{return {run:true,reason:'Cannot compare package.json safely'}}
  }else if(!metaPath(path)&&!(compilerReview&&compilerReviewOnly(path)))return {run:true,reason:`Shared, proof or unknown input changed: ${path}`}
 }
 return {run:false,reason:compilerReview?'Only coordination or opted-in compiler tests/READMEs changed; full repository health remains mandatory':'Only coordination sources and control npm commands changed; full repository health remains mandatory'}
}
function main(){
 let result={run:true,reason:'Manual/non-PR invocation always runs proofs'}
 if(process.env.GITHUB_EVENT_NAME==='pull_request'){
  try{
   const base=process.env.SCOPE_BASE,head=process.env.SCOPE_HEAD
   if(!/^[a-f0-9]{40}$/.test(base??'')||!/^[a-f0-9]{40}$/.test(head??''))throw Error('Missing immutable PR refs')
   const git=args=>execFileSync('git',args,{encoding:'utf8',timeout:30000})
   // --no-renames emits both the deleted old and added new path; never hide a moved proof input.
   const paths=git(['diff','--no-renames','--name-only','-z',`${base}...${head}`]).split('\0').filter(Boolean)
   const pkg=ref=>git(['show',`${ref}:package.json`])
   result=selectProofScope(paths,pkg(base),pkg(head),{compilerReview:process.env.SCOPE_COMPILER_REVIEW==='true'})
  }catch(e){result={run:true,reason:`Scope unavailable; conservatively run proofs: ${String(e)}`}}
 }
 console.log(JSON.stringify(result))
 if(process.env.GITHUB_OUTPUT)appendFileSync(process.env.GITHUB_OUTPUT,`run=${result.run}\n`)
 if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,`### Specialised proof selection\n\n${result.run?'Run':'Skip'}: ${result.reason.replace(/[\r\n]/g,' ')}\n`)
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main()
