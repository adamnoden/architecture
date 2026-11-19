export function servicePlate(house){
const s=house.model.architecturalServices,ink='#154441',warm='#a35131',blue='#39748c',paper='#fafaf5';
const text=(x,y,t,c='b')=>'<text x="'+x+'" y="'+y+'" class="'+c+'">'+t+'</text>';
const mm=n=>Number(n.toFixed(3));
const rect=(x,y,w,h,c,stroke='none')=>'<rect x="'+mm(x)+'" y="'+mm(y)+'" width="'+mm(w)+'" height="'+mm(h)+'" fill="'+c+'" stroke="'+stroke+'"/>';
const line=(x,y,X,Y,c,w=2)=>'<line x1="'+x+'" y1="'+y+'" x2="'+X+'" y2="'+Y+'" stroke="'+c+'" stroke-width="'+w+'"/>';
let out='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1260 772" role="img" aria-labelledby="t"><title id="t">Room heat and first movement of the occupied house services</title><style>text{font:15px Arial,sans-serif;fill:'+ink+'}.title{font-size:26px;font-weight:700}.h{font-size:18px;font-weight:700}.sm{font-size:13px}</style>';
out+=rect(0,0,1260,772,paper)+text(30,38,'The occupied house · winter heat and plant exchange','title')+text(30,68,'Selected occupied reference. Blue shows radiator output and copper shows the local electrical supplement.');
out+=text(30,110,'A   Heat in each served room','h')+text(675,110,'B   Plant room and east working bay','h');
Object.entries(s.rooms).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([n,r],i)=>{
 const y=147+i*28,start=165,scale=.150;
 out+=text(32,y+4,n,'sm')+rect(start,y-5,r.selectedHydronicW*scale,9,blue)+rect(start+r.selectedHydronicW*scale,y-5,r.supplementAtLowV*scale,9,warm)+rect(start+r.designDutyW*scale,y-11,2,18,ink);
});
const X=x=>675+(x-9397)*.222,Y=y=>590-(y-3797)*.213;
const plan=(a,c)=>rect(X(a[0]),Y(a[1]+a[3]),a[2]*.222,a[3]*.213,c,ink);
out+=plan([9397,3797,2173.5,1983.5],'#eeeae0')+plan(s.plant.cylinder.body,'#a8c6bc')+plan(s.plant.cylinder.workingEast,'#dde9dc')+plan(s.plant.primaryBuffer.body,'#a9c4d4')+plan(s.plant.controlsHydraulics,'#d8c8ae');
out+=text(X(9530),Y(4270),'Ø760 store','sm')+text(X(10325),Y(4345),'900 × 700','sm')+text(X(10250),Y(5330),'Buffer','sm')+text(X(10985),Y(5610),'Controls','sm');
out+=line(X(10195),Y(3970),X(10485),Y(3970),warm,3)+text(X(10380),Y(3900),'Lift west seat before roll','sm');
out+=line(X(10035),Y(4550),X(10035),Y(4800),blue,4)+line(X(10120),Y(4760),X(10035),Y(4660),warm,3);
out+=text(682,620,'Remove the D1 manifold and cold bridge before the first roll.','sm');
out+=rect(32,600,22,9,blue)+text(62,610,'Water radiator','sm')+rect(184,600,22,9,warm)+text(214,610,'Direct electric','sm')+rect(345,595,2,19,ink)+text(358,610,'Occupied room requirement','sm');
out+=text(30,664,'C   During defrost, inhibit cooking and keep the charged 260 L useful buffer connected. Reheat before the next high-cooking period.','sm');
out+=text(30,701,'Hot duty '+(s.heat.designHotW/1000).toFixed(2)+' kW · useful 14 kW source · '+s.heat.hotSpareW.toFixed(0)+' W reserve at the selected low-line room allocation.','h');
out+=text(30,735,'Compare actual source regions, appliance ratings, sleeve admission, heat losses, occupied access, and both final inspections before use.','sm');
return out+'</svg>\n';
}

