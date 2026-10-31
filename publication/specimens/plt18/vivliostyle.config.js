import {resolve} from 'node:path'
import {defineConfig} from '@vivliostyle/cli'
const root=import.meta.dirname,format=process.env.PLT18_FORMAT??'b5'
if(!['b5','a4','a2'].includes(format))throw Error('Unknown PLT18 format')
export default defineConfig({title:`Current house setting ${format}`,language:'en-GB',size:format==='b5'?'176mm 250mm':format==='a2'?'420mm 594mm':'210mm 297mm',entryContext:root,entry:[{path:`.work/${format}.html`}],workspaceDir:resolve(root,'.work',format),output:{path:resolve(root,'dist',`plt18-${format}.pdf`),format:'pdf'}})
