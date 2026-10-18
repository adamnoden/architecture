import { execSync } from 'node:child_process'
import { relative, sep } from 'node:path'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { projectIdentity } from '../project/identity.js'
import { filterPublicNavigation, publicSourceExcludeGlobs } from '../project/public-surface.js'
import { siteIndexable } from '../project/site-settings.js'
import {
  mapNavigationLinks,
  mapSidebarRoutes,
  rewriteMarkdownPageLink,
  rewriteSourceId
} from '../project/site-routes.js'
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
const buildTimestamp = new Date().toISOString()
const crawlerPolicy = siteIndexable ? 'index, follow' : 'noindex, nofollow, noarchive'
const publicNav = mapNavigationLinks(filterPublicNavigation(nav))
const publicSidebar = mapSidebarRoutes(filterPublicNavigation(sidebar))

const siteNav = publicNav.map((item) => {
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
    title: projectIdentity.name,
    description: 'Architectural design research into permanence through transformation: houses designed to remain durable, repairable and adaptable across time.',
    lang: 'en-GB',
    base: '/architecture/',
    cleanUrls: true,
    srcExclude: [...publicSourceExcludeGlobs],
    head: [
      ['link', { rel: 'icon', type: 'image/svg+xml', href: '/architecture/favicon.svg' }],
      ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/architecture/favicon-32.png' }],
      ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/architecture/apple-touch-icon.png' }],
      ['meta', { name: 'robots', content: crawlerPolicy }],
      ['meta', { name: 'googlebot', content: crawlerPolicy }]
    ],

    vite: {
      define: {
        __SITE_BUILD_COMMIT__: JSON.stringify(buildCommit),
        __SITE_BUILD_TIMESTAMP__: JSON.stringify(buildTimestamp)
      }
    },

    rewrites: rewriteSourceId,

    markdown: {
      config(md) {
        md.core.ruler.after('inline', 'public-routes', (state) => {
          const realPath = state.env.realPath ?? state.env.path
          if (!realPath) return

          const sourceFile = relative(process.cwd(), realPath).split(sep).join('/')
          for (const token of state.tokens) {
            if (!token.children) continue
            for (const child of token.children) {
              if (child.type !== 'link_open') continue
              const href = child.attrGet('href')
              if (!href) continue
              child.attrSet('href', rewriteMarkdownPageLink(href, sourceFile))
            }
          }
        })
      }
    },

    themeConfig: {
      siteTitle: projectIdentity.name,
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
        {
          text: 'PDF',
          items: [
            { text: 'Primer · compact', link: `/architecture/${projectIdentity.slug}-primer.pdf` },
            { text: 'Working Edition · complete', link: `/architecture/${projectIdentity.slug}.pdf` }
          ]
        }
      ],
      sidebar: publicSidebar
    }
  })
)
