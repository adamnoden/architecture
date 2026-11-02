/** Run both prior negative controls and the separate source-bound 70° challenger. */
import {execFileSync} from 'node:child_process';
const root=new URL('../../../',import.meta.url);
const checks=[['north-export-occurrence.mjs','--check'],['north-export-oem-kinematics.mjs'],['north-export-oem70-ordinary.mjs'],['north-export-oem70-fold.mjs'],['north-export-oem70-takeover.mjs'],['north-export-oem70-clips.mjs'],['north-export-oem70-transition.mjs'],['north-export-oem70-withdrawal.mjs']];
for(const [file,...args] of checks){execFileSync(process.execPath,['project/oas/studies/'+file,...args],{cwd:root,stdio:'pipe'});console.log('PASS '+file);}
console.log('Conditional geometric proxy checks only; no OEM matching, temporary-equipment or physical acceptance.');
