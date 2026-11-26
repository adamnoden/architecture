import { sha256SemanticFingerprint } from '../../../core/identity.js'
import type { StudyRoomKit } from './study-room-kit.js'
import type { compileStudyRoomAssembly } from './study-room-assembly.js'
import type { compileStudyWallTransition } from './study-wall-transition.js'

type Assembly = ReturnType<typeof compileStudyRoomAssembly>
type Transition = ReturnType<typeof compileStudyWallTransition>
type Point = readonly [number, number, number]
type Box = readonly [number, number, number, number]
type Wall = Assembly['walls'][number]
type Camera = { readonly eyeMm: Point; readonly targetMm: Point; readonly horizontalFieldDegrees: number }
/** Read-only presentation contract keeps room drawing independent of compiler return-type inference. */
type NorthLightingProjection={
 readonly status:string;readonly caseDigest:string;readonly source:{readonly roomKitCaseDigest:string}
 readonly commonRoom:{readonly floorFaces:readonly(readonly number[])[];readonly occupied:readonly(readonly[string,readonly number[]])[]}
 readonly construction:{readonly localHomeRunComparison:{
  readonly issues:readonly string[];readonly totalDepthMm:number;readonly bayPlanMm:readonly number[];readonly finishBottomZMm:number;readonly finishTopZMm:number;readonly frontYMm:number
  readonly carrierXZMm:readonly number[];readonly cableOpening:{readonly centreXMm:number;readonly centreZMm:number}
  readonly boxes:readonly{readonly id:string;readonly xMm:readonly number[];readonly zMm:readonly number[]}[]
 }}
 readonly circuit:{readonly designDigest:string;readonly issues:readonly string[];readonly applianceLead:{
  readonly fitting:{readonly reference:string;readonly wallPlateDiameterMm:number;readonly projectionMm:number;readonly shadeWidthMm:number;readonly shadeHeightMm:number;readonly authoredDownwardEnvelopeZFromMountMm:readonly number[]}
  readonly radiusMm:number;readonly lengthMm:number;readonly diameterRequirementMm:number;readonly pathMm:readonly(readonly number[])[]
  readonly nominalFixedVolumes:readonly{readonly id:string;readonly xyzxyzMm:readonly number[]}[]
 }}
}

type NorthLighting = {readonly lighting:NorthLightingProjection;readonly camera:Camera}
type Face = { readonly id: string; readonly points: readonly Point[]; readonly colour: string; readonly line?: string; readonly width?: number; readonly opacity?: number }
const r = (n: number) => Number(n.toFixed(3))
const escape = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')
const subtract = (a: Point, b: Point): Point => [a[0]-b[0],a[1]-b[1],a[2]-b[2]]
const dot = (a: Point,b: Point) => a.reduce((sum,v,i)=>sum+v*b[i]!,0)
const cross = (a: Point,b: Point): Point => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const unit = (a: Point): Point => { const length=Math.hypot(...a); if(length<1e-9)throw new RangeError('STUDY_PERSPECTIVE_CAMERA_DEGENERATE'); return a.map(v=>v/length) as unknown as Point }

/** Pinhole drawing only: no illuminance, product material or installed room claim. */
export function studyPerspectiveCamera(kit: StudyRoomKit): Camera {
  const bands=kit.structuralConsequence?.source.baseBands??kit.bands
  const [a,b,c]=bands
  if(!a||!b||!c||bands.length!==3)throw new RangeError('STUDY_PERSPECTIVE_UNSUPPORTED_ROOM')
  return { eyeMm:[c[2]-280,c[3]-190,1550], targetMm:[a[0]+(b[2]-a[0])*.43,a[1]+170,1550], horizontalFieldDegrees:78 }
}

/** Same saved room; an authored north-facing eye point, not a surveyed photograph. */
export function studyNorthLightingCamera(kit:StudyRoomKit,lighting:NorthLightingProjection):Camera{
 const desk=kit.occupied.find(([id])=>id==='study-desk')?.[1]
 if(!desk)throw new Error('STUDY_NORTH_LIGHTING_DESK_UNAVAILABLE')
 const h=lighting.construction.localHomeRunComparison
 return{eyeMm:[desk[2]+220,desk[3]+350,1550],targetMm:[(h.bayPlanMm[0]!+h.bayPlanMm[2]!)/2,h.frontYMm,1550],horizontalFieldDegrees:78}
}
function checkNorthLightingSource(kit:StudyRoomKit,lighting:NorthLightingProjection){
 if(lighting.source.roomKitCaseDigest!==kit.caseDigest||sha256SemanticFingerprint(lighting.commonRoom.floorFaces)!==sha256SemanticFingerprint(kit.floor.parts.flatMap(p=>p.facePieces))||sha256SemanticFingerprint(lighting.commonRoom.occupied)!==sha256SemanticFingerprint(kit.occupied))throw new Error('STUDY_NORTH_LIGHTING_MIXED_CASE')
 if(lighting.status==='GEOMETRY_REJECTED'||lighting.circuit.issues.length||lighting.construction.localHomeRunComparison.issues.length)throw new Error('STUDY_NORTH_LIGHTING_REJECTED_INSTALLATION')
 if(!lighting.circuit.applianceLead.fitting.reference.startsWith('Type80W1'))throw new Error('STUDY_NORTH_LIGHTING_FAMILY_UNSUPPORTED')
}