export function storePlate(house) {
  const m=house.model, service=m.architecturalServices, exchange=m.storeExchange;
  const {cylinder,primaryBuffer,riserGross,independentSafety:safety}=service.plant;
  const [west,south,width,depth]=service.eastWaterJoin.plantDryRoom;
  const scale=.245, X=x=>Math.round((46+(x-west)*scale)*100)/100, Y=y=>Math.round((595-(y-south)*scale)*100)/100;
  const box=([x,y,w,h],fill)=>`<rect x="${X(x)}" y="${Y(y+h)}" width="${w*scale}" height="${h*scale}" fill="${fill}" stroke="#566f73"/>`;
  const circle=([x,y],r,colour,fill='none',dash='')=>`<circle cx="${X(x)}" cy="${Y(y)}" r="${r*scale}" stroke="${colour}" fill="${fill}" stroke-width="2" ${dash}/>`;
  const point=(p)=>`${X(p[0])},${Y(p[1])}`;
  const route=exchange.path.map(point).join(' ');
  const [lo,hi]=service.eastWaterJoin.replacementDoor.finishedClearY;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 670" role="img" aria-labelledby="title desc">
<title id="title">First movement of the domestic hot-water store</title><desc id="desc">An eccentric cradle clears the west wall. A fixed discharge manifold intersects the first eastward roll. The plant must be cold and isolated while the manifold is removed.</desc>
<style>text{font:16px sans-serif;fill:#173d40}.heading{font-size:25px;font-weight:bold}.step{font-weight:bold}.small{font-size:13px}</style>
<rect width="1120" height="670" fill="#fafaf5"/><text x="42" y="40" class="heading">First movement of the hot-water store</text>
<text x="42" y="67">Plan in millimetres. North is up. Circles bound the loaded cradle at its start and east turn.</text>
${box([west,south,width,depth],'#eeece3')}${box(riserGross,'#d7d9ce')}${box(service.plant.controlsHydraulics,'#d7d9ce')}${box(m.groundFurniture['service-emitter-plant-N'],'#d7d9ce')}
${circle([primaryBuffer.body[0]+primaryBuffer.body[2]/2,primaryBuffer.body[1]+primaryBuffer.body[3]/2],primaryBuffer.completeDiameter/2,'#456e83','#abc5ce')}
<line x1="${X(west+width)}" x2="${X(west+width)}" y1="${Y(lo)}" y2="${Y(hi)}" stroke="#fafaf5" stroke-width="6"/>
${circle(cylinder.centre,cylinder.body[2]/2,'#396c62','#acd2bf')}${circle(exchange.path[0],exchange.radius,'#277568')}${circle(exchange.path[2],exchange.radius,'#277568','none','stroke-dasharray="8 5"')}
<polyline points="${route}" stroke="#277568" stroke-width="3" fill="none"/>
<text x="${X(west+width)+15}" y="${Y(exchange.path[2][1])+24}" class="small">East door</text>
<text x="${X(9880)}" y="${Y(4250)+33}" text-anchor="middle" class="small">Store</text><text x="${X(10450)}" y="${Y(5325)+4}" text-anchor="middle" class="small">Buffer</text>
<text x="${X(9660)}" y="${Y(5060)}" text-anchor="middle" class="small">Riser</text>
${circle(safety.manifold,18,'#a14b30','#a14b30')}${circle(safety.tundish,14,'#3c668c','#3c668c')}
<text x="${X(10035)+12}" y="${Y(4660)+14}" class="small">D1 manifold</text><text x="${X(10035)+12}" y="${Y(4800)-10}" class="small">Tundish</text>
<text x="830" y="135" class="step">1  Isolate and drain</text>
<text x="830" y="166">Prove zero stored pressure.</text><text x="830" y="191">Support the retained pipework.</text>
<text x="830" y="255" class="step">2  Release before rolling</text>
<text x="830" y="286">Remove cold bridge, stand and</text><text x="830" y="311">detachable discharge group.</text>
<text x="830" y="375" class="step">3  Keep the tank upright</text>
<text x="830" y="406">Cradle centre 17 mm east.</text><text x="830" y="431">West wall and riser each retain</text><text x="830" y="456">25 mm in plan.</text>
<text x="830" y="520" class="step">4  Restore before heat</text>
<text x="830" y="551">Reinstall safety connections.</text><text x="830" y="576">Prove discharge and interlocks.</text>
<text x="42" y="636" class="small">Check the complete loaded cradle, rated support, stability and union releases before use.</text></svg>\n`;
}
