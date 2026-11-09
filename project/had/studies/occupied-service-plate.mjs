export function servicePlate(house){
const s=house.model.architecturalServices,ink='#154441',warm='#a35131',blue='#39748c',paper='#fafaf5';
const text=(x,y,t,c='b')=>'<text x="'+x+'" y="'+y+'" class="'+c+'">'+t+'</text>';
const rect=(x,y,w,h,c,stroke='none')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c+'" stroke="'+stroke+'"/>';
const line=(x,y,X,Y,c,w=2)=>'<line x1="'+x+'" y1="'+y+'" x2="'+X+'" y2="'+Y+'" stroke="'+c+'" stroke-width="'+w+'"/>';
let out='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1260 772" role="img" aria-labelledby="t"><title id="t">Room heat and first movement of the occupied house services</title><style>text{font:15px Arial,sans-serif;fill:'+ink+'}.title{font-size:26px;font-weight:700}.h{font-size:18px;font-weight:700}.sm{font-size:13px}</style>';
out+=rect(0,0,1260,772,paper)+text(30,38,'The occupied house · winter heat and plant exchange','title')+text(30,68,'Pre-site recovery proposal. Blue is scheduled radiator output; copper is the local electrical supplement.');
out+=text(30,110,'A   Heat in each served room','h')+text(675,110,'B   Plant room and east working bay','h');
Object.entries(s.rooms).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([n,r],i)=>{
 const y=147+i*28,start=165,scale=.150;
 out+=text(32,y+4,n,'sm')+rect(start,y-5,r.selectedHydronicW*scale,9,blue)+rect(start+r.selectedHydronicW*scale,y-5,r.supplementAtLowV*scale,9,warm)+rect(start+r.designDutyW*scale,y-11,2,18,ink);
});
const X=x=>675+(x-9397)*.222,Y=y=>590-(y-3797)*.213;
const plan=(a,c)=>rect(X(a[0]),Y(a[1]+a[3]),a[2]*.222,a[3]*.213,c,ink);
out+=plan([9397,3797,2173.5,1983.5],'#eeeae0')+plan(s.plant.cylinder.body,'#a8c6bc')+plan(s.plant.cylinder.workingEast,'#dde9dc')+plan(s.plant.primaryBuffer.body,'#a9c4d4')+plan(s.plant.controlsHydraulics,'#d8c8ae');
out+=text(X(9530),Y(4270),'Ø760 store','sm')+text(X(10325),Y(4345),'900 × 700','sm')+text(X(10250),Y(5330),'Buffer','sm')+text(X(10985),Y(5610),'Controls','sm');
out+=line(X(10195),Y(3970),X(10485),Y(3970),warm,3)+text(X(10380),Y(3900),'West seat comes off before east roll','sm');
out+=line(X(10035),Y(4550),X(10035),Y(4800),blue,4)+line(X(10120),Y(4760),X(10035),Y(4660),warm,3);
out+=text(682,620,'Keep isolated D1 group distinct from the cold union. Preserve both rain sites.','sm');
out+=rect(32,600,22,9,blue)+text(62,610,'Water radiator','sm')+rect(184,600,22,9,warm)+text(214,610,'Direct electric','sm')+rect(345,595,2,19,ink)+text(358,610,'Occupied room requirement','sm');
out+=text(30,664,'C   During defrost, inhibit cooking and keep the charged 260 L useful buffer connected. Reheat before the next high-cooking period.','sm');
out+=text(30,701,'The hot duty is '+(s.heat.designHotW/1000).toFixed(2)+' kW; the useful 14 kW source retains '+s.heat.hotSpareW.toFixed(0)+' W at the selected low-line room allocation.','h');
out+=text(30,735,'Compare actual source regions, appliance ratings, sleeve admission, heat losses, occupied access, and both final inspections before use.','sm');
return out+'</svg>\n';
}