function projector(camera: Camera,width:number,height:number){
  const forward=unit(subtract(camera.targetMm,camera.eyeMm)),right=unit(cross(forward,[0,0,1])),up=cross(right,forward)
  const focal=width/(2*Math.tan(camera.horizontalFieldDegrees*Math.PI/360)),near=50
  const cameraPoint=(p:Point): Point=>{const v=subtract(p,camera.eyeMm);return[dot(v,right),dot(v,up),dot(v,forward)]}
  const clip=(points:readonly Point[])=>{
    const input=points.map(cameraPoint),output:Point[]=[]
    for(let i=0;i<input.length;i++){
      const a=input[i]!,b=input[(i+1)%input.length]!,ia=a[2]>=near,ib=b[2]>=near
      if(ia)output.push(a)
      if(ia!==ib){const t=(near-a[2])/(b[2]-a[2]);output.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1]),near])}
    }
    return output.map(p=>[r(width/2+focal*p[0]/p[2]),r(height/2-focal*p[1]/p[2])])
  }
  return {clip,depth:(p:Point)=>cameraPoint(p)[2]}
}
function wallPoint(wall:Wall,s:number,z:number,roomward=0): Point{
  return wall.axis==='x'?[s,wall.fixedMm+wall.normal*roomward,z]:[wall.fixedMm+wall.normal*roomward,s,z]
}
const wallRect=(wall:Wall,[a,b,c,d]:Box,roomward=0):readonly Point[]=>[wallPoint(wall,a,b,roomward),wallPoint(wall,c,b,roomward),wallPoint(wall,c,d,roomward),wallPoint(wall,a,d,roomward)]
const floorRect=([a,b,c,d]:Box,z=0):readonly Point[]=>[[a,b,z],[c,b,z],[c,d,z],[a,d,z]]
const inset=([a,b,c,d]:Box,amount:number):Box=>[a+amount,b+amount,c-amount,d-amount]
const good=([a,b,c,d]:Box)=>c>a&&d>b

