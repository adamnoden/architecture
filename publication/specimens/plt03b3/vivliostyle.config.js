import {resolve} from 'node:path'
import {defineConfig} from '@vivliostyle/cli'
const root=import.meta.dirname,format=process.env.PLT03B3_FORMAT??'b5'
if(!['b5','a4','a2'].includes(format))throw new Error('Unknown PLT03B3 format')
export default defineConfig({title:`Ground-floor revision ${format.toUpperCase()}`,language:'en-GB',
 size:format==='b5'?'176mm 250mm':format.toUpperCase(),entryContext:root,
 entry:[{path:`.work/${format==='a2'?'wall':'book'}.html`}],
 theme:[resolve(root,'../plt03b2/common.css'),resolve(root,`${format}.css`)],
 workspaceDir:resolve(root,'.work',format),output:{path:resolve(root,'dist',`plt03b3-${format}.pdf`),format:'pdf'}})
