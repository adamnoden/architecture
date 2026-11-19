// Exact plans, separate service states. Keep geometry separate from captions.
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
function drawing(title,w,h){
  const list=[`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><rect width="${w}" height="${h}" fill="#fbfaf6"/><defs><pattern id="h" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 7L7 0" stroke="#a66b4d" stroke-width="1.3"/></pattern></defs><g font-family="DejaVu Sans,sans-serif" fill="#253c42">`];
  const t=(x,y,s,size=15,bold=false)=>list.push(`<text x="${x}" y="${y}" font-size="${size}" font-weight="${bold?700:400}">${esc(s)}</text>`);
  const l=(x1,y1,x2,y2,stroke='#879591',width=1,extra='')=>list.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`);
  const r=(x,y,w,h,fill,stroke='#657975',more='')=>list.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" ${more}/>`);
  const c=(x,y,r,fill,stroke='#2d6e76')=>list.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}"/>`);
  const path=(points,stroke,width=2,extra='')=>list.push(`<polyline points="${points.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${stroke}" stroke-width="${width}" ${extra}/>`);
  return {t,l,r,c,path,finish:()=>list.join('\n')+'</g></svg>\n'};
}
export function intakeFigure(d){
  const g=drawing('The court in four occupied states',1280,910),{t,l,r,c,path}=g;
  t(38,48,'A court that can keep receiving water during repair',30,true);
  t(38,78,'Same 3.5 m court in each plan. North is up. Ground apparatus and upper projections have separate roles.');
  const panels=[['01   Ordinary window cleaning',36,110],['02   Failed north intake',654,110],
    ['03   East renewal',36,492],['04   One live roof corner',654,492]];
  const k=.085;
  panels.forEach(([title,ox,oy],i)=>{
    t(ox,oy+20,title,20,true);
    const xx=x=>ox+(x-4250)*k, yy=y=>oy+350-(y-4250)*k;
    const box=(q,col,edge='#637974',extra='')=>r(xx(q[0]),yy(q[1]+q[3]),q[2]*k,q[3]*k,col,edge,extra);
    const line=(points,col,sw=2,extra='')=>path(points.map(([x,y])=>[xx(x),yy(y)]),col,sw,extra);
    const dot=(x,y,size,col)=>c(xx(x),yy(y),size,col);
    box([4250,4250,3500,3500],'#f2f1e9');
    box([4250,7300,1000,395],i===1?'url(#h)':'#a2c4bb');
    box([5250,7400,1950,350],i===1?'url(#h)':'#a2c4bb');
    box([6125,6300,1525,1100],i===2?'#d1e2e4':'#e4e5dc');
    const f=d.frame,notes=(rows)=>rows.forEach((s,j)=>t(ox+314,oy+80+j*24,s,14));
    if(i===0){
      for(let n=0;n<5;n++)for(let j=0;j<2;j++)box([6125+n*305,6300+j*550,305,550],j===1||n===0?'#b5d0d1':'#e2e2d9');
      box(f.ramp.layout,'#d9ba85');line(d.access.operator,'#9f5538',3);
      dot(7325,6850,300*k,'none');line([[6075,6577.5],[6075,7225]],'#7f684f',2);
      notes(['Both exits live','All ten covers locked','South gate opens inward','R300 → window station','Two ramp halves present']);
    }else if(i===1){
      box(d.inlet.continuousApron,'#9bcacb');box([6100,6300,330,550],'#7ea9aa');box([6100,6850,1290,550],'#b9d9d9');
      for(const x of d.inlet.wetSeams)line([[x,6880],[x,7380]],'#43838a',1);
      line([[5725,6920],[6125,6920],[6250,6920],[7375,7000]],'#246d79',3);
      box(d.basket.basket,'#42748a');line([[7550,6900],[7750,6900]],'#246d79',4);
      notes(['N grate gives zero flow','Clear 200 approach','773.5 continuous wet edge','Five north + one SW pan','Open basket → east chute']);
    }else if(i===2){
      box([5375,6200,2325,1495],'none','#8d6a47','stroke-dasharray="5 4"');
      box(d.basket.removal.sweptBounds,'none','#468895','stroke-dasharray="4 3"');
      box(d.basket.removal.selectedFirstRest,'#d8ba83');
      const [x,y]=d.basket.removal.yawCentre, cy=d.basket.removal.carryY;
      line([[7450,6900],[x,y],[x,cy],[5105,cy],[5105,5670]],'#246d79',3);
      box(d.access.westGatePark,'#af7956');box(f.ramp.stow,'#d8ba83');
      notes(['Prove N and weather first','All pans captured from above','Basket lifts, then yaws','West gate and first rest','West stair opens last']);
    }else{
      box(f.chambers.normal,'#7ab2b2');box(f.chambers.east,'#7ab2b2');
      box([4750,6775,700,325],'none','#517d65','stroke-dasharray="4 3"');
      box(f.ramp.stow,'#d8ba83');const ne=f.cases.find(c=>c.corner==='NE');
      box(ne.rest,'none','#9e633e','stroke-dasharray="5 3"');
      line(ne.pipeRoutes.normal,'#397e93',2);line(ne.pipeRoutes.east,'#8a6439',2);
      for(const [x,y] of f.pads)box([x-200,y-200,400,400],'url(#h)','#995d43');
      notes(['Both chambers available','700 between wet enclosures','Hatched = anchored feet','Ramp off the B socket','Dashed = overhead NE rest']);
    }
  });
  l(36,473,1244,473);l(36,868,1244,868);t(38,895,'Conditional pre-site geometry. First wetting, equipment, ratings, soil, site levels and lawful discharge require separate evidence.',14);
  return g.finish();
}

