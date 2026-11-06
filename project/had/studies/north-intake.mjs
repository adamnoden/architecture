/** Current source figure, distinct from the immutable old3500 cross-trough. */
export function renderNorthIntake(model,renewal){
 const n=model.northNormalRoute.normal,i=n.inlet,c=n.crossIntake,term=model.northNormalRoute.terminal;
 const X=x=>60+(x-4200)*.22,Y=y=>80+(y-6200)*.15;
 const text=(x,y,s,size=14)=>`<text x="${x}" y="${y}" font-family="sans-serif" font-size="${size}" fill="#20323b">${s}</text>`;
 const rect=(r,col)=>`<rect x="${X(r[0])}" y="${Y(r[1])}" width="${r[2]*.22}" height="${r[3]*.15}" fill="${col}" stroke="#5a686e"/>`;
 let s='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="950" viewBox="0 0 1200 950"><rect width="100%" height="100%" fill="#fbfaf5"/>';
 s+=text(35,30,'CURRENT N INTAKE / SEPARATE E WELL — PROJECT REFERENCE',23);
 s+=text(35,55,'Historical3500 trough atY7000 rejected; no hydraulic/material/site qualification transferred.');
 s+=rect(renewal.courtIntakeWell,'#e5c4a9')+rect(i,'#84b7cc')+rect(renewal.courtCollector.plan,'#78aaa9');
 s+=rect(renewal.courtCollector.actualOpenEntries.approach.plan,'#267c98');
 s+=rect(renewal.courtCollector.actualOpenEntries.coverNotch.plan,'#267c98');
 s+=rect([7200,7750,519.5,500],'#777268');
 s+=text(65,337,`N inlet x${i[0]}..${i[0]+i[2]}, y${i[1]}..${i[1]+i[3]}`);
 s+=text(65,361,'E well and fixed north guard endY7400; N endsX7200 / E starts7300:100 separation.');
 s+=text(65,385,'E:450 west lip−110 +100 feeder; north wall edge ZERO credit. Guard minimum−50 stays30 above quiet−80.');
 const sx=x=>60+(x-4250)*.32,z=z=>415+(-z-90)*1.7;
 s+=text(35,425,'Cross section at the conservative north edgeY7750',18);
 s+=`<path d="M${sx(4250)},${z(-110)} H${sx(7200)}" stroke="#757268" stroke-width="14" fill="none"/>`;
 const pts=[[4250,c.westBottomAtNorth],[5025,c.trunkBottomAtNorth],[7200,c.eastBottomAtNorth]];
 s+=`<polyline points="${pts.map(p=>sx(p[0])+','+z(p[1])).join(' ')}" stroke="#237a97" stroke-width="3" fill="none"/>`;
 s+=`<polyline points="${pts.map(p=>sx(p[0])+','+z(p[1]+c.hydraulicTrialDepth)).join(' ')}" stroke="#237a97" stroke-width="2" stroke-dasharray="5 4" fill="none"/>`;
 for(const p of [pts[0],pts[2]])s+=`<path d="M${sx(p[0])},${z(p[1])} V${z(c.containment.foldCrestAtNorth)}" stroke="#237a97" stroke-width="4" fill="none"/>`;
 s+=text(65,655,'V1:100 toX5025; floor−206 / −213.75 / −192. 250clear; dashed40 is hydraulic trial depth;14cover INSIDE full-height folds.');
 s+=text(65,679,'Solid side/end folds reach court−110, not dashed40. Blocked water returns through grate to court/E.');
 s+=text(35,723,'Ordinary outlet — existing longitudinal N body retained',18);
 s+=text(65,750,'Carrier bottom−213.75@7750 → −256.25@12000 → −268.25@13200.');
 s+=text(65,777,`Covered terminal toY${term.endY}, invert${term.invert}; closed downroute outlet${term.closedDownroute.outlet}.`);
 s+=text(65,804,`Separate N/W receiver ${term.receiver.bounds.join('/')} max trial plane${term.receiver.nominalWaterPlane};200 air-gap reference.`);
 s+=text(65,840,'N−30 floor/DPC boundary remains controlling: quiet−80 +25splash +25tolerance; certified first harm NULL.');
 s+=text(65,870,'New intake, short saddles/supports and Nfull-duty proof remain current MAT/RWT/STR obligations.');
 s+=text(65,900,'No shared E catch, pressure trap, buried inaccessible water chamber or invented simultaneous double fault.');
 return s+'</svg>\n';
}
