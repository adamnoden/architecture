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

const grammarStudy = computational?.items?.find((item) => item.text === 'Architectural grammar study')
if (grammarStudy?.items && !grammarStudy.items.some((item) => item.link === '/docs/computational/g01-grammar-charter')) {
  const researchBriefIndex = grammarStudy.items.findIndex((item) => item.link === '/docs/computational/g01-research-brief')
  const insertionIndex = researchBriefIndex >= 0 ? researchBriefIndex : 1
  grammarStudy.items.splice(insertionIndex, 0, {
    text: 'G-01 grammar charter',
    link: '/docs/computational/g01-grammar-charter'
  })
}

const deliveryAndTesting = sidebar.find((item) => item.text === 'Delivery & testing')
const prototypes = deliveryAndTesting?.items?.find((item) => item.text === 'Prototypes')
if (prototypes?.items && !prototypes.items.some((item) => item.link === '/docs/prototypes/w2-wall-bay-test-protocol')) {
  prototypes.items.push({
    text: 'W2 wall-bay evidence protocol',
    link: '/docs/prototypes/w2-wall-bay-test-protocol'
  })
}

const development = deliveryAndTesting?.items?.find((item) => item.text === 'Development')
if (development?.items) {
  const specificityPages = [
    {
      text: 'Architectural specificity boundary',
      link: '/docs/development/architectural-specificity-boundary'
    },
    {
      text: 'Architectural specificity audit',
      link: '/docs/development/architectural-specificity-audit'
    },
    {
      text: 'Architectural specificity claim ledger',
      link: '/docs/development/architectural-specificity-ledger'
    },
    {
      text: 'Architectural specificity adversarial test',
      link: '/docs/development/architectural-specificity-adversarial-test'
    }
  ]

  const insertionIndex = Math.min(1, development.items.length)
  for (const addition of specificityPages.reverse()) {
    if (!development.items.some((item) => item.link === addition.link)) {
      development.items.splice(insertionIndex, 0, addition)
    }
  }
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
