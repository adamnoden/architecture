// Local court coordinates and reversible lifting distances, in mm.
export function serviceDrawing(r){
  const c=r.handling,wet=r.ground.services.receiver,win=r.windows;
  const b=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1260 788" role="img" aria-labelledby="title desc">',
    '<title id="title">Guarded service of the paired west receiver screens</title>',
    '<desc id="desc">Two plans show separate lifting and water areas, followed by the ordinary and long-duty crest calculations.</desc>',
    '<rect width="1260" height="788" fill="#faf9f4"/><g font-family="DejaVu Sans,sans-serif" fill="#203a3a">'];
  const text=(x,y,t,size=15,weight=400)=>b.push('<text x="'+x+'" y="'+y+'" font-size="'+size+'" font-weight="'+weight+'">'+t+'</text>');
  const rect=(x,y,w,h,fill,stroke='none')=>b.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.3"/>');
  const line=(a,z,col,width=2,dash='')=>b.push('<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+z[0]+'" y2="'+z[1]+'" stroke="'+col+'" stroke-width="'+width+'" stroke-dasharray="'+dash+'"/>');
  const circ=(x,y,radius,fill,stroke)=>b.push('<circle cx="'+x+'" cy="'+y+'" r="'+radius+'" fill="'+fill+'" stroke="'+stroke+'"/>');
  text(35,43,'Service the west receiver without closing its only live outlet',30,700);
  text(35,73,'Selected house, north up. Water levels and plan dimensions are in mm.');
  rect(35,91,1190,2,'#42817b');
  text(36,124,'1   Lift from above and retain the south exit',21,700);
  const sc=.155,px=65,py=515,X=4250,Y=5475;
  const pt=([x,y])=>[px+(x-X)*sc,py-(y-Y)*sc];
  function box(a,fill,stroke){const p=pt([a[0],a[1]+a[3]]);rect(...p,a[2]*sc,a[3]*sc,fill,stroke);}
  box([4250,7300,1000,395],'#dbe9e7');box([5250,7400,1950,350],'#dbe9e7');
  box(r.ground.services.approach,'#e2eeea');box(wet,'#67a09a','#275f5d');
  for(const p of c.lids)line(pt([wet[0],p[1]]),pt([wet[0]+350,p[1]]),'#d9ede7',1);
  for(const p of c.screens)circ(...pt(p),3.5,'#275f5d','#fff');
  box(r.ground.services.westGate,'#ded1bc','#9a876c');
  for(const a of c.shoes)box(a,'#9c9fa4','#475466');
  box(c.stageBox,'#edcfab','#ac7232');
  for(const a of c.guardFeet)box(a,'#ded9a7','#8b885b');
  const [l,u]=c.guard.ys,[w,e]=c.guard.xs;
  for(const [a,z] of [[[w,l],[w,u]],[[w,u],[e,u]],[[e,u],[e,l]]])line(pt(a),pt(z),'#8b885b',2);
  circ(...pt(c.body),300*sc,'none','#735183');circ(...pt(c.body),3,'#735183','#735183');
  circ(...pt(c.mast),400*sc,'none','#8b785e');circ(...pt(c.mast),5,'#374659','#374659');
  line(pt(c.mast),pt(c.screens[1]),'#4c6575',2,'5 4');line(pt(c.mast),pt([r.handling.stageBox[0]+225,r.handling.stageBox[1]+175]),'#4c6575',2,'5 4');
  text(80,172,'N intake',13);text(364,235,'Wet box',14,700);text(223,342,'Mast',13);
  text(73,543,'Orange is the dry first rest. Purple is the 600-wide operator.');
  text(73,568,'Lock the two screens before any long northern-roof diversion.');
  text(685,124,'2   The northern screen crosses the backup crest',19,700);
  const x0=715,y0=330,sx=1.20,sy=.67, yRef=6980;
  function section(a,b,z,Z,fill,stroke){rect(x0+(a-yRef)*sx,y0-(Z+300)*sy,(b-a)*sx,(Z-z)*sy,fill,stroke);}
  section(7010,7280,-300,-140,'#b9d6ce','#4f8079');
  section(7110,7320,-345,-215,'#9ba6b2','#35485f');
  text(700,178,'270-wide, hooded high outlet',15);
  text(700,202,'Moving cassette drawn opaque, 10 adverse sideways.',14);
  line([x0+(7010-yRef)*sx,355],[x0+(7110-yRef)*sx,355],'#16736e',3);
  text(700,385,'100 gross left → 67.5 after ends and debris.',16,700);
  text(700,410,'One moving piece only. Keep the other window seated.');
  text(700,438,'The blue-grey body can pass both weir and soffit heights.');
  rect(35,592,1190,2,'#42817b');
  text(35,627,'Operating limits at the travelling northern cassette',21,700);
  const rows=win.cases.map(t=>t.lifts[1]);
  text(40,663,'Whole flow',15,700);text(278,663,'Calm cell',15,700);text(457,663,'Impact cell',15,700);
  text(655,663,'Clear to soffit',15,700);text(905,663,'Service state',15,700);
  rows.forEach((v,i)=>{const y=698+i*40;text(40,y,win.cases[i].q+' L/s',17);text(278,y,v.quiet.toFixed(1),17);
    text(457,y,v.impact.toFixed(1),17);text(655,y,v.openSoffitClear.toFixed(1)+' mm',17);
    text(905,y,i?'Keep both screens locked':'Conditional ordinary exchange',16,700);});
  text(40,774,'Keep the two site basins and the dry exterior staff stair separate. Ground, surge, load capacity and first wetting remain site and physical checks.',14);
  b.push('</g></svg>');return b.join('\n')+'\n';
}
