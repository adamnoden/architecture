import {resolve} from 'node:path'
import {defineConfig} from '@vivliostyle/cli'
const root=import.meta.dirname,format=process.env.PLT19_FORMAT??'b5'
if(!['b5','a4','a2','facing'].includes(format))throw Error('Unknown PLT19 format')
export default defineConfig({title:`Current sectional synthesis ${format}`,language:'en-GB',size:format==='b5'?'176mm 250mm':format==='a2'?'420mm 594mm':format==='facing'?'352mm 250mm':'210mm 297mm',entryContext:root,entry:[{path:`.work/${format}.html`}],workspaceDir:resolve(root,'.work',format),output:{path:resolve(root,'dist',`plt19-${format}.pdf`),format:'pdf'}})
