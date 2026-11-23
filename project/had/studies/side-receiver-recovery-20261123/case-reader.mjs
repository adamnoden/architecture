/** Frozen experimental source admission; this is not a current-house consumer. */
import{readFileSync}from'node:fs'
import{createHash}from'node:crypto'
const sha=bytes=>createHash('sha256').update(bytes).digest('hex'),blob=bytes=>createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')
export const authored=JSON.parse(readFileSync(new URL('case.json',import.meta.url),'utf8'))
if(authored.schema!=='had-side-receiver-recovery-case/1')throw Error('Unsupported recovery case schema')
const sourceBytes=readFileSync('project/had/studies/inlet-source-envelope.results.json')
if(sha(sourceBytes)!==authored.sourceReceiptSHA256)throw Error('Unsupported changed inlet receipt: deliberately regenerate recovery')
export const source=JSON.parse(sourceBytes)
if(source.source.bindingDigest!==authored.sourceBindingDigest||source.source.planDigest!==authored.sourcePlanDigest)throw Error('Unsupported changed inlet source identity')
for(const [path,expected]of Object.entries({...source.source.inputs,...source.source.methods}))if(blob(readFileSync(path))!==expected)throw Error('Unsupported changed owning source: '+path)
for(const [path,expected]of Object.entries(authored.nativeSources))if(sha(readFileSync(path))!==expected)throw Error('Unsupported changed native source: '+path)
for(const [path,expected]of Object.entries(authored.kernelCopies))if(sha(readFileSync(new URL(path,import.meta.url)))!==expected)throw Error('Unsupported changed recovery kernel: '+path)
if(JSON.stringify(authored.materialComparison)!==JSON.stringify({elasticModulusMPa:200000,poissonRatio:.3,densityKgM3:8000,proofMPa:200,proofDivisor:1.5}))throw Error('Unsupported changed native material law')
if(source.joinedDirection.room.indoorCuts.groundStage.fflMm!==0)throw Error('Prototype has no raised-ground structural admission')
