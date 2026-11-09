// Alternative source in house coordinates. Geometry and numeric levels come from the study record.
export function plate(s){
  const src=s; s={newCornerChamber:src.access.corner.E,northInvertRoute:src.services.buried.north,responses:src.flow.rows,highECrest:src.flow.high};
  const grid='#80938f',ink='#163b3b',green='#086c64',umber='#ad5b30',blue='#286e97',paper='#fbfcf8';
  const X=x=>54+(x-4250)*.178,Y=y=>520-(y-5700)*.178;
  const rect=(x,y,w,h,fill,stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}"/>`;
  const r=(x,y,w,h,fill,stroke)=>rect(X(x),Y(y+h),w*.178,h*.178,fill,stroke);
  const path=(pts,col,width=2,dash='')=>`<path d="M${pts.map(p=>p.join(' ')).join(' L')}" fill="none" stroke="${col}" stroke-width="${width}" stroke-dasharray="${dash}" stroke-linejoin="round"/>`;
  const plan=(p,c,w,d)=>path(p.map(([x,y])=>[X(x),Y(y)]),c,w,d);
  const tx=(x,y,t,cls='label')=>`<text x="${x}" y="${y}" class="${cls}">${t}</text>`;
  const mark=(x,y,v)=>`<circle cx="${X(x)}" cy="${Y(y)}" r="10" fill="${ink}"/>`+tx(X(x),Y(y)+4,v,'pin');
  const z=a=>410-(a+1000)*.226;
  let v='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1230 690" role="img" aria-labelledby="t"><title id="t">Compare a permanent courtyard receiver with the two service outlets</title><style>text{font-family:Arial,sans-serif;fill:#163b3b}.title{font-size:26px;font-weight:700}.section{font-size:19px;font-weight:700}.label{font-size:14px}.small{font-size:12px}.pin{font-size:13px;fill:white;text-anchor:middle;font-weight:bold}</style>';
  v+=rect(0,0,1230,690,paper)+tx(30,39,'A permanent receiver with a dry emergency outlet','title')+tx(30,66,'Pre-site house comparison · mm relative to ground-floor datum');
  v+=tx(30,106,'A   North-west court service field','section')+tx(733,106,'B   Faulted receiving levels','section');
  v+=r(4250,5700,3500,2050,'#eeeae0',grid);
  v+=r(4250,7300,1000,395,'#c7dce6',blue)+r(5250,7400,1950,350,'#c7dce6',blue);
  v+=r(6125,6300,1525,1100,'#e4e5dd',grid)+r(6125,6600,600,600,'#b6c8c3',ink)+r(6725,6450,600,900,'#d1e0dc',green);
  v+=r(5700,6550,350,810,'#79aaa1',green)+r(5500,6625,200,725,'#eadca2','#9c8650');
  v+=r(4300,6775,450,450,'#82a29d',ink)+r(...(s.newCornerChamber||[5450,6075,450,450]),'#82a29d',ink);
  const north=(s.northInvertRoute||[]).slice(0,3).map(p=>p.slice(0,2)); if(north.length)v+=plan([...north,[7000,7750]],blue,4,'7 5');
  v+=plan([[5900,6900],[5900,7540],[7450,7540],[7450,6975],[7580,6975]],umber,4);
  v+=r(7360,6745,190,450,'#e9c9af',umber);
  v+=plan([[4250,6200],[6170,6200],[6170,7275],[6130,7275]],'#777085',2,'5 4');
  v+=mark(5830,6930,'1')+mark(5585,6880,'2')+mark(7035,6800,'3')+mark(7460,6830,'4')+mark(5100,6340,'5');
  v+=tx(45,554,'1  New forebay      2  Graded approach      3  Retained standing platform')+tx(45,578,'4  Shallow east nozzle      5  Temporary chamber aisle');
  v+=path([[740,607],[790,607]],blue,4,'7 5')+tx(800,612,'Low branch to the separate north basin');
  v+=path([[740,634],[790,634]],umber,4)+tx(800,639,'High branch to the retained east chute');
  const q=s.responses.at(-1),lev=[[-35,'Quiet court limit −35',ink],[q.highELevel,'N unavailable · E carries full flow '+q.highELevel.toFixed(0),umber],[s.highECrest,'Fixed high E sill '+s.highECrest,umber],[q.NfaultTailLevel,'N operating at faulted tail '+q.NfaultTailLevel.toFixed(0),blue],[-650,'N basin faulted water −650',blue],[src.flow.terminal.location[2],'E free nozzle invert −752.1',umber],[-1025,'Low branch invert −1025',blue]];
  for(const [a,l,c] of lev){v+=path([[746,z(a)],[806,z(a)]],c,2)+tx(818,z(a)+4,l,'small');}
  v+=tx(737,464,'N operating · the lower branch takes the flow. The E inlet stays dry.')+tx(737,491,'N blocked · water rises to the separate E inlet.')+tx(737,518,'Both blocked · no discharge credited.');
  v+=tx(30,654,'Proposed house geometry. Pipe sizes, access, debris trials and conditional site levels belong to the linked study.','small');
  return v+'</svg>\n';
}

