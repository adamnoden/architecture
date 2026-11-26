import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../../core/identity.js'
import type { CurrentDesignResolution } from '../resolve.js'
import { readDistributedFloorCase } from '../structural-distributed-floor.js'

type Box = readonly [number,number,number,number]
type Occupied = readonly [string,Box]
export type StudyWallEdge = { readonly id:string; readonly axis:'x'|'y'; readonly fixedMm:number; readonly fromMm:number; readonly toMm:number; readonly normal:-1|1; readonly sourceWallId:string }
export type NativeSWGeometry = {
  readonly schema:'str-native-sw-section-geometry/1';readonly widthMm:number;readonly rectanglesXYMm:readonly Box[];
  readonly originXYMm:readonly[number,number];readonly slabZMm:readonly[number,number];readonly groundCapZMm:readonly[number,number];readonly centroidXYMm:readonly[number,number];
  readonly areaMm2:number;readonly sourceSHA256:Readonly<Record<string,string>>;readonly physicalGeometryMethod:string;
  readonly caseAccepted:false;readonly finishOrRoomGeometryIncluded:false;
}
const root=new URL('../../../../',import.meta.url),geometryPath='project/str/studies/finite_joint_geometry.py'
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)
const area=([a,b,c,d]:Box)=>(c-a)*(d-b)

/** Uses the SAME saved distributed-floor width. No second room-width input is admitted. */
export function readStudyStructuralGeometry(resolved:CurrentDesignResolution,distributedFloor:unknown):NativeSWGeometry|undefined{
  if(distributedFloor===undefined)return undefined
  if(!record(distributedFloor))throw new TypeError('STUDY_STRUCTURAL_FLOOR_CONTROL_INVALID')
  const admittedFields=['cornerWidthsMm','memberLaw','jointLaw','membraneLaw','edgeBand','maxPitchMm','edits','boundaryCase','receivingLaws','use']
  if(Object.keys(distributedFloor).some(key=>!admittedFields.includes(key)))throw new TypeError('STUDY_STRUCTURAL_UNEXPECTED_FLOOR_CONTROL')
  const current=readDistributedFloorCase(resolved).floor.comparison
  const defaults=current.cornerWidthsMm
  if(!record(defaults)||typeof defaults.SW!=='number')throw new Error('STUDY_STRUCTURAL_WIDTH_SOURCE_MISSING')
  const widths=distributedFloor.cornerWidthsMm??defaults
  if(!record(widths)||typeof widths.SW!=='number'||!Number.isFinite(widths.SW)||widths.SW<140||widths.SW>240)throw new RangeError('STUDY_STRUCTURAL_WIDTH_UNSUPPORTED')
  if(widths.SW===140)return undefined
  const geometry:NativeSWGeometry=JSON.parse(execFileSync('python3',['-B',fileURLToPath(new URL(geometryPath,root)),String(widths.SW),'--root',fileURLToPath(root)],{encoding:'utf8',maxBuffer:1024*1024}))
  if(geometry.schema!=='str-native-sw-section-geometry/1'||geometry.widthMm!==widths.SW||geometry.caseAccepted!==false||geometry.finishOrRoomGeometryIncluded!==false)throw new Error('STUDY_STRUCTURAL_GEOMETRY_SOURCE_MISMATCH')
  for(const[path,expected]of Object.entries(geometry.sourceSHA256)){
    const bytes=readFileSync(new URL(path,root)),hash=createHash('sha256').update(bytes).digest('hex'),blob=createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    if(hash!==expected||!resolved.disciplineBindings.some(binding=>binding.identities[path]===blob))throw new Error(`STUDY_STRUCTURAL_GEOMETRY_STALE:${path}`)
  }
  return geometry
}

function subtract(box:Box,reserve:Box):Box[]{
  const[a,b,c,d]=box,[x,y,z,w]=reserve,left=Math.max(a,x),right=Math.min(c,z),bottom=Math.max(b,y),top=Math.min(d,w)
  if(left>=right||bottom>=top)return[box]
  return([
    [a,b,left,d],[right,b,c,d],[left,b,right,bottom],[left,top,right,d],
  ]as Box[]).filter(([a,b,c,d])=>a<c&&b<d)
}

