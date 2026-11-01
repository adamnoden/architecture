import {readFileSync,writeFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {resolve} from 'node:path'
import {layoutRevision,revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js'

export const buildEastEgressPierScan = function buildRoute(d,openings){
 const fail=s=>{throw Error("Reappraise east court escape geometry: "+s)};
 const eq=(a,b,label)=>{if(Math.abs(a-b)>1e-8)fail(label)};
 if(d.id!=="RH-LAYOUT-REVISION-02")fail("source identity");
 eq(d.shell,12000,"shell");eq(d.court.x,4250,"court x");eq(d.court.y,4250,"court y");eq(d.court.width,3500,"court width");eq(d.envelope,417.5,"wall");
 const cs=openings.filter(o=>o.wall==="court-east"&&o.kind==="window").sort((a,b)=>a.centre-b.centre),
 os=openings.filter(o=>o.wall==="outer-east").sort((a,b)=>a.centre-b.centre);
 if(cs.length!==2)fail("court-east windows");
 const plantDoor=os.find(o=>o.kind==="door"&&o.centre===4600),outerUpper=os.find(o=>o.kind==="window"&&o.centre===7400);
 if(!plantDoor||!outerUpper)fail("outer openings");
 eq(cs[0].centre,5150,"court low window");eq(cs[1].centre,6850,"court upper window");eq(cs[0].width,1000,"court width");eq(cs[1].width,1000,"court width");eq(plantDoor.width,1400,"plant-replacement door");eq(outerUpper.width,1000,"outer high window");
 const bound=o=>[o.centre-o.width/2,o.centre+o.width/2];
 const cw=cs.map(bound),door=bound(plantDoor),ow=bound(outerUpper);
 const courtPier=[cw[0][1],cw[1][0]],outerPier=[door[1],ow[0]];
 const courtWindow=cw[1],outerWindow=ow,commonPier=[Math.max(courtPier[0],outerPier[0]),Math.min(courtPier[1],outerPier[1])],commonWindow=[Math.max(courtWindow[0],outerWindow[0]),Math.min(courtWindow[1],outerWindow[1])];
 eq(commonPier[1]-commonPier[0],700,"common structural pier");eq(commonWindow[1]-commonWindow[0],450,"common window projection");
 const room=id=>{const x=d.rooms.GROUND.find(r=>r.id===id);if(!x||x.boxes.length!==1)fail(id);return x.boxes[0]};
 const plant=room("G-PLANT"),pantry=room("G-PANTRY");
 eq(plant.y,2550,"plant location");eq(plant.depth,4100,"plant depth");eq(pantry.y,6650,"pantry location");eq(pantry.depth,1455,"pantry depth");
 const service=d.services;
 for(const k of ["plantDry","plantWorking","riser"])if(!service[k])fail(k);
 const strip=(centre,width=300)=>[centre-width/2,centre+width/2];
 const overlap=(a,b)=>Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0]));
 const rectBand=b=>[b.y,b.y+b.depth];
 const plantRoute=strip(6000),windowRoute=strip(7000),shifted=strip(7125);
 const data={basis:d.id,scope:"UNADOPTED geometric envelope comparison only. Does not select a bore, structural portal, water boundary, equipment layout, room finish or exterior receiver.",source:{shell:d.shell,court:d.court,envelope:d.envelope,courtWindows:cw,plantReplacementDoor:door,outerWindow:ow,courtPier,outerPier,commonPier,commonWindow,plantRoom:plant,pantry,plantDry:service.plantDry,plantWorking:service.plantWorking,riser:service.riser},
 scenarios:{
  oldPantry:{axisY:7000,width:300,band:windowRoute,courtBayOverhang:Math.max(0,courtWindow[0]-windowRoute[0],windowRoute[1]-courtWindow[1]),outerBayOverhang:Math.max(0,outerWindow[0]-windowRoute[0],windowRoute[1]-outerWindow[1]),room:"G-PANTRY",status:"Centreline lies within both window bays but a 300 mm passage projection overlaps outer window-jamb bearing territory by 50 mm. No structure has been selected."},
  shiftedPantry:{axisY:7125,width:300,band:shifted,commonWindowWidth:commonWindow[1]-commonWindow[0],nominalCommonWindowSideMargins:[shifted[0]-commonWindow[0],commonWindow[1]-shifted[1]],room:"G-PANTRY",status:"Nominally stays within overlapping bay projections but leaves only 75 mm each side before actual window support, crossing protection or structural bearing."},
  pierPlant:{axisY:6000,width:300,band:plantRoute,commonPierWidth:commonPier[1]-commonPier[0],nominalCourtPierSideMargins:[plantRoute[0]-courtPier[0],courtPier[1]-plantRoute[1]],nominalOuterPierSideMargins:[plantRoute[0]-outerPier[0],outerPier[1]-plantRoute[1]],room:"G-PLANT",plantDryOverlapY:overlap(plantRoute,rectBand(service.plantDry)),plantWorkingOverlapY:overlap(plantRoute,rectBand(service.plantWorking)),riserOverlapY:overlap(plantRoute,rectBand(service.riser)),status:"Better nominal sub-window masonry alignment but collides with unselected plant dry-unit and equipment working-footprint reservations. Not an accepted passage."}
 },openQuestions:["Permanent wall/loadbearing below window or door pier","Wet-to-dry boundary across plant room","Full local floor layers and removable service cover","Actual supported aperture and lateral/restraint route","Rainwater full duty and first wetting/hydraulic head","Independent lawful high-water exterior receiving territory"]};
 const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
 const txt=(x,y,v,size=3,weight="normal",fill="#26343a")=>`<text x="${x}" y="${y}" font-family="DejaVu Sans,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(v)}</text>`;
 const line=(x,y,x2,y2,stroke="#61716e",width=.4,dash="")=>`<path d="M${x} ${y}L${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:""}/>`;
 const rect=(x,y,w,h,fill,stroke="#61716e",sw=.3)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
 const X=x=>20+(x-7500)/50,Y=y=>204-(y-4000)/50;
 const svg=[`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" role="img" aria-labelledby="title desc"><title id="title">East courtyard egress: window-bay versus solid-pier route</title><desc id="desc">Source-derived 300 millimetre gross strip compared at y7000, y7125 and y6000. The y6000 route passes through aligned masonry pier projections but conflicts with plant service reservations; neither route is adopted.</desc><rect width="420" height="297" fill="#fffdf8"/>`];
 svg.push(txt(15,17,"HAD / East court escape: find the passage before sizing the drain",5.15,"bold"));
 svg.push(txt(15,25,"Accepted 12 m house · plan at 1:50 for the represented crop · three unadopted 300 mm gross envelope trials",2.7));
 svg.push(line(15,32,405,32));
 svg.push(txt(20,42,"01 / Plan crop: court wall → gallery → plant / pantry → outer wall",3.4,"bold"));
 svg.push(rect(X(7750),Y(8105),417.5/50,(8105-4000)/50,"#b1b6b2"));
 svg.push(rect(X(8167.5),Y(8105),(9437.5-8167.5)/50,(8105-4000)/50,"#eff1eb"));
 svg.push(rect(X(9437.5),Y(8105),125/50,(8105-4000)/50,"#b4b5b1"));
 svg.push(rect(X(9562.5),Y(6650),(11582.5-9562.5)/50,(6650-4000)/50,"#e7ece6"));
 svg.push(rect(X(9562.5),Y(8105),(11582.5-9562.5)/50,(8105-6650)/50,"#eee7d8"));
 svg.push(rect(X(11582.5),Y(8105),417.5/50,(8105-4000)/50,"#b1b6b2"));
 // Draw openings as white slots in nominal masonry footprints.
 for(const [a,b] of cw)svg.push(rect(X(7750),Y(b),417.5/50,(b-a)/50,"#fffdf8","#3e7a91",.45));
 for(const [a,b] of [door,ow])svg.push(rect(X(11582.5),Y(b),417.5/50,(b-a)/50,"#fffdf8","#3e7a91",.45));
 const dry=service.plantDry,work=service.plantWorking;
 svg.push(rect(X(dry.x),Y(dry.y+dry.depth),dry.width/50,dry.depth/50,"#d6ded4","#52665b",.5));
 svg.push(rect(X(work.x),Y(work.y+work.depth),work.width/50,work.depth/50,"#eee4ce","#80775f",.5));
 for(const [band,color]of [[plantRoute,"#2c766b"],[windowRoute,"#a7664e"],[shifted,"#7f7b67"]])svg.push(rect(X(7750),Y(band[1]),(12000-7750)/50,(band[1]-band[0])/50,color,color,.1));
 svg.push(txt(X(8100),Y(4350),"GALLERY",2.5));svg.push(txt(X(9570),Y(4750),"PLANT",2.6));svg.push(txt(X(9550),Y(7620),"PANTRY",2.5));
 svg.push(txt(20,223,"Solid teal = E-P y=6000. Orange = old E-W y=7000. Grey = E-W y=7125.",2.85));
 svg.push(txt(20,232,"Line width is an authored 300 mm envelope; shown strips are NOT openings already cut into the walls.",2.7));
 svg.push(txt(162,45,"02 / Source overlap facts",3.4,"bold"));
 const notes=[
  "Court east windows: 4650–5650, 6350–7350 mm",
  "Outer east: plant-replacement DOOR 3900–5300;",
  "outer upper WINDOW 6900–7900 mm.",
  "Common court/outer solid pier: 5650–6350 (700).",
  "Common window-bay projection: 6900–7350 (450).",
  "",
  "At y7000: 300 band = 6850–7150.",
  "Outer window begins 6900: 50 mm overrun",
  "into supporting masonry beneath its jamb zone.",
  "",
  "At y7125: 300 band = 6975–7275.",
  "Only 75 mm nominal bay projection each side.",
  "This is not a structural bearing allowance.",
  "",
  "At y6000: 300 band = 5850–6150.",
  "200 mm nominal court-pier projection each side;",
  "outer-pier projection gives 550 / 750 mm.",
  "No load-path or actual arch/portal is yet sized.",
  "",
  "BUT y6000 crosses PLANT DRY and WORKING",
  "reservations; riser y4500–5200 does not intersect.",
  "A wet-service / electrical-plant separation and",
  "new room/equipment packing would be required."
 ];notes.forEach((v,i)=>svg.push(txt(162,57+i*8.1,v,2.7,i===6||i===10||i===14?"bold":"normal")));
 svg.push(line(15,244,405,244));
 svg.push(txt(15,253,"Decision: y6000 solid-pier route is the better geometric *challenger*, not a selected emergency outlet.",3.2,"bold"));
 svg.push(txt(15,262,"Require actual STR portal, dry plant reallocation, cover renewal, OAS/IAS wet boundaries and RWT failed-state head.",2.9));
 svg.push(line(15,275,405,275,"#a7b1ad"));
 svg.push(txt(15,283,"RH-LAYOUT-REVISION-02 · HAD-03 / RWT-06 · 1 November 2026 · source-grounded architectural comparison",2.7));
 svg.push(txt(15,290,"No roof-water capacity, physical opening, waterproofing system, site flood datum or programme closeout is claimed.",2.7));
 svg.push("</svg>\n");
 return {data,files:{"east-egress-pier-scan.json":JSON.stringify(data,null,2)+"\n","east-egress-pier-scan.svg":svg.join("")}};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=buildEastEgressPierScan(layoutRevision,revisionOpenings('GROUND'))
 const check=process.argv.includes('--check')
 for(const [name,content] of Object.entries(result.files)){
  const path=new URL(name,import.meta.url)
  if(check){if(readFileSync(path,'utf8')!==content)throw Error('Stale east egress geometry: '+name)}
  else writeFileSync(path,content,'utf8')
 }
 console.log('HAD east-egress geometry '+(check?'verified':'written'))
}