// An orthographic section of the actual two-cells and a separate nozzle detail.
export function detail(r){
  const W=1180,H=670,ink='#173d3b',green='#08766d',rust='#a4512b',blue='#396e97',paper='#fbfcf8';
  const t=(x,y,s,c='body')=>'<text x="'+x+'" y="'+y+'" class="'+c+'">'+s+'</text>';
  const box=(x,y,w,h,c,o='none')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c+'" stroke="'+o+'"/>';
  const ln=(x,y,X,Y,c,width=2,dash='')=>'<line x1="'+x+'" y1="'+y+'" x2="'+X+'" y2="'+Y+'" stroke="'+c+'" stroke-width="'+width+'" stroke-dasharray="'+dash+'"/>';
  const Z=z=>140+(-z-60)*.31, X=x=>60+(x-5700)*1.18;
  let v='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-labelledby="title"><title id="title">West forebay transverse section and east receiver, dimensions in millimetres</title><style>text{fill:'+ink+';font:15px Arial,sans-serif}.title{font-size:26px;font-weight:700}.sub{font-size:19px;font-weight:700}.small{font-size:13px}</style>';
  v+=box(0,0,W,H,paper)+t(28,39,'Two separate paths through one accessible west receiver','title')+t(28,67,'All elevations in mm relative to the ground-floor datum. The two details use different scales.');
  v+=t(30,108,'A   West box · transverse cut through high E pocket','sub');
  const left=X(5700),right=X(6050),bottom=Z(-1100),wall=X(5930),top=Z(-82);
  v+=box(left,top,right-left,bottom-top,'#eef0e8',ink)+box(left,top,right-left,7,ink);
  for(let i=0;i<18;i++)v+=box(X(5706+12*i),top,7,7,paper);
  v+=box(wall,top,6,Z(-140)-top,ink)+box(wall,Z(-300),6,Z(-800)-Z(-300),ink)+box(wall,Z(-920),6,bottom-Z(-920),ink);
  v+=box(left+2,Z(-410),wall-left-2,bottom-Z(-410),'#c4dce7')+box(wall+6,Z(-507),right-wall-8,bottom-Z(-507),'#c4dce7');
  v+=ln(left,Z(-410),wall,Z(-410),blue,2,'5 4')+ln(wall+6,Z(-507),right,Z(-507),blue,2,'5 4')+ln(wall+7,Z(-220),right,Z(-220),rust,2,'5 4');
  const pocket= X(5845);v+=box(pocket,Z(-300),wall-pocket,Z(-565)-Z(-300),'#e5cbb6',rust);
  v+=ln(pocket-5,Z(-160),wall,Z(-140),ink,5)+ln(wall+6,Z(-300),wall+32,Z(-300),rust,3);
  v+=t(64,512,'X5700 west · wet opening 216')+t(64,535,'X5930 baffle · X6050 east case');
  v+=t(64,572,'Low N at −1025. Two independent screened baffle windows, each 200 × 120.')+t(64,596,'E side pocket has a fixed splash roof, dedicated air path and 250 × 85 neck.');
  v+=t(488,Z(-220)+4,'−220 quiet · E operating', 'small')+t(488,Z(-300)+5,'−300 E sill','small')+t(488,Z(-410)+5,'−410 impact · N operating','small')+t(488,Z(-507)+5,'−507 quiet · N operating','small')+t(488,Z(-800)+5,'−800 window top','small')+t(488,Z(-920)+5,'−920 window base','small')+t(488,Z(-1100)+5,'−1100 case floor','small');
  v+=t(713,108,'B   East terminal · isolated for removal','sub');
  v+=t(714,145,'Platform east edge X7325. Operator centre X7025.')+t(714,174,'New dry-side plenum X7360–7550, gross width 190.');
  const a=754,b=1033,c=1078;
  v+=box(a,248,b-a,105,'#e3e9df',ink)+box(b,227,110,148,'#e9dac9',rust);
  v+=box(b-80,287,125,25,'#bd8361',rust)+ln(b,229,b,372,ink,3)+ln(b-80,274,b-8,274,green,3);
  v+=t(a,238,'Retract 80 west')+t(a,342,'Park to X7500')+t(b-70,404,'Toe ends X7580');
  v+=t(714,449,'350 × 32 clear at Y6975. Toe invert −752.1.')+t(714,476,'Paired clearance 10.96 to original top and E water.')+t(714,503,'Clear controls on the western face, independent bearings.');
  v+=t(714,551,'Before first motion','sub')+t(714,582,'Prove N, isolate E, vent and drain the line. Capture the nose.')+t(714,607,'Retract and park before the original east body draws east.');
  v+=t(28,643,'Schematic section. Structural ratings, discharge jets and tail stages require the joined wet and loaded witness.','small');
  return v+'</svg>\n';
}
