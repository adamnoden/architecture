import {createHash} from 'node:crypto'
import {mkdir,readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {fetchPublicationFonts} from '../../fonts.js'
import {createLayoutSection,layoutFamilySource} from '../../../compiler/reference-house/georgian/layout-family.js'
import {renderDrawingSceneV2SvgWithTokens} from '../../../compiler/publication-drawing-v2/svg.js'
import {PLT_CANDIDATE_TOKENS as tokens} from '../../../compiler/publication-drawing-v2/plt-candidate-tokens.js'
const root=import.meta.dirname,work=resolve(root,'.work');await mkdir(work,{recursive:true})
const hash=(s:string|Buffer)=>createHash('sha256').update(s).digest('hex'),fonts=await fetchPublicationFonts(resolve(work,'fonts'))
const css=(await Promise.all([['PUBLICATION_SANS_REGULAR',400],['PUBLICATION_SANS_BOLD',700]].map(async([slot,weight])=>`@font-face{font-family:"Source Sans 3";font-style:normal;font-weight:${weight};src:url(data:font/ttf;base64,${(await readFile(fonts[slot as keyof typeof fonts])).toString('base64')}) format("truetype");}`))).join('')
const scene=createLayoutSection('PRINCIPAL',25),svg=renderDrawingSceneV2SvgWithTokens(scene,tokens).replace('</style>',css+'</style>')
await writeFile(resolve(work,'section.svg'),svg);await writeFile(resolve(work,'scene.json'),JSON.stringify(scene,null,2)+'\n')
await writeFile(resolve(work,'manifest.json'),JSON.stringify({sourceSha256:hash(JSON.stringify(layoutFamilySource)),sceneSha256:hash(JSON.stringify(scene)),svgSha256:hash(svg),page:[594,841],scale:25,physicalAcceptance:false,fitScaling:false,tokens},null,2)+'\n')
await writeFile(resolve(work,'a1.html'),`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Principal section A1 proof</title><style>${css}@page{size:594mm 841mm;margin:0}html,body{margin:0}section{position:relative;width:594mm;height:841mm;font-family:"Source Sans 3"}svg{position:absolute;left:0;top:0}header{position:absolute;left:40mm;top:25mm;font-size:11pt;font-weight:700}footer{position:absolute;left:40mm;bottom:25mm;font-size:7pt}</style></head><body><section>${svg}<header>Principal section — A1 / 1:25</header><footer>Nominal assemblies and support reservations. Engineering and physical print acceptance remain unverified.</footer></section></body></html>`)
console.log('Principal section A1 prepared at true 1:25; candidate physical tokens unchanged; no print acceptance.')
