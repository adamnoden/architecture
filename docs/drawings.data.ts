import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildDrawingGallery } from '../scripts/drawing-gallery.js'

// VitePress evaluates data loaders before copying public assets into the site.
// The same loader runs again when source files are added, changed or removed in dev.
export default {
  watch: [
    '../README.md',
    './**/*.md',
    './**/*.svg',
    '../project/**/*.md',
    '../project/**/*.svg',
    '../public/drawings/**/*.svg',
    '../public/figures/**/*.svg',
    '../compiler/**/*.ts',
    '../publication/plates-current.ts',
    '../publication/figures.ts',
    '../publication/publication.ts',
    '../publication/pr00d-reference-house-figures.md',
    '../publication/pr00d-reference-house-systems-figures.md',
    '../project/public-surface.ts',
    '../project/site-routes.ts',
    '../project/nomenclature.ts',
    '../scripts/drawing-gallery.ts'
  ],
  load() {
    const { catalogue, assets } = buildDrawingGallery()
    const output = resolve(process.cwd(), 'public/drawing-gallery')
    mkdirSync(output, { recursive: true })
    const expected = new Set<string>()
    for (const { filename, content } of assets) {
      if (!/^[a-f0-9]+\.svg$/.test(filename)) throw new Error(`Invalid gallery asset name: ${filename}`)
      expected.add(filename)
      const target = resolve(output, filename)
      if (!existsSync(target) || readFileSync(target, 'utf8') !== content) writeFileSync(target, content)
    }
    // This directory is reserved for generated gallery assets. Prune only our
    // content-addressed files; never touch authored drawings or other files.
    for (const filename of readdirSync(output)) {
      if (/^[a-f0-9]+\.svg$/.test(filename) && !expected.has(filename)) unlinkSync(resolve(output, filename))
    }
    return catalogue
  }
}
