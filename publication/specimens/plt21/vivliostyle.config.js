import {resolve} from 'node:path'
import {defineConfig} from '@vivliostyle/cli'
const root=import.meta.dirname,format=process.env.PLT21_FORMAT??'a2'
if(!['b5','a4','a2'].includes(format))throw Error('Unknown exterior-isometric format')
export default defineConfig({title:`Exterior isometrics ${format}`,language:'en-GB',size:format==='b5'?'176mm 250mm':format==='a4'?'210mm 297mm':'420mm 594mm',entryContext:root,entry:[{path:`.work/${format}.html`}],workspaceDir:resolve(root,'.work',format),output:{path:resolve(root,'dist',`plt21-${format}.pdf`),format:'pdf'}})
