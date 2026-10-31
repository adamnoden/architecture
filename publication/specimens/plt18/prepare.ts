import {createHash} from 'node:crypto'
import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {fetchPublicationFonts} from '../../fonts.js'
import {createCurrentSettingScene,settingSource,type SettingView} from '../../../compiler/reference-house/georgian/setting-family.js'
import {renderDrawingSceneV2SvgWithTokens} from '../../../compiler/publication-drawing-v2/svg.js'
import {PLT_CANDIDATE_TOKENS as tokens} from '../../../compiler/publication-drawing-v2/plt-candidate-tokens.js'
const root=import.meta.dirname,work=resolve(root,'.work');await mkdir(work,{recursive:true})
const hash=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex')
const fonts=await fetchPublicationFonts(resolve(work,'fonts'))
const css=(await Promise.all([['PUBLICATION_SANS_REGULAR',400],['PUBLICATION_SANS_BOLD',700]].map(async([slot,weight])=>`@font-face{font-family:"Source Sans 3";font-style:normal;font-weight:${weight};src:url(data:font/ttf;base64,${(await readFile(fonts[slot as keyof typeof fonts])).toString('base64')}) format("truetype");}`))).join('')
const manifest={source:settingSource,sourceSha256:hash(JSON.stringify(settingSource)),physicalAcceptance:false,fitScaling:false,files:{} as Record<string,{scene:string;svg:string}>,profiles:{b5:[176,250,2,200],a4:[210,297,2,200],a2:[420,594,2,100]}}
for(const format of ['b5','a4','a2'] as const){
 const [w,h,,scale]=manifest.profiles[format],pages:string[]=[]
 for(const view of ['SETTING','EXTERNAL-OBLIGATIONS'] as SettingView[]){
  const scene=createCurrentSettingScene(view,scale as 200|100),svg=renderDrawingSceneV2SvgWithTokens(scene,tokens).replace('</style>',css+'</style>'),name=`${format}-${view.toLowerCase()}`
  await writeFile(resolve(work,name+'.svg'),svg);await writeFile(resolve(work,name+'.json'),JSON.stringify(scene,null,2)+'\n')
  manifest.files[name]={scene:hash(JSON.stringify(scene)),svg:hash(svg)}
  pages.push(`<section><header>${scene.title} — 1:${scale}</header>${svg}<footer>Theoretical setting only. Physical print acceptance pending.</footer></section>`)
 }
 await writeFile(resolve(work,format+'.html'),`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Current house setting</title><style>${css}@page{size:${w}mm ${h}mm;margin:0}*{box-sizing:border-box}html,body{margin:0}section{position:relative;width:${w}mm;height:${h}mm;break-after:page;font-family:"Source Sans 3"}section:last-child{break-after:auto}header{position:absolute;left:15mm;top:15mm;font-size:9pt;font-weight:700}svg{position:absolute;left:${(w-(format==='a2'?420:145))/2}mm;top:${format==='a2'?0:30}mm}footer{position:absolute;left:15mm;bottom:12mm;font-size:6pt}</style></head><body>${pages.join('')}</body></html>`)
}
await writeFile(resolve(work,'manifest.json'),JSON.stringify(manifest,null,2)+'\n')
console.log('Current-house setting prepared: two pages each at B5/A4 1:200 and A2 1:100; no real-site or access acceptance.')