function sourceEdges(bands:readonly Box[]):StudyWallEdge[]{
  if(bands.length!==3||bands.some((b,i)=>b[0]!==bands[0]![0]||(i>0&&b[1]!==bands[i-1]![3]))||!(bands[0]![2]>bands[1]![2]&&bands[1]![2]>bands[2]![2]))throw new RangeError('STUDY_STRUCTURAL_BASE_ROOM_UNSUPPORTED')
  const[a,b,c]=bands as readonly[Box,Box,Box]
  return[
    {id:'south',sourceWallId:'outer-S',axis:'x',fixedMm:a[1],fromMm:a[0],toMm:a[2],normal:1},
    {id:'east-neck',sourceWallId:'wall:study-east',axis:'y',fixedMm:a[2],fromMm:a[1],toMm:a[3],normal:-1},
    {id:'cloak-south',sourceWallId:'wall:cloak-south',axis:'x',fixedMm:a[3],fromMm:b[2],toMm:a[2],normal:-1},
    {id:'cloak-west',sourceWallId:'wall:cloak-west',axis:'y',fixedMm:b[2],fromMm:b[1],toMm:b[3],normal:-1},
    {id:'cloak-north-return',sourceWallId:'wall:study-cloak-north',axis:'x',fixedMm:b[3],fromMm:c[2],toMm:b[2],normal:-1},
    {id:'door-east-return',sourceWallId:'wall:study-L-return',axis:'y',fixedMm:c[2],fromMm:c[1],toMm:c[3],normal:-1},
    {id:'north-door',sourceWallId:'wall:study-L-north',axis:'x',fixedMm:c[3],fromMm:c[0],toMm:c[2],normal:-1},
    {id:'west',sourceWallId:'outer-W',axis:'y',fixedMm:a[0],fromMm:a[1],toMm:c[3],normal:1},
  ]
}

