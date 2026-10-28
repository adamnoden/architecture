import type {DrawingPrimitiveV2,DrawingSceneV2} from './model.js'
import type {PublicationDrawingTokens} from '../publication-drawing/tokens.js'
import {renderDrawingSceneV2SvgWithTokens,formatDrawingNumberV2} from './svg.js'

/** Paper-space translation only: dimensions, strokes and type are never resized. */
export function translateDrawingPrimitive(node:DrawingPrimitiveV2,dx:number,dy:number):DrawingPrimitiveV2{
 if(!Number.isFinite(dx)||!Number.isFinite(dy))throw Error('Non-finite composition offset')
 const point=(p:{x:number;y:number})=>({x:p.x+dx,y:p.y+dy})
 if(node.kind==='line')return {...node,a:point(node.a),b:point(node.b)}
 if(node.kind==='path')return {...node,rings:node.rings.map(r=>r.map(point))}
 return {...node,...point(node)}
}
export interface DrawingViewport {x:number;y:number;width:number;height:number}
/** One canonical composition, deterministic physical crops; no fit or resampling. */
export function renderDrawingViewportSvg(scene:DrawingSceneV2,tokens:PublicationDrawingTokens,v:DrawingViewport):string{
 if(![v.x,v.y,v.width,v.height].every(Number.isFinite)||v.width<=0||v.height<=0||v.x<0||v.y<0||v.x+v.width>scene.widthMm||v.y+v.height>scene.heightMm)throw Error('Viewport outside canonical scene')
 const svg=renderDrawingSceneV2SvgWithTokens(scene,tokens),f=formatDrawingNumberV2
 return svg.replace(/width="[^"]+" height="[^"]+" viewBox="[^"]+"/,`width="${f(v.width)}mm" height="${f(v.height)}mm" viewBox="${f(v.x)} ${f(v.y)} ${f(v.width)} ${f(v.height)}"`)
}
