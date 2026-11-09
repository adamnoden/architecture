// Paired schematics. The court plan uses one scale; the hydraulic section uses a
// separate labelled Z scale. Only the explicitly modelled proposal is hatched.
export function servicePlate(r){
  const {ground:g,roof}=r,{failedBasket:f,highReturn:h}=g;
  const t=(x,y,s,c='body')=>`<text x="${x}" y="${y}" class="${c}">${s}</text>`;
  const rect=(x,y,w,h,fill,stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}"/>`;
  const line=(x,y,X,Y,c='#59716d',dash='')=>`<path d="M${x} ${y}L${X} ${Y}" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="${dash}"/>`;
  const green='#136e66',ink='#173d40',rust='#a74322',blue='#27618a';
  const X=x=>55+(x-4250)*.15,Y=y=>350-(y-6300)*.15;
  const plan=(x,y,w,h,c,s)=>rect(X(x),Y(y+h),w*.15,h*.15,c,s);
  const z=v=>419-(v+215)*1.12;
  let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1140 625" role="img" aria-labelledby="title"><title id="title">Court service routes and blocked-basket overflow</title><defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><line x1="0" y1="0" x2="0" y2="6" stroke="#a74322" stroke-width="2"/></pattern></defs><style>text{font-family:Arial,sans-serif;fill:#173d40}.head{font-size:27px;font-weight:700}.sub{font-size:19px;font-weight:700}.body{font-size:15px}.small{font-size:13px}.num{font-size:15px;font-weight:700;fill:white;text-anchor:middle}</style>';
  s+=rect(0,0,1140,625,'#fbfcf9')+t(34,43,'One corner under repair · two different drainage failures','head');
  s+=t(34,72,'House coordinates in mm. Hatched features are proposed changes to the selected intake.','body');
  s+=t(34,111,'A   Ground plan · north at top','sub')+t(631,111,'B   Why the shortest low return fails','sub');
  s+=plan(4250,6300,3400,1450,'#f1eee5','#b8b5a7')+plan(6125,6300,1525,1100,'#d7e5dd',green);
  for(const [x,y,w,h] of g.normal.inletRegions)s+=plan(x,y,w,h,'#c4dce4',blue);
  for(const [x,y,w,h] of [r.had.frame.chambers.normal,r.had.frame.chambers.east])s+=plan(x,y,w,h,'#789c98',ink);
  s+=plan(...r.had.inlet.continuousApron,'#e1c977','#8e7d35')+plan(5900,6890,235,190,'url(#hatch)',rust);
  s+=plan(6200,7400,900,150,'url(#hatch)',rust)+plan(6200,7360,900,65,'url(#hatch)',rust);
  s+=plan(5730,7215,140,140,'#52656b')+plan(...r.had.basket.basket,'#d88b65',rust);
  function mark(x,y,n){return `<circle cx="${X(x)}" cy="${Y(y)}" r="11" fill="${ink}"/>`+t(X(x),Y(y)+5,n,'num');}
  s+=mark(4525,7000,1)+mark(5660,6840,2)+mark(6005,7020,3)+mark(7475,6850,4)+mark(6640,7460,5);
  s+=t(52,385,'1   N break chamber')+t(322,385,'2   E break chamber');
  s+=t(52,412,'3   Short feed below 200 approach')+t(322,412,'4   E receiving basket');
  s+=t(52,439,'5   Three spill pieces over the intact N grate');
  for(const [v,name,c] of [[-35,'Quiet courtyard limit −35',ink],[-80,'Proposed upper sill −80',rust],[-96,'N grate south edge −96',blue],[-134.04,'N water −134.0 · rough, width reduced',blue],[-155.66,'N water −155.7 · clean',blue],[-180.18,'Current E side spills −180.2',rust],[-188.5,'N east floor −188.5',ink]]){
    s+=line(642,z(v),711,z(v),c);
    const y=v===-188.5?z(v)+14:v===-96?z(v)+5:z(v)+4;
    s+=t(728,y,name,'small');
  }
  s+=line(650,z(-180.18),650,z(-134.04),rust,'4 4')+t(632,443,'Local upstream water is already 25–46 mm below N.','body');
  s+=line(35,470,1105,470,'#c3d0c9')+t(36,503,'Raised roof above the same court','sub');
  s+=t(36,534,`Direct rain ${roof.tributary.directCourt.toFixed(3)} L/s · roof ${roof.tributary.roofDuty.toFixed(3)} L/s · combined ${roof.tributary.combined.toFixed(5)} L/s`);
  s+=t(36,561,'Five straight cassettes receive local rain and varying longitudinal flow. Isolate one at a time.');
  s+=t(36,589,'A contained return boot releases below the neighbouring gutter front. A blocked leader needs its own relief.');
  return s+'</svg>\n';
}
