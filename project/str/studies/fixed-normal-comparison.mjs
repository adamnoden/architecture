/** Existing signed cut/head screens on explicit, source-bound experiments. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {basename,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {compareFloorSectionCuts,recoverFloorSectionCuts} from '../../../compiler/reference-house/current-design/structural-floor-cuts.ts';
const root=fileURLToPath(new URL('../../../',import.meta.url)),directory=process.argv[2];
if(!directory)throw Error('Explicit completed experimental capture directory required');
const read=p=>JSON.parse(readFileSync(p,'utf8')),sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const settings=read(join(root,'project/str/studies/fixed-normal-experiment-inputs.json'));
const authored=read(join(root,'project/str/studies/floor-section-cuts-inputs.json'));
assert.deepEqual(settings.stabilityComparison,authored.stabilityComparison);
const captures=[500,250].map(p=>{
 const path=join(directory,`v${p}.full.json`),receipt=read(join(directory,`v${p}.receipt.json`)),value=read(path);
 assert.equal(sha(path),receipt.fullSHA256);
 assert.equal(value.schema,'str-fixed-normal-experiment/1');
 assert.equal(value.ordinaryNativeAdmissionApplicable,false);
 assert.equal(value.candidateAccepted,false);
 assert.equal(value.response.schema,'str-fixed-normal-experimental-floor/1');
 assert.deepEqual(value.methodSourceSHA256,receipt.methodSourceSHA256);
 for(const[path,hash]of Object.entries(value.methodSourceSHA256))assert.equal(sha(join(root,path)),hash,'Stale experimental method '+path);
 assert.deepEqual(value.executedInput.settings,settings);
 return {path,fullSHA256:receipt.fullSHA256,value};
});
const [coarse,fine]=captures.map(c=>c.value);
assert.deepEqual(coarse.methodSourceSHA256,fine.methodSourceSHA256);
assert.equal(coarse.fixedNormalLedgerSHA256,fine.fixedNormalLedgerSHA256,'Normal rule changed');
assert.equal(coarse.physicalBodyLedgerSHA256,fine.physicalBodyLedgerSHA256,'Direct nodal body G changed');
assert.deepEqual(coarse.physicalBodyLedger,fine.physicalBodyLedger);
assert.deepEqual(coarse.executedInput.runtime,fine.executedInput.runtime);
const request=structuredClone(fine.executedInput.nativeRequest);
assert.equal(request.bearingCase.masonryCase.verticalCase.maxPitchMm,250);
request.bearingCase.masonryCase.verticalCase.maxPitchMm=500;
assert.deepEqual(request,coarse.executedInput.nativeRequest,'More than vertical pitch changed');
const controls=captures.map(c=>({pitchMm:c.value.executedInput.nativeRequest.bearingCase.masonryCase.verticalCase.maxPitchMm,
 heads:c.value.response.nativeVertical.native.heads,
 sectionCuts:recoverFloorSectionCuts(c.value.response.plateBending,authored.cuts)}));
const processingSources=['project/str/studies/fixed-normal-comparison.mjs','compiler/reference-house/current-design/structural-floor-cuts.ts','project/str/studies/floor-section-cuts-inputs.json'];
const result={schema:'str-fixed-normal-comparison/1',processingSourceSHA256:Object.fromEntries(processingSources.map(p=>[p,sha(join(root,p))])),
 methodSourceSHA256:coarse.methodSourceSHA256,captures:captures.map(({path,fullSHA256})=>({file:basename(path),fullSHA256})),
 fixedNormalLedgerSHA256:coarse.fixedNormalLedgerSHA256,physicalBodyLedgerSHA256:coarse.physicalBodyLedgerSHA256,controls,
 fixedNormal500To250:compareFloorSectionCuts(controls[0],controls[1],authored.stabilityComparison),
 retainedOrdinary500ToCommonStation500:compareFloorSectionCuts(settings.ordinary500Control,controls[0],authored.stabilityComparison),
 completeHouseProof:false,physicalJointAccepted:false,candidateAccepted:false,
 scope:'Actual coupled numerical experiment with fixed physical normal points, ground maps and direct body G. Common-station sensitivity is separately measured against the retained ordinary500 control. Existing signed cuts and unchanged thresholds; no local joint, material, reinforcement or house adoption.'};
const serialized=JSON.stringify(result,null,2)+'\n';
if(process.argv.includes('--check'))assert.equal(readFileSync(join(directory,'comparison.json'),'utf8'),serialized,'Stale actual experiment comparison');
else writeFileSync(join(directory,'comparison.json'),serialized);
console.log(JSON.stringify({fixedNormal500To250:result.fixedNormal500To250,retainedOrdinary500ToCommonStation500:result.retainedOrdinary500ToCommonStation500}));
