import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { createFreeStandingPartitionSpecimen } from '../../../compiler/reference-house/current-design/editor-specimen.js'
import { readGeorgianDesignSnapshot } from '../../../compiler/reference-house/current-design/georgian-source.js'
import { engineeringApi } from './engineering-api.js'

const root = fileURLToPath(new URL('./', import.meta.url))
export default defineConfig({
  root,
  base: './',
  publicDir: false,
  build: { rollupOptions: { input: { plans: fileURLToPath(new URL('./index.html', import.meta.url)),
    engineering: fileURLToPath(new URL('./engineering.html', import.meta.url)) } } },
  server: { host: '127.0.0.1', fs: { allow: [fileURLToPath(new URL('../../../', import.meta.url))] } },
  plugins: [{
    name: 'ade-engineering-transport',
    configureServer(server) { server.middlewares.use(engineeringApi) },
    configurePreviewServer(server) { server.middlewares.use(engineeringApi) },
  }, {
    name: 'ade-editor-documents',
    resolveId(id) { return id === 'virtual:ade-editor-documents' ? '\0' + id : undefined },
    load(id) {
      if (id !== '\0virtual:ade-editor-documents') return undefined
      const current = readGeorgianDesignSnapshot()
      return 'export default ' + JSON.stringify({ current, partitionStudy: createFreeStandingPartitionSpecimen(current) })
    },
  }],
})
