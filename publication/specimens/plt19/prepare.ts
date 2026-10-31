import {createHash} from 'node:crypto'
import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {fetchPublicationFonts} from '../../fonts.js'
import {createCurrentSynthesisScene,synthesisSource} from '../../../compiler/reference-house/georgian/sectional-synthesis.js'
import {renderDrawingSceneV2SvgWithTokens} from '../../../compiler/publication-drawing-v2/svg.js'
import {renderDrawingViewportSvg} from '../../../compiler/publication-drawing-v2/composition.js'
import {PLT_CANDIDATE_TOKENS as tokens} from '../../../compiler/publication-drawing-v2/plt-candidate-tokens.js'
const root=import.meta.dirname,work=resolve(root,'.work');await mkdir(work,{recursive:true})
const hash=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex'),fonts=await fetchPublicationFonts(resolve(work,'fonts'))
const css=(await Promise.all([['PUBLICATION_SANS_REGULAR',400],['PUBLICATION_SANS_BOLD',700]].map(async([slot,weight])=>`@font-face{font-family:"Source Sans 3";font-style:normal;font-weight:${weight};src:url(data:font/ttf;base64,${(await readFile(fonts[slot as keyof typeof fonts])).toString('base64')}) format("truetype");}`))).join('')
const m={source:synthesisSource,sourceSha256:hash(JSON.stringify(synthesisSource)),physicalAcceptance:false,fitScaling:false,scale:'NTS',criticalFoldBandMm:12,files:{} as Record<string,{scene:string;svg:string}>,profiles:{b5:[176,250,3],a4:[210,297,3],a2:[420,594,1],facing:[352,250,1]}}
for(const format of ['b5','a4','a2','facing'] as const){
 const [w,h]=m.profiles[format],book=format==='b5'||format==='a4',scene=createCurrentSynthesisScene(format==='a2'?'WALL':'BOOK',format==='a4'?'a4':'b5'),pages:string[]=[]
 await writeFile(resolve(work,`${format}-scene.json`),JSON.stringify(scene,null,2)+'\n')
 for(let i=0;i<(book?2:1);i++){
  let svg=(book?renderDrawingViewportSvg(scene,tokens,{x:i*w,y:0,width:w,height:h}):renderDrawingSceneV2SvgWithTokens(scene,tokens)).replace('</style>',css+'</style>')
  const name=`${format}-${i}`,id='synthesis-'+name;svg=svg.replace('aria-labelledby="title desc"',`aria-labelledby="${id}-title ${id}-desc"`).replace('id="title"',`id="${id}-title"`).replace('id="desc"',`id="${id}-desc"`)
  await writeFile(resolve(work,name+'.svg'),svg);m.files[name]={scene:hash(JSON.stringify(scene)),svg:hash(svg)};pages.push(`<section>${svg}</section>`)
 }
 const intro=book?`<section><div class="intro"><h1>Sectional synthesis</h1><p>Current-house cutaway review</p><p>The next two pages form one spread. Print at actual size with this lead-in retained so the left half starts on a verso.</p><p>The south courtyard edge is the cut; the north portion remains. Aperture voids, the nominal floor zone and stair opening, and the twin roof derive from the current source.</p><p>Internal partitions, joinery, floor layers, support details and service products are omitted. No new architectural or engineering claim depends on this view.</p><p>The projection is NTS. Physical print acceptance, final house-design handoff and publication integration remain open.</p></div></section>`:''
 await writeFile(resolve(work,format+'.html'),`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Current sectional synthesis</title><style>${css}@page{size:${w}mm ${h}mm;margin:0}*{box-sizing:border-box}html,body{margin:0}section{position:relative;width:${w}mm;height:${h}mm;break-after:page;overflow:hidden;font-family:"Source Sans 3"}section:last-child{break-after:auto}svg{display:block;position:absolute;left:0;top:0}.intro{position:absolute;left:24mm;right:24mm;top:30mm;font-size:9pt;line-height:1.4}.intro h1{font-size:18pt;line-height:1.1}.intro p{margin:0 0 6mm}</style></head><body>${intro}${pages.join('')}</body></html>`)
}
await writeFile(resolve(work,'manifest.json'),JSON.stringify(m,null,2)+'\n')
console.log('Current synthesis prepared: B5/A4 lead-in and two physical crops, full B5 facing review and A2 wall. Eight pages; NTS; physical acceptance pending.')
