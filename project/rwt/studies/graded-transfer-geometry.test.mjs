import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {geometry,render,renderCanopy} from './graded-transfer-geometry.mjs';

test('actual channel walls, flanges and plain cover are included in the candidate',()=>{
 const o=geometry();
 assert.equal(o.selectedGeometryChanged,false);
 const last=o.sections.at(-1);
 assert.deepEqual(last.channels.map(c=>c.wetY),[[6605,6945],[6980,7195]]);
 assert.equal(last.channels[1].wetY[0]-last.channels[0].wetY[1]-23,12);
 for(let i=0;i<o.sections.length;i++){
  assert(o.sections[i].bankHeight>=85&&o.sections[i].bankHeight<=100);
  assert(o.sections[i].bed+o.sections[i].bankHeight<=-65);
  if(i)assert(o.sections[i].bed<o.sections[i-1].bed);
 }
 assert.equal(o.construction.stationsX[1],6430,'Chute joints must follow actual305 cover columns');
 assert(o.construction.sequence.some(s=>s.includes('Keep the column OPEN')));
 assert(o.construction.topRelease.includes('OVERlap'));
 assert.equal(o.construction.terminalLanding.minimumSheetUndersideGap,3.5);
});

test('light panels use a retained indexed path and a real stability/load budget',()=>{
 const o=geometry(),m=o.manualRetrieval;
 assert.equal(o.panels.length,10);
 assert(o.panels.every(p=>p.massHypothesisKg<3.1));
 assert(o.panels.every(p=>p.minimumForwardAlongPath>=450&&p.maximumRearTopAlongPath<1970));
 assert(o.panels.every(p=>p.tool.minimumOverlapMm>=300));
 assert(o.panels.every(p=>p.tool.elasticTipDeflectionMm<40));
 assert(m.base.ballast.restoringMomentNm>1.5*Math.max(...o.panels.map(p=>p.tool.factoredGuideMomentNm)));
 assert(o.panels.every(p=>p.matchedSeatZ>=590&&p.matchedSeatZ<=660));
 assert(m.weatherEntry.operation.includes('Outer')||m.weatherEntry.operation.includes('outer'));
});

test('canopy route pays for a real swept elbow, frame interruption and combined receiving duty',()=>{
 const p=geometry().temporaryCanopyDrain;
 assert.equal(p.flow.combinedLps,4.43895);
 assert(p.flow.cleanRectangularSensitivityLps.find(c=>c.n===.025).at75DepthLps>p.flow.combinedLps);
 assert.equal(p.northTurn.grossOuterRadius,75+150+1.5);
 assert(p.northTurn.plan[2]>200,'A153-square box cannot contain the declared75-inside-radius elbow');
 assert(p.flashedChase.frameBypass.topWithMetalCap<p.tieUnderside);
 assert(p.supports.addedNorthPost.footBounds[1]>12650);
 assert(p.northTurn.header[0][2]>p.northTurn.header[1][2]&&p.northTurn.header[1][2]>p.northTurn.terminal[2]);
 assert.equal(p.admitted,false);
});

test('both actual inspection sheets reproduce from the unadopted geometry',()=>{
 const o=geometry();
 for(const [path,value]of [
  ['graded-transfer-geometry.json',JSON.stringify(o,null,2)+'\n'],
  ['graded-transfer-geometry.svg',render(o)],['graded-transfer-canopy.svg',renderCanopy(o)]
 ])assert.equal(fs.readFileSync('project/rwt/studies/'+path,'utf8'),value);
});
