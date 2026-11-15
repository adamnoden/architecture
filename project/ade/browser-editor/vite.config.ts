import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { createFreeStandingPartitionSpecimen } from '../../../compiler/reference-house/current-design/editor-specimen.js'
import { readGeorgianDesignSnapshot } from '../../../compiler/reference-house/current-design/georgian-source.js'

const root = fileURLToPath(new URL('./', import.meta.url))
export default defineConfig({
  root,
  base: './',
  publicDir: false,
  server: { host: '127.0.0.1', fs: { allow: [fileURLToPath(new URL('../../../', import.meta.url))] } },
  plugins: [{
    name: 'ade-editor-documents',
    resolveId(id) { return id === 'virtual:ade-editor-documents' ? '\0' + id : undefined },
    load(id) {
      if (id !== '\0virtual:ade-editor-documents') return undefined
      const current = readGeorgianDesignSnapshot()
      return 'export default ' + JSON.stringify({ current, partitionStudy: createFreeStandingPartitionSpecimen(current) })
    },
  }],
})