function roomScene(kit:StudyRoomKit,assembly:Assembly,transition:Transition,mode:'fixed'|'removable',tone:'day'|'evening',camera:Camera,lighting?:NorthLightingProjection){
  if(lighting)checkNorthLightingSource(kit,lighting)
  if(kit.source.bindingDigest!==assembly.source.bindingDigest)throw new Error('STUDY_PERSPECTIVE_MIXED_ROOM_SOURCE')
  if(kit.wall.boundRoomOpenings.length!==3||!kit.occupied.some(([id])=>id==='study-desk')||!kit.occupied.some(([id])=>id==='study-chair'))throw new Error('STUDY_PERSPECTIVE_MISSING_BOUND_ROOM')
  const ceiling=transition.field.ceilingZMm,night=tone==='evening',oak=assembly.face==='oak'
  const palette=night?{wall:'#535b58',panel:'#59635c',inset:'#636e64',trim:'#788174',cream:'#d0c9b8',floor:['#775d40','#826a4a','#8e7351','#6e5a42'],line:'#323b37',glass:'#354c58'}
    :{wall:'#b9bdb0',panel:'#bec4b5',inset:'#cbd0c1',trim:'#d9dace',cream:'#ebe9de',floor:['#9b7952','#a58359','#b18e62','#96754f'],line:'#777f72',glass:'#c4d3d4'}
  if(!oak){palette.panel=night?'#696d65':'#c1c6bf';palette.inset=night?'#757c70':'#d4d6c9';palette.trim=night?'#8b917e':'#e0dfd1'}
  if(kit.request.wearingFace!=='oak')palette.floor=night?['#777b71','#606d6d','#8b8e81','#737b74']:['#c4c2b7','#aebabb','#d6d3c5','#b9c2ba']
  const faces:Face[]=[]
  const add=(id:string,points:readonly Point[],colour:string,line=palette.line,width=.55,opacity=1)=>faces.push({id,points,colour,line,width,opacity})
  const composition=kit.floor.oakComposition
  const appearanceColour=(colour:string)=>tone==='day'?colour:'#'+[1,3,5].map(i=>Math.round(parseInt(colour.slice(i,i+2),16)*.72).toString(16).padStart(2,'0')).join('')
  if(composition){
    const fieldColour=appearanceColour(composition.input.fieldColour),jointColour=appearanceColour(composition.input.grainColour)
    // Both alternatives share the authored finish composition. Only the
    // removable floor retains the actual3mm inter-component release joints.
    for(const[band,box]of kit.bands.entries())add(`oak-composition/base/${band}`,floorRect(box),mode==='fixed'?fieldColour:jointColour,undefined,0)
    for(const component of composition.components)for(const zone of component.zones){
      add(zone.id,floorRect(zone.box,.1),appearanceColour(zone.colour),undefined,0)
      const[a,b,c,d]=zone.box,spacing=composition.input.grainSpacingMm
      const from=zone.grainAxis==='x'?b:a,to=zone.grainAxis==='x'?d:c
      for(let station=Math.ceil((from+3)/spacing)*spacing;station<to-3;station+=spacing){
        const line:Box=zone.grainAxis==='x'?[a+3,station,c-3,station+.65]:[station,b+3,station+.65,d-3]
        if(good(line))add(`${zone.id}/grain/${station}`,floorRect(line,.2),jointColour,undefined,0,composition.input.grainOpacity)
      }
    }
  }
  // The retained uncomposed reference remains available without changing its
  // geometry or inventing a finish choice for an existing saved document.
  if(!composition&&mode==='fixed')for(const [band,box]of kit.bands.entries())add(`fixed-floor/${band}`,floorRect(box),palette.floor[1]!,palette.floor[1]!,0)
  else if(!composition)for(const part of kit.floor.parts)for(const [i,face]of part.facePieces.entries())add(`${part.id}/face/${i}`,floorRect(face),palette.floor[(part.band+i+Math.round(part.box[0]/300))%4]!,night?'#504c3d':'#79684e',.45)
  if(!composition&&mode==='fixed')for(const [band,box]of kit.bands.entries())for(let x=box[0]+(kit.request.wearingFace==='oak'?104:600);x<box[2];x+=(kit.request.wearingFace==='oak'?104:600))add(`fixed-strip/${band}/${x}`,floorRect([x,box[1],x+1,box[3]],.1),night?'#605342':'#846c4d',undefined,0)
  if(!composition&&kit.request.wearingFace==='oak')for(const part of kit.floor.parts)for(const [i,face]of part.facePieces.entries()){
    const [a,b,c,d]=face
    for(let j=1;j<4;j++){
      const x=a+(c-a)*j/4
      add(`${part.id}/grain/${i}/${j}`,floorRect([x,b+6,x+.65,d-6],.2),night?'#9c8360':'#d0b58a',undefined,0,.2)
    }
  }
  const floorFaces=faces.splice(0)
  const wallGroups=assembly.walls.map(wall=>{
    const group:Face[]=[]
    const put=(id:string,points:readonly Point[],colour:string,line=palette.line,width=.55,opacity=1)=>group.push({id,points,colour,line,width,opacity})
    const rect=(id:string,box:Box,colour:string,line=palette.line,width=.55,depth=0)=>put(id,wallRect(wall,box,depth),colour,line,width)
    rect(wall.id+'/base',[wall.fromMm,0,wall.toMm,ceiling],mode==='fixed'?palette.cream:palette.wall,palette.line,.65)
    const fieldTop=assembly.design.topMm
    rect(wall.id+'/upper-frieze',[wall.fromMm,fieldTop,wall.toMm,ceiling],palette.cream,palette.line,.4,1)
    if(mode==='fixed'){
      const datums=[wall.fromMm+wall.retainedCornerStopMm,wall.toMm-wall.retainedCornerStopMm,...wall.reserves.flatMap(reserve=>[reserve.box[0],reserve.box[2]])]
        .filter(n=>n>=wall.fromMm+wall.retainedCornerStopMm&&n<=wall.toMm-wall.retainedCornerStopMm).sort((a,b)=>a-b).filter((n,i,a)=>i===0||a[i-1]!==n)
      rect(wall.id+'/fixed-wainscot',[wall.fromMm,150,wall.toMm,900],palette.panel,palette.panel,0,2)
      for(let i=1;i<datums.length;i++){const a=datums[i-1]!,b=datums[i]!,count=Math.max(1,Math.ceil((b-a)/900))
        for(let j=0;j<count;j++){const box:Box=[a+(b-a)*j/count+30,190,a+(b-a)*(j+1)/count-30,870]
          if(good(box)&&box[2]-box[0]>60){rect(`${wall.id}/fixed-field/${i}/${j}`,box,palette.inset,night?'#98a08f':'#edf0e3',1,3);rect(`${wall.id}/fixed-shadow/${i}/${j}`,inset(box,6),palette.inset,night?'#424d45':'#a0aa99',.55,3.1)}
        }
      }
      rect(wall.id+'/fixed-dado',[wall.fromMm,890,wall.toMm,916],palette.trim,palette.line,.5,4)
    }
    // Each actual cassette retains its own complete stop/moulding. No decorative line bridges adjacent moving faces.
    for(const part of mode==='removable'?wall.pieces:[]){
      const box=part.faceBox
      rect(part.id,box,palette.panel,palette.line,.35,2)
      const visualInset=inset(box,22)
      if(good(visualInset)&&visualInset[3]-visualInset[1]>60&&visualInset[2]-visualInset[0]>60){
        rect(part.id+'/moulding-trial',visualInset,palette.inset,night?'#98a08f':'#edf0e3',1,3)
        rect(part.id+'/moulding-shadow',inset(visualInset,5),palette.inset,night?'#424d45':'#a0aa99',.55,3.1)
      }
      if(part.family==='gravity-hung-cassette')rect(part.localStopId,[part.box[0]+1.5,part.box[3]-assembly.design.releasePocketMm,part.box[2]-1.5,part.box[3]],palette.trim,palette.line,.35,4)
    }
    for(const reserve of wall.reserves){
      if(reserve.role==='retained-mineral-window-surround'||reserve.role==='retained-emitter-background'||reserve.role==='retained-structural-pilaster-return')rect(reserve.id,reserve.box,palette.cream,palette.cream,0,5)
      if(reserve.role==='retained-protected-door-strip'){
        rect(reserve.id+'/unqualified-head',reserve.box,lighting?'#c7c7bd':night?'#777a6d':'#dddccf',palette.line,.5,5)
        if(lighting)for(let z=reserve.box[1]+90;z<reserve.box[3];z+=90)rect(reserve.id+'/withheld-profile/'+z,[reserve.box[0]+10,z,reserve.box[2]-10,z+1.5],'#a5aaa0',undefined,0,5.1)
      }
    }
    for(const trim of wall.trims){
      rect(trim.id,[trim.intervalMm[0]!,0,trim.intervalMm[1]!,trim.heightMm],night?'#414c44':'#adb5a4',palette.line,.4,6)
      rect(trim.id+'/cap',[trim.intervalMm[0]!,trim.heightMm-12,trim.intervalMm[1]!,trim.heightMm],palette.trim,palette.line,.35,7)
    }
    // Cornice is an impression at the source ceiling/top datums; profile and finish are not product qualifications.
    rect(wall.id+'/cornice-light',[wall.fromMm,fieldTop+38,wall.toMm,fieldTop+58],palette.cream,palette.cream,0,8)
    rect(wall.id+'/cornice-shadow',[wall.fromMm,fieldTop+12,wall.toMm,fieldTop+23],night?'#878b7a':'#a5ad9e',undefined,0,8)
    const windows=kit.wall.boundRoomOpenings.filter(window=>window.wall==='outer-'+wall.id)
    for(const window of windows){
      const active='GROUND/'+window.id===kit.opening.id
      const [a,sill,b,head]=active?kit.opening.box:[window.centre-window.width/2,window.sill,window.centre+window.width/2,window.head]
      const sourceSpring='spring' in window?window.spring:undefined
      if(typeof sourceSpring!=='number'||!Number.isFinite(sourceSpring))throw new Error('STUDY_PERSPECTIVE_MISSING_WINDOW_SPRING')
      const centre=(a+b)/2,spring=sourceSpring+(head-window.head),rise=head-spring,radius=(b-a)**2/(8*rise)+rise/2
      if(!(rise>0))throw new RangeError('STUDY_PERSPECTIVE_INVALID_WINDOW_ARCH')
      const outline=[wallPoint(wall,a,sill,10),...Array.from({length:41},(_,i)=>{const x=a+(b-a)*i/40;return wallPoint(wall,x,spring+Math.sqrt(Math.max(0,radius**2-(x-centre)**2))-(radius-rise),10)}),wallPoint(wall,b,sill,10)]
      put('GROUND/'+window.id+'/glass',outline,palette.glass,palette.cream,5)
      const archHeight=(x:number)=>spring+Math.sqrt(Math.max(0,radius**2-(x-centre)**2))-(radius-rise)
      for(const x of[a+(b-a)/3,a+2*(b-a)/3])rect(window.id+'/mullion/'+x,[x-6,sill,x+6,archHeight(x)-5],palette.cream,palette.cream,0,12)
      for(const z of[sill+(spring-sill)/3,sill+2*(spring-sill)/3])rect(window.id+'/transom/'+z,[a,z-7,b,z+7],palette.cream,palette.cream,0,12)
      rect(window.id+'/sill',[a-26,sill-25,b+26,sill-8],palette.cream,palette.line,.4,18)
    }
    if(wall.id==='south'){
      const [x,,z]=kit.grille.actualRetainedInlet.stationDatumMm,radius=Math.max(kit.grille.actualRetainedInlet.completeOD,kit.grille.actualRetainedInlet.retainedReceiverID)/2+kit.grilleKeepOut.trialTrimMm
      rect(assembly.serviceAccess.id,assembly.serviceAccess.boxXZMm,palette.panel,palette.line,.55,8)
      rect('G1/grille-reservation',[x-radius,z-radius,x+radius,z+radius],night?'#4b4e44':'#9a9f8e',palette.line,.5,9)
      for(let i=1;i<9;i++)rect('G1/grille-bar/'+i,[x-radius+18,z-radius+2*radius*i/9,x+radius-18,z-radius+2*radius*i/9+3],night?'#9b986f':'#c5bd91',undefined,0,10)
    }
    return{faces:group,depth:((wall.axis==='x'?Math.abs(camera.eyeMm[1]-wall.fixedMm):Math.abs(camera.eyeMm[0]-wall.fixedMm)))}
  })
  faces.push(...floorFaces,...wallGroups.sort((a,b)=>b.depth-a.depth).flatMap(group=>group.faces))
  const furniture:Face[]=[]
  const cuboid=(id:string,box:Box,bottom:number,top:number,colour:string)=>{
    const[a,b,c,d]=box
    for(const[side,points]of[[0,[[a,b,bottom],[c,b,bottom],[c,b,top],[a,b,top]]],[1,[[c,b,bottom],[c,d,bottom],[c,d,top],[c,b,top]]],[2,[[c,d,bottom],[a,d,bottom],[a,d,top],[c,d,top]]],[3,[[a,d,bottom],[a,b,bottom],[a,b,top],[a,d,top]]],[4,[[a,b,top],[c,b,top],[c,d,top],[a,d,top]]]]as const){furniture.push({id:id+'/'+side,points,colour,line:night?'#242f2a':'#5d6559',width:.6})}
  }
  const occupied=(id:string)=>{const result=kit.occupied.find(([key])=>key===id)?.[1];if(!result)throw new Error('STUDY_PERSPECTIVE_MISSING_'+id);return result}
  const desk=occupied('study-desk'),chair=occupied('study-chair'),emitter=occupied('service-emitter-study-W')
  // Heights are the explicit existing furnished-view impression, not actual surveyed furniture/product geometry.
  cuboid('study-desk/top',desk,700,730,night?'#594e3b':'#766046')
  for(const x of[desk[0]+70,desk[2]-95])for(const y of[desk[1]+60,desk[3]-85])cuboid('study-desk/leg/'+x+'/'+y,[x,y,x+25,y+25],0,700,night?'#403e31':'#5c503c')
  const seat:Box=[chair[0]+185,chair[1]+110,chair[2]-185,chair[3]-155]
  cuboid('study-chair/seat',seat,430,454,night?'#424c39':'#72816b')
  cuboid('study-chair/back',[seat[0],seat[3]-32,seat[2],seat[3]],454,887,night?'#424c39':'#72816b')
  for(const x of[seat[0]+15,seat[2]-35])for(const y of[seat[1]+15,seat[3]-35])cuboid('study-chair/leg/'+x+'/'+y,[x,y,x+20,y+20],0,430,night?'#333c31':'#59634e')
  cuboid('service-emitter-study-W',emitter,115,710,night?'#93947c':'#cccbb7')

  if(lighting){
    const h=lighting.construction.localHomeRunComparison,a=lighting.circuit.applianceLead,f=a.fitting,cx=h.cableOpening.centreXMm,cz=h.cableOpening.centreZMm
    const northRect=(id:string,box:Box,y:number,colour:string,line='#5b625b',width=.6)=>furniture.push({id,points:[[box[0],y,box[1]],[box[2],y,box[1]],[box[2],y,box[3]],[box[0],y,box[3]]],colour,line,width})
    // Paid95mm development bay and actual existing panel recuts; no invented permanent-fabric chase.
    northRect('IAS/NORTH/paid-local-bay',[h.bayPlanMm[0]!,h.finishBottomZMm+kit.floor.jointMm/2,h.bayPlanMm[2]!,h.finishTopZMm],h.frontYMm,mode==='removable'?palette.panel:palette.cream)
    for(const side of[h.bayPlanMm[0]!,h.bayPlanMm[2]!])furniture.push({id:'IAS/NORTH/bay-return/'+side,points:[[side,h.frontYMm,h.finishBottomZMm],[side,h.bayPlanMm[3]!,h.finishBottomZMm],[side,h.bayPlanMm[3]!,h.finishTopZMm],[side,h.frontYMm,h.finishTopZMm]],colour:palette.trim,line:palette.line,width:.5})
    const [ml,mb,mr,mt]=h.carrierXZMm
    northRect('IAS/NORTH/independently-retained-module-face',[ml!,mb!,mr!,mt!],h.frontYMm-.5,mode==='removable'?palette.inset:palette.cream)
    for(const box of h.boxes){const x=(box.xMm[0]!+box.xMm[1]!)/2,z=(box.zMm[0]!+box.zMm[1]!)/2
      northRect(box.id+'/86mm-plate',[x-43,z-43,x+43,z+43],h.frontYMm-1,'#c4c4b8')
      if(box!==h.boxes[2])northRect(box.id+'/control-indication',[x-10,z-14,x+10,z+14],h.frontYMm-2,'#797d73')
    }
    const circleXZ=(id:string,x:number,y:number,z:number,radius:number,colour:string)=>furniture.push({id,points:Array.from({length:32},(_,i)=>{const q=2*Math.PI*i/32;return[x+radius*Math.cos(q),y,z+radius*Math.sin(q)]as Point}),colour,line:'#464d48',width:.6})
    circleXZ('IAS/NORTH/Type80W1/90mm-wall-plate',cx,h.frontYMm-2,cz,f.wallPlateDiameterMm/2,'#525957')
    // The cone is an unlit appearance silhouette within published145x160/260 reach
    // and the larger authored downward envelope. It is not proprietary product CAD.
    const shadeY=h.frontYMm-f.projectionMm+f.shadeWidthMm/2,shadeTop=cz+Math.min(f.authoredDownwardEnvelopeZFromMountMm[1]!-5,f.shadeHeightMm/4),shadeBottom=shadeTop-f.shadeHeightMm
    const small=f.shadeWidthMm*.20,large=f.shadeWidthMm/2
    for(let i=0;i<32;i++){const q=2*Math.PI*i/32,t=2*Math.PI*(i+1)/32
      furniture.push({id:'IAS/NORTH/Type80W1/shade-impression/'+i,points:[[cx+small*Math.cos(q),shadeY+small*Math.sin(q),shadeTop],[cx+large*Math.cos(q),shadeY+large*Math.sin(q),shadeBottom],[cx+large*Math.cos(t),shadeY+large*Math.sin(t),shadeBottom],[cx+small*Math.cos(t),shadeY+small*Math.sin(t),shadeTop]],colour:i<16?'#4c5452':'#616966',line:'#424c47',width:.3})
    }
    furniture.push({id:'IAS/NORTH/Type80W1/short-stem-impression',points:[[cx-3,h.frontYMm-2,cz-3],[cx+3,h.frontYMm-2,cz+3],[cx+3,shadeY,cz+3],[cx-3,shadeY,cz-3]],colour:'#555d59',line:'#464e48',width:.5})
    for(const volume of a.nominalFixedVolumes.filter(v=>v.id.includes('guide')||v.id.includes('plug'))){const v=volume.xyzxyzMm
      cuboid(volume.id,[v[0],v[1],v[3],v[4]],v[2],v[5],volume.id.includes('plug')?'#e1dfd2':'#70776d')
    }
    // The real rounded425mm/R50 cable, not a decorative substitute or a hidden coil.
    for(let i=1;i<a.pathMm.length;i++){const u=a.pathMm[i-1]!,v=a.pathMm[i]!,dx=v[0]!-u[0]!,dz=v[2]!-u[2]!,len=Math.hypot(dx,dz);if(len<1e-8)continue
      const ox=dz/len*a.diameterRequirementMm/2,oz=-dx/len*a.diameterRequirementMm/2
      furniture.push({id:'IAS/NORTH/Type80W1/actual-flex/'+i,points:[[u[0]!+ox,u[1]!,u[2]!+oz],[v[0]!+ox,v[1]!,v[2]!+oz],[v[0]!-ox,v[1]!,v[2]!-oz],[u[0]!-ox,u[1]!,u[2]!-oz]],colour:'#414944',line:'#414944',width:.1})
    }
  }

  const p=projector(camera,1000,1000)
  furniture.sort((a,b)=>b.points.reduce((sum,point)=>sum+p.depth(point),0)/b.points.length-a.points.reduce((sum,point)=>sum+p.depth(point),0)/a.points.length)
  faces.push(...furniture)
  return{faces,palette,ceiling,windowIds:kit.wall.boundRoomOpenings.map(window=>'GROUND/'+window.id),camera,mode,tone,oak}
}

