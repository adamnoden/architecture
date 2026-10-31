import {resolve} from 'node:path'
import {defineConfig} from '@vivliostyle/cli'
const root=import.meta.dirname,format=process.env.PLT04_FORMAT??'b5'
if(!['b5','a4','a2'].includes(format))throw new Error('Unknown PLT04 format')
export default defineConfig({title:`Paired floor plans ${format.toUpperCase()}`,language:'en-GB',
 size:format==='b5'?'176mm 250mm':format.toUpperCase(),entryContext:root,
 entry:[{path:`.work/${format==='a2'?'wall':'book'}.html`}],
 theme:[resolve(root,'../plt03b2/common.css'),resolve(root,`${format}.css`)],
 workspaceDir:resolve(root,'.work',format),output:{path:resolve(root,'dist',`plt04-${format}.pdf`),format:'pdf'}})
