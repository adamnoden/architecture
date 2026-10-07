import { defineConfig } from 'vitepress'
import { assertNavigationCoverage, sidebar } from './navigation'

const computational = sidebar.find((item) => item.text === 'Computational track')
const currentProgramme = computational?.items?.find((item) => item.text === 'Current programme & review')
if (currentProgramme?.items) {
  const additions = [
    {
      text: 'P0 implementation plan',
      link: '/docs/computational/p0-implementation-plan'
    },
    {
      text: 'P0 + PAT-XW-01 executable result',
      link: '/docs/computational/p0-pat-xw-01-result'
    }
  ]

  for (const addition of additions.reverse()) {
    if (!currentProgramme.items.some((item) => item.link === addition.link)) {
      currentProgramme.items.splice(1, 0, addition)
    }
  }
}

const deliveryAndTesting = sidebar.find((item) => item.text === 'Delivery & testing')
const prototypes = deliveryAndTesting?.items?.find((item) => item.text === 'Prototypes')
if (prototypes?.items && !prototypes.items.some((item) => item.link === '/docs/prototypes/w2-wall-bay-test-protocol')) {
  prototypes.items.push({
    text: 'W2 wall-bay evidence protocol',
    link: '/docs/prototypes/w2-wall-bay-test-protocol'
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
