const ink='#183f42',blue='#34728b',ochre='#b26939',paper='#faf9f2',grey='#d8dfdb';
const n=x=>Number(x.toFixed(3));
const text=(x,y,value,size=16)=>`<text x="${n(x)}" y="${n(y)}" font-size="${size}">${value}</text>`;
const rect=(x,y,w,h,fill,stroke=ink,extra='')=>`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
const circle=(x,y,r,fill,stroke=ink,extra='')=>`<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
const line=(x,y,X,Y,colour=ink,extra='')=>`<path d="M${n(x)},${n(y)} L${n(X)},${n(Y)}" fill="none" stroke="${colour}" ${extra}/>`;

export function selectedServicePlate(house){
  const m=house.model,s=house.selectedServiceInterfaces;
  const roomName={utility:'Utility',rearBath:'Rear bath',kitchenDining:'Kitchen',principalBath:'Principal bath'};
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1180" role="img" aria-labelledby="title desc">
<title id="title">Selected service heads, cartridge exchange and purge windows</title>
<desc id="desc">Source-bound occupied service reference. Five head elevations, the complete sloping family cartridge, a north kitchen stage and four actual purge leaf plans.</desc>
<style>text{font-family:Arial,sans-serif;fill:${ink}}path,rect,circle{stroke-width:1.3}.strong{font-weight:700}</style>
${rect(0,0,1440,1180,paper,'none')}${text(30,40,'The occupied service interface',30)}
${text(30,69,'HAD-SERVICES-02 · fixed heads, sloping cartridges and manually controlled purge leaves',18)}
${text(30,100,'A   Selected head elevations · dimensions in mm above each floor',19)}`;
  s.heads.forEach((head,index)=>{
    const opening=m.archOpeningRegister[head.level].find(q=>q.id===head.id);
    const cx=155+index*280,scale=.215,base=316;
    const X=a=>cx+(a-head.along)*scale,Y=z=>base-(z-2100)*scale;
    const half=head.width/2,rise=opening.head-opening.spring,R=(half*half+rise*rise)/(2*rise);
    const path=`M${X(head.along-half)},${Y(head.bandBottom)} L${X(head.along-half)},${Y(opening.spring)} A${R*scale},${R*scale} 0 0 1 ${X(head.along+half)},${Y(opening.spring)} L${X(head.along+half)},${Y(head.bandBottom)} Z`;
    svg+=text(cx-123,130,`${roomName[head.room]} · ${head.level==='FIRST'?'First':'Ground'}`,17);
    svg+=`<path d="${path}" fill="${grey}" stroke="${ink}"/>`;
    for(const hole of head.holes){
      const a=head.wall==='outer-north'?hole.point[0]:hole.point[1],z=hole.point[2]-(head.level==='FIRST'?m.sections.firstFFL:0);
      const r=hole.faceWidth*scale/2;
      svg+=hole.faceShape==='square'?rect(X(a)-r,Y(z)-r,2*r,2*r,blue):circle(X(a),Y(z),r,blue);
      svg+=circle(X(a),Y(z),hole.radius*scale,'none',paper,'stroke-dasharray="3 2"');
    }
    svg+=line(X(head.along-half),Y(head.bandBottom)-head.border*scale,X(head.along+half),Y(head.bandBottom)-head.border*scale,ochre,'stroke-dasharray="4 3"');
    svg+=text(cx-123,343,`Head base ${head.bandBottom} · frame ${head.border}`,14);
    svg+=text(cx-123,365,`Faces ${head.holes.map(h=>h.faceWidth).join(' / ')} · min ${Math.min(...head.holes.map(h=>h.faceGap)).toFixed(1)}`,14);
  });
  svg+=line(30,389,1410,389,grey);
  svg+=text(30,423,'B   Family exhaust · complete sloping withdrawal',19);
  const family=s.wallTerminalRenewal.find(t=>t.id==='family-bath'),part=family.renewal.cartridges[0];
  const X=r=>320+r*.4,Y=z=>733-(z-4300)*.12;
  svg+=rect(X(-430),Y(6500),430*.4,(6500-4300)*.12,grey);
  svg+=rect(X(125),Y(6500),(670-125)*.4,(6500-6375)*.12,ink);
  svg+=line(X(100),Y(6327),X(950),Y(6327),ochre,'stroke-dasharray="5 3"');
  for(const [state,colour]of [[part.initial,grey],[part.clearanceState,blue],[part.dryRest,ochre]]){
    svg+=rect(X(state.outwardNormalMM[0]),Y(state.z[1]),(state.outwardNormalMM[1]-state.outwardNormalMM[0])*.4,
      (state.z[1]-state.z[0])*.12,colour,ink,'fill-opacity=".45"');
  }
  svg+=line(X(250),Y(4300),X(950),Y(4300),blue,'stroke-width="4"');
  svg+=text(35,459,'Installed axis 6125 · 247 complete collar OD',14);
  svg+=text(35,482,'330 face retained in every moving state',14);
  svg+=text(35,751,'Normal dimensions drawn at 0.4 px/mm · heights at 0.12 px/mm',13);
  svg+=text(35,775,`650 first draw, then 155 · roof reserve ${part.exteriorMovingBodyRoofReserveMM.toFixed(2)} after 48 allowance`,14);
  svg+=text(445,659,'One cartridge in the cradle',14);
  svg+=text(445,681,'Close the supported room blank',14);
  svg+=text(445,703,'before cleanout or exchange',14);

  svg+=text(810,423,'C   North kitchen stage · plan',19);
  const kitchen=s.heads.find(h=>h.room==='kitchenDining'&&h.holes[0].id==='kitchen-exhaust');
  const k=kitchen.renewal.cartridges[0],stage=kitchen.renewal.stage,scale=.18;
  const PX=a=>1090+(a-8400)*scale,PY=r=>450+r*scale;
  svg+=rect(PX(stage.alongMM[0]),PY(250),(stage.alongMM[1]-stage.alongMM[0])*scale,700*scale,'#edf0e8');
  svg+=rect(PX(8900),PY(1000),250*scale,260*scale,grey);
  svg+=text(810,709,'Roof leader at 9025 · R1000–1260',14);
  svg+=text(810,732,'Stage R250–950 · 50 clear to the leader',14);
  svg+=text(810,755,'2000 high bodies · 600 diameter · 30 to moving part',14);
  svg+=rect(PX(k.dryRest.alongMM[0]),PY(k.dryRest.outwardNormalMM[0]),
    (k.dryRest.alongMM[1]-k.dryRest.alongMM[0])*scale,605*scale,ochre);
  for(const body of k.exterior.sideBodies)svg+=circle(PX(body[0]),PY(body[1]),300*scale,'#b4d2d8');
  svg+=line(PX(8400),PY(100),PX(8400),PY(905),blue,'stroke-dasharray="5 3"');
  svg+=text(810,778,'Workers take both side stations before any outward draw',14);

  svg+=line(30,806,1410,806,grey)+text(30,839,'D   Selected purge leaves · closed, half and 35° open plans',19);
  s.purge.forEach((p,index)=>{
    const cx=195+index*350,top=858,scale=.18;
    const local=point=>p.wall==='east'?[point[1]-p.centre,12000-point[0]]:
      p.wall==='north'?[point[0]-p.centre,12000-point[1]]:[point[0]-p.centre,point[1]];
    const P=point=>{const [a,r]=local(point);return [cx+a*scale,top+r*scale]};
    svg+=text(cx-163,866,roomName[p.room],16);
    svg+=rect(cx-25*scale,top+301.5*scale,50*scale,128*scale,ink);
    for(const leaf of p.leaves){
      leaf.frames.forEach((frame,i)=>{
        const points=frame.plan.map(q=>P(q).map(n).join(',')).join(' ');
        svg+=`<polygon points="${points}" fill="${i===2?blue:grey}" fill-opacity="${i===2?.65:.4}" stroke="${ink}"/>`;
      });
      const grip=leaf.gripPath.at(-1),g=P(grip),elbow=P(leaf.articulatedArm.elbow);
      svg+=line(elbow[0],elbow[1],g[0],g[1],ochre,'stroke-width="3"')+circle(g[0],g[1],40*scale,ochre);
    }
    const b=P(p.body);
    svg+=circle(b[0],b[1],300*scale,'none',blue,'stroke-dasharray="4 2"');
    svg+=text(cx-163,1080,`${p.nominalOpeningAreaM2.toFixed(5)} m² nominal opening`,14);
    svg+=text(cx-163,1102,`${p.floorTwentiethM2.toFixed(5)} m² floor/20 · ${p.maximumGripReachMM.toFixed(1)} reach`,14);
  });
  svg+=text(30,1140,'The 35° opening-area method follows ADF 2021 Table 1.4. Product wind, rain, material and installed-flow duties remain in the schedule.',14);
  svg+=text(30,1164,'New opaque heads 2.095 m² · utility return 0.270 · rear sill 0.100 · principal band increment 0.010. Read the selected source with this figure.',14);
  return svg+'</svg>\n';
}
