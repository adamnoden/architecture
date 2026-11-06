/** Project-designed temporary weather states. Hydraulic/weather/temporary-works acceptance remains downstream. */
import assert from 'node:assert/strict';
const overlaps=(a,b)=>a[0]<b[0]+b[2]&&a[0]+a[2]>b[0]&&a[1]<b[1]+b[3]&&a[1]+a[3]>b[1];
export function deriveMaintenanceRain(model,renewal){
 const e={state:'E unavailable; N intact and full-duty verified before work',
  roof:{plan:[6025,6200,1675,1600],underside:2200,weatherTopWest:2301.5,weatherTopEast:2401.5,fallDirection:'WEST',glassPlane:7750,glassGap:50,
   temporaryPosts:[[6100,6150],[7625,6150],[6100,7850],[7625,7850]],postPlan:50,feetPlan:100,
   support:'Four project moment posts outside the well/collector; north feet beyond7750 and south feet below6250. No foot occupies N intake. Wind/anchors/roof capacity/erection remain temporary-works qualification.'},
  gutter:{plan:[5950,6200,100,1600],receiveRim:2190,floor:[[6200,2080],[7575,2050],[7800,2055]],
   eaveJoin:'West sheet folds down into gutter inside its2190rim. No uphill open eave junction.'},
  downpipe:{outsideDiameter:100,axis:[6000,7575],inletZ:2050,outletZ:100,
   destination:'Free downward discharge over intact N grate; no inserted fitting or penetration of N liner.',localCourtZ:-103,airGap:203},
  weatherEnclosure:{boundaryPlan:[6075,6250,1625,1150],top:2200,
   northPlate:[6125,7395,1075,5],plateCrest:50,plateBottom:-120,
   westPlate:[6075,6250,5,1150],southPlate:[6075,6250,1625,5],
   collectorSeparationPlate:[7225,7400,50,400],
   curtains:'Continuous reusable temporary weather skirts from roof underside to50-high well-side plates with100 vertical overlap, closed corner laps and mechanically restrained ends. East skirt is outside well atx7700; above permanent bridge it returns to the wall, below bridge the existing covered900 portal remains the controlled module passage. No curtain crosses the swept module. The retained dry floor and fixed passage deck shield that continuation from direct vertical rain; wind-driven weather performance remains unqualified.',
   entry:{clear:650,plan:[5430,6550,650,650],coveredVestibule:[5375,6500,750,750],innerPlaneX:6075,outerPlaneX:5425,overlapEach:100,crest:50,walkingZ:-80,
    method:'Covered two-flap weather entry. Only one flap opens at a time; close both and test weather state before any hood/body release. Crew remains inside enclosure during first release; restore intact E body/hood before dismantling enclosure. Front and west garden route remain available.'},
   forbiddenCredit:'No600x100 blank is claimed to seal the whole900 bridge socket; no unearned below-socket storage volume is counted.'},
  operations:['Keep both complete paths and walking covers intact. Close affected court window; prohibit cleaning.',
   'Erect/anchor roof, gutter, closed downpipe, skirts, well-side plates and covered entry; prove runoff reaches N and all enclosure laps remain controlled.',
   'Verify N is intact/receiving/full-duty and forecast/temporary-weather operating envelope is admitted. Close entry weather flaps, then lift well covers/hood and withdraw E.',
   'N carries full assigned rain. No work starts or continues with N failed; restore E and test before dismantling weather controls.'],
  physicalWeatherAccepted:false};
 const n={state:'N unavailable; E assembled, receiving and full-duty verified before work',
  courtRoof:{plan:[4250,4250,3500,3500],underside:2200,beamTop:2300,weatherTopEast:2301.5,weatherTopWest:2351.5,
   rails:{section:[100,50,5],maximumSpacing:1000,northCantilever:1650,supportAxisY:6100},
   posts:[[4400,4400],[7550,4400],[4400,6100],[7550,6100]],postPlan:100,feetPlan:250,
   gutter:[7600,4250,150,3500],gutterInvert:2250,
   pipe:{insideDiameter:125,outsideDiameter:128,gutterDrop:[7675,6900,2250,2060],route:[[7675,6900,2060],[7450,6900,2050],[7450,6900,150]],outletShaft:[7350,6600,200,600],airGapAboveHood:260},
   assignedInput:'All courtyard and assigned inward-roof input is intercepted on this temporary plane before N is isolated. Any roof discharge not actually captured forbids the state. No extra catchment beyond the existing60.0625m2 is silently added to E.'},
  loggiaRoof:{plan:[4800,7750,2400,5800],underside:2200,postAxisX:7000,postAxesY:[8800,10300,11750],postPlan:100,feetPlan:250,
   westCantilever:2200,northOverhang:1800,
   pipe:{insideDiameter:125,outsideDiameter:128,axisX:6800,invertStart:[6800,7750,2050],invertEnd:[6800,13700,1990],
    headerNorthExtension:450,headerWestCantilever:1800,outlet:[5000,13700,-600],receiver:[4250,13650,1500,1500],receivingMaximum:-800,airGap:200},
   rule:'Separate canopy rain goes directly to available N/W receiving territory through the independent closed overhead pipe. It does not enter removed N liner or increase E catchment. No work with this receiver unavailable.'},
  thresholdBypass:{route:[[5050,4300,-25],[5050,4500,-70]],clearWidth:200,receivingTrayBed:-80,drop:10,
   operation:'Fit clip-on200 gutter and close ordinary primary N branch before opening N. Existing secondary tray/route feeds E. Court door remains closed; front exit and west garden route remain available.'},
  storage:{region:[4550,4600,1250,1700],coverStack:[4550,4600,600,1700],shortModuleStack:[5200,4600,600,1700],
   supports:'Separate retained timber-free/mineral frame packers; no simultaneous volume credited twice.'},
  sequence:['Both paths/covers intact: erect and anchor full court and loggia roofs, complete closed drainage pipes and temporary threshold bypass.',
   'Water-test every assigned roof/court/threshold entry into E or the separate N/W canopy receiver. Close court access/windows, keep front/garden escape open.',
   'Only then cap N primary threshold branch, lift covers and remove N short/long modules under the continuous roofs. Keep E hood/collector/body intact.',
   'Incoming replacement and joint restoration occur under same roofs. Test N, restore normal threshold branch/covers, then remove temporary roofs.'],
  temporaryWorks:{metalWeatherPlaneKg:308,apparatusOrderOfMagnitudeKg:1000,
   erection:'Not one-person erection.38.5kg rails and roof panels require restrained lifting, engineered temporary supports and crew/tool territory before anyone enters below. Wind/anchors/cantilevers, assembly loads and permanent-support bearing must be qualified before this state is used; no permanent-fabric damage credited.',
   successor:'Reusable lighter weather fabric may be compared explicitly later; this conservative metal weather plane is not an owner material invariant.'},
  physicalWeatherAccepted:false};
 const v={eastMaintenance:e,northMaintenance:n,scope:'Located constructive reference for one path unavailable plus rain. No concurrent failure of the intact route is promised. Temporary weather, hydraulic capacity/splash, material joints, wind/anchors and erection qualification remain mandatory technical duties.'};
 verifyMaintenanceRain(v,model,renewal);return v;
}
export function verifyMaintenanceRain(v,model,renewal){
 const e=v.eastMaintenance,n=v.northMaintenance,well=renewal.courtIntakeWell,inlet=model.northNormalRoute.normal.inlet;
 assert(e.roof.plan[0]+e.roof.plan[2]>=well[0]+well[2],'E rain roof leaves well exposed');
 assert(e.roof.plan[1]<=well[1]&&e.roof.plan[1]+e.roof.plan[3]>=well[1]+well[3],'E rain roof misses well in Y');
 assert(e.downpipe.outletZ>e.downpipe.localCourtZ,'E canopy drain has no free drop into N');
 assert(e.weatherEnclosure.northPlate[1]+e.weatherEnclosure.northPlate[3]<=inlet[1],'E weather bund blocks intact N');
 for(const [x,y]of e.roof.temporaryPosts){const f=[x-e.roof.feetPlan/2,y-e.roof.feetPlan/2,e.roof.feetPlan,e.roof.feetPlan];assert(!overlaps(f,well)&&!overlaps(f,inlet),'E roof support blocks live water territory');}
 assert.equal(n.courtRoof.plan[2]*n.courtRoof.plan[3],12250000,'N work must cover full court');
 assert(n.courtRoof.underside>=2200&&n.loggiaRoof.underside>=2200,'Rain roof blocks bail/person');
 const pipe=n.courtRoof.pipe,shaft=pipe.outletShaft,r=pipe.outsideDiameter/2;
 assert(pipe.route.at(-1)[0]-r>=shaft[0]&&pipe.route.at(-1)[0]+r<=shaft[0]+shaft[2],'Court roof pipe misses actual E shaft');
 assert(pipe.route[0][2]+pipe.insideDiameter+(pipe.outsideDiameter-pipe.insideDiameter)/2<=n.courtRoof.underside,'Court roof pipe penetrates weather plane');
 assert(pipe.route[0][2]>pipe.route[1][2]&&pipe.route[1][2]>pipe.route[2][2],'Court rain pipe rises before E');
 for(const[x,y]of n.courtRoof.posts){const f=[x-125,y-125,250,250];assert(!overlaps(f,well)&&!overlaps(f,inlet),'N canopy foot occupies live intake/work opening');}
 assert(n.loggiaRoof.pipe.axisX+64<n.loggiaRoof.postAxisX-50,'Loggia pipe clashes with roof post');
 assert(n.loggiaRoof.pipe.outlet[2]>n.loggiaRoof.pipe.receivingMaximum,'Loggia canopy tail submerged in reference');
 assert.equal(n.thresholdBypass.route.at(-1)[2]-n.thresholdBypass.receivingTrayBed,n.thresholdBypass.drop,'Threshold bypass has no drop');
 assert(!overlaps(n.storage.coverStack,n.storage.shortModuleStack),'N covers and modules use same storage');
 return {pass:true,scope:'Complete source-drawn rain interception/destinations and support nonoverlap; physical weather/hydraulic/temporary-works admission remains false.'};
}
export function renderMaintenanceRain(v){
 const scale=.055,px=x=>65+(x-4000)*scale,py=y=>65+(y-4000)*scale;
 let s='<svg xmlns="http://www.w3.org/2000/svg" width="1250" height="900" viewBox="0 0 1250 900"><rect width="1250" height="900" fill="#f8f6ef"/><g font-family="sans-serif" fill="#252b2e">';
 const text=(x,y,t,size=15)=>`<text x="${x}" y="${y}" font-size="${size}">${t}</text>`;
 const rect=(r,c,o=.4)=>`<rect x="${px(r[0])}" y="${py(r[1])}" width="${r[2]*scale}" height="${r[3]*scale}" fill="${c}" opacity="${o}" stroke="#333"/>`;
 s+=text(35,32,'ONE PATH UNAVAILABLE + RAIN · project temporary-weather reference',22);
 const n=v.northMaintenance,e=v.eastMaintenance;
 s+=rect(n.courtRoof.plan,'#77a8c0');s+=rect(n.loggiaRoof.plan,'#add2dc');s+=rect(n.storage.region,'#ba9a6c');
 for(const[x,y]of n.courtRoof.posts)s+=rect([x-125,y-125,250,250],'#555',.8);
 for(const y of n.loggiaRoof.postAxesY)s+=rect([6875,y-125,250,250],'#555',.8);
 s+=rect(e.roof.plan,'#b8a2c8');s+=text(70,640,'N work: full court catch roof to E shaft; loggia roof drains separately to N/W.',16);
 s+=text(70,665,'E work: enclosed well roof, gutter to intact N; no bare socket storage credit.',16);
 s+=text(600,115,'Sections / operating limits',20);
 for(const[t,i]of ['Court roof underside2200; bails max1100; people1800.',
 'Court gutter2250 → drop2060 → pipe2050 → E outlet150.',
 '125ID /128OD pipe crown2176.5:23.5 below roof.',
 'Loggia pipe axis6800 clears east posts; outlet−600,',
 'separate receiver max−800 gives200 free drop.',
 'E roof skirts / well-side bunds / covered two-flap entry',
 'are CLOSED before any E hood/body is released.',
 'N roof is erected/tested before N covers are opened.',
 'Threshold bypass transfers primary tray to E secondary.',
 'Steel weather planes≈308kg; complete apparatus≈1tonne.',
 'No one-person rail erection; no unrestrained overhead load.',
 'Wind/anchors/erection/weather/loss/splash remain unqualified.' ].map((t,i)=>[t,i]))s+=text(600,160+i*31,t);
 s+=text(35,750,'Blue: N-work temporary roofs. Purple: E-work roof (alternative state). Brown: separate cover/module storage.',16);
 s+=text(35,780,'These roofs are never credited as free permanent architecture; actual equipment/support/weather admission is mandatory.',16);
 s+='</g></svg>\n';return s;
}
