import {readFileSync,writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
import {layoutRevision} from '../../../compiler/reference-house/georgian/layout-revision.js'

export const buildNearLevelWindow = function buildWindow(d){
 const fail=what=>{throw Error("Reappraise accepted current-house source: "+what)};
 const equal=(got,want,name)=>{if(Math.abs(got-want)>1e-8)fail(name)};
 if(d.id!=="RH-LAYOUT-REVISION-02")fail("identity");
 equal(d.shell,12000,"shell");equal(d.court.width,3500,"court width");
 equal(d.court.y+d.court.depth,7750,"court north face");
 equal(d.levels.ground,0,"ground FFL");equal(d.envelope,417.5,"envelope");
 const courtFall=d.court.width/2*0.02;
 const crossingLength=d.shell-(d.court.y+d.court.depth);
 equal(courtFall,35,"court fall");equal(crossingLength,4250,"crossing");
 const lowSupport=60, paver=20, pad=6, grade=-150, sourceFFL=d.levels.ground,available=sourceFFL-grade;
 const test=(key,label,perimeterDepth,slope,inletDrop,receiverClearance,status)=>{
  const crossFall=crossingLength*slope,panLowDepth=perimeterDepth+courtFall;
  const outletInvert=sourceFFL-panLowDepth-inletDrop-crossFall;
  const freeOutletD=panLowDepth+inletDrop+crossFall+receiverClearance;
  const shortfall=Math.max(0,freeOutletD-available),surplus=available-freeOutletD;
  return {key,label,perimeterDepth,panLowDepth,crossingSlope:slope,crossingFall:crossFall,inletDrop,receiverClearance,syntheticExteriorGrade:grade,illustrativeOutletInvert:outletInvert,minimumRelativeFloorAboveReceiver:freeOutletD,additionalRelativeRiseNeeded:shortfall,nominalSurplus:surplus,status};
 };
 const comparisons=[
  test("inherited","Inherited deep-pan geometry",180,0.01,10,25,"Fails illustrative free-outlet geometry; retained only as adverse comparator"),
  test("min-pedestal","20+6+60 mm support family",paver+pad+lowSupport,0.01,10,25,"Shortfall under tested configuration; does not prove all gravity infeasible"),
  test("half-fall","Same pan / 0.5% crossing",paver+pad+lowSupport,0.005,10,25,"Smaller level shortfall; channel capacity and silt/cleaning not checked"),
  test("slim","20 mm unsupported low-support idea",paver+pad+20,0.01,10,25,"Unmatched slim support; no floor/threshold/cover load proof"),
  test("no-reserve","Zero-drop, zero-clearance diagnostic",paver+pad+lowSupport,0.005,0,0,"Mathematical sensitivity only; no real safety or insertion allowance")
 ];
 const crest=-75,effall=crossingLength*0.01;
 const emergency={trialCrest:crest,crossingFall:effall,geometricExit:crest-effall,syntheticReceivingGrade:grade,nominalDifference:crest-effall-grade,illustrativeClearance:25,geometricSurplusAboveIllustrativeClearance:crest-effall-grade-25,operatingLevel:"unknown",firstSusceptibleInterface:"unknown",assignedFaultFlow:"unproven",independentReceiver:"unproven"};

 const compact=comparisons.find(c=>c.key==="min-pedestal");
 // A gravity free-outfall fall budget is not a buildable passage: the carrier crown
 // must also clear a retained load/finish/thermal cover in the *same* floor section.
 // This necessary test applies only to a non-rising carrier beneath such a cover.
 const collectorInvertDepth=compact.panLowDepth+compact.inletDrop;
 const maxInvertDepthAtSchematicGrade=available-compact.crossingFall-compact.receiverClearance;
 const carrierCoverTrials=[
  ["small",60,40],
  ["medium",80,80],
  ["large",120,100]
 ].map(([key,carrierHeight,retainedCover])=>{
  const structuralInvertDepth=carrierHeight+retainedCover;
  const controllingInvertDepth=Math.max(collectorInvertDepth,structuralInvertDepth);
  const requiredRelativeHeight=controllingInvertDepth+compact.crossingFall+compact.receiverClearance;
  return {key,carrierHeight,retainedCover,structuralInvertDepth,controllingInvertDepth,requiredRelativeHeight,additionalRelativeRiseNeeded:Math.max(0,requiredRelativeHeight-available),controls:structuralInvertDepth>collectorInvertDepth?"physical envelope":"collector",evidence:"Hypothetical dimensions, not a specified channel, bearer, floor or capacity"};
 });
 const portalPinch={
  scope:"One monotone free-outfall carrier with its crown below a retained cover, both measured from the same FFL. Necessary geometric trial only; not structural sizing or a two-route solution.",
  inequality:"D >= max(P + courtFall + J, H_carrier + T_cover) + L * S + K",
  receiverKind:"synthetic grade only; not observed high water",
  compactCollectorInvertDepth:collectorInvertDepth,
  maxAllowedInletInvertDepthAtSchematicGrade:maxInvertDepthAtSchematicGrade,
  crossingFall:compact.crossingFall,
  receiverClearance:compact.receiverClearance,
  availableRelativeHeight:available,
  carrierCoverTrials,
  limitations:["No nominated full-flow N or E dimensions","Cover/bearing and all removable interfaces not designed","Not applicable to an elevated/side-exiting passage without re-deriving the physical section","No hydraulic, debris, first-harm or site acceptance"]
 };
 const output={basis:d.id,scope:"Geometric sensitivity only. Does not qualify a storm, capacity, overflow, high tailwater, floor, opening, structure, drainage product or site.",source:{shell:d.shell,courtWidth:d.court.width,halfCourt:d.court.width/2,courtFall,courtFallSlope:0.02,crossingLength,groundFFL:sourceFFL,syntheticExteriorGrade:grade,relativeFloorToSyntheticGrade:available,paver,pad,minimumSupportComparator:lowSupport,provenance:["compiler/reference-house/georgian/layout-revision.ts","project/triad-interface-contract.md","project/had/had-03-court-levels.md"]},comparisons,emergency,portalPinch};
 const x0=146,scale=0.68,y0=76,dy=29.5,axis=x0+available*scale;
 const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
 const t=(x,y,value,size=3.2,weight="normal",color="#263338")=>`<text x="${x}" y="${y}" font-size="${size}" font-family="DejaVu Sans,Arial,sans-serif" font-weight="${weight}" fill="${color}">${esc(value)}</text>`;
 const l=(x,y,x2,y2,clr="#5b696c",w=.35,dash)=>`<path d="M${x} ${y}L${x2} ${y2}" fill="none" stroke="${clr}" stroke-width="${w}" ${dash?`stroke-dasharray="${dash}"`:""}/>`;
 const b=(x,y,w,h,fill,stroke="#5c6664")=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width=".25"/>`;
 const bits=[`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" role="img" aria-labelledby="title desc"><title id="title">Courtyard shallow gravity exit: relative grade sensitivity</title><desc id="desc">Five source-bound pan and crossing scenarios compared with the current 150 mm schematic difference between floor and exterior grade. Shortfalls are geometry only; actual drainage remains unproved.</desc><rect width="420" height="297" fill="#fffdf8"/>`];
 bits.push(t(15,18,"HAD / Courtyard water: the near-level gravity window",5.2,"bold"));
 bits.push(t(15,27,"Source-bound level screen, NOT a drain or section acceptance. Synthetic receiving water at −150 mm.",3));
 bits.push(l(15,35,405,35));
 bits.push(t(15,45,"Total depth budget = perimeter pan depth + 35 court fall + inlet drop + crossing fall + receiving clearance",2.8));
 bits.push(t(15,53,"D required (mm above synthetic receiver); source D = 150 mm. Change in D must be relative, not shared uplift.",2.8));
 bits.push(l(axis,59,axis,229,"#3c7377",.8,"2 1"));
 bits.push(t(axis-17,61,"D = 150",2.9,"bold","#24676e"));
 comparisons.forEach((a,i)=>{
  const y=y0+i*dy,fill=a.key==="inherited"?"#b3b4b1":a.key==="min-pedestal"?"#839d9b":a.key==="no-reserve"?"#d1d0c8":"#adbfb9";
  bits.push(t(15,y+4,a.label,2.65));
  bits.push(l(x0,y+9,357,y+9,"#adb5b1",.3));
  bits.push(b(x0,y,Math.round(a.minimumRelativeFloorAboveReceiver*scale*10)/10,9,fill));
  bits.push(t((a.minimumRelativeFloorAboveReceiver>270?x0+a.minimumRelativeFloorAboveReceiver*scale-29:x0+a.minimumRelativeFloorAboveReceiver*scale+3),y+6,a.minimumRelativeFloorAboveReceiver.toFixed(2).replace(/\.?0+$/,"")+" mm",2.7,"bold"));
  bits.push(t(357,y+6,a.additionalRelativeRiseNeeded>0?`+${a.additionalRelativeRiseNeeded} rise`:`${Math.round(a.nominalSurplus*10)/10} spare`,2.65,"normal",a.additionalRelativeRiseNeeded>0?"#943e2f":"#466d5a"));
 });
 bits.push(l(15,239,405,239));
 bits.push(t(15,248,"At 1% fall, a 20+6+60 mm pan needs 198.5 mm relative height: 48.5 mm beyond the drawn 150.",3.1,"bold"));
 bits.push(t(15,257,"Nominal E crest at −75, 1% drop → −117.5 outside; 32.5 mm above schematic grade, no flowing-head proof.",2.9));
 bits.push(t(15,268,"Bars omit carrier and cover depth: 48.5 mm is NOT a buildable passage or safe first-harm margin.",2.8));
 bits.push(l(15,276,405,276,"#abb4ae"));
 bits.push(t(15,284,"RH-LAYOUT-REVISION-02 · HAD-03 / RWT-06 · source-bound option reduction · 1 November 2026",2.7));
 bits.push(t(15,291,"No actual site datum, permissible discharge, physical assembly, pump, water volume or safety rating is selected.",2.7));
 bits.push("</svg>\n");
 return {data:output,files:{"court-near-level-window.json":JSON.stringify(output,null,2)+"\n","court-near-level-window.svg":bits.join("")}};
}

function verifyProvenance(){
 const triad=readFileSync(new URL('../../triad-interface-contract.md',import.meta.url),'utf8');
 const levels=readFileSync(new URL('../had-03-court-levels.md',import.meta.url),'utf8');
 if(!triad.includes('general ground −150 mm')||!levels.includes('20 mm paver')||!levels.includes('PLV60'))throw Error('Source comparator/datum changed; reappraise the near-level screen')
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 verifyProvenance()
 const result=buildNearLevelWindow(layoutRevision),check=process.argv.includes('--check')
 for(const [name,content] of Object.entries(result.files)){
  const path=new URL(name,import.meta.url)
  if(check){if(readFileSync(path,'utf8')!==content)throw Error('Stale court near-level output: '+name)}
  else writeFileSync(path,content,'utf8')
 }
 console.log('HAD near-level gravity window '+(check?'verified':'written'))
}
