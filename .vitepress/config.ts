import { execSync } from 'node:child_process'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { assertNavigationCoverage, nav, sidebar } from './navigation'

assertNavigationCoverage()

function resolveBuildCommit(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA

  try {
    return execSync('git rev-parse HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()
  } catch {
    return 'unknown'
  }
}

const buildCommit = resolveBuildCommit()

const siteNav = nav.map((item) => {
  if (item.text !== 'Project' || !('items' in item) || !item.items) return item

  return {
    ...item,
    items: [
      ...item.items,
      { text: 'Source repository', link: 'https://github.com/adamnoden/architecture' }
    ]
  }
})

// Mermaid stays authored as fenced Markdown; the wrapper only supplies VitePress rendering.
export default withMermaid(
  defineConfig({
    title: 'House Systems Architecture',
    description: 'Architectural systems research for houses designed to be maintained, repaired, renewed and adapted across time.',
    lang: 'en-GB',
    base: '/architecture/',
    cleanUrls: true,
    head: [
      ['link', { rel: 'icon', type: 'image/svg+xml', href: '/architecture/favicon.svg' }],
      ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/architecture/favicon-32.png' }],
      ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/architecture/apple-touch-icon.png' }],
      ['meta', { name: 'hsa-build-commit', content: buildCommit }]
    ],

    vite: {
      define: {
        __HSA_BUILD_COMMIT__: JSON.stringify(buildCommit)
      }
    },

    rewrites(id) {
      if (id === 'README.md') return 'index.md'
      return id.replace(/\/README\.md$/, '/index.md')
    },

    themeConfig: {
      siteTitle: 'House Systems Architecture',
      search: {
        provider: 'local'
      },
      outline: {
        level: [2, 3],
        label: 'On this page'
      },
      sidebarMenuLabel: 'Contents',
      nav: [
        ...siteNav,
        { text: 'Download PDF', link: '/architecture/house-systems-architecture.pdf' }
      ],
      sidebar
    }
  })
)