export function deriveStudyStructuralContext(bands:readonly Box[],occupied:readonly Occupied[],finishDepthMm:number,geometry:NativeSWGeometry){
  const baselineEdges=sourceEdges(bands),[a,b,c]=bands as readonly[Box,Box,Box],rectangles=geometry.rectanglesXYMm
  if(geometry.schema!=='str-native-sw-section-geometry/1'||geometry.widthMm<=140||geometry.widthMm>240||rectangles.length!==2||!rectangles.every(r=>r.length===4&&r.every(Number.isFinite)&&area(r)>0)||!(finishDepthMm>0)||geometry.caseAccepted!==false||geometry.finishOrRoomGeometryIncluded!==false)throw new RangeError('STUDY_STRUCTURAL_GEOMETRY_UNSUPPORTED')
  const outerX=Math.min(...rectangles.map(r=>r[0])),outerY=Math.min(...rectangles.map(r=>r[1])),faceX=outerX+geometry.widthMm+finishDepthMm,faceY=outerY+geometry.widthMm+finishDepthMm
  const toeX=Math.max(...rectangles.map(r=>r[2]))+finishDepthMm,toeY=Math.max(...rectangles.map(r=>r[3]))+finishDepthMm
  if(JSON.stringify(rectangles)!==JSON.stringify([[outerX,outerY,outerX+geometry.widthMm,toeY-finishDepthMm],[outerX+geometry.widthMm,outerY,toeX-finishDepthMm,outerY+geometry.widthMm]])
    ||rectangles.reduce((sum,r)=>sum+area(r),0)!==geometry.areaMm2)throw new RangeError('STUDY_STRUCTURAL_RECTANGLE_MISMATCH')
  if(outerX+140+finishDepthMm!==a[0]||outerY+140+finishDepthMm!==a[1]||!(faceX<toeX&&faceY<a[3]&&toeY>b[1]&&toeY<b[3]&&toeX<a[2]))throw new RangeError('STUDY_STRUCTURAL_BASE_DATUM_MISMATCH')
  const finishReservations:readonly Box[]=[[outerX,outerY,faceX,toeY],[outerX,outerY,toeX,faceY]]
  const cuts=[...new Set(bands.flatMap(r=>[r[1],r[3]]).concat(finishReservations.flatMap(r=>[r[1],r[3]])))].filter(y=>y>=a[1]&&y<=c[3]).sort((x,y)=>x-y)
  const nextBands:Box[]=[]
  for(let i=1;i<cuts.length;i++){
    const bottom=cuts[i-1]!,top=cuts[i]!,original=bands.find(r=>r[1]<=bottom&&r[3]>=top)
    if(!original)throw new Error('STUDY_STRUCTURAL_FLOOR_GAP')
    const pieces=finishReservations.reduce<Box[]>((parts,reserve)=>parts.flatMap(p=>subtract(p,reserve)),[[original[0],bottom,original[2],top]])
    if(pieces.length!==1)throw new Error('STUDY_STRUCTURAL_FLOOR_TOPOLOGY_UNSUPPORTED')
    const piece=pieces[0]!,previous=nextBands.at(-1)
    if(previous&&previous[0]===piece[0]&&previous[2]===piece[2]&&previous[3]===piece[1])nextBands[nextBands.length-1]=[previous[0],previous[1],previous[2],piece[3]]
    else nextBands.push(piece)
  }
  if(nextBands.length!==5)throw new Error('STUDY_STRUCTURAL_EXPECTED_LOCAL_PILASTERS')
  const nativeEmitter=occupied.find(([id])=>id==='service-emitter-study-W')?.[1],desk=occupied.find(([id])=>id==='study-desk')?.[1]
  if(!nativeEmitter||!desk)throw new Error('STUDY_STRUCTURAL_MISSING_OCCUPIED_SOURCE')
  const placementGridMm=25,emitterEndClearanceMm=25,emitterNorthShiftMm=Math.max(0,Math.ceil((toeY+emitterEndClearanceMm-nativeEmitter[1])/placementGridMm)*placementGridMm)
  // Deliberate25mm furniture move preserves ordinary west-socket hand territory in the200mm comparison. It is not a second structural width.
  const deskEastShiftMm=25
  const nextOccupied=occupied.map(([id,box]):Occupied=>[id,id==='service-emitter-study-W'?[box[0],box[1]+emitterNorthShiftMm,box[2],box[3]+emitterNorthShiftMm]:id==='study-desk'?[box[0]+deskEastShiftMm,box[1],box[2]+deskEastShiftMm,box[3]]:box])
  const emitter=nextOccupied.find(([id])=>id==='service-emitter-study-W')![1]
  if(emitter[3]+5>c[1]||emitter[1]-4<=toeY||nextOccupied.some(([,box])=>finishReservations.some(reserve=>box[0]<reserve[2]&&box[2]>reserve[0]&&box[1]<reserve[3]&&box[3]>reserve[1])))throw new Error('STUDY_STRUCTURAL_OCCUPIED_CONFLICT')
  const walls=[...baselineEdges.map(edge=>edge.id==='south'?{...edge,fromMm:toeX}:edge.id==='west'?{...edge,fromMm:toeY}:edge),
    {id:'sw-west-toe',sourceWallId:'FLOOR/CORNER/SW/west-toe',axis:'x' as const,fixedMm:toeY,fromMm:a[0],toMm:faceX,normal:1 as const},
    {id:'sw-west-pilaster',sourceWallId:'FLOOR/CORNER/SW/west-face',axis:'y' as const,fixedMm:faceX,fromMm:faceY,toMm:toeY,normal:1 as const},
    {id:'sw-south-pilaster',sourceWallId:'FLOOR/CORNER/SW/south-face',axis:'x' as const,fixedMm:faceY,fromMm:faceX,toMm:toeX,normal:1 as const},
    {id:'sw-south-toe',sourceWallId:'FLOOR/CORNER/SW/south-toe',axis:'y' as const,fixedMm:toeX,fromMm:a[1],toMm:faceY,normal:1 as const},
  ]
  const source={controlPath:'stages.distributedFloor.cornerWidthsMm.SW',native:geometry,finishDepthMm,baseBands:bands,baseOccupied:occupied,
    layoutDecision:{placementGridMm,emitterEndClearanceMm,emitterNorthShiftMm,deskEastShiftMm,chairMoved:false,fixedEmitterPlinthSouthMeetsPierToe:true,
      renewalPreparation:{chairNorthTranslationMm:650,deskWestTranslationMm:20,deskNorthParkingTranslationMm:800,
        socketIsolatedAndUnplugged:true,restoreDailyFurnitureByReversingPreparation:true}}}
  return{schema:'ias-study-structural-consequence/1' as const,status:'source-bound-unselected-corner-consequence' as const,source,
    digest:sha256SemanticFingerprint(source),bands:nextBands,occupied:nextOccupied,walls,finishReservations,
    finishedFaceXYMm:[faceX,faceY]as const,finishedToeXYMm:[toeX,toeY]as const,roomAreaRemovedMm2:bands.reduce((sum,r)=>sum+area(r),0)-nextBands.reduce((sum,r)=>sum+area(r),0),
    unchanged:{openings:true,northDoor:true,chair:true,exteriorGlassCavity:true},
    invalidated:['Old144piece floor handling','Old BCR furniture/door/window operating paths','Emitter fixing and heating-tail arrangement','Old socket/floor-lamp clearance results'],
    acceptance:{structureSelected:false,emitterInstallation:false,renewalTrial:false,ownerAppearance:false},
  }
}
export type StudyStructuralContext=ReturnType<typeof deriveStudyStructuralContext>