export function detailFigure(d){
  const g=drawing('The six wet covers and two-cell east basket',1160,770),{t,l,r,c,path}=g;
  t(34,50,'The low point moves to the removable hood',29,true);
  t(34,82,'Door and court elevations use FFL 0. The two diagrams have independent scales.');
  t(34,129,'01   Along the low band of the five north pans',20,true);
  const X=x=>60+(x-6100)*.78,Z=z=>171+(-170-z)*.9;
  const start=d.inlet.wetEdgeX,end=d.inlet.spout.endX,base=d.inlet.northWestZ,edges=d.inlet.wetSeams;
  let points=[[X(start),Z(base)]],i=0;
  for(const x of edges){
    const z=base-.015*(x-start)-18*i++;points.push([X(x),Z(z)],[X(x),Z(z-18)]);
    l(X(x),156,X(x),322,'#bdc5bf',1,'stroke-dasharray="4 4"');t(X(x)-19,342,String(x),13);
  }
  points.push([X(end),Z(d.inlet.spout.z)]);path(points,'#246f79',4);
  t(62,370,'Four 18 mm drops. The last wet seam is 55 mm west of the walking-cover joint.');t(62,393,'The SW crossing enters from the side on its own captured bridge. No blind low point at the old closed inlet.',14);
  l(34,416,1126,416);
  t(34,453,'02   Front of the open basket and the original beam',20,true);
  const y=z=>475+(-110-z)*.28, x=v=>60+(v-7350)*1.8, b=d.basket;
  const bx=b.basket[0], ex=bx+b.basket[2], low=b.invert, oldTop=b.top;
  path([[x(bx),y(-110)],[x(bx),y(b.bottom)],[x(ex),y(b.bottom)],[x(ex),y(low)]],'#5c6563',3);
  path([[x(7532),y(-140)],[x(7460),y(-450)],[x(7460),y(-812)]],'#416b70',3);
  l(x(7460),y(-852),x(7460),y(b.bottom),'#416b70',3);
  l(x(7550),y(low),x(7650),y(low),'#657976',3);l(x(7550),y(oldTop),x(7650),y(oldTop),'#82928e',2);
  l(x(7370),y(b.cases[1].impactPool),x(7458),y(b.cases[1].impactPool),'#438997',3);
  l(x(7462),y(b.cases[1].quietPool),x(7532),y(b.cases[1].quietPool),'#438997',3);
  r(x(7650),y(-520),80,y(-630)-y(-520),'#ddd9cb','#9c9989');
  c(x(7450),y(-80),5,'#438997');l(x(7450),y(-80),x(7450),y(-185),'#438997',2);
  t(710,502,'Temporary roof pipe at (7450,7000,−80).');t(710,529,'Sloped upper baffle leads into the impact cell.');
  t(710,569,'Eight low ports feed a quieter outlet cell.');t(710,596,'460 × 40 bottom opening, invert −797.65.');
  t(710,637,'2 cm freeboard is reserved in the 100 mm body.');t(710,665,'The complete low shoe releases before the draw.');
  t(34,736,'Levels shown for the 4.43895 L/s maintenance comparison. Upstream water and real transfer depend on losses, tailwater and obstruction.',14);
  return g.finish();
}
