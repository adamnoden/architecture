/** Thin Node adapter; shared semantics remain in structural-floor-interfaces. */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { recoverNamedFloorCornerInterfaces } from './structural-floor-interfaces.js'

const root=new URL('../../../',import.meta.url)
export const floorInterfaceConsumerPaths=[
  'compiler/reference-house/current-design/structural-floor-interfaces.ts',
  'compiler/reference-house/current-design/structural-floor-interface-adapter.ts',
  'project/str/studies/floor_interface_manifest.py',
] as const
const record=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v)
const sha=(path:string)=>createHash('sha256').update(readFileSync(new URL(path,root))).digest('hex')

/** Reconstruct exact named metadata, then join an already executed native response. */
export function readFloorCornerInterfaceManifest(input:unknown) {
  if(!record(input)||!record(input.sourceSHA256)||!record(input.nativeVertical)||!record(input.nativeVertical.native)
    ||typeof input.nativeVertical.native.caseId!=='string')throw new Error('Executed source-bound native floor response required')
  for(const [path,identity] of Object.entries(input.sourceSHA256)) {
    if(typeof identity!=='string'||!/^[a-f0-9]{64}$/.test(identity)||!/^project\/[A-Za-z0-9/_.-]+$/.test(path)
      ||path.split('/').some(p=>!p||p==='.'||p==='..')||sha(path)!==identity)throw new Error(`Stale or unsupported floor interface native source: ${path}`)
  }
  const methodSourceSHA256=Object.fromEntries(floorInterfaceConsumerPaths.map(path=>[path,sha(path)]))
  const manifest=JSON.parse(execFileSync('python3',['-B',fileURLToPath(new URL(floorInterfaceConsumerPaths[2],root))],{
    input:JSON.stringify({case:input.request,caseId:input.nativeVertical.native.caseId}),encoding:'utf8',maxBuffer:8*1024*1024,
    env:{...process.env,OPENBLAS_NUM_THREADS:'1',OMP_NUM_THREADS:'1'},
  })) as unknown
  if(!record(manifest)||!record(manifest.methodSourceSHA256)||manifest.methodSourceSHA256[floorInterfaceConsumerPaths[2]]!==methodSourceSHA256[floorInterfaceConsumerPaths[2]])throw new Error('Floor interface metadata method changed during execution')
  if(Object.entries(input.sourceSHA256).some(([path,identity])=>sha(path)!==identity))throw new Error('Floor interface native source changed during execution')
  if(floorInterfaceConsumerPaths.some(path=>sha(path)!==methodSourceSHA256[path]))throw new Error('Floor interface recovery method changed during execution')
  return {manifest,methodSourceSHA256,metadataSourceVerified:true as const}
}

export function runFloorCornerInterfaceRecovery(input:unknown) {
  const current=readFloorCornerInterfaceManifest(input)
  return {...recoverNamedFloorCornerInterfaces(input,current.manifest),methodSourceSHA256:current.methodSourceSHA256,metadataSourceVerified:true as const}
}
