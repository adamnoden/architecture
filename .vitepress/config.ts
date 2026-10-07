import { defineConfig } from 'vitepress'
import { assertNavigationCoverage, sidebar } from './navigation'

const computational = sidebar.find((item) => item.text === 'Computational track')
const currentProgramme = computational?.items?.find((item) => item.text === 'Current programme & review')
if (currentProgramme?.items && !currentProgramme.items.some((item) => item.link === '/docs/computational/p0-implementation-plan')) {
  currentProgramme.items.splice(1, 0, {
    text: 'P0 implementation plan',
    link: '/docs/computational/p0-implementation-plan'
  })
}

assertNavigationCoverage()

export default defineConfig({
  title: 'House Systems Architecture',
  description: 'Architectural systems research for houses designed to be maintained, repaired, renewed and adapted across time.',
  lang: 'en-GB',
  base: '/architecture/',
  cleanUrls: true,

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
      { text: 'Start reading', link: '/docs/reading-guide' }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/adamnoden/architecture' }
    ],
    sidebar
  }
})
