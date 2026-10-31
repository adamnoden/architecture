import {resolve} from 'node:path'
import {defineConfig} from '@vivliostyle/cli'
const root=import.meta.dirname,format=process.env.PLT17_FORMAT??'b5'
if(!['b5','a4','spreads'].includes(format))throw Error('Unknown PLT17 format')
export default defineConfig({title:`Architectural book proof ${format}`,language:'en-GB',size:format==='b5'?'176mm 250mm':format==='spreads'?'352mm 250mm':'210mm 297mm',entryContext:root,entry:[{path:`.work/${format}.html`}],workspaceDir:resolve(root,'.work',format),output:{path:resolve(root,'dist',`plt17-${format}.pdf`),format:'pdf'}})
