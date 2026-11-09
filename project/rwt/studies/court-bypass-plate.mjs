// Three separate scales: equipment, whole-plot plan and vertical hydraulic head.
export function bypassPlate(r){
  const {relief:g,buried:b}=r;
  const W=1330,H=838,ink='#193b3c',green='#16706a',blue='#2c6689',rust='#ac4737',tan='#c49248';
  const box=(x,y,w,h,fill,stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}"/>`;
  const line=(x,y,X,Y,c,sw=2,dash='')=>`<path d="M${x} ${y}L${X} ${Y}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-dasharray="${dash}"/>`;
  const txt=(x,y,t,size=15,heavy=false,col=ink)=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" font-weight="${heavy?'700':'400'}" fill="${col}">${t}</text>`;
  let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title"><title id="title">Two courtyard spill galleries and independent north basin return</title>`+box(0,0,W,H,'#fafaf6');
  s+=txt(35,45,'A low route past a blocked courtyard receiver',30,true)+txt(35,73,'Project comparison. Pipe and receiving levels are conditional. All dimensions in mm. North is up in both plans.',15);
  s+=txt(35,112,'1   Collect before the old side spills',20,true)+txt(685,112,'2   Carry water below the two loggia ties',20,true);
  const X=x=>62+(x-6025)*.28,Y=y=>361-(y-6550)*.28;
  const plan=(x,y,w,h,cl,edge)=>box(X(x),Y(y+h),w*.28,h*.28,cl,edge);
  s+=plan(6100,6600,330,760,'#d5dfd3',green)+plan(6430,6850,960,510,'#ebebdf',green);
  s+=plan(6735,6850,605,110,'#a7c6bd',green)+plan(6735,7250,605,110,'#a7c6bd',green);
  s+=plan(7350,6600,200,600,'#a0bdcd',blue)+plan(7350,7200,200,140,'#baceda',blue);
  for(const iy of [6960,7250])for(const [a,c] of g.slots)s+=line(X(a+5),Y(iy),X(c-5),Y(iy),rust,4);
  for(const [x,y,w,h] of g.gallery.dryCatchMouths)s+=plan(x,y,w,h,'none',blue);
  s+=plan(7375,7210,150,120,'none',blue)+plan(7290,6935,100,230,'#d9bd78',tan);
  const open=r.handling.selectedOpenPlatform.plan;
  s+=`<rect x="${X(open[0])}" y="${Y(open[1]+open[3])}" width="${open[2]*.28}" height="${open[3]*.28}" fill="none" stroke="${rust}" stroke-dasharray="6 4"/>`;
  s+=line(X(6075),Y(7395),X(7225),Y(7395),ink,3)+txt(74,412,'Fixed cups (blue) enter the open-HAD platform (dashed red).',14);
  s+=txt(74,434,'Solid red edges spill before the ochre spout and blue basket.',14);
  s+=txt(92,263,'West',15,true)+txt(92,282,'carrier',15,true)+txt(254,272,'East carrier',16,true);
  const PX=x=>710+(x-4000)*.100,PY=y=>446-(y-6900)*.040;
  const site=(x,y,w,h,col,st)=>box(PX(x),PY(y+h),w*.100,h*.040,col,st);
  s+=site(4500,7400,3000,4800,'#ebece4','#bbbfaf')+site(...b.siteBasin,'#d3e3e7',blue)+site(...b.receiver,'#789da9',blue);
  for(const row of b.crosses){s+=site(4500,row.firstY,3000,600,'#d7c296',tan);}
  for(const [x,y] of [[4500,8050],[7500,8050],[4500,9875],[7500,9875],[4500,11667.5],[7500,11667.5]])s+=site(x-300,y-300,600,600,'#c2b79c',tan);
  const route=b.route;
  for(let i=1;i<route.length;i++)s+=line(PX(route[i-1][0]),PY(route[i-1][1]),PX(route[i][0]),PY(route[i][1]),green,5);
  s+=txt(1092,186,'North basin',16,true)+txt(1092,208,'Deep new forebay',14)+txt(1098,262,'Tie at Y11667.5',14)+txt(1098,404,'Tie at Y8050',14)+txt(1098,444,'Courtyard drops',14);
  s+=txt(684,466,'X and Y have different scales here. The numerical model uses true plan distances.',13);
  s+=line(35,485,1294,485,'#b6c2bd');
  s+=txt(35,522,'3   Compare water levels in the adverse 4.439 L/s case',20,true);
  const rows=[['First low pan edge, 5 lower',g.formerFirstSide-5,rust],['Both galleries operating',g.cases[1].both.stage,green],['Separate basket · quiet cell',g.cases[1].quietCell.stage,blue],['Gallery receiver rim',g.gallery.receiverRim,ink],['Backwater at the source',b.tails[1].faultHead,blue],['Faulted north basin',b.faultTail,ink]];
  const splitX=694,Z=z=>558+(-z-145)*.415;
  for(const [name,z,c] of rows){s+=line(splitX,Z(z),splitX+100,Z(z),c,3);}
  rows.forEach(([name,z,c],i)=>{const yy=558+i*35;s+=txt(52,yy,`${name}  ${z.toFixed(1)}`,16,false,c)+line(355,yy-5,splitX,Z(z),c,1);});
  s+=txt(855,564,'Two gallery edges retain 12.9 mm',16,true,green)+txt(855,587,'to the lowered old spill in this case.',15);
  s+=txt(855,637,'Loss of one whole gallery',16,true,rust)+txt(855,660,'with further debris fails by 4.0 mm.',15);
  s+=txt(855,719,'A failed north site basin removes',16,true)+txt(855,742,'this leg and the normal N outfall.',15);
  s+=txt(35,807,'First harmful water, soil and actual basin tail remain unmeasured. The existing north weather skirt stays continuous.',15);
  return s+'</svg>\n';
}