export function drawStudyRoomPerspective(kit:StudyRoomKit,assembly:Assembly,transition:Transition,tone:'day'|'evening'='day',north?:NorthLighting){
  if(tone!=='day'&&tone!=='evening')throw new TypeError('STUDY_PERSPECTIVE_TONE_UNSUPPORTED')
  if(north)checkNorthLightingSource(kit,north.lighting)
  const camera=north?.camera??studyPerspectiveCamera(kit),width=1000,height=1000,project=projector(camera,width,height)
  const source={roomId:kit.source.roomId,bindingDigest:kit.source.bindingDigest,roomKitCaseDigest:kit.caseDigest,assemblyInputDigest:assembly.source.inputDigest,...(kit.floor.oakComposition?{oakCompositionDigest:kit.floor.oakComposition.digest}:{}),...(kit.structuralConsequence?{structuralConsequenceDigest:kit.structuralConsequence.digest,controllingFloorWidthMm:kit.structuralConsequence.source.native.widthMm}:{}),...(north?{lightingCaseDigest:north.lighting.caseDigest,circuitDesignDigest:north.lighting.circuit.designDigest,view:'north-lighting',fittingGeometryQualified:false}:{})}
  const scenes=(['fixed','removable']as const).map(mode=>roomScene(kit,assembly,transition,mode,tone,camera,north?.lighting))
  const drawings=scenes.map(scene=>scene.faces.map(face=>{
    const points=project.clip(face.points);if(points.length<3)return''
    return`<polygon data-source-id="${escape(face.id)}" points="${points.map(p=>p.join(',')).join(' ')}" fill="${face.colour}" stroke="${face.line??'none'}" stroke-width="${face.width??0}" opacity="${face.opacity??1}" stroke-linejoin="round"/>`
  }).join(''))
  let northDetails=''
  if(north){
    const light=north.lighting,h=light.construction.localHomeRunComparison,a=light.circuit.applianceLead,cx=h.cableOpening.centreXMm,cz=h.cableOpening.centreZMm
    const closeCamera:Camera={eyeMm:[cx+750,h.frontYMm-700,1700],targetMm:[cx,h.frontYMm,1745],horizontalFieldDegrees:50},closeProject=projector(closeCamera,1000,650)
    const closeScene=roomScene(kit,assembly,transition,'removable','day',closeCamera,light)
    const closeDrawing=closeScene.faces.map(face=>{const p=closeProject.clip(face.points);return p.length<3?'':`<polygon data-source-id="detail/${escape(face.id)}" points="${p.map(q=>q.join(',')).join(' ')}" fill="${face.colour}" stroke="${face.line??'none'}" stroke-width="${face.width??0}" opacity="${face.opacity??1}"/>`}).join('')
    const E=(x:number)=>60+(x-h.bayPlanMm[0]!)*.75,Z=(z:number)=>625-(z-1400)*.75
    const er=(id:string,b:readonly number[],fill:string,dash=false)=>`<rect data-source-id="elevation/${id}" x="${r(E(b[0]!))}" y="${r(Z(b[3]!))}" width="${r((b[2]!-b[0]!)*.75)}" height="${r((b[3]!-b[1]!)*.75)}" fill="${fill}" stroke="#636f64" stroke-width="1"${dash?' stroke-dasharray="5 4"':''}/>`
    const et=(x:number,y:number,text:string,size=20)=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="#37463b">${escape(text)}</text>`
    let elevation=er('bay',[h.bayPlanMm[0]!,1400,h.bayPlanMm[2]!,h.finishTopZMm],'#e0e3d6')+er('hidden-carrier',h.carrierXZMm,'none',true)
    elevation+=er('downward-envelope',[cx-a.fitting.shadeWidthMm/2,cz+a.fitting.authoredDownwardEnvelopeZFromMountMm[0]!,cx+a.fitting.shadeWidthMm/2,cz+a.fitting.authoredDownwardEnvelopeZFromMountMm[1]!],'none',true)
    for(const box of h.boxes.filter(q=>q.zMm[1]!>=1400)){const x=(box.xMm[0]!+box.xMm[1]!)/2,z=(box.zMm[0]!+box.zMm[1]!)/2;elevation+=er(box.id+'/plate',[x-43,z-43,x+43,z+43],'#c5c8bd')}
    for(const volume of a.nominalFixedVolumes.filter(v=>v.id.includes('guide')||v.id.includes('plug'))){const b=volume.xyzxyzMm;elevation+=er(volume.id,[b[0],b[2],b[3],b[5]],volume.id.includes('plug')?'#eeeadd':'#7e887b')}
    elevation+=`<polyline points="${a.pathMm.map(p=>[r(E(p[0]!)),r(Z(p[2]!))].join(',')).join(' ')}" fill="none" stroke="#394a3e" stroke-width="4"/>`
    elevation+=et(410,115,`${h.totalDepthMm} mm paid local bay`)+et(410,155,`${a.fitting.projectionMm} mm complete reach reservation`)+et(410,195,`${r(a.lengthMm)} mm visible flex / R${a.radiusMm}`)+et(410,235,'Dashed: retained carrier / maintenance envelope')+et(410,315,'Ordinary preparation',25)+et(410,355,'1. Isolate B6; return shade downward; unplug.')+et(410,395,'2. Support fitting; release mount and both clips.')+et(410,435,'3. Carry to the same source desk rest.')+et(410,475,'4. Socket, bay and carrier stay independently supported.')+et(410,545,'Product CAD, fixings/packing and loaded handling unqualified.',18)
    northDetails=`<defs><clipPath id="north-junction-detail"><rect width="1000" height="650"/></clipPath></defs><g fill="#37463b" font-family="Georgia,serif" font-size="27"><text x="60" y="1350">Accessible plug, flex and removable fitting</text><text x="1100" y="1350">Same geometry · upper bay elevation</text></g><g transform="translate(60,1380)" clip-path="url(#north-junction-detail)"><rect width="1000" height="650" fill="#eeeee2"/>${closeDrawing}</g><g transform="translate(1100,1380)">${elevation}</g><text x="60" y="2080" font-family="Arial,sans-serif" font-size="18" fill="#465148">Source kit ${escape(kit.caseDigest.slice(0,12))} · lighting ${escape(light.caseDigest.slice(0,12))}. Unlit appearance/assembly proposal; owner acceptance remains open.</text>`
  }

  const title=north?'The Study north wall · ordinary light and renewable room':kit.structuralConsequence?`The Study · SW${kit.structuralConsequence.source.native.widthMm} ${tone==='day'?'room proposal':'evening colour study'}`:tone==='day'?'The Study · a room made in pieces':'The Study · an evening colour study'
  const scope=north?`Unselected Type80W1 development · shared saved room · ${north.lighting.construction.localHomeRunComparison.totalDepthMm}mm local station`:kit.structuralConsequence?'Unselected structural-room proposal':'Current occupied room'
  const description=(north?`Source-bound north-facing view: accessible${(north.lighting.construction.localHomeRunComparison.boxes[2]!.zMm[0]!+north.lighting.construction.localHomeRunComparison.boxes[2]!.zMm[1]!)/2}mm lighting outlet,${r(north.lighting.circuit.applianceLead.lengthMm)}mm/R${north.lighting.circuit.applianceLead.radiusMm} lead and ordinary removable clips. Device silhouettes are impressions inside authored envelopes; protected door profile, product CAD and full articulation remain unqualified. `:'')+'Matched eye-level fixed and removable finish impressions from the same current occupied Study. Exact floor faces, wall cassettes, opening geometry and furniture footprints; palettes, glazing bars, moulding impressions and furniture heights are presentation trials. No daylight, electric-light or material performance is simulated.'
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="2160" height="${north?2125:1315}" viewBox="0 0 2160 ${north?2125:1315}" role="img" aria-labelledby="title desc"><title id="title">${title}</title><desc id="desc">${description}</desc><metadata>${escape(JSON.stringify({schema:'ias-study-eye-level/1',source,camera,tone,claims:{ownerAcceptance:false,photometricSimulation:false,constructedProfile:false,installedFurnitureDimensions:false,tileWetRoomAcceptance:false,installedAssemblies:false,...(north?{fullArticulationQualified:false,fittingCadQualified:false,doorLeafAndHeadProfileQualified:false}:{})}}))}</metadata><defs><clipPath id="left-view"><rect width="1000" height="1000"/></clipPath><clipPath id="right-view"><rect width="1000" height="1000"/></clipPath></defs><rect width="2160" height="${north?2125:1315}" fill="${tone==='day'?'#f2f0e8':'#e7e5db'}"/><g fill="#303c36"><text x="60" y="65" font-family="Georgia,serif" font-size="40">${title}</text><text x="60" y="101" font-family="Arial,sans-serif" font-size="18">${scope} · the same eye point, windows and furniture in both alternatives</text><text x="60" y="150" font-family="Georgia,serif" font-size="25">Fixed wainscot and mineral wall</text><text x="1100" y="150" font-family="Georgia,serif" font-size="25">${assembly.face==='oak'?'Gravity-hung timber faces':'Independent mineral faces'} · seated ${kit.request.wearingFace==='oak'?'oak':'mineral'} floor</text></g><g data-study-view="fixed" data-study-viewport="0 0 ${width} ${height}" transform="translate(60,175)" clip-path="url(#left-view)"><rect width="1000" height="1000" fill="${scenes[0]!.palette.cream}"/>${drawings[0]}</g><g data-study-view="removable" data-study-viewport="0 0 ${width} ${height}" transform="translate(1100,175)" clip-path="url(#right-view)"><rect width="1000" height="1000" fill="${scenes[1]!.palette.cream}"/>${drawings[1]}</g><g fill="#465148" font-family="Arial,sans-serif" font-size="17"><text x="60" y="1215">Bound geometry: ${assembly.walls.length} walls · ${assembly.schedule.movingFaceCount} wall faces · ${kit.floor.parts.length} floor pieces · south window at X${kit.opening.occupiedCentreMm} mm.</text><text x="60" y="1244">${north?`North light:${north.lighting.construction.localHomeRunComparison.totalDepthMm}mm paid bay ·${(north.lighting.construction.localHomeRunComparison.boxes[2]!.zMm[0]!+north.lighting.construction.localHomeRunComparison.boxes[2]!.zMm[1]!)/2}mm outlet ·${r(north.lighting.circuit.applianceLead.lengthMm)}mm visible flex · clips/plug removed before floor renewal.`:'Colours, glazing bars and local moulding impressions are appearance trials. Furniture footprints are bound; heights follow the existing view convention.'}</text><text x="60" y="1273">${north?'Unlit shape/finish impressions only; protected door leaf/head profile withheld. No productCAD, photometry or full-articulation claim.':tone==='evening'?'Evening palette only: no lamp output, circuit, illuminance or glare result.':'Day palette only: no sun position, measured daylight or exterior site is assumed.'} Owner appearance judgement remains open.</text></g>${northDetails}</svg>\n`
  return{schema:'ias-study-eye-level/1' as const,source,camera,tone,sceneDigest:sha256SemanticFingerprint({source,camera,tone,geometry:scenes.map(scene=>scene.faces)}),svg}
}
