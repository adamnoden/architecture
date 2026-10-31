import {resolve} from 'node:path'
import {defineConfig} from '@vivliostyle/cli'
const root=import.meta.dirname
export default defineConfig({title:'Principal section A1 proof',language:'en-GB',size:'594mm 841mm',entryContext:root,entry:[{path:'.work/a1.html'}],workspaceDir:resolve(root,'.work/a1'),output:{path:resolve(root,'dist/plt20-a1.pdf'),format:'pdf'}})
