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
type Face = { readonly id: string; readonly points: readonly Point[]; readonly colour: string; readonly line?: string; readonly width?: number; readonly opacity?: number }
const r = (n: number) => Number(n.toFixed(3))
const escape = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')
const subtract = (a: Point, b: Point): Point => [a[0]-b[0],a[1]-b[1],a[2]-b[2]]
const dot = (a: Point,b: Point) => a.reduce((sum,v,i)=>sum+v*b[i]!,0)
const cross = (a: Point,b: Point): Point => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const unit = (a: Point): Point => { const length=Math.hypot(...a); if(length<1e-9)throw new RangeError('STUDY_PERSPECTIVE_CAMERA_DEGENERATE'); return a.map(v=>v/length) as unknown as Point }

/** Pinhole drawing only: no illuminance, product material or installed room claim. */
export function studyPerspectiveCamera(kit: StudyRoomKit): Camera {
  const [a,b,c]=kit.bands
  if(!a||!b||!c||kit.bands.length!==3)throw new RangeError('STUDY_PERSPECTIVE_UNSUPPORTED_ROOM')
  return { eyeMm:[c[2]-280,c[3]-190,1550], targetMm:[a[0]+(b[2]-a[0])*.43,a[1]+170,1550], horizontalFieldDegrees:78 }
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

function roomScene(kit:StudyRoomKit,assembly:Assembly,transition:Transition,mode:'fixed'|'removable',tone:'day'|'evening',camera:Camera){
  if(kit.source.bindingDigest!==assembly.source.bindingDigest)throw new Error('STUDY_PERSPECTIVE_MIXED_ROOM_SOURCE')
  if(kit.wall.boundRoomOpenings.length!==3||!kit.occupied.some(([id])=>id==='study-desk')||!kit.occupied.some(([id])=>id==='study-chair'))throw new Error('STUDY_PERSPECTIVE_MISSING_BOUND_ROOM')
  const ceiling=transition.field.ceilingZMm,night=tone==='evening',oak=assembly.face==='oak'
  const palette=night?{wall:'#535b58',panel:'#59635c',inset:'#636e64',trim:'#788174',cream:'#d0c9b8',floor:['#775d40','#826a4a','#8e7351','#6e5a42'],line:'#323b37',glass:'#354c58'}
    :{wall:'#b9bdb0',panel:'#bec4b5',inset:'#cbd0c1',trim:'#d9dace',cream:'#ebe9de',floor:['#9b7952','#a58359','#b18e62','#96754f'],line:'#777f72',glass:'#c4d3d4'}
  const faces:Face[]=[]
  const add=(id:string,points:readonly Point[],colour:string,line=palette.line,width=.55,opacity=1)=>faces.push({id,points,colour,line,width,opacity})
  // The removable floor keeps every actual wear-face polygon. The fixed control uses the same room boundary with its own continuous strip-floor impression.
  if(mode==='fixed')for(const [band,box]of kit.bands.entries())add(`fixed-floor/${band}`,floorRect(box),palette.floor[1]!,palette.floor[1]!,0)
  else for(const part of kit.floor.parts)for(const [i,face]of part.facePieces.entries())add(`${part.id}/face/${i}`,floorRect(face),palette.floor[(part.band+i+Math.round(part.box[0]/300))%4]!,night?'#504c3d':'#79684e',.45)
  if(mode==='fixed')for(const [band,box]of kit.bands.entries())for(let x=box[0]+104;x<box[2];x+=104)add(`fixed-strip/${band}/${x}`,floorRect([x,box[1],x+1,box[3]],.1),night?'#605342':'#846c4d',undefined,0)
  for(const part of kit.floor.parts)for(const [i,face]of part.facePieces.entries()){
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
      if(reserve.role==='retained-mineral-window-surround'||reserve.role==='retained-emitter-background')rect(reserve.id,reserve.box,palette.cream,palette.cream,0,5)
      if(reserve.role==='retained-protected-door-strip')rect(reserve.id+'/unqualified-head',reserve.box,night?'#777a6d':'#dddccf',palette.line,.5,5)
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
  const p=projector(camera,1000,1000)
  furniture.sort((a,b)=>b.points.reduce((sum,point)=>sum+p.depth(point),0)/b.points.length-a.points.reduce((sum,point)=>sum+p.depth(point),0)/a.points.length)
  faces.push(...furniture)
  return{faces,palette,ceiling,windowIds:kit.wall.boundRoomOpenings.map(window=>'GROUND/'+window.id),camera,mode,tone,oak}
}

export function drawStudyRoomPerspective(kit:StudyRoomKit,assembly:Assembly,transition:Transition,tone:'day'|'evening'='day'){
  if(tone!=='day'&&tone!=='evening')throw new TypeError('STUDY_PERSPECTIVE_TONE_UNSUPPORTED')
  const camera=studyPerspectiveCamera(kit),width=1000,height=1000,project=projector(camera,width,height)
  const source={roomId:kit.source.roomId,bindingDigest:kit.source.bindingDigest,roomKitCaseDigest:kit.caseDigest,assemblyInputDigest:assembly.source.inputDigest}
  const scenes=(['fixed','removable']as const).map(mode=>roomScene(kit,assembly,transition,mode,tone,camera))
  const drawings=scenes.map(scene=>scene.faces.map(face=>{
    const points=project.clip(face.points);if(points.length<3)return''
    return`<polygon data-source-id="${escape(face.id)}" points="${points.map(p=>p.join(',')).join(' ')}" fill="${face.colour}" stroke="${face.line??'none'}" stroke-width="${face.width??0}" opacity="${face.opacity??1}" stroke-linejoin="round"/>`
  }).join(''))
  const title=tone==='day'?'The Study · a room made in pieces':'The Study · an evening colour study'
  const description='Matched eye-level fixed and removable finish impressions from the same current occupied Study. Exact floor faces, wall cassettes, opening geometry and furniture footprints; palettes, glazing bars, moulding impressions and furniture heights are presentation trials. No daylight, electric-light or material performance is simulated.'
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="2160" height="1315" viewBox="0 0 2160 1315" role="img" aria-labelledby="title desc"><title id="title">${title}</title><desc id="desc">${description}</desc><metadata>${escape(JSON.stringify({schema:'ias-study-eye-level/1',source,camera,tone,claims:{ownerAcceptance:false,photometricSimulation:false,constructedProfile:false,installedFurnitureDimensions:false}}))}</metadata><defs><clipPath id="left-view"><rect width="1000" height="1000"/></clipPath><clipPath id="right-view"><rect width="1000" height="1000"/></clipPath></defs><rect width="2160" height="1315" fill="${tone==='day'?'#f2f0e8':'#e7e5db'}"/><g fill="#303c36"><text x="60" y="65" font-family="Georgia,serif" font-size="40">${title}</text><text x="60" y="101" font-family="Arial,sans-serif" font-size="18">Current occupied room · the same eye point, windows and furniture in both alternatives</text><text x="60" y="150" font-family="Georgia,serif" font-size="25">Fixed wainscot and mineral wall</text><text x="1100" y="150" font-family="Georgia,serif" font-size="25">${assembly.face==='oak'?'Gravity-hung timber faces':'Independent mineral faces'} · seated ${kit.request.wearingFace==='oak'?'oak':'mineral'} floor</text></g><g transform="translate(60,175)" clip-path="url(#left-view)"><rect width="1000" height="1000" fill="${scenes[0]!.palette.cream}"/>${drawings[0]}</g><g transform="translate(1100,175)" clip-path="url(#right-view)"><rect width="1000" height="1000" fill="${scenes[1]!.palette.cream}"/>${drawings[1]}</g><g fill="#465148" font-family="Arial,sans-serif" font-size="17"><text x="60" y="1215">Bound geometry: ${assembly.walls.length} walls · ${assembly.schedule.movingFaceCount} wall faces · ${kit.floor.parts.length} floor pieces · south window at X${kit.opening.occupiedCentreMm} mm.</text><text x="60" y="1244">Colours, glazing bars and local moulding impressions are appearance trials. Furniture footprints are bound; heights follow the existing view convention.</text><text x="60" y="1273">${tone==='evening'?'Evening palette only: no lamp output, circuit, illuminance or glare result.':'Day palette only: no sun position, measured daylight or exterior site is assumed.'} Owner appearance judgement remains open.</text></g></svg>\n`
  return{schema:'ias-study-eye-level/1' as const,source,camera,tone,sceneDigest:sha256SemanticFingerprint({source,camera,tone,geometry:scenes.map(scene=>scene.faces)}),svg}
}
