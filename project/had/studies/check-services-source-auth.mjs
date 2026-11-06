/** Frozen HAD-B evidence: exact Services selection and its prose-only successor. */
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=new URL('../../../',import.meta.url),path='project/had/studies/fixtures/services-9476-prose-successor.json';
const current=readFileSync(new URL(path,root),'utf8');
// Reconstruct the exact MAT9476 selected blob from the authenticated successor.
 // The generator already proves these are the only four narrative changes.
 // Do not use git show: CI's checkout need not contain unrelated historical objects.
let historical=current;
for(const [corrected,selected] of [
 ['Separate from78L/s selected background;','Separate from65L/s background;'],
 ['78L/s selected winterventilation is not cooling','65L/s winterventilation is not cooling']
]){
 if(historical.split(corrected).length-1!==2)throw Error('Historical services correction occurrence drift');
 historical=historical.replaceAll(corrected,selected);
}
const historicalBytes=Buffer.from(historical,'utf8');
const historicBlob=createHash('sha1').update('blob '+historicalBytes.length+'\0').update(historicalBytes).digest('hex');
if(historicBlob!=='e827caa8c6c0cfc23bef0f08b3452f57984875d6')throw Error('Historical MAT9476 Git blob mismatch');
const temp=mkdtempSync(join(tmpdir(),'had-services-auth-'));
const runner=new URL('open-north-loggia.mjs',import.meta.url);
function file(name,contents){const p=join(temp,name);writeFileSync(p,contents);return p}
function run(flag,expected){
 const args=['--import','tsx',runner.pathname,'--check','--require-fit',...(flag?[flag]:[])];
 const r=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',timeout:120000});
 if(expected==='pass'){
  if(r.status!==0)throw Error('Expected HAD source pass: '+r.stderr);
 }else if(r.status===0||!r.stderr.includes(expected))throw Error('Expected rejection '+expected+': '+r.stderr);
}
try{
 run(null,'pass');
 run('--services-contract='+file('selected.json',historical),'pass');
 const corrected='Separate from78L/s selected background;';
 if(current.split(corrected).length-1!==2)throw Error('Current correction count changed');
 run('--services-current='+file('prose.json',current.replace(corrected,'Separate from78L/s altered background;')),'Current canonical services successor blob mismatch');
 const number='"makeupFormedTerritory": 280';
 if(!current.endsWith('\n')||current.split(number).length-1!==2)throw Error('Canonical numeric field/format drift');
 // Change one numeric token in the untouched canonical 2-space/newline file.
 // Re-serialising through JS would otherwise erase Python's intentional 50.0 values.
 const numeric=current.replace(number,'"makeupFormedTerritory": 281');
 run('--services-current='+file('numeric.json',numeric),'Current canonical services successor blob mismatch');
 run('--services-contract='+file('old-mutation.json',historical.replace('Separate from65L/s background;','Separate from64L/s background;')),'contractblob mismatch');
 console.log(JSON.stringify({defaultCurrent:'pass',exactHistoricalOverride:'pass',unknownProse:'rejected',numericMutation:'rejected',historicalOverrideMutation:'rejected',generatedFiles:'unchanged by --check'}));
}finally{rmSync(temp,{recursive:true,force:true})}
